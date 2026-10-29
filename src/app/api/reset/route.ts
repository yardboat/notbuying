import { NextRequest, NextResponse } from "next/server";
import { clearSlate } from "@/lib/ledger";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";

// Start with a clean slate. Requires { confirm: "CLEAR" } so it can't happen by accident.
export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  if (String(b.confirm ?? "").trim().toUpperCase() !== "CLEAR") return NextResponse.json({ error: "Type CLEAR to confirm." }, { status: 400 });
  await clearSlate(uid);
  return NextResponse.json({ ok: true, next: "/setup/carrot?fresh=1" });
}
