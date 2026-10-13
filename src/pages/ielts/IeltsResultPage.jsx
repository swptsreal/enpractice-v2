import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { unwrapData } from '../../api/envelope';
import { ieltsApi } from '../../api';

/**
 * Test result.
 *
 * Two things this screen must not do, both of which v1's did:
 *
 *   1. Report a number and stop. Every wrong answer is listed with the correct
 *      answer AND what the candidate chose, plus an action. A result screen that
 *      only reports is a dead end, and the product's promise is feedback you can
 *      use.
 *   2. Present the band as official. It is labelled as an estimate from practice
 *      data. PRODUCT.md forbids band-improvement claims and the UI must not imply
 *      one.
 *
 * Data comes from `GET /ielts/attempts/{id}`, which returns the same
 * `SubmitTestResponse` shape the submit endpoint returns — so this screen works
 * both straight after submitting and when reopened from history. That is why it
 * re-reads rather than depending on navigation state: a result you cannot reopen
 * is not a result, it is a receipt.
 */

/** `{ attemptId, testId, totalQuestions, correctCount, accuracyPercent, bandScore,
 *    timeSpentSeconds, scopeTitle, testDetail, results: [...] }` */
function readResult(response) {
    const data = unwrapData(response);
    if (!data) return null;
    return {
        attemptId: data.attemptId,
        title: data.testDetail?.title ?? data.scopeTitle ?? null,
        skill: data.testDetail?.skill ?? null,
        totalQuestions: data.totalQuestions ?? data.results?.length ?? 0,
        correctCount: data.correctCount ?? 0,
        accuracyPercent: data.accuracyPercent ?? null,
        bandScore: data.bandScore ?? null,
        timeSpentSeconds: data.timeSpentSeconds ?? null,
        results: Array.isArray(data.results) ? data.results : [],
    };
}

