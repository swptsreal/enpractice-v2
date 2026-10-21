import { expect, test } from '@playwright/test';
import {
    collectPageProblems,
    expectBodyHasContent,
    expectNoErrorOverlay,
    expectNoProblems,
    expectNoRawKeyOrCrash,
    gotoWithRetry,
} from './helpers/guards.js';

/**
 * Custom speaking — screens 27, 27b, 27c, 27d and 27e.
 *
 * IT RUNS AGAINST THE REAL SHELL AND STUBS THE MODULE'S OWN ENDPOINTS, because the state under
 * test (a saved template, an unfinished conversation, a graded one) is not something a test can
 * create without spending credits and waiting for the model. Everything else — auth, routing,
 * credit balance, i18n — is real, and the guards run here too.
 *
 * THE FIRST TEST IS THE REPORTED DEFECT. "History" opened `/speaking`, the topic list, because the
 * only link labelled "Các lượt đã làm" on the custom-speaking screen pointed there and no
 * custom-speaking history route existed. The assertion is on the link's target, not on the label,
 * because the label was always right.
 *
 * THE START BODY IS THE OTHER ASSERTION. A template carries all six fields the API requires, so
 * pressing "Bắt đầu" must send all six; a screen that sent only the topic would start a different
 * conversation from the one the card promised.
 */
const envelope = (data) => ({ success: true, message: 'OK', data });

const TEMPLATES = [
    {
        id: 'mine-1',
        source: 'USER',
        group: 'DAILY',
        level: 'B2',
        title: 'Phỏng vấn ở công ty công nghệ',
        summary: null,
        topic: 'A job interview at a software company: your projects, teamwork, and why you want this role.',
        style: 'PROFESSIONAL',
        personality: 'CONFIDENT',
        expertise: 'BUSINESS',
        voiceName: 'US_NEURAL_J',
        gradingEnabled: true,
    },
    {
        id: 'sys-1',
        source: 'SYSTEM',
        group: 'IELTS',
        level: 'B1',
        title: 'Nơi bạn lớn lên',
        summary: 'Nơi lớn lên, điều bạn thích và cách nơi đó đã thay đổi.',
        topic: 'IELTS Speaking Part 1: your hometown.',
        style: 'CASUAL',
        personality: 'FRIENDLY',
        expertise: 'EDUCATION',
        voiceName: 'US_NEURAL_F',
        gradingEnabled: true,
    },
];

const step = (over = {}) => ({
    conversationId: 'c1',
    title: 'A tech interview',
    turnNumber: 1,
    aiMessage: 'Tell me about a project you are proud of.',
    conversationComplete: false,
    gradingEnabled: true,
    status: 'IN_PROGRESS',
    userTurnCount: 0,
    maxUserTurns: 50,
    voiceName: 'US_NEURAL_J',
    ...over,
});

const inProgress = () => ({
    id: 'c1',
    title: 'A tech interview',
    topic: 'A job interview at a software company',
    style: 'PROFESSIONAL',
    personality: 'CONFIDENT',
    expertise: 'BUSINESS',
    voiceName: 'US_NEURAL_J',
    gradingEnabled: true,
    status: 'IN_PROGRESS',
    maxUserTurns: 50,
    userTurnCount: 1,
    totalTurns: 3,
    turns: [
        {
            id: 'turn-1',
            turnNumber: 1,
            aiMessage: 'Tell me about a project you are proud of.',
            userTranscript: 'I built a small study app.',
        },
        {
            id: 'turn-2',
            turnNumber: 2,
            aiMessage: 'What was the hardest part?',
            userTranscript: null,
        },
    ],
});

const graded = () => ({
    id: 'c2',
    title: 'Talking about sustainable travel',
    topic: 'sustainable travel',
    style: 'CASUAL',
    personality: 'PATIENT',
    expertise: 'TRAVEL',
    voiceName: 'US_NEURAL_F',
    gradingEnabled: true,
    status: 'GRADED',
    maxUserTurns: 50,
    userTurnCount: 4,
    totalTurns: 9,
    timeSpentSeconds: 300,
    fluencyScore: 6,
    vocabularyScore: 6.5,
    coherenceScore: 5.5,
    pronunciationScore: 6,
    overallScore: 6,
    aiFeedback: '## Feedback\n\n**Good range.**',
    completedAt: '2026-10-12T10:00:00Z',
    turns: [
        {
            id: 'turn-1',
            turnNumber: 1,
            aiMessage: 'What does sustainable travel mean to you?',
            userTranscript: 'Travelling without damaging the place.',
        },
    ],
});

