/**
 * Merge v1's complete locale tree into v2's locale files.
 *
 * Why: the ported logic layer (src/api, src/hooks, src/utils, src/features)
 * references translation keys by string. v2's tree started as a 68-key seed for
 * the three anchor screens, so the ported layer immediately referenced 25 keys
 * that did not exist. Patching those 25 by hand would have to be repeated every
 * time another module is ported.
 *
 * Merge policy — v2 wins on conflict:
 *   base   = v1's tree (~1,800 keys across 29 namespaces)
 *   over   = v2's tree (the screens that have actually been designed)
 *   result = deep merge, with v2's value replacing v1's at any leaf it defines
 *
 * That way a v2 screen's copy is authoritative for the screens v2 has built,
 * and everything not yet redesigned still resolves to real Vietnamese instead
 * of rendering a raw key.
 *
 * Usage:  node scripts/merge-v1-locales.mjs [--check]
 *   --check  report what would change without writing
 */

import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const v2Locales = join(here, '..', 'src', 'i18n', 'locales');
const v2Seed = join(here, '..', 'src', 'i18n', 'seed');
const v1Locales = join(here, '..', '..', 'en-practice', 'src', 'i18n', 'locales');

const checkOnly = process.argv.includes('--check');

function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge(base, over) {
    const out = { ...base };
    for (const [k, v] of Object.entries(over)) {
        out[k] = isPlainObject(v) && isPlainObject(base[k]) ? deepMerge(base[k], v) : v;
    }
    return out;
}

function countLeaves(obj) {
    let n = 0;
    for (const v of Object.values(obj)) {
        if (isPlainObject(v)) n += countLeaves(v);
        else n += 1;
    }
    return n;
}

/**
 * Every leaf as a `dotted.path -> value` map.
 *
 * `countLeaves` answers "how many", which is what the progress line needs; this answers "WHICH
 * ones", which is what the data-loss guard needs. A count alone cannot tell a key that was never
 * written from one that was dropped.
 */
function collectLeaves(obj, prefix = '', out = new Map()) {
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (isPlainObject(v)) collectLeaves(v, key, out);
        else out.set(key, v);
    }
    return out;
}

async function load(path, label) {
    if (!existsSync(path)) {
        console.error(`missing ${label}: ${path}`);
        process.exit(1);
    }
    return (await import(pathToFileURL(path).href)).default;
}

/**
 * Serialise to the house style used by v1's locale files: 4-space indent,
 * unquoted identifier keys, single-quoted strings.
 *
 * The escaping is not cosmetic. A naive `JSON.stringify(...).replace(/"/g, "'")`
 * corrupts any value containing an apostrophe (`"don't"` becomes `'don't'`,
 * which is a syntax error) and any HTML attribute in a value (`<a href="x">`
 * becomes `<a href='x'>`, which is valid JS but changes the string). So the
 * value is escaped first and quotes are swapped only where it is safe.
 */
