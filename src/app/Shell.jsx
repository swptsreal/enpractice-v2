import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Coins } from 'lucide-react';
import { PRIMARY_NAV, SECONDARY_NAV, activePrimaryId } from './navigation';
import { Lexi } from '../components/mascot/Lexi';
import { Chip } from '../components/ui/Primitives';
import { cn } from '../lib/cn';

const itemBase =
    'flex min-h-12 items-center gap-3 rounded-[var(--r-control)] px-3.5 ' +
    'text-[0.9375rem] font-bold text-[var(--ink-soft)] ' +
    'transition-colors duration-[var(--m-fast)] ' +
    'hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]';

/**
 * Sidebar rail, >=1024px only.
 *
 * Destinations are flat: no submenus, because a submenu hides its contents
 * behind an extra decision and v1 buried 10 of 23 destinations that way. Where
 * a module genuinely has sub-modes, the page owns a segmented control for them.
 */
export function Sidebar({ streakDays = 0, credits = 0, className }) {
    const { t } = useTranslation();
    const active = activePrimaryId(window.location.pathname);

    return (
        <aside
            aria-label={t('nav.primary')}
            className={cn(
                'fixed inset-y-0 left-0 z-40 hidden w-[var(--shell-sidebar)] flex-col',
                'border-r-2 border-[var(--border)] bg-[var(--surface)] lg:flex',
                className
            )}
        >
            <NavLink
                to="/home"
                className="flex items-center gap-2.5 border-b-2 border-[var(--border)] p-4"
            >
                <Lexi mood="idle" size="xs" eager />
                <span className="min-w-0">
                    <span className="t-h3 block leading-tight">{t('common.appName')}</span>
                    <span className="t-micro muted">{t('common.slogan')}</span>
                </span>
            </NavLink>

            <nav className="min-h-0 flex-1 overflow-y-auto p-3">
                <ul className="flex flex-col gap-1">
                    {PRIMARY_NAV.map(({ id, to, labelKey, icon: Icon }) => (
                        <li key={id}>
                            <NavLink
                                to={to}
                                aria-current={active === id ? 'page' : undefined}
                                className={({ isActive }) =>
                                    cn(
                                        itemBase,
                                        (isActive || active === id) &&
                                            'bg-[var(--teal-soft)] text-[var(--teal)] hover:bg-[var(--teal-soft)]'
                                    )
                                }
                            >
                                <Icon size={20} aria-hidden="true" />
                                <span>{t(labelKey)}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <p className="px-3.5 pt-4 pb-1.5 text-xs font-extrabold tracking-[0.08em] text-[var(--ink-muted)] uppercase">
                    {t('nav.more')}
                </p>
                <ul className="flex flex-col gap-1">
                    {SECONDARY_NAV.map(({ to, labelKey, icon: Icon }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    cn(itemBase, 'min-h-11 text-sm', isActive && 'bg-[var(--surface-alt)] text-[var(--ink)]')
                                }
                            >
                                <Icon size={18} aria-hidden="true" />
                                <span>{t(labelKey)}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Streak renders in the calm tier, never as amber pressure —
                see DESIGN-V2.md §9, the Grace-Days Rule.

                BOTH VALUES CAN BE NULL while they load, and a dash is the honest render:
                inventing `0` would state that a user who has studied for twelve days has
                no streak, and a literal placeholder number is what this used to show. */}
            <div className="flex gap-2 border-t-2 border-[var(--border)] p-3">
                <Chip tone="neutral" icon={Flame}>
                    {streakDays == null ? (
                        <span aria-label={t('common.loading')}>—</span>
                    ) : (
                        t('common.streakDays', { count: streakDays })
                    )}
                </Chip>
                <Chip tone="teal" icon={Coins}>
                    {credits == null ? <span aria-label={t('common.loading')}>—</span> : credits}
                </Chip>
            </div>
        </aside>
    );
}

/**
 * Bottom tab bar, <1024px only.
 *
 * This is the single biggest mobile fix in v2. v1 put navigation in a left
 * Drawer AND hid the header on scroll-down, so on a phone the only way to
 * navigate could scroll out of existence. Five destinations are always visible
 * and thumb-reachable, with safe-area padding for the home indicator.
 */
export function TabBar({ className }) {
    const { t } = useTranslation();
    const active = activePrimaryId(window.location.pathname);

    return (
        <nav
            aria-label={t('nav.primary')}
            className={cn(
                'fixed inset-x-0 bottom-0 z-40 border-t-2 border-[var(--border)] bg-[var(--surface)] lg:hidden',
                'pb-[env(safe-area-inset-bottom,0px)]',
                className
            )}
        >
            <ul className="flex">
                {PRIMARY_NAV.map(({ id, to, labelKey, icon: Icon }) => {
                    const isActive = active === id;
                    return (
                        <li key={id} className="flex-1">
                            <NavLink
                                to={to}
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                    'flex h-[var(--shell-tabbar)] flex-col items-center justify-center gap-1',
                                    'text-[0.6875rem] font-bold',
                                    isActive ? 'text-[var(--teal)]' : 'text-[var(--ink-muted)]'
                                )}
                            >
                                <Icon size={22} aria-hidden="true" />
                                <span>{t(labelKey)}</span>
                            </NavLink>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
