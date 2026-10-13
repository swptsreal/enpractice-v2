import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Coins, Check, Lock, Sparkles, Info, Star } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/datetime';
import RewardsInventory from './RewardsInventory';
import {
    useRewardMissions,
    useXpHistory,
    useXpMilestones,
    creditValueOf,
    xpValueOf,
    milestoneState,
    milestoneRewardNames,
    MILESTONE_STATE_LABEL_KEYS,
} from '../../features/gamification/useGamification';

/**
 * Rewards — `/rewards` (screen 31). Four independent sources, three of which this screen
 * never called before: XP milestones, reward missions and the inventory, on top of the XP
 * history. Each keeps its own loading/empty/error state, because they fail independently.
 *
 * THE TWO KINDS OF REWARD ARE *NOT* THE SAME, AND THE UI MUST NOT PRETEND THEY ARE.
 *
 *  - **XP MILESTONES ARE CLAIMED BY HAND.** `POST /user/xp-milestones/{code}/claim` is a
 *    real route (verified: 200 with `{code, grantedItems[]}`, and 400 VALIDATION_ERROR
 *    "Not enough XP to claim milestone" when under the threshold — a 404 would mean the
 *    route did not exist). So a milestone that is `eligible` and not yet `claimed` gets a
 *    CLAIM BUTTON. `eligible` stays true after claiming, so the button keys on
 *    `eligible && !claimed`; keying on `eligible` alone would offer a press that always
 *    fails with "Milestone already claimed".
 *
 *  - **REWARD MISSIONS ARE GRANTED AUTOMATICALLY.** `RewardMissionStatus` is only
 *    `LOCKED` or `CLAIMED`, a completed mission carries `claimedAt`, and the controller
 *    exposes no claim route. So this list has NO claim button — a control that does
 *    nothing is worse than none — and the note above it says the reward is automatic.
 *
 * THE CREDIT VALUE IS ONLY SHOWN WHEN IT IS REAL. `rewardDefinitions` mixes
 * `{ type: 'CREDIT', amount, expiryDays }` with `{ type: 'INVENTORY_ITEM', itemCode,
 * quantity }`. Only the CREDIT entries are summed: converting an inventory item into a
 * credit figure would mean inventing an exchange rate the backend never states.
 *
 * The XP history is a separate endpoint (`/xp/history`), which also carries the totals,
 * so the header uses it rather than re-deriving them from the mission list.
 */
