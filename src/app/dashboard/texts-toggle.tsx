"use client";
import Link from "next/link";
import { useState } from "react";
import { SMS_CONSENT_TEXT } from "@/lib/consent";

export default function TextsToggle({ on: initial }: { on: boolean }) {
  const [on, setOn] = useState(initial);
  const [ticked, setTicked] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function call(url: string, body: object) {
    setBusy(true);
    setMsg(null);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(data.error ?? "Something broke. Try again."); return null; }
    return data;
  }

  async function turnOn() {
    const d = await call("/api/sms-consent", { on: true });
    if (!d) return;
    if (d.verifySms) setCode("");
    else { setOn(true); setMsg("Texts are on."); }
  }
  async function turnOff() {
    const d = await call("/api/sms-consent", { on: false });
    if (d) { setOn(false); setTicked(false); setMsg("Texts are off. You can still log here."); }
  }
  async function verify() {
    const d = await call("/api/verify", { code });
    if (d) { setOn(true); setCode(null); setMsg("Texts are on."); }
  }

  return (
    <section aria-label="Text messages">
      {on ? (
        <div className="mt-3 space-y-3 text-sm">
          <p>Texts are on. Reply STOP to any message, or turn them off here.</p>
          <button className="btn" disabled={busy} onClick={turnOff}>Turn texts off</button>
        </div>
      ) : code !== null ? (
        <div className="mt-3 space-y-3 text-sm">
          <label className="block">
            <span className="type text-ink-2">We texted you a 6-digit code</span>
            <input className="field tracking-[0.4em]" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <button className="btn btn-hot" disabled={busy} onClick={verify}>Turn on texts</button>
        </div>
      ) : (
        <div className="mt-3 space-y-3 text-sm leading-relaxed">
          <label className="flex gap-3">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--hot)]" checked={ticked} onChange={(e) => setTicked(e.target.checked)} />
            <span>{SMS_CONSENT_TEXT}</span>
          </label>
          <button className="btn btn-hot" disabled={busy || !ticked} onClick={turnOn}>Turn on texts</button>
          <p className="text-xs text-ink-2"><Link href="/sms" className="underline">SMS terms</Link> · <Link href="/privacy" className="underline">Privacy</Link></p>
        </div>
      )}
      {msg && <p className="mt-3 text-sm" role="status">{msg}</p>}
    </section>
  );
}
