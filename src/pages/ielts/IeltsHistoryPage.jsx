import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Headphones, BookOpen } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { formatDate } from '../../lib/datetime';
import { cn } from '../../lib/cn';
import { useIeltsHistory, buildBandSeries, SKILL_LABEL_KEYS } from '../../features/ielts/useIeltsDetail';

/**
 * IELTS history — `/ielts/history` (screen 20).
 *
 * THE CHART HAS AN ACCESSIBLE NAME DESCRIBING ITS SERIES. The design is explicit that a
 * chart with no accessible name is not usable, so the whole figure is `role="img"` with an
 * `aria-label` that lists the weeks and bands in words. The bars themselves are
 * `aria-hidden`, because forty decorative divs add nothing to that description.
 *
 * EMPTY WEEKS ARE ABSENT, NOT ZERO. A week with no attempt is simply not plotted: a bar at
 * zero would state "scored band 0 this week", which is a different and false claim. That
 * is why `buildBandSeries` only emits weeks that exist.
 *
 * The axis labels are ISO week numbers (`2026-W41`), which is a real, checkable label
 * derived from the attempt's own timestamp — no fabricated dates.
 */
const MAX_BAND = 9;

export default function IeltsHistoryPage() {
    const { t } = useTranslation();
    const { items, totalElements, best, average, gradedCount, loading, error, reload } = useIeltsHistory({ size: 30 });

    const series = useMemo(() => buildBandSeries(items), [items]);

    /** One sentence the screen reader can read instead of the bars. */
    const chartLabel = useMemo(() => {
        if (series.length === 0) return t('ielts.chartEmpty');
        const parts = series.map((point) => {
            const bands = [
                point.LISTENING != null ? t('ielts.chartPointListening', { band: point.LISTENING }) : null,
                point.READING != null ? t('ielts.chartPointReading', { band: point.READING }) : null,
            ].filter(Boolean);
            return `${point.week}: ${bands.join(', ')}`;
        });
        return t('ielts.chartLabel', { series: parts.join('; ') });
    }, [series, t]);

    return (
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
            <Link to="/ielts" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('ielts.title')}
            </Link>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && items.length === 0}
                onRetry={reload}
                skeleton={
                    <div className="flex flex-col gap-3">
                        <SkeletonCard lines={4} />
                        <SkeletonCard lines={3} />
                    </div>
                }
                emptyTitle={t('ielts.historyEmptyTitle')}
                emptyBody={t('ielts.historyEmptyBody')}
                emptyAction={
                    <ButtonLink to="/ielts" variant="primary" size="sm">
                        {t('ielts.title')}
                    </ButtonLink>
                }
            >
                <div className="flex flex-col gap-4">
                    {/* --- summary ---------------------------------------------- */}
                    <div className="grid grid-cols-3 gap-3">
                        <Stat value={totalElements} label={t('ielts.attemptsStat')} tone="teal" />
                        <Stat value={average ? average.toFixed(1) : '—'} label={t('vocabTest.averageStat')} />
                        <Stat value={best ? best.toFixed(1) : '—'} label={t('vocabTest.bestStat')} tone="amber" />
                    </div>

                    {/* --- band by week ---------------------------------------- */}
                    <Card level="edge" padding="xl">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="t-h3">{t('ielts.chartTitle')}</h2>
                            {/* A legend, because two series share one chart. */}
                            <div className="flex flex-wrap gap-2">
                                <Chip tone="teal" icon={Headphones}>
                                    {t(SKILL_LABEL_KEYS.LISTENING)}
                                </Chip>
                                <Chip tone="amber" icon={BookOpen}>
                                    {t(SKILL_LABEL_KEYS.READING)}
                                </Chip>
                            </div>
                        </div>

                        {series.length === 0 ? (
                            <p className="t-body soft mt-3">{t('ielts.chartEmpty')}</p>
                        ) : (
                            <figure className="m-0 mt-4">
                                {/* The accessible description is the chart; the bars are
                                    decoration hidden from assistive tech. */}
                                <div
                                    role="img"
                                    aria-label={chartLabel}
                                    className="flex items-end gap-3 overflow-x-auto pb-1"
                                >
                                    {series.map((point) => (
                                        <div key={point.week} aria-hidden="true" className="flex shrink-0 flex-col items-center gap-1.5">
                                            <div className="flex h-40 items-end gap-1">
                                                {/* teal for Listening, amber for Reading */}
                                                {['LISTENING', 'READING'].map((skill) => {
                                                    const value = point[skill];
                                                    const height = value != null ? (value / MAX_BAND) * 100 : 0;
                                                    return (
                                                        <span
                                                            key={skill}
                                                            className={cn(
                                                                'w-5 rounded-t-[var(--r-sm)]',
                                                                skill === 'LISTENING' ? 'bg-[var(--teal)]' : 'bg-[var(--amber)]',
                                                                value == null && 'bg-[var(--surface-alt)]'
                                                            )}
                                                            style={{ height: `${Math.max(height, value != null ? 4 : 0)}%` }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <span className="t-mono text-[0.625rem] text-[var(--ink-muted)]">
                                                {point.week.split('-')[1]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <figcaption className="t-micro muted mt-2">
                                    {t('ielts.chartCaption')}
                                </figcaption>
                            </figure>
                        )}
                    </Card>

                    {/* --- the list ------------------------------------------- */}
                    <ul className="flex flex-col gap-2">
                        {items.map((attempt) => (
                            <li key={attempt.attemptId}>
                                <Link to={`/ielts/result?attemptId=${encodeURIComponent(attempt.attemptId)}`} className="block">
                                    <RowBox center className="transition-colors hover:bg-[var(--surface-alt)]">
                                        <span className="min-w-0 flex-1">
                                            <strong className="t-label block text-[var(--ink)]">
                                                {attempt.testTitle ?? t('ielts.title')}
                                            </strong>
                                            <span className="t-micro muted flex flex-wrap items-center gap-2">
                                                <span>{t(SKILL_LABEL_KEYS[attempt.skill] ?? 'ielts.skill.all')}</span>
                                                <span>
                                                    {t('vocabTest.correctOf', {
                                                        correct: attempt.correctCount ?? 0,
                                                        total: attempt.totalQuestions ?? 0,
                                                    })}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock size={12} aria-hidden="true" />
                                                    {formatDate(attempt.completedAt ?? attempt.startedAt) ?? '—'}
                                                </span>
                                            </span>
                                        </span>
                                        <span className="flex shrink-0 items-center gap-2">
                                            {attempt.bandScore != null ? (
                                                <span className="t-mono text-[var(--teal)]">
                                                    {Number(attempt.bandScore).toFixed(1)}
                                                </span>
                                            ) : (
                                                <Chip tone="neutral">{attempt.status ?? '—'}</Chip>
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

            <div className="flex items-center justify-center gap-3">
                <Lexi mood="approve" size="xs" />
                <span className="t-micro muted">{t('ielts.historyNote')}</span>
            </div>
        </div>
    );
}
