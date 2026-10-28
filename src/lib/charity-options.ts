import type { Category } from "./charities";

// Three picks per category: the obvious one, the progressive one, the interesting one.
// Every.org slugs checked 2026-10-18 (profile pages load with the org's name). See docs/charity-research.md.
// Impact units appear ONLY where the charity itself publishes a cost-per-unit figure.

export type Tag = "obvious" | "progressive" | "interesting";
export type CharityOption = {
  slug: string;
  name: string;
  tag: Tag;
  why: string;
  cause: string;
  impact: { centsPerUnit: number; unit: string; source: string } | null;
};

export type PickCategory = Exclude<Category, "other">;
export const PICK_CATEGORIES: PickCategory[] = ["food", "transport", "fashion", "home", "tech", "fun"];

export const CHARITY_OPTIONS: Record<PickCategory, [CharityOption, CharityOption, CharityOption]> = {
  food: [
    {
      slug: "feedingamerica",
      name: "Feeding America",
      tag: "obvious",
      why: "The country's biggest food bank network. Your skipped takeout becomes groceries.",
      cause: "food access",
      impact: { centsPerUnit: 10, unit: "meal", source: "https://www.feedingamerica.org/ways-to-give/faq/about-our-claims" },
    },
    {
      slug: "soulfirefarm",
      name: "Soul Fire Farm",
      tag: "progressive",
      why: "Farmer-led, fighting food apartheid at the root: land, training, fresh food.",
      cause: "food sovereignty and farmer training",
      impact: null,
    },
    {
      slug: "27-3521132",
      name: "World Central Kitchen",
      tag: "interesting",
      why: "Chefs who show up first after disasters and cook real meals on the spot.",
      cause: "chef-led meals in crises",
      impact: null,
    },
  ],
  transport: [
    {
      slug: "water-org",
      name: "Water.org",
      tag: "obvious",
      why: "Water at home means hours back every day that used to go to the walk.",
      cause: "safe water and sanitation",
      impact: null,
    },
    {
      slug: "railstotrails",
      name: "Rails to Trails Conservancy",
      tag: "progressive",
      why: "Old rail lines turned into free, car-free paths for everyone.",
      cause: "public trails and car-free routes",
      impact: null,
    },
    {
      slug: "worldbicyclerelief",
      name: "World Bicycle Relief",
      tag: "interesting",
      why: "Rugged bikes for rural students and workers. A 4-hour walk becomes an hour ride.",
      cause: "bikes for school and work",
      impact: null,
    },
  ],
  fashion: [
    {
      slug: "dressforsuccess",
      name: "Dress for Success",
      tag: "obvious",
      why: "Interview outfits and career coaching for women going back to work.",
      cause: "career support for women",
      impact: null,
    },
    {
      slug: "freethegirls",
      name: "Free The Girls",
      tag: "progressive",
      why: "Donated bras become micro-businesses for survivors of trafficking.",
      cause: "income for trafficking survivors",
      impact: null,
    },
    {
      slug: "soles4souls",
      name: "Soles4Souls",
      tag: "interesting",
      why: "Turns unworn shoes and clothes into jobs and kicks for people who need them.",
      cause: "reused shoes and clothing",
      impact: null,
    },
  ],
  home: [
    {
      slug: "habitat",
      name: "Habitat for Humanity",
      tag: "obvious",
      why: "Builds and repairs homes alongside the families who'll live in them.",
      cause: "affordable housing",
      impact: null,
    },
    {
      slug: "communitysolutions",
      name: "Community Solutions",
      tag: "progressive",
      why: "Helps cities measurably end homelessness, not just manage it.",
      cause: "ending homelessness, city by city",
      impact: null,
    },
    {
      slug: "shpbeds",
      name: "Sleep in Heavenly Peace",
      tag: "interesting",
      why: "Volunteers build bunk beds by hand so no kid sleeps on the floor.",
      cause: "beds for kids",
      impact: null,
    },
  ],
  tech: [
    {
      slug: "codeorg",
      name: "Code.org",
      tag: "obvious",
      why: "Computer science in every school, not just the rich ones.",
      cause: "CS education in schools",
      impact: null,
    },
    {
      slug: "blackgirlscode",
      name: "Black Girls CODE",
      tag: "progressive",
      why: "Building the next wave of tech creators, not just tech customers.",
      cause: "tech skills for Black girls",
      impact: null,
    },
    {
      slug: "eff",
      name: "Electronic Frontier Foundation",
      tag: "interesting",
      why: "Lawyers and hackers defending your privacy from the gadgets you skipped.",
      cause: "digital rights and privacy",
      impact: null,
    },
  ],
  fun: [
    {
      slug: "musicares",
      name: "MusiCares",
      tag: "obvious",
      why: "Skip the ticket, back the band: health and crisis help for musicians.",
      cause: "safety net for musicians",
      impact: null,
    },
    {
      slug: "musicwill",
      name: "Music Will",
      tag: "progressive",
      why: "Puts guitars, drums and real music classes in public schools.",
      cause: "music education in public schools",
      impact: null,
    },
    {
      slug: "archive",
      name: "Internet Archive",
      tag: "interesting",
      why: "Free books, music, films and the Wayback Machine. Fun that's free forever.",
      cause: "free digital library",
      impact: null,
    },
  ],
};

export const VERIFIED_ON = "2026-10-18";

export function defaultPick(cat: PickCategory) {
  return CHARITY_OPTIONS[cat][0].slug;
}

export function isValidPick(cat: PickCategory, slug: string) {
  return CHARITY_OPTIONS[cat].some((o) => o.slug === slug);
}
