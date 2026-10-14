import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MORE_NAV } from './navigation';
import { RowBox } from '../components/ui/Card';
import { Chip } from '../components/ui/Primitives';
import { cn } from '../lib/cn';

/**
 * Mobile drawer for remaining sidebar functions (<1024px).
 *
 * Triggered from the bottom tab bar "Thêm" item. Replaces the old profile tab,
 * gathering all secondary and account tools in one place with thumb-friendly
 * 44px rows and clean grouping.
 */
export function MoreSheet({ open, onClose }) {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const sheetRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const initial = (user?.displayName || user?.name || user?.email || 'M').charAt(0).toUpperCase();
    const tier = user?.membershipTier || 'Free';

    const accountItems = MORE_NAV.filter((item) =>
        ['/profile', '/settings', '/notifications'].includes(item.to)
    );
    const studyItems = MORE_NAV.filter((item) =>
        ['/vocabulary', '/path', '/dictionary', '/vocabulary/check', '/review', '/writing', '/speaking', '/custom-speaking'].includes(item.to)
    );
    const progressItems = MORE_NAV.filter((item) =>
        ['/leaderboard', '/rewards', '/credits'].includes(item.to)
    );

    const renderNavList = (items) => (
        <ul className="flex flex-col gap-1">
            {items.map(({ to, labelKey, icon: Icon }) => {
                const isCurrent = pathname === to || pathname.startsWith(to + '/');
                return (
                    <li key={to}>
                        <Link
                            to={to}
                            onClick={onClose}
                            className={cn(
                                'flex min-h-[44px] items-center gap-3 rounded-[var(--r-control)] px-3 py-2 text-sm font-semibold transition-colors',
                                isCurrent
                                    ? 'bg-[var(--teal-soft)] text-[var(--teal)]'
                                    : 'text-[var(--ink)] hover:bg-[var(--surface-alt)]'
                            )}
                        >
                            <span
                                className={cn(
                                    'grid size-8 shrink-0 place-items-center rounded-lg',
                                    isCurrent ? 'bg-[var(--teal)] text-[var(--surface)]' : 'bg-[var(--surface-alt)] text-[var(--ink-soft)]'
                                )}
                            >
                                <Icon size={18} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{t(labelKey)}</span>
                            <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-[var(--ink-muted)] opacity-60" />
                        </Link>
                    </li>
                );
            })}
        </ul>
    );

    return (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true" role="dialog" id="more-sheet" aria-label={t('nav.more')}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[rgb(20_35_43/0.45)] transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                className="fixed inset-x-0 bottom-0 z-10 flex max-h-[85dvh] flex-col rounded-t-[28px] border-t-2 border-[var(--border)] bg-[var(--surface)] shadow-[0_-8px_32px_-8px_rgb(20_35_43/0.3)]"
            >
                {/* Drag handle */}
                <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                    <h2 className="t-h3">{t('nav.more')}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('common.close')}
                        className="grid size-9 place-items-center rounded-[var(--r-control)] text-[var(--ink-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 pb-[calc(var(--shell-tabbar)+env(safe-area-inset-bottom,0px)+16px)]">
                    {isAuthenticated ? (
                        <div className="mb-4">
                            <RowBox center className="gap-3 p-3">
                                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--teal)] font-bold text-[var(--surface)]">
                                    {initial}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <strong className="t-label block truncate">
                                        {user?.displayName || user?.name || 'Học viên'}
                                    </strong>
                                    <span className="t-micro muted block truncate">{user?.email}</span>
                                </div>
                                <Chip tone="teal">{tier}</Chip>
                            </RowBox>
                        </div>
                    ) : null}

                    {/* Groups */}
                    <div className="flex flex-col gap-4">
                        <section>
                            <h3 className="t-micro muted mb-1.5 px-3 font-extrabold uppercase tracking-wider">
                                {t('nav.account')}
                            </h3>
                            {renderNavList(accountItems)}
                        </section>

                        <section>
                            <h3 className="t-micro muted mb-1.5 px-3 font-extrabold uppercase tracking-wider">
                                {t('nav.practice')} & {t('nav.learn')}
                            </h3>
                            {renderNavList(studyItems)}
                        </section>

                        <section>
                            <h3 className="t-micro muted mb-1.5 px-3 font-extrabold uppercase tracking-wider">
                                {t('nav.progress')}
                            </h3>
                            {renderNavList(progressItems)}
                        </section>

                        {isAuthenticated ? (
                            <section className="pt-2 border-t border-[var(--border)]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        logout?.();
                                    }}
                                    className="flex w-full min-h-[44px] items-center gap-3 rounded-[var(--r-control)] px-3 py-2 text-sm font-semibold text-[var(--wrong)] hover:bg-[var(--surface-alt)] transition-colors"
                                >
                                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--wrong)_12%,var(--surface))] text-[var(--wrong)]">
                                        <LogOut size={18} aria-hidden="true" />
                                    </span>
                                    <span>{t('common.logout')}</span>
                                </button>
                            </section>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MoreSheet;
