import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "./env";
import type { Category } from "./charities";
import { toCents, type Parsed } from "./parse";

const CATS = ["food", "transport", "fashion", "home", "tech", "fun", "other"] as const;

const Out = z.object({
  intent: z.enum(["skip", "totals", "undo", "new_goal", "dashboard", "help", "unknown"]),
  item: z.string().max(80).nullish(),
  price: z.string().nullish(),
  category: z.enum(CATS).nullish(),
  goal_label: z.string().max(60).nullish(),
  goal_amount: z.string().nullish(),
});

const SYSTEM = `You parse text messages sent to "Donate the Difference", an app where people log things they chose NOT to buy.
Return ONLY a JSON object: {"intent": "skip"|"totals"|"undo"|"new_goal"|"dashboard"|"help"|"unknown", "item": string|null, "price": string|null, "category": one of ${CATS.join("|")}|null, "goal_label": string|null, "goal_amount": string|null}
Rules:
- "skip" = the person did not buy something. item = short noun phrase, lowercase, no articles ("croissant", "new sneakers").
- price: copy ONLY a number the person actually wrote ("6", "4.50"). If they wrote no number, price is null. Never guess a price.
- category: food (food, drink, coffee, alcohol), transport (rides, gas, flights, trips), fashion (clothes, shoes, accessories), home, tech (gadgets, games, apps, subscriptions), fun (going out, events, entertainment), other.
- new_goal = they want to save toward something new; goal_amount only if they wrote a number.`;

let client: Anthropic | null = null;

async function call(user: string, maxTokens = 200): Promise<string | null> {
  const key = env("ANTHROPIC_API_KEY");
  if (!key) return null;
  client ??= new Anthropic({ apiKey: key });
  const model = env("ANTHROPIC_MODEL") ?? "claude-haiku-5-5";
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 4000);
  try {
    const res = await client.messages.create(
      { model, max_tokens: maxTokens, system: SYSTEM, messages: [{ role: "user", content: user }] },
      { signal: ac.signal },
    );
    const block = res.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractJson(s: string) {
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return Out.safeParse(JSON.parse(m[0]));
  } catch {
    return null;
  }
}

/** LLM fallback for free-form texts. Prices are only accepted if the digits appear in the original text. */
export async function parseWithLlm(raw: string): Promise<{ parsed: Parsed; category: Category | null } | null> {
  const text = await call(raw);
  if (!text) return null;
  const r = extractJson(text);
  if (!r || !r.success) return null;
  const o = r.data;
  const priceOk = (p?: string | null) => (p && raw.includes(p.replace(/^\$/, "")) ? toCents(p.replace(/^\$/, "")) : null);
  switch (o.intent) {
    case "skip":
      if (!o.item) return null;
      return { parsed: { intent: "skip", item: o.item.trim(), priceCents: priceOk(o.price) }, category: o.category ?? null };
    case "new_goal":
      if (!o.goal_label) return null;
      return { parsed: { intent: "new_goal", label: o.goal_label, targetCents: priceOk(o.goal_amount) }, category: null };
    case "totals":
    case "undo":
    case "dashboard":
    case "help":
      return { parsed: { intent: o.intent }, category: null };
    default:
      return { parsed: { intent: "unknown" }, category: null };
  }
}

export async function categorizeWithLlm(item: string): Promise<Category | null> {
  const text = await call(`Categorize only. Message: "skipped ${item}"`, 120);
  if (!text) return null;
  const r = extractJson(text);
  return r && r.success ? (r.data.category ?? null) : null;
}
