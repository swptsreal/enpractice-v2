import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { RowBox } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { formatDateTime } from '../../lib/datetime';
import { useWritingSubmissions, isGrading, isGradingFailed } from '../../features/writing/useWriting';

/**
 * Submitted essays — `/writing/submissions`.
 *
 * Cards rather than a table, for the same reason as the vocabulary history: v1 uses
 * antd `<Table scroll={{x}}>` with no mobile fallback, and horizontal scroll inside a
 * mobile-first product is v1's most common structural defect.
 *
 * The grading state is shown here too. A submission that is still being marked is a
 * real row in this list (verified: the backend returns it immediately with
 * `status: SUBMITTED`), so it needs a state chip rather than an empty band.
 */
export default function WritingHistoryPage() {
    const { t } = useTranslation();
    const { items, totalElements, loading, error, reload } = useWritingSubmissions({ page: 0, size: 20 });

    const graded = items.filter((s) => s.status === 'GRADED' && s.overallBandScore != null);
    const best = graded.reduce((max, s) => Math.max(max, Number(s.overallBandScore)), 0);
    const average = graded.length
        ? graded.reduce((sum, s) => sum + Number(s.overallBandScore), 0) / graded.length
        : 0;

    return (
        <div className="flex flex-col gap-4">
            <Link to="/writing" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
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
                emptyTitle={t('writing.historyEmptyTitle')}
                emptyBody={t('writing.historyEmptyBody')}
                emptyAction={
                    <ButtonLink to="/writing" variant="primary" size="sm">
                        {t('writing.title')}
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
                        {items.map((s) => {
                            const grading = isGrading(s.status);
                            const failed = isGradingFailed(s.status);
                            return (
                                <li key={s.id}>
                                    <Link to={`/writing/submission/${s.id}`} className="block">
                                        <RowBox center className="transition-colors hover:bg-[var(--surface-alt)]">
                                            <span className="min-w-0 flex-1">
                                                <strong className="t-label block text-[var(--ink)]">
                                                    {s.taskTitle ?? t('writing.title')}
                                                </strong>
                                                <span className="t-micro muted flex flex-wrap items-center gap-2">
                                                    <span>{t(`writing.type.${s.taskType}`)}</span>
                                                    <span>{t('writing.wordCount', { count: s.wordCount ?? 0 })}</span>
                                                    <span>{formatDateTime(s.submittedAt) ?? '—'}</span>
                                                </span>
                                            </span>
                                            <span className="flex shrink-0 items-center gap-2">
                                                {grading ? (
                                                    <Chip tone="amber" icon={Loader2}>
                                                        {t('writing.statusGrading')}
                                                    </Chip>
                                                ) : failed ? (
                                                    <Chip tone="wrong" icon={AlertTriangle}>
                                                        {t('writing.statusFailed')}
                                                    </Chip>
                                                ) : s.overallBandScore != null ? (
                                                    <span className="t-mono text-[var(--teal)]">
                                                        {Number(s.overallBandScore).toFixed(1)}
                                                    </span>
                                                ) : (
                                                    <Chip tone="neutral">{s.status}</Chip>
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
