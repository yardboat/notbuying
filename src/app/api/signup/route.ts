import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { demoMode } from "@/lib/env";
import { SMS_CONSENT_TEXT, SMS_CONSENT_VERSION } from "@/lib/consent";
import { createUser, userByPhone } from "@/lib/ledger";
import { toCents } from "@/lib/parse";
import { checkPin, hashPin, validPin } from "@/lib/pin";
import { setSession } from "@/lib/session";
import { normalizePhone } from "@/lib/sms";
import { startSmsConfirm } from "@/lib/sms-confirm";

export const runtime = "nodejs";

// Sign up / sign in. SMS consent is optional; sign-in uses phone + PIN (no SMS required).
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const phone = normalizePhone(b.phone ?? "");
  const pin = String(b.pin ?? "").trim();
  if (!phone) return NextResponse.json({ error: "That doesn't look like a US mobile number." }, { status: 400 });
  if (!validPin(pin)) return NextResponse.json({ error: "Your PIN is 4 to 8 digits." }, { status: 400 });

  const q = await db();
  const existing = await userByPhone(phone);

  if (b.mode === "login") {
    if (!existing) return NextResponse.json({ error: "No account with that number yet. Start from the top." }, { status: 404 });
    if (existing.pin_locked_until && new Date(existing.pin_locked_until) > new Date()) {
      return NextResponse.json({ error: "Too many tries. Wait 15 minutes and try again." }, { status: 429 });
    }
    if (!existing.pin_hash) {
      // Prototype testers from before PINs existed: the invite-gated sign-in sets their PIN once.
      if (!demoMode()) return NextResponse.json({ error: "Reset needed. Email hello@notbuying.org." }, { status: 400 });
      await q("UPDATE users SET pin_hash = $2 WHERE id = $1", [existing.id, hashPin(pin)]);
    } else if (!checkPin(pin, existing.pin_hash)) {
      await q(
        "UPDATE users SET pin_attempts = pin_attempts + 1, pin_locked_until = CASE WHEN pin_attempts + 1 >= 5 THEN now() + interval '15 minutes' ELSE NULL END WHERE id = $1",
        [existing.id],
      );
      return NextResponse.json({ error: "That number and PIN don't match." }, { status: 401 });
    }
    await q("UPDATE users SET pin_attempts = 0, pin_locked_until = NULL WHERE id = $1", [existing.id]);
    await setSession(Number(existing.id));
    return NextResponse.json({ ok: true, next: "/dashboard" });
  }

  // Sign up
  const goalLabel = String(b.goalLabel ?? "").trim().slice(0, 60);
  const goalCents = toCents(String(b.goalAmount ?? "").replace(/[$,]/g, "")) ?? 0;
  const name = String(b.name ?? "").trim().slice(0, 40) || null;
  if (!goalLabel || !goalCents) return NextResponse.json({ error: "Give your goal a name and a price." }, { status: 400 });
  if (existing?.pin_hash) return NextResponse.json({ error: "You already have an account. Sign in with your number and PIN." }, { status: 409 });

  const wantsSms = b.smsConsent === "yes";
  // Demo mode sends no texts, so the opt-in is recorded straight away. Live mode confirms the number by text first.
  const id = await createUser(phone, goalLabel, goalCents, name, {
    pinHash: hashPin(pin),
    smsConsent: wantsSms && demoMode(),
    consentText: `${SMS_CONSENT_VERSION}: ${SMS_CONSENT_TEXT}`,
  });
  await setSession(id);

  if (wantsSms && !demoMode()) {
    const sent = await startSmsConfirm(phone);
    if (sent.ok) return NextResponse.json({ ok: true, verifySms: true, next: "/setup/charities?onboarding=1" });
  }
  return NextResponse.json({ ok: true, next: "/setup/charities?onboarding=1" });
}
