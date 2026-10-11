# EN Practice v2 — Screen Specification

Companion to [PROPOSAL.md](PROPOSAL.md) (why) and [DESIGN-V2.md](DESIGN-V2.md) (the system).
Every screen below has a working mockup in `mockup/` — open `mockup/index.html`.

## How to read this
**Coverage.** 53 routes in `../en-practice/src/AppShell.jsx` map to **36 mockups**; several routes share a page component (e.g. `/speaking/conversation/:topicId` and `/speaking/conversation/resume/:conversationId` both render `SpeakingConversationPage`). Three routes are pure redirects (`/`, `/speaking/conversation/history`, `/vocabulary/test/:testId`) and get no mockup.

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

### 08 · Vocabulary test list — `/vocabulary` `[code-verified]`
- **Layout:** List. Tabs (all / not done / done) + filter + a responsive card grid.
- **Three states all designed:** populated grid, a real empty state with Lexi (`explain` mood) and a create action, and a loading state of skeleton cards — not a spinner.
- **Each card carries its provenance** (AI-generated vs user's own) as a chip, and the previous score as a band badge when it exists; the primary action changes from "Bắt đầu" to "Làm lại" accordingly.

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
- **Layout:** Take, single card.
- **Anatomy:** card with tag + TTS → word as the prompt → the user's own example sentence with the target word marked → "Hiện nghĩa" → revealed meaning and note → **four recall buttons**.
- **The four recall buttons are the design:** Quên / Khó / Được / Dễ, each at least 56px tall, each showing the resulting interval (`<1 ngày`, `2 ngày`, `5 ngày`, `12 ngày`), and each distinguished by border colour *and* a text label. Showing the consequence of each choice is what makes spaced repetition legible to a user who has never heard the term.
- Below 480px the four buttons become a 2x2 grid so none is narrower than a comfortable thumb target.

### 14 · Ability evaluation — `/evaluation` `[code-verified]`
- **Layout:** Focus with a 4-tile skill grid.
- **The honesty requirement is structural, not copy:** the estimated band is labelled "Band ước tính từ dữ liệu luyện tập", followed by an explicit line that it is not an official test result and that ±0.5 is normal. `PRODUCT.md` forbids band-improvement claims, so the trend chip reports a measured delta ("+0.5 trong 30 ngày") and never a promise.
- Two columns split strengths from weaknesses by question type, and the weakness column ends in "Đưa vào lộ trình" — the bridge from diagnosis to the path.

### 15 · Spaced repetition config — `/review` `[code-verified]`
- **Layout:** Focus. Step 1 of 3, with a labelled stepper.
- **The screen's job is to remove the two reasons people skip review:** not knowing what will be reviewed, and not knowing how long it takes. So the copy states both up front ("34 từ đến hạn · khoảng 9 phút") and the primary button repeats the duration.
- Content choice is a 4-option select group with the due-count and duration on each; direction is a segmented control (Anh→Việt / Việt→Anh / Trộn).
- "Để sau" is a full-size secondary action.

---

## IELTS

### 16 · Test library — `/ielts` `[code-verified]`
- **Layout:** List. Skill pills across the top (Tất cả / Listening / Reading / Writing / Speaking) route to the right module rather than filtering in place, because the four modules have genuinely different entry screens.
- Each card shows type (Full / Section), the skills it covers, total time, and the previous score with a progress bar if attempted.

### 17 · Test detail — `/ielts/test/:testId` `[code-verified]`
- **Layout:** Focus.
- **Anatomy:** hero with title and cost → per-section breakdown with item counts and durations → transcript-policy notice → primary CTA.
- **Two trust details are preserved from v1's behaviour:** the credit cost with the user's balance is visible before starting, and the Listening transcript policy is stated up front ("chỉ hiện sau khi nộp bài, để giữ trải nghiệm giống thi thật") — in v1 that rule exists in the code but is not surfaced until after submission.

### 18 · Test taking — `/ielts/take/:attemptId` `[code-verified]`
- **Layout:** Split — and this is the screen where v2 changes the most.
- **Desktop (≥1024px):** passage pane (left, `68ch` measure, `--surface`) and questions pane (right) scroll independently, both always visible. Sticky top bar with the timer.
- **Mobile (<1024px):** a **two-tab switch between "Bài đọc" and "Câu hỏi (3/13)"**. This is a deliberate fix. v1 stacks the passage above the questions with `min-height: 40vh` on the passage, so in the one module where a reader must see the passage and the question together, they never are. Tabs make that a single tap instead of a scroll of unknown length, and the tab label carries the answered count so progress is never hidden.
- **Question navigator** is a 40x40 grid, pinned to the bottom of the questions pane on mobile, with three visible states: current (teal fill), answered (correct-soft), idle. It is the one place a dense grid is right.
- **Timer turns `--wrong` under five minutes** and is `aria-live="off"` — a timer that announces every second is hostile to a screen-reader user.
- The passage highlight (`<mark>`) uses the amber token at 46% so highlighted text keeps its own contrast.

### 19 · Test result — `/ielts/result/:attemptId` `[code-verified]`
- **Layout:** Focus with a two-column review body.
- **Hero:** overall band in `mono`, delta chip, per-skill bands, time spent, XP, Lexi `celebrate`.
- **Answer review** lists wrong answers with the correct answer *and* the user's choice, plus two per-question actions ("Đọc lại đoạn B", "Hỏi Lexi"). The question number badge reuses the take-screen token so the two screens are visibly the same object.
- **Lexi's diagnosis is specific** ("Bạn mất nhiều thời gian ở đoạn A và chọn tiêu đề theo từ khoá trùng lặp") and ends in a practice action.
- **Transcript is locked until submission** and this screen is where it unlocks, matching the policy stated on the detail screen.
- The band is labelled as an estimate here too.

### 20 · IELTS history — `/ielts/history` `[code-verified]`
- **Layout:** List. A CSS bar chart of band-by-week above the list, with a text `aria-label` describing the series (a chart with no accessible name is not usable).
- Bars use teal for Listening and amber for Reading with a legend, and the axis labels are week numbers — no fabricated dates. Empty weeks are simply absent rather than faked.

### 21 · Writing list — `/writing` `[code-verified]`
- **Layout:** List with a Task 1 / Task 2 segmented filter.
- Each card shows the full prompt (truncated at a sensible length), word target, recommended time, and a state chip. **The "Đang chấm" state is a designed state**, because v1's AI grading is asynchronous: the card shows an amber clock chip and its action becomes "Xem trạng thái" rather than pretending the result is ready.

### 22 · Writing task — `/writing/task/:taskId/take` `[code-verified]`
- **Layout:** Split. Prompt pane (380px, `--surface`) and editor pane, both full height, at ≥1024px; stacked below with the prompt on top and a sticky submit bar at the bottom.
- **Anatomy:** prompt + task type chip → the four grading criteria listed explicitly → one Lexi tip → editor → autosave indicator + live word count → submit.
- **Word count is a live chip** against the target ("142 / 250 từ"), not a hard block: the user may submit under length, and the count is information, not a gate.
- **The cost is on the submit button** ("Nộp bài · 1 credit") and repeated in the footer with the expected wait ("30–60 giây để chấm").

### 23 · Writing result — `/writing/submission/:submissionId` `[code-verified]`
- **Layout:** Focus with a two-column body.
- **Hero:** band, delta, one-sentence diagnosis, Lexi.
- **Four criteria as four cards** with band and a proportion bar each.
- **The annotated essay is the substance of the screen:** the user's own text with per-span marks — a green "Câu chủ đề rõ" tag, amber highlights for lexical notes, red highlights for structural problems — each carrying a `title`/note. Feedback that is not anchored to a specific span is not feedback.
- **A "Sửa lỗi cụ thể" column** converts each mark into an instruction with a before/after ("Câu 3 dài 38 từ → tách thành 2 câu"), and the primary action is "Viết lại bài này".

### 24 · Speaking topics — `/speaking` `[code-verified]`
- **Layout:** List with a mode pill row (Theo chủ đề / Hội thoại AI / Đề ngẫu nhiên).
- **A microphone permission notice sits above the list**, not inside a modal at the moment of recording. The product requires `getUserMedia` over HTTPS, and telling the user after they press record is where v1 loses them to a permission dialog with no context.

### 25 · Speaking practice — `/speaking/practice/:id` `[code-verified]`
- **Layout:** Take.
- **Anatomy:** cue card with the four bullet prompts and the timing rule (1 minute to prepare, 2 to speak) → recording card → controls.
- **Recording state is unambiguous:** a red chip reading "Đang ghi âm", a `mono` clock at 40px, a 48-bar waveform, and a countdown line. A user must never be unsure whether they are being recorded.
- **The waveform animates only under `prefers-reduced-motion: no-preference`**, and the bars are `aria-hidden` since they carry no information a screen reader needs — the clock does.
- Controls are big and separated: pause, stop-and-grade, plus "Ghi lại từ đầu" and "Nghe lại".

### 26 · Speaking result — `/speaking/result/:id` `[code-verified]`
- **Layout:** Focus with a two-column body.
- **Hero:** band, delta, one-line diagnosis, Lexi.
- **Four criteria** as in Writing, using the Speaking criteria (Fluency, Lexical Resource, Grammar, Pronunciation).
- **The voice analytics are presented as measurements with context**, not scores: speech rate with its natural range ("142 từ/phút — trong khoảng tự nhiên 120–160"), silence ratio with where it occurred, filler count, and repeated words with alternatives. Each metric states what it means; none is dressed up as a grade.
- The transcript carries the caveat that speech recognition can err, and repeated words are highlighted in the transcript itself.

### 27 · Custom speaking conversation — `/custom-speaking` `[code-verified]`
- **Layout:** Chat.
- **Anatomy:** log of alternating Lexi/user bubbles → suggestion chips → composer with a mic button → per-message cost line.
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
- **v1's version of this page is a single 1,604-line file.** v2 splits it into three real tabs — Nhiệm vụ / Vật phẩm / Đổi thưởng — each with its own layout, so the page never renders all three concerns at once.
- **Missions:** a card grid, each with reward XP, progress, and a done/claim state.
- **Inventory:** what is owned, what is equipped, what is still locked.
- **Shop:** decorative items only, priced in coins. **Streak freeze appears as an explicitly disabled card** reading "v2 không bán streak freeze — ngày nghỉ được tặng tự động". That is a deliberate product statement, not a placeholder: a purchasable streak repair converts encouragement into debt (DESIGN-V2.md §9).

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
- **Layout:** Chat, 780px max.
- **Anatomy:** header with Lexi, context line and balance → log → suggestion chips → composer with the cost on the send button.
- **Lexi's first message carries real data** ("Tuần này bạn mạnh Listening, yếu Matching Headings") so the coach demonstrates that it knows the user before asking for a question.
- Answers can use structured content (an ordered list for the three-step method) and end with the specific reason it applies to this user ("Bạn hay chọn theo từ trùng — đó là lý do 3 câu sai lần trước").
- The streaming state is a skeleton line inside a bubble.

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
