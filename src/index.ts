import { serve, type BunPlugin } from "bun";
import { statSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes, createHmac } from "node:crypto";

const cssSourcePath = join(import.meta.dir, "index.css");
const authFile = join(import.meta.dir, "../data/users.json");
type Account = { id: string; name: string; email: string; passwordHash?: string; googleId?: string; avatarUrl: string | null };
async function accounts(): Promise<Account[]> { try { return JSON.parse(await readFile(authFile, "utf8")); } catch { return []; } }
async function saveAccounts(value: Account[]) { await mkdir(join(import.meta.dir, "../data"), { recursive: true }); await writeFile(authFile, JSON.stringify(value, null, 2)); }
const cookie = (id: string) => `${id}.${createHmac("sha256", process.env.AUTH_SECRET || "dev-secret").update(id).digest("hex")}`;
const currentUser = async (req: Request) => { const raw = req.headers.get("cookie")?.match(/phiquiz_session=([^;]+)/)?.[1]; if (!raw) return null; const [id, sig] = raw.split("."); if (!id || sig !== cookie(id).split(".")[1]) return null; return (await accounts()).find(user => user.id === id) || null; };
const publicUser = (user: Account) => ({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl });

let cachedCss: { body: string; sourceMtime: number } | null = null;

async function getCompiledCss(): Promise<string> {
  let sourceMtime = 0;
  try {
    sourceMtime = statSync(cssSourcePath).mtimeMs;
  } catch {
    // Missing/CSS source unavailable - fall back to an empty stylesheet.
  }

  if (cachedCss && cachedCss.sourceMtime === sourceMtime) {
    return cachedCss.body;
  }

  const plugin = (await import("bun-plugin-tailwind")).default as BunPlugin;
  const outdir = mkdtempSync(join(tmpdir(), "phiquiz-css-"));
  const result = await Bun.build({
    entrypoints: [cssSourcePath],
    outdir,
    plugins: [plugin],
    minify: true,
  });

  const output = result.outputs[0];
  if (!output) {
    return "";
  }

  const body = new TextDecoder().decode(await output.arrayBuffer());
  cachedCss = { body, sourceMtime };
  rmSync(outdir, { recursive: true, force: true });
  return body;
}

function checkAdminAccess(req: Request, srv: any): { allowed: boolean; ip: string; network: string; message: string } {
  // Check headers commonly provided by proxies / Cloudflare Tunnels
  const cfIp = req.headers.get("cf-connecting-ip");
  const xRealIp = req.headers.get("x-real-ip");
  const xForwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const directIp = srv.requestIP?.(req)?.address || "127.0.0.1";

  const clientIp = cfIp || xRealIp || xForwardedFor || directIp;
  const host = (req.headers.get("host") || "").toLowerCase();
  const normalizedIp = clientIp.replace(/^::ffff:/, "").trim();

  // If request has public tunnel headers (Cloudflare, etc.), client is coming from the internet
  if (cfIp) {
    return {
      allowed: false,
      ip: cfIp,
      network: "public-tunnel",
      message: `Từ chối: Truy cập qua Public Tunnel (${cfIp}) bị cấm vào trang quản trị.`,
    };
  }

  // 1. Check if accessing from Tailscale IPv4 CGNAT (100.64.0.0/10 -> 100.64.0.0 to 100.127.255.255)
  const parts = normalizedIp.split(".").map(Number);
  if (parts.length === 4 && parts[0] === 100 && parts[1] !== undefined && parts[1] >= 64 && parts[1] <= 127) {
    return {
      allowed: true,
      ip: normalizedIp,
      network: "tailscale-ipv4",
      message: `Đã xác thực kết nối qua mạng an toàn Tailscale IPv4 (${normalizedIp})`,
    };
  }

  // 2. Check Tailscale IPv6 (fd7a:115c:a1e0::/48)
  if (normalizedIp.toLowerCase().startsWith("fd7a:115c:a1e0")) {
    return {
      allowed: true,
      ip: normalizedIp,
      network: "tailscale-ipv6",
      message: `Đã xác thực kết nối qua Tailscale IPv6 (${normalizedIp})`,
    };
  }

  // 3. Tailscale MagicDNS host domain (*.ts.net)
  if (host.endsWith(".ts.net") || host.includes(".ts.net:")) {
    return {
      allowed: true,
      ip: normalizedIp,
      network: "tailscale-domain",
      message: "Đã xác thực tên miền Tailscale MagicDNS",
    };
  }

  // 4. Localhost / Loopback (only when IP is strictly 127.0.0.1 or ::1)
  if (normalizedIp === "127.0.0.1" || normalizedIp === "::1" || normalizedIp === "localhost") {
    return {
      allowed: true,
      ip: normalizedIp,
      network: "localhost",
      message: "Truy cập cục bộ (Localhost Development)",
    };
  }

  // 5. Any public or external IP
  return {
    allowed: false,
    ip: normalizedIp,
    network: "public-internet",
    message: `Từ chối: IP ${normalizedIp} không thuộc dải mạng Tailscale (100.64.0.0/10).`,
  };
}

