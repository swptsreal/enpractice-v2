import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * IELTS test detail and attempt history.
 *
 * The two rules these screens exist to hold:
 *
 *  17 — **the credit cost is shown WITH the balance before starting**, and the Listening
 *  transcript policy is stated UP FRONT. The design calls the policy out specifically
 *  because in v1 it exists in the code but is only discovered after submission.
 *
 *  20 — **the band chart has an accessible name describing its series**, and empty weeks
 *  are ABSENT rather than plotted at zero. A zero column would state "scored band 0 this
 *  week", which is a different and false claim.
 */
const getTestById = vi.fn();
const getPracticeOptions = vi.fn();
const getAttempts = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    ieltsApi: {
        getTestById: (...a) => getTestById(...a),
        getPracticeOptions: (...a) => getPracticeOptions(...a),
        getAttempts: (...a) => getAttempts(...a),
        getTestByIdRaw: vi.fn(),
    },
}));

vi.mock('../../contexts/CreditContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return {
        default: Stub,
        useCredit: () => ({ getCost: () => ({ cost: 2, mode: 'ENFORCE' }), availableBalance: 20 }),
    };
});

const { i18nReady } = await import('../../i18n');
const { default: IeltsTestDetailPage } = await import('./IeltsTestDetailPage');
const { default: IeltsHistoryPage } = await import('./IeltsHistoryPage');
const { buildBandSeries, weekKeyOf } = await import('../../features/ielts/useIeltsDetail');

beforeAll(async () => {
    await i18nReady;
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });
const page = (items) => envelope({ page: 0, size: 30, totalElements: items.length, totalPages: 1, items });

/** A listening paper with four sections, matching the real shape. */
const LISTENING_TEST = {
    id: 't1',
    title: 'IELTS Academic 19 Listening Test 3',
    skill: 'LISTENING',
    timeLimitMinutes: 40,
    difficulty: null,
    sections: [
        {
            id: 's1',
            sectionOrder: 1,
            title: 'Section 1',
            audioUrl: 'https://example.test/a1.mp3',
            transcript: 'the transcript text',
            passages: [
                {
                    id: 'p1',
                    passageOrder: 1,
                    title: 'Questions 1-10',
                    questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
                },
            ],
        },
        {
            id: 's2',
            sectionOrder: 2,
            title: 'Section 2',
            audioUrl: 'https://example.test/a2.mp3',
            transcript: null,
            passages: [{ id: 'p2', passageOrder: 1, title: 'Questions 11-20', questions: [{ id: 'q4' }, { id: 'q5' }] }],
        },
    ],
};

/** A reading paper with no audio, so the transcript notice must NOT appear. */
const READING_TEST = {
    ...LISTENING_TEST,
    id: 't2',
    title: 'IELTS Academic 19 Reading Test 3',
    skill: 'READING',
    sections: [{ id: 's1', sectionOrder: 1, title: 'Passage 1', audioUrl: null, transcript: null, passages: [{ id: 'p1', questionCount: 0, questions: [{ id: 'q1' }] }] }],
};

function renderDetail() {
    return render(
        <MemoryRouter initialEntries={['/ielts/test/t1']}>
            <Routes>
                <Route path="/ielts/test/:testId" element={<IeltsTestDetailPage />} />
            </Routes>
        </MemoryRouter>
    );
}

function renderHistory() {
    return render(
        <MemoryRouter>
            <IeltsHistoryPage />
        </MemoryRouter>
    );
}

beforeAll(() => {
    getPracticeOptions.mockResolvedValue(envelope(null));
});

