/**
 * The Lexi asset library.
 *
 * Kept in its own module (rather than next to the component) so the component
 * file exports only a component — that is what `react-refresh/only-export-components`
 * wants, and it is a real constraint: a violation breaks fast refresh for the
 * file, which slows down every subsequent edit to the mascot.
 *
 * Sizes are the intrinsic pixel dimensions of the actual files, so every <img>
 * can set width/height and there is no layout shift. Aspect ratios range from
 * 0.74 to 1.01, which is why the component renders into a fixed square box and
 * centres the image rather than stretching it.
 */
export const LEXI_MOODS = {
    idle: { file: 'lexi-yes', w: 299, h: 317 },
    happy: { file: 'lexi-yeah', w: 332, h: 346 },
    sad: { file: 'lexi-cry', w: 256, h: 345 },
    thinking: { file: 'lexi-study-2', w: 285, h: 334 },
    celebrate: { file: 'lexi-laugh', w: 285, h: 351 },
    explain: { file: 'lexi-study-1', w: 277, h: 334 },
    sleepy: { file: 'lexi-sleep', w: 276, h: 309 },
    excited: { file: 'lexi-love', w: 309, h: 322 },
    approve: { file: 'lexi-like', w: 284, h: 351 },
    coffee: { file: 'lexi-cup', w: 322, h: 320 },
};

export const LEXI_SIZES = {
    xs: { box: 'size-10', w: 40 },
    sm: { box: 'size-14', w: 56 },
    md: { box: 'size-[88px]', w: 88 },
    lg: { box: 'w-[120px] h-[120px]', w: 120 },
    xl: { box: 'w-[200px] h-[200px]', w: 200 },
};
