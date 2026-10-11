import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Check, CheckCheck, Trash2, ExternalLink, Bell, Info } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { RowBox } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { cn } from '../../lib/cn';
import { useNotifications } from '../../features/notification/useNotifications';
import { formatNotificationTime, resolveNotificationAction } from '../../features/notification/notificationFormatters';
import {
    NOTIFICATION_TYPES,
    NOTIFICATION_STATUSES,
    NOTIFICATION_LABEL_KEYS,
    PRIORITY_TONE,
} from '../../features/notification/notificationConstants';

/**
 * Notification centre — `/notifications` (screen 34).
 *
 * THE UNREAD STATE IS A DOT PLUS A BORDER, NOT COLOUR ALONE. The dot is a distinct
 * shape, so the state survives both a colour-blind reader and a greyscale print, and the
 * row also carries it in its accessible name.
 *
 * THE STREAK NOTIFICATION IS WHERE THE ETHICS MESSAGE LIVES. The design puts
 * "Nghỉ một ngày cũng không sao — v2 tặng 2 ngày nghỉ mỗi tháng" in-product, in a
 * notification, because that is the moment a user is most likely to feel behind. The
 * grace-day fact is therefore rendered for streak-type notifications rather than only
 * being on the Settings screen.
 *
 * A notification with an `actionUrl` becomes a link. `resolveNotificationAction`
 * separates an external URL (new tab, `rel="noopener noreferrer"`) from an internal path
 * (router navigation), because treating them alike is how a notification turns into an
 * open redirect or a full page reload that loses app state.
 */
