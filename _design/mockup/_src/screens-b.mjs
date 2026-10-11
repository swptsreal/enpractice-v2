/* Screens 04–06 — Daily learning. */
import { shell, icon, stat, bar, emptyState } from '../assets/shell.js';
import { lexi } from '../assets/lexi.js';

export const screens = {

/* ==================================================================== 04 */
'04-home': {
    file: '04-home.html',
    title: 'Trang chủ',
    subtitle: 'Operate · 1 quyết định + kế hoạch ngày',
    group: 'Học hằng ngày',
    note: 'Không còn bento 6 widget',
    body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html">
            <span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span>
        </a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html" aria-current="page">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="07-vocabulary-check.html">${icon('book', 20)}<span>Học</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
            <div class="nav__group">Khác</div>
            <div class="nav">
                <a class="nav__item" href="06-path.html">${icon('target', 18)}<span>Lộ trình học</span></a>
                <a class="nav__item" href="12-dictionary.html">${icon('book', 18)}<span>Sổ tay từ vựng</span></a>
                <a class="nav__item" href="21-writing-list.html">${icon('pen', 18)}<span>Luyện Writing</span></a>
                <a class="nav__item" href="24-speaking-list.html">${icon('mic', 18)}<span>Luyện Speaking</span></a>
                <a class="nav__item" href="27-custom-speaking.html">${icon('chat', 18)}<span>Hội thoại tự chọn</span></a>
                <a class="nav__item" href="36-ai-chat.html">${icon('sparkle', 18)}<span>AI Coach</span></a>
                <a class="nav__item" href="28-leaderboard.html">${icon('trophy', 18)}<span>Bảng xếp hạng</span></a>
                <a class="nav__item" href="31-rewards.html">${icon('gift', 18)}<span>Phần thưởng</span></a>
                <a class="nav__item" href="32-credits.html">${icon('coin', 18)}<span>Ví credit</span></a>
                <a class="nav__item" href="34-notifications.html">${icon('bell', 18)}<span>Thông báo</span></a>
                <a class="nav__item" href="35-settings.html">${icon('settings', 18)}<span>Cài đặt</span></a>
            </div>
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
            <div class="grow" style="min-width:0">
                <h1 class="t-h1 truncate">Chào Minh 👋</h1>
                <p class="t-micro muted">Thứ Ba, 13/10 · Còn 20 phút là đủ cho hôm nay</p>
            </div>
            <a class="btn btn--ghost btn--icon btn--sm" href="34-notifications.html" aria-label="Thông báo" style="position:relative">
                ${icon('bell', 18)}<span class="badge" style="position:absolute;top:-6px;right:-6px">3</span>
            </a>
            <a href="33-profile.html" aria-label="Trang cá nhân" style="width:44px;height:44px;border-radius:999px;background:var(--teal);color:var(--on-teal);display:grid;place-items:center;font-weight:800">M</a>
        </header>

        <main class="shell__content shell__content--wide" id="main">

            <!-- Lexi greeting + the single primary decision -->
            <section class="card card--edge pad-x greet">
                <div class="greet__lexi" data-lexi="happy" data-size="xl" data-label="Lexi"></div>
                <div class="grow">
                    <div class="bubble bubble--lexi bubble--right" style="display:inline-block">
                        Hôm qua bạn sai 3 câu dạng True/False/Not Given. Luyện 10 phút nhé?
                    </div>
                    <h2 class="t-h2" style="margin-top:14px">Tiếp tục: Reading — Matching Headings</h2>
                    <p class="t-body muted">Bài 4 trong lộ trình · khoảng 12 phút</p>
                    <div class="row g12 wrap" style="margin-top:16px">
                        <a class="btn btn--primary btn--lg" href="18-ielts-take.html">${icon('play', 18)} Bắt đầu</a>
                        <a class="btn btn--ghost btn--lg" href="05-daily-plan.html">Xem kế hoạch hôm nay</a>
                    </div>
                </div>
            </section>

            <div class="home-stats">
                ${stat('12', 'Chuỗi ngày', 'amber', 'flame')}
                ${stat('2,480', 'Tổng XP', 'teal', 'star')}
                ${stat('6.0', 'Band ước tính', '', 'chart')}
                ${stat('240', 'Credit', '', 'coin')}
            </div>

            <div class="home-cols">
                <!-- Today's plan: the actionable list, not a widget grid -->
                <section class="card card--edge pad-x">
                    <div class="between">
                        <h2 class="t-h2">Kế hoạch hôm nay</h2>
                        <span class="t-micro muted">1 / 4 xong</span>
                    </div>
                    <div style="margin:12px 0">${bar(25)}</div>
                    <ul class="stack g8">
                        ${[
                            ['check', 'Ôn 12 từ đến hạn', 'Xong · +30 XP', true],
                            ['headphones', 'Listening Section 2', '8 phút · chưa làm', false],
                            ['pen', 'Writing Task 2 — Environment', 'AI chấm · tốn 1 credit', false],
                            ['mic', 'Speaking Part 2 — Describe a place', '5 phút · ghi âm', false],
                        ].map(([ic, t, m, done]) => `
                            <li class="task ${done ? 'task--done' : ''}">
                                <span class="task__ic">${icon(ic, 18)}</span>
                                <span class="grow"><strong class="t-label" style="display:block">${t}</strong><span class="t-micro muted">${m}</span></span>
                                ${done ? `<span style="color:var(--correct)">${icon('check', 18)}</span>` : `<a class="btn btn--ghost btn--sm" href="06-path.html">Làm</a>`}
                            </li>`).join('')}
                    </ul>
                </section>

                <div class="stack g16">
                    <!-- Weak skills, honest data -->
                    <section class="card card--edge pad-x">
                        <h2 class="t-h3">Cần cải thiện</h2>
                        <ul class="stack g12" style="margin-top:12px">
                            ${[
                                ['Matching Headings', 42, 'wrong'],
                                ['True / False / Not Given', 58, 'attention'],
                                ['Từ vựng học thuật', 61, 'attention'],
                            ].map(([t, v, tone]) => `
                                <li>
                                    <div class="between"><span class="t-micro soft">${t}</span><span class="t-micro mono">${v}%</span></div>
                                    <div style="margin-top:4px">${bar(v, tone === 'wrong' ? '' : 'amber')}</div>
                                </li>`).join('')}
                        </ul>
                        <a class="btn btn--ghost btn--sm btn--block" style="margin-top:14px" href="15-review.html">Ôn phần yếu</a>
                    </section>

                    <!-- Streak heatmap, calm ink not a dare -->
                    <section class="card card--edge pad-x">
                        <div class="between"><h2 class="t-h3">Nhịp học 5 tuần</h2><span class="t-micro muted">2 ngày nghỉ phép còn lại</span></div>
                        <div class="heat" style="margin-top:12px" role="img" aria-label="Mật độ học 5 tuần gần nhất">
                            ${Array.from({ length: 35 }, (_, i) => {
                                const lvl = [0,1,2,3,2,1,0][i % 7];
                                return `<span class="heat__c" data-l="${i % 5 === 3 ? 3 : lvl}"></span>`;
                            }).join('')}
                        </div>
                    </section>
                </div>
            </div>

            <!-- Daily plan as a bottom sheet, inline for review -->
            <section class="card card--edge pad-x">
                <div class="between">
                    <h2 class="t-h3">Gợi ý cho bạn</h2>
                    <a class="t-micro" href="16-ielts-list.html">Xem tất cả</a>
                </div>
                <div class="grid g-auto" style="margin-top:12px">
                    ${[
                        ['18-ielts-take.html', 'headphones', 'Listening Section 3', '12 phút'],
                        ['09-vocabulary-take.html', 'book', 'Test từ vựng chủ đề Education', '8 phút'],
                        ['22-writing-take.html', 'pen', 'Writing Task 1 — Bar chart', '20 phút'],
                    ].map(([h, ic, t, m]) => `
                        <a class="rec" href="${h}">
                            <span class="rec__ic">${icon(ic, 20)}</span>
                            <span class="grow"><strong class="t-label" style="display:block">${t}</strong><span class="t-micro muted">${m}</span></span>
                            ${icon('arrowRight', 16)}
                        </a>`).join('')}
                </div>
            </section>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html" aria-current="page">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="07-vocabulary-check.html">${icon('book', 22)}<span>Học</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33-profile.html">${icon('user', 22)}<span>Cá nhân</span></a>
        </nav>
    </div>
    <a class="lexi-fab" href="36-ai-chat.html" aria-label="Hỏi Lexi"><span data-lexi="idle" data-size="sm"></span></a>
</div>`,
    style: `
.greet { display: flex; gap: 20px; align-items: flex-start; }
.greet__lexi { flex: 0 0 auto; }
@media (max-width: 767px) { .greet { flex-direction: column; align-items: center; text-align: center; } .greet .bubble { text-align: left; } }
.home-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
@media (max-width: 900px) { .home-stats { grid-template-columns: repeat(2, 1fr); } }
.home-cols { display: grid; grid-template-columns: 1.15fr .85fr; gap: 16px; margin-top: 16px; }
@media (max-width: 1023px) { .home-cols { grid-template-columns: 1fr; } }
.task { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 2px solid var(--border); border-radius: var(--r-control); }
.task--done { background: var(--surface-alt); border-color: transparent; opacity: .8; }
.task__ic { width: 34px; height: 34px; display: grid; place-items: center; border-radius: var(--r-sm); background: var(--teal-soft); color: var(--teal); flex: 0 0 auto; }
/* An inner row inside a card is a row, not a second card: border + tint only. */
.rec { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--r-control); background: var(--surface-alt); color: inherit; }
.rec:hover { background: color-mix(in srgb, var(--teal) 10%, var(--surface-alt)); }
.rec__ic { color: var(--teal); flex: 0 0 auto; }
.heat { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.heat__c { aspect-ratio: 1; border-radius: 5px; background: var(--surface-alt); }
.heat__c[data-l='1'] { background: color-mix(in srgb, var(--teal) 32%, var(--surface-alt)); }
.heat__c[data-l='2'] { background: color-mix(in srgb, var(--teal) 62%, var(--surface-alt)); }
.heat__c[data-l='3'] { background: var(--teal); }
`,
},

/* ==================================================================== 05 */
'05-daily-plan': {
    file: '05-daily-plan.html',
    title: 'Kế hoạch học hôm nay',
    subtitle: 'Bottom sheet · 4 nhiệm vụ',
    group: 'Học hằng ngày',
    note: 'Sheet 28px radius · không có nav',
    body: `
<div class="sheet-stage">
    <!-- The Home screen dimmed behind the sheet, so the sheet is judged in context -->
    <div class="sheet-bg" aria-hidden="true">
        <div class="container" style="padding-top:32px">
            <div class="sk" style="width:220px;height:28px"></div>
            <div class="sk" style="width:100%;height:150px;margin-top:16px;border-radius:var(--r-hero)"></div>
            <div class="grid g-4" style="margin-top:16px">
                ${Array.from({ length: 4 }, () => '<div class="sk" style="height:88px;border-radius:var(--r-card)"></div>').join('')}
            </div>
        </div>
    </div>

    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div class="sheet__grab" aria-hidden="true"></div>
        <header class="sheet__head">
            <div class="row g12">
                <span data-lexi="explain" data-size="sm"></span>
                <div class="grow">
                    <h2 class="t-h2" id="sheet-title">Kế hoạch hôm nay</h2>
                    <p class="t-micro muted">4 nhiệm vụ · khoảng 32 phút</p>
                </div>
                <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Đóng">${icon('cross', 18)}</button>
            </div>
            <div style="margin-top:14px">${bar(25, 'amber')}</div>
            <div class="between" style="margin-top:6px">
                <span class="t-micro muted">1 / 4 xong</span>
                <span class="t-micro" style="color:var(--attention)">+120 XP còn lại</span>
            </div>
        </header>

        <div class="sheet__body">
            ${[
                ['check', 'Ôn 12 từ đến hạn', 'Ôn ngắt quãng · 4 phút', 'Xong', true, ''],
                ['headphones', 'Listening Section 2', '8 phút · 10 câu', 'Làm', false, '18-ielts-take.html'],
                ['pen', 'Writing Task 2 — Environment', 'AI chấm theo 4 tiêu chí · tốn 1 credit', 'Làm', false, '22-writing-take.html'],
                ['mic', 'Speaking Part 2', 'Describe a place you like · 5 phút', 'Làm', false, '25-speaking-take.html'],
            ].map(([ic, t, m, cta, done, href], i) => `
                <article class="plan ${done ? 'plan--done' : ''}">
                    <span class="plan__step mono">${i + 1}</span>
                    <span class="plan__ic">${icon(ic, 20)}</span>
                    <div class="grow">
                        <strong class="t-h3" style="display:block">${t}</strong>
                        <span class="t-micro muted">${m}</span>
                    </div>
                    ${done
                        ? `<span class="chip chip--correct">${icon('check', 14)} ${cta}</span>`
                        : `<a class="btn btn--primary btn--sm" href="${href}">${cta}</a>`}
                </article>`).join('')}

            <p class="t-micro muted" style="text-align:center;margin-top:8px">
                Kế hoạch được điều chỉnh theo kết quả gần nhất. Bạn có thể bỏ qua bất kỳ nhiệm vụ nào.
            </p>
        </div>

        <footer class="sheet__foot">
            <button class="btn btn--ghost btn--block" type="button">Để mai làm</button>
        </footer>
    </div>
</div>`,
    style: `
.sheet-stage { min-height: 100vh; position: relative; background: var(--canvas); display: flex; flex-direction: column; justify-content: flex-end; }
.sheet-bg { position: absolute; inset: 0; overflow: hidden; opacity: .5; }
.sheet {
    position: relative; width: 100%; max-width: 640px; margin-inline: auto;
    background: var(--surface); border: 2px solid var(--border-strong); border-bottom: 0;
    border-radius: var(--r-hero) var(--r-hero) 0 0;
    box-shadow: 0 -8px 40px -12px rgb(20 35 43 / .35);
    max-height: 88vh; display: flex; flex-direction: column;
}
.sheet__grab { width: 46px; height: 5px; border-radius: 999px; background: var(--border-strong); margin: 10px auto 0; }
.sheet__head { padding: 12px 20px 16px; border-bottom: 2px solid var(--border); }
.sheet__body { padding: 16px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.sheet__foot { padding: 14px 20px calc(14px + env(safe-area-inset-bottom, 0px)); border-top: 2px solid var(--border); }
.plan { display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid var(--border); border-radius: var(--r-card); }
.plan--done { background: var(--surface-alt); border-color: transparent; }
.plan--done .t-h3 { text-decoration: line-through; opacity: .7; }
.plan__step { width: 24px; text-align: center; color: var(--ink-faint); }
.plan__ic { width: 40px; height: 40px; display: grid; place-items: center; border-radius: var(--r-control); background: var(--teal-soft); color: var(--teal); flex: 0 0 auto; }
@media (min-width: 1024px) { .sheet { border-radius: var(--r-hero); border-bottom: 2px solid var(--border-strong); margin-bottom: 24px; } .sheet__grab { display: none; } }
`,
},

/* ==================================================================== 06 */
'06-path': {
    file: '06-path.html',
    title: 'Lộ trình học',
    subtitle: 'Unit · node · khoá/mở',
    group: 'Học hằng ngày',
    note: 'Signature surface · node pulse 1.6s (tắt khi reduced-motion)',
    body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html">
            <span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span>
        </a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="07-vocabulary-check.html">${icon('book', 20)}<span>Học</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
            <div class="nav__group">Khác</div>
            <div class="nav"><a class="nav__item" href="06-path.html" aria-current="page">${icon('target', 18)}<span>Lộ trình học</span></a></div>
        </nav>
        <div class="shell__foot"><div class="row g8" style="padding:0 4px">
            <span class="chip chip--amber">${icon('flame', 14)} 12 ngày</span>
            <span class="chip chip--teal">${icon('coin', 14)} 240</span>
        </div></div>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            <div class="grow" style="min-width:0">
                <h1 class="t-h1 truncate">Lộ trình của bạn</h1>
                <p class="t-micro muted">Mục tiêu band 6.5 · Unit 2 / 6</p>
            </div>
            <span class="chip chip--teal">${icon('star', 14)} 2,480 XP</span>
        </header>

        <main class="shell__content shell__content--focus" id="main">
            <!-- Unit header -->
            <section class="card card--hero pad-x unit">
                <div class="between wrap g12">
                    <div>
                        <span class="chip chip--amber">Unit 2</span>
                        <h2 class="t-display" style="font-size:1.75rem;margin-top:10px">Reading — Nối tiêu đề</h2>
                        <p class="t-body muted">6 bài · 1 bài kiểm tra cuối unit</p>
                    </div>
                    <div style="min-width:180px">
                        <div class="between"><span class="t-micro muted">Tiến độ unit</span><span class="t-micro mono">3/7</span></div>
                        <div style="margin-top:6px">${bar(43, 'amber')}</div>
                    </div>
                </div>
            </section>

            <!-- The path. Nodes are big, pressable, and the current one is the only thing that moves. -->
            <div class="path" style="margin-top:28px">
                ${[
                    ['done', 'check', 'Nhận diện paraphrase', 'Xong · 4/4'],
                    ['done', 'check', 'Từ khoá trong câu hỏi', 'Xong · 5/5'],
                    ['current', 'play', 'Matching Headings', 'Đang học · câu 3/10'],
                    ['locked', 'lock', 'True / False / Not Given', 'Mở sau bài hiện tại'],
                    ['locked', 'lock', 'Summary Completion', 'Khoá'],
                    ['milestone', 'trophy', 'Kiểm tra cuối Unit 2', 'Mở sau 5 bài'],
                ].map(([state, ic, t, m], i, arr) => `
                    ${i > 0 ? '<span class="path__seg"></span>' : ''}
                    <div class="path__row ${i % 2 ? 'path__row--right' : ''}">
                        <button class="path__node path__node--${state}" type="button" ${state === 'locked' ? 'disabled' : ''}
                            aria-label="${t} — ${m}">
                            ${state === 'current' ? '<span class="path__ring" aria-hidden="true"></span>' : ''}
                            ${icon(ic, state === 'milestone' ? 34 : 28)}
                        </button>
                        <div class="path__label">
                            <strong class="t-label">${t}</strong>
                            <span class="t-micro muted">${m}</span>
                        </div>
                    </div>`).join('')}
            </div>

            <!-- Unit end / next unit -->
            <section class="card card--edge pad-x" style="margin-top:28px;text-align:center">
                <span data-lexi="idle" data-size="md" style="display:inline-block"></span>
                <h3 class="t-h3" style="margin-top:8px">Unit 3 — Writing Task 1</h3>
                <p class="t-micro muted">Mở sau khi hoàn thành bài kiểm tra Unit 2</p>
                <div class="row g8" style="justify-content:center;margin-top:12px">
                    <span class="chip">Biểu đồ</span><span class="chip">Quy trình</span><span class="chip">Bản đồ</span>
                </div>
            </section>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="07-vocabulary-check.html">${icon('book', 22)}<span>Học</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33-profile.html">${icon('user', 22)}<span>Cá nhân</span></a>
        </nav>
    </div>
</div>`,
    style: `
.unit { border-color: var(--border-strong); }
.path { display: flex; flex-direction: column; align-items: center; }
.path__row { display: flex; align-items: center; gap: 16px; width: 100%; max-width: 460px; }
.path__row--right { flex-direction: row-reverse; text-align: right; }
.path__label strong { display: block; }
.path__node { flex: 0 0 auto; }
.path__node[disabled] { cursor: not-allowed; }
@media (max-width: 479px) { .path__label { display: none; } .path__row { justify-content: center; } }
`,
},

};
