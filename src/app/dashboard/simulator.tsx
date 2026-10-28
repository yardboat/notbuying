"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Msg = { direction: "in" | "out"; body: string; media_url?: string | null };

const SUGGEST = ["takeout 25", "uber 18", "new sneakers 120", "totals", "undo"];

export default function Simulator({ live, number }: { live: boolean; number: string | null }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/sim").then((r) => r.json()).then((d) => setMsgs(d.messages ?? [])).catch(() => {});
  }, []);
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight; // scroll the thread, never the page
  }, [msgs, busy]);

  async function send(body: string) {
    if (!body.trim() || busy) return;
    setMsgs((m) => [...m, { direction: "in", body }]);
    setText("");
    setBusy(true);
    try {
      const res = await fetch("/api/sim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.assign("/#start");
        return;
      }
      if (!res.ok) throw new Error();
      if (data.reply) setMsgs((m) => [...m, { direction: "out", body: data.reply }]);
      router.refresh();
    } catch {
      setMsgs((m) => [...m, { direction: "out", body: "Couldn't send that. Check your connection and try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-2 border-ink bg-paper shadow-[8px_8px_0_var(--ink)]">
      <div className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
        <p className="display text-lg">Text it</p>
        <p className="type text-xs text-ink-2">{live && number ? `or text ${number}` : "simulator · real SMS soon"}</p>
      </div>
      <div ref={box} className="h-[46dvh] min-h-72 space-y-3 overflow-y-auto p-4 text-[15px] leading-snug" aria-live="polite">
        {msgs.length === 0 && (
          <p className="type text-sm text-ink-2">Didn&apos;t buy something today? Type it with the price. Try: takeout 25</p>
        )}
        {msgs.map((m, i) =>
          m.direction === "in" ? (
            <div key={i} className="ml-auto w-fit max-w-[80%] bg-ink px-3 py-2 text-paper">{m.body}</div>
          ) : (
            <div key={i} className="print-in w-fit max-w-[90%]">
              {m.media_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.media_url.replace(/^https?:\/\/[^/]+/, "")} alt="Your weekly issue card" className="mb-1 block w-56 border-2 border-ink" loading="lazy" />
              )}
              <div className="border-2 border-ink px-3 py-2">{m.body}</div>
            </div>
          ),
        )}
        {busy && <div className="type w-fit border-2 border-dashed border-ink px-3 py-2 text-sm">printing receipt…</div>}
      </div>
      <div className="flex flex-wrap gap-2 border-t-2 border-dashed border-ink px-4 py-2">
        {SUGGEST.map((s) => (
          <button key={s} onClick={() => send(s)} className="border border-ink px-2 py-0.5 text-xs hover:bg-ink hover:text-paper">{s}</button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex border-t-2 border-ink">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="what didn't you buy?"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base focus:bg-[rgba(0,0,0,0.04)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-3px]"
          aria-label="Message"
        />
        <button className="display border-l-2 border-ink bg-hot px-5 text-hot-ink" disabled={busy}>Send</button>
      </form>
    </div>
  );
}
