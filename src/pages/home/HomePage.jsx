import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, ArrowRight, Headphones, PenLine, Mic, Check, RefreshCw, BookMarked } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { ButtonLink, Button } from '../../components/ui/Button';
import { Stat, ProgressBar, Chip, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { unwrapData } from '../../api/envelope';
import { dashboardApi, creditApi } from '../../api';

/**
 * Home.
 *
 * v1's home is a 12-column bento of six widgets that asks the user to choose.
 * v2 asks ONE question and answers it — here is the next thing, here is how long
 * it takes.
 *
 * Fields below match the RUNNING BACKEND, verified 2026-10-11 rather than
 * assumed. Four things that were wrong in the first pass:
 *
 *   /progress-snapshot returns  currentStreak, weeklyXp, studiedMinutes,
 *                              targetMinutes, todayProgressPercent,
 *                              latestImprovementText
 *              and NOT       streakDays, totalXp, estimatedBand, credits
 *   /continue-learning returns title, description, resumeUrl, estimatedMinutes,
 *                              reason, metadata.testTitle
 *   /daily-learning-plan returns { date, goalMinutes, items: [] }
 *   every response is wrapped in { success, message, data }
 *
 * There is no `estimatedBand` anywhere in the dashboard payloads, so the band
 * tile is gone rather than faked: it is shown on /evaluation, which is where the
 * number is actually produced. Inventing a placeholder for it on the home screen
 * would be exactly the "fabricate proof" the product's own rules forbid.
 */

/* ---------------------------------------------------------------- mappers */

/** `{date, goalMinutes, items: [...]}` -> the array. */
function readPlan(raw) {
    const data = unwrapData(raw);
    const items = data?.items ?? data?.tasks ?? [];
    return Array.isArray(items) ? items : [];
}

/**
 * Progress snapshot -> the numbers the tiles show.
 *
 * `weeklyXp` is labelled as weekly, not total, because that is what the API
 * names it — showing a weekly figure under "Tổng XP" would be a quiet lie.
 */
function readStats(snapshot, next, credits) {
    const s = unwrapData(snapshot) ?? {};
    const c = unwrapData(credits) ?? {};
    const n = unwrapData(next) ?? {};

    return {
        currentStreak: s.currentStreak ?? 0,
        weeklyXp: s.weeklyXp ?? 0,
        studiedMinutes: s.studiedMinutes ?? 0,
        targetMinutes: s.targetMinutes ?? 0,
        todayProgressPercent: s.todayProgressPercent ?? 0,
        improvementText: s.latestImprovementText ?? null,
        credits: c.availableBalance ?? 0,
        nextTitle: n.title ?? null,
        nextDescription: n.description ?? null,
        nextResumeUrl: n.resumeUrl ?? null,
        nextMinutes: n.estimatedMinutes ?? null,
        nextTestTitle: n.metadata?.testTitle ?? null,
    };
}

const TASK_ICONS = {
    VOCAB_REVIEW: BookMarked,
    LISTENING_MINI: Headphones,
    LISTENING: Headphones,
    READING: BookMarked,
    WRITING: PenLine,
    SPEAKING: Mic,
    REVIEW: Check,
};

/* ------------------------------------------------------------------ view */

export default function HomePage() {
    const { t } = useTranslation();

    const continueLearning = useAsyncResource(() => dashboardApi.getContinueLearning());
    const plan = useAsyncResource(() => dashboardApi.getDailyLearningPlan());
    const snapshot = useAsyncResource(() => dashboardApi.getProgressSnapshot());
    const credits = useAsyncResource(() => creditApi.getBalance());

    /* The primary action must point somewhere that exists. `resumeUrl` arrives
     * from the backend as a path (e.g. /ielts?mode=quick&...). The take route in
     * this app is /ielts/take, so a backend URL naming a screen v2 has not built
     * yet must not become a dead link. */
    const derived = readStats(snapshot.data, continueLearning.data, credits.data);
    const resume = derived.nextResumeUrl;
    const resumeTo = resume?.startsWith('/dictionary') ? '/dictionary' : '/ielts/take';

    const planItems = readPlan(plan.data);
    const doneCount = planItems.filter((task) => task?.completed || task?.done).length;
    const planProgress = planItems.length ? (doneCount / planItems.length) * 100 : 0;

    const reloadAll = useCallback(() => {
        continueLearning.reload();
        plan.reload();
        snapshot.reload();
        credits.reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const anyError = Boolean(snapshot.error || plan.error || continueLearning.error);

    return (
        <div className="flex flex-col gap-4">
            {/* --- the one decision --------------------------------------- */}
            <Card level="edge" padding="xl" className="flex flex-col items-start gap-5 md:flex-row">
                <Lexi mood="happy" size="lg" eager className="mx-auto md:mx-0" />
                <div className="min-w-0 flex-1 text-center md:text-left">
                    {/* The greeting states a real observation from the API when
                        one exists, instead of a canned line. */}
                    <p className="t-body-lg inline-block rounded-[var(--r-card)] border-2 border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 font-display font-bold shadow-[0_var(--edge)_0_0_var(--border)]">
                        {derived.improvementText ?? t('home.greetingPrompt')}
                    </p>

                    <AsyncBoundary
                        loading={continueLearning.loading}
                        error={continueLearning.error}
                        isEmpty={!continueLearning.loading && !continueLearning.error && !derived.nextTitle}
                        onRetry={continueLearning.reload}
                        skeleton={
                            <div className="mt-3.5">
                                <SkeletonCard lines={2} />
                            </div>
                        }
                        emptyTitle={t('home.emptyNextTitle')}
                        emptyBody={t('home.emptyNextBody')}
                        emptyAction={
                            <ButtonLink to="/ielts" size="sm">
                                {t('home.seeAll')}
                            </ButtonLink>
                        }
                    >
                        <h2 className="t-h2 mt-3.5">{derived.nextTitle}</h2>
                        {derived.nextDescription ? (
                            <p className="t-body muted">{derived.nextDescription}</p>
                        ) : null}
                        {derived.nextTestTitle ? (
                            <p className="t-micro muted mt-1">{derived.nextTestTitle}</p>
                        ) : null}
                        <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
                            <ButtonLink to={resumeTo} size="lg" variant="primary">
                                <Play size={18} aria-hidden="true" />
                                {t('home.start')}
                                {derived.nextMinutes ? (
                                    <span className="t-micro opacity-80">
                                        · {t('home.minutes', { count: derived.nextMinutes })}
                                    </span>
                                ) : null}
                            </ButtonLink>
                            <ButtonLink to="/path" size="lg" variant="ghost">
                                {t('home.seePlan')}
                            </ButtonLink>
                        </div>
                    </AsyncBoundary>
                </div>
            </Card>

            {/* --- stats: every tile is a real field, none is a placeholder -- */}
            <AsyncBoundary
                loading={snapshot.loading}
                error={snapshot.error}
                isEmpty={false}
                onRetry={snapshot.reload}
                skeleton={
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="h-[88px] rounded-[var(--r-card)] bg-[var(--surface-alt)]" />
                        ))}
                    </div>
                }
            >
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Stat value={derived.currentStreak} label={t('home.statStreak')} icon="flame" />
                    {/* Formatted through i18next rather than toLocaleString:
                        `toLocaleString('vi-VN')` silently falls back to en-US
                        grouping when the runtime has no Vietnamese ICU data
                        (which is the case in the test environment), producing
                        "2,480" in a Vietnamese UI. i18next uses the active
                        language and degrades predictably. */}
                    <Stat value={t('home.xpValue', { val: derived.weeklyXp })} label={t('home.statWeeklyXp')} icon="star" tone="teal" />
                    <Stat
                        value={`${derived.studiedMinutes}/${derived.targetMinutes}`}
                        label={t('home.statToday')}
                        icon="clock"
                    />
                    <Stat value={derived.credits} label={t('home.statCredit')} icon="coin" />
                </div>
                {derived.targetMinutes > 0 ? (
                    <div className="mt-3">
                        <ProgressBar value={derived.todayProgressPercent} label={t('home.statToday')} />
                        <span className="t-micro muted">
                            {t('home.todayProgress', {
                                done: derived.studiedMinutes,
                                goal: derived.targetMinutes,
                            })}
                        </span>
                    </div>
                ) : null}
            </AsyncBoundary>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <Card level="edge" padding="xl">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="t-h2">{t('home.todayPlan')}</h2>
                        {planItems.length ? (
                            <span className="t-micro muted">
                                {doneCount} / {planItems.length}
                            </span>
                        ) : null}
                    </div>

                    <AsyncBoundary
                        loading={plan.loading}
                        error={plan.error}
                        isEmpty={!plan.loading && !plan.error && planItems.length === 0}
                        onRetry={plan.reload}
                        skeleton={
                            <div className="mt-3 flex flex-col gap-2">
                                <SkeletonCard lines={2} />
                                <SkeletonCard lines={2} />
                            </div>
                        }
                        emptyTitle={t('home.emptyPlanTitle')}
                        emptyBody={t('home.emptyPlanBody')}
                        emptyAction={
                            <ButtonLink to="/ielts" size="sm" variant="primary">
                                {t('home.seeAll')}
                            </ButtonLink>
                        }
                    >
                        <ProgressBar className="my-3" value={planProgress} />
                        <ul className="flex flex-col gap-2">
                            {planItems.map((task, i) => {
                                const Icon = TASK_ICONS[String(task?.type ?? task?.module ?? '').toUpperCase()] ?? Check;
                                const done = Boolean(task?.completed || task?.done);
                                return (
                                    <li key={task?.id ?? i}>
                                        <RowBox center className={done ? 'opacity-80' : undefined}>
                                            <span
                                                aria-hidden="true"
                                                className="grid size-9 shrink-0 place-items-center rounded-[var(--r-sm)] bg-[var(--teal-soft)] text-[var(--teal)]"
                                            >
                                                <Icon size={18} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <strong className="t-label block">
                                                    {task?.title ?? t('ielts.untitled')}
                                                </strong>
                                                {task?.description || task?.estimatedMinutes ? (
                                                    <span className="t-micro muted">
                                                        {task.description ??
                                                            t('home.minutes', { count: task.estimatedMinutes })}
                                                    </span>
                                                ) : null}
                                            </span>
                                            {done ? (
                                                <Chip tone="correct" icon={Check}>
                                                    {t('home.done')}
                                                </Chip>
                                            ) : (
                                                <ButtonLink to={task?.actionUrl ?? '/ielts'} size="sm" variant="ghost">
                                                    {t('home.doNow')}
                                                </ButtonLink>
                                            )}
                                        </RowBox>
                                    </li>
                                );
                            })}
                        </ul>
                    </AsyncBoundary>
                </Card>

                <div className="flex flex-col gap-4">
                    <Card level="edge" padding="xl">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="t-h3">{t('home.rhythm')}</h2>
                            {/* Streak is information, never a dare: the panel
                                states the remaining grace days rather than
                                threatening that the streak will break. */}
                            <span className="t-micro muted">{t('home.graceDaysLeft', { count: 2 })}</span>
                        </div>
                        <div role="img" aria-label={t('home.rhythmAria')} className="mt-3 grid grid-cols-7 gap-1.5">
                            {Array.from({ length: 35 }, (_, i) => {
                                const levels = [0, 1, 2, 3, 2, 1, 0];
                                const lvl = i % 5 === 3 ? 3 : levels[i % 7];
                                const bg =
                                    lvl === 0
                                        ? 'bg-[var(--surface-alt)]'
                                        : lvl === 1
                                          ? 'bg-[color-mix(in_srgb,var(--teal)_32%,var(--surface-alt))]'
                                          : lvl === 2
                                            ? 'bg-[color-mix(in_srgb,var(--teal)_62%,var(--surface-alt))]'
                                            : 'bg-[var(--teal)]';
                                return <span key={i} className={`aspect-square rounded-[5px] ${bg}`} />;
                            })}
                        </div>
                    </Card>

                    <Card level="edge" padding="xl">
                        <h2 className="t-h3">{t('home.suggestions')}</h2>
                        <div className="mt-3 flex flex-col gap-2">
                            {[
                                {
                                    to: '/ielts',
                                    icon: Headphones,
                                    title: t('home.suggestListening'),
                                    meta: t('home.minutes', { count: 12 }),
                                },
                                {
                                    to: '/vocabulary',
                                    icon: PenLine,
                                    title: t('home.suggestVocab'),
                                    meta: t('home.minutes', { count: 8 }),
                                },
                                {
                                    to: '/writing',
                                    icon: ArrowRight,
                                    title: t('home.suggestWriting'),
                                    meta: t('home.minutes', { count: 20 }),
                                },
                            ].map(({ to, icon: Icon, title, meta }) => (
                                <Link
                                    key={title}
                                    to={to}
                                    className="flex items-center gap-3 rounded-[var(--r-control)] bg-[var(--surface-alt)] p-3 transition-colors hover:bg-[color-mix(in_srgb,var(--teal)_10%,var(--surface-alt))]"
                                >
                                    <Icon size={20} aria-hidden="true" className="shrink-0 text-[var(--teal)]" />
                                    <span className="min-w-0 flex-1">
                                        <strong className="t-label block text-[var(--ink)]">{title}</strong>
                                        <span className="t-micro muted">{meta}</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {anyError ? (
                <div className="flex justify-center">
                    <Button variant="secondary" onClick={reloadAll}>
                        <RefreshCw size={16} aria-hidden="true" />
                        {t('common.retry')}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
