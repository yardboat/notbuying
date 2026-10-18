import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

// Public share ids for a weekly issue. Signs `${userId}:${weekStart}` with SESSION_SECRET
// (same pattern as session.ts) under its own purpose prefix, so a share id can never be
// replayed as a session token. No expiry: an issue is a printed thing.

function secret() {
  const v = env("SESSION_SECRET");
  if (v && v.length >= 32) return v;
  if (process.env.VERCEL || process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET missing or too short.");
  return "dev-only-secret-local-machine-only-000";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(`share:${payload}`).digest("base64url").slice(0, 22);
}

export function makeShareId(userId: number, weekStart: string) {
  const payload = Buffer.from(`${userId}:${weekStart}`).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readShareId(id: string | undefined | null): { userId: number; weekStart: string } | null {
  if (!id) return null;
  const [payload, sig] = decodeURIComponent(id).split(".");
  if (!payload || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const m = /^(\d+):(\d{4}-\d{2}-\d{2})$/.exec(Buffer.from(payload, "base64url").toString());
  if (!m) return null;
  return { userId: Number(m[1]), weekStart: m[2] };
}
