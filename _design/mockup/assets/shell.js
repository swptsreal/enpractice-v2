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
    menu:      '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    play:      '<path d="M7 4.5 19 12 7 19.5z"/>',
    headphones:'<path d="M4.5 15v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="3" y="14" width="4" height="6" rx="2"/><rect x="17" y="14" width="4" height="6" rx="2"/>',
    arrowRight:'<path d="M4.5 12h15"/><path d="M13.5 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19.5 12h-15"/><path d="M10.5 6l-6 6 6 6"/>',
    arrowUp:   '<path d="M12 19.5v-15"/><path d="M6 10.5l6-6 6 6"/>',
    arrowDown: '<path d="M12 4.5v15"/><path d="M6 13.5l6 6 6-6"/>',
    /* Retry, in two weights: `refresh` for a partial round (only the words that were missed) and
       `rotate` for a full restart. The result screen offers both, so the labels cannot lean on
       colour to tell them apart. */
    refresh:   '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.5 4v5h-5"/>',
    rotate:    '<path d="M3.5 12a8.5 8.5 0 1 0 8.5-8.5"/><path d="M12 1.5 8.5 5 12 8.5"/>',
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

/**
 * The five primary destinations. Each one is a SECTION, and its href is that section's LANDING
 * page — not merely "a page in the section".
 *
 * `Học` used to point at `07-vocabulary-check.html`, and every vocabulary frame marks it
 * `aria-current="page"` (07–12 all belong to the section), so the href was a copy-paste artefact:
 * the landing was wrong while the current-state was right. It also made `Học` and the group's own
 * "Tra từ & hỏi AI" item the SAME destination, so the practice screens (08–11) — the actual work of
 * the section — sat one level deeper than the tab that claims to lead into it. The app had copied
 * the artefact, which is why the sidebar's `Học` opened a dictionary lookup.
 *
 * THE LABEL IS THE SECTION, NOT THE FIRST SCREEN. The section is the vocabulary module — it is
 * where you test words (08) and where you review them (15) — so the tab reads "Từ vựng" and its
 * landing is the test list. Calling it "Học" named neither the section nor a destination, and it
 * read as if the whole product were "học".
 */
const PRIMARY = [
    { id: 'home',    label: 'Trang chủ',  icon: 'home',    href: '04-home.html' },
    { id: 'ai-chat', label: 'AI Coach',   icon: 'sparkle', href: '36-ai-chat.html' },
    { id: 'practice',label: 'Luyện tập',   icon: 'target',  href: '16-ielts-list.html' },
    { id: 'progress',label: 'Tiến độ',     icon: 'chart',   href: '29-weekly-report.html' },
    { id: 'profile', label: 'Cá nhân',     icon: 'user',    href: '33-profile.html' },
];

const MOBILE_TABS = [
    { id: 'home',    label: 'Trang chủ',  icon: 'home',    href: '04-home.html' },
    { id: 'ai-chat', label: 'AI Coach',   icon: 'sparkle', href: '36-ai-chat.html' },
    { id: 'practice',label: 'Luyện tập',   icon: 'target',  href: '16-ielts-list.html' },
    { id: 'progress',label: 'Tiến độ',     icon: 'chart',   href: '29-weekly-report.html' },
    { id: 'more',    label: 'Thêm',       icon: 'menu',    href: '33b-account-menu.html' },
];

const SECONDARY = [
    { label: 'Lộ trình học',      icon: 'target', href: '06-path.html' },
    { label: 'Sổ tay từ vựng',    icon: 'book',   href: '12-dictionary.html' },
    /* The two vocabulary destinations that belong to the SAME section as the tab above: the lookup
       (07) and the review (15). Both are listed here so the section is reachable as a set — the tab
       can only open one of them, and leaving the review off the rail left a designed screen with no
       way in. Frame 07's own rail already carried both inside its "Từ vựng" group. */
    { label: 'Tra từ & hỏi AI',   icon: 'search', href: '07-vocabulary-check.html' },
    { label: 'Ôn tập từ vựng',    icon: 'clock',  href: '15-review.html' },
    { label: 'Luyện Writing',     icon: 'pen',    href: '21-writing-list.html' },
    { label: 'Luyện Speaking',    icon: 'mic',    href: '24-speaking-list.html' },
    { label: 'Hội thoại tự chọn', icon: 'chat',   href: '27-custom-speaking.html' },
    { label: 'Từ vựng',           icon: 'book',   href: '08-vocabulary-list.html' },
    { label: 'Bảng xếp hạng',     icon: 'trophy', href: '28-leaderboard.html' },
    { label: 'Phần thưởng',       icon: 'gift',   href: '31-rewards.html' },
    { label: 'Ví credit',         icon: 'coin',   href: '32-credits.html' },
    { label: 'Thông báo',         icon: 'bell',   href: '34-notifications.html' },
    { label: 'Cài đặt',           icon: 'settings', href: '35-settings.html' },
];

