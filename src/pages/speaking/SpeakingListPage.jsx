import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Clock, Loader2, TrendingUp, AlertTriangle, MessageSquare } from "lucide-react";
import { Lexi } from "../../components/mascot/Lexi";
import { Card } from "../../components/ui/Card";
import { ButtonLink } from "../../components/ui/Button";
import { Chip, SkeletonCard } from "../../components/ui/Primitives";
import { AsyncBoundary } from "../../components/ui/AsyncBoundary";
import { MicrophoneNotice } from "../../components/speaking/RecordingControl";
import { cn } from "../../lib/cn";
import { useCredit } from "../../contexts/CreditContextCore";
import { CREDIT_ACTIONS } from "../../features/credits/creditConstants";
import { getCreditCostDisplay } from "../../features/credits/creditPolicy";
import {
    PARTS,
    isGrading,
    isGradingFailed,
    useSpeakingTopics,
    useSpeakingHighestScores,
    useMicrophoneStatus,
} from "../../features/speaking/useSpeaking";

/**
 * Speaking topics — `/speaking` (screen 24).
 *
 * THE MICROPHONE NOTICE SITS ABOVE THE LIST, which is the design's explicit correction
 * to v1. v1 told the user about the permission dialog only when they pressed record, by
 * which point they were staring at a browser prompt with no context and often on plain
 * HTTP where `getUserMedia` does not exist at all. `useMicrophoneStatus` distinguishes
 * three real cases — insecure context, unsupported browser, and available — and the
 * notice says which one applies before any button is pressed.
 *
 * TWO MODES PER TOPIC, AND PART 2 HAS ONE. A card offers the practice attempt and the AI
 * conversation; a cue-card topic has no follow-up questions, so the backend's own
 * `totalExpectedQuestions` is 1 and v1 gated the same button on `part !== 'PART_2'`.
 *
 * THE COST IS CLAIMED WHERE THE CHARGE HAPPENS. The conversation button carries it, because
 * `POST /speaking/conversations/start` charges when it is pressed. The practice button does
 * not, because practice charges at SUBMIT — a control that lives on screen 25 — so a cost chip
 * here would be a claim about a moment that has not arrived. The charge is idempotent per
 * `userId + mode + topicId`, so a topic that already paid for a conversation shows the button
 * with no cost at all.
 *
 * THE PART FILTER IS A REAL QUERY PARAM (`GET /speaking/topics?part=`), not a client-side view,
 * which is why it is a segmented row rather than v1's mode pills. v1's third pill ("Đề ngẫu
 * nhiên") had no endpoint behind it at all.
 */
/**
 * Static label tables, because `t()` keys must be literals.
 *
 * The backend sends ENUMS (`PART_1`, `EASY`) while the locale files are not consistent about
 * case: `speaking.part` is stored UPPERCASE but `ielts.difficulty` is stored lowercase. Building
 * the key by interpolation made that mismatch invisible to the i18n audit — it only checks calls
 * written with a quoted literal — so `ielts.difficulty.EASY` resolved to nothing and the raw key
 * was printed on the card. A table cannot drift that way: a wrong value shows up as a missing key
 * in review, not as `ielts.difficulty.EASY` in front of a learner.
 */
const PART_LABEL_KEYS = {
    PART_1: "speaking.part.PART_1",
    PART_2: "speaking.part.PART_2",
    PART_3: "speaking.part.PART_3",
};

const DIFFICULTY_LABEL_KEYS = {
    EASY: "ielts.difficulty.easy",
    MEDIUM: "ielts.difficulty.medium",
    HARD: "ielts.difficulty.hard",
};

