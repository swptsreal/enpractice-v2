import { expect, test } from '@playwright/test';
import { collectPageProblems, expectNoProblems, gotoWithRetry } from './helpers/guards.js';

/**
 * The floating helper opens a PANEL — it does not navigate.
 *
 * That is the whole point of the change and the reason this needs a browser: the defect was
 * `href="/ai-chat"`, so pressing "Hỏi Lexi" left the screen the question was about. A unit test can
 * assert the absence of an `href`; only a real navigation proves the URL did not change, the panel
 * is on top of the page it was opened from, and the page behind is still readable.
 */
test.describe('Lexi’s floating helper', () => {
    test('opens a panel in place instead of navigating away', async ({ page }) => {
        await gotoWithRetry(page, '/home');
        await page.locator('#main').waitFor({ state: 'attached' });

        const helper = page.getByRole('button', { name: 'Hỏi Lexi' });
        await expect(helper).toHaveAttribute('aria-expanded', 'false');

        const urlBefore = page.url();
        await helper.click();

        /* THE ASSERTION THE DEFECT WOULD FAIL: still on /home. */
        expect(page.url(), 'the helper navigated away').toBe(urlBefore);
        await expect(helper).toHaveAttribute('aria-expanded', 'true');

        const panel = page.getByRole('dialog', { name: 'Hỏi Lexi' });
        await panel.waitFor({ state: 'visible' });

        /* NON-modal: the page behind is not covered by a scrim, and it still has its own content. */
        await expect(panel).toHaveAttribute('aria-modal', 'false');
        await expect(page.locator('#main')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        /* It names the screen the learner is on, which is the whole reason a panel beats a page. */
        await expect(panel).toContainText('Đang xem');
    });

    test('closes on Escape and returns focus to the helper', async ({ page }) => {
        await gotoWithRetry(page, '/home');
        await page.locator('#main').waitFor({ state: 'attached' });

        const helper = page.getByRole('button', { name: 'Hỏi Lexi' });
        await helper.click();
        await page.getByRole('dialog', { name: 'Hỏi Lexi' }).waitFor({ state: 'visible' });

        await page.keyboard.press('Escape');

        await expect(helper).toHaveAttribute('aria-expanded', 'false');
        await expect(page.getByRole('dialog', { name: 'Hỏi Lexi' })).toHaveCount(0);
        /* Focus back on the control that opened it, or a keyboard user lands at the top of the
           document. */
        await expect(helper).toBeFocused();
    });

    test('draws the panel without console errors on a second shell route', async ({ page }) => {
        /* A second route, because the panel reads the page title for its context line and a route
           without a title entry would render an empty one. */
        const problems = collectPageProblems(page);
        await gotoWithRetry(page, '/path');
        await page.locator('#main').waitFor({ state: 'attached' });

        await page.getByRole('button', { name: 'Hỏi Lexi' }).click();
        const panel = page.getByRole('dialog', { name: 'Hỏi Lexi' });
        await panel.waitFor({ state: 'visible' });

        await expect(panel).toContainText('Lộ trình học');
        expectNoProblems(problems);
    });
});
