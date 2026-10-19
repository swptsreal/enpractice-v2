import { useCallback, useEffect, useState } from 'react';
import { speakingApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';
import { buildSpeechAnalytics, detectFillers } from './useSpeaking';

/* A data hook must start its request in an effect and set its loading flag before it
   starts; the rule is right about component code and wrong about this primitive. */
/* eslint-disable react-hooks/set-state-in-effect */

/**
 * The speaking CONVERSATION — screens 24b (the dialogue) and 24c (its result).
 *
 * Contract read from the backend DTOs and CONFIRMED against the running backend:
 *
 *   POST /speaking/conversations/start?topicId={id}   -> NextQuestionResponse
 *        { conversationId, turnNumber, aiQuestion, turnType, lastTurn, conversationComplete }
 *   POST /speaking/conversations/{id}/turn
 *        body { transcript, audioUrl, timeSpentSeconds, speechAnalytics }
 *        -> the SAME response, carrying the NEXT question
 *   GET  /speaking/conversations/{id}                 -> ConversationResponse
 *        { id, topicId, topicQuestion, topicPart, status, totalTurns, timeSpentSeconds,
 *          fluencyScore, lexicalScore, grammarScore, pronunciationScore, overallBandScore,
 *          aiFeedback, startedAt, completedAt, gradedAt, turns[] }
 *   GET  /speaking/conversations?page&size            -> PageResponse<ConversationResponse>
 *
 * FIVE THINGS VERIFIED LIVE, and each one shapes a screen:
 *
 *  1. **REST, not STOMP.** v1 ran this flow over a socket and could show a connection
 *     state; v2 uses the same request/response pair as `/custom-speaking`, so screen 24b
 *     draws NO "đã kết nối" chip — there is no connection to report on. (`useConversationStomp`
 *     is dead code left from the port and is not used by this module.)
 *  2. **A turn row holds BOTH sides of the exchange.** The AI's question and the learner's
 *     transcript live on the same row, which is why the log pairs them and why resuming can
 *     rebuild the whole conversation from `turns[]` alone.
 *  3. **The last answer returns `conversationComplete: true`** with a null `aiQuestion`, and
 *     `lastTurn` flags the final question BEFORE it is answered.
 *  4. **Grading is asynchronous**: the detail endpoint reported `COMPLETED` immediately after
 *     the final turn and `GRADED` about ten seconds later, with a band and markdown feedback.
 *     So the wait state polls on COMPLETED **and** GRADING — a real screen state, not a
 *     theoretical one.
 *  5. **The charge is idempotent per `userId + mode + topicId`** and happens at
 *     `.../conversations/start`, so the restart button on 24c carries no cost and the list
 *     offers "Tiếp tục" without one.
 *
 * WHAT IS SENT: the transcript, the recording duration, and the analytics the browser can
 * honestly measure (`buildSpeechAnalytics`) — no invented pause or confidence figures, the
 * same rule as the practice attempt.
 */

export const isConversationInProgress = (status) => status === 'IN_PROGRESS';
/** `COMPLETED` is the state between the final turn and the grader picking the work up. */
export const isConversationGrading = (status) => status === 'COMPLETED' || status === 'GRADING';
export const isConversationGraded = (status) => status === 'GRADED';
export const isConversationFailed = (status) => status === 'FAILED';

export const CONVERSATION_POLL_MS = 4000;

const TURN_TYPE_HINT = 'HINT';

/** An AI turn is a question unless the backend flags it as a hint. */
export const isHintTurn = (turn) => turn?.turnType === TURN_TYPE_HINT;

/**
 * The questions the conversation will ask: the topic's own question plus its follow-ups,
 * which is exactly the formula `ConversationSpeakingServiceImpl` uses
 * (`1 + followUpQuestions.size()`). Read from the topic rather than invented, so the counter
 * on 24b is the same number the backend is counting.
 */
export function totalExpectedQuestions(topic) {
    const followUps = topic?.followUpQuestions ?? [];
    return 1 + (Array.isArray(followUps) ? followUps.length : 0);
}

/**
 * How many QUESTION turns the log contains, i.e. which question is on screen. Hints do not
 * advance the count, so a conversation with a hint in the middle still reads "câu 2 / 3".
 */
export function questionCount(turns = []) {
    return (turns ?? []).filter((turn) => !isHintTurn(turn) && turn?.aiQuestion).length;
}

/** Turns the learner has actually answered — the number the history and the result report. */
export function answeredTurnCount(turns = []) {
    return (turns ?? []).filter((turn) => (turn?.userTranscript ?? '').trim() !== '').length;
}

export function conversationTimeSpent(turns = []) {
    return (turns ?? []).reduce((sum, turn) => sum + (Number(turn?.timeSpentSeconds) || 0), 0);
}

/**
 * The log, flattened for rendering: one row per side of each exchange, in order.
 * A turn with no answer yet renders only its question.
 */
export function conversationLog(turns = []) {
    const rows = [];
    (turns ?? []).forEach((turn, index) => {
        const key = turn?.id ?? `turn-${turn?.turnNumber ?? index}`;
        if (turn?.aiQuestion) {
            rows.push({
                key: `${key}-ai`,
                role: 'ai',
                text: turn.aiQuestion,
                hint: isHintTurn(turn),
                turnNumber: turn?.turnNumber ?? index + 1,
            });
        }
        if ((turn?.userTranscript ?? '').trim()) {
            rows.push({
                key: `${key}-me`,
                role: 'me',
                text: turn.userTranscript,
                analytics: turn?.speechAnalytics ?? null,
            });
        }
    });
    return rows;
}

/**
 * Words the learner repeats across their own answers.
 *
 * The result screen highlights them, and a highlight that fires on a word used once would be a
 * false claim, so the count is real: lowercased, stripped of punctuation, at least four
 * characters, appearing at least twice. Short words ("the", "and") are excluded because they
 * carry no feedback value and would cover the transcript in highlights.
 */
export function findRepeatedWords(texts = []) {
    const counts = new Map();
    for (const text of texts) {
        for (const raw of String(text ?? '').toLowerCase().split(/\s+/)) {
            const word = raw.replace(/^[^a-z']+|[^a-z']+$/g, '');
            if (word.length < 4) continue;
            counts.set(word, (counts.get(word) ?? 0) + 1);
        }
    }
    return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([word]) => word));
}

