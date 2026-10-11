import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { notificationApi } from '../api/notificationApi';
import { useNotificationCenter } from '../features/notification/useNotificationCenter';
import { normalizeLanguage } from '../i18n';
import { NOTIFICATION_PAGE_SIZE } from '../features/notification/constants/notificationTypes';
import {
    matchesNotificationFilter,
    mergeNotificationItem,
    normalizeNotificationPageResponse,
} from '../features/notification/utils/notificationFormatters';

function buildQueryParams({ page, size, statusFilter, typeFilter }) {
    return {
        page: Math.max(page - 1, 0),
        size,
        ...(statusFilter === 'READ'
            ? { read: true }
            : statusFilter === 'UNREAD'
              ? { read: false }
              : {}),
        ...(typeFilter !== 'ALL' ? { type: typeFilter } : {}),
    };
}

function createInitialData(size = NOTIFICATION_PAGE_SIZE) {
    return {
        page: 0,
        size,
        totalElements: 0,
        totalPages: 0,
        items: [],
    };
}

export function useNotificationsPage({ enabled = true } = {}) {
    const { i18n: i18nInstance } = useTranslation();
    const notificationCenter = useNotificationCenter();
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const language = normalizeLanguage(
        i18nInstance.resolvedLanguage || i18nInstance.language
    );
    const size = NOTIFICATION_PAGE_SIZE;
    const initialData = useMemo(() => createInitialData(size), [size]);
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(enabled);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');

    const fetchNotificationsPage = useCallback(
        async ({ page = 1, requestSize = size } = {}) => {
            const response = await notificationApi.getNotifications(
                buildQueryParams({
                    page,
                    size: requestSize,
                    statusFilter,
                    typeFilter,
                })
            );

            return normalizeNotificationPageResponse(response);
        },
        [size, statusFilter, typeFilter]
    );

    const loadNotifications = useCallback(
        async ({ silent = false } = {}) => {
            if (!enabled) {
                setData(initialData);
                setLoading(false);
                setLoadingMore(false);
                return null;
            }

            if (!silent) {
                setLoading(true);
            }
            setLoadingMore(false);
            setError('');

            try {
                const normalized = await fetchNotificationsPage();
                setData(normalized);
                return normalized;
            } catch (loadError) {
                setError(
                    loadError?.message ||
                        i18n.t('notificationCenter.messages.loadError')
                );
                throw loadError;
            } finally {
                if (!silent) {
                    setLoading(false);
                }
            }
        },
        [enabled, fetchNotificationsPage, initialData]
    );

    useEffect(() => {
        loadNotifications().catch(() => {});
    }, [language, loadNotifications]);

    useEffect(() => {
        if (
            !notificationCenter.lastRealtimeNotification ||
            !matchesNotificationFilter(
                notificationCenter.lastRealtimeNotification,
                {
                    statusFilter,
                    typeFilter,
                }
            )
        ) {
            return;
        }

        setData((prev) => {
            const alreadyExists = prev.items.some(
                (item) =>
                    item.id === notificationCenter.lastRealtimeNotification.id
            );
            const nextTotal = alreadyExists
                ? prev.totalElements
                : prev.totalElements + 1;
            const nextSize = prev.size || size;
            const itemLimit = Math.max(prev.items.length, 1);

            return {
                ...prev,
                totalElements: nextTotal,
                totalPages: Math.max(
                    prev.totalPages,
                    Math.ceil(nextTotal / nextSize)
                ),
                items: mergeNotificationItem(
                    prev.items,
                    notificationCenter.lastRealtimeNotification,
                    itemLimit
                ),
            };
        });
    }, [
        notificationCenter.lastRealtimeNotification,
        size,
        statusFilter,
        typeFilter,
    ]);

    const updateFilters = useCallback((nextStatusFilter, nextTypeFilter) => {
        setStatusFilter(nextStatusFilter);
        setTypeFilter(nextTypeFilter);
    }, []);

    const loadMoreNotifications = useCallback(async () => {
        if (!enabled || loading || loadingMore) {
            return null;
        }

        const nextPage = data.page + 2;
        const hasMorePages = nextPage <= data.totalPages;

        if (!hasMorePages) {
            return null;
        }

        setLoadingMore(true);
        setError('');

        try {
            const normalized = await fetchNotificationsPage({ page: nextPage });

            setData((prev) => {
                const existingIds = new Set(prev.items.map((item) => item.id));
                const nextItems = normalized.items.filter(
                    (item) => !existingIds.has(item.id)
                );

                return {
                    ...normalized,
                    items: [...prev.items, ...nextItems],
                };
            });

            return normalized;
        } catch (loadError) {
            setError(
                loadError?.message ||
                    i18n.t('notificationCenter.messages.loadMoreError')
            );
            throw loadError;
        } finally {
            setLoadingMore(false);
        }
    }, [
        data.page,
        data.totalPages,
        enabled,
        fetchNotificationsPage,
        loading,
        loadingMore,
    ]);

    const markNotificationRead = useCallback(
        async (notification) => {
            if (!notification || notification.read) {
                return;
            }

            setData((prev) => ({
                ...prev,
                items: prev.items.map((item) =>
                    item.id === notification.id
                        ? {
                              ...item,
                              read: true,
                              readAt: item.readAt || new Date().toISOString(),
                          }
                        : item
                ),
            }));

            try {
                await notificationCenter.markNotificationRead(notification.id);
            } catch (error) {
                loadNotifications({ silent: true }).catch(() => {});
                throw error;
            }
        },
        [loadNotifications, notificationCenter]
    );

    const markAllNotificationsRead = useCallback(async () => {
        const previousData = data;
        setData((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.read
                    ? item
                    : {
                          ...item,
                          read: true,
                          readAt: item.readAt || new Date().toISOString(),
                      }
            ),
        }));

        try {
            await notificationCenter.markAllNotificationsRead();
        } catch (error) {
            setData(previousData);
            throw error;
        }
    }, [data, notificationCenter]);

    const deleteNotification = useCallback(
        async (notification) => {
            if (!notification) return;

            setData((prev) => ({
                ...prev,
                items: prev.items.filter((item) => item.id !== notification.id),
                totalElements: Math.max(prev.totalElements - 1, 0),
                totalPages: Math.ceil(
                    Math.max(prev.totalElements - 1, 0) / (prev.size || size)
                ),
            }));

            try {
                await notificationCenter.deleteNotification(notification.id);
            } catch (error) {
                loadNotifications({ silent: true }).catch(() => {});
                throw error;
            }
        },
        [loadNotifications, notificationCenter, size]
    );

    const hasMore = data.page + 1 < data.totalPages;

    return {
        statusFilter,
        typeFilter,
        size,
        data,
        loading,
        loadingMore,
        hasMore,
        error,
        unreadCount: notificationCenter.unreadCount,
        setStatusFilter: (nextStatusFilter) =>
            updateFilters(nextStatusFilter, typeFilter),
        setTypeFilter: (nextTypeFilter) =>
            updateFilters(statusFilter, nextTypeFilter),
        loadNotifications,
        loadMoreNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
    };
}

export default useNotificationsPage;
