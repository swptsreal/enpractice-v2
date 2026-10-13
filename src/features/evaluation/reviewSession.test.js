import { describe, expect, it } from 'vitest';
import {
    applyPreset,
    buildFilter,
    buildSessionPayload,
    clampDuration,
    clampLimit,
    describeWindow,
    formatClock,
    gradeAnswer,
    mondayOfIsoWeek,
    parseSessionParams,
    presetFor,
    primaryMeaning,
    ratingKey,
    sessionSearch,
    summarise,
    toIsoWeekLabel,
    windowRangeLabel,
    wireDirection,
} from './reviewSession';

const NOW = new Date(2026, 9, 13); // Tuesday 13 Oct 2026, the date the design frames use.

const word = {
    englishWord: 'mitigate',
    normalizedWord: 'mitigate',
    correctMeaning: 'làm giảm bớt mức độ nghiêm trọng',
    alternatives: ['xoa dịu'],
    acceptedMeaningsVi: ['làm giảm bớt mức độ nghiêm trọng', 'giảm nhẹ'],
};

describe('the review window', () => {
    it('expresses every preset as the parameter the endpoint actually takes', () => {
        /* `week` and `month` must stay week/month: the server resolves them itself, so sending a
           from/to pair instead would review a different set of words than the label says. */
        expect(applyPreset('allHistory', NOW)).toEqual({ rangeMode: 'all', from: '', to: '', week: '', month: '' });
        expect(applyPreset('last7', NOW)).toMatchObject({ rangeMode: 'range', from: '2026-10-07', to: '2026-10-13' });
        expect(applyPreset('last30', NOW)).toMatchObject({ from: '2026-09-14', to: '2026-10-13' });
        expect(applyPreset('thisWeek', NOW)).toEqual({ rangeMode: 'week', from: '', to: '', week: '2026-W42', month: '' });
        expect(applyPreset('thisMonth', NOW)).toEqual({ rangeMode: 'month', from: '', to: '', week: '', month: '2026-10' });
    });

    it('labels ISO weeks the way the server does, including across a year boundary', () => {
        /* 1 Jan 2027 is a Friday and belongs to 2026-W53; getting this wrong silently selects a
           different week server-side, and only for dates near New Year. */
        expect(toIsoWeekLabel(new Date(2026, 0, 1))).toBe('2026-W01');
        expect(toIsoWeekLabel(new Date(2026, 9, 13))).toBe('2026-W42');
        expect(toIsoWeekLabel(new Date(2027, 0, 1))).toBe('2026-W53');
        expect(toIsoWeekLabel(new Date(2027, 0, 4))).toBe('2027-W01');
        expect(mondayOfIsoWeek('2026-W42').getDate()).toBe(12);
        expect(mondayOfIsoWeek('2026-W99')).toBeNull();
        expect(mondayOfIsoWeek('nonsense')).toBeNull();
    });

    it('round-trips a preset through the parameters it produced', () => {
        for (const preset of ['allHistory', 'last7', 'last30', 'thisWeek', 'thisMonth']) {
            expect(presetFor(applyPreset(preset, NOW), NOW)).toBe(preset);
        }
    });

    it('refuses a half-filled custom range instead of quietly reviewing a different one', () => {
        /* `from` without `to` reaches the server as "the last 7 days", which is not the window the
           screen is showing — so the screen must say the window is incomplete, not send it. */
        expect(describeWindow({ rangeMode: 'range', from: '2026-10-01', to: '' }).complete).toBe(false);
        expect(describeWindow({ rangeMode: 'range', from: '', to: '2026-10-13' }).complete).toBe(false);
        expect(describeWindow({ rangeMode: 'range', from: '2026-10-13', to: '2026-10-01' }).complete).toBe(false);
        expect(describeWindow({ rangeMode: 'range', from: '2026-10-01', to: '2026-10-13' }).complete).toBe(true);
        expect(describeWindow({ rangeMode: 'all' }).complete).toBe(true);
        expect(describeWindow({ rangeMode: 'week', week: '' }).complete).toBe(false);
        expect(describeWindow({ rangeMode: 'week', week: '2026-W42' }).complete).toBe(true);
        expect(describeWindow({ rangeMode: 'month', month: '2026-13' }).complete).toBe(false);
        /* Shape is not enough: 31 February fits YYYY-MM-DD, and a Date built from it rolls over into
           March, so the window would silently be a different window. */
        expect(describeWindow({ rangeMode: 'range', from: '2026-02-31', to: '2026-03-05' }).complete).toBe(false);
        expect(describeWindow({ rangeMode: 'range', from: '2026-02-28', to: '2026-03-05' }).complete).toBe(true);
    });

    it('falls back to a valid range mode rather than forwarding a bad one', () => {
        expect(describeWindow({ rangeMode: 'yesterday' }).kind).toBe('range');
    });
});

