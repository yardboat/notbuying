"use client";
import Link from "next/link";
import { useState } from "react";
import { SMS_CONSENT_TEXT } from "@/lib/consent";

export default function Signup({ signedIn, demo }: { signedIn: boolean; demo: boolean }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [step, setStep] = useState<"form" | "code">("form");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [next, setNext] = useState("/dashboard");
  const [f, setF] = useState({ goalLabel: "", goalAmount: "", name: "", phone: "", pin: "", smsConsent: false, code: "", invite: "" });

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
    const res =
      step === "form"
        ? await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...f, smsConsent: f.smsConsent ? "yes" : "no", mode }),
          })
        : await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: f.code }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error ?? "Something broke. Try again.");
    if (data.verifySms) {
      setNext(data.next ?? "/dashboard");
      return setStep("code");
    }
    window.location.href = step === "code" ? next : data.next ?? "/dashboard";
  }

  return (
    <form onSubmit={submit} className="space-y-7" aria-label={mode === "signup" ? "Sign up for Not Buying" : "Sign in to Not Buying"}>
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
          <label className="block">
            <span className="type text-sm text-ink-2">{mode === "signup" ? "Choose a PIN (4-8 digits) to sign in" : "Your PIN"}</span>
            <input
              className="field tracking-[0.3em]"
              required
              type="password"
              inputMode="numeric"
              pattern="\d{4,8}"
              minLength={4}
              maxLength={8}
              value={f.pin}
              onChange={set("pin")}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>
          {demo && (
            <label className="block">
              <span className="type text-sm text-ink-2">Invite code (prototype testers only)</span>
              <input className="field" required value={f.invite} onChange={set("invite")} autoCapitalize="none" autoComplete="off" />
            </label>
          )}
          {mode === "signup" && (
            <fieldset className="border-2 border-ink p-4">
              <legend className="type px-1 text-sm">Text messages (optional)</legend>
              <label className="flex gap-3 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  name="smsConsent"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--hot)]"
                  checked={f.smsConsent}
                  onChange={set("smsConsent")}
                />
                <span>{SMS_CONSENT_TEXT}</span>
              </label>
              <p className="mt-3 text-xs text-ink-2">
                Leave it unticked and you can still use Not Buying on the web. You can turn texts on or off any time from your dashboard.{" "}
                <Link href="/sms" className="underline">SMS terms</Link>
              </p>
            </fieldset>
          )}
        </>
      )}

      {step === "code" && (
        <div className="space-y-3">
          <label className="block">
            <span className="type text-sm text-ink-2">We texted you a 6-digit code to turn on texts</span>
            <input className="field tracking-[0.4em]" required inputMode="numeric" maxLength={6} value={f.code} onChange={set("code")} autoFocus />
          </label>
          <button type="button" className="text-sm underline" onClick={() => (window.location.href = next)}>
            Skip for now (texts stay off)
          </button>
        </div>
      )}

      {err && <p className="border-l-4 border-hot pl-3 text-sm" role="alert">{err}</p>}

      <div className="space-y-3">
        <button className="btn btn-hot w-full text-lg" disabled={busy}>
          {busy ? "Printing…" : step === "code" ? "Turn on texts" : mode === "signup" ? "Create my account →" : "Sign in →"}
        </button>
        {step === "form" && mode === "signup" && (
          <p className="text-center text-xs text-ink-2">
            By creating an account you agree to the <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        )}
      </div>

      <p className="text-center text-sm text-ink-2">
        {mode === "signup" ? (
          <button type="button" className="underline" onClick={() => { setMode("login"); setStep("form"); setErr(null); }}>
            Already in? Sign in with your number and PIN
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
