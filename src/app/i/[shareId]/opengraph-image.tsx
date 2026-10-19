import { publicIssue } from "./data";
import { landscape, notFoundImage } from "./og-card";

export const runtime = "nodejs";
export const alt = "A weekly issue of Not Buying: what someone didn't buy this week.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const d = await publicIssue(shareId);
  return d ? landscape(d) : notFoundImage(1200, 630);
}
