import { expect, test } from '@playwright/test';
import {
    collectPageProblems,
    expectNoErrorOverlay,
    expectNoProblems,
    expectNoRawKeyOrCrash,
} from './helpers/guards.js';

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

            await page.goto(path, { waitUntil: 'domcontentloaded' });
            await settle(page);

            await expectNoErrorOverlay(page);
            await expectNoRawKeyOrCrash(page);

            /* "Drew something": the shell always has a header, so an empty <main> means the screen
               itself produced nothing. 40 characters is a low bar on purpose — this is a smoke
               check, not a copy assertion. */
            const text = (await page.locator('body').innerText()).trim();
            expect(text.length, `body text was only ${text.length} characters`).toBeGreaterThan(40);

            await page.screenshot({
                path: `e2e/__screenshots__/${testInfo.project.name}/${name}.png`,
                fullPage: true,
            });

            expectNoProblems(problems);
        });
    }
});

test.describe('guest screens — no session at all', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    for (const [name, path] of GUEST_SCREENS) {
        test(`${name} (${path}) renders for a visitor`, async ({ page }, testInfo) => {
            const problems = collectPageProblems(page);

            await page.goto(path, { waitUntil: 'domcontentloaded' });
            await settle(page);

            await expectNoErrorOverlay(page);
            await expectNoRawKeyOrCrash(page);

            const text = (await page.locator('body').innerText()).trim();
            expect(text.length, `body text was only ${text.length} characters`).toBeGreaterThan(40);

            await page.screenshot({
                path: `e2e/__screenshots__/${testInfo.project.name}/${name}.png`,
                fullPage: true,
            });

            expectNoProblems(problems);
        });
    }
});
