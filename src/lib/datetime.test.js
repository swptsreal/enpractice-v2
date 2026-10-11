import { beforeAll, describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import { formatDate, formatDateTime, formatRelative, isDue } from './datetime';

/**
 * `isDue` exists because of a bug found by reading a REAL payload rather than
 * reasoning about one: a word always has `nextReviewAt` set — a freshly added word
 * comes back with a date a couple of hours ahead — so "has a nextReviewAt" cannot
 * mean "due". The first version of the notebook rendered "Đã tới hạn" (due now) for
 * every word in the notebook, including ones scheduled days out.
 */
beforeAll(async () => {
    const { i18nReady } = await import('../i18n');
    await i18nReady;
});

describe('isDue', () => {
    it('is true for a past instant', () => {
        expect(isDue(dayjs().subtract(1, 'hour').toISOString())).toBe(true);
    });

    it('is true for right now, so a word due this second is actionable', () => {
        expect(isDue(dayjs().toISOString())).toBe(true);
    });

    it('is FALSE for a future instant — the case that was wrong', () => {
        /* The exact shape the backend returned for a newly added word. */
        expect(isDue(dayjs().add(2, 'hour').toISOString())).toBe(false);
        expect(isDue('2026-10-14T05:15:54.737Z')).toBe(
            dayjs('2026-10-14T05:15:54.737Z').isAfter(dayjs()) === false
        );
    });

    it('is false for a missing or unparseable value rather than throwing', () => {
        for (const bad of [null, undefined, '', 'not-a-date']) {
            expect(isDue(bad)).toBe(false);
        }
    });
});

describe('formatDate', () => {
    it('formats in the active language, not as raw ISO', () => {
        const out = formatDate('2026-10-14T05:15:54.737Z');
        expect(out).toBeTruthy();
        /* The whole point: an ISO string must never reach the UI. */
        expect(out).not.toContain('T');
        expect(out).not.toContain('Z');
        expect(out).toMatch(/\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}/);
    });

    it('returns null for nothing, so a caller can branch', () => {
        expect(formatDate(null)).toBeNull();
        expect(formatDate('garbage')).toBeNull();
    });
});

describe('formatDateTime', () => {
    it('includes a time component', () => {
        const out = formatDateTime('2026-10-14T05:15:54.737Z');
        expect(out).toBeTruthy();
        expect(out).toMatch(/\d{1,2}:\d{2}/);
    });
});

describe('formatRelative', () => {
    it('reports whole days between start-of-days, so "tomorrow" is exactly 1', () => {
        const tomorrow = dayjs().add(1, 'day').toISOString();
        /* Depending on the hour, tomorrow's start-of-day is 1 day ahead. */
        const out = formatRelative(tomorrow);
        expect(out).toEqual({ unit: 'day', value: 1 });
    });

    it('reports 0 for a different time today', () => {
        expect(formatRelative(dayjs().add(1, 'minute').toISOString())).toEqual({ unit: 'day', value: 0 });
    });

    it('returns null rather than a broken object for nothing', () => {
        expect(formatRelative(null)).toBeNull();
    });
});
