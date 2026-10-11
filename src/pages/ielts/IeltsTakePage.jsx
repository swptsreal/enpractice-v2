import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Clock, BookOpen, Target, Headphones } from 'lucide-react';import { Button } from '../../components/ui/Button';
import { AnswerTile } from '../../components/ui/AnswerTile';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Markdown } from '../../components/ui/Markdown';
import { SkeletonCard } from '../../components/ui/Primitives';
import { cn } from '../../lib/cn';
import { useIeltsSession, isAnswered, assertNoAnswersLeaked } from '../../features/ielts/useIeltsSession';

/**
 * Exam content renders as MARKDOWN, because that is what it is.
 *
 * Measured over the whole seeded library (663 passages and questions): `**bold**`
 * in 29 passages, markdown images in 21, GFM tables in 2, a heading and bullet
 * lists in others. Rendered as plain text — which is what this screen did — the
 * markers reached the candidate verbatim (`**A**`, `![alt](url)`, `| a | b |`).
 *
 * The literal `<br>` tags the content also carries are translated to markdown by
 * `flattenQuestions`/`normalizeExamMarkdown`, NOT by enabling `rehype-raw`: raw
 * HTML stays inert here, which is the security property spelled out in
 * `components/ui/Markdown.jsx`. Two overrides are needed for that translation to
 * survive the renderer:
 *
 *   - table cells get `whitespace-pre-line`, because a `<br>` inside a table row
 *     cannot become a hard break (it would split the row in two) and arrives as
 *     the newline `&#10;` instead;
 *   - images get a bounded width, because 21 passages carry real images and a
 *     bare `<img>` would push the reading pane sideways.
 */
const EXAM_CONTENT_COMPONENTS = {
    td: ({ node: _node, className, ...rest }) => (
        <td className={cn('t-body whitespace-pre-line px-3 py-2', className)} {...rest} />
    ),
    th: ({ node: _node, className, ...rest }) => (
        <th
            className={cn(
                't-micro whitespace-pre-line border-b-2 border-[var(--border)] px-3 py-2 text-left font-extrabold uppercase tracking-wider text-[var(--ink-muted)]',
                className
            )}
            {...rest}
        />
    ),
    img: ({ node: _node, className, ...rest }) => (
        <img
            className={cn('my-3 h-auto max-w-full rounded-[var(--r-sm)] border-2 border-[var(--border)]', className)}
            {...rest}
        />
    ),
};

/* The question is the thing being answered, so it keeps the larger body size the
   plain `<p>` had. The wrapper's `mb-3` is the old gap down to the options; the
   paragraph keeps the Markdown renderer's own spacing BETWEEN paragraphs. */
const QUESTION_COMPONENTS = {
    p: ({ node: _node, className, ...rest }) => (
        <p className={cn('t-body-lg mb-2.5 last:mb-0', className)} {...rest} />
    ),
};

/**
 * Test taking — the screen where v2 changes the most, and the reason it sits
 * outside the app shell (no sidebar, no tab bar, no floating Lexi).
 *
 * Desktop (>=1024px): passage and questions are two panes, both always visible.
 * Mobile (<1024px):  a two-tab switch between "Bài đọc" and "Câu hỏi", with the
 *                    answered count on the tab and the navigator below.
 *
 * That mobile behaviour is a deliberate fix. v1 stacked the passage above the
 * questions with `min-height: 40vh` on the passage, so in the one module where a
 * reader must see a passage and its question together, they never were.
 *
 * The paper now comes from `POST /ielts/sessions/start`. `correctAnswers` is
 * present in that payload, so `flattenQuestions` strips it and
 * `assertNoAnswersLeaked` fails loudly in development if that ever regresses.
 */
