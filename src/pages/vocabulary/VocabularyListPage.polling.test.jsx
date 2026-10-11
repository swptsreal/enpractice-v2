import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
/* `act` comes from React itself: vitest does not re-export it, and React 19 does. */
import { StrictMode, act } from 'react';

/**
 * The vocabulary list POLLS while a test is still being generated, and the poll
 * used to leak.
 *
 * The report was "bấm +5 -> loop api /api/vocabulary-tests", and the cause was not
 * the usual suspect (a dependency recreated on every render — the counters below
 * show the call count does NOT grow with renders). It was the loop's own
 * self-scheduling:
 *
 *   - a pass resolved AFTER the screen unmounted and armed a new timer, which the
 *     cleanup had already run past and could no longer clear;
 *   - under StrictMode (`main.jsx` mounts the app in StrictMode) the mount effect
 *     runs twice, both passes resolved, and the second `timer.current = …`
 *     overwrote the first timer id — so one timer was ALWAYS uncancellable;
 *   - and this backend can leave a test in `PENDING`/`GENERATING` indefinitely,
 *     so the surviving chain never found a settled status and never stopped.
 *
 * Measured before the fix, with a PENDING test: 2 requests per 3s while mounted
 * (two chains) and 10 further requests in the 30s AFTER unmount. These tests pin
 * the fixed behaviour: one chain, no requests after unmount, and a bounded budget.
 */
const getTests = vi.fn();
const generateTest = vi.fn();

vi.mock('../../api', () => ({
    vocabularyTestApi: {
        getTests: (...a) => getTests(...a),
        generateTest: (...a) => generateTest(...a),
        getAttempts: vi.fn(),
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

beforeAll(async () => {
    await i18nReady;
});

beforeEach(() => {
    vi.clearAllMocks();
    /* Time is the axis under test, so it is simulated in every case here. */
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

/** `PageResponse` is `{page,size,totalElements,totalPages,items}`. */
function pageOf(items) {
    return {
        data: {
            success: true,
            message: 'OK',
            data: { page: 0, size: 12, totalElements: items.length, totalPages: 1, items },
        },
    };
}

/** A test the backend is still working on — the state that keeps a poll alive. */
const PENDING_TEST = {
    testId: 't1',
    title: 'Education vocabulary',
    status: 'PENDING',
    questionCount: 5,
    estimatedMinutes: 5,
    attemptCount: 0,
    latestAccuracyPercent: null,
};

function renderList({ strict = false } = {}) {
    const tree = (
        <MemoryRouter initialEntries={['/vocabulary']}>
            <VocabularyListPage />
        </MemoryRouter>
    );
    return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
}

/** Let the mount load settle, then let `ms` of polling elapse. */
async function elapse(ms) {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
    });
}

describe('VocabularyListPage — the poll does not multiply', () => {
    it('does not call the API again when the screen merely re-renders', async () => {
        /* The count must be a function of TIME, not of renders: this is the
           assertion that tells a stable dependency apart from a per-render one
           (`useVocabularyTestList` gets `page`/`size` as primitives, so its loader
           and its effect identity are stable). */
        getTests.mockResolvedValue(pageOf([PENDING_TEST]));
        const { rerender } = renderList();
        await elapse(50);

        const afterMount = getTests.mock.calls.length;
        expect(afterMount).toBeGreaterThan(0);

        for (let i = 0; i < 6; i += 1) {
            rerender(
                <MemoryRouter initialEntries={['/vocabulary']}>
                    <VocabularyListPage />
                </MemoryRouter>
            );
        }
        await elapse(50);

        expect(getTests.mock.calls.length).toBe(afterMount);
    });

    it('keeps ONE polling chain under StrictMode, not two', async () => {
        /* StrictMode runs the mount effect twice. Before the fix both passes armed
           a timer and one of them could never be cleared, so the screen made two
           requests every 3 seconds. */
        getTests.mockResolvedValue(pageOf([PENDING_TEST]));
        renderList({ strict: true });
        await elapse(50);

        const afterMount = getTests.mock.calls.length;
        await elapse(3100);
        const afterOneInterval = getTests.mock.calls.length;
        await elapse(3100);
        const afterTwoIntervals = getTests.mock.calls.length;

        // one request per interval, no matter how many passes StrictMode started
        expect(afterOneInterval - afterMount).toBe(1);
        expect(afterTwoIntervals - afterOneInterval).toBe(1);
    });

    it('STOPS polling when the screen unmounts', async () => {
        /* The reported symptom. An in-flight pass used to arm a new timer after the
           cleanup had already run, so the requests continued on every other screen
           the user navigated to. */
        getTests.mockResolvedValue(pageOf([PENDING_TEST]));
        const { unmount } = renderList({ strict: true });
        await elapse(50);
        await elapse(3100);

        const before = getTests.mock.calls.length;
        expect(before).toBeGreaterThan(1);

        unmount();
        await elapse(30000);

        expect(getTests.mock.calls.length).toBe(before);
    });

    it('stops on its own after a bounded number of passes, and the refresh button re-arms it', async () => {
        /* A PENDING test never settles on this backend, and the poll must not be a
           permanent 3-second heartbeat. It gives up; the screen's own refresh
           button starts it again. */
        getTests.mockResolvedValue(pageOf([PENDING_TEST]));
        renderList();
        await elapse(50);

        // three minutes of simulated time is far more than the budget allows
        await elapse(180000);
        const capped = getTests.mock.calls.length;
        expect(capped).toBeLessThanOrEqual(25);

        await elapse(60000);
        expect(getTests.mock.calls.length).toBe(capped);

        fireEvent.click(screen.getByRole('button', { name: /thử lại/i }));
        await elapse(50);
        expect(getTests.mock.calls.length).toBe(capped + 1);
    });

    it('makes no further requests once nothing is generating', async () => {
        getTests.mockResolvedValue(pageOf([{ ...PENDING_TEST, status: 'READY' }]));
        renderList();
        await elapse(50);

        const afterMount = getTests.mock.calls.length;
        await elapse(30000);

        expect(getTests.mock.calls.length).toBe(afterMount);
        expect(screen.getByText('Sẵn sàng')).toBeInTheDocument();
    });
});
