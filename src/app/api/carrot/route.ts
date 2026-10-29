import { NextRequest, NextResponse } from "next/server";
import { editCarrot } from "@/lib/ledger";
import { toCents } from "@/lib/parse";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";

// Edit the carrot (name + price). Body: { label, amount }.
export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const label = String(b.label ?? "").trim().slice(0, 60);
  const cents = toCents(String(b.amount ?? "").replace(/[$,\s]/g, "")) ?? 0;
  if (!label) return NextResponse.json({ error: "Give it a name." }, { status: 400 });
  if (!cents || cents <= 0 || cents > 10_000_000) return NextResponse.json({ error: "Give it a price, like 500." }, { status: 400 });
  const r = await editCarrot(uid, label, cents);
  return NextResponse.json({ ok: true, ...r });
}
