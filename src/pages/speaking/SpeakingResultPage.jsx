import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, AlertTriangle, Gauge, MessageSquare } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Markdown } from '../../components/ui/Markdown';
import { useSpeakingAttempt, isGraded, isGradingFailed, NATURAL_WPM_RANGE } from '../../features/speaking/useSpeaking';

/**
 * Speaking result — `/speaking/result/:attemptId` (screen 26).
 *
 * THE VOICE ANALYTICS ARE MEASUREMENTS WITH CONTEXT, NOT GRADES. The design is explicit
 * and it is the honesty rule for this screen: speech rate is shown WITH the natural
 * range it falls in ("142 từ/phút — trong khoảng tự nhiên 120–160"), silence and filler
 * counts are reported as counts, and none of them is dressed up as a score. A learner
 * who speaks at 100 wpm is not "wrong" — they are slower than typical, which is a fact
 * about pace, not a mark.
 *
 * A METRIC WITH NO VALUE IS OMITTED, NOT ZEROED. Verified live: `speechAnalytics` is
 * partly CLIENT-SUPPLIED, and the browser can honestly measure only word count and rate
 * from the transcript. `avgPauseDurationMs`, `longPauseCount` and the confidence fields
 * come back null when the client did not send them, and this screen skips those tiles
 * rather than showing "0" — which would read as a flawless performance.
 *
 * THE TRANSCRIPT CARRIES A CAVEAT. Speech recognition errs, and the design requires
 * saying so. The transcript is shown as the text the AI graded, which is the only
 * honest presentation: it is the input, so the user can see what was actually assessed.
 *
 * Grading is asynchronous with the same SUBMITTED/GRADING/GRADED/FAILED states as
 * Writing, so the waiting state is designed rather than a spinner.
 */
const CRITERIA = [
    { key: 'fluencyScore', labelKey: 'speaking.criterion.fluency' },
    { key: 'lexicalScore', labelKey: 'speaking.criterion.lexical' },
    { key: 'grammarScore', labelKey: 'speaking.criterion.grammar' },
    { key: 'pronunciationScore', labelKey: 'speaking.criterion.pronunciation' },
];

const MAX_BAND = 9;

