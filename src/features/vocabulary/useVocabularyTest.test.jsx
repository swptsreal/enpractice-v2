import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

/**
 * Reopening a finished vocabulary attempt — the regression that blanked `/vocabulary/result`.
 *
 * The hook called `vocabularyTestApi.getAttempt(attemptId)`, and no such method exists on
 * the api object (it is `getAttemptDetail`, see `src/api/vocabularyTestApi.js`). The result
 * was `TypeError: vocabularyTestApi.getAttempt is not a function` inside the effect, so the
 * screen rendered nothing at all — and the failure was invisible to the rest of the suite
 * because every other test mocks the api module with whatever shape it expects.
 *
 * The mock below therefore exposes ONLY the methods the real api object has. That is the
 * whole point: a mock that invents `getAttempt` would have hidden the bug again.
 */
const getAttemptDetail = vi.fn();

vi.mock('../../api', () => ({
    vocabularyTestApi: {
        getTests: vi.fn(),
        getTestDetail: vi.fn(),
        startTest: vi.fn(),
        submitAttempt: vi.fn(),
        getAttempts: vi.fn(),
        getAttemptDetail: (...args) => getAttemptDetail(...args),
    },
}));

const { useVocabularyAttemptResult } = await import('./useVocabularyTest');

const OK = (data) => ({ data: { success: true, message: 'OK', data } });

const ATTEMPT = {
    attemptId: 'attempt-1',
    testId: 'test-1',
    testTitle: 'Vocabulary test',
    totalQuestions: 5,
    correctCount: 4,
    accuracyPercent: 80,
    timeSpentSeconds: 120,
    results: [],
};

beforeEach(() => {
    vi.clearAllMocks();
    getAttemptDetail.mockResolvedValue(OK(ATTEMPT));
});

describe('useVocabularyAttemptResult', () => {
    it('reopens an attempt through getAttemptDetail', async () => {
        const { result } = renderHook(() => useVocabularyAttemptResult('attempt-1'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(getAttemptDetail).toHaveBeenCalledWith('attempt-1');
        expect(result.current.error).toBeNull();
        expect(result.current.result).toMatchObject({
            attemptId: 'attempt-1',
            correctCount: 4,
        });
    });

    it('does not fetch at all without an attempt id, and is not left loading', async () => {
        const { result } = renderHook(() => useVocabularyAttemptResult(undefined));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(getAttemptDetail).not.toHaveBeenCalled();
    });

    it('surfaces a failed reopen as an error rather than an empty result', async () => {
        getAttemptDetail.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }));

        const { result } = renderHook(() => useVocabularyAttemptResult('attempt-9'));

        await waitFor(() => expect(result.current.error).toBeTruthy());
        expect(result.current.result).toBeNull();
    });
});
