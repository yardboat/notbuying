import Link from "next/link";
import { currentUserId } from "@/lib/session";
import { confirmSettle } from "@/lib/settle";

export const dynamic = "force-dynamic";

export default async function Done({ searchParams }: { searchParams: Promise<{ pid?: string }> }) {
  const { pid } = await searchParams;
  const uid = await currentUserId();
  const ok = uid && pid ? await confirmSettle(uid, pid) : false;
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="stamp slap text-3xl">{ok ? "Sent" : "Hmm"}</p>
      <h1 className="display mt-8 text-5xl">{ok ? "That's the difference, donated." : "We couldn't match that donation."}</h1>
      <p className="mt-4 text-lg text-ink-2">
        {ok ? "Every no turned into a yes for someone. Back to not buying things." : "If you gave, tap \"I donated\" on your dashboard and we'll mark it."}
      </p>
      <Link href="/dashboard" className="btn mt-10">Dashboard →</Link>
    </main>
  );
}
