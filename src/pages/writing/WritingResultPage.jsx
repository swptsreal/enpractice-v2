import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Clock, RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Markdown } from '../../components/ui/Markdown';
import { formatDateTime } from '../../lib/datetime';
import { useWritingSubmission, isGraded, isGradingFailed } from '../../features/writing/useWriting';

/**
 * Writing result — `/writing/submission/:submissionId` (screen 23).
 *
 * THE GRADING STATE IS THE FIRST THING THIS SCREEN HAS TO GET RIGHT. Grading is
 * asynchronous (verified: SUBMITTED → GRADING → GRADED, ~6 s for a Task 2 essay), so
 * the screen polls and, while it waits, says so and shows a skeleton in the shape of
 * the result. It must never render an empty band as if it were a score.
 *
 * WHY THIS IS NOT THE ANNOTATED ESSAY THE DESIGN SPECIFIES, and this is a real gap
 * rather than an oversight: the design calls for the user's own text marked per
 * span — a green "Câu chủ đề rõ" tag, amber lexical notes, red structural problems,
 * each with a `title`. **The backend returns no span data.** `WritingSubmissionResponse`
 * carries four criterion Floats, one `overallBandScore`, and `aiFeedback` as MARKDOWN
 * PROSE (~2.6 kB), and a search of the writing DTOs and services finds no offset,
 * span, mark or annotation field anywhere.
 *
 * Fabricating spans by diffing the markdown would produce confident, wrong highlights
 * pointing at arbitrary sentences, which is worse than none: a wrong annotation in a
 * study tool teaches the wrong thing. So the essay and the feedback are shown side by
 * side as two columns, which IS the design's two-column body and lets the reader match
 * a comment to their own sentence, and the criterion cards carry the diagnosis. The
 * gap is recorded in the README as needing a backend field, not papered over.
 *
 * The band is formatted to ONE DECIMAL throughout: the API returns `6` for what its own
 * feedback text calls "Overall Band: 6.0".
 */
const CRITERIA = [
    { key: 'taskResponseScore', labelKey: 'writing.criterion.taskResponse' },
    { key: 'coherenceScore', labelKey: 'writing.criterion.coherence' },
    { key: 'lexicalResourceScore', labelKey: 'writing.criterion.lexicalResource' },
    { key: 'grammarScore', labelKey: 'writing.criterion.grammar' },
];

/** Bands run 0-9, so the proportion bar divides by 9 rather than by 100. */
const MAX_BAND = 9;

