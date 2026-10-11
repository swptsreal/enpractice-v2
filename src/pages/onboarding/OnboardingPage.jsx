import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Button } from '../../components/ui/Button';
import { ProgressBar, Skeleton } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { cn } from '../../lib/cn';
import { useProfile } from '../../features/profile/useProfile';
import { skillLabelKey } from '../../features/ielts/useIeltsDetail';
import { useSubmitOnboarding } from '../../features/onboarding/useOnboarding';
import {
    BAND_OPTIONS,
    MINUTE_OPTIONS,
    ONBOARDING_STATUS,
    ONBOARDING_STEPS,
    SKILL_OPTIONS,
    bandTitle,
    buildOnboardingPayload,
    progressFor,
    readOnboardingAnswers,
} from '../../features/onboarding/onboardingModel';

/**
 * Onboarding — `/onboarding` (screen 03).
 *
 * FOUR STEPS, ONE DECISION PER SCREEN, and Lexi asks each question in her own voice
 * above it. The band goal is first because it is the one answer that changes what the
 * generated practice looks like; the rest make the daily plan fit the person.
 *
 * IT DOES NOT BLOCK. Every step can be skipped, the flow can be left from the header on
 * any step but the last, and the last step offers "Để sau" next to the primary button.
 * Nothing in the product is gated behind finishing this: `/home` works with no goal at
 * all (it asks for one), which is the honest version — a first-run user must be able to
 * look around before being asked four questions.
 *
 * THE ANSWERS ARE AN OVERLAY, NOT A COPY. `answers` holds only what the user TOUCHED;
 * everything else is read from the account. Copying the profile into state would need an
 * effect to sync it, and that effect is where "I edited this field and my change was
 * overwritten by a refetch" bugs live. Submitting without touching a step therefore
 * sends nothing for it, and the backend keeps the existing value.
 *
 * WHY THE VERSION COMES FROM THE SERVER: `onboarding.requiredVersion` is what the backend
 * currently expects. Hardcoding 1 here would mean a version bump in the backend breaks
 * every installed client silently — the submit would be rejected only if the backend
 * chose to reject it. The primary button stays disabled until the profile has loaded, so
 * a request is never sent with a guessed version.
 *
 * WHAT IS DELIBERATELY NOT HERE: no credits, no XP, no progress bar for the user's
 * level. This is a setup form; dressing it as a reward would promise something that has
 * not happened yet.
 */

/** Headings reused for the step announcement, so the two cannot drift apart. */
const STEP_TITLE_KEYS = {
    goal: 'onboarding.goal.title',
    skill: 'onboarding.skill.title',
    time: 'onboarding.time.title',
    confirm: 'onboarding.confirm.title',
};

const OPTION_ROW =
    'flex min-h-[76px] w-full items-center gap-3.5 rounded-[var(--r-card)] border-2 ' +
    'border-[var(--border-strong)] bg-[var(--surface)] p-3.5 text-left ' +
    'shadow-[0_var(--edge)_0_0_var(--border-strong)] ' +
    'transition-[transform,box-shadow,background-color,border-color] duration-[90ms] ease-[var(--ease-out)] ' +
    'active:translate-y-[var(--edge)] active:shadow-none motion-reduce:active:translate-y-0 ' +
    'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]';

const OPTION_ROW_PRESSED =
    'border-[var(--teal)] bg-[var(--teal-soft)] shadow-[0_var(--edge)_0_0_var(--teal-strong)]';

