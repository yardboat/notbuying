import Link from "next/link";
import { redirect } from "next/navigation";
import SplitPicker from "@/components/split/split-picker";
import { activeGoal, userById, userSplit } from "@/lib/ledger";
import { currentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your split · Not Buying" };

export default async function SplitSetup({ searchParams }: { searchParams: Promise<{ onboarding?: string }> }) {
  const uid = await currentUserId();
  if (!uid) redirect("/#start");
  const { onboarding } = await searchParams;
  const user = await userById(uid);
  const goal = await activeGoal(uid);

  return (
    <main className="mx-auto max-w-xl px-4 pb-24 sm:px-6">
      <header className="flex items-center justify-between py-4 text-xs uppercase tracking-[0.18em]">
        <Link href="/" className="type text-sm normal-case tracking-normal">Not Buying</Link>
        {!onboarding && <Link href="/dashboard" className="underline decoration-2 underline-offset-4">Dashboard</Link>}
      </header>

      <section className="pt-6 pb-10">
        {onboarding && <p className="type text-sm text-ink-2">Step 2 of 3 · your split</p>}
        <h1 className="display mt-3 text-5xl sm:text-6xl">Split every no three ways.</h1>
        <p className="mt-6 text-lg leading-relaxed">
          Each time you skip something, the money you didn&apos;t spend gets divided: some toward the thing you want, some to savings, some to charity. Change it any
          time.
        </p>
      </section>

      <SplitPicker
        initial={userSplit(user)}
        carrotLabel={goal?.label ?? null}
        savingsTarget={user?.savings_target_cents ? Number(user.savings_target_cents) : null}
        next={onboarding ? "/setup/charities?onboarding=1" : "/dashboard?split=1"}
        cta={onboarding ? "Next: pick your charities →" : "Save my split →"}
      />
    </main>
  );
}
