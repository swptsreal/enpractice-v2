# EN Practice v2

Learner app. One interface, Lexi's Flight Path.

The design is documented in [`_design/`](_design/) — read
[`_design/README.md`](_design/README.md) first. This file covers the code.

## Run it

```powershell
npm install
npm run dev          # https://localhost:5173  (HTTPS, self-signed)
```

HTTPS is not optional: Speaking uses `getUserMedia` + the Web Speech API, which
browsers only grant on a secure context.

```powershell
npm run verify       # contrast -> i18n -> lint -> test -> build, in that order
```

Each gate also runs alone: `verify:contrast`, `verify:i18n`, `test`, `lint`.

## Stack

React 19.3 · Vite 7.3 · Tailwind 4.3 · react-router-dom 7.18 · i18next 25 +
react-i18next 16 · lucide-react 1.55 · motion 14 · axios · dayjs

Two deliberate holds, both explained in `_design/PROPOSAL.md` §4:

- **i18next 25 / react-i18next 16.** react-i18next 17 requires i18next >= 26.2
  *and* declares a TypeScript peer. The pair moves together or not at all, and a
  library migration is not mixed into a visual rewrite.
- **Vite 7, not 8.** Vite 8's Rolldown path already breaks packages this project
  used to depend on. Bundler changes get their own change.

Notably **absent: antd.** 145 files import it in v1, and its token system
competes with a Tailwind-4 design system. The admin app keeps it.

## Layout of the source

```
src/
  styles/
    tokens.css          THE single source of truth: colour, shape, motion, type
    index.css           Tailwind import + thin base layer + type scale
    lexi.css            one keyframe rule per mascot mood
  components/
    ui/                 Button, Card, AnswerTile/Verdict, Primitives
    mascot/             Lexi + lexiMoods
  app/
    Shell.jsx           Sidebar rail (>=1024px) and bottom tab bar (<1024px)
    AppLayout.jsx       header + content + floating helper
    navigation.js       every destination, flat, in one place
    pageTitles.js       route -> i18n title key
  pages/                home/, ielts/
  i18n/
    locales/            GENERATED — do not hand-edit
    seed/               v2's own keys + patches.mjs; the generator's input
  api/  hooks/  contexts/  utils/  config/  seo/
                        PORTED VERBATIM from ../en-practice (see below)
scripts/
  contrast-check.mjs    WCAG gate, reads tokens.css (no second copy of the palette)
  i18n-audit.mjs        key parity + unreferenced keys + defaultValue fallbacks
  merge-v1-locales.mjs  generates src/i18n/locales from v1 + the v2 seed
vite.verify.config.js   HTTP-only config for scripted checks
```

## The ported layer

`src/api` (29 modules), `src/hooks` (19), `src/contexts` (8), `src/utils` (20),
`src/config` and `src/seo` are copied **verbatim** from `../en-practice`. That
layer is 0% coupled to antd, which is why it ports cleanly.

Two things follow from "verbatim":

- **Do not refactor them here.** Lint reports 10 warnings in that layer
  (`react-hooks/set-state-in-effect` at 9 sites, `react-hooks/refs` at 1) from
  newer plugin versions. They are real React smells, left as warnings on purpose:
  fixing them here would create divergence from v1 and make the next re-copy
  unsafe. Fix them in v1, then re-copy.
- **`src/api/index.js` has one deliberate addition.** Nine modules existed in v1
  but were never re-exported from its barrel, so v1's pages import them by deep
  path. v2 adds those exports so there is one import site. Additive only.

## Locales are generated

`src/i18n/locales/*.js` is **output**, not source:

```powershell
npm run locales:merge          # regenerate from v1 + src/i18n/seed/
```

Policy: v1's tree is the base (1,995 keys), v2's seed overrides it where v2 has
designed the screen, then `src/i18n/seed/patches.mjs` fills the gaps v1 left.
The generator reads v2's overrides from the **seed**, never from its own output,
so it is idempotent — verified by running it twice and comparing hashes.

`patches.mjs` exists because v1's two locale files are not parallel, and one of
the mismatches is a **live bug in v1**: i18next only selects `key_one`/`key_other`
when the call passes `count`, and v1's locale files disagree about which shape to
store — `vi.js` has the bare `dueTitle`, `en.js` has `dueTitle_one/_other`. So
Vietnamese misses the plural calls and English misses the bare calls, and both
render a raw key to a user. v2 makes both locales carry both shapes.

## The five rules the code follows

These are the enforcement mechanisms for the design, not style preferences. They
exist because each one is a thing v1 did.

1. **No colour literal outside `tokens.css`.** A page that needs a colour needs a
   token. `verify:contrast` reads the token file, so a hard-coded hex is invisible
   to the gate — which is why the rule is absolute.
2. **No `box-shadow` for separation at rest.** Use the 2px border and the 4px
   press edge (`Button`, `AnswerTile`, `Card level="edge"`). Soft shadows belong
   to genuinely floating surfaces (`level="raised"`).
3. **Never nest a card in a card.** An inset row is a `RowBox` — no border, no
   edge, no shadow. v1 nested cards three deep on the results and profile screens.
4. **Colour is never the only signal.** A verdict carries a hue *and* a glyph
   *and* a label (`Verdict`, `AnswerTile`). This is WCAG 2.1 SC 1.4.1.
5. **No perpetual animation** except the one node pulse, and every animation is
   disabled under `prefers-reduced-motion` while its colour/state feedback stays.

## What is built, and what is not

Honest state, so nobody assumes more than exists.

### Working and verified

