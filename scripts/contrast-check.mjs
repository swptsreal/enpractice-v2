/**
 * WCAG 2.1 contrast gate for the v2 palette.
 *
 * Reads the ACTUAL token values out of src/styles/tokens.css — it does not keep
 * a second copy of the palette, because a second copy is exactly how v1 ended up
 * with two sources of truth (themeTokens.js:45-93 and index.css:34-89 declaring
 * the same tokens).
 *
 * Every colour pair the UI actually renders is measured here. Run via
 * `npm run verify:contrast`; it exits non-zero on any failure.
 *
 * Why this exists as a build gate: the first draft of this palette failed 5
 * pairs, including an input border that measured 1.56:1 — invisible. That is
 * not something a code review reliably catches.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const tokensPath = join(here, '..', 'src', 'styles', 'tokens.css');

/* ---------------------------------------------------------------- parsing */

/** Pull `--name: light-dark(light, dark);` out of the token file. */
function parseTokens(css) {
    const tokens = {};
    const re = /--([a-z0-9-]+)\s*:\s*light-dark\(\s*(#[0-9a-fA-F]{3,8})\s*,\s*(#[0-9a-fA-F]{3,8})\s*\)/g;
    let m;
    while ((m = re.exec(css)) !== null) {
        tokens[m[1]] = { light: m[2], dark: m[3] };
    }
    /* single-value tokens (no light/dark split), e.g. --on-amber */
    const single = /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
    while ((m = single.exec(css)) !== null) {
        tokens[m[1]] = { light: m[2], dark: m[2] };
    }
    return tokens;
}

/* -------------------------------------------------------------- contrast */

function srgbToLinear(c) {
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function ratio(a, b) {
    const la = luminance(a);
    const lb = luminance(b);
    const [hi, lo] = la > lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
}

/* ------------------------------------------------------------------ tests */

/**
 * `fg` and `bg` name tokens; `label` is what the pair is used for in the UI.
 * `need` is the WCAG threshold: 4.5 for text, 3.0 for a meaningful non-text
 * boundary or focus indicator (SC 1.4.11).
 */
const TESTS = [
    // --- primary action: the label must clear 4.5 on every filled state
    ['action label on primary', 'on-teal', 'teal', 4.5],
    ['action label on primary hover', 'on-teal', 'teal-strong', 4.5],
    // --- the reward affordance carries DARK ink; white on amber is 1.72:1
    ['dark ink on amber', 'on-amber', 'amber', 4.5],
    // --- body and heading ink over every ground it actually sits on
    ['ink on canvas', 'ink', 'canvas', 4.5],
    ['ink on surface', 'ink', 'surface', 4.5],
    ['ink on surface-alt', 'ink', 'surface-alt', 4.5],
    ['ink-soft on canvas', 'ink-soft', 'canvas', 4.5],
    ['ink-soft on surface', 'ink-soft', 'surface', 4.5],
    ['ink-soft on surface-alt', 'ink-soft', 'surface-alt', 4.5],
    // --- metadata tier: 4.5 is the floor for a real sentence
    ['ink-muted on canvas', 'ink-muted', 'canvas', 4.5],
    ['ink-muted on surface', 'ink-muted', 'surface', 4.5],
    ['ink-muted on surface-alt', 'ink-muted', 'surface-alt', 4.5],
    // --- accent as text (links, active nav)
    ['teal text on canvas', 'teal', 'canvas', 4.5],
    ['teal text on surface', 'teal', 'surface', 4.5],
    ['teal text on teal-soft', 'teal', 'teal-soft', 4.5],
    ['attention text on amber-soft', 'attention', 'amber-soft', 4.5],
    // --- status semantics are text too
    ['correct on surface', 'correct', 'surface', 4.5],
    ['correct on correct-soft', 'correct', 'correct-soft', 4.5],
    ['wrong on surface', 'wrong', 'surface', 4.5],
    ['wrong on wrong-soft', 'wrong', 'wrong-soft', 4.5],
    ['attention on surface', 'attention', 'surface', 4.5],
    ['info on surface', 'info', 'surface', 4.5],
    ['info on info-soft', 'info', 'info-soft', 4.5],
    // --- control-identifying borders and focus rings: 3:1 (SC 1.4.11)
    ['border-strong on canvas', 'border-strong', 'canvas', 3.0],
    ['border-strong on surface', 'border-strong', 'surface', 3.0],
    ['teal focus ring on canvas', 'teal', 'canvas', 3.0],
    ['teal focus ring on surface', 'teal', 'surface', 3.0],
];

/**
 * Tokens that must never carry an enabled sentence. Reported rather than
 * asserted, so a future change that accidentally promotes one to a text tier is
 * visible in the output.
 */
const DECORATION_ONLY = [
    ['ink-faint on canvas', 'ink-faint', 'canvas'],
    ['ink-faint on surface', 'ink-faint', 'surface'],
    ['border on canvas', 'border', 'canvas'],
];

/* ------------------------------------------------------------------- main */

function main() {
    const tokens = parseTokens(readFileSync(tokensPath, 'utf8'));
    const failures = [];

    const missing = [...new Set(TESTS.flatMap(([, fg, bg]) => [fg, bg]))].filter((n) => !tokens[n]);
    if (missing.length) {
        console.error(`token(s) not found in tokens.css: ${missing.join(', ')}`);
        return 1;
    }

    console.log('='.repeat(74));
    console.log('EN PRACTICE v2 — WCAG 2.1 CONTRAST GATE');
    console.log('='.repeat(74));

    for (const mode of ['light', 'dark']) {
        console.log(`\n--- ${mode.toUpperCase()} ---`);
        console.log(`${'pair'.padEnd(36)}${'ratio'.padStart(8)}${'need'.padStart(7)}  verdict`);
        console.log('-'.repeat(74));
        for (const [label, fg, bg, need] of TESTS) {
            const r = ratio(tokens[fg][mode], tokens[bg][mode]);
            const ok = r >= need;
            if (!ok) failures.push(`${mode}: ${label} = ${r.toFixed(2)} < ${need}`);
            console.log(`${label.padEnd(36)}${r.toFixed(2).padStart(8)}${need.toFixed(1).padStart(7)}  ${ok ? 'PASS' : '*** FAIL'}`);
        }
        console.log('\n  decoration-only (must never carry a sentence):');
        for (const [label, fg, bg] of DECORATION_ONLY) {
            const r = ratio(tokens[fg][mode], tokens[bg][mode]);
            console.log(`    ${label.padEnd(32)}${r.toFixed(2).padStart(8)}  ${r < 4.5 ? 'ok as decoration' : 'HIGH — move to the text tier'}`);
        }
    }

    console.log(`\n${'='.repeat(74)}`);
    if (failures.length) {
        console.log(`FAILURES (${failures.length}):`);
        for (const f of failures) console.log('  -', f);
        return 1;
    }
    console.log('ALL REQUIRED PAIRS PASS.');
    return 0;
}

process.exit(main());
