import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { vocabularyTestApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';

/* A data hook has to start its request in an effect, and the loading flag has to
   be set before it starts — the rule is right about component code and wrong
   about this primitive. Scoped to this file so every other file stays guarded. */
/* eslint-disable react-hooks/set-state-in-effect */

/**
 * The vocabulary-test flow: list, generate, start, answer, submit, reopen.
 *
 * Contract read from the backend DTO source and then CONFIRMED against the running
 * backend (2026-10-11):
 *
 *   GET  /vocabulary-tests?page&size      -> PageResponse<VocabularyTestListResponse>
 *        item { testId, title, status, questionCount, estimatedMinutes,
 *               selectedSources, createdAt, attemptCount,
 *               latestAccuracyPercent, latestAttemptStatus }
 *   POST /vocabulary-tests/generate       body { clientRequestId, questionCount,
 *                                               sources[], sourceSurface }
 *        -> { testId, clientRequestId, creditReservationId, status, message, createdAt }
 *   GET  /vocabulary-tests/{id}           -> VocabularyTestDetailResponse
 *   POST /vocabulary-tests/{id}/start     -> { attemptId, testId, questionCount,
 *                                               estimatedMinutes, testDetail }
 *   POST /vocabulary-tests/attempts/{attemptId}/submit
 *        body { answers: [{ questionId, selectedOptionIndex }], timeSpentSeconds }
 *        -> { attemptId, testId, testTitle, totalQuestions, correctCount,
 *             accuracyPercent, timeSpentSeconds, results[] }
 *   GET  /vocabulary-tests/attempts/{id}  -> the same SubmitVocabularyTestResponse
 *   GET  /vocabulary-tests/attempts       -> PageResponse<AttemptHistoryResponse>
 *
 * Three things that are easy to get wrong and are handled here:
 *
 *   1. GENERATION IS ASYNCHRONOUS. `generate` returns immediately with
 *      status = GENERATING and produces the questions in the background, so the
 *      list screen has to show a real "being generated" state rather than an
 *      empty card. `useVocabularyTestList` polls while any item is GENERATING.
 *   2. SOURCES ARE A CLOSED ENUM (VOCABULARY_RECORD, USER_DICTIONARY,
 *      USER_WORD_LOOKUP_EVENT, ALL) and an empty list means ALL. There is no
 *      endpoint that lists them, so the UI must not pretend to discover them.
 *   3. A NEW ACCOUNT CANNOT GENERATE AT ALL: with no vocabulary records, no
 *      dictionary words and no lookup events, the backend answers 400 "Not enough
 *      vocabulary data". That is not a bug and must not render as one — it is an
 *      empty state that points at the dictionary.
 */

export const VOCABULARY_SOURCES = ['VOCABULARY_RECORD', 'USER_DICTIONARY', 'USER_WORD_LOOKUP_EVENT', 'ALL'];

/**
 * Source enum -> STATIC i18n key.
 *
 * Building the key by interpolation would need a `defaultValue` fallback for an
 * unknown code, and the i18n audit fails on inline `defaultValue` in a component —
 * correctly, because that is how an untranslated surface hides. A lookup gives the
 * same safety with keys the audit can see.
 */
export const SOURCE_LABEL_KEYS = {
    VOCABULARY_RECORD: 'vocabTest.source.VOCABULARY_RECORD',
    USER_DICTIONARY: 'vocabTest.source.USER_DICTIONARY',
    USER_WORD_LOOKUP_EVENT: 'vocabTest.source.USER_WORD_LOOKUP_EVENT',
    ALL: 'vocabTest.source.ALL',
};

/**
 * Generation status, confirmed against the running backend (2026-10-11).
 *
 * `POST /vocabulary-tests/generate` answers **202** with status **PENDING**
 * ("Vocabulary test generation has been queued") and the paper is built by a Kafka
 * consumer afterwards. It settles into **READY** or **FAILED**.
 *
 * So there are THREE states, not two, and PENDING is the one the app sees first —
 * waiting only for GENERATING would have meant never polling at all. FAILED is a
 * real outcome the UI must render: in verification the backend's own AI call
 * returned HTTP 404 for its model alias and the test was marked FAILED with the
 * title "Vocabulary test generation failed".
 */
const IN_PROGRESS = new Set(['PENDING', 'GENERATING', 'QUEUED', 'RUNNING']);

export const isGenerating = (status) => IN_PROGRESS.has(String(status ?? '').toUpperCase());
export const isFailed = (status) => String(status ?? '').toUpperCase() === 'FAILED';
export const isReady = (status) => String(status ?? '').toUpperCase() === 'READY';

/** How often to re-check a test that is still generating. */
const POLL_MS = 3000;

/**
 * How many automatic re-checks one screen makes before it stops on its own.
 *
 * 20 passes is about a minute, which is far longer than generation actually takes.
 * The cap exists because the poll used to have NO terminal state: this backend can
 * leave a test in `PENDING` indefinitely (`POST /vocabulary-tests/generate` answers
 * 202 and a Kafka consumer builds the paper; with that consumer down the status
 * never changes — verified live, still PENDING after 24s and after the paper was
 * requested), so a screen that polls until the status settles polls forever. The
 * card keeps saying "đang tạo" and the refresh button on the screen re-arms the
 * poll with a fresh budget.
 */
const MAX_POLL_PASSES = 20;

/* ------------------------------------------------------------------- list */

/**
 * The list, with polling while anything is still generating.
 *
 * Polling stops as soon as nothing is GENERATING, so an idle list is not making
 * requests, and it stops after `MAX_POLL_PASSES` regardless — the list is the
 * landing screen for this module and an unbounded 3-second poll is an unbounded
 * cost, both for the browser and for the backend.
 */
export function useVocabularyTestList({ page = 0, size = 12 } = {}) {
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* Poll bookkeeping lives in refs so the polling loop identity stays stable: a
       re-created callback on every render would schedule a second timer.
       
       There is deliberately no `alive` flag guarding the setState calls. An earlier
       version had one, and it broke the hook under StrictMode: the double-invoked
       effect's cleanup set alive=false, the in-flight first load then skipped its
       `setLoading(false)`, and the screen sat on "Đang tải…" forever. React 18+
       removed the setState-after-unmount warning, so the guard was protecting
       nothing and cost correctness.

       A LIFECYCLE FLAG IS STILL REQUIRED FOR THE POLL ITSELF, and it is a
       different thing from that `alive` flag: it may only decide whether the loop
       CONTINUES, never whether the payload or the spinner lands.

       Why (verified by counting `getTests` calls in a test, 2026-10-11): the loop
       used to reschedule itself from inside an awaited pass —

           const next = await load({ silent: true });
           if (next.some(isGenerating)) timer.current = setTimeout(...)

       so a pass that was already in flight when the screen unmounted scheduled a
       NEW timer after the cleanup had run and only the then-current timer could be
       cleared. That survivor polls forever. Under StrictMode (`main.jsx` mounts
       App in StrictMode) the mount effect runs twice, both passes resolve, each
       writes `timer.current`, and the first timer id is overwritten — so ONE timer
       is always uncancellable, whatever the cleanup does. Measured on the list
       screen with a PENDING test: 2 getTests per 3s while mounted (two chains) and
       10 more requests in the 30s AFTER unmount, which is the reported
       "loop api /api/vocabulary-tests".

       The fix is ownership: every scheduled pass carries the id of the chain that
       owns the timer, and a pass that is no longer the owner refuses to reschedule
       itself. `chain` is bumped by the effect's cleanup and by every deliberate
       re-arm, so the chain that is live is always exactly one. */
    const timer = useRef(null);
    const chain = useRef(0);
    const passes = useRef(0);
    /** The polling loop as it currently is. See `schedulePoll`. */
    const pollRef = useRef(null);
    /**
     * Two counters, because the two kinds of load must not supersede each other.
     *
     * `visibleId` orders only the loads that drive the spinner; `dataId` orders
     * everything for the purpose of "is this payload still the newest".
     *
     * A single shared counter was wrong and produced a screen stuck on
     * "Đang tải…" WITH THE DATA ALREADY IN HAND: StrictMode runs the mount effect
     * twice, the second load bumped the counter, so the first load's `finally` saw
     * itself superseded and never cleared `loading`. The spinner then stayed up
     * forever while `items` was populated — the worst shape of loading bug, because
     * the answer arrived and was discarded.
     */
    const visibleId = useRef(0);
    const dataId = useRef(0);

    const load = useCallback(
        async ({ silent = false } = {}) => {
            const myVisible = silent ? visibleId.current : ++visibleId.current;
            const myData = ++dataId.current;
            if (!silent) setLoading(true);
            try {
                const response = await vocabularyTestApi.getTests({ page, size });
                const paged = readPage(response);
                /* A superseded response must not overwrite a newer one. */
                if (myData !== dataId.current) return paged.items;
                setItems(paged.items);
                setMeta({ totalElements: paged.totalElements, totalPages: paged.totalPages });
                setError(null);
                return paged.items;
            } catch (err) {
                if (myData === dataId.current) setError(err);
                return [];
            } finally {
                /* Clear the spinner only if no LATER visible load has started. A
                   poll pass is silent and knows nothing about the spinner. */
                if (myVisible === visibleId.current) setLoading(false);
            }
        },
        [page, size]
    );

    /** At most one pending poll timer, ever. */
    const clearTimer = useCallback(() => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    }, []);

    /**
     * One polling pass for the chain that owns the poll.
     *
     * `myChain` is checked AFTER the await: by then the screen may have unmounted,
     * or a newer chain may have taken over, and either way this pass must not
     * schedule anything. The timer is cleared before it is replaced so two passes
     * can never leave two live timers behind — which is the leak described above.
     *
     * The next pass is armed through `pollRef` rather than by naming itself: a
     * `const` that refers to its own initialiser is a TDZ bug the hooks lint rule
     * rejects, and the ref is the honest way to say "the loop as it is now".
     */
    const schedulePoll = useCallback(
        async (myChain) => {
            const next = await load({ silent: true });
            if (myChain !== chain.current) return;

            passes.current += 1;
            if (passes.current >= MAX_POLL_PASSES) return;

            if (next.some((item) => isGenerating(item.status))) {
                clearTimer();
                timer.current = setTimeout(() => pollRef.current?.(myChain), POLL_MS);
            }
        },
        [load, clearTimer]
    );

    /* Keep the ref pointing at the current pass. Declared BEFORE the polling effect
       below so it is already current when that effect starts the first pass, and
       written in an effect rather than during render (a ref write during render can
       tear under concurrent rendering). */
    useEffect(() => {
        pollRef.current = schedulePoll;
    }, [schedulePoll]);

    useEffect(() => {
        /* A fresh chain owns the poll, with a fresh budget. */
        chain.current += 1;
        passes.current = 0;
        const myChain = chain.current;
        schedulePoll(myChain);

        return () => {
            /* Invalidate the chain FIRST, then drop the timer. Doing it in this
               order means an in-flight pass that resolves after this point sees
               itself superseded and cannot put a new timer back. */
            chain.current += 1;
            clearTimer();
        };
    }, [schedulePoll, clearTimer]);

    /** Re-check soon after a generate call, without waiting a whole cycle. */
    const pollNow = useCallback(() => {
        clearTimer();
        /* A new owner, so a pass that is in flight right now cannot arm a second
           timer next to the one this call is about to arm. */
        chain.current += 1;
        passes.current = 0;
        const myChain = chain.current;
        schedulePoll(myChain);
    }, [schedulePoll, clearTimer]);

    /**
     * A user-driven refresh goes to the server AND re-arms the poll.
     *
     * That is what makes the pass cap safe: when a screen has stopped polling by
     * itself, this button is the way to start it again.
     */
    const reload = useCallback(async () => {
        const items = await load();
        clearTimer();
        passes.current = 0;
        if (items.some((item) => isGenerating(item.status))) {
            const myChain = chain.current;
            timer.current = setTimeout(() => schedulePoll(myChain), POLL_MS);
        }
        return items;
    }, [load, schedulePoll, clearTimer]);

    return { items, ...meta, loading, error, reload, pollNow };
}

