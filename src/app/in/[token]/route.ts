import { NextRequest, NextResponse } from "next/server";
import { readToken, setSession } from "@/lib/session";

export const runtime = "nodejs";

// Magic link from texts: /in/<signed token> → session → dashboard.
export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const uid = readToken(token);
  const next = req.nextUrl.searchParams.get("next") ?? "";
  const safeNext = /^\/(dashboard|issue\/\d{4}-\d{2}-\d{2})$/.test(next) ? next : "/dashboard";
  const url = new URL(uid ? safeNext : "/?expired=1", req.url);
  if (uid) await setSession(uid);
  return NextResponse.redirect(url);
}
