import { FILL } from "@/components/split/fills";
import { prettyDate, usd } from "@/lib/money";

type Bucket = "carrot" | "savings" | "give";
const ORDER: Bucket[] = ["give", "savings", "carrot"]; // stack bottom → top: giving sits at the base

/** Lifetime money, one bar split three ways, with direct labels underneath. */
export function SplitBar({ values, names }: { values: Record<Bucket, number>; names: Record<Bucket, string> }) {
  const total = values.carrot + values.savings + values.give;
  const keys: Bucket[] = ["carrot", "savings", "give"];
  return (
    <figure aria-label="Where the money you didn't spend went">
      <div className="flex h-10 w-full gap-[2px] border-2 border-ink bg-paper p-[2px]" role="img" aria-label={keys.map((k) => `${names[k]} ${usd(values[k])}`).join(", ")}>
        {total === 0 ? (
          <div className="flex-1 border-2 border-dashed border-ink-3" />
        ) : (
          keys.map((k) => values[k] > 0 && <div key={k} title={`${names[k]}: ${usd(values[k], { always2: true })}`} style={{ width: `${(values[k] / total) * 100}%`, ...FILL[k] }} />)
        )}
      </div>
      <figcaption className="mt-3 grid grid-cols-3 gap-3 text-sm">
        {keys.map((k) => (
          <span key={k} className="flex items-start gap-2">
            <span aria-hidden className="mt-1 h-3 w-3 shrink-0 border-2 border-ink" style={FILL[k]} />
            <span className="min-w-0">
              <span className="block truncate text-xs text-ink-2">{names[k]}</span>
              <span className="display block text-xl">{usd(values[k])}</span>
            </span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/** Running total, week by week: every column is everything not spent so far, stacked by bucket. Only ever goes up. */
export function ProgressChart({
  weeks,
  baseline,
  names,
}: {
  weeks: { week: string; carrot: number; savings: number; give: number; count: number }[];
  baseline: Record<Bucket, number>;
  names: Record<Bucket, string>;
}) {
  const cols = runningTotals(weeks, baseline);
  const max = Math.max(1, ...cols.map((c) => c.total));
  const nice = niceCeil(max);
  const last = cols[cols.length - 1];
  // Skip leading empty weeks so a new user's chart isn't 11 blank columns.
  const firstIdx = Math.max(0, Math.min(cols.findIndex((c) => c.total > 0), cols.length - 4));
  const shown = firstIdx < 0 ? cols.slice(-4) : cols.slice(firstIdx);

  return (
    <figure>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-ink-3" />
        <span className="type absolute -top-5 right-0 text-xs text-ink-2">{usd(nice)}</span>
        <ol className="flex h-48 items-end gap-1.5 border-b-2 border-ink pt-0 sm:gap-2" aria-label="Running total of money not spent, by week">
          {shown.map((c, i) => {
            const isLast = i === shown.length - 1;
            const label = `Week of ${prettyDate(c.week)}: ${usd(c.total)} so far (${names.carrot} ${usd(c.carrot)}, ${names.savings} ${usd(c.savings)}, giving ${usd(c.give, { always2: true })}). ${c.count} no${c.count === 1 ? "" : "s"} that week.`;
            return (
              <li key={c.week} className="group relative flex h-full flex-1 flex-col justify-end" tabIndex={0} aria-label={label} title={label}>
                {isLast && c.total > 0 && (
                  <span className="display absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-sm" style={{ bottom: `calc(${(c.total / nice) * 100}% + 4px)` }}>
                    {usd(c.total)}
                  </span>
                )}
                <div className="flex flex-col-reverse gap-[2px] transition-transform group-hover:-translate-y-0.5 group-focus:-translate-y-0.5" style={{ height: `${(c.total / nice) * 100}%` }}>
                  {ORDER.map((k) => c[k] > 0 && <div key={k} style={{ flexGrow: c[k], minHeight: 2, ...FILL[k] }} />)}
                </div>
              </li>
            );
          })}
        </ol>
        <div className="type mt-2 flex justify-between text-xs text-ink-2">
          <span>{prettyDate(shown[0].week)}</span>
          <span>this week</span>
        </div>
      </div>
      <figcaption className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        {(["carrot", "savings", "give"] as Bucket[]).map((k) => (
          <span key={k} className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-3 border-2 border-ink" style={FILL[k]} />
            {names[k]}
          </span>
        ))}
        <span className="sr-only">Total so far: {usd(last.total)}.</span>
      </figcaption>
    </figure>
  );
}

/** Where the no's come from: one series, so ink bars, no legend; value labels at the end. */
export function CategoryBars({ rows }: { rows: { label: string; count: number; cents: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.cents));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,8.5rem)_1fr_auto] sm:grid-cols-[11rem_1fr_auto] items-center gap-3 text-sm" title={`${r.label}: ${r.count} no${r.count === 1 ? "" : "s"}, ${usd(r.cents)}`}>
          <span className="truncate text-ink-2">{r.label}</span>
          <span className="h-4 border-2 border-ink bg-paper p-[1px]">
            <span className="block h-full bg-ink" style={{ width: `${Math.max(2, (r.cents / max) * 100)}%` }} />
          </span>
          <span className="text-right whitespace-nowrap">
            <span className="font-bold">{usd(r.cents)}</span> <span className="text-xs text-ink-2">· {r.count}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Plain progress bar for savings / giving. */
export function Meter({ pct, bucket, label }: { pct: number; bucket: Bucket; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-4 border-2 border-ink bg-paper p-[2px]">
      <div className="h-full" style={{ width: `${Math.max(pct > 0 ? 2 : 0, pct)}%`, ...FILL[bucket] }} />
    </div>
  );
}

function niceCeil(cents: number) {
  const d = cents / 100;
  const pow = Math.pow(10, Math.floor(Math.log10(Math.max(1, d))));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= d) return Math.round(m * pow * 100);
  return cents;
}

function runningTotals(weeks: { week: string; carrot: number; savings: number; give: number; count: number }[], baseline: Record<Bucket, number>) {
  const out: { week: string; count: number; carrot: number; savings: number; give: number; total: number }[] = [];
  let c = baseline.carrot, sv = baseline.savings, g = baseline.give;
  for (const w of weeks) {
    c += w.carrot; sv += w.savings; g += w.give;
    out.push({ week: w.week, count: w.count, carrot: c, savings: sv, give: g, total: c + sv + g });
  }
  return out;
}
