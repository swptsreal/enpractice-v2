import { useCallback, useEffect, useState } from 'react';
import { speakingApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';
import { detectFillers, buildSpeechAnalytics } from '../speaking/useSpeaking';

/* A data hook must start its request in an effect and set its loading flag before it
   starts; the rule is right about component code and wrong about this primitive. */
/* eslint-disable react-hooks/set-state-in-effect */

/**
 * Custom speaking conversation (screen 27).
 *
 * Contract CONFIRMED against the backend DTOs and the running backend:
 *
 *   POST /custom-speaking-conversations/start
 *        body { topic, style, personality, expertise, voiceName, gradingEnabled }
 *        -> CustomConversationStepResponse
 *           { conversationId, title, turnNumber, aiMessage, conversationComplete,
 *             gradingEnabled, status, userTurnCount, maxUserTurns, voiceName }
 *   POST /custom-speaking-conversations/{id}/turn
 *        body { transcript, audioUrl, timeSpentSeconds, speechAnalytics }
 *        -> the SAME step response, with the next AI message
 *   POST /custom-speaking-conversations/{id}/finish  -> the same step response
 *   GET  /custom-speaking-conversations/{id}          -> CustomConversationResponse
 *        adds status, totalTurns, timeSpentSeconds, the four criterion scores,
 *        overallScore, aiFeedback, startedAt, completedAt, gradedAt, and `turns[]`
 *   GET  /custom-speaking-conversations?page&size     -> PageResponse
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
 *  6. **`topic` is free text** (a `@NotBlank` String), not an enum, so the composer is a
 *     real text field rather than a picker.
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

const isGradingStatus = (status) => status === 'GRADING' || status === 'SUBMITTED';

export function useConversationHistory({ page = 0, size = 10 } = {}) {
    const key = `custom-conversations|${page}|${size}`;
    const loader = useCallback(
        () => speakingApi.getCustomConversations({ page, size }).then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data, loading, error, reload } = useAsyncData(loader, key);
    return { items: data?.items ?? [], totalElements: data?.totalElements ?? 0, loading, error, reload };
}

/**
 * One conversation: the AI's most recent message, and the local transcript log.
 *
 * The step response does NOT include the messages so far, so the log is kept client-side
 * as turns are exchanged. Re-opening a finished conversation reads `turns[]` from the
 * detail endpoint instead, which is why `useConversationDetail` exists separately.
 */
export function useCustomConversation() {
    const [step, setStep] = useState(null);
    const [log, setLog] = useState([]);
    const [starting, setStarting] = useState(false);
    const [sending, setSending] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState(null);

    /* Extracted so the callbacks depend on a plain binding rather than step?.id: the
       React Compiler infers step from a property read and refuses to preserve the
       manual memoization when the dependency is narrower than what it infers. */
    const conversationId = step?.conversationId ?? null;

    const start = useCallback(async (config) => {
        setStarting(true);
        setError(null);
        try {
            const response = await speakingApi.startCustomConversation(config);
            const data = unwrapData(response);
            setStep(data);
            setLog([{ role: 'assistant', text: data.aiMessage, turnNumber: data.turnNumber }]);
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setStarting(false);
        }
    }, []);

    const sendTurn = useCallback(
        async ({ transcript, timeSpentSeconds }) => {
            if (!conversationId) return false;
            setSending(true);
            setError(null);

            /* The user's line appears immediately; the reply replaces the waiting state. */
            setLog((current) => [...current, { role: 'user', text: transcript }]);

            try {
                const response = await speakingApi.submitCustomConversationTurn(conversationId, {
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
                });
                const data = unwrapData(response);
                setStep(data);
                setLog((current) => [
                    ...current,
                    { role: 'assistant', text: data.aiMessage, turnNumber: data.turnNumber },
                ]);
                return true;
            } catch (err) {
                setError(err);
                return false;
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
            const response = await speakingApi.finishCustomConversation(conversationId);
            const data = unwrapData(response);
            setStep(data);
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setFinishing(false);
        }
    }, [conversationId]);

    return {
        step,
        log,
        conversationId,
        maxUserTurns: step?.maxUserTurns ?? null,
        userTurnCount: step?.userTurnCount ?? 0,
        complete: Boolean(step?.conversationComplete),
        gradingEnabled: step?.gradingEnabled ?? false,
        starting,
        sending,
        finishing,
        error,
        start,
        sendTurn,
        finish,
        reset: () => {
            setStep(null);
            setLog([]);
            setError(null);
        },
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
        reload: () => setNonce((n) => n + 1),
    };
}
