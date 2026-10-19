// Copy for the "Pick your charities" onboarding step. Voice: docs/voice.md.
export const PICK_TITLE = "Pick where your 10% goes.";

export const PICK_INTRO =
  "Your nos fund a yes, and you choose who gets it. We suggested three per category: the obvious one, the progressive one, the interesting one.";

export const TAG_LABELS = {
  obvious: "The obvious one",
  progressive: "The progressive one",
  interesting: "The interesting one",
} as const;

export const SAVE_LABEL = "Lock in my picks";
export const SKIP_LABEL = "Use the obvious ones";
export const DASHBOARD_LINK_LABEL = "Change your charities";
export const SAVED_TOAST = "Locked in. Your next no goes where you said.";

export const CATEGORY_INTROS = {
  food: "Skip the latte, feed someone. Pick who.",
  transport: "Skip the ride, fund the road less taken.",
  fashion: "Skip the haul, dress someone for a job.",
  home: "Skip the decor, help build a real home.",
  tech: "Skip the upgrade, close the gap for someone.",
  fun: "Skip the third round, back something that lasts.",
} as const;

export type CategoryKey = keyof typeof CATEGORY_INTROS;