export default function WritingResultPage() {
    const { t } = useTranslation();
    const { submissionId } = useParams();

    const { submission, loading, error, grading, reload } = useWritingSubmission(submissionId);

    const band = submission?.overallBandScore;

    if (!submissionId) {
        return (
            <Card level="edge" padding="xl" className="text-center">
                <h2 className="t-h2">{t('writing.noSubmissionTitle')}</h2>
                <p className="t-body muted mt-2">{t('writing.noSubmissionBody')}</p>
                <ButtonLink to="/writing" variant="primary" className="mt-4">
                    {t('writing.title')}
                </ButtonLink>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Link to="/writing" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('common.back')}
            </Link>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && !submission}
                onRetry={reload}
                skeleton={<SkeletonCard lines={5} />}
                emptyTitle={t('writing.submissionGoneTitle')}
                emptyBody={t('writing.submissionGoneBody')}
                emptyAction={
                    <ButtonLink to="/writing" variant="primary" size="sm">
                        {t('writing.title')}
                    </ButtonLink>
                }
            >
                <div className="flex flex-col gap-4">
                    {/* --- grading in progress ------------------------------- */}
                    {grading ? (
                        <Card level="hero" padding="xl" className="flex flex-col items-center gap-4 text-center">
                            <Lexi mood="thinking" size="lg" label={t('writing.gradingLexi')} />
                            <h1 className="t-h2">{t('writing.gradingTitle')}</h1>
                            <p className="t-body soft">{t('writing.gradingBody')}</p>
                            <p className="t-micro muted inline-flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                {t('writing.gradingWaitShort')}
                            </p>
                        </Card>
                    ) : null}

                    {isGradingFailed(submission?.status) ? (
                        <Card level="edge" padding="xl">
                            <div className="flex gap-3">
                                <span aria-hidden="true" className="text-[var(--wrong)]">
                                    <AlertTriangle size={22} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <strong className="t-label block">{t('writing.gradingFailedTitle')}</strong>
                                    <p className="t-micro muted mt-1">{t('writing.gradingFailedBody')}</p>
                                    <ButtonLink
                                        to={`/writing/task/${submission.taskId}`}
                                        variant="primary"
                                        size="sm"
                                        className="mt-2"
                                    >
                                        {t('writing.tryAgain')}
                                    </ButtonLink>
                                </div>
                            </div>
                        </Card>
                    ) : null}

                    {/* --- the marked result --------------------------------- */}
                    {isGraded(submission?.status) ? (
                        <>
                            <Card level="hero" padding="xl" className="flex flex-col items-center gap-5 md:flex-row md:text-left">
                                <Lexi
                                    mood={(band ?? 0) >= 6.5 ? 'celebrate' : 'explain'}
                                    size="lg"
                                    label={t('writing.lexiResult')}
                                />
                                <div className="min-w-0 flex-1">
                                    <span className="t-micro muted">{submission.taskTitle}</span>
                                    <div className="flex flex-wrap items-baseline justify-center gap-3 md:justify-start">
                                        <span className="font-mono text-5xl font-bold tabular-nums text-[var(--teal)]">
                                            {band != null ? Number(band).toFixed(1) : '—'}
                                        </span>
                                        <Chip tone="neutral">{t(`writing.type.${submission.taskType}`)}</Chip>
                                    </div>
                                    <p className="t-body soft mt-2">{t('writing.bandEstimateNote')}</p>
                                </div>
                            </Card>

                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                <Stat value={submission.wordCount ?? 0} label={t('writing.finalWordCount')} tone="teal" />
                                <Stat
                                    value={submission.timeSpentSeconds ? Math.round(submission.timeSpentSeconds / 60) : '—'}
                                    label={t('ielts.timeSpent')}
                                    icon="clock"
                                />
                                <Stat value={formatDateTime(submission.gradedAt) ?? '—'} label={t('writing.gradedAt')} />
                                <Stat value={formatDateTime(submission.submittedAt) ?? '—'} label={t('writing.submittedAt')} />
                            </div>

                            {/* --- four criteria, each a proportion bar --------- */}
                            <Card level="edge" padding="xl">
                                <h2 className="t-h3">{t('writing.criteriaScores')}</h2>
                                <ul className="mt-3.5 grid gap-3 sm:grid-cols-2">
                                    {CRITERIA.map(({ key, labelKey }) => {
                                        const value = submission[key];
                                        const pct = value != null ? Math.round((Number(value) / MAX_BAND) * 100) : 0;
                                        return (
                                            <li key={key} className="flex flex-col gap-1.5">
                                                <span className="flex items-baseline justify-between gap-2">
                                                    <span className="t-label">{t(labelKey)}</span>
                                                    <span className="t-mono tabular-nums text-[var(--teal)]">
                                                        {value != null ? Number(value).toFixed(1) : '—'}
                                                    </span>
                                                </span>
                                                {/* A bar with an accessible value, so the score is
                                                    not carried by the bar's width alone. */}
                                                <span
                                                    role="progressbar"
                                                    aria-valuemin={0}
                                                    aria-valuemax={MAX_BAND}
                                                    aria-valuenow={value ?? 0}
                                                    aria-label={t('writing.criterionAria', {
                                                        criterion: t(labelKey),
                                                        value: value ?? 0,
                                                    })}
                                                    className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-alt)]"
                                                >
                                                    <span
                                                        className="block h-full rounded-full bg-[var(--teal)]"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Card>

                            {/* --- essay and feedback, side by side -------------- */}
                            <div className="grid gap-4 lg:grid-cols-2">
                                <Card level="edge" padding="xl">
                                    <h2 className="t-h3 flex items-center gap-2">
                                        <FileText size={18} aria-hidden="true" />
                                        {t('writing.yourEssay')}
                                    </h2>
                                    <div className="prose-reading mt-3 whitespace-pre-line">{submission.essayContent}</div>
                                </Card>

                                <Card level="edge" padding="xl">
                                    <h2 className="t-h3">{t('writing.feedbackTitle')}</h2>
                                    {submission.aiFeedback ? (
                                        <Markdown content={submission.aiFeedback} className="mt-3" />
                                    ) : (
                                        <p className="t-body muted mt-3">{t('writing.noFeedback')}</p>
                                    )}
                                </Card>
                            </div>

                            {/* The design's "Sửa lỗi cụ thể" column is delivered as the
                                markdown feedback above rather than as per-mark instructions,
                                because the backend sends no span data to derive them from.
                                Recorded in the README as needing a backend field. */}
                            <Card level="flat" padding="lg">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Clock size={18} aria-hidden="true" className="shrink-0 text-[var(--ink-muted)]" />
                                    <p className="t-micro soft flex-1">{t('writing.rewriteHint')}</p>
                                    <ButtonLink to={`/writing/task/${submission.taskId}`} variant="primary" size="sm">
                                        <RefreshCw size={15} aria-hidden="true" />
                                        {t('writing.rewriteThis')}
                                    </ButtonLink>
                                </div>
                            </Card>
                        </>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                        <ButtonLink to="/writing" variant="ghost">
                            {t('writing.allTasks')}
                        </ButtonLink>
                        <Button variant="ghost" onClick={reload}>
                            <RefreshCw size={15} aria-hidden="true" />
                            {t('common.retry')}
                        </Button>
                    </div>
                </div>
            </AsyncBoundary>
        </div>
    );
}
