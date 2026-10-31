import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Layers, Target } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Primitives";
import { AsyncBoundary } from "../../components/ui/AsyncBoundary";
import { cn } from "../../lib/cn";
import {
    estimateMinutes,
    readReviewPrefs,
    writeReviewPrefs,
} from "../../features/evaluation/useEvaluation";
import { useReviewCounts } from "../../features/evaluation/useReviewSession";
import { useSetPageHeaderSubtitle } from "../../app/PageHeaderContextCore";
import {
    REVIEW_DIRECTIONS,
    REVIEW_GROUP_KEYS,
    REVIEW_PRESETS,
    applyPreset,
    clampLimit,
    describeWindow,
    presetFor,
    sessionSearch,
    windowRangeLabel,
} from "../../features/evaluation/reviewSession";

/**
 * Review setup — `/review` (screen 15), step 1 of the three-step review flow.
 *
 * THIS SCREEN WAS REBUILT AROUND THE ENDPOINTS THAT EXIST, and that is the whole change. It used to
 * read `dictionaryStats` off the profile and offer four hand-picked content modes; only one of those
 * four had a server meaning, "Mixed" direction could not be stored in the server's single
 * `direction` string, and the start button handed off to `/dictionary/review` — the flashcard mode,
 * which grades by self-rating and is a different feature. Now it composes exactly the parameters
 * `GET /records/review-words` accepts: a time window, a word group, a direction and a count.
 *
 * THREE THINGS ARE DELIBERATE:
 *
 *  1. **The count is capped by the group's own count.** Asking for 50 words when 8 are due is a
 *     promise the screen cannot keep, so the slider's maximum IS "how many have I got".
 *  2. **The button only appears when the window is complete.** A custom range with a `from` and no
 *     `to` reaches the server as "the last 7 days", which is not the window on screen.
 *  3. **No date arithmetic lives here.** `reviewSession.js` owns the presets, the ISO weeks and the
 *     clamps, and its tests pin the boundaries — including the week-numbering case that only
 *     misfires near New Year and would silently review a different week.
 */
