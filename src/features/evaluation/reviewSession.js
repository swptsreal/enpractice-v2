/**
 * The review session's model: what to review, how an answer is graded, and how a
 * finished session is summarised and stored.
 *
 * EVERYTHING HERE IS PURE, and that is the point. The three steps of the review flow are three
 * routes, so the selection has to survive a navigation and a reload, and the grading has to be
 * the same function in the practice step and in its test. Anything with a date, a clamp, an
 * answer comparison or a percentage lives here rather than in a component.
 *
 * THE CONTRACT IS THE BACKEND'S, NOT A DESIGN DRAFT'S. `GET /records/review-words` and
 * `GET /records/review-counts` accept `rangeMode` ∈ {range, week, month, all}, `from`/`to` as
 * YYYY-MM-DD, `week` as ISO YYYY-Www, `month` as YYYY-MM, `group` ∈ {unreviewed, wrong, all} and
 * `limit` (the server clamps it to 1..300, default 20). `GET /records/review-counts` answers
 * `{unreviewed, wrong, all}`. `POST /reviews` requires a `sessionId`, a `startedAt`, a
 * `durationSeconds` in 1..10800, a non-blank `filter`, and a `words` array.
 *
 * The constants below are that contract, spelled once. An earlier draft of this screen offered
 * four hand-picked "content" modes and a third "Mixed" direction; none of the three existed on the
 * wire, which is what designing before reading the contract costs.
 */

import { checkMeaning, checkEnglishWord } from '../../utils/translateApi';

export const REVIEW_RANGE_MODES = ['range', 'week', 'month', 'all'];
export const REVIEW_GROUP_KEYS = ['unreviewed', 'wrong', 'all'];

/**
 * The two directions, in the app's own vocabulary.
 *
 * `MIXED` was removed with the redesign. The server keeps ONE `direction` string verbatim and has
 * no per-word direction, so "Mixed" could only ever have been a label that lied about what the
 * session would show.
 */
export const REVIEW_DIRECTIONS = ['EN_TO_VI', 'VI_TO_EN'];

/** The server's own ceiling (`ReviewWindowUtil.MAX_LIMIT`); anything higher is clamped there. */
export const MAX_REVIEW_LIMIT = 300;
export const DEFAULT_REVIEW_LIMIT = 20;

/** `ReviewSessionRequest` rejects a duration outside this range with a 400. */
export const MAX_SESSION_SECONDS = 10800;

export const REVIEW_PRESETS = ['allHistory', 'last7', 'last30', 'thisWeek', 'thisMonth', 'custom'];

/**
 * The `words` parameter, sanitised.
 *
 * `GET /records/review-words` accepts a comma-separated list of NORMALISED words that narrows the
 * candidate set (verified in `RecordServiceImpl.normalizeWordFilter`), and it is the only way to ask
 * for an exact list — every group filter is coarser than "the three I just got wrong". The server
 * caps `limit` at 300, so a longer list would be a request it cannot honour; the list is truncated
 * rather than refused, because asking for 300 of 500 is better than refusing the whole retry.
 */
