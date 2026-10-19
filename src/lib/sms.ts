import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function prettyPhone(e164: string) {
  const d = e164.replace(/\D/g, "").slice(-10);
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export const twilioConfigured = () => Boolean(env("TWILIO_ACCOUNT_SID") && env("TWILIO_AUTH_TOKEN") && env("TWILIO_PHONE_NUMBER"));

export async function sendSms(to: string, body: string, mediaUrl?: string): Promise<{ ok: boolean; error?: string }> {
  const sid = env("TWILIO_ACCOUNT_SID");
  const token = env("TWILIO_AUTH_TOKEN");
  const from = env("TWILIO_PHONE_NUMBER");
  if (!sid || !token || !from) return { ok: false, error: "twilio_not_configured" };
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body, ...(mediaUrl ? { MediaUrl: mediaUrl } : {}) }),
  });
  if (!res.ok) return { ok: false, error: `twilio_${res.status}` };
  return { ok: true };
}

/** Validate X-Twilio-Signature (HMAC-SHA1 of full URL + sorted POST params). */
export function validTwilioSignature(url: string, params: Record<string, string>, signature: string | null): boolean {
  const token = env("TWILIO_AUTH_TOKEN");
  if (!token || !signature) return false;
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join("");
  const expected = createHmac("sha1", token).update(data).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function twiml(message: string | null) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${message ? `<Message>${esc(message)}</Message>` : ""}</Response>`;
}
