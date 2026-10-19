import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CHARITIES, CATEGORY_LABEL, impactLine, type Category } from "@/lib/charities";
import { activeGoal, goalSaved, issueNumber, userById, weekRecap } from "@/lib/ledger";
import { addDays, isSundayET, pct, prettyDate, usd, weekStartET } from "@/lib/money";
import { currentUserId } from "@/lib/session";
import { makeShareId } from "@/lib/share";

export const dynamic = "force-dynamic";

export default async function Issue({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) notFound();
  const uid = await currentUserId();
  if (!uid) redirect("/#start");
  const user = await userById(uid);
  if (!user) redirect("/#start");

  const current = weekStartET();
  // Sunday-only: this week's issue exists from Sunday; past weeks are archived.
  if (week > current || (week === current && !isSundayET())) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="stamp text-2xl">Not yet</p>
        <p className="mt-6 text-lg">This issue prints on Sunday. Keep the no&apos;s coming.</p>
        <Link href="/dashboard" className="btn mt-8">Back to dashboard</Link>
      </main>
    );
  }

  const r = await weekRecap(uid, week);
  const n = await issueNumber(user, week);
  const goal = await activeGoal(uid);
  const saved = goal ? await goalSaved(Number(goal.id)) : 0;
  const cats = Object.entries(r.byCat).sort((a, b) => b[1].cents - a[1].cents) as [Category, { count: number; cents: number }][];
  const charities = Object.entries(r.byCharity).sort((a, b) => b[1] - a[1]);

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <Link href="/dashboard" className="text-xs uppercase tracking-[0.18em] underline decoration-2 underline-offset-4">← Dashboard</Link>

      {/* The card: built to be screenshotted at phone width. */}
      <article className="receipt print-in relative mt-6 overflow-hidden p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="type text-xs">Donate the Difference</p>
            <p className="type text-xs text-ink-2">{prettyDate(week)} – {prettyDate(addDays(week, 6))}</p>
          </div>
          <p className="display text-right text-5xl leading-none">
            <span className="block text-xs tracking-[0.2em]">Issue</span>
            {String(n).padStart(2, "0")}
          </p>
        </div>

        <div className="rule mt-5 pt-5">
          <p className="type text-sm text-ink-2">{user.name ? `${user.name} said` : "You said"}</p>
          <p className="display text-7xl leading-[0.85]">
            no <span className="cutout-hot">{r.count}</span>
          </p>
          <p className="display text-3xl">time{r.count === 1 ? "" : "s"} this week.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-px border-2 border-ink bg-ink">
          <div className="bg-[#fbf9f3] p-3">
            <p className="type text-xs text-ink-2">kept</p>
            <p className="display text-3xl">{usd(r.skipped)}</p>
          </div>
          <div className="bg-[#fbf9f3] p-3">
            <p className="type text-xs text-ink-2">to give</p>
            <p className="display text-3xl">{usd(r.pledged, { always2: true })}</p>
          </div>
        </div>

        {r.biggest && (
          <p className="mt-6 text-sm">
            Biggest no: <span className="bg-ink px-1 text-paper">{r.biggest.item}</span> ({usd(r.biggest.price_cents)})
          </p>
        )}

        {cats.length > 0 && (
          <ul className="rule-dash mt-5 space-y-1 pt-4 text-sm">
            {cats.map(([c, v]) => (
              <li key={c} className="flex justify-between">
                <span>{CATEGORY_LABEL[c]} × {v.count}</span>
                <span>{usd(v.cents)}</span>
              </li>
            ))}
          </ul>
        )}

        {charities.length > 0 && (
          <ul className="rule-dash mt-4 space-y-1 pt-4 text-sm">
            {charities.map(([slug, cents]) => {
              const c = CHARITIES[slug];
              const imp = impactLine(c, cents);
              return (
                <li key={slug} className="flex justify-between gap-3">
                  <span>→ {c.name}{imp ? ` (${imp})` : ""}</span>
                  <span>{usd(cents, { always2: true })}</span>
                </li>
              );
            })}
          </ul>
        )}

        {goal && (
          <div className="rule mt-5 pt-4">
            <p className="type text-xs text-ink-2">saying yes to</p>
            <p className="display text-2xl">{goal.label}: {pct(saved, Number(goal.target_cents))}%</p>
            <div className="mt-2 h-3 border-2 border-ink">
              <div className="h-full bg-hot" style={{ width: `${pct(saved, Number(goal.target_cents))}%` }} />
            </div>
          </div>
        )}

        <p className="stamp absolute right-4 bottom-6 text-sm">every no is a yes</p>
        <div className="h-10" />
      </article>

      <Link href="/dashboard#send" className="btn btn-hot mt-10 w-full text-lg">Send this week&apos;s difference →</Link>
      <p className="mt-3 text-center text-xs text-ink-2">Screenshot the card. Post it. Somebody you know needs this.</p>
      <p className="mt-4 text-center text-sm">
        <Link href={`/i/${makeShareId(uid, week)}`} className="underline decoration-2 underline-offset-4">Share this issue →</Link>
        <span className="block text-xs text-ink-2">Public link. First name only, never your number.</span>
      </p>
    </main>
  );
}
