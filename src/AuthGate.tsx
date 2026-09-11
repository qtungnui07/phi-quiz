import { useEffect, useState, type FormEvent, type ReactNode } from "react";

type User = { id: string; name: string; email: string; avatarUrl: string | null };

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...init });
  const data = await response.json() as { error?: string; user?: User };
  if (!response.ok) throw new Error(data.error || "Đã có lỗi xảy ra.");
  return data;
}

export function AuthGate({ children }: { children: (user: User) => ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api("/api/auth/me").then(data => setUser(data.user ?? null)).catch(() => setUser(null)); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const data = await api(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST", body: JSON.stringify({ name, email, password }),
      });
      setUser(data.user!);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể đăng nhập."); }
    finally { setBusy(false); }
  };

  if (user === undefined) return <main className="grid min-h-screen place-items-center font-sans font-extrabold">Đang tải PhiQuiz…</main>;
  if (user) return <>{children(user)}</>;
  return <main className="grid min-h-screen place-items-center p-5"><section className="w-full max-w-md rounded-[28px] border-[2.5px] border-ink bg-surface p-7 shadow-hard-lg">
    <div className="mb-6"><p className="text-sm font-extrabold text-cyan-deep">PHIQUIZ</p><h1 className="mt-1 text-3xl font-extrabold">{mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản"}</h1></div>
    <a href="/api/auth/google" className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border-[2.5px] border-ink bg-surface2 px-4 py-3 text-sm font-extrabold shadow-hard-sm hover:bg-yellow">Tiếp tục với Google</a>
    <div className="my-5 border-t-2 border-surface3" />
    <form className="space-y-3" onSubmit={submit}>
      {mode === "register" && <input required value={name} onChange={e => setName(e.target.value)} placeholder="Họ và tên" className="w-full rounded-xl border-2 border-ink p-3 font-bold outline-none" />}
      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border-2 border-ink p-3 font-bold outline-none" />
      <input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu (ít nhất 8 ký tự)" className="w-full rounded-xl border-2 border-ink p-3 font-bold outline-none" />
      {error && <p className="rounded-xl bg-orange/20 p-3 text-sm font-bold text-red-800">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl border-[2.5px] border-ink bg-yellow px-4 py-3 font-extrabold shadow-hard disabled:opacity-60">{busy ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Đăng ký"}</button>
    </form>
    <button className="mt-5 w-full text-sm font-bold underline" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}</button>
  </section></main>;
}