export function sanitizeWordFilter(value) {
    const list = String(value ?? '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
    return list.slice(0, MAX_REVIEW_LIMIT);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-\d{2}$/;
const WEEK_PATTERN = /^(\d{4})-W(\d{2})$/;

/**
 * Shape is not enough: `2026-13` fits `YYYY-MM` and `2026-02-31` fits `YYYY-MM-DD`.
 *
 * These values arrive from the query string, which a learner can edit, and they are forwarded
 * straight into a request — so anything that is not a real date would come back from the server as a
 * 400 the screen cannot explain. The round-trip check is what catches 31 February: a Date built from
 * it rolls over into March, so the formatted result no longer matches the input.
 */
export function isIsoDate(value) {
    const text = String(value ?? '');
    if (!DATE_PATTERN.test(text)) return false;
    const [year, month, day] = text.split('-').map(Number);
    if (year < 1970 || year > 2999 || month < 1 || month > 12 || day < 1 || day > 31) return false;
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    );
}

export function isIsoMonth(value) {
    const text = String(value ?? '');
    if (!MONTH_PATTERN.test(text)) return false;
    const [year, month] = text.split('-').map(Number);
    return year >= 1970 && year <= 2999 && month >= 1 && month <= 12;
}

/* ------------------------------------------------------------------ dates */

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toIsoDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

export function toMonthValue(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Monday of the ISO week containing `date`, then that week's label.
 *
 * ISO weeks start on Monday and week 1 is the week containing 4 January, so a week label cannot be
 * derived from "days since 1 January". This mirrors the server's own `mondayOfIsoWeek`, and the
 * two must agree or a chosen week silently selects a different week on the server.
 */
export function startOfIsoWeek(date) {
    const day = startOfDay(date);
    const mondayOffset = (day.getDay() + 6) % 7;
    day.setDate(day.getDate() - mondayOffset);
    return day;
}

function isoWeekStart(year) {
    return startOfIsoWeek(new Date(year, 0, 4));
}

export function toIsoWeekLabel(date) {
    let year = date.getFullYear();
    let start = isoWeekStart(year);
    if (date < start) {
        year -= 1;
        start = isoWeekStart(year);
    }
    const days = Math.round((startOfDay(date) - start) / 86400000);
    return `${year}-W${String(Math.floor(days / 7) + 1).padStart(2, '0')}`;
}

/** The Monday a `YYYY-Www` label refers to, or null when the label is not one. */
export function mondayOfIsoWeek(label) {
    const match = WEEK_PATTERN.exec(String(label ?? '').trim());
    if (!match) return null;
    const week = Number(match[2]);
    if (week < 1 || week > 53) return null;
    const monday = isoWeekStart(Number(match[1]));
    monday.setDate(monday.getDate() + (week - 1) * 7);
    return toIsoWeekLabel(monday) === label ? monday : null;
}

/* ------------------------------------------------------- the selection */

/**
 * A preset turned into the parameters the API takes.
 *
 * `week` and `month` are NOT expressible as a from/to pair here on purpose: the server resolves
 * them itself, so sending a range instead would review a different set of words than the label
 * the learner picked.
 */
export function applyPreset(preset, now = new Date()) {
    const today = startOfDay(now);
    const daysAgo = (n) => {
        const d = new Date(today);
        d.setDate(d.getDate() - n);
        return d;
    };

    switch (preset) {
        case 'last7':
            return { rangeMode: 'range', from: toIsoDate(daysAgo(6)), to: toIsoDate(today), week: '', month: '' };
        case 'last30':
            return { rangeMode: 'range', from: toIsoDate(daysAgo(29)), to: toIsoDate(today), week: '', month: '' };
        case 'thisWeek':
            return { rangeMode: 'week', from: '', to: '', week: toIsoWeekLabel(today), month: '' };
        case 'thisMonth':
            return { rangeMode: 'month', from: '', to: '', week: '', month: toMonthValue(today) };
        case 'custom':
            return { rangeMode: 'range', from: toIsoDate(daysAgo(6)), to: toIsoDate(today), week: '', month: '' };
        case 'allHistory':
        default:
            return { rangeMode: 'all', from: '', to: '', week: '', month: '' };
    }
}

/** Which preset a set of parameters is currently expressing, so the chips can show state. */
export function presetFor(params, now = new Date()) {
    const mode = params?.rangeMode;
    if (mode === 'all') return 'allHistory';
    if (mode === 'week') return params.week === toIsoWeekLabel(startOfDay(now)) ? 'thisWeek' : 'custom';
    if (mode === 'month') return params.month === toMonthValue(now) ? 'thisMonth' : 'custom';
    if (mode === 'range') {
        if (params.from === applyPreset('last7', now).from && params.to === applyPreset('last7', now).to) return 'last7';
        if (params.from === applyPreset('last30', now).from && params.to === applyPreset('last30', now).to) return 'last30';
    }
    return 'custom';
}

/**
 * The window, as values a screen can format, plus whether it is complete.
 *
 * A half-filled custom range is NOT complete — `from` without `to` would be sent as a request the
 * server reads as "the last 7 days by default", which is a different window than the one the
 * screen is showing. `complete: false` lets the button say so instead.
 */
export function describeWindow(params) {
    const mode = REVIEW_RANGE_MODES.includes(params?.rangeMode) ? params.rangeMode : 'range';
    const descriptor = {
        kind: mode,
        from: isIsoDate(params?.from) ? params.from : '',
        to: isIsoDate(params?.to) ? params.to : '',
        week: mondayOfIsoWeek(params?.week) ? params.week : '',
        month: isIsoMonth(params?.month) ? params.month : '',
    };

    if (mode === 'all') return { ...descriptor, complete: true };
    if (mode === 'week') return { ...descriptor, complete: Boolean(descriptor.week) };
    if (mode === 'month') return { ...descriptor, complete: Boolean(descriptor.month) };
    return {
        ...descriptor,
        complete: Boolean(descriptor.from && descriptor.to && descriptor.from <= descriptor.to),
    };
}

/**
 * The window as a DATE RANGE the learner can read back, or '' when there are no days to name.
 *
 * The screen prints "Đang chọn: 2026-10-01 → 2026-10-13" — the RESOLVED bounds — rather than the name
 * of the preset chip that was pressed. The chip already shows its own pressed state, so repeating it
 * says nothing; the only question a preset name cannot answer is "which days, exactly". "Tuần này"
 * becomes a week the learner can check against a calendar.
 *
 * Week and month are resolved here rather than sent as a range, because the endpoint resolves them
 * itself — the label describes the window, it does not replace the parameter.
 *
 * All-history returns '' on purpose: there are no days to name, and the pressed "Toàn bộ" chip
 * already says so. A line reading "Đang chọn: Toàn bộ" is a sentence with no information in it.
 */
export function windowRangeLabel(descriptor) {
    if (!descriptor) return '';

    if (descriptor.kind === 'week') {
        const monday = mondayOfIsoWeek(descriptor.week);
        if (!monday) return '';
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        return `${toIsoDate(monday)} → ${toIsoDate(sunday)}`;
    }

    if (descriptor.kind === 'month') {
        const match = /^(\d{4})-(\d{2})$/.exec(String(descriptor.month ?? ''));
        if (!match) return '';
        const year = Number(match[1]);
        const month = Number(match[2]);
        return `${toIsoDate(new Date(year, month - 1, 1))} → ${toIsoDate(new Date(year, month, 0))}`;
    }

    return descriptor.from && descriptor.to ? `${descriptor.from} → ${descriptor.to}` : '';
}

/**
 * The session length, capped by what is actually available.
 *
 * Asking for 50 words when 8 exist is a promise the screen cannot keep, and the count shown next to
 * the slider would be a lie. `available` is the chosen group's own count, so the maximum IS the
 * answer to "how many have I got".
 */
export function clampLimit(limit, available) {
    const ceiling = Math.max(0, Math.min(Number(available) || 0, MAX_REVIEW_LIMIT));
    const wanted = Math.floor(Number(limit));
    if (!Number.isFinite(wanted) || wanted <= 0) return Math.min(DEFAULT_REVIEW_LIMIT, ceiling);
    return Math.min(wanted, ceiling);
}

/* --------------------------------------------------------- grading */

function acceptedMeanings(word) {
    if (Array.isArray(word?.acceptedMeaningsVi) && word.acceptedMeaningsVi.length) return word.acceptedMeaningsVi;
    return [word?.correctMeaning, ...(word?.alternatives ?? [])].filter(Boolean);
}

/** The one meaning to show as "the" answer — the learner's own first accepted sense. */
export function primaryMeaning(word) {
    return acceptedMeanings(word)[0] ?? '';
}

/**
 * Grade one typed answer.
 *
 * The comparison functions are the ported v1 ones, not new ones: they already handle case,
 * diacritic-insensitive matching and substring containment for Vietnamese meanings, which is exactly
 * the judgement a learner would make by hand. Writing a second grader would mean two rules for
 * "correct" in one product.
 */
export function gradeAnswer(input, word, direction) {
    const text = String(input ?? '').trim();
    if (!text) return { isCorrect: false, accepted: acceptedMeanings(word) };

    if (direction === 'VI_TO_EN') {
        const target = word?.englishWord ?? '';
        const normalized = word?.normalizedWord ?? '';
        const isCorrect =
            checkEnglishWord(text, target) || (Boolean(normalized) && checkEnglishWord(text, normalized));
        return { isCorrect, accepted: [target].filter(Boolean) };
    }

    const isCorrect = checkMeaning(text, word?.correctMeaning, word?.alternatives ?? [], word?.acceptedMeaningsVi ?? []);
    return { isCorrect, accepted: acceptedMeanings(word) };
}

/* --------------------------------------------------------- summary */

export function summarise(answers) {
    const list = Array.isArray(answers) ? answers : [];
    const total = list.length;
    const correct = list.filter((a) => a.isCorrect).length;
    const incorrect = total - correct;
    return {
        total,
        correct,
        incorrect,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        wrong: list.filter((a) => !a.isCorrect),
    };
}

/**
 * The four verdicts, at v1's thresholds.
 *
 * 90 / 70 / 50 is the split the old flow used and the copy for each of the four was written against
 * those bands, so the numbers travel with the words.
 */
export function ratingKey(accuracy) {
    if (accuracy >= 90) return 'excellent';
    if (accuracy >= 70) return 'good';
    if (accuracy >= 50) return 'improving';
    return 'needsReview';
}

/** `5:12`. Minutes are not zero-padded — "05:12" reads as a clock time, not a duration. */
export function formatClock(seconds) {
    const safe = Math.max(0, Math.floor(Number(seconds) || 0));
    const minutes = Math.floor(safe / 60);
    return `${minutes}:${String(safe % 60).padStart(2, '0')}`;
}

export function clampDuration(seconds) {
    return Math.min(MAX_SESSION_SECONDS, Math.max(1, Math.floor(Number(seconds) || 0)));
}

/* --------------------------------------------------- the wire format */

/**
 * Which words were reviewed, in one string.
 *
 * `POST /reviews` requires a non-blank `filter` and stores it verbatim, so it is written as
 * `key=value;…` rather than as v1's `mode:label|group:g`: a label was locale-dependent text inside a
 * stored field, which made two identical sessions look different in the database.
 */
export function buildFilter(params) {
    const window = describeWindow(params);
    const group = REVIEW_GROUP_KEYS.includes(params?.group) ? params.group : 'unreviewed';
    const wordFilter = sanitizeWordFilter(params?.words);
    /* `wordFilter` is a COUNT, not the list: the words themselves are already in the payload's
       `words[]`, and repeating a few hundred of them inside a single stored string would bloat the
       column to say something the same row already says. What it adds is the fact that this session
       was hand-picked rather than window-selected, which `group=all` alone would misrepresent. */
    const suffix = wordFilter.length ? `;wordFilter=${wordFilter.length}` : '';
    return `rangeMode=${window.kind};from=${window.from};to=${window.to};week=${window.week};month=${window.month};group=${group}${suffix}`;
}

/**
 * The stored direction, in the spelling the rows already use.
 *
 * The app's constants are `EN_TO_VI` / `VI_TO_EN`; every row v1 wrote uses `en-vi` / `vi-en`, and the
 * server validates neither. Translating here keeps one vocabulary in the UI and one in the data,
 * instead of two spellings of the same thing in a report.
 */
export function wireDirection(direction) {
    return direction === 'VI_TO_EN' ? 'vi-en' : 'en-vi';
}

export function buildSessionPayload({ sessionId, startedAt, durationSeconds, params, direction, answers }) {
    const summary = summarise(answers);
    return {
        sessionId,
        startedAt,
        durationSeconds: clampDuration(durationSeconds),
        filter: buildFilter(params),
        total: summary.total,
        correct: summary.correct,
        incorrect: summary.incorrect,
        accuracy: summary.accuracy,
        words: answers.map((a) => ({
            englishWord: a.englishWord,
            normalizedWord: a.normalizedWord || a.englishWord,
            isCorrect: a.isCorrect,
            givenAnswer: a.givenAnswer,
        })),
        direction: wireDirection(direction),
        rangeMode: describeWindow(params).kind,
        rangeFrom: describeWindow(params).from,
        rangeTo: describeWindow(params).to,
        week: describeWindow(params).week,
        month: describeWindow(params).month,
        group: REVIEW_GROUP_KEYS.includes(params?.group) ? params.group : 'unreviewed',
    };
}

/* --------------------------------------------------- the URL handoff */

/**
 * The selection, in the query string.
 *
 * Three routes means the choice has to outlive a component, and the query string is the only place
 * that also survives a reload and can be shared. Fields are omitted rather than sent empty so the
 * URL stays readable, and every value is validated on the way back in: a hand-edited `group=anything`
 * would otherwise reach the server and come back a 400 instead of a default.
 */
export function sessionSearch(params, direction) {
    const window = describeWindow(params);
    const query = new URLSearchParams();
    query.set('rangeMode', window.kind);
    if (window.from) query.set('from', window.from);
    if (window.to) query.set('to', window.to);
    if (window.week) query.set('week', window.week);
    if (window.month) query.set('month', window.month);
    query.set('group', REVIEW_GROUP_KEYS.includes(params?.group) ? params.group : 'unreviewed');
    query.set('limit', String(Number(params?.limit) || DEFAULT_REVIEW_LIMIT));
    query.set('direction', REVIEW_DIRECTIONS.includes(direction) ? direction : 'EN_TO_VI');
    const words = sanitizeWordFilter(params?.words);
    if (words.length) query.set('words', words.join(','));
    return query.toString();
}

export function parseSessionParams(searchParams) {
    const get = (key) => searchParams?.get(key) ?? '';
    const rawMode = get('rangeMode');
    const params = {
        rangeMode: REVIEW_RANGE_MODES.includes(rawMode) ? rawMode : 'range',
        from: isIsoDate(get('from')) ? get('from') : '',
        to: isIsoDate(get('to')) ? get('to') : '',
        week: mondayOfIsoWeek(get('week')) ? get('week') : '',
        month: isIsoMonth(get('month')) ? get('month') : '',
        group: REVIEW_GROUP_KEYS.includes(get('group')) ? get('group') : 'unreviewed',
        limit: Number(get('limit')) > 0 ? Math.min(Math.floor(Number(get('limit'))), MAX_REVIEW_LIMIT) : DEFAULT_REVIEW_LIMIT,
        words: sanitizeWordFilter(get('words')),
    };
    const rawDirection = get('direction');
    return {
        params,
        direction: REVIEW_DIRECTIONS.includes(rawDirection) ? rawDirection : 'EN_TO_VI',
    };
}
