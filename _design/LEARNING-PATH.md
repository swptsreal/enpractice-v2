# Learning path — screen 06: FE + BE design proposal

Companion to [SCREENS-V2.md](SCREENS-V2.md) §06 (the screen) and [PROPOSAL.md](PROPOSAL.md) §2.1
(why it is new). Mockup: `mockup/06-path.html`.

**Status: proposal for the DATA CONTRACT.** §7 lists what needs your decision before any code is
written. Everything in §2 was measured against the running backend and the live database, not read
off a document.

---

## 1. What the screen is for

Home answers "what do I do today". The path answers **"how far am I from my target band, and what
is the next small step"**. It is the only surface that shows a *sequence* rather than a list.

That distinction fixes the design: a path node must be **finishable** (the design system calls it
"small, finishable steps") and its finished/unfinished state must be **measurable from data we
already store**. A node whose state is guessed is worse than no node, because the user cannot tell
a real step from decoration.

**Not in this phase, deliberately:** no new authoring surface (admin stays in `en-practice-admin`),
no new lesson content, no social/competitive path, no unlocking by payment.

---

## 2. What the backend can already answer (measured)

### 2.1 Per-question-type performance EXISTS and is computable today

`ielts_answer_records` stores one row per answered question (`attempt_id`, `question_id`,
`user_answer`, `is_correct`), and `ielts_questions.question_type` is an 11-value enum. The join
works on real data — this is the backbone of a measurable path:

```sql
SELECT t.user_id, q.question_type, count(*) AS answered,
       sum(CASE WHEN a.is_correct THEN 1 ELSE 0 END) AS correct
FROM ielts_answer_records a
JOIN ielts_questions q ON q.id = a.question_id
JOIN ielts_test_attempts t ON t.id = a.attempt_id
GROUP BY 1, 2;
```

Measured on the live database: **1,791 answer rows across 5 users**, returning e.g.
`PASSAGE_COMPLETION 236 answered / 138 correct`, `MATCHING_HEADINGS …` per user. No new event
pipeline, no new tracking: the data is already there.

### 2.2 Content coverage is UNEVEN, so the path must be generated from content

Questions available per type (live):

| type | questions | sections |
|---|---|---|
| PASSAGE_COMPLETION | 223 | 30 |
| SINGLE_CHOICE | 161 | 28 |
| FORM_COMPLETION | 89 | 10 |
| SENTENCE_COMPLETION | 67 | 13 |
| TRUE_FALSE_NOT_GIVEN | 63 | 10 |
| MULTIPLE_CHOICE | 50 | 19 |
| MATCHING | 38 | 7 |
| SUMMARY_COMPLETION | 28 | 5 |
| MAP_LABELING | 27 | 5 |
| YES_NO_NOT_GIVEN | 26 | 5 |
| **MATCHING_HEADINGS** | **10** | **2** |

Published practice content: **15 IELTS tests** (7 Listening, 8 Reading), **20 Writing tasks**
(8 Task 1 / 12 Task 2 published), **23 Speaking topics** (12 Part 1, 6 Part 2, 5 Part 3). Vocabulary
has no catalogue at all — tests are generated per user from their own `vocabulary_records`.

Two consequences, and they decide §3:

1. **A hardcoded 11-node syllabus would be a lie.** `MATCHING_HEADINGS` has 10 questions in 2
   sections; `IeltsTest.Skill` has no `SPEAKING` value at all; WRITING has zero `ielts_tests` rows
   (writing lives in `writing_tasks`). The path must be built from what exists, per user.
2. **There is no curriculum table and none is needed** if nodes are generated from the catalogue.

### 2.3 What already exists that a path can reuse

