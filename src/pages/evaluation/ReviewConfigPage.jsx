import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Layers, Clock, Info, ArrowRight, Star, Sparkles } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { cn } from '../../lib/cn';
import {
    useReviewConfig,
    REVIEW_MODES,
    REVIEW_DIRECTIONS,
    readReviewPrefs,
    writeReviewPrefs,
} from '../../features/evaluation/useEvaluation';

/**
 * Spaced repetition config — `/review` (screen 15).
 *
 * THE SCREEN'S JOB IS TO REMOVE THE TWO REASONS PEOPLE SKIP REVIEW: not knowing what will
 * be reviewed, and not knowing how long it takes. So the copy states BOTH up front
 * ("34 từ đến hạn · khoảng 9 phút") and the primary button repeats the duration. Every one
 * of those numbers is real: the count comes from `dictionaryStats.wordsToReviewToday`, and
 * the duration is computed at a documented pace rather than guessed.
 *
 * DIRECTION HAS NO ENDPOINT, AND THE SCREEN SAYS SO. The backend's review flow always
 * prompts with the word, so the English→Vietnamese / Vietnamese→English / Mixed control
 * is a client-side display preference. It is still worth offering — it shapes what the
 * user expects to see — but presenting it as a server setting would be a lie the user
 * discovers on their next device.
 *
 * The four content options each carry their OWN count, because "which words" is exactly
 * the question this screen exists to answer.
 */
