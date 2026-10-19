# EN Practice v2 — Screen Specification

Companion to [PROPOSAL.md](PROPOSAL.md) (why) and [DESIGN-V2.md](DESIGN-V2.md) (the system).
Every screen below has a working mockup in `mockup/` — open `mockup/index.html`.

## How to read this
**Coverage.** 53 routes in `../en-practice/src/AppShell.jsx` map to **36 mockups**; several routes share a page component (e.g. `/speaking/conversation/:topicId` and `/speaking/conversation/resume/:conversationId` both render `SpeakingConversationPage`). Three routes are pure redirects (`/`, `/speaking/conversation/history`, `/vocabulary/test/:testId`) and get no mockup.

**Three screens were added to the speaking module.** `24b` (`/speaking/conversation/:topicId` and its
resume route), `24c` (`/speaking/conversation/result/:conversationId`) and `24d`
(`/speaking/attempts`) are the topic conversation and its history — v1 shipped them and v2 had ported
only as far as `speakingApi`, `useConversationStomp` and the `speaking.conversation.*` locale keys,
i.e. endpoints and a hook with no screen. They are numbered under the screen they branch from, exactly
like 15b and 15c, and screen **24 was rewritten in the same pass** because the mode it drew was not the
mode the backend offers.

**One screen has two frames.** `07b-vocabulary-check-guest.html` is the guest chrome of screen 07 —
same screen number, different shell — so the 36 numbered screens draw 37 frames, before the two variant
frames (`33b-account-menu`, `36b-lexi-panel`) and the three speaking frames added above. It exists because
`/vocabulary/check` is reachable both signed in and signed out, and those two states must not show the
same page furniture. Every other screen draws one frame.

**The rail's section tabs & mobile tab bar.**
- **Desktop (≥1024px):** Thanh rail mang 5 section chính (**Trang chủ**, **AI Coach**, **Luyện tập**, **Tiến độ**, **Cá nhân**) và nhóm "Khác" chứa các chức năng còn lại (bao gồm **Từ vựng**).
- **Mobile (<1024px):** Bottom nav hiển thị 5 mục ngón tay dễ chạm: **Trang chủ**, **AI Coach**, **Luyện tập**, **Tiến độ**, và **Thêm** (thay thế vị trí Cá nhân). Tab **Thêm** mở drawer/sheet gom toàn bộ các chức năng còn lại trên sidebar (Hồ sơ cá nhân, Từ vựng, Lộ trình, Sổ tay, Tra từ & hỏi AI, Ôn tập từ vựng, Writing, Speaking, Hội thoại tự chọn, Bảng xếp hạng, Phần thưởng, Ví credit, Thông báo, Cài đặt, Đăng xuất).
- **Header chính (Shell Header):** Chứa Lexi (mobile), tiêu đề trang, **Badge credit** (`.chip--teal` hiển thị số dư credit và link đến `/credits`, chỉ hiển thị trên mobile `<1024px` vì desktop đã có ở chân sidebar rail), nút **Thông báo** (`NotificationBell`), và avatar tài khoản.

The vocabulary module is the case that got this wrong:

| Primary tab | Landing | The section also contains |
|---|---|---|
| **Từ vựng** | `08-vocabulary-list.html` → `/vocabulary` | 07 Tra từ & hỏi AI, 09/10/11 test take · result · history, 12 notebook, 13 flashcard review, 14 evaluation, **15 Ôn tập từ vựng** |

The tab is **named after the section**, not after a screen or the activity: the section is the
vocabulary module — where you test words (08) and where you review them (15) — so "Học" was wrong for
the same reason its `href` was. Because a tab can only open one screen, the section's other
destinations are rail entries of their own; `/review` (15) is one of them, and the app now lists it.

The tab stays **current** for the whole module (it is set on 07–12 in the frames, and
`src/app/navigation.js` → `activePrimaryId` does the same), which is what a section tab is for. Two
traps this rule avoids, both of which shipped:

- **The `href` was a copy-paste artefact.** Every hand-rolled rail in 07–12 wrote
  `href="07-vocabulary-check.html"` on the tab while ALSO marking it `aria-current="page"` — the
  current-state was right (the module belongs to the section) and the landing was wrong. The app had
  copied the href, so the sidebar's tab opened a dictionary lookup.
- **One screen must not be listed twice.** Because the tab pointed at 07 and the group's own "Tra từ &
  hỏi AI" item also points at 07, the rail listed one screen under two labels. With the landing fixed
  to 08 the same trap moved to 08, so **08 is no longer repeated inside the "Từ vựng" group**: the
  primary tab already goes there, and the group lists the section's *other* destinations. The label
  "Test từ vựng" still names the screen — `src/app/pageTitles.js` maps `/vocabulary` to
  `nav.vocabTest` for its header.

**Why `activePrimaryId` and not `NavLink`'s own `to`.** Section membership is not a URL prefix: no
path in the vocabulary section *starts with* `/vocabulary` except `/vocabulary/check`, yet `/review`,
`/dictionary` and `/evaluation` all belong to it. `NavLink` decides its own `aria-current` from a
prefix match on `to` and discards any value passed in, so a section tab built on it renders
**highlighted but not announced** on every route of the section except the landing. `src/app/Shell.jsx`
therefore computes both the colour and the attribute from `activePrimaryId` and renders a plain
`Link`.

Every rail destination is asserted to have a real `<Route path>` in `src/App.jsx` and to be unique,
by `src/app/navigation.test.js`.

**Evidence markers.** The proposal's §2.1 explains these; they are repeated on every screen because the confidence is not uniform:

- **`[code-verified]`** — I read v1's implementation of this screen. Its v2 spec preserves actual behaviour and data.
- **`[route-inferred]`** — specified from the route, the module's API names, and the cross-cutting patterns, **without reading v1's page**. Treat the spec as a well-founded draft: a 10-minute read of the v1 file should confirm or correct it before implementation.

**Mobile-first.** Every mockup is authored for a 390px column and widens. In `mockup/index.html`, review at **Phone** width first; the desktop layout is the additive case.

**The five layouts.** Rather than 36 bespoke arrangements, v2 uses five, and every screen picks one:

| Layout | Shape | Used by |
|---|---|---|
| **List** | Header + filter toolbar + grid/list of items | test lists, IELTS list, Writing list, Speaking list, rewards, history |
| **Focus** | Header + one narrow column, max 820px | detail pages, dictionary, evaluation, review config, settings-adjacent |
| **Take** | Sticky top bar + one task + sticky bottom action | all assessment screens |
| **Split** | Two panes, side by side ≥1024px, tabbed below | IELTS take, Writing take |
| **Chat** | Scrolling log + composer | AI coach, custom speaking |

Any screen that does not obviously fit one of these five is a signal that it is doing two jobs.

---

## Marketing & Auth

### 01 · Landing — `/` `[code-verified]`
- **Mode:** Persuade. The only surface in the product with a high variance budget (`DESIGN_VARIANCE 8` here versus 6 in-app).
- **Layout:** sticky nav (68px) → asymmetric hero → skills → vocabulary band → how-it-works → free boundary → FAQ → CTA → footer.
- **Hero:** 2 columns at ≥1024px (copy 1.05fr / product mock .95fr), single column below. Headline is 2 lines, subtext under 20 words, both CTAs above the fold, `padding-top` 56px — deliberately under the `pt-24` cap so nothing floats.
- **The product mock is labelled.** A fake browser chrome with `enpractice.site/writing/submission` and a caption reading *"Minh hoạ sản phẩm, không phải bài làm của người dùng thật."* `PRODUCT.md` is explicit that no user numbers, testimonials, band-improvement claims or pricing may appear, and the fake chrome is the established device that marks an illustration as an illustration. This carries over from v1 unchanged.
- **FAQ** uses native `<details>`, first item open. Four real questions, including the "is the core learning really free" one, answered at the same honesty level `PRODUCT.md` already commits to.
- **No fabricated proof.** No logo wall, no avatar row, no counters.

### 02 · Login / Signup — `/login` `[code-verified]`
- **Layout:** Split. Left panel is Lexi + three value statements on the hero wash; right is a 460px card.
- **Below 1024px the left panel is removed entirely** rather than stacked — a marketing panel above a login form pushes the form below the fold on a phone, which is the one thing a login screen must not do.
- **Guest trial is a peer action, not a footnote:** "Học thử không cần tài khoản" sits at the same weight as the Google button, with the daily-limit caveat stated in one line underneath.
- **States:** default, field error (below the field, `--wrong`), submitting (button label swaps, no spinner-only), expired-session banner (assertive live region — the one place assertive is allowed).

