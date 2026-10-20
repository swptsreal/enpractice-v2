import { expect, test } from '@playwright/test';
import { collectPageProblems, expectNoProblems, gotoWithRetry } from './helpers/guards.js';

/* This one spends real TTS quota, so it is opt-in. The stubbed chat-voice suite remains the
   default regression gate; run this file with E2E_REAL_TTS=1 when changing the stream/player. */
test.skip(process.env.E2E_REAL_TTS !== '1', 'Set E2E_REAL_TTS=1 to hit the real TTS API');

test('real TTS stream starts playing before the whole answer is synthesised', async ({ page }) => {
    const problems = collectPageProblems(page);
    const streamResponse = page.waitForResponse(
        (response) => response.url().includes('/api/tts/stream') && response.status() === 200,
        { timeout: 30_000 }
    );

    await gotoWithRetry(page, '/ai-chat');
    await page.getByRole('button', { name: 'Nghe' }).first().click();

    const response = await streamResponse;
    expect(response.headers()['content-type']).toContain('application/x-ndjson');
    expect(response.request().postDataJSON().language).toBe('auto');

    /* The button flips only after the first decoded chunk has been scheduled. */
    await expect(page.getByRole('button', { name: 'Đang phát…' })).toBeVisible({
        timeout: 10_000,
    });

    await expectNoProblems(problems);
});
