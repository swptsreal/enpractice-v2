import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

/**
 * Route guard for screens that need a session.
 *
 * Without this, a logged-out visitor landing on `/home` fires four authenticated
 * requests, gets four 401s, and is shown four "your session has expired" panels —
 * both wrong and alarming. "You have never signed in" and "your session expired"
 * are different situations and must not share a message.
 *
 * v1 handled it by not rendering account-only destinations in the sidebar for
 * guests, and let the screens 401 if reached directly. A guard is the honest
 * version: the visitor is sent to sign in and returned to what they asked for.
 *
 * The `Navigate` is returned directly rather than rendered inside a styled panel,
 * because it renders nothing — a "you must sign in" card would flash for one frame
 * before the redirect, which reads as a bug.
 */
export default function RequireAuth({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    /* While the session is being restored, render a quiet status rather than
       flashing the login redirect at a signed-in user on every reload. */
    if (loading) {
        return (
            <div role="status" aria-busy="true" aria-live="polite" className="grid min-h-[60vh] place-items-center">
                <span className="sr-only">{t('common.loading')}</span>
                <span className="size-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--teal)]" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ redirectTo: `${location.pathname}${location.search}` }} />;
    }

    return children;
}
