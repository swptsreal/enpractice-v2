import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2, MessageSquare, RefreshCw, Sparkles } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Chip, ProgressBar, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Markdown } from '../../components/ui/Markdown';
import {
    answeredTurnCount,
    conversationTimeSpent,
    findRepeatedWords,
    isConversationFailed,
    isConversationGraded,
    isConversationInProgress,
    normalizeWord,
    useSpeakingConversationDetail,
} from '../../features/speaking/useSpeakingConversation';

/**
 * Conversation result — `/speaking/conversation/result/:conversationId` (screen 24c).
 *
 * THE TRANSCRIPT IS A DIALOGUE and it is the substance of this screen: each turn pairs the
 * question with the learner's answer and carries that answer's own word count and rate. That is
 * the one structural difference from screen 26, where the transcript is a monologue.
 *
 * NO DELTA CHIP. The highest-scores endpoint returns one band per topic, so "trôi chảy hơn lần
 * trước" is not a claim this screen can support; it states the band, the turn count and the time.
 *
 * THE WAIT IS DESIGNED. Grading is asynchronous — verified live: the detail endpoint reports
 * `COMPLETED` right after the last answer and `GRADED` about ten seconds later — so the polling
 * state draws the band's placeholder instead of a band, and the criteria, feedback and transcript
 * are absent rather than empty. `IN_PROGRESS` is not a result at all and returns to 24b.
 *
 * `aiFeedback` IS MARKDOWN and is rendered through `Markdown`, which does not allow raw HTML: the
 * content is model output, and the live response uses headings and emphasis to separate the four
 * criteria.
 */
const CRITERIA = [
    { key: 'fluencyScore', labelKey: 'speaking.criterion.fluency' },
    { key: 'lexicalScore', labelKey: 'speaking.criterion.lexical' },
    { key: 'grammarScore', labelKey: 'speaking.criterion.grammar' },
    { key: 'pronunciationScore', labelKey: 'speaking.criterion.pronunciation' },
];

const MAX_BAND = 9;

/** '3 phút 12 giây' — the duration the learner actually spent answering. */
function durationLabel(t, seconds) {
    const total = Number(seconds) || 0;
    const minutes = Math.floor(total / 60);
    const rest = total % 60;
    return minutes > 0
        ? t('speaking.durationMinutesSeconds', { minutes, seconds: rest })
        : t('speaking.durationSeconds', { seconds: rest });
}