async function stubCustomSpeaking(page, state) {
    await page.route('**/api/credits/costs*', (route) =>
        route.fulfill({
            json: envelope([{ actionCode: 'SPEAKING_START', cost: 1, mode: 'ENFORCE' }]),
        })
    );

    await page.route('**/api/custom-speaking-templates**', async (route) => {
        const request = route.request();
        const method = request.method();
        const pathname = new URL(request.url()).pathname;

        if (method === 'GET' && /\/custom-speaking-templates\/[^/]+$/.test(pathname)) {
            const id = pathname.split('/').pop();
            return route.fulfill({ json: envelope(TEMPLATES.find((item) => item.id === id) ?? TEMPLATES[1]) });
        }
        if (method === 'GET') {
            return route.fulfill({ json: envelope(TEMPLATES) });
        }
        if (method === 'POST') {
            state.created = request.postDataJSON();
            return route.fulfill({
                json: envelope({
                    ...TEMPLATES[0],
                    id: 'mine-2',
                    title: state.created.title,
                    topic: state.created.topic,
                }),
            });
        }
        if (method === 'DELETE') {
            return route.fulfill({ json: envelope(null) });
        }
        return route.fulfill({ json: envelope(null) });
    });

    await page.route('**/api/custom-speaking-conversations**', async (route) => {
        const request = route.request();
        const method = request.method();
        const pathname = new URL(request.url()).pathname;

        if (method === 'POST' && pathname.endsWith('/start')) {
            state.startBody = request.postDataJSON();
            return route.fulfill({ json: envelope(step()) });
        }
        if (method === 'POST' && pathname.endsWith('/turn')) {
            state.turnBody = request.postDataJSON();
            return route.fulfill({
                json: envelope(
                    step({
                        turnNumber: 2,
                        aiMessage: 'That sounds like my kind of project.',
                        userTurnCount: 2,
                    })
                ),
            });
        }
        if (method === 'POST' && pathname.endsWith('/finish')) {
            state.finished = true;
            return route.fulfill({ json: envelope(step({ status: 'GRADING', conversationComplete: true })) });
        }
        if (method === 'GET' && /\/custom-speaking-conversations\/c1$/.test(pathname)) {
            return route.fulfill({
                json: envelope(
                    state.finished
                        ? { ...graded(), id: 'c1', title: 'A tech interview', topic: 'A job interview' }
                        : inProgress()
                ),
            });
        }
        if (method === 'GET' && /\/custom-speaking-conversations\/c2$/.test(pathname)) {
            return route.fulfill({ json: envelope(graded()) });
        }
        if (method === 'GET') {
            return route.fulfill({
                json: envelope({
                    page: 0,
                    size: 10,
                    totalElements: 2,
                    totalPages: 1,
                    items: [
                        {
                            id: 'c1',
                            title: 'A tech interview',
                            topic: 'A job interview at a software company',
                            style: 'PROFESSIONAL',
                            personality: 'CONFIDENT',
                            expertise: 'BUSINESS',
                            status: 'IN_PROGRESS',
                            userTurnCount: 1,
                            startedAt: '2026-10-12T10:00:00Z',
                        },
                        {
                            id: 'c2',
                            title: 'Talking about sustainable travel',
                            topic: 'sustainable travel',
                            style: 'CASUAL',
                            personality: 'PATIENT',
                            expertise: 'TRAVEL',
                            status: 'GRADED',
                            userTurnCount: 4,
                            overallScore: 6,
                            startedAt: '2026-10-11T10:00:00Z',
                        },
                    ],
                }),
            });
        }
        return route.fulfill({ json: envelope(null) });
    });
}