/* The screen prints the RESOLVED days, because the pressed chip already carries the preset's name
   and the only question a name cannot answer is "which days, exactly". */
describe('the window, named in dates', () => {
    it('names the two ends of a custom range', () => {
        const w = describeWindow({ rangeMode: 'range', from: '2026-10-01', to: '2026-10-13' });
        expect(windowRangeLabel(w)).toBe('2026-10-01 → 2026-10-13');
    });

    it('resolves a week to its Monday and Sunday, because the server does the same', () => {
        /* 2026-W42 is Mon 12 Oct – Sun 18 Oct 2026. If this drifts from the server's own
           `mondayOfIsoWeek`, the label describes a different week than the one fetched. */
        expect(windowRangeLabel(describeWindow({ rangeMode: 'week', week: '2026-W42' }))).toBe(
            '2026-10-12 → 2026-10-18'
        );
    });

    it('resolves a month to its first and last day, including a leap February', () => {
        expect(windowRangeLabel(describeWindow({ rangeMode: 'month', month: '2026-02' }))).toBe(
            '2026-02-01 → 2026-02-28'
        );
        expect(windowRangeLabel(describeWindow({ rangeMode: 'month', month: '2024-02' }))).toBe(
            '2024-02-01 → 2024-02-29'
        );
    });

    it('says nothing for all-history, because there are no days to name', () => {
        /* "Đang chọn: Toàn bộ" would be a sentence with no information in it, and the pressed chip
           already says so. */
        expect(windowRangeLabel(describeWindow({ rangeMode: 'all' }))).toBe('');
    });

    it('says nothing for a half-filled window instead of naming half a range', () => {
        expect(windowRangeLabel(describeWindow({ rangeMode: 'range', from: '2026-10-01', to: '' }))).toBe('');
        expect(windowRangeLabel(describeWindow({ rangeMode: 'week', week: '' }))).toBe('');
        expect(windowRangeLabel(null)).toBe('');
    });
});

describe('the session length', () => {
    it('cannot promise more words than exist', () => {
        expect(clampLimit(50, 8)).toBe(8);
        expect(clampLimit(20, 26)).toBe(20);
        expect(clampLimit(9999, 400)).toBe(300); // the server's own MAX_LIMIT
        expect(clampLimit(20, 0)).toBe(0);
        expect(clampLimit(0, 26)).toBe(20); // "unset" means the default, not zero
        expect(clampLimit('nonsense', 26)).toBe(20);
    });
});

describe('grading an answer', () => {
    it('accepts any meaning the learner had accepted, not just the first', () => {
        expect(gradeAnswer('giảm nhẹ', word, 'EN_TO_VI').isCorrect).toBe(true);
        expect(gradeAnswer('  LÀM GIẢM BỚT MỨC ĐỘ NGHIÊM TRỌNG ', word, 'EN_TO_VI').isCorrect).toBe(true);
        expect(gradeAnswer('xoa dịu', word, 'EN_TO_VI').isCorrect).toBe(true);
        expect(gradeAnswer('tăng cường', word, 'EN_TO_VI').isCorrect).toBe(false);
    });

    it('grades the other direction against the English word', () => {
        expect(gradeAnswer('Mitigate', word, 'VI_TO_EN').isCorrect).toBe(true);
        expect(gradeAnswer('mitigated', word, 'VI_TO_EN').isCorrect).toBe(false);
    });

    it('never counts an empty answer as correct', () => {
        expect(gradeAnswer('', word, 'EN_TO_VI').isCorrect).toBe(false);
        expect(gradeAnswer('   ', word, 'VI_TO_EN').isCorrect).toBe(false);
    });

    it('shows the learner their own first accepted meaning, not the raw correct field', () => {
        expect(primaryMeaning(word)).toBe('làm giảm bớt mức độ nghiêm trọng');
        expect(primaryMeaning({ correctMeaning: 'bền vững' })).toBe('bền vững');
    });
});

