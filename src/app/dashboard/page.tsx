import Link from "next/link";
import { redirect } from "next/navigation";
import { CHARITIES, CATEGORY_LABEL, impactLine } from "@/lib/charities";
import { demoMode, env } from "@/lib/env";
import { charityPicks, issueNumber, summary, userById } from "@/lib/ledger";
import { CHARITY_OPTIONS, PICK_CATEGORIES } from "@/lib/charity-options";
import { DASHBOARD_LINK_LABEL, SAVED_TOAST, TAG_LABELS } from "@/lib/copy-charities";
import { isSundayET, usd, weekStartET } from "@/lib/money";
import { currentUserId } from "@/lib/session";
import { prettyPhone } from "@/lib/sms";
import Simulator from "./simulator";
import SettleButton from "./settle-button";
import GoalMeter from "./goal-meter";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string; picked?: string }> }) {
  const uid = await currentUserId();
  if (!uid) redirect("/#start");
  const user = await userById(uid);
  if (!user) redirect("/#start");
  const s = await summary(uid);
  const { welcome, picked } = await searchParams;
  const picks = await charityPicks(uid);
  const week = weekStartET();
  const issue = await issueNumber(user, week);
  const sunday = isSundayET();
  const number = env("TWILIO_PHONE_NUMBER");
  const owed = Object.entries(s.owed).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <header className="flex items-center justify-between py-4 text-xs uppercase tracking-[0.18em]">
        <Link href="/" className="type text-sm normal-case tracking-normal">Donate the Difference</Link>
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
              : `Save ${number ? prettyPhone(number) : "our number"} and text it the next thing you don't buy.`}
          </p>
        </div>
      )}

      {picked && !welcome && <p className="print-in mb-8 border-2 border-ink p-3 text-sm">{SAVED_TOAST}</p>}

      <section className="grid gap-10 md:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="type text-sm text-ink-2">Saying yes to</p>
          {s.goal ? (
            <>
              <h1 className="display mt-2 text-5xl sm:text-7xl">{s.goal.label}</h1>
              <GoalMeter saved={s.goal.saved} target={s.goal.target_cents} label={s.goal.label} />
              {s.goal.reached_at && <p className="stamp slap mt-6 text-xl">Goal reached</p>}
            </>
          ) : (
            <h1 className="display mt-2 text-4xl">No goal yet. Text: new goal bike 500</h1>
          )}

          <div className="mt-10 grid grid-cols-3 gap-px border-2 border-ink bg-ink text-center">
            <Stat label="this week" value={String(s.thisWeek.count)} sub={`skip${s.thisWeek.count === 1 ? "" : "s"}`} />
            <Stat label="not spent" value={usd(s.lifetime.skipped)} sub="all time" />
            <Stat label="pledged" value={usd(s.lifetime.pledged, { always2: true })} sub={`${usd(s.lifetime.donated, { always2: true })} given`} />
          </div>

          <div className="mt-10">
            <div className="flex items-baseline justify-between">
              <h2 className="display text-2xl">Issue {String(issue).padStart(2, "0")}</h2>
              <span className="type text-sm text-ink-2">{sunday ? "out now" : "drops Sunday"}</span>
            </div>
            {sunday ? (
              <Link href={`/issue/${week}`} className="btn mt-4 w-full">Read this week&apos;s issue →</Link>
            ) : (
              <p className="mt-3 text-sm text-ink-2">Your weekly recap card prints on Sunday. Keep saying no.</p>
            )}
          </div>

          <div className="mt-12">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="display text-2xl">Your charities</h2>
              <Link href="/setup/charities" className="text-sm underline decoration-2 underline-offset-4">{DASHBOARD_LINK_LABEL}</Link>
            </div>
            <ul className="mt-4 divide-y-2 divide-dashed divide-ink border-y-2 border-ink text-sm">
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
          </div>

          <div id="send" className="mt-12 scroll-mt-6">
            <h2 className="display text-2xl">Send the difference</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Your pledges, by charity. Each button opens Every.org with the amount filled in. You give directly; we never hold your money.
            </p>
            {owed.length === 0 ? (
              <p className="mt-4 border-2 border-dashed border-ink p-4 text-sm">Nothing pledged yet. Your first skip changes that.</p>
            ) : (
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
            )}
          </div>
        </div>

        <div className="md:sticky md:top-6 md:self-start">
          <Simulator live={!demoMode()} number={number ? prettyPhone(number) : null} />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="display text-2xl">Recent no&apos;s</h2>
        {s.recent.length === 0 ? (
          <p className="mt-3 text-sm text-ink-2">Empty. The world is still selling. Text your first skip.</p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-dashed divide-ink border-y-2 border-ink">
            {s.recent.map((k) => (
              <li key={k.id} className="flex items-baseline justify-between gap-3 py-3">
                <span>
                  <span className="font-bold">{k.item}</span>{" "}
                  <span className="text-xs text-ink-2">· {CATEGORY_LABEL[k.category]} → {CHARITIES[k.charity]?.name}</span>
                </span>
                <span className="whitespace-nowrap text-sm">
                  {usd(k.price_cents)} <span className="text-ink-2">/ {usd(k.pledge_cents, { always2: true })}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-paper px-2 py-4">
      <p className="type text-xs text-ink-2">{label}</p>
      <p className="display mt-1 text-2xl sm:text-3xl">{value}</p>
      <p className="text-xs text-ink-2">{sub}</p>
    </div>
  );
}
