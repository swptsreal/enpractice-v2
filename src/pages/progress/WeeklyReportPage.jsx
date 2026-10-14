import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    CalendarRange,
    TrendingUp,
    TrendingDown,
    Minus,
    BookOpen,
    Mic,
    PenLine,
    BookMarked,
} from "lucide-react";
import { Lexi } from "../../components/mascot/Lexi";
import { Card, RowBox } from "../../components/ui/Card";
import { ButtonLink } from "../../components/ui/Button";
import { Chip, Stat, SkeletonCard } from "../../components/ui/Primitives";
import { AsyncBoundary } from "../../components/ui/AsyncBoundary";
import { useAsyncData } from "../../hooks/useAsyncData";
import { weeklyReportApi } from "../../api";
import { unwrapData } from "../../api/envelope";
import { formatDate } from "../../lib/datetime";

/**
 * Progress — `/weekly-report`.
 *
 * THE HONESTY REQUIREMENT HERE IS STRUCTURAL, not copy (same rule as screen 14).
 * `PRODUCT.md` forbids band-improvement claims, so every trend on this page is a
 * MEASURED delta that the backend computed (`Comparison.current/previousEquivalent/
 * delta`), reported as a count or a score — never as a promise about a future band.
 * When there is no previous equivalent to compare against, the delta is not rendered
 * at all rather than shown as 0% or as an improvement. `Comparison.deltaPercent` is a
 * nullable Double precisely because "no comparison" is a real state.
 *
 * THE "REPORT IS NOT READY" CASE IS AN EMPTY STATE, NOT AN ERROR — and the backend
 * currently gets this wrong. `GET /user/reports/weekly/current` throws
 * `ResponseStatusException(404, "Weekly report is not ready")`, but the global handler
 * flattens it to `HTTP 500` with a generic Vietnamese message, so the intended 404
 * never reaches the client. A new account has no report until its first week is
 * finalised, so the client has to recognise that message and show the empty state;
 * `isReportNotReady` does that. The 500 is recorded in the README as a backend bug —
 * the client should not have to pattern-match a message to recover a status code.
 *
 * The week's daily activity is a bar strip, which is honest about a 7-day window:
 * a state per day (ACTIVE / REST / NONE), so a quiet day is visible as a quiet day
 * rather than as a gap in the data.
 */
const DAY_STATES = ["ACTIVE", "PARTIAL", "REST", "NONE"];

/**
 * Enum -> STATIC i18n key, for the same reason as the credits action table:
 * an interpolated key needs a `defaultValue` for an unknown code, and the i18n audit
 * fails on inline `defaultValue` in a component. A lookup keeps the keys visible to
 * the audit and falls back to something readable.
 *
 * Highlight codes come from the backend's `Highlight.code`, so an unknown one is
 * rendered as the raw code rather than vanishing.
 */
const DAY_STATE_KEYS = {
    ACTIVE: "weekly.day_ACTIVE",
    PARTIAL: "weekly.day_PARTIAL",
    REST: "weekly.day_REST",
    NONE: "weekly.day_NONE",
};

const MODULE_STATUS_KEYS = {
    ACTIVE: "weekly.moduleStatus.ACTIVE",
    NO_DATA: "weekly.moduleStatus.NO_DATA",
    INACTIVE: "weekly.moduleStatus.INACTIVE",
};

const HIGHLIGHT_KEYS = {
    TOTAL_STUDY: "weekly.highlight.TOTAL_STUDY",
    ACTIVE_DAYS: "weekly.highlight.ACTIVE_DAYS",
    XP_EARNED: "weekly.highlight.XP_EARNED",
    IELTS_ACCURACY: "weekly.highlight.IELTS_ACCURACY",
    VOCAB_REVIEW_ACCURACY: "weekly.highlight.VOCAB_REVIEW_ACCURACY",
    WORDS_LEARNED: "weekly.highlight.WORDS_LEARNED",
    WRITING_BAND: "weekly.highlight.WRITING_BAND",
    SPEAKING_BAND: "weekly.highlight.SPEAKING_BAND",
};

