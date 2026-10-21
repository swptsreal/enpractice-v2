import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, Coins, Loader2, Plus, Sparkles } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip, Field, SkeletonCard, inputClass } from '../../components/ui/Primitives';
import { cn } from '../../lib/cn';
import { useSetPageHeaderSubtitle } from '../../app/PageHeaderContextCore';
import { useCredit } from '../../contexts/CreditContextCore';
import useCreditAction from '../../hooks/useCreditAction';
import { CREDIT_ACTIONS } from '../../features/credits/creditConstants';
import { getCreditCostDisplay } from '../../features/credits/creditPolicy';
import { speakingApi } from '../../api';
import {
    EXPERTISES,
    PERSONALITIES,
    STYLES,
    VOICES,
    optionLabelKey,
    useCustomTemplate,
    useCustomTemplates,
    useStartCustomConversation,
} from '../../features/speaking/useCustomConversation';
import { CustomSpeakingTemplatePicker } from './CustomSpeakingTemplatePicker';
import {
    DEFAULT_TEMPLATE_FILTER,
    isTemplateFilter,
} from '../../features/speaking/customSpeakingFilters';

/**
 * Custom speaking — `/custom-speaking` (screen 27).
 *
 * THE TEMPLATES SIT BESIDE THE FORM, and the form is unchanged. A template is a stored
 * configuration of the same six fields the API requires; "Dùng" fills those fields and does
 * nothing else. It never starts a conversation and it cannot spend credit — the charge stays on
 * the form's start button, which is also the only place the price is stated.
 *
 * THE LIST IS VERTICAL AND EACH ROW HAS ONE ACTION. An applied row reads "Đang dùng" instead of
 * "Dùng"; an own template carries one extra icon (delete) because the row's verb must stay
 * "Dùng". The list is its own scrollport so fifteen seeded templates cannot push the form off
 * screen; on a wide screen it sticks beside the form while the form scrolls.
 *
 * THE CHAT IS NOT HERE. Starting navigates to 27c (`/custom-speaking/conversation/:id`) so a
 * reload rebuilds the log from the server instead of losing it.
 */
const DEFAULT_CONFIG = {
    topic: '',
    style: 'CASUAL',
    personality: 'FRIENDLY',
    expertise: 'GENERAL',
    voiceName: 'US_NEURAL_F',
    gradingEnabled: true,
};

const ENUMS = [
    { key: 'style', values: STYLES, labelKey: 'customSpeaking.styleLabel' },
    { key: 'personality', values: PERSONALITIES, labelKey: 'customSpeaking.personalityLabel' },
    { key: 'expertise', values: EXPERTISES, labelKey: 'customSpeaking.expertiseLabel' },
];

/**
 * A template supplies the form's initial value; a learner's edit takes over from it. Deriving the
 * value avoids an effect that would render the empty form first and replace it (a flash and a
 * cascading render).
 */
function configFromTemplate(template) {
    if (!template) return null;
    return {
        topic: template.topic ?? '',
        style: template.style ?? DEFAULT_CONFIG.style,
        personality: template.personality ?? DEFAULT_CONFIG.personality,
        expertise: template.expertise ?? DEFAULT_CONFIG.expertise,
        voiceName: template.voiceName ?? DEFAULT_CONFIG.voiceName,
        gradingEnabled: template.gradingEnabled !== false,
    };
}