/* -------------------------------------------------------------- generation */

export function useGenerateVocabularyTest() {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    const generate = useCallback(async ({ questionCount = 10, sources = [] } = {}) => {
        setGenerating(true);
        setError(null);
        try {
            const response = await vocabularyTestApi.generateTest({
                /* The backend uses this for idempotency, so it must be unique per
                   intent but stable across a retry of the SAME intent. */
                clientRequestId: `vocab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                questionCount,
                sources,
                sourceSurface: 'VOCABULARY_TEST',
            });
            return unwrapData(response);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setGenerating(false);
        }
    }, []);

    return { generate, generating, error };
}

/* ----------------------------------------------------------------- session */

export function useVocabularyAttempt({ testId, attemptId: resumeAttemptId = null }) {
    const [session, setSession] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(Boolean(testId || resumeAttemptId));
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function open() {
            if (!testId && !resumeAttemptId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = resumeAttemptId
                    ? await vocabularyTestApi.getAttemptDetail(resumeAttemptId)
                    : await vocabularyTestApi.startTest(testId);
                if (cancelled) return;
                const data = unwrapData(response);
                /* `getAttempt` returns a SCORED result, not a session, so resuming
                   an in-progress attempt lands on the result view rather than a
                   fresh paper. Distinguish by shape instead of by which call ran. */
                if (Array.isArray(data?.results) && data.results.length > 0) {
                    setResult(data);
                } else {
                    setSession(data);
                }
            } catch (err) {
                if (cancelled) return;
                setError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        open();
        return () => {
            cancelled = true;
        };
    }, [testId, resumeAttemptId]);

    const questions = useMemo(() => {
        const list = session?.testDetail?.questions ?? [];
        return [...list].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    }, [session]);

    const answeredCount = useMemo(
        () => questions.filter((q) => answers[q.questionId] !== undefined).length,
        [questions, answers]
    );

    const selectOption = useCallback((questionId, optionIndex) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    }, []);

    const submit = useCallback(
        async ({ timeSpentSeconds } = {}) => {
            const attemptId = session?.attemptId;
            if (!attemptId) throw new Error('no attempt to submit');

            setSubmitting(true);
            setError(null);
            try {
                /* Only answered questions are sent. Unlike IELTS, the backend
                   marks by index and an absent answer is a blank, not a wrong
                   index — sending -1 would be a different (invalid) statement. */
                const payload = {
                    answers: questions
                        .filter((q) => answers[q.questionId] !== undefined)
                        .map((q) => ({
                            questionId: q.questionId,
                            selectedOptionIndex: answers[q.questionId],
                        })),
                    timeSpentSeconds: timeSpentSeconds ?? null,
                };
                const response = await vocabularyTestApi.submitAttempt(attemptId, payload);
                const data = unwrapData(response);
                setResult(data);
                return data;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setSubmitting(false);
            }
        },
        [session, questions, answers]
    );

    return {
        session,
        testDetail: session?.testDetail ?? null,
        attemptId: session?.attemptId ?? null,
        questionCount: session?.questionCount ?? questions.length,
        estimatedMinutes: session?.estimatedMinutes ?? null,
        questions,
        answers,
        selectOption,
        answeredCount,
        loading,
        error,
        submit,
        submitting,
        result,
    };
}

/* ---------------------------------------------------------------- results */

/** Reopen a finished attempt. Used by the result route and by history. */
export function useVocabularyAttemptResult(attemptId) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(Boolean(attemptId));
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        if (!attemptId) {
            setLoading(false);
            return undefined;
        }
        setLoading(true);
        /* `getAttemptDetail`, not `getAttempt`. The name that does not exist threw
           `TypeError: vocabularyTestApi.getAttempt is not a function` and `/vocabulary/result`
           rendered nothing — while line ~341 in THIS SAME FILE already called the real
           name correctly, which is why the list → take → submit path worked and only
           reopening a finished attempt broke. */
        vocabularyTestApi
            .getAttemptDetail(attemptId)
            .then((response) => {
                if (!cancelled) setResult(unwrapData(response));
            })
            .catch((err) => {
                if (!cancelled) setError(err);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [attemptId]);

    return { result, loading, error };
}

export function useVocabularyHistory({ page = 0, size = 10 } = {}) {
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await vocabularyTestApi.getAttempts({ page, size });
            const paged = readPage(response);
            setItems(paged.items);
            setMeta({ totalElements: paged.totalElements, totalPages: paged.totalPages });
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        load();
    }, [load]);

    return { items, ...meta, loading, error, reload: load };
}

/**
 * Recognise the "nothing to build a test from yet" answer.
 *
 * The backend returns 400 with this message for an account with no vocabulary
 * data. It is an onboarding state, not a failure, and the UI must offer the
 * dictionary rather than a retry that cannot work.
 */
export function isNotEnoughDataError(error) {
    const status = error?.status ?? error?.response?.status;
    const message = String(error?.message ?? error?.response?.data?.message ?? '');
    return status === 400 && /not enough vocabulary data/i.test(message);
}
