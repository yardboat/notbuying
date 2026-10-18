// Category → charity map. Every.org slugs verified 2026-10-18.
// Impact units only where the charity publishes one (sourced); otherwise dollars only.

export type Category = "food" | "transport" | "fashion" | "home" | "tech" | "fun" | "other";

export type Charity = {
  slug: string; // every.org slug
  name: string;
  cause: string; // short, factual
  impact?: { centsPerUnit: number; unit: string; source: string };
};

export const CHARITIES: Record<string, Charity> = {
  feedingamerica: {
    slug: "feedingamerica",
    name: "Feeding America",
    cause: "food access",
    // "$1 helps provide at least 10 meals" — feedingamerica.org/ways-to-give/faq/about-our-claims
    impact: { centsPerUnit: 10, unit: "meal", source: "https://www.feedingamerica.org/ways-to-give/faq/about-our-claims" },
  },
  "water-org": { slug: "water-org", name: "Water.org", cause: "safe water access, so no one spends the day walking for it" },
  dressforsuccess: { slug: "dressforsuccess", name: "Dress for Success", cause: "women's economic independence" },
  habitat: { slug: "habitat", name: "Habitat for Humanity", cause: "affordable housing" },
  givedirectly: { slug: "givedirectly", name: "GiveDirectly", cause: "direct cash to people in poverty" },
};

export const CATEGORY_CHARITY: Record<Category, string> = {
  food: "feedingamerica",
  transport: "water-org",
  fashion: "dressforsuccess",
  home: "habitat",
  tech: "givedirectly",
  fun: "givedirectly",
  other: "givedirectly",
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
