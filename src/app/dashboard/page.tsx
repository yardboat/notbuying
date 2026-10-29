import Link from "next/link";
import { redirect } from "next/navigation";
import { CHARITIES, CATEGORY_LABEL, impactLine } from "@/lib/charities";
import { demoMode, env } from "@/lib/env";
import { charityPicks, issueNumber, summary, userById } from "@/lib/ledger";
import { CHARITY_OPTIONS, PICK_CATEGORIES } from "@/lib/charity-options";
import { DASHBOARD_LINK_LABEL, SAVED_TOAST, TAG_LABELS } from "@/lib/copy-charities";
import { isSundayET, prettyDate, usd, weekStartET } from "@/lib/money";
import { CategoryBars, Meter, ProgressChart } from "@/components/dashboard/charts";
import { currentUserId } from "@/lib/session";
import { prettyPhone } from "@/lib/sms";
import SettleButton from "./settle-button";
import QuickLog from "./quick-log";
import OpenLink from "./open-link";
import ClearSlate from "./clear-slate";
import TextsToggle from "./texts-toggle";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string; picked?: string; split?: string; carrot?: string }> }) {
  const uid = await currentUserId();
  if (!uid) redirect("/#start");
  const user = await userById(uid);
  if (!user) redirect("/#start");
  const s = await summary(uid);
  const { welcome, picked, split, carrot } = await searchParams;
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
            {user.sms_consent || demoMode()
              ? `Save ${number ? prettyPhone(number) : "our number"} and text it the next thing you don't buy, like: takeout 25`
              : "Turn on texts at the bottom of this page, then text us the next thing you don't buy."}
          </p>
        </div>
      )}
      {picked && !welcome && <p className="print-in mb-8 border-2 border-ink p-3 text-sm">{SAVED_TOAST}</p>}
      {split && !welcome && <p className="print-in mb-8 border-2 border-ink p-3 text-sm">Split saved. Your next no divides the new way.</p>}
      {carrot && !welcome && (
        <p className="print-in mb-8 border-2 border-ink p-3 text-sm">{carrot === "funded" ? "Carrot saved, and it's already funded. Go get it." : "Carrot saved."}</p>
      )}
      {!user.split_set_at && !welcome && (
        <Link href="/setup/split" className="mb-8 block border-2 border-ink bg-receipt p-4 text-sm">
          <span className="font-bold">New: choose how each no splits.</span> You&apos;re on {s.split.carrot}/{s.split.savings}/{s.split.give} for now.{" "}
          <span className="underline">Choose yours →</span>
        </Link>
      )}

      {/* Lifetime */}
      <section className="receipt p-6 sm:p-8">
        <p className="type text-sm text-ink-2">{s.lifetime.since ? `Since ${prettyDate(String(s.lifetime.since).slice(0, 10))}` : "Your ledger"}</p>
        <p className="display mt-3 flex flex-wrap items-center gap-x-4 text-6xl leading-[0.9] sm:text-8xl">
          <span>No</span>
          <span className="cutout-hot inline-block -rotate-1 px-3">{s.lifetime.count}</span>
          <span className="text-4xl sm:text-6xl">times.</span>
        </p>
        <p className="display mt-4 text-3xl sm:text-4xl">{usd(s.lifetime.skipped)} not spent.</p>
        <p className="mt-5 text-sm">
          Every no splits {s.split.carrot}/{s.split.savings}/{s.split.give}.{" "}
          <Link href="/setup/split" className="underline decoration-2 underline-offset-4">Change</Link>
        </p>
      </section>

      {/* The three buckets */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Bucket
          label={`${s.goal?.label ?? "The carrot"} · ${s.split.carrot}%`}
          value={usd(s.goal?.saved ?? s.held)}
          meter={s.goal ? <Meter pct={s.goal.pct} bucket="carrot" label={`Progress toward ${s.goal.label}`} /> : null}
          sub={
            funded
              ? `Funded. Pick your next one${s.held > 0 ? ` (${usd(s.held)} waiting)` : ""}.`
              : s.goal
                ? `of ${usd(s.goal.target_cents)} · ${s.goal.pct}%`
                : s.held > 0 ? `${usd(s.held)} waiting for a carrot.` : "No carrot yet."
          }
          badge={funded ? "Funded" : null}
          action={
            <Link href="/setup/carrot" className="btn w-full">
              {s.goal && !funded ? "Edit carrot" : "Pick a carrot"}
            </Link>
          }
        />
        <Bucket
          label={`Savings · ${s.split.savings}%`}
          value={usd(s.savings.total)}
          meter={s.savings.target ? <Meter pct={s.savings.pct ?? 0} bucket="savings" label="Progress toward savings target" /> : null}
          sub={s.savings.target ? `of ${usd(s.savings.target)} · ${s.savings.pct}%` : "No target set"}
          action={!s.savings.target ? <Link href="/setup/split" className="text-sm underline decoration-2 underline-offset-4">Set a target</Link> : null}
        />
        <Bucket
          label={`Giving · ${s.split.give}%`}
          value={usd(s.lifetime.pledged)}
          meter={<Meter pct={givenPct} bucket="give" label="Share of pledges sent" />}
          sub={`${usd(s.lifetime.donated, { always2: true })} sent${owedTotal > 0 ? ` · ${usd(owedTotal, { always2: true })} to send` : ""}`}
          action={owedTotal > 0 ? <OpenLink target="send" className="btn btn-hot w-full">Send the difference</OpenLink> : null}
        />
      </section>

      {s.lifetime.count > 0 && (
        <section className="mt-14">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="display text-2xl">Running total</h2>
            <span className="type text-xs text-ink-2">by week</span>
          </div>
          <div className="mt-8">
            <ProgressChart weeks={s.weeks} baseline={s.baseline} names={names} />
          </div>
        </section>
      )}

      <section className="mt-12 flex items-baseline justify-between gap-4 border-y-2 border-ink py-4">
        <h2 className="display text-xl">Issue {String(issue).padStart(2, "0")}</h2>
        {sunday ? (
          <Link href={`/issue/${week}`} className="text-sm underline decoration-2 underline-offset-4">Read this week&apos;s →</Link>
        ) : (
          <span className="type text-sm text-ink-2">prints Sunday</span>
        )}
      </section>

      <section className="mt-6 space-y-3">
        {owed.length > 0 && (
          <Drop id="send" title="Send the difference" meta={usd(owedTotal, { always2: true })}>
            <p className="text-sm text-ink-2">Each button opens Every.org with the amount filled in. You give directly; we never hold your money.</p>
            <ul className="mt-3 divide-y-2 divide-dashed divide-ink">
              {owed.map(([slug, cents]) => {
                const c = CHARITIES[slug];
                const impact = impactLine(c, cents);
                return (
                  <li key={slug} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-xs text-ink-2">{c.cause}{impact ? ` · ${impact}` : ""}</p>
                    </div>
                    <SettleButton charity={slug} cents={cents} />
                  </li>
                );
              })}
            </ul>
          </Drop>
        )}

        {cats.length > 0 && (
          <Drop title="What you say no to">
            <CategoryBars rows={cats} />
            {s.lifetime.biggest && (
              <p className="mt-4 text-sm text-ink-2">Biggest no: <span className="font-bold text-ink">{s.lifetime.biggest.item}</span> ({usd(s.lifetime.biggest.price_cents)})</p>
            )}
          </Drop>
        )}

        <Drop title="Recent no's" meta={s.thisWeek.count ? `${s.thisWeek.count} this week` : undefined}>
          {s.recent.length === 0 ? (
            <p className="text-sm text-ink-2">Nothing yet. Text the next thing you don&apos;t buy.</p>
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
        </Drop>

        <Drop title="Your charities">
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
        </Drop>

        <Drop title="Text messages" meta={user.sms_consent ? "on" : "off"}>
          <TextsToggle on={Boolean(user.sms_consent)} />
        </Drop>

        <Drop title="Start with a clean slate">
          <ClearSlate unsent={owedTotal > 0 ? usd(owedTotal, { always2: true }) : null} />
        </Drop>

        {!user.sms_consent && !demoMode() && (
          <Drop title="Log a no without texting">
            <QuickLog />
          </Drop>
        )}
      </section>
    </main>
  );
}

function Bucket({ label, value, meter, sub, action, badge }: { label: string; value: string; meter: React.ReactNode; sub: string; action?: React.ReactNode; badge?: string | null }) {
  return (
    <div className="flex flex-col border-2 border-ink bg-paper p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="type truncate text-sm text-ink-2">{label}</p>
        {badge && <span className="cutout px-1.5 text-xs uppercase tracking-wider">{badge}</span>}
      </div>
      <p className="display mt-2 text-4xl">{value}</p>
      <div className="mt-4">{meter ?? <div className="h-4 border-2 border-dashed border-ink-3" />}</div>
      <p className="mt-2 text-sm text-ink-2">{sub}</p>
      {action && <div className="mt-auto pt-4">{action}</div>}
    </div>
  );
}

function Drop({ id, title, meta, children }: { id?: string; title: string; meta?: string; children: React.ReactNode }) {
  return (
    <details id={id} className="group scroll-mt-6 border-2 border-ink bg-paper">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span className="font-bold">{title}</span>
        <span className="flex items-center gap-3 text-sm text-ink-2">
          {meta}
          <span aria-hidden className="display text-xl leading-none text-ink transition-transform group-open:rotate-45">+</span>
        </span>
      </summary>
      <div className="border-t-2 border-ink p-4">{children}</div>
    </details>
  );
}