export default function SpeakingConversationResultPage() {
    const { t } = useTranslation();
    const { conversationId } = useParams();
    const { conversation, loading, error, grading, reload } = useSpeakingConversationDetail(conversationId);

    /* An unfinished conversation has no result to show, and 24b is where it can be finished. */
    if (isConversationInProgress(conversation?.status)) {
        return <Navigate to={`/speaking/conversation/resume/${conversationId}`} replace />;
    }

    const band = conversation?.overallBandScore;
    const turns = conversation?.turns ?? [];
    const answered = answeredTurnCount(turns);
    const timeSpent = conversation?.timeSpentSeconds ?? conversationTimeSpent(turns);
    const repeated = findRepeatedWords(turns.map((turn) => turn?.userTranscript).filter(Boolean));
    const graded = isConversationGraded(conversation?.status);

    return (
        <div className="flex flex-col gap-4">
            <Link to="/speaking" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('common.back')}
            </Link>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && !conversation}
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
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="t-h2 min-w-0 flex-1">{conversation?.topicQuestion}</h1>
                        <Chip
                            tone={grading ? 'amber' : graded ? 'teal' : 'wrong'}
                            icon={grading ? Loader2 : graded ? undefined : AlertTriangle}
                        >
                            {grading
                                ? t('speaking.statusGrading')
                                : graded
                                  ? t('speaking.card.graded')
                                  : t('speaking.statusFailed')}
                        </Chip>
                    </div>

                    {grading ? (
                        <Card level="hero" padding="xl" className="flex flex-col items-center gap-4 text-center">
                            <Lexi mood="thinking" size="lg" />
                            <h2 className="t-h2">{t('speaking.conversationResultGradingTitle')}</h2>
                            <p className="t-body soft">{t('speaking.conversationResultGradingBody')}</p>
                            <span className="t-micro muted inline-flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                {t('speaking.gradingWaitShort')}
                            </span>
                            <SkeletonCard lines={3} className="w-full max-w-[420px] text-left" />
                        </Card>
                    ) : null}

                    {isConversationFailed(conversation?.status) ? (
                        <Card level="edge" padding="xl">
                            <div className="flex gap-3">
                                <span aria-hidden="true" className="text-[var(--wrong)]">
                                    <AlertTriangle size={22} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <strong className="t-label block">
                                        {t('speaking.conversationResultFailedTitle')}
                                    </strong>
                                    <p className="t-micro muted mt-1">{t('speaking.gradingFailedBody')}</p>
                                    <ButtonLink
                                        to={`/speaking/conversation/${conversation?.topicId}`}
                                        variant="primary"
                                        size="sm"
                                        className="mt-2"
                                    >
                                        {t('speaking.conversationResultRestart')}
                                    </ButtonLink>
                                </div>
                            </div>
                        </Card>
                    ) : null}

                    {graded ? (
                        <>
                            <Card
                                level="hero"
                                padding="xl"
                                className="flex flex-col items-center gap-5 md:flex-row md:text-left"
                            >
                                <Lexi mood={(band ?? 0) >= 6.5 ? 'celebrate' : 'explain'} size="lg" />
                                <div className="min-w-0 flex-1">
                                    <span className="t-micro muted">
                                        {t('speaking.conversationResultBandLabel')}
                                    </span>
                                    <div className="flex flex-wrap items-baseline justify-center gap-3 md:justify-start">
                                        <span className="font-mono text-5xl font-bold tabular-nums text-[var(--teal)]">
                                            {band != null ? Number(band).toFixed(1) : '—'}
                                        </span>
                                        <Chip tone="teal">
                                            {t('speaking.conversationResultTurns', {
                                                turns: answered,
                                                time: durationLabel(t, timeSpent),
                                            })}
                                        </Chip>
                                    </div>
                                    <p className="t-body soft mt-2">{t('speaking.bandEstimateNote')}</p>
                                </div>
                            </Card>

                            {/* --- four criteria, the same four as screen 26 ---------------- */}
                            <Card level="edge" padding="xl">
                                <h2 className="t-h3">{t('speaking.criteriaScores')}</h2>
                                <ul className="mt-3.5 grid gap-3 sm:grid-cols-2">
                                    {CRITERIA.map(({ key, labelKey }) => {
                                        const value = conversation?.[key];
                                        const pct = value != null ? Math.round((Number(value) / MAX_BAND) * 100) : 0;
                                        return (
                                            <li key={key} className="flex flex-col gap-1.5">
                                                <span className="flex items-baseline justify-between gap-2">
                                                    <span className="t-label">{t(labelKey)}</span>
                                                    <span className="t-mono tabular-nums text-[var(--teal)]">
                                                        {value != null ? Number(value).toFixed(1) : '—'}
                                                    </span>
                                                </span>
                                                <ProgressBar value={pct} label={t(labelKey)} thin />
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Card>

                            <Card level="edge" padding="xl">
                                <h2 className="t-h3 flex items-center gap-2">
                                    <Sparkles size={18} aria-hidden="true" />
                                    {t('speaking.feedbackTitle')}
                                </h2>
                                {conversation?.aiFeedback ? (
                                    <Markdown content={conversation.aiFeedback} className="mt-3" />
                                ) : (
                                    <p className="t-body muted mt-3">{t('speaking.noFeedback')}</p>
                                )}
                            </Card>

                            {/* --- the dialogue, which is the substance of this screen ------- */}
                            <Card level="edge" padding="xl">
                                <h2 className="t-h3 flex items-center gap-2">
                                    <MessageSquare size={18} aria-hidden="true" />
                                    {t('speaking.transcriptTitle')}
                                </h2>
                                <p className="t-micro muted mt-1">{t('speaking.transcriptCaveat')}</p>

                                {answered === 0 ? (
                                    <p className="t-body muted mt-3">
                                        {t('speaking.conversationResultNoTranscript')}
                                    </p>
                                ) : (
                                    <ol className="mt-3 flex flex-col gap-3">
                                        {turns.map((turn, index) => (
                                            <li
                                                key={turn.id ?? index}
                                                className="rounded-[var(--r-control)] bg-[var(--surface-alt)] p-3.5"
                                            >
                                                <span className="t-micro muted">
                                                    {t('speaking.conversationResultTurnLabel', {
                                                        index: index + 1,
                                                    })}
                                                </span>
                                                <p className="t-body mt-1">{turn.aiQuestion}</p>

                                                {(turn.userTranscript ?? '').trim() ? (
                                                    <>
                                                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                                                            <span className="t-micro muted">
                                                                {t('speaking.conversationResultAnswerLabel')}
                                                            </span>
                                                            <span className="flex flex-wrap gap-2">
                                                                {turn.speechAnalytics?.wordCount != null ? (
                                                                    <Chip tone="outline">
                                                                        {t('speaking.wordCount', {
                                                                            count: turn.speechAnalytics.wordCount,
                                                                        })}
                                                                    </Chip>
                                                                ) : null}
                                                                {turn.speechAnalytics?.wordsPerMinute != null ? (
                                                                    <Chip tone="outline">
                                                                        {t('speaking.conversationWpmChip', {
                                                                            count: Math.round(
                                                                                turn.speechAnalytics.wordsPerMinute
                                                                            ),
                                                                        })}
                                                                    </Chip>
                                                                ) : null}
                                                            </span>
                                                        </div>
                                                        <p className="t-body mt-1">
                                                            {String(turn.userTranscript)
                                                                .split(/(\s+)/)
                                                                .map((token, tokenIndex) =>
                                                                    repeated.has(normalizeWord(token)) ? (
                                                                        <mark
                                                                            key={tokenIndex}
                                                                            title={t(
                                                                                'speaking.conversationResultRepeatedWord'
                                                                            )}
                                                                            className="rounded-[3px] bg-[var(--amber-soft)] px-0.5"
                                                                        >
                                                                            {token}
                                                                        </mark>
                                                                    ) : (
                                                                        <span key={tokenIndex}>{token}</span>
                                                                    )
                                                                )}
                                                        </p>
                                                    </>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </Card>

                            <Card level="flat" padding="lg">
                                <div className="flex flex-wrap items-center gap-3">
                                    <p className="t-micro soft flex-1">{t('speaking.practiceAgainHint')}</p>
                                    <ButtonLink
                                        to={`/speaking/conversation/${conversation?.topicId}`}
                                        variant="primary"
                                        size="sm"
                                    >
                                        <RefreshCw size={15} aria-hidden="true" />
                                        {t('speaking.conversationResultRestart')}
                                    </ButtonLink>
                                </div>
                            </Card>
                        </>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                        <ButtonLink to="/speaking" variant="ghost">
                            {t('speaking.conversationResultAllTopics')}
                        </ButtonLink>
                    </div>
                </div>
            </AsyncBoundary>
        </div>
    );
}
