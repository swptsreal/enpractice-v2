import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getCurrentLanguage } from '../../i18n';

/**
 * Relative time for a notification, in the reader's language.
 *
 * `relativeTime` is a dayjs PLUGIN and `fromNow()` throws without it — the same class of
 * trap as `format('L')` returning the literal "L" when `localizedFormat` was not
 * registered, which this codebase already hit once. It is extended here, at the module
 * that needs it, so the module is correct on its own including under test.
 *
 * The locale comes from `getCurrentLanguage()` rather than `i18next.language`, because
 * the app resolves its language explicitly (English is a user action, never inferred
 * from the browser) and dayjs must agree with i18n about which one is active.
 */
dayjs.extend(relativeTime);

function locale() {
    return getCurrentLanguage() === 'vi' ? 'vi' : 'en';
}

/** `3 giờ trước` / `3 hours ago`. */
export function formatNotificationTime(value) {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.locale(locale()).fromNow() : null;
}

/**
 * Where an `actionUrl` should take the reader.
 *
 * An external URL must open in a new tab with `rel="noopener noreferrer"`; an internal
 * path must go through the router. Treating them the same is how a notification becomes
 * an open-redirect or a full page reload that loses app state.
 */
export function resolveNotificationAction(actionUrl) {
    if (!actionUrl) return null;
    if (/^https?:\/\//i.test(actionUrl)) return { kind: 'external', value: actionUrl };
    return { kind: 'internal', value: actionUrl };
}

/** Status/type filtering, applied client-side over the fetched page. */
export function matchesNotificationFilter(item, { status = 'ALL', type = 'ALL' } = {}) {
    const matchesStatus =
        status === 'ALL' ||
        (status === 'UNREAD' && !item?.isRead) ||
        (status === 'READ' && Boolean(item?.isRead));
    const matchesType = type === 'ALL' || item?.type === type;
    return matchesStatus && matchesType;
}

/**
 * Insert or replace one notification at the top of a list.
 *
 * Used by the realtime path: an incoming notification must not duplicate a row that a
 * refetch already delivered.
 */
export function mergeNotificationItem(items, incoming, limit = items.length + 1) {
    if (!incoming?.id) return items;
    return [incoming, ...items.filter((item) => item.id !== incoming.id)].slice(0, limit);
}

/** Count of unread entries in a fetched page. */
export function countUnread(items) {
    return (items ?? []).filter((item) => !item?.isRead).length;
}
