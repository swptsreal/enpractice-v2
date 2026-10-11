import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Two rules shape the Progress screen, and both are honesty rules rather than
 * layout rules:
 *
 *  1. **A trend is a MEASURED delta, never a promise.** `PRODUCT.md` forbids
 *     band-improvement claims. So when the backend has no previous equivalent to
 *     compare against, the trend is NOT rendered — not as 0, and not as an
 *     improvement.
 *  2. **"Report not ready" is an empty state, not an error.** A new account has no
 *     weekly report until its first week is finalised, and the backend currently
 *     reports that as HTTP 500 (a wrapped 404 the global handler flattens). The
 *     client must not show a server error the user can do nothing about.
 */
const getCurrent = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    weeklyReportApi: { getCurrent: (...a) => getCurrent(...a) },
}));

const { i18nReady } = await import('../../i18n');
const { default: WeeklyReportPage, isReportNotReady } = await import('./WeeklyReportPage');

beforeAll(async () => {
    await i18nReady;
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });

const REPORT = envelope({
    id: 'r1',
    weekStartAt: '2026-10-05T00:00:00Z',
    weekEndAt: '2026-10-11T23:59:59Z',
    status: 'FINALIZED',
    overview: {
        totalStudySeconds: 5400, // 90 minutes
        activeDays: 4,
        meaningfulSessions: 9,
        completedActivities: 12,
        xpEarned: 320,
    },
    dailyActivity: [
        { date: '2026-10-05', state: 'ACTIVE', studySeconds: 1800, meaningfulSessions: 3, completionCount: 4, xpEarned: 100 },
        { date: '2026-10-06', state: 'REST', studySeconds: 0, meaningfulSessions: 0, completionCount: 0, xpEarned: 0 },
        { date: '2026-10-07', state: 'PARTIAL', studySeconds: 600, meaningfulSessions: 1, completionCount: 2, xpEarned: 40 },
    ],
    highlights: [
        {
            code: 'XP_EARNED',
            value: 320,
            unit: 'XP',
            comparison: { current: 320, previousEquivalent: 250, delta: 70, deltaPercent: 28 },
        },
    ],
    modules: {
        ielts: { status: 'ACTIVE', studySeconds: 3600 },
        speaking: { status: 'NO_DATA', studySeconds: 0 },
        writing: { status: 'INACTIVE', studySeconds: 0 },
        vocabulary: { status: 'ACTIVE', studySeconds: 1800 },
    },
});

function renderPage() {
    return render(
        <MemoryRouter>
            <WeeklyReportPage />
        </MemoryRouter>
    );
}

describe('isReportNotReady — recovering a status the backend loses', () => {
    it('recognises the message the backend actually sends', () => {
        /* `ResponseStatusException(404, "Weekly report is not ready")` arrives as a 500
           with this message, because GlobalExceptionHandler flattens it. */
        expect(isReportNotReady(Object.assign(new Error('Weekly report is not ready'), { status: 500 }))).toBe(true);
    });

    it('recognises a genuine 404 about a report', () => {
        expect(isReportNotReady(Object.assign(new Error('Weekly report not found'), { status: 404 }))).toBe(true);
    });

    it('does not swallow an unrelated failure', () => {
        expect(isReportNotReady(new Error('Network Error'))).toBe(false);
        expect(isReportNotReady(Object.assign(new Error('boom'), { status: 500 }))).toBe(false);
        expect(isReportNotReady(null)).toBe(false);
    });
});

describe('WeeklyReportPage — the report', () => {
    it('renders the measured overview numbers', async () => {
        getCurrent.mockResolvedValue(REPORT);
        renderPage();

        // 5400 seconds is 90 minutes, converted rather than printed as seconds
        expect(await screen.findByText(/90 phút/)).toBeInTheDocument();
        expect(screen.getByText('Phút học')).toBeInTheDocument();
        expect(screen.getByText('Ngày có học')).toBeInTheDocument();
        expect(screen.getByText('Lượt học')).toBeInTheDocument();
    });

    it('states that the numbers are measured, not predicted', async () => {
        getCurrent.mockResolvedValue(REPORT);
        renderPage();
        expect(await screen.findByText(/đo được từ dữ liệu luyện tập, không phải dự đoán/)).toBeInTheDocument();
    });

    it('reports a trend as a measured delta', async () => {
        getCurrent.mockResolvedValue(REPORT);
        renderPage();
        expect(await screen.findByText(/\+70\.0 so với tuần trước/)).toBeInTheDocument();
    });

    it('omits the trend entirely when there is nothing to compare against', async () => {
        /* The honesty rule: no previous equivalent means no trend, NOT a 0% claim. */
        getCurrent.mockResolvedValue(
            envelope({
                ...REPORT.data,
                highlights: [{ code: 'XP_EARNED', value: 320, unit: 'XP', comparison: null }],
            })
        );
        renderPage();

        await screen.findByText('Điểm đáng chú ý');
        expect(screen.queryByText(/so với tuần trước/)).not.toBeInTheDocument();
    });

    it('renders each day with its state in the accessible name, not only in colour', async () => {
        getCurrent.mockResolvedValue(REPORT);
        renderPage();

        await screen.findByText('Từng ngày trong tuần');
        const bars = screen.getAllByRole('img');
        const labels = bars.map((b) => b.getAttribute('aria-label'));
        // a rest day is announced as a rest day, not as an empty bar
        expect(labels.some((l) => /ngày nghỉ/.test(l ?? ''))).toBe(true);
        expect(labels.some((l) => /học 30 phút/.test(l ?? ''))).toBe(true);
    });

    it('shows each module with a status and a way in', async () => {
        getCurrent.mockResolvedValue(REPORT);
        renderPage();

        expect(await screen.findByText('Theo kỹ năng')).toBeInTheDocument();
        /* 'Co hoc' appears once per ACTIVE module, so assert presence not uniqueness. */
        expect(screen.getAllByText('Có học').length).toBeGreaterThan(0);
        expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument();
        expect(screen.getByText('Không học')).toBeInTheDocument();
        const links = screen.getAllByRole('link', { name: /^Mở$/ });
        expect(links.map((a) => a.getAttribute('href'))).toEqual([
            '/ielts',
            '/speaking',
            '/writing',
            '/vocabulary',
        ]);
    });
});

describe('WeeklyReportPage — not ready', () => {
    it('shows the not-ready empty state, NOT an error, for the backend 500', async () => {
        getCurrent.mockRejectedValue(
            Object.assign(new Error('Weekly report is not ready'), { status: 500 })
        );
        renderPage();

        expect(await screen.findByText('Báo cáo tuần chưa sẵn sàng')).toBeInTheDocument();
        // the crucial part: no alert, because this is not a failure
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('still shows an error for a genuine failure', async () => {
        getCurrent.mockRejectedValue(new Error('Network Error'));
        renderPage();
        expect(await screen.findByRole('alert')).toBeInTheDocument();
    });
});
