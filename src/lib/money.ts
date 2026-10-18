export function usd(cents: number, opts: { always2?: boolean } = {}) {
  const v = cents / 100;
  const whole = Number.isInteger(v) && !opts.always2;
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
}

export const pledgeFor = (priceCents: number) => Math.max(1, Math.round(priceCents * 0.1));

export function pct(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.min(100, Math.floor((part / whole) * 100));
}

const TZ = "America/New_York";

/** Monday 00:00 (ET) of the week containing `d`, as YYYY-MM-DD. */
export function weekStartET(d = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const wd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
  const local = new Date(`${get("year")}-${get("month")}-${get("day")}T12:00:00Z`);
  local.setUTCDate(local.getUTCDate() - wd);
  return local.toISOString().slice(0, 10);
}

export function isSundayET(d = new Date()) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d) === "Sun";
}

export function addDays(ymd: string, n: number) {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function prettyDate(ymd: string) {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