describe('the session summary', () => {
    const answers = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: true },
    ];

    it('counts, and keeps the misses so they can be retried', () => {
        const summary = summarise(answers);
        expect(summary).toMatchObject({ total: 4, correct: 3, incorrect: 1, accuracy: 75 });
        expect(summary.wrong).toHaveLength(1);
    });

    it('does not divide by zero on an empty session', () => {
        expect(summarise([])).toMatchObject({ total: 0, correct: 0, accuracy: 0 });
    });

    it('uses the four bands the copy was written against', () => {
        expect(ratingKey(100)).toBe('excellent');
        expect(ratingKey(90)).toBe('excellent');
        expect(ratingKey(89)).toBe('good');
        expect(ratingKey(70)).toBe('good');
        expect(ratingKey(69)).toBe('improving');
        expect(ratingKey(50)).toBe('improving');
        expect(ratingKey(49)).toBe('needsReview');
        expect(ratingKey(0)).toBe('needsReview');
    });

    it('formats a duration as a duration, not as a clock time', () => {
        expect(formatClock(312)).toBe('5:12');
        expect(formatClock(60)).toBe('1:00');
        expect(formatClock(9)).toBe('0:09');
        expect(formatClock(0)).toBe('0:00');
    });

    it('keeps the stored duration inside what the endpoint accepts', () => {
        expect(clampDuration(0)).toBe(1);
        expect(clampDuration(10801)).toBe(10800);
        expect(clampDuration(312.9)).toBe(312);
    });
});

describe('what gets stored', () => {
    const params = { rangeMode: 'range', from: '2026-10-01', to: '2026-10-13', group: 'wrong', limit: 20 };

    it('writes a filter that is machine-readable, not a locale-dependent label', () => {
        expect(buildFilter(params)).toBe('rangeMode=range;from=2026-10-01;to=2026-10-13;week=;month=;group=wrong');
        expect(buildFilter({ rangeMode: 'all' })).toContain('group=unreviewed'); // a default, never blank
    });

    it('stores the direction in the spelling the existing rows already use', () => {
        /* v1 wrote `en-vi` / `vi-en` for every row, and the server validates neither spelling, so a
           second spelling would split one value across two forms in the data. */
        expect(wireDirection('VI_TO_EN')).toBe('vi-en');
        expect(wireDirection('EN_TO_VI')).toBe('en-vi');
        expect(wireDirection(undefined)).toBe('en-vi');
    });

    it('builds a payload the request DTO can accept', () => {
        const payload = buildSessionPayload({
            sessionId: '11111111-1111-4111-8111-111111111111',
            startedAt: '2026-10-13T10:00:00.000Z',
            durationSeconds: 312,
            params,
            direction: 'EN_TO_VI',
            answers: [
                { englishWord: 'mitigate', normalizedWord: 'mitigate', isCorrect: true, givenAnswer: 'giảm nhẹ' },
                { englishWord: 'deplete', normalizedWord: 'deplete', isCorrect: false, givenAnswer: 'làm cạn' },
            ],
        });

        expect(payload).toMatchObject({
            sessionId: '11111111-1111-4111-8111-111111111111',
            durationSeconds: 312,
            total: 2,
            correct: 1,
            incorrect: 1,
            accuracy: 50,
            direction: 'en-vi',
            rangeMode: 'range',
            rangeFrom: '2026-10-01',
            rangeTo: '2026-10-13',
            group: 'wrong',
        });
        /* `words` is @NotNull on the server, and each entry carries the answer that was given so the
           stored session can be explained later. */
        expect(payload.words).toHaveLength(2);
        expect(payload.words[1]).toEqual({
            englishWord: 'deplete',
            normalizedWord: 'deplete',
            isCorrect: false,
            givenAnswer: 'làm cạn',
        });
        expect(payload.filter).not.toBe('');
    });
});

describe('the handoff between the three steps', () => {
    it('survives a round trip through the query string', () => {
        const params = { rangeMode: 'week', week: '2026-W42', group: 'unreviewed', limit: 25 };
        const parsed = parseSessionParams(new URLSearchParams(sessionSearch(params, 'VI_TO_EN')));
        expect(parsed.params).toMatchObject({ rangeMode: 'week', week: '2026-W42', group: 'unreviewed', limit: 25 });
        expect(parsed.direction).toBe('VI_TO_EN');
    });

    it('leaves empty fields out so the URL stays readable', () => {
        const query = sessionSearch({ rangeMode: 'all', group: 'all', limit: 20 }, 'EN_TO_VI');
        expect(query).toBe('rangeMode=all&group=all&limit=20&direction=EN_TO_VI');
    });

    it('replaces a hand-edited value with a safe default instead of forwarding it', () => {
        /* A bad `group` reaches the server as a 400; the screen must recover, not show an error
           the learner cannot act on. */
        const parsed = parseSessionParams(
            new URLSearchParams('rangeMode=yesterday&group=whatever&limit=-5&direction=MIXED&from=13-10-2026')
        );
        expect(parsed.params).toMatchObject({ rangeMode: 'range', group: 'unreviewed', limit: 20, from: '' });
        expect(parsed.direction).toBe('EN_TO_VI');
    });
});
