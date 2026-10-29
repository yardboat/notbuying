# STATE — Not Buying (formerly Donate the Difference)
_Updated 2026-10-24_

**Phase:** P5/P6 — craft pass + hardening merged; tester-ready in demo mode.

## Session 2 (agents)
- QA-critic (independent): verdict "not tester-ready" — 3 P0, 16 P1. All P0 and most P1 fixed this session.
- AI-systems: parser v2 + 92-case golden set, vitest 105/105 (merged).
- Craft-engineer: ransom-note goal collage, hero clamp, progressive reveal, micro-interactions (merged).
- Art-director: AA-contrast accent split, font trim, public share card /i/[id] + OG images, design/system.md (merged).
- Writer: voice guide, receipt lines, copy constants, docs/copy-proof.md (landing/dashboard proposals not yet applied).

## COO fixes
- Demo invite code gate (DEMO_INVITE_CODE); signup no longer overwrites an existing goal.
- Fail closed: SESSION_SECRET required on Vercel; no PGlite on Vercel; CRON_SECRET required.
- Big-price confirm (> $5,000, reply YES), bad price, chit-chat reply, Twilio retry dedupe.
- Sunday text magic link to issue; settle opens tab inside the tap (iOS); simulator scroll + error state.
- Vercel Analytics + /api/admin/stats (skips per tester per week).
- Code-send rate limit (live mode).

## Session 3
- notbuying.org bought (auto-renew off) and attached; production deploys enabled.
- "Pick your charities" onboarding step: 3 picks per category (obvious/progressive/interesting), per-user pledge routing, dashboard block. Research: docs/charity-research.md.
- Writer copy-proof applied. QA2 (independent): SHIP to testers; its two P1s (mobile focus under save bar, partial-save overwrite) fixed.

## 2026-10-22 TFV watch
- TFV in review as "Donate the Difference"; site temporarily rebranded to match (see DECISIONS). On approval: revert 9c98a0c, set webhook, DEMO_MODE=false, real-phone test.
- hello@notbuying.org forwarding added via Vercel DNS (Forward Email); verified working 2026-10-22 (Randall received a test email).

## 2026-10-24 TFV rejected → fixed, ready to resubmit
- Rejected: 30482 (Gmail as business email), 30513 (SMS consent required/bundled), 30536 (privacy policy lacked no-sharing clause). Root cause: no pre-submission compliance review.
- Fixed and live (commit 1a6040c): brand back to Not Buying everywhere (reverted 9c98a0c); optional, unticked, standalone SMS consent with double opt-in + confirmation text; PIN sign-in (non-SMS path); invite gate removed; full /privacy, /terms, /sms with branded opt-in screenshot; every outbound text starts "Not Buying"; footer "Not Buying by Yardboat LLC · Atlanta, GA · hello@notbuying.org"; dashboard texts on/off; cron only texts consenting users.
- Independent qa-critic compliance review x2: second pass "likely approve, no blockers".
- Resubmission pack: .studio/twilio-tfv-pack.md (Randall submits; window closes 2026-10-31).
- After approval: Twilio webhook → https://notbuying.org/api/sms/inbound, DEMO_MODE=false, real-phone test (code, confirmation, receipt, HELP, STOP).

## 2026-10-27 TFV rejected then resubmitted
- Rejected 30482 (gmail contact email); resubmitted with hello@notbuying.org. Await result; if >3 business days, open Twilio ticket citing SID HHeaaab94185e9c9014962ca4920780cf1.

## 2026-10-28 TFV APPROVED
- DEMO_MODE=false set on Vercel production; redeploying. Next: point Twilio number webhook at https://notbuying.org/api/sms/inbound (POST), then real-phone test.
- Anthropic key set in Vercel prod as ANTHROPIC_KEY (code accepts both names). Twilio webhook set. Real-phone test PASSED 2026-10-28; cleared to invite testers.

## 2026-10-28 Three-way split + visual dashboard (shipped 1e2fc52)
- Every no splits by user %: carrot (named thing + target) / savings (optional name + target) / giving (min 5%). Default 60/30/10; existing users see a "choose your split" banner.
- Funded carrot pauses; its share is held and carries to the next carrot (instantly funds it if the held amount covers the target).
- Picker at /setup/split (drag seams, steppers, presets); onboarding = signup -> split -> charities.
- Dashboard: lifetime hero, where-it-went bar, carrot meter, savings + giving cards, running-total chart, category bars; lists collapsed.
- Sunday card shows the split + carrot and savings progress (public card never shows the private savings name).
- Independent QA: ship after fixes; all P1s fixed. Open P2: card carrot % is "now" not "as of week end".

## 2026-10-28 Dashboard simplified (Randall feedback)
- "Savings" everywhere (custom fund name removed); carrot shown as a plain meter (ransom-letter collage retired from the dashboard); phone simulator removed (logging stays on text; a plain web log box shows only for people with texts off, since texting is optional); three equal bucket cards; extra sections moved into dropdowns.

## 2026-10-28 Accent -> ink blue
- --hot #2a5394 (fills, buttons, carrot), --hot-deep #1c3863 navy (accent text, cutouts), light text on both; savings fill warm grey #a39e92. Site, share card, icons, logo SVGs, motion clips (re-rendered), TFV opt-in screenshot all updated.

## 2026-10-29 Edit carrot + clean slate
- /setup/carrot: edit name/price in place (progress kept; lowering below saved funds it), or pick the next carrot when funded/none (waiting money carries). "Edit carrot" button on the carrot card.
- Clean slate (dashboard dropdown, type CLEAR): clears all skips (kept on file via cleared_at/undone_at), closes carrots, warns about unsent pledges; split, charities, texts kept; lands on /setup/carrot?fresh=1.

## Next (tester wave)
1. Pre-tester audit on the live SMS build: qa-critic end to end + live-model eval of the LLM-only parser cases (key now set).
2. First real Sunday recap (Nov 1): force-send one MMS card to Randall before then; confirm cron schedule.
3. Settle-up: one real small donation through Every.org end to end.
4. Ops: Twilio spend alert, error alerts, /api/admin/stats check.
5. Invite testers (Randall supplies list + invite text); success metric = skips per tester per week.
