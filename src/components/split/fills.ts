// One accent only (design/system.md): carrot = hot, savings = ink, giving = ink hatch on receipt.
// Labels always ride along, so color is never the only cue.
export const FILL = {
  carrot: { background: "var(--hot)", color: "var(--hot-ink)" },
  savings: { background: "var(--ink)", color: "var(--paper)" },
  give: { background: "repeating-linear-gradient(135deg, var(--ink) 0 2px, var(--receipt) 2px 7px)", color: "var(--ink)" },
} as const;
