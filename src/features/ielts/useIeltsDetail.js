import { useCallback, useMemo } from 'react';
import { ieltsApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';

/**
 * IELTS test detail (screen 17) and attempt history (screen 20).
 *
 * Contracts CONFIRMED against the backend DTOs:
 *
 *   GET /ielts/tests/{id}                  -> IeltsTestDetailResponse
 *        { id, title, skill, timeLimitMinutes, difficulty, isPublished,
 *          sections[{ id, sectionOrder, title, audioUrl, transcript, instructions,
 *                     passages[{ id, passageOrder, title, content, questions[] }] }] }
 *   GET /ielts/tests/{id}/practice-options -> IeltsPracticeOptionsResponse
 *        { testId, title, skill, difficulty, totalQuestions, timeLimitMinutes,
 *          fullTest: { attemptMode, scopeType, scopeId, title, questionCount,
 *                      estimatedMinutes },
 *          sections[{ ...same, sectionOrder, audioUrl,
 *                     passages[{ ...same, passageOrder, audioUrl,
 *                                audioSeekStartRatio, audioSeekEndRatio, audioSeekHint }] }] }
 *   GET /ielts/attempts?page&size          -> PageResponse<TestAttemptHistoryResponse>
 *        { attemptId, testId, testTitle, attemptMode, scopeType, scopeId, scopeTitle,
 *          skill, totalQuestions, correctCount, accuracyPercent, bandScore,
 *          timeSpentSeconds, status, startedAt, completedAt }
 *
 * WHAT MATTERS FOR EACH SCREEN:
 *
 *  17 — **The listening transcript policy is surfaced BEFORE starting**, which the design
 *  calls out explicitly: in v1 that rule exists in the code but is only discovered after
 *  submission. The detail endpoint returns `sections[].transcript`, so the screen knows
 *  whether a transcript exists and can say when it unlocks.
 *
 *  20 — **The band chart is built from `skill` + `bandScore` + `completedAt`**, all of
 *  which the history payload carries. Weeks with no attempt are ABSENT from the chart
 *  rather than plotted as zero: a zero would read as "scored band 0", which is a
 *  different and false statement.
 */

/**
 * Skill enum -> STATIC i18n key.
 *
 * The i18n keys are LOWERCASE (`ielts.skill.listening`) while the backend enum is
 * UPPERCASE (`LISTENING`), so interpolating `${skill}` produces a missing key and would
 * need a `defaultValue` fallback — which the i18n audit rejects, correctly. Shared by all
 * three IELTS screens rather than copied, so the case mapping lives in one place.
 */
export const SKILL_LABEL_KEYS = {
    LISTENING: 'ielts.skill.listening',
    READING: 'ielts.skill.reading',
    WRITING: 'ielts.skill.writing',
    SPEAKING: 'ielts.skill.speaking',
};

export function skillLabelKey(skill) {
    return SKILL_LABEL_KEYS[skill] ?? 'ielts.skill.all';
}

/**
 * Difficulty enum -> STATIC i18n key, and the Chip TONE each tag carries.
 *
 * The backend spells the enum UPPERCASE — verified against the running backend:
 * `GET /ielts/tests?difficulty=HARD` -> 200, `?difficulty=EXPERT` -> 400
 * "No enum constant com.swpts.enpracticebe.entity.IeltsTest.Difficulty.EXPERT" —
 * while the locale keys are lowercase. An interpolated key therefore printed the
 * raw string `ielts.difficulty.EASY` at the learner. The mapping is a lookup, and
 * it lives here beside `SKILL_LABEL_KEYS` instead of being copied into every
 * screen that draws a tag.
 *
 * Tones stay inside the families `Primitives.jsx` defines and
 * `npm run verify:contrast` measures (teal/teal-soft, info/info-soft,
 * correct/correct-soft, amber/amber-soft, wrong/wrong-soft, ink-soft/surface-alt).
 * Skill and difficulty deliberately use DIFFERENT families, so the two tags on one
 * card can never be confused for one another.
 */
export const DIFFICULTY_LABEL_KEYS = {
    EASY: 'ielts.difficulty.easy',
    MEDIUM: 'ielts.difficulty.medium',
    HARD: 'ielts.difficulty.hard',
};

export const SKILL_TONE = {
    LISTENING: 'info',
    READING: 'teal',
};

export const DIFFICULTY_TONE = {
    EASY: 'correct',
    MEDIUM: 'amber',
    HARD: 'wrong',
};

export function useIeltsTestDetail(testId) {
    const loader = useCallback(() => ieltsApi.getTestById(testId).then(unwrapData), [testId]);
    const detail = useAsyncData(loader, `ielts-test-${testId}`);

    const optionsLoader = useCallback(
        () => (testId ? ieltsApi.getPracticeOptions(testId).then(unwrapData) : Promise.resolve(null)),
        [testId]
    );
    const options = useAsyncData(optionsLoader, `ielts-options-${testId}`);

    const test = detail.data ?? null;

    /* A real question count, summed from the paper the detail endpoint returns, rather
       than trusting a separate number that could disagree with the paper itself. */
    const questionCount = useMemo(() => {
        if (!test?.sections) return null;
        return test.sections.reduce(
            (total, section) =>
                total +
                (section.passages ?? []).reduce((sum, passage) => sum + (passage.questions?.length ?? 0), 0),
            0
        );
    }, [test]);

    /** Does this test have a transcript at all? Drives the policy notice. */
    const hasTranscript = useMemo(
        () => Boolean(test?.sections?.some((section) => section.transcript || section.audioUrl)),
        [test]
    );

    return {
        test,
        options: options.data ?? null,
        questionCount,
        hasTranscript,
        loading: detail.loading,
        error: detail.error,
        reload: () => {
            detail.reload();
            options.reload();
        },
    };
}

export function useIeltsHistory({ page = 0, size = 20 } = {}) {
    const key = `ielts-history|${page}|${size}`;
    const loader = useCallback(
        () => ieltsApi.getAttempts({ page, size }).then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data, loading, error, reload } = useAsyncData(loader, key);

    const items = data?.items ?? [];

    const graded = items.filter((a) => a.status === 'COMPLETED' && a.bandScore != null);
    const best = graded.reduce((max, a) => Math.max(max, Number(a.bandScore)), 0);
    const average = graded.length
        ? graded.reduce((sum, a) => sum + Number(a.bandScore), 0) / graded.length
        : 0;

    return { items, totalElements: data?.totalElements ?? 0, best, average, gradedCount: graded.length, loading, error, reload };
}

/* ------------------------------------------------------------- the band chart */

/** ISO week label like `2026-W41`, used as the axis label. No invented dates. */
export function weekKeyOf(instant) {
    if (!instant) return null;
    const date = new Date(instant);
    if (Number.isNaN(date.getTime())) return null;

    /* ISO 8601 week number: the week containing the year's first Thursday. */
    const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNumber = (target.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNumber + 3);
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);
    const week = 1 + Math.round((target - firstThursday) / (7 * 86_400_000));
    return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/**
 * Weekly bands per skill, for the CSS bar chart.
 *
 * Only weeks that HAVE an attempt appear. A missing week is not a zero: plotting it would
 * claim the user scored band 0 that week, which is a different and false statement.
 * Within a week and skill, the BEST band is used, because the chart answers "how did this
 * week go", not "what was the last attempt".
 */
export function buildBandSeries(attempts) {
    const byWeek = new Map();

    for (const attempt of attempts ?? []) {
        if (attempt.bandScore == null) continue;
        const week = weekKeyOf(attempt.completedAt ?? attempt.startedAt);
        if (!week) continue;
        const skill = attempt.skill === 'READING' ? 'READING' : 'LISTENING';

        if (!byWeek.has(week)) byWeek.set(week, { week, LISTENING: null, READING: null });
        const bucket = byWeek.get(week);
        const previous = bucket[skill];
        const value = Number(attempt.bandScore);
        bucket[skill] = previous == null ? value : Math.max(previous, value);
    }

    /* Oldest first, so the chart reads left to right in time. */
    return [...byWeek.values()].sort((a, b) => a.week.localeCompare(b.week));
}