export default function CustomSpeakingPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const templateId = searchParams.get('templateId');

    const credit = useCredit();
    const startCredit = useCreditAction(CREDIT_ACTIONS.SPEAKING_START);
    const starter = useStartCustomConversation();
    const templates = useCustomTemplates();
    const initial = useCustomTemplate(templateId);

    useSetPageHeaderSubtitle(t('customSpeaking.gallerySubtitle'));

    const [edits, setEdits] = useState(null);
    const [appliedIdState, setAppliedIdState] = useState(null);
    const [filter, setFilter] = useState(() => {
        const requested = searchParams.get('filter');
        return isTemplateFilter(requested) ? requested : DEFAULT_TEMPLATE_FILTER;
    });
    const [startError, setStartError] = useState(null);
    const [saveName, setSaveName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const formRef = useRef(null);
    const pickerRef = useRef(null);

    const config = edits ?? configFromTemplate(initial.template) ?? DEFAULT_CONFIG;
    /* A template chosen from ?templateId= is "in use" until the learner edits the form. */
    const appliedId = edits === null ? (initial.template?.id ?? null) : appliedIdState;
    /* The shelf a save keeps is the APPLIED template's, whether it came from the list or the URL. */
    const appliedTemplate = appliedId
        ? templates.templates.find((item) => item.id === appliedId) ??
          (initial.template?.id === appliedId ? initial.template : null)
        : null;

    const costEntry = credit.getCost(CREDIT_ACTIONS.SPEAKING_START);
    const cost = getCreditCostDisplay(costEntry);
    const amount = Number(costEntry?.cost ?? 0);
    const balance = credit.availableBalance;
    const balanceKnown = balance !== null && balance !== undefined;
    const affordable = !cost || !balanceKnown || balance >= amount;
    const canStart = Boolean(config.topic.trim()) && affordable && !starter.starting;

    function updateConfig(patch) {
        setEdits({ ...config, ...patch });
        setAppliedIdState(null);
        setSaved(false);
        setSaveError(null);
    }

    /**
     * "Dùng" only copies a configuration into the form. On a phone the form sits below the list,
     * so the result is brought into view; on a wide screen both are visible and nothing moves.
     */
    function applyTemplate(template) {
        setEdits(configFromTemplate(template));
        setAppliedIdState(template.id);
        setSaved(false);
        setSaveError(null);
        setStartError(null);
        if (window.matchMedia('(max-width: 1023px)').matches) {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async function onStart(event) {
        event.preventDefault();
        if (!canStart) return;
        setStartError(null);
        try {
            const result = await startCredit.execute(() =>
                starter.start({ ...config, topic: config.topic.trim() })
            );
            if (result.blocked) return;
            navigate(`/custom-speaking/conversation/${result.data.conversationId}`);
        } catch {
            setStartError(t('customSpeaking.startError'));
        }
    }

    async function onSave() {
        if (!config.topic.trim()) {
            setSaveError(t('customSpeaking.saveNeedsTopic'));
            return;
        }
        if (!saveName.trim()) {
            setSaveError(t('customSpeaking.saveNeedsName'));
            return;
        }

        setSaving(true);
        setSaveError(null);
        try {
            await speakingApi.createCustomSpeakingTemplate({
                title: saveName.trim(),
                topic: config.topic.trim(),
                style: config.style,
                personality: config.personality,
                expertise: config.expertise,
                voiceName: config.voiceName,
                gradingEnabled: config.gradingEnabled,
                /* A copy of a template keeps its shelf; one built from scratch has none. */
                group: appliedTemplate?.group ?? null,
                level: appliedTemplate?.level ?? null,
            });
            setSaved(true);
            templates.reload();
        } catch {
            setSaveError(t('customSpeaking.saveError'));
        } finally {
            setSaving(false);
        }
    }

    function viewMine() {
        setFilter('mine');
        pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (templateId && initial.loading) {
        return (
            <div className="mx-auto flex w-full max-w-[680px] flex-col gap-4" aria-busy="true">
                <SkeletonCard lines={4} />
                <SkeletonCard lines={3} />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-4">
            <Card level="hero" padding="xl" className="flex flex-col gap-3 md:flex-row md:items-center">
                <Lexi mood="excited" size="lg" />
                <div className="min-w-0 flex-1">
                    {/* `h2`: the shell header renders this route's title as the page's h1. */}
                    <h2 className="t-h2">{t('customSpeaking.setupTitle')}</h2>
                    <p className="t-body soft mt-1">{t('customSpeaking.setupBody')}</p>
                </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                <div ref={pickerRef} className="order-1 min-w-0 lg:order-2">
                    <CustomSpeakingTemplatePicker
                        templates={templates.templates}
                        loading={templates.loading}
                        error={templates.error}
                        filter={filter}
                        onFilterChange={setFilter}
                        appliedId={appliedId}
                        onApply={applyTemplate}
                        onRetry={templates.reload}
                        onDeleted={templates.reload}
                    />
                </div>

                <form
                    ref={formRef}
                    onSubmit={onStart}
                    className="order-2 flex min-w-0 flex-col gap-3 lg:order-1"
                >
                    <Card level="edge" padding="xl">
                        <Field
                            id="custom-topic"
                            label={t('customSpeaking.topicLabel')}
                            help={t('customSpeaking.topicHint')}
                        >
                            {(fieldProps) => (
                                <input
                                    {...fieldProps}
                                    className={cn(inputClass, 'mt-1')}
                                    value={config.topic}
                                    onChange={(event) => updateConfig({ topic: event.target.value })}
                                    placeholder={t('customSpeaking.topicPlaceholder')}
                                    required
                                    maxLength={200}
                                />
                            )}
                        </Field>
                    </Card>

                    {ENUMS.map(({ key, values, labelKey }) => (
                        <fieldset key={key} className="border-0 p-0">
                            <legend className="t-label mb-2">{t(labelKey)}</legend>
                            <div className="flex flex-wrap gap-1.5">
                                {values.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={config[key] === value}
                                        onClick={() => updateConfig({ [key]: value })}
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

                    <Card level="edge" padding="xl" className="flex flex-col gap-4">
                        <fieldset className="border-0 p-0">
                            <legend className="t-label mb-2">{t('customSpeaking.voiceLabel')}</legend>
                            <div className="flex flex-wrap gap-1.5">
                                {VOICES.map((voice) => (
                                    <button
                                        key={voice.id}
                                        type="button"
                                        aria-pressed={config.voiceName === voice.id}
                                        onClick={() => updateConfig({ voiceName: voice.id })}
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
                                onClick={() => updateConfig({ gradingEnabled: !config.gradingEnabled })}
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

                    {/* The charge happens here. The balance chip is beside the price so the learner
                        does not have to leave the screen to know whether they can press. */}
                    <Card level="edge" padding="xl" className="flex flex-col gap-3">
                        {!affordable ? (
                            <p role="alert" className="t-micro flex items-start gap-2 text-[var(--wrong)]">
                                <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                                {t('customSpeaking.insufficientStart')}
                            </p>
                        ) : (
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="t-micro flex items-center gap-1.5">
                                    <Coins size={16} aria-hidden="true" className="text-[var(--amber)]" />
                                    {cost
                                        ? t('customSpeaking.costAtStart', { amount })
                                        : t('customSpeaking.freeStartLine')}
                                </span>
                                {balanceKnown ? (
                                    <Chip tone={affordable ? 'teal' : 'wrong'}>
                                        {t('aiChat.balance', { count: balance })}
                                    </Chip>
                                ) : null}
                            </div>
                        )}

                        <Button type="submit" variant="primary" size="lg" disabled={!canStart}>
                            {starter.starting ? (
                                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                            ) : (
                                <Sparkles size={18} aria-hidden="true" />
                            )}
                            {cost ? t('customSpeaking.startWithCost', { amount }) : t('customSpeaking.start')}
                        </Button>

                        {startError ? (
                            <p role="alert" className="t-micro text-[var(--wrong)]">
                                {startError}
                            </p>
                        ) : null}
                    </Card>

                    {/* Saving is a second action, collapsed so the primary path stays one button. */}
                    <details className="rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)]">
                        <summary className="cursor-pointer p-4 font-extrabold text-[var(--ink-soft)]">
                            {t('customSpeaking.saveTitle')}
                        </summary>
                        <div className="flex flex-col gap-3 border-t-2 border-[var(--border)] p-4">
                            <Field id="template-name" label={t('customSpeaking.saveNameLabel')}>
                                {(fieldProps) => (
                                    <input
                                        {...fieldProps}
                                        className={inputClass}
                                        value={saveName}
                                        onChange={(event) => {
                                            setSaveName(event.target.value);
                                            setSaveError(null);
                                            setSaved(false);
                                        }}
                                        placeholder={t('customSpeaking.saveNamePlaceholder')}
                                        maxLength={255}
                                    />
                                )}
                            </Field>

                            <div className="flex flex-wrap items-center gap-3">
                                {saved ? (
                                    <>
                                        <Button size="sm" disabled>
                                            <Check size={16} aria-hidden="true" />
                                            {t('customSpeaking.saved')}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={viewMine}>
                                            {t('customSpeaking.saveViewMine')}
                                        </Button>
                                    </>
                                ) : (
                                    <Button size="sm" onClick={onSave} disabled={saving}>
                                        {saving ? (
                                            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                                        ) : (
                                            <Plus size={16} aria-hidden="true" />
                                        )}
                                        {t('customSpeaking.saveAction')}
                                    </Button>
                                )}
                                <p className="t-micro muted">{t('customSpeaking.saveNote')}</p>
                            </div>

                            {saveError ? (
                                <p role="alert" className="t-micro text-[var(--wrong)]">
                                    {saveError}
                                </p>
                            ) : null}
                        </div>
                    </details>
                </form>
            </div>
        </div>
    );
}
