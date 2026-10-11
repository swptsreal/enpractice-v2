import { useTranslation } from 'react-i18next';
import { CalendarRange, Check, Info, Sparkles, Target } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { formatDate } from '../../lib/datetime';
import { useWeeklyChallenges } from '../../features/gamification/useGamification';

/**
 * Weekly challenges — `/challenges` (screen 30).
 *
 * THE OPT-OUT IS PART OF THE SCREEN, not hidden in Settings. The design puts an explicit
 * "stop these" row on this page, next to the challenges themselves, because the moment a
 * user decides they do not want challenges is the moment they are looking at them. The
 * row links to the Settings group that actually owns the switch rather than pretending to
 * toggle something this screen cannot.
 *
 * PROGRESS IS MEASURED, NEVER NUDGED. Each challenge shows `currentValue / targetValue`
 * from the backend and the XP it is worth; there is no countdown pressure, no "you are
 * about to lose", and an incomplete challenge is simply incomplete. `remainingValue` is
 * available and deliberately not phrased as a warning.
 *
 * A COMPLETED CHALLENGE SHOWS ITS GRANT, NOT A CLAIM BUTTON — the backend records
 * `rewardGrantedAt` and there is no claim endpoint, same as reward missions.
 */
export default function ChallengesPage() {
    const { t } = useTranslation();
    const { weekStart, weekEnd, challenges, completedCount, totalXpAvailable, loading, error, reload } =
        useWeeklyChallenges();

    /* The one nearest completion leads, which is the useful order for deciding what to do
     * next. Completed ones move to the end regardless of progress. */
    const ordered = [...challenges].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return Number(b.progressPercent ?? 0) - Number(a.progressPercent ?? 0);
    });

    const active = ordered.find((c) => !c.completed) ?? null;

    return (
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
            <p className="t-micro muted">{t('challenges.subtitle')}</p>

            {/* --- the week ------------------------------------------------ */}
            <Card level="edge" padding="xl" className="flex flex-col gap-4 md:flex-row md:items-center">
                <Lexi mood="excited" size="md" />
                <div className="min-w-0 flex-1">
                    <span className="t-micro muted flex items-center gap-1.5">
                        <CalendarRange size={13} aria-hidden="true" />
                        {weekStart && weekEnd
                            ? t('challenges.weekOf', { from: formatDate(weekStart) ?? '—', to: formatDate(weekEnd) ?? '—' })
                            : t('challenges.thisWeek')}
                    </span>
                    <h1 className="t-h2 mt-1">
                        {challenges.length > 0
                            ? t('challenges.progressHeadline', { done: completedCount, total: challenges.length })
                            : t('challenges.title')}
                    </h1>
                    {totalXpAvailable > 0 ? (
                        <p className="t-body soft mt-1">{t('challenges.xpAvailable', { count: totalXpAvailable })}</p>
                    ) : null}
                </div>
            </Card>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && challenges.length === 0}
                onRetry={reload}
                skeleton={
                    <div className="flex flex-col gap-3">
                        <SkeletonCard lines={3} />
                        <SkeletonCard lines={2} />
                    </div>
                }
                emptyTitle={t('challenges.emptyTitle')}
                emptyBody={t('challenges.emptyBody')}
                emptyAction={
                    <ButtonLink to="/home" size="sm" variant="primary">
                        {t('nav.home')}
                    </ButtonLink>
                }
            >
                <div className="flex flex-col gap-4">
                    {/* --- the active challenge, as a hero ------------------- */}
                    {active ? (
                        <Card level="hero" padding="xl" className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Chip tone="teal" icon={Target}>
                                    {t('challenges.activeChip')}
                                </Chip>
                                {active.rewardXp ? (
                                    <Chip tone="amber" icon={Sparkles}>
                                        {t('rewards.xp', { count: active.rewardXp })}
                                    </Chip>
                                ) : null}
                            </div>

                            <h2 className="t-h3">{active.title}</h2>
                            {active.description ? <p className="t-body soft">{active.description}</p> : null}

                            <div className="flex items-center gap-3">
                                <span className="t-mono text-sm tabular-nums">
                                    {t('challenges.valueOf', { current: active.currentValue, target: active.targetValue })}
                                </span>
                                <span
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={active.targetValue}
                                    aria-valuenow={active.currentValue}
                                    aria-label={t('challenges.progressAria', {
                                        title: active.title,
                                        current: active.currentValue,
                                        target: active.targetValue,
                                    })}
                                    className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-alt)]"
                                >
                                    <span
                                        className="block h-full rounded-full bg-[var(--teal)]"
                                        style={{ width: `${Math.min(100, Number(active.progressPercent ?? 0))}%` }}
                                    />
                                </span>
                            </div>

                            {/* The number remaining, stated as a fact and not as a warning. */}
                            {active.remainingValue > 0 ? (
                                <p className="t-micro muted">
                                    {t('challenges.remaining', { count: active.remainingValue })}
                                </p>
                            ) : null}
                        </Card>
                    ) : null}

                    {/* --- the rest ----------------------------------------- */}
                    <ul className="flex flex-col gap-2">
                        {ordered.map((challenge) => {
                            const pct = Math.min(100, Number(challenge.progressPercent ?? 0));
                            return (
                                <li key={challenge.definitionId ?? challenge.code}>
                                    <RowBox
                                        center
                                        className={challenge.completed ? 'border-l-4 border-l-[var(--correct)]' : undefined}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={
                                                'grid size-10 shrink-0 place-items-center rounded-[var(--r-sm)] ' +
                                                (challenge.completed
                                                    ? 'bg-[var(--correct-soft)] text-[var(--correct)]'
                                                    : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]')
                                            }
                                        >
                                            {challenge.completed ? <Check size={18} /> : <Target size={18} />}
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <strong className="t-label block text-[var(--ink)]">{challenge.title}</strong>
                                            <span className="t-micro muted">
                                                {t('challenges.valueOf', {
                                                    current: challenge.currentValue,
                                                    target: challenge.targetValue,
                                                })}
                                                {challenge.completed
                                                    ? ` · ${challenge.rewardGrantedAt ? t('challenges.granted') : t('challenges.completed')}`
                                                    : ''}
                                            </span>
                                            <span
                                                className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[var(--surface-alt)]"
                                                aria-hidden="true"
                                            >
                                                <span
                                                    className={
                                                        'block h-full rounded-full ' +
                                                        (challenge.completed ? 'bg-[var(--correct)]' : 'bg-[var(--teal)]')
                                                    }
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </span>
                                        </span>

                                        <span className="flex shrink-0 flex-col items-end gap-1">
                                            {challenge.rewardXp ? (
                                                <span className="t-mono text-[var(--amber)]">+{challenge.rewardXp}</span>
                                            ) : null}
                                            {challenge.completed ? (
                                                <Chip tone="correct">{t('rewards.claimed')}</Chip>
                                            ) : (
                                                <Chip tone="neutral">{t('challenges.inProgress')}</Chip>
                                            )}
                                        </span>
                                    </RowBox>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </AsyncBoundary>

            {/* --- the opt-out, ON this screen ----------------------------- */}
            <Card level="flat" padding="lg">
                <div className="flex flex-wrap items-center gap-3">
                    <Info size={16} className="shrink-0 text-[var(--ink-muted)]" aria-hidden="true" />
                    <p className="t-micro soft flex-1">{t('challenges.optOutNote')}</p>
                    <ButtonLink to="/settings" size="sm" variant="secondary">
                        {t('challenges.optOutAction')}
                    </ButtonLink>
                </div>
            </Card>

            <div className="flex flex-wrap items-center justify-center gap-3">
                <Stat value={completedCount} label={t('challenges.completedStat')} tone="teal" />
                <ButtonLink to="/rewards" size="sm" variant="ghost">
                    {t('nav.rewards')}
                </ButtonLink>
                <ButtonLink to="/leaderboard" size="sm" variant="ghost">
                    {t('nav.leaderboard')}
                </ButtonLink>
            </div>
        </div>
    );
}
