import { useCallback, useEffect, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '../api';
import aiChatApi from '../api/aiChatApi';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeStomp } from '../contexts/RealtimeStompContextCore';
import {
    GUEST_ERROR_CODES,
    REALTIME_MODES,
} from '../features/guest-ai-trial/guestAiTrialConstants';
import {
    getQuotaBlockedUntil,
    isQuotaBlocked,
} from '../features/guest-ai-trial/guestAiTrialState';
import {
    mergeChatMessages,
    normalizeHistoryPage,
} from '../features/chat/chatHistoryMapper';
import {
    buildChatRequest,
    getChatRealtimeContract,
    normalizeChatContent,
} from '../features/chat/chatRealtimeContract';
import {
    applyIncomingEvent,
    createOptimisticUserMessage,
    getRetryableMessage,
    interruptStreamingMessages,
    markMessageSendFailed,
    markUnresolvedSendingMessages,
    normalizeStoredMessages,
} from '../features/chat/chatMessageState';
import {
    clearChatHistory,
    getChatHistory,
    saveChatHistory,
} from '../utils/chatStorage';

const HISTORY_PAGE_SIZE = 50;

function getAuthenticatedUserId() {
    const accessToken = getAccessToken();
    if (!accessToken) return null;
    try {
        return jwtDecode(accessToken).sub || null;
    } catch (error) {
        console.error('Failed to decode token', error);
        return null;
    }
}

function createClientMessageId() {
    return (
        globalThis.crypto?.randomUUID?.() ||
        'chat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10)
    );
}

