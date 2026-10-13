/**
 * i18n audit: catches the two failure modes v1 actually shipped.
 *
 *   1. A key present in `vi` but missing in `en` (or vice versa) — the parallel
 *      translation silently falls back, so a Vietnamese sentence appears in the
 *      English UI.
 *   2. An inline `defaultValue:` fallback in JSX. v1 has 68 of them, which is
 *      direct evidence of a surface that was never fully translated: the string
 *      renders, so nobody notices it is missing from both locale files.
 *
 * Vietnamese is the default and the index language, so `vi` is the reference
 * tree and `en` is measured against it.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, '..', 'src');

/* ------------------------------------------------------- locale trees */

const vi = (await import(pathToFileURL(join(srcDir, 'i18n', 'locales', 'vi.js')).href)).default;
const en = (await import(pathToFileURL(join(srcDir, 'i18n', 'locales', 'en.js')).href)).default;

function flatten(obj, prefix = '', out = new Map()) {
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
        else out.set(key, v);
    }
    return out;
}

const viKeys = flatten(vi);
const enKeys = flatten(en);

/* -------------------------------------------------------- source scan */

/**
 * Legitimate `defaultValue` sites, pinned by file AND line.
 *
 * The blanket rule ("any inline defaultValue is an untranslated surface") is
 * right about v1's 68 JSX fallbacks and wrong about these two, which live in a
 * pure utility rather than a component:
 *
 *   utils/vocabularyTest.js:87  t(`vocabularyTest.sources.options.${source}`,
 *                                  { defaultValue: source })
 *     A DYNAMIC key over an enum. A fallback to the raw enum value is the correct
 *     behaviour when the API adds a source the locale files do not know yet.
 *
 *   utils/vocabularyTest.js:253 t('vocabularyTest.error.generic',
 *                                  { defaultValue: 'Something went wrong…' })
 *     A utility returning a user-facing message, reached from non-component code
 *     where `t` is a parameter and may legitimately be partial.
 *
 * Pinning the line means the exception cannot silently migrate: if the file
 * shifts, this list stops matching and the audit fails again.
 */
const ALLOWED_DEFAULT_VALUES = new Set([
    'utils/vocabularyTest.js:87',
    'utils/vocabularyTest.js:253',
]);

function walk(dir, files = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, files);
        else if (/\.(jsx?|mjs)$/.test(entry)) files.push(full);
    }
    return files;
}

/**
 * Comments are stripped before scanning, because this scan reads raw text.
 *
 * Without it, PROSE that happens to mention the call pattern counts as a real key: a comment
 * explaining the `t('...')` shape made the audit report a key named `...` and fail the gate,
 * pointing at a file nobody had touched. Two authors hit that in one afternoon, which is the
 * argument for fixing the scanner rather than the wording.
 *
 * The `[^:]` guard keeps `https://...` inside a string literal from being read as a comment.
 *
 * A BLOCK COMMENT IS REPLACED BY SPACES, NEWLINES INCLUDED, not by a single space. Collapsing
 * it removed the newlines inside `/* … *\/` and shifted every reported line number after it —
 * the interpolation check named `ReviewConfigPage.jsx:79`, which is a `<Button`, for a call
 * that is eighty lines further down. Blanking the characters instead keeps byte offsets and
 * line numbers identical to the file on disk, which is the only thing a reader can act on.
 */
function stripComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

const files = walk(srcDir);

