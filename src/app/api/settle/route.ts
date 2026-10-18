import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { appUrl } from "@/lib/env";
import { CHARITIES, everyOrgLink } from "@/lib/charities";
import { currentUserId } from "@/lib/session";
import { confirmSettle } from "@/lib/settle";

export const runtime = "nodejs";

// Start a settle-up for one charity: record intent, hand back the Every.org link.
export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const { charity } = (await req.json().catch(() => ({}))) as { charity?: string };
  if (!charity || !CHARITIES[charity]) return NextResponse.json({ error: "unknown charity" }, { status: 400 });
  const q = await db();
  const [r] = await q<{ s: string }>(
    "SELECT COALESCE(SUM(pledge_cents),0) AS s FROM skips WHERE user_id = $1 AND charity = $2 AND undone_at IS NULL AND settled_at IS NULL",
    [uid, charity],
  );
  const cents = Number(r?.s ?? 0);
  if (cents < 100) return NextResponse.json({ error: "Under $1 — it rolls into next week." }, { status: 400 });
  const pid = `nb_${uid}_${randomBytes(6).toString("hex")}`;
  await q("INSERT INTO settle_ups (user_id, charity, amount_cents, partner_id) VALUES ($1,$2,$3,$4)", [uid, charity, cents, pid]);
  const success = `${appUrl()}/settle/done?pid=${pid}`;
  return NextResponse.json({ url: everyOrgLink(charity, cents, success, pid), pid });
}

// Manual "I donated" confirmation (fallback when Every.org doesn't redirect back).
export async function PUT(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const { pid } = (await req.json().catch(() => ({}))) as { pid?: string };
  const ok = await confirmSettle(uid, String(pid ?? ""));
  return NextResponse.json({ ok });
}
