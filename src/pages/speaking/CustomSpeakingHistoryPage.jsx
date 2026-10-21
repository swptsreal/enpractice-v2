import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Clock, Loader2, MessageSquare } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { RowBox } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { formatDate } from '../../lib/datetime';
import { useSetPageHeaderSubtitle } from '../../app/PageHeaderContextCore';
import {
    optionLabelKey,
    useConversationHistory,
} from '../../features/speaking/useCustomConversation';

/**
 * Custom speaking history — `/custom-speaking/history` (screen 27d).
 *
 * IT DID NOT EXIST, WHICH IS WHY "HISTORY" OPENED THE WRONG PAGE. 27's footer carried the label
 * "Các lượt đã làm" and pointed at `/speaking`, the topic list; the endpoint
 * (`GET /custom-speaking-conversations?page&size`) and `useConversationHistory` were already
 * there with no screen to use them.
 *
 * CARDS, NOT A TABLE, for the same reason as 24d: a table whose columns hide on a phone is still
 * a table to a screen reader.
 *
 * AN UNFINISHED CONVERSATION OPENS THE CONVERSATION. `IN_PROGRESS` has no band, and the result
 * screen has nothing to show, so the row's target is 27c and its label says "Tiếp tục".
 * GRADING and FAILED open the result, which carries the wait or the failure.
 *
 * NO STAT TILES: the endpoint returns pages, not an aggregate, so a count/average/best row would
 * be invented. The three configuration chips are the conversation's own fields, which is what
 * tells two conversations on the same topic apart.
 *
 * THE LIST IS PAGED AND "TẢI THÊM" IS REAL. A silently truncated history is the one kind of loss
 * a learner cannot notice (the open question 24d records, answered here).
 */
function statusOf(item) {
    if (!item) return null;
    if (item.status === 'IN_PROGRESS') {
        return { kind: 'inProgress', tone: 'teal', icon: MessageSquare, labelKey: 'customSpeaking.statusInProgress' };
    }
    if (item.status === 'GRADING' || item.status === 'SUBMITTED') {
        return { kind: 'grading', tone: 'amber', icon: Clock, labelKey: 'customSpeaking.statusGrading' };
    }
    if (item.status === 'FAILED') {
        return { kind: 'failed', tone: 'wrong', icon: AlertTriangle, labelKey: 'customSpeaking.statusFailed' };
    }
    return null;
}

export default function CustomSpeakingHistoryPage() {
    const { t } = useTranslation();
    const history = useConversationHistory({ size: 10 });

    useSetPageHeaderSubtitle(t('customSpeaking.historySubtitle'));

    return (
        <div className="flex flex-col gap-4">
            <Link
                to="/custom-speaking"
                className="t-label inline-flex items-center gap-2 text-[var(--teal)]"
            >
                <ArrowLeft size={16} aria-hidden="true" />
                {t('customSpeaking.title')}
            </Link>

            <AsyncBoundary
                loading={history.loading}
                error={history.error}
                isEmpty={!history.loading && !history.error && history.items.length === 0}
                onRetry={history.reload}
                skeleton={
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 4 }, (_, index) => (
                            <SkeletonCard key={index} lines={2} />
                        ))}
                    </div>
                }
                emptyTitle={t('customSpeaking.historyEmptyTitle')}
                emptyBody={t('customSpeaking.historyEmptyBody')}
                emptyAction={
                    <ButtonLink to="/custom-speaking" variant="primary" size="sm">
                        {t('customSpeaking.historyEmptyCta')}
                    </ButtonLink>
                }
            >
                <ul className="flex flex-col gap-2">
                    {history.items.map((item) => {
                        const status = statusOf(item);
                        const inProgress = status?.kind === 'inProgress';
                        const score = item.overallScore;
                        const target = inProgress
                            ? `/custom-speaking/conversation/${item.id}`
                            : `/custom-speaking/${item.id}`;
                        const meta = t('customSpeaking.historyMeta', {
                            topic: item.topic ?? '',
                            turns: item.userTurnCount ?? 0,
                            date: formatDate(item.startedAt) ?? '',
                        });

                        return (
                            <li key={item.id}>
                                <Link to={target} className="block">
                                    <RowBox center className="flex-wrap gap-3 hover:bg-[var(--surface-alt)]">
                                        <span className="min-w-0 flex-1">
                                            <strong className="t-label block truncate">
                                                {item.title || t('customSpeaking.conversationTitle')}
                                            </strong>
                                            <span className="t-micro muted mt-0.5 block">{meta}</span>
                                            <span className="mt-2 flex flex-wrap gap-1.5">
                                                <Chip tone="outline">
                                                    {t(optionLabelKey('style', item.style))}
                                                </Chip>
                                                <Chip tone="outline">
                                                    {t(optionLabelKey('personality', item.personality))}
                                                </Chip>
                                                <Chip tone="outline">
                                                    {t(optionLabelKey('expertise', item.expertise))}
                                                </Chip>
                                            </span>
                                        </span>

                                        <span className="flex shrink-0 items-center gap-2">
                                            {status ? (
                                                <Chip tone={status.tone} icon={status.icon}>
                                                    {t(status.labelKey)}
                                                </Chip>
                                            ) : score != null ? (
                                                <span className="font-mono text-[0.9375rem] font-bold tabular-nums text-[var(--teal)]">
                                                    {Number(score).toFixed(1)}
                                                </span>
                                            ) : null}
                                            {inProgress ? (
                                                <span className="t-label whitespace-nowrap text-[var(--teal)]">
                                                    {t('customSpeaking.historyResume')}
                                                </span>
                                            ) : null}
                                            <ArrowRight size={16} aria-hidden="true" className="text-[var(--ink-muted)]" />
                                        </span>
                                    </RowBox>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {history.hasMore ? (
                    <div className="mt-3 flex flex-col items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={history.loadMore}
                            disabled={history.loadingMore}
                        >
                            {history.loadingMore ? (
                                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                            ) : null}
                            {t('customSpeaking.historyLoadMore')}
                        </Button>
                        {history.loadMoreError ? (
                            <p role="alert" className="t-micro text-[var(--wrong)]">
                                {t('common.error.generic')}
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </AsyncBoundary>

            <div className="flex flex-wrap items-center justify-center gap-3">
                <Lexi mood="happy" size="xs" />
                <ButtonLink to="/custom-speaking" variant="ghost" size="sm">
                    {t('customSpeaking.historyNew')}
                </ButtonLink>
            </div>
        </div>
    );
}
