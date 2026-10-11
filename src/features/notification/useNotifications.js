import { useCallback, useMemo, useState } from 'react';
import { notificationApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';
import { mergeNotificationItem, countUnread, matchesNotificationFilter } from './notificationFormatters';
import { NOTIFICATION_PAGE_SIZE } from './notificationConstants';

/**
 * The notification centre: list, unread count, and the read/delete mutations.
 *
 * Contract CONFIRMED against the backend DTO and the ported api module:
 *
 *   GET   /notifications?page&size  -> PageResponse<NotificationResponse>
 *         item { id, type, title, body, priority, isRead, actionUrl, referenceType,
 *                referenceId, metadata, createdAt, readAt }
 *   GET   /notifications/unread-count
 *   PATCH /notifications/{id}/read
 *   PATCH /notifications/read-all
 *   DELETE /notifications/{id}
 *
 * THREE DECISIONS THAT SHAPED THIS HOOK rather than the screen:
 *
 *  1. **The list is NOT polled.** A notification centre that refetches on a timer spends
 *     a request every few seconds to learn nothing. The realtime socket is what should
 *     push; until it is mounted, the list refetches on mount, on filter change and when
 *     the user acts. `mergeNotificationItem` exists so a pushed item cannot duplicate a
 *     row a refetch already delivered.
 *  2. **Read and delete are OPTIMISTIC and revert on failure.** Tapping a notification
 *     must feel instant, and a failed write must never leave the UI claiming it worked.
 *  3. **`isRead` is the field, not `read`.** v1's `matchesNotificationFilter` reads
 *     `item.read`, which the backend never sends — so that filter matched "unread" for
 *     every notification and "read" for none. The v2 helper uses `isRead`.
 */

export function useNotifications({ page = 0, size = NOTIFICATION_PAGE_SIZE, status = 'ALL', type = 'ALL' } = {}) {
    const key = `notifications|${page}|${size}`;

    const loader = useCallback(
        () => notificationApi.getNotifications({ page, size }).then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );

    const { data, loading, error, reload } = useAsyncData(loader, key);

    /* A local overlay holds optimistic changes until the next successful refetch, and
       holds pushed items so a realtime notification appears without a refetch. */
    const [overrides, setOverrides] = useState({});
    const [pushed, setPushed] = useState([]);
    const [busyId, setBusyId] = useState(null);
    const [actionError, setActionError] = useState(null);

    const items = useMemo(() => {
        const merged = (data?.items ?? []).map((item) =>
            overrides[item.id] ? { ...item, ...overrides[item.id] } : item
        );
        /* A pushed item replaces a row with the same id rather than appearing twice. */
        const withPushed = pushed.reduce(
            (acc, item) => mergeNotificationItem(acc, item, Math.max(acc.length, size)),
            merged
        );
        return withPushed.filter((item) => matchesNotificationFilter(item, { status, type }));
    }, [data?.items, overrides, pushed, size, status, type]);

    const markRead = useCallback(async (id) => {
        setBusyId(id);
        setActionError(null);
        setOverrides((current) => ({ ...current, [id]: { isRead: true } }));
        try {
            await notificationApi.markAsRead(id);
            return true;
        } catch (err) {
            /* Revert: never leave the UI claiming a write that failed. */
            setOverrides((current) => {
                const next = { ...current };
                delete next[id];
                return next;
            });
            setActionError(err);
            return false;
        } finally {
            setBusyId(null);
        }
    }, []);

    const markAllRead = useCallback(async () => {
        setBusyId('__all__');
        setActionError(null);
        const snapshot = overrides;
        const optimistic = {};
        for (const item of data?.items ?? []) optimistic[item.id] = { isRead: true };
        setOverrides(optimistic);
        try {
            await notificationApi.markAllAsRead();
            /* Refetch so the server's `readAt` timestamps replace the optimistic flags. */
            reload();
            return true;
        } catch (err) {
            setOverrides(snapshot);
            setActionError(err);
            return false;
        } finally {
            setBusyId(null);
        }
    }, [data?.items, overrides, reload]);

    const remove = useCallback(
        async (id) => {
            setBusyId(id);
            setActionError(null);

            /* Remember WHERE it came from, so a failed delete puts it back in the right
               list. Restoring a pushed item into `overrides` would leave it invisible. */
            const fromPush = pushed.find((item) => item.id === id) ?? null;

            setOverrides((current) => ({ ...current, [id]: { __hidden: true } }));
            setPushed((current) => current.filter((item) => item.id !== id));

            try {
                await notificationApi.deleteNotification(id);
                reload();
                return true;
            } catch (err) {
                setOverrides((current) => {
                    const next = { ...current };
                    delete next[id];
                    return next;
                });
                if (fromPush) setPushed((current) => mergeNotificationItem(current, fromPush));
                setActionError(err);
                return false;
            } finally {
                setBusyId(null);
            }
        },
        [data?.items, pushed, reload]
    );

    return {
        items: items.filter((item) => !item.__hidden),
        totalElements: data?.totalElements ?? 0,
        unreadCount: countUnread(items),
        loading,
        error,
        busyId,
        actionError,
        markRead,
        markAllRead,
        remove,
        /** For the realtime path: insert without a refetch. */
        push: (item) => setPushed((current) => mergeNotificationItem(current, item)),
        reload,
    };
}

/**
 * The unread badge count.
 *
 * Fetched separately from the list because a header needs it on every screen while the
 * list is needed on one.
 *
 * THE FIELD IS `unreadCount`, NOT A BARE NUMBER — verified against the running backend:
 * `GET /notifications/unread-count` answers `{ success, message, data: { unreadCount: 0 } }`.
 * The ported version read `data?.count`, which never exists, so the badge silently read 0
 * forever and every unread notification was invisible. `count` is still accepted as a
 * fallback in case a proxy or an older backend flattens it, but the real field comes first.
 */
export function useUnreadCount() {
    const loader = useCallback(() => notificationApi.getUnreadCount().then(unwrapData), []);
    const { data, loading, error, reload } = useAsyncData(loader, 'notifications-unread-count');
    return {
        count: typeof data === 'number' ? data : (data?.unreadCount ?? data?.count ?? 0),
        loading,
        error,
        reload,
    };
}
