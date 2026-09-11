import { useEffect, useRef, useState } from "react";
import { setCurrentAccount } from "../auth";

export function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
  const [registering, setRegistering] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const [markup, setMarkup] = useState("");
  useEffect(() => {
    fetch(registering ? "/auth/register" : "/auth/login").then(response => response.text()).then(setMarkup).catch(() => setMarkup("<p>Không thể tải giao diện xác thực.</p>"));
  }, [registering]);
  useEffect(() => {
    const iframe = frame.current;
    const wire = () => {
      const doc = iframe?.contentDocument;
      if (!doc) return;
      const form = doc.querySelector("form");
      form?.addEventListener("submit", event => {
        event.preventDefault();
        const get = (id: string) => (doc.getElementById(id) as HTMLInputElement | null)?.value || "";
        const submit = async () => {
          const response = await fetch(registering ? "/api/auth/register" : "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(registering ? { name: get("fullName"), email: get("email"), password: get("password") } : { email: get("identifier"), password: get("password") }) });
          const result = await response.json() as { user?: { id: string; name: string; email: string }; error?: string };
          if (!response.ok || !result.user) throw new Error(result.error || "Không thể xác thực.");
          setCurrentAccount(result.user); onSuccess();
        };
        void submit().catch(error => window.alert(error instanceof Error ? error.message : "Không thể xác thực."));
      }, { once: true });
      doc.querySelectorAll("a").forEach(link => link.addEventListener("click", event => { if (link.textContent?.toLowerCase().includes(registering ? "đăng nhập" : "đăng ký")) { event.preventDefault(); setRegistering(!registering); } }));
    };
    iframe?.addEventListener("load", wire);
    return () => iframe?.removeEventListener("load", wire);
  }, [registering, onSuccess]);
  return <div className="fixed inset-0 z-[200] overflow-hidden bg-[#1e1e1e]"><iframe ref={frame} title={registering ? "Đăng ký PhiQuiz" : "Đăng nhập PhiQuiz"} srcDoc={markup} className="h-[111.12%] w-[111.12%] origin-top-left scale-90 border-0" /></div>;
}
