import { useCallback, useEffect, useRef, useState } from 'react';
import { speakingApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';
import { detectFillers, buildSpeechAnalytics } from '../speaking/useSpeaking';

/* A data hook must start its request in an effect and set its loading flag before it
   starts; the rule is right about component code and wrong about this primitive. */
/* eslint-disable react-hooks/set-state-in-effect */

/**
 * Custom speaking (screens 27–27e).
 *
 * Contract CONFIRMED against the backend DTOs and the running backend:
 *
 *   POST /custom-speaking-conversations/start
 *        body { topic, style, personality, expertise, voiceName, gradingEnabled }
 *        -> CustomConversationStepResponse
 *   POST /custom-speaking-conversations/{id}/turn
 *        body { transcript, audioUrl, timeSpentSeconds, speechAnalytics }
 *        -> the SAME step response, with the next AI message
 *   POST /custom-speaking-conversations/{id}/finish  -> the same step response
 *   GET  /custom-speaking-conversations/{id}          -> CustomConversationResponse
 *        adds status, totalTurns, timeSpentSeconds, the four criteria scores,
 *        overallScore, aiFeedback, startedAt, completedAt, gradedAt, and `turns[]`
 *   GET  /custom-speaking-conversations?page&size     -> PageResponse
 *   GET  /custom-speaking-templates                   -> the seeded catalogue + own
 *   GET  /custom-speaking-templates/{id}              -> one visible template
 *   POST /custom-speaking-templates                   -> save the caller's configuration
 *   DELETE /custom-speaking-templates/{id}            -> own templates only
 *
 * SIX THINGS VERIFIED LIVE:
 *
 *  1. **`turn` returns the NEXT AI message, not an echo.** So a turn is ONE request: send
 *     the transcript, receive the reply. There is no separate poll for the response.
 *  2. **`maxUserTurns` DEFAULTS TO 50**, not the 10 the backend's own env var
 *     (`CUSTOM_SPEAKING_CONVERSATION_MAX_USER_TURNS=10`) suggests. The UI must read it
 *     from the response rather than hard-coding either number.
 *  3. **After `/finish` the status becomes `GRADING`, not `COMPLETED`.** Grading is
 *     asynchronous, like Writing and Speaking, so a finished conversation must not be
 *     shown as graded with a null band.
 *  4. **`gradingEnabled` is a per-conversation choice.** With it off, `overallScore` and
 *     `aiFeedback` stay null by design — that is a practice conversation, not a marked one.
 *  5. The style, personality and expertise enums each have 10–13 values including some
 *     adult-adjacent ones (`FLIRTY`, `UNFILTERED`, `EDGY`, `REBELLIOUS`). They are exposed
 *     as the backend defines them rather than curated away, because silently hiding options
 *     the API accepts is its own kind of dishonesty; the labels are neutral.
 *  6. **`topic` is free text** (a `@NotBlank` String), not an enum, so the set-up is a real
 *     text field — and a template stores that text together with the other five fields.
 *
 * THE CHARGE HAPPENS ONCE, AT START. `CustomConversationSpeakingServiceImpl#startConversation`
 * charges `SPEAKING_START` keyed by the new conversation id; submitting a turn charges
 * nothing. The screen used to claim `AI_CHAT` per turn, which was the wrong action and the
 * wrong moment, so no send control on 27c carries a price.
 *
 * THE CONVERSATION LIVES ON THE SERVER. `GET /{id}` returns `turns[]`, and each row holds
 * the partner's line and the learner's transcript, so 27c rebuilds its log after a reload
 * instead of losing the exchange. The pending question is the last row whose
 * `userTranscript` is null.
 */

export const STYLES = [
    'CASUAL',
    'PROFESSIONAL',
    'ENCOURAGING',
    'CHALLENGING',
    'PLAYFUL',
    'FLIRTY',
    'DEEP',
    'DEBATE',
    'STREET',
    'UNFILTERED',
];

export const PERSONALITIES = [
    'FRIENDLY',
    'HUMOROUS',
    'PATIENT',
    'STRAIGHTFORWARD',
    'CONFIDENT',
    'CURIOUS',
    'EMPATHETIC',
    'BOLD',
    'FLIRTY',
    'EDGY',
    'REBELLIOUS',
];

export const EXPERTISES = [
    'GENERAL',
    'BUSINESS',
    'TECHNOLOGY',
    'EDUCATION',
    'TRAVEL',
    'RELATIONSHIPS',
    'ENTERTAINMENT',
    'GAMING',
    'FITNESS',
    'PSYCHOLOGY',
    'SOCIAL_MEDIA',
];

export const VOICES = [
    { id: 'US_NEURAL_J', labelKey: 'customSpeaking.voice.US_NEURAL_J' },
    { id: 'US_NEURAL_I', labelKey: 'customSpeaking.voice.US_NEURAL_I' },
    { id: 'US_NEURAL_F', labelKey: 'customSpeaking.voice.US_NEURAL_F' },
    { id: 'US_NEURAL_C', labelKey: 'customSpeaking.voice.US_NEURAL_C' },
    { id: 'US_NEURAL_H', labelKey: 'customSpeaking.voice.US_NEURAL_H' },
    { id: 'US_STUDIO_O', labelKey: 'customSpeaking.voice.US_STUDIO_O' },
    { id: 'US_CHIRP_F', labelKey: 'customSpeaking.voice.US_CHIRP_F' },
];

/** The label for a set-up option, as a static key so the i18n audit can see it. */
export function optionLabelKey(group, value) {
    return `customSpeaking.option.${group}.${value}`;
}

const IN_PROGRESS = 'IN_PROGRESS';
const isGradingStatus = (status) => status === 'GRADING' || status === 'SUBMITTED';

/** The gallery: the seeded catalogue plus the caller's saved configurations. */
export function useCustomTemplates() {
    const loader = useCallback(() => speakingApi.getCustomSpeakingTemplates().then(unwrapData), []);
    const { data, loading, error, reload } = useAsyncData(loader, 'custom-speaking-templates');
    return { templates: data ?? [], loading, error, reload };
}

/** One template, used by 27b to prefill the form after "Chỉnh lại". */
export function useCustomTemplate(templateId) {
    const loader = useCallback(
        () =>
            templateId
                ? speakingApi.getCustomSpeakingTemplate(templateId).then(unwrapData)
                : Promise.resolve(null),
        [templateId]
    );
    const { data, loading, error, reload } = useAsyncData(loader, `custom-speaking-template|${templateId ?? ''}`);
    return { template: data ?? null, loading, error, reload };
}

/** The start request. It charges once; the returned conversation is opened by the caller. */
export function useStartCustomConversation() {
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState(null);

    const start = useCallback(async (config) => {
        setStarting(true);
        setError(null);
        try {
            return unwrapData(await speakingApi.startCustomConversation(config));
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setStarting(false);
        }
    }, []);

    return { start, starting, error };
}

/** The log is rebuilt from the server's turns: the partner's line, then the answer to it. */
export function logFromTurns(turns) {
    const log = [];
    for (const turn of turns ?? []) {
        if (turn.aiMessage) {
            log.push({ role: 'assistant', text: turn.aiMessage, turnNumber: turn.turnNumber });
        }
        if (turn.userTranscript) {
            log.push({ role: 'user', text: turn.userTranscript, turnNumber: turn.turnNumber });
        }
    }
    return log;
}

/**
 * One conversation, open or resumed (screen 27c).
 *
 * The screen never renders a locally-created conversation: starting navigates to the
 * conversation's own route and this hook reads it back, so a refresh and a "Tiếp tục" from
 * history take exactly the same path.
 */
export function useConversationSession(conversationId) {
    const [conversation, setConversation] = useState(null);
    const [log, setLog] = useState([]);
    const [loading, setLoading] = useState(Boolean(conversationId));
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        let cancelled = false;
        if (!conversationId) {
            setLoading(false);
            return undefined;
        }

        (async () => {
            setLoading(true);
            try {
                const data = unwrapData(await speakingApi.getCustomConversation(conversationId));
                if (cancelled) return;
                setConversation(data);
                setLog(logFromTurns(data?.turns));
                setError(null);
            } catch (err) {
                if (cancelled) return;
                setError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [conversationId, nonce]);

    const sendTurn = useCallback(
        async ({ transcript, timeSpentSeconds }) => {
            if (!conversationId) return null;
            setSending(true);
            setError(null);

            /* The learner's line appears immediately; the reply replaces the waiting state.
               It is NOT rolled back on failure: the server may have stored the turn before the
               response was lost, and deleting the learner's words would hide what happened. */
            setLog((current) => [...current, { role: 'user', text: transcript }]);

            try {
                const data = unwrapData(
                    await speakingApi.submitCustomConversationTurn(conversationId, {
                        transcript,
                        audioUrl: null,
                        timeSpentSeconds,
                        /* Only what the browser can honestly measure, same rule as the Speaking
                           module: no invented pause or confidence figures. */
                        speechAnalytics: buildSpeechAnalytics({
                            transcript,
                            seconds: timeSpentSeconds,
                            fillers: detectFillers(transcript),
                        }),
                    })
                );

                setConversation((current) =>
                    current
                        ? {
                              ...current,
                              title: data.title ?? current.title,
                              status: data.status ?? current.status,
                              userTurnCount: data.userTurnCount ?? current.userTurnCount,
                              maxUserTurns: data.maxUserTurns ?? current.maxUserTurns,
                          }
                        : current
                );
                if (data.aiMessage) {
                    setLog((current) => [
                        ...current,
                        { role: 'assistant', text: data.aiMessage, turnNumber: data.turnNumber },
                    ]);
                }
                return data;
            } catch (err) {
                setError(err);
                return null;
            } finally {
                setSending(false);
            }
        },
        [conversationId]
    );

    const finish = useCallback(async () => {
        if (!conversationId) return null;
        setFinishing(true);
        setError(null);
        try {
            return unwrapData(await speakingApi.finishCustomConversation(conversationId));
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setFinishing(false);
        }
    }, [conversationId]);

    const reload = useCallback(() => setNonce((n) => n + 1), []);

    return {
        conversation,
        log,
        conversationId,
        inProgress: conversation?.status === IN_PROGRESS,
        maxUserTurns: conversation?.maxUserTurns ?? null,
        userTurnCount: conversation?.userTurnCount ?? 0,
        gradingEnabled: conversation?.gradingEnabled ?? false,
        complete: conversation?.status !== IN_PROGRESS && conversation?.status != null,
        loading,
        sending,
        finishing,
        error,
        sendTurn,
        finish,
        reload,
    };
}

/**
 * The history list (screen 27d), paged and accumulated.
 *
 * The first page is fetched by an effect; "Tải thêm" is an event, so StrictMode's double
 * effect cannot append the same page twice. Rows are de-duplicated by id anyway, because a
 * conversation started between two page loads shifts the offset.
 */
export function useConversationHistory({ size = 10 } = {}) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [loadMoreError, setLoadMoreError] = useState(null);
    const [nonce, setNonce] = useState(0);
    const latest = useRef(0);

    useEffect(() => {
        const id = ++latest.current;
        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                const data = readPage(await speakingApi.getCustomConversations({ page: 0, size }));
                if (cancelled || id !== latest.current) return;
                setItems(data.items);
                setTotal(data.totalElements);
                setPage(0);
                setError(null);
            } catch (err) {
                if (cancelled || id !== latest.current) return;
                setError(err);
            } finally {
                if (id === latest.current) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [size, nonce]);

    const hasMore = items.length < total;

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        setLoadMoreError(null);
        try {
            const next = page + 1;
            const data = readPage(await speakingApi.getCustomConversations({ page: next, size }));
            setItems((current) => {
                const seen = new Set(current.map((item) => item.id));
                return [...current, ...data.items.filter((item) => !seen.has(item.id))];
            });
            setPage(next);
            setTotal(data.totalElements);
        } catch (err) {
            /* The rows already on screen are still valid; replacing the whole list with an error
               panel would throw away a history the learner can read. */
            setLoadMoreError(err);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, page, size]);

    return {
        items,
        total,
        loading,
        loadingMore,
        error,
        loadMoreError,
        hasMore,
        loadMore,
        reload: () => setNonce((n) => n + 1),
    };
}

/**
 * A finished conversation, polled while it is being graded.
 *
 * `/finish` returns status `GRADING`, not `COMPLETED` (verified), so a screen that rendered
 * the score immediately would show a null band as if it were a result.
 */
export function useConversationDetail(conversationId, { poll = true } = {}) {
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(Boolean(conversationId));
    const [error, setError] = useState(null);
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let timer = null;
        if (!conversationId) {
            setLoading(false);
            return undefined;
        }

        async function fetchOnce() {
            try {
                const response = await speakingApi.getCustomConversation(conversationId);
                if (cancelled) return;
                const data = unwrapData(response);
                setConversation(data);
                setError(null);
                setLoading(false);
                if (poll && isGradingStatus(data?.status)) {
                    timer = setTimeout(fetchOnce, 4000);
                }
            } catch (err) {
                if (cancelled) return;
                setError(err);
                setLoading(false);
            }
        }

        fetchOnce();
        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [conversationId, poll, nonce]);

    return {
        conversation,
        loading,
        error,
        grading: isGradingStatus(conversation?.status),
        failed: conversation?.status === 'FAILED',
        reload: () => setNonce((n) => n + 1),
    };
}
