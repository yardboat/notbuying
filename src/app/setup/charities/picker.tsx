"use client";
import { useState } from "react";
import type { CharityOption } from "@/lib/charity-options";
import { SAVE_LABEL, SAVED_TOAST, SKIP_LABEL, TAG_LABELS } from "@/lib/copy-charities";

type Cat = { key: string; label: string; intro: string; options: CharityOption[] };

const TILT = [-0.8, 0.5, -0.3];

export default function Picker({ categories, initial, next, onboarding }: { categories: Cat[]; initial: Record<string, string>; next: string; onboarding: boolean }) {
  const [picks, setPicks] = useState<Record<string, string>>(initial);
  const custom = categories.filter((c) => picks[c.key] && picks[c.key] !== c.options[0].slug).length;
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function choose(cat: string, slug: string) {
    setPicks((p) => ({ ...p, [cat]: slug }));
    setTouched((t) => new Set(t).add(cat));
  }

  async function save(defaults = false) {
    setBusy(true);
    const res = await fetch("/api/charities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaults ? { defaults: true } : { picks }),
    });
    if (!res.ok) {
      setBusy(false);
      setToast("Couldn't save. Try again.");
      return;
    }
    setToast(SAVED_TOAST);
    setTimeout(() => (window.location.href = next), 900);
  }

  return (
    <>
      <div className="space-y-16">
        {categories.map((cat, ci) => (
          <fieldset key={cat.key} className="min-w-0">
            <legend className="w-full">
              <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-2">
                <span className="display text-2xl sm:text-3xl">
                  <span className="type mr-3 align-middle text-sm text-ink-2">{String(ci + 1).padStart(2, "0")}</span>
                  {cat.label}
                </span>
                {touched.has(cat.key) && <span className="type text-xs text-ink-2">picked</span>}
              </div>
              <p className="mt-3 text-base text-ink-2">{cat.intro}</p>
            </legend>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {cat.options.map((o, i) => {
                const on = picks[cat.key] === o.slug;
                const id = `${cat.key}-${o.slug}`;
                return (
                  <label
                    key={o.slug}
                    htmlFor={id}
                    className={`pick-card receipt relative flex cursor-pointer flex-col p-5 transition-transform duration-150 ${on ? "is-on" : ""}`}
                    style={{ ["--tilt" as string]: `${TILT[i]}deg` }}
                  >
                    <input
                      id={id}
                      type="radio"
                      name={cat.key}
                      value={o.slug}
                      checked={on}
                      onChange={() => choose(cat.key, o.slug)}
                      className="sr-only"
                    />
                    <span className={`type self-start px-2 py-0.5 text-xs uppercase tracking-[0.12em] ${i === 0 ? "bg-ink text-paper" : i === 1 ? "bg-hot text-ink" : "border-2 border-ink"}`}>
                      {TAG_LABELS[o.tag]}
                    </span>
                    <span className="display mt-4 text-2xl leading-[0.95]">{o.name}</span>
                    <span className="mt-3 flex-1 text-[15px] leading-snug">{o.why}</span>
                    <span className="type mt-4 text-xs text-ink-2">
                      {o.cause}
                      {o.impact ? ` · $1 ≈ ${Math.round(100 / o.impact.centsPerUnit)} ${o.impact.unit}s` : ""}
                    </span>
                    {on && <span className="stamp slap pointer-events-none absolute -top-3 right-3 bg-[#fbf9f3] text-sm">Picked</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4">
          <p className="type text-xs text-ink-2 sm:text-sm" aria-live="polite">
            {toast ?? (
              <>
                {custom} of {categories.length} off the obvious pick<span className="hidden sm:inline"> · change any card, any time</span>
              </>
            )}
          </p>
          <div className="flex gap-3">
            {onboarding && (
              <button onClick={() => save(true)} disabled={busy} className="flex-1 border-2 border-ink px-3 py-2 text-xs underline-offset-4 hover:underline sm:flex-none sm:px-4 sm:py-3 sm:text-sm">
                {SKIP_LABEL}
              </button>
            )}
            <button onClick={() => save(false)} disabled={busy} className="btn btn-hot flex-1 py-2 text-sm sm:flex-none sm:py-[0.95rem] sm:text-base">
              {busy ? "Locking in…" : SAVE_LABEL}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
