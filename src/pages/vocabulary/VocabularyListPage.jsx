import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { Plus, RefreshCw, Clock, BookMarked, Loader2, AlertTriangle } from "lucide-react";
import { Lexi } from "../../components/mascot/Lexi";
import { Card } from "../../components/ui/Card";
import { Button, ButtonLink } from "../../components/ui/Button";
import { Chip, SkeletonCard } from "../../components/ui/Primitives";
import { AsyncBoundary } from "../../components/ui/AsyncBoundary";
import { isCreatedWithinLastDay } from "../../utils/date";
import {
    useVocabularyTestList,
    useGenerateVocabularyTest,
    isGenerating,
    isFailed,
    isNotEnoughDataError,
    VOCABULARY_SOURCES,
    SOURCE_LABEL_KEYS,
} from "../../features/vocabulary/useVocabularyTest";

/**
 * Vocabulary test list.
 *
 * The screen exists to answer "what can I do right now", so the states matter more
 * than the list itself:
 *
 *   GENERATING  the backend builds the paper asynchronously, so a freshly
 *               generated test is not playable for a few seconds. It renders as a
 *               real in-progress card, and the list polls until it settles — not
 *               as an empty card the user clicks into and gets nothing.
 *   FAILED      generation can genuinely fail; that is shown and offered a retry.
 *   not enough  an account with no vocabulary data cannot generate at all. The
 *   data        backend says so in words; the UI turns that into a pointer at the
 *               dictionary rather than a retry that cannot succeed.
 *
 * The skill filter from v1 is gone because the backend has no such filter: the
 * only real dimension here is the source, and sources are a closed enum.
 */
