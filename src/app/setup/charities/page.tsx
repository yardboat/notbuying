import Link from "next/link";
import { redirect } from "next/navigation";
import { CATEGORY_LABEL } from "@/lib/charities";
import { CHARITY_OPTIONS, PICK_CATEGORIES, defaultPick } from "@/lib/charity-options";
import { CATEGORY_INTROS, PICK_INTRO, PICK_TITLE } from "@/lib/copy-charities";
import { charityPicks } from "@/lib/ledger";
import { currentUserId } from "@/lib/session";
import Picker from "./picker";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pick your charities · Not Buying" };

export default async function PickCharities({ searchParams }: { searchParams: Promise<{ onboarding?: string }> }) {
  const uid = await currentUserId();
  if (!uid) redirect("/#start");
  const { onboarding } = await searchParams;
  const saved = await charityPicks(uid);
  const initial = Object.fromEntries(PICK_CATEGORIES.map((c) => [c, saved[c] ?? defaultPick(c)]));
  const categories = PICK_CATEGORIES.map((c) => ({ key: c, label: CATEGORY_LABEL[c], intro: CATEGORY_INTROS[c], options: CHARITY_OPTIONS[c] }));

  return (
    <main className="mx-auto max-w-5xl px-4 pb-40 sm:px-6" style={{ scrollPaddingBottom: 160 }}>
      <header className="flex items-center justify-between py-4 text-xs uppercase tracking-[0.18em]">
        <Link href="/" className="type text-sm normal-case tracking-normal">Not Buying</Link>
        {!onboarding && <Link href="/dashboard" className="underline decoration-2 underline-offset-4">Dashboard</Link>}
      </header>

      <section className="pt-6 pb-10">
        {onboarding && <p className="type text-sm text-ink-2">Step 2 of 2 · pick your charities</p>}
        <h1 className="display mt-3 text-5xl sm:text-7xl">{PICK_TITLE}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed">{PICK_INTRO}</p>
      </section>

      <Picker categories={categories} initial={initial} next={onboarding ? "/dashboard?welcome=1" : "/dashboard?picked=1"} onboarding={Boolean(onboarding)} />
    </main>
  );
}
