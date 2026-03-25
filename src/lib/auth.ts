import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SESSION_HOURS = 24;

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function createAdminSession(): string {
  const db = getDb();
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString();

  db.prepare("INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)").run(token, expiresAt);

  return token;
}

export function verifyAdminToken(token: string): boolean {
  if (!token) return false;
  const db = getDb();
  const session = db.prepare("SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')").get(token) as { token: string } | undefined;
  return !!session;
}

export function deleteAdminSession(token: string): void {
  const db = getDb();
  db.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
}

// Cleanup expired sessions periodically
export function cleanupExpiredSessions(): void {
  const db = getDb();
  db.prepare("DELETE FROM admin_sessions WHERE expires_at <= datetime('now')").run();
}
