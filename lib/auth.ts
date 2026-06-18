import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

const SESSION_COOKIE = "nasunko_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  await query(
    `
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '30 days')
  `,
    [tokenHash, userId],
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const { rows } = await query<AuthUser>(
    `
    SELECT u.id, u.email, u.nickname
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = $1 AND s.expires_at > NOW()
    LIMIT 1
  `,
    [hashToken(token)],
  );

  return rows[0] ?? null;
}
