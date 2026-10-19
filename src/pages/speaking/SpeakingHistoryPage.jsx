import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Clock, Loader2, MessageSquare, Mic } from 'lucide-react';
import { RowBox } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { cn } from '../../lib/cn';
import { formatDateTime } from '../../lib/datetime';
import { isGrading, isGradingFailed, useSpeakingAttempts } from '../../features/speaking/useSpeaking';
import {
    isConversationGrading,
    isConversationInProgress,
    useSpeakingConversations,
} from '../../features/speaking/useSpeakingConversation';

/**
 * Speaking history — `/speaking/attempts` (screen 24d), and `?tab=conversation`.
 *
 * TWO TABS BECAUSE THEY ARE TWO LISTS, not two views of one. `GET /speaking/attempts` returns
 * recorded attempts; `GET /speaking/conversations` returns conversations, which carry fields an
 * attempt does not have (`totalTurns`, and a status set that includes `IN_PROGRESS`). The tab is
 * ADDRESSABLE so a finished conversation can link straight into its own tab — the same thing v1
 * did with `/speaking/history?tab=conversation`, and the reason the redirect route
 * `/speaking/conversation/history` needs no screen of its own.
 *
 * CARDS, NOT A TABLE, for the same reason as the vocabulary and writing histories: a table whose
 * columns hide on a phone is still a table to a screen reader, and v1's `scroll={{x}}` history
 * had no mobile fallback at all.
 *
 * AN UNFINISHED CONVERSATION OPENS THE CONVERSATION, not its result: `IN_PROGRESS` has no band,
 * and 24c sends the learner back to 24b anyway. So the row's destination is the truth about it,
 * and its label says so ("Tiếp tục").
 *
 * THE SUMMARY IS THREE NUMBERS, so on a phone the three tiles stay one row instead of the shared
 * grid's single column — stacked, they push the first real row below the fold.
 *
 * NO LOAD-MORE CONTROL YET. Both endpoints are paged and this screen reads one page; that is
 * recorded as open question 6 in `_design/SCREENS-V2.md` rather than hidden, because a silently
 * truncated history is the one kind of loss a learner cannot notice.
 */
const TABS = [
    { id: 'practice', labelKey: 'speaking.actions.practice' },
    { id: 'conversation', labelKey: 'speaking.actions.conversation' },
];

