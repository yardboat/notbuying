"use client";
import { useState } from "react";

// Plain web logging for people who chose not to get texts (texting stays optional).
export default function QuickLog() {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/sim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      const data = await res.json().catch(() => ({}));
      setReply(res.ok ? String(data.reply ?? "").replace(/^Not Buying: /, "") : "Something broke. Try again.");
      if (res.ok) {
        setBody("");
        setTimeout(() => window.location.reload(), 1600);
      }
    } catch {
      setReply("Couldn't reach us. Try again.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={send} className="space-y-3">
      <label className="block">
        <span className="type text-sm text-ink-2">What you didn&apos;t buy, and the price</span>
        <input className="field" placeholder="takeout 25" value={body} onChange={(e) => setBody(e.target.value)} maxLength={160} />
      </label>
      <button className="btn" disabled={busy}>{busy ? "Logging…" : "Log it"}</button>
      {reply && <p className="text-sm" role="status">{reply}</p>}
    </form>
  );
}