test.describe('custom speaking', () => {
    test('the template list sits beside the form and "Dùng" only fills it', async ({ page }) => {
        const problems = collectPageProblems(page);
        const state = {};
        await stubCustomSpeaking(page, state);
        await gotoWithRetry(page, '/custom-speaking');
        await expectBodyHasContent(page, { problems });

        await expect(page.getByRole('heading', { name: 'Chủ đề có sẵn' })).toBeVisible();
        await expect(page.getByText('Nơi bạn lớn lên')).toBeVisible();
        await expect(page.getByText('Mỗi hội thoại trừ 1 credit khi bắt đầu.')).toBeVisible();
        await expect(page.getByText(/Mỗi lượt/)).toHaveCount(0);
        /* The list opens on IELTS and there is no "everything" tab. */
        await expect(page.getByRole('button', { name: 'IELTS' })).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByRole('button', { name: 'Tất cả' })).toHaveCount(0);

        /* THE REPORTED BUG: this used to be /speaking (the topic list). */
        const history = page.getByRole('link', { name: 'Các lượt đã làm' });
        await expect(history).toHaveAttribute('href', '/custom-speaking/history');

        await page.getByRole('button', { name: 'Của tôi' }).click();
        await expect(page.getByText('Phỏng vấn ở công ty công nghệ')).toBeVisible();
        await expect(page.getByText('Nơi bạn lớn lên')).toHaveCount(0);

        /* One press fills the form; it does not start or charge. */
        await page.getByRole('button', { name: 'Dùng' }).first().click();
        await expect(page.getByPlaceholder(/du lịch bụi/)).toHaveValue(
            'A job interview at a software company: your projects, teamwork, and why you want this role.'
        );
        await expect(page.getByRole('button', { name: 'Đang dùng' })).toBeDisabled();
        expect(state.startBody).toBeUndefined();

        await expectNoErrorOverlay(page);
        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('the start button sends the configuration the template filled in', async ({ page }) => {
        const problems = collectPageProblems(page);
        const state = {};
        await stubCustomSpeaking(page, state);
        await gotoWithRetry(page, '/custom-speaking');

        await page.getByRole('button', { name: 'Dùng' }).first().click();
        await page.getByRole('button', { name: /Bắt đầu hội thoại · 1 credit/ }).click();

        await expect(page).toHaveURL(/\/custom-speaking\/conversation\/c1$/);
        await expect(page.getByText('I built a small study app.')).toBeVisible();
        await expect(page.getByText('What was the hardest part?')).toBeVisible();
        await expect(page.getByText(/Hội thoại đã trừ 1 credit khi bắt đầu/)).toBeVisible();

        expect(state.startBody).toMatchObject({
            topic: 'IELTS Speaking Part 1: your hometown.',
            style: 'CASUAL',
            personality: 'FRIENDLY',
            expertise: 'EDUCATION',
            voiceName: 'US_NEURAL_F',
            gradingEnabled: true,
        });

        await page.getByPlaceholder('Trả lời Lexi…').fill('It was the state management.');
        await page.getByRole('button', { name: /Gửi/ }).click();
        await expect(page.getByText('That sounds like my kind of project.')).toBeVisible();
        expect(state.turnBody.transcript).toBe('It was the state management.');

        await page.getByRole('button', { name: 'Kết thúc' }).click();
        await expect(page).toHaveURL(/\/custom-speaking\/c1$/);
        await expect(page.getByText('Điểm tổng')).toBeVisible();

        await expectNoErrorOverlay(page);
        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('the form keeps the price and saves a named template', async ({ page }) => {
        const problems = collectPageProblems(page);
        const state = {};
        await stubCustomSpeaking(page, state);
        await gotoWithRetry(page, '/custom-speaking');
        await expectBodyHasContent(page, { problems });

        await expect(page.getByRole('button', { name: /Bắt đầu hội thoại · 1 credit/ })).toBeDisabled();
        await expect(page.getByText('Mỗi hội thoại trừ 1 credit khi bắt đầu.')).toBeVisible();

        await page.getByPlaceholder(/du lịch bụi/).fill('A trip to the mountains');
        await page.getByText('Lưu thành template').click();
        await page.getByLabel('Tên template').fill('Chuyến đi của tôi');
        await page.getByRole('button', { name: 'Lưu' }).click();
        await expect(page.getByRole('button', { name: /Đã lưu/ })).toBeDisabled();

        expect(state.created).toMatchObject({
            title: 'Chuyến đi của tôi',
            topic: 'A trip to the mountains',
            style: 'CASUAL',
            personality: 'FRIENDLY',
            expertise: 'GENERAL',
            voiceName: 'US_NEURAL_F',
            gradingEnabled: true,
        });

        await expectNoErrorOverlay(page);
        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('history opens an unfinished conversation and a graded result', async ({ page }) => {
        const problems = collectPageProblems(page);
        const state = {};
        await stubCustomSpeaking(page, state);
        await gotoWithRetry(page, '/custom-speaking/history');
        await expectBodyHasContent(page, { problems });

        await expect(page.getByText('Đang hội thoại')).toBeVisible();
        await expect(page.getByText('6.0')).toBeVisible();

        await page.getByText('Talking about sustainable travel').click();
        await expect(page).toHaveURL(/\/custom-speaking\/c2$/);
        await expect(page.getByText('Điểm tổng')).toBeVisible();

        await page.goBack();
        await page.getByText('A tech interview').click();
        await expect(page).toHaveURL(/\/custom-speaking\/conversation\/c1$/);
        await expect(page.getByText('What was the hardest part?')).toBeVisible();

        await expectNoErrorOverlay(page);
        await expectNoRawKeyOrCrash(page);
        expectNoProblems(problems);
    });

    test('v1 history address redirects into the Speaking conversation tab', async ({ page }) => {
        await gotoWithRetry(page, '/speaking/conversation/history');
        await expect(page).toHaveURL(/\/speaking\/attempts\?tab=conversation$/);
        await expectBodyHasContent(page);
    });
});
