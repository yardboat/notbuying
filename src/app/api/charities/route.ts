import { NextRequest, NextResponse } from "next/server";
import { PICK_CATEGORIES, defaultPick, type PickCategory } from "@/lib/charity-options";
import { saveCharityPicks } from "@/lib/ledger";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";

// Save the user's charity picks. Body: { picks: { food: slug, ... } } or { defaults: true }.
export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { picks?: Record<string, string>; defaults?: boolean };
  const picks: Partial<Record<PickCategory, string>> = {};
  for (const cat of PICK_CATEGORIES) {
    picks[cat] = b.defaults ? defaultPick(cat) : b.picks?.[cat] ?? defaultPick(cat);
  }
  await saveCharityPicks(uid, picks);
  return NextResponse.json({ ok: true });
}
