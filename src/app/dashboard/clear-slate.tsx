"use client";
import { useState } from "react";

export default function ClearSlate({ unsent }: { unsent: string | null }) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ready = typed.trim().toUpperCase() === "CLEAR";

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: typed }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something broke. Try again.");
      window.location.assign(data.next ?? "/dashboard");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't reach us. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Clears every no you&apos;ve logged, your carrot, your savings tally and your pledges, and starts you at zero. Your split, charities and text settings stay.
        This can&apos;t be undone.
      </p>
      {unsent && (
        <p className="border-l-4 border-hot pl-3">
          You have <span className="font-bold">{unsent}</span> in pledges you haven&apos;t sent. Send them first if you want to; clearing removes them.
        </p>
      )}
      <label className="block">
        <span className="type text-ink-2">Type CLEAR to confirm</span>
        <input className="field" value={typed} onChange={(e) => setTyped(e.target.value)} autoCapitalize="characters" autoComplete="off" />
      </label>
      <button type="button" className="btn" disabled={!ready || busy} onClick={go}>
        {busy ? "Clearing…" : "Start with a clean slate"}
      </button>
      {err && <p role="alert">{err}</p>}
    </div>
  );
}
