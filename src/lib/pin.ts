import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Non-SMS sign-in: phone + a 4-8 digit PIN, hashed with scrypt.
export const validPin = (pin: unknown) => typeof pin === "string" && /^\d{4,8}$/.test(pin);

export function hashPin(pin: string) {
  const salt = randomBytes(16);
  const key = scryptSync(pin, salt, 32);
  return `s1$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export function checkPin(pin: string, stored: string | null | undefined) {
  if (!stored) return false;
  const [v, s, k] = stored.split("$");
  if (v !== "s1" || !s || !k) return false;
  const key = scryptSync(pin, Buffer.from(s, "base64url"), 32);
  const want = Buffer.from(k, "base64url");
  return want.length === key.length && timingSafeEqual(want, key);
}
