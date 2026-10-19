import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appUrl, demoMode, env } from "@/lib/env";
import { issueNumber, weekRecap, type User } from "@/lib/ledger";
import { usd, weekStartET } from "@/lib/money";
import { sendSms } from "@/lib/sms";
import { makeToken } from "@/lib/session";
import { makeShareId } from "@/lib/share";

export const runtime = "nodejs";

// Sunday issue drop. Vercel Cron calls this with Authorization: Bearer CRON_SECRET.
export async function GET(req: NextRequest) {
  const secret = env("CRON_SECRET");
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("unauthorized", { status: 401 });
  }
  const q = await db();
  const week = weekStartET();
  const users = await q<User>("SELECT * FROM users WHERE status = 'active'");
  let sent = 0;
  for (const u of users) {
    const uid = Number(u.id);
    const already = await q("SELECT 1 FROM weekly_sends WHERE user_id = $1 AND week_start = $2", [uid, week]);
    if (already.length) continue;
    const r = await weekRecap(uid, week);
    const n = await issueNumber(u, week);
    const issue = String(n).padStart(2, "0");
    const dash = `${appUrl()}/in/${makeToken(uid, 60 * 60 * 24 * 7)}?next=/dashboard`;
    // A week with skips gets the card itself as a picture message; a quiet week gets a nudge.
    const mediaUrl = r.count ? `${appUrl()}/i/${encodeURIComponent(makeShareId(uid, week))}/mms` : null;
    const body = r.count
      ? `Issue ${issue}. ${usd(r.skipped)} not spent, ${usd(r.pledged, { always2: true })} to give. Send the difference + see your dashboard: ${dash}`
      : `Issue ${issue}: a quiet week. Nothing logged. Next time you walk past something, text it: coffee 5`;
    if (!demoMode()) {
      const res = await sendSms(u.phone, body, mediaUrl ?? undefined);
      if (!res.ok) continue;
    }
    await q("INSERT INTO weekly_sends (user_id, week_start) VALUES ($1,$2) ON CONFLICT DO NOTHING", [uid, week]);
    await q("INSERT INTO messages (user_id, direction, channel, body, intent, media_url) VALUES ($1,'out',$2,$3,'weekly',$4)", [uid, demoMode() ? "sim" : "sms", body, mediaUrl]);
    sent++;
  }
  return NextResponse.json({ week, sent });
}
