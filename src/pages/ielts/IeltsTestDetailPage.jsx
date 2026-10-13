import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Headphones, BookOpen, Coins, Lock } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { useCredit } from '../../contexts/CreditContextCore';
import { CREDIT_ACTIONS } from '../../features/credits/creditConstants';
import { getCreditCostDisplay } from '../../features/credits/creditPolicy';
import { useIeltsTestDetail, SKILL_LABEL_KEYS, DIFFICULTY_LABEL_KEYS, SKILL_TONE, DIFFICULTY_TONE } from '../../features/ielts/useIeltsDetail';

/**
 * IELTS test detail — `/ielts/test/:testId` (screen 17).
 *
 * TWO TRUST DETAILS ARE THE POINT OF THIS SCREEN, and the design names both:
 *
 *  1. **The credit cost is visible WITH the user's balance before starting.** `PRODUCT.md`
 *     commits to being truthful on the free/paid boundary, and the decision happens here,
 *     not on the result screen. Showing the price without the balance would leave the
 *     reader to work out whether they can afford it.
 *  2. **The Listening transcript policy is stated UP FRONT.** In v1 that rule exists in
 *     the code — the transcript is only returned after submission, to keep the exam
 *     condition — but a user only discovered it after finishing. Here the notice appears
 *     before they start, so nobody is surprised by missing material mid-test.
 *
 * The section breakdown is built from the paper the detail endpoint returns, so the
 * question counts are the real ones rather than a separate number that could disagree
 * with the paper.
 */
