---
name: EN Practice v2
version: 2.0.0-proposal
status: proposal-for-review
supersedes: en-practice/DESIGN.md ("The Chameleon Workbook")
---

# Design System: EN Practice v2 — "Lexi's Flight Path"

## 0. The decision this document makes

v1 was built as **one primitive set wearing nine skins** (`en-practice/DESIGN.md`, "The Chameleon Workbook"): 9 theme profiles x 10 background worlds x 5 solid primaries x light/dark, all resolved by `getThemeTokens()` in `src/theme/themeTokens.js`, with 1,238 lines of token code and 41,464 bytes of global CSS to service them. The catalog (`docs/theme-profile-catalog.md`) openly framed this as a feature: "nếu muốn tạo khác biệt về brand: Neo Editorial".

The v2 brief retires that idea. **One product, one interface.** Not because theming is hard, but because the nine skins are the reason v1 cannot develop a recognisable craft floor: every component has to survive nine art directions, so it can commit to none. A playable, mascot-led, cartoon learning product needs the opposite property — a single, opinionated, *specific* visual truth that a learner recognises from a thumbnail.

Consequences of this decision, stated plainly so nobody re-litigates them mid-build:

| v1 | v2 |
|---|---|
| 9 theme profiles | 1 design language, 2 modes (light/dark) |
| 10 background worlds | 1 canvas per mode |
| 5 accent swaps | 1 accent + 1 reward accent, fixed |
| Per-page theme files (`dashboardTheme.js`, `ieltsTheme.js`, `speakingTheme.js`, `writingTheme.js`, `leaderboardTheme.js`, `weeklyReportTheme.js`, `profileTheme.js`, `dictionaryTheme.js`, `vocabularyCheckTheme.js`, `pagePalettes.js`, `config/pagePalettes.js`) | **deleted** — one token file |
| Inline theme objects from `useTheme()` | CSS custom properties only |
| antd for structure + Tailwind + hand-written CSS | Tailwind v4 utilities + a small owned component kit |
| Floating mascot image with CSS filters | Lexi as an animated character system with 8 states |
| 4 fonts in the CSS import (DM Sans, Fraunces, IBM Plex Mono, IBM Plex Sans, Inter, Manrope, Space Grotesk) | 2 families, 5 weights total |

The theme *toggle* survives in one vestigial form: light/dark follows the OS, and the user may override it in Settings. Nothing else is themable.

---

## 1. North Star

**"Lexi's Flight Path."** A cartoon owl in a graduation cap leads a visible path of small, finishable steps. The visual world is built from what a flight path looks like at dusk: a **warm paper ground** (like a notebook page, because this is study), **deep teal chrome** (the one action colour), and **amber accents** (the reward colour). Progress is not a dashboard of numbers — it is a path you can see yourself moving along, with Lexi standing on the next node.

The mood is **bright, confident, friendly, and exam-credible**. Not a preschool app: there is no rainbow, no bouncy-house gradient, no emoji as UI. Not a corporate dashboard either: there are no 1px grey hairlines and no 14px neutral type on white. The register sits between Duolingo's cheer and a good textbook's legibility — because the user is a 16-22 year old Vietnamese student who wants a 6.5, and who will abandon anything that feels like a toy *or* like homework.

**Key characteristics**

1. **Warm paper, not white.** The canvas is `#FBF8F2`, an off-white with a faint warm cast. Pure white is reserved for surfaces that must feel raised.
2. **One action colour, one reward colour.** Teal does work; amber does reward. Semantics (correct / wrong / info) are separate and never repurposed.
3. **Every interactive thing looks pressable.** A 4px solid bottom edge that collapses on `:active` — the physical-toy affordance — applied consistently to buttons, answer tiles and list rows.
4. **Borders are 2px and visible, never hairlines.** `#E4E0D4` on canvas, with a darker `border-strong` wherever the border is the only thing identifying a control.
5. **Radius is a friendly 16-20px on containers, 12-14px on controls, full pill on chips.** No radius below 8px anywhere except the focus ring.
6. **Lexi is a character, not a logo.** She appears at the moments that carry emotion — onboarding, a wrong answer, a finished set, a streak — and is absent from the middle of a reading passage.7. **Type is big and rounded.** Nunito for display and UI, Baloo 2 as the optional display partner. Both have verified Vietnamese subsets (Section 4).
8. **Motion is short and physical.** 90-160ms for state, 240ms for a reveal, one 900ms celebration. The press, not the sparkle, is the signature.

---

## 2. Colour

All values below are the **shipped tokens**. Every pair is measured by `_design/contrast_check.py`, which is part of the deliverable and must be re-run whenever a colour changes:

```
python _design/contrast_check.py     # exit 0 = every required pair passes
```

### 2.1 Light mode

| Token | Value | Role |
|---|---|---|
| `--brand-teal` | `#0E7C6B` | The single action colour. Primary buttons, active nav, focus ring, links. |
| `--brand-teal-strong` | `#0A6355` | Pressed / hovered action, and the 4px bottom edge of a primary button. |
| `--brand-teal-soft` | `#E4F5F0` | Selected answer tile, tinted section, chip background. |
| `--brand-amber` | `#F5B32E` | The reward colour. XP, streak flame, coins, the "Continue" affordance on a milestone. |
| `--brand-amber-soft` | `#FDF3DC` | Reward banner background. |
| `--canvas` | `#FBF8F2` | The page ground. |
| `--surface` | `#FFFFFF` | Cards, sheets, the sidebar rail. |
| `--surface-alt` | `#F3F0E8` | Inset blocks: locked lesson nodes, table stripes, code/quote blocks. |
| `--ink` | `#14232B` | Headings and body. |
| `--ink-soft` | `#3B525E` | Secondary body, descriptions. |
| `--ink-muted` | `#5E7683` | Metadata, captions, table headers. |
| `--ink-faint` | `#8FA3AD` | **Decoration and disabled only** — 2.47:1 on canvas. Never a sentence. |
| `--border` | `#E4E0D4` | Decorative separator between two surfaces. |
| `--border-strong` | `#8B8674` | Any border that is the control's only identity: inputs, tiles, focus outline. 3.44:1 on canvas. |
| `--correct` | `#12855A` | Correct answer, passed band, success. |
| `--wrong` | `#C93B36` | Wrong answer, failed band. |
| `--attention` | `#9C5809` | Warning, "needs review", expiring credit. |
| `--info` | `#0B6E8F` | Neutral information, hints, transcripts. |

### 2.2 Dark mode

Not an inversion. The dark canvas keeps the warm-cast *absence* — it is a deep teal-black, never neutral grey — and the action colour lightens rather than desaturating.

| Token | Value | Role |
|---|---|---|
| `--brand-teal` | `#4FCDB6` | Action colour, lightened for the deep ground. |
| `--brand-teal-strong` | `#7ADDC9` | Hover step (lighter, not darker — dark mode lifts on hover). |
| `--brand-teal-soft` | `#123B37` | Tinted selection surface. |
| `--brand-amber` | `#F7C455` | Reward colour. |
| `--brand-amber-soft` | `#3C2F12` | Reward banner background. |
| `--canvas` | `#0C161B` | Page ground. |
| `--surface` | `#14232B` | Cards and sheets. |
| `--surface-alt` | `#1C2F38` | Inset blocks. |
| `--ink` | `#EAF4F2` | Primary text. |
| `--ink-soft` | `#B9CECB` | Secondary text. |
| `--ink-muted` | `#8DA5A3` | Metadata. |
| `--ink-faint` | `#647C7B` | Decoration / disabled. 4.11:1 on canvas — still not a body tier. |
| `--border` | `#25393F` | Decorative separator. |
| `--border-strong` | `#647C7B` | Control-identifying border. 4.11:1 on canvas. |
| `--correct` | `#4BD08B` | Success. |
| `--wrong` | `#F07C74` | Failure. |
| `--attention` | `#E8A838` | Warning. |
| `--info` | `#5CC2E0` | Information. |

### 2.3 Measured contrast (this is the receipt, not a claim)

Verified by the script in `_design/contrast_check.py`. Weakest required pair in the whole system is `ink-muted on canvas` at **4.51:1** in light mode.

**Light mode**

| Pair | Ratio | Required | |
|---|---|---|---|
| white label on `brand-teal` | 5.10 | 4.5 | pass |
| white label on `brand-teal-strong` | 7.17 | 4.5 | pass |
| dark ink on `brand-amber` | 8.71 | 4.5 | pass |
| `ink` on canvas | 15.18 | 4.5 | pass |
| `ink-soft` on canvas | 7.76 | 4.5 | pass |
| `ink-muted` on canvas | 4.51 | 4.5 | pass |
| `brand-teal` as text on canvas | 4.82 | 4.5 | pass |
| `brand-teal` as text on `brand-teal-soft` | 4.53 | 4.5 | pass |
| `correct` on surface | 4.64 | 4.5 | pass |
| `wrong` on surface | 5.05 | 4.5 | pass |
| `attention` on surface | 5.51 | 4.5 | pass |
| `info` on surface | 5.77 | 4.5 | pass |
| `border-strong` on canvas | 3.44 | 3.0 | pass |

**Dark mode** — every pair above measures between **3.61** and **16.33**; the weakest required pair is `border-strong on surface` at 3.61:1 against a 3.0 requirement.

Two documented exceptions, both deliberate:
- `ink-faint` measures **2.47:1** (light) and **4.11:1** (dark). It is legal only on decoration, dividers, and disabled labels — the same carve-out WCAG 2.1 gives inactive controls (SC 1.4.3). The dark value sits just under 4.5, so it must never carry an enabled sentence either.
- `border` measures 1.25:1. It is a *separator*, not a control boundary, so SC 1.4.11 does not apply. Where a border carries meaning, `border-strong` is mandatory.

### 2.4 Named rules

**The Two-Colour Rule.** Teal does work, amber does reward. There is no third brand colour. If a surface needs emphasis, it uses weight, size, teal, or amber — in that order. Semantic colours (correct/wrong/attention/info) appear only to report state, never to decorate.

**The Amber-Label Rule.** Amber is a **light** colour: it carries `#14232B` ink, never white. White on `#F5B32E` measures 1.72:1 and is a ship-blocker. Any amber surface ships with the dark ink token.

**The No-Hairline Rule.** A border that is the only thing identifying a control must be `border-strong`, which clears 3:1 on both canvas and surface. `border` may separate two surfaces that are already distinguishable by fill, and nothing else.

**The Faint-Ink Ban.** `ink-faint` may not carry an enabled sentence at any size. It exists for dividers, disabled labels, and placeholder decoration.

**The No-Gradient-Fill Rule.** Gradients are permitted exactly two places: the landing hero backdrop (a two-stop teal wash over canvas, maximum 12% intensity) and a celebration overlay that lasts under one second. Every other fill is a solid token. There are no gradient text fills anywhere, ever.

---

## 3. Shape

The shape language is **soft, confident, and slightly irregular in the mascot layer only**.

| Token | Value | Applies to |
|---|---|---|
| `--radius-chip` | `999px` | Chips, streak pill, progress track, avatar, status dot |
| `--radius-sm` | `10px` | Inline inputs, small badges, table cell hover |
| `--radius-control` | `14px` | Buttons, answer tiles, inputs, tabs, nav rows |
| `--radius-card` | `20px` | Cards, panels, drawers, modals, list rows |
| `--radius-hero` | `28px` | Hero panels, the lesson-path unit header, full-bleed sheets |
| `--radius-blob` | `42% 58% 55% 45% / 48% 42% 58% 52%` | **Lexi only.** Organic asymmetry for the mascot silhouette. |

Two things are load-bearing:

1. **The 8px minimum.** Nothing in the UI has a radius below 10px except a 2px progress-bar inner fill and the 4px press edge. Sharp corners read as v1.
2. **The Press Edge.** A solid 4px bottom edge on every pressable surface (Section 5). It is not a shadow — it is a *second border* in the darker step of the surface colour. This is the single most recognisable element of the system and it must be identical on buttons, answer tiles, lesson nodes and cards-with-a-primary-action.

---

## 4. Typography

**Families**
- **Display + UI:** Nunito (`400, 500, 600, 700, 800`)
- **Display alternative for landing headlines:** Baloo 2 (`500, 600, 700, 800`)
- **Numeric / code:** JetBrains Mono (`500, 600`) — used only for band-score readouts, IPA strings, timer digits and credit counts, where tabular figures matter. Never for prose.

Both Nunito and Baloo 2 were verified to ship a **`vietnamese` unicode subset** covering `U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9` — queried directly from the Google Fonts CSS API. This matters more than usual: **Vietnamese is the default and index language**, and v1 shipped `Inter` while its own `index.html` loaded `Inter` but `DESIGN.md` claimed IBM Plex Sans. Getting the diacritic coverage right is a correctness requirement, not a nicety.

Self-host both via `@font-face` with `font-display: swap` and `unicode-range` on the Vietnamese subset. Do not link Google Fonts from `index.html` — v1 does, which costs a render-blocking third-party round trip before first paint.

**Scale** (1.250 major-third-ish, tuned, `rem` at 16px root)

| Role | Family | Size | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|---|
| `display-xl` | Baloo 2 | 3.5rem / 56px | 800 | 1.04 | `-0.02em` | Landing hero only |
| `display` | Nunito | 2.5rem / 40px | 800 | 1.10 | `-0.02em` | Page-opening statement |
| `h1` | Nunito | 2rem / 32px | 800 | 1.15 | `-0.015em` | Page title |
| `h2` | Nunito | 1.5rem / 24px | 800 | 1.20 | `-0.01em` | Section heading |
| `h3` | Nunito | 1.125rem / 18px | 700 | 1.30 | `0` | Card title |
| `body-lg` | Nunito | 1.0625rem / 17px | 500 | 1.55 | `0` | Question prompt, instruction |
| `body` | Nunito | 1rem / 16px | 400 | 1.60 | `0` | Prose, reading passage |
| `label` | Nunito | 0.875rem / 14px | 700 | 1.20 | `0.01em` | Button, nav, tab |
| `micro` | Nunito | 0.8125rem / 13px | 600 | 1.40 | `0.01em` | XP counter, metadata, chip |
| `mono` | JetBrains Mono | 0.875rem / 14px | 600 | 1.30 | `0.02em` | Band score, timer, IPA |

The floor is **13px**. Nothing renders smaller. v1's `Micro` step was 11px, which is below a comfortable reading size for the target age group on a phone.

**Named rules**

**The Nunito-First Rule.** Nunito carries display and UI. Baloo 2 is allowed only for the landing `display-xl` and the Lexi speech bubble. Never introduce a third text family to solve hierarchy; change weight and size.

**The Weight-Ceiling Rule.** Nunito's real ceiling is 800 in the weights we load. Never request 900; never render a weight that was not loaded. v1's `DESIGN.md` documented browser-synthesised fake bold as a bug it had already been bitten by — do not reintroduce it.

**The Passage Rule.** Reading passages, Writing model answers and transcripts use `body` at 16px/1.60 with `max-width: 68ch` and no tracking adjustment. Long-form text is never negatively tracked and never set in a weight above 500. It is the one place in the product where legibility outranks personality.

**The Tabular Rule.** Any number that changes in place (timer, XP, band, credit balance) renders in `mono` or with `font-variant-numeric: tabular-nums`, so digits do not jitter the layout as they count.

---

## 5. Elevation, Depth and the Press

**Depth is a physical affordance, not an atmospheric one.** v1 used blur, gradient panels and soft shadows as decoration across nine skins; v2 replaces all of it with one idea: *a pressable thing has a bottom edge, and pressing it removes the edge.*

### The Press Edge

```
resting:  box-shadow: 0 4px 0 0 <edge-colour>
hover:    translateY(-1px) + brighten fill
active:   translateY(4px);  box-shadow: 0 0 0 0 <edge-colour>
focus:    outline: 3px solid var(--brand-teal); outline-offset: 2px (edge kept)
```

Edge colours are derived, never invented: a filled teal button gets `--brand-teal-strong`; a white surface gets `--border-strong`; an amber reward button gets a 22%-darkened amber (`#B8811A`).

Three rules make this safe, and they exist because the naive version of this pattern is inaccessible:

**The Contrast-Carry Rule.** The press edge must never be the only thing separating the control from the background. Every pressable surface also carries a real 2px border or a fill that clears 3:1 against the canvas on its own — so that if the edge is removed (reduced motion, forced colours, print), the control is still visible. Duolingo's own green `#58CC02` with a white label measures **1.86:1**; that is the exact failure this rule prevents.

**The Transform-Not-Layout Rule.** The press is a `transform`, never a change in `border-width` or `padding`. Changing border width reflows the label and makes the text jump on click.

**The Reduced-Motion Rule.** `prefers-reduced-motion: reduce` removes the `translateY` lift and the transition but **keeps the edge colour change**, because the change is meaningful feedback, not decoration. v1 got this instinct right ("KHÔNG dùng cách 'giết' toàn cục") and v2 keeps it.

### Surfaces

| Level | Treatment | Use |
|---|---|---|
| 0 — Canvas | `--canvas` flat, no shadow | The page |
| 1 — Surface | `--surface` + 2px `--border` + `0 2px 0 0 --border` | Cards, list rows, sidebar rail |
| 2 — Raised | `--surface` + 2px `--border-strong` + `0 6px 0 -2px --border` + `0 12px 24px -12px rgba(20,35,43,.18)` | Popovers, drawers, mobile sheets |
| 3 — Overlay | `--surface` + a scrim of `rgba(12,22,27,.45)` | Modals, credit paywall |

Level 2 and 3 may use a real soft shadow. Levels 0 and 1 may not: separation at rest comes from the border and the fill, and the only shadow allowed is the 4px press edge.

**The Blur-Free Rule.** `backdrop-filter` is banned. v1 used it in the sidebar, header, cards, panels and popovers across nine skins; on the low-end Android devices this product targets it is the most expensive property in the tree and it reads as generic 2021 glassmorphism. Translucency is replaced by an opaque surface token.

---

## 6. Motion

One system, four speeds, one spring. Motion is a *response*, never an ambient effect — there is no looping decorative animation anywhere except one 1.6s pulse on the current lesson node, and that is disabled under reduced motion.

| Token | Value | Use |
|---|---|---|
| `--motion-press` | `90ms ease-out` | `:active` state, checkbox toggle |
| `--motion-fast` | `160ms ease-out` | Hover, focus ring, chip select |
| `--motion-base` | `240ms ease-out` | Panel/drawer open, page section reveal, progress fill |
| `--motion-slow` | `380ms cubic-bezier(.34,1.56,.64,1)` | One-shot: Lexi state change, node unlock, score count-up |
| `--motion-celebrate` | `900ms` total | Confetti + Lexi celebrate; fires once per completed set |
| `--spring-tap` | `{ type: 'spring', stiffness: 420, damping: 30 }` | Motion-driven tap feedback |

**What animates, and why** (every animation must be justifiable in one sentence — if it cannot, it is cut):

| Element | Motion | Justification |
|---|---|---|
| Primary button | press edge collapse | Reports that the tap registered |
| Answer tile on submit | correct: fill to `--correct` + edge collapse; wrong: 2x 8px horizontal shake | Reports the verdict at the point of attention |
| Lexi | state change (8 states, Section 7) | Carries the emotional beat |
| Progress bar | width `--motion-base` ease-out | Shows the change in remaining work |
| XP counter | count-up over 380ms | Makes the reward legible as an amount |
| Lesson node unlock | spring scale 0.9 → 1.0 | Marks the new affordance becoming available |
| Page section entrance | 12px rise + fade, staggered 40ms, **max 6 items** | Establishes reading order once, on arrival |
| Streak flame | **static** (no perpetual flicker) | A flame that never stops moving is an accessibility defect, not delight |

**The One-Shot Rule.** Celebration (confetti, full-screen Lexi) may fire **at most once per completed unit of work**, and never on page load. If a user completes three sets in a row, the third celebration is the same as the first — there is no escalation, because escalating celebration becomes compulsion.

**The No-Scroll-Hijack Rule.** No scroll-linked animations, no parallax on work surfaces, no scroll-jacking. The one exception is the landing page's hero wash, which is a static gradient.

**The Vestibular Rule.** Every animation above is listed in one place in the codebase (`motion/presets.ts`) so that reduced-motion handling is implemented once rather than per component. Under `prefers-reduced-motion: reduce`: transforms become instant, confetti is replaced by a static "Completed" banner, the node pulse stops, and the answer-verdict colour change remains.

---

## 7. Lexi — the mascot system

Lexi is not an illustration with a CSS filter on it. v1's `LexiOwl.jsx` animates a single PNG (`src/assets/lexi.png`) by applying `filter: brightness()/saturate()/hue-rotate()` and a transform per mood, which is why she reads as a sticker being wobbled rather than a character reacting. v2 uses the **ten authored Lexi illustrations** that exist in `_design/assets/`.

### 7.1 The real asset library

These are finished, consistent illustrations — same character, same navy graduation cap with a gold tassel, same cream facial disc, rendered in the same style at roughly 270x330. **No illustration work is needed for v2.** One earlier draft of this document specified a hand-authored flat-vector owl because I had not seen these assets; that specification is withdrawn.

Provenance is unconfirmed: the files were present in the workspace before this build with a July 2026 timestamp. **Confirm their source and licence before shipping** — this is the one open question about them.

### 7.2 The mood map

The library carries ten expressions. DESIGN-V2.md's original eight states are re-cut onto what actually exists, and the two extra expressions are genuinely useful rather than surplus:

| Asset | File | Mood | Trigger | Exit |
|---|---|---|---|---|
| ![](assets/lexi-yes.webp) | `lexi-yes.webp` | `idle` | Default, at rest | Any other state |
| ![](assets/lexi-yeah.webp) | `lexi-yeah.webp` | `happy` | A correct answer | 700ms, back to `idle` |
| ![](assets/lexi-cry.webp) | `lexi-cry.webp` | `sad` | A wrong answer | 900ms |
| ![](assets/lexi-study-2.webp) | `lexi-study-2.webp` | `thinking` | AI grading / streaming wait | When the response starts |
| ![](assets/lexi-laugh.webp) | `lexi-laugh.webp` | `celebrate` | A completed set, a new band, a streak milestone | 900ms, once |
| ![](assets/lexi-study-1.webp) | `lexi-study-1.webp` | `explain` | A hint or grammar point is on screen | When the hint closes |
| ![](assets/lexi-sleep.webp) | `lexi-sleep.webp` | `sleepy` | 3+ days inactive, on the return visit | On first interaction |
| ![](assets/lexi-love.webp) | `lexi-love.webp` | `excited` | A streak increment | 1.2s |
| ![](assets/lexi-like.webp) | `lexi-like.webp` | `approve` *(new)* | A saved word, a passed milestone, a confirmed setting | 900ms |
| ![](assets/lexi-cup.webp) | `lexi-cup.webp` | `coffee` *(new)* | A break reminder, or the return after a long session | On interaction |

`study-2` (deep in a book) and `study-1` (glasses, open book) are deliberately paired: `study-2` is "I am working on it" and `study-1` is "here is something you need to know". That distinction is what makes the AI grading wait feel attended rather than abandoned.

**The Sparingly Rule.** Lexi is absent from the middle of a timed test. During `/ielts/take/*`, `/writing/*/take`, `/speaking/practice/*` and any vocabulary test in progress, she is hidden entirely except for `study-2` during AI grading. A mascot that talks during a 60-minute reading test is a liability, not a companion. This rule comes from the product's own mascot brief ("mascot chỉ xuất hiện khi cần. Không spam.").

**The Instruction Rule.** Lexi never delivers information that exists nowhere else. Every line she says is either (a) feedback on the user's own answer, (b) an encouragement, or (c) a pointer to a feature. She never states a band score the results card does not also state, and she never makes a claim about outcomes ("you will reach 7.0").

**The Silence Rule.** With ten expressions available, the temptation is to use all ten often. She appears at a maximum of **three moments per session**: the greeting, the answer feedback, and the result. A fourth appearance requires a state change the user caused.

### 7.3 Where Lexi lives

| Surface | Size | Mood | Notes |
|---|---|---|---|
| Onboarding | 200px | `idle` → `excited` | The one place she leads |
| Home | 120px beside today's plan | weighted by streak state | The daily greeting |
| Answer feedback | 48px inline in the verdict bar | `happy` / `sad` | Never both at once |
| Results | 120px | `celebrate` / `explain` | Beside the band score |
| Floating helper | 56px FAB, bottom-right | `idle` | Opens the Lexi panel |
| Profile | 96px | `idle` | Beside the progression to the next milestone |
| Empty states | 96px | `sleepy` / `explain` | Replaces generic illustration |
| Form success | 40px | `approve` | Saved word, confirmed setting |
| Break / long-session return | 96px | `coffee` | Only after a genuinely long session |
| Never | — | — | Timed test, reading passage, writing editor |

### 7.4 Implementation

- **Delivery.** Copy the ten files to `public/lexi/`. Render with `<img width height loading="lazy" decoding="async">` where the intrinsic dimensions are set, so there is no layout shift. Only the moods a screen actually uses are referenced, and only the Home/onboarding greeting (`lexi-yes`) is preloaded — never the full set.
- **Weight.** ~26KB each, ~260KB for all ten. This is why mood selection is per-screen rather than a sprite of everything: a screen that shows one mood pays 26KB.
- **Motion is applied to the whole image, not to parts.** The illustrations are single rendered images, so there are no named groups to animate. The system therefore uses transform and opacity keys on the image itself: a breathe loop for `idle`, a hop for `happy`, a sag for `sad`, a tilt for `thinking`, a multi-bounce for `celebrate`, a nod for `sleepy`. Each mood has exactly one keyframe rule, so motion is discoverable in one block rather than scattered.
- **Transitions cross-fade.** Because each mood is a separate file, a mood change is an opacity cross-fade (160ms) with the outgoing image absolutely positioned, rather than an instant swap. Swapping instantly is the visual tell that these are separate pictures.
- **If a designer later authors part-animated art**, a Lottie or Rive implementation drops in behind the same `mood` prop without touching a call site. The prop interface is the contract; the renderer is not.


---

## 9. Gamification ethics (a product commitment, not a styling choice)

v1 ships a full gamification suite — XP, streak, leaderboard, weekly report, rewards, missions, weekly challenge. v2 keeps all of it, because it is the retention engine the product depends on, and changes **how three of them behave**. This is the one place in this document where the design system makes a product argument, and it is deliberate.

The reason is a peer-reviewed study of exactly this product category: an ACM IDC'26 study of Duolingo, run with 50 parent-child dyads, names two failure modes — **"goal drift"** (engagement shifts from learning to maintaining the metric) and **"gamified obligation"** (leaving the app produces guilt). 82% of dyads hit at least one undermined attempt to pause or quit, 23 of 50 received messages *after uninstalling*, and children described the streak as a moral ledger: *"It started as language learning. Then it became whatever keeps the streak alive."* ([The Evil Bird and the Right to Disconnect](https://csl.uwaterloo.ca/download/documents/reportsarticles/idc26a_sub2151_i6pdf;v1?attachment=1))

Our user is a 16-22 year old self-studying for an exam, alone, with no teacher. They are the exact population that study describes. Three rules follow:

**The Grace-Days Rule.** A streak break caused by ordinary life must not destroy the streak. v2 grants **2 automatic grace days per month**, applied retroactively without the user having to spend, buy or claim anything. There is no purchasable streak freeze and no gem currency, because a paid repair mechanism converts the streak from an encouragement into a debt. The streak counter also renders in the calm ink tier, not in the amber reward tier — it is information, not a dare.

**The One-Tap-Out Rule.** Settings has, in the first group, two controls with no submenu: **Pause all reminders** and **Turn off streak tracking**. Pausing sets a user-chosen resume date and the UI then *stops mentioning the streak entirely* — no greyed-out flame, no "0 days", no Lexi reminder. A paused streak looks like a feature that is off, not a debt that is unpaid.

**The Rank-Humility Rule.** The leaderboard shows the user's own percentile band and their own movement, and shows the top three. It does **not** show a paginated list of 50 named strangers with the user buried at rank 214, and it never re-ranks live during a session. The reason is evidence, not taste: a meta-analysis of gamified learning found **badge-based** interventions outperformed **leaderboard-based** ones ([KoreaScience](https://www.koreascience.or.kr/article/JAKO202230853598218.pdf)). So v2 invests in the badge/achievement surface and keeps the leaderboard as a light, opt-in social surface. Leaderboard participation is off until the user turns it on, with a display-name choice that defaults to a pseudonym.

All three rules are cheap to implement and hard to retrofit, which is why they belong in the design system rather than a later roadmap.

---

## 10. Components

The kit is small and owned. Nothing is imported from a component library: antd is dropped (see `PROPOSAL.md` §4 for why and what it costs).

| Component | Variants | Press edge | Notes |
|---|---|---|---|
| `Button` | `primary`, `reward`, `secondary`, `ghost`, `danger`, `icon` | yes | Sizes `sm 36px` / `md 48px` / `lg 56px`. Minimum tap target 44x44 (SC 2.5.8). Label never wraps: if it does, the label is too long. |
| `AnswerTile` | `idle`, `selected`, `correct`, `wrong`, `disabled` | yes | The core interaction of the product. Full-width, left-aligned text, a 24px letter/number badge on the left. |
| `Card` | `flat`, `raised`, `interactive` | interactive only | 20px radius, 2px border. |
| `PathNode` | `locked`, `current`, `done`, `milestone` | yes | Circular, 80px, on the lesson path. `current` pulses at 1.6s — the only perpetual motion allowed. |
| `ProgressBar` | `linear`, `segmented` | no | Pill track, 16px tall, amber for reward progress and teal for task progress. |
| `Chip` | `neutral`, `teal`, `amber`, `correct`, `wrong` | no | Pill, 13px 700 label. |
| `Badge` | `count`, `status`, `band` | no | Band uses `mono`. |
| `Input` / `Textarea` | default, error, disabled | no | Label **above**, helper below, error below that. Never placeholder-as-label. |
| `Sheet` | `bottom` (mobile), `side` (desktop drawer) | no | Level-2 surface, 28px top radius on mobile. |
| `SpeechBubble` | `lexi`, `user` | no | Baloo 2, one tail direction each. |
| `StatTile` | `xp`, `streak`, `band`, `credit` | no | Icon + `mono` value + `micro` label. |
| `EmptyState` | — | — | Lexi 72px + one sentence + one primary action. Never a bare "No data". |
| `Toast` | `info`, `success`, `wrong` | no | Top-centre on mobile, top-right on desktop, 4s. |
| `Table` | `history` | no | Below 768px a history table **becomes a card list** — v1 keeps an antd table with horizontal scroll on mobile, which is the single most common complaint-shaped defect in a mobile-first app. |
| `Timer` | `normal`, `warning` | no | `mono`, tabular-nums, turns `--wrong` under 5 minutes. |

**Icon set:** Phosphor Icons, `duotone` weight for feature icons and `bold` weight for inline/control icons, at a global 2px stroke equivalent. One family only — v1 mixes `@ant-design/icons` and `lucide-react` in the same app, and both appear in `AppSidebar.jsx` (antd's `BookOutlined`/`UserOutlined` alongside fifteen lucide icons), which is why the sidebar's icon weights do not match.

**No emoji as UI.** v1 uses emoji as function icons (🔥 for streak, 🎉 for celebrate, ✨/💡 in `LexiFloating`'s `TYPE_ICONS`, 🌱📚🎓🏆 for levels). v2 replaces all of them with Phosphor glyphs. Emoji rendering is uncontrolled across the Android OEMs this product targets, and an emoji streak flame cannot be tinted to the reward token.

---

## 11. Layout

| Token | Value |
|---|---|
| Container max | `1080px` (marketing), `1240px` (work surfaces) |
| Gutter | `16px` phone, `24px` tablet, `32px` desktop |
| Sidebar | `264px` expanded, `84px` collapsed, hides below `1024px` |
| Mobile tab bar | `64px` + `env(safe-area-inset-bottom)`; 5 destinations |
| Header | `64px` mobile, `72px` desktop; sticky, opaque |
| Base spacing unit | `4px`; scale `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64` |
| Section rhythm | `32px` inside a work surface, `64px` between marketing sections, `96px` at desktop |

**Breakpoints:** `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`. Standard Tailwind v4.

**Navigation.** v1's shell is a 292px antd `Menu` sidebar with a collapsible rail, a header, and a separate left `Drawer` on mobile — three different navigation affordances for one product. v2 uses two:
- **Desktop (≥1024px):** a 264px sidebar rail with the 5 destinations as flat, untinted rows (v1 nests Vocabulary and IELTS into submenus, which hides 10 of 23 destinations behind two clicks). Full-height, opaque surface, no blur.
- **Mobile (<1024px):** a **bottom tab bar** with 5 destinations — Home, Learn, Practice, Progress, Profile — plus an in-page segmented control for the sub-modules. The drawer survives only for secondary items.

Below `768px`, a two-column split (IELTS Reading passage + questions) becomes a **tab switch between Passage and Questions**, with the question navigator pinned to the bottom. v1 stacks them vertically with `min-height: 40vh` on the passage, which makes the passage and its question un-viewable at the same time in the one module that most needs them together.

**The Phone Header Rule.** Below `1024px` the shell header is one step tighter, and it keeps **every** part — title, subtitle, credit chip, bell, avatar. What comes out is empty space, never a component: the page title drops one step (`h1` 24px → 20px), the gaps close from 12px to 8px, the padding from 8/14 to 6/10, and the subtitle ellipsises instead of wrapping to three lines beside a long dynamic title. A long dynamic title ("Hội thoại — Do you enjoy meeting new people?") cannot fit at 390px at any size, so it truncates by design and the subtitle keeps a full line. **The two icon controls keep their 44×44 target** — Section 12 makes that floor non-negotiable — which is why the space comes from padding and type rather than from the tap targets. A single action that fights the title for room (screen 24's history link) sheds its *label* on a phone and keeps its icon and `aria-label`, the same trade the account block already makes with the tier and credit chips. **Below `360px` the header wraps** instead of scrolling: the title takes one row and the trailing controls the next, right-aligned, because at the 320px floor the parts cannot share a line without pushing the account block out of the viewport. Measured: the sweep at 320px went from 11 overflowing frames to 4, none of them in the shell header.

**The Long-List Density Rule.** A screen that is read top-to-bottom on a phone — the speaking list and both of its result screens — uses the `16px` card inset rather than the `24/32px` one, and tightens its internal margins by one step. The `32px` rhythm in the table above is for work surfaces that are *scanned*; on a list that is *scrolled*, the same inset buys back a whole visible card per screen, and the card border already separates the items.

---

## 12. Accessibility floor

Non-negotiable, checked before ship:

1. **Contrast** — every text pair ≥ 4.5:1, every meaningful border and focus indicator ≥ 3:1, verified by `_design/contrast_check.py`. This is a build step, not a review pass.
2. **Target size** — every interactive target ≥ 44x44 CSS px (SC 2.5.8), including the answer-tile letter badge, the question navigator buttons and the mobile tab bar.
3. **Focus visible** — a 3px `--brand-teal` outline with 2px offset on every focusable element, never removed, never replaced by a colour change alone.
4. **Keyboard** — the whole test-taking flow is completable without a pointer: answer tiles are a roving-tabindex radiogroup, the question navigator is arrow-key navigable, and the submit confirmation is a real focus trap.
5. **Screen reader** — verdicts announce through a single `aria-live="polite"` region; XP and score changes use `aria-live="polite"` with the value, not the animation; confetti is `aria-hidden`; Lexi's decorative states are `aria-hidden` and only her speech bubble text is exposed.
6. **Colour is never the only signal** — a wrong answer is red *and* carries a cross glyph *and* a text label; a correct answer is green *and* a check *and* a label. Band ranges use shape as well as hue. This is SC 1.4.1, and it is also what makes the verdict readable to the ~8% of males with red-green colour vision deficiency.
7. **Motion** — per Section 6's Vestibular Rule. `prefers-reduced-transparency` also disables the Level-2/3 translucent scrims.
8. **Status messages are announced, never only shown.** Every XP gain, streak change, score and verdict goes through one shared `role="status"` region with an explicit `aria-atomic="true"` (SC 4.1.3, technique [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22)). Focus never moves for a toast or a celebration. `aria-live="assertive"` is reserved for genuine errors (a failed submission, an expired session) and nothing else.
8. **Language** — `lang="vi"` by default with `lang="en"` switched on English passage content, because screen readers must pronounce IELTS reading passages in English and the surrounding UI in Vietnamese.
9. **Zoom** — layouts hold at 200% zoom and at a 320px viewport width; no horizontal scroll at 320px.
10. **Audio** — any sound effect is opt-in, has a persistent mute in Settings, and starts muted for a first-time visitor.

---

## 13. What is explicitly banned

A list short enough to memorise, because it is the list of things v1 did:

1. A second colour resolver, a per-page theme file, or a hard-coded hex in a component. One token file, one source of truth.
2. `backdrop-filter`. No blur anywhere.
3. Gradient fills on text, buttons or cards. Two exceptions only (Section 2.4).
4. `border-radius: 999px` on a panel. Pills are for chips, dots, avatars and progress tracks.
5. A radius below 10px on anything a user can see the corner of.
6. A 1px hairline as a control's only border.
7. White text on amber, or on any surface measuring under 4.5:1.
8. Emoji used as a function icon.
9. A perpetual decorative animation, including a flickering streak flame.
10. `box-shadow` for separation at rest. Use the border; reserve shadows for Level 2/3 and the press edge.
11. A hover-only affordance on a touch-primary product. v1 already learned this (`@media (hover: hover)` gating in `index.css`) — make it the default, not a patch.
12. Fabricated social proof. No user counts, testimonials, press, partner logos or band-improvement claims exist in this product, so no component may reserve space for them. (`PRODUCT.md` states this explicitly and it carries into v2 unchanged.)
13. **Invented on-screen text.** No sentence, note, caption, helper line, secondary label or number may appear on a screen unless a frame draws it. The mockup is the source of truth for what the learner reads, so a claim enters through `mockup/_src/screens-{a,b,c,d}.mjs` → `SCREENS-V2.md` → code, in that order and never from the implementation up. A frame's own `note` is part of that statement, not a comment. **Accessibility text is not a violation:** `aria-label`, `sr-only`, `role` and the loading / empty / error states stay even when no frame draws them, because a blank screen or an unnamed control is a real defect — this binds *visible* copy only. Three rules follow from it, and all three were learned the hard way: (a) when auditing a screen, diff it against the frame and report every divergence rather than deciding alone; (b) a `disabled` control still needs its reason on screen; (c) a design change starts at the mockup. This is not theoretical — the IELTS and review sweeps removed 16 such strings (`detailIntro`, `startHint`, `examConditionNote`, `hasAudio`, `historyNote`, `chartCaption`, `estimatedNote`, `noPassage`, `readyBody`, `aboutMinutes`, `weekLabel`, `monthLabel`, `practice.finish`, …), every one of which had reached production UI without a frame ever drawing it.

**One deliberate house-style exception.** These documents use em-dashes heavily, and the detector flags that. In shipped UI copy, a body-text em-dash becomes a colon, a full stop or parentheses; in headings, table cells and this documentation it is a deliberate separator. The `data/` label convention in the mockups (`Khung avatar: Lá`) already follows the shipped-copy rule.

---

## 14. Verification

| Check | Command | Gate |
|---|---|---|
| Token contrast | `python _design/contrast_check.py` | exit 0 |
| Screen structure | `python _design/mockup/_src/verify.py` | assets, links, tag balance, no hard-coded hex |
| Card depth | `python _design/mockup/_src/check_nested_cards.py` | zero nested cards |
| Design detector | `impeccable detect --json <changed files>` | no unresolved findings |
| Visual regression | `npx playwright test --project=visual` | snapshots match at 390px / 768px / 1440px, light + dark |
| Accessibility | `npx playwright test --project=a11y` (`@axe-core/playwright`) | zero critical/serious |
| Bundle budget | `npm run build` | entry chunk < 220KB gzip; per-screen Lexi art ≤ 2 images (~56KB) |
| i18n | `npm run i18n:audit` (ported from v1) | no missing key in either locale |

### 14.1 Detector results on the mockups, and every judgement made about them

`impeccable detect --json _design/mockup` returns 43 findings. Recorded here in full so nothing is silently skipped:

| Finding | Count | Judgement |
|---|---|---|
| `cramped-padding` | 28 | **False positive.** Every instance names the `.shell` or `.sheet-stage` wrapper. The heuristic cannot see that the content is inset by `.shell__content` (14px at mobile, 20px at desktop) rather than by the wrapper. Verified by reading the CSS, not assumed. |
| `shape-assembled-illustration` | 7 | **This finding no longer applies.** It flagged the placeholder SVG owl I built before discovering the real Lexi art in `_design/assets/`. The mascot is now the authored illustration set (Section 7), so the finding is retired. It is left in this table rather than deleted because it is the record of why the placeholder existed. The one remaining primitive-shape graphic is the 40px brand mark in the explorer's rail, which is a logo at logo scale and not a "hero-sized visual". |
| `nested-cards` | 6 | **Stale, and superseded by a real fix.** These were real: the results, progress and profile screens nested cards three deep. All were flattened to a `.rowbox` primitive (an inset row with no border, no edge, no shadow), and `check_nested_cards.py` now reports zero nested cards across all 36 screens. The detector is reading the source templates in `_src/`, which retain the template-level nesting the compiled screens no longer have. |
| `bounce-easing` | 1 | **Accepted deliberately.** `--ease-back` overshoots, which the detector is right to flag as a default. It is scoped to one-shot moments only (node unlock, score landing) and is now documented as such at its definition, so it cannot spread into state changes. This is the one place the design accepts a dated-feeling easing on purpose, for a cartoon mascot product. |
| `border-accent-on-rounded` | 1 | **Unconfirmed.** Reported against `index.html` as "border-bottom: 2px + border-radius: 999px". I could not reproduce it: reading the file, the 2px border on `.rail`/`.bar` elements belongs to different boxes than the `999px` radius on `.badge`/`.chip`/pills, and the detector reports line 0 with no snippet to disambiguate. Not chased further in a mockup whose only job is to be reviewed. |

Two earlier findings **were fixed rather than argued away**, and they are worth naming because both were genuine accessibility defects:

- `skipped-heading` (3) — `<h1>` followed directly by `<h3>` on the vocabulary list, IELTS list and rewards screens. Fixed by adding the missing `<h2>` per section and wiring real `role="tabpanel"` / `aria-controls` / `aria-labelledby` relationships. A heading outline that skips a level makes the page unnavigable by heading on a screen reader.
- `em-dash-overuse` (1) — 9 em-dashes in the rewards copy. Body-text em-dashes were replaced with colons and full stops.

