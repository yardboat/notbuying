import { NextRequest, NextResponse } from "next/server";
import { demoMode } from "@/lib/env";
import { SMS_CONSENT_TEXT, SMS_CONSENT_VERSION } from "@/lib/consent";
import { recordSmsConsent, revokeSmsConsent, userById } from "@/lib/ledger";
import { currentUserId } from "@/lib/session";
import { startSmsConfirm } from "@/lib/sms-confirm";

export const runtime = "nodejs";

// Turn texts on or off from the dashboard. Body: { on: boolean }.
export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const user = await userById(uid);
  if (!user) return NextResponse.json({ error: "signin" }, { status: 401 });
  const { on } = (await req.json().catch(() => ({}))) as { on?: boolean };
  if (!on) {
    await revokeSmsConsent(uid);
    return NextResponse.json({ ok: true, sms: false });
  }
  if (demoMode()) {
    await recordSmsConsent(uid, `${SMS_CONSENT_VERSION}: ${SMS_CONSENT_TEXT}`);
    return NextResponse.json({ ok: true, sms: true });
  }
  const sent = await startSmsConfirm(user.phone);
  if (!sent.ok) return NextResponse.json({ error: sent.error ?? "Couldn't text that number. Try again in a minute." }, { status: 502 });
  return NextResponse.json({ ok: true, verifySms: true });
}