export default function ReviewConfigPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const config = useReviewConfig();
    const [prefs, setPrefs] = useState(() => readReviewPrefs());

    function update(patch) {
        const next = { ...prefs, ...patch };
        setPrefs(next);
        writeReviewPrefs(next);
    }

    /**
     * The count each content option would actually review.
     *
     * `mode` is the API's own switch: `isQuickMode` serves any words deliberately easily,
     * while the default honours the due schedule. The other two filter the fetched list
     * by fields it already carries.
     */
    const counts = {
        DUE: config.dueCount,
        QUICK: config.totalWords,
        FAVORITES: config.favoriteCount,
        WEAK: config.learningCount,
    };

    const selectedMode = REVIEW_MODES.find((m) => m.id === prefs.contentMode) ?? REVIEW_MODES[0];
    const selectedCount = counts[selectedMode.id] ?? 0;
    const selectedMinutes = selectedCount
        ? Math.max(1, Math.round((selectedCount * 16) / 60))
        : 0;

    const MODE_META = {
        DUE: { icon: Clock, toneKey: 'review.modeDueHint' },
        QUICK: { icon: Sparkles, toneKey: 'review.modeQuickHint' },
        FAVORITES: { icon: Star, toneKey: 'review.modeFavoritesHint' },
        WEAK: { icon: Layers, toneKey: 'review.modeWeakHint' },
    };

    return (
        <div className="mx-auto flex w-full max-w-[680px] flex-col gap-4">
            <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => navigate('/evaluation')}
            >
                <ArrowLeft size={16} aria-hidden="true" />
                {t('common.back')}
            </Button>

            {/* --- the stepper ---------------------------------------------- */}
            <div>
                <span className="t-micro muted">{t('review.stepOf', { step: 1, total: 3 })}</span>
                <ol aria-label={t('review.stepperLabel')} className="mt-2 flex gap-1.5">
                    {[1, 2, 3].map((step) => (
                        <li
                            key={step}
                            aria-current={step === 1 ? 'step' : undefined}
                            className={cn(
                                'h-1.5 flex-1 rounded-full',
                                step === 1 ? 'bg-[var(--teal)]' : 'bg-[var(--surface-alt)]'
                            )}
                        >
                            <span className="sr-only">{t('review.stepN', { step })}</span>
                        </li>
                    ))}
                </ol>
            </div>

            {/* --- what will be reviewed, and how long ---------------------- */}
            <AsyncBoundary
                loading={config.loading}
                error={config.error}
                isEmpty={false}
                onRetry={config.reload}
                skeleton={<SkeletonCard lines={3} />}
            >
                <Card level="hero" padding="xl" className="flex flex-col gap-4 md:flex-row md:items-center">
                    <Lexi mood={config.dueCount > 0 ? 'happy' : 'sleepy'} size="md" />
                    <div className="min-w-0 flex-1">
                        {/* Both facts, up front — that is the whole design brief. */}
                        <h1 className="t-h2">
                            {config.dueCount > 0
                                ? t('review.headline', { count: config.dueCount, minutes: config.estimatedMinutes })
                                : t('review.nothingDueTitle')}
                        </h1>
                        <p className="t-body soft mt-1">
                            {config.dueCount > 0 ? t('review.headlineBody') : t('review.nothingDueBody')}
                        </p>
                    </div>
                </Card>

                {/* --- content choice --------------------------------------- */}
                <fieldset className="flex flex-col gap-3">
                    <legend className="t-h3 mb-2">{t('review.contentTitle')}</legend>
                    <ul className="flex flex-col gap-2">
                        {REVIEW_MODES.map((mode) => {
                            const { icon: Icon, toneKey } = MODE_META[mode.id];
                            const count = counts[mode.id] ?? 0;
                            const minutes = count ? Math.max(1, Math.round((count * 16) / 60)) : 0;
                            const disabled = count === 0;
                            return (
                                <li key={mode.id}>
                                    <button
                                        type="button"
                                        aria-pressed={prefs.contentMode === mode.id}
                                        disabled={disabled}
                                        onClick={() => update({ contentMode: mode.id })}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-[var(--r-card)] border-2 p-3.5 text-left',
                                            prefs.contentMode === mode.id
                                                ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                                                : 'border-[var(--border)] bg-[var(--surface)]',
                                            disabled && 'opacity-50'
                                        )}
                                    >
                                        <span aria-hidden="true" className="shrink-0 text-[var(--teal)]">
                                            <Icon size={18} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <strong className="t-label block text-[var(--ink)]">
                                                {t(`review.mode.${mode.id}`)}
                                            </strong>
                                            <span className="t-micro muted">{t(toneKey)}</span>
                                        </span>
                                        {/* Each option carries its OWN count and duration. */}
                                        <span className="shrink-0 text-right">
                                            <span className="t-mono block text-sm">
                                                {t('review.wordCount', { count })}
                                            </span>
                                            <span className="t-micro muted">
                                                {minutes > 0 ? t('review.aboutMinutes', { count: minutes }) : '—'}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </fieldset>

                {/* --- direction -------------------------------------------- */}
                <fieldset>
                    <legend className="t-label mb-2">{t('review.directionTitle')}</legend>
                    <div className="flex flex-wrap gap-1.5">
                        {REVIEW_DIRECTIONS.map((direction) => (
                            <button
                                key={direction}
                                type="button"
                                aria-pressed={prefs.direction === direction}
                                onClick={() => update({ direction })}
                                className={cn(
                                    'min-h-11 rounded-[var(--r-control)] px-3.5 text-sm font-bold',
                                    prefs.direction === direction
                                        ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                        : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                                )}
                            >
                                {t(`review.direction.${direction}`)}
                            </button>
                        ))}
                    </div>
                    {/* Said plainly: this one is a display preference, not a server setting. */}
                    <p className="t-micro muted mt-2 flex items-start gap-2">
                        <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                        {t('review.directionNote')}
                    </p>
                </fieldset>

                {/* --- start ------------------------------------------------- */}
                <Card level="edge" padding="xl" className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="primary"
                            size="lg"
                            disabled={selectedCount === 0}
                            onClick={() =>
                                navigate(
                                    `/dictionary/review?mode=${encodeURIComponent(selectedMode.mode)}&filter=${encodeURIComponent(selectedMode.filter)}`
                                )
                            }
                        >
                            <Layers size={18} aria-hidden="true" />
                            {/* The duration is repeated ON the button, per the design. */}
                            {selectedCount > 0
                                ? t('review.startWithDuration', { count: selectedCount, minutes: selectedMinutes })
                                : t('review.nothingToReview')}
                        </Button>
                        <ButtonLink to="/dictionary" variant="secondary" size="lg">
                            {t('review.later')}
                        </ButtonLink>
                    </div>

                    <p className="t-micro muted border-t-2 border-[var(--border)] pt-3">
                        {t('review.scheduleNote')}
                    </p>
                </Card>
            </AsyncBoundary>

            <div className="flex items-center justify-center gap-3">
                <ArrowRight size={15} className="text-[var(--ink-faint)]" aria-hidden="true" />
                <ButtonLink to="/dictionary" size="sm" variant="ghost">
                    {t('vocabTest.openDictionary')}
                </ButtonLink>
            </div>
        </div>
    );
}
