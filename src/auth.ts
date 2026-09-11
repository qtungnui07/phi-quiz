export type LocalAccount = {
  id: string;
  name: string;
  identifier: string;
  password: string;
  createdAt: string;
};

const ACCOUNTS_KEY = "phiquiz:local-accounts:v1";
const SESSION_KEY = "phiquiz:local-session:v1";

const readAccounts = (): LocalAccount[] => {
  try {
    const value = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
};

export function getCurrentAccount(): LocalAccount | null {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    return id ? readAccounts().find(account => account.id === id) ?? null : null;
  } catch { return null; }
}

export function setCurrentAccount(account: { id: string; name: string; email: string }) {
  const local: LocalAccount = { id: account.id, name: account.name, identifier: account.email, password: "", createdAt: new Date().toISOString() };
  try {
    const accounts = readAccounts().filter(item => item.id !== local.id && item.identifier !== local.identifier);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, local]));
    localStorage.setItem(SESSION_KEY, local.id);
  } catch { /* server session remains authoritative */ }
  return local;
}

export function registerAccount(name: string, identifier: string, password: string): { ok: boolean; message?: string; account?: LocalAccount } {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanName = name.trim();
  if (!cleanName || !cleanIdentifier || password.length < 4) return { ok: false, message: "Vui lòng nhập đủ thông tin (mật khẩu tối thiểu 4 ký tự)." };
  const accounts = readAccounts();
  if (accounts.some(account => account.identifier === cleanIdentifier)) return { ok: false, message: "Tài khoản này đã tồn tại." };
  const account: LocalAccount = { id: `user-${Date.now().toString(36)}`, name: cleanName, identifier: cleanIdentifier, password, createdAt: new Date().toISOString() };
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account])); localStorage.setItem(SESSION_KEY, account.id); } catch { return { ok: false, message: "Không thể lưu tài khoản trên thiết bị này." }; }
  return { ok: true, account };
}

export function loginAccount(identifier: string, password: string): { ok: boolean; message?: string; account?: LocalAccount } {
  const account = readAccounts().find(item => item.identifier === identifier.trim().toLowerCase() && item.password === password);
  if (!account) return { ok: false, message: "Email/MSSV hoặc mật khẩu không đúng." };
  try { localStorage.setItem(SESSION_KEY, account.id); } catch { /* session still works */ }
  return { ok: true, account };
}

export function logoutAccount() { try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } }
