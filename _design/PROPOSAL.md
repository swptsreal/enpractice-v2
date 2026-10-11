# EN Practice v2 — Proposal

**Status:** for review · **Scope:** learner app + landing (`en-practice-v2`). Admin stays in `en-practice-admin`.
**Reference:** v1 is `../en-practice` (53 routes, 398 JS/JSX files). Redesign is an **overhaul**, not a refinement, per the brief.

---

## 1. Design read

> **Reading this as:** a consumer learning app + its marketing site for Vietnamese students (16–22) self-studying for IELTS 5.0–7.0, in a **playful-cartoon, mascot-led** visual language borrowed from Duolingo's craft but not its palette, leaning toward an owned Tailwind-v4 component kit on top of the existing React 19 stack.

**Dials.** `DESIGN_VARIANCE 6` · `MOTION_INTENSITY 7` · `VISUAL_DENSITY 4`.

Reasoning, because these are not the defaults:

- **VARIANCE 6, not 8.** This is a work surface, not a landing page. Answer tiles, a passage and a results table need predictable rhythm; a 9 would fight the content. The variance budget is spent in two places instead — the landing hero and the lesson-path page — where an asymmetric, art-directed layout costs nothing. A `taste-skill` `VARIANCE 8` baseline is right for a marketing site and wrong for a test-taking surface.
- **MOTION 7, not 6.** The product's whole proposition is "feedback you can feel" and it has an animated mascot, so motion carries information here rather than decoration. It stops at 7 because every perpetual animation is an accessibility liability and a battery cost on the low-end Android devices this product targets.
- **DENSITY 4.** Not 2 (a study tool that hides information behind three taps wastes a student's commute) and not 7 (the target user is not a power user reading a cockpit).

One brief point needs an explicit call, because v1's own documentation contradicts it. `docs/lexi-owl-mascot.txt` ends with *"Không nên quá cartoon"* — do not go too cartoon. The v2 brief says **"hoạt hình, dễ thương, mascot cú lexi"**. I am following the brief: Lexi becomes a genuinely cartoon character with a face that emotes, and the *rest* of the interface carries the credibility (exam-shaped work surfaces, real band scores, restrained type). Mascot playful, product serious. If you actually wanted the muted version, that is a different design and it is cheaper — say so and I will re-cut it.

---

## 2. What v1 actually is (audited, with numbers)

| Measure | v1 |
|---|---|
| Routes | 53 |
| Page components | 93 `.jsx` under `src/pages` (53 routed, ~40 orphaned) |
| Component files | 90 under `src/components`, 83 under `src/features` |
| i18n keys | ~1,821 leaves across 29 namespaces in `vi.js` (2,986 lines), mirrored in `en.js` |
| **Hard-coded hex colours** | **454 in 40 files**, plus 61 in `index.css` |
| **Arbitrary radii** | **297** `rounded-[…]` + 19 `rounded-3xl`, while `--app-radius-*` tokens exist and go unused by pages |
| Theme machinery | 9 profiles x 10 backgrounds x 5 primaries x 2 modes; `themeProfiles.js` 788 lines + `themeTokens.js` 1,238 lines |
| Per-page theme files | 9 (`dashboardTheme`, `ieltsTheme`, `speakingTheme`, `writingTheme`, `leaderboardTheme`, `weeklyReportTheme`, `profileTheme`, `dictionaryTheme`, `vocabularyCheckTheme`) + `pagePalettes.js` (374 lines, 10 palettes) |
| Global CSS | `index.css` 1,603 lines, 156 custom classes, 29 `!important` |
| Icon families | 147 files import `lucide-react`, 22 import `@ant-design/icons`, 145 import `antd` |
| Emoji as UI icons | 30 occurrences in 7 files |
| `backdrop-filter` | 8 files |

**The eight problems v2 must fix, ranked by severity:**

1. **Mobile navigation is a hidden drawer behind a header that hides itself on scroll.** `AppShell.jsx:755-768` puts navigation in a left `Drawer`; `AppHeader.jsx:36-81` hides the header on scroll-down. On a phone, the only way to navigate can scroll out of existence. There is no bottom tab bar anywhere in the product, in a mobile-first app.
2. **Every page invents its own chrome at seven different widths.** `1440px` (Home, Dictionary), `1400px` (TestTaking, Leaderboard), `1280px` (Login), `1200px` (TestList), `max-w-4xl` (Notifications), `max-w-3xl` (SpeakingPractice), `max-w-[355px]` (Settings) — and `SettingsPage.jsx` uses two of them in one file.
3. **Theming is combinatorial and duplicated.** `themeTokens.js:45-93` and `index.css:34-89` both define the same tokens. Nine `*Theme.js` files re-derive surfaces per page. Visual consistency is not achievable by construction.
4. **Radius and elevation tokens exist but pages use arbitrary values.** 297 `rounded-[…]` against an unused `--app-radius-*` ladder; 31 files mixing `shadow-sm/md/lg` with no elevation scale.
5. **454 hard-coded hex values cannot follow a theme change.** Theme switching structurally cannot reach them.
6. **Data tables stay desktop tables on mobile.** 12 `<Table>` uses, 11 with `scroll={{ x }}` and no card fallback — horizontal scroll in a mobile-first product.
7. **Nothing reads as one product.** Two icon families plus emoji, mixed in the same shell (`AppHeader.jsx` uses antd icons while the rest of the app uses lucide).
8. **Controls are below the 44px tap minimum.** antd `controlHeight 40 / SM 32`; there is no `min-h-[44px]` anywhere in the codebase.

### 2.1 Evidence honesty

This audit read v1's code. I have **not** looked at a running instance or screenshots of every screen. Per-screen specs in `SCREENS-V2.md` are therefore marked:

- **`[code-verified]`** — I read the page's implementation. Landing, Home, IELTS list/take, Writing take, Speaking practice, Dictionary, Leaderboard, Rewards, Weekly Report, Notifications, Daily Plan, Settings, Login, AppShell.
- **`[route-inferred]`** — specified from route semantics, module conventions, API names and cross-cutting patterns, without reading the page. Vocabulary test flow, Evaluation, Review, Dictionary review, Custom Speaking, Credits, Profile, AI Chat, XP history, Writing practice, Writing/Speaking results and history pages.

That distinction should tighten before implementation: for each `[route-inferred]` screen, a 10-minute read of the v1 page will either confirm the spec or correct it.

---

## 3. The v2 design

Full specification in **[DESIGN-V2.md](DESIGN-V2.md)**. The short version:

**Concept: "Lexi's Flight Path."** A cartoon tawny owl leads a visible path of small finishable steps. The world is built from what a flight path looks like at dusk: a **warm paper ground**, **deep teal feathers**, **amber owl eyes**. Study-notebook calm, cartoon-not-childish energy.

**Three decisions that do most of the work:**

1. **One interface, not nine skins.** The theme system, the 10 backgrounds, the 5 accent swaps, all 9 per-page theme files and `pagePalettes.js` are deleted and replaced by one token file with one palette per mode. The colour count goes from a combinatorial space to **18 light + 18 dark tokens**, every one of them contrast-verified by a script (`_design/contrast_check.py`) that exits non-zero on failure. Weakest required pair in the whole system: **4.51:1**.
2. **The press is the signature.** Every pressable surface carries a solid 4px bottom edge that collapses on `:active` — implemented as `box-shadow` + `transform` (never `border-bottom`, which reflows the label on every tap). This is the affordance that makes a Duolingo-style product feel physical, and v2 makes it **WCAG-safe**: the edge is never the only thing identifying a control, so the system passes 3:1 without it. Duolingo's own `#58CC02` measures **2.09:1** on white; that is the exact failure this design avoids.
3. **Lexi becomes a character system.** v1 animates one PNG (`src/assets/lexi.png`) with `filter: brightness()/saturate()/hue-rotate()` per mood, which is why she reads as a wobbling sticker. v2 uses **the ten finished Lexi illustrations already present in `_design/assets/`** — same character, same navy graduation cap, same cream facial disc — mapped onto ten product states (`idle`, `happy`, `sad`, `thinking`, `celebrate`, `explain`, `sleepy`, `excited`, `approve`, `coffee`) and wrapped in whole-image transform and opacity motion with a cross-fade between moods. No illustration work is required; the one thing to confirm is the licence on those files.

### 3.1 The mobile navigation fix

Two navigation affordances replace v1's three:

- **≥1024px:** a 264px sidebar rail, with all destinations **flat** — v1 nests Vocabulary and IELTS into submenus, hiding 10 of 23 destinations behind two clicks.
- **<1024px:** a **bottom tab bar**, 5 destinations (Home, Learn, Practice, Progress, Profile), thumb-reachable, always visible. The drawer survives only for secondary items.

And the one screen-specific layout fix that matters most: in IELTS Reading below 768px, the passage and the questions become a **two-tab switch** instead of two stacked blocks. v1 stacks them with the passage at `min-height: 40vh`, which means in the module that most needs passage and question visible together, they never are.

### 3.2 Gamification ethics

This is a product change, not a styling one, and it comes from evidence: an ACM IDC'26 study of Duolingo with 50 parent-child dyads found 82% of dyads hit an undermined attempt to pause or quit, 23 of 50 received messages *after uninstalling*, and children described the streak as a moral ledger ([source](https://csl.uwaterloo.ca/download/documents/reportsarticles/idc26a_sub2151_i6pdf;v1?attachment=1)). Our users are exactly that population — alone, self-studying, no teacher.

So v2 commits to three rules, specified in DESIGN-V2.md §9: **2 automatic grace days per month** (no purchasable streak repair — a paid fix turns encouragement into debt), **two one-tap controls** in the first Settings group (pause all reminders; turn off streak tracking, with a paused streak that renders as *off* rather than as *owed*), and a **rank-humble leaderboard** (own percentile + top three, opt-in, pseudonymous) because a meta-analysis found badge-based interventions outperform leaderboard-based ones ([source](https://www.koreascience.or.kr/article/JAKO202230853598218.pdf)).

These are cheap now and expensive later.

---

## 4. Tech stack

**Still the same stack as v1** — React, Vite, Tailwind, react-router, axios, STOMP, Firebase, i18next, dayjs, recharts. Nothing is replatformed. Six additions and four removals.

### 4.1 Versions

Current latest (verified on the npm registry, 2026-10-10) versus what v1 pins:

| Package | v1 | Latest | v2 |
|---|---|---|---|
| react / react-dom | 19.2 | 19.3.0 | **19.3** |
| vite | 7.3 | 8.3.4 | **7.3** (defer 8 — Rolldown risk) |
| tailwindcss | 4.2 | 4.3.3 | **4.3** |
| react-router-dom | 7.13 | 7.18.4 | **7.18** |
| framer-motion → `motion` | 12.x | 14.1.0 | **motion 14.1** |
| antd | 6.3 | 6.6.5 | **removed** from learner surfaces |
| i18next / react-i18next | 25 / 16 | 26.4.3 / 17.0.16 | **hold at 25/16 for v2.0** |
| firebase | 12 | 13.0.0 | **12** |
| recharts | 3.7 | 3.10.1 | **3.10** |
| lucide-react | 0.575 | 1.55.0 | **removed** in favour of Phosphor |

### 4.2 Add

| Package | Version | Why | Verified |
|---|---|---|---|
| `motion` | 14.1.0 | The canonical package; `framer-motion` is now only its implementation. `motion@14.1.0` depends on `framer-motion@14.1.0` and `motion/react` literally re-exports it. Upgrade path from v1's 12.x has no breaking changes for React. | peer `react ^18\|\|^19`; [docs](https://motion.dev/docs/react), [upgrade guide](https://motion.dev/docs/react-upgrade-guide) |
| `@phosphor-icons/react` | 2.1.10 | The one icon set with a real `duotone` weight, which is what a friendly-cartoon UI needs for feature icons. Replaces the lucide + antd-icons + emoji mix. | peer `>=16.8`; custom-icon composition has an open React 19 issue ([#137](https://github.com/phosphor-icons/react/issues/137)) but **shipped icons are unaffected**. Fallback: keep lucide 1.55 (peer includes `^19`) |
| `canvas-confetti` | 1.9.4 | 4.25KB gzip, zero deps, and it exposes `disableForReducedMotion`. Replaces `react-confetti`, whose README documents no reduced-motion handling at all. | ISC; **note the reduced-motion flag defaults to `false`** — we must set it |
| `@number-flow/react` | 0.6.2 | Animated XP/band counters, which is most of the "feel" of a gamified product. 6.3KB. Replaces nothing; `react-countup` is unmaintained and has an open Vite-8 breakage. | peer `^18\|\|^19` |
| `tailwind-variants` | 3.3.1 | Typed variant API for the component kit. Its peers (`tailwindcss: *`, `tailwind-merge >=3.0.0`) are already satisfied by v1's tailwind-merge 3.7. | active releases; `cva` last published 2024-11 |
| `vite-plugin-pwa` | 2.0.0 + `workbox-build`/`workbox-window` ^7.4.1 | v1 hand-rolls `manifest.webmanifest`, icons and a service worker for FCM. This makes it buildable and versioned. **v2.0.0 made the workbox packages required peers**, so they must be installed explicitly. | peer `vite ^3–^8` |

Dev/test: `@playwright/test` 1.64.0 and `@axe-core/playwright` 4.13.0 for the visual-regression and accessibility gates in DESIGN-V2.md §14. v1 has neither, which is why 454 hard-coded colours and sub-44px targets could accumulate unnoticed.

### 4.3 Remove

| Package | Why |
|---|---|
| `antd` + `@ant-design/icons` | 145 files import antd. Its token system competes with the Tailwind-4 design system and it is the source of the 40/32px control heights and the desktop tables that cannot become cards. Removing it from learner surfaces is the single largest reduction in the codebase's visual variance. **Cost:** every antd `Table`, `Drawer`, `Modal`, `Popover`, `Segmented`, `Form` and `notification` call site on those surfaces must be replaced by the owned kit — this is the biggest line-item in the migration. |
| `framer-motion` (as direct dep) | Superseded by `motion`. Same implementation, so it is an import-path change, not a rewrite. |
| `react-confetti` | Replaced by `canvas-confetti`. |
| `lucide-react` | Replaced by Phosphor, **only if** you accept the cadence risk (Phosphor's last publish was 2025-05). Otherwise keep lucide 1.55 and take the stroke-only look. **This is a decision for you** — see §9. |

**Also recommended, small:** drop `@tsparticles/*`, and do not adopt `hugeicons-react` (deprecated on npm; its successor's duotone weights are paid/not on public npm).

### 4.4 Things I am explicitly *not* adding

- **No Lottie or Rive.** `lottie-react` is ~196KB gzip and `@rive-app/react-canvas` pulls a 222–648KB WASM runtime; both need a designer. Hand-authored SVG + `motion` costs roughly nothing because `motion` is already in the stack, and it keeps the mascot's level accessories data-driven.
- **No component library replacement in kind** (no shadcn/ui, no Radix Themes). The kit is ~16 components and they are all product-specific — answer tiles, path nodes, band badges. Importing a general library would mean fighting it on exactly the components that carry the identity.
- **No state-management library.** v1's context + hooks structure works.
- **No CSS-in-JS.** Tailwind v4 + one token file.

### 4.5 The i18n question

`react-i18next` 17 now requires `i18next >= 26.2`, so the pair must move together or not at all. v2 ships on **i18next 25 / react-i18next 16** to keep the migration about visuals, and takes the upgrade as a separate, isolated change. There are ~1,821 keys to protect either way, and v1 has 68 inline `defaultValue:` fallbacks in JSX — evidence of surfaces that were never fully translated. Those get cleaned up as each screen is rebuilt.

---

## 5. Architecture of the rewrite

The rewrite is deliberately **not** a from-scratch app. v1's non-visual layer is good and replacing it would be waste.

### 5.1 Keep as-is (copy across untouched)

| Area | Contents |
|---|---|
| `src/api/**` | 29 modules: `axiosClient` (auth, refresh, guest session), `ieltsApi`, `speakingApi`, `writingApi`, `writingPracticeApi`, `dictionaryApi`, `dashboardApi`, `recommendationApi`, `rewardMissionApi`, `leaderboardApi`, `notificationApi`, `weeklyReportApi`, `creditApi`, `challengeApi`, `mascotApi`, `vocabularyTestApi`, `aiChatApi`, … |
| `src/hooks/**` | 19 hooks: STOMP clients, speech recording (media + WS), `useTimer`, `useDictionary`, `useCreditAction`, notification hooks, profile hooks |
| `src/contexts/**`, `src/providers/**` | Auth, Credit, Mascot, RealtimeStomp, VocabularyExplain |
| `src/features/**` logic | `chat/` mappers and state, `credits/` policy and costs, `daily-plan/` selectors and resources, `learning/` analytics, `notification/` provider and hooks, `realtime/` transport, `guest-ai-trial/`, `vocabulary-explain/` |
| `src/i18n/**` | The full `vi`/`en` key tree |
| `src/utils/**`, `src/seo/**` | date, cn, ielts, speaking, translate, tts, storage, seo route table |
| `src/config/` | non-visual parts only |

### 5.2 Rewrite

| Area | From | To |
|---|---|---|
| App shell | antd `Layout`/`Sider`/`Drawer` + `AppHeader` + 292px sidebar | Owned shell: 264px rail (≥1024px) + bottom tab bar (<1024px), one container width |
| Design tokens | `themeProfiles.js` + `themeTokens.js` + `index.css` + 9 `*Theme.js` + `pagePalettes.js` | `styles/tokens.css` (one file, one palette per mode) |
| Component kit | antd + 156 custom CSS classes + inline `useTheme()` objects | ~16 owned components, `tailwind-variants`, zero inline theme objects |
| Every page | per-page chrome, arbitrary radii, hard-coded hex | composed from the kit, at one of two container widths |
| Mascot | `lexi.png` + CSS filters | authored SVG, 8 moods, 4 levels |
| Navigational data views | antd `Table` with `scroll={{x}}` | card list below 768px, table above |

**Rule for the rewrite:** no page may contain a hex colour, a `rounded-[…]`, a `box-shadow`, or a `backdrop-filter`. If a page needs one, it needs a token or a component — that is the enforcement mechanism, and it is checkable by the detector in DESIGN-V2.md §14.

---

## 6. Screen inventory

53 routes, grouped into 36 mockups (some routes share a page component). Full per-screen specs in **[SCREENS-V2.md](SCREENS-V2.md)**.

| Group | Screens | Notable v2 change |
|---|---|---|
| Marketing & Auth | Landing, Login/Signup, Onboarding | Landing becomes the only `Persuade` surface; onboarding is new and Lexi-led |
| Daily learning | Home, Daily plan sheet, Learning path | Home stops being a 6-widget bento and becomes one decision + today's plan; the path is a new surface |
| Vocabulary | Tra từ AI, Test list, Test taking, Test result, Test history, Dictionary, Dictionary review (SRS), Evaluation, Review | Test taking becomes one question per screen with immediate feedback (v1 batches) |
| IELTS | Test list, Test detail, Test taking, Test result, Test history, Writing list/take/result, Speaking list/take/result, Custom speaking | Mobile splits passage/questions into tabs; history tables become cards |
| Progress | Leaderboard, Weekly report, Challenges, Rewards, Credits | Leaderboard gets rank-humility treatment; rewards stops being a 1,604-line page |
| Account | Profile, Notifications, Settings, AI Coach | Settings gains the two one-tap gamification controls |

---

## 7. Rollout

| Phase | Work | Gate |
|---|---|---|
| **0 — Foundation** | Scaffold Vite 7 + React 19 + Tailwind 4; port `api/`, `hooks/`, `contexts/`, `features/` logic and `i18n/`; write `tokens.css`; wire the contrast script into CI | App builds; every token pair passes; both locales load |
| **1 — Kit** | The ~16 components + Lexi SVG + motion presets + the `role="status"` live region | A component gallery page renders every component in every state, light and dark, at 390/768/1440px |
| **2 — Shell + 3 anchor screens** | Shell, Home, IELTS take, IELTS result | Playwright visual + axe gates green on the anchors; the shell is usable at 320px with no horizontal scroll |
| **3 — Modules** | Vocabulary, Writing, Speaking, Dictionary, Progress, Account, Landing | Per-module visual regression; detector clean |
| **4 — Cutover** | Content/i18n audit, SEO parity check, bundle budget, deploy | `enpractice.site` serves v2 with the route/SEO table unchanged |

Phase 2 is the decision point. If the shell and the two IELTS screens do not feel right, revising them there costs 1/10th of revising them after Phase 3.

---

## 8. Honest tradeoffs

| Cost | Assessment |
|---|---|
| **Removing antd is the biggest line item.** | 145 files import it. But keeping it means keeping two token systems, and its `Table` is the direct cause of the mobile horizontal-scroll problem. Removing it from learner surfaces is the change that makes "one interface" achievable. Admin keeps antd untouched. |
| **A one-theme product removes user choice.** | Users who liked the `mono` or `editorial` profile lose it. Accepted, per the brief. Mitigation: light/dark remains, and it follows the OS. |
| **The Lexi art needs a licence check, not a redesign.** | Ten finished illustrations (`_design/assets/lexi-*.webp`) are already in the workspace, so no illustration work is needed — that removes the largest cost this proposal originally carried. What is unconfirmed is their **provenance**: they predate this build with a July 2026 timestamp and I could not establish where they came from. Confirm the source and licence before shipping. |
| **Lexi's graduating-owl cap is in every illustration.** | So it cannot be a "Master level" unlock the way `docs/lexi-owl-mascot.txt` imagined. It becomes her signature look instead, and the level progression is re-cut onto which *expression* she uses and what she is doing (see DESIGN-V2.md §7.2). That is a better progression anyway — it changes with the user's state rather than sitting static. |
| **Phosphor's release cadence has stalled** (last publish 2025-05). | Real risk. Mitigated by an escape hatch to lucide 1.55, which is actively released and React-19 clean. |
| **Holding i18next at 25/16 defers a two-major upgrade.** | Deliberate: do not mix a library migration with a visual rewrite. |
| **Deferring Vite 8.** | Vite 8's Rolldown path already breaks `react-countup`; a visual rewrite is not the moment to also change the bundler. |
| **Lexi's plumage is cornflower blue, and the palette is teal.** | Her blue (`~hsl(228 60% 55%)`) is adjacent to, not identical to, the teal action colour (`hsl(174 76% 25%)`). They coexist because she is illustration and everything else is chrome, and because the two are far enough apart in hue and lightness never to be read as the same role. If you would rather she match the Chrome, recolouring ten WebPs is a designer task, not a token change. |

---

## 9. Decisions I need from you

1. **Lexi's register.** The ten existing illustrations are already more cartoon than `docs/lexi-owl-mascot.txt` recommended ("không nên quá cartoon"), and I am following the brief rather than that note. Confirm you want this register, and confirm the **licence and source** of the asset files. If you would also like her plumage recoloured to match the teal chrome, that is a designer task on the ten WebPs.
2. **Icon set.** Phosphor (duotone, friendlier, stalled releases) or lucide 1.55 (active, stroke-only, already familiar to the codebase)? I recommend Phosphor for the duotone look and will keep the abstraction shallow so it is a one-day swap.
3. **Gamification ethics — the three rules in §3.2 and DESIGN-V2.md §9.** Grace days, one-tap-out, rank-humble leaderboard. These change product behaviour. Confirm, modify, or reject.
4. **The palette.** Teal `#0E7C6B` + amber `#F5B32E` on warm paper. It replaces v1's indigo/violet default and drops the `#4F46E5` from the mascot brief. Lexi's own blue stays as-is; if you want her to match the chrome instead, say so. This is a token-file change now and a re-verification of all contrast pairs.
5. **Landing page.** v1's landing stays `Persuade` and is rebuilt inside the same one interface, or keeps its own more expressive treatment? I recommend rebuilding it in-system with a wider variance budget (§1).

---

## 10. What I have built alongside this document

- **`_design/DESIGN-V2.md`** — the design system: tokens, measured contrast, type, shape, the press mechanic, motion, the Lexi system, components, layout, the accessibility floor, the banned list, and the verification gates.
- **`_design/contrast_check.py`** — the executable contrast audit. Run `python _design/contrast_check.py`; it exits non-zero if any required pair drops below its WCAG threshold. It caught 5 real failures in my own first draft (`attention` text at 4.26:1, and `border-strong` at 1.56:1 — an input border that was invisible).
- **`_design/mockup/`** — an interactive explorer (`index.html`) covering the design system and all 36 screen mockups, with a phone/tablet/desktop frame switch and a light/dark switch. Screens are authored mobile-first at 390px and widen to desktop, so reviewing them at phone width is reviewing them honestly.
