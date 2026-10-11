import { cn } from '../../lib/cn';

/**
 * Surfaces, with the elevation scale expressed as four discrete levels rather
 * than "pick a shadow".
 *
 *   flat        an inset block inside a card — no border, no shadow
 *   1 (default) resting card: 2px border + the 4px press edge. No soft shadow.
 *   2 raised    genuinely floating above another surface (popover, sheet)
 *   3 overlay   modal, with a scrim
 *
 * Level 1 is the default on purpose: v1 had 31 files mixing shadow-sm/md/lg
 * with 8 arbitrary shadow-[...] values and no scale at all, so elevation
 * communicated nothing.
 */

const LEVELS = {
    flat: 'bg-[var(--surface-alt)] border-transparent shadow-none rounded-[var(--r-card)]',
    edge:
        'bg-[var(--surface)] border-[var(--border)] ' +
        'shadow-[0_var(--edge)_0_0_var(--border)] rounded-[var(--r-card)]',
    raised:
        'bg-[var(--surface)] border-[var(--border-strong)] rounded-[var(--r-card)] ' +
        'shadow-[0_6px_0_-2px_var(--border),0_16px_32px_-18px_rgb(20_35_43/0.38)]',
};

const PADDING = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
    xl: 'p-6 md:p-8',
};

export function Card({
    as: Tag = 'div',
    level = 'edge',
    padding = 'lg',
    radius = 'card',
    interactive = false,
    className,
    children,
    ...rest
}) {
    return (
        <Tag
            className={cn(
                'border-2',
                LEVELS[level] ?? LEVELS.edge,
                PADDING[padding] ?? PADDING.lg,
                radius === 'hero' && 'rounded-[var(--r-hero)]',
                radius === 'control' && 'rounded-[var(--r-control)]',
                interactive &&
                    'cursor-pointer transition-[transform,box-shadow,background-color] duration-[90ms] ' +
                        'ease-[var(--ease-out)] hover:bg-[var(--surface-alt)] ' +
                        'active:translate-y-[var(--edge)] active:shadow-none',
                className
            )}
            {...rest}
        >
            {children}
        </Tag>
    );
}

/**
 * An inset row inside a card. Deliberately NOT a card: no border, no press
 * edge, no shadow. Nesting cards manufactures false depth, and it was one of
 * the patterns v1 repeated most (card inside card inside card on the results,
 * progress and profile screens). check_nested_cards.py holds this in place.
 */
export function RowBox({ as: Tag = 'div', center = false, wrap = false, className, children, ...rest }) {
    return (
        <Tag
            className={cn(
                'flex gap-3 rounded-[var(--r-control)] bg-[var(--surface-alt)] p-3',
                center ? 'items-center' : 'items-start',
                wrap && 'flex-wrap',
                className
            )}
            {...rest}
        >
            {children}
        </Tag>
    );
}
