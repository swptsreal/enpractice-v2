import { Outlet, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { Sidebar, TabBar } from './Shell';
import OnboardingAutoOpen from './OnboardingAutoOpen';
import { Lexi } from '../components/mascot/Lexi';
import { Badge } from '../components/ui/Primitives';
import { PAGE_TITLES } from './pageTitles';
import { ProviderStack } from './ProviderLayout';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContextCore';
import { useUnreadCount } from '../features/notification/useNotifications';
import { useOnboardingGate } from '../features/onboarding/useOnboarding';

/**
 * The app shell.
 *
 * v1's shell composed ~10 panels into a 12-column bento and had three separate
 * navigation affordances. v2's shell has one job: hold a page between a
 * 264px rail (desktop) or a bottom tab bar (mobile), with a sticky header.
 *
 * The margin uses the sidebar token rather than a hard-coded 292px, and the
 * header is never hidden on scroll — v1's self-hiding header could take the
 * only navigation trigger off a phone screen mid-scroll.
 *
 * PROVIDER ORDER, which is a real dependency chain and not a style choice:
 *
 *   CreditProvider           reads only AuthContext.
 *   RealtimeStompProvider    reads AuthContext and the guest-session api.
 *   VocabularyExplainProvider reads BOTH of the above: it prechecks the credit
 *                             cost and publishes over STOMP, and it calls
 *                             `refreshBalance()` when a stream starts.
 *
 * They live HERE rather than in main.jsx on purpose. The landing and login pages
 * use none of them, and importing them statically would pull the STOMP client into
 * the FIRST download. Mounting them in the shell keeps them out of the entry chunk
 * for every signed-out visitor.
 *
 * Until this was wired up, all three providers existed but nothing rendered them,
 * so `/vocabulary/check` had no way to reach the AI explain stream at all.
 */
export default function AppLayout() {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const title = PAGE_TITLES[pathname] ?? 'common.appName';

    return (
        <ProviderStack>
            <ShellChrome title={title} t={t} />
        </ProviderStack>
    );
}

/**
 * The visible shell. Split out so the providers above read as a wrapper.
 *
 * THE HEADER AND RAIL READ REAL DATA. They used to carry literals — `streakDays={12}`,
 * `credits={240}`, an avatar "M", a notification badge "3" — which is the one thing a
 * product that refuses to invent band improvements must not do. All four now come from
 * something that actually knows:
 *
 *   streak       the gate's own summary request (one call, shared with the gate)
 *   credits      `CreditProvider`, which already fetched the balance
 *   initial      the session's display name (`useAuth`), no request at all
 *   unread       `useUnreadCount`, and the badge is absent at zero rather than "0"
 *
 * THE BELL AND THE GATE ARE BOTH CONDITIONAL ON A SESSION. The shell also renders while
 * `RequireAuth` is still deciding, so an authenticated request from a signed-out visitor
 * would be a 401 in the console and nothing else. The gate hook short-circuits for a guest;
 * the bell is a child component that is simply not mounted.
 */
function ShellChrome({ title, t }) {
    const { user, isAuthenticated } = useAuth();
    const { availableBalance } = useCredit();
    const { shouldOpen, summary } = useOnboardingGate();

    const initial = user?.displayName?.trim()?.charAt(0)?.toUpperCase() || '?';

    return (
        <div className="min-h-dvh bg-[var(--canvas)]">
            {/* Opens onboarding once per page load for a first-run account. Its own component
                so the "open once, never trap Back" rule can be tested — see
                OnboardingAutoOpen.jsx. */}
            <OnboardingAutoOpen shouldOpen={shouldOpen} />

            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-[var(--r-control)] focus:bg-[var(--teal)] focus:px-4 focus:py-2 focus:font-bold focus:text-[var(--on-teal)]"
            >
                {t('common.skipToContent')}
            </a>

            <Sidebar streakDays={summary?.currentStreak ?? null} credits={availableBalance} />

            <div className="lg:ml-[var(--shell-sidebar)]">
                <header className="sticky top-0 z-30 flex min-h-[var(--shell-header)] items-center gap-3 border-b-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 lg:px-5">
                    <Lexi mood="idle" size="xs" className="lg:hidden" eager />
                    <h1 className="t-h1 min-w-0 flex-1 truncate">{t(title)}</h1>

                    {isAuthenticated ? <NotificationBell label={t('a11y.notification')} /> : null}

                    <Link
                        to="/profile"
                        aria-label={t('a11y.profile')}
                        className="grid size-11 place-items-center rounded-[var(--r-chip)] bg-[var(--teal)] font-extrabold text-[var(--on-teal)]"
                    >
                        {initial}
                    </Link>
                </header>

                <main
                    id="main"
                    className="mx-auto w-full max-w-[var(--container-wide)] px-3.5 pt-5 pb-[calc(var(--shell-tabbar)+24px)] lg:px-6 lg:pb-10"
                >
                    <Outlet />
                </main>
            </div>

            {/* The floating helper is the ONE persistent Lexi in the app. She is
                absent from every timed screen — a mascot that talks during a
                60-minute reading test is a liability, not a companion. */}
            <Link
                to="/ai-chat"
                aria-label={t('a11y.askLexi')}
                className="fixed right-4 bottom-[calc(var(--shell-tabbar)+16px)] z-30 grid size-14 place-items-center rounded-[var(--r-chip)] border-2 border-[var(--border-strong)] bg-[var(--surface)] shadow-[0_4px_0_0_var(--border),0_12px_24px_-10px_rgb(20_35_43/0.35)] lg:bottom-4"
            >
                <Lexi mood="idle" size="xs" />
            </Link>

            <TabBar />
        </div>
    );
}

/** The floating Lexi is suppressed on timed surfaces. */
export function TimedSurfaceLayout() {
    return <Outlet />;
}

/**
 * The notification bell, with a real count.
 *
 * A separate component so the count is only fetched for a session: hooks cannot be called
 * conditionally, so the condition belongs at the component boundary. The badge is ABSENT
 * at zero rather than showing "0" — a bell with a zero on it reads as a broken feature,
 * and the count is only meaningful when there is something to read.
 */
function NotificationBell({ label }) {
    const { count } = useUnreadCount();

    return (
        <Link
            to="/notifications"
            aria-label={label}
            className="relative grid size-11 place-items-center rounded-[var(--r-control)] border-2 border-[var(--border-strong)] text-[var(--ink-soft)]"
        >
            <Bell size={18} aria-hidden="true" />
            {count > 0 ? <Badge className="absolute -top-1.5 -right-1.5">{count}</Badge> : null}
        </Link>
    );
}
