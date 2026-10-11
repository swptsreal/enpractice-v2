import { useTranslation } from 'react-i18next';
import {
    Flame,
    Target,
    BookOpen,
    Clock,
    Trophy,
    TrendingUp,
    Sparkles,
    AlertCircle,
    Compass,
    Star,
} from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Band, Chip, Stat, SkeletonCard, ProgressBar } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { formatDate } from '../../lib/datetime';
import { useProfile, hasTarget, daysUntil, avatarInitials } from '../../features/profile/useProfile';

/**
 * Profile — `/profile` (screen 33).
 *
 * THE HONESTY REQUIREMENT HERE IS ABOUT EMPTY GOALS. Verified live: a new account's
 * `goals` is entirely null except `dailyGoalMinutes: 30`. So there is no target band and
 * no exam date to draw progress against, and this screen ASKS for one instead of
 * rendering a bar at 0% — a progress bar toward an unset target is a fabricated
 * measurement.
 *
 * THE SAME RULE APPLIES TO `bandProgress`. It exists in the payload and is all zeroes
 * for a new account, and zero there means "chưa đo" (nothing graded yet), NOT band 0.0 —
 * so every unmeasured skill renders "—" and the block says why. No bar is drawn, because
 * there is no target behind it. `weakSkills` arrives pre-filled with a default on a new
 * account, so it is presented as SUGGESTED focus, never as "đo được từ bài làm".
 *
 * THE LEVEL IS EXPLAINED, NOT JUST DISPLAYED. `levelInfo` starts at
 * `currentLevel: 1, totalXp: 0, xpNeededForNextLevel: 100`, so the panel states what
 * earns XP and how much is left. The design is explicit that level is COSMETIC and
 * gates nothing, so no lock icon or "unlock" language appears anywhere near it.
 *
 * The streak renders calm, per the product's gamification ethics: the grace days are
 * named as a gift ("2 ngày nghỉ mỗi tháng"), never as a debt, and a streak of 0 is shown
 * as a starting point rather than a failure.
 */
