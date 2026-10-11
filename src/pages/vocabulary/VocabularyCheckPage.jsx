import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, Volume2, Sparkles, Loader2, X, Coins, BookPlus, AlertTriangle, Clock, Check } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Primitives';
import { Markdown } from '../../components/ui/Markdown';
/* The hook is a named export of the Core module, which the provider imports too.
   `hooks/useVocabularyExplain.js` re-exports it as DEFAULT, so a named import from
   there resolves to nothing and the build fails. */
import { useVocabularyExplain } from '../../contexts/VocabularyExplainContextCore';
import { useCredit } from '../../contexts/CreditContextCore';
import { getCreditCostDisplay } from '../../features/credits/creditPolicy';
import { useWordMutations } from '../../features/vocabulary/useDictionary';

/**
 * Dictionary lookup + AI explain — `/vocabulary/check` (screen 07).
 *
 * The whole point of this screen is one product rule, implemented structurally
 * rather than as copy: **the cost is on the button, before it is pressed.** The
 * button reads "Giải thích · −1 credit" while it is still unpressed. `PRODUCT.md`
 * commits to being truthful on the free/paid boundary, and the only place that
 * matters is the moment of decision — a price revealed afterwards is not a price,
 * it is a bill.
 *
 * ── IT IS OUTSIDE THE SHELL, BUT IT IS NOT OUTSIDE THE PRODUCT ────────────────
 *
 * The route deliberately skips `AppLayout`: this is the surface the landing page
 * and the login card promise a visitor WITHOUT an account ("Học thử không cần tài
 * khoản"), so it must not render the sidebar, the tab bar, the notification bell
 * or the floating Lexi — all of which belong to an account the guest does not
 * have. `App.test.jsx` pins that absence.
 *
 * What it DID lack was any anchor at all: `ProviderLayout` renders no chrome, so
 * the screen opened straight onto an input card floating on the canvas with no
 * brand above it and no way to the rest of the product. That reads as a broken
 * app, not as a deliberate no-chrome trial. The fix keeps the surface full-bleed
 * and chrome-free — no nav landmark, no sidebar, no tab bar, no floating helper —
 * and adds the minimum that makes it legible as EN Practice: the brand as a link
 * back to the product's front door, one sign-in affordance, and the guest-trial
 * caveat. Everything else on this screen is unchanged.
 *
 * The stream is over STOMP (`/app/vocabulary/explain` -> `/user/queue/...`), which
 * is why this page needs the provider chain mounted in `ProviderLayout`. The state
 * machine that folds the events (START / DELTA / COMPLETE / ERROR) is v1's
 * `vocabularyExplainState`, ported unchanged and already covered by its own tests.
 *
 * The button is DISABLED while the wallet cannot cover the action, with the reason
 * stated next to it, rather than letting the click fail with a 402-style error. The
 * backend does enforce it too — an `INSUFFICIENT_CREDIT` event mid-stream raises the
 * access issue and refunds nothing — but a user should not have to learn the price
 * by being refused.
 */
