import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "./env";

const COOKIE = "nb_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  return env("SESSION_SECRET") ?? "dev-only-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function makeToken(userId: number, ttlSeconds = MAX_AGE) {
  const payload = Buffer.from(JSON.stringify({ u: userId, e: Math.floor(Date.now() / 1000) + ttlSeconds })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readToken(token: string | undefined | null): number | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { u, e } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof u !== "number" || e < Date.now() / 1000) return null;
    return u;
  } catch {
    return null;
  }
}

export async function setSession(userId: number) {
  (await cookies()).set(COOKIE, makeToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function currentUserId(): Promise<number | null> {
  return readToken((await cookies()).get(COOKIE)?.value);
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
