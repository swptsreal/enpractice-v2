import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Palette,
    Database,
    Flame,
    Pause,
    Info,
    Download,
    Trash2,
    AlertTriangle,
    Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { cn } from '../../lib/cn';
import { useLocalPreferences, useNotificationPreferences, NOTIFICATION_KEYS } from '../../features/settings/useSettings';

/**
 * Settings — `/settings` (screen 35).
 *
 * THE SECTION ORDER IS A PRODUCT DECISION, NOT A LAYOUT ONE. "Nhắc học & chuỗi" comes
 * FIRST — above learning preferences and above theme — because the gamification ethics
 * are the thing most likely to harm a user if buried. The three controls that bound the
 * product's nagging live there, in one group, with no submenu:
 *
 *   - **Tạm dừng tất cả nhắc học** — one switch, and it really does switch all thirteen
 *     `allow*` flags off in one request.
 *   - **Tắt theo dõi chuỗi ngày** — and the helper text states the BEHAVIOUR, not just
 *     the state: the day count renders as a switched-off feature rather than as an
 *     unpaid debt.
 *   - **Ngày nghỉ tự động** — 2 per month, automatic, and explicitly NOT purchasable.
 *
 * WHAT IS SERVER-BACKED AND WHAT IS LOCAL IS SHOWN, NOT HIDDEN. Notification
 * preferences persist to `PUT /notification-preferences` (verified: a partial body
 * merges, so one switch is one atomic write). Theme, text size and the two streak
 * switches have **no endpoint** — the backend has no such fields — so they are stored in
 * `localStorage` and the screen says so. Presenting a local-only switch as an account
 * setting would be a lie the user discovers on their second device.
 *
 * THEME TELLS THE TRUTH ABOUT v2. It is light / dark / system only, with a note that
 * v1's nine theme profiles are gone. A user who liked `mono` deserves to be told rather
 * than to find out by looking.
 */
const SECTIONS = [
    { id: 'reminders', labelKey: 'settings.sectionReminders', icon: Flame },
    { id: 'learning', labelKey: 'settings.sectionLearning', icon: BookOpen },
    { id: 'appearance', labelKey: 'settings.sectionAppearance', icon: Palette },
    { id: 'data', labelKey: 'settings.sectionData', icon: Database },
];

const THEMES = ['light', 'dark', 'system'];
const TEXT_SIZES = ['medium', 'large', 'xlarge'];