export default function IeltsTestDetailPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { testId } = useParams();

    const { test, questionCount, hasTranscript, loading, error, reload } = useIeltsTestDetail(testId);
    const credit = useCredit();

    const costEntry = credit.getCost(CREDIT_ACTIONS.IELTS_START);
    const cost = getCreditCostDisplay(costEntry);
    const balance = credit.availableBalance;
    const balanceKnown = balance !== null && balance !== undefined;
    const affordable = !cost || !balanceKnown || balance >= Number(costEntry?.cost ?? 0);

    const isListening = test?.skill === 'LISTENING';
    const SkillIcon = isListening ? Headphones : BookOpen;
    /* The enum as the backend spells it, so the lookups below can never miss on case. */
    const difficulty = String(test?.difficulty ?? '').toUpperCase();

    return (
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
            <Link to="/ielts" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('ielts.title')}
            </Link>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && !test}
                onRetry={reload}
                skeleton={
                    <div className="flex flex-col gap-4">
                        <SkeletonCard lines={3} />
                        <SkeletonCard lines={4} />
                    </div>
                }
                emptyTitle={t('ielts.detailMissingTitle')}
                emptyBody={t('ielts.detailMissingBody')}
                emptyAction={
                    <ButtonLink to="/ielts" variant="primary" size="sm">
                        {t('ielts.title')}
                    </ButtonLink>
                }
            >
                <div className="flex flex-col gap-4">
                    {/* --- hero ------------------------------------------------- */}
                    <Card level="hero" padding="xl" className="flex flex-col gap-5 md:flex-row md:items-center">
                        <Lexi mood="explain" size="lg" />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Both tags read their tone from the same place the list
                                    screen does, and the difficulty label is a LOOKUP: the
                                    enum is `MEDIUM` while the key is `ielts.difficulty.medium`,
                                    so an interpolated key printed the raw key on screen. An
                                    unrecognised code renders no chip rather than a wrong one. */}
                                <Chip tone={SKILL_TONE[test?.skill] ?? 'neutral'} icon={SkillIcon}>
                                    {t(SKILL_LABEL_KEYS[test?.skill] ?? 'ielts.skill.all')}
                                </Chip>
                                {DIFFICULTY_TONE[difficulty] ? (
                                    <Chip tone={DIFFICULTY_TONE[difficulty]}>
                                        {t(DIFFICULTY_LABEL_KEYS[difficulty])}
                                    </Chip>
                                ) : null}
                            </div>
                            <h1 className="t-h2 mt-2">{test?.title}</h1>
                        </div>
                    </Card>

                    {/* --- the numbers, before committing ------------------------
                        Three stats, not four. The fourth used to print the skill as a raw enum
                        ("READING"); mapping it to the label only made the SAME word appear
                        twice on one screen, because the skill is already the chip above the
                        title. Redundant is the smaller version of wrong. */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                        <Stat value={questionCount ?? '—'} label={t('ielts.questionCountStat')} tone="teal" />
                        <Stat value={test?.timeLimitMinutes ?? '—'} label={t('ielts.minutesStat')} icon="clock" />
                        <Stat value={test?.sections?.length ?? '—'} label={t('ielts.sectionCountStat')} />
                    </div>

                    {/* --- per-section breakdown -------------------------------- */}
                    <Card level="edge" padding="xl">
                        <h2 className="t-h3">{t('ielts.sectionsTitle')}</h2>
                        <ul className="mt-3 flex flex-col gap-2">
                            {(test?.sections ?? []).map((section) => {
                                const counts = (section.passages ?? []).reduce(
                                    (sum, passage) => sum + (passage.questions?.length ?? 0),
                                    0
                                );
                                return (
                                    <li key={section.id ?? section.sectionOrder}>
                                        <RowBox center>
                                            <span
                                                aria-hidden="true"
                                                className="t-mono grid size-9 shrink-0 place-items-center rounded-[var(--r-sm)] bg-[var(--surface-alt)] text-sm text-[var(--ink-muted)]"
                                            >
                                                {section.sectionOrder}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <strong className="t-label block text-[var(--ink)]">
                                                    {section.title ?? t('ielts.sectionN', { number: section.sectionOrder })}
                                                </strong>
                                                <span className="t-micro muted flex flex-wrap items-center gap-2">
                                                    <span>{t('vocabTest.questionCount', { count: counts })}</span>
                                                </span>
                                            </span>
                                        </RowBox>
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>

                    {/* --- the transcript policy, stated BEFORE starting --------- */}
                    {hasTranscript ? (
                        <Card level="flat" padding="lg">
                            <div className="flex items-start gap-3">
                                <Lock size={16} className="mt-0.5 shrink-0 text-[var(--ink-muted)]" aria-hidden="true" />
                                <p className="t-micro soft">{t('ielts.transcriptPolicy')}</p>
                            </div>
                        </Card>
                    ) : null}

                    {/* --- the cost, with the balance, before the CTA ----------- */}
                    <Card level="edge" padding="xl" className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="t-label flex items-center gap-1.5">
                                <Coins size={16} aria-hidden="true" className="text-[var(--amber)]" />
                                {cost ? t('ielts.costToStart', { amount: cost.amountLabel }) : t('ielts.freeToStart')}
                            </span>
                            {balanceKnown ? (
                                <Chip tone={affordable ? 'teal' : 'wrong'}>
                                    {t('aiChat.balance', { count: balance })}
                                </Chip>
                            ) : null}
                            <span className="flex-1" />
                            <ButtonLink to="/credits" size="sm" variant="ghost">
                                {t('nav.credits')}
                            </ButtonLink>
                        </div>

                        {!affordable ? (
                            <p role="alert" className="t-micro text-[var(--wrong)]">
                                {t('ielts.insufficientToStart', {
                                    need: Number(costEntry?.cost ?? 0),
                                    have: balanceKnown ? balance : '—',
                                })}
                            </p>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                disabled={!affordable}
                                onClick={() =>
                                    navigate(
                                        `/ielts/take?testId=${encodeURIComponent(testId)}&attemptMode=FULL&scopeType=TEST`
                                    )
                                }
                            >
                                <FileText size={18} aria-hidden="true" />
                                {t('ielts.startFullTest')}
                            </Button>
                        </div>
                    </Card>

                    <div className="flex flex-wrap gap-2">
                        <ButtonLink to="/ielts/history" variant="ghost" size="sm">
                            {t('ielts.history')}
                        </ButtonLink>
                        <Button variant="ghost" size="sm" onClick={reload}>
                            {t('common.retry')}
                        </Button>
                    </div>
                </div>
            </AsyncBoundary>
        </div>
    );
}
