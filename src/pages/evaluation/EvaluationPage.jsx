import { useTranslation } from 'react-i18next';
import { Headphones, BookOpen, PenLine, Mic, TrendingUp, TrendingDown, Minus, Info, Target, Sparkles } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { useEvaluation } from '../../features/evaluation/useEvaluation';

/**
 * Ability evaluation — `/evaluation` (screen 14).
 *
 * THE HONESTY REQUIREMENT HERE IS STRUCTURAL, NOT COPY. `PRODUCT.md` forbids
 * band-improvement claims, and that shapes three concrete decisions:
 *
 *  1. **A zero band is shown as "not measured", never as 0.0.** Verified: a new account's
 *     `bandProgress` is `{ current: 0, previous: 0 }` for EVERY skill. Rendering that as
 *     a score would state a measurement the platform does not have.
 *  2. **A delta is only shown when BOTH sides exist.** `previous: 0` means there is no
 *     earlier measurement to compare against, so the tile shows nothing rather than
 *     "+2.0" — which would be a fabricated improvement.
 *  3. **The band is labelled an estimate, with the ±0.5 note.** That is not decoration:
 *     it is the difference between a practice aid and an official result, and the design
 *     asks for it explicitly.
 *
 * There is NO evaluation endpoint (verified). The data comes from `GET /user/profile`,
 * and the weakness column from `weakSkills`, which the backend populates for a new
 * account too — so it is real content rather than an empty placeholder.
 */
const SKILL_META = {
    listening: { icon: Headphones, tone: 'teal' },
    reading: { icon: BookOpen, tone: 'amber' },
    writing: { icon: PenLine, tone: 'neutral' },
    speaking: { icon: Mic, tone: 'neutral' },
};

