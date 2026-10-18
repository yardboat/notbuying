import type { Category } from "./charities";

export type Parsed =
  | { intent: "skip"; item: string; priceCents: number | null; needsConfirm?: true }
  | { intent: "price_only"; priceCents: number; needsConfirm?: true }
  | { intent: "bad_price"; item: string | null }
  | { intent: "totals" }
  | { intent: "undo" }
  | { intent: "new_goal"; label: string; targetCents: number | null }
  | { intent: "dashboard" }
  | { intent: "help" }
  | { intent: "stop" }
  | { intent: "start" }
  | { intent: "unknown" };

/** Skips above this are plausible but unusual; ledger should confirm before recording. */
export const CONFIRM_ABOVE_CENTS = 500_000; // $5,000
/** Anything above this is treated as a typo, never recorded. */
export const MAX_CENTS = 100_000_000; // $1,000,000

// Thousands-separated ("1,200", "12,500.50") before plain/European decimal ("4.50", "4,50").
const NUM = String.raw`\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d{1,7}(?:[.,]\d{1,2})?`;
const UNIT = String.raw`(?:bucks?|dollars?|usd|\$)`;
const MONEY = String.raw`\$?\s*(${NUM})\s*(${UNIT})?`;

/** Parse a numeric amount string into dollars. Returns null if it isn't a number. */
export function amountOf(s: string): number | null {
  const v = s.trim().replace(/^\$/, "").trim();
  let n: number;
  if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(v)) n = Number(v.replace(/,/g, ""));
  else if (/^\d+(,\d{1,2})$/.test(v)) n = Number(v.replace(",", "."));
  else if (/^\d+(\.\d+)?$/.test(v)) n = Number(v);
  else return null;
  return Number.isFinite(n) ? n : null;
}

/** Positive, sane amount → cents; null for 0, negatives, non-numbers and > MAX_CENTS. */
export function toCents(s: string): number | null {
  const n = amountOf(s);
  if (n === null || n <= 0) return null;
  const c = Math.round(n * 100);
  return c > 0 && c <= MAX_CENTS ? c : null;
}

// ---------- number words ("croissant five", "twenty bucks lunch") ----------
const UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const W = `(?:${[...Object.keys(UNITS), ...Object.keys(TENS), "hundred"].join("|")})`;
const RUN = new RegExp(String.raw`\b(?:a\s+hundred|${W})(?:(?:\s+|-)(?:and\s+)?${W})*\b`, "gi");

function wordsToNumber(run: string): number | null {
  const toks = run.toLowerCase().replace(/^a\s+/, "one ").split(/[\s-]+/).filter((x) => x && x !== "and");
  let hundreds = 0;
  let cur = 0;
  let last: "u" | "t" | "h" | null = null;
  for (const tok of toks) {
    if (tok === "hundred") {
      if (last === "h" || hundreds) return null;
      hundreds = (cur || 1) * 100;
      cur = 0;
      last = "h";
    } else if (tok in TENS) {
      if (last === "u" || last === "t") return null;
      cur += TENS[tok];
      last = "t";
    } else if (tok in UNITS) {
      if (last === "u") return null;
      if (last === "t" && UNITS[tok] >= 10) return null;
      if (last === "t" && UNITS[tok] === 0) return null;
      cur += UNITS[tok];
      last = "u";
    } else return null;
  }
  const n = hundreds + cur;
  return n <= 999 ? n : null;
}

/** Replace runs of English number words with digits. */
export function replaceNumberWords(t: string): { text: string; converted: boolean } {
  let converted = false;
  const text = t.replace(RUN, (m) => {
    const n = wordsToNumber(m);
    if (n === null) return m;
    converted = true;
    return String(n);
  });
  return { text, converted };
}

