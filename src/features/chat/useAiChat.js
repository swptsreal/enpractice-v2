import { useCallback, useEffect, useMemo, useState } from 'react';
import { aiChatApi } from '../../api';
import { unwrapData } from '../../api/envelope';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeStomp } from '../../contexts/RealtimeStompContextCore';
import { REALTIME_MODES } from '../guest-ai-trial/guestAiTrialConstants';
import {
    applyIncomingEvent,
    createOptimisticUserMessage,
    markMessageSendFailed,
    markUnresolvedSendingMessages,
    normalizeStoredMessages,
    interruptStreamingMessages,
} from './chatMessageState';
import { getChatRealtimeContract, buildChatRequest, normalizeChatContent } from './chatRealtimeContract';
import { normalizeHistoryPage } from './chatHistoryMapper';

/* A data hook must start its request in an effect and set its loading flag before it
   starts; the rule is right about component code and wrong about this primitive. */
/* eslint-disable react-hooks/set-state-in-effect */

/**
 * The AI coach conversation.
 *
 * Contract CONFIRMED from the backend DTO and the ported contract module:
 *
 *   GET  /ai-chat/messages?limit&beforeSequence -> history
 *   SEND /app/realtime-chat                      { clientMessageId, content, senderId }
 *   RECV /topic/realtime-chat/{identity}         (authenticated)
 *        /user/queue/public/realtime-chat        (guest)
 *        event { requestId, messageId, clientMessageId, type, content, senderId,
 *                isFinal, errorCode, requiredCredit, availableCredit, ... }
 *
 * THE STATE MACHINE IS v1'S, PORTED UNCHANGED AND ALREADY TESTED. `chatMessageState`
 * owns the hard part — folding START/DELTA/COMPLETE/ERROR frames into a message list,
 * holding an optimistic user bubble until the server echoes it, and marking unresolved
 * sends on disconnect. It ships with its own `node:test` suite, so this hook only has to
 * wire it to the socket and the history endpoint rather than re-derive it.
 *
 * THREE THINGS THAT ARE DELIBERATE:
 *
 *  1. **The subscription is keyed on `connectionVersion`.** A reconnect produces a NEW
 *     server-side session; a subscription taken on the old one is dead. Ignoring the
 *     version means the coach appears connected and silently receives nothing.
 *  2. **A send while disconnected marks the bubble as failed rather than dropping it.**
 *     The text is the user's work; losing it silently is the worst outcome here.
 *  3. **Content is capped at 1000 characters by `normalizeChatContent`**, which throws
 *     `INVALID_REQUEST`. The composer enforces the same limit so the throw is a backstop,
 *     not the user's experience.
 */

const MAX_CHARACTERS = 1000;

export function useAiChat({ historyLimit = 50 } = {}) {
    const { user, isAuthenticated } = useAuth();
    const { subscribe, publish, isConnected, ensureConnected, connectionVersion } = useRealtimeStomp();

    const mode = isAuthenticated ? REALTIME_MODES.AUTHENTICATED : REALTIME_MODES.GUEST;
    /* The authenticated queue is `/topic/realtime-chat/{identity}`, so the identity must
     * be the same value the server put in the topic. `id` is what the backend uses. */
    const identity = user?.id ?? user?.userId ?? user?.sub ?? null;

    const [messages, setMessages] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(null);
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState(null);
    const [streaming, setStreaming] = useState(false);

    const contract = useMemo(() => getChatRealtimeContract(mode, identity), [mode, identity]);

    /* --- history ---------------------------------------------------------- */
    useEffect(() => {
        let cancelled = false;
        setHistoryLoading(true);

        aiChatApi
            .getMessages({ limit: historyLimit })
            .then((response) => {
                if (cancelled) return;
                const data = unwrapData(response);
                /* The endpoint may return a bare array or a page; the mapper handles both. */
                const normalized = Array.isArray(data) ? normalizeHistoryPage(data, identity) : normalizeStoredMessages(data);
                setMessages(normalized);
                setHistoryError(null);
            })
            .catch((err) => {
                if (!cancelled) setHistoryError(err);
            })
            .finally(() => {
                if (!cancelled) setHistoryLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [historyLimit, identity]);

    /* --- the incoming stream --------------------------------------------- */
    /**
     * RE-SUBSCRIBES ON `connectionVersion`.
     *
     * A reconnect produces a NEW server-side session, and a subscription taken against
     * the old one is dead. Without this dependency the coach looks connected and silently
     * receives nothing — the failure mode that is hardest to notice, because the UI shows
     * a live socket and a send that appears to work.
     */
    useEffect(() => {
        if (!contract?.queue) return undefined;

        return subscribe(contract.queue, (frame) => {
            let event;
            try {
                event = JSON.parse(frame.body);
            } catch {
                return;
            }
            setMessages((prev) => applyIncomingEvent(prev, event));
            if (event.type === 'COMPLETE' || event.type === 'ERROR') setStreaming(false);
            if (event.type === 'DELTA') setStreaming(true);
        });
    }, [contract?.queue, subscribe, connectionVersion]);

    /**
     * A dropped connection leaves any in-flight send unresolved forever.
     * Mark them instead, so the user sees an unfinished message rather than a bubble that
     * spins until they reload.
     */
    useEffect(() => {
        if (isConnected) return;
        setMessages((prev) => markUnresolvedSendingMessages(prev));
    }, [isConnected]);

    /* --- send ------------------------------------------------------------- */
    const send = useCallback(
        async (rawContent) => {
            setSendError(null);

            let content;
            try {
                content = normalizeChatContent(rawContent, MAX_CHARACTERS);
            } catch {
                setSendError(new Error('INVALID_REQUEST'));
                return false;
            }

            const clientMessageId =
                globalThis.crypto?.randomUUID?.() ?? `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

            setMessages((prev) => [
                ...prev,
                createOptimisticUserMessage({ clientMessageId, content, senderId: identity }),
            ]);
            setSending(true);

            try {
                await ensureConnected();
            } catch {
                setMessages((prev) => markMessageSendFailed(prev, clientMessageId));
                setSending(false);
                setSendError(new Error('CONNECTION_CLOSED'));
                return false;
            }

            const published = publish(
                contract.destination,
                buildChatRequest({ mode, clientMessageId, content, identity })
            );

            if (!published) {
                setMessages((prev) => markMessageSendFailed(prev, clientMessageId));
                setSending(false);
                setSendError(new Error('CONNECTION_CLOSED'));
                return false;
            }

            setStreaming(true);
            setSending(false);
            return true;
        },
        [contract.destination, ensureConnected, identity, mode, publish]
    );

    const retry = useCallback(
        (content) => {
            setMessages((prev) => interruptStreamingMessages(prev));
            return send(content);
        },
        [send]
    );

    return {
        messages,
        historyLoading,
        historyError,
        sending,
        sendError,
        streaming,
        isConnected,
        maxCharacters: MAX_CHARACTERS,
        send,
        retry,
        reload: () => setMessages([]),
    };
}

export default useAiChat;
