import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeStomp } from '../contexts/RealtimeStompContextCore';

function getAuthenticatedUserId(user) {
    return user?.id || user?.userId || user?.sub || user?.orgMemberId || null;
}

export function useCustomConversationStomp() {
    const [waitingConnectionVersion, setWaitingConnectionVersion] =
        useState(null);
    const callbackRef = useRef(null);
    const { user } = useAuth();
    const { connectionVersion, isConnected, publish, subscribe } =
        useRealtimeStomp();
    const userId = getAuthenticatedUserId(user);
    useEffect(() => {
        if (!userId) {
            return undefined;
        }

        return subscribe(
            `/topic/custom-speaking-conversation/${userId}`,
            (message) => {
                try {
                    const data = JSON.parse(message.body);
                    setWaitingConnectionVersion(null);
                    callbackRef.current?.(data);
                } catch (error) {
                    console.error(
                        '[CustomConversationStomp] Parse error',
                        error
                    );
                }
            }
        );
    }, [subscribe, userId]);

    const publishConversation = useCallback(
        (body) => {
            if (!userId || !isConnected) {
                return false;
            }

            try {
                setWaitingConnectionVersion(connectionVersion);
                const published = publish(
                    '/app/custom-speaking-conversation',
                    body
                );
                if (!published) {
                    setWaitingConnectionVersion(null);
                }
                return published;
            } catch (error) {
                console.error(
                    '[CustomConversationStomp] Publish failed',
                    error
                );
                setWaitingConnectionVersion(null);
                return false;
            }
        },
        [connectionVersion, isConnected, publish, userId]
    );

    const startConversation = useCallback(
        (payload) =>
            publishConversation({
                action: 'start',
                ...payload,
            }),
        [publishConversation]
    );

    const submitTurn = useCallback(
        (payload) =>
            publishConversation({
                action: 'submit',
                ...payload,
            }),
        [publishConversation]
    );

    const finishConversation = useCallback(
        (conversationId) =>
            publishConversation({
                action: 'finish',
                conversationId,
            }),
        [publishConversation]
    );

    const onResponse = useCallback((callback) => {
        callbackRef.current = callback;
    }, []);

    return {
        isConnected: Boolean(userId && isConnected),
        isWaiting: Boolean(
            isConnected && waitingConnectionVersion === connectionVersion
        ),
        startConversation,
        submitTurn,
        finishConversation,
        onResponse,
    };
}
