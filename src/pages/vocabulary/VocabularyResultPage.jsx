import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, X, Sparkles, RefreshCw, BookMarked } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { useVocabularyAttemptResult } from '../../features/vocabulary/useVocabularyTest';

/**
 * Vocabulary test result.
 *
 * Reads `GET /vocabulary-tests/attempts/{id}`, which returns the SAME
 * `SubmitVocabularyTestResponse` the submit endpoint does — so a result works both
 * straight after submitting and when reopened from history. That is why the screen
 * re-reads instead of depending on navigation state.
 *
 * Each wrong answer shows the correct answer AND what the candidate chose. Both are
 * needed: "you were wrong" without "you said X, it is Y" is not feedback.
 *
 * `correctAnswer`/`correctOptionIndex` legitimately appear here — the paper is
 * submitted, so the key is no longer a secret. The take screen is where they must
 * never reach.
 */
export default function VocabularyResultPage() {
    const { t } = useTranslation();
    const [params] = useSearchParams();
    const attemptId = params.get('attemptId');

    const { result, loading, error } = useVocabularyAttemptResult(attemptId);
    const wrong = (result?.results ?? []).filter((r) => !r.isCorrect);

    if (!attemptId) {
        return (
            <Card level="edge" padding="xl" className="text-center">
                <h2 className="t-h2">{t('vocabTest.resultNoAttemptTitle')}</h2>
                <p className="t-body muted mt-2">{t('vocabTest.resultNoAttemptBody')}</p>
                <ButtonLink to="/vocabulary/history" variant="primary" className="mt-4">
                    {t('vocabTest.historyLink')}
                </ButtonLink>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Link to="/vocabulary" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('common.back')}
            </Link>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && !result}
                onRetry={() => window.location.reload()}
                skeleton={<SkeletonCard lines={5} />}
                emptyTitle={t('vocabTest.resultEmptyTitle')}
                emptyBody={t('vocabTest.resultEmptyBody')}
                emptyAction={
                    <ButtonLink to="/vocabulary" variant="primary" size="sm">
                        {t('vocabTest.title')}
                    </ButtonLink>
                }
            >
                <div className="flex flex-col gap-4">
                    <Card level="hero" padding="xl" className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
                        <Lexi
                            mood={(result?.accuracyPercent ?? 0) >= 80 ? 'celebrate' : (result?.accuracyPercent ?? 0) >= 50 ? 'happy' : 'explain'}
                            size="lg"
                            label={t('vocabTest.lexiResult')}
                        />
                        <div className="min-w-0 flex-1">
                            <span className="t-micro muted">{result?.testTitle ?? t('vocabTest.title')}</span>
                            <div className="flex items-baseline justify-center gap-3 md:justify-start">
                                <span className="font-mono text-5xl font-bold tabular-nums text-[var(--teal)]">
                                    {result?.correctCount ?? 0}/{result?.totalQuestions ?? 0}
                                </span>
                                {result?.accuracyPercent != null ? (
                                    <Chip tone="teal">
                                        {t('ielts.accuracyChip', { value: Math.round(result.accuracyPercent) })}
                                    </Chip>
                                ) : null}
                            </div>
                            <p className="t-body soft mt-2">
                                {wrong.length
                                    ? t('vocabTest.wrongSummary', { count: wrong.length })
                                    : t('ielts.allCorrect')}
                            </p>
                        </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <Stat value={result?.correctCount ?? 0} label={t('ielts.correctAnswersStat')} tone="teal" />
                        <Stat value={wrong.length} label={t('ielts.wrongAnswersStat')} />
                        <Stat
                            value={result?.timeSpentSeconds ? Math.round(result.timeSpentSeconds / 60) : '—'}
                            label={t('ielts.timeSpent')}
                            icon="clock"
                        />
                        <Stat value={result?.totalQuestions ?? 0} label={t('vocabTest.questionCountLabel')} />
                    </div>

                    <Card level="edge" padding="xl">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="t-h3">{t('vocabTest.answerReview')}</h2>
                            {wrong.length ? <Chip tone="wrong">{t('ielts.wrongCount', { count: wrong.length })}</Chip> : null}
                        </div>

                        <ul className="mt-3.5 flex flex-col gap-3">
                            {(result?.results ?? []).map((item, i) => (
                                <li key={item.questionId ?? i}>
                                    <RowBox
                                        className={item.isCorrect ? undefined : 'border-2 border-[var(--wrong)]'}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={
                                                't-mono grid size-[26px] shrink-0 place-items-center rounded-[var(--r-sm)] text-xs ' +
                                                (item.isCorrect
                                                    ? 'bg-[var(--correct)] text-white'
                                                    : 'bg-[var(--wrong)] text-white')
                                            }
                                        >
                                            {item.order ?? i + 1}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            {item.blankSentence ? (
                                                <span className="t-micro muted block">{item.blankSentence}</span>
                                            ) : null}
                                            <span className="t-body block">{item.questionText}</span>

                                            {/* colour + glyph + label, never colour alone */}
                                            <span className="t-body mt-2 flex items-start gap-2 text-[var(--correct)]">
                                                <Check size={16} className="mt-1 shrink-0" aria-hidden="true" />
                                                <span>
                                                    <strong className="t-label">{t('ielts.correctAnswer')}:</strong>{' '}
                                                    {item.correctAnswer ?? '—'}
                                                </span>
                                            </span>
                                            {!item.isCorrect ? (
                                                <span className="t-body flex items-start gap-2 text-[var(--wrong)]">
                                                    <X size={16} className="mt-1 shrink-0" aria-hidden="true" />
                                                    <span>
                                                        <strong className="t-label">{t('ielts.yourAnswer')}:</strong>{' '}
                                                        {item.selectedAnswer ?? t('ielts.blankAnswer')}
                                                    </span>
                                                </span>
                                            ) : null}

                                            {item.explanation ? (
                                                <span className="t-micro soft mt-2 flex items-start gap-2">
                                                    <Sparkles size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                                                    {item.explanation}
                                                </span>
                                            ) : null}
                                        </span>
                                    </RowBox>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <div className="flex flex-wrap gap-3">
                        <ButtonLink to="/vocabulary" variant="primary" className="grow">
                            {t('vocabTest.anotherTest')}
                        </ButtonLink>
                        <ButtonLink to="/dictionary" variant="ghost">
                            <BookMarked size={16} aria-hidden="true" />
                            {t('vocabTest.openDictionary')}
                        </ButtonLink>
                        <Button variant="ghost" onClick={() => window.location.reload()}>
                            <RefreshCw size={16} aria-hidden="true" />
                            {t('common.retry')}
                        </Button>
                    </div>
                </div>
            </AsyncBoundary>
        </div>
    );
}
