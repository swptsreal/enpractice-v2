import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader2, Coins, Flag, RotateCcw, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Primitives';
import { Markdown } from '../../components/ui/Markdown';
import { cn } from '../../lib/cn';
import { useSpeechRecording } from '../../hooks/useSpeechRecording';
import { useCredit } from '../../contexts/CreditContextCore';
import { CREDIT_ACTIONS } from '../../features/credits/creditConstants';
import { getCreditCostDisplay } from '../../features/credits/creditPolicy';
import {
    useCustomConversation,
    STYLES,
    PERSONALITIES,
    EXPERTISES,
    VOICES,
    optionLabelKey,
} from '../../features/speaking/useCustomConversation';

const SUGGESTIONS = [
    'customSpeaking.suggestion1',
    'customSpeaking.suggestion2',
    'customSpeaking.suggestion3',
];

/**
 * Custom speaking conversation — `/custom-speaking` (screen 27).
 *
 * TWO STAGES: a short set-up, then the chat. The set-up is unavoidable because the API
 * requires all six fields (`topic`, `style`, `personality`, `expertise`, `voiceName`,
 * `gradingEnabled`) and they are what make the conversation *custom* rather than generic.
 *
 * LEXI'S TURNS DO REAL WORK, per the design: her turns come back as markdown with a
 * correction and the next question, and are rendered through `Markdown` (which does not
 * use `rehype-raw`, because the content is model output).
 *
 * THE COST IS STATED TWICE — a balance chip in the header, and the per-turn cost under the
 * composer — because the decision to speak again is the decision to spend.
 *
 * `maxUserTurns` IS READ FROM THE RESPONSE, not hard-coded. Verified: the backend returns
 * **50**, even though its own env var says 10, so a hard-coded number would be wrong and
 * would disagree with the conversation's actual behaviour.
 *
 * THE ENUMS ARE EXPOSED AS THE BACKEND DEFINES THEM, including `FLIRTY`, `UNFILTERED`,
 * `EDGY` and `REBELLIOUS`. Curating the list down would hide options the API accepts and
 * silently narrow what a user can choose; the labels are neutral and the choice is theirs.
 */
