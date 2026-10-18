"use client";
import Link from "next/link";
import { useState } from "react";

export default function Signup({ signedIn }: { signedIn: boolean }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [step, setStep] = useState<"form" | "code">("form");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({ goalLabel: "", goalAmount: "", name: "", phone: "", consent: false, code: "" });

  if (signedIn) {
    return (
      <Link href="/dashboard" className="btn btn-hot w-full">
        Back to your dashboard →
      </Link>
    );
  }

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const payload = { ...f, consent: f.consent ? "yes" : "no", mode };
    const res = await fetch(step === "form" ? "/api/signup" : "/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error ?? "Something broke. Try again.");
    if (data.verify) return setStep("code");
    window.location.href = data.next ?? "/dashboard";
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      {mode === "signup" && step === "form" && (
        <>
          <label className="block">
            <span className="type text-sm text-ink-2">The thing</span>
            <input className="field" required placeholder="a bike" value={f.goalLabel} onChange={set("goalLabel")} maxLength={60} />
          </label>
          <label className="block">
            <span className="type text-sm text-ink-2">What it costs</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl">$</span>
              <input className="field" required inputMode="decimal" placeholder="500" value={f.goalAmount} onChange={set("goalAmount")} />
            </div>
          </label>
          <label className="block">
            <span className="type text-sm text-ink-2">First name (optional)</span>
            <input className="field" placeholder="Randall" value={f.name} onChange={set("name")} maxLength={40} autoComplete="given-name" />
          </label>
        </>
      )}

      {step === "form" && (
        <>
          <label className="block">
            <span className="type text-sm text-ink-2">Mobile number</span>
            <input className="field" required type="tel" inputMode="tel" placeholder="(404) 555-0134" value={f.phone} onChange={set("phone")} autoComplete="tel" />
          </label>
          <label className="flex gap-3 text-sm leading-relaxed">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--hot)]" checked={f.consent} onChange={set("consent")} required />
            <span>
              Text me receipts and a weekly recap from Donate the Difference. Message frequency varies with how often you text us. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. See{" "}
              <Link href="/sms" className="underline">SMS terms</Link> and <Link href="/legal/privacy" className="underline">Privacy</Link>.
            </span>
          </label>
        </>
      )}

      {step === "code" && (
        <label className="block">
          <span className="type text-sm text-ink-2">We texted you a 6-digit code</span>
          <input className="field tracking-[0.4em]" required inputMode="numeric" maxLength={6} value={f.code} onChange={set("code")} autoFocus />
        </label>
      )}

      {err && <p className="border-l-4 border-hot pl-3 text-sm">{err}</p>}

      <button className="btn btn-hot w-full text-lg" disabled={busy}>
        {busy ? "Printing…" : step === "code" ? "Verify" : mode === "signup" ? "Get my number →" : "Sign in →"}
      </button>

      <p className="text-center text-sm text-ink-2">
        {mode === "signup" ? (
          <button type="button" className="underline" onClick={() => { setMode("login"); setStep("form"); setErr(null); }}>
            Already in? Sign in with your number
          </button>
        ) : (
          <button type="button" className="underline" onClick={() => { setMode("signup"); setStep("form"); setErr(null); }}>
            New here? Start from the top
          </button>
        )}
      </p>
    </form>
  );
}
