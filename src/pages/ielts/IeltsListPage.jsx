import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { Headphones, BookOpen, PenLine, Mic, Clock } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { ButtonLink } from "../../components/ui/Button";
import {
    Band,
    Chip,
    ProgressBar,
    SkeletonCard,
} from "../../components/ui/Primitives";
import { AsyncBoundary } from "../../components/ui/AsyncBoundary";
import { useAsyncResource } from "../../hooks/useAsyncResource";
import { readPage, unwrapData } from "../../api/envelope";
import { ieltsApi } from "../../api";
import {
    SKILL_LABEL_KEYS,
    DIFFICULTY_LABEL_KEYS,
    SKILL_TONE,
    DIFFICULTY_TONE,
} from "../../features/ielts/useIeltsDetail";
import { getIeltsAccuracy, normalizeSkillFilter } from "../../utils/ielts";

/**
 * Test library.
 *
 * One request, not two. The skill pills FILTER THIS LIST in place (Listening,
 * Reading) or ROUTE to a module that has its own entry screen (Writing,
 * Speaking). The distinction is stated in the URL — `/ielts?skill=READING` — so
 * the filter survives a refresh, the back button and a shared link.
 *
 * That is the fix for "the Listening/Reading switch does nothing": the pills
 * previously all pointed at `/ielts` and carried no `skill`, and the request was
 * hard-coded to `{ page, size }`, so pressing Reading re-rendered the same
 * unfiltered list. The query parameter is now the single source of truth and it
 * is passed to the api.
 *
 * Field names and filter values match the RUNNING BACKEND, verified 2026-10-11:
 *
 *   GET /ielts/tests -> { success, message, data: { page, size, totalElements,
 *                        totalPages, items: [ { id, title, skill, timeLimitMinutes,
 *                        difficulty, totalQuestions, createdAt } ] } }
 *
 *   GET /ielts/tests?skill=LISTENING&page=0&size=100
 *        -> 200, totalElements 7, every item skill=LISTENING
 *   GET /ielts/tests?skill=READING&page=0&size=100
 *        -> 200, totalElements 8, every item skill=READING
 *   GET /ielts/tests?skill=listening  -> 400 VALIDATION_ERROR
 *        "No enum constant com.swpts.enpracticebe.entity.IeltsTest.Skill.listening"
 *   GET /ielts/tests?skill=SPEAKING   -> 400, no such enum member
 *   GET /ielts/tests?skill=WRITING    -> 200, totalElements 0 (valid, but empty)
 *
 * Hence Listening and Reading are the only in-place filters here; Writing and
 * Speaking are separate modules with their own entry screens.
 *
 * Two things the first pass got wrong: the response is enveloped (so `data.items`,
 * not `.items`), and the fields are `skill` / `timeLimitMinutes`, not
 * `type` / `durationMinutes`. There is no per-test score in this payload, so the
 * card shows what it actually has.
 */

/* `filter` is the backend's enum member, or null for "everything". */
const SKILL_PILLS = [
    { key: "all", to: "/ielts", icon: BookOpen, filter: null },
    {
        key: "listening",
        to: "/ielts?skill=LISTENING",
        icon: Headphones,
        filter: "LISTENING",
    },
    {
        key: "reading",
        to: "/ielts?skill=READING",
        icon: BookOpen,
        filter: "READING",
    },
    { key: "writing", to: "/writing", icon: PenLine },
    { key: "speaking", to: "/speaking", icon: Mic },
];

/**
 * A pill's label, as a STATIC i18n key.
 *
 * Building the key by interpolation would read fine but hide it from the i18n
 * audit, which finds keys by scanning the source for literal static lookups — so
 * a renamed locale key would fail silently at runtime instead of at the gate. The
 * same reasoning already governs the chips below.
 *
 * The label and tone maps for the tags live in `features/ielts/useIeltsDetail.js`,
 * beside `SKILL_LABEL_KEYS`, so this screen and the detail screen cannot drift.
 */
const SKILL_PILL_LABEL_KEYS = {
    all: "ielts.skill.all",
    listening: "ielts.skill.listening",
    reading: "ielts.skill.reading",
    writing: "ielts.skill.writing",
    speaking: "ielts.skill.speaking",
};

