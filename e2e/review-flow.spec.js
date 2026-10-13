import { expect, test } from '@playwright/test';
import { collectPageProblems, expectNoProblems, gotoWithRetry } from './helpers/guards.js';

/**
 * The vocabulary review flow — three steps, three routes.
 *
 *   step 1  `/review`          `ReviewConfigPage`   → mockup 15-review
 *   step 2  `/review/session`  `ReviewSessionPage`  → mockup 15b-review-practice
 *   step 3  `/review/result`   `ReviewResultPage`   → mockup 15c-review-result
 *
 * The flow used to be `/review` → `/dictionary/review`, which is the FLASHCARD mode: a different
 * feature that reschedules a word from a self-rated 0/2/4/5. `/dictionary/review` still exists and
 * still owns the schedule; the routes above run the typed-answer session instead.
 *
 * THE REVIEW ENDPOINTS ARE STUBBED, AND THAT IS THE POINT. A real session POSTs a `performanceScore`
 * and moves words' `nextReviewAt`; the queue is the learner's own data, not a fixture, so a live run
 * would leave the account in a different state on every pass and the assertions would depend on how
 * much vocabulary that account happened to have. Stubbing `/records/review-*` makes the three steps
 * walkable in both directions — including the empty case — while every screen, route, validation and
 * grading function under test stays the real one.
 *
 * `POST /reviews` IS intercepted too, and its request body is the assertion: it proves the session
 * that was actually sat is what gets stored, with the window and direction the learner chose.
 */

const WORDS = [
    {
        englishWord: 'mitigate',
        normalizedWord: 'mitigate',
        correctMeaning: 'làm giảm bớt mức độ nghiêm trọng',
        alternatives: ['xoa dịu'],
        acceptedMeaningsVi: ['làm giảm bớt mức độ nghiêm trọng', 'giảm nhẹ'],
        meaningExplanation:
            '**Dùng khi** nói về việc làm dịu bớt một tác động xấu:\n\n- *mitigate the risk* — giảm thiểu rủi ro\n- *mitigate the damage* — giảm nhẹ thiệt hại',
        exampleSentences: [
            { sentence: 'Trees mitigate the heat in the city.', translation: 'Cây xanh làm dịu cái nóng trong thành phố.' },
        ],
    },
    {
        englishWord: 'deplete',
        normalizedWord: 'deplete',
        correctMeaning: 'làm cạn kiệt',
        alternatives: [],
        acceptedMeaningsVi: ['làm cạn kiệt'],
        meaningExplanation: 'Dùng khi nguồn lực bị dùng hết.',
        exampleSentences: [{ sentence: 'We deplete the soil.', translation: 'Chúng ta làm cạn kiệt đất.' }],
    },
];

const COUNTS = { unreviewed: 26, wrong: 8, all: 41 };

const envelope = (data) => JSON.stringify({ success: true, message: 'OK', data });

/**
 * Wait for the SCREEN, not the shell.
 *
 * `ReviewConfigPage`, `ReviewSessionPage` and `ReviewResultPage` are all `React.lazy` routes, so the
 * shell's `#main` can be attached while the page inside it is still the Suspense fallback
 * ("Đang tải…"). Waiting on `#main` and then asserting has a race: on this machine the module graph
 * sometimes takes over ten seconds to arrive, which is longer than the default expect timeout, and the
 * failure reads as a missing button rather than as a slow chunk. Waiting for an element that only the
 * mounted page renders removes the race without weakening the assertion that follows it.
 */
async function waitForScreen(page, locator) {
    await expect(locator).toBeVisible({ timeout: 20_000 });
}

/**
 * Answer every endpoint the flow touches.
 *
 * The api client unwraps `{success, message, data}`, so the fixtures are wrapped the same way as the
 * real responses — otherwise a stub would take a path the app never sees in production.
 */
