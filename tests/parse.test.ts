import { describe, expect, it } from "vitest";
import golden from "../ai/evals/parser-golden.json";
import { amountsInText, categorizeFast, parseFast, toCents } from "../src/lib/parse";

type Case = {
  id: string;
  input: string;
  intent: string;
  llm?: boolean;
  item?: string | null;
  priceCents?: number | null;
  category?: string | null;
  needsConfirm?: boolean;
  label?: string;
  targetCents?: number | null;
};

const cases = (golden as { cases: Case[] }).cases;

describe("golden set: fast path", () => {
  it("has at least 60 cases", () => expect(cases.length).toBeGreaterThanOrEqual(60));

  for (const c of cases.filter((x) => !x.llm)) {
    it(`${c.id}: ${JSON.stringify(c.input)} -> ${c.intent}`, () => {
      const p = parseFast(c.input) as Record<string, unknown> | null;
      expect(p, "fast path should resolve this").not.toBeNull();
      expect(p!.intent).toBe(c.intent);
      if (c.intent === "skip") {
        expect(p!.item).toBe(c.item);
        expect(p!.priceCents).toBe(c.priceCents ?? null);
        expect(p!.needsConfirm ?? false).toBe(c.needsConfirm ?? false);
        if (c.category !== undefined) expect(categorizeFast(String(p!.item))).toBe(c.category);
      }
      if (c.intent === "price_only") {
        expect(p!.priceCents).toBe(c.priceCents);
        expect(p!.needsConfirm ?? false).toBe(c.needsConfirm ?? false);
      }
      if (c.intent === "bad_price") expect(p!.item).toBe(c.item ?? null);
      if (c.intent === "new_goal") {
        expect(p!.label).toBe(c.label);
        expect(p!.targetCents).toBe(c.targetCents ?? null);
      }
    });
  }

  for (const c of cases.filter((x) => x.llm)) {
    it(`${c.id}: ${JSON.stringify(c.input)} -> LLM`, () => expect(parseFast(c.input)).toBeNull());
  }
});

describe("chit-chat never becomes a pending item", () => {
  for (const s of ["hello", "hi", "thanks", "no thanks", "ok", "lol", "what is this", "okay!", "haha", "k"]) {
    it(s, () => expect(parseFast(s)?.intent).not.toBe("skip"));
  }
});

describe("money helpers", () => {
  it("parses separators", () => {
    expect(toCents("1,200")).toBe(120000);
    expect(toCents("4,50")).toBe(450);
    expect(toCents("12,500.50")).toBe(1250050);
    expect(toCents("0")).toBeNull();
    expect(toCents("-5")).toBeNull();
  });
  it("finds amounts in text for LLM price verification", () => {
    expect(amountsInText("about to buy headphones, 89 bucks")).toContain(8900);
    expect(amountsInText("saved like forty")).toContain(4000);
    expect(amountsInText("no number here")).toEqual([]);
  });
});
