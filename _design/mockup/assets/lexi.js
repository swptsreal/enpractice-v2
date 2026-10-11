/* =============================================================================
   Lexi — the real illustrated asset library, and the mood map onto it.

   There are ten authored Lexi illustrations in `_design/assets/`. They are a
   finished, consistent set (same character, same navy graduation cap with a gold
   tassel, same cream facial disc), so v2 needs no illustration work: it needs a
   mapping from product state to asset, and motion wrapped around the image.

   The images are single rendered pictures, so — unlike an authored SVG — there
   are no named groups to animate. Motion is therefore applied to the whole
   image via transforms and opacity only, which is exactly what `tokens.css`
   already defines. Mood changes cross-fade rather than swapping instantly,
   because an instant swap is the tell that these are separate pictures.
   ========================================================================== */

/* mood -> source file and intrinsic size, measured from the actual assets so
   width/height can be set on the <img> and there is no layout shift. Aspect
   ratios vary from 0.74 to 1.01 across the set, which is why the wrapper fixes
   a square box and the image is centred inside it rather than stretched. */
export const LEXI_FILES = {
    idle:      { file: 'lexi-yes.webp',     w: 299, h: 317 },
    happy:     { file: 'lexi-yeah.webp',    w: 332, h: 346 },
    sad:       { file: 'lexi-cry.webp',     w: 256, h: 345 },
    thinking:  { file: 'lexi-study-2.webp', w: 285, h: 334 },
    celebrate: { file: 'lexi-laugh.webp',   w: 285, h: 351 },
    explain:   { file: 'lexi-study-1.webp', w: 277, h: 334 },
    sleepy:    { file: 'lexi-sleep.webp',   w: 276, h: 309 },
    excited:   { file: 'lexi-love.webp',    w: 309, h: 322 },
    approve:   { file: 'lexi-like.webp',    w: 284, h: 351 },
    coffee:    { file: 'lexi-cup.webp',     w: 322, h: 320 },
};

/* The mood a screen should show when it has not asked for anything specific. */
export const LEXI_FALLBACK = 'idle';

const SIZES = {
    xs: 40, sm: 56, md: 88, lg: 120, xl: 200,
};

/**
 * Render one Lexi illustration.
 *
 * `label` is opt-in: with no label she is decorative and gets aria-hidden, so a
 * screen reader is not told about a picture that carries no information. Every
 * place she carries meaning passes a label.
 */
export function lexi({ mood = 'idle', size = 'md', label = null, className = '' } = {}) {
    const entry = LEXI_FILES[mood] || LEXI_FILES[LEXI_FALLBACK];
    const px = SIZES[size] || SIZES.md;
    const height = Math.round((px * entry.h) / entry.w);
    const a11y = label
        ? `role="img" aria-label="${label}"`
        : 'aria-hidden="true"';
    return `<img class="lexi lexi--${size} ${className}" data-mood="${mood}"
        src="assets/${entry.file}" width="${px}" height="${height}"
        loading="lazy" decoding="async" ${a11y} />`;
}

/* A preview row, used by the design-system page. */
export function lexiRow(moods, size = 'md') {
    return moods
        .map((m) => `<figure class="lexi-cell">
            ${lexi({ mood: m, size, label: `Lexi, ${m}` })}
            <figcaption class="t-micro muted">${m}</figcaption>
        </figure>`)
        .join('');
}
