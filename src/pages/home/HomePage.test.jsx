import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Home reads four endpoints. Without mocking them this suite would only prove the
 * header renders — it would pass whether the data loaded or failed, which is worse
 * than no coverage because it looks like some.
 *
 * Fixtures below are the REAL payloads captured from the running backend on
 * 2026-10-11, wrappers and all. Using the true shape is the point: the first
 * implementation of Home was written against assumed field names
 * (`streakDays`, `totalXp`, `durationMinutes`) and every one of them was wrong.
 */
const getContinueLearning = vi.fn();
const getDailyLearningPlan = vi.fn();
const getProgressSnapshot = vi.fn();
const getBalance = vi.fn();

vi.mock('../../api', () => ({
    dashboardApi: {
        getContinueLearning: (...a) => getContinueLearning(...a),
        getDailyLearningPlan: (...a) => getDailyLearningPlan(...a),
        getProgressSnapshot: (...a) => getProgressSnapshot(...a),
    },
    creditApi: { getBalance: (...a) => getBalance(...a) },
    ApiError: class ApiError extends Error {
        constructor(message, status) {
            super(message);
            this.status = status;
        }
    },
}));

const { i18nReady } = await import('../../i18n');
const { default: HomePage } = await import('./HomePage');

beforeAll(async () => {
    await i18nReady;
});
beforeEach(() => vi.clearAllMocks());

function renderHome() {
    return render(
        <MemoryRouter initialEntries={['/home']}>
            <HomePage />
        </MemoryRouter>
    );
}

/* Real response shapes, verified against the backend. */
const OK = (data) => ({ data: { success: true, message: 'OK', data } });

const NEXT = OK({
    source: 'GET_STARTED',
    title: 'Bắt đầu một bài luyện ngắn',
    description: 'Chúng tôi sẽ đưa bạn vào một bài luyện nhanh để giữ nhịp học hôm nay.',
    resumeUrl: '/ielts?mode=quick&skill=LISTENING&testId=abc',
    estimatedMinutes: 5,
    reason: 'GET_STARTED',
    metadata: { module: 'IELTS', skill: 'LISTENING', testTitle: 'IELTS Academic 19 Listening Test 3' },
});

const PLAN = OK({
    date: '2026-10-11',
    goalMinutes: 30,
    items: [
        {
            id: 'a',
            type: 'VOCAB_REVIEW',
            title: 'Ôn nhanh 10 từ',
            description: 'Một phiên flashcard ngắn',
            actionUrl: '/dictionary/review?mode=quick&limit=10',
            estimatedMinutes: 4,
        },
        {
            id: 'b',
            type: 'LISTENING_MINI',
            title: 'Làm 1 mini Listening',
            estimatedMinutes: 6,
            completed: true,
        },
    ],
});

const SNAPSHOT = OK({
    targetMinutes: 30,
    studiedMinutes: 12,
    todayProgressPercent: 40,
    currentStreak: 12,
    weeklyXp: 2480,
    latestImprovementText: 'Bắt đầu một bài ngắn để mở tiến độ hôm nay.',
});

const BALANCE = OK({ availableBalance: 240, reservedBalance: 0, status: 'ACTIVE' });

function allLoaded() {
    getContinueLearning.mockResolvedValue(NEXT);
    getDailyLearningPlan.mockResolvedValue(PLAN);
    getProgressSnapshot.mockResolvedValue(SNAPSHOT);
    getBalance.mockResolvedValue(BALANCE);
}

