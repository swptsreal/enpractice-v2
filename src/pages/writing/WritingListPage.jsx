import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Clock, FileText, Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { cn } from '../../lib/cn';
import { TASK_TYPES, isGrading, isGradingFailed, useWritingTasks, useHighestScores } from '../../features/writing/useWriting';

/**
 * Writing task list — `/writing` (screen 21).
 *
 * Three things the design calls for and this implements:
 *
 *  1. **A Task 1 / Task 2 segmented filter**, because the two are genuinely different
 *     tasks with different word targets, not one list with a label.
 *  2. **"Đang chấm" is a designed state.** Grading is asynchronous (verified:
 *     SUBMITTED → GRADING → GRADED, ~6 s), so a card whose latest submission is still
 *     being marked shows an amber clock chip and its action becomes "Xem trạng thái"
 *     rather than pretending a result is ready.
 *  3. **The previous band is shown when it exists**, from
 *     `POST /writing/tasks/highest-scores`, which returns `{ attempted, highestBandScore,
 *     status }` per task. `band` is a Float, so it formats to one decimal — the API
 *     returns `6` for what it calls band 6.0.
 *
 * TWO KEY LISTS ARE STATIC ON PURPOSE. `task.difficulty` arrives as `EASY | MEDIUM | HARD`
 * while `ielts.difficulty` stores lowercase keys, so `t(\`ielts.difficulty.${difficulty}\`)`
 * printed the raw key `ielts.difficulty.EASY` on the card — the reported i18n bug — and a
 * template key is invisible to `scripts/i18n-audit.mjs`, which only scans literals. Static
 * maps fix both problems at once.
 *
 * BOTH CARD ACTIONS SHARE ONE GEOMETRY. The primary action and "Xem kết quả" used to be a
 * `ButtonLink` and a bare text link, so they sat at different heights and alignments in the
 * same column. They are now two `ButtonLink`s of the same size, and the hierarchy is carried
 * by the VARIANT instead: primary (or secondary while grading) above ghost.
 */

/** `TaskDifficulty` is an UPPERCASE enum; the locale stores lowercase keys. */
const DIFFICULTY_LABEL_KEYS = {
    EASY: 'ielts.difficulty.easy',
    MEDIUM: 'ielts.difficulty.medium',
    HARD: 'ielts.difficulty.hard',
};

/** `WritingTaskType` is `TASK_1 | TASK_2`; the locale keys happen to match its case. */
const TASK_TYPE_LABEL_KEYS = {
    TASK_1: 'writing.type.TASK_1',
    TASK_2: 'writing.type.TASK_2',
};

export default function WritingListPage() {
    const { t } = useTranslation();
    const [taskType, setTaskType] = useState(null);

    const { items, loading, error, reload } = useWritingTasks({ taskType });

    /* One batch call for the whole page rather than a request per card. The ids are
       the request key, so it re-fetches when the list actually changes. */
    const taskIds = useMemo(() => items.map((task) => task.id), [items]);
    const scores = useHighestScores(taskIds);

    return (
        <div className="flex flex-col gap-4">
            <p className="t-micro muted">{t('writing.subtitle')}</p>

            {/* --- segmented filter ---------------------------------------- */}
            <div role="group" aria-label={t('writing.filterLabel')} className="flex flex-wrap gap-1.5">
                {[null, ...TASK_TYPES].map((type) => (
                    <button
                        key={type ?? 'ALL'}
                        type="button"
                        aria-pressed={taskType === type}
                        onClick={() => setTaskType(type)}
                        className={cn(
                            'min-h-11 rounded-[var(--r-control)] px-3.5 text-sm font-bold',
                            taskType === type
                                ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                        )}
                    >
                        {type ? t(TASK_TYPE_LABEL_KEYS[type]) : t('writing.filterAll')}
                    </button>
                ))}
            </div>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && items.length === 0}
                onRetry={reload}
                skeleton={
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }, (_, i) => (
                            <SkeletonCard key={i} lines={4} />
                        ))}
                    </div>
                }
                emptyTitle={t('writing.emptyTitle')}
                emptyBody={t('writing.emptyBody')}
                emptyMood="explain"
            >
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((task) => {
                        const score = scores[task.id];
                        const grading = score?.attempted && isGrading(score.status);
                        const failed = score?.attempted && isGradingFailed(score.status);
                        const band = score?.highestBandScore;
                        const difficultyKey = DIFFICULTY_LABEL_KEYS[task.difficulty];

                        return (
                            <li key={task.id}>
                                <Card level="edge" padding="xl" className="flex h-full flex-col">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Chip tone="neutral">{t(TASK_TYPE_LABEL_KEYS[task.taskType] ?? 'writing.type.TASK_1')}</Chip>
                                        {difficultyKey ? <Chip tone="amber">{t(difficultyKey)}</Chip> : null}
                                        {grading ? (
                                            <Chip tone="amber" icon={Loader2}>
                                                {t('writing.statusGrading')}
                                            </Chip>
                                        ) : failed ? (
                                            <Chip tone="wrong" icon={AlertTriangle}>
                                                {t('writing.statusFailed')}
                                            </Chip>
                                        ) : band != null ? (
                                            <Chip tone="teal" icon={TrendingUp}>
                                                {Number(band).toFixed(1)}
                                            </Chip>
                                        ) : null}
                                    </div>

                                    {/* The prompt is the card's content, so it is shown
                                        in full up to a sensible length rather than
                                        replaced by a title. */}
                                    <h3 className="t-h3 mt-3 line-clamp-5">{task.title}</h3>

                                    <p className="t-micro muted mt-2 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1">
                                            <FileText size={13} aria-hidden="true" />
                                            {t('writing.wordRange', { min: task.minWords, max: task.maxWords })}
                                        </span>
                                        {task.timeLimitMinutes ? (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock size={13} aria-hidden="true" />
                                                {t('home.minutes', { count: task.timeLimitMinutes })}
                                            </span>
                                        ) : null}
                                    </p>

                                    {/* The two actions share one size and one full width, so
                                        they line up; only the variant ranks them. */}
                                    <div className="mt-auto flex flex-col gap-2 pt-4">
                                        <ButtonLink
                                            to={`/writing/task/${task.id}`}
                                            variant={grading || failed ? 'secondary' : 'primary'}
                                            size="sm"
                                            block
                                        >
                                            {grading
                                                ? t('writing.viewStatus')
                                                : failed
                                                  ? t('writing.tryAgain')
                                                  : band != null
                                                    ? t('writing.rewrite')
                                                    : t('writing.start')}
                                        </ButtonLink>
                                        {band != null && score?.submissionId ? (
                                            <ButtonLink
                                                to={`/writing/submission/${score.submissionId}`}
                                                variant="ghost"
                                                size="sm"
                                                block
                                            >
                                                {t('writing.viewResult')}
                                            </ButtonLink>
                                        ) : null}
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            </AsyncBoundary>

            <div className="flex items-center justify-center gap-4">
                <Lexi mood="explain" size="xs" />
                <Link to="/writing/submissions" className="t-label text-[var(--teal)]">
                    {t('writing.historyLink')}
                </Link>
            </div>
        </div>
    );
}
