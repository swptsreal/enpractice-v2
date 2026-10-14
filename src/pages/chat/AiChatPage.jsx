import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Lexi } from "../../components/mascot/Lexi";
import { Button } from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Primitives";
import { AsyncBoundary } from "../../components/ui/AsyncBoundary";
import { useAiChat } from "../../features/chat/useAiChat";
import { ChatLog } from "../../features/chat/ChatLog";
import { useProfile } from "../../features/profile/useProfile";
import { useCredit } from "../../contexts/CreditContextCore";
import { CREDIT_ACTIONS } from "../../features/credits/creditConstants";
import { getCreditCostDisplay } from "../../features/credits/creditPolicy";

/**
 * AI coach — `/ai-chat` (screen 36).
 *
 * LEXI'S OPENING MESSAGE CARRIES REAL DATA. The design is explicit: the coach should
 * demonstrate it knows the user BEFORE asking them anything. So the first bubble is built
 * from `GET /user/profile` — `weakSkills`, `recommendedPractice` and `overview` — and
 * when the account is too new to have any of it, the opening says THAT rather than
 * inventing a weakness. A brand-new account has `weakSkills: []`, and telling someone
 * they are "weak at Matching Headings" when they have never answered a question would be
 * the single most damaging lie this screen could tell.
 *
 * THE COST IS ON THE SEND BUTTON, and the balance sits in the header, so the price of the
 * next message is visible before it is typed. Same rule as the explain and marking
 * screens.
 *
 * THE STREAMING STATE IS A SKELETON LINE INSIDE THE BUBBLE, not a separate spinner, so
 * the answer grows in place where it will end up.
 *
 * Message rendering goes through `Markdown`, which does NOT use `rehype-raw` — the
 * content is model output, so raw HTML stays inert.
 */
const SUGGESTIONS = [
    "aiChat.suggestion1",
    "aiChat.suggestion2",
    "aiChat.suggestion3",
    "aiChat.suggestion4",
];

