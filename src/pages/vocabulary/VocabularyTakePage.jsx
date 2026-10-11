import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AnswerTile, Verdict } from '../../components/ui/AnswerTile';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { SkeletonCard, Chip } from '../../components/ui/Primitives';
import { Lexi } from '../../components/mascot/Lexi';
import { useVocabularyAttempt, SOURCE_LABEL_KEYS } from '../../features/vocabulary/useVocabularyTest';

/**
 * Sitting a vocabulary test: ONE QUESTION PER SCREEN.
 *
 * v1 batches the whole paper into a form. That is the change v2 makes, and the
 * reason is the product promise: feedback you can feel only exists if the question
 * owns the screen at the moment it is answered.
 *
 * The verdict bar carries colour AND a glyph AND the explanation, never colour
 * alone (WCAG 2.1 SC 1.4.1). Lexi reacts at 40px so the mascot supplies the
 * emotional beat without taking the question's space.
 *
 * Options are answered by INDEX (the backend's `selectedOptionIndex`), which is why
 * the tile's letter is derived from the array position rather than parsed from the
 * option text.
 */
export default function VocabularyTakePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const testId = params.get('testId');
    const resumeAttemptId = params.get('attemptId');

    const {
        questions,
        questionCount,
        loading,
        error,
        answers,
        selectOption,
        answeredCount,
        submit,
        submitting,
        result,
        attemptId,
    } = useVocabularyAttempt({ testId, attemptId: resumeAttemptId });

    const [index, setIndex] = useState(0);
    const [checked, setChecked] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (loading || result) return undefined;
        const id = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [loading, result]);

    const question = questions[index];
    const selected = question ? answers[question.questionId] : undefined;
    const clock = useMemo(() => {
        const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const ss = String(elapsed % 60).padStart(2, '0');
        return `${mm}:${ss}`;
    }, [elapsed]);

    /* A finished attempt (resumed, or just submitted) goes straight to the result. */
    useEffect(() => {
        if (result && attemptId) {
            navigate(`/vocabulary/result?attemptId=${encodeURIComponent(attemptId)}`, { replace: true });
        }
    }, [result, attemptId, navigate]);

    function onCheck() {
        setChecked(true);
    }

    function onNext() {
        setChecked(false);
        setIndex((n) => Math.min(questions.length - 1, n + 1));
    }

    async function onSubmit() {
        try {
            await submit({ timeSpentSeconds: elapsed });
        } catch {
            /* the boundary renders `error` */
        }
    }

    const isLast = index >= questions.length - 1;

    return (
        <div className="flex min-h-dvh flex-col bg-[var(--canvas)]">
            <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
                <Button variant="ghost" size="sm" iconOnly aria-label={t('common.close')} onClick={() => navigate('/vocabulary')}>
                    <X size={18} aria-hidden="true" />
                </Button>
                <div className="min-w-0 flex-1">
                    <span className="t-label block truncate">{t('vocabTest.takingTitle')}</span>
                    <span className="t-micro muted">
                        {t('vocabTest.progress', { done: answeredCount, total: questionCount || '—' })}
                    </span>
                </div>
                <span role="timer" aria-live="off" className="inline-flex items-center gap-1.5 rounded-[var(--r-control)] bg-[var(--surface-alt)] px-3 py-2 text-[var(--ink-soft)]">
                    <Clock size={16} aria-hidden="true" />
                    <span className="t-mono">{clock}</span>
                </span>
                <Button size="sm" onClick={onSubmit} disabled={submitting || !attemptId}>
                    {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : t('vocabTest.submit')}
                </Button>
            </header>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && questions.length === 0}
                onRetry={() => window.location.reload()}
                skeleton={
                    <div className="mx-auto w-full max-w-[680px] p-4">
                        <SkeletonCard lines={6} />
                    </div>
                }
                emptyTitle={t('vocabTest.emptyPaperTitle')}
                emptyBody={t('vocabTest.emptyPaperBody')}
                emptyAction={
                    <Button size="sm" onClick={() => navigate('/vocabulary')}>
                        {t('common.back')}
                    </Button>
                }
            >
                <main className="mx-auto w-full max-w-[680px] flex-1 px-4 pt-7 pb-32 text-center">
                    <span className="t-micro muted">
                        {t('vocabTest.questionOf', { number: index + 1, total: questions.length })}
                    </span>
                    {question?.sourceType ? (
                        <Chip tone="neutral" className="ml-2">
                            {SOURCE_LABEL_KEYS[question.sourceType]
                                ? t(SOURCE_LABEL_KEYS[question.sourceType])
                                : t('vocabTest.sourceOther')}
                        </Chip>
                    ) : null}

                    {/* The prompt: a blank sentence when the backend supplies one,
                        otherwise the question text. */}
                    <h1 className="t-display mt-3">
                        {question?.blankSentence || question?.questionText}
                    </h1>

                    <div className="mt-6 flex flex-col gap-2.5 text-left">
                        {(question?.options ?? []).map((option, i) => {
                            const letter = String.fromCharCode(65 + i);
                            const isSelected = selected === i;
                            return (
                                <AnswerTile
                                    key={`${letter}-${option}`}
                                    keyLabel={letter}
                                    state={isSelected ? 'selected' : 'idle'}
                                    onClick={() => {
                                        if (checked) return;
                                        selectOption(question.questionId, i);
                                    }}
                                    disabled={checked}
                                >
                                    {option}
                                </AnswerTile>
                            );
                        })}
                    </div>

                    {/* Per-question correctness is NOT knowable before submission:
                        `correctOptionIndex` only arrives in the submit response.
                        So this bar confirms the choice was recorded rather than
                        claiming a verdict it cannot support — a fake "correct"
                        here would be the worst kind of bug in a study tool. */}
                    {checked && selected !== undefined ? (
                        <Verdict
                            state="correct"
                            title={t('vocabTest.choiceRecorded')}
                            className="mt-4 text-left"
                            lexi={<Lexi mood="happy" size="xs" />}
                        >
                            {t('vocabTest.choiceRecordedBody', { option: String.fromCharCode(65 + selected) })}
                        </Verdict>
                    ) : null}
                </main>

                <footer className="sticky bottom-0 border-t-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
                    <div className="mx-auto flex w-full max-w-[680px] items-center gap-3">
                        <Button
                            variant="ghost"
                            size="md"
                            disabled={index === 0}
                            onClick={() => {
                                setChecked(false);
                                setIndex((n) => Math.max(0, n - 1));
                            }}
                        >
                            <ChevronLeft size={18} aria-hidden="true" />
                            <span className="hidden sm:inline">{t('ielts.prevQuestion')}</span>
                        </Button>

                        <div className="flex-1" />

                        {selected !== undefined && !checked ? (
                            <Button variant="secondary" size="md" onClick={onCheck}>
                                {t('vocabTest.check')}
                            </Button>
                        ) : null}

                        {isLast ? (
                            <Button variant="primary" size="lg" onClick={onSubmit} disabled={submitting}>
                                {submitting ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : t('vocabTest.submit')}
                            </Button>
                        ) : (
                            <Button variant="primary" size="md" onClick={onNext}>
                                <span>{t('ielts.nextQuestion')}</span>
                                <ChevronRight size={18} aria-hidden="true" />
                            </Button>
                        )}
                    </div>
                </footer>
            </AsyncBoundary>
        </div>
    );
}
