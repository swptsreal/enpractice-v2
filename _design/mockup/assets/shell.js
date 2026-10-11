/* =============================================================================
   Shared app shell for the mockups.

   Two navigation affordances, no more (v1 had three):
     >=1024px  a 264px sidebar rail, all destinations flat
     <1024px   a bottom tab bar with 5 thumb-reachable destinations

   Icons are authored SVG from a single 24x24 grid at a uniform 2px stroke, so
   the whole product reads as one hand. v1 mixed @ant-design/icons with
   lucide-react and emoji in the same shell.
   ========================================================================== */

import { lexi } from './lexi.js';

/* ------------------------------------------------------------- icon set */
const P = {
    home:      '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-5.5h5V20"/>',
    book:      '<path d="M4 4.5h5.5A3.5 3.5 0 0 1 13 8v12a3 3 0 0 0-3-3H4z"/><path d="M20 4.5h-5.5A3.5 3.5 0 0 0 11 8v12a3 3 0 0 1 3-3h6z"/>',
    target:    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/>',
    mic:       '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v3.5"/>',
    pen:       '<path d="M4 20l3.5-.8L20 6.7a2 2 0 0 0-2.8-2.8L4.8 16.5z"/><path d="M15.5 5.5 18.5 8.5"/>',
    chart:     '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    trophy:    '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5v1.5A3.5 3.5 0 0 0 8 11"/><path d="M17 6h2.5v1.5A3.5 3.5 0 0 1 16 11"/><path d="M12 14v4"/><path d="M8.5 21h7"/>',
    gift:      '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13.5h18"/><path d="M12 9v12"/><path d="M12 9S9.5 3.5 7 5.2 9 9 12 9s4.5-2.2 5-3.8C16.5 3.5 12 9 12 9z"/>',
    user:      '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
    chat:      '<path d="M20 15a3 3 0 0 1-3 3H8l-4 3V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z"/><path d="M8.5 10h7"/><path d="M8.5 13.5h4"/>',
    bell:      '<path d="M6.5 17V11a5.5 5.5 0 0 1 11 0v6"/><path d="M4.5 17h15"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    settings:  '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.6M12 18.6v2.6M4.5 7.5l2.2 1.3M17.3 15.2l2.2 1.3M4.5 16.5l2.2-1.3M17.3 8.8l2.2-1.3"/>',
    coin:      '<circle cx="12" cy="12" r="8.5"/><path d="M14 9.2c-.5-.9-1.4-1.4-2.6-1.4-1.7 0-2.7 1-2.7 2 0 1.2 1.3 1.6 2.7 1.9 1.6.3 2.9.7 2.9 2 0 1.1-1.1 2-2.9 2-1.3 0-2.3-.6-2.8-1.5"/><path d="M12 6.4v11.2"/>',
    check:     '<path d="M4.5 12.5 9.5 18 19.5 6.5"/>',
    cross:     '<path d="M6 6l12 12M18 6 6 18"/>',
    lock:      '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    flame:     '<path d="M12 3c3 4 6 5.5 6 9.5A6 6 0 0 1 6 12.5C6 8.5 9 7 12 3z"/><path d="M12 20a3 3 0 0 1-3-3c0-1.6 1.2-2.6 3-4.5 1.8 1.9 3 2.9 3 4.5a3 3 0 0 1-3 3z"/>',
    play:      '<path d="M7 4.5 19 12 7 19.5z"/>',
    headphones:'<path d="M4.5 15v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="3" y="14" width="4" height="6" rx="2"/><rect x="17" y="14" width="4" height="6" rx="2"/>',
    arrowRight:'<path d="M4.5 12h15"/><path d="M13.5 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19.5 12h-15"/><path d="M10.5 6l-6 6 6 6"/>',
    clock:     '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    sparkle:   '<path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.2 10.2 12.6 4.5 10.8 10.2 9z"/><path d="M18.5 3.5v3M20 5h-3"/>',
    search:    '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    filter:    '<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>',
    plus:      '<path d="M12 5v14M5 12h14"/>',
    star:      '<path d="m12 3.5 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z"/>',
    shield:    '<path d="M12 3l7.5 3v6c0 4.5-3 7.5-7.5 9-4.5-1.5-7.5-4.5-7.5-9V6z"/><path d="M9 12l2 2 4-4"/>',
    users:     '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6"/><path d="M17.5 14.2A6.5 6.5 0 0 1 21.5 20"/>',
    pause:     '<rect x="7" y="5" width="3.5" height="14" rx="1.5"/><rect x="13.5" y="5" width="3.5" height="14" rx="1.5"/>',
};

