"use client";
import { useEffect, useState } from "react";

/**
 * Signature moment (v1): the goal as a strip of torn receipt stubs that punch in, one per 5%,
 * counting up from zero each time you land on the dashboard.
 */
export default function GoalMeter({ saved, target }: { saved: number; target: number }) {
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const stubs = 20;
  const filled = Math.floor(pct / (100 / stubs));
  const [n, setN] = useState(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setN(Math.min(i, filled));
      if (i >= filled) clearInterval(t);
    }, 55);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setShown(Math.round(saved * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      clearInterval(t);
      cancelAnimationFrame(raf);
    };
  }, [filled, saved]);

  const fmt = (c: number) => `$${(c / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  return (
    <div className="mt-6">
      <div className="flex items-end justify-between gap-4">
        <p className="display text-4xl sm:text-5xl">{fmt(shown)}</p>
        <p className="type pb-1 text-sm text-ink-2">of {fmt(target)} · {Math.floor(pct)}%</p>
      </div>
      <div className="mt-3 grid grid-cols-20 gap-[3px]" role="progressbar" aria-valuenow={Math.floor(pct)} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: stubs }).map((_, i) => (
          <span
            key={i}
            className="h-10 border-2 border-ink transition-all duration-200"
            style={{
              background: i < n ? (i === filled - 1 ? "var(--hot)" : "var(--ink)") : "transparent",
              transform: i < n ? `rotate(${((i * 37) % 7) - 3}deg)` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