export default function IeltsResultPage() {
    const { t } = useTranslation();
    const [params] = useSearchParams();
    const attemptId = params.get('attemptId');

    const attempt = useAsyncResource(
        () => ieltsApi.getAttemptById(attemptId),
        { enabled: Boolean(attemptId) }
    );

    const result = readResult(attempt.data);
    const wrong = result?.results.filter((r) => !r.isCorrect) ?? [];
    const minutes = result?.timeSpentSeconds ? Math.round(result.timeSpentSeconds / 60) : null;

    /* No attemptId means the candidate navigated here directly. That is not an
     * error, it is a missing input, and it gets its own state rather than a
     * "server problem" message. */
    if (!attemptId) {
        return (
            <Card level="edge" padding="xl" className="text-center">
                <h2 className="t-h2">{t('ielts.resultNoAttemptTitle')}</h2>
                <p className="t-body muted mt-2">{t('ielts.resultNoAttemptBody')}</p>
                <ButtonLink to="/ielts/history" variant="primary" className="mt-4">
                    {t('ielts.history')}
                </ButtonLink>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Link to="/ielts" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('common.back')}
            </Link>

            <AsyncBoundary
                loading={attempt.loading}
                error={attempt.error}
                isEmpty={!attempt.loading && !attempt.error && !result}
                onRetry={attempt.reload}
                skeleton={
                    <div className="flex flex-col gap-4">
                        <SkeletonCard lines={3} />
                        <SkeletonCard lines={4} />
                    </div>
                }
                emptyTitle={t('ielts.resultEmptyTitle')}
                emptyBody={t('ielts.resultEmptyBody')}
                emptyAction={
                    <ButtonLink to="/ielts" variant="primary" size="sm">
                        {t('ielts.title')}
                    </ButtonLink>
                }
            >
                <div className="flex flex-col gap-4">
                    <Card level="hero" padding="xl" className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
                        <Lexi mood={(result?.bandScore ?? 0) >= 6.5 ? 'celebrate' : 'explain'} size="lg" label={t('ielts.lexiResult')} />
                        <div className="min-w-0 flex-1">
                            <span className="t-micro muted">{t('ielts.estimatedBand')}</span>
                            <div className="flex items-baseline justify-center gap-3 md:justify-start">
                                <span className="font-mono text-5xl font-bold tabular-nums text-[var(--teal)]">
                                    {result?.bandScore != null ? result.bandScore.toFixed(1) : '—'}
                                </span>
                                {result?.accuracyPercent != null ? (
                                    <Chip tone="teal">
                                        {t('ielts.accuracyChip', { value: Math.round(result.accuracyPercent) })}
                                    </Chip>
                                ) : null}
                            </div>
                            <p className="t-body soft mt-2">
                                {t('ielts.correctOfTotal', {
                                    correct: result?.correctCount ?? 0,
                                    total: result?.totalQuestions ?? 0,
                                })}
                            </p>
                        </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <Stat
                            value={`${result?.correctCount ?? 0}/${result?.totalQuestions ?? 0}`}
                            label={t('ielts.correctAnswersStat')}
                            tone="teal"
                        />
                        <Stat value={wrong.length} label={t('ielts.wrongAnswersStat')} />
                        <Stat value={minutes ?? '—'} label={t('ielts.timeSpent')} icon="clock" />
                        <Stat value={result?.skill ?? '—'} label={t('ielts.skillLabel')} />
                    </div>

                    <Card level="edge" padding="xl">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="t-h3">{t('ielts.reviewAnswers')}</h2>
                            {wrong.length ? <Chip tone="wrong">{t('ielts.wrongCount', { count: wrong.length })}</Chip> : null}
                        </div>

                        {wrong.length === 0 ? null : (
                            <ul className="mt-3.5 flex flex-col gap-3">
                                {wrong.map((item, i) => (
                                    <li key={item.questionId ?? i}>
                                        <RowBox>
                                            <span
                                                aria-hidden="true"
                                                className="t-mono grid size-[26px] shrink-0 place-items-center rounded-[var(--r-sm)] bg-[var(--wrong)] text-xs text-white"
                                            >
                                                {i + 1}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="t-micro muted block">{item.questionType}</span>
                                                <span className="t-body block">{item.questionText}</span>

                                                {/* colour + glyph + label, never colour alone */}
                                                <span className="t-body mt-2 flex items-start gap-2 text-[var(--correct)]">
                                                    <Check size={16} className="mt-1 shrink-0" aria-hidden="true" />
                                                    <span>
                                                        <strong className="t-label">{t('ielts.correctAnswer')}:</strong>{' '}
                                                        {(item.correctAnswer ?? []).join(', ') || '—'}
                                                    </span>
                                                </span>
                                                <span className="t-body flex items-start gap-2 text-[var(--wrong)]">
                                                    <X size={16} className="mt-1 shrink-0" aria-hidden="true" />
                                                    <span>
                                                        <strong className="t-label">{t('ielts.yourAnswer')}:</strong>{' '}
                                                        {(item.userAnswer ?? []).join(', ') || t('ielts.blankAnswer')}
                                                    </span>
                                                </span>

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
                        )}
                    </Card>

                    <div className="flex flex-wrap gap-3">
                        <ButtonLink to="/ielts" variant="primary" className="grow">
                            {t('ielts.anotherTest')}
                        </ButtonLink>
                        <Button variant="ghost" onClick={attempt.reload}>
                            <RefreshCw size={16} aria-hidden="true" />
                            {t('common.retry')}
                        </Button>
                    </div>

                    <Card level="flat" padding="lg">
                        <div className="flex items-center gap-3">
                            <Clock size={20} aria-hidden="true" className="shrink-0 text-[var(--ink-muted)]" />
                            <p className="t-micro soft">{t('ielts.transcriptLocked')}</p>
                        </div>
                    </Card>
                </div>
            </AsyncBoundary>
        </div>
    );
}