/* ------------------------------------------------------- account (top right) */

/**
 * The header's right-hand block: notification bell, membership tier, avatar.
 *
 * WHY IT EXISTS. `headerRight` was a `shell()` parameter that NO screen ever passed, so every
 * mockup rendered an empty right-hand side — and the app filled that gap with an avatar showing a
 * letter and nothing else. The profile in the top-right was therefore never designed: no account
 * menu, no real avatar, and no membership, even though `/auth/me` already returns `avatarUrl`,
 * `avatarFrameUrl`, `membershipTier`, `membershipActive` and `membershipExpiresAt`.
 *
 * WHY A DISCLOSURE AND NOT `role="menu"`. The APG's menu pattern requires arrow-key navigation
 * between items and roving focus. This panel is a short list of LINKS, so the disclosure-navigation
 * pattern is the honest fit: a button with `aria-expanded`/`aria-controls` and a plain list of
 * links. Claiming `role="menu"` without implementing its keyboard contract would promise a screen
 * reader behaviour that is not there — the same class of lie as printing a band nobody measured.
 *
 * The membership tier is hidden below 1024px and lives inside the panel instead: the phone header
 * already carries Lexi, the title, the bell and the avatar, and a fifth element squeezes the title
 * into an ellipsis.
 */
export function accountHeader({ unread = 3, initial = 'M', tier = 'Premium', credits = 240, open = false } = {}) {
    return `
<div class="acct">
    <a class="chip chip--teal only-mobile" href="32-credits.html" aria-label="Ví credit" style="text-decoration:none">${icon('coin', 14)} ${credits}</a>
    <button class="acct__icon" type="button" aria-label="Thông báo">${icon('bell', 18)}${
        unread > 0 ? `<span class="acct__dot">${unread}</span>` : ''
    }</button>
    <span class="chip chip--teal only-lg">${tier}</span>
    <button class="acct__avatar" type="button" aria-haspopup="true" aria-expanded="${open ? 'true' : 'false'}"
            aria-controls="account-panel" aria-label="Menu tài khoản">${initial}</button>
    ${open ? accountMenu({ tier, initial }) : ''}
</div>`;
}

