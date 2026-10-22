import Link from "next/link";
import { currentUserId } from "@/lib/session";
import { demoMode } from "@/lib/env";
import Signup from "./signup";
import Reveal from "./reveal";
import { BRAND_NAME } from "@/lib/brand";

export default async function Home() {
  const signedIn = Boolean(await currentUserId());

  return (
    <main className="overflow-x-hidden">
      {/* TEMP (TFV): Not Buying logo + intro disabled while the brand is "Donate the Difference". See src/lib/brand.ts. */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-xs uppercase tracking-[0.18em] sm:px-6">
        <Link href="/" aria-label={`${BRAND_NAME}, home`} className="type text-sm normal-case tracking-normal">
          {BRAND_NAME}
        </Link>
        {signedIn ? (
          <Link href="/dashboard" className="underline decoration-2 underline-offset-4">Your dashboard →</Link>
        ) : (
          <a href="#start" className="underline decoration-2 underline-offset-4">Start</a>
        )}
      </header>

      {/* 01 — the machine */}
      <section className="mx-auto flex min-h-[88dvh] max-w-5xl flex-col justify-center px-4 pb-16 sm:px-6">
        <p className="type mb-6 text-sm text-ink-2">Issue 00 · a manifesto in five cuts</p>
        <h1 className="display text-[clamp(2.5rem,calc(14vw-5px),8.5rem)]">
          <span className="hero-cut block" style={{ ["--cut-d" as string]: "0ms", ["--cut-r" as string]: "-2deg" }}>Every</span>
          {/* NO sits outside its line's cut so the intro's dot can land on it and become it. */}
          <span className="block">
            <span className="cutout-hot hero-no">no</span>{" "}
            <span className="hero-cut inline-block" style={{ ["--cut-d" as string]: "90ms", ["--cut-r" as string]: "1.5deg" }}>is a</span>
          </span>
          <span className="hero-cut block" style={{ ["--cut-d" as string]: "180ms", ["--cut-r" as string]: "-1deg" }}>yes to</span>
          <span className="hero-cut block" style={{ ["--cut-d" as string]: "270ms", ["--cut-r" as string]: "2deg" }}>something.</span>
        </h1>
        <p className="mt-10 max-w-md text-base leading-relaxed text-ink-2">Scroll. It takes about a minute. Then you get a number to text.</p>
      </section>

      <Reveal>
        <section className="border-y-2 border-ink bg-ink px-4 py-20 text-paper sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="type text-sm opacity-70">01 · the machine</p>
            <h2 className="display mt-4 text-5xl sm:text-7xl">Somebody spent real money today making you want a croissant.</h2>
            <div className="mt-10 grid gap-6 text-lg sm:grid-cols-3">
              {["Points for spending.", "Cashback for spending.", "Round-ups for spending."].map((t, i) => (
                <p key={t} className="border-t-2 border-paper/40 pt-3" style={{ transform: `rotate(${[-1, 0.6, -0.4][i]}deg)` }}>
                  {t}
                </p>
              ))}
            </div>
            <p className="mt-10 max-w-xl text-lg leading-relaxed opacity-80">
              Every app on your phone has a reward for buying the thing. The whole economy is tuned to the moment you tap.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
          <p className="type text-sm text-ink-2">02 · the flip</p>
          <h2 className="display mt-4 text-6xl sm:text-8xl">
            Nobody rewards
            <br />
            you for <span className="cutout">not.</span>
          </h2>
          <p className="mt-8 max-w-lg text-lg leading-relaxed">
            Walking past the bakery. Closing the tab with the sneakers in the cart. Skipping the third round. Those are choices too. They just never show up anywhere.
          </p>
          <p className="stamp slap mt-10 text-2xl">Until now</p>
        </section>
      </Reveal>

      <Reveal>
        <section className="bg-paper-2 px-4 py-24 sm:px-6">
          <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
            <div>
              <p className="type text-sm text-ink-2">03 · how it works</p>
              <h2 className="display mt-4 text-5xl sm:text-6xl">Text what you didn&apos;t buy.</h2>
              <ol className="mt-8 space-y-4 text-lg leading-relaxed">
                <li><span className="font-bold">1.</span> Pick one thing you actually want. A bike. A trip. A guitar.</li>
                <li><span className="font-bold">2.</span> Every time you skip something, text it with the price.</li>
                <li><span className="font-bold">3.</span> The full amount counts toward your thing. <span className="bg-hot px-1 text-hot-ink">10% gets pledged</span> to a charity matched to what you skipped.</li>
                <li><span className="font-bold">4.</span> Sunday, your issue drops. One tap and the week&apos;s pledges go out.</li>
              </ol>
            </div>
            <PhoneDemo />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
          <p className="type text-sm text-ink-2">04 · the math</p>
          <h2 className="display mt-4 text-5xl sm:text-7xl">One no. Two yeses.</h2>
          <div className="mt-12 grid gap-px border-2 border-ink bg-ink sm:grid-cols-2">
            <div className="bg-paper p-6">
              <p className="type text-sm text-ink-2">yes to you</p>
              <p className="display mt-3 text-4xl">+$5 toward the bike</p>
              <p className="mt-3 text-ink-2">The whole price you didn&apos;t spend moves your goal.</p>
            </div>
            <div className="bg-paper p-6">
              <p className="type text-sm text-ink-2">yes to someone else</p>
              <p className="display mt-3 text-4xl">$0.50 to food access</p>
              <p className="mt-3 text-ink-2">Croissant, Feeding America. Rideshare, Water.org. Sneakers, Dress for Success.</p>
            </div>
          </div>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-ink-2">
            We never touch your money. Pledges stack up in your ledger. On Sunday you give them yourself through Every.org.
          </p>
        </section>
      </Reveal>

      <section id="start" className="border-t-2 border-ink px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-xl">
          <p className="type text-sm text-ink-2">05 · your one thing</p>
          <h2 className="display mt-4 text-5xl sm:text-6xl">What are you saying yes to?</h2>
          <div className="mt-10">
            <Signup signedIn={signedIn} demo={demoMode()} />
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-5xl flex-wrap gap-x-6 gap-y-2 px-4 py-10 text-xs text-ink-2 sm:px-6">
        <span>© Yardboat LLC</span>
        <Link href="/sms" className="underline">SMS terms</Link>
        <Link href="/legal/privacy" className="underline">Privacy</Link>
        <Link href="/legal/terms" className="underline">Terms</Link>
      </footer>
    </main>
  );
}

function PhoneDemo() {
  return (
    <div className="mx-auto w-full max-w-sm rotate-[1.2deg] border-2 border-ink bg-paper p-4 shadow-[8px_8px_0_var(--ink)]">
      <p className="type mb-4 text-center text-xs text-ink-2">Text message · now</p>
      <div className="space-y-3 text-[15px] leading-snug">
        <div className="ml-auto w-fit max-w-[80%] bg-ink px-3 py-2 text-paper">croissant 5</div>
        <div className="w-fit max-w-[88%] border-2 border-ink bg-paper px-3 py-2">
          No croissant. +$5. Bike: $155 of $500 (31%). $0.50 pledged to Feeding America (~5 meals). Somewhere an ad budget just wept.
        </div>
        <div className="ml-auto w-fit max-w-[80%] bg-ink px-3 py-2 text-paper">uber 18</div>
        <div className="w-fit max-w-[88%] border-2 border-ink bg-paper px-3 py-2">
          No uber. +$18. Bike: $173 of $500 (34%). $1.80 pledged to Water.org. Intent 1, impulse 0.
        </div>
      </div>
    </div>
  );
}
