import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeStomp } from '../contexts/RealtimeStompContextCore';

function getAuthenticatedUserId(user) {
    return user?.id || user?.userId || user?.sub || user?.orgMemberId || null;
}

/**
 * STOMP hook for speaking conversation — connects to the shared realtime client,
 * subscribes to /topic/speaking-conversation/{userId}.
 * Provides startConversation() and submitTurn() via STOMP publish.
 */
export function useConversationStomp() {
    const [lastResponse, setLastResponse] = useState(null);
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
            `/topic/speaking-conversation/${userId}`,
            (message) => {
                try {
                    const data = JSON.parse(message.body);
                    setLastResponse(data);
                    setWaitingConnectionVersion(null);
                    callbackRef.current?.(data);
                } catch (error) {
                    console.error('[ConversationStomp] Parse error', error);
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
                const published = publish('/app/speaking-conversation', body);
                if (!published) {
                    setWaitingConnectionVersion(null);
                }
                return published;
            } catch (error) {
                console.error('[ConversationStomp] Publish failed', error);
                setWaitingConnectionVersion(null);
                return false;
            }
        },
        [connectionVersion, isConnected, publish, userId]
    );

    const startConversation = useCallback(
        (topicId) =>
            publishConversation({
                action: 'start',
                topicId,
            }),
        [publishConversation]
    );

    const submitTurn = useCallback(
        (
            conversationId,
            transcript,
            audioUrl,
            timeSpentSeconds,
            speechAnalytics
        ) =>
            publishConversation({
                action: 'submit',
                conversationId,
                transcript,
                audioUrl,
                timeSpentSeconds,
                speechAnalytics,
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
        lastResponse,
        startConversation,
        submitTurn,
        onResponse,
        userId,
    };
}