async function stubReview(page, { counts = COUNTS, countsAlt = null, words = WORDS, previous = null, countsDelayMs = 0 } = {}) {
    const saved = [];
    let firstQuery = null;

    await page.route('**/api/records/review-counts*', async (route) => {
        /* "The window changed" is a DIFFERENT QUERY, not a later call. Counting calls gets this wrong:
           React StrictMode invokes the effect twice on mount, so call 2 is a duplicate of call 1, and a
           counter would hand the second answer to the first screen. Comparing the URL is immune to
           that, and is what actually distinguishes the two requests. */
        const query = route.request().url();
        if (firstQuery === null) firstQuery = query;
        const isRefetch = query !== firstQuery;

        /* Only the REFETCH is held back, and only when a test asks for it: the point is to make the
           hand-over window wide enough to assert inside, which no screenshot can do. */
        if (isRefetch && countsDelayMs > 0) await new Promise((r) => setTimeout(r, countsDelayMs));

        /* A different answer on the refetch, so a test can tell "the new numbers arrived" from "the
           old ones never left". */
        const body = isRefetch && countsAlt ? countsAlt : counts;
        return route.fulfill({ status: 200, contentType: 'application/json', body: envelope(body) });
    });
    await page.route('**/api/records/review-words*', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: envelope(words) })
    );
    await page.route('**/api/reviews/last*', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: envelope(previous) })
    );
    await page.route('**/api/reviews', async (route) => {
        if (route.request().method() !== 'POST') return route.continue();
        saved.push(JSON.parse(route.request().postData() ?? '{}'));
        return route.fulfill({ status: 201, contentType: 'application/json', body: envelope({}) });
    });

    return saved;
}