// ---------- helpers ----------
const SKIP_VERB = /^(?:i\s+)?(?:just\s+)?(?:skipped|didn'?t\s+(?:buy|get|order)|did\s+not\s+(?:buy|get|order)|passed\s+on|resisted|said\s+no\s+to|no|skip|not)\b\s*(?:(?:a|an|the|on|some|my)\s+)?/i;

function clean(item: string) {
  return item
    .replace(SKIP_VERB, "")
    .replace(/^(?:a|an|the|some)\s+/i, "")
    .replace(/\s+(?:for|at|@|-|—|:|,|on)\s*$/i, "")
    .replace(/[\s.!,:;\-—]+$/, "")
    .trim()
    .slice(0, 80);
}

/** Items too vague to log ("the thing", "it") or messages about something they DID buy. */
const VAGUE = /^(?:thing|things|stuff|it|that|this|something|one|them)$/i;
const BOUGHT = /\b(?:bought|purchased|ordered|got\s+(?:a|an|the|some|me))\b|\b(?:lol|lmao|haha)\b/i;
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
/** Items longer than this are free-form sentences: the LLM reads them. */
const MAX_ITEM_WORDS = 4;

function skipOf(item: string, cents: number): Parsed | null {
  if (VAGUE.test(item)) return null;
  return cents > CONFIRM_ABOVE_CENTS ? { intent: "skip", item, priceCents: cents, needsConfirm: true } : { intent: "skip", item, priceCents: cents };
}

const GREETING = /^(?:hi+|hello+|hey+|heya|hiya|yo+|sup|howdy|hola|good\s+(?:morning|afternoon|evening)|what\s+is\s+this|what'?s\s+this|what\s+do\s+i\s+do|how\s+does\s+(?:this|it)\s+work|how\s+do\s+i\s+(?:use\s+this|start)|commands|menu)$/;
const CHITCHAT = /^(?:thanks?|thank\s+you|thank\s+u|thx|ty|tysm|no\s+thanks?|no\s+thank\s+you|nah|nope|no|ok+|okay|k+|kk|lol+|lmao|haha+|ha|cool|nice|great|awesome|sweet|got\s+it|sure|sounds\s+good|bye|good\s*night|gn|nvm|never\s*mind|wow|omg|hmm+|huh|what|why|\?+)$/;

/** Deterministic fast path. Returns null when the LLM should take a look. */
export function parseFast(raw: string): Parsed | null {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return { intent: "unknown" };
  const lower = t.toLowerCase();
  if (/^\?+$/.test(lower)) return { intent: "help" };
  // Drop trailing punctuation and reaction emoji for command / chit-chat matching.
  const bare = lower.replace(/[\s!.?,~]*(?:\p{Extended_Pictographic}|️|‍|[\s!.?,~])*$/u, "").trim();

  if (/^(stop|stopall|unsubscribe|cancel|end|quit)$/.test(lower)) return { intent: "stop" };
  if (/^(start|unstop|yes)$/.test(lower)) return { intent: "start" };
  if (/^(help|info)$/.test(bare) || GREETING.test(bare)) return { intent: "help" };
  if (/^(undo|oops|undo that|delete( that| last)?)$/.test(bare)) return { intent: "undo" };
  if (/^(totals?|status|how am i doing|progress|where am i)$/.test(bare)) return { intent: "totals" };
  if (/^(dashboard|link|login|log in|card)$/.test(bare)) return { intent: "dashboard" };
  if (CHITCHAT.test(bare)) return { intent: "unknown" };
  // Pure reaction emoji ("👍", "🙏") with nothing we can categorise.
  if (!bare && !categorizeFast(t)) return { intent: "unknown" };

  // They DID buy it (or are joking): let the LLM decide.
  if (BOUGHT.test(t)) return null;

  const { text: s, converted } = replaceNumberWords(t);

  // Negative amounts anywhere: "croissant -5", "-$5", "$-5".
  const neg = s.match(/^(.*?)(?:^|\s|:)[-−]\$?\d|^(.*?)\$\s*[-−]\s*\d/);
  if (neg) {
    const it = clean((neg[1] ?? neg[2] ?? "").replace(/^(?:new\s+)?goal\b\s*[:\-]?\s*/i, ""));
    return { intent: "bad_price", item: it || null };
  }

  // Goals: "new goal bike 500", "goal: trip $1,500", "goal $1,500 trip", "new goal 1500 trip".
  const goalHead = /^(?:new\s+|set\s+(?:a\s+)?)?goal\b\s*[:\-]?\s*/i;
  if (goalHead.test(s)) {
    const rest = s.replace(goalHead, "").trim();
    if (!rest) return { intent: "help" };
    if (new RegExp(String.raw`^${MONEY}$`, "i").test(rest)) return { intent: "unknown" }; // amount but no label
    const tailG = rest.match(new RegExp(String.raw`^(.+?)\s+(?:for\s+|of\s+)?${MONEY}$`, "i"));
    const headG = rest.match(new RegExp(String.raw`^${MONEY}\s+(?:for\s+|on\s+)?(.+)$`, "i"));
    const label = (tailG?.[1] ?? headG?.[3] ?? rest).replace(/^(?:a|an|the)\s+/i, "").replace(/[.!]+$/, "").trim().slice(0, 60);
    const amt = tailG?.[2] ?? headG?.[1];
    if (amt !== undefined) {
      const c = toCents(amt);
      if (c === null) return { intent: "bad_price", item: label || null };
      return { intent: "new_goal", label, targetCents: c };
    }
    return { intent: "new_goal", label: label, targetCents: null };
  }

  // Bare amount: answers a pending "what did it cost?"
  const priceOnly = s.match(new RegExp(String.raw`^${MONEY}$`, "i"));
  if (priceOnly) {
    const c = toCents(priceOnly[1]);
    if (c === null) return { intent: "bad_price", item: null };
    return c > CONFIRM_ABOVE_CENTS ? { intent: "price_only", priceCents: c, needsConfirm: true } : { intent: "price_only", priceCents: c };
  }

  // "croissant 5" / "croissant $4.50" / "skipped a croissant, 1,200" / "lunch for twenty"
  const tail = s.match(new RegExp(String.raw`^(.+?)[\s,:@\-—]+(?:for\s+|at\s+)?${MONEY}[.!]*$`, "i"));
  if (tail) {
    const item = clean(tail[1]);
    if (!item || /^[\d.,$\s]+$/.test(item)) return null;
    if (words(item) > MAX_ITEM_WORDS) return null;
    // "dinner for two" is a party size, not a price.
    if (converted && !tail[3] && /\b(?:for|of)\s+[a-z-]+[.!]*$/i.test(t)) return null;
    const c = toCents(tail[2]);
    if (c === null) return { intent: "bad_price", item };
    return skipOf(item, c);
  }

  // "$5 croissant" / "5 croissant" / "twenty bucks lunch"
  const head = s.match(new RegExp(String.raw`^${MONEY}\s+(?:on\s+|for\s+)?(.+?)[.!]*$`, "i"));
  if (head) {
    const marked = /^\s*\$/.test(s) || !!head[2];
    // A number word without $ or "bucks" in front ("one coffee") is usually a quantity.
    if (converted && !marked) return null;
    const item = clean(head[3]);
    if (!item || /^\d/.test(item) || words(item) > MAX_ITEM_WORDS) return null;
    const c = toCents(head[1]);
    if (c === null) return { intent: "bad_price", item };
    return skipOf(item, c);
  }

  // No number at all: a short item we recognise asks for a price; anything else goes to the LLM.
  if (!/\d/.test(s) && !converted) {
    const hadVerb = SKIP_VERB.test(t) && !/^(?:no|not)\b/i.test(t);
    const item = clean(t);
    if (item && !BOUGHT.test(t) && !VAGUE.test(item) && words(item) <= MAX_ITEM_WORDS && item.length <= 60 && (hadVerb || categorizeFast(item))) {
      return { intent: "skip", item, priceCents: null };
    }
  }
  return null;
}

/** All amounts (cents) that literally appear in a message, digits or number words. Used to verify LLM prices. */
export function amountsInText(raw: string): number[] {
  const { text } = replaceNumberWords(raw);
  const out: number[] = [];
  for (const m of text.matchAll(new RegExp(NUM, "g"))) {
    const c = toCents(m[0]);
    if (c !== null) out.push(c);
  }
  return out;
}

// ---------- categories ----------
const PL = String.raw`(?:e?s)?`;
const KEYWORDS: [Category, RegExp][] = [
  ["food", new RegExp(String.raw`\b(?:croissant|coffee|latte|espresso|cappuccino|americano|mocha|frappuccino|tea|boba|pastry|pastries|donut|doughnut|bagel|muffin|lunch|dinner|breakfast|brunch|takeout|take-out|delivery|doordash|uber ?eats|grubhub|postmates|pizza|burger|taco|burrito|sushi|ramen|pho|snack|candy|candies|chips|soda|juice|smoothie|beer|wine|cocktail|margarita|drink|ice cream|cake|cookie|sandwich|salad|fries|meal|food|groceries|kombucha|energy drink|matcha|wings|nachos|bubble tea|starbucks|chipotle|mcdonald'?s)${PL}\b`, "i")],
  ["transport", new RegExp(String.raw`\b(?:uber|lyft|taxi|cab|ride|rideshare|gas|parking|flight|plane|ticket to|train|trip|travel|vacation|hotel|airbnb|car|scooter|bike|bicycle|paris|rental|toll)${PL}\b`, "i")],
  ["fashion", new RegExp(String.raw`\b(?:shirt|t-?shirt|tee|shoe|sneaker|kicks|jacket|hoodie|jeans|pants|dress|hat|cap|sock|bag|purse|sunglasses|watch|jewelry|ring|necklace|clothes|outfit|boot|skirt|sweater|merch|heels|leggings|coat)${PL}\b`, "i")],
  ["home", new RegExp(String.raw`\b(?:candle|decor|plant|pillow|blanket|mug|furniture|lamp|rug|kitchen|towel|sheets|frame|poster|vase|couch)${PL}\b`, "i")],
  ["tech", new RegExp(String.raw`\b(?:phone|iphone|airpods|headphones|earbuds|laptop|tablet|ipad|charger|cable|game|video game|console|switch|xbox|playstation|ps5|app|subscription|keyboard|mouse|camera|speaker|smartwatch|monitor)${PL}\b`, "i")],
  ["fun", new RegExp(String.raw`\b(?:concert|show|movie|cinema|bar|club|ticket|festival|bowling|arcade|streaming|netflix|spotify|book|record|vinyl|lottery|scratcher|scratch|gamble|bet)${PL}\b`, "i")],
];

const EMOJI: [Category, string][] = [
  ["food", "🥐☕🍕🍔🍟🌭🌮🌯🥙🍣🍜🍝🍱🍩🍪🍰🎂🧁🍦🍨🍫🍬🍭🥤🧋🍵🧃🍺🍻🍷🥂🍸🍹🍾🥃🥗🥪🥯🍳🥞🧇🍗🍖🥡🍤🍙🍛"],
  ["transport", "🚕🚖🚗🚙🚘✈🛫🛬🚆🚄🚅🚇🚌⛽🛵🚲🛴🏨🧳🏖🏝🗺"],
  ["fashion", "👟👠👡👢👞👕👖👗👚👔👜👛🎒🧢👒🕶⌚💍💎🧥🧣🧤🩳👙🩱"],
  ["home", "🕯🪴🛋🛏🖼🏠🏡🪞🧸🪑"],
  ["tech", "📱💻🖥🎧🎮🕹⌨🖱📷📸🔌🔋📺⌚️"],
  ["fun", "🎟🎫🎬🎤🎳🎰🎲🎵🎶🎸📚📖🍿🎢🎡🎭🎨"],
];

export function categorizeFast(item: string): Category | null {
  for (const [cat, re] of KEYWORDS) if (re.test(item)) return cat;
  const s = item.replace(/️/g, "");
  for (const [cat, chars] of EMOJI) for (const e of chars) if (e !== "️" && s.includes(e)) return cat;
  return null;
}
