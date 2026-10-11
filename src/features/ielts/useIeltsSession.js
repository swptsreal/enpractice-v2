import { useCallback, useEffect, useMemo, useState } from 'react';
import { ieltsApi } from '../../api';
import { unwrapData } from '../../api/envelope';
import { normalizeExamMarkdown } from '../../utils/ielts';

/**
 * The IELTS session flow: start a session, answer questions, submit, read results.
 *
 * Shapes come from the backend's DTO source, read directly rather than guessed:
 *
 *   POST /ielts/sessions/start   body { testId, attemptMode, scopeType, scopeId? }
 *        -> StartTestResponse { attemptId, attemptMode, scopeType, scopeId,
 *             scopeTitle, totalQuestions, estimatedMinutes, testDetail }
 *   GET  /ielts/sessions/{id}    -> StartTestResponse  (resume)
 *   POST /ielts/sessions/{id}/submit
 *        body { attemptId, answers: [{ questionId, userAnswer: [...] }], timeSpentSeconds }
 *        -> SubmitTestResponse { attemptId, testId, totalQuestions, correctCount,
 *             accuracyPercent, bandScore, timeSpentSeconds, testDetail,
 *             results: [{ questionId, questionText, questionType, userAnswer,
 *                         correctAnswer, isCorrect, explanation }] }
 *
 * and the paper itself is nested four deep:
 *
 *   testDetail.sections[] -> sections[].passages[] -> passages[].questions[]
 *   question { id, questionOrder, questionType, questionText, options[],
 *              correctAnswers[], explanation }
 *
 * `correctAnswers` IS PRESENT on the question payload. That is a real consideration
 * rather than a detail: the client must not reveal it before submission, so
 * `flattenQuestions` deliberately drops it and the analysis screen reads it from
 * the SUBMIT response instead. A `stripAnswers` guard also runs in dev builds so a
 * future refactor cannot quietly start rendering it.
 *
 * `flattenQuestions` also normalises the exam text for the Markdown renderer
 * (`questionText`, `passageContent`): the content is Markdown — bold, images,
 * tables, headings, lists — with literal `<br>` tags mixed in, measured over the
 * whole seeded library. The translation lives in `utils/ielts.js` and is applied
 * here so the shape of the content is settled once, at the boundary, rather than
 * re-decided by every screen that shows a question.
 */

/* ------------------------------------------------------------------ helpers */

/**
 * Flatten the nested paper into the order a candidate sees it, which is also the
 * order numbering follows: section order -> passage order -> question order.
 * The backend already sorts, but sorting again costs nothing and guarantees the
 * question navigator's numbers match the paper.
 */
export function flattenQuestions(testDetail) {
    const sections = [...(testDetail?.sections ?? [])].sort(
        (a, b) => (a?.sectionOrder ?? 0) - (b?.sectionOrder ?? 0)
    );

    const out = [];
    for (const section of sections) {
        const passages = [...(section?.passages ?? [])].sort(
            (a, b) => (a?.passageOrder ?? 0) - (b?.passageOrder ?? 0)
        );
        for (const passage of passages) {
            const questions = [...(passage?.questions ?? [])].sort(
                (a, b) => (a?.questionOrder ?? 0) - (b?.questionOrder ?? 0)
            );
            for (const question of questions) {
                out.push({
                    ...question,
                    /* deliberately not carried through — see the note above */
                    correctAnswers: undefined,
                    explanation: undefined,
                    /* Exam text is Markdown with literal `<br>` tags in it (measured over
                       the whole seeded library — see utils/ielts.js). Normalising here, at
                       the one place the paper enters the app, keeps every screen that
                       renders a question or a passage from having to know that. */
                    questionText: normalizeExamMarkdown(question?.questionText),
                    sectionId: section?.id,
                    sectionTitle: section?.title,
                    sectionOrder: section?.sectionOrder ?? 0,
                    passageId: passage?.id,
                    passageTitle: passage?.title,
                    passageContent: normalizeExamMarkdown(passage?.content),
                    passageOrder: passage?.passageOrder ?? 0,
                    audioUrl: section?.audioUrl ?? null,
                });
            }
        }
    }
    return out;
}

