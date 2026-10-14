import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Clock, Loader2, TrendingUp, AlertTriangle } from "lucide-react";
import { Lexi } from "../../components/mascot/Lexi";
import { Card } from "../../components/ui/Card";
import { ButtonLink } from "../../components/ui/Button";
import { Chip, SkeletonCard } from "../../components/ui/Primitives";
import { AsyncBoundary } from "../../components/ui/AsyncBoundary";
import { MicrophoneNotice } from "../../components/speaking/RecordingControl";
import { cn } from "../../lib/cn";
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
 * The part filter is a segmented row (`PART_1/2/3`) rather than v1's mode pills with a
 * "random topic" entry, because there is no random-topic endpoint: inventing a mode
 * that silently picks for you would hide which part you are practising.
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

    const micStatus = useMicrophoneStatus();
    const { items, loading, error, reload } = useSpeakingTopics({ part });

    const topicIds = useMemo(() => items.map((topic) => topic.id), [items]);
    const scores = useSpeakingHighestScores(topicIds);

    return (
        <div className="flex flex-col gap-4">
            <p className="t-micro muted">{t("speaking.subtitle")}</p>

            <MicrophoneNotice status={micStatus} />

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

                        return (
                            <li key={topic.id}>
                                <Card
                                    level="edge"
                                    padding="xl"
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
                                            <Chip tone="teal" icon={TrendingUp}>
                                                {Number(band).toFixed(1)}
                                            </Chip>
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
                                        {band != null && score?.attemptId ? (
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
