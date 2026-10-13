import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookMarked, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, RowBox } from '../../components/ui/Card';
import { Chip, Stat } from '../../components/ui/Primitives';
import { Lexi } from '../../components/mascot/Lexi';

import { createExplainRequestId } from '../../features/vocabulary-explain/vocabularyExplainState';
import { usePreviousSession, useSaveReviewSession } from '../../features/evaluation/useReviewSession';
import { buildSessionPayload, formatClock, ratingKey, sessionSearch, summarise } from '../../features/evaluation/reviewSession';
import { useSetPageHeaderSubtitle } from '../../app/PageHeaderContextCore';

/**
 * The four verdicts, at v1's thresholds, each with the glyph that heads the hero.
 *
 * A BIG EMOJI, because that is what the mockup draws: frame 15c heads the result with
 * `<span class="t-display-xl" aria-hidden="true">🌟</span>`. The frame only draws the "Rất tốt" case,
 * so the other three take a glyph from the same family — the choice is recorded in
 * `_design/SCREENS-V2.md` §15c and in the frame's own comment rather than made here, and
 * `check_review_frames.py` fails if the two design files stop agreeing on the four.
 *
 * It is `aria-hidden` on screen: the `<h2>` underneath already says the verdict in words, so the
 * glyph is decoration, and a screen reader announcing "sparkles" would be noise.
 */
const RATING_GLYPHS = {
    excellent: '🌟',
    good: '✨',
    improving: '📈',
    needsReview: '📚',
};

/**
 * What the session produced — `/review/result`, step 3 of three (screen 15c).
 *
 * INSIDE THE SHELL, unlike the practice step: the session is over, and the exits it offers are
 * navigation (retry the misses, start over, open the notebook) rather than a decision the learner has
 * to make under time.
 *
 * THE COMPARISON IS READ BEFORE THE SAVE, AND THAT ORDER IS THE WHOLE TRICK. `GET /reviews/last`
 * answers with the *second* latest row, so a session fetched after the save would be the one before
 * this one — correct here only by coincidence of how that query is written. Reading it first makes
 * "so với phiên trước" mean the previous session whatever the endpoint does next.
 *
 * A RELOAD WITHOUT THE ANSWERS GOES BACK TO SETUP. The answers live in navigation state because they
 * are far too large for a query string, and the just-finished session cannot be read back from the
 * server (`/reviews/last` is the second-latest by design). Sending the learner to step 1 is the
 * honest recovery: it re-offers the same session rather than showing an empty result page.
 */
