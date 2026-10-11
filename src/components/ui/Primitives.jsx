import { cn } from '../../lib/cn';
import { Flame, Star, Coins, Clock } from 'lucide-react';

/* ------------------------------------------------------------------- Chip */

const CHIP_TONES = {
    neutral: 'bg-[var(--surface-alt)] text-[var(--ink-soft)]',
    teal: 'bg-[var(--teal-soft)] text-[var(--teal)]',
    amber: 'bg-[var(--amber-soft)] text-[var(--attention)]',
    correct: 'bg-[var(--correct-soft)] text-[var(--correct)]',
    wrong: 'bg-[var(--wrong-soft)] text-[var(--wrong)]',
    info: 'bg-[var(--info-soft)] text-[var(--info)]',
    outline: 'bg-transparent border-2 border-[var(--border-strong)] text-[var(--ink-soft)]',
};

export function Chip({ tone = 'neutral', icon: Icon = null, className, children, ...rest }) {
    const Tag = rest.onClick || rest.href ? (rest.href ? 'a' : 'button') : 'span';
    return (
        <Tag
            className={cn(
                'inline-flex h-[30px] items-center gap-1.5 rounded-[var(--r-chip)] px-3',
                'text-[0.8125rem] font-bold tracking-[0.01em] whitespace-nowrap',
                CHIP_TONES[tone] ?? CHIP_TONES.neutral,
                (rest.onClick || rest.href) && 'cursor-pointer hover:brightness-[0.97]',
                className
            )}
            {...(Tag === 'button' ? { type: 'button' } : {})}
            {...rest}
        >
            {Icon ? <Icon size={14} aria-hidden="true" /> : null}
            {children}
        </Tag>
    );
}

/* ------------------------------------------------------------------ Badge */

export function Badge({ tone = 'wrong', className, children, ...rest }) {
    const tones = {
        wrong: 'bg-[var(--wrong)] text-white',
        teal: 'bg-[var(--teal)] text-[var(--on-teal)]',
        amber: 'bg-[var(--amber)] text-[var(--on-amber)]',
    };
    return (
        <span
            className={cn(
                'inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-[var(--r-chip)]',
                'px-[7px] text-[0.6875rem] font-extrabold tabular-nums',
                tones[tone] ?? tones.wrong,
                className
            )}
            {...rest}
        >
            {children}
        </span>
    );
}

/* ------------------------------------------------------------------- Band */

/**
 * Band scores render in mono with tabular figures so digits do not jitter the
 * layout as they count up, and the label is always a number out of 9.
 */
export function Band({ value, className }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-[var(--r-sm)] px-3 py-1.5',
                'bg-[var(--teal-soft)] font-mono text-[0.9375rem] font-bold tabular-nums text-[var(--teal)]',
                className
            )}
        >
            {value}
        </span>
    );
}

/* ------------------------------------------------------------ ProgressBar */

export function ProgressBar({ value, tone = 'teal', thin = false, label, className }) {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    return (
        <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
            className={cn(
                'overflow-hidden rounded-[var(--r-chip)] bg-[var(--surface-alt)]',
                thin ? 'h-2' : 'h-4',
                className
            )}
        >
            <div
                className={cn(
                    'h-full rounded-[var(--r-chip)] transition-[width] duration-[var(--m-base)] ease-[var(--ease-out)]',
                    tone === 'amber' ? 'bg-[var(--amber)]' : 'bg-[var(--teal)]'
                )}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

/* ------------------------------------------------------------------- Stat */

const STAT_ICONS = { flame: Flame, star: Star, coin: Coins, clock: Clock };

export function Stat({ value, label, tone = '', icon, className }) {
    const Icon = typeof icon === 'string' ? STAT_ICONS[icon] : icon;
    const valueTone =
        tone === 'amber'
            ? 'text-[var(--attention)]'
            : tone === 'teal'
              ? 'text-[var(--teal)]'
              : 'text-[var(--ink)]';
    return (
        <div
            className={cn(
                'flex flex-col gap-1 rounded-[var(--r-card)] border-2 border-[var(--border)]',
                'bg-[var(--surface)] p-3.5 shadow-[0_var(--edge)_0_0_var(--border)]',
                className
            )}
        >
            {Icon ? (
                <span className="flex items-center gap-2 text-[var(--ink-muted)]">
                    <Icon size={16} aria-hidden="true" />
                    <span className="t-micro">{label}</span>
                </span>
            ) : (
                <span className="t-micro text-[var(--ink-muted)]">{label}</span>
            )}
            <span className={cn('font-mono text-2xl font-bold leading-tight tabular-nums', valueTone)}>
                {value}
            </span>
        </div>
    );
}

/* ------------------------------------------------------------------ Field */

/**
 * Label ABOVE the input, helper below, error below that. Never
 * placeholder-as-label: a placeholder disappears exactly when the user needs it.
 */
export function Field({ label, help, error, id, required, children, className }) {
    const helpId = help ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={id} className="t-label">
                {label}
                {required ? <span className="sr-only"> (bắt buộc)</span> : null}
            </label>
            {typeof children === 'function'
                ? children({ id, 'aria-describedby': errorId ?? helpId, 'aria-invalid': error ? 'true' : undefined })
                : children}
            {error ? (
                <span id={errorId} role="alert" className="t-micro font-semibold text-[var(--wrong)]">
                    {error}
                </span>
            ) : help ? (
                <span id={helpId} className="t-micro text-[var(--ink-muted)]">
                    {help}
                </span>
            ) : null}
        </div>
    );
}

export const inputClass =
    'w-full min-h-12 rounded-[var(--r-control)] border-2 border-[var(--border-strong)] ' +
    'bg-[var(--surface)] px-3.5 py-2.5 text-[var(--ink)] placeholder:text-[var(--ink-faint)] ' +
    'focus:outline-3 focus:outline-offset-2 focus:outline-[var(--teal)] focus:border-[var(--teal)]';

/* ------------------------------------------------------------ EmptyState */

export function EmptyState({ title, body, action, lexi = null, className }) {
    return (
        <div
            className={cn(
                'flex flex-col items-center rounded-[var(--r-card)] bg-[var(--surface-alt)] p-6 text-center',
                className
            )}
        >
            {lexi}
            <h3 className="t-h3 mt-3">{title}</h3>
            {body ? <p className="t-body muted mt-1 max-w-[42ch]">{body}</p> : null}
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}

/* -------------------------------------------------------------- Skeleton */

/**
 * Loading states are skeleton blocks in the final layout's shape, never a bare
 * spinner — a spinner tells the user nothing about what is arriving. The
 * shimmer is disabled under reduced motion via the global rule.
 */
export function Skeleton({ className, width }) {
    return (
        <span
            aria-hidden="true"
            className={cn('block rounded-[var(--r-sm)] bg-[var(--surface-alt)]', className)}
            style={width ? { width } : undefined}
        />
    );
}

export function SkeletonCard({ lines = 3, className }) {
    return (
        <div className={cn('rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)] p-4', className)}>
            <Skeleton className="h-[18px]" width="38%" />
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton key={i} className="mt-2.5 h-3" width={`${90 - i * 12}%`} />
            ))}
        </div>
    );
}