- **Design system** — `tokens.css` with 2 modes, one palette each. Every colour
  pair the UI renders is asserted by `scripts/contrast-check.mjs` (28 required
  pairs + 3 decoration-only, light and dark). The gate caught 3 failures in the
  first draft of this palette and the corrections were lightness-only moves
  under 0.01, so the palette is visually unchanged but now legal.
  **Read the second list carefully:** the three "decoration-only" pairs are exempt
  only while that colour is never used for text. `ink-faint` (#8FA3AD) is 2.47:1 on
  `surface`, and it had leaked into a nav label and two "not measured" dashes — text
  the gate was never asked about, because a gate only checks the pairs it is given.
  Anything new that paints `ink-faint` on a character needs measuring by hand; icons
  and `aria-hidden` graphics are the cases the classification is for.
- **Component kit** — `Button` / `ButtonLink` (6 variants, the press edge in one
  place), `Card` / `RowBox` (3 elevation levels), `AnswerTile` / `Verdict`,
  `Chip` / `Badge` / `Band` / `ProgressBar` / `Stat` / `Field` / `EmptyState` /
  `Skeleton`, and `Lexi` with all 10 moods.
- **Lexi** — the 10 authored illustrations in `public/lexi/`, mapped to 10 product
  states, with intrinsic `width`/`height` on every `<img>` (no layout shift) and
  one keyframe rule per mood.
- **App shell** — a 264px flat sidebar rail (>=1024px) and a 5-destination bottom
  tab bar (<1024px), replacing v1's three navigation affordances. The header never
  hides on scroll.
- **Three anchor screens** — Home, IELTS test-taking, IELTS result. The
  test-taking screen is the one that matters most: desktop shows passage and
  questions as two panes; below 1024px they become a labelled two-tab switch with
  the answered count on the tab and a 13-button navigator pinned below.
- **The ported logic layer** — 77 modules copied verbatim, all evaluating.
  `src/api/index.js` re-exports the 9 modules v1 left out of its barrel.
- **Locales** — 2,961 keys in parity across vi and en, generated from v1's tree
  plus v2's seed plus a recorded patch file. The audit that got them there also
  found a live plural bug in v1 (see above). **English is not in the entry** — it
  is fetched on demand (`i18next-resources-to-backend`), because Vietnamese is the
  default and English is a user action. That saves 26.91 kB gzip off the first load.
- **The API is live-verified.** Every field mapping was read off the running
  backend on port 8082, not assumed. `src/api/envelope.js` unwraps the
  `{success, message, data}` wrapper the whole API uses, and `readPage()` handles
  the `{page, size, totalElements, totalPages, items}` pagination shape.
- **Route guards** — `RequireAuth` sends a signed-out visitor to `/login` (a real
  route; a redirect target that does not exist falls through to the catch-all and
  loops forever). `RootRedirect` sends a guest to the **landing page**, and `/` now
  sits OUTSIDE the shell: the landing page is a full-bleed surface with its own
  header, and inside `AppLayout` it rendered under the sidebar and a second header,
  next to an avatar and a notification badge belonging to an account the visitor
  does not have.
- **Onboarding** — screen 03, at `/onboarding`: four steps, one decision each, Lexi
  narrating, skippable at every step. State lives in `user_profiles`
  (`onboarding_status` / `onboarding_version` / `onboarding_completed_at`, migration
  `V75`), not in `localStorage`, so clearing a cache or moving to another device
  cannot re-trigger it or lose the answers. The server computes `onboarding.required`
  and both profile endpoints return it, so the client reads one boolean instead of
  keeping its own copy of the rule. It is auto-opened once per page load by
  `src/app/OnboardingAutoOpen.jsx` — a separate component precisely so the
  "open once, never trap the Back button" rule has a test.
- **The shell reads real data.** The header and rail used to carry literals
  (`streakDays={12}`, `credits={240}`, avatar "M", badge "3"). Streak comes from the
  onboarding gate's own summary request, credits from `CreditProvider`, the avatar
  initial from the session, and the unread badge from `useUnreadCount` — which was
  also reading the wrong field (`data.count`, where the backend sends
  `data.unreadCount`), so every unread notification was invisible.
- **Verification** — 456 tests across two runners: 385 under Vitest across 31 files
  (routes, auth guarding, the mobile pane split, the paper transformation, real
  API-response mapping, the deferred English load, the onboarding payload shape and
  the auto-open guard, the path's node states and what it refuses to state, and the three
  session start payloads) and 71 under `node:test` (v1's own utility and API tests, which
  Vitest cannot run, plus the fixture helper).
- **Learning path** — screen 06, at `/path`. This also fixes a live bug: the rail has
  linked to `/path` since the first v2 build with no route behind it, so the one link
  named "Lộ trình học" fell through the catch-all to `/home`. The screen renders decisions
  the server makes (`state` + `stateReason`, computed from answered questions per question
  type, completed attempts, graded submissions and the due vocabulary queue), never
  re-derives the ordering, and refuses three specific lies: a band of 0 is treated as "not
  measured" rather than printed as a result, a node with no progress gets no progress line,
  and a locked node stays labelled and focusable so the learner can see the next step
  exists. The price of a press is rendered from the live credit config, before it is
  pressed. Design and data contract: `_design/LEARNING-PATH.md`; live check:
  `scripts/dev-verify-learning-path.mjs`.
  **Verified end to end against a real instance** (a second backend on 8083; the one on
  8082 was never touched): a new account gets the diagnostic node, pressing it and the drill
  the path then offers moves the path from `0/5` to `1/5`, a drill returns ONLY the question
  type it asked for, and the 5 credits shown on the node are exactly the 5 credits deducted.
  The script also cross-checks the per-skill band against SQL rather than against itself.
- **The scoped and scoped-to-a-type practices start correctly now.** Building the path
  exposed a routing bug: `IeltsTakePage` read `attemptMode` and `scopeType` from the URL but
  not `scopeId` or `questionType`, and `useIeltsSession` only opened a session when a
  `testId` was present. So the "practice this passage" link the Home screen offers started
  the WHOLE test instead of the passage, and a question-type drill could not start at all.
  Three payload tests now hold the three start shapes in place.
- **`scripts/dev-verify-*.mjs` can replay instead of calling the AI.** The verify
  scripts talk to the running backend, and the backend routes every AI feature through
  9router — so each iteration used to be real spend. They now default to replaying a
  recorded response from `scripts/fixtures/` (gitignored) and only call the AI with
  `--live`, which prints exactly which steps cost tokens first. A missing fixture is a
  hard error, never a silent fallback to live. See `scripts/README.md`.

### Vocabulary module — verified contract

- **Credentials come from `../en-practice-be/.env`, not `application-local.yml`.**
  Spring Boot loads that file and its `SPRING_DATASOURCE_*` variables OVERRIDE the
  yml, so the yml's `password: en_practice` is not the password in use. Reading only
  the yml produces "password authentication failed for user en_practice".
  `scripts/devDbConfig.mjs` resolves `.env` → the postgres container → the yml.
- **Path shapes differ between modules and are easy to guess wrong:**
  `/api/vocabulary-tests` (hyphen) and `/api/dictionary`, versus `/api/ielts`,
  `/api/reviews`. Guessing `/api/vocabulary/tests` yields a 500
  ("No static resource").
- **There is no `GET /vocabulary-tests/{id}`.** The routes are
  `POST /generate`, `GET` (list), `POST /{id}/start`, `POST /attempts/{id}/submit`,
  `GET /attempts`, `GET /attempts/{attemptId}`. Test status is read from the LIST.
- **Generation is asynchronous with THREE states.** `POST /vocabulary-tests/generate`
  answers **202** with status **PENDING** ("has been queued"), and a Kafka consumer
  then builds the paper into **READY** or **FAILED**. Code that only waits for
  `GENERATING` never polls at all.
- **A new account cannot generate.** With no vocabulary records, notebook words or
  lookup events the backend answers `400 Not enough vocabulary data`. This is an
  onboarding state, not a failure: the UI points at the notebook instead of offering
  a retry that cannot succeed.
- **`sources` is a closed enum** (`VOCABULARY_RECORD`, `USER_DICTIONARY`,
  `USER_WORD_LOOKUP_EVENT`, `ALL`), an empty list means ALL, and **no endpoint lists
  them** — the UI must not pretend to discover them.
- **Answers are submitted by INDEX** (`selectedOptionIndex`), not by text.
- **Generation is currently failing in this environment**: the backend's own AI call
  returns `HTTP 404` for its configured model alias, so every generated test becomes
  `FAILED` with the title "Vocabulary test generation failed". The UI renders that
  state correctly (verified live). Fixing it is backend configuration.
- **The client is NOT sent `correctAnswers` for vocabulary questions**, unlike IELTS
  where the answer key arrives in the question payload. This module is the safer of
  the two.

### Dictionary / notebook — verified contract

- **`/dictionary` and `/dictionary/due-review` return Spring's native `Page`**
  (`content`, `number`), while `/ielts/*` and `/vocabulary-tests` return
  `PageResponse` (`items`, `page`). `readPage` handles both; reading one shape
  reports page 0 forever. See `src/api/envelope.test.js`.
- **`PATCH /dictionary/{id}/review` takes its score in the REQUEST BODY**, as
  `ReviewWordRequest { performanceScore }`, validated `@Min(0) @Max(5)`. Sending it
  as a query parameter fails with HTTP 500 "Required request body is missing", which
  reads like a server fault rather than a caller mistake. Posting 9 returns 400.
- **The 0-5 scale, measured rather than guessed:** 0 and 2 hold `proficiencyLevel`
  at 0 with a near-immediate next review; 4 moves it to 1; 5 moves it to 2 with
  progressively later dates.
- **`nextReviewAt` is ALWAYS set.** A freshly added word returns a date a couple of
  hours ahead, so "has a `nextReviewAt`" cannot mean "due". The notebook compares
  against now (`isDue`); the first version labelled every word "Đã tới hạn".
- **`GET /dictionary/stats`** returns `totalWords`, `favoriteWords`,
  `wordsToReviewToday`, `newWords`, `learningWords`, `masteredWords`.
- **List filters that exist:** `keyword`, `wordType`, `isFavorite`,
  `proficiencyLevel`, `tag`, plus `page`/`size`/`sortBy`/`sortDir`.
- **There is no `reviewsApi` screen yet.** `POST /api/reviews` (a review SESSION
  record) and `GET /api/reviews/last` exist and `reviewsApi.js` is ported, but the
  SRS screen writes through `/dictionary/{id}/review` instead, which is what
  actually moves the schedule.
- **The design's per-button review intervals are deliberately not shown.** Screen 13
  specifies "<1 ngày / 2 ngày / 5 ngày / 12 ngày" on the four recall buttons. The
  backend does not return its interval schedule and the next date depends on the
  word's current level as well as the score, so stable per-button counts cannot be
  derived — they would be invented, which `PRODUCT.md` rules out. The buttons name
  the recall quality and the schedule direction, and the REAL `nextReviewAt` is
  shown after the choice. This is a sourcing decision, not an oversight.

### The port was incomplete: `src/features/*` was never copied

- `src/contexts/VocabularyExplainContext.jsx`, `CreditContext.jsx`,
  `RealtimeStompContext.jsx` and `useCreditAction.js` were present but could not
  resolve their imports — everything they need lives under v1's `src/features/`,
  which the port skipped. They were inert, not merely unused, and nothing rendered
  them either.
- Ported from v1: `features/credits` (5 modules), `features/guest-ai-trial` (4),
  `features/realtime` (2), `features/vocabulary-explain` (1) — **with their own
  `node:test` suites**, which is why the Node runner went from 7 tests to 31.
- `npm run test:node` now globs `src/features/**/__tests__/*.test.js`, and vitest
  excludes every `__tests__` directory by pattern. That exclusion was previously a
  hand-written list of three paths, so adding any new `__tests__` file made vitest
  pick it up and fail the whole UI suite with a "No test suite found" loader error.
- One v1 test was **already failing upstream**: `connectionVersion` was added to
  `realtimeTransportController` two hours after its test was written, and the
  expectation was never updated. The controller is correct (the field tells a new
  connection from a replayed snapshot, and `RealtimeStompContext` reads it), so the
  stale expectation was fixed here.
- Still unresolved and deliberately out of scope: `features/chat`,
  `features/notification`, `features/learning`, `components/review/reviewSelection`
  and `theme/themeTokens`. They are reachable only from `useStompClient`,
  `useNotification*`, `storageHelper` and `pagePalettes`, none of which any
  implemented screen imports.

### Provider chain and the bundle

- `AppLayout` now mounts `CreditProvider` → `RealtimeStompProvider` →
  `VocabularyExplainProvider`. The order is a real dependency chain: the explain
  provider prechecks a credit cost and publishes over STOMP, so it needs both.
- **`AppLayout` itself is now `lazy()`.** It was a static import, which put the
  STOMP client in the entry chunk (177.91 → 190.63 kB gzip). Lazy, the entry is
  **162.30 kB gzip** and the shell is its own 15.40 kB chunk — smaller than before
  the providers were mounted at all.
- `getRealtimeStompUrl()` derives the socket from `VITE_API_URL`
  (`ws://localhost:8082/ws/realtime-chat`), matching the backend's registered
  endpoint. Its hard-coded fallback still says port 8080, which is dead; the env var
  is always set, so it is unused in practice but should not be trusted.

### The AI explain stream — VERIFIED end to end

- **Both AI paths in the vocabulary module are now verified against the running
  backend**, after the 9Router service was given working provider credentials.
- **Explain stream** (`scripts/dev-verify-explain-stream.mjs <email> <password> [word]`):
  the socket authenticates (the `Authorization` header goes on the **upgrade
  request**, read by `WebSocketHandshakeInterceptor`, not in a CONNECT frame), the
  user queue delivers, and the frames arrive as
  `START → DELTA ×486 → COMPLETE`. A real explanation streams ~400–500 deltas for
  ~1.0–1.2 kB of markdown, so the progressive rendering is genuinely progressive
  rather than one chunk dressed up as a stream.
- **Output is Vietnamese markdown** (`# heading`, `**IPA:**`, `## Ví dụ`, numbered
  lists), which is exactly what the `Markdown` component renders.
- **Test generation** (`scripts/dev-verify-vocabulary-flow.mjs`): 202 `PENDING` →
  `READY` after ~35 s (13 polls at 2.5 s), so the app's 3 s poll interval is
  well-matched. 5 questions generated, `submit` returned 5/5 with `explanation` on
  each result, and `GET /attempts/{id}` reopened it. Confirms `selectedOptionIndex`,
  `correctOptionIndex`, `selectedAnswer`, `correctAnswer` all as mapped.
- **The `blankSentence` / `questionText` split is real**: `questionText` carries the
  INSTRUCTION ("Choose the best word form to complete the sentence.") and
  `blankSentence` carries the actual prompt. The take screen prefers `blankSentence`,
  which is correct.
- **`requestId` MUST be a UUID.** `VocabularyExplainStreamEngineImpl.normalize` parses
  it with `UUID.fromString` and answers `INVALID_REQUEST` — streaming nothing — for
  anything else. v1's fallback built `explain-<timestamp>-<random>`, which is not a
  UUID, and that branch only runs when `crypto.randomUUID` is missing (insecure
  context, older Safari). So on exactly those deployments every explain request never
  started. `createExplainRequestId` now always produces a v4 UUID, with tests in
  `src/features/vocabulary-explain/__tests__/explainRequestId.test.js`.
- **`word` is 1–100 characters**, blank-rejected, and the server lowercases it.

### A blank screen on network failure — found and fixed

`classifyError` checked `if (status >= 500)` BEFORE the "no status means the request
never completed" branch. With `status === undefined` that comparison is `false`, so
execution fell past the whole numeric block and reached
`(error.errorCode ?? error.code)` — which **throws when `error` is null**.

`AsyncBoundary` therefore crashed while rendering its own error state. A user with a
flaky connection, an offline phone, or the backend stopped locally saw a BLANK SCREEN
instead of "Check your connection" plus a retry — on **every screen in the app**.

It survived because every test that existed happened to use an error carrying a
`status`, and axios network failures do not always set one. It surfaced only when the
weekly-report test rejected with a plain `new Error('Network Error')`.

The fix reorders the branches so a missing status is handled first, guards `error`
itself, and drops the `error instanceof ApiError` check (that throws when the class is
not a function, e.g. in a test whose mock omits the export; a duck-typed `status` is
what callers actually rely on). `src/hooks/useAsyncResource.test.js` now covers it,
including `null`, `undefined`, `status: 0` and every real status code.

### Weekly report — an empty state the backend reports as a 500

- `GET /user/reports/weekly/current` throws
  `ResponseStatusException(404, "Weekly report is not ready")` for an account whose
  first week has not been finalised, but `GlobalExceptionHandler` flattens it to
  **HTTP 500** with a generic Vietnamese message. The intended 404 never reaches the
  client.
- The client recovers it: `isReportNotReady()` matches the message, and the screen
  then shows a real empty state ("Báo cáo tuần chưa sẵn sàng") rather than a server
  error the user can do nothing about. **A client should not have to pattern-match a
  message to recover a status code** — this is a backend bug worth fixing.
- `/user/reports/weekly/history` works and returns an empty `PageResponse`.

### Writing module — verified contract

- **Grading is ASYNCHRONOUS with three states.** `POST /writing/tasks/{id}/submit`
  returns `status: SUBMITTED` with a **null** `overallBandScore`, then `GRADING`, then
  `GRADED` (`SubmissionStatus` = SUBMITTED / GRADING / GRADED / FAILED). Measured ~6 s
  for a Task 2 essay, but it is AI-bound, so the result screen polls and says it is
  waiting rather than rendering a null band as a score.
- **`content` and `instruction` contain literal `<br>` tags** and no other HTML
  (checked). They render as TEXT with the breaks converted, never as HTML — the strings
  come from the database, and `dangerouslySetInnerHTML` on them would be an injection
  point for no benefit.
- **`overallBandScore` is `6` for what the API's own feedback calls band 6.0** — a
  Float, so the UI always shows one decimal.
- **`aiFeedback` is MARKDOWN** (~2.6 kB for one essay) and is genuinely
  criterion-aware: an off-topic essay returned `TR=3` with the other three at 7, led by
  "the essay answers the wrong question".
- **`POST /writing/tasks/highest-scores`** takes `{ taskIds }` and returns
  `[{ taskId, attempted, submissionId, highestBandScore, status, gradedAt }]` — one
  batch call per page rather than one request per card.
- **Task types are `TASK_1` and `TASK_2`**; `taskType` is a valid list filter.

### The annotated essay is NOT built — a real gap, not an oversight

Screen 23 specifies the user's own text marked per span (a green "Câu chủ đề rõ" tag,
amber lexical notes, red structural problems, each with a note), plus a "Sửa lỗi cụ thể"
column converting each mark into a before/after instruction.

