import { useEffect, useRef, useState } from "react";
import { loginAccount, registerAccount } from "../auth";

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
        const result = registering ? registerAccount(get("fullName"), get("email"), get("password")) : loginAccount(get("identifier"), get("password"));
        if (result.ok) onSuccess(); else window.alert(result.message);
      }, { once: true });
      doc.querySelectorAll("a").forEach(link => link.addEventListener("click", event => { if (link.textContent?.toLowerCase().includes(registering ? "đăng nhập" : "đăng ký")) { event.preventDefault(); setRegistering(!registering); } }));
    };
    iframe?.addEventListener("load", wire);
    return () => iframe?.removeEventListener("load", wire);
  }, [registering, onSuccess]);
  return <div className="fixed inset-0 z-[200] overflow-hidden bg-[#1e1e1e]"><iframe ref={frame} title={registering ? "Đăng ký PhiQuiz" : "Đăng nhập PhiQuiz"} srcDoc={markup} className="h-[111.12%] w-[111.12%] origin-top-left scale-90 border-0" /></div>;
}
