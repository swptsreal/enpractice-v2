import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Volume2, Eye, Check, Loader2 } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { MasteryRing } from '../../components/vocabulary/MasteryRing';
import { formatDate } from '../../lib/datetime';
import { useDueReview, useReviewWord, RECALL_OPTIONS } from '../../features/vocabulary/useDictionary';

/**
 * Flashcard SRS review — `/dictionary/review`.
 *
 * The four recall buttons are the whole design. They map onto the backend's REAL
 * 0-5 `performanceScore` (verified live: 0 and 2 hold the level, 4 moves it up one,
 * 5 moves it up two, and 9 is rejected with 400 by `@Min/@Max`).
 *
 * WHAT THIS SCREEN DOES NOT DO, deliberately: the approved design shows a resulting
 * interval on each button ("<1 ngày", "2 ngày", "5 ngày", "12 ngày"). The backend
 * does not return its interval schedule, and the next date depends on the word's
 * CURRENT level as well as the score, so stable per-button day counts cannot be
 * derived — they would be invented. PRODUCT.md rules out invented numbers, so the
 * buttons name the recall quality and the direction of the schedule, and the real
 * `nextReviewAt` is shown after the choice instead of predicted before it. That is
 * a sourcing decision, and it is recorded in the README so it is not mistaken for
 * an oversight.
 *
 * A card is flipped, scored, and then the next is taken from the queue. The scored
 * card is removed locally rather than refetching the whole queue per answer: the
 * queue is a snapshot of "due at the start of this session", and refetching would
 * let a word answered "easy" disappear mid-session review inconsistently.
 */