### 03 · Onboarding — new `[route-inferred]`
- **New surface.** v1 has no onboarding; a first-run user lands on `/vocabulary` when logged out. v2 adds a 4-step flow because the product's activation event is "finish one piece of work", and a band goal is what makes the generated practice the right difficulty.
- **Steps:** band goal → self-assessment per skill → time-per-day → confirm, with Lexi narrating.
- **No nav.** One decision per screen, progress bar at 25/50/75/100, "Bỏ qua" always available. Skipping sets the goal to "chưa xác định" and Lexi infers it after the first scored attempt.
- **The band choices are buttons with `aria-pressed`**, not a radio group with hidden inputs, so the whole row is a 76px tap target.

**Built as `/onboarding`** (`src/pages/onboarding/OnboardingPage.jsx`, state in
`user_profiles`, `PUT /api/user/profile/onboarding`) — outside the app shell, behind
RequireAuth, auto-opened once per page load when the server reports `onboarding.required`,
and reopenable from Settings. Two deviations from the spec above, both to avoid inventing
data:

- **Band options are exact half-bands (5.0, 5.5, 6.0, 6.5, 7.0, 7.5, "Chưa xác định"), not
  the mockup's ranges.** `target_ielts_band` is a single number, so "6.0 – 6.5" would force
  the client to pick a midpoint the user never chose and then show it back on the profile.
- **Step 2 asks ONE hardest skill, not four self-ratings.** `user_profiles.preferred_skill`
  is one string and there is no column for a four-value self-assessment; asking for four and
  keeping one derived value would be collecting data to throw away — and a tie would make the
  derivation wrong. Adding a column for the rating vector is a backend decision, not a client
  one.

---

## Daily learning

### 04 · Home — `/home` `[code-verified]`
- **This is the biggest structural change in v2.** v1 is a 12-column bento of six widgets (`TodayLearningPanel`, `ProgressOverview`, `QuickPracticePanel`, `RecentActivityPanel`, `LeaderboardWidget`, `WeakSkillsWidget`, `StreakHeatmap`, `DailyTasksPanel`, `RecommendedPracticeWidget`, `SmartReminderBanner`) — a dashboard that asks the user to choose. v2 asks one question and answers it.
- **Anatomy, in order:** (1) Lexi greeting with the single specific reason to practise today, (2) one primary CTA, (3) four stat tiles, (4) today's plan with progress, (5) weak skills, (6) study heatmap, (7) recommendations.
- **The greeting names a real weakness from real data** ("Hôm qua bạn sai 3 câu dạng True/False/Not Given") — not praise, not a generic "Welcome back".
- **Streak renders calm.** The heatmap labels the remaining grace days instead of using the streak as pressure. See DESIGN-V2.md §9.
- **Below 1024px:** single column, stats collapse to 2x2, the bottom tab bar appears.

### 05 · Daily plan sheet — global `[code-verified]`
- **Layout:** bottom sheet, 28px top radius, max 88vh, drag handle on mobile; centred modal on desktop.
- **Content:** 4 tasks with step number, icon, estimated duration, XP remaining, and a done/CTA state per row. Progress bar in the header.
- **"Để mai làm" is a first-class action**, equal in size to the primary — the easy way out from DESIGN-V2.md §9, at the exact moment a user feels behind.
- **The background behind the sheet is shown dimmed and skeletonised** so the sheet is judged in its real context, not in isolation.

### 06 · Learning path — new `[route-inferred]`
- **New surface.** v1 has no visible path; exercises are a flat list. v2 adds it because the product's stated principle is "a daily habit beats long sessions", and a path is the cheapest way to make the next step obvious.
- **Anatomy:** unit header with progress → vertical node chain → unit-end milestone → next unit preview.
- **Node states:** `done` (teal-soft + check), `current` (teal + play + a 1.6s pulse ring), `milestone` (amber + trophy + 96px), `locked` (`surface-alt` + lock, `disabled`).
- **The pulse is the only perpetual animation in the product** and it stops entirely under `prefers-reduced-motion`.
- **Nodes alternate left/right** down the column and the label collapses under 480px, leaving a centred chain of big tap targets.

---

## Vocabulary

### 07 · Dictionary lookup + AI explain — `/vocabulary/check` `[code-verified]`
- **Layout:** Focus.
- **Anatomy:** word input with a TTS button → optional context textarea → cost-labelled explain button → streaming answer card → recent words.
- **The cost is on the button** ("Giải thích · −1 credit") before it is pressed, never after. This is the `PRODUCT.md` commitment about being truthful on the free/paid boundary, applied at the point of decision.
- **The streaming state is designed:** the answer renders progressively with two skeleton lines at the bottom. There is no bare spinner.
- **The answer explains the user's own sentence** ("Vì sao hợp với câu của bạn") rather than printing a dictionary definition, and it shows common confusions with a wrong/near-synonym split.

**TWO CHROMES, ONE SCREEN — `mockup/07-vocabulary-check.html` and `mockup/07b-vocabulary-check-guest.html`.**
This is the one screen in the product that a visitor and a learner reach by the same URL, and they
must not see the same page furniture:

| | Frame | Who | Why |
|---|---|---|---|
| **07** | inside the shell (rail + header + tab bar) | signed-in | A learner needs the way back into the product |
| **07b** | full-bleed, slim bar (brand + "Đăng nhập") | no session | The no-account trial the landing page and the login card both promise ("Học thử không cần tài khoản") — rail, tab bar and bell belong to an account the visitor does not have |

**The rail's "Từ vựng" tab does NOT land here.** It lands on **08** (`/vocabulary`, the vocabulary
test list) — see "The rail's section tabs" below. This screen is the section's own item, **"Tra từ &
hỏi AI"**, and it is still the "Từ vựng" section for highlight purposes (the tab stays current on 07).

The split is decided from the session by `src/app/VocabularyCheckLayout.jsx`, not by two pages, so
the screen itself is identical in both frames. The guest frame is also the one that states the
caveat in words ("Học thử không cần tài khoản… tiến độ không được lưu"), because a chrome-free
surface with no explanation reads as a broken page.

**07b is deliberately a smaller page than 07.** A visitor has no recent lookups and no saved words,
so the "Gần đây" strip has nothing truthful to render; drawing it would be a mockup of data the
viewer cannot have.

**This was a real defect, found in review:** the guest chrome was applied to everyone, so a
signed-in learner saw the visitor's bar — including a "Đăng nhập" button — with no sidebar and no
way back into the app. The fix is the split above.


