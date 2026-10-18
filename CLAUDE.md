# Donate the Difference — project memory

This repo is run by the studio-coo pipeline. Randall (Creative Director) never touches code; Claude is COO.

## Before doing anything
1. Read `.studio/STATE.md`, then `.studio/BRIEF.md` and `.studio/DECISIONS.md`.
2. Follow the studio-standards skill.

## Always
- Write state before ending: `STATE.md`, append `RUNLOG.md`, commit.
- Never commit secrets. Never ask Randall to run commands.

## Project specifics
- Next.js 16 App Router, Tailwind v4, raw SQL (`src/lib/db.ts`): Neon via DATABASE_URL, PGlite fallback locally.
- Text loop: `src/lib/parse.ts` (regex fast path) → `src/lib/llm.ts` (Haiku fallback, never invents prices) → `src/lib/ledger.ts` (records + replies).
- Channels: `/api/sms/inbound` (Twilio, signature-checked), `/api/sim` (in-app simulator).
- DEMO_MODE (default true) skips SMS codes until toll-free verification clears; set DEMO_MODE=false to go live.
- Env: DATABASE_URL, ANTHROPIC_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, SESSION_SECRET, CRON_SECRET, NEXT_PUBLIC_APP_URL, DEMO_MODE.