**The backend sends no span data.** `WritingSubmissionResponse` carries four criterion
Floats, one `overallBandScore`, and `aiFeedback` as markdown prose; a search of the
writing DTOs and services finds no offset, span, mark or annotation field anywhere.

Fabricating spans by diffing the markdown would produce confident highlights pointing at
arbitrary sentences, which is worse than none — a wrong annotation in a study tool
teaches the wrong thing. So the result screen shows the essay and the feedback as two
columns (which IS the design's two-column body, and lets a reader match a comment to
their own sentence) and puts the diagnosis in the four criterion cards. **This needs a
backend field** — per-span marks with `start`, `end`, `kind` and `note` — before the
designed version can be built honestly.

### Speaking module — verified contract

- **Grading is ASYNCHRONOUS**, the same three states as Writing
  (SUBMITTED / GRADING / GRADED / FAILED). Measured **~9 s** for a transcribed answer.
- **`cueCard` is NULL for `PART_3` topics** — the cue card is a Part 2 device. Verified
  live, so the practice screen renders it only when present rather than showing an empty
  card. Parts are `PART_1`, `PART_2`, `PART_3`.
- **A submit with a transcript and NO audio is accepted** (HTTP 200). That is what makes
  the Web Speech API path viable without an audio upload; `audioUrl: null` is valid.