/** The same normalisation `findRepeatedWords` uses, for matching a word inside a sentence. */
export function normalizeWord(raw) {
    return String(raw ?? '')
        .toLowerCase()
        .replace(/^[^a-z']+|[^a-z']+$/g, '');
}

/* ------------------------------------------------------------------- lists */

export function useSpeakingConversations({ page = 0, size = 20 } = {}) {
    const key = `speaking-conversations|${page}|${size}`;
    const loader = useCallback(
        () => speakingApi.getConversations({ page, size }).then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data, loading, error, reload } = useAsyncData(loader, key);
    return { items: data?.items ?? [], totalElements: data?.totalElements ?? 0, loading, error, reload };
}

/* ------------------------------------------------------------------ detail */

/**
 * One conversation, polled while it is being graded.
 *
 * `poll` is off for the resume path: an IN_PROGRESS conversation has no grading to wait for,
 * and the page sends the learner into the dialogue instead.
 */
export function useSpeakingConversationDetail(conversationId, { poll = true } = {}) {
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
                const response = await speakingApi.getConversation(conversationId);
                if (cancelled) return;
                const data = unwrapData(response);
                setConversation(data);
                setError(null);
                setLoading(false);

                /* COMPLETED and GRADING both mean "the grader has the work" — the poll
                   continues until GRADED or FAILED, which are terminal. */
                if (poll && isConversationGrading(data?.status)) {
                    timer = setTimeout(fetchOnce, CONVERSATION_POLL_MS);
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
        grading: isConversationGrading(conversation?.status),
        reload: () => setNonce((n) => n + 1),
    };
}

/* -------------------------------------------------------------------- flow */

/**
 * The live dialogue: start it, answer a question, receive the next one.
 *
 * The turns are kept in the API's own shape (question + answer on one row) rather than as two
 * separate logs, because that is the shape the resume route reads back — one representation,
 * so a conversation continued after a reload cannot render differently from one in flight.
 */
export function useSpeakingConversationFlow() {
    const [conversationId, setConversationId] = useState(null);
    const [turns, setTurns] = useState([]);
    const [starting, setStarting] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [lastTurn, setLastTurn] = useState(false);
    const [complete, setComplete] = useState(false);

    /** Seed from `GET /conversations/{id}` when the learner resumes. */
    const hydrate = useCallback((detail) => {
        setConversationId(detail?.id ?? null);
        setTurns(Array.isArray(detail?.turns) ? detail.turns : []);
        setComplete(!isConversationInProgress(detail?.status));
        /* Which question is pending is derived from the log, so the only thing the detail
           cannot tell us is `lastTurn` — it is recomputed from the topic on the page. */
        setLastTurn(Boolean(detail?.lastTurn));
    }, []);

    const start = useCallback(async (topicId) => {
        setStarting(true);
        setError(null);
        try {
            const response = await speakingApi.startConversation(topicId);
            const data = unwrapData(response);
            setConversationId(data?.conversationId ?? null);
            setTurns(
                data?.aiQuestion
                    ? [
                          {
                              id: `${data.conversationId}-1`,
                              turnNumber: data.turnNumber,
                              aiQuestion: data.aiQuestion,
                              turnType: data.turnType,
                              userTranscript: null,
                          },
                      ]
                    : []
            );
            setLastTurn(Boolean(data?.lastTurn));
            setComplete(Boolean(data?.conversationComplete));
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
            try {
                const analytics = buildSpeechAnalytics({
                    transcript,
                    seconds: timeSpentSeconds,
                    fillers: detectFillers(transcript),
                });

                const response = await speakingApi.submitTurn(conversationId, {
                    transcript,
                    audioUrl: null,
                    timeSpentSeconds,
                    speechAnalytics: analytics,
                });
                const data = unwrapData(response);

                setTurns((current) => {
                    const next = [...current];
                    const pendingIndex = next.findIndex((turn) => !(turn.userTranscript ?? '').trim());
                    if (pendingIndex >= 0) {
                        next[pendingIndex] = {
                            ...next[pendingIndex],
                            userTranscript: transcript,
                            timeSpentSeconds,
                            speechAnalytics: analytics,
                        };
                    }
                    if (data?.aiQuestion) {
                        next.push({
                            id: `${conversationId}-${data.turnNumber}`,
                            turnNumber: data.turnNumber,
                            aiQuestion: data.aiQuestion,
                            turnType: data.turnType,
                            userTranscript: null,
                        });
                    }
                    return next;
                });

                setLastTurn(Boolean(data?.lastTurn));
                setComplete(Boolean(data?.conversationComplete));
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

    return {
        conversationId,
        turns,
        starting,
        sending,
        error,
        lastTurn,
        complete,
        questionIndex: questionCount(turns),
        hydrate,
        start,
        sendTurn,
    };
}
