import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

/**
 * The press affordance, in one place.
 *
 * Every pressable surface in the product carries a solid 4px bottom edge that
 * collapses on :active. Three rules make it safe, and they exist because the
 * naive version of this pattern is inaccessible:
 *
 *   1. Contrast-Carry Rule — the edge is NEVER the only thing separating the
 *      control from the background. Every pressable surface also carries a real
 *      2px border or a fill that clears 3:1 on its own (WCAG 2.1 SC 1.4.11), so
 *      if the edge is removed (reduced motion, forced colours, print) the
 *      control is still visible. Duolingo's own #58CC02 with a white label
 *      measures 2.09:1; that is the exact failure this prevents.
 *   2. Transform-Not-Layout Rule — the press is a `transform`. Changing
 *      border-width or padding reflows the label and makes text jump on click.
 *   3. Reduced-Motion Rule — the translate drops out but the edge colour change
 *      stays, because that change is feedback, not decoration.
 */

const BASE =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap select-none ' +
    'font-extrabold tracking-[0.01em] cursor-pointer ' +
    'border-2 transition-[transform,box-shadow,filter,background-color,color,border-color] ' +
    'duration-[90ms] ease-[var(--ease-out)] ' +
    'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)] ' +
    'disabled:cursor-not-allowed motion-reduce:active:translate-y-0';

const SIZES = {
    sm: 'min-h-10 px-3.5 text-sm rounded-[var(--r-sm)]',
    md: 'min-h-12 px-5 text-[0.9375rem] rounded-[var(--r-control)]',
    lg: 'min-h-14 px-7 text-base rounded-[var(--r-control)]',
};

/* Each variant states its own edge colour, so the edge is derived rather than
   invented at the call site. */
const VARIANTS = {
    primary:
        'bg-[var(--teal)] text-[var(--on-teal)] border-[var(--teal)] ' +
        'shadow-[0_var(--edge)_0_0_var(--teal-strong)] ' +
        'active:translate-y-[var(--edge)] active:shadow-none ' +
        'hover:brightness-[1.06]',
    /* the reward affordance — carries DARK ink, never white (white on amber is
       1.72:1) */
    reward:
        'bg-[var(--amber)] text-[var(--on-amber)] border-[var(--amber)] ' +
        'shadow-[0_var(--edge)_0_0_var(--amber-edge)] ' +
        'active:translate-y-[var(--edge)] active:shadow-none ' +
        'hover:brightness-[1.04]',
    secondary:
        'bg-[var(--surface)] text-[var(--ink)] border-[var(--border-strong)] ' +
        'shadow-[0_var(--edge)_0_0_var(--border-strong)] ' +
        'active:translate-y-[var(--edge)] active:shadow-none ' +
        'hover:bg-[var(--surface-alt)]',
    danger:
        'bg-[var(--wrong)] text-white border-[var(--wrong)] ' +
        'shadow-[0_var(--edge)_0_0_color-mix(in_srgb,var(--wrong)_70%,black)] ' +
        'active:translate-y-[var(--edge)] active:shadow-none ' +
        'hover:brightness-[1.05]',
    /* Quiet actions keep the border as their identity instead of an edge, so a
       screen of ghost buttons does not read as a wall of 3D slabs. */
    ghost:
        'bg-transparent text-[var(--teal)] border-[var(--border-strong)] ' +
        'hover:bg-[var(--teal-soft)] ' +
        'active:translate-y-[1px]',
};

export const Button = forwardRef(function Button(
    {
        variant = 'primary',
        size = 'md',
        block = false,
        iconOnly = false,
        className,
        type = 'button',
        children,
        ...rest
    },
    ref
) {
    return (
        <button
            ref={ref}
            type={type}
            className={cn(
                BASE,
                SIZES[size],
                VARIANTS[variant],
                block && 'w-full',
                iconOnly && 'px-0 min-w-12',
                className
            )}
            {...rest}
        >
            {children}
        </button>
    );
});

/**
 * A link that presses like a button.
 *
 * Navigation in this product is often a primary action ("Bắt đầu", "Làm bài"),
 * and a link that does not press next to a button that does is the kind of
 * inconsistency that makes a UI feel assembled rather than designed.
 *
 * It renders a react-router `Link`, not a bare `<a>`: a bare anchor ignores the
 * `to` prop, which silently produces `href="null"` and breaks navigation while
 * looking perfectly correct in review. `Link` also keeps client-side routing,
 * middle-click and "open in new tab" working.
 *
 * Use `ButtonLink` for in-app routes; use a plain `<a>` (Button with as="a")
 * for genuinely external URLs.
 */
export const ButtonLink = forwardRef(function ButtonLink(
    { to, variant = 'primary', size = 'md', block = false, iconOnly = false, className, children, ...rest },
    ref
) {
    return (
        <Link
            ref={ref}
            to={to}
            className={cn(
                BASE,
                SIZES[size],
                VARIANTS[variant],
                block && 'w-full',
                iconOnly && 'px-0 min-w-12',
                className
            )}
            {...rest}
        >
            {children}
        </Link>
    );
});