| need | existing mechanism |
|---|---|
| launch a small practice with any question set | `IeltsTestAttempt.question_ids_snapshot` (jsonb) — an attempt already carries an arbitrary question list |
| scope a practice to a passage/section/test | `IeltsTestAttempt.AttemptScopeType = TEST, SECTION, PASSAGE` + `scopeId`, and `IeltsQuickLaunchService` already picks the smallest scope and builds the action URL (`/ielts?mode=quick&skill=…&scopeType=…&scopeId=…`) |
| a recommendation card with a real action | `GET /api/user/recommendations/{primary,feed}?surface=…` → `RecommendationCardResponse` (`title`, `actionUrl`, `estimatedMinutes`, `priority`, `referenceType/Id`, `metadata`) |
| "the first step is a diagnostic" | `UserProfileServiceImpl.defaultRecommendations()` already returns a Diagnostic Test with the reason *"We need a baseline to personalize your learning path."* |
| per-user caching of a computed surface | `RecommendationCacheEvictionService` + the `@Cacheable`/eviction pattern in `IeltsQuickLaunchService` |
| tunables | `SystemConfigPayload` groups (e.g. `recommendation.quickLaunch`) |
| cost shown before the press | `CreditActionCode` (8 codes) + the FE's `CreditProvider.getCost()` |

### 2.4 What does NOT exist (and shapes the work)

- **No per-question-type scope.** `AttemptScopeType` is `TEST | SECTION | PASSAGE`; a "Matching
  Headings drill" cannot be started today.
- **No per-type aggregate endpoint.** The join in §2.1 exists only as a query shape; no service
  computes it, and `weakSkills` is NOT it — for a new account it is the hardcoded fallback
  `["Academic Vocabulary", "Map Labeling"]` in `UserProfileServiceImpl.getWeakSkills`.
- **No `/path` route.** `src/app/navigation.js` already lists `{ to: '/path', labelKey: 'nav.path' }`
  and `src/app/pageTitles.js` already maps it, but `src/App.jsx` has no route, so pressing
  "Lộ trình học" today silently falls through the catch-all back to `/home`.
- **No curriculum, order, prerequisite or unlock concept anywhere.** A grep of every
  `migration/*.sql` for `unit|path|prerequisit|unlock|lesson|node|milestone` returns nothing, and the
  only entity field named `path` is `UserPracticeRecommendation.path`, which holds a URL route. The
  two ordered containers that do exist are both unsuitable: `user_daily_task_items` is regenerated
  daily from `stableShuffle(seed = hash(userId, date))` (deliberately random per day, so it cannot
  express "unit 2 opens after unit 1"), and `user_practice_recommendations` is overwritten every 6
  hours and 4 of its 5 signals carry no `referenceId` at all.

### 2.5 Two defects this design must route around

**A. Per-skill band is wrong, and 0 means "not measured" and "measured zero" at once.**
`UserProfileSnapshotServiceImpl` assigns the SAME latest IELTS attempt score to both
`listeningBand` and `readingBand`, and then computes `overallBand` from listening + speaking +
writing — i.e. it drops Reading from the average while still returning a `readingBand`. The
dashboard path repeats the same shape in `UserDashboardComputationCache` and
`DashboardAggregateRepository`. Every missing measurement defaults to `0f`.

Consequence for this feature: **the path must not order units by `bandProgress`.** It orders by
per-question-type accuracy from `ielts_answer_records` (§2.1), attributed to a skill through
`questions → passages → sections → tests.skill` — verified live, 17 rows, e.g. `READING /
YES_NO_NOT_GIVEN 82 answered @ 8.5%` vs `READING / MATCHING 14 @ 100%`. That measurement is
independent of the broken band code, and it is finer: it distinguishes Listening from Reading
problems *and* which question type inside them.

`currentBand` in the API (§4) therefore comes with a warning attached: it may only be shown when it
is a real measurement, and the profile's per-skill reading/listening split cannot be trusted until
the band calculation is fixed. That fix is a separate backend task, worth doing on its own.

**B. The migration files are not a reliable record of the applied schema.** There is no Flyway or
Liquibase (`pom.xml` has neither) and `ddl-auto: none`, so migrations are applied by hand. Two
version numbers are duplicated (`V4`, `V46`), and `migration/V45__check_in_inventory_xp_milestones.sql`
ends a column list with `)),` followed by `);` — a trailing comma PostgreSQL rejects, so that file
cannot be the version that was applied. Confirmed: the tables it creates, *and* the CHECK constraint
whose line contains the stray comma, both exist in the live database.

**Rule for this feature: apply the new migration, then verify the schema with a query against
`information_schema` — never trust the file.** (Which is what `V75` did for onboarding.)

### 2.6 One content-quality observation to carry forward