export default function AiChatPage() {
    const { t } = useTranslation();
    const chat = useAiChat();
    const { profile } = useProfile();
    const credit = useCredit();

    const [draft, setDraft] = useState("");
    const logRef = useRef(null);

    const costEntry = credit.getCost(CREDIT_ACTIONS.AI_CHAT);
    const cost = getCreditCostDisplay(costEntry);
    const balance = credit.availableBalance;
    const balanceKnown = balance !== null && balance !== undefined;
    const affordable =
        !cost || !balanceKnown || balance >= Number(costEntry?.cost ?? 0);

    /**
     * Lexi's opening line, built ONLY from data the account actually has.
     *
     * `weakSkills` is empty for a new account (verified), so the three cases are distinct:
     * a named weakness, some practice but nothing ranked yet, and nothing at all.
     */
    const opening = useMemo(() => {
        const weak = profile?.weakSkills ?? [];
        const overview = profile?.overview ?? {};
        const studied =
            (overview.totalLessonsCompleted ?? 0) > 0 ||
            (overview.totalStudyMinutes ?? 0) > 0;

        if (weak.length > 0) {
            return {
                key: "aiChat.openingWithWeakness",
                values: { skills: weak.slice(0, 2).join(", ") },
            };
        }
        if (studied) {
            return { key: "aiChat.openingNoWeakness", values: {} };
        }
        return { key: "aiChat.openingNewAccount", values: {} };
    }, [profile?.weakSkills, profile?.overview]);

    /* Keep the newest message in view as it streams. */
    useEffect(() => {
        const node = logRef.current;
        if (node) node.scrollTop = node.scrollHeight;
    }, [chat.messages]);

    async function onSubmit(e) {
        e.preventDefault();
        const content = draft.trim();
        if (!content || chat.sending || !affordable) return;
        setDraft("");
        const ok = await chat.send(content);
        /* A failed send keeps the text so it is not lost. The optimistic bubble already
           shows it as failed, so restoring the composer would duplicate it — instead the
           bubble itself offers a retry. */
        if (!ok) setDraft(content);
    }

    return (
        <div className="mx-auto flex h-[calc(100dvh-var(--shell-header)-var(--shell-tabbar)-24px)] lg:h-[calc(100dvh-var(--shell-header)-60px)] w-full max-w-[780px] flex-col gap-3">
            {/* --- header: back, Lexi xs, title/subtitle (hidden on mobile) --- */}
            <div className="hidden lg:flex shrink-0 items-center gap-3 rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[0_var(--edge)_0_0_var(--border)]">
                <Lexi mood="idle" size="xs" />
                <div className="min-w-0 flex-1">
                    <h2 className="t-label truncate text-[var(--ink)]">
                        {t("aiChat.title")}
                    </h2>
                    <p className="t-micro muted truncate">
                        {t("aiChat.subtitle")}
                    </p>
                </div>
            </div>

            {/* --- the log --- */}
            <div className="flex flex-1 min-h-0 flex-col">
                <AsyncBoundary
                    loading={chat.historyLoading}
                    error={chat.historyError}
                    onRetry={chat.reload}
                    skeleton={
                        <div className="flex flex-col gap-3">
                            <SkeletonCard lines={2} />
                            <SkeletonCard lines={3} />
                        </div>
                    }
                    isEmpty={false}
                >
                    {/* The log is shared with the floating panel (`ChatLog`), so the two cannot drift:
                        the failed-send retry and the skeleton-inside-the-bubble live in one place. */}
                    <ChatLog
                        chat={chat}
                        opening={opening}
                        logRef={logRef}
                        className="flex flex-1 min-h-0 flex-col gap-3.5 overflow-y-auto p-1"
                    />
                </AsyncBoundary>
            </div>

            {/* --- suggestions: single row --- */}
            <div className="flex shrink-0 flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {SUGGESTIONS.map((key) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setDraft(t(key))}
                        disabled={chat.sending}
                        className="inline-flex h-[30px] shrink-0 whitespace-nowrap items-center rounded-[var(--r-chip)] border-2 border-[var(--border-strong)] bg-transparent px-3 text-[0.8125rem] font-bold tracking-[0.01em] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] cursor-pointer disabled:opacity-50"
                    >
                        {t(key)}
                    </button>
                ))}
            </div>

            {/* --- 1-line composer (.chat__input) --- */}
            <form onSubmit={onSubmit} className="chat__input shrink-0">
                <label className="min-w-0 flex-1">
                    <span className="sr-only">{t("aiChat.composerLabel")}</span>
                    <input
                        className="chat__input-field"
                        value={draft}
                        onChange={(e) =>
                            setDraft(
                                e.target.value.slice(0, chat.maxCharacters),
                            )
                        }
                        placeholder={t("aiChat.composerPlaceholder")}
                        maxLength={chat.maxCharacters}
                    />
                </label>

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!draft.trim() || chat.sending || !affordable}
                >
                    {chat.sending ? (
                        <Loader2
                            size={18}
                            className="animate-spin"
                            aria-hidden="true"
                        />
                    ) : (
                        <ArrowRight size={18} aria-hidden="true" />
                    )}
                    <span>
                        {cost
                            ? t("aiChat.sendWithCost", {
                                  amount: cost.amountLabel,
                              })
                            : t("aiChat.send")}
                    </span>
                </Button>
            </form>
            {!chat.isConnected ? (
                <div className="flex shrink-0 items-center justify-between px-1">
                    <span className="t-micro muted inline-flex items-center gap-1.5">
                        <Sparkles size={13} aria-hidden="true" />
                        {t("aiChat.connecting")}
                    </span>
                </div>
            ) : null}

            {chat.sendError ? (
                <p
                    role="alert"
                    className="t-micro shrink-0 text-center text-[var(--wrong)]"
                >
                    {chat.sendError.message === "INVALID_REQUEST"
                        ? t("aiChat.messageRequired")
                        : t("common.error.generic")}
                </p>
            ) : null}
        </div>
    );
}
