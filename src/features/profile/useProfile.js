import { useCallback, useMemo, useState } from 'react';
import { profileApi } from '../../api';
import { unwrapData } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';

/**
 * Profile: identity, level, goals, streak and activity.
 *
 * Two endpoints, and the difference matters:
 *
 *   `GET /user/profile/summary` -> { id, email, displayName, avatarUrl, goals,
 *        levelInfo, overallBand, currentStreak, weeklyXp }   — the header's needs
 *   `GET /user/profile`         -> the full record, adding bio, preferredLanguage,
 *        overview, streak (with a 30-day heatmap), todayGoal, bandProgress,
 *        vocabProgress, dictionaryStats, weakSkills, recommendedPractice,
 *        recentActivities, leaderboardSummary
 *
 * The screen uses the FULL endpoint, because the design's four stat tiles and the
 * Lexi level panel both need `overview` and `levelInfo`.
 *
 * FOUR MORE BLOCKS LIVE IN THE SAME PAYLOAD, all captured live from a brand-new account
 * and all previously unused by this screen:
 *
 *   `avatarUrl`       string | null        — null for a new account
 *   `bandProgress`    { listening|reading|writing|speaking|overall: { current, previous } }
 *                     — ALL ZERO for a new account, and 0 means CHƯA ĐO, not band 0.0
 *   `vocabProgress`   { totalWords, masteredWords, reviewingWords }
 *   `dictionaryStats` { totalWords, favoriteWords, wordsToReviewToday, newWords,
 *                       learningWords, masteredWords }
 *   `weakSkills`      string[] — a DEFAULT list for a new account, not a measurement
 *
 * TWO THINGS A NEW ACCOUNT SHOWS, both verified, and both must not be faked:
 *
 *  - **`goals` is entirely null except `dailyGoalMinutes: 30`.** So "progress towards
 *    your target band" has no target to measure against, and the screen must ask for
 *    one rather than draw a bar against an invented goal.
 *  - **`levelInfo` starts at level 1 with `xpNeededForNextLevel: 100` and 0 XP.** The
 *    level is cosmetic — the design says nothing is gated behind it — so the panel
 *    explains what earns XP instead of implying a locked feature.
 *
 * NOTE ON `overallBand`: `/user/profile` does NOT return it (the DTO has no such field —
 * verified), so a screen reading only `profile.overallBand` renders no band at all. The
 * live value is `bandProgress.overall.current`, and `readOverallBand` falls back to it.
 */

/** XP thresholds, straight from `levelInfo`; no client-side curve is invented. */
export function readLevel(levelInfo) {
    if (!levelInfo) {
        return { currentLevel: 1, nextLevel: 2, xpIntoCurrentLevel: 0, xpNeededForNextLevel: 100, progressPercentage: 0, totalXp: 0 };
    }
    return {
        currentLevel: levelInfo.currentLevel ?? 1,
        nextLevel: levelInfo.nextLevel ?? (levelInfo.currentLevel ?? 1) + 1,
        xpIntoCurrentLevel: levelInfo.xpIntoCurrentLevel ?? 0,
        xpNeededForNextLevel: levelInfo.xpNeededForNextLevel ?? 0,
        progressPercentage: levelInfo.progressPercentage ?? 0,
        totalXp: levelInfo.totalXp ?? 0,
    };
}

/**
 * Is a learning goal actually SET?
 *
 * A brand-new account has `targetIeltsBand: null` and `targetExamDate: null`. Rendering
 * a progress bar against a null target would show 0% towards nothing, so the screen
 * branches on this instead.
 */
export function hasTarget(goals) {
    return Boolean(goals && (goals.targetIeltsBand != null || goals.targetExamDate != null));
}

/** Days until the target exam date, or null when there is no date or it has passed. */
export function daysUntil(dateString, now = new Date()) {
    if (!dateString) return null;
    const target = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(target.getTime())) return null;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((target - today) / 86_400_000);
    return days > 0 ? days : null;
}

/* ------------------------------------------------------------------ avatar */

/**
 * The avatar's fallback: the first two letters of the display name.
 *
 * `avatarUrl` is nullable and IS null for a new account (verified), and a broken
 * `<img src={null}>` renders the browser's broken-image glyph — so the screen needs a
 * deterministic stand-in rather than a conditional blank.
 */
export function avatarInitials(displayName) {
    const name = String(displayName ?? '').trim();
    return name ? name.slice(0, 2).toUpperCase() : '?';
}

/** The avatar URL, or null when there is nothing to point an `<img>` at. */
export function readAvatarUrl(profile) {
    const url = profile?.avatarUrl;
    return typeof url === 'string' && url.trim() !== '' ? url.trim() : null;
}

/* ----------------------------------------------------------- band progress */

/**
 * The four IELTS skills `bandProgress` reports, in display order.
 *
 * The label keys are a STATIC map on purpose: `t(\`profilePage.skills.${skill}\`)` is
 * invisible to `scripts/i18n-audit.mjs`, which scans for literal keys, so a typo or a
 * renamed key would ship as a raw key string in the UI.
 */
export const BAND_SKILLS = ['listening', 'reading', 'writing', 'speaking'];

