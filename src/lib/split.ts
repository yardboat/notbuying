// How each "no" is divided. Pure + client-safe (used by the picker UI and the ledger).

export type Split = { carrot: number; savings: number; give: number };

export const MIN_GIVE = 5;
export const STEP = 5;
export const DEFAULT_SPLIT: Split = { carrot: 60, savings: 30, give: 10 };

export const PRESETS: { label: string; note: string; split: Split }[] = [
  { label: "Carrot first", note: "get the thing sooner", split: { carrot: 70, savings: 20, give: 10 } },
  { label: "Balanced", note: "a bit of everything", split: { carrot: 50, savings: 35, give: 15 } },
  { label: "Future me", note: "mostly savings", split: { carrot: 20, savings: 70, give: 10 } },
  { label: "Big heart", note: "give more", split: { carrot: 40, savings: 30, give: 30 } },
];

export function validSplit(s: Partial<Split> | null | undefined): s is Split {
  if (!s) return false;
  const vals = [s.carrot, s.savings, s.give];
  if (!vals.every((v) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 100)) return false;
  if ((s.give as number) < MIN_GIVE) return false;
  return (s.carrot as number) + (s.savings as number) + (s.give as number) === 100;
}

/** Divide a price into cents per bucket. Always sums exactly to priceCents; give is at least 1 cent. */
export function splitCents(priceCents: number, s: Split) {
  const give = Math.max(1, Math.round((priceCents * s.give) / 100));
  const rest = Math.max(0, priceCents - give);
  const otherPct = s.carrot + s.savings;
  const carrot = otherPct === 0 ? 0 : Math.round((rest * s.carrot) / otherPct);
  const savings = rest - carrot;
  return { carrot, savings, give };
}

/** Move one bucket by delta (multiples of STEP), rebalancing the others so the total stays 100 and give >= MIN_GIVE. */
export function nudge(s: Split, key: keyof Split, delta: number): Split {
  const next = { ...s };
  const min = (k: keyof Split) => (k === "give" ? MIN_GIVE : 0);
  const target = Math.max(min(key), Math.min(100, next[key] + delta));
  let diff = target - next[key];
  next[key] = target;
  // Take from (or give to) the other buckets: largest first when taking, savings first when giving back.
  const others = (Object.keys(next) as (keyof Split)[]).filter((k) => k !== key);
  if (diff > 0) {
    others.sort((a, b) => next[b] - min(b) - (next[a] - min(a)));
    for (const k of others) {
      const room = next[k] - min(k);
      const take = Math.min(room, diff);
      next[k] -= take;
      diff -= take;
    }
    if (diff > 0) next[key] -= diff; // could not find room
  } else if (diff < 0) {
    const order = (["savings", "carrot", "give"] as (keyof Split)[]).filter((k) => k !== key);
    next[order[0]] += -diff;
  }
  return next;
}

export const BUCKET_LABEL: Record<keyof Split, string> = { carrot: "The carrot", savings: "Savings", give: "Giving" };
