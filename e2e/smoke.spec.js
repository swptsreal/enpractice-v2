import { test } from '@playwright/test';
import {
    collectPageProblems,
    expectBodyHasContent,
    expectNoErrorOverlay,
    expectNoProblems,
    expectNoRawKeyOrCrash,
    gotoWithRetry,
} from './helpers/guards.js';
import { captureScreen, expectShellScrollport } from './helpers/screenshot.js';

/**
 * Every screen the shell can reach, driven in a real browser.
 *
 * A smoke pass, deliberately: it does not assert what each screen says (that is what the screen's
 * own tests are for). It asserts the four things unit tests CANNOT see, because they mock the api
 * module and never mount the shell:
 *
 *   1. the route renders at all — no uncaught error, no Vite error overlay;
 *   2. it does not print a raw i18n key;
 *   3. it does not print a crash sentence;
 *   4. it draws something, rather than a header over an empty page (the double-unwrap bug looked
 *      exactly like this: all 200s in the network tab, nothing on screen).
 *
 * Each visit also writes a full-page screenshot to `e2e/__screenshots__/`, which is the part that
 * lets a human (or an agent that cannot open a browser) actually LOOK at the result afterwards.
 */
const SIGNED_IN_SCREENS = [
    ['home', '/home'],
    ['ielts-list', '/ielts'],
    ['ielts-history', '/ielts/history'],
    ['learning-path', '/path'],
    ['vocabulary', '/vocabulary'],
    /* THE SAME URL TWICE, ON PURPOSE. `/vocabulary/check` is the one screen with two chromes —
       full-bleed for a visitor (see GUEST_SCREENS, below) and inside the shell for a learner
       (`VocabularyCheckLayout`). One visit cannot prove both, and asserting the shell contract on
       the guest frame would fail on a screen that is exactly where it should be. */
    ['vocabulary-check-signed-in', '/vocabulary/check'],
    ['vocabulary-history', '/vocabulary/history'],
    ['dictionary', '/dictionary'],
    ['evaluation', '/evaluation'],
    ['weekly-report', '/weekly-report'],
    ['writing-list', '/writing'],
    ['writing-submissions', '/writing/submissions'],
    ['speaking-list', '/speaking'],
    ['speaking-attempts', '/speaking/attempts'],
    ['custom-speaking', '/custom-speaking'],
    ['credits', '/credits'],
    ['rewards', '/rewards'],
    ['challenges', '/challenges'],
    ['leaderboard', '/leaderboard'],
    ['notifications', '/notifications'],
    ['profile', '/profile'],
    ['settings', '/settings'],
    ['ai-chat', '/ai-chat'],
    ['review', '/review'],
    ['onboarding', '/onboarding'],
];

const GUEST_SCREENS = [
    ['landing', '/'],
    ['login', '/login'],
    ['vocabulary-check', '/vocabulary/check'],
];

/** Waits until the app has stopped fetching, without hanging on a page that never settles. */
async function settle(page) {
    try {
        await page.waitForLoadState('networkidle', { timeout: 8_000 });
    } catch {
        /* A screen that keeps a request open (a poll, a stream) is not a failure here; the
           guards below are what decide whether it is broken. */
    }
}

test.describe('signed-in screens', () => {
    for (const [name, path] of SIGNED_IN_SCREENS) {
        test(`${name} (${path}) renders without crashing`, async ({ page }, testInfo) => {
            const problems = collectPageProblems(page);

            await gotoWithRetry(page, path);
            await settle(page);

            await expectNoErrorOverlay(page);
            await expectNoRawKeyOrCrash(page);

            /* "Drew something": the shell always has a header, so an empty <main> means the screen
               itself produced nothing. Polled rather than read once — a slow API is not a blank
               screen, and a fixed sleep cannot tell the difference. */
            await expectBodyHasContent(page, { problems });

            /* THE SHELL SCROLLS ITS CONTENT, NOT THE DOCUMENT — measured in a real browser, because
               jsdom has no layout engine and cannot see this at all. `/onboarding` is the one
               signed-in route mounted OUTSIDE the shell (it is a focused flow with no nav), so it
               keeps scrolling the document and has no `#main`. */
            if (path !== '/onboarding') await expectShellScrollport(page);

            await captureScreen(page, `e2e/__screenshots__/${testInfo.project.name}/${name}.png`);

            expectNoProblems(problems);
        });
    }
});

test.describe('guest screens — no session at all', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    for (const [name, path] of GUEST_SCREENS) {
        test(`${name} (${path}) renders for a visitor`, async ({ page }, testInfo) => {
            const problems = collectPageProblems(page);

            await gotoWithRetry(page, path);
            await settle(page);

            await expectNoErrorOverlay(page);
            await expectNoRawKeyOrCrash(page);

            await expectBodyHasContent(page, { problems });

            /* Guest surfaces live OUTSIDE the shell (landing, login, /vocabulary/check) and scroll
               the document, which is the intended difference — so this branch asserts nothing about
               an inner scrollport. */
            await captureScreen(page, `e2e/__screenshots__/${testInfo.project.name}/${name}.png`);

            expectNoProblems(problems);
        });
    }
});