/** The open panel. Kept separate so the variant frame can render the menu without duplicating it. */
export function accountMenu({ tier = 'Premium', initial = 'M' } = {}) {
    const items = [
        ['33-profile.html', 'Hồ sơ', 'user'],
        ['35-settings.html', 'Cài đặt', 'settings'],
        ['34-notifications.html', 'Thông báo', 'bell'],
    ];
    return `
<div class="acct__panel" id="account-panel">
    <div class="acct__id">
        <span class="acct__avatar acct__avatar--lg" aria-hidden="true">${initial}</span>
        <span class="grow" style="min-width:0">
            <strong class="t-label" style="display:block">Minh Anh</strong>
            <span class="t-micro muted truncate" style="display:block">minh.anh@example.com</span>
        </span>
    </div>

    <div class="acct__meta">
        <span class="t-micro muted">Hạng thành viên</span>
        <div class="row g8 wrap" style="margin-top:6px">
            <span class="chip chip--teal">${tier}</span>
            <span class="t-micro muted">Hết hạn 12/11/2026</span>
        </div>
    </div>

    <div class="acct__sep" role="separator"></div>
    <ul class="acct__list">
        ${items
            .map(
                ([href, label, ic]) => `<li><a class="acct__item" href="${href}">${icon(ic, 18)}<span>${label}</span></a></li>`
            )
            .join('')}
    </ul>

    <div class="acct__sep" role="separator"></div>
    <ul class="acct__list">
        <li><button class="acct__item acct__item--danger" type="button">${icon('arrowLeft', 18)}<span>Đăng xuất</span></button></li>
    </ul>
</div>`;
}

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
    account = {},
    lexiOpen = false,
} = {}) {
    const navHtml = PRIMARY.map(
        (n) => `<a class="nav__item" href="${n.href}" ${n.id === active ? 'aria-current="page"' : ''}>
            ${icon(n.icon, 20)}<span>${n.label}</span></a>`
    ).join('');

    const secHtml = SECONDARY.map(
        (n) => `<a class="nav__item" href="${n.href}">${icon(n.icon, 18)}<span>${n.label}</span></a>`
    ).join('');

    const tabs = MOBILE_TABS.map(
        (n) => `<a class="tabbar__item" href="${n.href}" ${n.id === active || (active === 'profile' && n.id === 'more') || (active === 'more' && n.id === 'more') ? 'aria-current="page"' : ''}>
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
            <!-- The account block is the DEFAULT now, not an empty string: an undefined right-hand
                 side is how the top-right profile went undesigned for the whole first build. A
                 screen can still override it. -->
            ${headerRight || accountHeader(account)}
        </header>
        <main class="shell__content shell__content--${container}">${body}</main>
        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">${tabs}</nav>
    </div>

    ${showLexiFab ? lexiFab({ open: lexiOpen }) : ''}
</div>
${bottomBar}`;
}

/* --------------------------------------------------------- Lexi's panel */

/**
 * The floating helper, and the panel it opens.
 *
 * IT USED TO BE A LINK. `showLexiFab` rendered `<a href="36-ai-chat.html">`, so "Hỏi Lexi" navigated
 * away from whatever the learner was doing — the one thing a floating helper must not do, because
 * the question is usually ABOUT the screen they are on. `DESIGN-V2.md` §7.3 always said "Opens the
 * Lexi panel"; the mockup was the half that was wrong, which is why the app shipped a redirect.
 *
 * The panel is a NON-MODAL dialog: the page behind it stays usable and scrollable, so a learner can
 * read the passage they are asking about. `aria-modal="true"` would be a lie here.
 *
 * On phones it is a bottom sheet above the tab bar, because a 360px popover next to a 56px FAB does
 * not fit a 390px screen; at >=1024px it is a 380px panel anchored bottom-right.
 */
export function lexiFab({ open = false } = {}) {
    return `
<button class="lexi-fab" type="button" aria-haspopup="dialog" aria-expanded="${open ? 'true' : 'false'}"
        aria-controls="lexi-panel" aria-label="Hỏi Lexi">
    ${lexi({ mood: open ? 'thinking' : 'idle', size: 'sm' })}
</button>${open ? lexiPanel() : ''}`;
}

export function lexiPanel() {
    return `
<div class="lexi-panel" id="lexi-panel" role="dialog" aria-modal="false" aria-label="Hỏi Lexi">
    <div class="lexi-panel__head">
        <span class="lexi-panel__id">
            ${lexi({ mood: 'thinking', size: 'xs' })}
            <span class="grow" style="min-width:0">
                <strong class="t-label" style="display:block">Lexi</strong>
                <!-- The context line states what she can see, so the learner does not have to guess
                     whether she knows which screen they are on. -->
                <span class="t-micro muted" style="display:block">Đang xem: Trang chủ</span>
            </span>
        </span>
        <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Đóng">${icon('cross', 18)}</button>
    </div>

    <div class="lexi-panel__log" aria-live="polite">
        <div class="bubble bubble--lexi">
            <p class="t-body">
                Bạn đang ở Trang chủ. Hỏi mình về bài đang làm, hoặc nhờ mình chỉ ra chỗ hay sai nhé.
            </p>
        </div>
        <div class="bubble bubble--me"><p class="t-body">Vì sao mình hay sai dạng Matching Headings?</p></div>
        <div class="bubble bubble--lexi">
            <p class="t-body">
                Vì bạn chọn theo từ khoá trùng lặp trong đoạn thay vì đọc câu chủ đề. Thử đọc câu đầu và
                câu cuối của mỗi đoạn trước khi ghép tiêu đề.
            </p>
            <span class="t-micro muted">Vừa xong</span>
        </div>
    </div>

    <!-- Suggestion chips: the panel has no room for a wall of options, and an empty composer is the
         moment a learner gives up. Single row with scroll. -->
    <div class="row g8 nowrap no-scrollbar lexi-panel__chips" style="overflow-x:auto;flex-wrap:nowrap">
        <button class="chip chip--outline" style="flex-shrink:0;white-space:nowrap" type="button">Giải thích chỗ này</button>
        <button class="chip chip--outline" style="flex-shrink:0;white-space:nowrap" type="button">Cho mình ví dụ</button>
        <button class="chip chip--outline" style="flex-shrink:0;white-space:nowrap" type="button">Sai ở đâu?</button>
    </div>

    <div class="lexi-panel__composer">
        <div class="row g8">
            <input class="input" placeholder="Hỏi Lexi…" aria-label="Câu hỏi cho Lexi" />
            <button class="btn btn--primary btn--icon" type="button" aria-label="Gửi">${icon('arrowRight', 18)}</button>
        </div>
        <!-- Cost on the send control, before the press: the same rule as everywhere else. -->
        <span class="t-micro muted">Mỗi lượt AI tốn 1 credit · còn 12 credit</span>
    </div>
</div>`;
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

/* ---- account block in the header (bell · tier · avatar · disclosure panel) ---- */
.acct { position: relative; display: flex; align-items: center; gap: 8px; }
.acct__icon {
    position: relative; display: grid; place-items: center;
    width: 44px; height: 44px; border-radius: var(--r-control);
    border: 2px solid var(--border-strong); background: transparent; color: var(--ink-soft);
}
.acct__dot {
    position: absolute; top: -6px; right: -6px;
    min-width: 20px; height: 20px; padding: 0 5px;
    display: grid; place-items: center;
    border-radius: var(--r-chip); background: var(--amber); color: var(--on-amber);
    font-size: 11px; font-weight: 800;
}
.acct__avatar {
    display: grid; place-items: center;
    width: 44px; height: 44px; border-radius: var(--r-chip);
    background: var(--teal); color: var(--on-teal);
    font-weight: 800; border: 0;
}
.acct__avatar--lg { width: 48px; height: 48px; }
/* A genuinely floating surface, so this is the one place the raised shadow is right. */
.acct__panel {
    position: absolute; top: calc(100% + 10px); right: 0; z-index: 40;
    width: 300px; padding: 14px;
    background: var(--surface); border: 2px solid var(--border);
    border-radius: var(--r-card);
    box-shadow: 0 12px 28px -12px rgb(20 35 43 / .35);
}
.acct__id { display: flex; align-items: center; gap: 12px; }
.acct__meta { margin-top: 12px; }
.acct__sep { height: 2px; background: var(--border); margin: 12px -14px; }
.acct__list { display: flex; flex-direction: column; gap: 2px; }
.acct__item {
    display: flex; align-items: center; gap: 12px;
    min-height: 44px; padding: 0 8px; width: 100%;
    border: 0; border-radius: var(--r-control);
    background: transparent; color: var(--ink-soft);
    font-weight: 700; text-align: left;
}
.acct__item:hover { background: var(--surface-alt); color: var(--ink); }
.acct__item--danger { color: var(--wrong); }
@media (max-width: 1023px) {
    .acct__panel { width: min(300px, calc(100vw - 28px)); }
}

@media (max-width: 1023px) {
    .shell__rail { display: none; }
    .shell__main { margin-left: 0; padding-bottom: calc(var(--shell-tabbar) + env(safe-area-inset-bottom, 0px)); }
    /* THE PHONE HEADER IS ONE STEP TIGHTER, not one component poorer. Every part stays —
       title, subtitle, credit chip, bell, avatar — because removing one of them moves the
       problem to whoever needs that control next. What is taken out is empty space: the
       page title drops one step (h1 24px -> 20px), the gaps and padding close up, and the
       subtitle ellipsises instead of wrapping to three lines beside a long dynamic title
       ("Hội thoại — Do you enjoy meeting new people?" cannot fit at 390px at any size, so it
       truncates by design and the subtitle keeps a full line). The two icon controls keep
       their 44x44 target: DESIGN-V2 section 12 makes that floor non-negotiable, so the space
       comes from padding and type, never from the tap targets. */
    .shell__header { padding: 6px 10px; gap: 8px; min-height: 56px; }
    .shell__header .t-h1 { font-size: 1.25rem; }
    .shell__header .t-micro { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .shell__header .acct { gap: 6px; }
    .shell__content { padding: 14px; }
    .shell__content--full { padding: 0; }
}

@media (max-width: 359px) {
    /* At the 320px floor the header's parts cannot share one line without pushing the account
       block out of the viewport, which three frames did. Wrapping keeps every component and
       scrolls nothing sideways: the title takes its own row, the trailing controls take the next
       one, and an auto left margin keeps them right-aligned where they belong. */
    .shell__header { flex-wrap: wrap; }
    .shell__header > .acct, .shell__header > .btn { margin-left: auto; }
}

.lexi-fab {
    position: fixed; right: 18px; bottom: calc(var(--shell-tabbar) + 18px); z-index: 30;
    width: 60px; height: 60px; display: grid; place-items: center;
    border-radius: var(--r-chip); background: var(--surface);
    border: 2px solid var(--border-strong);
    box-shadow: 0 4px 0 0 var(--border), 0 12px 24px -10px rgb(20 35 43 / .35);
}
@media (min-width: 1024px) { .lexi-fab { bottom: 18px; } }

/* Lexi's panel. A genuinely floating surface, so the raised shadow is correct here — and it is
   NON-MODAL: the page behind stays readable, because the question is usually about that page. */
.lexi-panel {
    position: fixed; right: 18px; z-index: 35;
    bottom: calc(var(--shell-tabbar) + 88px);
    width: min(380px, calc(100vw - 28px));
    display: flex; flex-direction: column; gap: 12px;
    padding: 14px;
    background: var(--surface); border: 2px solid var(--border); border-radius: var(--r-card);
    box-shadow: 0 16px 36px -14px rgb(20 35 43 / .4);
}
@media (min-width: 1024px) { .lexi-panel { bottom: 88px; } }
.lexi-panel__head { display: flex; align-items: center; gap: 8px; justify-content: space-between; }
.lexi-panel__id { display: flex; align-items: center; gap: 10px; min-width: 0; }
.lexi-panel__log { display: flex; flex-direction: column; gap: 10px; max-height: 42vh; overflow-y: auto; }
.lexi-panel__chips { }
.lexi-panel__composer { display: flex; flex-direction: column; gap: 6px; border-top: 2px solid var(--border); padding-top: 12px; }

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

/* ---- the take shell, and the data table: ONE definition, shared ----

   Both of these used to be declared by ONE frame each and then used by frames that never declared
   them. The take layout was declared by frame 09 and frame 13 used its bar/main/foot parts with
   none of it defined, so the flashcard review's footer was not sticky and its main column was not
   centred — the frame was never reviewed as a take screen, only as a card. The same held for the
   data table: frame 11 declared it and every other table screen inherited nothing.

   Two things now use these, and a third (15b) is a take screen, so they live here where the shell
   lives. A frame's own <style> block still wins for anything screen-specific (09's answer grid), so
   this is additive. */
.take { min-height: 100vh; display: flex; flex-direction: column; background: var(--canvas); }
.take__bar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 2px solid var(--border); background: var(--surface); }
.take__main { flex: 1; width: 100%; max-width: 680px; margin-inline: auto; padding: 28px 16px 120px; }
.take__foot { position: sticky; bottom: 0; z-index: 20; background: var(--surface); border-top: 2px solid var(--border); padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); }
.take__foot-inner { max-width: 680px; margin-inline: auto; display: flex; align-items: center; gap: 12px; }
@media (max-width: 479px) { .take__foot-inner .btn--ghost { display: none; } .take__foot-inner .btn--primary { width: 100%; } }

.tbl { width: 100%; border-collapse: collapse; }
.tbl th { text-align: left; padding: 12px 16px; font-size: .8125rem; font-weight: 700; color: var(--ink-muted); background: var(--surface-alt); border-bottom: 2px solid var(--border); }
.tbl td { padding: 12px 16px; border-bottom: 2px solid var(--border); vertical-align: middle; }
.tbl tr:last-child td { border-bottom: 0; }

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