- **`speechAnalytics` is PARTLY CLIENT-SUPPLIED** — the submit request carries it. The
  browser can honestly measure `wordCount` and `wordsPerMinute` from the transcript and
  the recording duration, and the client sends only those plus detected fillers.
  `avgPauseDurationMs`, `longPauseCount`, `avgWordConfidence` and `lowConfidenceWords`
  are **not invented**; the result screen OMITS a metric with no value rather than
  showing `0`, which would read as a flawless performance.
- **The AI grades honestly**: an off-topic transcript returned `FLU=5.5` with the other
  three at 6, led by "Critical issue: off-topic response".
- **`POST /speaking/topics/highest-scores`** takes `{ topicIds }` and returns
  `[{ topicId, attempted, attemptId, conversationId, highestBandScore, status,
  sourceType, gradedAt }]`.
- **Custom speaking conversation is built** (screen 27) — see its own section below. The
  separate `/api/speaking/conversations/*` endpoints (topic-anchored, not custom-configured)
  are still unused, as are the ported `useConversationStomp` / `useCustomConversationStomp` hooks.

### Account — verified contract, and what is local rather than synced

- **`GET /user/profile/summary`** -> `{ id, email, displayName, avatarUrl, goals,
  levelInfo, overallBand, currentStreak, weeklyXp }`.
  **`GET /user/profile`** -> the full record, adding `bio`, `overview`, `streak`
  (with a 30-day `heatmap`), `todayGoal`, `bandProgress`, `vocabProgress`,
  `dictionaryStats`, `weakSkills`, `recommendedPractice`, `recentActivities`,
  `leaderboardSummary`. Profile uses the full one, since the stat tiles and the level
  panel both need `overview` and `levelInfo`.
