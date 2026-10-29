import Link from "next/link";
import { redirect } from "next/navigation";
import { activeGoal, goalSaved, heldCarrot } from "@/lib/ledger";
import { usd } from "@/lib/money";
import { currentUserId } from "@/lib/session";
import CarrotForm from "./carrot-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your carrot · Not Buying" };

export default async function CarrotSetup({ searchParams }: { searchParams: Promise<{ fresh?: string }> }) {
  const uid = await currentUserId();
  if (!uid) redirect("/#start");
  const { fresh } = await searchParams;
  const goal = await activeGoal(uid);
  const editing = goal && !goal.reached_at;
  const saved = editing ? await goalSaved(Number(goal.id)) : 0;
  const held = editing ? 0 : await heldCarrot(uid);

  const title = fresh ? "Clean slate. What now?" : editing ? "Edit your carrot." : "Pick your next carrot.";
  const note = fresh
    ? "Everything's back to zero. Your split, charities and text settings are just as you left them."
    : editing
      ? `Change the name or the price. The ${usd(saved)} you've put toward it stays with it.`
      : held > 0
        ? `${usd(held)} has been waiting for this. It moves straight in.`
        : "Every no from here builds toward it.";

  return (
    <main className="mx-auto max-w-xl px-4 pb-24 sm:px-6">
      <header className="flex items-center justify-between py-4 text-xs uppercase tracking-[0.18em]">
        <Link href="/" className="type text-sm normal-case tracking-normal">Not Buying</Link>
        <Link href="/dashboard" className="underline decoration-2 underline-offset-4">Dashboard</Link>
      </header>
      <section className="pt-6 pb-10">
        <p className="type text-sm text-ink-2">Your carrot</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">{title}</h1>
        <p className="mt-6 text-lg leading-relaxed">{note}</p>
      </section>
      <CarrotForm
        label={editing ? goal.label : ""}
        amount={editing ? String(Number(goal.target_cents) / 100) : ""}
        cta={editing ? "Save changes →" : "Set my carrot →"}
      />
    </main>
  );
}
