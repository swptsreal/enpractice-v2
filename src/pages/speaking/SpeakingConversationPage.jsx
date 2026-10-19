import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowLeft, Check, Coins, Headphones, Loader2, Mic, RotateCcw, Send } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip, SkeletonCard, inputClass } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Waveform } from '../../components/speaking/RecordingControl';
import { useSpeechRecording } from '../../hooks/useSpeechRecording';
import { useCredit } from '../../contexts/CreditContextCore';
import useCreditAction from '../../hooks/useCreditAction';
import { cn } from '../../lib/cn';
import { speakWithVoice, stopSpeaking } from '../../utils/ttsHelper';
import { CREDIT_ACTIONS } from '../../features/credits/creditConstants';
import { getCreditCostDisplay } from '../../features/credits/creditPolicy';
import { useSpeakingTopic } from '../../features/speaking/useSpeaking';
import {
    conversationLog,
    isConversationInProgress,
    totalExpectedQuestions,
    useSpeakingConversationDetail,
    useSpeakingConversationFlow,
} from '../../features/speaking/useSpeakingConversation';

/**
 * Speaking conversation — `/speaking/conversation/:topicId` (screen 24b) and its resume route
 * `/speaking/conversation/resume/:conversationId`.
 *
 * REST, NOT STOMP, and the screen says so by NOT drawing a connection chip. v1 ran this flow over
 * a socket and could honestly report its state; v2 uses the same request/response pair as
 * `/custom-speaking`, so there is no socket to report on. Progress is the question counter, and
 * the in-flight state is a waiting bubble in the log with the send control disabled.
 *
 * THE COST IS TAKEN BY THE ACTION THAT SPENDS IT. `POST /speaking/conversations/start` charges
 * once per topic (idempotent server-side), so the start runs through `useCreditAction`, which
 * pre-checks the balance and shows the access-issue sheet instead of a request that was always
 * going to fail. The RESUME path never re-charges, because the charge already happened — and the
 * line under the panel says which of the two situations the learner is in.
 *
 * A TURN IS ONE REQUEST. Verified live: the turn response carries the NEXT question, and the last
 * answer returns `conversationComplete: true` with a null question. So this screen does not poll —
 * the completion state hands over to 24c, which owns the grading wait.
 *
 * THE QUESTION IS SPOKEN, NOT ONLY PRINTED. A conversation is a listening task as much as a
 * speaking one, and v1 read every question aloud (it took the audio off the socket payload). v2
 * asks the TTS endpoint for the same sentence: on the first question, on each reply, and for the
 * pending question when a conversation is resumed. The request is made per play, so the replay
 * control is a real replay rather than a cached clip, and it reads "Đang phát…" while the audio
 * runs — which is the reason for its disabled state. Playback failure is non-fatal: the question
 * is on screen in full, and the control is the fallback. Starting a recording STOPS any audio
 * first, because a voice from the speakers is a voice the microphone hears.
 *
 * THE TRANSCRIPT IS EDITABLE BEFORE IT IS SENT. Speech recognition errs, and the transcript is
 * what the grader reads, so the panel shows the text for correction and refuses an empty one with
 * a warning instead of spending a turn on nothing.
 *
 * `lastTurn` IS DERIVED, NOT TRUSTED. The start response reports it, but the DETAIL endpoint does
 * not carry the field at all, so a resumed conversation would always look like a middle question.
 * The question count and the topic's own follow-up count give the same answer on both paths, which
 * is why the button says "Trả lời câu cuối" after a reload too.
 */