The question-type labels on Listening content include Reading-only types: 594 of the answered
Listening questions are labelled `PASSAGE_COMPLETION`. The generator offers a type in a skill only
where that type actually occurs in published content, so a Listening unit may legitimately contain a
node titled "Passage Completion" — honest, but odd on screen. It is a content-labelling question for
whoever curates the IELTS imports, not something the path should paper over.

---

## 3. The model

### 3.1 Unit

A **unit** is one skill × one focus area, and it is GENERATED, never authored:

| unit source | focus areas | node action | real content |
|---|---|---|---|
| Reading / Listening | question types with ≥ `minQuestionsForDrill` questions | question-type drill (new scope, §6.1) | 11 types |
| Writing | Task 1, Task 2 | a real `WritingTask` | 20 tasks |
| Speaking | Part 1, 2, 3 | a real `SpeakingTopic` | 23 topics |
| Vocabulary | due SRS queue | `/dictionary/review` | user's own words |

A unit is a **stable key** (`reading.matching_headings`, `writing.task_1`), not a database id. There
is no `unit` table: the generator derives the unit list from content + measurements on every
request, so a unit can never outlive its content.

### 3.2 Node

A node is one sitting of work with a measurable finish:

| kind | finish rule | progress shown |
|---|---|---|
| `TYPE_DRILL` | `answered ≥ drillQuestionTarget` **and** `accuracy ≥ drillAccuracyThreshold` in that type | "câu 3/10" (matches the mockup) |
| `SCOPED_PRACTICE` | one `COMPLETED` attempt at that `scopeType`+`scopeId` | "Xong · 8/8" |
| `WRITING_TASK` | that task has a `GRADED` submission | "Xong · band 6.0" |
| `SPEAKING_TOPIC` | that topic has a `COMPLETED` attempt | "Xong · 6.5" |
| `VOCAB_REVIEW` | the due queue is empty, or ≥ `vocabReviewTarget` words reviewed today | "12 từ đến hạn" |
| `UNIT_CHECK` (milestone) | one `COMPLETED` attempt on the unit's skill, full or section scope | "Mở sau 5 bài" |

**Completion is completion, not a passing grade.** A milestone becomes `done` when the attempt is
completed, whatever the score. Gating progress behind a score would punish the exact user the
product is for, and the design system's ethic elsewhere (the Grace-Days Rule, "Để mai làm" as a
first-class action) is anti-pressure. Scores influence **ordering**, not locking.

### 3.3 Ordering, unlocking, and why the server decides

- Units are ordered by **measured weakness first**: the skill with the lowest measured accuracy
  leads; within a skill, the lowest-accuracy question type leads. Unmeasured focus areas come after
  measured ones, ordered by available question count descending, so a new node always has enough
  content to finish.
- A unit's milestone is last. Nodes unlock in order: node *n* is `LOCKED` until *n-1* is `DONE`.
  The first not-done node is `CURRENT`.
- **All of this is computed on the server** and returned as a state per node, exactly as
  `onboarding.required` is. The FE renders states; it does not re-derive them. One source of truth,
  and a rule change cannot disagree between clients.

### 3.4 Tunables (system config, not code)

New `learningPath` group in `SystemConfigPayload`, next to `recommendation.quickLaunch`:

```
minQuestionsForDrill      20   // a drill node is only offered if the type has this many questions
drillQuestionTarget       10   // "câu 3/10"
drillAccuracyThreshold    0.7  // 70%
maxUnits                   6   // matches the mockup's "Unit 2 / 6"
maxNodesPerUnit            4   // plus the milestone
vocabReviewTarget         12
```

`SystemConfigPayload` uses `@JsonIgnoreProperties(ignoreUnknown = true)` and mutable `@Data`
classes, so the existing stored config deserializes with a null `learningPath`: **the service must
treat a missing group as defaults**, and the group must be seeded for the admin UI to show it.
This is a real, small risk (a null group would NPE on first read) — noted in §6.3.

---

## 4. Proposed API contract