export default function NotificationCenterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [status, setStatus] = useState('ALL');
    const [type, setType] = useState('ALL');

    const feed = useNotifications({ status, type });
    const { items, unreadCount, loading, error, busyId, markRead, markAllRead, remove, reload } = feed;

    /**
     * Open a notification: mark it read, then follow its action.
     *
     * Marking first means the unread state is correct even if the destination fails to
     * load. The mark is awaited only so a failure surfaces; navigation does not wait.
     */
    async function open(item) {
        if (!item.isRead) markRead(item.id);
        const action = resolveNotificationAction(item.actionUrl);
        if (!action) return;
        if (action.kind === 'external') {
            window.open(action.value, '_blank', 'noopener,noreferrer');
        } else {
            navigate(action.value);
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="t-micro muted">
                    {unreadCount > 0 ? t('notifications.unreadSummary', { count: unreadCount }) : t('notifications.allRead')}
                </p>
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" disabled={busyId === '__all__' || unreadCount === 0} onClick={markAllRead}>
                        <CheckCheck size={15} aria-hidden="true" />
                        {t('notifications.markAllRead')}
                    </Button>
                    <ButtonLink to="/settings" size="sm" variant="ghost">
                        {t('notifications.preferences')}
                    </ButtonLink>
                </div>
            </div>

            {/* --- filters ------------------------------------------------- */}
            <div className="flex flex-col gap-2">
                <div role="group" aria-label={t('notifications.statusFilterLabel')} className="flex flex-wrap gap-1.5">
                    {['ALL', ...NOTIFICATION_STATUSES].map((value) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={status === value}
                            onClick={() => setStatus(value)}
                            className={cn(
                                'min-h-11 rounded-[var(--r-control)] px-3.5 text-sm font-bold',
                                status === value
                                    ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                    : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                            )}
                        >
                            {t(value === 'ALL' ? 'notifications.statusAll' : `notifications.status.${value}`)}
                        </button>
                    ))}
                </div>

                <div role="group" aria-label={t('notifications.typeFilterLabel')} className="flex flex-wrap gap-1.5">
                    {['ALL', ...NOTIFICATION_TYPES].map((value) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={type === value}
                            onClick={() => setType(value)}
                            className={cn(
                                'min-h-9 rounded-[var(--r-chip)] px-3 text-xs font-bold',
                                type === value
                                    ? 'bg-[var(--amber-soft)] text-[var(--ink)]'
                                    : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                            )}
                        >
                            {value === 'ALL'
                                ? t('notifications.typeAll')
                                : t(NOTIFICATION_LABEL_KEYS[value] ?? 'notifications.typeOther')}
                        </button>
                    ))}
                </div>
            </div>

            <AsyncBoundary
                loading={loading}
                error={error}
                isEmpty={!loading && !error && items.length === 0}
                onRetry={reload}
                skeleton={
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 5 }, (_, i) => (
                            <SkeletonCard key={i} lines={2} />
                        ))}
                    </div>
                }
                emptyTitle={status !== 'ALL' || type !== 'ALL' ? t('notifications.noMatchTitle') : t('notifications.emptyTitle')}
                emptyBody={status !== 'ALL' || type !== 'ALL' ? t('notifications.noMatchBody') : t('notifications.emptyBody')}
                emptyAction={
                    status !== 'ALL' || type !== 'ALL' ? (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                setStatus('ALL');
                                setType('ALL');
                            }}
                        >
                            {t('dictionary.clearFilters')}
                        </Button>
                    ) : null
                }
            >
                <ul className="flex flex-col gap-2">
                    {items.map((item) => {
                        const action = resolveNotificationAction(item.actionUrl);
                        const tone = PRIORITY_TONE[item.priority] ?? 'neutral';
                        const isStreak = item.type === 'VOCABULARY_REMINDER' || item.metadata?.streakRelated;

                        const body = (
                            <RowBox
                                center
                                className={cn(
                                    /* Unread is a BORDER plus a DOT, never colour alone. */
                                    !item.isRead && 'border-l-4 border-l-[var(--teal)]',
                                    busyId === item.id && 'opacity-60'
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'grid size-10 shrink-0 place-items-center rounded-[var(--r-sm)]',
                                        tone === 'wrong'
                                            ? 'bg-[var(--wrong-soft)] text-[var(--wrong)]'
                                            : tone === 'teal'
                                              ? 'bg-[var(--teal-soft)] text-[var(--teal)]'
                                              : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                                    )}
                                >
                                    <Bell size={17} />
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center gap-2">
                                        {/* The dot is a shape, so unread survives without colour. */}
                                        {!item.isRead ? (
                                            <span
                                                aria-hidden="true"
                                                className="size-2 shrink-0 rounded-full bg-[var(--teal)]"
                                            />
                                        ) : null}
                                        <strong className="t-label text-[var(--ink)]">{item.title}</strong>
                                        {!item.isRead ? (
                                            <span className="sr-only">{t('notifications.unread')}</span>
                                        ) : null}
                                    </span>

                                    {item.body ? <span className="t-body soft mt-0.5 block">{item.body}</span> : null}

                                    <span className="t-micro muted mt-1 flex flex-wrap items-center gap-2">
                                        <span>{formatNotificationTime(item.createdAt) ?? '—'}</span>
                                        {item.type ? (
                                            <Chip tone="neutral">
                                                {t(NOTIFICATION_LABEL_KEYS[item.type] ?? 'notifications.typeOther')}
                                            </Chip>
                                        ) : null}
                                    </span>

                                    {/* The streak message, delivered where it matters most. */}
                                    {isStreak ? (
                                        <span className="t-micro mt-1.5 flex items-start gap-1.5 text-[var(--teal)]">
                                            <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                                            {t('notifications.streakGrace')}
                                        </span>
                                    ) : null}
                                </span>

                                <span className="flex shrink-0 items-center gap-1">
                                    {action ? (
                                        <span aria-hidden="true" className="text-[var(--ink-muted)]">
                                            <ExternalLink size={15} />
                                        </span>
                                    ) : null}
                                    {!item.isRead ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            aria-label={`${t('notifications.markRead')}: ${item.title}`}
                                            disabled={busyId === item.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markRead(item.id);
                                            }}
                                        >
                                            <Check size={16} aria-hidden="true" />
                                        </Button>
                                    ) : null}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        iconOnly
                                        aria-label={`${t('notifications.deleteOne')}: ${item.title}`}
                                        disabled={busyId === item.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            remove(item.id);
                                        }}
                                    >
                                        <Trash2 size={16} aria-hidden="true" />
                                    </Button>
                                </span>
                            </RowBox>
                        );

                        return (
                            <li key={item.id}>
                                {action ? (
                                    <button
                                        type="button"
                                        onClick={() => open(item)}
                                        className="block w-full text-left"
                                        aria-label={`${item.title}${item.isRead ? '' : ` — ${t('notifications.unread')}`}`}
                                    >
                                        {body}
                                    </button>
                                ) : (
                                    body
                                )}
                            </li>
                        );
                    })}
                </ul>
            </AsyncBoundary>

            <div className="flex items-center justify-center gap-3">
                <Lexi mood="approve" size="xs" />
                <Link to="/home" className="t-label text-[var(--teal)]">
                    {t('nav.home')}
                </Link>
            </div>
        </div>
    );
}