function quote(str) {
    const hasSingle = str.includes("'");
    const hasDouble = str.includes('"');
    if (!hasSingle) {
        // keep the file's single-quote house style
        return `'${str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')}'`;
    }
    if (!hasDouble) {
        // an apostrophe is present but no double quote: escape and stay single
        return `'${str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
    }
    // both present: JSON.stringify handles the escaping correctly
    return JSON.stringify(str);
}

function serialiseValue(value, indent) {
    const pad = ' '.repeat(indent);
    const padInner = ' '.repeat(indent + 4);

    if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        const items = value.map((v) => `${padInner}${serialiseValue(v, indent + 4)}`);
        return `[\n${items.join(',\n')}\n${pad}]`;
    }

    if (value !== null && typeof value === 'object') {
        const entries = Object.entries(value);
        if (entries.length === 0) return '{}';
        const items = entries.map(([k, v]) => {
            const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : quote(k);
            return `${padInner}${key}: ${serialiseValue(v, indent + 4)}`;
        });
        return `{\n${items.join(',\n')}\n${pad}}`;
    }

    if (typeof value === 'string') return quote(value);
    return String(value);
}

function serialise(obj) {
    return `export default ${serialiseValue(obj, 0)};\n`;
}

/** Set a dotted path on a nested object, creating intermediate objects. */
function setPath(obj, path, value) {
    const parts = path.split('.');
    let node = obj;
    for (const part of parts.slice(0, -1)) {
        if (!isPlainObject(node[part])) node[part] = {};
        node = node[part];
    }
    const leaf = parts.at(-1);
    // do not clobber a value that already exists — this patch fills gaps only
    if (node[leaf] === undefined) node[leaf] = value;
}

let changed = 0;
const dataLoss = [];
for (const lang of ['vi', 'en']) {
    const v1 = await load(join(v1Locales, `${lang}.js`), `v1 ${lang}`);
    /* Read v2's overrides from the SEED, never from the output file. Merging
       into a previously merged file is what makes a generator non-idempotent:
       the second run would treat v1's own strings as v2 overrides and the
       "v2 wins" rule would start pinning stale content in place. */
    const v2 = await load(join(v2Seed, `${lang}.js`), `v2 seed ${lang}`);

    let merged = deepMerge(v1, v2);

    /* Apply the recorded locale gaps last, so a patch never overrides real copy
       from either source. See src/i18n/seed/patches.mjs for why they exist. */
    const { expandPluralPatches } = await import(
        pathToFileURL(join(v2Seed, 'patches.mjs')).href
    );
    const patches = expandPluralPatches()[lang];
    for (const [key, value] of Object.entries(patches)) setPath(merged, key, value);

    /**
     * REFUSE TO DELETE KEYS THE SEED DOES NOT KNOW ABOUT.
     *
     * The merge is `v1 + seed + patches`, so a namespace that lives ONLY in the generated output —
     * never added to the seed when it was introduced — is silently destroyed by this script. That
     * is not hypothetical: running it deleted **276 keys across 13 namespaces** (landing 99,
     * weeklyReport 64, onboarding 50, profilePage 25, vocabularyReview 22, …) and left every string
     * in them rendering as a raw key, while the README described the step as the way to regenerate
     * the locales and claimed idempotency.
     *
     * The output files are the only place those strings exist, so the check reads them (this is the
     * one place where reading the output is correct) and refuses to write when the result would be
     * smaller. Completing the seed is the fix; until then this fails loudly instead of quietly.
     */
    const current = await load(join(v2Locales, `${lang}.js`), `current ${lang}`);
    const currentLeaves = collectLeaves(current);
    const mergedLeaves = collectLeaves(merged);
    const lost = [...currentLeaves.keys()].filter((key) => !mergedLeaves.has(key));
    if (lost.length) {
        const namespaces = [...new Set(lost.map((key) => key.split('.')[0]))].sort();
        dataLoss.push(
            `${lang}: ${lost.length} key(s) would be deleted, in namespace(s): ${namespaces.join(', ')}\n` +
                lost
                    .slice(0, 12)
                    .map((key) => `      - ${key}`)
                    .join('\n') +
                (lost.length > 12 ? `\n      … and ${lost.length - 12} more` : '')
        );
    }

    const before = countLeaves(v2);
    const after = countLeaves(merged);

    console.log(
        `${lang}: v1=${countLeaves(v1)} leaves, v2 seed=${before}, patches=${Object.keys(patches).length}, merged=${after} (+${after - before})`
    );

    if (!checkOnly && !lost.length) {
        writeFileSync(join(v2Locales, `${lang}.js`), serialise(merged), 'utf8');
        changed += 1;
    }
}

if (dataLoss.length) {
    console.error('\nREFUSING TO WRITE — the merge would delete keys that exist only in the output:');
    for (const report of dataLoss) console.error(`  ${report}`);
    console.error(
        '\n  These namespaces were never added to src/i18n/seed/, so `v1 + seed` cannot reproduce\n' +
            '  them. Add them to the seed (copy the values out of the generated file), then re-run.\n' +
            '  Nothing was written this run.'
    );
    process.exitCode = 1;
}

console.log(checkOnly ? '\n--check: nothing written.' : `\nwrote ${changed} locale file(s).`);
