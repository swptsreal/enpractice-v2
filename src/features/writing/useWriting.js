import { useCallback, useEffect, useMemo, useState } from 'react';
import { writingApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';

/* A data hook must start its request in an effect and set its loading flag before it
   starts; the rule is right about component code and wrong about this primitive.
   Scoped to this file so every other file stays guarded. */
/* eslint-disable react-hooks/set-state-in-effect */

/**
 * The Writing module: task list, task detail, submit, and asynchronous grading.
 *
 * Contract read from the backend DTOs and CONFIRMED against the running backend:
 *
 *   GET  /writing/tasks?page&size        -> PageResponse<WritingTaskListResponse>
 *        item { id, taskType, title, difficulty, timeLimitMinutes, minWords,
 *               maxWords, createdAt }
 *   GET  /writing/tasks/{id}             -> WritingTaskResponse
 *        { id, taskType, title, content, instruction, imageUrls, difficulty,
 *          isPublished, timeLimitMinutes, minWords, maxWords, createdAt, updatedAt }
 *   POST /writing/tasks/{id}/submit      body { essayContent, timeSpentSeconds }
 *        -> WritingSubmissionResponse
 *   GET  /writing/submissions/{id}       -> the same response, re-read for grading
 *   GET  /writing/submissions?page&size  -> PageResponse<...>
 *   POST /writing/tasks/highest-scores   body { taskIds } ->
 *        [{ taskId, attempted, submissionId, highestBandScore, status, gradedAt }]
 *
 * FOUR things verified live that the UI depends on:
 *
 *  1. **Grading is ASYNCHRONOUS with three states.** Submitting returns
 *     `status: SUBMITTED` and a NULL band, then `GRADING`, then `GRADED`
 *     (`SubmissionStatus` = SUBMITTED / GRADING / GRADED / FAILED). Measured ~6 s for
 *     a Task 2 essay, but it is AI-bound so the UI must not assume that. A card that
 *     rendered the band optimistically would show nothing.
 *  2. **`content` and `instruction` contain literal `<br>` tags** and no other HTML
 *     (checked). They render as TEXT with the breaks converted, never as HTML: these
 *     strings come from the database, and `dangerouslySetInnerHTML` on them would be
 *     an injection point for no benefit.
 *  3. **`overallBandScore` is `6` for what the API itself calls band 6.0** — a Float,
 *     so the UI always formats one decimal rather than printing `6`.
 *  4. **`aiFeedback` is MARKDOWN** (~2.6 kB for one essay) and is genuinely
 *     criterion-aware: an off-topic essay came back `TR=3` with the rest at 7, led by
 *     "the essay answers the wrong question".
 */

export const TASK_TYPES = ['TASK_1', 'TASK_2'];

/** `SUBMITTED | GRADING | GRADED | FAILED`. */
export const isGrading = (status) => status === 'SUBMITTED' || status === 'GRADING';
export const isGraded = (status) => status === 'GRADED';
export const isGradingFailed = (status) => status === 'FAILED';

/** How often to re-check a submission that is still being graded. */
const POLL_MS = 4000;

/**
 * Turn the backend's stored HTML-ish text into plain text.
 *
 * `<br>` is the only tag present (verified), and it is a real line break in the
 * source, so it becomes one. Everything else stays as literal characters — stripping
 * only what is known to be markup, rather than running a general HTML sanitizer over
 * task text, keeps this predictable.
 */
export function textFromStoredHtml(value) {
    return String(value ?? '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/** Words as a writer counts them: whitespace-separated tokens. */
export function countWords(text) {
    const trimmed = String(text ?? '').trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}

/* -------------------------------------------------------------------- list */

export function useWritingTasks({ taskType = null, page = 0, size = 12 } = {}) {
    const key = `${taskType ?? 'ALL'}|${page}|${size}`;

    const loader = useCallback(
        () => writingApi.getTasks({ page, size, ...(taskType ? { taskType } : {}) }).then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );

    const { data, loading, error, reload } = useAsyncData(loader, key);

    return {
        items: data?.items ?? [],
        totalElements: data?.totalElements ?? 0,
        loading,
        error,
        reload,
    };
}

export function useWritingTask(taskId) {
    const loader = useCallback(() => writingApi.getTaskById(taskId).then(unwrapData), [taskId]);
    const { data, loading, error, reload } = useAsyncData(loader, `writing-task-${taskId}`);

    const task = useMemo(() => {
        if (!data) return null;
        return {
            ...data,
            contentText: textFromStoredHtml(data.content),
            instructionText: textFromStoredHtml(data.instruction),
        };
    }, [data]);

    return { task, loading, error, reload };
}

/**
 * The highest previous band per task, for the "Làm lại" affordance.
 * Returned as a map keyed by taskId so a card looks itself up in O(1).
 */
export function useHighestScores(taskIds) {
    const key = taskIds.length ? taskIds.join(',') : '';
    const loader = useCallback(
        () => (taskIds.length ? writingApi.getHighestScores(taskIds).then(unwrapData) : Promise.resolve([])),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );

    const { data } = useAsyncData(loader, `writing-scores-${key}`);
    const byTaskId = useMemo(() => {
        const map = {};
        for (const row of data ?? []) map[row.taskId] = row;
        return map;
    }, [data]);

    return byTaskId;
}

/* ------------------------------------------------------------------ submit */

export function useSubmitEssay() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const submit = useCallback(async (taskId, { essayContent, timeSpentSeconds }) => {
        setSubmitting(true);
        setError(null);
        try {
            const response = await writingApi.submitTask(taskId, { essayContent, timeSpentSeconds });
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

/**
 * A submission, polled while it is still being graded.
 *
 * Polling stops the moment the status leaves SUBMITTED/GRADING, so a finished
 * submission makes no further requests. `pollCount` is exposed so the screen can show
 * how long it has been waiting instead of an indefinite spinner — the design promises
 * the user a wait, and a wait they can see is a wait they tolerate.
 */
export function useWritingSubmission(submissionId, { poll = true } = {}) {
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(Boolean(submissionId));
    const [error, setError] = useState(null);
    const [pollCount, setPollCount] = useState(0);
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        let cancelled = false;
        if (!submissionId) {
            setLoading(false);
            return undefined;
        }

        let timer = null;

        async function fetchOnce() {
            try {
                const response = await writingApi.getSubmissionById(submissionId);
                if (cancelled) return;
                const data = unwrapData(response);
                setSubmission(data);
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
    }, [submissionId, poll, nonce]);

    return {
        submission,
        loading,
        error,
        pollCount,
        grading: isGrading(submission?.status),
        reload: () => setNonce((n) => n + 1),
    };
}

export function useWritingSubmissions({ page = 0, size = 20 } = {}) {
    const key = `writing-submissions|${page}|${size}`;
    const loader = useCallback(
        () => writingApi.getSubmissions({ page, size }).then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data, loading, error, reload } = useAsyncData(loader, key);
    return { items: data?.items ?? [], totalElements: data?.totalElements ?? 0, loading, error, reload };
}