export default function SpeakingListPage() {
    const { t } = useTranslation();
    const [part, setPart] = useState(null);
    const credit = useCredit();

    const micStatus = useMicrophoneStatus();
    const { items, loading, error, reload } = useSpeakingTopics({ part });

    const topicIds = useMemo(() => items.map((topic) => topic.id), [items]);
    const scores = useSpeakingHighestScores(topicIds);

    const costEntry = credit.getCost(CREDIT_ACTIONS.SPEAKING_START);
    const cost = getCreditCostDisplay(costEntry);

    return (
        <div className="flex flex-col gap-4">
            <p className="t-micro muted">{t("speaking.subtitle")}</p>

            <MicrophoneNotice status={micStatus} />
            {/* THE CREDIT RULE IS STATED ONLY WHEN THERE IS ONE. The backend's cost table can
                answer `mode: DISABLED` for every action, and in that configuration nothing is
                charged at all — so printing "hội thoại trừ ngay khi bắt đầu" would be a claim
                about money that never moves. Verified against the running backend, where the
                whole table is currently DISABLED. */}
            {cost ? <p className="t-micro muted px-1">{t("speaking.creditNotice")}</p> : null}

            <div
                role="group"
                aria-label={t("speaking.filterLabel")}
                className="flex flex-wrap gap-1.5"
            >
                {[null, ...PARTS].map((value) => (
                    <button
                        key={value ?? "ALL"}
                        type="button"
                        aria-pressed={part === value}
                        onClick={() => setPart(value)}
                        className={cn(
                            "min-h-11 rounded-[var(--r-control)] px-3.5 text-sm font-bold",
                            part === value
                                ? "bg-[var(--teal)] text-[var(--on-teal)]"
                                : "bg-[var(--surface-alt)] text-[var(--ink-muted)]",
                        )}
                    >
                        {value
                            ? t(PART_LABEL_KEYS[value] ?? "speaking.filterAll")
                            : t("speaking.filterAll")}
                    </button>
                ))}
            </div>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && items.length === 0}
                onRetry={reload}
                skeleton={
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }, (_, i) => (
                            <SkeletonCard key={i} lines={3} />
                        ))}
                    </div>
                }
                emptyTitle={t("speaking.emptyTitle")}
                emptyBody={t("speaking.emptyBody")}
                emptyMood="explain"
            >
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((topic) => {
                        const score = scores[topic.id];
                        const grading =
                            score?.attempted && isGrading(score.status);
                        const failed =
                            score?.attempted && isGradingFailed(score.status);
                        const band = score?.highestBandScore;

                        /* Which mode the band belongs to. The endpoint returns `sourceType`
                           directly and falls back to the ids it also returns, so a payload that
                           lacks the field still says something true. */
                        const sourceType =
                            score?.sourceType ??
                            (score?.conversationId
                                ? "CONVERSATION"
                                : score?.attemptId
                                  ? "PRACTICE"
                                  : null);
                        const fromConversation = sourceType === "CONVERSATION";

                        /* Resume: an in-progress conversation is unfinished work, and the row's
                           primary action is the one that continues it. */
                        const conversationInProgress =
                            Boolean(score?.conversationId) &&
                            score?.status === "IN_PROGRESS";
                        const canConverse = topic.part !== "PART_2";

                        return (
                            <li key={topic.id}>
                                <Card
                                    level="edge"
                                    padding="md"
                                    className="flex h-full flex-col"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Chip tone="neutral">
                                            {t(
                                                PART_LABEL_KEYS[topic.part] ??
                                                    "speaking.filterAll",
                                            )}
                                        </Chip>
                                        {topic.difficulty ? (
                                            <Chip tone="amber">
                                                {t(
                                                    DIFFICULTY_LABEL_KEYS[
                                                        topic.difficulty
                                                    ] ??
                                                        "ielts.difficulty.easy",
                                                )}
                                            </Chip>
                                        ) : null}
                                        {grading ? (
                                            <Chip tone="amber" icon={Loader2}>
                                                {t("speaking.statusGrading")}
                                            </Chip>
                                        ) : failed ? (
                                            <Chip
                                                tone="wrong"
                                                icon={AlertTriangle}
                                            >
                                                {t("speaking.statusFailed")}
                                            </Chip>
                                        ) : band != null ? (
                                            <>
                                                <Chip tone="teal" icon={TrendingUp}>
                                                    {Number(band).toFixed(1)}
                                                </Chip>
                                                {fromConversation ? (
                                                    <Chip
                                                        tone="teal"
                                                        icon={MessageSquare}
                                                    >
                                                        {t(
                                                            "speaking.card.conversationSource",
                                                        )}
                                                    </Chip>
                                                ) : null}
                                            </>
                                        ) : null}
                                    </div>

                                    <h3 className="t-h3 mt-3 line-clamp-4">
                                        {topic.question}
                                    </h3>

                                    <div className="mt-auto flex flex-col gap-2 pt-4">
                                        <ButtonLink
                                            to={`/speaking/practice/${topic.id}`}
                                            variant={
                                                grading || failed
                                                    ? "ghost"
                                                    : "primary"
                                            }
                                            size="sm"
                                            block
                                        >
                                            {grading
                                                ? t("speaking.viewStatus")
                                                : failed
                                                  ? t("speaking.tryAgain")
                                                  : band != null
                                                    ? t(
                                                          "speaking.practiceAgain",
                                                      )
                                                    : t("speaking.start")}
                                        </ButtonLink>

                                        {canConverse ? (
                                            <ButtonLink
                                                to={
                                                    conversationInProgress
                                                        ? `/speaking/conversation/resume/${score.conversationId}`
                                                        : `/speaking/conversation/${topic.id}`
                                                }
                                                variant={
                                                    conversationInProgress
                                                        ? "primary"
                                                        : "ghost"
                                                }
                                                size="sm"
                                                block
                                            >
                                                <MessageSquare
                                                    size={15}
                                                    aria-hidden="true"
                                                />
                                                {conversationInProgress
                                                    ? t(
                                                          "speaking.resumeConversation",
                                                      )
                                                    : score?.conversationId
                                                      ? t(
                                                            "speaking.actions.conversation",
                                                        )
                                                      : cost
                                                        ? t(
                                                              "speaking.conversationWithCost",
                                                              {
                                                                  amount: cost.amountLabel,
                                                              },
                                                          )
                                                        : t(
                                                              "speaking.actions.conversation",
                                                          )}
                                            </ButtonLink>
                                        ) : null}

                                        {band != null && fromConversation ? (
                                            <Link
                                                to={`/speaking/conversation/result/${score.conversationId}`}
                                                className="t-micro text-center text-[var(--teal)]"
                                            >
                                                {t("speaking.viewResult")}
                                            </Link>
                                        ) : band != null && score?.attemptId ? (
                                            <Link
                                                to={`/speaking/result/${score.attemptId}`}
                                                className="t-micro text-center text-[var(--teal)]"
                                            >
                                                {t("speaking.viewResult")}
                                            </Link>
                                        ) : null}
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            </AsyncBoundary>

            <div className="flex flex-wrap items-center justify-center gap-4">
                <Lexi mood="happy" size="xs" />
                <Link
                    to="/speaking/attempts"
                    className="t-label text-[var(--teal)]"
                >
                    {t("speaking.historyLink")}
                </Link>
                <span className="t-micro muted inline-flex items-center gap-1.5">
                    <Clock size={13} aria-hidden="true" />
                    {t("speaking.typicalLength")}
                </span>
            </div>
        </div>
    );
}
