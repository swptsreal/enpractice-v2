import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Send, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Lexi } from "../components/mascot/Lexi";
import { ChatLog } from "../features/chat/ChatLog";
import { ChatComposerField } from "../features/chat/ChatVoice";
import { useAiChat } from "../features/chat/useAiChat";
import { CREDIT_ACTIONS } from "../features/credits/creditConstants";
import { getCreditCostDisplay } from "../features/credits/creditPolicy";
import { useCredit } from "../contexts/CreditContextCore";

/**
 * Lexi in a panel: the floating helper's conversation, without leaving the screen.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────────
 *
 * The 56px helper used to be a `<Link to="/ai-chat">`, so "Hỏi Lexi" navigated AWAY from whatever
 * the learner was doing — and the question is nearly always about that screen ("vì sao câu này
 * sai?"). `_design/DESIGN-V2.md` §7.3 has always said "Opens the Lexi panel", so the mockup was the
 * half that was wrong and the app followed it. Designed as `_design/mockup/36b-lexi-panel.html`.
 *
 * ── NON-MODAL, DELIBERATELY ───────────────────────────────────────────────────
 *
 * `aria-modal="false"` and no backdrop: the page behind stays readable and scrollable, which is the
 * whole point — a learner reading a passage must be able to keep reading it while asking about it.
 * Claiming a modal would trap focus and dim the very content the question is about.
 *
 * ── WHAT IT SHARES WITH /ai-chat ──────────────────────────────────────────────
 *
 * `useAiChat` (the ported state machine), `ChatLog` and `ChatBubble`, so the conversation cannot
 * look or behave differently in the two places. What it does NOT do is call `useProfile()` for a
 * data-aware greeting: that request would then fire on every shell screen for a panel most visits
 * never open. The panel greets with the CONTEXT it already has — which screen you are on — and
 * `/ai-chat` remains the surface that knows your weak skills.
 */
export default function LexiPanel({ contextLabel, onClose }) {
    const { t } = useTranslation();
    const chat = useAiChat();
    const credit = useCredit();

    const [draft, setDraft] = useState("");
    const logRef = useRef(null);
    const inputRef = useRef(null);

    const costEntry = credit.getCost(CREDIT_ACTIONS.AI_CHAT);
    const cost = getCreditCostDisplay(costEntry);
    const balance = credit.availableBalance;
    const balanceKnown = balance !== null && balance !== undefined;
    const affordable =
        !cost || !balanceKnown || balance >= Number(costEntry?.cost ?? 0);

    /* Focus the composer on open: the panel exists to be typed into, and a keyboard user should not
       have to tab through the shell to reach it. */
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    /* Escape closes. The shell owns the focus RETURN (it focuses the helper button), because the
       button is the thing that knows it opened this panel. */
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    /* Keep the newest message in view as it streams. */
    useEffect(() => {
        const node = logRef.current;
        if (node) node.scrollTop = node.scrollHeight;
    }, [chat.messages]);

    async function onSubmit(event) {
        event.preventDefault();
        const content = draft.trim();
        if (!content || chat.sending || !affordable) return;
        setDraft("");
        const ok = await chat.send(content);
        /* A failed send keeps the text: it is the learner's own sentence. The optimistic bubble
           already shows the failure with a retry, so the composer is restored rather than the text
           being lost. */
        if (!ok) setDraft(content);
    }

    return (
        <section
            id="lexi-panel"
            role="dialog"
            aria-modal="false"
            aria-label={t("a11y.askLexi")}
            /* Bottom sheet above the tab bar on phones, 380px popover bottom-right at >=1024px. A
               380px panel next to a 56px button does not fit a 390px screen. */
            className="fixed inset-x-3 bottom-[calc(var(--shell-tabbar)+88px)] z-40 flex flex-col gap-3 rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-[0_16px_36px_-14px_rgb(20_35_43/0.4)] lg:inset-x-auto lg:right-4 lg:bottom-[88px] lg:w-[380px]"
        >
            <header className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2.5">
                    <Lexi mood="thinking" size="xs" />
                    <span className="min-w-0">
                        <strong className="t-label block">
                            {t("a11y.askLexi")}
                        </strong>
                        {/* What she can see, said rather than left to be guessed. */}
                        <span className="t-micro muted block truncate">
                            {t("aiChat.panelContext", { page: contextLabel })}
                        </span>
                    </span>
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={t("common.close")}
                    onClick={onClose}
                >
                    <X size={18} aria-hidden="true" />
                </Button>
            </header>

            <ChatLog
                chat={chat}
                opening={{
                    key: "aiChat.panelOpening",
                    values: { page: contextLabel },
                }}
                logRef={logRef}
                className="flex max-h-[42vh] min-h-[160px] flex-col gap-3 overflow-y-auto p-0.5"
            />

            {/* Three suggestions, not ten: single row with horizontal scroll. */}
            <div className="flex shrink-0 flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {[
                    "aiChat.suggestion1",
                    "aiChat.suggestion2",
                    "aiChat.suggestion3",
                ].map((key) => (
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

            <form
                onSubmit={onSubmit}
                className="flex flex-col gap-1.5 border-t-2 border-[var(--border)] pt-3"
            >
                <div className="flex items-center gap-2">
                    <ChatComposerField
                        value={draft}
                        onChange={setDraft}
                        maxLength={chat.maxCharacters}
                        placeholder={t("aiChat.composerPlaceholder")}
                        label={t("aiChat.composerLabel")}
                        inputClassName="min-h-11 w-full rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
                        inputRef={inputRef}
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        iconOnly
                        aria-label={
                            cost
                                ? t("aiChat.sendWithCost", {
                                      amount: cost.amountLabel,
                                  })
                                : t("aiChat.send")
                        }
                        disabled={!draft.trim() || chat.sending || !affordable}
                    >
                        {chat.sending ? (
                            <Loader2
                                size={18}
                                className="animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <Send size={18} aria-hidden="true" />
                        )}
                    </Button>
                </div>
                {/* Cost before the press, and the connection state, because a panel that silently
                    receives nothing is the hardest failure to notice. */}
                <span className="t-micro muted flex flex-wrap items-center gap-x-2">
                    <span>{affordable ? t('aiChat.costNote') : t('aiChat.insufficient')}</span>
                    <span>·</span>
                    <span>{balanceKnown ? t('aiChat.balance', { count: balance }) : '—'}</span>
                    {!chat.isConnected ? <span>· {t('aiChat.connecting')}</span> : null}
                </span>
                {chat.sendError ? (
                    <p role="alert" className="t-micro text-[var(--wrong)]">
                        {chat.sendError.message === "INVALID_REQUEST"
                            ? t("aiChat.messageRequired")
                            : t("common.error.generic")}
                    </p>
                ) : null}
            </form>
        </section>
    );
}
