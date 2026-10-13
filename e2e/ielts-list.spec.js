import { expect, test } from '@playwright/test';
import { collectPageProblems, expectNoProblems, expectNoRawKeyOrCrash, gotoWithRetry } from './helpers/guards.js';

/**
 * The IELTS library, and its two card states — mockup `16-ielts-list`.
 *
 *   `/ielts`  `IeltsListPage`  →  `/ielts/test/:testId`  (mockup 17)
 *
 * TWO THINGS ARE ASSERTED HERE THAT NO UNIT TEST CAN SEE:
 *
 *  1. the SECOND request, in a real browser. The card state depends on
 *     `POST /ielts/tests/highest-scores`, which takes the ids of the tests already on screen — so the
 *     body it posts is the proof that the two requests are chained rather than independently guessed.
 *  2. that the card is never painted in a state it then has to correct. Both requests live in one
 *     resource precisely so "Bắt đầu" cannot become "Làm lại" under the thumb about to press it.
 *
 * THE TWO IELTS ENDPOINTS ARE STUBBED, because the alternative is a run that depends on what this
 * account happened to sit: the assertions would pass or fail on account state, and a fresh account
 * would only ever exercise the untouched card. The shell, the routing, the button component and the
 * real i18n are all the real ones — the score `6.5` and the `88%` are the numbers the design frames
 * draw (35 of 40 rounds to 88).
 */

const SAT_ID = 'sat-0000-0000-0000-000000000001';
const FRESH_ID = 'fresh-000-0000-0000-000000000002';

const TESTS = [
    {
        id: SAT_ID,
        title: 'Cambridge 19 — Test 2',
        skill: 'LISTENING',
        timeLimitMinutes: 80,
        difficulty: 'MEDIUM',
        totalQuestions: 40,
    },
    {
        id: FRESH_ID,
        title: 'Cambridge 19 — Test 1',
        skill: 'READING',
        timeLimitMinutes: 80,
        difficulty: 'MEDIUM',
        totalQuestions: 40,
    },
];

/** The envelope every endpoint in this app answers with. */
const envelope = (data) => ({ success: true, message: 'OK', data });

/**
 * Answer the library's two calls and let everything else through untouched.
 *
 * ONE handler rather than two globs on purpose: a glob wide enough to catch the list also catches
 * the scores endpoint and the per-test detail path, so a second route would silently answer the
 * detail screen with a list. Dispatching on the pathname says which request it is instead of relying
 * on route-registration order.
 */
async function stubLibrary(page, { scores = [], scoresFail = false } = {}) {
    const postedIds = [];

    await page.route('**/api/ielts/tests**', async (route) => {
        const path = new URL(route.request().url()).pathname;

        if (path.endsWith('/highest-scores')) {
            postedIds.push(route.request().postDataJSON()?.testIds ?? null);
            if (scoresFail) return route.fulfill({ status: 500, json: { success: false, message: 'boom' } });
            return route.fulfill({ json: envelope(scores) });
        }

        /* The list itself, and NOT `/ielts/tests/{id}` — the detail route stays real so a click can
           be followed for real. */
        if (/\/ielts\/tests\/?$/.test(path)) {
            return route.fulfill({
                json: envelope({
                    page: 0,
                    size: 24,
                    totalElements: TESTS.length,
                    totalPages: 1,
                    items: TESTS,
                }),
            });
        }

        return route.continue();
    });

    return postedIds;
}

test.describe('the IELTS library', () => {
    test('a sat test shows its best result and a retake; an untouched one shows a start', async ({ page }) => {
        const problems = collectPageProblems(page);
        const postedIds = await stubLibrary(page, {
            scores: [
                {
                    testId: SAT_ID,
                    attempted: true,
                    attemptId: 'attempt-1',
                    highestBandScore: 6.5,
                    correctCount: 35,
                    totalQuestions: 40,
                    completedAt: '2026-10-11 09:30:00',
                },
                { testId: FRESH_ID, attempted: false },
            ],
        });

        await gotoWithRetry(page, '/ielts');
        await expect(page.getByRole('heading', { name: 'Đề có sẵn' })).toBeVisible();
        await expect(page.getByText('Cambridge 19 — Test 2')).toBeVisible({ timeout: 20_000 });

        /* THE BODY IS THE ASSERTION: every scores request carries the ids of the tests the list
           returned, and none carries an empty array ("testIds" is @NotEmpty on the DTO, so that
           would be a 400).

           WHY NOT "exactly one POST": React StrictMode double-invokes the loader in dev, so the
           count is 1 in a production build and 2 here. Asserting the count would either pin a
           development artefact or quietly pass only in one mode; asserting EVERY body is the
           property that actually matters, and it holds in both. The list GET is idempotent, and this
           POST is a pure read despite its verb. */
        expect(postedIds.length).toBeGreaterThan(0);
        for (const body of postedIds) {
            expect(body).toEqual([SAT_ID, FRESH_ID]);
        }

        /* --- the card that has been sat -------------------------------- */
        /* All four marks come from ONE response field, so they are asserted together: a card showing
           a band while saying "Bắt đầu" would be describing two different learners. */
        await expect(page.getByText('6.5')).toBeVisible();
        await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '88');

        /* "Cao nhất", NOT "Lần trước". The endpoint returns the BEST attempt per test, so the badge,
           the bar and this caption all describe the same sitting. */
        await expect(page.getByText('Cao nhất 88%')).toBeVisible();
        await expect(page.getByText(/Lần trước/)).toHaveCount(0);

        /* --- the card that has not ------------------------------------- */
        await expect(page.getByRole('link', { name: 'Bắt đầu: Cambridge 19 — Test 1' })).toBeVisible();
        /* Exactly one bar on the screen, because exactly one test has a result to draw. */
        await expect(page.getByRole('progressbar')).toHaveCount(1);

        /* BOTH CARDS OPEN THE DETAIL SCREEN, not the exam. That is where the attempt mode, the scope
           and the credit cost are decided, so a browse surface must not spend a credit on a click. */
        await expect(page.getByRole('link', { name: 'Làm lại: Cambridge 19 — Test 2' })).toHaveAttribute(
            'href',
            `/ielts/test/${SAT_ID}`
        );
        await expect(page.getByRole('link', { name: 'Bắt đầu: Cambridge 19 — Test 1' })).toHaveAttribute(
            'href',
            `/ielts/test/${FRESH_ID}`
        );

        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('a failing scores request still lists the library', async ({ page }) => {
        /* The library is what the learner came for. Failing the whole screen because a BADGE failed
           would trade a list they can use for a list they cannot. The cost is that both cards fall
           back to "Bắt đầu" — asserted, not hidden — and both still lead to the detail screen. */
        const problems = collectPageProblems(page);
        await stubLibrary(page, { scoresFail: true });

        await gotoWithRetry(page, '/ielts');
        await expect(page.getByText('Cambridge 19 — Test 2')).toBeVisible({ timeout: 20_000 });

        await expect(page.getByRole('link', { name: 'Bắt đầu: Cambridge 19 — Test 2' })).toBeVisible();
        await expect(page.getByRole('progressbar')).toHaveCount(0);
        await expect(page.getByRole('link', { name: 'Bắt đầu: Cambridge 19 — Test 1' })).toBeVisible();

        /* The list did NOT become an error panel: the API answered, and only the optional half of it
           did not. */
        await expect(page.getByText('Máy chủ đang gặp sự cố')).toHaveCount(0);

        /* The scores request is expected to fail, so its own console entry is not an app defect. */
        const unexpected = problems.filter((problem) => !/highest-scores/.test(problem));
        expectNoProblems(unexpected);
    });
});
