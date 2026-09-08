import { serve, type BunPlugin } from "bun";
import { statSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import index from "./index.html";

const cssSourcePath = join(import.meta.dir, "index.css");

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
    "/*": index,

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
