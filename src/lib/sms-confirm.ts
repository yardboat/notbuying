import "server-only";
import { createHash, randomInt } from "node:crypto";
import { db } from "./db";
import { sendSms } from "./sms";

// Confirms a number before any recurring texts start (double opt-in). Only called after the person ticked the SMS box.
export async function startSmsConfirm(phone: string): Promise<{ ok: boolean; error?: string }> {
  const q = await db();
  const [recent] = await q<{ sent_at: string | null }>("SELECT sent_at FROM auth_codes WHERE phone = $1", [phone]);
  if (recent?.sent_at && Date.now() - new Date(recent.sent_at).getTime() < 60_000) return { ok: false, error: "Code just sent. Give it a minute." };
  const code = String(randomInt(100000, 999999));
  await q(
    `INSERT INTO auth_codes (phone, code_hash, expires_at, attempts, sent_at) VALUES ($1, $2, now() + interval '10 minutes', 0, now())
     ON CONFLICT (phone) DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, sent_at = now(),
       attempts = CASE WHEN auth_codes.expires_at < now() THEN 0 ELSE auth_codes.attempts END`,
    [phone, createHash("sha256").update(code).digest("hex")],
  );
  return sendSms(phone, `Not Buying: your code is ${code}. Enter it to turn on texts. Msg & data rates may apply. Reply STOP to opt out.`);
}

export async function checkSmsConfirm(phone: string, code: string): Promise<"ok" | "expired" | "wrong"> {
  const q = await db();
  const [row] = await q<{ code_hash: string; expires_at: string; attempts: number }>("SELECT * FROM auth_codes WHERE phone = $1", [phone]);
  if (!row || new Date(row.expires_at) < new Date() || Number(row.attempts) >= 5) return "expired";
  if (createHash("sha256").update(code.trim()).digest("hex") !== row.code_hash) {
    await q("UPDATE auth_codes SET attempts = attempts + 1 WHERE phone = $1", [phone]);
    return "wrong";
  }
  await q("DELETE FROM auth_codes WHERE phone = $1", [phone]);
  return "ok";
}