export default function DictionaryReviewPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    /**
     * The session comes from the review CONFIG screen (`/review`), which sends the API's
     * own `mode` switch and a client-side `filter`. Without reading them here the config
     * screen would be decorative: it would offer four ways to review and all four would
     * fetch the same due list.
     */
    const mode = params.get('mode') ?? '';
    const filter = params.get('filter') ?? 'due';

    const { items: fetched, loading, error } = useDueReview({ mode, size: 50 });

    /** Client-side filters over fields the fetch already carries. */
    const items = useMemo(() => {
        if (filter === 'favorite') return fetched.filter((w) => w.isFavorite);
        if (filter === 'weak') return fetched.filter((w) => Number(w.proficiencyLevel ?? 0) <= 1);
        return fetched;
    }, [fetched, filter]);
    const { score, submitting } = useReviewWord();

    const [index, setIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [reviewed, setReviewed] = useState(0);

    /**
     * The queue is implicitly frozen: `useDueReview` depends only on
     * `words`/`mode`/`size`, all of which are constant here, so `items` does not
     * change once the request settles and advancing `index` cannot reshuffle it.
     *
     * That matters because re-fetching per answer would let a word answered "easy"
     * drop out of the next fetch and shift every later index, so the candidate would
     * silently skip cards. The queue is a snapshot of what was due when the session
     * started.
     */
    const total = items.length;
    const word = index < total ? items[index] : null;
    const done = !loading && total > 0 && index >= total;

    const exampleSentence = useMemo(() => {
        const first = (word?.examples ?? [])[0];
        if (!first) return null;
        return first.sentence ?? first.text ?? null;
    }, [word]);

    function speak() {
        if (!word?.word) return;
        /* Web Speech API: available without a network round trip and without
           shipping audio. If it is missing the button is simply not rendered. */
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(word.word);
        utterance.lang = 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }

    async function onScore(option) {
        if (!word) return;
        try {
            const updated = await score(word.id, option.score);
            setLastResult(updated);
            setReviewed((n) => n + 1);
            setRevealed(false);
            setIndex((n) => n + 1);
        } catch {
            /* the hook exposes `error`; the boundary renders it */
        }
    }

    if (done) {
        return (
            <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 px-4 py-10 text-center">
                <Card level="hero" padding="xl" className="flex flex-col items-center gap-4">
                    <Lexi mood="celebrate" size="lg" label={t('dictionary.reviewDoneLexi')} />
                    <h1 className="t-h2">{t('dictionary.reviewDoneTitle')}</h1>
                    <p className="t-body soft">
                        {t('dictionary.reviewDoneBody', { count: reviewed })}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <ButtonLink to="/dictionary" variant="primary">
                            {t('dictionary.backToNotebook')}
                        </ButtonLink>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIndex(0);
                                setReviewed(0);
                                setLastResult(null);
                            }}
                        >
                            {t('common.retry')}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-dvh flex-col bg-[var(--canvas)]">
            <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
                <Button variant="ghost" size="sm" iconOnly aria-label={t('common.close')} onClick={() => navigate('/dictionary')}>
                    <X size={18} aria-hidden="true" />
                </Button>
                <div className="min-w-0 flex-1">
                    <span className="t-label block">{t('dictionary.reviewTitle')}</span>
                    <span className="t-micro muted">
                        {t('dictionary.reviewProgress', { done: index, total: total })}
                    </span>
                </div>
                {/* progress as a real progressbar, not a decorative div */}
                <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-valuenow={index}
                    aria-label={t('dictionary.reviewProgressLabel')}
                    className="h-2.5 w-24 overflow-hidden rounded-full bg-[var(--surface-alt)]"
                >
                    <div
                        className="h-full rounded-full bg-[var(--teal)] transition-[width] duration-300"
                        style={{ width: `${total ? (index / total) * 100 : 0}%` }}
                    />
                </div>
            </header>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && total === 0}
                onRetry={() => window.location.reload()}
                skeleton={
                    <div className="mx-auto w-full max-w-[560px] p-4">
                        <SkeletonCard lines={6} />
                    </div>
                }
                emptyTitle={t('dictionary.reviewEmptyTitle')}
                emptyBody={t('dictionary.reviewEmptyBody')}
                emptyAction={
                    <ButtonLink to="/dictionary" variant="primary" size="sm">
                        {t('dictionary.backToNotebook')}
                    </ButtonLink>
                }
            >
                <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-4 px-4 py-6">
                    <Card level="hero" padding="xl" className="flex flex-col items-center gap-4 text-center">
                        <div className="flex items-center gap-2">
                            {(word?.tags ?? []).slice(0, 3).map((tg) => (
                                <Chip key={tg} tone="neutral">
                                    #{tg}
                                </Chip>
                            ))}
                            <MasteryRing level={word?.proficiencyLevel} size="sm" showLabel={false} />
                        </div>

                        {typeof window !== 'undefined' && window.speechSynthesis ? (
                            <Button variant="ghost" size="sm" onClick={speak} aria-label={t('dictionary.listen')}>
                                <Volume2 size={16} aria-hidden="true" />
                                {t('dictionary.listen')}
                            </Button>
                        ) : null}

                        <h1 className="t-display break-words">{word?.word}</h1>
                        {word?.ipa ? <p className="t-mono muted">{word.ipa}</p> : null}

                        {exampleSentence ? (
                            <p className="t-body soft italic">
                                {exampleSentence}
                            </p>
                        ) : null}
                    </Card>

                    {!revealed ? (
                        <Button variant="primary" size="lg" block onClick={() => setRevealed(true)}>
                            <Eye size={18} aria-hidden="true" />
                            {t('dictionary.showMeaning')}
                        </Button>
                    ) : (
                        <>
                            <Card level="edge" padding="xl" className="flex flex-col gap-2">
                                <span className="t-micro muted">{t('dictionary.meaningLabel')}</span>
                                <p className="t-body-lg">{word?.meaning}</p>
                                {word?.explanation ? <p className="t-body soft">{word.explanation}</p> : null}
                                {word?.note ? (
                                    <p className="t-micro muted border-l-2 border-[var(--border-strong)] pl-3">{word.note}</p>
                                ) : null}
                            </Card>

                            <fieldset className="flex flex-col gap-2">
                                <legend className="t-micro muted mb-1.5 text-center">{t('dictionary.howWell')}</legend>
                                {/* 2x2 below 480px so no button is narrower than a
                                    comfortable thumb target; four across above. */}
                                <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-4">
                                    {RECALL_OPTIONS.map((option) => (
                                        <Button
                                            key={option.id}
                                            variant="secondary"
                                            size="lg"
                                            disabled={submitting}
                                            onClick={() => onScore(option)}
                                            className="min-h-14 flex-col gap-0.5 py-2"
                                            aria-label={`${t(option.labelKey)} — ${t(option.hintKey)}`}
                                        >
                                            <span className="t-label">{t(option.labelKey)}</span>
                                            <span className="t-micro muted">{t(option.hintKey)}</span>
                                        </Button>
                                    ))}
                                </div>
                            </fieldset>

                            {submitting ? (
                                <p className="t-micro muted flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                    {t('dictionary.savingReview')}
                                </p>
                            ) : null}

                            {/* The REAL consequence, after the fact, instead of a
                                predicted interval before it. */}
                            {lastResult?.nextReviewAt ? (
                                <p className="t-micro muted flex items-center justify-center gap-2 text-center">
                                    <Check size={14} aria-hidden="true" className="text-[var(--correct)]" />
                                    {t('dictionary.nextReviewIs', {
                                        date: formatDate(lastResult.nextReviewAt) ?? '—',
                                    })}
                                </p>
                            ) : null}
                        </>
                    )}
                </main>
            </AsyncBoundary>
        </div>
    );
}
