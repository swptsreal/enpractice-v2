import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, FileText, Loader2, Send, Check, Coins, Lightbulb, BookOpen, PenLine } from 'lucide-react';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { useWritingTask, useSubmitEssay, countWords } from '../../features/writing/useWriting';
import { useCredit } from '../../contexts/CreditContextCore';
import { CREDIT_ACTIONS } from '../../features/credits/creditConstants';
import { getCreditCostDisplay } from '../../features/credits/creditPolicy';
import { cn } from '../../lib/cn';

/**
 * Writing task — `/writing/task/:taskId` (screen 22).
 *
 * THE COST IS ON THE SUBMIT BUTTON, before it is pressed ("Nộp bài · −1 credit"), and
 * the expected wait is stated next to it. Same rule as the AI-explain screen: a price
 * revealed after the click is a bill, not a price.
 *
 * THE WORD COUNT IS INFORMATION, NOT A GATE. The design is explicit that a user may
 * submit under length; the chip compares against the target and changes tone, but the
 * button never disables on word count. Blocking submission would also lose work — a
 * writer who is stuck at 200 words should be able to submit and get feedback.
 *
 * AUTOSAVE is a local draft in `localStorage`, keyed by task id. It is deliberately
 * not a server draft: there is no endpoint for one, and inventing a fake "saved to
 * server" indicator would be worse than an honest local one. The indicator says where
 * the text is saved.
 */
const DRAFT_PREFIX = 'writing-draft:';
const AUTOSAVE_MS = 800;