### 08 · Vocabulary test list — `/vocabulary` `[code-verified]`
- **Layout:** List. Tabs (all / not done / done) + filter + a responsive card grid.
- **Three states all designed:** populated grid, a real empty state with Lexi (`explain` mood) and a create action, and a loading state of skeleton cards — not a spinner.
- **Each card carries its provenance** (AI-generated vs user's own) as a chip, and the previous score as a band badge when it exists; the primary action changes from "Bắt đầu" to "Làm lại" accordingly.
- **Thao tác tạo nhanh (+5, +10, +20 câu):** Không điều hướng sang màn làm bài, giữ người dùng ở lại trang danh sách; hệ thống tự động poll danh sách và cập nhật thẻ bài mới khi hoàn tất.
- **Tag New:** Hiển thị chip `New` (`chip--amber`) cho các bài test có `createdAt` dưới 1 ngày và chưa hoàn thành.

### 09 · Vocabulary test taking — `/vocabulary/take/:attemptId` `[code-verified]`
- **Layout:** Take. **One question per screen**, which is the change from v1's batched form.
- **Why one at a time:** the product promise is feedback you can feel. Per-question feedback at the moment of answering is only possible if the question owns the screen.
- **Verdict bar** shows up to three signals at once: colour (`--correct` / `--wrong`), a glyph (check / cross), and the explanation text — never colour alone (SC 1.4.1).
- **Lexi appears in the verdict at 32px** (`happy` / `sad`) so the mascot carries the emotional beat without occupying the question.
- **Sticky bottom action bar** with a 56px primary button, safe-area aware. "Câu trước" is hidden under 480px where it would push the primary button off-centre.

### 10 · Vocabulary test result — `/vocabulary/result/:attemptId` `[code-verified]`
- **Layout:** Focus with a two-column body at ≥1024px.
- **Hero:** score as a `mono` display numeral, percent band, delta versus last attempt, XP, streak chip, Lexi `celebrate` at 120px.
- **Actionable section is the point of the screen:** "Từ cần ôn lại" lists each wrong word with the correct meaning *and* what the user actually chose, plus a "Lưu" button per word and one primary "Ôn 2 từ này ngay" that leads into SRS. A result screen that only reports a number is a dead end.
- **The 10-question breakdown** is a compact list with per-question correct/wrong glyphs.

### 11 · Vocabulary test history — `/vocabulary/history` `[code-verified]`
- **Layout:** List with four stat tiles above.
- **The table does not scroll horizontally on mobile** — this is the direct fix for v1's 11 `<Table scroll={{x}}>` instances. Above 768px it is a real table; below, each row becomes a card with the same fields. Both are rendered in the mockup so the collapse is reviewable, not described.
- Pagination is a "Tải thêm" button rather than a pager, because a pager on a phone is a precision tap target.

### 12 · Vocabulary notebook — `/dictionary` `[code-verified]`
- **Layout:** List + detail aside at ≥1024px; the aside becomes a separate full screen below.
- **Anatomy:** 4 stat tiles → search + tag filter + read-state filter → word list → detail panel.
- **The mastery ring** is an SVG `stroke-dasharray` arc with the percentage in `mono` at the centre, tinted by memory tier (`--wrong` under 50, `--amber` 50–75, `--teal` above). A ring is used instead of a bar because the value is a per-item state, not progress through a sequence.
- **Memory is the organising idea, not alphabetisation:** the "Hay quên" filter and the tier colour are the primary sort affordances.

### 13 · Flashcard SRS review — `/dictionary/review` `[code-verified]`
- **This is NOT step 2 of the review flow in §15.** The two are different features that both say "review": this one shows a card, the learner rates their own recall 0/2/4/5, and the rating moves that word's `nextReviewAt`. §15's step 2 asks for a typed answer, grades it against the word's accepted meanings, and explicitly does **not** touch the schedule. This frame is unchanged by the §15 rebuild.
- **Layout:** Take, single card.
- **Anatomy:** card with tag + TTS → word as the prompt → the user's own example sentence with the target word marked → "Hiện nghĩa" → revealed meaning and note → **four recall buttons**.
- **The four recall buttons are the design:** Quên / Khó / Được / Dễ, each at least 56px tall, each showing the resulting interval (`<1 ngày`, `2 ngày`, `5 ngày`, `12 ngày`), and each distinguished by border colour *and* a text label. Showing the consequence of each choice is what makes spaced repetition legible to a user who has never heard the term.
- Below 480px the four buttons become a 2x2 grid so none is narrower than a comfortable thumb target.

### 14 · Ability evaluation — `/evaluation` `[code-verified]`
- **Layout:** Focus with a 4-tile skill grid.
- **The honesty requirement is structural, not copy:** the estimated band is labelled "Band ước tính từ dữ liệu luyện tập", followed by an explicit line that it is not an official test result and that ±0.5 is normal. `PRODUCT.md` forbids band-improvement claims, so the trend chip reports a measured delta ("+0.5 trong 30 ngày") and never a promise.
- Two columns split strengths from weaknesses by question type, and the weakness column ends in "Đưa vào lộ trình" — the bridge from diagnosis to the path.

### 15 · Review setup — `/review` `[code-verified]`
- **Frames:** `15-review.html` (step 1), `15b-review-practice.html` (step 2), `15c-review-result.html` (step 3).
  All three are held to their decisions by `python _design/mockup/_src/check_review_frames.py`.
- **Layout:** Focus. A Lexi summary card, then four control groups. **No stepper and no back button.**
  `/review` is an ENTRY point — the rail opens it, and so does the phone's tab bar — so a back button
  there has nowhere honest to go: the first build pointed it at `/evaluation`, a hub the learner had
  never visited, which read as "back" and landed somewhere else. The "1 of 3" strip spent the top of
  the screen asking for attention before anything had been chosen, and the start button already names
  the session it will open; the stepping is worth showing *during* the flow, which is why `15c` keeps
  its own stepper. Both removals are pinned by `check_review_frames.py`.
- **Changing the window never blanks the screen.** Every preset refetches the counts, and the refetch
  used to swap the whole body for a skeleton: the scrollport became shorter than the current scroll
  offset, the browser clamped it, and the page snapped to the top the moment a preset was tapped. The
  previous numbers now stay mounted and the region is marked `aria-busy` instead.
- **This screen is the rail's "Từ vựng" section's second destination**, beside `08` (`/vocabulary`): the section is where you test words and where you review them. Its rail label and its page title are the same string (`nav.review`), so the two cannot drift.
- **The screen's job is to remove the two reasons people skip review:** not knowing what will be reviewed, and not knowing how long it takes. The headline states both ("Bạn có 26 từ để ôn. Ôn hết sẽ mất khoảng 5 phút.") and the primary button repeats them.
- **The four groups are the endpoints' own parameters, not a design invention.** `GET /records/review-words` accepts `rangeMode` ∈ {all, range, week, month}, `group` ∈ {unreviewed, wrong, all}, `direction` and `limit`; `GET /records/review-counts` answers all three group counts for the chosen window. So the controls are: a time window (6 presets + custom dates), a word group carrying its OWN count, a direction, and a count.
- **There are exactly TWO directions.** The server keeps one `direction` string verbatim and has no per-word direction, so the earlier "Trộn" (Mixed) option was a label that could not be honoured. It is gone.
- **The count is ONE control, a slider whose maximum is the selected group's own count.** A slider AND quick-pick chips are two controls claiming one number and both render as selected; and asking for 50 words when 8 are due is a promise the screen cannot keep. The maximum IS "how many have I got".
- **The start button refuses a half-set window.** A custom `from` with no `to` reaches the server as "the last 7 days", which is not the window on screen, so the button stays disabled instead of sending it.
- Face, not chrome: the direction is a stored device preference, and the screen says a session here does **not** move the review schedule — `13` is the mode that reschedules.

### 15b · Review practice — `/review/session` `[code-verified]`
- **Layout:** Take — full-bleed, no rail, action in a sticky footer. One question per screen.
- **The learner TYPES the answer.** v1 graded typed answers; v2 had replaced this step with `13`'s self-rating, which is a different feature. This frame restores the typed-answer session.
- Both directions are supported: `Anh → Việt` prompts with the English word and asks for the meaning, `Việt → Anh` prompts with the meaning and asks for the word. A speaker button reads the English word aloud in the first.
- **The verdict stays on screen until the learner moves on.** Auto-advancing on a correct answer would skip the example sentence — the part that turns a correct guess into knowledge — and on a wrong answer it would skip the correction, which is the only reason to show a wrong answer at all.
- The verdict carries a glyph, a colour AND words ("Trả lời chính xác" / "Chưa đúng hoàn toàn"), so it survives grayscale and colour blindness. On a miss it shows the correct answer, any accepted alternatives, the explanation and the examples — all inset rows, never nested cards.
- **"Giải thích rõ hơn" is MARKDOWN, not a string.** The field is model-written and uses bold, italic and lists to separate the rule from the collocations it applies to; rendered as plain text, the asterisks and dashes appeared on screen. It goes through the shared `Markdown` renderer — markdown only, no `rehype-raw`, because the source is untrusted model output.
- **The frame draws ONE verdict, so the MISSING one is specified here.** A frame is a picture of a moment and a session has more than one. Answering wrong renders the same card with exactly these differences:
  - glyph and border take `--wrong` instead of `--correct`;
  - title "Chưa đúng hoàn toàn" (not "Trả lời chính xác");
  - body "Không sao cả. Xem lại đáp án đúng một lần nữa sẽ giúp bạn nhớ lâu hơn.";
  - the answer row's label is "Từ tiếng Anh đúng" and the row shows the English word when the direction is `Việt → Anh`, so it always names the half the learner did **not** supply;
  - "Các nghĩa khác có thể chấp nhận" appears whenever the word HAS alternatives — **on a correct answer too**, which is why the frame draws those chips in its correct state. Hiding them on a hit withholds the one thing that turns a lucky match into a known word;
  - the explanation and the examples render exactly as they do in the frame.
  The alternative rows stay absent when the word has none, in either direction.
- **The frame may not promise data the API cannot return.** It used to draw a topic chip ("Environment") and an IPA line (`/ˈmɪtɪɡeɪt/`). `ReviewWordDto` carries `englishWord`, `normalizedWord`, `correctMeaning`, `alternatives`, `acceptedMeaningsVi`, `meaningExplanation` and `exampleSentences` — there is no topic, deck or part-of-speech field, and no IPA. Both were removed, and `check_review_frames.py` keeps them out.

### 15c · Review result — `/review/result` `[code-verified]`
- **Layout:** Focus, step 3 of 3. **Inside the app shell**, unlike 15b: the session is over and its exits are navigation rather than a decision to make under time.
- A verdict at v1's four thresholds (≥90 Xuất sắc, ≥70 Rất tốt, ≥50 Đang tiến bộ, else Cần ôn thêm) with the count, the direction and the duration, then four tiles (Tổng / Đúng / Sai / Độ chính xác).
- **"so với phiên trước" is a real comparison**, read from `GET /reviews/last` BEFORE this session is stored — that endpoint answers with the *second* latest row, so reading it afterwards would compare against the wrong one.
- The per-word detail is a table on a wide screen and a list on a phone: five columns at 390px scroll sideways and hide the column that matters, which is the answer.
- Three exits: "Ôn lại N từ khó" (the misses, by name, via the endpoint's `words` filter), "Ôn lại" (back to step 1) and "Sổ tay từ vựng" (`12`).
- **The verdict glyph is an EMOJI at `t-display-xl`, not a line icon.** The frame heads the result with 🌟 and puts the verdict in a separate `h2` under it, with the sentence about the session under that — three sizes on one line of sight, so the reader gets "how did it go" before "17 on 20 before 5 minutes 12 seconds". Only the "Rất tốt" case is drawn, so the other three take a glyph from the same family and this list IS the design: `excellent → 🌟`, `good → ✨`, `improving → 📈`, `needsReview → 📚`. The glyph carries `aria-hidden`, because the `h2` under it already says the verdict in words and a screen reader announcing a star is noise.
- **The first-session state, specified here because the frame draws a learner who has been here before.** With no previous session there is nothing to compare against, so the accuracy card keeps its title and drops the comparison **sentence**: it does not print "0% so với phiên trước", which reads as a collapse rather than as a first attempt. The chip is replaced by "Phiên đầu tiên — chưa có gì để so sánh.", and the accuracy bar still renders, because a first number is worth as much as a delta.
- The accuracy card is a `between` row — title plus the "So với phiên trước" caption on the left, the delta as a `chip--correct` with an arrow on the right — over a bar at the accuracy percentage. The delta is a chip, not a sentence: a signed number is a token to be scanned, not read.

**One flow, three routes, and the split was v1's too:** v1 had all three phases in ONE route (`pages/Review.jsx`, phases `config · practice · result`, namespace `vocabularyReview.*`); v2 splits them across `/review`, `/review/session` and `/review/result` so each step has a URL, a reload and a shareable state. `13` (`/dictionary/review`) remains the separate flashcard/SRS mode, and it is still the only one that reschedules a word.


---

## IELTS

### 16 · Test library — `/ielts` `[code-verified]`
- **Layout:** List. Skill pills across the top (Tất cả / Listening / Reading / Writing / Speaking) route to the right module rather than filtering in place, because the four modules have genuinely different entry screens.
- Each card shows type (Full / Section), the skills it covers and total time. **A second, all-or-nothing state appears once the test has been sat:** the band badge at the right of the chip row, an accuracy bar, the caption under it, and a GHOST "Làm lại" — while an untouched card keeps the PRIMARY "Bắt đầu". One response field produces all four, because a card showing a band while saying "Bắt đầu" would describe two different learners.
- **The caption reads "Cao nhất N%", not "Lần trước N%".** `POST /ielts/tests/highest-scores` returns the **best** attempt per test, not the latest — `IeltsTestServiceImpl` groups by test and keeps the higher band, a tie going to the more recent attempt. The badge, the bar and the caption all come from that one attempt, so they describe the same sitting; "lần trước" over a highest-of-all-time figure is a claim the API cannot support. The i18n key is `ielts.bestAccuracy` for the same reason, and `ielts.lastScore` was renamed rather than reworded.
- **"Bắt đầu" opens the DETAIL screen, not the exam.** Every card links to `17`, where the attempt mode (full test vs one section), the scope, the credit cost and the exam condition are decided. Starting a timed paper from a browse surface would skip that decision and spend a credit before the learner has seen what they are buying.
- **One ceiling, deliberate:** the endpoint counts `COMPLETED` + `ATTEMPT_MODE.FULL` attempts only, so a learner who practised a single reading passage still sees an untouched card. A band derived from one passage would be meaningless, so this is correct — but it is a limit of the card, not of the word "attempted".
- The library sends **two** requests, and they live in ONE resource so the cards are never painted in a state that has to be corrected: as two resources the list would render while the scores were in flight, and a returning learner would watch "Bắt đầu" turn into "Làm lại" under the thumb about to press it. A failed scores request is swallowed — the library is already loaded and must not disappear because a badge failed — at the cost of every card falling back to "Bắt đầu"; both buttons lead to the same detail screen, which states the true state.

> **GAP — mockup has this, the code does not (recorded 2026-10, screen 16).** The frame's chip row
> opens with the **type** ("Full" / "Section") and the card's meta line is the **skills it covers**
> plus the total time ("Listening + Reading · 80 phút"), which is exactly what the bullets above
> describe. The code renders a **skill** chip and a **difficulty** chip instead, and its meta is
> "N câu · M phút". `GET /ielts/tests` returns one `skill` and no `type`, no `skills` array and no
> per-section durations, so the frame's line cannot be produced from that response as it stands —
> this is a backend gap before it is a front-end one, and the fix needs the list DTO to carry the
> attempt type, not a reworded card. `ielts.fullTest` and `ielts.section` already exist and have no
> call site. The pills also differ: the frame marks "Tất cả" as `aria-current="page"` and wraps the
> group in `role="tablist"`, while the code marks only the two filtering pills current.

### 17 · Test detail — `/ielts/test/:testId` `[code-verified]`
- **Layout:** Focus.
- **Anatomy:** hero with title and cost → per-section breakdown with item counts and durations → transcript-policy notice → primary CTA.
- **Two trust details are preserved from v1's behaviour:** the credit cost with the user's balance is visible before starting, and the Listening transcript policy is stated up front ("chỉ hiện sau khi nộp bài, để giữ trải nghiệm giống thi thật") — in v1 that rule exists in the code but is not surfaced until after submission.

> **GAP — mockup has this, the code does not (recorded 2026-10, screen 17).**
> - **The cost lives in the hero** as a labelled block — `t-micro` "Chi phí", a coin chip reading
>   "1 credit", and "Bạn còn 240 credit" under it. The code moves the cost into a separate card
>   *below* the transcript notice, labels it "Bắt đầu làm bài · -1 credit" (a negative number and a
>   repeated CTA verb), and prints the balance as "Còn 240 credit". `creditPolicy.js` formats the
>   amount with a leading `-`, so the minus reaches the screen.
> - **The hero body line** is the structural summary "4 phần Listening · 3 passage Reading · 40 + 40
>   câu". The code has no hero body (the invented prose that used to sit there was removed).
> - **Each section row ends with its duration** in mono ("10 phút") and its meta carries the task
>   format ("10 câu · hội thoại đời thường", "13 câu · Matching Headings"). The code renders the
>   count only; the paper response does not carry a per-section duration, so this needs the detail
>   DTO before it needs markup.
> - **A "Để sau" ghost button beside the CTA** (frame 17's CTA row is `grow` primary + ghost large).
>   The code renders the primary alone. `common.later` = "Để sau" exists and is unused here.
> - **Extra UI the frame does not have:** a Lexi `explain` in the hero, the three-tile `Stat` grid,
>   a numbered square badge at the head of each section row (the frame uses a skill icon), a "Ví
>   credit" ghost link, and a footer row of "Lịch sử" / "Thử lại". Recorded rather than removed
>   because removal is a layout change and needs its own decision.

### 18 · Test taking — `/ielts/take/:attemptId` `[code-verified]`
- **Layout:** Split — and this is the screen where v2 changes the most.
- **Desktop (≥1024px):** passage pane (left, `68ch` measure, `--surface`) and questions pane (right) scroll independently, both always visible. Sticky top bar with the timer.
- **Mobile (<1024px):** a **two-tab switch between "Bài đọc" and "Câu hỏi (3/13)"**. This is a deliberate fix. v1 stacks the passage above the questions with `min-height: 40vh` on the passage, so in the one module where a reader must see the passage and the question together, they never are. Tabs make that a single tap instead of a scroll of unknown length, and the tab label carries the answered count so progress is never hidden.
- **Question navigator** is a 40x40 grid, pinned to the bottom of the questions pane on mobile, with three visible states: current (teal fill), answered (correct-soft), idle. It is the one place a dense grid is right.
- **Timer turns `--wrong` under five minutes** and is `aria-live="off"` — a timer that announces every second is hostile to a screen-reader user.
- The passage highlight (`<mark>`) uses the amber token at 46% so highlighted text keeps its own contrast.

> **GAP — mockup has this, the code does not (recorded 2026-10, screen 18).**
> - **The passage header meta** — a `t-micro muted` line "Reading Passage 1 · khoảng 900 từ" under the
>   passage `h2`. The code renders the title only.
> - **The question-range header** — a `t-label` "Questions 1–5" plus a `t-micro muted` task hint
>   ("Chọn tiêu đề đúng cho mỗi đoạn"). The code renders no range label and no task hint; its header
>   subtitle is `ielts.questionProgress` → "Đã trả lời N / M", which no frame draws.
> - **The legend label is the paragraph, not the question number** — frame renders `[1] Đoạn A`. The
>   code renders `[1] Câu 1 / 13`, so the paragraph label has no counterpart.
> - **One comment contradicts its own code.** `IeltsTakePage.jsx` says the timer "counts UP from the
>   session start" and "must not invent a countdown the server does not enforce", but the expression
>   beneath it is `limit > 0 ? Math.max(0, limit - elapsed) : elapsed` — a countdown whenever
>   `estimatedMinutes` is set, which is what the frame draws. The behaviour is right and the comment
>   is wrong; the comment is the thing to fix.
> - **Extra UI the frame does not have:** a typed-answer `<input>` for questions with no options, a
>   "Câu trước / Câu sau" button bar, a `<audio controls>` element in the passage pane, and the
>   `AsyncBoundary` empty state for a paper with no questions. The audio element is load-bearing
>   (Listening needs it), so it is a frame gap rather than a code defect.

### 19 · Test result — `/ielts/result/:attemptId` `[code-verified]`
- **Layout:** Focus with a two-column review body.
- **Hero:** overall band in `mono`, delta chip, per-skill bands, time spent, XP, Lexi `celebrate`.
- **Answer review** lists wrong answers with the correct answer *and* the user's choice, plus two per-question actions ("Đọc lại đoạn B", "Hỏi Lexi"). The question number badge reuses the take-screen token so the two screens are visibly the same object.
- **Lexi's diagnosis is specific** ("Bạn mất nhiều thời gian ở đoạn A và chọn tiêu đề theo từ khoá trùng lặp") and ends in a practice action.
- **Transcript is locked until submission** and this screen is where it unlocks, matching the policy stated on the detail screen.
- The band is labelled as an estimate here too.

> **GAP — mockup has this, the code does not (recorded 2026-10, screen 19).** Frame 19 is the
> richest frame in the set and the code renders a working but thinner screen. Nothing here is a
> mockup defect; it is unimplemented work, listed so a later pass does not have to re-derive it.
> Each line names the frame element and what the code has instead.
>
> - **Two-column review body** (`result-cols2`, `1.2fr .8fr` at ≥1024px). Code renders one
>   full-width column for every section, so the transcript card sits at the bottom instead of beside
>   the review.
> - **Per-skill band cards** — skill label, band value, `/ 9.0`, a proportion bar, and "Đúng 33/40
>   câu". Code has none; `SCREENS-V2.md`'s own "per-skill bands" bullet is unmet.
> - **Delta chip in the hero** — "+0.5 so với lần trước". Code renders an accuracy chip
>   ("Đúng 82%") in that slot, which measures a different thing (today's paper) from the frame's
>   (progress since the last attempt).
> - **`XP nhận được` stat.** Code renders four tiles: correct, wrong, minutes, and the raw `skill`
>   enum — the last of which is a backend value printed where a designed tile belongs. The key
>   `ielts.xpEarned` exists and has no call site.
> - **The segmented filter "Sai (7)" / "Tất cả (40)"** above the review list. Code renders a
>   non-interactive `7 câu sai` chip and can only ever show wrong answers.
> - **Two per-question actions, "Đọc lại đoạn B" and "Hỏi Lexi"** (a written requirement of this
>   section, not a nice-to-have). Code renders neither.
> - **The "Lexi nhận xét" card** with a specific diagnosis and the "Luyện dạng này" action. Code
>   labels the mascot (`ielts.lexiResult`) but renders no diagnosis card.
> - **The transcript card unlocks here** — frame 19 reads "Đã mở khoá vì bạn đã nộp bài" and lists
>   timestamped lines with "Xem toàn bộ transcript". Code renders `ielts.transcriptLocked`, which
>   says the transcript *appears only after you submit* — on the screen reached *by* submitting.
>   This one is not merely missing: it is a false statement on screen, and it should be fixed before
>   the rest of this list.
> - **Header meta** — `h1` "Kết quả · Cambridge 19 Test 1" and "Nộp lúc 15:04 · 76 phút". The code
>   renders no page title and no submission time.
> - **"Chia sẻ"** ghost button. Absent.

### 20 · IELTS history — `/ielts/history` `[code-verified]`
- **Layout:** List. A CSS bar chart of band-by-week above the list, with a text `aria-label` describing the series (a chart with no accessible name is not usable).
- Bars use teal for Listening and amber for Reading with a legend, and the axis labels are week numbers — no fabricated dates. Empty weeks are simply absent rather than faked.

> **GAP — mockup has this, the code does not (recorded 2026-10, screen 20).** Frame 20's note reads
> "Chart + danh sách, không dùng bảng cuộn ngang" — no horizontally scrolling table. The code's
> chart wrapper is `overflow-x-auto`, so past ~8 weeks it scrolls: the one thing the note rules out.
> Also unimplemented: the header `h1` "Lịch sử thi" with its "8 bài · band trung bình 5.9" meta, the
> chart card's "8 tuần gần nhất" caption, the `h2` "Các bài đã làm" heading, the `band` badge token
> per row (code prints plain mono text), and a per-bar `title` attribute.
> - **Extra UI the frame does not have**, recorded rather than removed because removing it is a
>   layout change and needs its own decision: a three-tile `Stat` row above the chart, the two
>   legend chips on the chart header (frame puts the legend below the bars as dots), the `Clock`
>   icon inside each row's meta, and each row's `skill · correct/total` fragments (frame's row meta
>   is `date · +XP`).

### 21 · Writing list — `/writing` `[code-verified]`
- **Layout:** List with a Task 1 / Task 2 segmented filter.
- Each card shows the full prompt (truncated at a sensible length), word target, recommended time, and a state chip. **The "Đang chấm" state is a designed state**, because v1's AI grading is asynchronous: the card shows an amber clock chip and its action becomes "Xem trạng thái" rather than pretending the result is ready.

### 22 · Writing task — `/writing/task/:taskId/take` `[code-verified]`
- **Layout:** Split — tương tự màn 18 (`ielts/take`).
  - **Desktop (≥1024px):** 2 pane song song độc lập (Prompt pane 380px bên trái và Editor pane bên phải), mỗi pane cuộn riêng biệt.
  - **Mobile (<1024px):** Chuyển đổi 2 tab ("Đề bài" và "Làm bài") giúp tập trung gõ bài và dễ dàng chuyển qua xem lại đề mà không bị cuộn chồng chéo làm vỡ giao diện. Tab "Làm bài" hiển thị kèm số từ đã viết.
- **Anatomy:** Header với nút thoát và timer → (Mobile) 2 tab switch → Prompt pane (đề bài, type chip, tiêu chí chấm, mẹo Lexi) và Editor pane (textarea, đếm từ, cảnh báo min/max từ, nút nộp bài).
- **Word count is a live chip** against the target ("142 / 250 từ"), not a hard block: the user may submit under length, and the count is information, not a gate.
- **The cost is on the submit button** ("Nộp bài · 1 credit") and repeated in the footer with the expected wait ("30–60 giây để chấm").

### 23 · Writing result — `/writing/submission/:submissionId` `[code-verified]`
- **Layout:** Focus with a two-column body.
- **Hero:** band, delta, one-sentence diagnosis, Lexi.
- **Four criteria as four cards** with band and a proportion bar each.
- **The annotated essay is the substance of the screen:** the user's own text with per-span marks — a green "Câu chủ đề rõ" tag, amber highlights for lexical notes, red highlights for structural problems — each carrying a `title`/note. Feedback that is not anchored to a specific span is not feedback.
- **A "Sửa lỗi cụ thể" column** converts each mark into an instruction with a before/after ("Câu 3 dài 38 từ → tách thành 2 câu"), and the primary action is "Viết lại bài này".

### 24 · Speaking topics — `/speaking` `[code-verified]`
- **Layout:** List with a part filter (`Tất cả / Part 1 / Part 2 / Part 3`, which maps to
  `GET /speaking/topics?part=`) and a notice above the list that carries both things a learner must know
  before the first press: the microphone needs HTTPS, and when credit is taken in each mode.
- **The notice sits above the list, not in a modal at the moment of recording.** v1 told the learner about
  the permission dialog only after they pressed record, by which point they were staring at a browser
  prompt with no context and often on plain HTTP where `getUserMedia` does not exist at all.
- **Each card offers the modes that exist, and Part 2 offers one.** "Bắt đầu nói" records a single answer;
  "Hội thoại" starts the AI-led dialogue from that topic. A cue-card topic has no follow-up questions, so
  `totalExpectedQuestions` is 1, v1's own list gates the button on `topic.part !== 'PART_2'`, and the frame
  draws the missing button rather than hiding the rule.
- **The mode pills are gone.** v1's row read "Theo chủ đề / Hội thoại AI / Đề ngẫu nhiên" and two of its
  three pills could not exist in v2: there is no random-topic endpoint, and "Hội thoại AI" opened
  `/custom-speaking`, which is free-form conversation *without* a topic (screen 27). Conversation over a
  topic starts from the topic (`POST /speaking/conversations/start?topicId=`), so the mode is a property of
  the card it starts from, not of the page.
- **The credit claim sits where the charge happens.** Conversation charges at conversation start, so that
  button carries the cost; practice charges at submit — a control on screen 25 — so the practice button
  claims nothing it is not about to take. The charge is idempotent per `userId + mode + topicId`, so a
  topic that has already paid for a conversation shows conversation with no cost chip, and a conversation
  still in progress offers "Tiếp tục hội thoại" instead of opening a second charge.
- **The card states which mode its band came from** with a source chip ("Hội thoại"), because the same
  6.0 appears on screen 26 for a practice attempt and "Xem kết quả" must not be ambiguous about where it
  leads. The chip carries NO numbers: `POST /speaking/topics/highest-scores` returns the band, the source
  and the date but no turn count and no duration, so the frame does not claim them — those live on 24c,
  which reads the conversation itself.
- **One entry point to history, and it lives in the page's own footer row** (Lexi + "Các lượt đã làm" →
  24d + the typical length of a turn). The app's shell-header context carries exactly one thing — a
  subtitle string — and its own note says expanding that for one screen would be the wrong trade, so the
  link sits where the page can render it. It is drawn once; a second link in the header would be a second
  thing to read, not a second way to get there.
- **Every string on the frame is the locale's own Vietnamese**, so the frame and the app cannot drift:
  `speaking.title`, `speaking.subtitle`, `speaking.filterLabel`, `speaking.start` ("Luyện nói"),
  `speaking.practiceAgain` ("Luyện lại"), `speaking.viewStatus`, `speaking.historyLink`
  ("Các lượt đã làm"), `speaking.actions.conversation` ("Hội thoại").
- **The credit notice is drawn only when a cost is configured.** The backend's cost table can answer
  `mode: DISABLED` with a cost of 0 for every action — which is what this machine's backend currently
  answers — and nothing is charged in that configuration, so a rule line would be a claim about money
  that never moves. The chip on the conversation button is gated the same way.

### 24b · Speaking conversation — `/speaking/conversation/:topicId` and `/speaking/conversation/resume/:conversationId` `[code-verified]`
- **Layout:** Take, SHAPED LIKE A CHAT — full-bleed (no rail, no tab bar, no floating Lexi) and exactly one
  viewport tall. The log takes every pixel between the bar and the answer panel, scrolls **inside itself**,
  and the panel is pinned at the bottom, like screen 27. The page itself never scrolls, so a long
  conversation cannot push the controls off screen, and the log follows the newest turn. It is a focused
  surface for the same reason the practice take is: nothing here should invite the learner to wander off
  mid-answer.
- **Anatomy:** sticky bar (exit, topic and part, question counter, balance) → scrolling log → pinned answer
  panel → cost line for this conversation.
- **The bar carries no "Đã kết nối" chip, and that is a correction rather than an omission.** v1 ran
  this screen over STOMP and could honestly report a socket's state; v2 runs it over the same REST pair
  as `/custom-speaking` (`POST /speaking/conversations/start` and
  `POST /speaking/conversations/{id}/turn`), so there is no socket to report on and a "connected" chip
  would describe something that does not exist. Progress is shown instead as the question counter in
  the bar, and the in-flight state as a waiting bubble in the log with the send control disabled for
  the same window.
- **The screen is exactly one viewport tall and the page itself never scrolls** — the log is a scrollport
  and the answer panel is docked. On a very short viewport with a long transcript the panel scrolls
  *inside its own ceiling* rather than being clipped, because the send control is the one thing on this
  screen that must stay reachable.
- **A turn is a recorded answer, not a typed message.** The learner speaks, speech recognition returns the
  transcript, and the panel shows that text for correction *before* sending, because the transcript is what
  the grader reads. An empty transcript is refused with a warning rather than sent.
- **The question is SPOKEN, not only printed.** This is a listening task as much as a speaking one, so the
  partner's question is read aloud as soon as it appears: the first question when the conversation starts,
  the next one (or a hint) when a turn comes back, and the pending question when a conversation is resumed.
  v1 got its audio from the socket payload; v2 asks the TTS endpoint for the same sentence, which is why the
  replay control makes a request rather than replaying a cached clip. **While it plays, the button reads
  "Đang phát…" and is disabled** — that is the reason for the disabled state, stated on the control itself.
  Pressing record stops the audio first, so the partner's voice is never captured in the learner's answer.
  If a browser blocks playback, the question is still on screen in full and the button is the way to hear it.
- **The measurements are per turn and honest.** Each answer carries its own word count and words per
  minute — the two things the browser can actually measure. v1 also printed a word-confidence badge; v2
  cannot measure confidence at all, so no confidence chip is drawn (`speechAnalytics` in
  `src/features/speaking/useSpeaking.js`).
- **A HINT turn is visibly a hint**, not another question: the backend returns `turnType: HINT` when the
  model decides the learner is struggling, and the frame draws it in `--amber-soft` under a "Gợi ý" label.
- **The recording state is screen 25's treatment unchanged** — red "Đang ghi âm" chip, `mono` clock, 48-bar
  `aria-hidden` waveform — so the product has one recording language. On the last question the API's
  `lastTurn` relabels the control "Trả lời câu cuối".
- **The recording control never claims a cost**, because this conversation was charged when it started; the
  line under the panel says exactly that ("trừ 1 credit ngay khi bắt đầu · còn 12 credit").
- **States specified with the frame rather than drawn into one moment:** "Lexi đang phản hồi…" while a
  turn is in flight, with the send control disabled for the same window; the empty-transcript warning;
  and completion, which posts the message that grading has started and moves to 24c. The live contract
  was exercised end to end: the last answer returns `conversationComplete: true`, the detail endpoint
  then reports `COMPLETED` and, a few seconds later, `GRADED` with a band — so the wait state is a real
  state, not a hypothetical one.

### 24c · Conversation result — `/speaking/conversation/result/:conversationId` `[code-verified]`
- **Layout:** Focus, one column, inside the app shell.
- **Hero:** band, turn count and elapsed time, Lexi. **No delta chip**, because the highest-scores endpoint
  returns one band per topic and "hơn lần trước" is not a claim this screen can support.
- **Four criteria** as on screen 26 — Độ trôi chảy (Fluency), Vốn từ (Lexical Resource), Ngữ pháp
  (Grammar), Phát âm (Pronunciation), the locale's own labels — graded over the whole conversation
  instead of one answer.
- **The AI feedback is drawn as it arrives**, not condensed into a one-line diagnosis.
- **The transcript is a dialogue and it is the substance of the screen:** each turn pairs the question with
  the answer and carries that answer's own word count and WPM. A repeated word is highlighted in the answer
  that repeats it, and the card says speech recognition can err.
- **Grading is asynchronous** (COMPLETED → GRADING → GRADED, ~9 s, the same shape as 23 and 26), so the wait
  is designed: a "Đang chấm" header chip and a skeleton where the band will be, and the criteria, feedback
  and transcript are absent rather than empty. FAILED replaces the hero with the reason and one retry;
  IN_PROGRESS sends the learner back to 24b rather than drawing a result that does not exist.
- **Restarting costs nothing and the frame does not pretend otherwise:** this topic already paid for a
  conversation, so "Hội thoại lại chủ đề này" carries no cost chip.

### 24d · Speaking history — `/speaking/attempts` (and `?tab=conversation`) `[code-verified]`
- **Layout:** Focus, one column, inside the app shell. **Two tabs — Luyện tập / Hội thoại** — because they
  are two lists, not two views of one: `GET /speaking/attempts` returns recorded attempts and
  `GET /speaking/conversations` returns conversations, which carry fields an attempt does not have
  (`totalTurns`, and a status set that includes `IN_PROGRESS`, which an attempt cannot be).
- **The tab is addressable** (`?tab=conversation`), so a finished conversation can link straight into its own
  tab — which is exactly what v1 did with `/speaking/history?tab=conversation`, and the reason
  `/speaking/conversation/history` gets no frame of its own.
- **Cards, not a table**, matching the rest of v2's histories: a table whose columns hide on a phone is still
  a table to a screen reader, and v1's `scroll={{x}}` history had no mobile fallback at all. Each row is one
  target, with the topic, the part and the time spent on the left and the band or the status chip on the right.
- **An unfinished conversation opens the conversation, not its result.** `IN_PROGRESS` has no band, and 24c
  sends the learner back to 24b anyway, so the row's destination is the truth about it and its label says so
  ("Tiếp tục").
- **Three stat tiles per tab** (count · average band · best band), from the two endpoints' own numbers. On a
  phone they stay **one row** rather than the shared grid's single column: the summary is three numbers, not
  three sections, and stacking them pushes the first real row below the fold. The tiles appear once there is
  more than one graded item — a single sample has no average worth stating, and "0.0" would read as a score.
- **Each tab has its own empty and error state.** Practice: "Chưa có lượt luyện nào" + the action back to the
  topic list. Conversation: the same shape with a conversation-specific line, because a learner who has never
  started one must not be told they have no attempts. The retry reloads the tab that failed.
- **The frame draws no load-more control**, although both endpoints are paged — see open question 6. Whoever
  builds the screen either adds it or caps the list out loud; a silently truncated history is the one kind of
  loss a learner cannot notice.

### 25 · Speaking practice — `/speaking/practice/:id` `[code-verified]`
- **Layout:** Take.
- **Anatomy:** cue card with the four bullet prompts and the timing rule (1 minute to prepare, 2 to speak) → recording card → controls.
- **Recording state is unambiguous:** a red chip reading "Đang ghi âm", a `mono` clock at 40px, a 48-bar waveform, and a countdown line. A user must never be unsure whether they are being recorded.
- **The waveform animates only under `prefers-reduced-motion: no-preference`**, and the bars are `aria-hidden` since they carry no information a screen reader needs — the clock does.
- Controls are big and separated: pause, stop-and-grade, plus "Ghi lại từ đầu" and "Nghe lại".

### 26 · Speaking result — `/speaking/result/:id` `[code-verified]`
- **Layout:** Focus with a two-column body.
- **Hero:** band, delta, one-line diagnosis, Lexi.
- **Four criteria** as in Writing, using the Speaking criteria as the locale names them — Độ trôi chảy
  (Fluency), Vốn từ (Lexical Resource), Ngữ pháp (Grammar), Phát âm (Pronunciation). The frame draws the
  app's own strings, so the row cannot read one way in the mockup and another in production.
- **The voice analytics are presented as measurements with context**, not scores: speech rate with its
  natural range ("142 từ/phút — trong khoảng tự nhiên 120–160"), silence ratio with where it occurred, filler
  count, and repeated words with alternatives. Each metric states what it means; none is dressed up as a grade.
- **The transcript card is headed with the locale's own label** ("Nội dung đã chấm") and carries the caveat
  that speech recognition can err, with repeated words highlighted in the transcript itself.

### 27 · Custom speaking conversation — `/custom-speaking` `[code-verified]`
- **Layout:** Chat, 780px max, kéo dài toàn bộ chiều dọc (`flex-1 min-h-0`). Chat log giãn trọn chiều dọc, cụm gợi ý xếp trên 1 hàng ngang cuộn mượt (`.chat__suggest`), composer ghim sát đáy.
- **Anatomy:** header bar with back button, topic/turn context and balance chip → log of alternating Lexi/user bubbles → suggestion chips (`.chat__suggest`) → sleek 1-row composer (`.chat__input` with mic toggle, text input, send) → centered per-message cost line.
- **Bubbles:** Lexi bubble is white (`var(--surface)`) with left tail (`.bubble--left`), display font; learner bubble is system teal (`var(--teal-soft)`, border `var(--teal)`) with right tail (`.bubble--right`).
- **Lexi's turns do real work:** she corrects a phrase, gives the improved sentence, and asks the next question. The correction is shown as an italic rewrite rather than a red mark, because this is conversation practice, not an exam.
- The streaming state is a bubble with a "Đang nói…" label and a skeleton line.
- Cost is stated twice — a balance chip in the header and "Mỗi lượt AI tốn 1 credit · còn 12 credit" under the composer.

---

## Progress

### 28 · Leaderboard — `/leaderboard` `[code-verified]`
- **Layout:** Focus.
- **Rank humility is structural** (DESIGN-V2.md §9): the user's own standing and percentile come first, then only the top three, then **badges**. There is no paginated list of strangers, and the page says plainly that the leaderboard is off by default and the display name can be changed.
- **The badge section is the larger investment** on this screen, following the evidence that badges outperform leaderboards.
- The podium is CSS, ordered second-first-third so the winner is visually tallest, and each step's rank number is in `mono`.

### 29 · Weekly report — `/weekly-report` `[code-verified]`
- **Layout:** Focus with two columns.
- **Anatomy:** Lexi headline with one honest summary → 4 stat tiles → XP-per-day bar chart → per-module breakdown → highlights → next week's goals.
- **Every number is real training data.** `PRODUCT.md` forbids invented metrics, so the chart plots actual XP by weekday, including a zero day (rendered as a dimmed minimum-height bar rather than omitted — a missing bar reads as missing data).
- **Highlights include a negative one** ("Writing chỉ làm 1 bài, ít hơn mục tiêu 2 bài"), because a report that only flatters is not a report.
- Goals next week are checkboxes that feed back into the daily plan.

### 30 · Weekly challenges — `/challenges` `[code-verified]`
- **Layout:** Focus.
- **The countdown is calm:** "Kết thúc Chủ nhật 19/10 · không bắt buộc" in muted ink. No red timer, no urgency theatre, no "2 ngày còn lại!" pressure.
- One active challenge as a hero with progress and reward, then a list of others, then an explicit opt-out row: "Thử thách không ảnh hưởng đến band hay lộ trình. Bỏ qua cũng không mất gì." with "Tắt thử thách".

### 31 · Rewards — `/rewards` `[code-verified]`
- **v1's version of this page is a single 1,604-line file.** v2 splits it into **two tabs — Nhiệm vụ / Vật phẩm** — each with its own layout, so the page never renders both concerns at once.
- **Missions:** a card grid, each with the credit reward, progress, and a done/granted state.
- **Inventory:** a four-column grid of item tiles — art, name, type, state, and the one action the item
  has (equip / unequip / use), with the API's own filters above it and "Tải thêm" paging below.

**THREE THINGS THE FIRST DRAFT DREW THAT THE BACKEND CANNOT SUPPORT — measured, then removed from the
mockup rather than left as a screen the app could never build.**

| Drawn | Reality | Resolution |
|---|---|---|
| A per-mission **"Đã nhận"** claim button | `RewardMissionStatus` is only `LOCKED`/`CLAIMED`, `/user/reward-missions` is GET-only, and the server stamps `claimedAt` itself | removed; a finished mission says the reward is automatic. XP MILESTONES keep their claim button — `/user/xp-milestones/{code}/claim` is real |
| A per-mission **"+50 XP"** chip | `rewardDefinitions` is a sealed interface whose only members are `CREDIT` and `INVENTORY_ITEM`, so `xpValueOf` returns null every time | removed; the chip shows CREDIT only, and a mission with no credit reward gets NO chip rather than "0 credit" |
| An inventory card reading **"Chưa mở"** | the item catalogue is admin-only (`/api/admin/inventory/items`, `@PreAuthorize("hasRole('ADMIN')")`), so a learner's inventory contains only what they own | removed; there is no data behind a locked tile |

**The third tab, "Đổi thưởng", is designed but BLOCKED — it is not in the mockup.** No controller in
`en-practice-be` maps to a purchase, redeem or spend route, and `src/api` has no such call, so the
prices the first draft quoted (120/150/300 …) had no source. The one statement that tab carried is a
product commitment rather than a feature — *"v2 không bán streak freeze. Ngày nghỉ được tặng tự
động"* (`DESIGN-V2.md` §9) — and it moved to the inventory tab's footer. Implementing the shop needs a
backend contract first: what is for sale, at what price, and what a purchase debits.

**Inventory: what the tiles are built from** (`UserInventoryItemResponse`) — `item.type`,
`item.usageType` (`EQUIPPABLE` / `CONSUMABLE`, which decides whether the action is *equip* or *use*),
`item.name`, `item.description`, `item.assetUrl`, `grantedAt`, `equipped`, `used`. All nine
`InventoryItemType` values have a label; six of them had none, so a `TITLE` or `BACKGROUND` row used
to render with no type at all.


### 32 · Credits — `/credits` `[code-verified]`
- **Layout:** Focus with two columns.
- **Anatomy:** balance hero with expiry date → full action-price table (label, internal code in `mono`, cost) → free-boundary notice → transaction history with signed amounts → hold/release explainer.
- **The action codes are shown** (`IELTS_START`, `WRITING_START`, `AI_CHAT`, `VOCABULARY_TEST_GENERATE`, `AI_EXPLAIN`, …) so the price list is auditable against the backend rather than a hand-written marketing table.
- **The free boundary is stated as a positive claim** with a check glyph: making tests, the notebook and progress reports cost nothing, and free credits cover the core learning. This is the `PRODUCT.md` commitment rendered as UI.
- The hold/release explanation is its own card because "credit tạm giữ" is otherwise indistinguishable from "credit mất".

---

## Account

### 33 · Profile — `/profile` `[code-verified]`
- **Layout:** Focus with a two-column body.
- **Anatomy:** identity hero (avatar with the equipped frame, target band, streak, XP) → 4 stat tiles → left: learning goals with progress to the target and the days remaining; **Lexi's evolution** with the unlock condition and progress to the next level → right: equipped decorations, badges, recent activity.
- **Lexi's level progression is explained, not just displayed** ("Cần một bài Writing hoặc Speaking đạt band 6.0"), and the accessories render as SVG groups at `data-level` rather than separate images.
- Level is cosmetic only; nothing about the product is gated behind it.

### 34 · Notification centre — `/notifications` `[code-verified]`
- **Layout:** Focus. Filter pills (all / unread / learning / system) then a list.
- Each row has a tinted icon tile, title, one-line body, relative time, and an unread dot. **Unread state is a dot plus a border colour, not colour alone** — the dot is a shape.
- The Lexi streak notification is used to deliver the ethics message in-product: "Nghỉ một ngày cũng không sao — v2 tặng 2 ngày nghỉ mỗi tháng."
- **Preference switches are on this screen**, in context, plus a link to the full pause control in Settings — rather than forcing a trip to Settings to stop one category.

### 35 · Settings — `/settings` `[code-verified]`
- **Layout:** Focus with a 240px sticky section nav at ≥1024px, single column below. v1's Settings uses `max-w-[355px]` in one place and `1400px` in another within the same file; v2 uses one container.
- **Section order is a product decision:** "Nhắc học & chuỗi" comes **first**, above learning preferences and theme. It contains, with no submenu:
  - **Tạm dừng tất cả nhắc học** — one switch.
  - **Tắt theo dõi chuỗi ngày** — one switch, and the helper text states the behaviour: the day count will render as a switched-off feature, not as an unpaid debt.
  - **Ngày nghỉ tự động** — 2 per month, applied automatically, "không thể mua thêm".
- **Theme control says what v2 did:** light / dark / system only, with an info panel explaining that the nine v1 theme profiles are gone in favour of one interface. Users who liked `mono` deserve to be told rather than to discover it.
- **Text size** (Vừa / Lớn / Rất lớn) is a real setting that affects reading passages, not just chrome.
- Data section: export, delete AI chat history, delete account — with the destructive action in the danger variant and separated.

### 36 · AI coach — `/ai-chat` `[code-verified]`
- **Layout:** Chat, 780px max, kéo dài toàn bộ chiều dọc (`flex-1 min-h-0`). Chat log giãn trọn chiều dọc, cụm gợi ý xếp trên 1 hàng ngang cuộn mượt (`.chat__suggest`), composer ghim sát đáy.
- **Anatomy:** Header trang (ẩn khi ở mobile `<1024px`, chỉ hiển thị trên desktop `≥1024px` với nút quay lại, Lexi, dòng context; badge credit không hiển thị ở header trang mà chuyển về header chung cạnh notification) → log → suggestion outline chips (`.chat__suggest`) → sleek 1-row composer (`.chat__input`) with the cost on the send button.
- **Bubbles:** Lexi bubble is white (`var(--surface)`) with left tail (`.bubble--left`), display font; learner bubble is system teal (`var(--teal-soft)`, border `var(--teal)`) with right tail (`.bubble--right`).
- **Lexi's first message carries real data** ("Tuần này bạn mạnh Listening, yếu Matching Headings") so the coach demonstrates that it knows the user before asking for a question.
- Answers can use structured content (an ordered list for the three-step method) and end with the specific reason it applies to this user ("Bạn hay chọn theo từ trùng — đó là lý do 3 câu sai lần trước").
- The streaming state is a skeleton line inside a bubble.
- **Panel nổi (36b · LexiPanel):** mở từ nút 56px, dialog không modal, giữ nguyên màn đang xem. Cụm gợi ý xếp trên 1 hàng ngang có scroll (`.no-scrollbar`), chip outline, composer gọn ở đáy. Nút nổi và panel bị ẩn hoàn toàn khi người học đang ở chính màn `/ai-chat`.

---

## Cross-cutting requirements

These apply to every screen above and are specified in DESIGN-V2.md; they are repeated here because they are the acceptance criteria when each screen is built:

| Requirement | Where it is checked |
|---|---|
| Every state exists: default, loading (skeleton in the final layout's shape), empty (Lexi + one action), error (inline, contextual), and where relevant offline/pending | Per screen |
| No horizontal scrolling at 320px | Playwright `visual` project at 390px, plus a manual 320px pass |
| Interactive targets ≥ 44x44 | Every button, chip-button, answer tile, nav row, switch |
| Focus ring visible on every focusable element, 3px teal, 2px offset | Keyboard walkthrough of each take/review flow |
| Colour never the sole signal | Answer verdicts, badges, chart series, unread dots, mastery rings |
| Verdicts, XP and score changes announced via one `role="status" aria-atomic="true"` region | Per screen |
| Reduced motion removes transforms but keeps colour/state feedback | Per screen |
| Labels above inputs, helper below, error below that, never placeholder-as-label | Per form |
| No hard-coded hex, radius, shadow or `backdrop-filter` in page code | The detector gate |
| Vietnamese strings complete in both locales, no inline `defaultValue` fallback | `i18n:audit` |

## Open questions for the screen review

1. **Home asks one question instead of showing a dashboard.** If you want the six v1 widgets preserved, the page returns to a bento and the "one decision" thesis weakens. Confirm the thesis.
2. **The learning path is new** (screen 06). It requires a curriculum structure the backend may not expose yet — worth checking against `en-practice-be` before Phase 3.
3. **Onboarding is new** (screen 03). It changes the first-run route, which touches SEO and analytics. Confirm the intent before implementation.
4. **Speaking voice analytics** (screen 26) assumes speech-analytics data that `speakingApi` returns; I did not read the response shape. Verify before designing the empty and partial states.
5. **Screen 22's writing editor** is a plain `<textarea>` in the mockup. Confirm whether v2 needs a rich editor (word-count anchoring, autosave-on-blur, paste detection) before the component is built.
6. **The speaking history draws no load-more control** (screen 24d). Both `/speaking/attempts` and `/speaking/conversations` are paged, and the frame shows a finite list without saying where it ends. Decide whether the screen gets a "Tải thêm" control — the honest option — or a size cap stated on screen.
7. **The v1 result keys are still in the locale, unused.** `speaking.resultPage.*` carries its own criteria labels ("Fluency & Coherence", "Lexical Resource", …) plus celebrate strings that no v2 page renders; the screens use `speaking.criterion.*`, which is what screens 26 and 24c now draw. The four criteria labels are settled in favour of the locale's Vietnamese, so what remains is deciding whether the dead `resultPage` block is deleted or kept for the future result redesign.
8. **Four frames still scroll sideways at 320px**, which DESIGN-V2 §12.9 forbids: `01-landing` (419px — a hero button), `02-login` (343px — the auth card), `19-ielts-result` (588px — the segmented switch and a result card) and `20-ielts-history` (326px — the chart columns). All four predate the speaking work — the same sweep on the previous revision found eleven, and the shell-header ones (14, 23, 26, 28, 29, 34) are fixed. These four are outside the speaking module, so they are reported rather than silently re-laid-out.
9. **Every cost in the app renders as a NEGATIVE number** — "Nộp bài · -1 credit", "Hội thoại · -1 credit" — because `getCreditCostDisplay` returns `amountLabel: "-1"`, while every mockup draws "1 credit" (screens 22, 24 and the AI chat composer). The speaking module follows the existing convention rather than establishing a second one, so the frames and the app currently disagree in wording across the whole product. Decide which one is right and change it once: dropping the minus is a one-line change in `src/features/credits/creditPolicy.js` plus the note in `src/app/LexiPanel.test.jsx`.