export default function ReviewResultPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useLocation();

    /* Same heading as step 1, different second line — that is how the mockup separates the two. */
    useSetPageHeaderSubtitle(t('review.resultSubtitle'));

    const { previous } = usePreviousSession();
    const { save, error } = useSaveReviewSession();

    const answers = state?.answers ?? null;
    const params = state?.params ?? null;
    const direction = state?.direction ?? 'EN_TO_VI';
    const durationSeconds = state?.durationSeconds ?? 0;

    const summary = useMemo(() => summarise(answers ?? []), [answers]);
    const rating = ratingKey(summary.accuracy);

    /**
     * One session, stored once.
     *
     * React's StrictMode runs effects twice on mount (setup → cleanup → setup), and `POST /reviews`
     * has no idempotency guard — the first browser run of this page stored TWO rows for one session.
     * A ref is the guard that works: StrictMode keeps the instance, so state and refs survive the
     * simulated remount, while an effect that merely reads a prop would run again.
     */
    const sent = useRef(false);

    useEffect(() => {
        if (!answers || !params) {
            navigate('/review', { replace: true });
            return;
        }
        if (sent.current) return;
        sent.current = true;

        /* The id and the start time are built INSIDE the effect, not during render: both are impure,
           and a render-time id would differ on every re-render. `createExplainRequestId` is reused
           rather than re-written — it already produces an RFC 4122 v4 UUID with a tested
           insecure-context fallback, which is what the server's `sessionId: UUID` requires. */
        save(
            buildSessionPayload({
                sessionId: createExplainRequestId(),
                startedAt: new Date().toISOString(),
                durationSeconds,
                params,
                direction,
                answers,
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!answers || !params) return null;

    const glyph = RATING_GLYPHS[rating] ?? RATING_GLYPHS.good;
    const previousAccuracy = Number(previous?.accuracy);
    const hasComparison = Number.isFinite(previousAccuracy);
    const diff = hasComparison ? Math.round(summary.accuracy - previousAccuracy) : 0;

    return (
        <div className="mx-auto flex w-full max-w-[680px] flex-col gap-4">
            {/* NO STEPPER. Step 1 dropped it for being an entry point; this step drops it because the
                flow is OVER — "3 of 3" tells the learner something they already know, and it occupied
                the strip directly above the result they came for. The retry exits below say what to do
                next, which is more use than a badge confirming the past. Asserted by
                `e2e/review-flow.spec.js`. */}

            {/* The mockup's hero is a LEFT-ALIGNED row: Lexi, then the 🌟, then the verdict, then the
                sentence about the session, then the metadata line — five things at three sizes, not a
                centred stack and not one merged heading. The sentence is its own line because it is
                the fact ("17 trên 20"); folding it into the heading with an em dash made the heading
                do two jobs and left the reader nothing to scan for. */}
            <Card level="hero" padding="xl">
                <div className="flex flex-wrap items-center gap-4">
                    <Lexi mood="celebrate" size="md" />
                    <div className="min-w-0 flex-1">
                        <span className="t-display-xl block" aria-hidden="true">
                            {glyph}
                        </span>
                        <h2 className="t-h2 mt-1">{t(`review.result.${rating}`)}</h2>
                        <p className="t-body soft mt-1">
                            {t('review.result.summary', { correct: summary.correct, total: summary.total })}
                        </p>
                        <p className="t-micro muted mt-1.5">
                            {t('review.result.meta', {
                                count: summary.total,
                                direction: t(`review.direction.${direction}`),
                                duration: formatClock(durationSeconds),
                            })}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Four tiles as SIBLINGS of the hero, never a card inside a card, in the frame's own tones:
                Đúng takes `teal` and Độ chính xác takes `amber`, while Tổng and Sai stay inked. Those
                are the only two tones the design has — `.stat--teal` / `.stat--amber` in the shared
                tokens — so a green "correct" and a red "wrong" here would be colours invented on this
                screen. The verdict above already carries correct/wrong; the tiles are counts. */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat value={summary.total} label={t('review.result.total')} />
                <Stat value={summary.correct} label={t('review.result.correct')} tone="teal" />
                <Stat value={summary.incorrect} label={t('review.result.incorrect')} />
                <Stat value={`${summary.accuracy}%`} label={t('review.result.accuracy')} tone="amber" />
            </div>

            <Card padding="lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <span className="t-label block">{t('review.result.accuracyTitle')}</span>
                        <span className="t-micro muted block">{t('review.result.compareLabel')}</span>
                    </div>
                    {/* The delta is a CHIP with an arrow, not a sentence: a signed number is a token to
                        be scanned, and colour carries the direction of travel. When there is no
                        previous session the chip is replaced rather than filled with a fake 0%. */}
                    {hasComparison ? (
                        <Chip tone={diff >= 0 ? 'correct' : 'wrong'} icon={diff >= 0 ? TrendingUp : TrendingDown}>
                            {t('review.result.comparedToLast', { diff: diff >= 0 ? `+${diff}` : String(diff) })}
                        </Chip>
                    ) : (
                        <span className="t-micro muted">{t('review.result.noComparison')}</span>
                    )}
                </div>
                {/* The bar renders either way: a first number is worth as much as a delta. */}
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-alt)]">
                    <div
                        className="h-full rounded-full bg-[var(--teal)]"
                        style={{ width: `${Math.min(100, Math.max(0, summary.accuracy))}%` }}
                    />
                </div>
            </Card>

            <Card padding="lg">
                <h2 className="t-h3">{t('review.result.detailsTitle')}</h2>

                {/* A table on a wide screen; the same rows as a list on a phone. A five-column table
                    at 390px scrolls sideways and hides the column that matters, which is the answer. */}
                <div className="mt-3 hidden overflow-x-auto lg:block">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                {['#', 'prompt', 'yourAnswer', 'correctAnswer', 'result'].map((column) => (
                                    <th
                                        key={column}
                                        scope="col"
                                        className="t-micro muted border-b-2 border-[var(--border)] pb-2 pr-3 font-bold whitespace-nowrap"
                                    >
                                        {column === '#' ? '#' : t(`review.result.table.${column}`)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {answers.map((answer, index) => (
                                <tr key={`${answer.englishWord}-${index}`}>
                                    <td className="mono t-micro border-b border-[var(--border)] py-2 pr-3">
                                        {index + 1}
                                    </td>
                                    <td className="t-body border-b border-[var(--border)] py-2 pr-3 font-bold">
                                        {answer.prompt}
                                    </td>
                                    <td className="t-body border-b border-[var(--border)] py-2 pr-3">
                                        {answer.givenAnswer}
                                    </td>
                                    <td className="t-body border-b border-[var(--border)] py-2 pr-3">
                                        {answer.correctAnswer}
                                    </td>
                                    <td className="border-b border-[var(--border)] py-2">
                                        <Chip tone={answer.isCorrect ? 'correct' : 'wrong'}>
                                            {answer.isCorrect
                                                ? t('review.result.table.correctTag')
                                                : t('review.result.table.incorrectTag')}
                                        </Chip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <ul className="mt-3 flex flex-col gap-2 lg:hidden">
                    {answers.map((answer, index) => (
                        <li key={`${answer.englishWord}-m-${index}`}>
                            <RowBox>
                                <span className="min-w-0 flex-1">
                                    <span className="t-body block font-bold break-words">{answer.prompt}</span>
                                    <span className="t-micro soft block break-words">
                                        {t('review.result.table.yourAnswer')}: {answer.givenAnswer}
                                    </span>
                                    {!answer.isCorrect ? (
                                        <span className="t-micro soft block break-words">
                                            {t('review.result.table.correctAnswer')}: {answer.correctAnswer}
                                        </span>
                                    ) : null}
                                </span>
                                <Chip tone={answer.isCorrect ? 'correct' : 'wrong'}>
                                    {answer.isCorrect
                                        ? t('review.result.table.correctTag')
                                        : t('review.result.table.incorrectTag')}
                                </Chip>
                            </RowBox>
                        </li>
                    ))}
                </ul>
            </Card>

            {error ? (
                <p role="status" className="t-micro text-[var(--attention)]">
                    {t('common.error.generic')}
                </p>
            ) : null}

            <div className="flex flex-col gap-2">
                {summary.wrong.length > 0 ? (
                    <Button
                        variant="primary"
                        size="lg"
                        block
                        onClick={() => navigate(`/review/session?${retrySearch(direction, summary.wrong)}`)}
                    >
                        <RotateCcw size={18} aria-hidden="true" />
                        {t('review.result.retryWrong', { count: summary.wrong.length })}
                    </Button>
                ) : null}
                <Button variant="secondary" size="lg" block onClick={() => navigate('/review')}>
                    {t('review.result.retryAll')}
                    <ArrowRight size={18} aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="lg" block onClick={() => navigate('/dictionary/review')}>
                    <BookMarked size={18} aria-hidden="true" />
                    {t('review.result.notebook')}
                </Button>
            </div>
        </div>
    );
}

/**
 * The retry link names the misses, which is the only way to review EXACTLY those words: every group
 * filter is coarser than a hand-picked list, so re-running the same window would re-serve words that
 * were already answered correctly. The endpoint's `words` parameter narrows the candidate set, and
 * `rangeMode=all` lets it look across all history for them.
 */
function retrySearch(direction, wrong) {
    const words = wrong.map((answer) => answer.normalizedWord || answer.englishWord).filter(Boolean);
    return sessionSearch(
        { rangeMode: 'all', group: 'all', limit: words.length, words },
        direction
    );
}
