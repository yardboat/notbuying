// Copy for the text loop. SMS-safe: GSM-7 only (no emoji, no curly quotes, no em dashes).
// Dollar format: whole dollars as $5, cents as $0.50, thousands as $1,200 (see usd() in money.ts).
// Say "no" / "nos" in prose. Never "no's".

export const HELP_CONTACT = "hello@notbuying.org";

/** Price above $5,000: ask before logging. `amount` is pre-formatted, e.g. usd(cents). */
export const bigPriceConfirm = (amount: string) => `That's a big no. ${amount}? Reply YES to log it.`;
export const BIG_PRICE_LIMIT_CENTS = 500_000;
export const bigPriceCancelled = "Okay, not logged. Text it again with the right price if that was a typo.";

/** Price is 0 or negative. */
export const BAD_PRICE = "Needs a real price above $0. Try: takeout 25";

/** Chit-chat / greetings / thanks. */
export const CHITCHAT = "Ha, thanks. I only do ledgers. Text what you skipped + price, like: takeout 25. Or: totals, undo, help.";

/** New goal resets the meter. `label`/`amount` pre-formatted. Lifetime totals stay. */
export const newGoalReply = (label: string, amount: string, carried?: string) =>
  carried
    ? `New carrot: ${label}, ${amount}. ${carried} was waiting, so it's already moving. Savings and giving stay put.`
    : `New carrot: ${label}, ${amount}. Meter starts at zero. Savings and giving stay put. Every no from here builds toward it.`;

export const NO_GOAL_HINT = "No carrot yet. Text: new goal bike 500";
