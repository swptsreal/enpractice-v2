import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, WifiOff, LogIn, SearchX, Coins } from 'lucide-react';
import { Lexi } from '../mascot/Lexi';
import { Button, ButtonLink } from '../ui/Button';
import { EmptyState, SkeletonCard } from '../ui/Primitives';
import { classifyError } from '../../hooks/useAsyncResource';

/**
 * The five states a screen can be in, in one component.
 *
 * Order matters and is the whole point: loading is checked before error, and
 * empty is a distinct state from error. v1 conflates them in several places — an
 * empty list and a failed request both render as "no data", so a user cannot tell
 * whether they have nothing to do or whether the app is broken.
 *
 * The loading state renders SKELETONS in the shape of the final layout rather
 * than a spinner, because a spinner tells the user nothing about what is coming.
 */
export function AsyncBoundary({
    loading,
    error,
    isEmpty = false,
    /** Skeleton node matching the real layout's shape. */
    skeleton = null,
    skeletonCards = 3,
    /** Empty state copy; a screen should always say what would fill it. */
    emptyTitle,
    emptyBody,
    emptyAction = null,
    emptyMood = 'sleepy',
    onRetry,
    children,
}) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div aria-busy="true" aria-live="polite">
                <span className="sr-only">{t('common.loading')}</span>
                {skeleton ?? (
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: skeletonCards }, (_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (error) {
        const { kind, key } = classifyError(error);
        const Icon =
            kind === 'network'
                ? WifiOff
                : kind === 'auth'
                  ? LogIn
                  : kind === 'notFound'
                    ? SearchX
                    : kind === 'credits'
                      ? Coins
                      : AlertTriangle;
        const retryable = kind !== 'auth' && kind !== 'notFound' && kind !== 'credits';

        return (
            <div
                role="alert"
                className="rounded-[var(--r-card)] border-2 border-[var(--border-strong)] bg-[var(--surface)] p-5"
            >
                <div className="flex gap-3">
                    <span aria-hidden="true" className="text-[var(--wrong)]">
                        <Icon size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <strong className="t-label block">{t(key ?? 'common.error.generic')}</strong>
                        {kind === 'network' ? (
                            <p className="t-micro muted mt-1">{t('common.error.networkHint')}</p>
                        ) : null}
                        {kind === 'credits' ? (
                            <p className="t-micro muted mt-1">{t('common.error.notEnoughCreditsHint')}</p>
                        ) : null}
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {retryable ? (
                        <Button size="sm" variant="secondary" onClick={onRetry}>
                            <RefreshCw size={15} aria-hidden="true" />
                            {t('common.retry')}
                        </Button>
                    ) : null}
                    {kind === 'auth' ? (
                        <ButtonLink size="sm" variant="primary" to="/login">
                            {t('common.login')}
                        </ButtonLink>
                    ) : null}
                    {kind === 'credits' ? (
                        <ButtonLink size="sm" variant="primary" to="/credits">
                            {t('nav.credits')}
                        </ButtonLink>
                    ) : null}
                </div>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <EmptyState
                title={emptyTitle ?? t('common.empty.defaultTitle')}
                body={emptyBody}
                action={emptyAction}
                lexi={<Lexi mood={emptyMood} size="md" />}
            />
        );
    }

    return children;
}
