import { NextRequest, NextResponse } from "next/server";
import { setSplit } from "@/lib/ledger";
import { toCents } from "@/lib/parse";
import { currentUserId } from "@/lib/session";
import { MIN_GIVE, validSplit } from "@/lib/split";

export const runtime = "nodejs";

// Save how each "no" is divided: { carrot, savings, give } percentages (sum 100, give >= 5), optional savings target + name.
export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const split = { carrot: Number(b.carrot), savings: Number(b.savings), give: Number(b.give) };
  if (!validSplit(split)) return NextResponse.json({ error: `The three need to add up to 100%, with at least ${MIN_GIVE}% to giving.` }, { status: 400 });
  const rawTarget = String(b.savingsTarget ?? "").replace(/[$,\s]/g, "");
  const target = rawTarget ? toCents(rawTarget) : null;
  if (rawTarget && (!target || target <= 0)) return NextResponse.json({ error: "That savings target doesn't look like a number." }, { status: 400 });
  const label = String(b.savingsLabel ?? "").trim().slice(0, 40) || null;
  await setSplit(uid, split, target, label);
  return NextResponse.json({ ok: true });
}