`GET /api/learning-path` — one request for the whole screen (the page needs the goal, the position
and the nodes; splitting it would be three requests for one view).

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "targetBand": 6.5,
    "currentBand": null,
    "overallAccuracy": 0.54,
    "xp": 2480,
    "unitIndex": 2,
    "unitCount": 6,
    "generatedAt": "2026-10-11T10:12:00Z",
    "unit": {
      "key": "reading.matching_headings",
      "index": 2,
      "title": "Reading — Nối tiêu đề",
      "subtitle": "4 bài · 1 bài kiểm tra cuối unit",
      "progress": { "done": 3, "total": 5, "percent": 60 },
      "nodes": [
        {
          "key": "reading.matching_headings.drill",
          "kind": "TYPE_DRILL",
          "title": "Matching Headings",
          "state": "DONE",
          "stateReason": "DRILL_TARGET_MET",
          "progress": { "answered": 10, "target": 10, "correct": 8, "accuracy": 0.8 },
          "estimatedMinutes": 8,
          "costActionCode": null,
          "action": { "type": "ROUTE", "url": "/ielts?mode=quick&questionType=MATCHING_HEADINGS" }
        },
        {
          "key": "reading.matching_headings.check",
          "kind": "UNIT_CHECK",
          "title": "Kiểm tra cuối unit",
          "state": "LOCKED",
          "stateReason": "NEEDS_ALL_UNIT_NODES",
          "estimatedMinutes": 20,
          "costActionCode": "IELTS_START",
          "action": { "type": "ROUTE", "url": "/ielts?mode=quick&skill=READING&scopeType=SECTION&scopeId=…" }
        }
      ]
    },
    "nextUnit": { "key": "writing.task_1", "index": 3, "title": "Writing — Task 1", "topics": ["Biểu đồ", "Quy trình", "Bản đồ"] }
  }
}
```

Contract notes, each of which is a decision:

- **`state` is the server's answer** (`DONE | CURRENT | LOCKED | MILESTONE`), and `stateReason` is a
  machine code the FE maps to copy ("Xong · 4/4", "Đang học · câu 3/10", "Mở sau bài hiện tại",
  "Khoá"). Reasons instead of prose so the copy lives in i18n, not in the API.
- **`costActionCode`, not a number.** The credit cost of an action already lives in the credit
  config and is already fetched by `CreditProvider.getCost(actionCode)`. Returning a number here
  would create a second source of truth that drifts the first time the price changes. `null` (or a
  `DISABLED` mode in the credit config) means the FE shows no cost chip.
- **`currentBand` is `null` when not measured** — never 0. The Evaluation screen already made this
  call; the path must not regress it.
- **`actionUrl` reuses the existing quick-launch URL scheme** so `src/utils/ielts.js` keeps parsing
  it and the whole start path (credits, attempt creation, grading) is unchanged.

### 4.1 Machine values the client needs, so no prose is baked into the payload

v2 keeps display text in the locale files, so the API carries VALUES and the client picks the
words. Alongside `title` (which stays as a fallback for content-originated names — an IELTS test's
title, a speaking topic's question — because those are authored prose there is nothing to translate
from), the payload carries:

| field | values | used for |
|---|---|---|
| `unit.skill` | `LISTENING \| READING \| WRITING \| SPEAKING \| VOCABULARY` | the first half of a unit's name |
| `unit.focusType` | `QUESTION_TYPE \| WRITING_TASK_TYPE \| SPEAKING_PART \| VOCAB_REVIEW \| DIAGNOSTIC` | which label table to use, and which empty state applies |
| `unit.questionType` | the 11 `QuestionType` names | the second half of a drill unit's name |
| `unit.writingTaskType` / `unit.speakingPart` | `TASK_1 \| TASK_2`, `PART_1..3` | the same, for those units |
| `node.questionType` | same enum, `null` otherwise | a drill node's own name |
| `node.stateReason` | the fixed list below | the "why this step now" line |
| `unit.progress`, `node.progress` | numbers | `3/7`, `câu 3/10` |

`stateReason` must be one of these and no others — the client maps each to a sentence:
`DRILL_TARGET_MET`, `DRILL_IN_PROGRESS`, `DRILL_NOT_STARTED`, `PRACTICE_COMPLETED`,
`PRACTICE_NOT_STARTED`, `SUBMISSION_GRADED`, `SUBMISSION_NOT_GRADED`, `ATTEMPT_GRADED`,
`ATTEMPT_NOT_GRADED`, `VOCAB_DUE`, `VOCAB_CLEAR`, `NEEDS_PREVIOUS_NODE`, `NEEDS_ALL_UNIT_NODES`,
`WEAKEST_MEASURED_TYPE`, `NEXT_IN_UNIT`, `UNIT_CHECK`, `DIAGNOSTIC_BASELINE`.

### 4.2 What a node costs

Every pressable node that starts an attempt carries `costActionCode: "IELTS_START"`, and that
action is **ENFORCE at 5 credits** in the running config (verified: `GET /credits/costs`). So a
five-node unit costs 25 credits to walk, which is consistent with every other IELTS attempt in the
product but is worth stating out loud, because a path *encourages* many small attempts.

The fee is not decided here: the node names the action and the client renders the live price, so
changing the policy to a free drill is a credit-config change plus a new action code, with no client
change at all. If the drill should be free, it needs its own code (`QUESTION_TYPE_DRILL`) set to
`DISABLED` — that is a product decision, not a technical one.

---

## 5. What the screen does with the contract

Per `mockup/06-path.html`: hero header (`Mục tiêu band … · Unit i / N` + XP chip) → unit card
(amber chip, title, "N bài · 1 bài kiểm tra cuối unit", `3/7` + amber bar) → vertical node chain,
nodes alternating left/right, each a big round button with a label → milestone node (amber,
trophy) → "next unit" card with topic chips. Node visuals come from `DESIGN-V2.md` §369:
`PathNode` with `locked`/`current`/`done`/`milestone`, 80px, and `current` pulsing at 1.6s — **the
only perpetual animation in the product**, disabled under `prefers-reduced-motion`.

---

## 6. Backend work

### 6.1 A question-type drill scope (the only new capability)

- `AttemptScopeType.QUESTION_TYPE`; new nullable column `scope_question_type VARCHAR(30)` on
  `ielts_test_attempts` (migration `V76`).
- `StartIeltsSessionRequest` gains `questionType`; the start service picks N questions of that type
  from published tests, and stores them in `question_ids_snapshot` (already exists). Everything
  downstream — answering, submit, grading, band, answers records — is unchanged.
- Why this and not new content: it turns the 11 question types into 11 practisable nodes using
  questions that are already in the database, and it makes §2.1's measurement and the drill the
  same unit of work. A drill is a normal attempt, so it feeds the same progress it reads.

### 6.2 `GET /api/learning-path`

New `LearningPathService` + DTOs. Reads: the per-type aggregate (§2.1), completed attempts
(`ielts_test_attempts`, `speaking_attempts`), graded submissions (`writing_submissions` /
`writing_practice_attempts`), the vocabulary due count, the profile goal and `levelInfo`. Cached per
user with the existing eviction pattern, evicted when an attempt/submission completes.

### 6.3 Configuration

`learningPath` group in `SystemConfigPayload` (§3.4), null-tolerant, plus a migration/seeder entry
so the admin config screen shows it rather than silently defaulting.

### 6.4 Not needed

No curriculum tables, no unit/node tables, no per-node progress table, no admin UI. Progress is
derived from records that exist because the practice happened.

---

## 7. Frontend work

- **Route `/path`** in `src/App.jsx` inside the shell, guarded — which also fixes the nav entry that
  currently bounces to `/home`.
- `src/pages/learning/LearningPathPage.jsx` — hero header, unit card, node chain, next-unit card.
- `src/components/ui/PathNode.jsx` — the four states, 80px, the 1.6s pulse, `aria-current` for
  `current`, `aria-disabled` + `disabled` for locked (never colour alone: locked carries a lock
  icon, done a check, current a play).
- `src/features/learning/useLearningPath.js` — `useAsyncData` + `unwrapData`, plus pure helpers
  (state → label key, progress line, pressability, unit-name parts) so the rules are unit-testable
  without rendering. **The v1 `features/learning/*` modules are deliberately NOT ported**: they are
  ~700 lines of localStorage analytics referenced only by four hooks under `src/hooks/` that nothing
  imports (recorded tech debt). Serving a screen that navigates the URL the API already hands it
  does not need them, and porting them would be a large change with no user-visible effect. The
  debt stays debt.
- i18n: new `learningPath` namespace, vi + en, static keys only — including a table for all 11
  question types, so a node's name is translated rather than sent as a sentence.
- Tests: the four node states; locked nodes are not pressable; the cost chip appears only when the
  credit config charges; `currentBand: null` renders a dash with an explanation rather than 0.0; the
  pulse is present in CSS but stops under reduced motion; the empty path (§8).

---

## 8. The empty state: a brand-new account

No measurements means no weakness ordering, so the honest path is short and says why:

- One unit "Bắt đầu — bài chẩn đoán" with 2 nodes (a Listening and a Reading scoped practice, both
  real content), the first `CURRENT`.
- The unit card states the reason: *"Chưa đủ dữ liệu để xếp lộ trình. Làm 2 bài này trước, mình sẽ
  xếp lại sau bài đầu tiên."*
- `currentBand: null` and `overallAccuracy: null` render as "chưa đo" — never 0.

This is consistent with the backend's own default recommendation (*"We need a baseline to
personalize your learning path."*), so the FE is not inventing a story the BE does not tell.

---

## 9. Decisions taken, and what is still open

All five questions this document was written to settle were answered on 2026-10-11, each with the
recommended option:

1. **The path is GENERATED from content that exists plus measured progress** — not an authored
   curriculum. No `learning_paths` / `units` / `nodes` tables, no unit-progress table, no authoring
   surface. A unit is a stable key derived on read, so a unit can never outlive its content and a
   node can never appear for a question type with no questions.
2. **The question-type drill scope is built** (`AttemptScopeType.QUESTION_TYPE`, migration `V76`) —
   so that finishing a node and measuring it are the same act.
3. **Completion is completion: no score gates.** Scores influence ordering only.
4. **The unit count is capped (default 6), not fixed** — a thin catalogue cannot produce an 11-unit
   path.
5. **Vocabulary review is a node** — the one node whose content is the user's own due queue.

### Fixed while building this

- **The per-skill band (§2.5A).** Reading was a copy of Listening and `overallBand` dropped
  Reading from its own average. Each skill now takes the latest completed attempt **of that
  skill**, and the overall averages the skills that actually have a measurement. Cross-checked
  independently against SQL (`scripts/dev-verify-learning-path.mjs` §5): Listening 2.5 = SQL 2.5,
  Reading 3 = SQL 3 — under the old code both would have read 3.
- **The broken `V45` migration (§2.5B).** The stray comma is gone, so a fresh database can
  finally be built from the `migration/` folder.
- **The drill node declared no price while the start endpoint charged one.** `IELTS_START` is
  ENFORCE at 5 credits and `IeltsTestServiceImpl` charges it for every start, including
  `QUESTION_TYPE`. The planner said `costActionCode(null)`, so the screen offered a button that
  looked free and cost 5 credits. Measured: balance 50 → 45 on a drill start.
- **Setting the goal did not refresh the path.** The path is cached per user for 5 minutes and
  returns `targetBand` from the profile; activity evicted the cache but a profile WRITE did not,
  so finishing onboarding and opening the path showed "no target band set". Both write paths now
  evict.

### Still open, and deliberately NOT part of this feature

- **The path can be up to 5 minutes stale after a submit.** Cache eviction is not synchronous
  with an IELTS submit: measured, `GET /learning-path` immediately after grading still returned
  the pre-submit unit (`drill answered=0`), and the same request returned `answered=10/10` only
  once the 5-minute TTL had passed. The verify script evicts the cache explicitly for that
  reason. Fixing it properly means evicting synchronously in the submit paths (IELTS, writing,
  speaking) instead of relying on the activity path.
- **A 10-question drill counts as the skill's latest band.** The band is the newest completed
  attempt of the skill, whatever its scope, so a short drill can move the displayed band more
  than a full 40-question paper would. Worth a product decision: weight only FULL attempts, or
  label the band as provisional when it comes from a drill.
- **Listening content labelled with Reading question types (§2.6)** — a curation question.
- **`bandProgress[].target` is hardcoded `0f`** for every skill in two places, so "progress
  towards your target band" has no per-skill target to measure against. The path shows the single
  overall target from `user_profiles.target_ielts_band` instead of inventing per-skill ones.
