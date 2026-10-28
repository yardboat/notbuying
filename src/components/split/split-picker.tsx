"use client";
import { useRef, useState } from "react";
import { MIN_GIVE, PRESETS, STEP, nudge, splitCents, validSplit, type Split } from "@/lib/split";
import { FILL } from "./fills";

type Props = {
  initial: Split;
  carrotLabel: string | null;
  savingsTarget: number | null; // cents
  savingsLabel: string | null;
  next: string;
  cta: string;
};

const snap = (v: number) => Math.round(v / STEP) * STEP;
const money = (c: number) => `$${(c / 100).toFixed(2)}`;

export default function SplitPicker({ initial, carrotLabel, savingsTarget, savingsLabel, next, cta }: Props) {
  const [s, setS] = useState<Split>(initial);
  const [target, setTarget] = useState(savingsTarget ? String(savingsTarget / 100) : "");
  const [label, setLabel] = useState(savingsLabel ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const drag = useRef<null | "a" | "b">(null);

  const carrotName = carrotLabel || "The carrot";
  const savingsName = label.trim() || "Savings";
  const rows: { key: keyof Split; name: string; hint: string }[] = [
    { key: "carrot", name: carrotName, hint: "the thing you're working toward" },
    { key: "savings", name: savingsName, hint: "cash, an emergency fund, retirement" },
    { key: "give", name: "Giving", hint: `to the charities you pick · at least ${MIN_GIVE}%` },
  ];
  const ex = splitCents(1000, s);

  function setFromPointer(clientX: number) {
    const el = bar.current;
    if (!el || !drag.current) return;
    const r = el.getBoundingClientRect();
    const v = snap(((clientX - r.left) / r.width) * 100);
    if (drag.current === "a") {
      const a = Math.max(0, Math.min(s.carrot + s.savings, v));
      setS({ carrot: a, savings: s.carrot + s.savings - a, give: s.give });
    } else {
      const b = Math.max(s.carrot, Math.min(100 - MIN_GIVE, v));
      setS({ carrot: s.carrot, savings: b - s.carrot, give: 100 - b });
    }
  }

  function handleKey(which: "a" | "b") {
    return (e: React.KeyboardEvent) => {
      const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? STEP : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -STEP : 0;
      if (!d) return;
      e.preventDefault();
      if (which === "a") {
        const a = Math.max(0, Math.min(s.carrot + s.savings, s.carrot + d));
        setS({ carrot: a, savings: s.carrot + s.savings - a, give: s.give });
      } else {
        const b = Math.max(s.carrot, Math.min(100 - MIN_GIVE, s.carrot + s.savings + d));
        setS({ carrot: s.carrot, savings: b - s.carrot, give: 100 - b });
      }
    };
  }

  async function save() {
    if (!validSplit(s)) return setErr(`Needs to add up to 100%, with at least ${MIN_GIVE}% to giving.`);
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/split", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...s, savingsTarget: target, savingsLabel: label }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error ?? "Something broke. Try again.");
    window.location.href = next;
  }

  return (
    <div className="space-y-8">
      {/* The bar: drag the two seams. */}
      <div>
        <div
          ref={bar}
          className="relative flex h-20 w-full touch-none select-none border-2 border-ink"
          onPointerMove={(e) => setFromPointer(e.clientX)}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          {rows.map(({ key }) => (
            <div key={key} className="flex h-full items-end overflow-hidden transition-[width] duration-100" style={{ width: `${s[key]}%`, ...FILL[key] }}>
              {s[key] >= 12 && (
                <span className="display m-1.5 px-1 text-2xl leading-none" style={key === "give" ? { background: "var(--receipt)" } : undefined}>
                  {s[key]}%
                </span>
              )}
            </div>
          ))}
          {(["a", "b"] as const).map((h) => {
            const left = h === "a" ? s.carrot : s.carrot + s.savings;
            return (
              <button
                key={h}
                type="button"
                role="slider"
                aria-label={h === "a" ? `Seam between ${carrotName} and ${savingsName}` : `Seam between ${savingsName} and Giving`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={left}
                aria-valuetext={h === "a" ? `${carrotName} ${s.carrot}%` : `Giving ${s.give}%`}
                onKeyDown={handleKey(h)}
                onPointerDown={(e) => {
                  drag.current = h;
                  bar.current?.setPointerCapture(e.pointerId);
                }}
                className="absolute -top-3 -bottom-3 z-10 w-11 -translate-x-1/2 cursor-ew-resize"
                style={{ left: `${left}%` }}
              >
                <span className="mx-auto block h-full w-2 border-2 border-ink bg-receipt shadow-[2px_2px_0_var(--ink)]" />
              </button>
            );
          })}
        </div>
        <p className="type mt-3 text-xs text-ink-2">Drag the seams, or use the buttons below.</p>
      </div>

      {/* Rows with steppers */}
      <ul className="divide-y-2 divide-dashed divide-ink border-y-2 border-ink">
        {rows.map(({ key, name, hint }) => (
          <li key={key} className="flex items-center gap-3 py-3">
            <span aria-hidden className="h-8 w-8 shrink-0 border-2 border-ink" style={FILL[key]} />
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{name}</span>
              <span className="block text-xs text-ink-2">{hint}</span>
            </span>
            <button type="button" className="h-11 w-11 border-2 border-ink text-xl" aria-label={`Less to ${name}`} onClick={() => setS(nudge(s, key, -STEP))}>
              −
            </button>
            <span className="display w-14 text-center text-2xl" aria-live="polite">{s[key]}%</span>
            <button type="button" className="h-11 w-11 border-2 border-ink text-xl" aria-label={`More to ${name}`} onClick={() => setS(nudge(s, key, STEP))}>
              +
            </button>
          </li>
        ))}
      </ul>

      <p className="receipt p-4 text-sm">
        Skip a $10 lunch and {money(ex.carrot)} goes to {carrotName}, {money(ex.savings)} to {savingsName}, and {money(ex.give)} to charity.
      </p>

      {/* Presets */}
      <div>
        <p className="type text-sm text-ink-2">Or start from one of these</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {PRESETS.map((p) => {
            const on = p.split.carrot === s.carrot && p.split.savings === s.savings && p.split.give === s.give;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setS(p.split)}
                aria-pressed={on}
                className={`border-2 border-ink p-3 text-left ${on ? "bg-ink text-paper" : "bg-receipt"}`}
              >
                <span className="block font-bold">{p.label}</span>
                <span className={`block text-xs ${on ? "" : "text-ink-2"}`}>
                  {p.split.carrot}/{p.split.savings}/{p.split.give} · {p.note}
                </span>
                <span className="mt-2 flex h-2 w-full">
                  {(["carrot", "savings", "give"] as const).map((k) => (
                    <span key={k} style={{ width: `${p.split[k]}%`, ...FILL[k] }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Savings details */}
      <fieldset className="space-y-5 border-2 border-ink p-4">
        <legend className="type px-1 text-sm">Savings (optional details)</legend>
        <label className="block">
          <span className="type text-sm text-ink-2">What is it for?</span>
          <input className="field" placeholder="Emergency fund" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} />
        </label>
        <label className="block">
          <span className="type text-sm text-ink-2">Target, if you have one</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl">$</span>
            <input className="field" inputMode="decimal" placeholder="1000" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
        </label>
      </fieldset>

      {err && <p className="border-l-4 border-hot pl-3 text-sm" role="alert">{err}</p>}
      <button type="button" className="btn btn-hot w-full text-lg" disabled={busy} onClick={save}>
        {busy ? "Saving…" : cta}
      </button>
    </div>
  );
}
