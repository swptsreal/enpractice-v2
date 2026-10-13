/** TEMP — screenshot the new mockup frames so they can be reviewed. Deleted after the run. */
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

for (const [file, out, width] of [
    ['_design/mockup/36b-lexi-panel.html', '.mock-36b-phone.png', 390],
    ['_design/mockup/04-home.html', '.mock-04-phone.png', 390],
]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    await page.screenshot({ path: out, fullPage: false });
    console.log('shot', out);
}
await browser.close();