export function useStompClient() {
    const [messages, setMessages] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [chatBlockedUntil, setChatBlockedUntil] = useState(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(false);
    const [scrollToLatestSignal, setScrollToLatestSignal] = useState(0);
    const [historyHydrationSignal, setHistoryHydrationSignal] = useState(0);
    const identityRef = useRef(null);
    const modeRef = useRef(REALTIME_MODES.IDLE);
    const messagesRef = useRef([]);
    const identityGenerationRef = useRef(0);
    const historyLoadedIdentityRef = useRef(null);
    const initialAttemptIdentityRef = useRef(null);
    const historyCursorRef = useRef(null);
    const hasMoreHistoryRef = useRef(false);
    const olderLoadingRef = useRef(false);
    const reconcilePromiseRef = useRef(null);
    const wasConnectedRef = useRef(false);
    const hasConnectedRef = useRef(false);
    const { isAuthenticated } = useAuth();
    const {
        guestSession,
        guestTrialStatus,
        handleGuestError,
        isConnected,
        ensureConnected,
        publish,
        subscribe,
    } = useRealtimeStomp();

    const updateMessages = useCallback((updater) => {
        setMessages((previous) => {
            const next =
                typeof updater === 'function' ? updater(previous) : updater;
            messagesRef.current = next;
            if (
                modeRef.current === REALTIME_MODES.GUEST &&
                identityRef.current
            ) {
                saveChatHistory(identityRef.current, next);
            }
            return next;
        });
    }, []);

    const setActiveIdentity = useCallback((identity, mode) => {
        if (identityRef.current === identity && modeRef.current === mode) {
            return;
        }

        identityGenerationRef.current += 1;
        identityRef.current = identity;
        modeRef.current = mode;
        historyLoadedIdentityRef.current = null;
        initialAttemptIdentityRef.current = null;
        historyCursorRef.current = null;
        hasMoreHistoryRef.current = false;
        olderLoadingRef.current = false;
        reconcilePromiseRef.current = null;
        wasConnectedRef.current = false;
        hasConnectedRef.current = false;
        setCurrentUserId(identity);
        setHasMoreHistory(false);
        setIsLoadingOlder(false);
        setIsHistoryLoading(
            mode === REALTIME_MODES.AUTHENTICATED && Boolean(identity)
        );

        const nextMessages =
            mode === REALTIME_MODES.GUEST && identity
                ? normalizeStoredMessages(getChatHistory(identity))
                : [];
        messagesRef.current = nextMessages;
        setMessages(nextMessages);
    }, []);

    const fetchHistoryPage = useCallback(
        async ({
            beforeSequence,
            initial = false,
            reconcileSending = false,
        } = {}) => {
            const identity = identityRef.current;
            const generation = identityGenerationRef.current;
            if (!identity || modeRef.current !== REALTIME_MODES.AUTHENTICATED) {
                return null;
            }

            if (initial) {
                setIsHistoryLoading(true);
            }

            try {
                const response = await aiChatApi.getMessages({
                    beforeSequence,
                    limit: HISTORY_PAGE_SIZE,
                });
                if (
                    generation !== identityGenerationRef.current ||
                    identity !== identityRef.current ||
                    modeRef.current !== REALTIME_MODES.AUTHENTICATED
                ) {
                    return null;
                }

                const normalized = normalizeHistoryPage(
                    response?.messages,
                    identity
                );
                const persistedClientMessageIds = new Set(
                    normalized
                        .filter((message) => message.role === 'user')
                        .map((message) => message.clientMessageId)
                        .filter(Boolean)
                );

                updateMessages((previous) => {
                    const merged = mergeChatMessages(previous, normalized);
                    return reconcileSending
                        ? markUnresolvedSendingMessages(
                              merged,
                              persistedClientMessageIds
                          )
                        : merged;
                });

                if (initial) {
                    historyLoadedIdentityRef.current = identity;
                    historyCursorRef.current =
                        response?.nextBeforeSequence ?? null;
                    hasMoreHistoryRef.current = Boolean(response?.hasMore);
                    setHasMoreHistory(Boolean(response?.hasMore));
                    clearChatHistory(identity);
                    setHistoryHydrationSignal((signal) => signal + 1);
                }

                return response;
            } catch {
                return null;
            } finally {
                if (
                    initial &&
                    generation === identityGenerationRef.current &&
                    identity === identityRef.current
                ) {
                    setIsHistoryLoading(false);
                }
            }
        },
        [updateMessages]
    );

    const reconcileLatestHistory = useCallback(
        ({ reconcileSending = false } = {}) => {
            if (
                modeRef.current !== REALTIME_MODES.AUTHENTICATED ||
                !identityRef.current
            ) {
                return Promise.resolve(null);
            }
            if (reconcilePromiseRef.current) {
                return reconcilePromiseRef.current;
            }

            const identity = identityRef.current;
            const initial = historyLoadedIdentityRef.current !== identity;
            if (initial) {
                initialAttemptIdentityRef.current = identity;
            }

            const request = fetchHistoryPage({
                initial,
                reconcileSending,
            }).finally(() => {
                if (reconcilePromiseRef.current === request) {
                    reconcilePromiseRef.current = null;
                }
            });
            reconcilePromiseRef.current = request;
            return request;
        },
        [fetchHistoryPage]
    );

    useEffect(() => {
        const mode = isAuthenticated
            ? REALTIME_MODES.AUTHENTICATED
            : REALTIME_MODES.GUEST;
        const identity = isAuthenticated
            ? getAuthenticatedUserId()
            : guestSession?.guestId || null;
        let cancelled = false;
        queueMicrotask(() => {
            if (!cancelled) setActiveIdentity(identity, mode);
        });
        return () => {
            cancelled = true;
        };
    }, [guestSession?.guestId, isAuthenticated, setActiveIdentity]);

    useEffect(() => {
        const targetMode = isAuthenticated
            ? REALTIME_MODES.AUTHENTICATED
            : REALTIME_MODES.GUEST;
        const identity = isAuthenticated ? getAuthenticatedUserId() : null;
        if (isAuthenticated && !identity) return undefined;
        const contract = getChatRealtimeContract(targetMode, identity);

        return subscribe(contract.queue, (message) => {
            try {
                const event = JSON.parse(message.body);
                if (!isAuthenticated) {
                    if (
                        event.errorCode === GUEST_ERROR_CODES.DAILY_LIMIT ||
                        event.errorCode === GUEST_ERROR_CODES.IP_DAILY_LIMIT
                    ) {
                        setChatBlockedUntil((current) =>
                            getQuotaBlockedUntil(current, event)
                        );
                    }
                    if (
                        event.errorCode === GUEST_ERROR_CODES.TOKEN_EXPIRED ||
                        event.errorCode === GUEST_ERROR_CODES.TRIAL_DISABLED ||
                        event.errorCode === GUEST_ERROR_CODES.TRIAL_UNAVAILABLE
                    ) {
                        handleGuestError(event).catch(() => {});
                    }
                }

                updateMessages((previous) =>
                    applyIncomingEvent(previous, event)
                );

                if (event.type === 'START') {
                    setScrollToLatestSignal((signal) => signal + 1);
                }
                if (
                    isAuthenticated &&
                    (event.type === 'COMPLETE' || event.type === 'ERROR')
                ) {
                    reconcileLatestHistory().catch(() => {});
                }
            } catch (error) {
                console.error('Failed to parse message', error);
            }
        });
    }, [
        handleGuestError,
        isAuthenticated,
        isConnected,
        reconcileLatestHistory,
        subscribe,
        updateMessages,
    ]);

    useEffect(() => {
        if (
            !isAuthenticated ||
            !currentUserId ||
            !isConnected ||
            initialAttemptIdentityRef.current === currentUserId
        ) {
            return;
        }

        initialAttemptIdentityRef.current = currentUserId;
        reconcileLatestHistory().catch(() => {});
    }, [currentUserId, isAuthenticated, isConnected, reconcileLatestHistory]);

    useEffect(() => {
        if (!isAuthenticated || !currentUserId) {
            wasConnectedRef.current = isConnected;
            return;
        }

        const wasConnected = wasConnectedRef.current;
        if (isConnected) {
            if (hasConnectedRef.current && !wasConnected) {
                reconcileLatestHistory({ reconcileSending: true }).catch(
                    () => {}
                );
            }
            hasConnectedRef.current = true;
        }
        wasConnectedRef.current = isConnected;
    }, [currentUserId, isAuthenticated, isConnected, reconcileLatestHistory]);

    useEffect(() => {
        if (!isQuotaBlocked(chatBlockedUntil)) return undefined;
        const delay = Math.max(0, chatBlockedUntil - Date.now());
        const timeoutId = setTimeout(() => setChatBlockedUntil(null), delay);
        return () => clearTimeout(timeoutId);
    }, [chatBlockedUntil]);

    const activate = useCallback(async () => {
        const nextSnapshot = await ensureConnected();
        const mode = nextSnapshot.mode;
        const identity =
            mode === REALTIME_MODES.AUTHENTICATED
                ? getAuthenticatedUserId()
                : nextSnapshot.guestSession?.guestId || null;
        setActiveIdentity(identity, mode);
        return nextSnapshot;
    }, [ensureConnected, setActiveIdentity]);

    const publishUserMessage = useCallback(
        async ({ content, clientMessageId }) => {
            if (isQuotaBlocked(chatBlockedUntil)) return false;

            let connection;
            try {
                connection = await activate();
            } catch {
                return false;
            }

            const mode = connection.mode;
            const identity =
                mode === REALTIME_MODES.AUTHENTICATED
                    ? getAuthenticatedUserId()
                    : connection.guestSession?.guestId || null;
            if (!identity) return false;

            let normalizedContent;
            try {
                normalizedContent = normalizeChatContent(
                    content,
                    mode === REALTIME_MODES.GUEST
                        ? undefined
                        : Number.MAX_SAFE_INTEGER
                );
            } catch {
                return false;
            }

            const contract = getChatRealtimeContract(mode, identity);
            const request = buildChatRequest({
                mode,
                clientMessageId,
                content: normalizedContent,
                identity,
            });

            updateMessages((previous) => {
                const interrupted = interruptStreamingMessages(previous);
                const existingIndex = interrupted.findIndex(
                    (message) =>
                        message.role === 'user' &&
                        message.clientMessageId === clientMessageId
                );
                if (existingIndex >= 0) {
                    const next = [...interrupted];
                    next[existingIndex] = {
                        ...next[existingIndex],
                        content: normalizedContent,
                        senderId: identity,
                        status: 'sending',
                        errorCode: null,
                    };
                    return next;
                }
                return [
                    ...interrupted,
                    createOptimisticUserMessage({
                        clientMessageId,
                        content: normalizedContent,
                        senderId: identity,
                        timestamp:
                            request.timestamp || new Date().toISOString(),
                    }),
                ];
            });
            setScrollToLatestSignal((signal) => signal + 1);

            if (publish(contract.destination, request)) {
                return true;
            }

            updateMessages((previous) =>
                markMessageSendFailed(previous, clientMessageId)
            );
            return false;
        },
        [activate, chatBlockedUntil, publish, updateMessages]
    );

    const sendMessage = useCallback(
        (content) =>
            publishUserMessage({
                content,
                clientMessageId: createClientMessageId(),
            }),
        [publishUserMessage]
    );

    const retryMessage = useCallback(
        (clientMessageId) => {
            const retryable = getRetryableMessage(
                messagesRef.current,
                clientMessageId
            );
            if (!retryable) return Promise.resolve(false);

            return publishUserMessage({
                content: retryable.content,
                clientMessageId,
            });
        },
        [publishUserMessage]
    );

    const loadOlderMessages = useCallback(async () => {
        const beforeSequence = historyCursorRef.current;
        if (
            modeRef.current !== REALTIME_MODES.AUTHENTICATED ||
            !historyLoadedIdentityRef.current ||
            !hasMoreHistoryRef.current ||
            beforeSequence === null ||
            olderLoadingRef.current
        ) {
            return false;
        }

        olderLoadingRef.current = true;
        setIsLoadingOlder(true);
        try {
            const response = await fetchHistoryPage({ beforeSequence });
            if (!response) return false;

            historyCursorRef.current = response.nextBeforeSequence ?? null;
            hasMoreHistoryRef.current = Boolean(response.hasMore);
            setHasMoreHistory(Boolean(response.hasMore));
            return true;
        } finally {
            olderLoadingRef.current = false;
            setIsLoadingOlder(false);
        }
    }, [fetchHistoryPage]);

    const clearHistory = useCallback(() => {
        if (modeRef.current !== REALTIME_MODES.GUEST || !identityRef.current) {
            return;
        }
        clearChatHistory(identityRef.current);
        messagesRef.current = [];
        setMessages([]);
    }, []);

    const isTyping = messages.some((message) => message.status === 'streaming');
    const isBlocked = isQuotaBlocked(chatBlockedUntil);

    return {
        messages,
        sendMessage,
        retryMessage,
        activate,
        isConnected,
        isTyping,
        isBlocked,
        chatBlockedUntil,
        currentUserId,
        clearHistory,
        guestTrialStatus,
        isAuthenticated,
        isHistoryLoading,
        isLoadingOlder,
        hasMoreHistory,
        loadOlderMessages,
        scrollToLatestSignal,
        historyHydrationSignal,
    };
}
