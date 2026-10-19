// Category → charity map. Every.org slugs verified 2026-10-18.
// Impact units only where the charity publishes one (sourced); otherwise dollars only.

import { CHARITY_OPTIONS } from "./charity-options";

export type Category = "food" | "transport" | "fashion" | "home" | "tech" | "fun" | "other";

export type Charity = {
  slug: string; // every.org slug
  name: string;
  cause: string; // short, factual
  impact?: { centsPerUnit: number; unit: string; source: string };
};

const GIVEDIRECTLY: Charity = { slug: "givedirectly", name: "GiveDirectly", cause: "direct cash, no strings attached" };

/** Every charity a skip can be pledged to: the 18 picks plus GiveDirectly for "other". */
export const CHARITIES: Record<string, Charity> = Object.fromEntries([
  ...Object.values(CHARITY_OPTIONS)
    .flat()
    .map((o) => [o.slug, { slug: o.slug, name: o.name, cause: o.cause, ...(o.impact ? { impact: o.impact } : {}) } as Charity]),
  [GIVEDIRECTLY.slug, GIVEDIRECTLY],
]);

/** Defaults (the obvious pick) used until a user picks their own. */
export const CATEGORY_CHARITY: Record<Category, string> = {
  food: CHARITY_OPTIONS.food[0].slug,
  transport: CHARITY_OPTIONS.transport[0].slug,
  fashion: CHARITY_OPTIONS.fashion[0].slug,
  home: CHARITY_OPTIONS.home[0].slug,
  tech: CHARITY_OPTIONS.tech[0].slug,
  fun: CHARITY_OPTIONS.fun[0].slug,
  other: GIVEDIRECTLY.slug,
};

export const CATEGORY_LABEL: Record<Category, string> = {
  food: "Food & drink",
  transport: "Rides & travel",
  fashion: "Clothes & stuff you wear",
  home: "Home",
  tech: "Gadgets",
  fun: "Going out",
  other: "Everything else",
};

export function charityFor(category: Category): Charity {
  return CHARITIES[CATEGORY_CHARITY[category]];
}

/** Honest impact line, or null if the charity doesn't publish a unit cost. */
export function impactLine(charity: Charity, cents: number): string | null {
  if (!charity.impact) return null;
  const units = Math.floor(cents / charity.impact.centsPerUnit);
  if (units < 1) return null;
  return `~${units} ${charity.impact.unit}${units === 1 ? "" : "s"}`;
}

export function everyOrgLink(slug: string, cents: number, successUrl: string, partnerId: string) {
  const amount = (cents / 100).toFixed(2).replace(/\.00$/, "");
  const q = new URLSearchParams({
    amount,
    frequency: "ONCE",
    success_url: successUrl,
    partner_donation_id: partnerId,
  });
  return `https://www.every.org/${slug}?${q.toString()}#donate`;
}