export default function ProfilePage() {
    const { t } = useTranslation();
    const { profile, level, band, vocabulary, weakSkills, overallBand, avatarUrl, loading, error, reload } = useProfile();

    const overview = profile?.overview ?? {};
    const goals = profile?.goals ?? {};
    const remaining = daysUntil(goals.targetExamDate);
    const goalsSet = hasTarget(goals);

    return (
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && !profile}
                onRetry={reload}
                skeleton={
                    <div className="flex flex-col gap-4">
                        <SkeletonCard lines={3} />
                        <SkeletonCard lines={4} />
                    </div>
                }
                emptyTitle={t('profile.emptyTitle')}
                emptyBody={t('profile.emptyBody')}
            >
                {/* --- identity hero ------------------------------------------ */}
                <Card level="hero" padding="xl" className="flex flex-col gap-5 md:flex-row md:items-center">
                    {/* The image when the account has one, the initials when it does
                        not: `avatarUrl` is null for a new account (verified), and
                        `<img src={null}>` renders a broken-image glyph. */}
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={profile?.displayName ?? t('profile.unnamed')}
                            className="size-20 shrink-0 rounded-[var(--r-chip)] border-2 border-[var(--border-strong)] object-cover"
                        />
                    ) : (
                        <span
                            aria-hidden="true"
                            className="grid size-20 shrink-0 place-items-center rounded-[var(--r-chip)] bg-[var(--teal)] font-mono text-2xl font-bold text-[var(--on-teal)]"
                        >
                            {avatarInitials(profile?.displayName)}
                        </span>
                    )}

                    <div className="min-w-0 flex-1">
                        <h1 className="t-h1 break-words">{profile?.displayName ?? t('profile.unnamed')}</h1>
                        <p className="t-micro muted">{profile?.email}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Chip tone="neutral" icon={Sparkles}>
                                {t('profile.levelChip', { level: level.currentLevel })}
                            </Chip>
                            <Chip tone="neutral" icon={Flame}>
                                {t('common.streakDays', { count: overview.currentStreak ?? 0 })}
                            </Chip>
                            {overallBand != null ? (
                                <Chip tone="teal" icon={TrendingUp}>
                                    {t('profile.bandChip', { value: overallBand.toFixed(1) })}
                                </Chip>
                            ) : null}
                        </div>
                    </div>
                </Card>

                {/* --- four stat tiles ---------------------------------------- */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Stat value={overview.totalStudyMinutes ?? 0} label={t('profile.studyMinutes')} tone="teal" />
                    <Stat value={overview.totalWordsLearned ?? 0} label={t('profile.wordsLearned')} />
                    <Stat value={overview.totalLessonsCompleted ?? 0} label={t('profile.lessons')} />
                    <Stat value={profile?.weeklyXp ?? overview.weeklyXp ?? 0} label={t('profile.weeklyXp')} tone="amber" />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* --- learning goals ------------------------------------ */}
                    <Card level="edge" padding="xl" className="flex flex-col gap-3">
                        <h2 className="t-h3 flex items-center gap-2">
                            <Target size={18} aria-hidden="true" />
                            {t('profile.goalsTitle')}
                        </h2>

                        {goalsSet ? (
                            <>
                                {goals.targetIeltsBand != null ? (
                                    <RowBox center>
                                        <span className="min-w-0 flex-1">
                                            <span className="t-micro muted block">{t('profile.targetBand')}</span>
                                            <span className="font-mono text-2xl font-bold text-[var(--teal)]">
                                                {Number(goals.targetIeltsBand).toFixed(1)}
                                            </span>
                                        </span>
                                        {overallBand != null ? (
                                            <Chip tone={overallBand >= goals.targetIeltsBand ? 'correct' : 'neutral'}>
                                                {t('profile.currentBand', { value: overallBand.toFixed(1) })}
                                            </Chip>
                                        ) : null}
                                    </RowBox>
                                ) : null}

                                {goals.targetExamDate ? (
                                    <RowBox center>
                                        <span className="min-w-0 flex-1">
                                            <span className="t-micro muted block">{t('profile.examDate')}</span>
                                            <span className="t-label">{formatDate(goals.targetExamDate) ?? '—'}</span>
                                        </span>
                                        {remaining != null ? (
                                            <Chip tone="amber">{t('profile.daysLeft', { count: remaining })}</Chip>
                                        ) : (
                                            <Chip tone="neutral">{t('profile.datePassed')}</Chip>
                                        )}
                                    </RowBox>
                                ) : null}
                            </>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <p className="t-body soft">{t('profile.noGoalBody')}</p>
                                <ButtonLink to="/settings" size="sm" variant="secondary" className="self-start">
                                    {t('profile.setGoal')}
                                </ButtonLink>
                            </div>
                        )}

                        <div className="mt-auto flex flex-wrap gap-2 border-t-2 border-[var(--border)] pt-3 text-sm">
                            {goals.dailyGoalMinutes ? (
                                <Chip tone="neutral" icon={Clock}>
                                    {t('profile.dailyGoal', { count: goals.dailyGoalMinutes })}
                                </Chip>
                            ) : null}
                            {goals.weeklyWordGoal ? (
                                <Chip tone="neutral" icon={BookOpen}>
                                    {t('profile.weeklyWords', { count: goals.weeklyWordGoal })}
                                </Chip>
                            ) : null}
                        </div>
                    </Card>

                    {/* --- Lexi level: explained, and cosmetic ------------------- */}
                    <Card level="edge" padding="xl" className="flex flex-col gap-3">
                        <h2 className="t-h3">{t('profile.levelTitle')}</h2>

                        <div className="flex items-center gap-4">
                            <Lexi mood={level.currentLevel > 3 ? 'celebrate' : 'happy'} size="md" />
                            <div className="min-w-0 flex-1">
                                <span className="t-label block">
                                    {t('profile.levelOf', { level: level.currentLevel, next: level.nextLevel })}
                                </span>
                                <span
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={level.xpNeededForNextLevel || 100}
                                    aria-valuenow={level.xpIntoCurrentLevel}
                                    aria-label={t('profile.levelAria', {
                                        into: level.xpIntoCurrentLevel,
                                        needed: level.xpNeededForNextLevel,
                                    })}
                                    className="mt-1.5 block h-2.5 overflow-hidden rounded-full bg-[var(--surface-alt)]"
                                >
                                    <span
                                        className="block h-full rounded-full bg-[var(--teal)]"
                                        style={{ width: `${Math.min(100, level.progressPercentage)}%` }}
                                    />
                                </span>
                                <span className="t-micro muted mt-1 block">
                                    {t('profile.xpToNext', {
                                        into: level.xpIntoCurrentLevel,
                                        needed: level.xpNeededForNextLevel,
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* The unlock condition, stated. Level is cosmetic, so this
                            explains what earns XP rather than implying a locked door. */}
                        <p className="t-micro muted border-t-2 border-[var(--border)] pt-3">{t('profile.xpExplainer')}</p>
                        <p className="t-micro muted">{t('profile.levelCosmetic')}</p>
                    </Card>
                </div>

                {/* --- band progress ------------------------------------------ */}
                <Card level="edge" padding="xl" className="flex flex-col gap-3">
                    <h2 className="t-h3 flex items-center gap-2">
                        <TrendingUp size={18} aria-hidden="true" />
                        {t('profilePage.skillsSection.title')}
                    </h2>
                    <p className="t-micro muted -mt-1">{t('profilePage.skillsSection.subtitle')}</p>

                    <ul className="flex flex-col gap-1">
                        {band.rows.map((row) => (
                            <li key={row.skill}>
                                <RowBox center className="py-2">
                                    <span className="t-label min-w-0 flex-1">{t(row.labelKey)}</span>
                                    {row.measured ? (
                                        <span className="flex items-center gap-2">
                                            <Band value={row.current.toFixed(1)} />
                                            {row.previous != null && row.previous !== row.current ? (
                                                <span className="t-micro muted">
                                                    {t('profile.bandChip', { value: row.previous.toFixed(1) })}
                                                </span>
                                            ) : null}
                                        </span>
                                    ) : (
                                        /* "—" is the whole point: 0 here means chưa đo, and
                                           the sr-only text is what a screen reader gets
                                           instead of a silent dash. */
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="font-mono text-lg font-bold text-[var(--ink-faint)]"
                                                aria-hidden="true"
                                            >
                                                —
                                            </span>
                                            <span className="sr-only">{t('profilePage.consistency.empty')}</span>
                                        </span>
                                    )}
                                </RowBox>
                            </li>
                        ))}
                    </ul>

                    {/* 0 in `bandProgress` means "nothing graded yet", so it is said in
                        words rather than rendered as a score. */}
                    {!band.anyMeasured ? (
                        <p className="t-micro muted border-t-2 border-[var(--border)] pt-3">
                            {t('profilePage.consistency.empty')}
                        </p>
                    ) : null}
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* --- vocabulary ---------------------------------------- */}
                    <Card level="edge" padding="xl" className="flex flex-col gap-3">
                        <h2 className="t-h3 flex items-center gap-2">
                            <BookOpen size={18} aria-hidden="true" />
                            {t('profilePage.vocabularySection.title')}
                        </h2>
                        <p className="t-micro muted -mt-1">{t('profilePage.vocabularySection.subtitle')}</p>

                        <div className="grid grid-cols-3 gap-2">
                            <Stat value={vocabulary.totalWords} label={t('profilePage.skills.vocabulary')} />
                            <Stat value={vocabulary.masteredWords} label={t('profilePage.vocabulary.mastered')} tone="teal" />
                            <Stat value={vocabulary.reviewingWords} label={t('profilePage.vocabulary.reviewing')} />
                        </div>

                        <p className="t-micro muted">
                            {t('profilePage.vocabularySection.masteredWords', {
                                mastered: vocabulary.masteredWords,
                                total: vocabulary.totalWords,
                            })}
                        </p>

                        {/* A rate needs a denominator. 0 of 0 words is not 0% mastery. */}
                        {vocabulary.masteryPercentage != null ? (
                            <div className="flex flex-col gap-1.5">
                                <span className="t-micro muted">
                                    {t('profilePage.vocabularySection.masteryRate')} · {vocabulary.masteryPercentage}%
                                </span>
                                <ProgressBar
                                    value={vocabulary.masteryPercentage}
                                    thin
                                    label={`${t('profilePage.vocabularySection.masteryRate')} ${vocabulary.masteryPercentage}%`}
                                />
                            </div>
                        ) : (
                            <p className="t-micro muted">{t('profilePage.consistency.empty')}</p>
                        )}
                    </Card>

                    {/* --- dictionary stats ---------------------------------- */}
                    <Card level="edge" padding="xl" className="flex flex-col gap-3">
                        <h2 className="t-h3 flex items-center gap-2">
                            <Compass size={18} aria-hidden="true" />
                            {t('nav.dictionary')}
                        </h2>

                        <div className="grid grid-cols-3 gap-2">
                            <Stat value={vocabulary.totalWords} label={t('profilePage.skills.vocabulary')} />
                            <Stat value={vocabulary.newWords} label={t('profilePage.vocabulary.building')} />
                            <Stat value={vocabulary.learningWords} label={t('profilePage.vocabularySection.learning')} />
                            <Stat value={vocabulary.wordsToReviewToday} label={t('profilePage.vocabularySection.reviewToday')} tone="amber" />
                            <Stat value={vocabulary.favoriteWords} label={t('profilePage.vocabularySection.favorites')} icon={Star} />
                            <Stat value={vocabulary.masteredWords} label={t('profilePage.vocabulary.mastered')} tone="teal" />
                        </div>
                    </Card>
                </div>

                {/* --- weak skills: suggested focus, not a measurement -------- */}
                <Card level="edge" padding="xl" className="flex flex-col gap-3">
                    <h2 className="t-h3 flex items-center gap-2">
                        <AlertCircle size={18} aria-hidden="true" />
                        {t('profilePage.goals.needsFocus')}
                    </h2>

                    {weakSkills.length > 0 ? (
                        <>
                            <div className="flex flex-wrap gap-2">
                                {weakSkills.map((skill) => (
                                    <Chip key={skill} tone="amber">
                                        {skill}
                                    </Chip>
                                ))}
                            </div>
                            {/* A new account already has a DEFAULT list here, so this
                                states where the list comes from instead of implying
                                the learner's own essays produced it. */}
                            <p className="t-micro muted border-t-2 border-[var(--border)] pt-3">
                                {t('profilePage.recommendations.subtitle')}
                            </p>
                        </>
                    ) : (
                        <p className="t-body soft">{t('profilePage.consistency.empty')}</p>
                    )}
                </Card>

                {/* --- recent activity ---------------------------------------- */}
                <Card level="edge" padding="xl">
                    <h2 className="t-h3">{t('profile.activityTitle')}</h2>
                    {(profile?.recentActivities ?? []).length > 0 ? (
                        <ul className="mt-3 flex flex-col gap-2">
                            {profile.recentActivities.slice(0, 6).map((item, i) => (
                                <li key={item.id ?? i}>
                                    <RowBox center>
                                        <span className="t-micro muted">
                                            {formatDate(item.occurredAt ?? item.createdAt) ?? '—'}
                                        </span>
                                        <span className="t-body min-w-0 flex-1">
                                            {item.description ?? item.title ?? item.type ?? '—'}
                                        </span>
                                        {item.xpEarned ? (
                                            <Chip tone="amber">{t('profile.xpEarned', { count: item.xpEarned })}</Chip>
                                        ) : null}
                                    </RowBox>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="t-body soft mt-2">{t('profile.activityEmpty')}</p>
                    )}
                </Card>

                {/* --- streak, kept calm -------------------------------------- */}
                <Card level="flat" padding="lg">
                    <div className="flex flex-wrap items-center gap-3">
                        <Flame size={18} aria-hidden="true" className="shrink-0 text-[var(--ink-muted)]" />
                        <p className="t-micro soft flex-1">
                            {t('profile.streakCalm', { current: overview.currentStreak ?? 0, longest: overview.longestStreak ?? 0 })}
                        </p>
                        <Chip tone="neutral">{t('profile.graceDays')}</Chip>
                    </div>
                </Card>

                {profile?.leaderboardSummary?.myRank?.rank ? (
                    <Card level="flat" padding="lg">
                        <div className="flex items-center gap-3">
                            <Trophy size={18} aria-hidden="true" className="shrink-0 text-[var(--amber)]" />
                            <p className="t-micro soft flex-1">
                                {t('profile.rankNote', { rank: profile.leaderboardSummary.myRank.rank })}
                            </p>
                            <ButtonLink to="/leaderboard" size="sm" variant="ghost">
                                {t('nav.leaderboard')}
                            </ButtonLink>
                        </div>
                    </Card>
                ) : (
                    <Card level="flat" padding="lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={18} aria-hidden="true" className="shrink-0 text-[var(--ink-muted)]" />
                            <p className="t-micro muted flex-1">{t('profile.rankUnranked')}</p>
                        </div>
                    </Card>
                )}
            </AsyncBoundary>
        </div>
    );
}