export default function IeltsListPage() {
    const { t } = useTranslation();
    const [params] = useSearchParams();

    /* `?skill=reading` and `?skill=SPEAKING` both normalise to "no filter" rather
       than being forwarded: the enum is case-sensitive and has no SPEAKING, and a
       hand-edited URL must not turn the list into a 400 error panel. */
    const activeSkill = normalizeSkillFilter(params.get("skill"));

    const tests = useAsyncResource(
        async () => {
            const raw = await ieltsApi.getTests({
                page: 0,
                size: 24,
                ...(activeSkill ? { skill: activeSkill } : {}),
            });
            const items = readPage(raw).items;

            /* THE BEST RESULT OF EACH TEST, in a second request that cannot start earlier: the
               endpoint takes the ids, so the ids have to exist first.

               Both requests live in ONE resource on purpose. As two resources the cards would paint
               from the list response while the scores were still in flight, so a learner who had
               already sat Cambridge 19 would watch its button read "Bắt đầu" and then become
               "Làm lại" — a label that changes under the thumb that is about to press it. One
               resource means the cards are never rendered in a state that has to be corrected. */
            const scores = {};
            if (items.length) {
                try {
                    for (const row of unwrapData(
                        await ieltsApi.getHighestScores(
                            items.map((test) => test.id),
                        ),
                    )) {
                        scores[row.testId] = row;
                    }
                } catch {
                    /* SWALLOWED, deliberately. `GET /ielts/tests` already answered, so the library
                       itself is fine; failing the whole screen because a BADGE failed would trade a
                       list the learner can use for a list they cannot. The cost is real and is
                       stated rather than hidden: every card falls back to "Bắt đầu", so a returning
                       learner is offered a start instead of a retake. Both buttons lead to the same
                       detail screen, which is where the true state is stated, so the damage is a
                       label — and the mockup's own card is optional decoration over that link. */
                }
            }

            return { items, scores };
        },
        { initialData: { items: [], scores: {} }, deps: [activeSkill] },
    );
    /* `?.` on both, and it is not defensive noise: `useAsyncResource` sets `data: null` when the
       request FAILS, so an unguarded `tests.data.items` throws while rendering the error state —
       which replaces "Không kết nối được tới máy chủ" with a blank screen, the exact failure the
       error panel exists to prevent. */
    const list = tests.data?.items ?? [];
    const scores = tests.data?.scores ?? {};
    const reload = useCallback(() => tests.reload(), [tests]);

    return (
        <div className="flex flex-col gap-4">
            {/* Labelled by SKILL, not by "filter": Writing and Speaking in this row are
                links to their own modules, so calling the whole group a filter would be
                a promise two of the five pills do not keep. */}
            <ul
                aria-label={t("ielts.skillLabel")}
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            >
                {SKILL_PILLS.map(({ key, to, icon: Icon, filter }) => {
                    /* Only the pills that CARRY a filter can be current. Writing and
                       Speaking are route links to their own modules — with `undefined`
                       standing in for "no filter" they would light up as the active
                       filter on the unfiltered list. */
                    const current =
                        filter !== undefined && filter === activeSkill;
                    return (
                        <li key={key} className="shrink-0">
                            <Link
                                to={to}
                                aria-current={current ? "page" : undefined}
                                className={
                                    "inline-flex min-h-10 items-center gap-1.5 rounded-[var(--r-chip)] border-2 px-3.5 text-sm font-bold whitespace-nowrap " +
                                    (current
                                        ? "border-[var(--teal)] bg-[var(--teal)] text-[var(--on-teal)]"
                                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink-soft)]")
                                }
                            >
                                <Icon size={16} aria-hidden="true" />
                                {t(SKILL_PILL_LABEL_KEYS[key])}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="flex items-center justify-between">
                <h2 className="t-h2">{t("ielts.available")}</h2>
                <Link
                    to="/ielts/history"
                    className="inline-flex items-center gap-1.5 text-sm font-bold]"
                >
                    <Clock size={16} aria-hidden="true" />
                    {t("ielts.history")}
                </Link>
            </div>

            <AsyncBoundary
                loading={tests.loading}
                error={tests.error}
                isEmpty={!tests.loading && !tests.error && list.length === 0}
                onRetry={reload}
                skeleton={
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }, (_, i) => (
                            <SkeletonCard key={i} lines={3} />
                        ))}
                    </div>
                }
                /* An empty FILTERED list is not an empty library, and saying "there
                   are no tests" there would be a false statement about the product. */
                emptyTitle={
                    activeSkill
                        ? t("ielts.emptyFilterTitle")
                        : t("ielts.emptyTitle")
                }
                emptyBody={
                    activeSkill ? t("ielts.empty") : t("ielts.emptyBody")
                }
                emptyAction={
                    activeSkill ? (
                        <ButtonLink to="/ielts" size="sm" variant="primary">
                            {t("ielts.clearFilter")}
                        </ButtonLink>
                    ) : (
                        <ButtonLink
                            to="/vocabulary"
                            size="sm"
                            variant="primary"
                        >
                            {t("home.suggestVocab")}
                        </ButtonLink>
                    )
                }
            >
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((test) => {
                        const id = test?.id;
                        const title = test?.title ?? t("ielts.untitled");
                        const skill = String(test?.skill ?? "").toUpperCase();
                        const minutes = test?.timeLimitMinutes ?? null;
                        const questionCount = test?.totalQuestions ?? null;
                        const difficulty = String(
                            test?.difficulty ?? "",
                        ).toUpperCase();

                        /* ONE fact from the scores response drives FOUR things on the card — the band
                           badge, the bar, the percentage line and the button's label and weight. They
                           appear together or not at all, because a card that showed a band but said
                           "Bắt đầu" would be describing two different learners.

                           What the endpoint returns is the BEST attempt, not the latest one:
                           `IeltsTestServiceImpl` groups by test and keeps the higher band (a tie goes
                           to the more recent one). So the badge and the bar describe the same attempt
                           and the percentage is labelled "Cao nhất" — printing "Lần trước" over a
                           highest-of-all-time number would be a claim the data cannot support. */
                        const score = scores[id];
                        const attempted = score?.attempted === true;
                        const band =
                            attempted &&
                            typeof score.highestBandScore === "number"
                                ? score.highestBandScore
                                : null;
                        /* A 0% bar is a real result (0 of 40) and still needs a denominator before it
                           can be read as one; `getIeltsAccuracy` already guards the division. */
                        const measured =
                            attempted &&
                            typeof score.correctCount === "number" &&
                            typeof score.totalQuestions === "number" &&
                            score.totalQuestions > 0;
                        const accuracy = measured
                            ? Math.round(getIeltsAccuracy(score))
                            : null;
                        const action = t(
                            attempted ? "ielts.retake" : "ielts.startTest",
                        );

                        /* The count and the limit are two facts, so they are joined
                           once here rather than by two conditionals inside the JSX. */
                        const meta = [
                            questionCount
                                ? t("ielts.questionCount", {
                                      count: questionCount,
                                  })
                                : null,
                            minutes
                                ? t("ielts.timeLimit", { count: minutes })
                                : null,
                        ]
                            .filter(Boolean)
                            .join(" · ");

                        return (
                            <li key={id}>
                                <Card
                                    level="edge"
                                    padding="xl"
                                    className="flex h-full flex-col"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Chip
                                            tone={
                                                SKILL_TONE[skill] ?? "neutral"
                                            }
                                        >
                                            {SKILL_LABEL_KEYS[skill]
                                                ? t(SKILL_LABEL_KEYS[skill])
                                                : t("ielts.skill.all")}
                                        </Chip>
                                        {DIFFICULTY_TONE[difficulty] ? (
                                            <Chip
                                                tone={
                                                    DIFFICULTY_TONE[difficulty]
                                                }
                                            >
                                                {t(
                                                    DIFFICULTY_LABEL_KEYS[
                                                        difficulty
                                                    ],
                                                )}
                                            </Chip>
                                        ) : null}
                                        {band !== null ? (
                                            <Band
                                                value={band}
                                                className="ml-auto"
                                            />
                                        ) : null}
                                    </div>
                                    <h3 className="t-h3 mt-3">{title}</h3>
                                    {meta ? (
                                        <p className="t-micro muted mt-2">
                                            {meta}
                                        </p>
                                    ) : null}

                                    {/* The bar and its caption are ONE block: the number alone under a
                                        bar would leave the reader to work out what is being measured. */}
                                    {accuracy !== null ? (
                                        <div className="mt-2.5">
                                            <ProgressBar
                                                value={accuracy}
                                                label={t("ielts.bestAccuracy", {
                                                    value: accuracy,
                                                })}
                                            />
                                            <span className="t-micro muted mt-1 block">
                                                {t("ielts.bestAccuracy", {
                                                    value: accuracy,
                                                })}
                                            </span>
                                        </div>
                                    ) : null}

                                    {/* `mt-auto` pins the action to the bottom of every card in
                                        the row; the padding keeps a real gap under the meta line
                                        on the cards that have no slack to absorb. */}
                                    <div className="mt-auto pt-5">
                                        <ButtonLink
                                            /* THE DETAIL SCREEN, not the exam. Frame 16 sends every
                                               card to `17-ielts-detail.html`, and that is where real
                                               work happens: the attempt mode (full test vs one
                                               section), the scope, the credit cost and the exam
                                               condition are all decided there. Jumping straight into
                                               a timed take from a browse surface skips the decision
                                               and spends a credit before the learner has seen what
                                               they are buying. */
                                            to={`/ielts/test/${encodeURIComponent(id)}`}
                                            variant={
                                                attempted ? "ghost" : "primary"
                                            }
                                            size="sm"
                                            block
                                            /* The visible label is only "Bắt đầu" / "Làm lại", so a
                                               grid of cards gives a screen reader that many identical
                                               targets. The test title is folded into the accessible
                                               name. */
                                            aria-label={`${action}: ${title}`}
                                        >
                                            {action}
                                        </ButtonLink>
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            </AsyncBoundary>
        </div>
    );
}
