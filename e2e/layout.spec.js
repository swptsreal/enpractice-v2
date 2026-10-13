import { expect, test } from '@playwright/test';
import { collectPageProblems, expectNoProblems, gotoWithRetry } from './helpers/guards.js';
import {
    expectDocumentDoesNotScroll,
    expectShellScrollport,
    measureScrollContainers,
} from './helpers/screenshot.js';

/**
 * The layout contract of the shell and of the take screens.
 *
 * WHY THIS FILE EXISTS: two of the reported defects are pure LAYOUT, and no other runner can see
 * them. jsdom has no layout engine, so `IeltsTakePage.test.jsx` asserts classes and passes while
 * the navigator sits below the fold; `App.test.jsx` proves the routes render and cannot prove the
 * header stopped moving. Every claim here is measured in a real browser:
 *
 *   1. "Layout tổng: scroll trong content chứ không phải cả header như hiện tại" — the document
 *      must NOT scroll on a shell route, `#main` must, and the header must not move while it does.
 *   2. "Màn ielts/take đang scroll page nên nếu đoạn văn dài thì pagination sẽ bị đẩy xuống dưới" —
 *      the question navigator must stay INSIDE the viewport once the reading pane is scrolled.
 *
 * The take screens are mounted outside the shell on purpose (`src/App.jsx`), so (2) is a strictly
 * separate contract from (1): fixing one does not fix the other, and asserting the shell's `#main`
 * on a take screen would fail on a screen that is exactly where it should be.
 */

test.describe('shell layout — the content scrolls, the header does not', () => {
    /**
     * Navigate to a shell route and WAIT FOR THE SHELL TO MOUNT.
     *
     * `waitUntil: 'domcontentloaded'` resolves when the HTML is parsed, which is before React has
     * rendered anything — measuring straight after it reports "#main is missing" and reads like a
     * broken shell. The smoke suite never hit this because it calls `settle()` first; these tests
     * measure layout, so they must wait for the element they measure.
     */
    async function gotoShellRoute(page, path) {
        await gotoWithRetry(page, path);
        await page.locator('#main').waitFor({ state: 'attached' });
    }

    /* /settings is the longest shell route, and it carries the anchor links whose offset broke when
       the scrollport moved off `html`. */
    test('the document does not scroll on a shell route', async ({ page }) => {
        await gotoShellRoute(page, '/settings');
        await expectShellScrollport(page);

        const measured = await measureScrollContainers(page);
        expect(measured.mainScrolls, 'settings must be long enough to scroll #main').toBe(true);
    });

    test('the header stays put while the content scrolls', async ({ page }) => {
        await gotoShellRoute(page, '/settings');
        await expectShellScrollport(page);

        const header = page.locator('header').first();
        const before = await header.boundingBox();

        await page.evaluate(() => {
            document.querySelector('#main').scrollTop = 600;
        });
        await page.waitForFunction(() => document.querySelector('#main').scrollTop > 0);

        const after = await header.boundingBox();
        expect(after.y, 'the header moved when the content scrolled').toBe(before.y);
        expect(Math.round(after.y), 'the header must sit at the top of the viewport').toBe(0);

        /* And the content really did move, or the assertion above proves nothing. */
        const scrollTop = await page.evaluate(() => document.querySelector('#main').scrollTop);
        expect(scrollTop).toBeGreaterThan(0);
    });

    test('a section anchor lands below the header, not underneath it', async ({ page }) => {
        await gotoShellRoute(page, '/settings');

        const target = page.locator('#data');
        /* The shell's own anchor navigation, the way a user triggers it. */
        await page.evaluate(() => {
            document.querySelector('a[href="#data"]')?.click();
        });
        await page.waitForTimeout(400);

        const headerBox = await page.locator('header').first().boundingBox();
        const targetBox = await target.boundingBox();
        expect(targetBox.y, 'the anchor target is hidden behind the header').toBeGreaterThanOrEqual(
            Math.round(headerBox.height) - 1
        );
    });
});

