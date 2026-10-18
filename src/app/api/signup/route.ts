import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { db } from "@/lib/db";
import { demoMode } from "@/lib/env";
import { createUser, userByPhone } from "@/lib/ledger";
import { toCents } from "@/lib/parse";
import { setSession } from "@/lib/session";
import { normalizePhone, sendSms } from "@/lib/sms";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const phone = normalizePhone(b.phone ?? "");
  const goalLabel = String(b.goalLabel ?? "").trim().slice(0, 60);
  const goalCents = toCents(String(b.goalAmount ?? "").replace(/[$,]/g, "")) ?? 0;
  const name = String(b.name ?? "").trim().slice(0, 40) || null;
  if (!phone) return NextResponse.json({ error: "That doesn't look like a US mobile number." }, { status: 400 });
  if (b.consent !== "yes") return NextResponse.json({ error: "Tick the box so we're allowed to text you." }, { status: 400 });
  if (b.mode !== "login" && (!goalLabel || !goalCents)) return NextResponse.json({ error: "Give your goal a name and a price." }, { status: 400 });

  if (demoMode()) {
    let id: number;
    if (b.mode === "login") {
      const u = await userByPhone(phone);
      if (!u) return NextResponse.json({ error: "No account with that number yet. Start from the top." }, { status: 404 });
      id = Number(u.id);
    } else {
      id = await createUser(phone, goalLabel, goalCents, name);
    }
    await setSession(id);
    return NextResponse.json({ ok: true, next: "/dashboard?welcome=1" });
  }

  // Live mode: text a 6-digit code.
  const code = String(randomInt(100000, 999999));
  const q = await db();
  await q(
    `INSERT INTO auth_codes (phone, code_hash, expires_at, attempts) VALUES ($1, $2, now() + interval '10 minutes', 0)
     ON CONFLICT (phone) DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, attempts = 0`,
    [phone, createHash("sha256").update(code).digest("hex")],
  );
  const sent = await sendSms(phone, `Donate the Difference code: ${code}. Reply STOP to opt out.`);
  if (!sent.ok) return NextResponse.json({ error: "Couldn't text that number. Try again in a minute." }, { status: 502 });
  return NextResponse.json({ ok: true, verify: true });
}
