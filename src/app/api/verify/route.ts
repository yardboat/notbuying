import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { createUser, userByPhone } from "@/lib/ledger";
import { toCents } from "@/lib/parse";
import { setSession } from "@/lib/session";
import { normalizePhone } from "@/lib/sms";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const phone = normalizePhone(b.phone ?? "");
  if (!phone) return NextResponse.json({ error: "Missing number." }, { status: 400 });
  const q = await db();
  const [row] = await q<{ code_hash: string; expires_at: string; attempts: number }>("SELECT * FROM auth_codes WHERE phone = $1", [phone]);
  if (!row || new Date(row.expires_at) < new Date() || Number(row.attempts) >= 5) {
    return NextResponse.json({ error: "That code expired. Send a new one." }, { status: 400 });
  }
  const ok = createHash("sha256").update(String(b.code ?? "").trim()).digest("hex") === row.code_hash;
  if (!ok) {
    await q("UPDATE auth_codes SET attempts = attempts + 1 WHERE phone = $1", [phone]);
    return NextResponse.json({ error: "Wrong code." }, { status: 400 });
  }
  await q("DELETE FROM auth_codes WHERE phone = $1", [phone]);
  let id: number;
  if (b.mode === "login") {
    const u = await userByPhone(phone);
    if (!u) return NextResponse.json({ error: "No account with that number." }, { status: 404 });
    id = Number(u.id);
  } else {
    id = await createUser(phone, String(b.goalLabel ?? "").slice(0, 60), toCents(String(b.goalAmount ?? "")) ?? 0, b.name || null);
  }
  await setSession(id);
  return NextResponse.json({ ok: true, next: b.mode === "login" ? "/dashboard" : "/setup/charities?onboarding=1" });
}