const MODULES = [
    {
        key: "ielts",
        labelKey: "weekly.moduleIelts",
        icon: BookOpen,
        path: "/ielts",
    },
    {
        key: "speaking",
        labelKey: "weekly.moduleSpeaking",
        icon: Mic,
        path: "/speaking",
    },
    {
        key: "writing",
        labelKey: "weekly.moduleWriting",
        icon: PenLine,
        path: "/writing",
    },
    {
        key: "vocabulary",
        labelKey: "weekly.moduleVocabulary",
        icon: BookMarked,
        path: "/vocabulary",
    },
];

/** `ReportDraft`/`period` names the start date differently per endpoint; accept both. */
function readReport(response) {
    const data = unwrapData(response);
    if (!data) return null;
    return data;
}

/**
 * "This week's report is not ready yet" is a state, not a failure.
 *
 * The backend answers 404 while the current week has not been generated. It USED to arrive as a
 * 500 with the message below, because the backend's catch-all exception handler swallowed
 * `ResponseStatusException` — so this function matched the message TEXT to show "not ready yet"
 * instead of a server error the learner can do nothing about. That is fixed at the source now
 * (`GlobalExceptionHandler.handleResponseStatus`), and the status check below is the real one.
 *
 * The message match is kept deliberately as the compatibility path: an older backend deployment
 * still answers 500, and a wrong-but-tidy empty state beats a wrong-and-alarming error screen.
 */
export function isReportNotReady(error) {
    const status = error?.status ?? error?.response?.status;
    const message = String(
        error?.message ?? error?.response?.data?.message ?? "",
    );
    return status === 404 || /weekly report is not ready/i.test(message);
}

function TrendChip({ comparison }) {
    const { t } = useTranslation();
    if (
        !comparison ||
        comparison.delta === null ||
        comparison.delta === undefined
    )
        return null;

    const delta = Number(comparison.delta);
    const flat = Math.abs(delta) < 0.005;
    const up = delta > 0;
    const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
    const tone = flat ? "neutral" : up ? "correct" : "amber";

    return (
        <Chip tone={tone} icon={Icon}>
            {t("weekly.delta", {
                value: `${up && !flat ? "+" : ""}${delta.toFixed(1)}`,
            })}
        </Chip>
    );
}