export default function SpeakingResultPage() {
    const { t } = useTranslation();
    const { attemptId } = useParams();

    const { attempt, loading, error, grading, reload } = useSpeakingAttempt(attemptId);

    if (!attemptId) {
        return (
            <Card level="edge" padding="xl" className="text-center">
                <h2 className="t-h2">{t('speaking.noAttemptTitle')}</h2>
                <p className="t-body muted mt-2">{t('speaking.noAttemptBody')}</p>
                <ButtonLink to="/speaking" variant="primary" className="mt-4">
                    {t('speaking.title')}
                </ButtonLink>
            </Card>
        );
    }

    const band = attempt?.overallBandScore;
    const analytics = attempt?.speechAnalytics ?? null;

    /* Only metrics that actually have a value are rendered. */
    const hasNumber = (value) => value !== null && value !== undefined && value !== '';
    const wpm = analytics?.wordsPerMinute;
    const inNaturalRange = hasNumber(wpm) && wpm >= NATURAL_WPM_RANGE[0] && wpm <= NATURAL_WPM_RANGE[1];

    return (
        <div className="flex flex-col gap-4">
            <Link to="/speaking" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('common.back')}
            </Link>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && !attempt}
                onRetry={reload}
                skeleton={<SkeletonCard lines={5} />}
                emptyTitle={t('speaking.attemptGoneTitle')}
                emptyBody={t('speaking.attemptGoneBody')}
                emptyAction={
                    <ButtonLink to="/speaking" variant="primary" size="sm">
                        {t('speaking.title')}
                    </ButtonLink>
                }
            >
                <div className="flex flex-col gap-4">
                    {grading ? (
                        <Card level="hero" padding="xl" className="flex flex-col items-center gap-4 text-center">
                            <Lexi mood="thinking" size="lg" label={t('speaking.gradingLexi')} />
                            <h1 className="t-h2">{t('speaking.gradingTitle')}</h1>
                            <p className="t-body soft">{t('speaking.gradingBody')}</p>
                            <p className="t-micro muted inline-flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                {t('speaking.gradingWaitShort')}
                            </p>
                        </Card>
                    ) : null}

                    {isGradingFailed(attempt?.status) ? (
                        <Card level="edge" padding="xl">
                            <div className="flex gap-3">
                                <span aria-hidden="true" className="text-[var(--wrong)]">
                                    <AlertTriangle size={22} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <strong className="t-label block">{t('speaking.gradingFailedTitle')}</strong>
                                    <p className="t-micro muted mt-1">{t('speaking.gradingFailedBody')}</p>
                                    <ButtonLink
                                        to={`/speaking/practice/${attempt.topicId}`}
                                        variant="primary"
                                        size="sm"
                                        className="mt-2"
                                    >
                                        {t('speaking.tryAgain')}
                                    </ButtonLink>
                                </div>
                            </div>
                        </Card>
                    ) : null}

                    {isGraded(attempt?.status) ? (
                        <>
                            <Card level="hero" padding="xl" className="flex flex-col items-center gap-5 md:flex-row md:text-left">
                                <Lexi
                                    mood={(band ?? 0) >= 6.5 ? 'celebrate' : 'explain'}
                                    size="lg"
                                    label={t('speaking.lexiResult')}
                                />
                                <div className="min-w-0 flex-1">
                                    <span className="t-micro muted">{attempt.topicQuestion}</span>
                                    <div className="flex flex-wrap items-baseline justify-center gap-3 md:justify-start">
                                        <span className="font-mono text-5xl font-bold tabular-nums text-[var(--teal)]">
                                            {band != null ? Number(band).toFixed(1) : '—'}
                                        </span>
                                        <Chip tone="neutral">{t(`speaking.part.${attempt.topicPart}`)}</Chip>
                                    </div>
                                    <p className="t-body soft mt-2">{t('speaking.bandEstimateNote')}</p>
                                </div>
                            </Card>

                            {/* --- four criteria --------------------------------- */}
                            <Card level="edge" padding="xl">
                                <h2 className="t-h3">{t('speaking.criteriaScores')}</h2>
                                <ul className="mt-3.5 grid gap-3 sm:grid-cols-2">
                                    {CRITERIA.map(({ key, labelKey }) => {
                                        const value = attempt[key];
                                        const pct = value != null ? Math.round((Number(value) / MAX_BAND) * 100) : 0;
                                        return (
                                            <li key={key} className="flex flex-col gap-1.5">
                                                <span className="flex items-baseline justify-between gap-2">
                                                    <span className="t-label">{t(labelKey)}</span>
                                                    <span className="t-mono tabular-nums text-[var(--teal)]">
                                                        {value != null ? Number(value).toFixed(1) : '—'}
                                                    </span>
                                                </span>
                                                <span
                                                    role="progressbar"
                                                    aria-valuemin={0}
                                                    aria-valuemax={MAX_BAND}
                                                    aria-valuenow={value ?? 0}
                                                    aria-label={t('writing.criterionAria', {
                                                        criterion: t(labelKey),
                                                        value: value ?? 0,
                                                    })}
                                                    className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-alt)]"
                                                >
                                                    <span
                                                        className="block h-full rounded-full bg-[var(--teal)]"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Card>

                            {/* --- voice measurements, WITH context -------------- */}
                            {(hasNumber(wpm) || hasNumber(analytics?.fillerWordCount)) && (
                                <Card level="edge" padding="xl">
                                    <h2 className="t-h3 flex items-center gap-2">
                                        <Gauge size={18} aria-hidden="true" />
                                        {t('speaking.analyticsTitle')}
                                    </h2>
                                    <p className="t-micro muted mt-1">{t('speaking.analyticsNote')}</p>

                                    <div className="mt-3.5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                        {hasNumber(wpm) ? (
                                            <Stat
                                                value={`${Math.round(wpm)}`}
                                                label={t('speaking.wpm')}
                                                tone={inNaturalRange ? 'teal' : 'amber'}
                                            />
                                        ) : null}
                                        {hasNumber(analytics?.wordCount) ? (
                                            <Stat value={analytics.wordCount} label={t('speaking.analyticsWords')} />
                                        ) : null}
                                        {hasNumber(analytics?.fillerWordCount) ? (
                                            <Stat
                                                value={analytics.fillerWordCount}
                                                label={t('speaking.fillers')}
                                                tone={analytics.fillerWordCount > 3 ? 'amber' : undefined}
                                            />
                                        ) : null}
                                        {hasNumber(analytics?.pauseCount) ? (
                                            <Stat value={analytics.pauseCount} label={t('speaking.pauses')} />
                                        ) : null}
                                    </div>

                                    {/* The CONTEXT line is the point of this section: a rate
                                        is only meaningful against what is typical. */}
                                    {hasNumber(wpm) ? (
                                        <p className="t-micro muted mt-3">
                                            {inNaturalRange
                                                ? t('speaking.wpmInRange', {
                                                      value: Math.round(wpm),
                                                      min: NATURAL_WPM_RANGE[0],
                                                      max: NATURAL_WPM_RANGE[1],
                                                  })
                                                : wpm < NATURAL_WPM_RANGE[0]
                                                  ? t('speaking.wpmBelowRange', {
                                                        value: Math.round(wpm),
                                                        min: NATURAL_WPM_RANGE[0],
                                                        max: NATURAL_WPM_RANGE[1],
                                                    })
                                                  : t('speaking.wpmAboveRange', {
                                                        value: Math.round(wpm),
                                                        min: NATURAL_WPM_RANGE[0],
                                                        max: NATURAL_WPM_RANGE[1],
                                                    })}
                                        </p>
                                    ) : null}

                                    {(analytics?.fillerWords ?? []).length > 0 ? (
                                        <p className="t-micro muted mt-2 flex flex-wrap items-center gap-1.5">
                                            {t('speaking.fillersUsed')}
                                            {analytics.fillerWords.map((word) => (
                                                <Chip key={word} tone="amber">
                                                    {word}
                                                </Chip>
                                            ))}
                                        </p>
                                    ) : null}
                                </Card>
                            )}

                            {/* --- transcript + feedback, two columns ------------ */}
                            <div className="grid gap-4 lg:grid-cols-2">
                                <Card level="edge" padding="xl">
                                    <h2 className="t-h3 flex items-center gap-2">
                                        <MessageSquare size={18} aria-hidden="true" />
                                        {t('speaking.transcriptTitle')}
                                    </h2>
                                    <p className="t-micro muted mt-1">{t('speaking.transcriptCaveat')}</p>
                                    <p className="prose-reading mt-3 whitespace-pre-line">
                                        {attempt.transcript || t('speaking.noTranscript')}
                                    </p>
                                </Card>

                                <Card level="edge" padding="xl">
                                    <h2 className="t-h3">{t('speaking.feedbackTitle')}</h2>
                                    {attempt.aiFeedback ? (
                                        <Markdown content={attempt.aiFeedback} className="mt-3" />
                                    ) : (
                                        <p className="t-body muted mt-3">{t('speaking.noFeedback')}</p>
                                    )}
                                </Card>
                            </div>

                            <Card level="flat" padding="lg">
                                <div className="flex flex-wrap items-center gap-3">
                                    <p className="t-micro soft flex-1">{t('speaking.practiceAgainHint')}</p>
                                    <ButtonLink
                                        to={`/speaking/practice/${attempt.topicId}`}
                                        variant="primary"
                                        size="sm"
                                    >
                                        <RefreshCw size={15} aria-hidden="true" />
                                        {t('speaking.practiceAgain')}
                                    </ButtonLink>
                                </div>
                            </Card>
                        </>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                        <ButtonLink to="/speaking" variant="ghost">
                            {t('speaking.allTopics')}
                        </ButtonLink>
                        <Button variant="ghost" onClick={reload}>
                            <RefreshCw size={15} aria-hidden="true" />
                            {t('common.retry')}
                        </Button>
                    </div>
                </div>
            </AsyncBoundary>
        </div>
    );
}
