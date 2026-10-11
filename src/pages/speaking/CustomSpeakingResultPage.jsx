import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, MessageSquare, Lock } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Markdown } from '../../components/ui/Markdown';
import { formatDateTime } from '../../lib/datetime';
import { useConversationDetail } from '../../features/speaking/useCustomConversation';

/**
 * A finished custom conversation — `/custom-speaking/:conversationId`.
 *
 * THE GRADING STATE IS FIRST, because `/finish` returns `status: GRADING`, not
 * `COMPLETED` (verified). Rendering `overallScore` immediately would show a null band as
 * if it were a result, so the screen polls and says it is waiting.
 *
 * WHEN GRADING IS OFF, THE SCREEN DOES NOT PRETEND OTHERWISE. `gradingEnabled` is a
 * per-conversation choice, and with it off `overallScore` and `aiFeedback` stay null by
 * design. That is a practice conversation, so the screen says so instead of showing an
 * empty score panel that looks like a failure.
 *
 * The full transcript is read from the conversation's `turns[]`, which is the only place
 * the exchange survives — the step responses do not carry it.
 */
export default function CustomSpeakingResultPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { conversationId } = useParams();

    const { conversation, loading, error, grading, reload } = useConversationDetail(conversationId);

    if (!conversationId) {
        return (
            <Card level="edge" padding="xl" className="text-center">
                <h2 className="t-h2">{t('customSpeaking.noConversationTitle')}</h2>
                <p className="t-body muted mt-2">{t('customSpeaking.noConversationBody')}</p>
                <ButtonLink to="/custom-speaking" variant="primary" className="mt-4">
                    {t('customSpeaking.start')}
                </ButtonLink>
            </Card>
        );
    }

    const full = conversation?.band ?? conversation?.overallScore;
    const turns = conversation?.turns ?? [];

    return (
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
            <Link to="/custom-speaking" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('customSpeaking.title')}
            </Link>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && !conversation}
                onRetry={reload}
                skeleton={<SkeletonCard lines={5} />}
                emptyTitle={t('customSpeaking.goneTitle')}
                emptyBody={t('customSpeaking.goneBody')}
                emptyAction={
                    <ButtonLink to="/custom-speaking" variant="primary" size="sm">
                        {t('customSpeaking.start')}
                    </ButtonLink>
                }
            >
                <div className="flex flex-col gap-4">
                    {/* --- grading in progress ------------------------------- */}
                    {grading ? (
                        <Card level="hero" padding="xl" className="flex flex-col items-center gap-4 text-center">
                            <Lexi mood="thinking" size="lg" label={t('customSpeaking.gradingLexi')} />
                            <h1 className="t-h2">{t('customSpeaking.gradingTitle')}</h1>
                            <p className="t-body soft">{t('customSpeaking.gradingBody')}</p>
                            <p className="t-micro muted inline-flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                {t('speaking.gradingWaitShort')}
                            </p>
                        </Card>
                    ) : null}

                    <Card level="hero" padding="xl" className="flex flex-col gap-4 md:flex-row md:items-center">
                        <Lexi mood="celebrate" size="md" />
                        <div className="min-w-0 flex-1">
                            <span className="t-micro muted">{t('customSpeaking.conversationTitle')}</span>
                            <h1 className="t-h2 mt-1">{conversation?.title ?? t('customSpeaking.title')}</h1>
                            <p className="t-micro muted mt-1">
                                {conversation?.topic}
                                {' · '}
                                {t('customSpeaking.turnsTaken', { count: conversation?.userTurnCount ?? 0 })}
                            </p>
                        </div>
                    </Card>

                    {/* --- the score, or an honest statement that there is none -- */}
                    {conversation?.gradingEnabled === false ? (
                        <Card level="flat" padding="lg">
                            <div className="flex items-start gap-3">
                                <Lock size={16} className="mt-0.5 shrink-0 text-[var(--ink-muted)]" aria-hidden="true" />
                                <p className="t-micro soft">{t('customSpeaking.notGradedNote')}</p>
                            </div>
                        </Card>
                    ) : !grading && full != null ? (
                        <>
                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                <Stat value={Number(full).toFixed(1)} label={t('customSpeaking.overall')} tone="teal" />
                                <Stat value={fmt(conversation?.fluencyScore)} label={t('speaking.criterion.fluency')} />
                                <Stat value={fmt(conversation?.vocabularyScore)} label={t('speaking.criterion.lexical')} />
                                <Stat value={fmt(conversation?.coherenceScore)} label={t('customSpeaking.coherence')} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                <Stat value={fmt(conversation?.pronunciationScore)} label={t('speaking.criterion.pronunciation')} />
                                <Stat
                                    value={conversation?.timeSpentSeconds ? Math.max(1, Math.round(conversation.timeSpentSeconds / 60)) : '—'}
                                    label={t('ielts.timeSpent')}
                                />
                                <Stat value={conversation?.totalTurns ?? 0} label={t('customSpeaking.totalTurns')} />
                                <Stat value={formatDateTime(conversation?.completedAt) ?? '—'} label={t('customSpeaking.finishedAt')} />
                            </div>

                            {conversation?.aiFeedback ? (
                                <Card level="edge" padding="xl">
                                    <h2 className="t-h3">{t('speaking.feedbackTitle')}</h2>
                                    <Markdown content={conversation.aiFeedback} className="mt-3" />
                                </Card>
                            ) : null}
                        </>
                    ) : null}

                    {/* --- the transcript ------------------------------------ */}
                    {turns.length > 0 ? (
                        <Card level="edge" padding="xl">
                            <h2 className="t-h3 flex items-center gap-2">
                                <MessageSquare size={18} aria-hidden="true" />
                                {t('customSpeaking.transcriptTitle')}
                            </h2>
                            <ul className="mt-3 flex flex-col gap-3">
                                {turns.map((turn, i) => (
                                    <li key={turn.id ?? i}>
                                        <RowBox className="flex-col items-stretch gap-2 py-3.5">
                                            <span className="t-micro muted">
                                                {t('customSpeaking.turnN', { number: turn.turnNumber ?? i + 1 })}
                                            </span>
                                            {/* Her line, then theirs — the order the conversation
                                                actually happened in. */}
                                            {turn.aiMessage ? (
                                                <span className="flex items-start gap-2">
                                                    <Lexi mood="idle" size="xs" />
                                                    <span className="t-body soft min-w-0 flex-1">
                                                        {turn.aiMessage}
                                                    </span>
                                                </span>
                                            ) : null}
                                            {turn.userTranscript ? (
                                                <span className="t-body">
                                                    <strong className="t-label">{t('aiChat.you')}:</strong>{' '}
                                                    {turn.userTranscript}
                                                </span>
                                            ) : null}
                                        </RowBox>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                        <ButtonLink to="/custom-speaking" variant="primary">
                            {t('customSpeaking.newConversation')}
                        </ButtonLink>
                        <ButtonLink to="/speaking" variant="ghost">
                            {t('speaking.title')}
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

    function fmt(value) {
        return value != null ? Number(value).toFixed(1) : '—';
    }
}
