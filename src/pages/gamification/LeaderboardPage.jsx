import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Trophy,
    Minus,
    TrendingUp,
    TrendingDown,
    Info,
    Users,
} from "lucide-react";
import { Lexi } from "../../components/mascot/Lexi";
import { Card, RowBox } from "../../components/ui/Card";
import { ButtonLink } from "../../components/ui/Button";
import { Chip, Stat, SkeletonCard } from "../../components/ui/Primitives";
import { AsyncBoundary } from "../../components/ui/AsyncBoundary";
import { cn } from "../../lib/cn";
import {
    useLeaderboard,
    LEADERBOARD_PERIODS,
} from "../../features/gamification/useGamification";

/**
 * Leaderboard — `/leaderboard` (screen 28).
 *
 * THE RANK-HUMBLE RULE IS STRUCTURAL HERE, not a tone-of-voice choice. The product's
 * gamification ethics commit to a leaderboard that does not pressure people, and this
 * screen implements that by:
 *
 *  - Showing the user's OWN position as a plain fact — rank, XP, and how much XP the next
 *    rank needs — rather than as a threat. There is no "you are falling behind".
 *  - **Not treating a tie as a single winner.** Verified: two accounts with 50 XP BOTH
 *    came back as `rank: 1`. The rows are keyed by `userId`, and a tie is displayed as a
 *    tie rather than sorted into an arbitrary 1st and 2nd.
 *  - Saying "unranked" when `myRank` is null, which is the real state of an account with
 *    no XP (verified), instead of rendering rank 0 — which reads as either first place or
 *    last place, both wrong.
 *  - Naming the leaderboard period, because "rank 4" means nothing without "this week".
 */
