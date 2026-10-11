import { useCallback, useEffect, useMemo, useState } from 'react';
import { speakingApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';

/* A data hook must start its request in an effect and set its loading flag before it
   starts; the rule is right about component code and wrong about this primitive.
   Scoped to this file so every other file stays guarded. */
/* eslint-disable react-hooks/set-state-in-effect */

/**
 * The Speaking module: topic list, cue card, recorded attempt, asynchronous grading.
 *
 * Contract read from the backend DTOs and CONFIRMED against the running backend:
 *
 *   GET  /speaking/topics?page&size   -> PageResponse<SpeakingTopicListResponse>
 *        item { id, part, question, difficulty, createdAt }
 *   GET  /speaking/topics/{id}        -> SpeakingTopicResponse
 *        { id, part, question, cueCard, followUpQuestions[], difficulty,
 *          isPublished, createdAt, updatedAt }
 *   POST /speaking/topics/{id}/submit body { transcript, audioUrl, timeSpentSeconds,
 *                                             speechAnalytics }
 *   GET  /speaking/attempts/{id}      -> SpeakingAttemptResponse (re-read for grading)
 *   GET  /speaking/attempts?page&size -> PageResponse<...>
 *   POST /speaking/topics/highest-scores body { topicIds } ->
 *        [{ topicId, attempted, attemptId, conversationId, highestBandScore,
 *           status, sourceType, gradedAt }]
 *
 * FIVE things verified live:
 *
 *  1. **Grading is asynchronous**, exactly like Writing: submit returns
 *     `status: SUBMITTED` with a NULL band, then GRADING, then GRADED. Measured ~9 s.
 *  2. **`cueCard` is NULL for PART_3 topics** — the cue card is a Part 2 device, so
 *     the screen must not render an empty card or assume its presence.
 *  3. **Parts are `PART_1`, `PART_2`, `PART_3`.**
 *  4. **`speechAnalytics` is PARTLY CLIENT-SUPPLIED.** The submit request carries it,
 *     so the browser is expected to send what it can measure. `wordCount` and
 *     `wordsPerMinute` are computed from the transcript here; the fields the browser
 *     genuinely cannot measure (`avgPauseDurationMs`, `longPauseCount`,
 *     `avgWordConfidence`, `lowConfidenceWords`) are sent as null/absent rather than
 *     invented, and the result screen omits a metric it has no value for.
 *  5. **A submit with a transcript and NO audio is accepted** (HTTP 200), which is what
 *     makes the Web Speech API path viable without an upload.
 *
 * The AI grades honestly: an off-topic transcript returned FLU=5.5 with the others at
 * 6 and led with "Critical issue: off-topic response".
 */

export const PARTS = ['PART_1', 'PART_2', 'PART_3'];

export const isGrading = (status) => status === 'SUBMITTED' || status === 'GRADING';
export const isGraded = (status) => status === 'GRADED';
export const isGradingFailed = (status) => status === 'FAILED';

const POLL_MS = 4000;

/** Reading speed a fluent speaker naturally falls in. Used as CONTEXT, not a grade. */
export const NATURAL_WPM_RANGE = [120, 160];

/**
 * The analytics the browser can honestly report.
 *
 * `wordsPerMinute` is derived from the transcript length and the recording duration,
 * which is real measurement. Anything the browser cannot know — pause durations, word
 * confidence — is left out rather than filled with a plausible number: a fabricated
 * metric on a results screen is a lie the user cannot detect.
 */
export function buildSpeechAnalytics({ transcript, seconds, fillers = [] }) {
    const wordCount = countWords(transcript);
    const minutes = seconds > 0 ? seconds / 60 : 0;
    return {
        wordCount,
        wordsPerMinute: minutes > 0 ? Number((wordCount / minutes).toFixed(1)) : null,
        fillerWordCount: fillers.length || null,
        fillerWords: fillers.length ? fillers : null,
    };
}

export function countWords(text) {
    const trimmed = String(text ?? '').trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}

/**
 * Fillers we can detect in a transcript. Deliberately a short, explicit list rather
 * than a heuristic: a false positive here tells a learner they use a filler word they
 * do not use, which is worse than missing one.
 */
const FILLER_WORDS = ['um', 'uh', 'erm', 'ah', 'like', 'you know', 'i mean', 'basically', 'actually'];

/**
 * Detect fillers as WHOLE WORDS.
 *
 * A plain `includes(' um ')` is wrong in BOTH directions: it misses
 * "I was, um, thinking" because the filler is bounded by commas rather than spaces, and
 * it would match inside "umbrella" if it searched without boundaries. A word-boundary
 * regex handles punctuation and refuses to fire mid-word. Multi-word fillers get the
 * same treatment, with the internal space allowed to be any whitespace.
 */
export function detectFillers(transcript) {
    const text = String(transcript ?? '').toLowerCase();
    if (!text.trim()) return [];
    return FILLER_WORDS.filter((filler) => new RegExp(`\\b${filler.replace(/ /g, '\\s+')}\\b`).test(text));
}

/* -------------------------------------------------------------------- list */

export function useSpeakingTopics({ part = null, page = 0, size = 12 } = {}) {
    const key = `${part ?? 'ALL'}|${page}|${size}`;
    const loader = useCallback(
        () => speakingApi.getTopics({ page, size, ...(part ? { part } : {}) }).then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data, loading, error, reload } = useAsyncData(loader, key);
    return { items: data?.items ?? [], totalElements: data?.totalElements ?? 0, loading, error, reload };
}

export function useSpeakingTopic(topicId) {
    const loader = useCallback(() => speakingApi.getTopicById(topicId).then(unwrapData), [topicId]);
    const { data, loading, error, reload } = useAsyncData(loader, `speaking-topic-${topicId}`);
    return { topic: data ?? null, loading, error, reload };
}

export function useSpeakingHighestScores(topicIds) {
    const key = topicIds.length ? topicIds.join(',') : '';
    const loader = useCallback(
        () => (topicIds.length ? speakingApi.getHighestScores(topicIds).then(unwrapData) : Promise.resolve([])),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data } = useAsyncData(loader, `speaking-scores-${key}`);
    return useMemo(() => {
        const map = {};
        for (const row of data ?? []) map[row.topicId] = row;
        return map;
    }, [data]);
}

/* ------------------------------------------------------------------ submit */

export function useSubmitSpeaking() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const submit = useCallback(async (topicId, payload) => {
        setSubmitting(true);
        setError(null);
        try {
            const response = await speakingApi.submitAttempt(topicId, payload);
            return unwrapData(response);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, []);

    return { submit, submitting, error };
}

/* ------------------------------------------------------------------- grade */

export function useSpeakingAttempt(attemptId, { poll = true } = {}) {
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(Boolean(attemptId));
    const [error, setError] = useState(null);
    const [pollCount, setPollCount] = useState(0);
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        let cancelled = false;
        if (!attemptId) {
            setLoading(false);
            return undefined;
        }

        let timer = null;

        async function fetchOnce() {
            try {
                const response = await speakingApi.getAttemptById(attemptId);
                if (cancelled) return;
                const data = unwrapData(response);
                setAttempt(data);
                setError(null);
                setLoading(false);
                if (poll && isGrading(data?.status)) {
                    setPollCount((n) => n + 1);
                    timer = setTimeout(fetchOnce, POLL_MS);
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
    }, [attemptId, poll, nonce]);

    return {
        attempt,
        loading,
        error,
        pollCount,
        grading: isGrading(attempt?.status),
        reload: () => setNonce((n) => n + 1),
    };
}

export function useSpeakingAttempts({ page = 0, size = 20 } = {}) {
    const key = `speaking-attempts|${page}|${size}`;
    const loader = useCallback(
        () => speakingApi.getAttempts({ page, size }).then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data, loading, error, reload } = useAsyncData(loader, key);
    return { items: data?.items ?? [], totalElements: data?.totalElements ?? 0, loading, error, reload };
}

/* -------------------------------------------------------------------- mic */

/**
 * Microphone availability, checked BEFORE the user presses record.
 *
 * The approved design puts a permission notice above the list rather than in a modal
 * at the moment of recording. `getUserMedia` requires a secure context, so on plain
 * HTTP the API is simply absent and the honest answer is "this needs HTTPS" — not an
 * error after a button press that could never have worked.
 */
export function useMicrophoneStatus() {
    const [status, setStatus] = useState('unknown');

    useEffect(() => {
        if (typeof navigator === 'undefined') {
            setStatus('unsupported');
            return;
        }
        if (!window.isSecureContext) {
            setStatus('insecure');
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            setStatus('unsupported');
            return;
        }
        setStatus('available');
    }, []);

    return status;
}

/** Speech recognition support, for the transcript half of an attempt. */
export function useSpeechRecognitionSupport() {
    const [supported, setSupported] = useState(false);
    useEffect(() => {
        setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    }, []);
    return supported;
}