export function icon(name, size = 20, cls = '') {
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">${P[name] || ''}</svg>`;
}

/* ------------------------------------------------------------ nav model */
const PRIMARY = [
    { id: 'home',    label: 'Trang chủ',  icon: 'home',    href: '04-home.html' },
    { id: 'learn',   label: 'Học',         icon: 'book',    href: '07-vocabulary-check.html' },
    { id: 'practice',label: 'Luyện tập',   icon: 'target',  href: '16-ielts-list.html' },
    { id: 'progress',label: 'Tiến độ',     icon: 'chart',   href: '29-weekly-report.html' },
    { id: 'profile', label: 'Cá nhân',     icon: 'user',    href: '33-profile.html' },
];

const SECONDARY = [
    { label: 'Lộ trình học',      icon: 'target', href: '06-path.html' },
    { label: 'Sổ tay từ vựng',    icon: 'book',   href: '12-dictionary.html' },
    { label: 'Luyện Writing',     icon: 'pen',    href: '21-writing-list.html' },
    { label: 'Luyện Speaking',    icon: 'mic',    href: '24-speaking-list.html' },
    { label: 'Hội thoại tự chọn', icon: 'chat',   href: '27-custom-speaking.html' },
    { label: 'AI Coach',          icon: 'sparkle',href: '36-ai-chat.html' },
    { label: 'Bảng xếp hạng',     icon: 'trophy', href: '28-leaderboard.html' },
    { label: 'Phần thưởng',       icon: 'gift',   href: '31-rewards.html' },
    { label: 'Ví credit',         icon: 'coin',   href: '32-credits.html' },
    { label: 'Thông báo',         icon: 'bell',   href: '34-notifications.html' },
    { label: 'Cài đặt',           icon: 'settings', href: '35-settings.html' },
];

/* --------------------------------------------------------------- shell */
export function shell({
    active = 'home',
    title = '',
    subtitle = '',
    back = null,
    headerRight = '',
    body = '',
    bottomBar = '',
    showStreak = true,
    showLexiFab = true,
    container = 'wide',
} = {}) {
    const navHtml = PRIMARY.map(
        (n) => `<a class="nav__item" href="${n.href}" ${n.id === active ? 'aria-current="page"' : ''}>
            ${icon(n.icon, 20)}<span>${n.label}</span></a>`
    ).join('');

    const secHtml = SECONDARY.map(
        (n) => `<a class="nav__item" href="${n.href}">${icon(n.icon, 18)}<span>${n.label}</span></a>`
    ).join('');

    const tabs = PRIMARY.map(
        (n) => `<a class="tabbar__item" href="${n.href}" ${n.id === active ? 'aria-current="page"' : ''}>
            ${icon(n.icon, 22)}<span>${n.label}</span></a>`
    ).join('');

    return `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html">
            ${lexi({ mood: 'idle', size: 'xs', label: '' })}
            <span class="grow">
                <span class="t-h3" style="display:block">EN Practice</span>
                <span class="t-micro muted">Mỗi ngày một bước</span>
            </span>
        </a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">${navHtml}</div>
            <div class="nav__group">Khác</div>
            <div class="nav">${secHtml}</div>
        </nav>
        <div class="shell__foot">
            <div class="row g8" style="padding:0 4px">
                <span class="chip chip--amber">${icon('flame', 14)} 12 ngày</span>
                <span class="chip chip--teal">${icon('coin', 14)} 240</span>
            </div>
        </div>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            ${back ? `<a class="btn btn--ghost btn--icon btn--sm" href="${back}" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>` : ''}
            <div class="grow" style="min-width:0">
                ${title ? `<h1 class="t-h1 truncate">${title}</h1>` : ''}
                ${subtitle ? `<p class="t-micro muted truncate">${subtitle}</p>` : ''}
            </div>
            ${headerRight}
        </header>
        <main class="shell__content shell__content--${container}">${body}</main>
        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">${tabs}</nav>
    </div>

    ${showLexiFab ? `<a class="lexi-fab" href="36-ai-chat.html" aria-label="Hỏi Lexi">
        ${lexi({ mood: 'idle', size: 'sm' })}
    </a>` : ''}
</div>
${bottomBar}`;
}

/* ------------------------------------------------------ shared partials */
export function stat(value, label, tone = '', iconName = null) {
    return `<div class="stat ${tone ? `stat--${tone}` : ''}">
        ${iconName ? `<span class="stat__row">${icon(iconName, 16)}<span class="t-micro">${label}</span></span>`
                   : `<span class="stat__label">${label}</span>`}
        <span class="stat__value">${value}</span>
    </div>`;
}

