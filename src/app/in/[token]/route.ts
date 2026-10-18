import { NextRequest, NextResponse } from "next/server";
import { readToken, setSession } from "@/lib/session";

export const runtime = "nodejs";

// Magic link from texts: /in/<signed token> → session → dashboard.
export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const uid = readToken(token);
  const url = new URL(uid ? "/dashboard" : "/?expired=1", req.url);
  if (uid) await setSession(uid);
  return NextResponse.redirect(url);
}