export default function WeeklyReportPage() {
    const { t } = useTranslation();

    const loader = useCallback(
        () => weeklyReportApi.getCurrent().then(readReport),
        [],
    );
    const { data, loading, error, reload } = useAsyncData(
        loader,
        "weekly-report-current",
    );

    const overview = data?.overview;
    const highlights = data?.highlights ?? [];
    const modules = data?.modules;

    /**
     * `daily` is memoised rather than defaulted inline.
     *
     * `data?.dailyActivity ?? []` builds a NEW array on every render whenever the report
     * is absent, so any `useMemo` depending on it recomputes every time. That is the
     * shape of bug where a dependency looks stable but is not.
     */
    const daily = useMemo(
        () => data?.dailyActivity ?? [],
        [data?.dailyActivity],
    );

    const studyMinutes = useMemo(
        () =>
            overview?.totalStudySeconds
                ? Math.round(overview.totalStudySeconds / 60)
                : 0,
        [overview],
    );
    const maxDaySeconds = useMemo(
        () => Math.max(1, ...daily.map((d) => d.studySeconds ?? 0)),
        [daily],
    );

    const notReady = isReportNotReady(error);

    return (
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
            <AsyncBoundary
                loading={loading}
                error={notReady ? null : error}
                isEmpty={!loading && !notReady && !error && !data}
                onRetry={reload}
                skeleton={
                    <div className="flex flex-col gap-4">
                        <SkeletonCard lines={3} />
                        <SkeletonCard lines={4} />
                    </div>
                }
                emptyTitle={t("weekly.notReadyTitle")}
                emptyBody={t("weekly.notReadyBody")}
                emptyAction={
                    <ButtonLink to="/home" variant="primary" size="sm">
                        {t("nav.home")}
                    </ButtonLink>
                }
            >
                {/* A 500 that means "not ready" gets the same treatment as an empty
                    report, because that is what it is. */}
                {notReady ? (
                    <Card
                        level="flat"
                        padding="xl"
                        className="flex items-center gap-4"
                    >
                        <Lexi mood="sleepy" size="md" />
                        <div>
                            <h2 className="t-h3">
                                {t("weekly.notReadyTitle")}
                            </h2>
                            <p className="t-body soft mt-1">
                                {t("weekly.notReadyBody")}
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="flex flex-col gap-4">
                        <Card
                            level="hero"
                            padding="xl"
                            className="flex flex-col gap-4 md:flex-row md:items-center"
                        >
                            <Lexi mood="approve" size="lg" />
                            <div className="min-w-0 flex-1">
                                <span className="t-micro muted flex items-center gap-1.5">
                                    <CalendarRange
                                        size={13}
                                        aria-hidden="true"
                                    />
                                    {data?.weekStartAt && data?.weekEndAt
                                        ? t("weekly.period", {
                                              from:
                                                  formatDate(
                                                      data.weekStartAt,
                                                  ) ?? "—",
                                              to:
                                                  formatDate(data.weekEndAt) ??
                                                  "—",
                                          })
                                        : t("weekly.thisWeek")}
                                </span>
                                <h2 className="t-h2 mt-1">
                                    {t("weekly.headline", {
                                        count: studyMinutes,
                                    })}
                                </h2>
                                <p className="t-body soft mt-1">
                                    {t("weekly.measuredNote")}
                                </p>
                            </div>
                            {data?.status ? (
                                <Chip tone="teal">{data.status}</Chip>
                            ) : null}
                        </Card>

                        {/* --- overview numbers --------------------------------- */}
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            <Stat
                                value={studyMinutes}
                                label={t("weekly.studyMinutes")}
                                tone="teal"
                            />
                            <Stat
                                value={overview?.activeDays ?? 0}
                                label={t("weekly.activeDays")}
                            />
                            <Stat
                                value={overview?.meaningfulSessions ?? 0}
                                label={t("weekly.sessions")}
                            />
                            <Stat
                                value={overview?.xpEarned ?? 0}
                                label={t("weekly.xp")}
                                tone="amber"
                            />
                        </div>

                        {/* --- daily strip -------------------------------------- */}
                        {daily.length > 0 ? (
                            <Card level="edge" padding="xl">
                                <h2 className="t-h3">
                                    {t("weekly.dailyTitle")}
                                </h2>
                                <p className="t-micro muted mt-1">
                                    {t("weekly.dailyNote")}
                                </p>
                                <ul className="mt-3.5 flex items-end gap-1.5">
                                    {daily.map((day) => {
                                        /* Height encodes study time; the state is ALSO
                                           stated in the accessible name, so the bar is
                                           not a colour-only signal. */
                                        const pct = Math.round(
                                            ((day.studySeconds ?? 0) /
                                                maxDaySeconds) *
                                                100,
                                        );
                                        const state = DAY_STATES.includes(
                                            day.state,
                                        )
                                            ? day.state
                                            : "NONE";
                                        return (
                                            <li
                                                key={day.date}
                                                className="flex min-w-0 flex-1 flex-col items-center gap-1"
                                            >
                                                <span
                                                    role="img"
                                                    aria-label={t(
                                                        DAY_STATE_KEYS[state],
                                                        {
                                                            date:
                                                                formatDate(
                                                                    day.date,
                                                                ) ?? day.date,
                                                            count: Math.round(
                                                                (day.studySeconds ??
                                                                    0) / 60,
                                                            ),
                                                        },
                                                    )}
                                                    className="flex h-24 w-full items-end rounded-[var(--r-sm)] bg-[var(--surface-alt)]"
                                                >
                                                    <span
                                                        className="w-full rounded-[var(--r-sm)] bg-[var(--teal)]"
                                                        style={{
                                                            height: `${Math.max(pct, day.studySeconds > 0 ? 6 : 0)}%`,
                                                        }}
                                                    />
                                                </span>
                                                <span className="t-micro muted">
                                                    {formatDate(
                                                        day.date,
                                                    )?.slice(0, 5) ?? ""}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Card>
                        ) : null}

                        {/* --- highlights --------------------------------------- */}
                        {highlights.length > 0 ? (
                            <Card level="edge" padding="xl">
                                <h2 className="t-h3">
                                    {t("weekly.highlightsTitle")}
                                </h2>
                                <ul className="mt-3 flex flex-col gap-2">
                                    {highlights.map((h) => (
                                        <li key={h.code}>
                                            <RowBox center>
                                                <span className="min-w-0 flex-1">
                                                    <strong className="t-label block text-[var(--ink)]">
                                                        {HIGHLIGHT_KEYS[h.code]
                                                            ? t(
                                                                  HIGHLIGHT_KEYS[
                                                                      h.code
                                                                  ],
                                                                  {
                                                                      count: h.value,
                                                                  },
                                                              )
                                                            : h.code}
                                                    </strong>
                                                    <span className="t-micro muted">
                                                        {t(
                                                            "weekly.thisWeekValue",
                                                            {
                                                                value: h.value,
                                                                unit: h.unit,
                                                            },
                                                        )}
                                                    </span>
                                                </span>
                                                <TrendChip
                                                    comparison={h.comparison}
                                                />
                                            </RowBox>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ) : null}

                        {/* --- per module --------------------------------------- */}
                        <Card level="edge" padding="xl">
                            <h2 className="t-h3">{t("weekly.modulesTitle")}</h2>
                            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                                {MODULES.map(
                                    ({ key, labelKey, icon: Icon, path }) => {
                                        const mod = modules?.[key];
                                        const status = mod?.status ?? "NO_DATA";
                                        return (
                                            <li key={key}>
                                                <RowBox center>
                                                    <span
                                                        aria-hidden="true"
                                                        className="text-[var(--teal)]"
                                                    >
                                                        <Icon size={18} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <strong className="t-label block text-[var(--ink)]">
                                                            {t(labelKey)}
                                                        </strong>
                                                        <span className="t-micro muted">
                                                            {mod?.studySeconds
                                                                ? t(
                                                                      "weekly.moduleMinutes",
                                                                      {
                                                                          count: Math.round(
                                                                              mod.studySeconds /
                                                                                  60,
                                                                          ),
                                                                      },
                                                                  )
                                                                : t(
                                                                      "weekly.moduleNoActivity",
                                                                  )}
                                                        </span>
                                                    </span>
                                                    <span className="flex shrink-0 items-center gap-2">
                                                        <Chip
                                                            tone={
                                                                status ===
                                                                "ACTIVE"
                                                                    ? "teal"
                                                                    : "neutral"
                                                            }
                                                        >
                                                            {MODULE_STATUS_KEYS[
                                                                status
                                                            ]
                                                                ? t(
                                                                      MODULE_STATUS_KEYS[
                                                                          status
                                                                      ],
                                                                  )
                                                                : status}
                                                        </Chip>
                                                        <ButtonLink
                                                            to={path}
                                                            size="sm"
                                                            variant="ghost"
                                                        >
                                                            {t("weekly.open")}
                                                        </ButtonLink>
                                                    </span>
                                                </RowBox>
                                            </li>
                                        );
                                    },
                                )}
                            </ul>
                        </Card>
                    </div>
                )}
            </AsyncBoundary>
        </div>
    );
}