- **A NEW ACCOUNT'S `goals` IS ENTIRELY NULL except `dailyGoalMinutes: 30`.**
  `targetIeltsBand` and `targetExamDate` are null, so Profile asks for a goal instead of
  drawing a progress bar toward nothing. Verified live.
- **`levelInfo` starts at `currentLevel: 1, totalXp: 0, xpNeededForNextLevel: 100`.** The
  design says level is COSMETIC and gates nothing, so the panel explains what earns XP
  and carries no lock icon or "unlock" language.
- **`PUT /notification-preferences` accepts a PARTIAL body.** Verified: sending only
  `{ allowPush: false }` left the other twelve fields untouched. Each switch is therefore
  one atomic write, and "pause every reminder" switches all thirteen `allow*` flags off
  in a single request rather than thirteen.
- **`GET/PUT /notification-preferences` has 13 booleans** (`allowPush`, `allowEmail`, and
  eleven `allow*Reminder` / `allow*Notification` flags).
- **THEME, TEXT SIZE AND THE TWO STREAK SWITCHES ARE LOCAL-ONLY, and the screen says
  so.** The backend has no theme, text-size or streak-visibility field and no
  user-preferences endpoint for them. They live in `localStorage` under
  `en-practice:prefs`, and Settings states that another device uses the defaults rather
  than presenting them as account settings. "Pause all reminders" is a real behaviour
  layered on the real API: it captures the current `allow*` values locally first, so the
  pause is reversible across a reload.
- **Export data, delete chat history and delete account have NO endpoint.** They render
  as DISABLED with the reason stated, rather than as working buttons for work that is not
  done.

### Landing, and the guest trial that the routing made impossible

- **The guest trial was unreachable.** `/vocabulary/check` sat inside `AppLayout` behind
  `RequireAuth`, so a guest clicking "Học thử không cần tài khoản" — advertised as a peer
  action on both the landing page and the login card — was redirected to `/login`. The
  product promised a no-account trial and the routing forbade it.
- Fixed by splitting the layout in two: `ProviderStack` (the Credit → RealtimeStomp →
  VocabularyExplain chain, taking `children`) and `ProviderLayout` (the same chain around
  an `<Outlet />`). `/vocabulary/check` now mounts under `ProviderLayout`, so it gets the
  AI explain stack WITHOUT the sidebar, tab bar or floating Lexi helper.