/* Keys referenced from source: t('a.b') and <Trans i18nKey="a.b"> */
const usedKeys = new Set();
const inlineDefaults = [];
for (const file of files) {
    const src = stripComments(readFileSync(file, 'utf8'));
    for (const m of src.matchAll(/\bt\(\s*['"`]([a-zA-Z0-9_.]+)['"`]/g)) usedKeys.add(m[1]);
    for (const m of src.matchAll(/i18nKey=["']([a-zA-Z0-9_.]+)["']/g)) usedKeys.add(m[1]);
    const rel = relative(srcDir, file).split('\\').join('/');
    src.split('\n').forEach((line, i) => {
        if (!/defaultValue\s*:/.test(line)) return;
        const loc = `${rel}:${i + 1}`;
        if (!ALLOWED_DEFAULT_VALUES.has(loc)) inlineDefaults.push(loc);
    });
}

/* ------------------------------------------------- interpolation check */

/**
 * A key can exist, be in parity, and STILL print a raw placeholder to the learner.
 *
 * This is the third failure mode, and it shipped: `/path` rendered
 * `{{nodes}} bài · 1 bài kiểm tra cuối unit` because the locale string interpolates
 * `{{nodes}}` while the call site passed `{ count: nodes.length }`. i18next
 * substitutes only the variables present in the options object, and `count` is not
 * one of them — it selects a plural form, and neither key has `_one`/`_other`
 * variants, which is why text appeared at all rather than a raw `namespace.key`.
 *
 * Nothing caught it: this audit checked key presence only; the e2e raw-key guard
 * matches `namespace.key` text, never `{{…}}`; and the page's own test asserted a
 * substring that still matched with the placeholder unresolved. It shipped in the
 * bundle twice (`index-*.js` and `en-*.js`).
 *
 * So: for every literal `t('key', { …options… })` call, every `{{var}}` in that key's
 * vi AND en value must appear in the options. Calls whose second argument is not an
 * object literal (a spread variable, a helper-built options bag) are skipped rather
 * than guessed at — a false failure here would be worse than no gate.
 */
const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

function placeholdersIn(value) {
    if (typeof value !== 'string') return [];
    return [...value.matchAll(PLACEHOLDER)].map((m) => m[1]);
}

/**
 * Names an options object provides — including SHORTHAND.
 *
 * `t('review.stepN', { step })` is the same call as `{ step: step }`, and the first version of
 * this check only understood the second, so it reported two perfectly correct call sites in
 * `ReviewConfigPage.jsx` as failures. A gate that cries wolf gets switched off, so shorthand is
 * handled explicitly rather than left as an allowlist entry.
 */
function optionsNames(body) {
    const names = new Set();
    for (const part of body.split(',')) {
        const trimmed = part.trim();
        if (!trimmed || trimmed.startsWith('...')) continue; // a spread is not a name we can know
        const named = trimmed.match(/^([A-Za-z_$][\w$]*)\s*:/);
        if (named) {
            names.add(named[1]);
            continue;
        }
        const shorthand = trimmed.match(/^([A-Za-z_$][\w$]*)$/);
        if (shorthand) names.add(shorthand[1]);
    }
    return names;
}

const interpolationProblems = [];
const CALL_WITH_OPTIONS = /\bt\(\s*['"`]([a-zA-Z0-9_.]+)['"`]\s*,\s*\{([^{}]*)\}/g;

for (const file of files) {
    const src = stripComments(readFileSync(file, 'utf8'));
    const rel = relative(srcDir, file).split('\\').join('/');
    const lineOf = (index) => src.slice(0, index).split('\n').length;

    for (const m of src.matchAll(CALL_WITH_OPTIONS)) {
        const [, key, body] = m;
        const provided = optionsNames(body);
        for (const [lang, tree] of [['vi', viKeys], ['en', enKeys]]) {
            for (const variable of placeholdersIn(tree.get(key))) {
                if (provided.has(variable)) continue;
                interpolationProblems.push(
                    `${rel}:${lineOf(m.index)}  t('${key}') missing { ${variable} }  (${lang} value)`
                );
            }
        }
    }
}

/* --------------------------------------------------------------- report */

const missingInEn = [...viKeys.keys()].filter((k) => !enKeys.has(k));
const missingInVi = [...enKeys.keys()].filter((k) => !viKeys.has(k));
const usedButMissing = [...usedKeys].filter((k) => !viKeys.has(k));

console.log('='.repeat(70));
console.log('EN PRACTICE v2 — i18n AUDIT');
console.log('='.repeat(70));
console.log(`vi keys: ${viKeys.size}   en keys: ${enKeys.size}   referenced from source: ${usedKeys.size}`);

let failed = false;

if (missingInEn.length) {
    failed = true;
    console.log(`\nFAIL — ${missingInEn.length} key(s) missing in en.js:`);
    for (const k of missingInEn.slice(0, 25)) console.log('  -', k);
    if (missingInEn.length > 25) console.log(`  … and ${missingInEn.length - 25} more`);
} else {
    console.log('PASS — en.js covers every vi key');
}

if (missingInVi.length) {
    failed = true;
    console.log(`\nFAIL — ${missingInVi.length} key(s) missing in vi.js (vi is the reference tree):`);
    for (const k of missingInVi.slice(0, 25)) console.log('  -', k);
} else {
    console.log('PASS — vi.js covers every en key');
}

if (usedButMissing.length) {
    failed = true;
    console.log(`\nFAIL — ${usedButMissing.length} key(s) used in source but absent from vi.js:`);
    for (const k of usedButMissing.slice(0, 25)) console.log('  -', k);
} else {
    console.log('PASS — every t() key referenced in source exists');
}

if (inlineDefaults.length) {
    failed = true;
    console.log(`\nFAIL — ${inlineDefaults.length} inline defaultValue fallback(s).`);
    console.log('  A defaultValue means a surface that was never translated: it renders,');
    console.log('  so nobody notices the key is missing from both locale files.');
    for (const loc of inlineDefaults.slice(0, 25)) console.log('  -', loc);
} else {
    console.log('PASS — no inline defaultValue fallbacks');
}

if (interpolationProblems.length) {
    failed = true;
    console.log(`\nFAIL — ${interpolationProblems.length} interpolation mismatch(es):`);
    console.log('  The value interpolates a variable the call site does not pass, so the');
    console.log('  learner sees the literal {{placeholder}} on screen.');
    for (const problem of interpolationProblems.slice(0, 25)) console.log('  -', problem);
} else {
    console.log('PASS — every interpolated variable is passed at its call site');
}

/* Unused keys are reported, never failed: a key can legitimately exist before
   the screen that consumes it. */
const unused = [...viKeys.keys()].filter((k) => {
    if (k.startsWith('common.')) return false;
    return ![...usedKeys].some((u) => u === k || u.startsWith(`${k}.`));
});
if (unused.length) {
    console.log(`\nnote — ${unused.length} key(s) defined but not referenced yet (not a failure):`);
    for (const k of unused.slice(0, 12)) console.log('  ·', k);
}

console.log(`\n${'='.repeat(70)}`);
console.log(failed ? 'i18n AUDIT FAILED' : 'i18n AUDIT PASSED');
process.exit(failed ? 1 : 0);
