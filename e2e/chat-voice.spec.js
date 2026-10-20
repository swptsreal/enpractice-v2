import { expect, test } from '@playwright/test';
import {
    collectPageProblems,
    expectNoProblems,
    expectNoRawKeyOrCrash,
    gotoWithRetry,
} from './helpers/guards.js';

/**
 * The AI coach's voice pair: hearing Lexi, and speaking to her.
 *
 * IT RUNS AGAINST THE REAL BACKEND and stubs only the TTS endpoint, because the assertion is
 * WHICH SENTENCE was asked to be spoken — the request body is the evidence that a long markdown
 * answer is reduced to prose before it is synthesised, and that the button belongs to the answer
 * it sits under rather than to the newest one.
 *
 * THE MIC IS DRIVEN FOR REAL. Chromium in this suite exposes `SpeechRecognition` and the config
 * provides a synthetic microphone, so the recording state (chip, timer, stop control, the input
 * giving way) is exercised through the actual hook. What headless Chromium cannot do is
 * TRANSCRIBE — there is no speech service behind it — so this file asserts the recording
 * behaviour and the transcript-to-input hand-off is pinned by the unit test instead, where
 * recognition can be driven directly.
 */
async function stubTts(page) {
    const spoken = [];
    const bodies = [];
    await page.route('**/api/tts/**', async (route) => {
        const body = route.request().postDataJSON();
        if (body?.text) {
            spoken.push(body.text);
            bodies.push(body);
        }

        if (route.request().url().endsWith('/tts/stream')) {
            /* A valid NDJSON stream with no audio payload: the assertion is the request, and the
               player resolves on `done` without needing to decode a clip. */
            const events = [
                { type: 'start', total: 1 },
                { type: 'chunk', index: 0, total: 1, text: body.text, language: 'vi', audioBase64: '' },
                { type: 'done' },
            ];
            return route.fulfill({
                status: 200,
                contentType: 'application/x-ndjson',
                body: `${events.map((event) => JSON.stringify(event)).join('\n')}\n`,
            });
        }

        return route.fulfill({
            json: { success: true, message: 'OK', data: { audioBase64: null } },
        });
    });
    return { spoken, bodies };
}

async function stubStt(page, { status = 200, text = 'Làm sao để cải thiện Matching Headings?' } = {}) {
    await page.route('**/api/speech/transcriptions', async (route) => {
        /* Delay just enough for the "Đang nhận diện…" state to be observable. */
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (status !== 200) {
            return route.fulfill({
                status,
                json: {
                    success: false,
                    code: 'SPEECH_QUOTA_EXCEEDED',
                    message: 'Bạn đã dùng hết lượt giọng nói hôm nay.',
                },
            });
        }
        return route.fulfill({
            json: {
                success: true,
                message: 'OK',
                data: {
                    text,
                    language: 'vi',
                    provider: 'openai',
                    model: 'gpt-4o-transcribe',
                    durationMs: 3000,
                },
            },
        });
    });
}

test.describe('the AI coach takes voice and gives voice', () => {
    test('a Lexi answer can be heard, and the request carries THAT answer as plain prose', async ({
        page,
    }) => {
        const problems = collectPageProblems(page);
        const { spoken, bodies } = await stubTts(page);

        await gotoWithRetry(page, '/ai-chat');

        const listen = page.getByRole('button', { name: 'Nghe' }).first();
        await expect(listen).toBeVisible({ timeout: 20_000 });
        await listen.click();

        await expect.poll(() => spoken.length, { timeout: 20_000 }).toBeGreaterThan(0);
        /* The request lets the server choose the Vietnamese/English voice from the text. */
        expect(bodies[0].language).toBe('auto');
        /* A sentence, not a word: the control belongs to the answer above it. */
        expect(spoken[0].length).toBeGreaterThan(20);
        /* And no markdown reaches the synthesiser — "**bold**" read aloud is an asterisk. */
        expect(spoken[0]).not.toMatch(/[*#`_|]/);

        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('the composer records, transcribes on the server, and gives the input back', async ({
        page,
    }) => {
        const problems = collectPageProblems(page);
        await stubTts(page);
        await stubStt(page);

        await gotoWithRetry(page, '/ai-chat');

        const mic = page.getByRole('button', { name: 'Ghi âm câu hỏi' });
        await expect(mic).toBeVisible({ timeout: 20_000 });
        await mic.click();

        /* ONE recording language across the product: a chip that says "Đang ghi âm", a real
           timer, a stop control, and no input while the microphone is open. */
        await expect(page.getByText('Đang ghi âm')).toBeVisible();
        await expect(page.getByRole('timer')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Dừng ghi âm' })).toBeVisible();
        await expect(page.getByPlaceholder(/Hỏi Lexi/)).toHaveCount(0);
        /* Give MediaRecorder one dataavailable tick; stopping before it fires produces an empty
           blob and no transcription request at all. */
        await page.waitForTimeout(800);

        await page.getByRole('button', { name: 'Dừng ghi âm' }).click();

        /* The server transcription is in flight: the composer says so instead of going blank. */
        await expect(page.getByText('Đang nhận diện…')).toBeVisible();

        /* The transcript lands in the input for editing; nothing is sent automatically. */
        await expect(page.getByPlaceholder(/Hỏi Lexi/)).toHaveValue(
            'Làm sao để cải thiện Matching Headings?'
        );
        await expect(page.getByRole('button', { name: /Gửi/ })).toBeEnabled();

        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('a quota error leaves a short retry chip instead of losing the question', async ({
        page,
    }) => {
        const problems = collectPageProblems(page);
        await stubTts(page);
        await stubStt(page, { status: 429 });

        await gotoWithRetry(page, '/ai-chat');
        await page.getByRole('button', { name: 'Ghi âm câu hỏi' }).click();
        await expect(page.getByRole('button', { name: 'Dừng ghi âm' })).toBeVisible();
        /* One dataavailable tick before stopping, or there is no audio to upload and therefore no
           429 to exercise. */
        await page.waitForTimeout(800);
        await page.getByRole('button', { name: 'Dừng ghi âm' }).click();

        await expect(page.getByText('Hết lượt giọng nói')).toBeVisible();
        await expect(page.getByPlaceholder(/Hỏi Lexi/)).toBeVisible();

        await expectNoRawKeyOrCrash(page);
        /* The 429 is the scenario under test, and axiosClient logs it in dev. Nothing else is
           allowed to fail: a real render/runtime error still fails this assertion. */
        const unexpected = problems.filter(
            (problem) => !/429|SPEECH_QUOTA_EXCEEDED/.test(problem)
        );
        expect(unexpected, unexpected.join('\n')).toEqual([]);
    });

    test('the floating panel offers the same pair, because it is the same conversation', async ({
        page,
    }) => {
        const problems = collectPageProblems(page);
        await stubTts(page);

        await gotoWithRetry(page, '/home');
        await page.getByRole('button', { name: 'Hỏi Lexi' }).click();

        const panel = page.getByRole('dialog', { name: 'Hỏi Lexi' });
        await panel.waitFor({ state: 'visible' });

        await expect(panel.getByRole('button', { name: 'Nghe' }).first()).toBeVisible();
        await expect(panel.getByRole('button', { name: 'Ghi âm câu hỏi' })).toBeVisible();

        await expectNoProblems(problems);
    });
});
