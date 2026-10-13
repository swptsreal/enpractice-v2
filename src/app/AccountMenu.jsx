import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, LogOut, Settings, UserRound } from 'lucide-react';
import { Chip } from '../components/ui/Primitives';
import { formatDate } from '../lib/datetime';
import { accountInitial, membershipTierKey, readAvatarUrl } from '../features/account/accountMenuModel';
import { useAuth } from '../contexts/AuthContext';

/**
 * The profile block in the shell header: avatar button + the panel it opens.
 *
 * ── WHY IT EXISTS ─────────────────────────────────────────────────────────────
 *
 * The header's right-hand side was an avatar showing the first letter of the display name, wrapped
 * in a plain `<Link to="/profile">`. No avatar image, no membership, no menu — and the mockups could
 * not have told anyone better, because `headerRight` was a `shell()` parameter no screen ever
 * passed, so the top-right of every frame was empty. This is that gap, designed as
 * `_design/mockup/33b-account-menu.html`.
 *
 * The data was already there. `GET /auth/me` returns `avatarUrl`, `avatarFrameUrl`,
 * `membershipTier`, `membershipActive` and `membershipExpiresAt`, and `AuthContext` already calls
 * `refreshUser()` on boot — so this adds no request.
 *
 * ── A DISCLOSURE, NOT `role="menu"` ───────────────────────────────────────────
 *
 * The APG's menu pattern requires arrow-key navigation and roving focus. This panel is a short list
 * of LINKS, so the disclosure-navigation pattern is the honest one: `aria-expanded` +
 * `aria-controls` on the button, a plain list inside. Declaring `role="menu"` without implementing
 * its keyboard contract promises screen-reader behaviour that is not there — the same class of lie
 * as printing a band nobody measured.
 *
 * The label map, the avatar reader and the initial all live in
 * `features/account/accountMenuModel.js`: this file exports the component only, so React Fast
 * Refresh keeps working.
 */
export default function AccountMenu() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { pathname } = useLocation();

    /**
     * OPENNESS IS KEYED ON THE ROUTE, which is why there is no effect for it.
     *
     * `open` means "opened while on the current pathname", so ANY navigation closes the panel by
     * construction. The obvious alternative, `useEffect(() => setOpen(false), [pathname])`, is both
     * a `react-hooks/set-state-in-effect` error in this codebase and a race: the effect runs after
     * the new screen has painted, so for one frame the stale panel hangs over it. `AppLayout`
     * survives a route change, so without this keying the panel would simply stay open.
     */
    const [openedAt, setOpenedAt] = useState(null);
    const open = openedAt === pathname;
    const close = () => setOpenedAt(null);
    const toggle = () => setOpenedAt(open ? null : pathname);

    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const panelId = useId();

    const avatarUrl = readAvatarUrl(user);
    const initial = accountInitial(user);
    const tierLabel = t(membershipTierKey(user?.membershipTier));
    const active = user?.membershipActive !== false;
    const expiresAt = formatDate(user?.membershipExpiresAt);

    /* Escape closes and hands focus back to the button. Without the focus return, a keyboard user
       is dropped at the top of the document when the panel disappears. */
    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (event) => {
            if (event.key !== 'Escape') return;
            setOpenedAt(null);
            buttonRef.current?.focus();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    /* Click outside closes. `pointerdown` rather than `click`: a click that starts inside and ends
       outside (a drag-select) should not leave the panel open. This also covers navigation by mouse
       anywhere else in the shell — the rail, the tab bar, a link in the page. */
    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event) => {
            if (containerRef.current?.contains(event.target)) return;
            setOpenedAt(null);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    const items = [
        /* `nav.account`, not a shorter "Hồ sơ": the rail calls this destination "Cá nhân", and one
           destination with two names is the kind of drift the design system argues against. There is
           no `nav.profile` key at all — the audit refused it. */
        { to: '/profile', label: t('nav.account'), icon: UserRound },
        { to: '/settings', label: t('nav.settings'), icon: Settings },
        { to: '/notifications', label: t('nav.notifications'), icon: Bell },
    ];

    return (
        <div ref={containerRef} className="relative flex items-center gap-2">
            {/* The tier is a chip at >=1024px and a line INSIDE the panel below it: the phone header
                already carries Lexi, the title, the bell and the avatar, and a fifth element
                squeezes the title into an ellipsis. */}
            <Chip tone="teal" className="hidden lg:inline-flex">
                {tierLabel}
            </Chip>

            <button
                ref={buttonRef}
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={t('a11y.accountMenu')}
                onClick={toggle}
                className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-[var(--r-chip)] bg-[var(--teal)] font-extrabold text-[var(--on-teal)]"
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt=""
                        width={44}
                        height={44}
                        className="size-11 object-cover"
                        /* A broken avatar URL must not leave an empty teal circle: the initial is
                           the documented fallback and `avatarUrl` is nullable by design. */
                        onError={(event) => {
                            event.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    initial
                )}
            </button>

            {open ? (
                <div
                    id={panelId}
                    className="absolute top-[calc(100%+10px)] right-0 z-40 w-[min(300px,calc(100vw-28px))] rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-[0_12px_28px_-12px_rgb(20_35_43/0.35)]"
                >
                    <div className="flex items-center gap-3">
                        <span
                            aria-hidden="true"
                            className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[var(--r-chip)] bg-[var(--teal)] font-extrabold text-[var(--on-teal)]"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="" width={48} height={48} className="size-12 object-cover" />
                            ) : (
                                initial
                            )}
                        </span>
                        <span className="min-w-0">
                            <strong className="t-label block truncate">{user?.displayName ?? '—'}</strong>
                            <span className="t-micro muted block truncate">{user?.email ?? ''}</span>
                        </span>
                    </div>

                    {/* Membership: information, and it gates NOTHING — the same rule the level panel
                        states. A tier with no expiry says so rather than showing a blank line. */}
                    <div className="mt-3">
                        <span className="t-micro muted">{t('profilePage.membershipHeader.eyebrow')}</span>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <Chip tone="teal">{tierLabel}</Chip>
                            <span className="t-micro muted">
                                {!active
                                    ? t('profilePage.membershipHeader.status.expired')
                                    : expiresAt
                                      ? t('profilePage.membershipHeader.status.expiresAt', { date: expiresAt })
                                      : t('profilePage.membershipHeader.status.noExpiry')}
                            </span>
                        </div>
                    </div>

                    <div role="separator" className="-mx-3.5 my-3 h-0.5 bg-[var(--border)]" />

                    <ul className="flex flex-col gap-0.5">
                        {items.map(({ to, label, icon: Icon }) => (
                            <li key={to}>
                                <Link
                                    to={to}
                                    onClick={close}
                                    className="flex min-h-11 items-center gap-3 rounded-[var(--r-control)] px-2 font-bold text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
                                >
                                    <Icon size={18} aria-hidden="true" />
                                    <span>{label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div role="separator" className="-mx-3.5 my-3 h-0.5 bg-[var(--border)]" />

                    <ul className="flex flex-col gap-0.5">
                        <li>
                            <button
                                type="button"
                                onClick={() => {
                                    close();
                                    logout();
                                }}
                                className="flex min-h-11 w-full items-center gap-3 rounded-[var(--r-control)] px-2 text-left font-bold text-[var(--wrong)] hover:bg-[var(--wrong-soft)]"
                            >
                                <LogOut size={18} aria-hidden="true" />
                                <span>{t('common.logout')}</span>
                            </button>
                        </li>
                    </ul>
                </div>
            ) : null}
        </div>
    );
}
