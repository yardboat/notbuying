import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";

// Success metric: skips per active tester per week. Guarded by STUDIO_TOKEN (Bearer).
export async function GET(req: NextRequest) {
  const token = env("STUDIO_TOKEN");
  if (!token || req.headers.get("authorization") !== `Bearer ${token}`) return new Response("unauthorized", { status: 401 });
  const q = await db();
  const weeks = await q<{ week: string; testers: string; skips: string }>(
    `SELECT to_char(date_trunc('week', created_at AT TIME ZONE 'America/New_York'), 'YYYY-MM-DD') AS week,
            COUNT(DISTINCT user_id) AS testers, COUNT(*) AS skips
       FROM skips WHERE undone_at IS NULL GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
  );
  const [users] = await q<{ n: string }>("SELECT COUNT(*) AS n FROM users");
  return NextResponse.json({
    signups: Number(users.n),
    weeks: weeks.map((w) => ({ week: w.week, activeTesters: Number(w.testers), skips: Number(w.skips), skipsPerTester: Number(w.testers) ? +(Number(w.skips) / Number(w.testers)).toFixed(1) : 0 })),
    target: "5+ skips per active tester per week",
  });
}
