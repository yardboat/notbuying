import Link from "next/link";
import { redirect } from "next/navigation";
import { CHARITIES, CATEGORY_LABEL, impactLine } from "@/lib/charities";
import { demoMode, env } from "@/lib/env";
import { charityPicks, issueNumber, summary, userById } from "@/lib/ledger";
import { CHARITY_OPTIONS, PICK_CATEGORIES } from "@/lib/charity-options";
import { DASHBOARD_LINK_LABEL, SAVED_TOAST, TAG_LABELS } from "@/lib/copy-charities";
import { isSundayET, prettyDate, usd, weekStartET } from "@/lib/money";
import { CategoryBars, Meter, ProgressChart, SplitBar } from "@/components/dashboard/charts";
import { currentUserId } from "@/lib/session";
import { prettyPhone } from "@/lib/sms";
import Simulator from "./simulator";
import SettleButton from "./settle-button";
import GoalMeter from "./goal-meter";
import TextsToggle from "./texts-toggle";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string; picked?: string; split?: string }> }) {
  const uid = await currentUserId();
  if (!uid) redirect("/#start");
  const user = await userById(uid);
  if (!user) redirect("/#start");
  const s = await summary(uid);
  const { welcome, picked, split } = await searchParams;
  const picks = await charityPicks(uid);
  const week = weekStartET();
  const issue = await issueNumber(user, week);
  const sunday = isSundayET();
  const number = env("TWILIO_PHONE_NUMBER");
  const owed = Object.entries(s.owed).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]);

  const names = { carrot: s.pastGoals.length || !s.goal ? "Carrots" : s.goal.label, savings: s.savings.label, give: "Giving" };
  const cats = Object.entries(s.byCategory)
    .map(([k, v]) => ({ label: CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL] ?? k, ...v }))
    .sort((x, y) => y.cents - x.cents)
    .slice(0, 6);
  const funded = s.goal?.reached_at ? s.goal : null;
  const givenPct = s.lifetime.pledged ? Math.min(100, Math.round((s.lifetime.donated / s.lifetime.pledged) * 100)) : 0;
  const owedTotal = owed.reduce((a, [, c]) => a + c, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <header className="flex items-center justify-between py-4 text-xs uppercase tracking-[0.18em]">
        <Link href="/" className="type text-sm normal-case tracking-normal">Not Buying</Link>
        <form action="/api/logout" method="post">
          <button className="underline decoration-2 underline-offset-4">Sign out</button>
        </form>
      </header>

      {welcome && (
        <div className="print-in mb-8 border-2 border-ink bg-hot p-4 text-hot-ink">
          <p className="display text-2xl">You&apos;re in{user.name ? `, ${user.name}` : ""}.</p>
          <p className="mt-1 text-sm">
            {demoMode()
              ? "Texting goes live once the carriers approve our number. Until then, use the text box below. It works exactly like the real thing."
              : user.sms_consent
                ? `Save ${number ? prettyPhone(number) : "our number"} and text it the next thing you don't buy.`
                : "Log your first no in the text box at the bottom of this page, or turn on texts."}
          </p>
        </div>
      )}
      {picked && !welcome && <p className="print-in mb-8 border-2 border-ink p-3 text-sm">{SAVED_TOAST}</p>}
      {split && !welcome && <p className="print-in mb-8 border-2 border-ink p-3 text-sm">Split saved. Your next no divides the new way.</p>}

      {!user.split_set_at && !welcome && (
        <Link href="/setup/split" className="print-in mb-8 block border-2 border-ink bg-receipt p-4">
          <span className="display block text-2xl">New: split every no three ways.</span>
          <span className="mt-1 block text-sm">
            Your thing, your savings, your giving. You&apos;re on {s.split.carrot}/{s.split.savings}/{s.split.give} for now. <span className="underline">Choose yours →</span>
          </span>
        </Link>
      )}

      {/* Hero: lifetime */}
      <section className="receipt p-6 sm:p-8">
        <p className="type text-sm text-ink-2">{s.lifetime.since ? `Since ${prettyDate(String(s.lifetime.since).slice(0, 10))}` : "Your ledger"}</p>
        <p className="display mt-3 flex flex-wrap items-center gap-x-4 text-6xl leading-[0.9] sm:text-8xl">
          <span>No</span>
          <span className="cutout-hot inline-block -rotate-1 px-3">{s.lifetime.count}</span>
          <span className="text-4xl sm:text-6xl">times.</span>
        </p>
        <p className="display mt-4 text-3xl sm:text-4xl">{usd(s.lifetime.skipped)} not spent.</p>
        {s.lifetime.biggest && (
          <p className="mt-2 text-sm text-ink-2">
            Biggest no: <span className="cutout px-1">{s.lifetime.biggest.item}</span> ({usd(s.lifetime.biggest.price_cents)}). This week: {s.thisWeek.count}.
          </p>
        )}
        <div className="rule-dash mt-6 pt-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="type text-sm">Where it went</h2>
            <Link href="/setup/split" className="text-sm underline decoration-2 underline-offset-4">
              Split {s.split.carrot}/{s.split.savings}/{s.split.give} · change
            </Link>
          </div>
          <SplitBar values={{ carrot: s.lifetime.carrot, savings: s.lifetime.savings, give: s.lifetime.pledged }} names={names} />
        </div>
      </section>

      {/* The carrot */}
      <section className="mt-12">
        <p className="type text-sm text-ink-2">Saying yes to · {s.split.carrot}% of every no</p>
        {s.goal ? (
          <>
            <h1 className="display mt-2 text-5xl sm:text-7xl">{s.goal.label}</h1>
            <GoalMeter saved={s.goal.saved} target={s.goal.target_cents} label={s.goal.label} />
            {funded && (
              <div className="mt-6 border-2 border-ink p-4">
                <p className="stamp slap inline-block text-xl">Funded</p>
                <p className="mt-3 text-sm">
                  Go get it. Then pick your next carrot by texting <span className="font-bold">new goal camera 800</span>.
                  {s.held > 0 ? ` ${usd(s.held)} is already waiting for it.` : " Its share waits until you do."}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-3 border-2 border-dashed border-ink p-4">
            <p className="display text-3xl">No carrot yet.</p>
            <p className="mt-2 text-sm">Text <span className="font-bold">new goal bike 500</span>.{s.held > 0 ? ` ${usd(s.held)} is waiting for it.` : ""}</p>
          </div>
        )}
        {s.pastGoals.length > 0 && (
          <p className="mt-4 text-sm text-ink-2">
            Funded so far: {s.pastGoals.map((g) => `${g.label} (${usd(g.target_cents)})`).join(", ")}
          </p>
        )}
      </section>

      {/* Savings + giving */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="border-2 border-ink p-5">
          <p className="type text-sm text-ink-2">{s.savings.label} · {s.split.savings}%</p>
          <p className="display mt-2 text-5xl">{usd(s.savings.total)}</p>
          {s.savings.target ? (
            <div className="mt-4 space-y-2">
              <Meter pct={s.savings.pct ?? 0} bucket="savings" label={`Progress toward ${s.savings.label}`} />
              <p className="text-sm text-ink-2">{s.savings.pct}% of {usd(s.savings.target)}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-2">
              No target. <Link href="/setup/split" className="underline">Add one</Link> to see a finish line.
            </p>
          )}
          <p className="mt-4 text-xs text-ink-2">A running tally of what you&apos;ve set aside. Move it to your savings or retirement account whenever you like.</p>
        </div>

        <div className="border-2 border-ink p-5">
          <p className="type text-sm text-ink-2">Giving · {s.split.give}%</p>
          <p className="display mt-2 text-5xl">{usd(s.lifetime.pledged, { always2: true })}</p>
          <div className="mt-4 space-y-2">
            <Meter pct={givenPct} bucket="give" label="Share of pledges you've sent" />
            <p className="text-sm text-ink-2">
              {usd(s.lifetime.donated, { always2: true })} sent{owedTotal > 0 ? ` · ${usd(owedTotal, { always2: true })} ready to send` : ""}
            </p>
          </div>
          {owedTotal > 0 && <a href="#send" className="btn btn-hot mt-4 w-full">Send the difference →</a>}
        </div>
      </section>

      {/* Progress over time */}
      {s.lifetime.count > 0 && <section className="mt-14">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="display text-2xl">The pile, growing</h2>
          <span className="type text-xs text-ink-2">running total by week</span>
        </div>
        <div className="mt-8">
          <ProgressChart weeks={s.weeks} baseline={s.baseline} names={names} />
        </div>
      </section>}

      {cats.length > 0 && (
        <section className="mt-14">
          <h2 className="display text-2xl">What you say no to</h2>
          <div className="mt-5">
            <CategoryBars rows={cats} />
          </div>
        </section>
      )}

      {owed.length > 0 && (
        <section id="send" className="mt-14 scroll-mt-6">
          <h2 className="display text-2xl">Send the difference</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">Each button opens Every.org with the amount filled in. You give directly; we never hold your money.</p>
          <ul className="mt-4 space-y-3">
            {owed.map(([slug, cents]) => {
              const c = CHARITIES[slug];
              const impact = impactLine(c, cents);
              return (
                <li key={slug} className="receipt flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-bold">{c.name}</p>
                    <p className="text-sm text-ink-2">{c.cause}{impact ? ` · ${impact}` : ""}</p>
                  </div>
                  <SettleButton charity={slug} cents={cents} />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-14 flex items-baseline justify-between gap-4 border-y-2 border-ink py-4">
        <h2 className="display text-xl">Issue {String(issue).padStart(2, "0")}</h2>
        {sunday ? (
          <Link href={`/issue/${week}`} className="text-sm underline decoration-2 underline-offset-4">Read this week&apos;s →</Link>
        ) : (
          <span className="type text-sm text-ink-2">prints Sunday</span>
        )}
      </section>

      <section className="mt-6 space-y-3">
        <details className="group border-2 border-ink" open={demoMode() || !user.sms_consent}>
          <summary className="cursor-pointer p-4 font-bold">Log a no here</summary>
          <div className="border-t-2 border-ink p-4">
            <Simulator live={!demoMode()} number={number ? prettyPhone(number) : null} />
          </div>
        </details>

        <details className="border-2 border-ink">
          <summary className="cursor-pointer p-4 font-bold">Recent no&apos;s</summary>
          <div className="border-t-2 border-ink p-4">
            {s.recent.length === 0 ? (
              <p className="text-sm text-ink-2">Empty. The world is still selling.</p>
            ) : (
              <ul className="divide-y-2 divide-dashed divide-ink text-sm">
                {s.recent.map((k) => (
                  <li key={k.id} className="flex items-baseline justify-between gap-3 py-2">
                    <span className="font-bold">{k.item}</span>
                    <span className="whitespace-nowrap">{usd(k.price_cents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>

        <details className="border-2 border-ink">
          <summary className="cursor-pointer p-4 font-bold">Your charities</summary>
          <div className="border-t-2 border-ink p-4">
            <ul className="divide-y-2 divide-dashed divide-ink text-sm">
              {PICK_CATEGORIES.map((cat) => {
                const o = CHARITY_OPTIONS[cat].find((x) => x.slug === picks[cat]) ?? CHARITY_OPTIONS[cat][0];
                return (
                  <li key={cat} className="flex items-baseline justify-between gap-3 py-2">
                    <span className="text-ink-2">{CATEGORY_LABEL[cat]}</span>
                    <span className="text-right">
                      <span className="font-bold">{o.name}</span> <span className="type text-xs text-ink-2">· {TAG_LABELS[o.tag].replace(/^The /, "").toLowerCase()}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <Link href="/setup/charities" className="mt-3 inline-block text-sm underline decoration-2 underline-offset-4">{DASHBOARD_LINK_LABEL}</Link>
          </div>
        </details>
      </section>

      <TextsToggle on={Boolean(user.sms_consent)} />
    </main>
  );
}

