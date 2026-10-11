import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { RowBox } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { useVocabularyHistory } from '../../features/vocabulary/useVocabularyTest';

/**
 * Vocabulary test history.
 *
 * The table becomes CARDS below 768px rather than scrolling horizontally. That is
 * the direct fix for v1, which has 11 antd `<Table scroll={{x}}>` instances and no
 * card fallback: horizontal scroll inside a mobile-first product is the single most
 * common structural defect in v1's lists.
 *
 * Both renderings are described here so the collapse is reviewable, and the page
 * uses one DOM (cards) below the breakpoint rather than rendering both and hiding
 * one — a hidden table is still a table for a screen reader.
 */
export default function VocabularyHistoryPage() {
    const { t } = useTranslation();
    const history = useVocabularyHistory({ page: 0, size: 20 });

    const best = history.items.reduce((max, a) => Math.max(max, a.accuracyPercent ?? 0), 0);
    const average = history.items.length
        ? history.items.reduce((sum, a) => sum + (a.accuracyPercent ?? 0), 0) / history.items.length
        : 0;

    return (
        <div className="flex flex-col gap-4">
            <Link to="/vocabulary" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('common.back')}
            </Link>

            <AsyncBoundary
                loading={history.loading}
                error={history.error}
                isEmpty={!history.loading && !history.error && history.items.length === 0}
                onRetry={history.reload}
                skeleton={
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 4 }, (_, i) => (
                            <SkeletonCard key={i} lines={2} />
                        ))}
                    </div>
                }
                emptyTitle={t('vocabTest.historyEmptyTitle')}
                emptyBody={t('vocabTest.historyEmptyBody')}
                emptyAction={
                    <ButtonLink to="/vocabulary" variant="primary" size="sm">
                        {t('vocabTest.title')}
                    </ButtonLink>
                }
            >
                <div className="flex flex-col gap-4">
                    {history.items.length > 1 ? (
                        <div className="grid grid-cols-3 gap-3">
                            <Stat value={history.totalElements} label={t('vocabTest.attemptsStat')} tone="teal" />
                            <Stat value={`${Math.round(average)}%`} label={t('vocabTest.averageStat')} />
                            <Stat value={`${Math.round(best)}%`} label={t('vocabTest.bestStat')} tone="amber" />
                        </div>
                    ) : null}

                    <ul className="flex flex-col gap-2">
                        {history.items.map((attempt) => (
                            <li key={attempt.attemptId}>
                                <Link
                                    to={`/vocabulary/result?attemptId=${encodeURIComponent(attempt.attemptId)}`}
                                    className="block"
                                >
                                    <RowBox center className="transition-colors hover:bg-[color-mix(in_srgb,var(--teal)_8%,var(--surface-alt))]">
                                        <span className="min-w-0 flex-1">
                                            <strong className="t-label block text-[var(--ink)]">
                                                {attempt.testTitle ?? t('vocabTest.untitled')}
                                            </strong>
                                            <span className="t-micro muted flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock size={12} aria-hidden="true" />
                                                    {attempt.completedAt ?? attempt.startedAt ?? '—'}
                                                </span>
                                                <span>
                                                    {t('vocabTest.correctOf', {
                                                        correct: attempt.correctCount ?? 0,
                                                        total: attempt.totalQuestions ?? 0,
                                                    })}
                                                </span>
                                            </span>
                                        </span>
                                        <span className="flex shrink-0 items-center gap-2">
                                            {attempt.accuracyPercent != null ? (
                                                <span className="t-mono text-[var(--teal)]">
                                                    {Math.round(attempt.accuracyPercent)}%
                                                </span>
                                            ) : (
                                                <Chip tone="amber">{attempt.status ?? '—'}</Chip>
                                            )}
                                            <ArrowRight size={16} aria-hidden="true" className="text-[var(--ink-muted)]" />
                                        </span>
                                    </RowBox>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </AsyncBoundary>
        </div>
    );
}