describe('weekKeyOf / buildBandSeries — the chart data', () => {
    it('labels weeks as ISO week numbers, derived from the attempt timestamp', () => {
        expect(weekKeyOf('2026-10-11T12:00:00Z')).toMatch(/^2026-W\d{2}$/);
        expect(weekKeyOf(null)).toBeNull();
        expect(weekKeyOf('not-a-date')).toBeNull();
    });

    it('keeps the BEST band per week and skill, not the last', () => {
        /* The chart answers "how did this week go", not "what was the last attempt". */
        const series = buildBandSeries([
            { skill: 'LISTENING', bandScore: 5, completedAt: '2026-10-06T10:00:00Z' },
            { skill: 'LISTENING', bandScore: 7, completedAt: '2026-10-08T10:00:00Z' },
            { skill: 'LISTENING', bandScore: 6, completedAt: '2026-10-09T10:00:00Z' },
        ]);
        expect(series).toHaveLength(1);
        expect(series[0].LISTENING).toBe(7);
    });

    it('OMITS a week with no attempt rather than plotting zero', () => {
        /* A zero column would claim the user scored band 0 that week. */
        const series = buildBandSeries([
            { skill: 'LISTENING', bandScore: 6, completedAt: '2026-09-01T10:00:00Z' },
            { skill: 'LISTENING', bandScore: 7, completedAt: '2026-10-01T10:00:00Z' },
        ]);
        expect(series).toHaveLength(2);
        /* and there is no filler week in between */
        expect(series.every((point) => point.LISTENING != null || point.READING != null)).toBe(true);
    });

    it('skips an attempt with no band, so an ungraded row cannot become a zero bar', () => {
        const series = buildBandSeries([{ skill: 'LISTENING', bandScore: null, completedAt: '2026-10-06T10:00:00Z' }]);
        expect(series).toHaveLength(0);
    });

    it('sorts oldest first, so the chart reads left to right in time', () => {
        const series = buildBandSeries([
            { skill: 'LISTENING', bandScore: 6, completedAt: '2026-10-08T10:00:00Z' },
            { skill: 'LISTENING', bandScore: 6, completedAt: '2026-09-15T10:00:00Z' },
        ]);
        expect(series[0].week.localeCompare(series[1].week)).toBeLessThan(0);
    });

    it('separates Listening from Reading', () => {
        const series = buildBandSeries([
            { skill: 'LISTENING', bandScore: 6, completedAt: '2026-10-08T10:00:00Z' },
            { skill: 'READING', bandScore: 7, completedAt: '2026-10-09T10:00:00Z' },
        ]);
        expect(series[0].LISTENING).toBe(6);
        expect(series[0].READING).toBe(7);
    });
});

describe('IeltsTestDetailPage', () => {
    it('shows the cost WITH the balance before starting', async () => {
        getTestById.mockResolvedValue(envelope(LISTENING_TEST));
        renderDetail();

        expect(await screen.findByText(/Bắt đầu làm bài · -2 credit/)).toBeInTheDocument();
        expect(screen.getByText('Còn 20 credit')).toBeInTheDocument();
    });

    it('states the Listening transcript policy UP FRONT', async () => {
        /* The design calls this out: in v1 the rule is in the code but discovered only
           after submitting. */
        getTestById.mockResolvedValue(envelope(LISTENING_TEST));
        renderDetail();

        expect(await screen.findByText(/Transcript bài Listening chỉ hiện sau khi bạn nộp bài/)).toBeInTheDocument();
    });

    it('does NOT show the transcript notice for a test with no audio', async () => {
        getTestById.mockResolvedValue(envelope(READING_TEST));
        renderDetail();

        await screen.findByText('IELTS Academic 19 Reading Test 3');
        expect(screen.queryByText(/Transcript bài Listening/)).not.toBeInTheDocument();
    });

    it('counts questions from the paper itself, not a separate number', async () => {
        getTestById.mockResolvedValue(envelope(LISTENING_TEST));
        renderDetail();

        /* 3 + 2 = 5, summed from the returned paper. */
        expect(await screen.findByText('5')).toBeInTheDocument();
    });

    it('breaks the paper down per section, with its question counts', async () => {
        getTestById.mockResolvedValue(envelope(LISTENING_TEST));
        renderDetail();

        expect(await screen.findByText('Cấu trúc đề')).toBeInTheDocument();
        expect(screen.getByText('Section 1')).toBeInTheDocument();
        expect(screen.getByText('Section 2')).toBeInTheDocument();
        expect(screen.getByText('3 câu')).toBeInTheDocument();
        expect(screen.getByText('2 câu')).toBeInTheDocument();
    });

    it('tests the exam condition, so nobody is surprised by the missing chrome', async () => {
        getTestById.mockResolvedValue(envelope(LISTENING_TEST));
        renderDetail();
        expect(await screen.findByText(/không có thanh điều hướng và không có Lexi/)).toBeInTheDocument();
    });

    it('labels the difficulty through a static LOOKUP, never as the raw key', async () => {
        /* The enum is `MEDIUM` while the key is `ielts.difficulty.medium`, so an
           interpolated key printed "ielts.difficulty.MEDIUM" to the learner. */
        getTestById.mockResolvedValue(envelope({ ...LISTENING_TEST, difficulty: 'MEDIUM' }));
        renderDetail();

        expect(await screen.findByText('Trung bình')).toBeInTheDocument();
        expect(screen.queryByText(/ielts\.difficulty/)).not.toBeInTheDocument();

        // and the two tags on the hero do not share one tone
        const difficultyTag = screen.getByText('Trung bình');
        const skillTag = screen.getByText('Listening');
        expect(difficultyTag.className).toContain('--amber-soft');
        expect(skillTag.className).toContain('--info-soft');
    });

    it('shows no difficulty tag at all for a code it does not know', async () => {
        getTestById.mockResolvedValue(envelope({ ...LISTENING_TEST, difficulty: 'EXPERT' }));
        renderDetail();

        await screen.findByText('IELTS Academic 19 Listening Test 3');
        expect(screen.queryByText(/EXPERT/)).not.toBeInTheDocument();
    });
});

