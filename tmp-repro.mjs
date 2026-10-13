/* Throwaway repro #2: reach /vocabulary/check the way a person does — client-side navigation
   from the landing page and from the rail — instead of a hard load of the URL. */
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'https://localhost:5173';
const state = process.argv[3];
const browser = await chromium.launch();
const context = await browser.newContext({ ignoreHTTPSErrors: true, ...(state ? { storageState: state } : {}) });
const page = await context.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`);
});

await page.goto(base + '/', { waitUntil: 'networkidle' }).catch((e) => errors.push('goto /: ' + e.message));

/* The landing page's guest-trial link, whichever CTA renders first. */
const link = page.locator('a[href="/vocabulary/check"], a[href*="/vocabulary/check"]').first();
const count = await link.count();
console.log('guest-trial links found:', count);
if (count) {
    await link.click();
    await page.waitForTimeout(2500);
}
console.log('url after click:', page.url());
console.log('errors:', errors.length ? errors : '(none)');
await browser.close();