/** Group the flat question list back into sections for a two-pane or tabbed view. */
export function groupBySection(questions) {
    const groups = [];
    for (const q of questions) {
        let group = groups.find((g) => g.sectionId === q.sectionId);
        if (!group) {
            group = { sectionId: q.sectionId, title: q.sectionTitle, order: q.sectionOrder, questions: [] };
            groups.push(group);
        }
        group.questions.push(q);
    }
    return groups.sort((a, b) => a.order - b.order);
}

/**
 * Is this answer "given"? Answers are `List<String>` server-side, so a completion
 * gap is `['']` rather than absent, and treating that as answered would let a
 * candidate submit a blank paper and then wonder why it scored zero.
 */
export function isAnswered(value) {
    if (value === null || value === undefined) return false;
    const list = Array.isArray(value) ? value : [value];
    return list.some((v) => String(v ?? '').trim() !== '');
}

/* --------------------------------------------------------------------- hook */

export function useIeltsSession({
    testId,
    attemptId: resumeAttemptId = null,
    attemptMode = 'FULL',
    scopeType = 'TEST',
    /* A scoped practice needs the scope's own id, and a question-type drill has neither a test
       nor a scope id — it is defined by the TYPE. Both were missing here, so the quick launch
       from Home started the whole test instead of the passage it advertised. */
    scopeId = null,
    questionType = null,
}) {
    const [session, setSession] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(Boolean(testId || resumeAttemptId));
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    /* Start a new session, or resume an existing one. Ids are primitive strings so
       the effect does not re-run on every parent render. */
    useEffect(() => {
        let cancelled = false;

        async function open() {
            if (!testId && !resumeAttemptId && !questionType) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = resumeAttemptId
                    ? await ieltsApi.getSession(resumeAttemptId)
                    : await ieltsApi.startSession({
                          attemptMode,
                          scopeType,
                          ...(testId ? { testId } : {}),
                          ...(scopeId ? { scopeId } : {}),
                          ...(questionType ? { questionType } : {}),
                      });
                if (cancelled) return;
                setSession(unwrapData(response));
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
    }, [testId, resumeAttemptId, attemptMode, scopeType, scopeId, questionType]);

    const questions = useMemo(() => flattenQuestions(session?.testDetail), [session]);
    const sections = useMemo(() => groupBySection(questions), [questions]);
    const answeredCount = useMemo(
        () => questions.filter((q) => isAnswered(answers[q.id])).length,
        [questions, answers]
    );

    const setAnswer = useCallback((questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }, []);

    const submit = useCallback(
        async ({ timeSpentSeconds } = {}) => {
            const attemptId = session?.attemptId;
            if (!attemptId) throw new Error('no attempt to submit');

            setSubmitting(true);
            setError(null);
            try {
                /* The request carries every question, answered or not: the backend
                   scores the paper, and omitting unanswered questions would make
                   the total ambiguous. */
                const fallbackSeconds =
                    session?.estimatedMinutes != null ? session.estimatedMinutes * 60 : null;
                const payload = {
                    attemptId,
                    answers: questions.map((q) => ({
                        questionId: q.id,
                        userAnswer: Array.isArray(answers[q.id])
                            ? answers[q.id]
                            : [String(answers[q.id] ?? '')],
                    })),
                    timeSpentSeconds: timeSpentSeconds ?? fallbackSeconds,
                };
                const response = await ieltsApi.submitAttempt(attemptId, payload);
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
        totalQuestions: session?.totalQuestions ?? questions.length,
        estimatedMinutes: session?.estimatedMinutes ?? null,
        scopeTitle: session?.scopeTitle ?? null,
        questions,
        sections,
        answers,
        setAnswer,
        answeredCount,
        loading,
        error,
        submit,
        submitting,
        result,
    };
}

/**
 * Dev-only guard: fail loudly if `correctAnswers` ever reaches the DOM.
 *
 * The backend sends the answers inside the question payload, so the only thing
 * standing between a candidate and the answer key is `flattenQuestions` dropping
 * them. If that drop is ever removed, this makes it obvious in development rather
 * than in a screenshot of a 9.0 on a test nobody sat.
 */
export function assertNoAnswersLeaked(questions) {
    if (!import.meta.env.DEV) return;
    const leaked = questions.filter((q) => q.correctAnswers !== undefined || q.explanation !== undefined);
    if (leaked.length) {
        console.error(
            `[ielts] ${leaked.length} question(s) still carry correctAnswers/explanation before submission. ` +
                'flattenQuestions must strip them.'
        );
    }
}
