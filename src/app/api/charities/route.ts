import { NextRequest, NextResponse } from "next/server";
import { PICK_CATEGORIES, defaultPick, isValidPick, type PickCategory } from "@/lib/charity-options";
import { saveCharityPicks } from "@/lib/ledger";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";

// Save the user's charity picks. Body: { picks: { food: slug, ... } } or { defaults: true }.
export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { picks?: Record<string, string>; defaults?: boolean };
  const picks: Partial<Record<PickCategory, string>> = {};
  if (b.defaults) {
    for (const cat of PICK_CATEGORIES) picks[cat] = defaultPick(cat);
  } else {
    // Only write what was sent; reject anything that isn't one of the three picks for its category.
    const sent = b.picks && typeof b.picks === "object" ? b.picks : {};
    for (const [cat, slug] of Object.entries(sent)) {
      if (!PICK_CATEGORIES.includes(cat as PickCategory) || typeof slug !== "string" || !isValidPick(cat as PickCategory, slug)) {
        return NextResponse.json({ error: `Not a valid pick for ${cat}.` }, { status: 400 });
      }
      picks[cat as PickCategory] = slug;
    }
    if (!Object.keys(picks).length) return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  }
  await saveCharityPicks(uid, picks);
  return NextResponse.json({ ok: true });
}
