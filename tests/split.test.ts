import { describe, expect, it } from "vitest";
import { DEFAULT_SPLIT, MIN_GIVE, PRESETS, nudge, splitCents, validSplit } from "../src/lib/split";

describe("splitCents", () => {
  const cases = [1, 3, 99, 500, 1234, 12000, 999999];
  const splits = [DEFAULT_SPLIT, ...PRESETS.map((p) => p.split), { carrot: 0, savings: 95, give: 5 }, { carrot: 95, savings: 0, give: 5 }, { carrot: 0, savings: 0, give: 100 }];
  for (const s of splits) {
    for (const c of cases) {
      it(`sums exactly for ${c}c at ${s.carrot}/${s.savings}/${s.give}`, () => {
        const r = splitCents(c, s);
        expect(r.carrot + r.savings + r.give).toBe(c);
        expect(r.give).toBeGreaterThanOrEqual(1);
        expect(r.carrot).toBeGreaterThanOrEqual(0);
        expect(r.savings).toBeGreaterThanOrEqual(0);
        if (s.carrot === 0) expect(r.carrot).toBe(0);
        if (s.savings === 0) expect(r.savings).toBe(0);
      });
    }
  }
  it("60/30/10 on $10", () => expect(splitCents(1000, DEFAULT_SPLIT)).toEqual({ carrot: 600, savings: 300, give: 100 }));
});

describe("validSplit", () => {
  it("accepts presets", () => PRESETS.forEach((p) => expect(validSplit(p.split)).toBe(true)));
  it("rejects give under min", () => expect(validSplit({ carrot: 70, savings: 30, give: 0 })).toBe(false));
  it("rejects bad sums", () => expect(validSplit({ carrot: 60, savings: 30, give: 20 })).toBe(false));
  it("rejects non-integers", () => expect(validSplit({ carrot: 60.5, savings: 29.5, give: 10 })).toBe(false));
});

describe("nudge", () => {
  it("keeps 100 and min give", () => {
    let s = { ...DEFAULT_SPLIT };
    for (let i = 0; i < 40; i++) {
      s = nudge(s, (["carrot", "savings", "give"] as const)[i % 3], i % 2 ? 5 : -5);
      expect(s.carrot + s.savings + s.give).toBe(100);
      expect(s.give).toBeGreaterThanOrEqual(MIN_GIVE);
    }
  });
  it("carrot to 100 leaves min give", () => {
    let s = { ...DEFAULT_SPLIT };
    for (let i = 0; i < 30; i++) s = nudge(s, "carrot", 5);
    expect(s).toEqual({ carrot: 95, savings: 0, give: 5 });
  });
  it("give can't go below min", () => expect(nudge({ carrot: 60, savings: 35, give: 5 }, "give", -5).give).toBe(5));
});