describe('HomePage — loaded', () => {
    beforeEach(allLoaded);

    it('unwraps the envelope and shows the next lesson', async () => {
        renderHome();
        expect(await screen.findByText('Bắt đầu một bài luyện ngắn')).toBeInTheDocument();
        expect(screen.getByText('IELTS Academic 19 Listening Test 3')).toBeInTheDocument();
    });

    it('shows the improvement text from the snapshot as the greeting', async () => {
        renderHome();
        expect(
            await screen.findByText('Bắt đầu một bài ngắn để mở tiến độ hôm nay.')
        ).toBeInTheDocument();
    });

    it('renders the real stat fields, including the studied/target pair', async () => {
        renderHome();
        // currentStreak
        expect(await screen.findByText('12')).toBeInTheDocument();
        // weeklyXp, formatted through i18next (grouping depends on ICU data, so
        // assert the digits rather than the separator)
        expect(screen.getByText(/2[.,]?480/)).toBeInTheDocument();
        // studiedMinutes / targetMinutes
        expect(screen.getByText('12/30')).toBeInTheDocument();
        // credits from creditApi, not from the snapshot
        expect(screen.getByText('240')).toBeInTheDocument();
    });

    it('labels weekly XP as weekly, not as a total', async () => {
        renderHome();
        expect(await screen.findByText('XP tuần này')).toBeInTheDocument();
        expect(screen.queryByText('Tổng XP')).not.toBeInTheDocument();
    });

    it('renders one row per plan item and marks the completed one', async () => {
        renderHome();
        expect(await screen.findByText('Ôn nhanh 10 từ')).toBeInTheDocument();
        expect(screen.getByText('Làm 1 mini Listening')).toBeInTheDocument();
        expect(screen.getByText('Xong')).toBeInTheDocument();
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('never renders a fabricated estimated band', async () => {
        renderHome();
        await screen.findByText('Bắt đầu một bài luyện ngắn');
        // the dashboard has no band field, so the tile must not exist
        expect(screen.queryByText('Band ước tính')).not.toBeInTheDocument();
    });
});

describe('HomePage — empty', () => {
    it('shows an empty plan state, not an error', async () => {
        getContinueLearning.mockResolvedValue(NEXT);
        getDailyLearningPlan.mockResolvedValue(OK({ date: '2026-10-11', goalMinutes: 30, items: [] }));
        getProgressSnapshot.mockResolvedValue(SNAPSHOT);
        getBalance.mockResolvedValue(BALANCE);

        renderHome();
        expect(await screen.findByText('Hôm nay chưa có kế hoạch')).toBeInTheDocument();
        // an empty state is not a failure, so no retry alert is offered
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});

describe('HomePage — failed', () => {
    it('names a network failure and offers retry', async () => {
        const networkError = new Error('Network Error');
        getContinueLearning.mockRejectedValue(networkError);
        getDailyLearningPlan.mockRejectedValue(networkError);
        getProgressSnapshot.mockRejectedValue(networkError);
        getBalance.mockRejectedValue(networkError);

        renderHome();

        await waitFor(() => {
            expect(screen.getAllByText('Không kết nối được tới máy chủ').length).toBeGreaterThan(0);
        });
        expect(screen.getAllByText(/backend đã bật/i).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('button', { name: /thử lại/i }).length).toBeGreaterThan(0);
    });

    it('offers login rather than retry when the session expired', async () => {
        const expired = Object.assign(new Error('Unauthorized'), { status: 401 });
        getContinueLearning.mockRejectedValue(expired);
        getDailyLearningPlan.mockRejectedValue(expired);
        getProgressSnapshot.mockRejectedValue(expired);
        getBalance.mockRejectedValue(expired);

        renderHome();

        await waitFor(() => {
            expect(screen.getAllByText('Phiên đăng nhập đã hết hạn').length).toBeGreaterThan(0);
        });
        const loginLinks = screen.getAllByRole('link', { name: /đăng nhập/i });
        expect(loginLinks.some((el) => el.getAttribute('href') === '/login')).toBe(true);
    });

    it('keeps the page usable when only the plan fails', async () => {
        getContinueLearning.mockResolvedValue(NEXT);
        getDailyLearningPlan.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }));
        getProgressSnapshot.mockResolvedValue(SNAPSHOT);
        getBalance.mockResolvedValue(BALANCE);

        renderHome();

        expect(await screen.findByText('Máy chủ đang gặp sự cố')).toBeInTheDocument();
        // the next lesson and the stats still render
        expect(screen.getByText('Bắt đầu một bài luyện ngắn')).toBeInTheDocument();
        expect(screen.getByText(/2[.,]?480/)).toBeInTheDocument();
    });
});
