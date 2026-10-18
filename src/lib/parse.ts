import type { Category } from "./charities";

export type Parsed =
  | { intent: "skip"; item: string; priceCents: number | null }
  | { intent: "price_only"; priceCents: number }
  | { intent: "totals" }
  | { intent: "undo" }
  | { intent: "new_goal"; label: string; targetCents: number | null }
  | { intent: "dashboard" }
  | { intent: "help" }
  | { intent: "stop" }
  | { intent: "start" }
  | { intent: "unknown" };

const MONEY = String.raw`\$?\s*(\d{1,6}(?:[.,]\d{1,2})?)\s*(?:bucks|dollars|usd|\$)?`;

export function toCents(s: string): number | null {
  const n = Number(s.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0 || n > 100000) return null;
  return Math.round(n * 100);
}

function clean(item: string) {
  return item
    .replace(/^(i\s+)?(skipped|didn'?t\s+buy|did\s+not\s+buy|passed\s+on|no|skip|not)\s+(a|an|the|on)?\s*/i, "")
    .replace(/\s+(for|at|@|-|—|:|,)\s*$/i, "")
    .replace(/[.!]+$/, "")
    .trim()
    .slice(0, 80);
}

/** Deterministic fast path. Returns null when the LLM should take a look. */
export function parseFast(raw: string): Parsed | null {
  const t = raw.trim();
  const lower = t.toLowerCase();

  if (/^(stop|stopall|unsubscribe|cancel|end|quit)$/.test(lower)) return { intent: "stop" };
  if (/^(start|unstop|yes)$/.test(lower)) return { intent: "start" };
  if (/^(help|info|\?)$/.test(lower)) return { intent: "help" };
  if (/^(undo|oops|undo that|delete( that| last)?)$/.test(lower)) return { intent: "undo" };
  if (/^(totals?|total\??|status|how am i doing\??|progress|where am i\??)$/.test(lower)) return { intent: "totals" };
  if (/^(dashboard|link|login|log in|card)$/.test(lower)) return { intent: "dashboard" };

  const goal = t.match(new RegExp(String.raw`^(?:new\s+)?goal\s*[:\-]?\s*(.+?)\s+${MONEY}\s*$`, "i"));
  if (goal) return { intent: "new_goal", label: goal[1].trim().slice(0, 60), targetCents: toCents(goal[2]) };
  const goalNoPrice = t.match(/^(?:new\s+)?goal\s*[:\-]?\s*(.+)$/i);
  if (goalNoPrice) return { intent: "new_goal", label: goalNoPrice[1].trim().slice(0, 60), targetCents: null };

  const priceOnly = t.match(new RegExp(String.raw`^${MONEY}$`, "i"));
  if (priceOnly) {
    const c = toCents(priceOnly[1]);
    if (c) return { intent: "price_only", priceCents: c };
  }

  // "croissant 5" / "croissant $4.50" / "skipped a croissant 5"
  const tail = t.match(new RegExp(String.raw`^(.+?)[\s,:@\-—]+${MONEY}\s*$`, "i"));
  if (tail) {
    const item = clean(tail[1]);
    const c = toCents(tail[2]);
    if (item && c) return { intent: "skip", item, priceCents: c };
  }
  // "$5 croissant" / "5 croissant"
  const head = t.match(new RegExp(String.raw`^${MONEY}\s+(?:on\s+|for\s+)?(.+)$`, "i"));
  if (head) {
    const item = clean(head[2]);
    const c = toCents(head[1]);
    if (item && c && !/^\d/.test(item)) return { intent: "skip", item, priceCents: c };
  }

  // Short phrase with no digits at all reads as an item without a price.
  if (!/\d/.test(t) && t.split(/\s+/).length <= 6 && t.length <= 60) {
    const item = clean(t);
    if (item) return { intent: "skip", item, priceCents: null };
  }
  return null;
}

const KEYWORDS: [Category, RegExp][] = [
  ["food", /\b(croissant|coffee|latte|espresso|cappuccino|tea|boba|pastry|donut|doughnut|bagel|muffin|lunch|dinner|breakfast|brunch|takeout|take-out|delivery|doordash|uber ?eats|grubhub|pizza|burger|taco|burrito|sushi|ramen|snack|candy|chips|soda|juice|smoothie|beer|wine|cocktail|drink|drinks|ice cream|cake|cookie|sandwich|salad|fries|meal|food|groceries|kombucha|energy drink|matcha)\b/i],
  ["transport", /\b(uber|lyft|taxi|cab|ride|rideshare|gas|parking|flight|plane|ticket to|train|trip|travel|vacation|hotel|airbnb|car|scooter|bike|bicycle|paris|rental)\b/i],
  ["fashion", /\b(shirt|t-?shirt|tee|shoes|sneakers|kicks|jacket|hoodie|jeans|pants|dress|hat|cap|socks|bag|purse|sunglasses|watch|jewelry|ring|necklace|clothes|outfit|boots|skirt|sweater|vinyl jacket|merch)\b/i],
  ["home", /\b(candle|decor|plant|pillow|blanket|mug|furniture|lamp|rug|kitchen|gadget for the kitchen|towel|sheets|frame|poster|vase)\b/i],
  ["tech", /\b(phone|iphone|airpods|headphones|earbuds|laptop|tablet|ipad|charger|cable|game|video game|console|switch|xbox|playstation|ps5|app|subscription|keyboard|mouse|camera|speaker|smartwatch)\b/i],
  ["fun", /\b(concert|show|movie|cinema|bar|club|tickets?|festival|bowling|arcade|streaming|netflix|spotify|book|books|record|vinyl|lottery|scratch(er)?|gamble|bet)\b/i],
];

export function categorizeFast(item: string): Category | null {
  for (const [cat, re] of KEYWORDS) if (re.test(item)) return cat;
  return null;
}
