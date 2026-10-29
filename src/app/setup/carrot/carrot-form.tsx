"use client";
import { useState } from "react";

export default function CarrotForm({ label, amount, cta }: { label: string; amount: string; cta: string }) {
  const [f, setF] = useState({ label, amount });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/carrot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something broke. Try again.");
      window.location.assign(data.funded ? "/dashboard?carrot=funded" : "/dashboard?carrot=1");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't reach us. Try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-7">
      <label className="block">
        <span className="type text-sm text-ink-2">The thing</span>
        <input className="field" required placeholder="a bike" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} maxLength={60} />
      </label>
      <label className="block">
        <span className="type text-sm text-ink-2">What it costs</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl">$</span>
          <input className="field" required inputMode="decimal" placeholder="500" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        </div>
      </label>
      {err && <p className="border-l-4 border-hot pl-3 text-sm" role="alert">{err}</p>}
      <button className="btn btn-hot w-full text-lg" disabled={busy}>{busy ? "Saving…" : cta}</button>
    </form>
  );
}
