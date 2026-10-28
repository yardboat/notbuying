import "server-only";
import { CATEGORY_LABEL, CHARITIES, impactLine, type Category } from "@/lib/charities";
import { activeGoal, goalSaved, issueNumber, skipsFor, userById, weekRecap } from "@/lib/ledger";
import { addDays, isSundayET, pct, prettyDate, weekStartET } from "@/lib/money";
import { readShareId } from "@/lib/share";

/** Viewer-safe projection of a weekly issue: no phone, no ids, no raw skip rows. */
export type PublicIssue = {
  issue: string;
  range: string;
  who: string;
  count: number;
  kept: number;
  pledged: number;
  carrot: number;
  savings: number;
  savingsLabel: string;
  savingsTotal: number;
  savingsTarget: number | null;
  biggest: { item: string; cents: number } | null;
  cats: { label: string; count: number; cents: number }[];
  charities: { name: string; impact: string | null; cents: number }[];
  goal: { label: string; pct: number; funded: boolean } | null;
};

export async function publicIssue(shareId: string): Promise<PublicIssue | null> {
  const t = readShareId(shareId);
  if (!t) return null;
  const current = weekStartET();
  if (t.weekStart > current || (t.weekStart === current && !isSundayET())) return null;
  const user = await userById(t.userId);
  if (!user || user.status === "deleted") return null;
  const r = await weekRecap(t.userId, t.weekStart);
  const n = await issueNumber(user, t.weekStart);
  const goal = await activeGoal(t.userId);
  const saved = goal ? await goalSaved(Number(goal.id)) : 0;
  // Savings to date as of the end of this issue's week.
  const upTo = await skipsFor(t.userId, undefined, addDays(t.weekStart, 7));
  const savingsTotal = upTo.reduce((a, s) => a + s.savings_cents, 0);
  const first = user.name?.trim().split(/\s+/)[0];
  return {
    issue: String(n).padStart(2, "0"),
    range: `${prettyDate(t.weekStart)} – ${prettyDate(addDays(t.weekStart, 6))}`,
    who: first || "Someone",
    count: r.count,
    kept: r.skipped,
    pledged: r.pledged,
    carrot: r.carrot,
    savings: r.savings,
    savingsLabel: "Savings", // public card: never show the private name of the fund
    savingsTotal,
    savingsTarget: user.savings_target_cents ? Number(user.savings_target_cents) : null,
    biggest: r.biggest ? { item: r.biggest.item, cents: r.biggest.price_cents } : null,
    cats: (Object.entries(r.byCat) as [Category, { count: number; cents: number }][])
      .sort((a, b) => b[1].cents - a[1].cents)
      .map(([c, v]) => ({ label: CATEGORY_LABEL[c], ...v })),
    charities: Object.entries(r.byCharity)
      .sort((a, b) => b[1] - a[1])
      .map(([slug, cents]) => ({ name: CHARITIES[slug]?.name ?? slug, impact: CHARITIES[slug] ? impactLine(CHARITIES[slug], cents) : null, cents })),
    goal: goal ? { label: goal.label, pct: pct(saved, Number(goal.target_cents)), funded: Boolean(goal.reached_at) } : null,
  };
}
