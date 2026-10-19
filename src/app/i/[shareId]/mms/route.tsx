import sharp from "sharp";
import { publicIssue } from "../data";
import { notFoundImage, portrait } from "../og-card";

export const runtime = "nodejs";

// The Sunday card as a picture message: the 1080x1350 portrait card, re-encoded as a
// compact JPEG so carriers deliver it crisp instead of silently shrinking it.
export async function GET(_req: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const d = await publicIssue(shareId);
  const png = Buffer.from(await (d ? await portrait(d) : await notFoundImage(1080, 1350)).arrayBuffer());
  const jpg = await sharp(png).resize(864, 1080).jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpg.length),
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
