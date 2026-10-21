import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Coins, Flag, Loader2, Mic, MicOff } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { Markdown } from '../../components/ui/Markdown';
import { cn } from '../../lib/cn';
import { useSpeechRecording } from '../../hooks/useSpeechRecording';
import { useCredit } from '../../contexts/CreditContextCore';
import { CREDIT_ACTIONS } from '../../features/credits/creditConstants';
import { getCreditCostDisplay } from '../../features/credits/creditPolicy';
import { useConversationSession } from '../../features/speaking/useCustomConversation';

const SUGGESTIONS = [
    'customSpeaking.suggestion1',
    'customSpeaking.suggestion2',
    'customSpeaking.suggestion3',
];

/**
 * Custom speaking conversation — `/custom-speaking/conversation/:conversationId` (screen 27c).
 *
 * THE CONVERSATION LIVES ON THE SERVER, and that is the whole reason this is a route. `GET
 * /custom-speaking-conversations/{id}` returns `turns[]`, and each row holds the partner's line
 * and the learner's transcript, so a reload — or "Tiếp tục" from history — rebuilds the log
 * instead of losing an exchange the server still has. The old page kept the chat in component
 * state on `/custom-speaking`, so a refresh discarded it.
 *
 * RESUMING CHARGES NOTHING. The conversation was charged once at start (`SPEAKING_START`);
 * submitting a turn is free. The line under the composer says exactly that, and the send control
 * never carries a price. The old screen priced every send as `AI_CHAT`, which is neither the
 * action nor the moment the backend uses.
 *
 * THE SCREEN IS EXACTLY ONE VIEWPORT TALL and the page never scrolls: the log is its own
 * scrollport and the composer is docked, so a long conversation cannot push the controls off
 * screen. It is outside the shell for the same reason 24b is — a rail and a tab bar would eat the
 * height the chat needs.
 *
 * A TURN IS A RECORDED ANSWER. The learner speaks, speech recognition returns the transcript, and
 * the composer shows that text for correction before sending, because the transcript is what the
 * grader reads. An empty transcript is refused rather than sent.
 */
