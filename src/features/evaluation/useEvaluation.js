import { useCallback, useMemo } from 'react';
import { profileApi } from '../../api';
import { unwrapData } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';

/**
 * Ability evaluation (screen 14) and spaced-repetition config (screen 15).
 *
 * THERE IS NO DEDICATED EVALUATION ENDPOINT. Verified: no controller maps to
 * `evaluation`, `ability`, `band` or `rating`. The data lives on `GET /user/profile`, in
 * `bandProgress`, `weakSkills`, `recommendedPractice` and `vocabProgress`, so the
 * Evaluation screen reads that rather than inventing an endpoint or fabricating a band.
 *
 * TWO THINGS THAT SHAPE THE EVALUATION SCREEN:
 *
 *  1. **`bandProgress` IS ALL ZEROS for a new account** — `{ current: 0, previous: 0 }`
 *     for every skill, verified. Rendering that as "band 0.0" would state a measurement
 *     the platform does not have. `hasBandData` distinguishes "no data yet" from a real
 *     score, and the tile shows a dash with an explanation in the first case.
 *  2. **`weakSkills` is NOT empty for a new account** — it returned
 *     `["Academic Vocabulary", "Map Labeling"]` on a fresh registration. So the weakness
 *     column is real content, and it is worth being precise that these are SKILL AREAS
 *     the platform tracks, not measured failures.
 */

/** SRS intervals, read from the backend's own `calculateNextReviewInterval`. */
export const REVIEW_INTERVAL_LABELS = {
    0: 'review.level0',
    1: 'review.level1',
    2: 'review.level2',
    3: 'review.level3',
    4: 'review.level4',
};

export const REVIEW_DIRECTIONS = ['EN_TO_VI', 'VI_TO_EN', 'MIXED'];

/**
 * Content modes for a review session.
 *
 * Derived from what the API actually supports, NOT invented: `/dictionary/due-review`
 * takes `mode`, and `isQuickMode(mode)` switches between the due schedule and a
 * deliberately easy session over any words. The other two options are client-side filters
 * over the fetched list (`isFavorite`, proficiency tier), which is honest because the
 * fetch already carries those fields.
 */
export const REVIEW_MODES = [
    { id: 'DUE', mode: '', filter: 'due' },
    { id: 'QUICK', mode: 'quick', filter: 'all' },
    { id: 'FAVORITES', mode: '', filter: 'favorite' },
    { id: 'WEAK', mode: '', filter: 'weak' },
];

export function useEvaluation() {
    const loader = useCallback(() => profileApi.getProfile().then(unwrapData), []);
    const { data, loading, error, reload } = useAsyncData(loader, 'evaluation-profile');

    const band = data?.bandProgress ?? null;

    /**
     * Is a skill's band a REAL measurement?
     *
     * `current: 0, previous: 0` is what a new account returns for every skill, so a zero
     * score means "not measured", not "scored zero". Treating it as a measurement would
     * put a 0.0 band on a learner who has not sat anything.
     */
    const hasBandData = useCallback((score) => Boolean(score && Number(score.current) > 0), []);

    const skills = useMemo(
        () =>
            ['listening', 'reading', 'writing', 'speaking'].map((skill) => {
                const score = band?.[skill] ?? null;
                const current = Number(score?.current ?? 0);
                const previous = Number(score?.previous ?? 0);
                return {
                    skill,
                    score,
                    measured: current > 0,
                    current,
                    /* A delta is only meaningful when BOTH sides exist. */
                    delta: current > 0 && previous > 0 ? Number((current - previous).toFixed(1)) : null,
                };
            }),
        [band]
    );

    const measuredCount = skills.filter((s) => s.measured).length;

    return {
        profile: data ?? null,
        overall: band?.overall ?? null,
        overallMeasured: Number(band?.overall?.current ?? 0) > 0,
        skills,
        measuredCount,
        weakSkills: data?.weakSkills ?? [],
        recommendedPractice: data?.recommendedPractice ?? [],
        vocabProgress: data?.vocabProgress ?? null,
        hasBandData,
        loading,
        error,
        reload,
    };
}

/**
 * The review config: how many words are ready, and how long that will take.
 *
 * THE SCREEN'S WHOLE JOB is to remove the two reasons people skip review — not knowing
 * what will be reviewed, and not knowing how long it takes. So this hook fetches the
 * actual due list and reports a count and a duration, rather than describing the feature.
 *
 * The duration is estimated at a documented pace rather than guessed per session: roughly
 * 16 seconds per card covers reading, revealing, and choosing a recall button. It is
 * labelled as an estimate wherever it appears.
 */
const SECONDS_PER_CARD = 16;

export function estimateMinutes(count) {
    if (!count) return 0;
    return Math.max(1, Math.round((count * SECONDS_PER_CARD) / 60));
}

export function useReviewConfig() {
    const loader = useCallback(() => profileApi.getProfile().then(unwrapData), []);
    const { data, loading, error, reload } = useAsyncData(loader, 'review-config-profile');

    const stats = data?.dictionaryStats ?? null;
    const dueCount = Number(stats?.wordsToReviewToday ?? 0);
    const totalWords = Number(stats?.totalWords ?? 0);

    return {
        dueCount,
        totalWords,
        favoriteCount: Number(stats?.favoriteWords ?? 0),
        learningCount: Number(stats?.learningWords ?? 0),
        masterCount: Number(stats?.masteredWords ?? 0),
        estimatedMinutes: estimateMinutes(dueCount),
        loading,
        error,
        reload,
    };
}

/**
 * The chosen review settings, kept locally.
 *
 * `mode` is sent to the API. `direction` HAS NO ENDPOINT — the backend's review flow
 * always prompts with the word — so it is stored locally and the screen says so rather
 * than implying the server honours it.
 */
const REVIEW_PREF_KEY = 'en-practice:review-prefs';

export function readReviewPrefs() {
    try {
        const raw = window.localStorage.getItem(REVIEW_PREF_KEY);
        return raw ? JSON.parse(raw) : { direction: 'EN_TO_VI', contentMode: 'DUE' };
    } catch {
        return { direction: 'EN_TO_VI', contentMode: 'DUE' };
    }
}

export function writeReviewPrefs(prefs) {
    try {
        window.localStorage.setItem(REVIEW_PREF_KEY, JSON.stringify(prefs));
    } catch {
        /* storage disabled is not a reason to break the screen */
    }
}
