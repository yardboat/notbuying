import { NextRequest, NextResponse } from "next/server";
import { SMS_CONSENT_TEXT, SMS_CONSENT_VERSION } from "@/lib/consent";
import { recordSmsConsent, userById } from "@/lib/ledger";
import { currentUserId } from "@/lib/session";
import { checkSmsConfirm } from "@/lib/sms-confirm";

export const runtime = "nodejs";

// Confirms the texted code for a signed-in person who opted in to texts, then turns texts on.
export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const user = await userById(uid);
  if (!user) return NextResponse.json({ error: "signin" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const r = await checkSmsConfirm(user.phone, String(b.code ?? ""));
  if (r === "expired") return NextResponse.json({ error: "That code expired. Send a new one." }, { status: 400 });
  if (r === "wrong") return NextResponse.json({ error: "Wrong code." }, { status: 400 });
  await recordSmsConsent(uid, `${SMS_CONSENT_VERSION}: ${SMS_CONSENT_TEXT}`);
  return NextResponse.json({ ok: true });
}