- **`ProviderLayout` must NOT be nested inside `AppLayout`.** A first attempt rendered
  `<ProviderLayout>` as a child of `AppLayout`, which put its `Outlet` in the tree before
  the shell own — so the child route never rendered and EVERY shell screen came up blank.
  That is why the stack is separated from the outlet.
- **The root now serves the landing page to a guest**, via `RootRedirect`. v1 sent a guest
  to `/vocabulary/check`; the reasoning (never bounce a guest to `/login`) was sound but
  the destination was wrong — the root is the one URL a visitor reaches without choosing
  anything, and it was showing an input box with no explanation of the product.
- **`RootRedirect` is statically imported, so `LandingPage` is lazy INSIDE it.** A static
  import there pulled the landing into the entry chunk: measured 168.52 to 184.36 kB gzip.
  Lazy, the landing is its own 2.65 kB chunk and the entry stays at 169.75 kB.
- **The landing page may not fabricate proof.** No counters, no testimonials, no logo
  wall, no band-improvement claim and no price. `PRODUCT.md` forbids all of it, so
  `LandingPage.test.jsx` asserts their ABSENCE by pattern as well as asserting the honest
  content is present. The product illustration carries the fake browser chrome and the
  caption "Minh hoạ sản phẩm, không phải bài làm của người dùng thật", and costs point at
  `/credits` rather than being quoted, so there is one source of truth for pricing.
### Notification centre, and the ported chat logic

- **`features/chat` is ported WITH its four v1 `node:test` suites**, which is why the Node
  runner went 37 -> 58. It is pure logic (history mapping, message state, realtime
  contract, scroll state), so it needed no rewriting.
- **`isRead` is the field, not `read`.** v1's `matchesNotificationFilter` reads
  `item.read`, which the backend never sends — so the filter reported every notification
  as unread and none as read. `src/features/notification/notificationFormatters.js` uses
  `isRead`, and the tests fail against v1's helper, which is the point of writing them.
- **v1's `NOTIFICATION_TYPE_VALUES` lists `VOCABULARY_TEST_READY` TWICE.** The v2 list is
  deduped; the redundancy is noted at the definition rather than silently carried over.
- **A notification's `actionUrl` is split by kind.** An external URL opens in a new tab
  with `rel="noopener noreferrer"`; an internal path goes through the router. Treating
  them alike is how a notification becomes an open redirect, or a full page reload that
  loses app state.
- **`DELETE /notifications/{id}` exists** and the centre uses it, optimistically with a
  revert. Read and delete both revert on failure, so a failed write never leaves the UI
  claiming it worked.
