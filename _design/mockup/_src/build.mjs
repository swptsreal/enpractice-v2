/* Builds standalone, self-contained HTML mockups from the screen definitions.

   Run:  node _design/mockup/_src/build.mjs

   The screens are authored as data (one place per screen) and compiled here,
   so a design change is a token change plus a rebuild — not 44 hand-edits.
   The mockups are mobile-first by construction: every layout is written for a
   390px column and widens, so reviewing one at phone width is reviewing it
   honestly rather than reviewing a shrunken desktop layout.
*/
import { writeFileSync, readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { screens as a } from './screens-a.mjs';
import { screens as b } from './screens-b.mjs';
import { screens as c } from './screens-c.mjs';
import { screens as d } from './screens-d.mjs';

const here = dirname(fileURLToPath(import.meta.url));

/* Build the shared shell stylesheet from its single source before rendering, so
   every screen links a real file rather than duplicating 90 lines of CSS. */
const { SHELL_CSS } = await import('../assets/shell.js');
mkdirSync(join(here, '..', 'assets'), { recursive: true });
writeFileSync(join(here, '..', 'assets', 'shell.css'), SHELL_CSS, 'utf8');

/* Copy the real Lexi illustrations next to the screens so the mockups work
   offline and straight off disk. They are the authored set, not generated art. */
const { LEXI_FILES } = await import('../assets/lexi.js');
const artOut = join(here, '..', 'assets');
let copied = 0;
for (const { file } of Object.values(LEXI_FILES)) {
    const from = join(here, '..', '..', 'assets', file);
    copyFileSync(from, join(artOut, file));
    copied += 1;
}

const out = join(here, '..');

const ALL = { ...a, ...b, ...c, ...d };
const FONT =
    'https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap';

/* Lexi is inlined as a static <img> at build time rather than fetched by a
   script. Two reasons, both real: a page opened straight off disk (file://)
   cannot load ES modules at all, and inlining means the mascot is present in
   the first paint with no script execution and no layout shift. */
const { lexi } = await import('../assets/lexi.js');

function inlineLexi(html) {
    // Lexi is placed with <span>/<div> carrying data-lexi plus optional
    // data-size / data-label, and any class or style the caller already put on
    // the wrapper. Both tags are handled because a wrapper that participates in
    // a flex/grid layout needs to keep its own box.
    return html.replace(
        /<(span|div)\b([^>]*?)data-lexi="([^"]*)"([^>]*?)>\s*<\/\1>/g,
        (match, tag, pre, mood, post) => {
            const attrs = pre + post;
            const size = (attrs.match(/data-size="([^"]*)"/) || [, 'md'])[1];
            const labelMatch = attrs.match(/data-label="([^"]*)"/);
            const label = labelMatch ? labelMatch[1] : null;
            const classMatch = attrs.match(/class="([^"]*)"/);
            const styleMatch = attrs.match(/style="([^"]*)"/);
            const keep = [
                classMatch ? ` class="${classMatch[1]}"` : '',
                styleMatch ? ` style="${styleMatch[1]}"` : '',
            ].join('');
            return `<${tag}${keep}>${lexi({ mood, size, label })}</${tag}>`;
        }
    );
}

function render(id, s) {
    return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${s.title} · EN Practice v2</title>
<link rel="stylesheet" href="assets/tokens.css" />
<link rel="stylesheet" href="assets/shell.css" />
<link rel="stylesheet" href="${FONT}" />
<style>${s.style || ''}</style>
</head>
<body>
<a class="sr-only" href="#main">Bỏ qua tới nội dung</a>
${inlineLexi(s.body)}
<div id="live" class="sr-only" role="status" aria-atomic="true"></div>
<script>
/* A mockup that cannot be pressed cannot be judged, so the interactions that
   carry the design — tab switching, answer selection, switch toggles, revealing
   a verdict — are live. Tab panels are keyed off data-panel, which is also what
   the aria-controls wiring documents, so the mockup and the accessibility tree
   cannot disagree. Plain <script>, no module, so file:// works. */
(function () {
    var live = document.getElementById('live');
    function announce(text) { if (live) live.textContent = text; }

    document.addEventListener('click', function (e) {
        var tab = e.target.closest('[data-tab]');
        if (tab) {
            var group = tab.closest('[data-tabs]');
            group.querySelectorAll('[data-tab]').forEach(function (t) {
                t.setAttribute('aria-selected', String(t === tab));
            });
            var scope = group.dataset.tabs;
            document.querySelectorAll('[data-panel^="' + scope + '-"]').forEach(function (p) {
                p.hidden = p.dataset.panel !== tab.dataset.tab;
            });
            return;
        }
        var sel = e.target.closest('[data-select]');
        if (sel) {
            var box = sel.closest('[data-group]');
            if (box) box.querySelectorAll('[data-select]').forEach(function (s) {
                s.setAttribute('aria-pressed', String(s === sel));
            });
            announce(sel.dataset.announce || 'Đã chọn');
            return;
        }
        var tog = e.target.closest('[data-toggle]');
        if (tog) {
            var on = (tog.getAttribute('aria-checked') || tog.getAttribute('aria-pressed')) === 'true';
            tog.setAttribute('aria-checked', String(!on));
            tog.setAttribute('aria-pressed', String(!on));
            return;
        }
        var reveal = e.target.closest('[data-reveal]');
        if (reveal) {
            var el = document.getElementById(reveal.dataset.reveal);
            if (el) {
                el.hidden = false;
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                announce(reveal.dataset.announce || '');
            }
        }
    });
})();
</script>
</body>
</html>`;
}

mkdirSync(out, { recursive: true });
let n = 0;
let unconverted = 0;
for (const [id, s] of Object.entries(ALL)) {
    const html = render(id, s);
    const leftovers = (html.match(/data-lexi="/g) || []).length;
    if (leftovers) {
        unconverted += leftovers;
        console.error(`  ! ${s.file}: ${leftovers} Lexi placeholder(s) not inlined`);
    }
    writeFileSync(join(out, s.file), html, 'utf8');
    n += 1;
}
if (unconverted) {
    throw new Error(`${unconverted} Lexi placeholder(s) survived the build; the pattern in inlineLexi is incomplete`);
}

/* The registry is inlined into index.html from the same data that renders the
   screens, so the explorer cannot drift from what was built, and it still works
   when the folder is opened straight off disk. */
const registry = Object.values(ALL).map((s) => ({
    f: s.file.replace('.html', ''),
    t: s.title,
    g: s.group,
    n: s.note,
}));
writeFileSync(join(out, 'assets', 'registry.json'), JSON.stringify(registry, null, 2), 'utf8');

const indexPath = join(out, 'index.html');
const indexSrc = readFileSync(indexPath, 'utf8');
/* Replace whatever registry block is currently there, but KEEP the marker line
   so the next build is idempotent. Writing the marker back is what makes this
   repeatable rather than a one-shot transform. */
const block = /\/\* REGISTRY-START \*\/[\s\S]*?\/\* REGISTRY-END \*\//;
if (!block.test(indexSrc)) {
    throw new Error('index.html is missing the REGISTRY-START/END block; refusing to write a stale explorer');
}
writeFileSync(
    indexPath,
    indexSrc.replace(
        block,
        `/* REGISTRY-START */\nconst SCREENS = ${JSON.stringify(registry, null, 4)};\n/* REGISTRY-END */`
    ),
    'utf8'
);

console.log(`built ${n} screens -> ${out}`);