export default function SettingsPage() {
    const { t } = useTranslation();
    const { prefs, update } = useLocalPreferences();
    const { values, loading, error, savingKey, setField, pauseAll, restoreAll, reload } =
        useNotificationPreferences();

    const anyReminderOn = values ? NOTIFICATION_KEYS.some((key) => values[key] === true) : false;

    async function onTogglePause() {
        if (prefs.remindersPaused) {
            await restoreAll(prefs.pausedSnapshot);
            update({ remindersPaused: false, pausedSnapshot: null });
            return;
        }
        /* Capture the current values FIRST, so the pause is reversible. */
        const snapshot = {};
        for (const key of NOTIFICATION_KEYS) snapshot[key] = values?.[key] ?? false;
        const ok = await pauseAll(snapshot);
        if (ok) update({ remindersPaused: true, pausedSnapshot: snapshot });
    }

    return (
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
            <p className="t-micro muted">{t('settings.subtitle')}</p>

            <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                {/* --- sticky section nav (>=1024px), inline below ------------ */}
                <nav aria-label={t('settings.sectionsLabel')} className="lg:sticky lg:top-4 lg:self-start">
                    <ul className="flex flex-wrap gap-1.5 lg:flex-col">
                        {SECTIONS.map(({ id, labelKey, icon: Icon }) => (
                            <li key={id}>
                                <a
                                    href={`#${id}`}
                                    className={cn(
                                        'flex min-h-11 items-center gap-2.5 rounded-[var(--r-control)] px-3.5',
                                        'text-sm font-bold text-[var(--ink-soft)] hover:bg-[var(--surface-alt)]'
                                    )}
                                >
                                    <Icon size={17} aria-hidden="true" />
                                    {t(labelKey)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex flex-col gap-4">
                    {/* ============ 1. REMINDERS & STREAK ==================== */}
                    <section id="reminders" aria-labelledby="reminders-title">
                        <Card level="edge" padding="xl" className="flex flex-col gap-4">
                            <h2 id="reminders-title" className="t-h3 flex items-center gap-2">
                                <Flame size={18} aria-hidden="true" />
                                {t('settings.sectionReminders')}
                            </h2>

                            {/* --- pause everything ---------------------------- */}
                            <SwitchRow
                                label={t('settings.pauseAll')}
                                help={t('settings.pauseAllHelp')}
                                checked={prefs.remindersPaused || !anyReminderOn}
                                busy={savingKey === '__all__'}
                                onChange={onTogglePause}
                                action={
                                    prefs.remindersPaused ? (
                                        <Chip tone="amber" icon={Pause}>
                                            {t('settings.pausedChip')}
                                        </Chip>
                                    ) : null
                                }
                            />

                            {/* --- streak tracking ---------------------------- */}
                            <SwitchRow
                                label={t('settings.streakTracking')}
                                /* The helper states the BEHAVIOUR: off means the count
                                   renders as a switched-off feature, not a debt. */
                                help={t('settings.streakTrackingHelp')}
                                checked={!prefs.streakTracking}
                                onChange={(next) => update({ streakTracking: !next })}
                            />

                            {/* --- grace days: a fact, not a control ---------- */}
                            <div className="flex items-start gap-3 rounded-[var(--r-card)] bg-[var(--teal-soft)] p-3.5">
                                <Info size={16} className="mt-0.5 shrink-0 text-[var(--teal)]" aria-hidden="true" />
                                <div className="min-w-0">
                                    <strong className="t-label block">{t('settings.graceDaysTitle')}</strong>
                                    <p className="t-micro mt-1">{t('settings.graceDaysBody')}</p>
                                </div>
                            </div>

                            {/* --- individual reminders, real server writes --- */}
                            <AsyncBoundary
                                loading={loading}
                                error={error}
                                onRetry={reload}
                                skeleton={<SkeletonCard lines={3} />}
                                isEmpty={false}
                            >
                                <details className="border-t-2 border-[var(--border)] pt-3">
                                    <summary className="t-label cursor-pointer">
                                        {t('settings.individualReminders')}
                                    </summary>
                                    <p className="t-micro muted mt-1.5">{t('settings.syncedNote')}</p>
                                    <ul className="mt-3 flex flex-col gap-1">
                                        {NOTIFICATION_KEYS.filter((k) => k !== 'allowPush' && k !== 'allowEmail').map((key) => (
                                            <li key={key}>
                                                <SwitchRow
                                                    label={t(`settings.notify.${key}`)}
                                                    checked={Boolean(values?.[key])}
                                                    busy={savingKey === key}
                                                    onChange={(next) => setField(key, next)}
                                                    compact
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            </AsyncBoundary>
                        </Card>
                    </section>

                    {/* ============ 2. LEARNING ============================== */}
                    <section id="learning" aria-labelledby="learning-title">
                        <Card level="edge" padding="xl" className="flex flex-col gap-3">
                            <h2 id="learning-title" className="t-h3 flex items-center gap-2">
                                <BookOpen size={18} aria-hidden="true" />
                                {t('settings.sectionLearning')}
                            </h2>

                            <fieldset>
                                <legend className="t-label mb-2">{t('settings.textSize')}</legend>
                                <p className="t-micro muted mb-2">{t('settings.textSizeHelp')}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {TEXT_SIZES.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            aria-pressed={prefs.textSize === size}
                                            onClick={() => update({ textSize: size })}
                                            className={cn(
                                                'min-h-11 rounded-[var(--r-control)] px-3.5 text-sm font-bold',
                                                prefs.textSize === size
                                                    ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                                    : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                                            )}
                                        >
                                            {t(`settings.textSizeOption.${size}`)}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>

                            <p className="t-micro muted border-t-2 border-[var(--border)] pt-3">
                                {t('settings.localOnlyNote')}
                            </p>

                            {/* Onboarding is reopened by URL — it is a real route, so this is
                                a plain link and there is no "reset onboarding" endpoint to
                                invent. It does NOT clear anything: the wizard starts from the
                                values already on the account and only sends what you change. */}
                            <div className="border-t-2 border-[var(--border)] pt-3">
                                <Link
                                    to="/onboarding"
                                    className="inline-flex min-h-11 items-center gap-2 font-bold text-[var(--teal)] underline underline-offset-4"
                                >
                                    <Sparkles size={17} aria-hidden="true" />
                                    {t('onboarding.reopen')}
                                </Link>
                                <p className="t-micro muted mt-1">{t('onboarding.reopenHelp')}</p>
                            </div>
                        </Card>
                    </section>

                    {/* ============ 3. APPEARANCE ============================ */}
                    <section id="appearance" aria-labelledby="appearance-title">
                        <Card level="edge" padding="xl" className="flex flex-col gap-3">
                            <h2 id="appearance-title" className="t-h3 flex items-center gap-2">
                                <Palette size={18} aria-hidden="true" />
                                {t('settings.sectionAppearance')}
                            </h2>

                            <fieldset>
                                <legend className="t-label mb-2">{t('settings.theme')}</legend>
                                <div className="flex flex-wrap gap-1.5">
                                    {THEMES.map((theme) => (
                                        <button
                                            key={theme}
                                            type="button"
                                            aria-pressed={prefs.theme === theme}
                                            onClick={() => update({ theme })}
                                            className={cn(
                                                'min-h-11 rounded-[var(--r-control)] px-3.5 text-sm font-bold',
                                                prefs.theme === theme
                                                    ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                                    : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                                            )}
                                        >
                                            {t(`settings.themeOption.${theme}`)}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>

                            {/* Tells the truth about v2 rather than letting a v1 user
                                discover the missing themes by looking for them. */}
                            <div className="flex items-start gap-3 rounded-[var(--r-card)] bg-[var(--surface-alt)] p-3.5">
                                <Info size={16} className="mt-0.5 shrink-0 text-[var(--ink-muted)]" aria-hidden="true" />
                                <p className="t-micro">{t('settings.themeNote')}</p>
                            </div>
                        </Card>
                    </section>

                    {/* ============ 4. DATA ================================== */}
                    <section id="data" aria-labelledby="data-title">
                        <Card level="edge" padding="xl" className="flex flex-col gap-3">
                            <h2 id="data-title" className="t-h3 flex items-center gap-2">
                                <Database size={18} aria-hidden="true" />
                                {t('settings.sectionData')}
                            </h2>

                            <p className="t-micro muted">{t('settings.dataNote')}</p>

                            <div className="flex flex-wrap gap-2">
                                <Button variant="secondary" size="sm" disabled>
                                    <Download size={15} aria-hidden="true" />
                                    {t('settings.exportData')}
                                </Button>
                                <Button variant="ghost" size="sm" disabled>
                                    <Trash2 size={15} aria-hidden="true" />
                                    {t('settings.deleteChatHistory')}
                                </Button>
                            </div>
                            {/* No endpoint exists for either, so they are DISABLED with a
                                reason rather than shown as working buttons. */}
                            <p className="t-micro muted">{t('settings.dataUnavailable')}</p>

                            {/* Destructive action, separated and in the danger variant. */}
                            <div className="flex flex-wrap items-center gap-3 border-t-2 border-[var(--wrong)] pt-3.5">
                                <span aria-hidden="true" className="text-[var(--wrong)]">
                                    <AlertTriangle size={18} />
                                </span>
                                <p className="t-micro soft flex-1">{t('settings.deleteAccountHelp')}</p>
                                <Button variant="danger" size="sm" disabled>
                                    {t('settings.deleteAccount')}
                                </Button>
                            </div>
                            <p className="t-micro muted">{t('settings.deleteAccountUnavailable')}</p>
                        </Card>
                    </section>

                    <div className="flex flex-wrap gap-2">
                        <Link to="/profile" className="t-label text-[var(--teal)]">
                            {t('nav.account')}
                        </Link>
                        <Link to="/home" className="t-label text-[var(--teal)]">
                            {t('nav.home')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * One switch row.
 *
 * A real `<button role="switch">` rather than a styled checkbox: it carries
 * `aria-checked`, which is what a screen reader announces as on/off, and it is a single
 * tab stop. The visible control is decoration for that button, so it is `aria-hidden`.
 */
function SwitchRow({ label, help, checked, onChange, busy = false, compact = false, action = null }) {
    return (
        <div className={cn('flex items-start gap-3', compact ? 'py-1' : 'py-1.5')}>
            <span className="min-w-0 flex-1">
                <span className={cn('block', compact ? 't-body' : 't-label')}>{label}</span>
                {help ? <span className="t-micro muted mt-0.5 block">{help}</span> : null}
            </span>

            {action}

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                disabled={busy}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative mt-0.5 h-7 w-12 shrink-0 rounded-full border-2 transition-colors',
                    checked ? 'border-[var(--teal)] bg-[var(--teal)]' : 'border-[var(--border-strong)] bg-[var(--surface-alt)]',
                    busy && 'opacity-60'
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        'absolute top-[3px] size-4 rounded-full bg-[var(--surface)] transition-[left]',
                        checked ? 'left-[26px]' : 'left-[3px]'
                    )}
                />
            </button>
        </div>
    );
}
