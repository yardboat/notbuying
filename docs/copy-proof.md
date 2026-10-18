# Copy proof: proposed replacements (not applied)

| File | Current | Proposed | Why |
|---|---|---|---|
| src/app/issue/[week]/page.tsx:120 | Screenshot the card. Post it. Make a friend feel weird about their cart. | Screenshot the card. Post it. Somebody you know needs this. | Old line was preachy and aimed at friends. Invites sharing instead. |
| src/app/page.tsx 03 | PhoneDemo reply 1: "...Somewhere an ad budget just wept." | Keep. Matches live MOUTH. | Consistency. |
| src/app/page.tsx 03 | PhoneDemo reply 2: "...Intent 1, impulse 0." | Keep. Matches live MOUTH. | Consistency. |
| src/app/page.tsx 03 | Pick one thing you actually want. A bike. A trip. A guitar. | Keep | Concrete, unpreachy. |
| src/app/page.tsx 03 | 4. Sunday, your issue drops. One tap sends the week's donations. | Sunday, your issue drops. One tap and the week's pledges go out. | "Sends" implies we move money; terms say you donate via Every.org. |
| src/app/page.tsx 04 | Croissant → Feeding America. Rideshare → Water.org. Sneakers → Dress for Success. | Croissant, Feeding America. Rideshare, Water.org. Sneakers, Dress for Success. | Arrows are fine on web; swap only if reused in SMS/OG text (non-GSM). |
| src/app/page.tsx 04 | We never touch your money. Pledges add up in your ledger; on Sunday you donate them yourself through Every.org, a nonprofit giving platform. | We never touch your money. Pledges stack up in your ledger. On Sunday you give them yourself through Every.org. | Tighter. |
| src/app/page.tsx 02 | Walking past the bakery. Closing the tab... Those are choices too. They just never show up anywhere. | Keep | Best copy on the page. |
| src/app/page.tsx 05 | What are you saying yes to? | Keep | On thesis. |
| dashboard (all) | Check for "no's" and mixed $ formats | Use "nos"; always usd() so whole dollars are $5, cents $0.50 | Consistency. |

## Format notes
- usd() prints whole dollars as $86 for skipped and always2 as $8.60 / $0.50 for pledges. Intentional: keep skipped whole, pledged two decimals.
- Prose: "nos", never "no's". No instance of "no's" found in src.
- SMS strings: no non-ASCII found in string literals. Keep arrows and middots out of anything texted.
- Weekly SMS "said no 7 times" and "Seven nos" are both fine.
