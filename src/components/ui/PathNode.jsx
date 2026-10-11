import { Check, Lock, Play, Trophy } from 'lucide-react';
import { cn } from '../../lib/cn';
import { NODE_STATES } from '../../features/learning/useLearningPath';

/**
 * A node on the learning path — the round button the whole screen is built from.
 *
 * STATE IS NEVER COLOUR ALONE. Each state carries its own icon (check / play / lock / trophy)
 * and its own accessible name, so the four states survive greyscale, forced colours and a
 * screen reader. Colour is the fastest signal, not the only one.
 *
 * `current` is the only perpetual animation in the product (1.6s ring), and it stops under
 * `prefers-reduced-motion` — that is enforced globally in `styles/index.css`, which collapses
 * every animation to a single 1ms iteration, so this component does not have to remember.
 *
 * A `locked` node is a real `disabled` button rather than a styled div: a div cannot be
 * reached by keyboard, so a locked node would silently vanish from the tab order and a screen
 * reader user would never learn that there is a next step, only that there is a label.
 */
const BASE =
    'relative grid size-20 shrink-0 place-items-center rounded-full border-2 ' +
    'transition-[transform,background-color,border-color,color] duration-[90ms] ease-[var(--ease-out)] ' +
    'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)] ' +
    'motion-reduce:transition-none';

const STATE_CLASSES = {
    [NODE_STATES.DONE]: 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal)]',
    [NODE_STATES.CURRENT]:
        'border-[var(--teal)] bg-[var(--teal)] text-[var(--on-teal)] ' +
        'shadow-[0_var(--edge)_0_0_var(--teal-strong)] active:translate-y-[var(--edge)] active:shadow-none',
    [NODE_STATES.LOCKED]:
        /* `ink-muted`, NOT `ink-faint`: the lock is the visual half of the locked state, and
           `ink-faint` on `surface-alt` measures 2.30:1 — below the 3:1 a non-text indicator
           needs. The contrast gate only lists `ink-faint` as decoration (on canvas and
           surface), which is exactly why this pair had to be measured by hand. `ink-muted`
           on `surface-alt` is a gate-covered pair at 4.51:1. */
        'border-[var(--border)] bg-[var(--surface-alt)] text-[var(--ink-muted)] cursor-not-allowed',
    [NODE_STATES.MILESTONE]:
        'size-24 border-[var(--amber)] bg-[var(--amber-soft)] text-[var(--attention)] ' +
        'shadow-[0_var(--edge)_0_0_var(--amber-edge)]',
};

const STATE_ICONS = {
    [NODE_STATES.DONE]: Check,
    [NODE_STATES.CURRENT]: Play,
    [NODE_STATES.LOCKED]: Lock,
    [NODE_STATES.MILESTONE]: Trophy,
};

export function PathNode({ state = NODE_STATES.LOCKED, label, disabled = false, onClick }) {
    const Icon = STATE_ICONS[state] ?? Play;
    const isMilestone = state === NODE_STATES.MILESTONE;

    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className={cn(BASE, STATE_CLASSES[state] ?? STATE_CLASSES[NODE_STATES.LOCKED])}
        >
            {/* The pulse is decoration and is hidden from assistive tech: the state is already
                in the accessible name. */}
            {state === NODE_STATES.CURRENT ? (
                <span aria-hidden="true" className="path-pulse absolute inset-0 rounded-full" />
            ) : null}
            <Icon size={isMilestone ? 34 : 28} aria-hidden="true" className="relative" />
        </button>
    );
}

export default PathNode;
