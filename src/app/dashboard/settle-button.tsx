"use client";
import { useState } from "react";

export default function SettleButton({ charity, cents }: { charity: string; cents: number }) {
  const [busy, setBusy] = useState(false);
  const [pid, setPid] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const amount = `$${(cents / 100).toFixed(2)}`;

  if (cents < 100) return <span className="text-right text-xs text-ink-2">{amount}<br />rolls over at $1</span>;

  async function go() {
    setBusy(true);
    setMsg(null);
    // Open the tab inside the tap so iOS Safari doesn't treat it as a popup, then point it at Every.org.
    const win = window.open("about:blank", "_blank");
    const res = await fetch("/api/settle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ charity }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      win?.close();
      return setMsg(data.error ?? "Try again");
    }
    if (win) win.location.href = data.url;
    else window.location.href = data.url; // popup blocked: go in this tab; success_url brings them back
    setPid(data.pid);
  }

  async function confirm() {
    setBusy(true);
    await fetch("/api/settle", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pid }) });
    window.location.reload();
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      {!pid ? (
        <button onClick={go} disabled={busy} className="btn btn-hot px-4 py-2 text-sm">Send {amount}</button>
      ) : (
        <button onClick={confirm} disabled={busy} className="btn px-4 py-2 text-sm">I donated ✓</button>
      )}
      {msg && <span className="text-xs">{msg}</span>}
    </div>
  );
}