export function bar(value, tone = '') {
    return `<div class="bar" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100">
        <div class="bar__fill ${tone ? `bar__fill--${tone}` : ''}" style="width:${value}%"></div>
    </div>`;
}

export function emptyState({ title, body, action, mood = 'explain' }) {
    return `<div class="card card--flat pad-x" style="text-align:center">
        <div style="display:flex;justify-content:center">${lexi({ mood, size: 'md' })}</div>
        <h3 class="t-h3" style="margin-top:12px">${title}</h3>
        <p class="t-body muted" style="margin-top:4px">${body}</p>
        ${action ? `<div style="margin-top:16px;display:flex;justify-content:center">${action}</div>` : ''}
    </div>`;
}

/* Async surfaces must never be a bare spinner (v1 defaults to one). */
export function skeletonCard(lines = 3) {
    return `<div class="card pad">
        <div class="sk" style="width:38%;height:18px"></div>
        ${Array.from({ length: lines }, (_, i) =>
            `<div class="sk" style="width:${90 - i * 12}%;height:12px;margin-top:10px"></div>`
        ).join('')}
    </div>`;
}

export const SHELL_CSS = `
.shell { display: flex; min-height: 100vh; background: var(--canvas); }

/* ---- sidebar rail: 264px, flat destinations, no nesting ---- */
.shell__rail {
    position: fixed; inset: 0 auto 0 0; width: var(--shell-sidebar);
    display: flex; flex-direction: column;
    background: var(--surface); border-right: 2px solid var(--border);
}
.shell__brand { display: flex; align-items: center; gap: 10px; padding: 16px; border-bottom: 2px solid var(--border); color: inherit; }
.shell__nav { flex: 1; overflow-y: auto; padding: 12px; }
.shell__foot { padding: 12px; border-top: 2px solid var(--border); }

.shell__main { flex: 1; min-width: 0; margin-left: var(--shell-sidebar); display: flex; flex-direction: column; }

.shell__header {
    position: sticky; top: 0; z-index: 15;
    display: flex; align-items: center; gap: 12px;
    min-height: var(--shell-header); padding: 10px 20px;
    background: var(--surface); border-bottom: 2px solid var(--border);
}
.shell__content { flex: 1; width: 100%; padding: 20px; }
.shell__content--wide  { max-width: 1240px; margin-inline: auto; }
.shell__content--focus { max-width: 820px;  margin-inline: auto; }
.shell__content--full  { max-width: none; padding: 0; }

@media (max-width: 1023px) {
    .shell__rail { display: none; }
    .shell__main { margin-left: 0; padding-bottom: calc(var(--shell-tabbar) + env(safe-area-inset-bottom, 0px)); }
    .shell__header { padding: 8px 14px; min-height: 60px; }
    .shell__content { padding: 14px; }
    .shell__content--full { padding: 0; }
}

.lexi-fab {
    position: fixed; right: 18px; bottom: calc(var(--shell-tabbar) + 18px); z-index: 30;
    width: 60px; height: 60px; display: grid; place-items: center;
    border-radius: var(--r-chip); background: var(--surface);
    border: 2px solid var(--border-strong);
    box-shadow: 0 4px 0 0 var(--border), 0 12px 24px -10px rgb(20 35 43 / .35);
}
@media (min-width: 1024px) { .lexi-fab { bottom: 18px; } }

/* pill segmented control used by sub-module switching */
.pills { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
.pills::-webkit-scrollbar { display: none; }
.pill {
    flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px;
    min-height: 38px; padding: 0 14px; border-radius: var(--r-chip);
    border: 2px solid var(--border); background: var(--surface);
    color: var(--ink-soft); font-size: .875rem; font-weight: 700; white-space: nowrap;
}
.pill[aria-current='page'], .pill[aria-pressed='true'] { background: var(--teal); border-color: var(--teal); color: var(--on-teal); }

.sk { background: var(--surface-alt); border-radius: var(--r-sm); }
@media (prefers-reduced-motion: no-preference) {
    .sk { animation: sk 1.4s ease-in-out infinite; }
}
@keyframes sk { 0%,100% { opacity: 1 } 50% { opacity: .55 } }

.hero-wash {
    background:
        radial-gradient(120% 90% at 12% 0%, color-mix(in srgb, var(--teal) 12%, transparent), transparent 60%),
        radial-gradient(90% 80% at 88% 8%, color-mix(in srgb, var(--amber) 14%, transparent), transparent 62%),
        var(--canvas);
}
`;