test.describe('the review flow', () => {
    test('step 1 offers the window, the group and the count, and refuses a half-set window', async ({ page }) => {
        const problems = collectPageProblems(page);
        await stubReview(page);
        await gotoWithRetry(page, '/review');
        await page.locator('#main').waitFor({ state: 'attached' });
        await waitForScreen(page, page.getByRole('heading', { name: 'Khoảng thời gian' }));

        /* AN ENTRY POINT, NOT A PLACE YOU NAVIGATE INTO. `/review` is opened from the rail and from
           the phone's tab bar, so the back button that pointed at `/evaluation` (a hub the learner
           had never visited) is gone, and so is the "1 of 3" strip that asked for attention before
           anything had been chosen. NO STEPPER ANYWHERE in this flow: step 3's is gone too. */
        await expect(page.getByRole('button', { name: 'Quay lại' })).toHaveCount(0);
        await expect(page.getByText('Bước 1 / 3')).toHaveCount(0);

        /* The mockup's header is TWO lines — the shared `<h1>` plus a `t-micro` context line — and
           both review screens carry the same heading, so this line is what tells them apart. */
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ôn tập từ vựng');
        /* `exact` because `getByText` matches substrings: `readyBody` on the same screen also contains
           the words "chọn khoảng thời gian, nhóm từ và số từ". */
        await expect(page.getByText('Chọn khoảng thời gian, nhóm từ và số từ', { exact: true })).toBeVisible();

        /* The RESOLVED days, not the name of the chip that was pressed: the chip already shows its
           own pressed state, and the only question a preset name cannot answer is "which days,
           exactly". "7 ngày" becomes two dates the learner can check against a calendar. */
        await expect(page.getByText(/^Đang chọn: \d{4}-\d{2}-\d{2} → \d{4}-\d{2}-\d{2}$/)).toBeVisible();

        /* NOTHING INVENTED. This screen used to carry a third paragraph explaining that the flow does
           not reschedule words. True, but no mockup frame says it, and a claim enters through the
           design rather than through the implementation — it now lives in `_design/SCREENS-V2.md`.
           The count line used to interpolate the group NAME as well; the frame names only the count. */
        await expect(page.getByText(/không đổi lịch ôn/)).toHaveCount(0);
        await expect(page.getByText(/số từ chưa ôn trong khoảng đã chọn/)).toBeVisible();
        await expect(page.getByText(/thuộc nhóm/)).toHaveCount(0);

        /* The window presets the endpoint actually accepts — all / range / week / month. */
        for (const preset of ['Toàn bộ', '7 ngày', '30 ngày', 'Tuần này', 'Tháng này', 'Tùy chỉnh']) {
            await expect(page.getByRole('button', { name: preset, exact: true })).toBeVisible();
        }

        /* The three groups `GET /records/review-counts` answers, each with its OWN count. */
        await expect(page.getByRole('button', { name: /Từ chưa ôn/ })).toContainText('26');
        await expect(page.getByRole('button', { name: /Từ hay sai/ })).toContainText('8');
        await expect(page.getByRole('button', { name: /Toàn bộ từ/ })).toContainText('41');

        /* TWO directions. "Trộn" is gone with the redesign: the server keeps one `direction` string
           verbatim and has no per-word direction, so a third option could only be a label that lied. */
        await expect(page.getByRole('button', { name: 'Anh → Việt' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Việt → Anh' })).toBeVisible();
        await expect(page.getByRole('button', { name: /Trộn/ })).toHaveCount(0);

        /* ONE count control. A slider plus quick-pick chips are two controls for one number and both
           would render as selected. */
        await expect(page.getByRole('slider')).toHaveCount(1);

        /* A custom range with a `from` and no `to` reaches the server as "the last 7 days", which is
           not the window on screen — so the button says no instead. */
        await page.getByRole('button', { name: 'Tùy chỉnh', exact: true }).click();
        await page.getByLabel('Từ ngày').fill('');
        await expect(page.getByRole('button', { name: /^Bắt đầu ôn/ })).toBeDisabled();

        expectNoProblems(problems);
    });

    test('the second CTA leaves without starting anything', async ({ page }) => {
        /* The mockup ends the screen with TWO buttons: start, or leave. "Để sau" is not a second way
           to start — it is the exit for someone who opened the screen to see how much is waiting and
           decided this is not the moment. Without it the only way out is the rail, which on a phone
           means the tab bar under a thumb that is already here. */
        await stubReview(page);
        await gotoWithRetry(page, '/review');
        await waitForScreen(page, page.getByRole('heading', { name: 'Khoảng thời gian' }));

        await page.getByRole('button', { name: 'Để sau', exact: true }).click();
        await expect(page).toHaveURL(/\/home$/);
        await expect(page.getByRole('button', { name: /^Bắt đầu ôn/ })).toHaveCount(0);
    });

    test('changing the window never blanks the screen, so the page cannot jump to the top', async ({ page }) => {
        /* THE SCROLL BUG, in a real browser. Every window preset refetches the counts, and the refetch
           used to replace the whole body with a skeleton: the scrollport shrank below the current
           scroll offset, the browser clamped it, and the page snapped to the top the moment a preset
           was tapped — the numbers were being re-read, and the reader lost their place.

           The refetch is held open on purpose (`countsDelayMs`) so the hand-over is a state the test
           can look at rather than a race it has to win. The previous numbers must stay on screen for
           the whole of it. */
        await stubReview(page, { counts: { unreviewed: 26, wrong: 8, all: 41 }, countsAlt: { unreviewed: 5, wrong: 2, all: 9 }, countsDelayMs: 1_200 });
        await gotoWithRetry(page, '/review');
        await page.locator('#main').waitFor({ state: 'attached' });
        await waitForScreen(page, page.getByRole('heading', { name: 'Khoảng thời gian' }));

        const headline = page.getByRole('heading', { name: /Bạn có 26 từ/ });
        await expect(headline).toBeVisible();

        await page.getByRole('button', { name: '30 ngày', exact: true }).click();

        /* Mid-flight: the count is marked as being refreshed, and the old numbers are STILL what is
           on screen. Under the old behaviour this heading was replaced by a skeleton, so this
           assertion is the bug. */
        await expect(page.locator('[aria-busy="true"]')).toBeVisible();
        await expect(headline).toBeVisible();
        await expect(page.getByText('Đang tải…')).toHaveCount(0);

        /* And the new answer still arrives — the fix must not turn a refetch into a no-op. */
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 10_000 });
        await expect(page.getByText(/Bạn có 5 từ/)).toBeVisible();
    });

    test('the three steps run end to end and the session is stored as it was sat', async ({ page }) => {
        const problems = collectPageProblems(page);
        const saved = await stubReview(page, {
            previous: { accuracy: 79, total: 20, correct: 16, incorrect: 4, direction: 'en-vi' },
        });

        await gotoWithRetry(page, '/review');
        await page.locator('#main').waitFor({ state: 'attached' });

        /* Wait for the counts before reading the button: it starts disabled while they are 0, which
           is not the same thing as "nothing to review". */
        const start = page.getByRole('button', { name: /^Bắt đầu ôn/ });
        await expect(start).toBeEnabled({ timeout: 20_000 });

        /* Choose a non-default window, group, direction and count, so the URL assertions below cannot
           pass by accident of the defaults. */
        await page.getByRole('button', { name: 'Tuần này', exact: true }).click();
        await page.getByRole('button', { name: /Từ hay sai/ }).click();
        await page.getByRole('button', { name: 'Việt → Anh' }).click();
        await start.click();

        /* --- step 2: the practice ------------------------------------------- */
        const practice = new URL(page.url());
        expect(practice.pathname).toBe('/review/session');
        expect(practice.searchParams.get('rangeMode')).toBe('week');
        expect(practice.searchParams.get('group')).toBe('wrong');
        expect(practice.searchParams.get('direction')).toBe('VI_TO_EN');
        expect(practice.searchParams.get('week')).toMatch(/^\d{4}-W\d{2}$/);

        /* A take screen: full-bleed, no rail, no `#main` — which is also why it is absent from the
           smoke suite's screen list (that list asserts the shell contract). */
        await expect(page.locator('#main')).toHaveCount(0);
        await expect(page.locator('nav[aria-label="Điều hướng chính"]')).toHaveCount(0);

        /* Vietnamese → English, so the prompt is the MEANING and the answer is the word. */
        await waitForScreen(page, page.getByText('Nghĩa tiếng Việt'));
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('làm giảm bớt mức độ nghiêm trọng');

        /* THE DIRECTION LIVES IN THE FOOTER, under the action it qualifies — not in the bar, where it
           competed with the progress for the strip that should be showing how far in the learner is.
           The bar carries the exit, the progress and the count and nothing else: no title repeating
           the rail entry that was just pressed. Under 480px the label is hidden, exactly as the frame
           hides it (`hide-sm`), because a 390px phone needs the whole row for the button — so this is
           asserted per viewport rather than pretending one layout serves both. */
        const takeBar = page.locator('header').first();
        await expect(takeBar.getByText('Ôn tập từ vựng')).toHaveCount(0);
        const directionLabel = page.locator('footer').getByText('Việt → Anh');
        if (test.info().project.name === 'mobile') {
            await expect(directionLabel).toBeHidden();
        } else {
            await expect(directionLabel).toBeVisible();
        }

        const answer = page.getByLabel('Nhập từ tiếng Anh');
        await answer.fill('mitigate');
        await page.getByRole('button', { name: 'Kiểm tra' }).click();

        /* The verdict names the recall in WORDS as well as colour. */
        await expect(page.getByText('Trả lời chính xác')).toBeVisible();
        await expect(page.getByText('Ví dụ sử dụng')).toBeVisible();

        /* THE ANSWER ROW CARRIES BOTH HALVES English → Vietnamese, not just the half the learner
           missed, and can be heard. And the alternatives show on a CORRECT answer too — which is why
           the mockup draws its chips in the frame's correct state: hiding them on a hit withholds the
           one thing that turns a lucky match into a known word. */
        await expect(page.getByText('Từ tiếng Anh đúng')).toBeVisible();
        await expect(page.getByText(/^mitigate → làm giảm bớt mức độ nghiêm trọng$/)).toBeVisible();
        await expect(page.getByText('Các nghĩa khác có thể chấp nhận')).toBeVisible();
        await expect(page.getByText('xoa dịu')).toBeVisible();

        /* THE EXPLANATION IS MARKDOWN, and it used to render as a plain string: `**Dùng khi**` and
           the two `- item` lines appeared verbatim, asterisks and dashes on screen. Asserting the
           rendered nodes rather than the text, plus the absence of `**` anywhere on the screen —
           which is what the raw-string bug looked like. */
        await expect(page.locator('strong', { hasText: 'Dùng khi' })).toBeVisible();
        await expect(page.locator('li', { hasText: 'giảm thiểu rủi ro' })).toBeVisible();
        await expect(page.getByText(/\*\*/)).toHaveCount(0);

        /* The action lives in the sticky footer, where a thumb can reach it. */
        await page.getByRole('button', { name: 'Tiếp theo' }).click();

        /* The second word is answered WRONG, so the result step has a retry to offer. */
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('làm cạn kiệt');
        await page.getByLabel('Nhập từ tiếng Anh').fill('nothing like it');
        await page.getByRole('button', { name: 'Kiểm tra' }).click();
        await expect(page.getByText('Chưa đúng hoàn toàn')).toBeVisible();
        /* On a miss the correct answer is shown, and the alternatives when there are any. */
        await expect(page.getByText('Từ tiếng Anh đúng')).toBeVisible();
        /* `deplete` has NO alternatives, so the chips block is absent rather than empty — the other
           half of "shown when there are any". */
        await expect(page.getByText('Các nghĩa khác có thể chấp nhận')).toHaveCount(0);
        /* The LAST word's footer button says "Tiếp theo" like every other one: frame 15b draws no
           "Hoàn thành" label, and the result screen's own exits are what end the flow. */
        await page.getByRole('button', { name: 'Tiếp theo' }).click();

        /* --- step 3: the result --------------------------------------------- */
        expect(new URL(page.url()).pathname).toBe('/review/result');
        /* Inside the shell, unlike the practice: the session is over and the exits are navigation. */
        await expect(page.locator('#main')).toHaveCount(1);
        await waitForScreen(page, page.getByText(/Rất tốt|Xuất sắc|Đang tiến bộ|Cần ôn thêm/));

        /* NO STEPPER AND NO "Bước 3 / 3", same as step 1. The flow is over, so a "3 of 3" badge states
           what the learner already knows and takes the strip directly above the result they came for.
           The retry exits below say what to do next, which is the more useful thing to put there. */
        await expect(page.getByText('Bước 3 / 3')).toHaveCount(0);
        await expect(page.getByRole('list', { name: 'Các bước của phiên ôn tập' })).toHaveCount(0);

        /* Same heading as step 1, different SECOND line — that is how the mockup separates the two
           screens, and it is why `/review/result` no longer needs a title of its own. */
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ôn tập từ vựng');
        await expect(page.getByText('Kết quả phiên ôn')).toBeVisible();

        /* The accuracy card is a between-row: the title and the "So với phiên trước" caption on the
           left, the delta as a chip on the right, over a bar. The delta is a CHIP because a signed
           number is a token to be scanned, not a sentence to be read. */
        await expect(page.getByText('Tỉ lệ chính xác')).toBeVisible();
        /* `exact`, same reason: the chip reads "+6% so với phiên trước" and `getByText` matches
           substrings case-insensitively, so the plain query resolves to the caption AND the chip. */
        await expect(page.getByText('So với phiên trước', { exact: true })).toBeVisible();

        await expect(page.getByText(/Rất tốt|Xuất sắc|Đang tiến bộ|Cần ôn thêm/)).toBeVisible();
        await expect(page.getByText(/Bạn đã trả lời đúng 1 trên 2 từ/)).toBeVisible();

        /* The hero heads the verdict with a BIG EMOJI, not a line icon — three sizes on one line of
           sight, so the reader gets "how did it go" before the numbers. 1 of 2 is 50%, which is the
           `improving` band, so this also proves the glyph travels with the rating rather than being
           one fixed picture. */
        await expect(page.locator('span[aria-hidden="true"]').filter({ hasText: '📈' })).toBeVisible();

        /* The four numbers, and the comparison against the PREVIOUS session — read before the save,
           because `GET /reviews/last` answers with the second-latest row by design. `.first()` because
           the detail rows below are also labelled "Đúng" / "Sai", so an exact query resolves to more
           than one node. */
        for (const label of ['Tổng', 'Đúng', 'Sai', 'Độ chính xác']) {
            await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
        }
        await expect(page.getByText('50%').first()).toBeVisible();
        /* The delta itself, as the chip the design draws — `+` on an improvement, because the sign is
           the whole point of printing it. `.first()` for the same reason as the labels above: the
           caption "So với phiên trước" is a second node containing the same words. */
        await expect(page.getByText(/^[+-]\d+% so với phiên trước$/).first()).toBeVisible();

        /* The per-word detail, with the answer that was given. A five-column table at phone width
           scrolls sideways and hides the column that matters, so the same rows are rendered as a list
           there — the two are asserted separately rather than pretending one layout serves both. */
        const isPhone = test.info().project.name === 'mobile';
        if (isPhone) {
            await expect(page.getByRole('listitem').filter({ hasText: 'deplete' })).toBeVisible();
        } else {
            await expect(page.getByRole('columnheader', { name: 'Thẻ nhắc' })).toBeVisible();
            await expect(page.getByRole('cell', { name: 'deplete', exact: true })).toBeVisible();
            await expect(page.getByRole('cell', { name: 'nothing like it', exact: true })).toBeVisible();
        }

        /* A retry that targets only the miss — the endpoint's `words` filter narrowed to one word. */
        const retry = page.getByRole('button', { name: /Ôn lại 1 từ khó/ });
        await expect(retry).toBeVisible();
        await retry.click();

        const retryUrl = new URL(page.url());
        expect(retryUrl.pathname).toBe('/review/session');
        expect(retryUrl.searchParams.get('words')).toBe('deplete');

        /* --- what was stored ------------------------------------------------- */
        /* EXACTLY one, which is a real assertion rather than bookkeeping: StrictMode runs the save
           effect twice on mount and `POST /reviews` has no idempotency guard, so the first run of this
           page stored two rows for one session. */
        expect(saved, `expected exactly one stored session, got ${saved.length}`).toHaveLength(1);
        expect(saved[0]).toMatchObject({
            total: 2,
            correct: 1,
            incorrect: 1,
            accuracy: 50,
            direction: 'vi-en', // the app's VI_TO_EN, in the spelling every existing row uses
            group: 'wrong',
            rangeMode: 'week',
        });
        expect(saved[0].sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(saved[0].durationSeconds).toBeGreaterThanOrEqual(1);
        expect(saved[0].durationSeconds).toBeLessThanOrEqual(10800);
        expect(saved[0].filter).toContain('group=wrong');
        expect(saved[0].words).toHaveLength(2);
        expect(saved[0].words[0]).toMatchObject({ englishWord: 'mitigate', givenAnswer: 'mitigate', isCorrect: true });
        expect(saved[0].words[1]).toMatchObject({ englishWord: 'deplete', isCorrect: false });

        expectNoProblems(problems);
    });

    test('a session with nothing in it says so instead of opening an empty screen', async ({ page }) => {
        const problems = collectPageProblems(page);
        await stubReview(page, { counts: { unreviewed: 0, wrong: 0, all: 0 }, words: [] });

        await gotoWithRetry(page, '/review');
        await page.locator('#main').waitFor({ state: 'attached' });

        await waitForScreen(page, page.getByText('Chưa có từ nào phù hợp'));
        await expect(page.getByRole('button', { name: /^Bắt đầu ôn/ })).toBeDisabled();

        /* And directly, without going through the config: the session must not render a bare screen. */
        await gotoWithRetry(page, '/review/session?rangeMode=all&group=all&limit=5&direction=EN_TO_VI');
        await waitForScreen(page, page.getByText('Không có từ nào để ôn'));

        expectNoProblems(problems);
    });

    test('esc leaves the session, and typing is what enables the check', async ({ page }) => {
        const problems = collectPageProblems(page);
        await stubReview(page);

        await gotoWithRetry(page, '/review/session?rangeMode=all&group=all&limit=2&direction=EN_TO_VI');
        const answer = page.getByLabel('Nhập nghĩa tiếng Việt');
        /* The session screen, not the Suspense fallback — see `waitForScreen`. */
        await waitForScreen(page, answer);

        /* The check is disabled until there is something to check, so Enter on an empty box cannot
           record an empty answer as wrong. */
        await expect(page.getByRole('button', { name: 'Kiểm tra' })).toBeDisabled();
        await answer.fill('làm giảm nhẹ');
        await expect(page.getByRole('button', { name: 'Kiểm tra' })).toBeEnabled();

        /* Enter checks; a second Enter advances, because the flow is keyboard-complete. */
        await answer.press('Enter');
        await expect(page.getByText('Trả lời chính xác')).toBeVisible();

        await page.keyboard.press('Escape');
        expect(new URL(page.url()).pathname).toBe('/review');

        expectNoProblems(problems);
    });
});
