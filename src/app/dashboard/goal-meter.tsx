"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import RansomGoal, { splitWords } from "@/components/craft/ransom-goal";

/**
 * Signature moment (v2): the meter IS the goal. The goal label is spelled out as a
 * ransom note cut from receipts; each letter pastes down as its share of the target
 * is earned, the newest one in hot with a strip of tape. A receipt-tape strip under it
 * keeps the fine reading. SSR renders the final state, so no-JS and reduced motion get
 * the finished collage instantly; the paste sequence is pure CSS (transform/opacity).
 */
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function GoalMeter({ saved, target, label: labelProp }: { saved: number; target: number; label?: string }) {
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState(labelProp ?? "");

  // Until the page passes `label`, borrow it from the heading right above us.
  useIso(() => {
    if (labelProp) return setLabel(labelProp);
    const h = ref.current?.previousElementSibling;
    if (h?.tagName === "H1" && h.textContent) setLabel(h.textContent);
  }, [labelProp]);

  const total = splitWords(label).reduce((a, w) => a + w.length, 0);
  const pasted = total === 0 ? 0 : pct >= 100 ? total : Math.max(saved > 0 ? 1 : 0, Math.floor((pct / 100) * total));
  const stepMs = Math.round(Math.min(110, 1100 / Math.max(1, pasted)));

  const stubs = 20;
  const filled = Math.floor(pct / (100 / stubs));

  // Count-up: synced to the paste sequence on first paint, then animates from the previous value.
  const [shown, setShown] = useState(saved);
  const prev = useRef<number | null>(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = prev.current ?? 0;
    prev.current = saved;
    if (reduce || from === saved) return setShown(saved);
    const dur = from === 0 ? 1200 : 650;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setShown(Math.round(from + (saved - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [saved]);

  const fmt = (c: number) => `$${(c / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  const name = label || "your goal";

  return (
    <div ref={ref} className={`gm mt-6 ${label ? "gm-has-ransom" : ""}`} data-full={pct >= 100 || undefined}>
      <div
        role="progressbar"
        aria-label={`Progress toward ${name}`}
        aria-valuenow={Math.floor(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${fmt(saved)} of ${fmt(target)} saved toward ${name}, ${Math.floor(pct)} percent`}
      >
        {label && <RansomGoal label={label} pasted={pasted} animate stepMs={stepMs} />}

        <div className="mt-5 flex items-end justify-between gap-4" aria-hidden="true">
          <p className="display text-4xl tabular-nums sm:text-5xl">{fmt(shown)}</p>
          <p className="type pb-1 text-sm text-ink-2">
            of {fmt(target)} · {Math.floor(pct)}%
          </p>
        </div>

        <div className="gm-tape mt-3" aria-hidden="true">
          {Array.from({ length: stubs }).map((_, i) => (
            <span
              key={i}
              className={`gm-stub ${i < filled ? "is-on" : ""} ${i === filled - 1 ? "is-hot" : ""}`}
              style={{ ["--d" as string]: `${i * 40}ms`, ["--r" as string]: `${((i * 37) % 7) - 3}deg` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
