import { useEffect, useRef } from 'react';
import { useRealtimeStomp } from '../contexts/RealtimeStompContextCore';

function parseMessage(message, fallback = null) {
    try {
        return JSON.parse(message.body);
    } catch (error) {
        console.error('Failed to parse notification realtime payload:', error);
        return fallback;
    }
}

export function useNotificationRealtime({
    enabled,
    userId,
    onNotification,
    onUnreadCount,
}) {
    const onNotificationRef = useRef(onNotification);
    const onUnreadCountRef = useRef(onUnreadCount);
    const { isConnected, subscribe } = useRealtimeStomp();

    useEffect(() => {
        onNotificationRef.current = onNotification;
    }, [onNotification]);

    useEffect(() => {
        onUnreadCountRef.current = onUnreadCount;
    }, [onUnreadCount]);

    useEffect(() => {
        if (!enabled || !userId) {
            return undefined;
        }

        const unsubscribeNotification = subscribe(
            `/topic/notifications/${userId}/new`,
            (message) => {
                const payload = parseMessage(message);
                if (payload) {
                    onNotificationRef.current?.(payload);
                }
            }
        );
        const unsubscribeUnreadCount = subscribe(
            `/topic/notifications/${userId}/unread-count`,
            (message) => {
                const payload = parseMessage(message, {
                    unreadCount: 0,
                });
                onUnreadCountRef.current?.(payload);
            }
        );

        return () => {
            unsubscribeNotification();
            unsubscribeUnreadCount();
        };
    }, [enabled, subscribe, userId]);

    return {
        isConnected: Boolean(enabled && userId && isConnected),
    };
}

export default useNotificationRealtime;
