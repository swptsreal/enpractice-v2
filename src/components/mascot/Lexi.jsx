import { cn } from '../../lib/cn';
import { LEXI_MOODS, LEXI_SIZES } from './lexiMoods';

/**
 * Lexi — the authored illustration set, mapped onto product states.
 *
 * v1 animated ONE png (src/assets/lexi.png) with
 * `filter: brightness()/saturate()/hue-rotate()` per mood, which is why she
 * reads as a sticker being wobbled rather than a character reacting.
 *
 * v2 uses the ten finished illustrations in /public/lexi/. They are single
 * rendered images, so — unlike an authored SVG — there are no named parts to
 * animate. Motion is therefore applied to the whole picture (transform only),
 * and one keyframe rule per mood lives in src/styles/lexi.css.
 *
 * A mood change should be an opacity cross-fade rather than an instant swap,
 * because an instant swap is the tell that these are separate pictures. That is
 * the caller's job today (AnimatePresence or a CSS transition on the wrapper);
 * this component renders one mood.
 */
export function Lexi({
    mood = 'idle',
    size = 'md',
    /**
     * Pass a label only when Lexi carries information. With no label she is
     * decorative and gets aria-hidden, so a screen reader is not told about a
     * picture that says nothing — the correct default for a mascot.
     */
    label = null,
    eager = false,
    className,
}) {
    const entry = LEXI_MOODS[mood] ?? LEXI_MOODS.idle;
    const token = LEXI_SIZES[size] ?? LEXI_SIZES.md;
    const height = Math.round((token.w * entry.h) / entry.w);

    return (
        <img
            src={`/lexi/${entry.file}.webp`}
            alt={label ?? ''}
            aria-hidden={label ? undefined : 'true'}
            data-mood={mood}
            width={token.w}
            height={height}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            className={cn(
                token.box,
                'shrink-0 origin-bottom object-contain object-bottom select-none',
                `lexi lexi--${mood}`,
                className
            )}
        />
    );
}
