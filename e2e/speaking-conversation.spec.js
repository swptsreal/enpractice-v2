import { expect, test } from '@playwright/test';
import {
    collectPageProblems,
    expectNoProblems,
    expectNoRawKeyOrCrash,
    gotoWithRetry,
} from './helpers/guards.js';

/**
 * The topic conversation — screens 24 (the mode on the card), 24b (the dialogue), 24c (its
 * result) and 24d (the history with two tabs).
 *
 * IT RUNS AGAINST THE REAL BACKEND and stubs only the two speaking endpoints whose STATE this
 * suite has to control (graded vs unfinished vs hint) — everything else, including the shell,
 * the credit balance and the auth token, is real. That is why the guards run here too: a screen
 * that renders a raw key or throws during hydration fails this file as well.
 *
 * THE TURN BODY IS THE ASSERTION. The conversation sends the transcript, the duration and the
 * analytics the BROWSER can honestly measure — and must NOT send the pause or confidence fields
 * it cannot measure, because those would be printed back as facts on the result screen. Asking
 * for the request rather than asserting a count is the same rule the IELTS suite uses: React
 * StrictMode double-invokes loaders in dev, so a count would pin a development artefact.
 */
const envelope = (data) => ({ success: true, message: 'OK', data });

const PART_1_TOPIC = {
    id: 'topic-1',
    part: 'PART_1',
    question: 'Do you enjoy meeting new people?',
    difficulty: 'EASY',
    cueCard: null,
    followUpQuestions: ['How often do you meet someone new?'],
};

const PART_2_TOPIC = {
    id: 'topic-2',
    part: 'PART_2',
    question: 'Describe a book you enjoyed.',
    difficulty: 'HARD',
    cueCard: 'You should say: what it was…',
    followUpQuestions: [],
};

const PART_3_TOPIC = {
    id: 'topic-3',
    part: 'PART_3',
    question: 'Why do people value free time more today?',
    difficulty: 'MEDIUM',
    cueCard: null,
    followUpQuestions: [],
};

const page = (items) => ({
    page: 0,
    size: 20,
    totalElements: items.length,
    totalPages: 1,
    items,
});

/** One handler for the whole speaking surface, dispatching on the path rather than on glob order. */
async function stubSpeaking(page_, { start, turn, conversation, conversations = [], attempts = [] } = {}) {
    const record = { startQueries: [], turnBodies: [], ttsTexts: [] };

    /* The partner's voice comes from the TTS endpoint. Answering WITHOUT audio forces the helper's
       browser fallback, so the assertion is about the REQUEST — which sentence was asked to be
       spoken — and no audio decoding happens in the test. */
    await page_.route('**/api/tts/**', async (route) => {
        const body = route.request().postDataJSON();
        if (body?.text) record.ttsTexts.push(body.text);
        return route.fulfill({ json: envelope({ audioBase64: null, mimeType: null }) });
    });

    /* The cost table is answered here because the real one is environment-dependent: on this
       machine every action is `mode: DISABLED`, and a screen must then claim nothing about
       credit. Stubbing it ENFORCE is what makes the cost assertions below possible at all. */
    await page_.route('**/api/credits/costs*', async (route) =>
        route.fulfill({
            json: envelope([
                { actionCode: 'SPEAKING_START', cost: 1, mode: 'ENFORCE' },
                { actionCode: 'AI_CHAT', cost: 0, mode: 'DISABLED' },
            ]),
        })
    );

    await page_.route('**/api/speaking/**', async (route) => {
        const url = new URL(route.request().url());
        const path = url.pathname;
        const method = route.request().method();

        if (path.endsWith('/highest-scores')) {
            return route.fulfill({
                json: envelope([
                    {
                        topicId: 'topic-1',
                        attempted: true,
                        conversationId: 'conv-1',
                        highestBandScore: 6,
                        status: 'GRADED',
                        sourceType: 'CONVERSATION',
                        gradedAt: '2026-10-12 09:30:00',
                    },
                    { topicId: 'topic-2', attempted: false },
                ]),
            });
        }

        if (path.endsWith('/conversations/start')) {
            record.startQueries.push(url.search);
            return route.fulfill({ json: envelope(start) });
        }

        if (/\/conversations\/[^/]+\/turn$/.test(path)) {
            record.turnBodies.push(route.request().postDataJSON());
            return route.fulfill({ json: envelope(turn) });
        }

        if (path.endsWith('/conversations')) {
            return route.fulfill({ json: envelope(page(conversations)) });
        }

        if (/\/conversations\/[^/]+$/.test(path)) {
            return route.fulfill({ json: envelope(conversation) });
        }

        if (path.endsWith('/attempts')) {
            return route.fulfill({ json: envelope(page(attempts)) });
        }

        if (/\/speaking\/topics\/[^/]+$/.test(path)) {
            const id = path.split('/').pop();
            const byId = { [PART_1_TOPIC.id]: PART_1_TOPIC, [PART_2_TOPIC.id]: PART_2_TOPIC };
            return route.fulfill({ json: envelope(byId[id] ?? PART_3_TOPIC) });
        }

        if (/\/speaking\/topics\/?$/.test(path) && method === 'GET') {
            return route.fulfill({ json: envelope(page([PART_1_TOPIC, PART_2_TOPIC, PART_3_TOPIC])) });
        }

        return route.continue();
    });

    return record;
}

