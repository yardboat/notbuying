import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { usd } from "@/lib/money";
import { publicIssue } from "./data";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ shareId: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = await publicIssue((await params).shareId);
  if (!d) return { title: "Donate the Difference", robots: { index: false } };
  const title = `${d.who} said no ${d.count} time${d.count === 1 ? "" : "s"} this week · Issue ${d.issue}`;
  const description = `${usd(d.kept)} kept. ${usd(d.pledged, { always2: true })} to give. Every no is a yes to something.`;
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Public, viewer-safe issue: first name only, no phone, no account links.
export default async function PublicIssuePage({ params }: P) {
  const { shareId } = await params;
  const d = await publicIssue(shareId);
  if (!d) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <p className="type text-center text-xs text-ink-2">A page from someone&apos;s week</p>

      <article className="receipt print-in relative mt-6 overflow-hidden p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="type text-xs">Donate the Difference</p>
            <p className="type text-xs text-ink-2">{d.range}</p>
          </div>
          <p className="display text-right text-5xl leading-none">
            <span className="block text-xs tracking-[0.2em]">Issue</span>
            {d.issue}
          </p>
        </div>

        <div className="rule mt-5 pt-5">
          <p className="type text-sm text-ink-2">{d.who} said</p>
          <p className="display text-7xl leading-[0.85]">
            no <span className="cutout-hot !bg-hot-deep !text-hot-deep-ink">{d.count}</span>
          </p>
          <p className="display text-3xl">time{d.count === 1 ? "" : "s"} this week.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-px border-2 border-ink bg-ink">
          <div className="bg-receipt p-3">
            <p className="type text-xs text-ink-2">kept</p>
            <p className="display text-3xl">{usd(d.kept)}</p>
          </div>
          <div className="bg-receipt p-3">
            <p className="type text-xs text-ink-2">to give</p>
            <p className="display text-3xl">{usd(d.pledged, { always2: true })}</p>
          </div>
        </div>

        {d.biggest && (
          <p className="mt-6 text-sm">
            Biggest no: <span className="bg-ink px-1 text-paper">{d.biggest.item}</span> ({usd(d.biggest.cents)})
          </p>
        )}

        {d.cats.length > 0 && (
          <ul className="rule-dash mt-5 space-y-1 pt-4 text-sm">
            {d.cats.map((c) => (
              <li key={c.label} className="flex justify-between">
                <span>{c.label} × {c.count}</span>
                <span>{usd(c.cents)}</span>
              </li>
            ))}
          </ul>
        )}

        {d.charities.length > 0 && (
          <ul className="rule-dash mt-4 space-y-1 pt-4 text-sm">
            {d.charities.map((c) => (
              <li key={c.name} className="flex justify-between gap-3">
                <span>→ {c.name}{c.impact ? ` (${c.impact})` : ""}</span>
                <span>{usd(c.cents, { always2: true })}</span>
              </li>
            ))}
          </ul>
        )}

        {d.goal && (
          <div className="rule mt-5 pt-4">
            <p className="type text-xs text-ink-2">saying yes to</p>
            <p className="display text-2xl">{d.goal.label}: {d.goal.pct}%</p>
            <div className="mt-2 h-3 border-2 border-ink" role="img" aria-label={`${d.goal.pct}% of the way`}>
              <div className="h-full bg-hot" style={{ width: `${d.goal.pct}%` }} />
            </div>
          </div>
        )}

        <p className="stamp absolute right-4 bottom-6 text-sm">every no is a yes</p>
        <div className="h-10" />
      </article>

      <Link href="/" className="btn btn-hot mt-10 w-full text-lg">Start your own →</Link>
      <p className="mt-3 text-center text-xs text-ink-2">
        Text what you didn&apos;t buy. It builds toward what you want, and 10% goes to someone who needs it more.
      </p>
      <p className="mt-6 text-center text-xs">
        <a href={`/i/${shareId}/portrait`} className="underline decoration-2 underline-offset-4" download={`issue-${d.issue}.png`}>
          Save the portrait card
        </a>
      </p>
    </main>
  );
}
