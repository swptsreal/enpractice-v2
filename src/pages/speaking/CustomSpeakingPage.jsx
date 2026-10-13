import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Loader2, Coins, Info, Flag, RotateCcw, Sparkles } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, Stat } from '../../components/ui/Primitives';
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
        <div className="mx-auto flex w-full max-w-[780px] flex-col gap-4">
            {/* --- header: Lexi, topic, balance ---------------------------- */}
            <Card level="edge" padding="xl" className="flex flex-wrap items-center gap-4">
                <Lexi mood={conversation.sending ? 'thinking' : 'happy'} size="md" />
                <div className="min-w-0 flex-1">
                    <h1 className="t-h3">{conversation.step?.title ?? t('customSpeaking.title')}</h1>
                    <p className="t-micro muted">
                        {t(`customSpeaking.option.style.${conversation.step?.style ?? 'CASUAL'}`)}
                        {' · '}
                        {t(`customSpeaking.option.expertise.${conversation.step?.expertise ?? 'GENERAL'}`)}
                        {turnsLeft != null ? ` · ${t('customSpeaking.turnsLeft', { count: turnsLeft })}` : ''}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Chip tone={affordable ? 'teal' : 'wrong'} icon={Coins}>
                        {balanceKnown ? t('aiChat.balance', { count: balance }) : '—'}
                    </Chip>
                </div>
            </Card>

            {/* --- the log ------------------------------------------------- */}
            <div
                aria-live="polite"
                aria-label={t('aiChat.logLabel')}
                className="flex max-h-[52vh] min-h-[260px] flex-col gap-3 overflow-y-auto p-1"
            >
                {conversation.log.map((entry, i) => (
                    <div key={`${entry.role}-${i}`} className={cn('flex items-start gap-2.5', entry.role === 'user' && 'flex-row-reverse')}>
                        {entry.role === 'assistant' ? <Lexi mood="idle" size="xs" /> : null}
                        <div
                            className={cn(
                                'min-w-0 max-w-[86%] rounded-[var(--r-card)] border-2 p-3.5',
                                entry.role === 'user'
                                    ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                                    : 'border-[var(--border)] bg-[var(--surface)]'
                            )}
                        >
                            <span className="t-micro muted mb-1 block">
                                {entry.role === 'user' ? t('aiChat.you') : t('aiChat.lexi')}
                            </span>
                            {entry.role === 'user' ? (
                                <p className="whitespace-pre-line">{entry.text}</p>
                            ) : (
                                <Markdown content={entry.text} />
                            )}
                        </div>
                    </div>
                ))}

                {conversation.sending ? (
                    <div className="flex items-start gap-2.5">
                        <Lexi mood="thinking" size="xs" />
                        <div className="min-w-0 max-w-[86%] rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)] p-3.5">
                            <span className="t-micro muted mb-1 block">{t('customSpeaking.speakingNow')}</span>
                            <span aria-hidden="true" className="flex flex-col gap-2">
                                <span className="block h-3.5 w-full animate-pulse rounded bg-[var(--surface-alt)]" />
                                <span className="block h-3.5 w-2/5 animate-pulse rounded bg-[var(--surface-alt)]" />
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* --- composer ------------------------------------------------ */}
            <Card level="edge" padding="xl">
                <form onSubmit={onSend} className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                        <span className="sr-only">{t('customSpeaking.replyLabel')}</span>
                        <textarea
                            className="min-h-[72px] resize-y rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] p-3.5"
                            value={draft || (recording ? transcript : '')}
                            onChange={(e) => {
                                setDraft(e.target.value);
                                if (recording) setTranscript(e.target.value);
                            }}
                            placeholder={t('customSpeaking.replyPlaceholder')}
                            rows={2}
                        />
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Mic: record, or stop and keep the transcript as the reply. */}
                        <Button
                            type="button"
                            variant={recording ? 'danger' : 'secondary'}
                            size="lg"
                            onClick={() => {
                                if (recording) {
                                    stopRecording();
                                    setDraft(transcript);
                                } else {
                                    startRecording();
                                }
                            }}
                        >
                            {recording ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
                            {recording ? t('customSpeaking.stopRecording') : t('customSpeaking.record')}
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={!(draft || transcript).trim() || conversation.sending || !affordable}
                        >
                            {conversation.sending ? (
                                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                            ) : (
                                <Send size={18} aria-hidden="true" />
                            )}
                            {cost ? t('customSpeaking.sendWithCost', { amount: cost.amountLabel }) : t('customSpeaking.send')}
                        </Button>

                        <span className="flex-1" />

                        <Button type="button" variant="ghost" size="sm" onClick={onFinish} disabled={conversation.finishing}>
                            <Flag size={15} aria-hidden="true" />
                            {t('customSpeaking.finish')}
                        </Button>
                    </div>

                    {/* The cost, stated a second time, where the decision is made. */}
                    <p className="t-micro muted flex flex-wrap items-center gap-2 border-t-2 border-[var(--border)] pt-3">
                        <Info size={13} aria-hidden="true" />
                        {affordable
                            ? cost
                                ? t('customSpeaking.costLine', { amount: cost.amountLabel, balance: balanceKnown ? balance : '—' })
                                : t('customSpeaking.freeLine')
                            : t('customSpeaking.insufficient')}
                    </p>

                    {conversation.gradingEnabled ? (
                        <p className="t-micro muted">{t('customSpeaking.gradingOn')}</p>
                    ) : (
                        <p className="t-micro muted">{t('customSpeaking.gradingOff')}</p>
                    )}

                    {conversation.error ? (
                        <p role="alert" className="t-micro text-[var(--wrong)]">
                            {t('common.error.generic')}
                        </p>
                    ) : null}
                </form>
            </Card>

            <div className="flex items-center justify-center gap-3">
                <Button variant="ghost" size="sm" onClick={conversation.reset}>
                    <RotateCcw size={15} aria-hidden="true" />
                    {t('customSpeaking.newConversation')}
                </Button>
                <Stat value={conversation.userTurnCount} label={t('customSpeaking.yourTurns')} tone="teal" />
            </div>
        </div>
    );
}
