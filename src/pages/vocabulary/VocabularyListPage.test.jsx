import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

/**
 * The vocabulary module has three states that v1 handled badly or not at all, and
 * they are what these tests pin:
 *
 *   1. Generation is ASYNCHRONOUS. `generate` returns status GENERATING and builds
 *      the paper in the background, so the list has to show a real in-progress card
 *      rather than an empty one the user clicks into and gets nothing.
 *   2. A new account CANNOT generate at all: with no vocabulary data the backend
 *      answers 400 "Not enough vocabulary data". That is an onboarding state, not a
 *      failure, and the UI must point at the dictionary rather than offer a retry
 *      that cannot succeed.
 *   3. Answers are submitted by INDEX (`selectedOptionIndex`), not by text.
 */
const getTests = vi.fn();
const generateTest = vi.fn();
const getAttempts = vi.fn();

vi.mock('../../api', () => ({
    vocabularyTestApi: {
        getTests: (...a) => getTests(...a),
        generateTest: (...a) => generateTest(...a),
        getAttempts: (...a) => getAttempts(...a),
        startTest: vi.fn(),
        submitAttempt: vi.fn(),
        getAttemptDetail: vi.fn(),
    },
    ApiError: class ApiError extends Error {
        constructor(message, status) {
            super(message);
            this.status = status;
        }
    },
}));

const { i18nReady } = await import('../../i18n');
const { default: VocabularyListPage } = await import('./VocabularyListPage');
const { default: VocabularyHistoryPage } = await import('./VocabularyHistoryPage');

beforeAll(async () => {
    await i18nReady;
});
beforeEach(() => {
    vi.clearAllMocks();
    getAttempts.mockResolvedValue(pageOf([]));
});

/** `PageResponse` is `{page,size,totalElements,totalPages,items}`. */
function pageOf(items, extra = {}) {
    return {
        data: {
            success: true,
            message: 'OK',
            data: { page: 0, size: 12, totalElements: items.length, totalPages: 1, items, ...extra },
        },
    };
}

function renderList() {
    return render(
        <MemoryRouter initialEntries={['/vocabulary']}>
            <VocabularyListPage />
        </MemoryRouter>
    );
}

const READY_TEST = {
    testId: 't1',
    title: 'Education vocabulary',
    status: 'READY',
    questionCount: 10,
    estimatedMinutes: 8,
    attemptCount: 0,
    latestAccuracyPercent: null,
};

describe('VocabularyListPage — generation status', () => {
    it('treats PENDING as in-progress, which is the state the backend actually returns', async () => {
        /* `POST /vocabulary-tests/generate` answers 202 with status PENDING, not
           GENERATING. The first version of this hook only knew GENERATING, so it
           would never have polled and the card would have looked ready-to-play
           while the paper was still queued. */
        getTests.mockResolvedValue(pageOf([{ ...READY_TEST, status: 'PENDING', questionCount: 5 }]));
        renderList();

        expect(await screen.findByText('Đang tạo')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Education vocabulary/ })).toBeDisabled();
    });

    it('shows an in-progress card for a GENERATING test, with no play action', async () => {
        getTests.mockResolvedValue(pageOf([{ ...READY_TEST, status: 'GENERATING', questionCount: 0 }]));
        renderList();

        expect(await screen.findByText('Đang tạo')).toBeInTheDocument();
        // the action is disabled and says so, rather than starting an empty paper
        const action = screen.getByRole('button', { name: /Education vocabulary/ });
        expect(action).toBeDisabled();
        expect(action).toHaveTextContent(/chờ chút/i);
    });

    it('shows a ready card with its own labelled start action', async () => {
        getTests.mockResolvedValue(pageOf([READY_TEST]));
        renderList();

        expect(await screen.findByText('Sẵn sàng')).toBeInTheDocument();
        const action = screen.getByRole('button', { name: /^Bắt đầu: Education vocabulary$/ });
        expect(action).toBeEnabled();
    });

    it('shows a failed card distinctly from a ready one', async () => {
        getTests.mockResolvedValue(pageOf([{ ...READY_TEST, status: 'FAILED' }]));
        renderList();
        expect(await screen.findByText('Tạo lỗi')).toBeInTheDocument();
    });
});