export default function EvaluationPage() {
    const { t } = useTranslation();
    const {
        overall,
        overallMeasured,
        skills,
        measuredCount,
        weakSkills,
        recommendedPractice,
        vocabProgress,
        loading,
        error,
        reload,
    } = useEvaluation();

    return (
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
            <p className="t-micro muted">{t('evaluation.subtitle')}</p>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={false}
                onRetry={reload}
                skeleton={
                    <div className="flex flex-col gap-4">
                        <SkeletonCard lines={3} />
                        <SkeletonCard lines={4} />
                    </div>
                }
            >
                <div className="flex flex-col gap-4">
                    {/* --- the estimate, labelled ---------------------------- */}
                    <Card level="hero" padding="xl" className="flex flex-col gap-5 md:flex-row md:items-center">
                        <Lexi mood={measuredCount > 0 ? 'approve' : 'explain'} size="lg" />
                        <div className="min-w-0 flex-1">
                            <span className="t-micro muted">{t('evaluation.estimatedBandLabel')}</span>
                            <div className="flex flex-wrap items-baseline gap-3">
                                {overallMeasured ? (
                                    <span className="font-mono text-5xl font-bold tabular-nums text-[var(--teal)]">
                                        {Number(overall.current).toFixed(1)}
                                    </span>
                                ) : (
                                    /* Not a score. A dash plus the reason. `ink-muted`, not
                                       `ink-faint`: this dash is TEXT, and ink-faint on surface
                                       measures 2.47:1 — under the 4.5:1 text needs. The contrast
                                       gate lists ink-faint as decoration-only (icons, aria-hidden
                                       graphics), which is exactly what it is not here. */
                                    <span className="font-mono text-5xl font-bold text-[var(--ink-muted)]">—</span>
                                )}
                                {measuredCount > 0 ? (
                                    <Chip tone="neutral">
                                        {t('evaluation.measuredSkills', { count: measuredCount })}
                                    </Chip>
                                ) : null}
                            </div>
                            {/* The two honesty sentences, together, where the number is. */}
                            <p className="t-body soft mt-2">{t('evaluation.estimateNote')}</p>
                            <p className="t-micro muted mt-1">{t('evaluation.toleranceNote')}</p>
                        </div>
                    </Card>

                    {measuredCount === 0 ? (
                        <Card level="flat" padding="lg">
                            <div className="flex items-start gap-3">
                                <Info size={16} className="mt-0.5 shrink-0 text-[var(--amber)]" aria-hidden="true" />
                                <p className="t-micro soft">{t('evaluation.noDataNote')}</p>
                            </div>
                        </Card>
                    ) : null}

                    {/* --- the 4-tile skill grid ----------------------------- */}
                    <section className="flex flex-col gap-3">
                        <h2 className="t-h3">{t('evaluation.skillsTitle')}</h2>
                        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {skills.map(({ skill, measured, current, delta }) => {
                                const { icon: Icon, tone } = SKILL_META[skill];
                                const DirectionIcon = delta == null ? Minus : delta > 0 ? TrendingUp : TrendingDown;
                                return (
                                    <li key={skill}>
                                        <Card level="edge" padding="xl" className="flex h-full flex-col gap-2">
                                            <span
                                                aria-hidden="true"
                                                className={
                                                    tone === 'teal'
                                                        ? 'text-[var(--teal)]'
                                                        : tone === 'amber'
                                                          ? 'text-[var(--amber)]'
                                                          : 'text-[var(--ink-muted)]'
                                                }
                                            >
                                                <Icon size={20} />
                                            </span>
                                            <span className="t-label">{t(`ielts.skill.${skill}`)}</span>
                                            <span className="flex items-baseline gap-2">
                                                {measured ? (
                                                    <span className="font-mono text-2xl font-bold tabular-nums text-[var(--ink)]">
                                                        {current.toFixed(1)}
                                                    </span>
                                                ) : (
                                                    <span className="font-mono text-2xl font-bold text-[var(--ink-muted)]">
                                                        —
                                                    </span>
                                                )}
                                                {/* A delta needs BOTH measurements; otherwise nothing. */}
                                                {delta != null ? (
                                                    <Chip tone={delta > 0 ? 'correct' : delta < 0 ? 'amber' : 'neutral'} icon={DirectionIcon}>
                                                        {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                                                    </Chip>
                                                ) : null}
                                            </span>
                                            <span className="t-micro muted">
                                                {measured ? t('evaluation.measured') : t('evaluation.notMeasured')}
                                            </span>
                                        </Card>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    {/* --- strengths / weaknesses by skill area -------------- */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card level="edge" padding="xl" className="flex flex-col gap-3">
                            <h2 className="t-h3 flex items-center gap-2">
                                <Target size={18} aria-hidden="true" />
                                {t('evaluation.weakTitle')}
                            </h2>
                            <p className="t-micro muted">{t('evaluation.weakNote')}</p>

                            {weakSkills.length > 0 ? (
                                <ul className="mt-1 flex flex-col gap-2">
                                    {weakSkills.map((skill) => (
                                        <li key={skill}>
                                            <RowBox center>
                                                <span aria-hidden="true" className="text-[var(--amber)]">
                                                    <Target size={16} />
                                                </span>
                                                <span className="t-body min-w-0 flex-1">{skill}</span>
                                            </RowBox>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="t-body soft">{t('evaluation.noWeakSkills')}</p>
                            )}

                            {/* The bridge from diagnosis to the path, per the design. */}
                            <ButtonLink to="/home" size="sm" variant="primary" className="mt-auto self-start">
                                {t('evaluation.addToPath')}
                            </ButtonLink>
                        </Card>

                        <Card level="edge" padding="xl" className="flex flex-col gap-3">
                            <h2 className="t-h3 flex items-center gap-2">
                                <Sparkles size={18} aria-hidden="true" />
                                {t('evaluation.practiceTitle')}
                            </h2>

                            {recommendedPractice.length > 0 ? (
                                <ul className="flex flex-col gap-2">
                                    {recommendedPractice.slice(0, 3).map((item) => (
                                        <li key={item.id ?? item.title}>
                                            <RowBox className="flex-col items-stretch gap-1 py-3">
                                                <strong className="t-label text-[var(--ink)]">{item.title}</strong>
                                                {item.description ? (
                                                    <span className="t-body soft">{item.description}</span>
                                                ) : null}
                                                {/* The REASON is shown, because a recommendation
                                                    without its reason is just an instruction. */}
                                                {item.reason ? (
                                                    <span className="t-micro muted">{item.reason}</span>
                                                ) : null}
                                                <span className="mt-1 flex flex-wrap items-center gap-2">
                                                    {item.type ? <Chip tone="neutral">{item.type}</Chip> : null}
                                                    {item.estimatedTime ? (
                                                        <span className="t-micro muted">{item.estimatedTime}</span>
                                                    ) : null}
                                                    {item.path ? (
                                                        <ButtonLink to={item.path} size="sm" variant="ghost">
                                                            {t('evaluation.startPractice')}
                                                        </ButtonLink>
                                                    ) : null}
                                                </span>
                                            </RowBox>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="t-body soft">{t('evaluation.noPractice')}</p>
                            )}
                        </Card>
                    </div>

                    {/* --- vocabulary progress ------------------------------- */}
                    {vocabProgress ? (
                        <div className="grid grid-cols-3 gap-3">
                            <Stat value={vocabProgress.totalWords ?? 0} label={t('evaluation.wordsTotal')} tone="teal" />
                            <Stat value={vocabProgress.reviewingWords ?? 0} label={t('evaluation.wordsReviewing')} />
                            <Stat value={vocabProgress.masteredWords ?? 0} label={t('evaluation.wordsMastered')} tone="amber" />
                        </div>
                    ) : null}
                </div>
            </AsyncBoundary>

            <div className="flex flex-wrap justify-center gap-3">
                <ButtonLink to="/review" size="sm" variant="secondary">
                    {t('review.title')}
                </ButtonLink>
                <ButtonLink to="/weekly-report" size="sm" variant="ghost">
                    {t('nav.progress')}
                </ButtonLink>
            </div>
        </div>
    );
}
