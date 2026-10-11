import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { RowBox } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { formatDateTime } from '../../lib/datetime';
import { useSpeakingAttempts, isGrading, isGradingFailed } from '../../features/speaking/useSpeaking';

/**
 * Speaking attempts — `/speaking/attempts`.
 *
 * Cards, not a table, for the same reason as the vocabulary and writing histories: a
 * hidden table is still a table to a screen reader, and v1's `scroll={{x}}` tables have
 * no mobile fallback.
 */
export default function SpeakingHistoryPage() {
    const { t } = useTranslation();
    const { items, totalElements, loading, error, reload } = useSpeakingAttempts({ page: 0, size: 20 });

    const graded = items.filter((a) => a.status === 'GRADED' && a.overallBandScore != null);
    const best = graded.reduce((max, a) => Math.max(max, Number(a.overallBandScore)), 0);
    const average = graded.length
        ? graded.reduce((sum, a) => sum + Number(a.overallBandScore), 0) / graded.length
        : 0;

    return (
        <div className="flex flex-col gap-4">
            <Link to="/speaking" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('common.back')}
            </Link>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && items.length === 0}
                onRetry={reload}
                skeleton={
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 4 }, (_, i) => (
                            <SkeletonCard key={i} lines={2} />
                        ))}
                    </div>
                }
                emptyTitle={t('speaking.historyEmptyTitle')}
                emptyBody={t('speaking.historyEmptyBody')}
                emptyAction={
                    <ButtonLink to="/speaking" variant="primary" size="sm">
                        {t('speaking.title')}
                    </ButtonLink>
                }
            >
                <div className="flex flex-col gap-4">
                    {graded.length > 1 ? (
                        <div className="grid grid-cols-3 gap-3">
                            <Stat value={totalElements} label={t('vocabTest.attemptsStat')} tone="teal" />
                            <Stat value={average.toFixed(1)} label={t('vocabTest.averageStat')} />
                            <Stat value={best.toFixed(1)} label={t('vocabTest.bestStat')} tone="amber" />
                        </div>
                    ) : null}

                    <ul className="flex flex-col gap-2">
                        {items.map((a) => {
                            const grading = isGrading(a.status);
                            const failed = isGradingFailed(a.status);
                            return (
                                <li key={a.id}>
                                    <Link to={`/speaking/result/${a.id}`} className="block">
                                        <RowBox center className="transition-colors hover:bg-[var(--surface-alt)]">
                                            <span className="min-w-0 flex-1">
                                                <strong className="t-label block text-[var(--ink)]">
                                                    {a.topicQuestion ?? t('speaking.title')}
                                                </strong>
                                                <span className="t-micro muted flex flex-wrap items-center gap-2">
                                                    <span>{t(`speaking.part.${a.topicPart}`)}</span>
                                                    {a.timeSpentSeconds ? (
                                                        <span>
                                                            {t('home.minutes', {
                                                                count: Math.max(1, Math.round(a.timeSpentSeconds / 60)),
                                                            })}
                                                        </span>
                                                    ) : null}
                                                    <span>{formatDateTime(a.submittedAt) ?? '—'}</span>
                                                </span>
                                            </span>
                                            <span className="flex shrink-0 items-center gap-2">
                                                {grading ? (
                                                    <Chip tone="amber" icon={Loader2}>
                                                        {t('speaking.statusGrading')}
                                                    </Chip>
                                                ) : failed ? (
                                                    <Chip tone="wrong" icon={AlertTriangle}>
                                                        {t('speaking.statusFailed')}
                                                    </Chip>
                                                ) : a.overallBandScore != null ? (
                                                    <span className="t-mono text-[var(--teal)]">
                                                        {Number(a.overallBandScore).toFixed(1)}
                                                    </span>
                                                ) : (
                                                    <Chip tone="neutral">{a.status}</Chip>
                                                )}
                                                <ArrowRight size={16} aria-hidden="true" className="text-[var(--ink-muted)]" />
                                            </span>
                                        </RowBox>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </AsyncBoundary>
        </div>
    );
}
