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

## Next
1. Apply docs/copy-proof.md; re-run QA-critic on merged build.
2. Twilio toll-free verification submitted 2026-10-18; on approval set webhook + DEMO_MODE=false.
3. notbuying.org purchase + connect.
4. Live-model eval for 13 LLM-only cases; link ANTHROPIC_API_KEY to project.