export default function RewardsPage() {
    const { t } = useTranslation();
    /* The screen-level tab. The inventory is fetched INSIDE its own tab component, so switching to
       "Nhiệm vụ" no longer issues an inventory request at all. */
    const [tab, setTab] = useState('missions');
    const milestones = useXpMilestones();
    const missions = useRewardMissions();
    const xp = useXpHistory({ size: 8 });

    const { locked, claimed } = missions;

    /* Ordered so the ones closest to completion come first — the useful order for a
     * learner deciding what to do next, and independent of the backend's sort order. */
    const inProgress = [...locked].sort((a, b) => {
        const pa = Number(a.progress?.target) > 0 ? Number(a.progress.current) / Number(a.progress.target) : 0;
        const pb = Number(b.progress?.target) > 0 ? Number(b.progress.current) / Number(b.progress.target) : 0;
        return pb - pa;
    });

    return (
        <div className="mx-auto flex w-full max-w-[var(--container-wide)] flex-col gap-4">
            <p className="t-micro muted">{t('rewards.subtitle')}</p>

            {/* --- totals --------------------------------------------------- */}
            <Card level="hero" padding="xl" className="flex flex-col gap-4 md:flex-row md:items-center">
                <Lexi mood="celebrate" size="md" />
                <div className="min-w-0 flex-1">
                    <span className="t-micro muted">{t('rewards.xpTitle')}</span>
                    <div className="flex flex-wrap items-baseline gap-3">
                        <span className="font-mono text-4xl font-bold tabular-nums text-[var(--amber)]">
                            {xp.totalXp}
                        </span>
                        <span className="t-body soft">{t('rewards.weeklyXp', { count: xp.weeklyXp })}</span>
                    </div>
                </div>
                <ButtonLink to="/leaderboard" size="sm" variant="ghost">
                    {t('nav.leaderboard')}
                </ButtonLink>
            </Card>

            {/* --- the two concerns, one at a time -------------------------- */}
            {/* THE POINT OF THE REDESIGN. Every section used to mount at once in a single 820px
                column, so the first thing a learner saw was what they had already done and the
                inventory was the seventh block down. The mockup's rule is "the page never renders
                all three concerns at once", and the container is the WIDE one because three- and
                four-column grids need it — 820px is the FOCUS width. */}
            <div
                role="tablist"
                aria-label={t('rewards.screenTabsLabel')}
                className="flex gap-1 rounded-[var(--r-control)] bg-[var(--surface-alt)] p-1"
            >
                {[
                    { id: 'missions', label: t('rewards.screenTabs.missions') },
                    { id: 'inventory', label: t('rewards.screenTabs.inventory') },
                ].map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        id={`rw-${id}-tab`}
                        aria-controls={`rw-${id}`}
                        aria-selected={tab === id}
                        onClick={() => setTab(id)}
                        className={cn(
                            'min-h-11 flex-1 rounded-[var(--r-sm)] text-sm font-bold',
                            tab === id
                                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-[0_2px_0_0_var(--border)]'
                                : 'text-[var(--ink-muted)]'
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'inventory' ? (
                <RewardsInventory />
            ) : (
                <div id="rw-missions" role="tabpanel" aria-labelledby="rw-missions-tab" className="flex flex-col gap-6">
            {/* --- XP milestones: the ONE reward type with a claim action ---- */}
            <AsyncBoundary
                loading={milestones.loading}
                error={milestones.error}
                isEmpty={!milestones.loading && !milestones.error && milestones.milestones.length === 0}
                onRetry={milestones.reload}
                skeleton={
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 3 }, (_, i) => (
                            <SkeletonCard key={i} lines={2} />
                        ))}
                    </div>
                }
                emptyTitle={t('rewards.milestones.empty')}
                emptyMood="explain"
            >
                <section className="flex flex-col gap-3">
                    <h2 className="t-h3 flex items-center gap-2">
                        <Star size={18} aria-hidden="true" />
                        {t('rewards.milestones.title')}
                    </h2>
                    <p className="t-micro muted -mt-1">{t('rewards.milestones.subtitle')}</p>

                    {milestones.claimError ? (
                        <p role="alert" className="t-micro font-semibold text-[var(--wrong)]">
                            {t('rewards.errors.claimMilestone')}
                        </p>
                    ) : null}

                    <ul className="flex flex-col gap-2">
                        {milestones.milestones.map((milestone) => {
                            const state = milestoneState(milestone);
                            const rewardNames = milestoneRewardNames(milestone);
                            const busy = milestones.claiming === milestone.code;

                            return (
                                <li key={milestone.code}>
                                    <RowBox center className="gap-3">
                                        <span
                                            aria-hidden="true"
                                            className={state === 'locked' ? 'text-[var(--ink-faint)]' : 'text-[var(--amber)]'}
                                        >
                                            {state === 'claimed' ? <Check size={18} /> : <Star size={18} />}
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <strong className="t-label block text-[var(--ink)]">
                                                {/* The milestone has no name of its own; the item it
                                                    grants is the only thing the backend names. */}
                                                {rewardNames.length > 0 ? rewardNames.join(' · ') : milestone.code}
                                            </strong>
                                            <span className="t-micro muted">
                                                {t('rewards.xp', { count: milestone.requiredTotalXp })}
                                            </span>
                                        </span>

                                        <Chip tone={state === 'claimable' ? 'amber' : state === 'claimed' ? 'correct' : 'neutral'}>
                                            {t(MILESTONE_STATE_LABEL_KEYS[state])}
                                        </Chip>

                                        {state === 'claimable' ? (
                                            <Button
                                                size="sm"
                                                variant="reward"
                                                disabled={busy}
                                                onClick={() => milestones.claim(milestone.code)}
                                            >
                                                {t('rewards.milestones.claim')}
                                            </Button>
                                        ) : null}
                                    </RowBox>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </AsyncBoundary>

            {/* Reward MISSIONS are automatic — said once, plainly, before their list. */}
            <Card level="flat" padding="lg">
                <div className="flex items-start gap-3">
                    <Info size={16} className="mt-0.5 shrink-0 text-[var(--teal)]" aria-hidden="true" />
                    <p className="t-micro soft">{t('rewards.automaticNote')}</p>
                </div>
            </Card>

            {/* --- in progress --------------------------------------------- */}
            <AsyncBoundary
                loading={missions.loading}
                error={missions.error}
                isEmpty={!missions.loading && !missions.error && missions.missions.length === 0}
                onRetry={missions.reload}
                skeleton={
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 4 }, (_, i) => (
                            <SkeletonCard key={i} lines={2} />
                        ))}
                    </div>
                }
                emptyTitle={t('rewards.emptyTitle')}
                emptyBody={t('rewards.emptyBody')}
            >
                <section className="flex flex-col gap-3">
                    <h2 className="t-h3">{t('rewards.inProgressTitle')}</h2>
                    <ul className="flex flex-col gap-2">
                        {inProgress.map((mission) => {
                            const credits = creditValueOf(mission);
                            const bonusXp = xpValueOf(mission);
                            const target = Number(mission.progress?.target ?? 0);
                            const current = Number(mission.progress?.current ?? 0);
                            const pct = target > 0 ? Math.round((current / target) * 100) : 0;

                            return (
                                <li key={mission.code}>
                                    <RowBox className="flex-col items-stretch gap-2 py-3.5">
                                        <span className="flex flex-wrap items-start gap-3">
                                            <span aria-hidden="true" className="text-[var(--teal)]">
                                                <Gift size={18} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <strong className="t-label block text-[var(--ink)]">{mission.name}</strong>
                                                {mission.progress?.label ? (
                                                    <span className="t-micro muted">{mission.progress.label}</span>
                                                ) : null}
                                            </span>
                                            <span className="flex shrink-0 flex-wrap items-center gap-1.5">
                                                {/* Only values the backend states. */}
                                                {credits != null ? (
                                                    <Chip tone="amber" icon={Coins}>
                                                        {t('rewards.credits', { count: credits })}
                                                    </Chip>
                                                ) : null}
                                                {bonusXp != null ? (
                                                    <Chip tone="neutral" icon={Sparkles}>
                                                        {t('rewards.xp', { count: bonusXp })}
                                                    </Chip>
                                                ) : null}
                                            </span>
                                        </span>

                                        {target > 0 ? (
                                            <span
                                                role="progressbar"
                                                aria-valuemin={0}
                                                aria-valuemax={target}
                                                aria-valuenow={current}
                                                aria-label={t('rewards.progressAria', {
                                                    name: mission.name,
                                                    current,
                                                    target,
                                                })}
                                                className="ml-[30px] block h-2 overflow-hidden rounded-full bg-[var(--surface-alt)]"
                                            >
                                                <span
                                                    className="block h-full rounded-full bg-[var(--teal)]"
                                                    style={{ width: `${Math.min(100, pct)}%` }}
                                                />
                                            </span>
                                        ) : null}
                                    </RowBox>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </AsyncBoundary>

            {/* --- claimed -------------------------------------------------- */}
            {claimed.length > 0 ? (
                <section className="flex flex-col gap-3">
                    <h2 className="t-h3">{t('rewards.claimedTitle')}</h2>
                    <ul className="flex flex-col gap-2">
                        {claimed.map((mission) => (
                            <li key={mission.code}>
                                <RowBox center>
                                    <span aria-hidden="true" className="text-[var(--correct)]">
                                        <Check size={18} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <strong className="t-label block text-[var(--ink)]">{mission.name}</strong>
                                        <span className="t-micro muted">
                                            {mission.claimedAt ? formatDate(mission.claimedAt) : t('rewards.granted')}
                                        </span>
                                    </span>
                                    <Chip tone="correct">{t('rewards.claimed')}</Chip>
                                </RowBox>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {/* --- inventory -------------------------------------------------
                MOVED to its own tab and its own file (`RewardsInventory.jsx`): it needs filters,
                paging and per-item actions that the rest of this screen has no use for. */}

            {/* --- XP history ---------------------------------------------- */}
            <Card level="edge" padding="xl">
                <h2 className="t-h3">{t('rewards.historyTitle')}</h2>
                {xp.history.length > 0 ? (
                    <ul className="mt-3 flex flex-col gap-2">
                        {xp.history.map((row, i) => (
                            <li key={row.id ?? i}>
                                <RowBox center>
                                    <span className="t-micro muted">{formatDate(row.createdAt ?? row.date) ?? '—'}</span>
                                    <span className="t-body min-w-0 flex-1">{row.source ?? row.reason ?? row.type ?? '—'}</span>
                                    <span className="t-mono text-[var(--amber)]">
                                        {Number(row.amount ?? row.xp) > 0 ? '+' : ''}
                                        {row.amount ?? row.xp}
                                    </span>
                                </RowBox>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="t-body soft mt-2">{t('rewards.noHistory')}</p>
                )}
            </Card>

            <div className="flex items-center justify-center gap-3">
                <Lock size={15} className="text-[var(--ink-faint)]" aria-hidden="true" />
                <span className="t-micro muted">{t('rewards.noPurchase')}</span>
            </div>
                </div>
            )}
        </div>
    );
}