export default function CustomSpeakingConversationPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { conversationId } = useParams();

    const credit = useCredit();
    const session = useConversationSession(conversationId);

    const {
        recording,
        transcript,
        setTranscript,
        timer,
        sttSupported,
        startRecording,
        stopRecording,
    } = useSpeechRecording();

    const [draft, setDraft] = useState('');
    const logRef = useRef(null);

    const costEntry = credit.getCost(CREDIT_ACTIONS.SPEAKING_START);
    const cost = getCreditCostDisplay(costEntry);
    const amount = Number(costEntry?.cost ?? 0);
    const balance = credit.availableBalance;
    const balanceKnown = balance !== null && balance !== undefined;

    const turnsLeft =
        session.maxUserTurns == null ? null : Math.max(0, session.maxUserTurns - session.userTurnCount);

    const rowCount = session.log.length;
    useEffect(() => {
        const scroller = logRef.current;
        if (!scroller) return undefined;
        const pin = () => {
            scroller.scrollTop = scroller.scrollHeight;
        };
        pin();
        /* One frame later as well: a row that has just mounted can still change height when its
           font swaps in, and a pin taken before that leaves the newest turn half cut off. */
        const frame = requestAnimationFrame(pin);
        return () => cancelAnimationFrame(frame);
    }, [rowCount, session.sending]);

    async function onSend(event) {
        event?.preventDefault?.();
        const content = (draft || transcript).trim();
        if (!content || session.sending) return;
        setDraft('');
        const data = await session.sendTurn({ transcript: content, timeSpentSeconds: timer });
        /* The last allowed answer completes the conversation server-side, so there is no next
           question to wait for — the result is where the flow goes. */
        if (data?.conversationComplete) {
            navigate(`/custom-speaking/${conversationId}`);
        }
    }

    async function onFinish() {
        try {
            await session.finish();
            navigate(`/custom-speaking/${conversationId}`);
        } catch {
            /* The error line below the composer reports it; nothing is lost by staying. */
        }
    }

    const attachLog = useCallback((node) => {
        logRef.current = node;
        if (node) node.scrollTop = node.scrollHeight;
    }, []);

    if (session.loading) {
        return (
            <div className="mx-auto flex h-dvh w-full max-w-[780px] flex-col justify-center p-4" aria-busy="true">
                <SkeletonCard lines={5} />
            </div>
        );
    }

    if (!session.conversation) {
        return (
            <div className="mx-auto flex h-dvh w-full max-w-[780px] items-center justify-center p-4">
                <Card level="edge" padding="xl" className="w-full text-center">
                    <h1 className="t-h2">{t('customSpeaking.goneTitle')}</h1>
                    <p className="t-body muted mt-2">{t('customSpeaking.goneBody')}</p>
                    <ButtonLink to="/custom-speaking" variant="primary" className="mt-4">
                        {t('customSpeaking.title')}
                    </ButtonLink>
                </Card>
            </div>
        );
    }

    /* Navigating from one conversation to another reuses this component; until the new detail
       arrives, the old one must not be drawn under the new id. */
    if (session.conversation.id !== conversationId) {
        return (
            <div className="mx-auto flex h-dvh w-full max-w-[780px] flex-col justify-center p-4" aria-busy="true">
                <SkeletonCard lines={5} />
            </div>
        );
    }

    /* A finished conversation has no chat left to draw; its result is the screen for it. */
    if (!session.inProgress) {
        return <Navigate to={`/custom-speaking/${conversationId}`} replace />;
    }

    return (
        <div className="mx-auto flex h-dvh w-full max-w-[780px] flex-col gap-3 p-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] sm:p-4">
            <div className="flex shrink-0 items-center gap-2 rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 shadow-[0_var(--edge)_0_0_var(--border)] sm:gap-3 sm:px-4 sm:py-3">
                <Link
                    to="/custom-speaking"
                    aria-label={t('common.back', 'Quay lại')}
                    className="inline-flex size-10 items-center justify-center rounded-[var(--r-control)] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)]"
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                </Link>
                <div className="min-w-0 flex-1">
                    <h1 className="t-label truncate text-[var(--ink)]">
                        {session.conversation.title || t('customSpeaking.title')}
                    </h1>
                    <p className="t-micro muted truncate">
                        {session.conversation.topic
                            ? `${t('customSpeaking.topicLabel')}: ${session.conversation.topic} · `
                            : ''}
                        {t('customSpeaking.turnN', { number: session.userTurnCount + 1 })}
                        {turnsLeft != null ? ` · ${t('customSpeaking.turnsLeft', { count: turnsLeft })}` : ''}
                    </p>
                </div>
                <Chip tone="teal" icon={Coins} className="hidden sm:inline-flex">
                    {balanceKnown ? t('aiChat.balance', { count: balance }) : '—'}
                </Chip>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onFinish}
                    disabled={session.finishing}
                    aria-label={t('customSpeaking.finish')}
                >
                    {session.finishing ? (
                        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                    ) : (
                        <Flag size={15} aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline">{t('customSpeaking.finish')}</span>
                </Button>
            </div>

            <div
                ref={attachLog}
                aria-live="polite"
                aria-label={t('aiChat.logLabel')}
                className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto p-1"
            >
                {session.log.map((entry, index) => {
                    const isUser = entry.role === 'user';
                    return (
                        <div
                            key={`${entry.role}-${index}`}
                            className={cn('flex items-end gap-2.5', isUser ? 'justify-end' : 'justify-start')}
                        >
                            {!isUser ? <Lexi mood="explain" size="xs" /> : null}
                            <div
                                className={cn(
                                    'bubble min-w-0 max-w-[min(84%,540px)]',
                                    isUser ? 'bubble--user bubble--right' : 'bubble--lexi bubble--left'
                                )}
                            >
                                <span className="sr-only">{isUser ? t('aiChat.you') : t('aiChat.lexi')}</span>
                                {isUser ? (
                                    <p className="whitespace-pre-line">{entry.text}</p>
                                ) : (
                                    <Markdown content={entry.text} />
                                )}
                            </div>
                        </div>
                    );
                })}

                {session.sending ? (
                    <div className="flex items-end gap-2.5">
                        <Lexi mood="thinking" size="xs" />
                        <div className="bubble bubble--lexi bubble--left min-w-0 max-w-[min(84%,540px)]">
                            <span className="t-micro muted mb-1.5 block">{t('customSpeaking.speakingNow')}</span>
                            <span aria-hidden="true" className="flex flex-col gap-2">
                                <span className="block h-3.5 w-32 animate-pulse rounded bg-[var(--surface-alt)]" />
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="flex shrink-0 flex-col gap-1.5">
                <span className="t-micro muted">{t('customSpeaking.suggestHeading', 'Gợi ý')}</span>
                <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {SUGGESTIONS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setDraft(t(key))}
                            className="inline-flex h-[30px] shrink-0 cursor-pointer items-center whitespace-nowrap rounded-[var(--r-chip)] border-2 border-[var(--border-strong)] bg-transparent px-3 text-[0.8125rem] font-bold tracking-[0.01em] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)]"
                        >
                            {t(key)}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={onSend} className="chat__input shrink-0">
                <button
                    type="button"
                    aria-label={recording ? t('customSpeaking.stopRecording') : t('customSpeaking.record')}
                    onClick={() => {
                        if (recording) {
                            stopRecording();
                            setDraft(transcript);
                        } else {
                            startRecording();
                        }
                    }}
                    className={cn(
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--r-control)] transition-colors',
                        recording
                            ? 'animate-pulse bg-[var(--wrong)] text-white'
                            : 'text-[var(--ink-soft)] hover:bg-[var(--surface-alt)]'
                    )}
                >
                    {recording ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
                </button>

                <label className="min-w-0 flex-1">
                    <span className="sr-only">{t('customSpeaking.replyLabel')}</span>
                    <input
                        className="chat__input-field"
                        value={draft || (recording ? transcript : '')}
                        onChange={(event) => {
                            setDraft(event.target.value);
                            if (recording) setTranscript(event.target.value);
                        }}
                        placeholder={t('customSpeaking.replyPlaceholder')}
                    />
                </label>

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!(draft || transcript).trim() || session.sending}
                >
                    {session.sending ? (
                        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    ) : (
                        <ArrowRight size={18} aria-hidden="true" />
                    )}
                    <span>{t('customSpeaking.send')}</span>
                </Button>
            </form>

            <p className="t-micro muted shrink-0 text-center">
                {cost
                    ? balanceKnown
                        ? t('customSpeaking.chargedAtStart', { amount, balance })
                        : t('customSpeaking.chargedAtStartShort', { amount })
                    : t('customSpeaking.freeConversation')}
            </p>

            {!sttSupported ? (
                <p className="t-micro muted shrink-0 text-center">{t('customSpeaking.sttNote')}</p>
            ) : null}

            {session.error ? (
                <p role="alert" className="t-micro shrink-0 text-center text-[var(--wrong)]">
                    {t('common.error.generic')}
                </p>
            ) : null}
        </div>
    );
}
