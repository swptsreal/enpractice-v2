import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * The landing page is lazy HERE, not in `App.jsx`.
 *
 * `App.jsx` imports `RootRedirect` STATICALLY (it is tiny and always needed), so a
 * static `LandingPage` import inside it would pull the entire landing page into the
 * first download — measured: the entry chunk went 168.41 -> 184.36 kB gzip. Deferring
 * it here keeps the entry lean and the landing arrives as its own chunk.
 */
const LandingPage = lazy(() => import('../pages/landing/LandingPage'));

/**
 * The root.
 *
 * A signed-in visitor goes straight to their dashboard; a visitor with no session gets
 * the LANDING PAGE rather than being dropped into a tool.
 *
 * v1 (and the first v2 pass) sent a guest to `/vocabulary/check`, reasoning that a guest
 * must not land on a guarded route and be bounced to `/login`. That reasoning was sound
 * but the destination was wrong: the root is the one URL a visitor can arrive at without
 * choosing anything, and it was showing them an input box with no explanation of what
 * the product is or why the trial is free. The landing page answers exactly that, and
 * its guest CTA reaches the same trial one click later.
 *
 * `loading` renders nothing rather than redirecting: bouncing a signed-in user to the
 * landing page during session restore, then to `/home`, would be a visible flash of the
 * wrong page.
 */
export default function RootRedirect() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return null;

    if (isAuthenticated) return <Navigate to="/home" replace />;

    return (
        <Suspense
            fallback={
                <div role="status" aria-busy="true" aria-live="polite" className="grid min-h-dvh place-items-center">
                    <span className="sr-only">Đang tải…</span>
                    <span className="size-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--teal)]" />
                </div>
            }
        >
            <LandingPage />
        </Suspense>
    );
}