describe('IeltsHistoryPage', () => {
    const ATTEMPTS = [
        {
            attemptId: 'a1',
            testId: 't1',
            testTitle: 'IELTS Academic 19 Listening Test 3',
            skill: 'LISTENING',
            totalQuestions: 38,
            correctCount: 30,
            bandScore: 6.5,
            status: 'COMPLETED',
            completedAt: '2026-10-08T10:00:00Z',
        },
        {
            attemptId: 'a2',
            testId: 't2',
            testTitle: 'IELTS Academic 19 Reading Test 3',
            skill: 'READING',
            totalQuestions: 40,
            correctCount: 28,
            bandScore: 6,
            status: 'COMPLETED',
            completedAt: '2026-10-09T10:00:00Z',
        },
    ];

    it('gives the chart an ACCESSIBLE NAME describing its series', async () => {
        /* A chart with no accessible name is not usable; the bars are decoration. */
        getAttempts.mockResolvedValue(page(ATTEMPTS));
        renderHistory();

        const chart = await screen.findByRole('img');
        const label = chart.getAttribute('aria-label');
        expect(label).toMatch(/Biểu đồ band theo tuần/);
        expect(label).toMatch(/Listening band 6.5/);
        expect(label).toMatch(/Reading band 6/);
    });

    it('hides the bars from assistive tech, since the label carries the data', async () => {
        getAttempts.mockResolvedValue(page(ATTEMPTS));
        const { container } = renderHistory();

        await screen.findByRole('img');
        /* every bar column is aria-hidden */
        const hidden = container.querySelectorAll('[aria-hidden="true"]');
        expect(hidden.length).toBeGreaterThan(0);
    });

    it('states that a week with no attempt is absent, not zero', async () => {
        getAttempts.mockResolvedValue(page(ATTEMPTS));
        renderHistory();
        expect(await screen.findByText(/không vẽ cột 0 cho tuần bạn không học/)).toBeInTheDocument();
    });

    it('summarises attempts, average and best', async () => {
        getAttempts.mockResolvedValue(page(ATTEMPTS));
        renderHistory();

        expect(await screen.findByText('Lượt làm bài')).toBeInTheDocument();
        expect(screen.getByText('6.3')).toBeInTheDocument(); // (6.5 + 6) / 2
        /* 6.5 is both the best-band stat AND the first attempt's band, so the singular
           query is ambiguous by design. */
        expect(screen.getAllByText('6.5').length).toBeGreaterThan(0);
    });

    it('links each attempt to its reopenable result', async () => {
        getAttempts.mockResolvedValue(page(ATTEMPTS));
        renderHistory();

        const link = await screen.findByRole('link', { name: /Listening Test 3/ });
        expect(link).toHaveAttribute('href', '/ielts/result?attemptId=a1');
    });

    it('labels the band as an estimate, not an official result', async () => {
        getAttempts.mockResolvedValue(page(ATTEMPTS));
        renderHistory();
        expect(await screen.findByText(/không phải kết quả thi chính thức/)).toBeInTheDocument();
    });

    it('shows an empty state rather than an error before the first attempt', async () => {
        getAttempts.mockResolvedValue(page([]));
        renderHistory();

        expect(await screen.findByText('Chưa có lượt làm bài nào')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