describe('VocabularyListPage — empty and error', () => {
    it('shows an empty state with a build action, not an error', async () => {
        getTests.mockResolvedValue(pageOf([]));
        renderList();

        expect(await screen.findByText('Chưa có bài test nào')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('turns "not enough vocabulary data" into a dictionary prompt, not a retry', async () => {
        getTests.mockResolvedValue(pageOf([]));
        generateTest.mockRejectedValue(
            Object.assign(new Error('Not enough vocabulary data to generate the requested test'), { status: 400 })
        );

        const user = userEvent.setup();
        const { container } = renderList();

        // press one of the build buttons
        const build = await screen.findByRole('button', { name: /10 câu/ });
        await user.click(build);

        await waitFor(() => {
            expect(screen.getByText('Chưa đủ dữ liệu để tạo bài test')).toBeInTheDocument();
        });
        // points at the notebook, and the copy explains that tests come from your words
        expect(screen.getByText(/được tạo từ vốn từ của bạn/i)).toBeInTheDocument();
        const dictLinks = screen.getAllByRole('link', { name: /sổ tay từ vựng/i });
        expect(dictLinks.some((a) => a.getAttribute('href') === '/dictionary')).toBe(true);
        expect(container).toBeTruthy();
    });

    it('treats any other generate failure as a generic problem', async () => {
        getTests.mockResolvedValue(pageOf([]));
        generateTest.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }));

        const user = userEvent.setup();
        renderList();
        await user.click(await screen.findByRole('button', { name: /10 câu/ }));

        await waitFor(() => {
            expect(screen.getByText('Đã có lỗi xảy ra')).toBeInTheDocument();
        });
        expect(screen.queryByText('Chưa đủ dữ liệu để tạo bài test')).not.toBeInTheDocument();
    });

    it('stays on list page after generating a test instead of navigating away', async () => {
        getTests.mockResolvedValue(pageOf([READY_TEST]));
        generateTest.mockResolvedValue({
            data: {
                success: true,
                message: 'OK',
                data: { testId: 't2', status: 'PENDING', createdAt: new Date().toISOString() },
            },
        });

        const user = userEvent.setup();
        renderList();

        expect(await screen.findByText('Sẵn sàng')).toBeInTheDocument();

        const btn5 = screen.getByRole('button', { name: /5 câu/i });
        await user.click(btn5);

        await waitFor(() => {
            expect(generateTest).toHaveBeenCalledWith(
                expect.objectContaining({ questionCount: 5 })
            );
        });

        expect(screen.getByText('Tạo bài test mới')).toBeInTheDocument();
    });

    it('renders "New" tag when test is created within 24 hours and not completed', async () => {
        const recentIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        getTests.mockResolvedValue(
            pageOf([
                {
                    ...READY_TEST,
                    testId: 'recent-uncompleted',
                    title: 'Recent uncompleted',
                    createdAt: recentIso,
                    attemptCount: 0,
                    latestAccuracyPercent: null,
                    latestAttemptStatus: null,
                },
            ])
        );

        renderList();
        expect(await screen.findByText('New')).toBeInTheDocument();
    });

    it('does NOT render "New" tag when test is completed or older than 24 hours', async () => {
        const recentIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const oldIso = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        getTests.mockResolvedValue(
            pageOf([
                {
                    ...READY_TEST,
                    testId: 'recent-completed',
                    title: 'Recent completed',
                    createdAt: recentIso,
                    attemptCount: 1,
                    latestAccuracyPercent: 90,
                    latestAttemptStatus: 'COMPLETED',
                },
                {
                    ...READY_TEST,
                    testId: 'old-uncompleted',
                    title: 'Old uncompleted',
                    createdAt: oldIso,
                    attemptCount: 0,
                    latestAccuracyPercent: null,
                    latestAttemptStatus: null,
                },
            ])
        );

        renderList();
        await screen.findByText('Recent completed');
        expect(screen.queryByText('New')).not.toBeInTheDocument();
    });
});

describe('VocabularyHistoryPage — the mobile table fix', () => {
    it('renders attempts as rows, not a horizontally scrolling table', async () => {
        getAttempts.mockResolvedValue(
            pageOf([
                {
                    attemptId: 'a1',
                    testTitle: 'Education vocabulary',
                    totalQuestions: 10,
                    correctCount: 8,
                    accuracyPercent: 80,
                    status: 'COMPLETED',
                    completedAt: '2026-10-11',
                },
            ])
        );

        const { container } = render(
            <MemoryRouter initialEntries={['/vocabulary/history']}>
                <VocabularyHistoryPage />
            </MemoryRouter>
        );

        expect(await screen.findByText('Education vocabulary')).toBeInTheDocument();
        // there must be no <table> at all: a hidden table is still a table to AT
        expect(container.querySelector('table')).toBeNull();
        // and each attempt links to its reopenable result
        const link = screen.getByRole('link', { name: /Education vocabulary/ });
        expect(link.getAttribute('href')).toBe('/vocabulary/result?attemptId=a1');
    });

    it('shows an empty state before the first attempt', async () => {
        getAttempts.mockResolvedValue(pageOf([]));
        render(
            <MemoryRouter initialEntries={['/vocabulary/history']}>
                <VocabularyHistoryPage />
            </MemoryRouter>
        );
        expect(await screen.findByText('Chưa có lần làm bài nào')).toBeInTheDocument();
    });
});
