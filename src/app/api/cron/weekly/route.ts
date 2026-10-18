import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appUrl, demoMode, env } from "@/lib/env";
import { issueNumber, weekRecap, type User } from "@/lib/ledger";
import { usd, weekStartET } from "@/lib/money";
import { sendSms } from "@/lib/sms";

export const runtime = "nodejs";

// Sunday issue drop. Vercel Cron calls this with Authorization: Bearer CRON_SECRET.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${env("CRON_SECRET")}`) {
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
    const body = r.count
      ? `Issue ${String(n).padStart(2, "0")} is out. This week you said no ${r.count} time${r.count === 1 ? "" : "s"}: ${usd(r.skipped)} not spent, ${usd(r.pledged, { always2: true })} pledged. See it + send the donations: ${appUrl()}/issue/${week}`
      : `Issue ${String(n).padStart(2, "0")}: a quiet week. Nothing logged. Next time you walk past something, text it: coffee 5`;
    if (!demoMode()) {
      const res = await sendSms(u.phone, body);
      if (!res.ok) continue;
    }
    await q("INSERT INTO weekly_sends (user_id, week_start) VALUES ($1,$2) ON CONFLICT DO NOTHING", [uid, week]);
    await q("INSERT INTO messages (user_id, direction, channel, body, intent) VALUES ($1,'out',$2,$3,'weekly')", [uid, demoMode() ? "sim" : "sms", body]);
    sent++;
  }
  return NextResponse.json({ week, sent });
}