export default function LeaderboardPage() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState("WEEKLY");

    const { myRank, entries, loading, error, reload } = useLeaderboard({
        period,
        size: 20,
    });

    /**
     * Ranks are not unique, so compare against the PREVIOUS row rather than assuming a
     * sequence. A row whose rank equals the one above it is a tie.
     */
    const rows = entries.map((entry, i) => ({
        ...entry,
        tiedWithPrevious: i > 0 && entries[i - 1].rank === entry.rank,
    }));

    return (
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
            {/* --- the user's own position, stated calmly ------------------- */}
            <Card
                level="edge"
                padding="xl"
                className="flex flex-col gap-4 md:flex-row md:items-center"
            >
                <Lexi
                    mood={(myRank?.rank ?? 99) <= 3 ? "celebrate" : "happy"}
                    size="md"
                />
                <div className="min-w-0 flex-1">
                    {myRank ? (
                        <>
                            <span className="t-micro muted">
                                {t("leaderboard.yourPosition", {
                                    period: t(`leaderboard.period.${period}`),
                                })}
                            </span>
                            <div className="flex flex-wrap items-baseline gap-3">
                                <span className="font-mono text-4xl font-bold tabular-nums text-[var(--teal)]">
                                    {myRank.rank}
                                </span>
                                {myRank.totalParticipants ? (
                                    <span className="t-body soft">
                                        {t("leaderboard.ofParticipants", {
                                            count: myRank.totalParticipants,
                                        })}
                                    </span>
                                ) : null}
                            </div>
                            <p className="t-micro muted mt-1">
                                {myRank.xpToNextRank > 0
                                    ? t("leaderboard.xpToNext", {
                                          count: myRank.xpToNextRank,
                                      })
                                    : t("leaderboard.topOfBoard")}
                            </p>
                        </>
                    ) : (
                        <>
                            {/* `myRank` is null with no XP — the real new-account state. */}
                            <span className="t-h3 block">
                                {t("leaderboard.unrankedTitle")}
                            </span>
                            <p className="t-body soft mt-1">
                                {t("leaderboard.unrankedBody")}
                            </p>
                        </>
                    )}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                    <Stat
                        value={myRank?.xp ?? 0}
                        label={t("leaderboard.yourXp")}
                        tone="amber"
                    />
                    <ButtonLink to="/rewards" size="sm" variant="ghost">
                        {t("leaderboard.earnXp")}
                    </ButtonLink>
                </div>
            </Card>

            {/* --- period --------------------------------------------------- */}
            <div
                role="group"
                aria-label={t("leaderboard.periodLabel")}
                className="flex flex-wrap gap-1.5"
            >
                {LEADERBOARD_PERIODS.map((value) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={period === value}
                        onClick={() => setPeriod(value)}
                        className={cn(
                            "min-h-11 rounded-[var(--r-control)] px-3.5 text-sm font-bold",
                            period === value
                                ? "bg-[var(--teal)] text-[var(--on-teal)]"
                                : "bg-[var(--surface-alt)] text-[var(--ink-muted)]",
                        )}
                    >
                        {t(`leaderboard.period.${value}`)}
                    </button>
                ))}
            </div>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && rows.length === 0}
                onRetry={reload}
                skeleton={
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 6 }, (_, i) => (
                            <SkeletonCard key={i} lines={1} />
                        ))}
                    </div>
                }
                emptyTitle={t("leaderboard.emptyTitle")}
                emptyBody={t("leaderboard.emptyBody")}
                emptyAction={
                    <ButtonLink to="/rewards" size="sm" variant="primary">
                        {t("leaderboard.earnXp")}
                    </ButtonLink>
                }
            >
                <ul className="flex flex-col gap-2">
                    {rows.map((entry) => {
                        /* The medal is decoration; the NUMBER is the information. A
                           screen reader gets "rank 1" from the label below. */
                        const medal = entry.rank <= 3;
                        return (
                            <li key={entry.userId}>
                                <RowBox
                                    center
                                    className={cn(
                                        /* A tie is shown as a tie, not broken arbitrarily. */
                                        entry.tiedWithPrevious &&
                                            "border-l-4 border-l-[var(--amber)]",
                                    )}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            "t-mono grid size-10 shrink-0 place-items-center rounded-[var(--r-sm)] text-sm font-bold",
                                            medal
                                                ? "bg-[var(--amber-soft)] text-[var(--amber)]"
                                                : "bg-[var(--surface-alt)] text-[var(--ink-muted)]",
                                        )}
                                    >
                                        {entry.rank}
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="t-label flex items-center gap-2 text-[var(--ink)]">
                                            {entry.displayName ??
                                                t("leaderboard.anonymous")}
                                            {medal ? (
                                                <Trophy
                                                    size={14}
                                                    className="text-[var(--amber)]"
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                        </span>
                                        <span className="t-micro muted">
                                            {t("leaderboard.rankLabel", {
                                                rank: entry.rank,
                                            })}
                                            {entry.tiedWithPrevious
                                                ? ` · ${t("leaderboard.tied")}`
                                                : ""}
                                            {entry.currentStreak > 0
                                                ? ` · ${t("common.streakDays", { count: entry.currentStreak })}`
                                                : ""}
                                        </span>
                                    </span>

                                    <span className="flex shrink-0 items-center gap-2">
                                        {/* A rank change is a measured movement, never a warning. */}
                                        {entry.rankChange ? (
                                            <Chip
                                                tone={
                                                    entry.rankChange > 0
                                                        ? "correct"
                                                        : "neutral"
                                                }
                                                icon={
                                                    entry.rankChange > 0
                                                        ? TrendingUp
                                                        : TrendingDown
                                                }
                                            >
                                                {entry.rankChange > 0
                                                    ? `+${entry.rankChange}`
                                                    : entry.rankChange}
                                            </Chip>
                                        ) : (
                                            <Minus
                                                size={14}
                                                className="text-[var(--ink-faint)]"
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span className="t-mono tabular-nums text-[var(--amber)]">
                                            {entry.xp}
                                        </span>
                                    </span>
                                </RowBox>
                            </li>
                        );
                    })}
                </ul>
            </AsyncBoundary>

            {/* The product's own framing, stated where a user might feel ranked. */}
            <Card level="flat" padding="lg">
                <div className="flex items-start gap-3">
                    <Info
                        size={16}
                        className="mt-0.5 shrink-0 text-[var(--ink-muted)]"
                        aria-hidden="true"
                    />
                    <p className="t-micro soft">
                        {t("leaderboard.ethicsNote")}
                    </p>
                </div>
            </Card>

            <div className="flex items-center justify-center gap-3">
                <Users
                    size={16}
                    className="text-[var(--ink-muted)]"
                    aria-hidden="true"
                />
                <ButtonLink to="/challenges" size="sm" variant="ghost">
                    {t("nav.challenges")}
                </ButtonLink>
                <ButtonLink to="/rewards" size="sm" variant="ghost">
                    {t("nav.rewards")}
                </ButtonLink>
            </div>
        </div>
    );
}