export const SKILL_LABEL_KEYS = {
    listening: 'profilePage.skills.listening',
    reading: 'profilePage.skills.reading',
    writing: 'profilePage.skills.writing',
    speaking: 'profilePage.skills.speaking',
};

/**
 * Is this band a real MEASUREMENT?
 *
 * Verified live: a new account's `bandProgress` is
 * `{ listening: { current: 0.0, previous: 0.0 }, …, overall: { current: 0.0, previous: 0.0 } }`.
 * A zero there means "nothing has been graded yet", NOT band 0.0 — a learner with no
 * attempts has no band, and printing `0.0` would state a score the backend never measured.
 * So 0 (and a missing value) is "chưa đo" and renders as "—".
 */
export function isMeasuredBand(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0;
}

export function readBandProgress(bandProgress) {
    const rows = BAND_SKILLS.map((skill) => {
        const entry = bandProgress?.[skill] ?? {};
        const measured = isMeasuredBand(entry.current);
        return {
            skill,
            labelKey: SKILL_LABEL_KEYS[skill],
            measured,
            current: measured ? Number(entry.current) : null,
            previous: isMeasuredBand(entry.previous) ? Number(entry.previous) : null,
        };
    });

    const overall = bandProgress?.overall ?? {};

    return {
        rows,
        anyMeasured: rows.some((row) => row.measured),
        overall: isMeasuredBand(overall.current) ? Number(overall.current) : null,
        overallPrevious: isMeasuredBand(overall.previous) ? Number(overall.previous) : null,
    };
}

/**
 * The learner's current overall band, or null when nothing has been measured.
 *
 * Two sources, in order: `profile.overallBand` (sent by `/user/profile/summary`) and
 * `bandProgress.overall.current` (sent by `/user/profile`, which has NO `overallBand`
 * field at all — verified against the DTO and the live payload). Reading only
 * `profile.overallBand` therefore silently never rendered a band on this screen.
 * A zero from either source is "chưa đo", not band 0.
 */
export function readOverallBand(profile) {
    if (isMeasuredBand(profile?.overallBand)) return Number(profile.overallBand);
    return isMeasuredBand(profile?.bandProgress?.overall?.current)
        ? Number(profile.bandProgress.overall.current)
        : null;
}

/* -------------------------------------------------------------- vocabulary */

/**
 * `vocabProgress` and `dictionaryStats` overlap but are not the same object, so both
 * are read and merged with an explicit precedence — no value is ever invented:
 *
 *   vocabProgress   { totalWords, masteredWords, reviewingWords }
 *   dictionaryStats { totalWords, favoriteWords, wordsToReviewToday, newWords,
 *                     learningWords, masteredWords }
 *
 * `masteryPercentage` is null when there is nothing to divide by, because 0 of 0 words
 * is not 0% mastery — it is no data yet.
 */
export function readVocabulary(vocabProgress, dictionaryStats) {
    const vocab = vocabProgress ?? {};
    const dictionary = dictionaryStats ?? {};
    const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

    const totalWords = num(vocab.totalWords ?? dictionary.totalWords);
    const masteredWords = num(vocab.masteredWords ?? dictionary.masteredWords);

    return {
        totalWords,
        masteredWords,
        reviewingWords: num(vocab.reviewingWords),
        wordsToReviewToday: num(dictionary.wordsToReviewToday),
        favoriteWords: num(dictionary.favoriteWords),
        newWords: num(dictionary.newWords),
        learningWords: num(dictionary.learningWords),
        masteryPercentage: totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : null,
    };
}

/**
 * `weakSkills` is a list of plain strings. For a brand-new account the backend already
 * returns a default (`["Academic Vocabulary", "Map Labeling"]`, verified) — so the UI
 * must present these as SUGGESTED focus areas and must not claim they were measured from
 * the learner's own work.
 */
export function readWeakSkills(weakSkills) {
    if (!Array.isArray(weakSkills)) return [];
    return weakSkills.filter((skill) => typeof skill === 'string' && skill.trim() !== '');
}

export function useProfile() {
    const loader = useCallback(() => profileApi.getProfile().then(unwrapData), []);
    const { data, loading, error, reload } = useAsyncData(loader, 'user-profile');

    const level = useMemo(() => readLevel(data?.levelInfo), [data?.levelInfo]);
    const band = useMemo(() => readBandProgress(data?.bandProgress), [data?.bandProgress]);
    const vocabulary = useMemo(
        () => readVocabulary(data?.vocabProgress, data?.dictionaryStats),
        [data?.vocabProgress, data?.dictionaryStats]
    );
    const weakSkills = useMemo(() => readWeakSkills(data?.weakSkills), [data?.weakSkills]);
    const overallBand = useMemo(() => readOverallBand(data), [data]);

    return {
        profile: data ?? null,
        level,
        band,
        vocabulary,
        weakSkills,
        overallBand,
        avatarUrl: readAvatarUrl(data),
        loading,
        error,
        reload,
    };
}

/** Save learning goals. The PUT takes the full profile payload. */
export function useUpdateProfile() {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const save = useCallback(async (patch) => {
        setSaving(true);
        setError(null);
        try {
            const response = await profileApi.updateProfile(patch);
            return unwrapData(response);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setSaving(false);
        }
    }, []);

    return { save, saving, error };
}
