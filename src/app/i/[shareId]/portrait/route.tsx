import { publicIssue } from "../data";
import { notFoundImage, portrait } from "../og-card";

export const runtime = "nodejs";

// 1080x1350 portrait card for feeds and stories.
export async function GET(_req: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const d = await publicIssue(shareId);
  const res = d ? await portrait(d) : await notFoundImage(1080, 1350);
  res.headers.set("Cache-Control", "public, max-age=300, s-maxage=3600");
  return res;
}