test.describe('take screens — the pane scrolls, the controls stay put', () => {
    /**
     * The reported failure: a long passage made the grid row as tall as the passage, so the panes'
     * own `overflow-y-auto` never engaged, the document scrolled, and `mt-auto` parked the
     * prev/next bar and the navigator below the fold.
     *
     * This drives a real paper, which costs one credit and needs a live backend. Every early exit
     * prints WHY on stdout: a silent skip is indistinguishable from a pass in a CI summary, and
     * this is the only automated cover the take screens have.
     */
    test('the navigator stays inside the viewport on a long passage', async ({ page }) => {
        const skip = (reason) => {
            console.log(`[layout] SKIPPED — ${reason}`);
            test.skip(true, reason);
        };

        await gotoWithRetry(page, '/ielts');

        /* The list card's own primary action goes straight to `/ielts/take?testId=…`; the detail
           screen is not on the card, so this is the shortest real path to a live paper.
           Wait for the LINK, not for a fixed delay: the list is a network round trip, and a timer
           made this test skip intermittently on the desktop project. */
        const startLink = page.locator('a[href*="/ielts/take?testId="]').first();
        await startLink.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
        if ((await startLink.count()) === 0) return skip('no IELTS test on the list for this account');
        await startLink.click();

        /* The wallet may refuse (402) — a product state, not a layout failure. */
        await page.waitForTimeout(3000);
        if (!page.url().includes('/ielts/take')) {
            return skip(`could not start an attempt; landed on ${page.url()}`);
        }

        const problems = collectPageProblems(page);
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        await page.locator('#pane-questions').waitFor({ state: 'attached' });

        /* The take screen is outside the shell, and its contract is that the PANES scroll while the
           document does not — the whole bug was the page scrolling instead. */
        await expectDocumentDoesNotScroll(page);

        /* Below 1024px the two panes are a tab switch and the questions pane starts hidden — a hidden
           element has no accessible role, so the navigator is not found until its tab is chosen.
           The tab label carries the answered count ("Câu hỏi (3/13)"), hence the loose match. */
        let navigator = page.getByRole('group', { name: /Điều hướng câu hỏi/ });
        if ((await navigator.count()) === 0) {
            const questionsTab = page.getByRole('tab', { name: /Câu hỏi/ });
            if ((await questionsTab.count()) > 0) {
                await questionsTab.first().click();
                await page.waitForTimeout(300);
            }
            navigator = page.getByRole('group', { name: /Điều hướng câu hỏi/ });
        }
        if ((await navigator.count()) === 0) return skip('no question navigator on this paper');

        const viewport = page.viewportSize();

        /* MAKE THE CONTENT LONG, DETERMINISTICALLY.
           The reported failure needs a long passage, and which paper the account gets is not ours to
           choose — the first paper available has a passage that fits. So the length is injected:
           this tests the LAYOUT MECHANISM ("however long the reading content is, the controls stay
           put"), which is the actual claim, instead of hoping for a long paper.
           WHICH container to grow depends on the breakpoint, and that is the point of the two
           different fixes: at >=1024px the PASSAGE pane scrolls beside the questions, while below
           it the panes are a tab switch and only the questions pane is on screen — so the long
           thing there is the question list.
           Appending text, not markup: the assertion is about geometry. */
        const paneInfo = await page.evaluate(() => {
            const passage = document.querySelector('#pane-passage');
            const passageVisible = Boolean(passage && passage.offsetParent !== null && passage.clientHeight > 0);
            const questions = document.querySelector('#pane-questions');
            /* The inner scroller that holds the question and its options (the pane itself must NOT
               scroll — that is the fix). */
            const questionsScroller = questions?.querySelector('div.overflow-y-auto') ?? questions;
            const target = passageVisible ? passage : questionsScroller;
            if (!target) return null;

            const filler = document.createElement('p');
            filler.textContent = 'Long reading passage paragraph. '.repeat(400);
            target.appendChild(filler);

            return {
                grew: passageVisible ? '#pane-passage' : '#pane-questions scroller',
                scrollable: target.scrollHeight > target.clientHeight + 20,
                scrollHeight: target.scrollHeight,
                clientHeight: target.clientHeight,
            };
        });
        expect(paneInfo, 'neither pane is in the DOM').not.toBeNull();
        expect(
            paneInfo.scrollable,
            `${paneInfo.grew} did not become scrollable (${paneInfo.scrollHeight} vs ${paneInfo.clientHeight}) — it is growing the page instead of scrolling`
        ).toBe(true);

        /* Scroll it as far as it goes: that is what used to push the controls out of the viewport. */
        await page.evaluate(() => {
            const passage = document.querySelector('#pane-passage');
            const passageVisible = Boolean(passage && passage.offsetParent !== null && passage.clientHeight > 0);
            const target = passageVisible
                ? passage
                : document.querySelector('#pane-questions div.overflow-y-auto');
            if (target) target.scrollTop = target.scrollHeight;
        });
        await page.waitForTimeout(300);

        const box = await navigator.boundingBox();
        expect(box, 'the navigator is not rendered').not.toBeNull();
        expect(
            box.y + box.height,
            `the navigator bottom (${Math.round(box.y + box.height)}) is below the viewport (${viewport.height})`
        ).toBeLessThanOrEqual(viewport.height + 1);

        /* And the page did not scroll to get there — the reported failure was page scroll. */
        const docScroll = await page.evaluate(() => document.documentElement.scrollTop);
        expect(docScroll, 'the take screen scrolled the whole page').toBe(0);

        expectNoProblems(problems);
    });
});