test.describe('the speaking topic conversation', () => {
    test('a card offers both modes, and only the press that pays claims a cost', async ({ page }) => {
        const problems = collectPageProblems(page);
        await stubSpeaking(page);

        await gotoWithRetry(page, '/speaking');
        await expect(page.getByText('Do you enjoy meeting new people?')).toBeVisible({ timeout: 20_000 });

        /* The topic that already had a conversation: no cost chip, and the band says where it
           came from. The fresh topic shows the price, because THAT press is the one that pays. */
        await expect(page.getByRole('link', { name: 'Hội thoại', exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: /Xem kết quả/ })).toBeVisible();
        await expect(page.getByRole('link', { name: /Hội thoại · -1 credit/ })).toBeVisible();

        /* The cue-card topic has no follow-ups, so it offers no conversation at all: of the three
           cards, two carry a conversation action (the paid topic and the fresh one) and all three
           carry practice. Counted by href, because the rail's own "Hội thoại tự chọn" entry
           matches the same words. */
        await expect(page.locator('a[href^="/speaking/conversation/"]')).toHaveCount(3);
        await expect(page.locator('a[href^="/speaking/practice/"]')).toHaveCount(3);
        await expect(page.getByRole('link', { name: 'Hội thoại', exact: true })).toHaveCount(1);
        await expect(page.getByRole('link', { name: /Hội thoại · -1 credit/ })).toHaveCount(1);

        /* The credit rule is stated before any press, for both modes. */
        await expect(page.getByText(/Mỗi chủ đề chỉ trừ một lần cho mỗi chế độ/)).toBeVisible();

        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('a turn sends the transcript, the duration, and only the analytics the browser can measure', async ({
        page,
    }) => {
        const problems = collectPageProblems(page);
        const record = await stubSpeaking(page, {
            start: {
                conversationId: 'conv-1',
                turnNumber: 1,
                aiQuestion: 'Do you enjoy meeting new people?',
                turnType: 'QUESTION',
                lastTurn: false,
                conversationComplete: false,
            },
            turn: {
                conversationId: 'conv-1',
                turnNumber: 2,
                aiQuestion: 'Try talking about how often you meet people.',
                turnType: 'HINT',
                lastTurn: true,
                conversationComplete: false,
            },
        });

        await gotoWithRetry(page, '/speaking/conversation/topic-1');
        await expect(page.getByText('Câu 1 / 2', { exact: true })).toBeVisible({ timeout: 20_000 });

        /* The start request carries the topic it started from. Polled rather than read once: the
           panel draws as soon as the TOPIC is loaded, which can be a beat before the start
           request is intercepted. */
        await expect.poll(() => record.startQueries.length, { timeout: 20_000 }).toBeGreaterThan(0);
        expect(record.startQueries[0]).toContain('topicId=topic-1');

        /* Speak, stop, correct, send. */
        await page.getByRole('button', { name: 'Ghi âm câu trả lời' }).click();
        await expect(page.getByRole('timer')).toBeVisible();
        await page.getByRole('button', { name: 'Dừng và gửi' }).click();

        const transcript = 'Yes, I enjoy meeting new people at work.';
        await page.getByRole('textbox').fill(transcript);
        await page.getByRole('button', { name: 'Gửi câu trả lời' }).click();

        await expect
            .poll(() => record.turnBodies.length, { timeout: 20_000 })
            .toBeGreaterThan(0);

        for (const body of record.turnBodies) {
            expect(body.transcript).toBe(transcript);
            expect(typeof body.timeSpentSeconds).toBe('number');
            expect(body.speechAnalytics.wordCount).toBe(8);
            /* 8 words over N seconds is a real measurement; the fields the browser cannot know
               must be absent rather than filled with a plausible number. */
            expect(body.speechAnalytics).not.toHaveProperty('avgPauseDurationMs');
            expect(body.speechAnalytics).not.toHaveProperty('longPauseCount');
            expect(body.speechAnalytics).not.toHaveProperty('avgWordConfidence');
            expect(body.speechAnalytics).not.toHaveProperty('lowConfidenceWords');
        }

        /* The hint was returned as a HINT turn: it is drawn as a hint, and it does NOT advance the
           question counter (the backend keeps the same follow-up index), so the learner is still
           on question 1 while being nudged — which is exactly what the backend's own counting
           does. The final-question label comes from the response's `lastTurn`. */
        await expect(page.getByText('Gợi ý')).toBeVisible();
        await expect(page.getByRole('button', { name: /Trả lời câu cuối/ })).toBeVisible();
        await expect(page.getByText(/^Câu 1 \/ 2/)).toBeVisible();

        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('the dialogue is a chat surface: one viewport, log scrolls inside, controls docked', async ({
        page,
    }) => {
        const problems = collectPageProblems(page);
        /* A resume with many paired turns, so the log has something real to scroll: no microphone
           involved, and 20 exchanges overflow every viewport this suite runs at. */
        await stubSpeaking(page, {
            conversation: {
                id: 'conv-9',
                topicId: 'topic-1',
                topicPart: 'PART_1',
                status: 'IN_PROGRESS',
                turns: Array.from({ length: 20 }, (_, i) => ({
                    id: `t${i + 1}`,
                    turnNumber: i + 1,
                    aiQuestion: `Question number ${i + 1}: what do you think about the way people spend their free time in your country?`,
                    userTranscript:
                        i < 19
                            ? `Answer number ${i + 1}: I usually spend it with my family, and we often go out together at the weekend.`
                            : null,
                    turnType: 'QUESTION',
                    speechAnalytics: { wordCount: 17, wordsPerMinute: 120 },
                })),
            },
        });

        const viewport = page.viewportSize();
        await gotoWithRetry(page, '/speaking/conversation/resume/conv-9');
        await expect(page.getByText(/Question number 20/)).toBeAttached({ timeout: 20_000 });

        /* NO CHROME: it is a focused surface, so neither the rail nor the phone tab bar is drawn. */
        await expect(page.getByRole('navigation', { name: /Điều hướng chính/ })).toHaveCount(0);

        /* THE PAGE DOES NOT SCROLL — the log does. That is the whole point of the redesign: a long
           conversation must not be able to push the controls out of reach. */
        const geometry = await page.evaluate(() => {
            const log = document.querySelector('[aria-live="polite"]');
            const de = document.documentElement;
            const panelButton = [...document.querySelectorAll('button')].find((b) =>
                /Ghi âm câu trả lời|Trả lời câu cuối/.test(b.textContent ?? '')
            );
            const box = panelButton?.getBoundingClientRect();
            return {
                pageScrolls: de.scrollHeight > window.innerHeight + 2,
                logScrolls: log ? log.scrollHeight > log.clientHeight + 2 : false,
                logAtBottom: log ? log.scrollTop + log.clientHeight >= log.scrollHeight - 4 : false,
                buttonVisible: box ? box.top >= 0 && box.bottom <= window.innerHeight + 1 : false,
            };
        });

        expect(geometry.pageScrolls, 'the page must not scroll — the log does').toBe(false);
        expect(geometry.logScrolls, 'the log must be the scrollport').toBe(true);
        /* The log follows the newest turn rather than leaving the learner to hunt for it. */
        expect(geometry.logAtBottom, 'the log must be at its newest turn').toBe(true);
        /* And the docked control is inside the viewport, not below the fold. */
        expect(geometry.buttonVisible, 'the answer control must be inside the viewport').toBe(true);
        expect(viewport.height).toBeGreaterThan(0);

        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('the question is read aloud, and the replay control is a new request', async ({ page }) => {
        const problems = collectPageProblems(page);
        const record = await stubSpeaking(page, {
            start: {
                conversationId: 'conv-1',
                turnNumber: 1,
                aiQuestion: 'Do you enjoy meeting new people?',
                turnType: 'QUESTION',
                lastTurn: false,
                conversationComplete: false,
            },
        });

        await gotoWithRetry(page, '/speaking/conversation/topic-1');

        /* A conversation is a listening task as much as a speaking one: the partner asks OUT LOUD
           the moment the question appears, not only when a button is pressed. */
        await expect.poll(() => record.ttsTexts.length, { timeout: 20_000 }).toBeGreaterThan(0);
        expect(record.ttsTexts[0]).toBe('Do you enjoy meeting new people?');

        /* And the replay control asks again rather than replaying a cached clip — which is only
           true while the button is idle, so wait for the "playing" state to clear first. */
        await expect(page.getByRole('button', { name: 'Nghe lại câu hỏi' })).toBeEnabled();
        await page.getByRole('button', { name: 'Nghe lại câu hỏi' }).click();
        await expect.poll(() => record.ttsTexts.length, { timeout: 20_000 }).toBeGreaterThan(1);
        expect(record.ttsTexts.at(-1)).toBe('Do you enjoy meeting new people?');

        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('an unfinished conversation opens the dialogue rather than a result', async ({ page }) => {
        const problems = collectPageProblems(page);
        await stubSpeaking(page, {
            conversation: {
                id: 'conv-1',
                topicId: 'topic-1',
                topicPart: 'PART_1',
                status: 'IN_PROGRESS',
                turns: [
                    {
                        id: 't1',
                        turnNumber: 1,
                        aiQuestion: 'Do you enjoy meeting new people?',
                        userTranscript: 'Yes, I do.',
                        turnType: 'QUESTION',
                        speechAnalytics: { wordCount: 3, wordsPerMinute: 120 },
                    },
                ],
            },
        });

        await gotoWithRetry(page, '/speaking/conversation/resume/conv-1');

        /* The seeded turn is rendered, and the screen says continuing costs nothing. */
        await expect(page.getByText('Yes, I do.')).toBeVisible({ timeout: 20_000 });
        await expect(page.getByText(/không trừ thêm credit/)).toBeVisible();
        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('a graded conversation shows its band, four criteria and the dialogue', async ({ page }) => {
        const problems = collectPageProblems(page);
        await stubSpeaking(page, {
            conversation: {
                id: 'conv-1',
                topicId: 'topic-1',
                topicQuestion: 'Do you enjoy meeting new people?',
                topicPart: 'PART_1',
                status: 'GRADED',
                totalTurns: 2,
                timeSpentSeconds: 192,
                fluencyScore: 6.5,
                lexicalScore: 6,
                grammarScore: 5.5,
                pronunciationScore: 6,
                overallBandScore: 6,
                aiFeedback: '## Điểm mạnh\n\n- Trả lời đúng trọng tâm.',
                turns: [
                    {
                        id: 't1',
                        turnNumber: 1,
                        aiQuestion: 'Do you enjoy meeting new people?',
                        userTranscript: 'I meet new people at work, and I meet clients every week.',
                        turnType: 'QUESTION',
                        speechAnalytics: { wordCount: 12, wordsPerMinute: 142 },
                    },
                    {
                        id: 't2',
                        turnNumber: 2,
                        aiQuestion: 'How often do you meet someone new?',
                        userTranscript: 'Maybe once a week.',
                        turnType: 'QUESTION',
                        speechAnalytics: { wordCount: 4, wordsPerMinute: 110 },
                    },
                ],
            },
        });

        await gotoWithRetry(page, '/speaking/conversation/result/conv-1');

        await expect(page.getByText('Band hội thoại')).toBeVisible({ timeout: 20_000 });
        await expect(page.getByText('2 lượt · 3 phút 12 giây')).toBeVisible();
        /* The criteria read as the locale names them, not as a shortened English label. */
        await expect(page.getByText('Độ trôi chảy (Fluency)')).toBeVisible();
        await expect(page.getByText('Phát âm (Pronunciation)')).toBeVisible();
        /* The transcript is a dialogue with each answer's own measurements. */
        await expect(page.getByText('Bạn trả lời')).toHaveCount(2);
        await expect(page.getByText('12 từ')).toBeVisible();
        await expect(page.getByText('142 từ/phút')).toBeVisible();
        /* "meet"/"people" repeat across the two answers, and a repeated word is highlighted —
           marking is the visible evidence, not a colour alone. */
        await expect(page.locator('mark').first()).toBeVisible();
        await expect(page.getByText(/nhận dạng giọng nói có thể nghe sai/)).toBeVisible();

        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('the history separates the two modes into two tabs, and the tab is a URL', async ({ page }) => {
        const problems = collectPageProblems(page);
        await stubSpeaking(page, {
            attempts: [
                {
                    id: 'att-1',
                    topicQuestion: 'Talk about a prize you received',
                    topicPart: 'PART_2',
                    status: 'GRADED',
                    overallBandScore: 5.5,
                    timeSpentSeconds: 120,
                    submittedAt: '2026-10-12 09:30:00',
                },
            ],
            conversations: [
                {
                    id: 'conv-1',
                    topicQuestion: 'Do you enjoy meeting new people?',
                    topicPart: 'PART_1',
                    status: 'GRADED',
                    overallBandScore: 6,
                    totalTurns: 3,
                    startedAt: '2026-10-12 10:00:00',
                },
                {
                    id: 'conv-2',
                    topicQuestion: 'What do you usually do at the weekend?',
                    topicPart: 'PART_1',
                    status: 'IN_PROGRESS',
                    overallBandScore: null,
                    totalTurns: 2,
                    startedAt: '2026-10-13 10:00:00',
                },
            ],
        });

        await gotoWithRetry(page, '/speaking/attempts');

        /* Tab one: the practice attempts, and NOT the conversations. */
        await expect(page.getByText('Talk about a prize you received')).toBeVisible({ timeout: 20_000 });
        await expect(page.getByText('Do you enjoy meeting new people?')).toHaveCount(0);

        await page.getByRole('tab', { name: 'Hội thoại' }).click();

        await expect(page).toHaveURL(/tab=conversation/);
        await expect(page.getByText('Do you enjoy meeting new people?')).toBeVisible();
        /* An unfinished conversation is a continuation, not a result. */
        const resume = page.getByRole('link', { name: /Tiếp tục/ });
        await expect(resume).toHaveAttribute('href', '/speaking/conversation/resume/conv-2');

        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });
});