export default function WritingTakePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { taskId } = useParams();

    const { task, loading, error, reload } = useWritingTask(taskId);
    const { submit, submitting } = useSubmitEssay();
    const credit = useCredit();

    const [essay, setEssay] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const [savedAt, setSavedAt] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [pane, setPane] = useState('prompt');

    const cost = getCreditCostDisplay(credit.getCost(CREDIT_ACTIONS.WRITING_START));
    const balance = credit.availableBalance;
    const balanceKnown = balance !== null && balance !== undefined;
    const affordable = !cost || !balanceKnown || balance >= Number(credit.getCost(CREDIT_ACTIONS.WRITING_START)?.cost ?? 0);

    /* Restoring the draft on mount is the one place this page must set state inside an
       effect: localStorage is only readable in the browser, and the value has to arrive
       before the writer starts typing. The disable lives on the setState call itself,
       which is where the rule reports. */
    /* --- draft restore ------------------------------------------------- */
    useEffect(() => {
        if (!taskId) return;
        try {
            const stored = window.localStorage.getItem(`${DRAFT_PREFIX}${taskId}`);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (stored) setEssay(stored);
        } catch {
            /* a browser with storage disabled is not a reason to break the editor */
        }
    }, [taskId]);

    /* --- autosave, debounced ------------------------------------------- */
    useEffect(() => {
        if (!taskId || !essay) return undefined;
        const timer = setTimeout(() => {
            try {
                window.localStorage.setItem(`${DRAFT_PREFIX}${taskId}`, essay);
                setSavedAt(Date.now());
            } catch {
                /* ignore */
            }
        }, AUTOSAVE_MS);
        return () => clearTimeout(timer);
    }, [essay, taskId]);

    /* --- timer counts up, the way a writer expects ---------------------- */
    useEffect(() => {
        if (loading) return undefined;
        const id = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [loading]);

    const words = useMemo(() => countWords(essay), [essay]);
    const target = task?.minWords ?? null;
    const max = task?.maxWords ?? null;
    const underTarget = target != null && words > 0 && words < target;
    const overMax = max != null && words > max;

    const clock = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

    async function onSubmit() {
        setSubmitError(null);
        try {
            const submission = await submit(taskId, { essayContent: essay, timeSpentSeconds: elapsed });
            /* The draft is cleared only once the server has the essay. */
            try {
                window.localStorage.removeItem(`${DRAFT_PREFIX}${taskId}`);
            } catch {
                /* ignore */
            }
            if (submission?.id) {
                navigate(`/writing/submission/${submission.id}`, { replace: true });
            }
        } catch (err) {
            setSubmitError(err);
        }
    }

    /* The four IELTS criteria the essay is marked against, listed explicitly so the
       user knows what is being judged rather than only seeing a number afterwards. */
    const CRITERIA = ['taskResponse', 'coherence', 'lexicalResource', 'grammar'];

    return (
        /* Same bounded-viewport shape as the IELTS take screen, for the same reason: a
           document-scrolling split screen makes the grid row as tall as its tallest pane, so the
           `overflow-y-auto` panes never scroll and the editor's own footer is pushed below the
           fold. `h-dvh` + `grid-rows-[minmax(0,1fr)]` gives each pane a bound to scroll inside. */
        <div className="flex h-dvh flex-col overflow-hidden bg-[var(--canvas)]">
            <header className="z-30 flex shrink-0 items-center gap-3 border-b-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
                <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={t('common.back')}
                    onClick={() => navigate('/writing')}
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                </Button>
                <div className="min-w-0 flex-1">
                    <span className="t-label block">{task ? t(`writing.type.${task.taskType}`) : t('writing.title')}</span>
                    <span className="t-micro muted">{t('writing.draftNote')}</span>
                </div>
                <span
                    role="timer"
                    aria-live="off"
                    className="inline-flex items-center gap-1.5 rounded-[var(--r-control)] bg-[var(--surface-alt)] px-3 py-2 text-[var(--ink-soft)]"
                >
                    <Clock size={16} aria-hidden="true" />
                    <span className="t-mono">{clock}</span>
                </span>
            </header>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && !task}
                onRetry={reload}
                skeleton={
                    <div className="grid gap-4 p-4 lg:grid-cols-[380px_minmax(0,1fr)]">
                        <SkeletonCard lines={10} />
                        <SkeletonCard lines={8} />
                    </div>
                }
                emptyTitle={t('writing.taskMissingTitle')}
                emptyBody={t('writing.taskMissingBody')}
                emptyAction={
                    <ButtonLink to="/writing" variant="primary" size="sm">
                        {t('writing.title')}
                    </ButtonLink>
                }
            >
                <>
                    {/* Mobile: two-tab switch between prompt and editor. Desktop: both panes visible. */}
                    <div
                        role="tablist"
                        aria-label={t('writing.paneSwitchLabel')}
                        className="flex shrink-0 gap-1.5 border-b-2 border-[var(--border)] bg-[var(--surface)] p-2 lg:hidden"
                    >
                        {[
                            { id: 'prompt', icon: BookOpen, label: t('writing.promptTab') },
                            { id: 'editor', icon: PenLine, label: `${t('writing.editorTab')} (${words} ${t('writing.wordsShort')})` },
                        ].map(({ id, icon: Icon, label }) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                id={`tab-${id}`}
                                aria-controls={`pane-${id}`}
                                aria-selected={pane === id}
                                onClick={() => setPane(id)}
                                className={cn(
                                    'flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[var(--r-sm)] text-sm font-bold',
                                    pane === id
                                        ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                        : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                                )}
                            >
                                <Icon size={16} aria-hidden="true" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[380px_minmax(0,1fr)]">
                        {/* --- prompt pane --------------------------------------- */}
                        <aside
                            id="pane-prompt"
                            role="tabpanel"
                            aria-labelledby="tab-prompt"
                            className={cn(
                                'min-h-0 overflow-y-auto border-[var(--border)] bg-[var(--surface)] p-4 lg:block lg:border-r-2 lg:border-b-0 lg:p-5',
                                pane === 'prompt' ? 'block' : 'hidden'
                            )}
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <Chip tone="neutral">{t(`writing.type.${task?.taskType}`)}</Chip>
                                {task?.timeLimitMinutes ? (
                                    <Chip tone="neutral" icon={Clock}>
                                        {t('home.minutes', { count: task.timeLimitMinutes })}
                                    </Chip>
                                ) : null}
                                <Chip tone="teal" icon={FileText}>
                                    {t('writing.wordRange', { min: task?.minWords, max: task?.maxWords })}
                                </Chip>
                            </div>

                            <h1 className="t-h2 mt-3">{task?.title}</h1>

                            {task?.contentText ? (
                                <p className="prose-reading mt-3 whitespace-pre-line">{task.contentText}</p>
                            ) : null}
                            {task?.instructionText ? (
                                <p className="t-body soft mt-3 whitespace-pre-line border-l-2 border-[var(--border-strong)] pl-3">
                                    {task.instructionText}
                                </p>
                            ) : null}

                            {/* (task.imageUrls ?? []).length > 0 — a Task 1 chart, when present */}
                            {(task?.imageUrls ?? []).length > 0 ? (
                                <ul className="mt-3 flex flex-col gap-2">
                                    {task.imageUrls.map((url) => (
                                        <li key={url}>
                                            <img
                                                src={url}
                                                alt={t('writing.chartAlt')}
                                                className="w-full rounded-[var(--r-card)] border-2 border-[var(--border)]"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            ) : null}

                            <section className="mt-4 border-t-2 border-[var(--border)] pt-3.5">
                                <h2 className="t-label">{t('writing.criteriaTitle')}</h2>
                                <ul className="mt-2 flex flex-col gap-1.5">
                                    {CRITERIA.map((c) => (
                                        <li key={c} className="t-micro muted flex items-start gap-2">
                                            <Check size={13} className="mt-0.5 shrink-0 text-[var(--teal)]" aria-hidden="true" />
                                            {t(`writing.criterion.${c}`)}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="mt-4 flex items-start gap-2.5 rounded-[var(--r-card)] bg-[var(--amber-soft)] p-3">
                                <Lightbulb size={16} className="mt-0.5 shrink-0 text-[var(--amber)]" aria-hidden="true" />
                                <p className="t-micro">{t('writing.lexiTip')}</p>
                            </div>
                        </aside>

                        {/* --- editor pane --------------------------------------- */}
                        <section
                            id="pane-editor"
                            role="tabpanel"
                            aria-labelledby="tab-editor"
                            className={cn(
                                'flex min-h-0 flex-col overflow-y-auto bg-[var(--canvas)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] lg:flex lg:p-5',
                                pane === 'editor' ? 'flex' : 'hidden'
                            )}
                        >
                            <label className="flex min-h-0 flex-1 flex-col gap-1.5">
                                <span className="t-label">{t('writing.editorLabel')}</span>
                                <textarea
                                    className="min-h-[220px] flex-1 resize-y rounded-[var(--r-card)] border-2 border-[var(--border-strong)] bg-[var(--surface)] p-4 leading-relaxed lg:min-h-[10rem]"
                                    value={essay}
                                    onChange={(e) => setEssay(e.target.value)}
                                    placeholder={t('writing.editorPlaceholder')}
                                    spellCheck
                                    lang="en"
                                    aria-describedby="word-count"
                                />
                            </label>

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                {/* Word count: information, never a gate. */}
                                <span id="word-count" className="t-mono text-sm">
                                    {target != null
                                        ? t('writing.wordCountOf', { count: words, target })
                                        : t('writing.wordCount', { count: words })}
                                </span>
                                {underTarget ? <Chip tone="amber">{t('writing.underTarget')}</Chip> : null}
                                {overMax ? <Chip tone="amber">{t('writing.overMax')}</Chip> : null}
                                {savedAt ? (
                                    <span className="t-micro muted inline-flex items-center gap-1.5">
                                        <Check size={13} aria-hidden="true" className="text-[var(--correct)]" />
                                        {t('writing.savedLocally')}
                                    </span>
                                ) : null}
                            </div>

                            {submitError ? (
                                <p role="alert" className="t-micro mt-3 text-[var(--wrong)]">
                                    {t('common.error.generic')}
                                </p>
                            ) : null}

                            <div className="mt-4 flex flex-wrap items-center gap-3 border-t-2 border-[var(--border)] pt-4">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    disabled={submitting || !essay.trim() || !affordable}
                                    onClick={onSubmit}
                                >
                                    {submitting ? (
                                        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                                    ) : (
                                        <Send size={18} aria-hidden="true" />
                                    )}
                                    {cost ? t('writing.submitWithCost', { amount: cost.amountLabel }) : t('writing.submit')}
                                </Button>
                                <span className="t-micro muted inline-flex items-center gap-1.5">
                                    <Coins size={14} aria-hidden="true" />
                                    {affordable ? t('writing.gradingWait') : t('writing.insufficient')}
                                </span>
                            </div>
                        </section>
                    </div>
                </>
            </AsyncBoundary>
        </div>
    );
}