export default function VocabularyCheckPage() {
    const { t } = useTranslation();

    const { start, cancel, requestsById, isConnected, costEntry } = useVocabularyExplain();
    const credit = useCredit();
    const { addWord } = useWordMutations();

    const [word, setWord] = useState('');
    const [context, setContext] = useState('');
    const [activeId, setActiveId] = useState(null);
    const [saved, setSaved] = useState(false);
    const [inputError, setInputError] = useState(null);

    const cost = getCreditCostDisplay(costEntry);
    const balance = credit.availableBalance;
    const balanceKnown = balance !== null && balance !== undefined;
    const insufficient = Boolean(cost) && balanceKnown && balance < Number(costEntry?.cost ?? 0);

    /**
     * The stream to show.
     *
     * Falls back to the NEWEST request when nothing has been explicitly selected.
     * That is not a convenience: a stream can begin without this page's own submit
     * handler — a reconnect, or a request started before a navigation — and the first
     * version rendered the intro card while the answer was already streaming into
     * `requestsById`. In other words the user paid for an explanation and saw
     * nothing, which is the worst outcome this screen can produce.
     */
    const ordered = useMemo(() => Object.values(requestsById), [requestsById]);
    const active = activeId ? requestsById[activeId] : (ordered[ordered.length - 1] ?? null);
    const streaming = active?.status === 'pending' || active?.status === 'streaming';

    /** Recent lookups, newest first, for the re-run row. */
    const recent = useMemo(() => ordered.filter((r) => r.word).slice(-6).reverse(), [ordered]);

    async function onExplain(e) {
        e?.preventDefault?.();
        setInputError(null);
        setSaved(false);

        const trimmed = word.trim();
        if (!trimmed) {
            setInputError(t('vocabCheck.wordRequired'));
            return;
        }
        try {
            const id = await start(trimmed);
            if (id) setActiveId(id);
        } catch (error) {
            /* `normalizeVocabularyExplainWord` throws INVALID_REQUEST for a word
               over 100 characters, and the guest path throws when quota-blocked.
               Both are the user's situation, not a crash. */
            setInputError(
                error?.code === 'INVALID_REQUEST'
                    ? t('vocabCheck.wordTooLong')
                    : error?.code === 'GUEST_DAILY_LIMIT_REACHED'
                      ? t('vocabCheck.quotaReached')
                      : t('common.error.generic')
            );
        }
    }

    function speak(text) {
        if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }

    async function onSave() {
        if (!active?.word) return;
        try {
            await addWord({
                word: active.word,
                meaning: t('vocabCheck.savedFromExplain'),
                explanation: active.markdown?.slice(0, 2000),
                sourceType: 'AI_LOOKUP',
            });
            setSaved(true);
        } catch {
            setInputError(t('common.error.generic'));
        }
    }

    return (
        <>
            {/* The anchor strip. Same surface/border tokens as the landing header
                and the shell header, but slimmer and with nothing in it that needs
                an account. Deliberately NOT a <nav>: this surface has no
                navigation, and App.test.jsx asserts that no nav landmark renders
                here. A fragment rather than a page wrapper: `body` already carries
                the canvas background and `min-height: 100dvh`, so nothing else is
                needed to keep this surface full-bleed. */}
            <header className="sticky top-0 z-30 border-b-2 border-[var(--border)] bg-[var(--surface)]">
                <div className="mx-auto flex min-h-14 w-full max-w-[820px] items-center gap-3 px-3.5">
                    <Link to="/" className="flex items-center gap-2.5">
                        <Lexi mood="idle" size="xs" eager />
                        <span className="t-label">{t('common.appName')}</span>
                    </Link>
                    <span className="flex-1" />
                    <ButtonLink to="/login" size="sm" variant="primary">
                        {t('common.login')}
                    </ButtonLink>
                </div>
            </header>

            <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4 px-3.5 pt-5 pb-10">
                <p className="t-micro muted">{t('vocabCheck.subtitle')}</p>
                {/* Why this screen has no shell around it, said in words rather than
                    left for the visitor to interpret as a broken page. */}
                <p className="t-micro muted">{t('landing.guestCaveat')}</p>

                {/* --- the input ------------------------------------------------ */}
                <Card level="edge" padding="xl">
                    <form onSubmit={onExplain} className="flex flex-col gap-3">
                        <label className="flex flex-col gap-1.5">
                            <span className="t-label">{t('vocabCheck.wordLabel')}</span>
                            <span className="flex gap-2">
                                <span className="relative flex flex-1 items-center">
                                    <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 text-[var(--ink-muted)]" />
                                    <input
                                        className="min-h-12 w-full rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] pl-11 pr-3.5"
                                        placeholder={t('vocabCheck.wordPlaceholder')}
                                        value={word}
                                        onChange={(e) => setWord(e.target.value)}
                                        autoComplete="off"
                                        autoCapitalize="none"
                                        spellCheck="false"
                                        aria-describedby={inputError ? 'word-error' : undefined}
                                    />
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="md"
                                    iconOnly
                                    aria-label={t('dictionary.listen')}
                                    onClick={() => speak(word)}
                                    disabled={!word.trim()}
                                >
                                    <Volume2 size={18} aria-hidden="true" />
                                </Button>
                            </span>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="t-label">{t('vocabCheck.contextLabel')}</span>
                            <textarea
                                className="min-h-[84px] resize-y rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] p-3.5"
                                placeholder={t('vocabCheck.contextPlaceholder')}
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                rows={3}
                            />
                            <span className="t-micro muted">{t('vocabCheck.contextHint')}</span>
                        </label>

                        {inputError ? (
                            <p id="word-error" role="alert" className="t-micro flex items-center gap-2 text-[var(--wrong)]">
                                <AlertTriangle size={14} aria-hidden="true" />
                                {inputError}
                            </p>
                        ) : null}

                        {/* THE COST IS HERE, ON THE BUTTON, BEFORE IT IS PRESSED. */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={streaming || insufficient}
                                aria-describedby={insufficient ? 'cost-note' : undefined}
                            >
                                {streaming ? (
                                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                                ) : (
                                    <Sparkles size={18} aria-hidden="true" />
                                )}
                                {cost ? t('vocabCheck.explainWithCost', { amount: cost.amountLabel }) : t('vocabCheck.explain')}
                            </Button>

                            {streaming ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="md"
                                    onClick={() => {
                                        cancel(activeId);
                                        setActiveId(null);
                                    }}
                                >
                                    <X size={16} aria-hidden="true" />
                                    {t('common.cancel')}
                                </Button>
                            ) : null}

                            <span id="cost-note" className="t-micro muted flex items-center gap-1.5">
                                <Coins size={14} aria-hidden="true" />
                                {insufficient
                                    ? t('vocabCheck.insufficient', {
                                          need: Number(costEntry?.cost ?? 0),
                                          have: balanceKnown ? balance : '—',
                                      })
                                    : t('vocabCheck.freeNote')}
                            </span>
                        </div>

                        {!isConnected ? (
                            <p className="t-micro muted flex items-center gap-2">
                                <Clock size={14} aria-hidden="true" />
                                {t('vocabCheck.connecting')}
                            </p>
                        ) : null}
                    </form>
                </Card>

                {/* --- the streamed answer -------------------------------------- */}
                {active ? (
                    <Card level="hero" padding="xl" aria-live="polite" aria-busy={streaming}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <h2 className="t-h2 break-words">{active.word}</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    iconOnly
                                    aria-label={t('dictionary.listen')}
                                    onClick={() => speak(active.word)}
                                >
                                    <Volume2 size={16} aria-hidden="true" />
                                </Button>
                            </div>
                            <Chip tone={active.status === 'error' ? 'wrong' : streaming ? 'amber' : 'teal'}>
                                {t(
                                    active.status === 'error'
                                        ? 'vocabCheck.statusError'
                                        : streaming
                                          ? 'vocabCheck.statusStreaming'
                                          : 'vocabCheck.statusComplete'
                                )}
                            </Chip>
                        </div>

                        {active.status === 'error' ? (
                            <div role="alert" className="mt-3 flex gap-3">
                                <span aria-hidden="true" className="text-[var(--wrong)]">
                                    <AlertTriangle size={20} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <strong className="t-label block">{t('vocabCheck.streamError')}</strong>
                                    <p className="t-micro muted mt-1">
                                        {active.errorCode === 'INSUFFICIENT_CREDIT'
                                            ? t('common.error.notEnoughCreditsHint')
                                            : (active.errorMessage ?? t('common.error.generic'))}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Markdown content={active.markdown} className="mt-3" />
                                {/* Two skeleton lines while streaming: a bare spinner
                                    would hide how much is already readable. */}
                                {streaming ? (
                                    <div className="mt-3 flex flex-col gap-2" aria-hidden="true">
                                        <span className="block h-3.5 w-full animate-pulse rounded bg-[var(--surface-alt)]" />
                                        <span className="block h-3.5 w-3/5 animate-pulse rounded bg-[var(--surface-alt)]" />
                                    </div>
                                ) : null}
                            </>
                        )}

                        {active.status === 'complete' ? (
                            <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-[var(--border)] pt-3.5">
                                <Button size="sm" variant="secondary" onClick={onSave} disabled={saved}>
                                    {saved ? <Check /> : <BookPlus size={15} aria-hidden="true" />}
                                    {saved ? t('vocabCheck.saved') : t('vocabCheck.saveToNotebook')}
                                </Button>
                                <ButtonLink size="sm" variant="ghost" to="/dictionary">
                                    {t('vocabTest.openDictionary')}
                                </ButtonLink>
                            </div>
                        ) : null}
                    </Card>
                ) : (
                    <Card level="flat" padding="xl" className="flex items-center gap-4">
                        <Lexi mood="explain" size="md" />
                        <p className="t-body soft">{t('vocabCheck.intro')}</p>
                    </Card>
                )}

                {/* --- recent lookups ------------------------------------------- */}
                {recent.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        <span className="t-micro muted">{t('vocabCheck.recent')}</span>
                        <div className="flex flex-wrap gap-1.5">
                            {recent.map((r) => (
                                <button
                                    key={r.requestId}
                                    type="button"
                                    onClick={() => {
                                        setWord(r.word);
                                        setActiveId(r.requestId);
                                    }}
                                    aria-label={`${t('vocabCheck.reopen')}: ${r.word}`}
                                >
                                    <Chip tone={r.requestId === activeId ? 'teal' : 'neutral'}>{r.word}</Chip>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-center">
                    <Link to="/dictionary" className="t-label text-[var(--teal)]">
                        {t('vocabCheck.goToNotebook')}
                    </Link>
                </div>
            </div>
        </>
    );
}
