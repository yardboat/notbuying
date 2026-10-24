import Link from "next/link";

export default function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/" className="type text-sm">← Not Buying</Link>
      <h1 className="display mt-8 text-4xl sm:text-5xl">{title}</h1>
      <p className="type mt-2 text-sm text-ink-2">Last updated {updated}</p>
      <div className="mt-8 space-y-5 text-[15px] leading-relaxed [&_h2]:display [&_h2]:mt-10 [&_h2]:text-xl [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
      <footer className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t-2 border-ink pt-5 text-xs text-ink-2">
        <span>Not Buying by Yardboat LLC · Atlanta, GA</span>
        <a href="mailto:hello@notbuying.org" className="underline">hello@notbuying.org</a>
        <Link href="/sms" className="underline">SMS terms</Link>
        <Link href="/privacy" className="underline">Privacy</Link>
        <Link href="/terms" className="underline">Terms</Link>
      </footer>
    </main>
  );
}
