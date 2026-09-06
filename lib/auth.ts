import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { db } from "./db";

export const ADMIN_COOKIE = "forum_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12시간

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "digital-chat-2026";
}

export function createAdminSession(): string {
  const token = nanoid(32);
  db.prepare(`INSERT INTO admin_sessions (token, created_at) VALUES (?, ?)`).run(token, Date.now());
  return token;
}

export function destroySession(token: string) {
  db.prepare(`DELETE FROM admin_sessions WHERE token = ?`).run(token);
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const row = db.prepare(`SELECT created_at FROM admin_sessions WHERE token = ?`).get(token) as
    | { created_at: number }
    | undefined;
  if (!row) return false;
  if (Date.now() - row.created_at > SESSION_TTL_MS) {
    destroySession(token);
    return false;
  }
  return true;
}

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return isValidSession(token);
}