export default function ReviewConfigPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    /* The mockup's header is two lines: the shared `<h1>` plus this context line. Both review screens
       carry the SAME heading and are told apart here. */
    useSetPageHeaderSubtitle(t("review.configSubtitle"));

    const prefs = useMemo(() => readReviewPrefs(), []);
    const [direction, setDirection] = useState(() =>
        REVIEW_DIRECTIONS.includes(prefs.direction)
            ? prefs.direction
            : "EN_TO_VI",
    );
    const [preset, setPreset] = useState("last7");
    const [params, setParams] = useState(() => ({
        ...applyPreset("last7"),
        group: "unreviewed",
        limit: 20,
    }));

    /* The direction is a device preference, and it stays one: no endpoint stores it, so claiming
       otherwise would be a setting the learner loses on their next device. */
    useEffect(() => {
        writeReviewPrefs({ direction });
    }, [direction]);

    const window = describeWindow(params);
    const rangeLabel = windowRangeLabel(window);
    const { counts, loaded, loading, error, reload } = useReviewCounts(params);
    const available = counts[params.group] ?? 0;
    const limit = clampLimit(params.limit, available);
    const minutes = estimateMinutes(limit);

    function choosePreset(next) {
        setPreset(next);
        setParams((current) => ({ ...current, ...applyPreset(next) }));
    }

    function patch(next) {
        const merged = { ...params, ...next };
        setParams(merged);
        setPreset(presetFor(merged));
    }

    const GROUP_META = {
        unreviewed: { icon: Layers, hint: t("review.group.unreviewedHint") },
        wrong: { icon: Target, hint: t("review.group.wrongHint") },
        all: { icon: CalendarDays, hint: t("review.group.allHint") },
    };

    const canStart = window.complete && available > 0;

    return (
        <div className="mx-auto flex w-full max-w-[680px] flex-col gap-4">
            <AsyncBoundary
                loading={loading && !loaded}
                error={error}
                isEmpty={false}
                onRetry={reload}
                skeleton={<SkeletonCard lines={3} />}
            >
                <div
                    aria-busy={loading || undefined}
                    className={cn(
                        "flex flex-col gap-4 transition-opacity",
                        loading && "opacity-60",
                    )}
                >
                    {/* --- the time window ------------------------------------- */}
                    <Card padding="lg">
                        <h2 className="t-h3">{t("review.windowTitle")}</h2>
                        <p className="t-body soft mt-1">
                            {t("review.windowBody")}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {REVIEW_PRESETS.map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    aria-pressed={preset === key}
                                    onClick={() => choosePreset(key)}
                                    className={cn(
                                        "h-9 rounded-[var(--r-control)] px-3 text-[0.8125rem] font-bold",
                                        preset === key
                                            ? "bg-[var(--teal)] text-white"
                                            : "bg-[var(--surface-alt)] text-[var(--ink-soft)] hover:brightness-[0.97]",
                                    )}
                                >
                                    {t(`review.preset.${key}`)}
                                </button>
                            ))}
                        </div>

                        {/* The week and month inputs keep their name for screen readers ONLY: the frame
                        draws neither control, so a visible label here would be text the design never
                        wrote — but an unnamed input is not an option either. */}
                        {window.kind === "week" ? (
                            <label className="mt-3 block">
                                <span className="sr-only">
                                    {t("review.weekLabel")}
                                </span>
                                <input
                                    type="week"
                                    value={params.week}
                                    onChange={(event) =>
                                        patch({ week: event.target.value })
                                    }
                                    className="mt-1 h-11 w-full rounded-[var(--r-control)] border border-[var(--border)] bg-[var(--surface)] px-3"
                                />
                            </label>
                        ) : null}

                        {window.kind === "month" ? (
                            <label className="mt-3 block">
                                <span className="sr-only">
                                    {t("review.monthLabel")}
                                </span>
                                <input
                                    type="month"
                                    value={params.month}
                                    onChange={(event) =>
                                        patch({ month: event.target.value })
                                    }
                                    className="mt-1 h-11 w-full rounded-[var(--r-control)] border border-[var(--border)] bg-[var(--surface)] px-3"
                                />
                            </label>
                        ) : null}

                        {window.kind === "range" ? (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <label className="block">
                                    <span className="t-label">
                                        {t("review.fromDate")}
                                    </span>
                                    <input
                                        type="date"
                                        value={params.from}
                                        max={params.to || undefined}
                                        onChange={(event) =>
                                            patch({ from: event.target.value })
                                        }
                                        className="mt-1 h-11 w-full rounded-[var(--r-control)] border border-[var(--border)] bg-[var(--surface)] px-3"
                                    />
                                </label>
                                <label className="block">
                                    <span className="t-label">
                                        {t("review.toDate")}
                                    </span>
                                    <input
                                        type="date"
                                        value={params.to}
                                        min={params.from || undefined}
                                        onChange={(event) =>
                                            patch({ to: event.target.value })
                                        }
                                        className="mt-1 h-11 w-full rounded-[var(--r-control)] border border-[var(--border)] bg-[var(--surface)] px-3"
                                    />
                                </label>
                            </div>
                        ) : null}

                        {/* THE RESOLVED DATES, not the name of the chip that was pressed. The mockup
                        prints "Đang chọn: 2026-10-01 → 2026-10-13", because the pressed chip already
                        shows its own state and the only question it cannot answer is "which days,
                        exactly" — "Tuần này" becomes a week the learner can check.

                        ONE line with two tones: muted while the window is whole, attention-coloured
                        when it is not, where it doubles as the reason the start button is off. No
                        second message is invented for that state. */}
                        {rangeLabel ? (
                            <p
                                role={window.complete ? undefined : "status"}
                                className={cn(
                                    "t-micro mt-3",
                                    window.complete
                                        ? "muted"
                                        : "text-[var(--attention)]",
                                )}
                            >
                                {t("review.selectedWindow", {
                                    label: rangeLabel,
                                })}
                            </p>
                        ) : null}
                    </Card>

                    {/* --- the word group --------------------------------------- */}
                    <fieldset>
                        <legend className="t-h3">
                            {t("review.groupTitle")}
                        </legend>
                        <p className="t-body soft mt-1">
                            {t("review.groupBody")}
                        </p>
                        <div className="mt-3 flex flex-col gap-2">
                            {REVIEW_GROUP_KEYS.map((key) => {
                                const Meta = GROUP_META[key];
                                const on = params.group === key;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        aria-pressed={on}
                                        onClick={() => patch({ group: key })}
                                        className={cn(
                                            "flex items-start gap-3 rounded-[var(--r-card)] border-2 p-3 text-left",
                                            on
                                                ? "border-[var(--teal)] bg-[var(--teal-soft)]"
                                                : "border-[var(--border)] bg-[var(--surface)]",
                                        )}
                                    >
                                        <Meta.icon
                                            size={18}
                                            aria-hidden="true"
                                            className="mt-0.5 shrink-0"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-bold">
                                                {t(`review.group.${key}`)}
                                            </span>
                                            <span className="t-micro soft block">
                                                {Meta.hint}
                                            </span>
                                        </span>
                                        <span className="t-h3 mono shrink-0">
                                            {counts[key] ?? 0}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>

                    {/* --- the direction --------------------------------------- */}
                    <fieldset>
                        <legend className="t-h3">
                            {t("review.directionTitle")}
                        </legend>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {REVIEW_DIRECTIONS.map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    aria-pressed={direction === key}
                                    onClick={() => setDirection(key)}
                                    className={cn(
                                        "h-11 rounded-[var(--r-control)] border-2 font-bold",
                                        direction === key
                                            ? "border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal)]"
                                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink-soft)]",
                                    )}
                                >
                                    {t(`review.direction.${key}`)}
                                </button>
                            ))}
                        </div>
                        <p className="t-micro muted mt-2">
                            {t("review.directionNote")}
                        </p>
                    </fieldset>

                    {/* --- the count ------------------------------------------- */}
                    <Card padding="lg">
                        <h2 className="t-h3">{t("review.countTitle")}</h2>
                        <p className="t-body soft mt-1">
                            {t("review.countBody")}
                        </p>

                        {/* ONE control for one number. A slider and quick-pick chips would be two
                        controls claiming the same value, and both could look selected. */}
                        <div className="mt-3 flex items-center gap-3">
                            <input
                                type="range"
                                className="grow"
                                min={1}
                                max={Math.max(1, Math.min(available, 300))}
                                value={limit}
                                disabled={available === 0}
                                aria-label={t("review.countTitle")}
                                aria-valuetext={t("review.wordCount", {
                                    count: limit,
                                })}
                                onChange={(event) =>
                                    patch({ limit: Number(event.target.value) })
                                }
                            />
                            <span className="t-h3 mono shrink-0 tabular-nums">
                                {limit}
                            </span>
                        </div>
                        <p className="t-micro muted mt-1">
                            {t("review.countMax", { count: available })}
                        </p>
                    </Card>

                    {/* The mockup's two-button row: start, or leave. "Để sau" is not a second way to
                    start — it is the exit for someone who opened the screen to see how much is
                    waiting and has decided this is not the moment. Without it the only way out is
                    the rail, which on a phone means the tab bar under a thumb that is already here. */}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            variant="primary"
                            size="lg"
                            className="sm:flex-1"
                            disabled={!canStart}
                            onClick={() =>
                                navigate(
                                    `/review/session?${sessionSearch({ ...params, limit }, direction)}`,
                                )
                            }
                        >
                            {t("review.startWithDuration", {
                                count: limit,
                                minutes,
                            })}
                            <ArrowRight size={18} aria-hidden="true" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => navigate("/home")}
                        >
                            {t("review.later")}
                        </Button>
                    </div>
                </div>
            </AsyncBoundary>
        </div>
    );
}