export default function VocabularyListPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const [generateError, setGenerateError] = useState(null);

    const list = useVocabularyTestList({ page: 0, size: 12 });
    const { generate, generating } = useGenerateVocabularyTest();

    async function onGenerate(questionCount) {
        setGenerateError(null);
        setPending(true);
        try {
            await generate({ questionCount, sources: [] });
            /* Start polling straight away so the new card appears in the list
               and updates its state automatically without navigating away. */
            list.pollNow();
        } catch (err) {
            setGenerateError(err);
        } finally {
            setPending(false);
        }
    }

    const notEnoughData = isNotEnoughDataError(generateError);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="t-micro muted">{t("vocabTest.subtitle")}</p>
                <div className="flex gap-2">
                    <ButtonLink to="/dictionary" size="sm" variant="ghost">
                        <BookMarked size={16} aria-hidden="true" />
                        {t("vocabTest.openDictionary")}
                    </ButtonLink>
                    <Button size="sm" variant="ghost" onClick={list.reload}>
                        <RefreshCw size={15} aria-hidden="true" />
                        {t("common.retry")}
                    </Button>
                </div>
            </div>

            {/* --- generate ------------------------------------------------- */}
            <Card level="edge" padding="xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <Lexi mood="happy" size="md" />
                    <div className="min-w-0 flex-1">
                        <h2 className="t-h3">{t("vocabTest.generateTitle")}</h2>
                        <p className="t-body muted mt-1">
                            {t("vocabTest.generateBody")}
                        </p>
                        <p className="t-micro muted mt-1">
                            {t("vocabTest.sourcesNote", {
                                sources: VOCABULARY_SOURCES.filter(
                                    (s) => s !== "ALL",
                                )
                                    .map((s) => t(SOURCE_LABEL_KEYS[s]))
                                    .join(", "),
                            })}
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        {[5, 10, 20].map((n) => (
                            <Button
                                key={n}
                                size="sm"
                                variant={n === 10 ? "primary" : "secondary"}
                                disabled={generating || pending}
                                onClick={() => onGenerate(n)}
                            >
                                <Plus size={15} aria-hidden="true" />
                                {t("vocabTest.generateCount", { count: n })}
                            </Button>
                        ))}
                    </div>
                </div>

                {generating || pending ? (
                    <p className="t-micro muted mt-3 flex items-center gap-2">
                        <Loader2
                            size={14}
                            className="animate-spin"
                            aria-hidden="true"
                        />
                        {t("vocabTest.generatingNow")}
                    </p>
                ) : null}

                {generateError ? (
                    <div
                        role="alert"
                        className="mt-3 flex gap-3 rounded-[var(--r-card)] border-2 border-[var(--border-strong)] p-3.5"
                    >
                        <span
                            aria-hidden="true"
                            className="text-[var(--wrong)]"
                        >
                            <AlertTriangle size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <strong className="t-label block">
                                {notEnoughData
                                    ? t("vocabTest.notEnoughDataTitle")
                                    : t("common.error.generic")}
                            </strong>
                            <p className="t-micro muted mt-1">
                                {notEnoughData
                                    ? t("vocabTest.notEnoughDataBody")
                                    : t("vocabTest.generateFailedBody")}
                            </p>
                            {notEnoughData ? (
                                <ButtonLink
                                    to="/dictionary"
                                    size="sm"
                                    variant="primary"
                                    className="mt-2"
                                >
                                    {t("vocabTest.openDictionary")}
                                </ButtonLink>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </Card>

            {/* --- the list ------------------------------------------------- */}
            <AsyncBoundary
                loading={list.loading}
                error={list.error}
                isEmpty={
                    !list.loading && !list.error && list.items.length === 0
                }
                onRetry={list.reload}
                skeleton={
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }, (_, i) => (
                            <SkeletonCard key={i} lines={3} />
                        ))}
                    </div>
                }
                emptyTitle={t("vocabTest.emptyTitle")}
                emptyBody={t("vocabTest.emptyBody")}
                emptyAction={
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onGenerate(10)}
                        disabled={generating}
                    >
                        {t("vocabTest.generateCount", { count: 10 })}
                    </Button>
                }
            >
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {list.items.map((test) => {
                        const generatingThis = isGenerating(test.status);
                        const failedThis = isFailed(test.status);
                        const isCompleted =
                            test.latestAttemptStatus === "COMPLETED" ||
                            (test.attemptCount > 0 &&
                                test.latestAccuracyPercent != null);
                        const isNew =
                            !isCompleted &&
                            isCreatedWithinLastDay(test.createdAt);
                        return (
                            <li key={test.testId}>
                                <Card
                                    level="edge"
                                    padding="xl"
                                    className="flex h-full flex-col"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {generatingThis ? (
                                                <Chip
                                                    tone="amber"
                                                    icon={Loader2}
                                                >
                                                    {t(
                                                        "vocabTest.statusGenerating",
                                                    )}
                                                </Chip>
                                            ) : failedThis ? (
                                                <Chip
                                                    tone="wrong"
                                                    icon={AlertTriangle}
                                                >
                                                    {t(
                                                        "vocabTest.statusFailed",
                                                    )}
                                                </Chip>
                                            ) : (
                                                <Chip tone="teal">
                                                    {t("vocabTest.statusReady")}
                                                </Chip>
                                            )}
                                            {isNew ? (
                                                <Chip tone="amber">
                                                    {t("vocabTest.tagNew")}
                                                </Chip>
                                            ) : null}
                                        </div>
                                        {test.latestAccuracyPercent != null ? (
                                            <span className="t-mono text-[var(--teal)]">
                                                {Math.round(
                                                    test.latestAccuracyPercent,
                                                )}
                                                %
                                            </span>
                                        ) : null}
                                    </div>

                                    <h3 className="t-h3 mt-3">
                                        {test.title ?? t("vocabTest.untitled")}
                                    </h3>
                                    <p className="t-micro muted">
                                        {test.questionCount
                                            ? t("vocabTest.questionCount", {
                                                  count: test.questionCount,
                                              })
                                            : ""}
                                        {test.estimatedMinutes
                                            ? ` · ${t("home.minutes", { count: test.estimatedMinutes })}`
                                            : ""}
                                    </p>
                                    {test.attemptCount > 0 ? (
                                        <p className="t-micro muted mt-1">
                                            {t("vocabTest.attemptCount", {
                                                count: test.attemptCount,
                                            })}
                                        </p>
                                    ) : null}

                                    <Button
                                        variant={
                                            generatingThis || failedThis
                                                ? "ghost"
                                                : "primary"
                                        }
                                        size="sm"
                                        block
                                        className="mt-auto"
                                        disabled={generatingThis}
                                        aria-label={`${t("vocabTest.start")}: ${test.title ?? t("vocabTest.untitled")}`}
                                        onClick={() =>
                                            navigate(
                                                `/vocabulary/test?testId=${encodeURIComponent(test.testId)}`,
                                            )
                                        }
                                    >
                                        {generatingThis
                                            ? t("vocabTest.waitForReady")
                                            : failedThis
                                              ? t("vocabTest.viewFailed")
                                              : t("vocabTest.start")}
                                    </Button>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            </AsyncBoundary>

            <div className="flex justify-center">
                <Link
                    to="/vocabulary/history"
                    className="t-label text-[var(--teal)]"
                >
                    <span className="inline-flex items-center gap-2">
                        <Clock size={16} aria-hidden="true" />
                        {t("vocabTest.historyLink")}
                    </span>
                </Link>
            </div>
        </div>
    );
}