export default function CustomSpeakingPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const credit = useCredit();

    const conversation = useCustomConversation();
    const {
        recording,
        transcript,
        setTranscript,
        timer,
        sttSupported,
        startRecording,
        stopRecording,
    } = useSpeechRecording();

    const [config, setConfig] = useState({
        topic: '',
        style: 'CASUAL',
        personality: 'FRIENDLY',
        expertise: 'GENERAL',
        voiceName: 'US_NEURAL_F',
        gradingEnabled: true,
    });
    const [draft, setDraft] = useState('');

    const costEntry = credit.getCost(CREDIT_ACTIONS.AI_CHAT);
    const cost = getCreditCostDisplay(costEntry);
    const balance = credit.availableBalance;
    const balanceKnown = balance !== null && balance !== undefined;
    const affordable = !cost || !balanceKnown || balance >= Number(costEntry?.cost ?? 0);

    const inChat = Boolean(conversation.conversationId);
    /* Computed, not memoised: the rule flags a memo whose deps are read through an
       object, and this is two numbers - cheaper to compute than to guard. */
    const turnsLeft =
        conversation.maxUserTurns == null
            ? null
            : Math.max(0, conversation.maxUserTurns - conversation.userTurnCount);

    async function onStart(e) {
        e.preventDefault();
        if (!config.topic.trim()) return;
        /* Cleared BEFORE the await, not after: awaiting leaves a window in which the
           chat view is already mounted with the topic still in the composer, so a fast
           first keystroke appends to it. The topic also belongs to a different field. */
        setDraft('');
        await conversation.start({ ...config, topic: config.topic.trim() });
    }

    async function onSend(e) {
        e?.preventDefault?.();
        const content = draft.trim();
        if (!content || conversation.sending || !affordable) return;
        setDraft('');
        await conversation.sendTurn({ transcript: content, timeSpentSeconds: timer });
    }

    async function onFinish() {
        await conversation.finish();
        /* The conversation is graded asynchronously; the result view polls for it. */
        navigate(`/custom-speaking/${conversation.conversationId}`);
    }

    /* ------------------------------------------------------------ set-up */
    if (!inChat) {
        return (
            <div className="mx-auto flex w-full max-w-[680px] flex-col gap-4">
                <Card level="hero" padding="xl" className="flex flex-col gap-3 md:flex-row md:items-center">
                    <Lexi mood="excited" size="lg" />
                    <div className="min-w-0 flex-1">
                        {/* `h2`: the shell header already renders this route's title as the page's
                            `h1`. (The live-conversation screen below is full-bleed and keeps its own
                            `h1`.) */}
                        <h2 className="t-h2">{t('customSpeaking.setupTitle')}</h2>
                        <p className="t-body soft mt-1">{t('customSpeaking.setupBody')}</p>
                    </div>
                </Card>

                <form onSubmit={onStart} className="flex flex-col gap-4">
                    <Card level="edge" padding="xl" className="flex flex-col gap-3">
                        <label className="flex flex-col gap-1.5">
                            <span className="t-label">{t('customSpeaking.topicLabel')}</span>
                            <span className="t-micro muted">{t('customSpeaking.topicHint')}</span>
                            <input
                                className="mt-1 min-h-12 rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
                                value={config.topic}
                                onChange={(e) => setConfig((c) => ({ ...c, topic: e.target.value }))}
                                placeholder={t('customSpeaking.topicPlaceholder')}
                                required
                                maxLength={200}
                            />
                        </label>
                    </Card>

                    {/* --- the three enums, as the backend defines them ------- */}
                    {[
                        { key: 'style', values: STYLES, labelKey: 'customSpeaking.styleLabel' },
                        { key: 'personality', values: PERSONALITIES, labelKey: 'customSpeaking.personalityLabel' },
                        { key: 'expertise', values: EXPERTISES, labelKey: 'customSpeaking.expertiseLabel' },
                    ].map(({ key, values, labelKey }) => (
                        <fieldset key={key}>
                            <legend className="t-label mb-2">{t(labelKey)}</legend>
                            <div className="flex flex-wrap gap-1.5">
                                {values.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={config[key] === value}
                                        onClick={() => setConfig((c) => ({ ...c, [key]: value }))}
                                        className={cn(
                                            'min-h-9 rounded-[var(--r-chip)] px-3 text-xs font-bold',
                                            config[key] === value
                                                ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                                : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                                        )}
                                    >
                                        {t(optionLabelKey(key, value))}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                    ))}

                    {/* --- voice + grading ------------------------------------ */}
                    <Card level="edge" padding="xl" className="flex flex-col gap-4">
                        <fieldset>
                            <legend className="t-label mb-2">{t('customSpeaking.voiceLabel')}</legend>
                            <div className="flex flex-wrap gap-1.5">
                                {VOICES.map((voice) => (
                                    <button
                                        key={voice.id}
                                        type="button"
                                        aria-pressed={config.voiceName === voice.id}
                                        onClick={() => setConfig((c) => ({ ...c, voiceName: voice.id }))}
                                        className={cn(
                                            'min-h-9 rounded-[var(--r-chip)] px-3 text-xs font-bold',
                                            config.voiceName === voice.id
                                                ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                                : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                                        )}
                                    >
                                        {t(voice.labelKey)}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <div className="flex items-start gap-3">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={config.gradingEnabled}
                                aria-label={t('customSpeaking.gradingLabel')}
                                onClick={() => setConfig((c) => ({ ...c, gradingEnabled: !c.gradingEnabled }))}
                                className={cn(
                                    'relative mt-0.5 h-7 w-12 shrink-0 rounded-full border-2',
                                    config.gradingEnabled
                                        ? 'border-[var(--teal)] bg-[var(--teal)]'
                                        : 'border-[var(--border-strong)] bg-[var(--surface-alt)]'
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'absolute top-[3px] size-4 rounded-full bg-[var(--surface)]',
                                        config.gradingEnabled ? 'left-[26px]' : 'left-[3px]'
                                    )}
                                />
                            </button>
                            <span className="min-w-0 flex-1">
                                <span className="t-label block">{t('customSpeaking.gradingLabel')}</span>
                                <span className="t-micro muted">{t('customSpeaking.gradingHint')}</span>
                            </span>
                        </div>
                    </Card>

                    {/* --- the cost, before starting -------------------------- */}
                    <Card level="edge" padding="xl" className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="t-label flex items-center gap-1.5">
                                <Coins size={16} aria-hidden="true" className="text-[var(--amber)]" />
                                {cost ? t('customSpeaking.costPerTurn', { amount: cost.amountLabel }) : t('customSpeaking.freeTurn')}
                            </span>
                            {balanceKnown ? (
                                <Chip tone={affordable ? 'teal' : 'wrong'}>
                                    {t('aiChat.balance', { count: balance })}
                                </Chip>
                            ) : null}
                        </div>
                        {!sttSupported ? (
                            <p className="t-micro muted">{t('customSpeaking.sttNote')}</p>
                        ) : null}
                        <Button type="submit" variant="primary" size="lg" disabled={conversation.starting || !config.topic.trim()}>
                            {conversation.starting ? (
                                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                            ) : (
                                <Sparkles size={18} aria-hidden="true" />
                            )}
                            {t('customSpeaking.start')}
                        </Button>
                        {conversation.error ? (
                            <p role="alert" className="t-micro text-[var(--wrong)]">
                                {t('common.error.generic')}
                            </p>
                        ) : null}
                    </Card>
                </form>

                <ButtonLink to="/speaking" size="sm" variant="ghost" className="self-center">
                    {t('speaking.historyLink')}
                </ButtonLink>
            </div>
        );
    }

    /* --------------------------------------------------------------- chat */
    return (
        <div className="mx-auto flex h-[calc(100dvh-var(--shell-header)-var(--shell-tabbar)-44px)] lg:h-[calc(100dvh-var(--shell-header)-60px)] w-full max-w-[780px] flex-col gap-3">
            {/* --- header: back, title/topic/turn, balance, finish button --- */}
            <div className="flex shrink-0 items-center gap-3 rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[0_var(--edge)_0_0_var(--border)]">
                <Link
                    to="/speaking"
                    aria-label={t('common.back', 'Quay lại')}
                    className="inline-flex size-9 items-center justify-center rounded-[var(--r-control)] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)]"
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                </Link>
                <div className="min-w-0 flex-1">
                    <h1 className="t-label truncate text-[var(--ink)]">
                        {conversation.step?.title ?? t('customSpeaking.title')}
                    </h1>
                    <p className="t-micro muted truncate">
                        {conversation.step?.topic ? `${t('customSpeaking.topicLabel')}: ${conversation.step.topic} · ` : ''}
                        {t('customSpeaking.turnN', { number: conversation.userTurnCount + 1 })}
                        {turnsLeft != null ? ` · ${t('customSpeaking.turnsLeft', { count: turnsLeft })}` : ''}
                    </p>
                </div>
                <Chip tone={affordable ? 'teal' : 'wrong'} icon={Coins}>
                    {balanceKnown ? t('aiChat.balance', { count: balance }) : '—'}
                </Chip>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onFinish}
                    disabled={conversation.finishing}
                    className="text-xs"
                >
                    <Flag size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">{t('customSpeaking.finish')}</span>
                </Button>
            </div>

            {/* --- the log: Lexi white bubble left, user teal bubble right --- */}
            <div
                aria-live="polite"
                aria-label={t('aiChat.logLabel')}
                className="flex flex-1 min-h-0 flex-col gap-3.5 overflow-y-auto p-1"
            >
                {conversation.log.map((entry, i) => {
                    const isUser = entry.role === 'user';
                    return (
                        <div
                            key={`${entry.role}-${i}`}
                            className={cn('flex items-end gap-2.5', isUser ? 'justify-end' : 'justify-start')}
                        >
                            {!isUser ? <Lexi mood="explain" size="xs" /> : null}
                            <div
                                className={cn(
                                    'bubble min-w-0 max-w-[min(84%,540px)]',
                                    isUser ? 'bubble--user bubble--right' : 'bubble--lexi bubble--left'
                                )}
                            >
                                <span className="sr-only">
                                    {isUser ? t('aiChat.you') : t('aiChat.lexi')}
                                </span>
                                {isUser ? (
                                    <p className="whitespace-pre-line">{entry.text}</p>
                                ) : (
                                    <Markdown content={entry.text} />
                                )}
                            </div>
                        </div>
                    );
                })}

                {conversation.sending ? (
                    <div className="flex items-end gap-2.5">
                        <Lexi mood="thinking" size="xs" />
                        <div className="bubble bubble--lexi bubble--left min-w-0 max-w-[min(84%,540px)]">
                            <span className="t-micro muted mb-1.5 block">
                                {t('customSpeaking.speakingNow')}
                            </span>
                            <span aria-hidden="true" className="flex flex-col gap-2">
                                <span className="block h-3.5 w-32 animate-pulse rounded bg-[var(--surface-alt)]" />
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* --- suggestion chips: single row --- */}
            <div className="flex shrink-0 flex-col gap-1.5">
                <span className="t-micro muted">{t('customSpeaking.suggestHeading', 'Gợi ý')}</span>
                <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {SUGGESTIONS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setDraft(t(key))}
                            className="inline-flex h-[30px] shrink-0 whitespace-nowrap items-center rounded-[var(--r-chip)] border-2 border-[var(--border-strong)] bg-transparent px-3 text-[0.8125rem] font-bold tracking-[0.01em] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] cursor-pointer"
                        >
                            {t(key)}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- 1-line composer (.chat__input) --- */}
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
                            ? 'bg-[var(--wrong)] text-white animate-pulse'
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
                        onChange={(e) => {
                            setDraft(e.target.value);
                            if (recording) setTranscript(e.target.value);
                        }}
                        placeholder={t('customSpeaking.replyPlaceholder')}
                    />
                </label>

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!(draft || transcript).trim() || conversation.sending || !affordable}
                >
                    {conversation.sending ? (
                        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    ) : (
                        <ArrowRight size={18} aria-hidden="true" />
                    )}
                    <span>
                        {cost ? t('customSpeaking.sendWithCost', { amount: cost.amountLabel }) : t('customSpeaking.send')}
                    </span>
                </Button>
            </form>

            {/* --- cost note and reset --- */}
            <p className="t-micro muted shrink-0 text-center">
                {affordable
                    ? cost
                        ? t('customSpeaking.costLine', { amount: cost.amountLabel, balance: balanceKnown ? balance : '—' })
                        : t('customSpeaking.freeLine')
                    : t('customSpeaking.insufficient')}
            </p>

            {conversation.error ? (
                <p role="alert" className="t-micro shrink-0 text-center text-[var(--wrong)]">
                    {t('common.error.generic')}
                </p>
            ) : null}

            <div className="flex shrink-0 items-center justify-center gap-3 pt-0.5">
                <Button variant="ghost" size="sm" onClick={conversation.reset}>
                    <RotateCcw size={15} aria-hidden="true" />
                    {t('customSpeaking.newConversation')}
                </Button>
            </div>
        </div>
    );
}
