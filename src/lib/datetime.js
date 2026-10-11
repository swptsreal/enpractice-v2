import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

/**
 * `L` / `LT` are LOCALIZED formats, and `dayjs` only understands them once the
 * `localizedFormat` plugin is registered. Without it, `format('L')` returns the
 * literal string "L" — which is exactly what happened on the first run of this
 * module's tests, and would have shipped a notebook showing "L" where a date
 * belongs. The plugin is extended here rather than in `AppProviders` so the module
 * is correct on its own, including under test.
 */
dayjs.extend(localizedFormat);

/**
 * Date helpers.
 *
 * `dayjs` locale is set from the resolved language in `AppProviders`, so these
 * format in the reader's language without the caller passing one. That matters
 * because the backend sends ISO instants (`2026-10-14T05:15:54.737Z`) and printing
 * one straight into the UI is how a Vietnamese screen ends up showing
 * `2026-10-14T05:15:54.737Z`.
 *
 * All the formatters return `null` for a missing or unparseable value rather than
 * the string "Invalid Date", so a caller can branch on it.
 */

function parse(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
}

/** `14/10/2026` (or `10/14/2026` in English). */
export function formatDate(value) {
    return parse(value)?.format('L') ?? null;
}

/** `14/10/2026 12:15`. */
export function formatDateTime(value) {
    return parse(value)?.format('L LT') ?? null;
}

/** `trong 3 ngày` / `3 days ago`, relative to now. */
export function formatRelative(value) {
    const parsed = parse(value);
    if (!parsed) return null;
    const days = parsed.startOf('day').diff(dayjs().startOf('day'), 'day');
    if (days === 0) return { unit: 'day', value: 0 };
    return { unit: 'day', value: days };
}

/**
 * Is this instant at or before now?
 *
 * Used for review scheduling. Note that `nextReviewAt` is ALWAYS set once a word
 * exists — a freshly added word gets one immediately (verified: a new word came back
 * with `nextReviewAt` two hours in the future). So "has a nextReviewAt" cannot mean
 * "due"; only comparing against now can.
 */
export function isDue(value) {
    const parsed = parse(value);
    if (!parsed) return false;
    return !parsed.isAfter(dayjs());
}

export default { formatDate, formatDateTime, formatRelative, isDue };