export default function OnboardingPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { profile, loading, error, reload } = useProfile();
    const { submit, saving, error: saveError } = useSubmitOnboarding();

    const [stepIndex, setStepIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const headingRef = useRef(null);

    const step = ONBOARDING_STEPS[stepIndex];
    const current = readOnboardingAnswers(profile);
    const chosen = {
        band: answers.band !== undefined ? answers.band : current.band,
        skill: answers.skill !== undefined ? answers.skill : current.skill,
        minutes: answers.minutes !== undefined ? answers.minutes : current.minutes,
    };

    const requiredVersion = profile?.onboarding?.requiredVersion ?? null;

    /* A multi-step flow that only swaps the middle of the page leaves a screen-reader
       user where they were — on a button that no longer exists. Moving focus to the new
       heading is what makes the step change perceivable. */
    useEffect(() => {
        headingRef.current?.focus();
    }, [stepIndex]);

    function setAnswer(field, value) {
        setAnswers((previous) => ({ ...previous, [field]: value }));
    }

    function goNext() {
        setStepIndex((index) => Math.min(index + 1, ONBOARDING_STEPS.length - 1));
    }

    function goBack() {
        setStepIndex((index) => Math.max(index - 1, 0));
    }

    async function finish(status) {
        if (requiredVersion == null) return;
        try {
            /* ONLY WHAT THE USER TOUCHED IS SENT — `answers`, not the prefilled `chosen`.
               Two reasons: writing back a value the user never chose is a lie in the request
               log, and re-sending a stale prefill would revert a change made on another
               device while this wizard was open. The untouched questions are simply absent,
               and the backend keeps whatever it has. */
            await submit(buildOnboardingPayload({ status, ...answers }, requiredVersion));
            navigate('/home', { replace: true });
        } catch {
            /* `saveError` renders below; staying on the screen keeps the answers. */
        }
    }

    const minutesTitleKey = MINUTE_OPTIONS.find((option) => option.value === chosen.minutes)?.titleKey;
    const summaryRows = [
        {
            step: 0,
            labelKey: 'onboarding.confirm.bandLabel',
            value: chosen.band == null ? null : chosen.band.toFixed(1),
        },
        {
            step: 1,
            labelKey: 'onboarding.confirm.skillLabel',
            value: chosen.skill ? t(skillLabelKey(chosen.skill)) : null,
        },
        {
            step: 2,
            labelKey: 'onboarding.confirm.timeLabel',
            value: minutesTitleKey ? t(minutesTitleKey) : null,
        },
    ];

    return (
        <div className="flex min-h-dvh flex-col bg-[var(--canvas)]">
            <header className="border-b-2 border-[var(--border)] bg-[var(--surface)] px-5 py-3.5">
                <div className="mx-auto flex w-full max-w-[760px] items-center gap-3">
                    <span className="t-micro muted">
                        {t('onboarding.stepCount', { current: stepIndex + 1, total: ONBOARDING_STEPS.length })}
                    </span>
                    <div className="min-w-0 flex-1">
                        <ProgressBar
                            value={progressFor(step)}
                            thin
                            label={t('onboarding.stepCount', {
                                current: stepIndex + 1,
                                total: ONBOARDING_STEPS.length,
                            })}
                        />
                    </div>
                    {step === 'confirm' ? (
                        <span className="w-12" aria-hidden="true" />
                    ) : (
                        <button
                            type="button"
                            onClick={goNext}
                            className="t-micro muted min-h-11 px-1 font-bold underline underline-offset-4"
                        >
                            {t('onboarding.skip')}
                        </button>
                    )}
                </div>
            </header>

            <main id="main" className="flex flex-1 flex-col items-center px-5 py-8">
                <AsyncBoundary
                    loading={loading}
                    error={error}
                    onRetry={reload}
                    skeleton={
                        <div className="flex w-full max-w-[560px] flex-col items-center gap-4">
                            <Skeleton className="size-[200px] rounded-full" />
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    }
                >
                    <div className="flex w-full flex-col items-center">
                        {step === 'goal' ? (
                            <>
                                <LexiSays mood="happy">{t('onboarding.lexi.goal')}</LexiSays>
                                <StepHeading ref={headingRef} title={t(STEP_TITLE_KEYS.goal)} />
                                <p className="t-body muted mt-2 max-w-[48ch] text-center">
                                    {t('onboarding.goal.body')}
                                </p>
                                <div className="mt-7 flex w-full max-w-[560px] flex-col gap-3">
                                    {BAND_OPTIONS.map((option) => (
                                        <OptionRow
                                            key={option.band ?? 'unknown'}
                                            pressed={chosen.band === option.band}
                                            title={option.titleKey ? t(option.titleKey) : bandTitle(option)}
                                            why={t(option.whyKey)}
                                            onSelect={() => setAnswer('band', option.band)}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : null}

                        {step === 'skill' ? (
                            <>
                                <LexiSays mood="thinking">{t('onboarding.lexi.skill')}</LexiSays>
                                <StepHeading ref={headingRef} title={t(STEP_TITLE_KEYS.skill)} />
                                <p className="t-body muted mt-2 max-w-[48ch] text-center">
                                    {t('onboarding.skill.body')}
                                </p>
                                <div className="mt-7 flex w-full max-w-[560px] flex-col gap-3">
                                    {SKILL_OPTIONS.map((option) => (
                                        <OptionRow
                                            key={option.value ?? 'unknown'}
                                            pressed={chosen.skill === option.value}
                                            title={
                                                option.titleKey
                                                    ? t(option.titleKey)
                                                    : t(skillLabelKey(option.value))
                                            }
                                            why={t(option.whyKey)}
                                            onSelect={() => setAnswer('skill', option.value)}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : null}

                        {step === 'time' ? (
                            <>
                                <LexiSays mood="coffee">{t('onboarding.lexi.time')}</LexiSays>
                                <StepHeading ref={headingRef} title={t(STEP_TITLE_KEYS.time)} />
                                <p className="t-body muted mt-2 max-w-[48ch] text-center">
                                    {t('onboarding.time.body')}
                                </p>
                                <div className="mt-7 flex w-full max-w-[560px] flex-col gap-3">
                                    {MINUTE_OPTIONS.map((option) => (
                                        <OptionRow
                                            key={option.value}
                                            pressed={chosen.minutes === option.value}
                                            title={t(option.titleKey)}
                                            why={t(option.whyKey)}
                                            onSelect={() => setAnswer('minutes', option.value)}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : null}

                        {step === 'confirm' ? (
                            <>
                                <LexiSays mood="celebrate">{t('onboarding.lexi.confirm')}</LexiSays>
                                <StepHeading ref={headingRef} title={t(STEP_TITLE_KEYS.confirm)} />
                                <p className="t-body muted mt-2 max-w-[48ch] text-center">
                                    {t('onboarding.confirm.body')}
                                </p>
                                <dl className="mt-7 flex w-full max-w-[560px] flex-col gap-3">
                                    {summaryRows.map((row) => (
                                        <div
                                            key={row.labelKey}
                                            className="flex items-center gap-3 rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)] p-3.5"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <dt className="t-micro muted">{t(row.labelKey)}</dt>
                                                <dd className="t-h3">
                                                    {row.value ?? t('onboarding.unset')}
                                                </dd>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setStepIndex(row.step)}
                                            >
                                                {t('onboarding.confirm.edit')}
                                            </Button>
                                        </div>
                                    ))}
                                </dl>
                                <p className="t-micro muted mt-4 max-w-[48ch] text-center">
                                    {t('onboarding.confirm.note')}{' '}
                                    <Link
                                        to="/settings"
                                        className="font-bold text-[var(--teal)] underline underline-offset-4"
                                    >
                                        {t('onboarding.confirm.settingsLink')}
                                    </Link>
                                </p>
                            </>
                        ) : null}
                    </div>
                </AsyncBoundary>
            </main>

            <footer className="border-t-2 border-[var(--border)] bg-[var(--surface)] px-5 py-4">
                <div className="mx-auto flex w-full max-w-[760px] flex-wrap items-center gap-3">
                    <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
                        <ArrowLeft size={16} aria-hidden="true" />
                        {t('onboarding.back')}
                    </Button>

                    <div className="grow" />

                    {step === 'confirm' ? (
                        <Button
                            variant="secondary"
                            onClick={() => finish(ONBOARDING_STATUS.SKIPPED)}
                            disabled={saving || requiredVersion == null}
                        >
                            {t('onboarding.later')}
                        </Button>
                    ) : null}

                    <Button
                        size="lg"
                        onClick={() => (step === 'confirm' ? finish(ONBOARDING_STATUS.COMPLETED) : goNext())}
                        disabled={saving || loading || error != null || requiredVersion == null}
                    >
                        {step === 'confirm' ? t('onboarding.start') : t('onboarding.next')}
                        <ArrowRight size={18} aria-hidden="true" />
                    </Button>
                </div>

                {saveError ? (
                    <p role="alert" className="t-micro mx-auto mt-3 w-full max-w-[760px] text-[var(--wrong)]">
                        {t('onboarding.saveError')}
                    </p>
                ) : null}
                {/* A disabled button with no reason is exactly the dead control this product
                    refuses to ship. The one way to get here with a loaded profile and no
                    version is a backend older than this screen — the migration and the
                    endpoint ship together, so say so instead of leaving the user poking a
                    button that cannot work. */}
                {!loading && !error && requiredVersion == null && !saveError ? (
                    <p role="status" className="t-micro mx-auto mt-3 w-full max-w-[760px] text-[var(--attention)]">
                        {t('onboarding.unsupported')}
                    </p>
                ) : null}
                {saving ? (
                    <p role="status" className="t-micro muted mx-auto mt-3 w-full max-w-[760px]">
                        {t('onboarding.saving')}
                    </p>
                ) : null}
            </footer>

            {/* Announces the step, which is otherwise only visible as a swapped heading. */}
            <div role="status" aria-live="polite" className="sr-only">
                {t(STEP_TITLE_KEYS[step])}
            </div>
        </div>
    );
}

/**
 * Lexi with a speech bubble.
 *
 * Not the chat bubble from `AiChatPage`: that one is a message transcript (it labels
 * every bubble "You" or "Lexi" and carries a failed-send state). This one is narration —
 * no label, no role, a tail pointing at a 200px mascot.
 */
function LexiSays({ mood, children }) {
    return (
        <div className="mb-6 flex items-end justify-center gap-1">
            <Lexi mood={mood} size="xl" eager />
            <div className="relative mb-6 max-w-[280px] rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)] p-3.5 text-sm font-bold text-[var(--ink-soft)]">
                <span
                    aria-hidden="true"
                    className="absolute top-1/2 -left-2 size-3 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-[var(--border)] bg-[var(--surface)]"
                />
                {children}
            </div>
        </div>
    );
}

/**
 * The step's `h1`, focused on every step change.
 *
 * The element is shared and only its text changes: a heading that re-mounts per step
 * would drop the ref the parent's focus effect needs. React 19 passes `ref` as a normal
 * prop to a function component, so no `forwardRef`.
 */
function StepHeading({ title, ref }) {
    return (
        <h1 ref={ref} tabIndex={-1} className="t-display text-center focus:outline-none">
            {title}
        </h1>
    );
}

/**
 * One answer, as a 76px row that presses like every other control in the product.
 *
 * `aria-pressed` on a button, per the approved design — not a radio group behind hidden
 * inputs, so the whole row is the tap target and the pressed state is what assistive tech
 * reports.
 */
function OptionRow({ pressed, title, why, onSelect }) {
    return (
        <button
            type="button"
            aria-pressed={pressed}
            onClick={onSelect}
            className={cn(OPTION_ROW, pressed && OPTION_ROW_PRESSED)}
        >
            <span className="min-w-0 grow">
                <strong className="t-h3 block">{title}</strong>
                <span className="t-micro muted">{why}</span>
            </span>
            <span
                aria-hidden="true"
                className={cn(
                    'grid size-[26px] shrink-0 place-items-center rounded-full border-2',
                    pressed
                        ? 'border-[var(--teal)] bg-[var(--teal)] text-[var(--on-teal)]'
                        : 'border-[var(--border-strong)]'
                )}
            >
                {pressed ? <Check size={16} /> : null}
            </span>
        </button>
    );
}
