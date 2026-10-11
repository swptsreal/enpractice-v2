import { expect, test } from '@playwright/test';

/**
 * The theme choice must survive a reload, on EVERY route — not only on the Settings screen.
 *
 * The bug this pins: choosing "Sáng" (light) turned the page light, and pressing F5 turned it dark
 * again. The cause was that `data-theme` was written ONLY by the Settings screen's hook, so the
 * attribute was applied while that screen was mounted and by nothing at all after a reload; every
 * other route let the operating system decide. The `<html>` attribute is per-document state, and a
 * reload throws it away, so the preference has to be re-applied from storage before the first
 * paint, not by a page-level effect.
 *
 * The OS preference is EMULATED AS DARK on purpose: that is the exact situation in the report, and
 * it is what makes the test fail if the boot path stops working (a light OS would mask it).
 */
test.use({ colorScheme: 'dark' });

const LIGHT_CANVAS = 'rgb(251, 248, 242)'; // --canvas light in tokens.css
const PREFS_KEY = 'en-practice:prefs';

test.describe('theme preference', () => {
    test('survives a reload, and applies on routes other than Settings', async ({ page }) => {
        await page.goto('/settings', { waitUntil: 'domcontentloaded' });

        /* Pick light through the UI, the way a learner does — not by writing storage directly. */
        await page.getByRole('button', { name: 'Sáng' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

        /* The choice is persisted, so a reload has something to restore. */
        const stored = await page.evaluate((key) => window.localStorage.getItem(key), PREFS_KEY);
        expect(stored, 'theme was not written to localStorage').toContain('"light"');

        /* ── the reported failure, on the Settings route itself ───────────────── */
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await expect(page.locator('body')).toHaveCSS('background-color', LIGHT_CANVAS);

        /* ── and on a different route, where no Settings hook is mounted ───────── */
        await page.goto('/home', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await expect(page.locator('body')).toHaveCSS('background-color', LIGHT_CANVAS);

        /* A hard navigation (not a client-side route change) is the case that lost the attribute. */
        await page.goto('/home', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('body')).toHaveCSS('background-color', LIGHT_CANVAS);
    });

    test('"Theo hệ thống" goes back to following the system', async ({ page }) => {
        await page.goto('/settings', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Sáng' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

        await page.getByRole('button', { name: 'Theo hệ thống' }).click();
        await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.*/);

        /* With the OS emulated as dark, "system" must render the dark canvas. */
        await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(12, 22, 27)');

        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.*/);
        await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(12, 22, 27)');
    });
});
