# Donate the Difference: Xerox zine system

One page. Tokens live at the top of `src/app/globals.css` (`:root` + `@theme`). The OG renderer (`src/app/i/[shareId]/og-card.tsx`) mirrors them by hand because Satori can't read CSS variables, so **change both together**.

**Signature idea:** the weekly issue is a printed thing: a numbered receipt slapped onto paper, with one hot number cut out of it.

## Color
| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--paper` | #efebe1 | page ground | |
| `--paper-2` | #e4dfd2 | secondary panels | |
| `--receipt` | #fbf9f3 | the card / receipts | |
| `--ink` | #15130f | all body text, rules, borders | 15.6:1 on paper |
| `--ink-2` | #4a463e | secondary text, labels | 7.9:1 on paper (any size) |
| `--ink-3` | #6b675f | placeholders, fine meta, ≥12px | 4.7:1 on paper |
| `--hot` | #f2380f | **fills only**: bars, button fills, offset shadows, focus washes | 3.3:1 on paper (non-text ≥3 OK) |
| `--hot-ink` | #15130f | text on `--hot` | 4.7:1 |
| `--hot-deep` | #c42a0b | **accent text** on paper/receipt, stamps, focus ring, fills behind light text | 4.8:1 on paper, 5.4:1 on receipt |
| `--hot-deep-ink` | #fff6ef | text on `--hot-deep` | 5.3:1 |

Rules
- One accent. Never introduce a second hue. Greens/blues for "success" are banned; success is a stamp.
- Light text on `--hot` is **not allowed** (3.7:1). Bright hot = black text. Need light text? Use `--hot-deep`.
- Orange text on paper is always `--hot-deep`. `text-hot` is for icons/large display ≥24px only.
- `.cutout-hot` (bright fill, ink text) for in-app emphasis; the public card and OG use the deep version (`bg-hot-deep text-hot-deep-ink`) because it photographs better and survives compression.

## Type
| Role | Face | Class | Sizes |
|---|---|---|---|
| Display | Archivo Black, uppercase, tracking -0.02em, lh 0.85–0.92 | `.display` | 7xl/72 hero number · 5xl issue no. · 3xl figures · 2xl section · xl h2 |
| Body / data | IBM Plex Mono 400, **700** for emphasis | default | base 16 · sm 14 · xs 12 (min) |
| Typewriter | Special Elite | `.type` | labels and meta only: sm/xs. Never paragraphs, never buttons |

- Plex weights shipped: 400, 700 only. `font-medium`/`font-semibold` will fake-bold; don't use them.
- Special Elite is subset (Latin + punctuation, 41KB) and **not preloaded**: it's decorative, a swap flash is fine. It has no `→`: arrows render from fallback in `.type`; keep arrows in Plex text.
- Preloaded total: ~48KB (Archivo 18.6 + Plex 14.7 + 14.9), down from ~117KB.

## Space, shape, depth
- Spacing: Tailwind 4px scale. Card padding `p-6`; sections separated by `.rule` (solid 2px) or `.rule-dash` with `mt-5 pt-4/5`.
- Radius: **0**. Everything is cut paper.
- Depth is offset, never blur: `--shadow-press` (4px hot), `--shadow-press-ink` (on hot buttons), `--shadow-lift` on hover. Only the receipt gets a soft drop (`--shadow-paper`).
- Rotation: cutouts ±1–1.5°, stamps -6°, cards ≤1°. Never rotate body text.

## Motion
| Token | Value | Use |
|---|---|---|
| `--dur-tap` | 120ms | button press/hover |
| `--dur-print` + `--ease-print` | 420ms, (.2,.9,.2,1) | `.print-in`: things arriving like they came off a copier |
| `--dur-slap` + `--ease-slap` | 380ms, (.3,1.4,.5,1) | `.slap`: stamps, overshoot |
| `--dur-meter` | 900ms | goal meter fill |
Reduced motion collapses everything to 1ms (global rule). One signature moment per screen.

## Components
- `.btn` ink fill + hot offset · `.btn-hot` hot fill + ink text + ink offset. One `.btn-hot` per screen.
- `.cutout` (ink block, paper text) · `.cutout-hot` (hot block, ink text).
- `.stamp` hot-deep border/text, masked grain, multiply. Max one per screen, ≤4 words.
- `.receipt` + perforated `::after` edge. `.field` underline input, hot focus wash.
- Focus: 3px `--hot-deep` outline, 3px offset. Never remove.

## Share card
- `/i/[shareId]`: public, viewer-safe (first name or "Someone", no phone, no ids), `noindex`. Same week rules as `/issue` (Sunday-only for current week).
- OG `1200×630` (`opengraph-image`) and portrait `1080×1350` (`/i/<id>/portrait`). Fonts from `src/fonts/og/*.ttf` (subset TTF; Satori can't read woff2).
- Satori: every multi-child div needs `display:flex`; interpolate text into one string (`{`${a} b`}`); only glyphs in the subset (no `→`, use a hot square bullet).

## Don't
- Beige fintech gradients, rounded cards, emoji, green checkmarks.
- Orange paragraphs. Light text on bright hot. A second accent.
- Guilt copy in display type. Display type shouts about the user's win, never at them.
