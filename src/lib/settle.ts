import "server-only";
import { db } from "./db";

export async function confirmSettle(uid: number, pid: string) {
  const q = await db();
  const [s] = await q<{ id: number; charity: string; clicked_at: string; confirmed_at: string | null }>(
    "SELECT id, charity, clicked_at, confirmed_at FROM settle_ups WHERE partner_id = $1 AND user_id = $2",
    [pid, uid],
  );
  if (!s) return false;
  if (!s.confirmed_at) {
    await q("UPDATE settle_ups SET confirmed_at = now() WHERE id = $1", [s.id]);
    await q(
      "UPDATE skips SET settled_at = now() WHERE user_id = $1 AND charity = $2 AND undone_at IS NULL AND settled_at IS NULL AND created_at <= $3",
      [uid, s.charity, s.clicked_at],
    );
  }
  return true;
}