- **The streak notification carries the grace-day message in-product** ("Nghỉ một ngày
  cũng không sao…"), because that is the moment a user is most likely to feel behind.
- **Still unported, and therefore dead code:** `src/hooks/useNotificationAction.js`,
  `useNotificationBell.js`, `useNotificationPreferences.js` and `useNotificationsPage.js`
  cannot resolve their imports (`features/notification/useNotificationCenter`,
  `features/learning/*`). The notification centre uses the v2 hook instead, so nothing
  imports them — but they will break the build the moment something does. Porting
  `features/learning` (2 pure modules) plus a `useNotificationCenter` context would close
  it; it is recorded here rather than left as a surprise.
### AI coach — verified end to end

- **The chat stream works.** `scripts/dev-verify-chat-stream.mjs <email> <password> [question]`
  confirmed `START → DELTA ×285 → COMPLETE`, 1120 characters of markdown for one question.
- **The topic identity is the user's `id`.** The backend builds
  `/topic/realtime-chat/{userId}` from `authUtil.getUserId(principal)`, and the login
  payload carries that same UUID at `data.user.id` — checked against the JWT `sub`, and
  they match. `chatMessageState` also accepts `userId`/`sub`, so the fallback chain is
  belt-and-braces rather than a guess.
- **`ChatMessageRequest` is `{ clientMessageId, content, senderId, timestamp }`** with
  `clientMessageId` and `content` `@NotBlank` and `senderId` optional. A UUID
  `clientMessageId` satisfies the constraint and lets the server deduplicate a retry.
- **Content is capped at 1000 characters** (`GUEST_CHAT_DEFAULT_MAX_CHARACTERS`);
  `normalizeChatContent` throws `INVALID_REQUEST` past it, and the composer enforces the
  same limit so the server check is a backstop rather than the user's experience.
- **Lexi's opening line is built only from data the account has.** `weakSkills` is `[]`
  for a new account (verified), so the three cases are distinct and one of them says "I
  have no practice data from you yet, so I cannot say where you are weak — and I will not
  guess." Inventing a named weakness for someone who has never answered a question would
  be the most damaging lie this screen could tell, so all three cases are pinned by tests.
- **Re-subscription is keyed on `connectionVersion`.** A reconnect produces a new
  server-side session and a subscription on the old one is dead; without that dependency
  the coach looks connected and silently receives nothing, which is the hardest failure to
  notice because the UI shows a live socket and a send that appears to work.
### Leaderboard, rewards and challenges — verified contract

- **`myRank` is NULL for an account with no XP.** Verified. The screen says "unranked"
  rather than rendering rank 0, which reads as either first or last place.
- **RANKS ARE NOT UNIQUE.** Two accounts with 50 XP BOTH came back as `rank: 1`. So the
  list keys on `userId`, and a row whose rank equals the one above it renders as a tie
  rather than being split arbitrarily into a winner and a runner-up.
- **There is NO claim endpoint for reward missions.** `RewardMissionStatus` is only
  `LOCKED` or `CLAIMED`, and a completed mission carries `claimedAt` — the backend grants
  rewards automatically when the trigger fires. The screen therefore renders no "Claim"
  button and says the reward is automatic instead. A button that does nothing is worse
  than no button.
- **`/user/reward-missions` returns a bare ARRAY**, not a page. `readPage` would silently
  yield zero items.
- **`rewardDefinitions` MIXES types**: `{ type: 'CREDIT', amount, expiryDays }` and
  `{ type: 'INVENTORY_ITEM', itemCode, quantity }`. Only CREDIT entries are summed and
  shown; converting an inventory item into a credit figure would mean inventing an
  exchange rate the backend never states. A mission with no credit reward gets no chip
  rather than a "0 credits" chip.
- **Shapes:** `/leaderboard?period` -> `{ myRank, topUsers[], page }`;
  `/leaderboard/summary` -> `{ period, myRank, topThree[] }`;
  `/xp/history` -> `{ totalXP, weeklyXP, history[], page }` (it carries the totals, so the
  Rewards header uses it rather than re-deriving them);
  `/user/challenges/weekly/current` -> `{ weekStart, weekEnd, challenges[] }` with
  `currentValue`, `targetValue`, `progressPercent`, `remainingValue`, `rewardXp`,
  `status`, `completed`, `rewardGrantedAt`.
- **The challenges opt-out lives ON the challenges screen**, next to the challenges
  themselves, because the moment a user decides they do not want them is the moment they
  are looking at them. The row links to the Settings group that owns the switch rather
  than pretending to toggle something this screen cannot.
### IELTS test detail and history — verified contract

- **`GET /ielts/tests/{id}/practice-options`** returns a `fullTest` option plus per-section
  and per-passage options, each carrying `attemptMode`, `scopeType` and `scopeId`, and the
  passage level adds `audioSeekStartRatio` / `audioSeekEndRatio` / `audioSeekHint`. That is
  the endpoint for practising PART of a test; the full-test CTA uses
  `attemptMode: FULL, scopeType: TEST`.
- **The detail endpoint returns `sections[].transcript`**, so the screen can state the
  Listening transcript policy BEFORE starting rather than leaving it to be discovered after
  submission, which is how v1 behaves.
- **Question counts are summed from the returned paper**, not read from a separate number
  that could disagree with the paper itself.
- **`GET /ielts/attempts`** -> `PageResponse<TestAttemptHistoryResponse>` with `skill`,
  `bandScore` and `completedAt`, which is everything the band-by-week chart needs.
- **The chart omits empty weeks rather than plotting zero.** A zero column states "scored
  band 0 this week", which is a different and false claim. `buildBandSeries` emits only
  weeks that exist, skips attempts with a null band, keeps the BEST band per week and
  skill, and sorts oldest first. Weeks are labelled `2026-W41`, derived from the attempt's
  own timestamp — no fabricated dates.
- **The chart is `role="img"` with an `aria-label` listing the series in words**, and the
  bars are `aria-hidden`. A chart with no accessible name is not usable, and forty
  decorative divs add nothing to the description.
- **`ielts.skill` uses LOWERCASE keys** (`ielts.skill.listening`) while the backend enum is
  UPPERCASE, so `SKILL_LABEL_KEYS` now lives in `features/ielts/useIeltsDetail.js` and is
  shared by all three IELTS screens. Interpolating `${skill}` produced a missing key, and
  the fix would otherwise have needed a `defaultValue` the audit rejects.
### Ability evaluation — no endpoint, and a zero band is not a score

- **THERE IS NO EVALUATION ENDPOINT.** Verified: no controller maps to `evaluation`,
  `ability`, `band` or `rating`. The data lives on `GET /user/profile`, in `bandProgress`,
  `weakSkills`, `recommendedPractice` and `vocabProgress`, so the screen reads that rather
  than inventing an endpoint or fabricating a band.
- **`bandProgress` IS ALL ZEROS for a new account** — `{ current: 0, previous: 0 }` for
  every skill, verified. The screen renders a dash with an explanation, never `0.0`:
  `0.0` is a score, and this is "not measured".
- **A delta needs BOTH measurements.** `previous: 0` means there is no earlier reading, so
  the tile shows no change rather than a fabricated improvement.
- **`weakSkills` is NOT empty for a new account** — a fresh registration returned
  `["Academic Vocabulary", "Map Labeling"]`. So the weakness column is real content, and
  the copy is precise that these are tracked skill AREAS rather than measured failures.
- **`recommendedPractice` carries a `reason`** (`"We need a baseline to personalize your
  learning path."`), which is shown: a recommendation without its reason is just an
  instruction.

### Spaced repetition config, and the real schedule

- **The SRS intervals come from the backend's own `calculateNextReviewInterval`**: level 0
  -> 4 hours, 1 -> 1 day, 2 -> 3 days, 3 -> 1 week, 4 -> 2 weeks. The config screen states
  them rather than describing the feature.
- **`/dictionary/due-review` takes a `mode`, and `isQuickMode(mode)` switches between the
  due schedule and a deliberately easy session over any words.** That is the API's own
  distinction, which is why the "Quick practice" option exists; the other two options
  (`favorites`, `weak`) are client-side filters over fields the fetch already carries.
- **The screen's job is to remove the two reasons people skip review** — not knowing what
  will be reviewed, and not knowing how long it takes — so the due count, the estimated
  duration, and the duration again on the primary button are all real numbers. The
  duration is computed at a documented 16 seconds per card and labelled an estimate.
- **Direction has NO endpoint.** The review flow always prompts with the English word, so
  the direction control is stored locally and the screen says so rather than implying the
  server honours it.
- **`/dictionary/review` now reads `mode` and `filter`** from the URL. Without that the
  config screen would have been decorative: four options, all fetching the same due list.
### Custom speaking conversation — verified contract

- **`turn` returns the NEXT AI message, not an echo.** So a turn is ONE request: send the
  transcript, receive the reply. There is no separate poll for the response.
- **`maxUserTurns` comes back as 50**, not the 10 the backend's own env var
  (`CUSTOM_SPEAKING_CONVERSATION_MAX_USER_TURNS=10`) suggests. The UI reads it from the
  response, so a hard-coded number cannot disagree with the conversation's real limit.
- **After `/finish` the status is `GRADING`, not `COMPLETED`.** Grading is asynchronous,
  so the result screen polls and says it is waiting rather than showing a null band.
- **`gradingEnabled` is a per-conversation choice.** With it off, `overallScore` and
  `aiFeedback` stay null BY DESIGN — that is a practice conversation, and the screen says
  so instead of rendering an empty score panel that looks like a failure.
- **`topic` is free text** (`@NotBlank` String), not an enum, so the set-up uses a real
  text field.
- **The enums are exposed as the backend defines them**, including `FLIRTY`, `UNFILTERED`,
  `EDGY` and `REBELLIOUS` (style: 10 values, personality: 11, expertise: 11, voices: 7).
  Curating the list would hide options the API accepts. Note that some labels repeat ACROSS
  groups — "Thẳng thắn" is both a style and a personality — so tests assert counts, not
  singular queries.
- **`GET /custom-speaking-conversations/{id}` is the only place the exchange survives**: the
  step responses carry only the latest `aiMessage`, so a reopened conversation reads
  `turns[]` from the detail endpoint.

### Known backend behaviour worth recording

- **`/api/user/dashboard` no longer exists.** The user confirmed the aggregate
  dashboard endpoint is retired. v2 never used it — Home reads the granular
  `/user/dashboard/*` endpoints — so nothing depends on it. The earlier
  `isAggregateUnavailable()` helper that special-cased its HTTP 500 has been
  deleted rather than left guessing at a dead endpoint.
- **`POST /ielts/sessions/start` answers 402 when the wallet cannot cover it.**
  Verified against the running backend: a freshly registered account gets 402,
  because the credit API is READ-ONLY (`/credits/balance`, `/credits/transactions`,
  `/credits/costs`) and a new account's wallet is empty. 402 is now its own state —
  "not enough credits", with a link to the wallet — not a failure, and not an auth
  problem.
- **A local dev helper exists because of that:**
  `node scripts/dev-grant-credits.mjs <email> [amount]` seeds a wallet directly in
  the dev database, and `node scripts/dev-find-credit-account.mjs` lists accounts
  that already have credits. Both refuse to run against a non-local host.
- **The dev database is the `en_practice_postgres` Docker container, and
  `application-local.yml` has the WRONG password for it** (`en_practice`; the
  container uses a different one). That mismatch is what produced "password
  authentication failed for user en_practice". `scripts/devDbConfig.mjs` therefore
  reads the credentials from the container env first and only falls back to the
  yml — so the scripts keep working when someone recreates the volume.
- **The IELTS session contract is verified end to end** with
  `node scripts/dev-verify-ielts-flow.mjs <email> <password>`, which mirrors what
  the app does and costs one credit:
  - `flattenQuestions` returns **38** questions for a test the server reports as
    38 — the mapping agrees.
  - question types in the wild: `PASSAGE_COMPLETION` (31, no options → typed
    input), `MULTIPLE_CHOICE` (7, options → tiles), `SINGLE_CHOICE`.
  - every question carries the section's `audioUrl`, so the take screen's mobile
    tab correctly labels itself "Bài nghe".
  - `correctAnswer` is a LIST of accepted answers (`["harbour","harbor"]`), which
    is why the result screen joins it rather than rendering index 0.
  - `GET /ielts/attempts/{id}` returns the same shape as the submit response, so a
    result is genuinely reopenable — not just a receipt.
- **`correctAnswers` is present in the session's question payload.** The backend
  sends the answer key to the client, so `flattenQuestions` strips it and
  `assertNoAnswersLeaked` fails loudly in development if that ever regresses. The
  result screen reads the key from the submit response instead.
- **There is no `estimatedBand` field anywhere in the dashboard payloads.** The
  Home band tile was removed rather than faked; the number belongs on
  `/evaluation`, where it is produced.
- **`/credits/balance` returns 0 for a new account**, and `/ielts/attempts`
  returns an empty page — so the empty states are the default experience for a
  new user, not an edge case.

### Not built yet

- **Realtime is not mounted.** `RealtimeStompContext` and
  `VocabularyExplainContext` are ported but unused; `CreditContext` is not mounted
  either (screens call the api directly).
- **The dictionary/notebook screens exist now** — `/dictionary` (list + detail
  aside, memory-tiered), `/dictionary/review` (four-button SRS) and
  `/vocabulary/check` (lookup + streamed AI explain).
- **`Markdown` deliberately drops `rehype-raw`, which v1's `CustomMarkdown` uses.**
  The markdown here is model output arriving over a socket, and `rehype-raw` parses
  embedded HTML, so any `<script>` or `<img onerror=...>` the model emits becomes
  live DOM. `react-markdown` + `remark-gfm` alone renders markdown and leaves raw
  HTML inert, which is the correct default for untrusted content. The explain output
  is headings, lists, bold and tables — all real markdown, none of it needing raw
  HTML.
- **`/credits` and `/weekly-report` exist.** The credits page lists EVERY action
  including the free ones (showing only what costs money implies everything else
  might), and renders a `mode: DISABLED` action as *unavailable* rather than as free
  — `AI_CHAT` currently comes back with `cost: 0, mode: DISABLED`, and calling that
  "free" would advertise a feature that cannot be used.
- **5 of the 36 designed screens** exist only as mockups in `_design/mockup/`,
  not as routes. `_design/SCREENS-V2.md` specifies each one.
- **No PWA registration, no Playwright or axe gate.** `PROPOSAL.md` §7 phases 3–4.

### Next, in order

1. Continue Phase 3 module by module — Writing, Speaking, Progress, Account,
   Landing. The vocabulary module is now complete end to end (list → take → result
   → history, plus notebook, SRS review and lookup/explain).
2. **The AI explain stream is verified end to end** — socket, auth, subscription,
   frame sequence, streamed markdown and the generated-test round trip all confirmed
   against the running backend.
3. When the notification/chat screens are built, port the remaining
   `features/notification`, `features/chat` and `features/learning` modules.
4. Add the Playwright visual + axe projects (`_design/DESIGN-V2.md` §14) and the
   PWA registration. The axe project matters more now: the check screen has a
   streaming region and a disabled-until-affordable action, both of which need a
   real accessibility pass.

