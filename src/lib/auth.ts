const KEY = "nxt-rank:admin-auth";
export const ADMIN_USER = "Pruthwiraj@nxt";
export const ADMIN_PASS = "nxtrank2026";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(KEY) === "1";
}
export function login(u: string, p: string): boolean {
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    window.sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}
export function logout() {
  window.sessionStorage.removeItem(KEY);
}