export default function IeltsTakePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const testId = params.get('testId');
    const resumeAttemptId = params.get('attemptId');
    const attemptMode = params.get('attemptMode') ?? 'FULL';
    const scopeType = params.get('scopeType') ?? 'TEST';
    /* Both of these were dropped on the floor: a scoped practice lost its scope id (so it
       silently became a full test) and a question-type drill — which the learning path links
       to — could not start at all, because the session only opened when a testId was present. */
    const scopeId = params.get('scopeId');
    const questionType = params.get('questionType');

    const {
        questions,
        testDetail,
        attemptId,
        totalQuestions,
        estimatedMinutes,
        loading,
        error,
        answers,
        setAnswer,
        answeredCount,
        submit,
        submitting,
    } = useIeltsSession({ testId, attemptId: resumeAttemptId, attemptMode, scopeType, scopeId, questionType });

    const [pane, setPane] = useState('passage');
    const [current, setCurrent] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    /* The start time is taken inside the effect below, not during render:
       reading the clock while rendering is an impure read, and React may render
       twice (StrictMode) which would make the two reads disagree. */
    const startedAt = useRef(0);

    /* Timer counts UP from the session start. The backend owns the real limit;
       this is the candidate's own clock, so it must not invent a countdown the
       server does not enforce. */
    useEffect(() => {
        if (loading || !attemptId) return undefined;
        startedAt.current = Date.now();
        const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
        return () => clearInterval(id);
    }, [loading, attemptId]);

    useEffect(() => {
        assertNoAnswersLeaked(questions);
    }, [questions]);

    const question = questions[current];
    const currentAnswered = question ? isAnswered(answers[question.id]) : false;

    const clock = useMemo(() => {
        const limit = (estimatedMinutes ?? 0) * 60;
        const shown = limit > 0 ? Math.max(0, limit - elapsed) : elapsed;
        const mm = String(Math.floor(shown / 60)).padStart(2, '0');
        const ss = String(shown % 60).padStart(2, '0');
        return { text: `${mm}:${ss}`, warning: limit > 0 && shown <= 300 };
    }, [elapsed, estimatedMinutes]);

    async function onSubmit() {
        try {
            await submit({ timeSpentSeconds: elapsed });
            navigate(`/ielts/result?attemptId=${encodeURIComponent(attemptId)}`, { replace: true });
        } catch {
            /* the hook exposes `error`; the boundary below renders it */
        }
    }

    function selectAnswer(value) {
        if (!question) return;
        setAnswer(question.id, [value]);
    }

    return (
        <div className="flex min-h-dvh flex-col bg-[var(--canvas)]">
            <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
                <Button variant="ghost" size="sm" iconOnly aria-label={t('common.close')} onClick={() => navigate('/ielts')}>
                    <X size={18} aria-hidden="true" />
                </Button>
                <div className="min-w-0 flex-1">
                    <span className="t-label block truncate">{testDetail?.title ?? t('ielts.takeTitle')}</span>
                    <span className="t-micro muted">
                        {t('ielts.questionProgress', { done: answeredCount, total: totalQuestions || '—' })}
                    </span>
                </div>
                <span
                    role="timer"
                    aria-live="off"
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-[var(--r-control)] px-3 py-2',
                        clock.warning
                            ? 'bg-[var(--wrong-soft)] text-[var(--wrong)]'
                            : 'bg-[var(--surface-alt)] text-[var(--ink-soft)]'
                    )}
                >
                    <Clock size={16} aria-hidden="true" />
                    <span className="t-mono">{clock.text}</span>
                </span>
                <Button size="sm" onClick={onSubmit} disabled={submitting || !attemptId}>
                    {submitting ? t('common.loading') : t('ielts.submit')}
                </Button>
            </header>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && questions.length === 0}
                onRetry={() => window.location.reload()}
                skeleton={
                    <div className="grid gap-4 p-4 lg:grid-cols-2">
                        <SkeletonCard lines={12} />
                        <SkeletonCard lines={8} />
                    </div>
                }
                emptyTitle={t('ielts.emptyPaperTitle')}
                emptyBody={t('ielts.emptyPaperBody')}
                emptyAction={
                    <Button size="sm" onClick={() => navigate('/ielts')}>
                        {t('common.back')}
                    </Button>
                }
            >
                <>
                    {/* Mobile-only pane switch, labelled with the answered count so
                        progress is visible without leaving the passage. */}
                    <div
                        role="tablist"
                        aria-label={t('ielts.paneSwitchLabel')}
                        className="flex gap-1.5 border-b-2 border-[var(--border)] bg-[var(--surface)] p-2 lg:hidden"
                    >
                        {[
                            { id: 'passage', icon: question?.audioUrl ? Headphones : BookOpen, label: question?.audioUrl ? t('ielts.audioTab') : t('ielts.passageTab') },
                            { id: 'questions', icon: Target, label: `${t('ielts.questionsTab')} (${answeredCount}/${totalQuestions})` },
                        ].map(({ id, icon: Icon, label }) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                id={`tab-${id}`}
                                aria-controls={`pane-${id}`}
                                aria-selected={pane === id}
                                onClick={() => setPane(id)}
                                className={cn(
                                    'flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[var(--r-sm)] text-sm font-bold',
                                    pane === id
                                        ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                        : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                                )}
                            >
                                <Icon size={16} aria-hidden="true" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="grid min-h-0 flex-1 lg:grid-cols-2">
                        {/* Below lg the panes are one-at-a-time; at lg both show and the
                            switch above is hidden. Visibility uses responsive utilities
                            rather than the `hidden` ATTRIBUTE, because the global
                            `[hidden] { display: none !important }` rule would override
                            `lg:block`. */}
                        <article
                            id="pane-passage"
                            role="tabpanel"
                            aria-labelledby="tab-passage"
                            className={cn(
                                'overflow-y-auto border-[var(--border)] bg-[var(--surface)] p-4 lg:block lg:border-r-2 lg:p-6',
                                pane === 'passage' ? 'block' : 'hidden'
                            )}
                        >
                            {question?.audioUrl ? (
                                <section aria-label={t('ielts.audioTab')} className="mb-4">
                                    {/* Listening audio. A transcript is deliberately not
                                        provided here: the product's rule is that it unlocks
                                        only AFTER submission, so adding one would break the
                                        exam condition the design commits to. */}
                                    <audio controls src={question.audioUrl} className="w-full" />
                                </section>
                            ) : null}
                            <h2 className="t-h2">{question?.passageTitle ?? testDetail?.title ?? '—'}</h2>
                            {/* `whitespace-pre-line` is deliberately gone: the passage is
                                Markdown now, and preserving the source's hard-wrapped
                                lines would break sentences mid-phrase. */}
                            <Markdown
                                className="prose-reading mt-4"
                                content={question?.passageContent ?? t('ielts.noPassage')}
                                components={EXAM_CONTENT_COMPONENTS}
                            />
                        </article>

                        <section
                            id="pane-questions"
                            role="tabpanel"
                            aria-labelledby="tab-questions"
                            className={cn(
                                'flex-col gap-4 bg-[var(--canvas)] p-4 lg:flex lg:overflow-y-auto lg:p-6',
                                pane === 'questions' ? 'flex' : 'hidden'
                            )}
                        >
                            <fieldset>
                                <legend className="t-label mb-2 flex items-center gap-2">
                                    <span
                                        aria-hidden="true"
                                        className="t-mono grid size-[26px] place-items-center rounded-[var(--r-sm)] bg-[var(--teal)] text-xs text-[var(--on-teal)]"
                                    >
                                        {current + 1}
                                    </span>
                                    {t('ielts.questionLabel', { number: current + 1, total: totalQuestions })}
                                </legend>

                                <Markdown
                                    className="mb-3"
                                    content={question?.questionText}
                                    components={QUESTION_COMPONENTS}
                                />

                                <div className="flex flex-col gap-2">
                                    {(question?.options ?? []).length > 0 ? (
                                        question.options.map((option, i) => {
                                            const letter = String.fromCharCode(65 + i);
                                            const selected = currentAnswered && answers[question.id]?.[0] === option;
                                            return (
                                                <AnswerTile
                                                    key={option}
                                                    keyLabel={letter}
                                                    state={selected ? 'selected' : 'idle'}
                                                    onClick={() => selectAnswer(option)}
                                                >
                                                    {option}
                                                </AnswerTile>
                                            );
                                        })
                                    ) : (
                                        /* Completion / short-answer: no options to pick
                                           from, so the answer is typed. */
                                        <label className="flex flex-col gap-1.5">
                                            <span className="t-micro muted">{t('ielts.yourAnswerLabel')}</span>
                                            <input
                                                className="min-h-12 w-full rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
                                                value={answers[question?.id]?.[0] ?? ''}
                                                onChange={(e) => selectAnswer(e.target.value)}
                                            />
                                        </label>
                                    )}
                                </div>
                            </fieldset>

                            <div className="mt-auto flex items-center gap-2 border-t-2 border-[var(--border)] pt-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={current === 0}
                                    onClick={() => setCurrent((n) => Math.max(0, n - 1))}
                                >
                                    {t('ielts.prevQuestion')}
                                </Button>
                                <div className="flex-1" />
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={current >= questions.length - 1}
                                    onClick={() => {
                                        setCurrent((n) => Math.min(questions.length - 1, n + 1));
                                        setPane('questions');
                                    }}
                                >
                                    {t('ielts.nextQuestion')}
                                </Button>
                            </div>

                            <div className="border-t-2 border-[var(--border)] pt-4">
                                <span className="t-micro muted">{t('ielts.navigator')}</span>
                                <div role="group" aria-label={t('ielts.navigator')} className="mt-2 flex flex-wrap gap-1.5">
                                    {questions.map((q, i) => {
                                        const answered = isAnswered(answers[q.id]);
                                        const isCurrent = i === current;
                                        return (
                                            <button
                                                key={q.id}
                                                type="button"
                                                aria-current={isCurrent ? 'true' : undefined}
                                                aria-label={`${t('ielts.questionLabel', { number: i + 1, total: totalQuestions })}${answered ? ` — ${t('ielts.answered')}` : ''}`}
                                                onClick={() => {
                                                    setCurrent(i);
                                                    setPane('questions');
                                                }}
                                                className={cn(
                                                    'grid size-10 place-items-center rounded-[var(--r-sm)] border-2 text-[0.8125rem] font-bold',
                                                    isCurrent
                                                        ? 'border-[var(--teal)] bg-[var(--teal)] text-[var(--on-teal)]'
                                                        : answered
                                                          ? 'border-[var(--correct)] bg-[var(--correct-soft)] text-[var(--correct)]'
                                                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)]'
                                                )}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </div>
                </>
            </AsyncBoundary>
        </div>
    );
}
