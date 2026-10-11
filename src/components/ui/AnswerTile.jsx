import { cn } from '../../lib/cn';
import { Check, X } from 'lucide-react';

/**
 * AnswerTile — the core interaction of the product.
 *
 * A wrong answer is red AND carries a cross glyph AND a text label. A correct
 * answer is green AND a check AND a label. Colour is never the only signal
 * (WCAG 2.1 SC 1.4.1), which is also what makes the verdict readable to the
 * ~8% of males with red-green colour vision deficiency.
 *
 * Minimum height 64px and a 32px key badge, so the whole tile is a comfortable
 * thumb target rather than just the text inside it.
 */

const STATES = {
    idle:
        'bg-[var(--surface)] border-[var(--border-strong)] text-[var(--ink)] ' +
        'shadow-[0_var(--edge)_0_0_var(--border-strong)]',
    selected:
        'bg-[var(--teal-soft)] border-[var(--teal)] text-[var(--ink)] ' +
        'shadow-[0_var(--edge)_0_0_var(--teal-strong)]',
    correct:
        'bg-[var(--correct-soft)] border-[var(--correct)] text-[var(--ink)] ' +
        'shadow-[0_var(--edge)_0_0_var(--correct)]',
    wrong:
        'bg-[var(--wrong-soft)] border-[var(--wrong)] text-[var(--ink)] ' +
        'shadow-[0_var(--edge)_0_0_var(--wrong)]',
    dim: 'bg-[var(--surface-alt)] border-[var(--border)] opacity-60 shadow-none',
};

const KEY_STATES = {
    idle: 'border-[var(--border-strong)] text-[var(--ink-muted)]',
    selected: 'border-[var(--teal)] text-[var(--teal)]',
    correct: 'border-[var(--correct)] bg-[var(--correct)] text-white',
    wrong: 'border-[var(--wrong)] bg-[var(--wrong)] text-white',
    dim: 'border-[var(--border)] text-[var(--ink-faint)]',
};

export function AnswerTile({
    state = 'idle',
    keyLabel,
    className,
    children,
    disabled,
    ...rest
}) {
    const resolved = disabled && state === 'idle' ? 'dim' : state;
    return (
        <button
            type="button"
            aria-pressed={state === 'selected' ? 'true' : undefined}
            disabled={disabled}
            className={cn(
                'flex w-full min-h-16 items-center gap-3.5 rounded-[var(--r-control)] border-2',
                'px-4 py-3 text-left text-base font-semibold',
                'cursor-pointer transition-[transform,box-shadow,background-color,border-color]',
                'duration-[90ms] ease-[var(--ease-out)]',
                'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]',
                'active:translate-y-[var(--edge)] active:shadow-none',
                'disabled:cursor-not-allowed',
                STATES[resolved] ?? STATES.idle,
                className
            )}
            {...rest}
        >
            {(keyLabel || resolved === 'correct' || resolved === 'wrong') && (
                <span
                    aria-hidden="true"
                    className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-[var(--r-sm)] border-2',
                        'font-mono text-sm font-bold',
                        KEY_STATES[resolved] ?? KEY_STATES.idle
                    )}
                >
                    {resolved === 'correct' ? (
                        <Check size={16} strokeWidth={3} />
                    ) : resolved === 'wrong' ? (
                        <X size={16} strokeWidth={3} />
                    ) : (
                        keyLabel
                    )}
                </span>
            )}
            <span className="min-w-0 flex-1">{children}</span>
        </button>
    );
}

/**
 * Verdict — the answer feedback bar. Carries colour, glyph and explanation
 * together, and is the single place answer feedback is announced from.
 */
export function Verdict({ state = 'correct', title, children, lexi = null, className }) {
    const correct = state === 'correct';
    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-[var(--r-card)] border-2 p-3.5',
                correct
                    ? 'border-[var(--correct)] bg-[var(--correct-soft)] shadow-[0_var(--edge)_0_0_var(--correct)]'
                    : 'border-[var(--wrong)] bg-[var(--wrong-soft)] shadow-[0_var(--edge)_0_0_var(--wrong)]',
                className
            )}
        >
            <span aria-hidden="true" className={correct ? 'text-[var(--correct)]' : 'text-[var(--wrong)]'}>
                {correct ? <Check size={22} strokeWidth={3} /> : <X size={22} strokeWidth={3} />}
            </span>
            <div className="min-w-0 flex-1">
                <strong className="t-label block">{title ?? (correct ? 'Chính xác' : 'Chưa đúng')}</strong>
                {children ? <p className="t-micro soft">{children}</p> : null}
            </div>
            {lexi}
        </div>
    );
}
