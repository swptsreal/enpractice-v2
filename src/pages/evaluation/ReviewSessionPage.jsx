import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Volume2, X, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, RowBox } from '../../components/ui/Card';
import { Markdown } from '../../components/ui/Markdown';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { cn } from '../../lib/cn';
import { useReviewWords } from '../../features/evaluation/useReviewSession';
import { gradeAnswer, describeWindow, parseSessionParams, primaryMeaning } from '../../features/evaluation/reviewSession';
import { speakEnglish } from '../../utils/ttsHelper';

/**
 * Sitting a review session — `/review/session`, step 2 of three (screen 15b).
 *
 * OUTSIDE THE SHELL, like the vocabulary test: a review session is a focused surface, so there is no
 * rail to wander into and the asset is in a sticky footer where a thumb can reach it. The exit is
 * explicit.
 *
 * ONE QUESTION AT A TIME, AND THE VERDICT STAYS ON SCREEN. The answer is graded on Enter and the
 * turn is only advanced by a second, deliberate press. Auto-advancing on a correct answer would skip
 * the example sentence — which is the part that turns a correct guess into knowledge — and on a wrong
 * answer it would skip the correction, which is the only reason to show a wrong answer at all.
 *
 * THE GRADER IS NOT WRITTEN HERE. `gradeAnswer` in `reviewSession.js` wraps the ported v1 comparison
 * and is unit-tested against its edges; a second comparison written inline would be a second rule for
 * "correct" in one product.
 */