export default function SpeakingHistoryPage() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') === 'conversation' ? 'conversation' : 'practice';

    const attempts = useSpeakingAttempts({ page: 0, size: 20 });
    const conversations = useSpeakingConversations({ page: 0, size: 20 });

    const attemptStats = useMemo(() => {
        const graded = attempts.items.filter((item) => item.status === 'GRADED' && item.overallBandScore != null);
        const best = graded.reduce((max, item) => Math.max(max, Number(item.overallBandScore)), 0);
        const average = graded.length
            ? graded.reduce((sum, item) => sum + Number(item.overallBandScore), 0) / graded.length
            : 0;
        return { count: attempts.totalElements, best, average, gradedCount: graded.length };
    }, [attempts.items, attempts.totalElements]);

    const conversationStats = useMemo(() => {
        const graded = conversations.items.filter(
            (item) => item.status === 'GRADED' && item.overallBandScore != null
        );
        const best = graded.reduce((max, item) => Math.max(max, Number(item.overallBandScore)), 0);
        const average = graded.length
            ? graded.reduce((sum, item) => sum + Number(item.overallBandScore), 0) / graded.length
            : 0;
        return { count: conversations.totalElements, best, average, gradedCount: graded.length };
    }, [conversations.items, conversations.totalElements]);

    const active = tab === 'conversation' ? conversations : attempts;
    const stats = tab === 'conversation' ? conversationStats : attemptStats;

    return (
        <div className="flex flex-col gap-4">
            <Link to="/speaking" className="t-label inline-flex items-center gap-2 text-[var(--teal)]">
                <Mic size={16} aria-hidden="true" />
                {t('speaking.title')}
            </Link>

            <p className="t-micro muted">{t('speaking.historySubtitle')}</p>

            <div
                role="tablist"
                aria-label={t('speaking.historyTabsLabel')}
                className="flex gap-1 rounded-[var(--r-control)] bg-[var(--surface-alt)] p-1"
            >
                {TABS.map(({ id, labelKey }) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        id={`sp-${id}-tab`}
                        aria-controls={`sp-${id}`}
                        aria-selected={tab === id}
                        onClick={() =>
                            setSearchParams(id === 'conversation' ? { tab: 'conversation' } : {}, {
                                replace: true,
                            })
                        }
                        className={cn(
                            'min-h-11 flex-1 rounded-[var(--r-sm)] text-sm font-bold',
                            tab === id
                                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-[0_2px_0_0_var(--border)]'
                                : 'text-[var(--ink-muted)]'
                        )}
                    >
                        {t(labelKey)}
                    </button>
                ))}
            </div>

            <AsyncBoundary
                loading={active.loading}
                error={active.error}
                isEmpty={!active.loading && !active.error && active.items.length === 0}
                onRetry={active.reload}
                skeleton={
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 4 }, (_, i) => (
                            <SkeletonCard key={i} lines={2} />
                        ))}
                    </div>
                }
                emptyTitle={t(
                    tab === 'conversation'
                        ? 'speaking.historyEmptyConversationTitle'
                        : 'speaking.historyEmptyTitle'
                )}
                emptyBody={t(
                    tab === 'conversation'
                        ? 'speaking.historyEmptyConversationBody'
                        : 'speaking.historyEmptyBody'
                )}
                emptyAction={
                    <ButtonLink to="/speaking" variant="primary" size="sm">
                        {t('speaking.title')}
                    </ButtonLink>
                }
            >
                <div
                    id={`sp-${tab}`}
                    role="tabpanel"
                    aria-labelledby={`sp-${tab}-tab`}
                    className="flex flex-col gap-3"
                >
                    {stats.gradedCount > 1 ? (
                        <div className="grid grid-cols-3 gap-2.5">
                            <Stat
                                value={stats.count}
                                label={t(
                                    tab === 'conversation'
                                        ? 'speaking.historyStatConversations'
                                        : 'speaking.historyStatAttempts'
                                )}
                                tone="teal"
                                icon={tab === 'conversation' ? MessageSquare : Mic}
                            />
                            <Stat
                                value={stats.average.toFixed(1)}
                                label={t('speaking.historyStatAverage')}
                            />
                            <Stat
                                value={stats.best.toFixed(1)}
                                label={t('speaking.historyStatBest')}
                                tone="amber"
                            />
                        </div>
                    ) : null}

                    <ul className="flex flex-col gap-2">
                        {tab === 'conversation'
                            ? conversations.items.map((item) => {
                                  const inProgress = isConversationInProgress(item.status);
                                  const grading = isConversationGrading(item.status);
                                  const failed = item.status === 'FAILED';
                                  return (
                                      <li key={item.id}>
                                          <Link
                                              to={
                                                  inProgress
                                                      ? `/speaking/conversation/resume/${item.id}`
                                                      : `/speaking/conversation/result/${item.id}`
                                              }
                                              className="block"
                                          >
                                              <RowBox
                                                  center
                                                  className="transition-colors hover:bg-[var(--surface-alt)]"
                                              >
                                                  <span className="min-w-0 flex-1">
                                                      <strong className="t-label block text-[var(--ink)]">
                                                          {item.topicQuestion ?? t('speaking.title')}
                                                      </strong>
                                                      <span className="t-micro muted flex flex-wrap items-center gap-2">
                                                          <span>{t(`speaking.part.${item.topicPart}`)}</span>
                                                          {item.totalTurns ? (
                                                              <span>
                                                                  {t('speaking.historyTurnsChip', {
                                                                      count: item.totalTurns,
                                                                  })}
                                                              </span>
                                                          ) : null}
                                                          <span>{formatDateTime(item.startedAt) ?? '—'}</span>
                                                      </span>
                                                  </span>
                                                  <span className="flex shrink-0 items-center gap-2">
                                                      {inProgress ? (
                                                          <>
                                                              <Chip tone="teal">
                                                                  {t('speaking.historyStatusInProgress')}
                                                              </Chip>
                                                              <span className="t-label text-[var(--teal)]">
                                                                  {t('speaking.historyResume')}
                                                              </span>
                                                          </>
                                                      ) : grading ? (
                                                          <Chip tone="amber" icon={Clock}>
                                                              {t('speaking.statusGrading')}
                                                          </Chip>
                                                      ) : failed ? (
                                                          <Chip tone="wrong" icon={AlertTriangle}>
                                                              {t('speaking.statusFailed')}
                                                          </Chip>
                                                      ) : item.overallBandScore != null ? (
                                                          <span className="t-mono text-[var(--teal)]">
                                                              {Number(item.overallBandScore).toFixed(1)}
                                                          </span>
                                                      ) : null}
                                                      <ArrowRight
                                                          size={16}
                                                          aria-hidden="true"
                                                          className="text-[var(--ink-muted)]"
                                                      />
                                                  </span>
                                              </RowBox>
                                          </Link>
                                      </li>
                                  );
                              })
                            : attempts.items.map((item) => {
                                  const grading = isGrading(item.status);
                                  const failed = isGradingFailed(item.status);
                                  return (
                                      <li key={item.id}>
                                          <Link to={`/speaking/result/${item.id}`} className="block">
                                              <RowBox
                                                  center
                                                  className="transition-colors hover:bg-[var(--surface-alt)]"
                                              >
                                                  <span className="min-w-0 flex-1">
                                                      <strong className="t-label block text-[var(--ink)]">
                                                          {item.topicQuestion ?? t('speaking.title')}
                                                      </strong>
                                                      <span className="t-micro muted flex flex-wrap items-center gap-2">
                                                          <span>{t(`speaking.part.${item.topicPart}`)}</span>
                                                          {item.timeSpentSeconds ? (
                                                              <span>
                                                                  {t('home.minutes', {
                                                                      count: Math.max(
                                                                          1,
                                                                          Math.round(item.timeSpentSeconds / 60)
                                                                      ),
                                                                  })}
                                                              </span>
                                                          ) : null}
                                                          <span>{formatDateTime(item.submittedAt) ?? '—'}</span>
                                                      </span>
                                                  </span>
                                                  <span className="flex shrink-0 items-center gap-2">
                                                      {grading ? (
                                                          <Chip tone="amber" icon={Loader2}>
                                                              {t('speaking.statusGrading')}
                                                          </Chip>
                                                      ) : failed ? (
                                                          <Chip tone="wrong" icon={AlertTriangle}>
                                                              {t('speaking.statusFailed')}
                                                          </Chip>
                                                      ) : item.overallBandScore != null ? (
                                                          <span className="t-mono text-[var(--teal)]">
                                                              {Number(item.overallBandScore).toFixed(1)}
                                                          </span>
                                                      ) : (
                                                          <Chip tone="neutral">
                                                              {t('speaking.card.submitted')}
                                                          </Chip>
                                                      )}
                                                      <ArrowRight
                                                          size={16}
                                                          aria-hidden="true"
                                                          className="text-[var(--ink-muted)]"
                                                      />
                                                  </span>
                                              </RowBox>
                                          </Link>
                                      </li>
                                  );
                              })}
                    </ul>
                </div>
            </AsyncBoundary>
        </div>
    );
}