export default function SpeakingConversationPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { topicId: routeTopicId, conversationId: routeConversationId } = useParams();
    const isResume = Boolean(routeConversationId);

    const credit = useCredit();
    const speakingCredit = useCreditAction(CREDIT_ACTIONS.SPEAKING_START);
    const flow = useSpeakingConversationFlow();

    /** The resume route knows only the conversation id, so the topic is read from it. */
    const resume = useSpeakingConversationDetail(isResume ? routeConversationId : null, { poll: false });
    const topicId = isResume ? resume.conversation?.topicId : routeTopicId;
    const { topic, loading, error, reload } = useSpeakingTopic(topicId);

    const [phase, setPhase] = useState('idle'); // idle | recording | review
    const [localError, setLocalError] = useState(null);
    const [playing, setPlaying] = useState(false);
    const startedRef = useRef(false);
    /* Which question has already been read aloud, so a re-render (or StrictMode's second
       effect pass) cannot make the partner repeat itself. */
    const spokenRef = useRef(null);
    const logRef = useRef(null);
    const endRef = useRef(null);

    const { recording, transcript, setTranscript, timer, startRecording, stopRecording, cancelRecording } =
        useSpeechRecording({ onError: () => setLocalError(new Error('speech')) });

    const costEntry = credit.getCost(CREDIT_ACTIONS.SPEAKING_START);
    const cost = getCreditCostDisplay(costEntry);
    const balance = credit.availableBalance;
    const balanceKnown = balance !== null && balance !== undefined;

    const { start, sendTurn, hydrate } = flow;

    /* --- resume: seed the log, or leave for the result when the work is already done ------ */
    useEffect(() => {
        const detail = resume.conversation;
        if (!detail) return;
        if (!isConversationInProgress(detail.status)) {
            navigate(`/speaking/conversation/result/${detail.id}`, { replace: true });
            return;
        }
        hydrate(detail);
    }, [resume.conversation, hydrate, navigate]);

    /* --- fresh: start once, and only once, after the topic has loaded --------------------- */
    useEffect(() => {
        if (isResume || !topic?.id || startedRef.current) return undefined;
        startedRef.current = true;

        speakingCredit
            .execute(() => start(topic.id))
            .then(({ blocked }) => {
                if (blocked) navigate('/speaking', { replace: true });
            })
            .catch(() => setLocalError(new Error('start')));
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isResume, topic?.id]);

    /* --- completion hands over to the result screen --------------------------------------- */
    useEffect(() => {
        if (!flow.complete || !flow.conversationId) return undefined;
        const id = setTimeout(
            () => navigate(`/speaking/conversation/result/${flow.conversationId}`, { replace: true }),
            2000
        );
        return () => clearTimeout(id);
    }, [flow.complete, flow.conversationId, navigate]);

    const log = useMemo(() => conversationLog(flow.turns), [flow.turns]);
    const lastRow = log.length ? log[log.length - 1] : null;
    /* The question awaiting an answer is the LAST row when it is an AI row — a turn appends the
       learner's line after it, so this is also how "which question am I on" is read. */
    const pendingQuestion = lastRow?.role === 'ai' ? lastRow : null;
    const lastAiText = useMemo(() => [...log].reverse().find((row) => row.role === 'ai')?.text ?? '', [log]);
    const total = totalExpectedQuestions(topic);
    const current = Math.max(1, flow.questionIndex);
    const isLastQuestion = flow.lastTurn || (total > 0 && current >= total);
    const questionLabel = t('speaking.conversationTurnCounter', { current, total: Math.max(1, total) });

    /** Read a line out loud. The endpoint request is made per play, so a replay is a real replay. */
    async function play(text) {
        if (!text) return;
        setPlaying(true);
        try {
            await speakWithVoice(text);
        } catch {
            /* A blocked autoplay or a failed TTS call is not a screen failure: the question is on
               screen in full and the replay control is the way to hear it. */
        } finally {
            setPlaying(false);
        }
    }

    /* THE QUESTION IS SPOKEN, NOT ONLY PRINTED. This screen is a listening task as much as a
       speaking one, so a new question is read aloud as soon as it appears — the first one when the
       conversation starts, the next one (or a hint) when a turn comes back, and the pending one
       when a conversation is resumed. Keyed on the turn, not the text, so a repeated question is
       still read, while StrictMode's second effect pass and every re-render are silent. */
    useEffect(() => {
        if (!pendingQuestion?.text) return undefined;
        if (spokenRef.current === pendingQuestion.key) return undefined;
        spokenRef.current = pendingQuestion.key;
        play(pendingQuestion.text);
        return undefined;
    }, [pendingQuestion?.key, pendingQuestion?.text]);

    /* Leaving the screen mid-sentence must not leave a voice talking to an empty room. */
    useEffect(() => () => stopSpeaking(), []);

    /* A CALLBACK REF, NOT A PLAIN ONE. The log only exists after the topic has loaded (before
       that the screen draws a skeleton), and a plain ref plus a dependency array cannot tell "the
       scrollport just appeared" from "nothing changed" — which is exactly how the first version
       left the newest turn below the fold on a resumed conversation. The callback fires when the
       node mounts, which is the moment it has to be pinned. */
    const attachLog = useCallback((node) => {
        logRef.current = node;
        if (node) node.scrollTop = node.scrollHeight;
    }, []);

    /* A CHAT FOLLOWS ITS NEWEST MESSAGE. The log is its own scrollport, so this scrolls the log
       and never the page — the answer panel stays exactly where it is. */
    const rowCount = log.length;
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
    }, [rowCount, flow.sending, phase]);

    function onReplay() {
        play(lastAiText);
    }

    function onStartRecording() {
        /* The partner is silenced BEFORE the microphone opens: a voice coming out of the speakers
           is a voice the microphone hears, and the learner's transcript would come back with the
           question inside it. */
        stopSpeaking();
        setLocalError(null);
        startRecording();
        setPhase('recording');
    }

    function onStopRecording() {
        stopRecording();
        setPhase('review');
    }

    function onRestart() {
        cancelRecording();
        setPhase('idle');
        setLocalError(null);
    }

    async function onSubmit() {
        const answer = transcript.trim();
        if (!answer) {
            setLocalError(new Error('empty'));
            return;
        }
        setLocalError(null);
        const sent = await sendTurn({ transcript: answer, timeSpentSeconds: timer });
        if (sent) {
            cancelRecording();
            setPhase('idle');
        }
    }

    if (!topicId) {
        /* Resume: the conversation is still being read, and its topic id comes with it. A guarded
           return rather than a fetch with an undefined id, which would 404 and render as a
           broken topic. */
        return (
            <div className="mx-auto w-full max-w-[760px] p-4">
                <SkeletonCard lines={6} />
            </div>
        );
    }

    const errorMessage =
        localError?.message === 'empty'
            ? t('speaking.conversation.emptyTranscript')
            : localError?.message === 'start'
              ? t('speaking.conversationStartError')
              : localError?.message === 'speech'
                ? t('speaking.sttUnsupported')
                : t('speaking.conversation.nextTurnError');

    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-[var(--canvas)]">
            <header className="flex items-center gap-3 border-b-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
                <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={t('common.back')}
                    onClick={() => navigate('/speaking')}
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                </Button>
                <div className="min-w-0 flex-1">
                    <h1 className="t-label block truncate">{topic?.question ?? t('speaking.title')}</h1>
                    <span className="t-micro muted">
                        {topic ? `${t(`speaking.part.${topic.part}`)} · ` : ''}
                        {questionLabel}
                        {isLastQuestion ? ` · ${t('speaking.conversationLastTurn')}` : ''}
                    </span>
                </div>
                {balanceKnown ? (
                    <Chip tone="outline" icon={Coins} className="hidden lg:inline-flex">
                        {t('aiChat.balance', { count: balance })}
                    </Chip>
                ) : null}
            </header>

            <div className="mx-auto flex min-h-0 w-full max-w-[760px] flex-1 flex-col">
                <AsyncBoundary
                    loading={loading || (isResume && resume.loading)}
                    error={error ?? resume.error}
                    isEmpty={!loading && !error && !topic}
                    onRetry={reload}
                    skeleton={
                        <div className="p-4">
                            <SkeletonCard lines={6} />
                        </div>
                    }
                    emptyTitle={t('speaking.topicMissingTitle')}
                    emptyBody={t('speaking.topicMissingBody')}
                >
                    {flow.complete ? (
                        <div className="flex flex-1 items-center justify-center p-4">
                            <Card
                                level="hero"
                                padding="xl"
                                className="flex w-full flex-col items-center gap-4 text-center"
                            >
                                <Lexi mood="celebrate" size="lg" />
                                <p role="status" className="t-body soft">
                                    {t('speaking.conversation.completeMessage')}
                                </p>
                                <span className="t-micro muted inline-flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                    {t('speaking.gradingWaitShort')}
                                </span>
                            </Card>
                        </div>
                    ) : (
                        /* THE CHAT SHAPE: the log takes every pixel left over and scrolls INSIDE
                           itself, and the answer panel is docked under it. The page never scrolls,
                           so a long conversation cannot push the controls out of reach, and the log
                           follows the newest turn. The panel carries its own ceiling (70dvh) and
                           scrolls if it ever grows past the space left — on a very short viewport
                           with a long transcript, being clipped would hide the send control, which
                           is the one thing on this screen that must stay reachable. */
                        <div className="flex min-h-0 flex-1 flex-col">
                            <div
                                ref={attachLog}
                                aria-live="polite"
                                className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto p-4"
                            >
                                {log.map((row) => (
                                    <div
                                        key={row.key}
                                        className={cn(
                                            'flex items-end gap-2.5',
                                            row.role === 'me' && 'justify-end'
                                        )}
                                    >
                                        {row.role === 'ai' ? (
                                            <Lexi mood={row.hint ? 'explain' : 'idle'} size="xs" />
                                        ) : null}
                                        <div
                                            className={cn(
                                                'max-w-[min(78%,520px)] rounded-[var(--r-card)] border-2 px-4 py-3',
                                                row.role === 'me'
                                                    ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                                                    : row.hint
                                                      ? 'border-[var(--attention)] bg-[var(--amber-soft)]'
                                                      : 'border-[var(--border-strong)] bg-[var(--surface)]'
                                            )}
                                        >
                                            {row.hint ? (
                                                <span className="t-label block text-[var(--attention)]">
                                                    {t('speaking.conversation.hint')}
                                                </span>
                                            ) : null}
                                            <p className="t-body">{row.text}</p>
                                            {row.analytics ? (
                                                <span className="mt-2 flex flex-wrap gap-2">
                                                    {row.analytics.wordCount != null ? (
                                                        <Chip tone="outline">
                                                            {t('speaking.wordCount', {
                                                                count: row.analytics.wordCount,
                                                            })}
                                                        </Chip>
                                                    ) : null}
                                                    {row.analytics.wordsPerMinute != null ? (
                                                        <Chip tone="outline">
                                                            {t('speaking.conversationWpmChip', {
                                                                count: Math.round(row.analytics.wordsPerMinute),
                                                            })}
                                                        </Chip>
                                                    ) : null}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}

                                {flow.sending ? (
                                    <div className="flex items-end gap-2.5">
                                        <Lexi mood="thinking" size="xs" />
                                        <div className="rounded-[var(--r-card)] border-2 border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3">
                                            <span className="t-micro muted">
                                                {t('speaking.conversation.aiReplying')}
                                            </span>
                                            <span className="mt-2 block h-2.5 w-[140px] rounded-[var(--r-sm)] bg-[var(--surface-alt)] motion-safe:animate-pulse" />
                                        </div>
                                    </div>
                                ) : null}

                                <div ref={endRef} />
                            </div>

                            <div className="flex max-h-[70dvh] flex-col gap-2 overflow-y-auto px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
                                <Card level="edge" padding="lg" className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <span className="t-micro muted block">
                                            {t('speaking.conversationAnswerLabel')}
                                        </span>
                                        <strong className="t-h3">
                                            {questionLabel}
                                            {isLastQuestion
                                                ? ` — ${t('speaking.conversationLastTurn')}`
                                                : ''}
                                        </strong>
                                    </div>
                                    <Chip tone="outline">{t('speaking.conversationAnswerLength')}</Chip>
                                </div>

                                {recording ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Chip tone="wrong" icon={Mic}>
                                            {t('speaking.recording')}
                                        </Chip>
                                        <span
                                            role="timer"
                                            className="font-mono text-[2.5rem] leading-none font-bold tabular-nums"
                                        >
                                            {`${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(
                                                timer % 60
                                            ).padStart(2, '0')}`}
                                        </span>
                                        <Waveform recording />
                                    </div>
                                ) : null}

                                {phase === 'review' ? (
                                    <label className="flex flex-col gap-1.5">
                                        <span className="t-label">{t('speaking.transcriptLabel')}</span>
                                        <span className="t-micro muted">
                                            {t('speaking.conversationTranscriptHint')}
                                        </span>
                                        <textarea
                                            className={cn(inputClass, 'mt-1 min-h-[110px] resize-y')}
                                            value={transcript}
                                            onChange={(event) => setTranscript(event.target.value)}
                                            placeholder={t('speaking.transcriptPlaceholder')}
                                            spellCheck={false}
                                            lang="en"
                                        />
                                    </label>
                                ) : null}

                                {localError || flow.error ? (
                                    <p role="alert" className="t-micro text-[var(--wrong)]">
                                        {errorMessage}
                                    </p>
                                ) : null}

                                <div className="flex flex-wrap items-center gap-3">
                                    {phase === 'idle' && !recording ? (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            disabled={flow.starting || flow.sending}
                                            onClick={onStartRecording}
                                        >
                                            <Mic size={18} aria-hidden="true" />
                                            {isLastQuestion
                                                ? t('speaking.conversation.answerFinalQuestion')
                                                : t('speaking.conversation.recordAnswer')}
                                        </Button>
                                    ) : null}

                                    {recording ? (
                                        <Button variant="primary" size="lg" onClick={onStopRecording}>
                                            <Check size={18} aria-hidden="true" />
                                            {t('speaking.custom.stopAndSend')}
                                        </Button>
                                    ) : null}

                                    {phase === 'review' ? (
                                        <>
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                disabled={flow.sending || !transcript.trim()}
                                                onClick={onSubmit}
                                            >
                                                {flow.sending ? (
                                                    <Loader2
                                                        size={18}
                                                        className="animate-spin"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <Send size={18} aria-hidden="true" />
                                                )}
                                                {t('speaking.custom.sendAnswer')}
                                            </Button>
                                            <Button variant="ghost" size="lg" onClick={onRestart}>
                                                <RotateCcw size={18} aria-hidden="true" />
                                                {t('speaking.recordAgain')}
                                            </Button>
                                        </>
                                    ) : null}

                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        onClick={onReplay}
                                        disabled={!lastAiText || flow.sending || playing}
                                    >
                                        <Headphones size={18} aria-hidden="true" />
                                        {playing
                                            ? t('speaking.conversationPlaying')
                                            : t('speaking.conversationReplay')}
                                    </Button>
                                </div>

                                {/* The cost is stated where the spend happened: starting charged
                                    once for this topic; continuing charged nothing. */}
                                <p className="t-micro muted text-center">
                                    {isResume
                                        ? t('speaking.conversationResumeLine')
                                        : cost
                                          ? t('speaking.conversationCostLine', {
                                                amount: cost.amountLabel,
                                                balance: balanceKnown ? balance : '—',
                                            })
                                          : ''}
                                </p>
                            </Card>

                                {flow.error ? (
                                    <Card level="flat" padding="lg">
                                        <div className="flex items-start gap-3">
                                            <span aria-hidden="true" className="text-[var(--wrong)]">
                                                <AlertTriangle size={20} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="t-micro">
                                                    {t('speaking.conversation.nextTurnError')}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ) : null}
                            </div>
                        </div>
                    )}
                </AsyncBoundary>
            </div>
        </div>
    );
}