export default function ReviewSessionPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { params, direction } = useMemo(() => parseSessionParams(searchParams), [searchParams]);
    /* The window must be complete before a single word is requested. `rangeMode=range` with a blank
       `from`/`to` is not a malformed request — the server reads it as "the last 7 days" — so a
       hand-edited URL would silently review a DIFFERENT window than the one it names. The config step
       refuses to send that; this step refuses to fetch it. */
    const chosenWindow = describeWindow(params);
    const { words, loading, error, reload } = useReviewWords(params, chosenWindow.complete);

    const [index, setIndex] = useState(0);
    const [typed, setTyped] = useState('');
    const [answers, setAnswers] = useState([]);
    const [elapsed, setElapsed] = useState(0);
    const inputRef = useRef(null);

    /* Elapsed seconds are the session's duration, and the endpoint rejects a duration outside
       1..10800 — so a tab left open overnight must not produce a 400. */
    useEffect(() => {
        const id = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const word = words[index];
    const verdict = answers.find((a) => a.answerIndex === index) ?? null;
    const isLast = index >= words.length - 1;
    const prompt = direction === 'VI_TO_EN' ? primaryMeaning(word) : (word?.englishWord ?? '');

    /* Focus follows the question: the whole flow is typeable, so the caret must be in the field
       without a click on every turn. */
    useEffect(() => {
        if (!verdict && word) inputRef.current?.focus();
    }, [index, verdict, word]);

    function check() {
        const text = typed.trim();
        if (!text || !word || verdict) return;
        const { isCorrect } = gradeAnswer(text, word, direction);
        setAnswers((current) => [
            ...current,
            {
                answerIndex: index,
                englishWord: word.englishWord,
                normalizedWord: word.normalizedWord,
                /* The prompt and the correct answer are captured HERE, where the word object is in
                   hand. The result step cannot rebuild them: the API's `words` filter reads back a
                   word list, not the session, and `/reviews/last` deliberately returns the second
                   latest row, so the finished session is not re-readable. */
                prompt,
                correctAnswer: direction === 'VI_TO_EN' ? word.englishWord : primaryMeaning(word),
                givenAnswer: text,
                isCorrect,
            },
        ]);
    }

    function next() {
        if (isLast) {
            /* The result is a different screen AND inside the app shell, so the answers travel in
               navigation state rather than in the URL. */
            navigate('/review/result', {
                replace: true,
                state: { answers, params, direction, durationSeconds: elapsed },
            });
            return;
        }
        setTyped('');
        setIndex((n) => n + 1);
    }

    function onKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (verdict) next();
            else check();
            return;
        }
        if (event.key === 'Escape') navigate('/review');
    }

    return (
        <div className="flex min-h-dvh flex-col bg-[var(--canvas)]">
            <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
                <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={t('review.practice.exit')}
                    onClick={() => navigate('/review')}
                >
                    <X size={18} aria-hidden="true" />
                </Button>
                <div className="min-w-0 flex-1">
                    <span className="t-micro muted mono">
                        {words.length ? `${index + 1} / ${words.length}` : '—'}
                    </span>
                </div>
            </header>

            <div
                className="h-1.5 w-full bg-[var(--surface-alt)]"
                role="progressbar"
                aria-label={t('review.practice.progress')}
                aria-valuemin={0}
                aria-valuemax={words.length || 1}
                aria-valuenow={index + (verdict ? 1 : 0)}
            >
                <div
                    className="h-full bg-[var(--teal)] transition-[width]"
                    style={{ width: `${words.length ? ((index + (verdict ? 1 : 0)) / words.length) * 100 : 0}%` }}
                />
            </div>

            {/* `<main>` WITHOUT `id="main"`: that id is the SHELL's marker, and the smoke and flow
                suites use its presence to tell the two chromes apart. The mockup's take shell carries
                the id because it is inert in a static frame; here it would be a lie. */}
            <main className="mx-auto w-full max-w-[620px] flex-1 px-3.5 py-5">
                <AsyncBoundary
                    loading={loading}
                    error={error}
                    isEmpty={!loading && !error && words.length === 0}
                    emptyTitle={t('review.nothingToReview')}
                    emptyBody={t('review.emptyBody')}
                    emptyAction={
                        <Button variant="secondary" onClick={() => navigate('/review')}>
                            {t('review.back')}
                        </Button>
                    }
                    onRetry={reload}
                    skeleton={<SkeletonCard lines={4} />}
                >
                    {word ? (
                        <div className="flex flex-col gap-4">
                            {/* The mockup's prompt card is a CENTRED hero with the speaker at its
                                top right, and the answer field is a separate block below it rather
                                than a second half of the same card. The split is the design's: the
                                prompt is the thing being looked at, the field is the thing being
                                typed into, and they are read in that order. */}
                            <Card level="hero" padding="xl" className="text-center">
                                <div className="flex justify-end">
                                    {direction === 'EN_TO_VI' ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            aria-label={t('review.practice.pronounce')}
                                            onClick={() => speakEnglish(word.englishWord)}
                                        >
                                            <Volume2 size={16} aria-hidden="true" />
                                            {t('review.practice.pronounce')}
                                        </Button>
                                    ) : null}
                                </div>
                                <span className="t-micro muted mt-4 block">
                                    {direction === 'VI_TO_EN'
                                        ? t('review.practice.promptViEn')
                                        : t('review.practice.promptEnVi')}
                                </span>
                                <h1 className="t-display mt-1 break-words">{prompt}</h1>
                            </Card>

                            <div>
                                <label htmlFor="review-answer" className="t-label block">
                                    {direction === 'VI_TO_EN'
                                        ? t('review.practice.answerLabelViEn')
                                        : t('review.practice.answerLabelEnVi')}
                                </label>
                                <input
                                    id="review-answer"
                                    ref={inputRef}
                                    value={typed}
                                    readOnly={Boolean(verdict)}
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    placeholder={
                                        direction === 'VI_TO_EN'
                                            ? t('review.practice.answerPlaceholderViEn')
                                            : t('review.practice.answerPlaceholderEnVi')
                                    }
                                    onChange={(event) => setTyped(event.target.value)}
                                    onKeyDown={onKeyDown}
                                    className="mt-1 h-12 w-full rounded-[var(--r-control)] border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-[1.0625rem] focus-visible:border-[var(--teal)] focus-visible:outline-none"
                                />
                                <p className="t-micro muted mt-2">{t('review.practice.keyboardHint')}</p>
                            </div>

                            {verdict ? (
                                <Card
                                    padding="lg"
                                    className={cn(
                                        'border-2',
                                        verdict.isCorrect ? 'border-[var(--correct)]' : 'border-[var(--wrong)]'
                                    )}
                                >
                                    {/* Colour AND a glyph AND words (WCAG 2.1 SC 1.4.1): "correct"
                                        must survive a monochrome screen and a colour-blind reader. The
                                        mockup puts the body INSIDE this row as a `t-micro muted` line
                                        under the title, so the verdict reads as one statement rather
                                        than as a heading with a paragraph attached. */}
                                    <RowBox center>
                                        <span
                                            className="grid size-9 shrink-0 place-items-center rounded-full border-2"
                                            style={{
                                                borderColor: verdict.isCorrect
                                                    ? 'var(--correct)'
                                                    : 'var(--wrong)',
                                                background: verdict.isCorrect
                                                    ? 'var(--correct-soft)'
                                                    : 'var(--wrong-soft)',
                                                color: verdict.isCorrect ? 'var(--correct)' : 'var(--wrong)',
                                            }}
                                            aria-hidden="true"
                                        >
                                            {verdict.isCorrect ? <Check size={18} /> : <X size={18} />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <strong className="t-label block">
                                                {verdict.isCorrect
                                                    ? t('review.practice.correctTitle')
                                                    : t('review.practice.wrongTitle')}
                                            </strong>
                                            <span className="t-micro muted">
                                                {verdict.isCorrect
                                                    ? t('review.practice.correctBody')
                                                    : t('review.practice.wrongBody')}
                                            </span>
                                        </span>
                                    </RowBox>

                                    {/* The answer pair, English → Vietnamese, on the tinted row the
                                        mockup draws: the learner sees the whole mapping, not just the
                                        half they missed, and can hear it. When the direction is
                                        Việt → Anh the row names the ENGLISH word, so it always carries
                                        the side they did not supply. */}
                                    <RowBox
                                        center
                                        className={cn(
                                            'mt-3 justify-between',
                                            verdict.isCorrect ? 'bg-[var(--correct-soft)]' : 'bg-[var(--wrong-soft)]'
                                        )}
                                    >
                                        <span className="min-w-0 flex-1">
                                            <span className="t-micro muted block">
                                                {direction === 'VI_TO_EN'
                                                    ? t('review.practice.correctAnswerViEn')
                                                    : t('review.practice.correctAnswerEnVi')}
                                            </span>
                                            <strong className="t-label block break-words">
                                                {direction === 'VI_TO_EN'
                                                    ? `${word.englishWord} → ${prompt}`
                                                    : `${word.englishWord} → ${primaryMeaning(word)}`}
                                            </strong>
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => speakEnglish(word.englishWord)}
                                        >
                                            <Volume2 size={16} aria-hidden="true" />
                                            {t('review.practice.pronounce')}
                                        </Button>
                                    </RowBox>

                                    {/* Shown on a CORRECT answer too. The mockup draws the chips in its
                                        correct state, and hiding them on a hit withholds the one thing
                                        that turns a lucky match into a known word. */}
                                    {word.alternatives?.length ? (
                                        <div className="mt-3">
                                            <span className="t-micro muted">{t('review.practice.alternatives')}</span>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {word.alternatives.map((alt) => (
                                                    <Chip key={alt} tone="teal">
                                                        {alt}
                                                    </Chip>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    {word.meaningExplanation ? (
                                        <RowBox className="mt-3">
                                            <span className="min-w-0 flex-1">
                                                <span className="t-micro muted block">
                                                    {t('review.practice.explanation')}
                                                </span>
                                                {/* MARKDOWN, not a string. This field is written by the
                                                    model and uses bold, italic and lists to separate
                                                    the rule from the collocations; as plain text the
                                                    asterisks showed up on screen. Same renderer as the
                                                    explain screen: markdown only, no raw HTML, because
                                                    the source is untrusted model output. */}
                                                {/* No first/last-child resets needed here: the shared
                                                    renderer already carries `first:mt-0` on the
                                                    headings and `last:mb-0` on the paragraphs. */}
                                                <Markdown content={word.meaningExplanation} className="mt-0.5" />
                                            </span>
                                        </RowBox>
                                    ) : null}

                                    {word.exampleSentences?.length ? (
                                        <RowBox className="mt-3">
                                            <span className="min-w-0 flex-1">
                                                <span className="t-micro muted block">
                                                    {t('review.practice.examples')}
                                                </span>
                                                {word.exampleSentences.map((example) => (
                                                    <span key={example.sentence} className="mt-1 block">
                                                        <span className="t-body block">{example.sentence}</span>
                                                        {example.translation ? (
                                                            <span className="t-micro soft block">
                                                                {example.translation}
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                ))}
                                            </span>
                                        </RowBox>
                                    ) : null}
                                </Card>
                            ) : null}
                        </div>
                    ) : null}
                </AsyncBoundary>
            </main>

            <footer className="sticky bottom-0 z-30 border-t-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
                <div className="mx-auto flex w-full max-w-[620px] items-center gap-2">
                    {/* The direction lives HERE, where a thumb lands, not in the bar. In the bar it
                        competed with the progress for the strip that should be showing how far in the
                        learner is; in the footer it sits next to the action it qualifies. Hidden under
                        480px, which is the frame's own `hide-sm` — a 390px phone needs the whole row
                        for the button. */}
                    <span className="t-micro muted hidden shrink-0 min-[480px]:block">
                        {t(`review.direction.${direction}`)}
                    </span>
                    <span className="grow" />
                    {verdict ? (
                        <Button variant="primary" size="lg" onClick={next}>
                            {isLast ? t('review.practice.finish') : t('review.practice.next')}
                            <ArrowRight size={18} aria-hidden="true" />
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="lg"
                            disabled={!typed.trim()}
                            onClick={check}
                        >
                            {t('review.practice.check')}
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
}