const server = serve({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  hostname: process.env.HOST || "0.0.0.0",
  routes: {
    "/index.css": async req => {
      const css = await getCompiledCss();
      return new Response(css, {
        headers: {
          "Content-Type": "text/css; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    },

    "/api/admin/status": {
      async GET(req) {
        const status = checkAdminAccess(req, server);
        return Response.json(status);
      },
    },
    "/api/auth/me": { async GET(req) { const user = await currentUser(req); return Response.json({ user: user ? publicUser(user) : null }); } },
    "/api/auth/register": { async POST(req) { const body = await req.json() as { name?: string; email?: string; password?: string }; const email = body.email?.trim().toLowerCase(); if (!email || !body.password || !body.name) return Response.json({ error: "Vui lòng nhập đủ thông tin." }, { status: 400 }); const list = await accounts(); if (list.some(item => item.email === email)) return Response.json({ error: "Email đã được sử dụng." }, { status: 409 }); const user: Account = { id: randomBytes(16).toString("hex"), name: body.name.trim(), email, passwordHash: await Bun.password.hash(body.password), avatarUrl: null }; list.push(user); await saveAccounts(list); return new Response(JSON.stringify({ user: publicUser(user) }), { headers: { "Content-Type": "application/json", "Set-Cookie": `phiquiz_session=${cookie(user.id)}; HttpOnly; SameSite=Lax; Path=/` } }); } },
    "/api/auth/login": { async POST(req) { const body = await req.json() as { email?: string; password?: string }; const user = (await accounts()).find(item => item.email === body.email?.trim().toLowerCase()); if (!user?.passwordHash || !body.password || !(await Bun.password.verify(body.password, user.passwordHash))) return Response.json({ error: "Email hoặc mật khẩu không đúng." }, { status: 401 }); return new Response(JSON.stringify({ user: publicUser(user) }), { headers: { "Content-Type": "application/json", "Set-Cookie": `phiquiz_session=${cookie(user.id)}; HttpOnly; SameSite=Lax; Path=/` } }); } },
    "/api/auth/google": { GET() { const url = new URL("https://accounts.google.com/o/oauth2/v2/auth"); url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || ""); url.searchParams.set("redirect_uri", `${process.env.APP_URL || "http://localhost:3000"}/api/auth/google/callback`); url.searchParams.set("response_type", "code"); url.searchParams.set("scope", "openid email profile"); return Response.redirect(url); } },
    "/api/auth/google/callback": { async GET(req) { const code = new URL(req.url).searchParams.get("code"); if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return new Response("Google OAuth chưa được cấu hình.", { status: 503 }); const token = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: `${process.env.APP_URL || "http://localhost:3000"}/api/auth/google/callback`, grant_type: "authorization_code" }) }).then(r => r.json()) as { access_token?: string }; if (!token.access_token) return new Response("Không thể xác minh Google OAuth.", { status: 401 }); const profile = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } }).then(r => r.json()) as { id: string; email: string; name: string; picture?: string }; const list = await accounts(); let user = list.find(item => item.googleId === profile.id || item.email === profile.email); if (!user) { user = { id: randomBytes(16).toString("hex"), name: profile.name, email: profile.email, googleId: profile.id, avatarUrl: profile.picture || null }; list.push(user); await saveAccounts(list); } return new Response(null, { status: 302, headers: { Location: "/", "Set-Cookie": `phiquiz_session=${cookie(user.id)}; HttpOnly; SameSite=Lax; Path=/` } }); } },

    // Auth screens are kept as full static HTML documents and embedded
    // by AuthScreen. Serve them before the SPA fallback below.
    "/auth/:screen": req => {
      const screen = req.params.screen;
      const file = screen === "login" ? "login.html" : screen === "register" ? "register.html" : null;
      if (!file) return new Response("Not found", { status: 404 });
      return new Response(Bun.file(join(import.meta.dir, "auth", file)), {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    },

    // Serve index.html for all unmatched routes.
    "/*": req => {
      const pathname = new URL(req.url).pathname;
      if (/^\/chunk-[\w-]+\.js$/.test(pathname)) {
        return new Response(Bun.file(join(import.meta.dir, "../dist", pathname.slice(1))), {
          headers: { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" },
        });
      }
      return new Response(Bun.file(join(import.meta.dir, "../dist/index.html")), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
