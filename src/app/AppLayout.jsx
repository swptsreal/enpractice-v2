import { Suspense, lazy, useRef, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Coins } from 'lucide-react';
import { Sidebar, TabBar } from './Shell';
import { MoreSheet } from './MoreSheet';
import OnboardingAutoOpen from './OnboardingAutoOpen';
import AccountMenu from './AccountMenu';
import { Lexi } from '../components/mascot/Lexi';
import { Badge } from '../components/ui/Primitives';
import { pageTitleKey } from './pageTitles';
import { ProviderStack } from './ProviderLayout';
import { PageHeaderProvider } from './PageHeaderContext';
import { usePageHeaderSubtitle } from './PageHeaderContextCore';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContextCore';
import { useUnreadCount } from '../features/notification/useNotifications';
import { useOnboardingGate } from '../features/onboarding/useOnboarding';

const LexiPanel = lazy(() => import('./LexiPanel'));

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
    const title = pageTitleKey(pathname);

    return (
        <ProviderStack>
            <PageHeaderProvider>
                <ShellChrome title={title} t={t} pathname={pathname} />
            </PageHeaderProvider>
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
function ShellChrome({ title, t, pathname }) {
    const { isAuthenticated } = useAuth();
    const { availableBalance } = useCredit();
    const { shouldOpen, summary } = useOnboardingGate();
    /* One line of page context, published by the page itself (screen 06 does). The mockup
       puts it under the h1 as `t-micro muted`, so the header is a two-line block at
       >=1024px and still one line with no subtitle. */
    const subtitle = usePageHeaderSubtitle();

    /* The helper's panel: open when opened on the CURRENT route; automatically closes
       on navigation without an effect. Suppressed on /ai-chat. */
    const isAiChat = pathname === '/ai-chat';
    const [openedPathname, setOpenedPathname] = useState(null);
    const lexiOpen = openedPathname === pathname;
    const lexiButtonRef = useRef(null);

    const [moreOpenedPathname, setMoreOpenedPathname] = useState(null);
    const moreOpen = moreOpenedPathname === pathname;

    return (
        /* THE SHELL IS A FIXED VIEWPORT, AND `<main>` IS THE SCROLLER.
           Reported as "Layout tổng: scroll trong content chứ không phải cả header như hiện tại".
           The document was the only scroller, so the header's `sticky top-0` was doing the work of
           a fixed header and the page scrolled underneath it. `h-dvh` + `overflow-hidden` here,
           with `flex-1 min-h-0 overflow-y-auto` on `main`, is what makes the header genuinely
           stationary instead of sticky — and it is why `min-h-dvh` MUST NOT come back: leaving it
           gives the column no definite height, `main` has nothing to fill, the document keeps
           scrolling, and the change silently does nothing.

           NOTHING OUTSIDE THIS COMPONENT IS AFFECTED, deliberately: the landing page, login,
           onboarding, `/vocabulary/check` and every take screen are mounted OUTSIDE `AppLayout`
           (see src/App.jsx), so they keep scrolling the document with their own sticky headers.
           Putting `overflow: hidden` on `html`/`body` instead would have made all of them
           unscrollable while still advertising `sticky top-0` headers, and no test would notice. */
        <div className="h-dvh overflow-hidden bg-[var(--canvas)]">
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

            <div className="flex h-full min-h-0 flex-col lg:ml-[var(--shell-sidebar)]">
                <header className="z-30 flex min-h-[var(--shell-header)] shrink-0 items-center gap-3 border-b-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 lg:px-5">
                    <Lexi mood="idle" size="xs" className="lg:hidden" eager />
                    <div className="min-w-0 flex-1">
                        <h1 className="t-h1 truncate">{t(title)}</h1>
                        {subtitle ? <p className="t-micro muted truncate">{subtitle}</p> : null}
                    </div>

                    {isAuthenticated ? (
                        <Link
                            to="/credits"
                            className="inline-flex h-[30px] items-center gap-1.5 rounded-[var(--r-chip)] bg-[var(--teal-soft)] px-2.5 text-xs font-bold text-[var(--teal)] transition-colors hover:bg-[var(--teal)] hover:text-[var(--on-teal)] lg:hidden"
                            aria-label={t('nav.credits')}
                        >
                            <Coins size={14} aria-hidden="true" />
                            <span>{availableBalance != null ? availableBalance : '—'}</span>
                        </Link>
                    ) : null}

                    {isAuthenticated ? <NotificationBell label={t('a11y.notification')} /> : null}

                    {/* The avatar button and its account panel. It replaced a bare
                        `<Link to="/profile">` that showed a letter: no real avatar, no membership
                        and no menu, because the header's right-hand side had never been designed
                        (`_design/mockup/33b-account-menu.html`). */}
                    {isAuthenticated ? <AccountMenu /> : null}
                </header>

                {/* The scrollport is FULL WIDTH and the max-width container sits inside it, rather
                    than the other way round: with the container as the scroller, the scrollbar
                    detaches from the window edge on a wide screen and hangs in the middle of the
                    page. `tabIndex={-1}` makes the skip link actually move focus here — a scrollport
                    that cannot take focus leaves a keyboard user at the top of a page they cannot
                    reach by tabbing.
                    The bottom padding stays ON the scroller, or the last row of content hides
                    behind the fixed tab bar (`Shell.jsx`).

                    `relative` IS LOAD-BEARING, and it is the one non-obvious class here. Without a
                    positioned ancestor, an `absolute` descendant of a page resolves against the
                    INITIAL CONTAINING BLOCK — the viewport — and is therefore NOT clipped by this
                    scrollport's `overflow-y-auto`. Measured on `/profile`: a Tailwind `sr-only`
                    span (accessibility text, `position: absolute`) sat 949px down, so the DOCUMENT
                    was 949px tall while the viewport is 900 — the shell was scrolling its content
                    correctly and the page still had a 49px document scroll. Making `main` the
                    containing block keeps such a node inside the scrollport, which is what every
                    future absolutely-positioned decoration needs too. */}
                <main
                    id="main"
                    tabIndex={-1}
                    className="relative min-h-0 flex-1 overflow-y-auto outline-none"
                >
                    <div className="mx-auto w-full max-w-[var(--container-wide)] px-3.5 pt-5 pb-[calc(var(--shell-tabbar)+24px)] lg:px-6 lg:pb-10">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* The floating helper is the ONE persistent Lexi in the app. She is
                absent from every timed screen — a mascot that talks during a
                60-minute reading test is a liability, not a companion.
                Suppressed on /ai-chat because the screen itself is the full AI coach. */}
            {!isAiChat ? (
                <>
                    <button
                        ref={lexiButtonRef}
                        type="button"
                        aria-haspopup="dialog"
                        aria-expanded={lexiOpen}
                        aria-controls="lexi-panel"
                        aria-label={t('a11y.askLexi')}
                        onClick={() =>
                            setOpenedPathname((curr) => (curr === pathname ? null : pathname))
                        }
                        className="fixed right-4 bottom-[calc(var(--shell-tabbar)+16px)] z-30 grid size-14 place-items-center rounded-[var(--r-chip)] border-2 border-[var(--border-strong)] bg-[var(--surface)] shadow-[0_4px_0_0_var(--border),0_12px_24px_-10px_rgb(20_35_43/0.35)] lg:bottom-4"
                    >
                        <Lexi mood={lexiOpen ? 'thinking' : 'idle'} size="xs" />
                    </button>

                    {lexiOpen ? (
                        <Suspense fallback={null}>
                            <LexiPanel
                                contextLabel={t(title)}
                                onClose={() => {
                                    setOpenedPathname(null);
                                    /* Focus goes back to the button that opened it. Without this a keyboard
                                       user is dropped at the top of the document when the panel closes. */
                                    lexiButtonRef.current?.focus();
                                }}
                            />
                        </Suspense>
                    ) : null}
                </>
            ) : null}

            <TabBar
                onToggleMore={() =>
                    setMoreOpenedPathname((curr) => (curr === pathname ? null : pathname))
                }
                moreOpen={moreOpen}
            />

            <MoreSheet
                open={moreOpen}
                onClose={() => setMoreOpenedPathname(null)}
            />
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
