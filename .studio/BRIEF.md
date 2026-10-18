# BRIEF — Donate the Difference
_Status: draft (pre–Gate A) · 2026-10-18 · slug: donate-the-difference_

## 1. Purpose
- Type: new build
- For: prototype — a real-world app tested with real people (Randall + 5–10 friends). No client. Brand-match sponsor is the v2 / pitch angle.
- Audience and the moment they meet it: people who see through the buy-more machine and want to live more intentionally ("punk rockers"). They meet it in the moment of NOT buying something — standing at the bakery counter, closing a shopping tab — phone in hand.
- What it must make them feel / do: "Oh, that's clever" — rewarded for what you DON'T spend. Do: text every skip, in the moment.

## 2. Success
- The one metric: **skips logged per active tester per week — target 5+ in week 1.** Proves the in-the-moment habit.
- Deadline / v1 target: soft, 2–3 weeks (by ~2026-11-08).

## 3. Concept
- One sentence: An anti-Acorns — text what you didn't buy, watch it build toward something you actually want, and send 10% of it to a charity matched to what you skipped.
- The one-of-one twist: every other money product rewards spending; this rewards not spending, and turns each "no" into progress for you and for the world.
- Mechanic: user texts "croissant 5" → ledger records $5 toward their one goal (e.g. $500 bike) + $0.50 pledged to a charity matched by category (food → food access; transport → mobility/transport access, etc.). Price always supplied by the user; if missing, the reply asks for it.
- Must never be: preachy/guilt-trippy · budgeting-app beige (Mint/YNAB) · fake-woke charity marketing / poverty porn · austerity/deprivation.
- References: **Cash A (awwwards.com/sites/cash-a)** — steal how it visualizes money as tangible, and its micro-interactions. Benchmarks to exceed: Mwen, threeangle, Jeni's FC.

## 4. Experience
- Shape: mobile web first, then the relationship shifts to text.
  1. **Onboarding (mobile web):** ~60-sec scroll manifesto — clear and emotive. The world pays you to be frivolous every day; this is how you opt out. Beats: the ad machine's numbers → the flip → the mechanic → set your goal → verify phone → send your first text.
  2. **Text loop (SMS):** log skips ("croissant 5"), "totals"/"how am I doing", "new goal: Paris 1200", "undo". Every skip gets an instant receipt reply: item, goal %, pledge + charity.
  3. **Sunday:** weekly SMS with totals + link to the numbered recap card ("Issue 03"). Card drives to the mobile web dashboard.
  4. **Mobile web dashboard:** set/change goal, see goal progress + impact lines, and **the button that actions the week's charitable donations** (settle-up via Every.org donate links, per charity).
- Hero moment: **the weekly recap card** — zine-style, numbered, screenshot-worthy. Sunday-only (Randall's call over COO's churn concern; logged).
- Screen inventory (draft): manifesto/onboarding · goal setup · phone verify · "text us now" handoff · dashboard · weekly card (public share view + owner view) · settle-up/donate · goal reached · legal (privacy, terms, SMS opt-in/consent).
- Physital: none beyond the text thread in v1.
- Waiting/ritual moments: phone-verify wait; the week between issues (dashboard shows "Issue 04 drops Sunday").

## 5. Craft
- Visual route: **Xerox zine** — photocopied textures, cut-and-paste type, stamps, one hot accent; punk but legible. Plus Cash A money-visualization + micro-interactions.
- Motion: polish everywhere + one signature moment (candidate: goal object assembling as skips land, or the card being "printed").
- Voice: **warm thesis, punk mouth.** Hero line: "Every no is a yes to something." Example: "The croissant industry will survive. A kid in a food desert eats."

## 6. Systems
- Accounts: phone number only. Web signup → SMS verify code; dashboard login by texted magic link. No passwords.
- Data: Neon Postgres (users, goals, skips, pledges, weekly issues, settle-ups).
- AI: Claude (Haiku-tier) parses inbound texts → {intent, item, price, category}. Verification: price must come from user; ambiguous → clarifying reply; category → charity via fixed map. Golden set for parser.
- SMS: Twilio toll-free number (inbound webhook + outbound replies + Sunday scheduled send). Toll-free verification runs in parallel with build.
- Donations: ledger only. No custody of money. Settle-up = deep links to Every.org donation pages pre-filled per charity + "I donated" confirmation. Impact claims are honest, sourced ranges only where the charity publishes cost-per-unit; otherwise dollars only.
- Savings: tracked, not moved.

## 7. Constraints
- Legal/compliance: SMS consent + opt-out (STOP/HELP), privacy policy, terms — required for toll-free verification. No claims of tax deductibility from us. Charity names/logos used factually. No money custody.
- Stack exceptions: Twilio (SMS) added; Every.org donate links. Resend not needed in v1.

## 8. Toolset
- House set only: GitHub, Vercel, Neon, Claude API, Gemini (imagery), Twilio, Every.org.
- Agents activated: strategist, tech-lead, experience-architect, art-director, writer, ai-systems-engineer, builder, craft-engineer, physital-engineer (SMS + donate links), qa-critic, launch-ops. Skipped: brand-adapter (no brand), asset-producer light-use only.

## 9. Definition of v1 done
- [ ] Text loop end to end: skip → receipt → ledger; totals; change goal; undo; STOP/HELP
- [ ] Onboarding manifesto + signup: scroll story, goal set, phone verify, first text
- [ ] Dashboard + Sunday card + settle-up donate flow
- [ ] QA pass at 390px/1440px, all states; analytics for success metric (skips/tester/week)
- Custom domain: bought + connected at Randall's production "go".

## 10. Cost forecast
_(tech-lead to refine)_

## 11. Clearance checklist
_(see Gate A message)_
