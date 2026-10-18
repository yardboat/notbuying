import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleMessage, userById } from "@/lib/ledger";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";

// The in-app text simulator: same parser, ledger and replies as real SMS.

export async function GET() {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const q = await db();
  const rows = await q<{ direction: string; body: string; created_at: string }>(
    "SELECT direction, body, created_at FROM messages WHERE user_id = $1 ORDER BY id DESC LIMIT 60",
    [uid],
  );
  return NextResponse.json({ messages: rows.reverse() });
}

export async function POST(req: NextRequest) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "signin" }, { status: 401 });
  const user = await userById(uid);
  if (!user) return NextResponse.json({ error: "signin" }, { status: 401 });
  const { body } = (await req.json().catch(() => ({}))) as { body?: string };
  const text = String(body ?? "").trim().slice(0, 320);
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
  const reply = await handleMessage({ user, body: text, channel: "sim" });
  return NextResponse.json({ reply });
}
