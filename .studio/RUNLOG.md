# RUNLOG

- 2026-10-18 session 1: scaffolded app, built text loop + web experience, verified locally (signup, skip, price follow-up, totals, undo, new goal, dashboard link).
- 2026-10-18 session 2: QA-critic review; four agent branches merged; COO hardening + flow fixes; local E2E pass.
- 2026-10-18 session 3: domain live, charity picker, copy applied, QA2 pass + P1 fixes, production deploy.
- 2026-10-22 TFV support: toll-free verification (submitted as "Donate the Difference") still in review. Temporarily restored that brand on all public surfaces (src/lib/brand.ts; Not Buying logo + intro off on /) in commit 9c98a0c — revert after approval. Added Vercel DNS for notbuying.org: MX mx1/mx2.forwardemail.net (10) + TXT forward-email=hello:<Radio Colectivo inbox>, so hello@notbuying.org forwards (untested until Randall sends a test mail).
- 2026-10-22 hello@notbuying.org forwarding verified (test email received).
- 2026-10-24 TFV rejection fixed: consent/privacy/terms/sms rework, PIN sign-in, brand prefix on texts, opt-in confirmation; two independent compliance reviews; deployed 862a2bf + 1a6040c; resubmission pack written.
