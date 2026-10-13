/* Screens 16–36 — IELTS, Progress, Account. */
import { shell, icon, stat, bar, emptyState, skeletonCard, accountHeader, lexiFab, lexiPanel } from '../assets/shell.js';
import { lexi } from '../assets/lexi.js';

/* The rail is identical on every app screen, so it lives here once. */
const rail = (active) => `
<aside class="shell__rail">
    <a class="shell__brand" href="04-home.html"><span data-lexi="idle" data-size="xs"></span>
        <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span></a>
    <nav class="shell__nav" aria-label="Điều hướng chính">
        <div class="nav">
            <a class="nav__item" href="04-home.html" ${active === 'home' ? 'aria-current="page"' : ''}>${icon('home', 20)}<span>Trang chủ</span></a>
            <a class="nav__item" href="08-vocabulary-list.html" ${active === 'learn' ? 'aria-current="page"' : ''}>${icon('book', 20)}<span>Từ vựng</span></a>
            <a class="nav__item" href="16-ielts-list.html" ${active === 'practice' ? 'aria-current="page"' : ''}>${icon('target', 20)}<span>Luyện tập</span></a>
            <a class="nav__item" href="29-weekly-report.html" ${active === 'progress' ? 'aria-current="page"' : ''}>${icon('chart', 20)}<span>Tiến độ</span></a>
            <a class="nav__item" href="33-profile.html" ${active === 'account' ? 'aria-current="page"' : ''}>${icon('user', 20)}<span>Cá nhân</span></a>
        </div>
        <div class="nav__group">IELTS</div>
        <div class="nav">
            <a class="nav__item" href="16-ielts-list.html">${icon('headphones', 18)}<span>Kho đề</span></a>
            <a class="nav__item" href="21-writing-list.html">${icon('pen', 18)}<span>Writing</span></a>
            <a class="nav__item" href="24-speaking-list.html">${icon('mic', 18)}<span>Speaking</span></a>
            <a class="nav__item" href="27-custom-speaking.html">${icon('chat', 18)}<span>Hội thoại tự chọn</span></a>
        </div>
        <div class="nav__group">Khác</div>
        <div class="nav">
            <a class="nav__item" href="06-path.html">${icon('target', 18)}<span>Lộ trình</span></a>
            <a class="nav__item" href="12-dictionary.html">${icon('book', 18)}<span>Sổ tay</span></a>
                <a class="nav__item" href="07-vocabulary-check.html">${icon('search', 18)}<span>Tra từ &amp; hỏi AI</span></a>
                <a class="nav__item" href="15-review.html">${icon('clock', 18)}<span>Ôn tập từ vựng</span></a>
            <a class="nav__item" href="36-ai-chat.html">${icon('sparkle', 18)}<span>AI Coach</span></a>
            <a class="nav__item" href="28-leaderboard.html">${icon('trophy', 18)}<span>Xếp hạng</span></a>
            <a class="nav__item" href="31-rewards.html">${icon('gift', 18)}<span>Phần thưởng</span></a>
            <a class="nav__item" href="32-credits.html">${icon('coin', 18)}<span>Ví credit</span></a>
            <a class="nav__item" href="34-notifications.html">${icon('bell', 18)}<span>Thông báo</span></a>
            <a class="nav__item" href="35-settings.html">${icon('settings', 18)}<span>Cài đặt</span></a>
        </div>
    </nav>
    <div class="shell__foot"><div class="row g8" style="padding:0 4px">
        <span class="chip chip--amber">${icon('flame', 14)} 12 ngày</span>
        <span class="chip chip--teal">${icon('coin', 14)} 240</span>
    </div></div>
</aside>`;

const tabbar = (active) => `
<nav class="tabbar only-mobile" aria-label="Điều hướng chính">
    <a class="tabbar__item" href="04-home.html" ${active === 'home' ? 'aria-current="page"' : ''}>${icon('home', 22)}<span>Trang chủ</span></a>
    <a class="tabbar__item" href="08-vocabulary-list.html" ${active === 'learn' ? 'aria-current="page"' : ''}>${icon('book', 22)}<span>Từ vựng</span></a>
    <a class="tabbar__item" href="16-ielts-list.html" ${active === 'practice' ? 'aria-current="page"' : ''}>${icon('target', 22)}<span>Luyện tập</span></a>
    <a class="tabbar__item" href="29-weekly-report.html" ${active === 'progress' ? 'aria-current="page"' : ''}>${icon('chart', 22)}<span>Tiến độ</span></a>
    <a class="tabbar__item" href="33-profile.html" ${active === 'account' ? 'aria-current="page"' : ''}>${icon('user', 22)}<span>Cá nhân</span></a>
</nav>`;

/* The rail is identical on every app screen, so it lives here once. `lexiOpen` exists for the one
   frame that reviews the helper's PANEL rather than the helper. */
const wrap = (active, body, { lexiOpen = false } = {}) => `<div class="shell">${rail(active)}<div class="shell__main">${body}${tabbar(active)}</div>${lexiFab({ open: lexiOpen })}</div>`;

export const screens = {

/* ==================================================================== 16 */
'16-ielts-list': { file: '16-ielts-list.html', title: 'Kho đề IELTS', subtitle: 'Filter + lưới đề', group: 'IELTS',
  note: 'Lọc theo kỹ năng · 1 bố cục duy nhất cho mọi màn danh sách', body: wrap('practice', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Kho đề IELTS</h1>
    <p class="t-micro muted">Listening &amp; Reading · cập nhật hằng tuần</p></div>
    <a class="btn btn--ghost btn--sm" href="20-ielts-history.html">${icon('clock', 16)} Lịch sử</a>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <div class="pills" style="margin-bottom:16px" role="tablist" aria-label="Kỹ năng">
        <a class="pill" href="16-ielts-list.html" aria-current="page">${icon('target', 16)} Tất cả</a>
        <a class="pill" href="16-ielts-list.html">${icon('headphones', 16)} Listening</a>
        <a class="pill" href="16-ielts-list.html">${icon('book', 16)} Reading</a>
        <a class="pill" href="21-writing-list.html">${icon('pen', 16)} Writing</a>
        <a class="pill" href="24-speaking-list.html">${icon('mic', 16)} Speaking</a>
    </div>

    <h2 class="t-h2" style="margin-bottom:12px">Đề có sẵn</h2>
    <div class="grid g-3">
        ${[
            ['Cambridge 19 — Test 1', 'Listening + Reading', 'Full', 0, 0, '80 phút'],            ['Cambridge 19 — Test 2', 'Listening + Reading', 'Full', 6.5, 88, '80 phút'],
            ['Reading Practice — Education', 'Reading', 'Section', 7.0, 92, '20 phút'],
            ['Listening Practice — Travel', 'Listening', 'Section', 0, 0, '15 phút'],
            ['Cambridge 18 — Test 4', 'Listening + Reading', 'Full', 6.0, 74, '80 phút'],
            ['Reading Practice — Environment', 'Reading', 'Section', 0, 0, '20 phút'],
        ].map(([t, skills, type, band, score, time]) => `
            <article class="card card--edge pad-x">
                <div class="between">
                    <span class="chip ${type === 'Full' ? 'chip--teal' : ''}">${type}</span>
                    ${band ? `<span class="band">${band}</span>` : ''}
                </div>
                <h3 class="t-h3" style="margin-top:12px">${t}</h3>
                <p class="t-micro muted">${skills} · ${time}</p>
                ${score ? `<div style="margin-top:10px">${bar(score)}</div><span class="t-micro muted">Lần trước ${score}%</span>` : ''}
                <a class="btn btn--${band ? 'ghost' : 'primary'} btn--sm btn--block" style="margin-top:14px"
                   href="17-ielts-detail.html">${band ? 'Làm lại' : 'Bắt đầu'}</a>
            </article>`).join('')}
    </div>
</main>`) },

/* ==================================================================== 17 */
'17-ielts-detail': { file: '17-ielts-detail.html', title: 'Chi tiết đề thi', subtitle: 'Cấu trúc + CTA', group: 'IELTS',
  note: 'Cho biết chính xác sẽ tốn bao nhiêu credit', body: wrap('practice', `
<header class="shell__header">
    <a class="btn btn--ghost btn--icon btn--sm" href="16-ielts-list.html" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Cambridge 19 — Test 1</h1>
    <p class="t-micro muted">Listening + Reading · 80 phút</p></div>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--focus" id="main">
    <section class="card card--hero pad-x">
        <div class="between wrap g12">
            <div><span class="chip chip--teal">Full test</span>
                <h2 class="t-h2" style="margin-top:10px">Cambridge IELTS 19 — Academic Test 1</h2>
                <p class="t-body muted">4 phần Listening · 3 passage Reading · 40 + 40 câu</p></div>
            <div style="text-align:right">
                <span class="t-micro muted">Chi phí</span>
                <div class="chip chip--teal" style="height:auto;padding:8px 14px">${icon('coin', 16)} 1 credit</div>
                <p class="t-micro muted" style="margin-top:4px">Bạn còn 240 credit</p>
            </div>
        </div>
    </section>

    <section class="card card--edge pad-x" style="margin-top:16px">
        <h2 class="t-h3">Cấu trúc bài thi</h2>
        <ul class="stack g8" style="margin-top:12px">
            ${[
                ['headphones', 'Listening — Section 1', '10 câu · hội thoại đời thường', '10 phút'],
                ['headphones', 'Listening — Section 2', '10 câu · độc thoại', '10 phút'],
                ['book', 'Reading — Passage 1', '13 câu · Matching Headings', '20 phút'],
                ['book', 'Reading — Passage 2', '13 câu · True/False/Not Given', '20 phút'],
                ['book', 'Reading — Passage 3', '14 câu · Summary Completion', '20 phút'],
            ].map(([ic, t, c, d]) => `
                <li class="row g12" style="padding:10px 12px;border:2px solid var(--border);border-radius:var(--r-control)">
                    <span style="color:var(--teal)">${icon(ic, 18)}</span>
                    <span class="grow"><strong class="t-label" style="display:block">${t}</strong><span class="t-micro muted">${c}</span></span>
                    <span class="t-micro mono muted">${d}</span>
                </li>`).join('')}
        </ul>
        <div class="verdict" style="margin-top:16px;border-color:var(--info);background:color-mix(in srgb,var(--info) 10%,var(--surface));box-shadow:0 4px 0 0 var(--info)">
            <span style="color:var(--info)">${icon('shield', 20)}</span>
            <span class="t-micro">Transcript Listening chỉ hiện <strong>sau khi nộp bài</strong>, để giữ trải nghiệm giống thi thật.</span>
        </div>
    </section>

    <div class="row g12" style="margin-top:16px">
        <a class="btn btn--primary btn--lg grow" href="18-ielts-take.html">${icon('play', 18)} Bắt đầu làm bài</a>
        <a class="btn btn--ghost btn--lg" href="16-ielts-list.html">Để sau</a>
    </div>
</main>`) },

/* ==================================================================== 18 */
'18-ielts-take': { file: '18-ielts-take.html', title: 'Phòng thi IELTS', subtitle: 'Split pane · tab trên mobile', group: 'IELTS',
  note: 'Sửa lỗi lớn nhất của v1: passage và câu hỏi cùng nhìn thấy được',
  body: `
<div class="exam">
    <header class="exam__bar">
        <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Thoát">${icon('cross', 18)}</button>
        <div class="grow" style="min-width:0">
            <span class="t-label truncate" style="display:block">Reading — Passage 1</span>
            <span class="t-micro muted">Câu 1–13 · Matching Headings</span>
        </div>
        <span class="timer" id="timer" role="timer" aria-live="off">${icon('clock', 16)} <span class="mono">18:42</span></span>
        <a class="btn btn--primary btn--sm" href="19-ielts-result.html">Nộp bài</a>
    </header>

    <!-- Mobile: a two-tab switch. Desktop: both panes visible at once. -->
    <div class="exam__tabs only-mobile" role="tablist" aria-label="Chuyển giữa bài đọc và câu hỏi" data-tabs="ex">
        <button role="tab" aria-selected="true" data-tab="ex-passage">${icon('book', 16)} Bài đọc</button>
        <button role="tab" aria-selected="false" data-tab="ex-questions">${icon('target', 16)} Câu hỏi (3/13)</button>
    </div>

    <div class="exam__body">
        <section class="exam__pane exam__pane--passage" data-panel="ex-passage" aria-label="Bài đọc">
            <article class="passage">
                <h2 class="t-h2">The Return of the Urban Bee</h2>
                <p class="t-micro muted">Reading Passage 1 · khoảng 900 từ</p>
                <div class="passage__text prose">
                    <p><span class="passage__para mono">A</span> For most of the twentieth century, the city was assumed to be
                    hostile territory for pollinators. Concrete, traffic and a scarcity of flowering plants were thought to
                    make urban environments a net loss for insect diversity. That assumption has been quietly overturned
                    over the past fifteen years.</p>
                    <p><span class="passage__para mono">B</span> Surveys conducted across a dozen European cities found that
                    certain bee species are <mark>not merely surviving</mark> in urban areas but thriving there, in some cases
                    at higher densities than in the surrounding farmland. The explanation appears to lie in two factors:
                    the diversity of garden planting, and the absence of the monoculture farming that dominates rural land.</p>
                    <p><span class="passage__para mono">C</span> The finding is not universally encouraging, however. The
                    species that benefit tend to be generalists, able to feed on many plant types. Specialist species,
                    which depend on a single plant family, have continued to decline in cities as they have elsewhere.</p>
                    <p class="muted">…</p>
                </div>
            </article>
        </section>

        <section class="exam__pane exam__pane--questions" data-panel="ex-questions" aria-label="Câu hỏi">
            <div class="exam__qhead">
                <span class="t-label">Questions 1–5</span>
                <span class="t-micro muted">Chọn tiêu đề đúng cho mỗi đoạn</span>
            </div>

            <div class="stack g12">
                ${[
                    ['1', 'Đoạn A', ['A challenge to a long-held belief', 'How gardens are designed', 'The economics of farming']],
                    ['2', 'Đoạn B', ['Why cities now suit some bees', 'The decline of farmland', 'Measuring insect populations']],
                ].map(([n, para, opts]) => `
                    <fieldset class="q">
                        <legend class="q__legend"><span class="q__num mono">${n}</span> ${para}</legend>
                        <div class="stack g8" data-group>
                            ${opts.map((o, i) => `
                                <button class="answer" type="button" data-select aria-pressed="${i === 0}" style="min-height:52px">
                                    <span class="answer__key">${'ABC'[i]}</span><span class="grow t-label">${o}</span>
                                </button>`).join('')}
                        </div>
                    </fieldset>`).join('')}
                <p class="t-micro muted" style="text-align:center">Câu 3–13 tiếp theo…</p>
            </div>

            <!-- Navigator: the one place a dense grid is right -->
            <div class="exam__nav">
                <span class="t-micro muted">Điều hướng câu hỏi</span>
                <div class="qn" role="group" aria-label="Điều hướng câu hỏi">
                    ${Array.from({ length: 13 }, (_, i) => {
                        const state = i < 2 ? 'answered' : i === 2 ? 'current' : '';
                        return `<button class="qn__b qn__b--${state || 'idle' || ''}" type="button"
                            ${i === 2 ? 'aria-current="true"' : ''} aria-label="Câu ${i + 1}${state === 'answered' ? ' đã trả lời' : ''}">${i + 1}</button>`;
                    }).join('')}
                </div>
            </div>
        </section>
    </div>
</div>`,
  style: `
.exam { min-height: 100vh; display: flex; flex-direction: column; background: var(--canvas); }
.exam__bar { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: var(--surface); border-bottom: 2px solid var(--border); position: sticky; top: 0; z-index: 15; }
.timer { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--r-control); background: var(--surface-alt); color: var(--ink-soft); }
.timer--warn { background: var(--wrong-soft); color: var(--wrong); }
.exam__tabs { display: flex; gap: 6px; padding: 8px 12px; background: var(--surface); border-bottom: 2px solid var(--border); }
.exam__tabs [role='tab'] { flex: 1; min-height: 42px; border: 0; border-radius: var(--r-sm); background: var(--surface-alt); color: var(--ink-muted); font-weight: 700; font-size: .875rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.exam__tabs [role='tab'][aria-selected='true'] { background: var(--teal); color: var(--on-teal); }
.exam__body { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 0; min-height: 0; }
.exam__pane { overflow-y: auto; padding: 20px; }
.exam__pane--passage { border-right: 2px solid var(--border); background: var(--surface); }
.exam__pane--questions { background: var(--canvas); display: flex; flex-direction: column; gap: 16px; }
.exam__qhead { display: flex; flex-direction: column; gap: 2px; }
.passage { max-width: 68ch; }
.passage__text p { margin-top: 14px; }
.passage__para { color: var(--teal); margin-right: 8px; }
.passage mark { background: color-mix(in srgb, var(--amber) 46%, transparent); color: inherit; border-radius: 3px; }
.q { border: 0; padding: 0; margin: 0; }
.q__legend { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: .9375rem; padding: 0 0 8px; }
.q__num { width: 26px; height: 26px; display: grid; place-items: center; border-radius: var(--r-sm); background: var(--teal); color: var(--on-teal); font-size: .75rem; }
.answer[aria-pressed='true'] { border-color: var(--teal); background: var(--teal-soft); box-shadow: 0 4px 0 0 var(--teal-strong); }
.answer[aria-pressed='true'] .answer__key { border-color: var(--teal); color: var(--teal); }
.exam__nav { margin-top: auto; padding-top: 16px; border-top: 2px solid var(--border); }
.qn { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.qn__b { width: 40px; height: 40px; border-radius: var(--r-sm); border: 2px solid var(--border); background: var(--surface); color: var(--ink-muted); font-weight: 700; font-size: .8125rem; cursor: pointer; }
.qn__b--answered { background: var(--correct-soft); border-color: var(--correct); color: var(--correct); }
.qn__b--current { background: var(--teal); border-color: var(--teal); color: var(--on-teal); }
@media (max-width: 1023px) {
    .exam__body { grid-template-columns: 1fr; }
    .exam__pane { padding: 16px 14px 110px; }
    .exam__pane--passage { border-right: 0; }
    .exam__pane[hidden] { display: none; }
    .exam__nav { position: sticky; bottom: 0; background: var(--surface); margin: 0 -14px -110px; padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px)); border-top: 2px solid var(--border); }
}
@media (min-width: 1024px) { .exam__pane { padding: 24px; } }
`,
},

/* ==================================================================== 19 */
'19-ielts-result': { file: '19-ielts-result.html', title: 'Kết quả IELTS', subtitle: 'Band theo kỹ năng + review', group: 'IELTS',
  note: 'Band là ước tính luyện tập, không phải điểm thi thật', body: wrap('practice', `
<header class="shell__header">
    <a class="btn btn--ghost btn--icon btn--sm" href="16-ielts-list.html" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Kết quả · Cambridge 19 Test 1</h1>
    <p class="t-micro muted">Nộp lúc 15:04 · 76 phút</p></div>
    <button class="btn btn--ghost btn--sm" type="button">${icon('chart', 16)} Chia sẻ</button>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <section class="card card--hero pad-x result-hero">
        <div data-lexi="celebrate" data-size="lg" data-label="Lexi ăn mừng"></div>
        <div class="grow">
            <span class="t-micro muted">Band ước tính</span>
            <div class="row g12 baseline">
                <span class="t-display" style="font-family:var(--font-mono);color:var(--teal)">6.5</span>
                <span class="chip chip--correct">${icon('chart', 14)} +0.5 so với lần trước</span>
            </div>
            <p class="t-body soft">Listening tốt hơn Reading rõ rệt. Phần Matching Headings kéo điểm Reading xuống.</p>
        </div>
    </section>

    <div class="grid g-4" style="margin-top:16px">
        ${[['Listening', '7.0', 82, 'headphones'], ['Reading', '6.0', 66, 'book']].map(([k, b, pct, ic]) => `
            <article class="card card--edge pad-x">
                <div class="row g8" style="color:var(--teal)">${icon(ic, 18)}<span class="t-label">${k}</span></div>
                <div class="row g8 baseline" style="margin-top:8px"><span class="stat__value">${b}</span><span class="t-micro muted">/ 9.0</span></div>
                <div style="margin-top:10px">${bar(pct)}</div>
                <span class="t-micro muted" style="display:block;margin-top:6px">Đúng ${Math.round(pct * 0.4)}/40 câu</span>
            </article>`).join('')}
        ${stat('76', 'Phút làm bài', '', 'clock')}
        ${stat('+180', 'XP nhận được', 'amber', 'star')}
    </div>

    <div class="result-cols2">
        <section class="card card--edge pad-x">
            <div class="between">
                <h2 class="t-h3">Review đáp án</h2>
                <div class="segmented" role="group" aria-label="Lọc câu">
                    <button aria-pressed="true">Sai (7)</button>
                    <button aria-pressed="false">Tất cả (40)</button>
                </div>
            </div>
            <ul class="stack g12" style="margin-top:14px">
                ${[
                    ['3', 'Matching Headings', 'Đáp án đúng: B — Why cities now suit some bees', 'Bạn chọn: C — Measuring insect populations'],
                    ['7', 'True / False / Not Given', 'Đáp án đúng: NOT GIVEN', 'Bạn chọn: FALSE'],
                    ['11', 'Matching Headings', 'Đáp án đúng: D — A partial picture', 'Bạn chọn: A — A challenge to a belief'],
                ].map(([n, type, right, wrong]) => `
                    <li class="rowbox">
                        <div class="row g8"><span class="q__num mono">${n}</span><span class="t-micro muted">${type}</span></div>
                        <p class="t-body" style="margin-top:8px;color:var(--correct)">${icon('check', 16)} ${right}</p>
                        <p class="t-body" style="color:var(--wrong)">${icon('cross', 16)} ${wrong}</p>
                        <div class="row g8" style="margin-top:10px">
                            <button class="btn btn--ghost btn--sm" type="button">${icon('book', 14)} Đọc lại đoạn B</button>
                            <button class="btn btn--ghost btn--sm" type="button">${icon('chat', 14)} Hỏi Lexi</button>
                        </div>
                    </li>`).join('')}
            </ul>
        </section>

        <div class="stack g16">
            <section class="card card--edge pad-x">
                <div class="row g12"><span data-lexi="explain" data-size="sm"></span>
                    <div><h2 class="t-h3">Lexi nhận xét</h2>
                    <p class="t-body soft" style="margin-top:4px">Bạn mất nhiều thời gian ở đoạn A và chọn tiêu đề theo từ khoá trùng lặp. Thử đọc câu chủ đề của mỗi đoạn trước.</p></div>
                </div>
                <a class="btn btn--primary btn--sm btn--block" style="margin-top:12px" href="15-review.html">Luyện dạng này</a>
            </section>

            <section class="card card--edge pad-x">
                <h2 class="t-h3">Transcript Listening</h2>
                <p class="t-micro muted">Đã mở khoá vì bạn đã nộp bài</p>
                <div class="transcript" style="margin-top:10px">
                    <p><span class="mono muted">00:12</span> Good morning, and welcome to the city transport museum.</p>
                    <p><span class="mono muted">00:19</span> The museum was founded in 1987 by a group of retired drivers…</p>
                </div>
                <button class="btn btn--ghost btn--sm btn--block" style="margin-top:10px" type="button">Xem toàn bộ transcript</button>
            </section>
        </div>
    </div>
</main>`),
  style: `
.result-hero { display: flex; gap: 20px; align-items: center; }
@media (max-width: 639px) { .result-hero { flex-direction: column; text-align: center; } }
.result-cols2 { display: grid; grid-template-columns: 1.2fr .8fr; gap: 16px; margin-top: 16px; }
@media (max-width: 1023px) { .result-cols2 { grid-template-columns: 1fr; } }
.transcript p { font-size: .875rem; color: var(--ink-soft); margin-top: 8px; line-height: 1.6; }
.q__num { width: 26px; height: 26px; display: grid; place-items: center; border-radius: var(--r-sm); background: var(--teal); color: var(--on-teal); font-size: .75rem; }
` },

/* ==================================================================== 20 */
'20-ielts-history': { file: '20-ielts-history.html', title: 'Lịch sử thi IELTS', subtitle: 'Tiến bộ theo thời gian', group: 'IELTS',
  note: 'Chart + danh sách, không dùng bảng cuộn ngang', body: wrap('practice', `
<header class="shell__header">
    <a class="btn btn--ghost btn--icon btn--sm" href="16-ielts-list.html" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Lịch sử thi</h1>
    <p class="t-micro muted">8 bài · band trung bình 5.9</p></div>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <section class="card card--edge pad-x">
        <div class="between"><h2 class="t-h3">Band theo thời gian</h2><span class="t-micro muted">8 tuần gần nhất</span></div>
        <div class="chart" role="img" aria-label="Biểu đồ band Listening và Reading qua 8 tuần">
            ${[
                ['T1', 5.0, 4.5], ['T2', 5.5, 5.0], ['T3', 5.5, 5.0], ['T4', 6.0, 5.5],
                ['T5', 6.0, 5.5], ['T6', 6.5, 6.0], ['T7', 6.5, 6.0], ['T8', 7.0, 6.0],
            ].map(([w, l, r]) => `
                <div class="chart__col">
                    <div class="chart__bars">
                        <span class="chart__b" style="height:${l / 9 * 100}%;background:var(--teal)" title="Listening ${l}"></span>
                        <span class="chart__b" style="height:${r / 9 * 100}%;background:var(--amber)" title="Reading ${r}"></span>
                    </div>
                    <span class="t-micro muted">${w}</span>
                </div>`).join('')}
        </div>
        <div class="row g16" style="justify-content:center;margin-top:8px">
            <span class="row g8 t-micro"><span class="dot" style="background:var(--teal)"></span> Listening</span>
            <span class="row g8 t-micro"><span class="dot" style="background:var(--amber)"></span> Reading</span>
        </div>
    </section>

    <section class="card card--edge" style="margin-top:16px;overflow:hidden">
        <div class="pad-x" style="padding-bottom:0"><h2 class="t-h3">Các bài đã làm</h2></div>
        <ul class="stack" style="padding:12px 16px">
            ${[
                ['Cambridge 19 — Test 1', '13/10/2026', '6.5', '+180 XP'],
                ['Cambridge 18 — Test 4', '08/10/2026', '6.0', '+150 XP'],
                ['Reading Practice — Education', '05/10/2026', '6.5', '+90 XP'],
                ['Cambridge 17 — Test 2', '01/10/2026', '5.5', '+140 XP'],
            ].map(([t, d, b, xp]) => `
                <li style="border-bottom:2px solid var(--border)">
                    <a class="row g12 wrap" href="19-ielts-result.html" style="color:inherit;padding:14px 0">
                        <span class="grow"><strong class="t-label" style="display:block">${t}</strong>
                        <span class="t-micro muted">${d} · ${xp}</span></span>
                        <span class="band">${b}</span>
                        ${icon('arrowRight', 16)}
                    </a>
                </li>`).join('')}
        </ul>
    </section>
</main>`),
  style: `
.chart { display: grid; grid-template-columns: repeat(8, 1fr); gap: 10px; height: 200px; align-items: end; margin-top: 16px; }
.chart__col { display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
.chart__bars { display: flex; align-items: flex-end; gap: 3px; height: 100%; width: 100%; justify-content: center; }
.chart__b { width: 12px; border-radius: 4px 4px 2px 2px; display: block; }
.dot { width: 10px; height: 10px; border-radius: 999px; display: inline-block; }
` },

/* ==================================================================== 21 */
'21-writing-list': { file: '21-writing-list.html', title: 'Writing — danh sách', subtitle: 'Task 1 / Task 2', group: 'IELTS',
  note: 'Nêu rõ chấm bất đồng bộ và có trạng thái chờ', body: wrap('practice', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Luyện Writing</h1>
    <p class="t-micro muted">AI chấm theo 4 tiêu chí IELTS · tốn 1 credit mỗi bài</p></div>
    <a class="btn btn--ghost btn--sm" href="23-writing-result.html">${icon('clock', 16)} Bài đã chấm</a>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <div class="segmented" role="group" aria-label="Loại task" style="margin-bottom:16px">
        <button aria-pressed="true">Tất cả</button>
        <button aria-pressed="false">Task 1</button>
        <button aria-pressed="false">Task 2</button>
    </div>

    <div class="grid g-3">
        ${[
            ['Task 2', 'Some people think governments should spend money on public transport rather than roads. Discuss.', 'Essay · 250 từ', '40 phút', 'done'],
            ['Task 1', 'The bar chart shows the percentage of households with internet access in five countries.', 'Report · 150 từ', '20 phút', 'grading'],
            ['Task 2', 'Many people believe that university education should be free. To what extent do you agree?', 'Essay · 250 từ', '40 phút', ''],
            ['Task 1', 'The diagram illustrates the process of recycling aluminium cans.', 'Report · 150 từ', '20 phút', ''],
            ['Task 2', 'International tourism has grown rapidly. Is this a positive or negative development?', 'Essay · 250 từ', '40 phút', ''],
            ['Task 2', 'Some argue that children should start school at a very early age. Discuss both views.', 'Essay · 250 từ', '40 phút', ''],
        ].map(([type, prompt, meta, time, state]) => `
            <article class="card card--edge pad-x">
                <div class="between">
                    <span class="chip ${type === 'Task 2' ? 'chip--teal' : 'chip--amber'}">${type}</span>
                    ${state === 'done' ? '<span class="band">6.5</span>' : ''}
                    ${state === 'grading' ? `<span class="chip chip--amber">${icon('clock', 14)} Đang chấm</span>` : ''}
                </div>
                <p class="t-body" style="margin-top:12px">${prompt}</p>
                <p class="t-micro muted" style="margin-top:8px">${meta} · ${time}</p>
                <a class="btn btn--${state ? 'ghost' : 'primary'} btn--sm btn--block" style="margin-top:14px"
                   href="${state === 'done' ? '23-writing-result.html' : '22-writing-take.html'}">
                    ${state === 'done' ? 'Xem bài đã chấm' : state === 'grading' ? 'Xem trạng thái' : 'Viết bài'}
                </a>
            </article>`).join('')}
    </div>
</main>`) },

/* ==================================================================== 22 */
'22-writing-take': { file: '22-writing-take.html', title: 'Writing — phòng viết', subtitle: 'Prompt + editor', group: 'IELTS',
  note: 'Đếm từ, cảnh báo thiếu từ, lưu nháp tự động', shell: true, body: `
<div class="write">
    <header class="exam__bar">
        <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Thoát">${icon('cross', 18)}</button>
        <div class="grow" style="min-width:0"><span class="t-label truncate" style="display:block">Writing Task 2 — Public transport</span>
        <span class="t-micro muted">Tối thiểu 250 từ · khuyến nghị 40 phút</span></div>
        <span class="timer">${icon('clock', 16)}<span class="mono">27:15</span></span>
        <span class="chip chip--teal hide-lg">${icon('coin', 14)} 1 credit</span>
    </header>

    <div class="write__body">
        <section class="write__prompt" aria-label="Đề bài">
            <span class="chip chip--outline">Task 2 · Essay</span>
            <h2 class="t-h3" style="margin-top:12px">Some people think governments should spend money on public transport rather than on new roads.</h2>
            <p class="t-body soft" style="margin-top:8px">Discuss both views and give your own opinion.</p>
            <div class="hr" style="margin:16px 0"></div>
            <h3 class="t-label">Tiêu chí chấm</h3>
            <ul class="stack g8" style="margin-top:8px">
                ${['Task Response', 'Coherence &amp; Cohesion', 'Lexical Resource', 'Grammatical Range'].map((c) => `
                    <li class="row g8 t-micro soft">${icon('check', 14)} ${c}</li>`).join('')}
            </ul>
            <div class="hr" style="margin:16px 0"></div>
            <div class="row g8"><span data-lexi="explain" data-size="xs"></span>
                <p class="t-micro soft">Mẹo: mỗi đoạn thân bài nên có một câu chủ đề rõ ràng.</p></div>
        </section>

        <section class="write__editor" aria-label="Bài viết">
            <label class="field" style="height:100%">
                <span class="sr-only">Bài viết của bạn</span>
                <textarea class="textarea" style="min-height:380px;height:100%">It is often argued that public money would be better spent on public transport than on building new roads. While I accept that road expansion can relieve congestion in the short term, I believe that investment in public transport produces greater long-term benefits for both the environment and social equality.

On the one hand, supporters of road building point out that…</textarea>
            </label>
            <div class="write__meta">
                <span class="t-micro muted">Tự động lưu lúc 15:42</span>
                <div class="grow"></div>
                <span class="chip chip--amber" id="wc">${icon('pen', 14)} 142 / 250 từ</span>
            </div>
            <div class="row g12 hide-lg" style="justify-content:flex-end">
                <button class="btn btn--ghost" type="button">Lưu nháp</button>
                <a class="btn btn--primary" href="23-writing-result.html">${icon('sparkle', 18)} Nộp bài để AI chấm</a>
            </div>
        </section>
    </div>

    <footer class="write__foot hide-lg">
        <div class="row g12" style="max-width:1240px;margin-inline:auto;width:100%">
            <span class="t-micro muted grow">Nộp bài sẽ tốn 1 credit và cần khoảng 30–60 giây để chấm.</span>
            <a class="btn btn--primary" href="23-writing-result.html">Nộp bài · ${icon('coin', 14)} 1 credit</a>
        </div>
    </footer>
</div>`,
  style: `
.write { min-height: 100vh; display: flex; flex-direction: column; background: var(--canvas); }
.write__body { flex: 1; display: grid; grid-template-columns: 380px 1fr; gap: 0; min-height: 0; }
.write__prompt { padding: 24px; background: var(--surface); border-right: 2px solid var(--border); overflow-y: auto; }
.write__editor { padding: 20px 24px; display: flex; flex-direction: column; gap: 10px; }
.write__meta { display: flex; align-items: center; gap: 12px; }
.write__foot { padding: 12px 24px calc(12px + env(safe-area-inset-bottom, 0px)); background: var(--surface); border-top: 2px solid var(--border); }
@media (max-width: 1023px) {
    .write__body { grid-template-columns: 1fr; }
    .write__prompt { border-right: 0; border-bottom: 2px solid var(--border); padding: 16px 14px; }
    .write__editor { padding: 14px; padding-bottom: 90px; }
}
` },

/* ==================================================================== 23 */
'23-writing-result': { file: '23-writing-result.html', title: 'Writing — bài đã chấm', subtitle: '4 tiêu chí + sửa lỗi', group: 'IELTS',
  note: 'Phản hồi gắn với câu cụ thể trong bài', body: wrap('practice', `
<header class="shell__header">
    <a class="btn btn--ghost btn--icon btn--sm" href="21-writing-list.html" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Writing Task 2 — Public transport</h1>
    <p class="t-micro muted">Nộp 13/10/2026 · 268 từ</p></div>
    <button class="btn btn--ghost btn--sm" type="button">${icon('pen', 16)} Viết lại</button>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <section class="card card--hero pad-x result-hero">
        <div class="grow">
            <span class="t-micro muted">Band ước tính</span>
            <div class="row g12 baseline"><span class="t-display" style="font-family:var(--font-mono);color:var(--teal)">6.5</span>
            <span class="chip chip--correct">${icon('chart', 14)} +1.0 so với bài trước</span></div>
            <p class="t-body soft">Lập luận rõ và có ví dụ. Lỗi chính là lặp từ và một số câu quá dài.</p>
        </div>
        <div data-lexi="happy" data-size="lg" data-label="Lexi"></div>
    </section>

    <div class="grid g-4" style="margin-top:16px">
        ${[['Task Response', '6.5', 72], ['Coherence &amp; Cohesion', '7.0', 78], ['Lexical Resource', '6.0', 66], ['Grammatical Range', '6.5', 72]].map(([k, b, pct]) => `
            <article class="card card--edge pad-x">
                <span class="t-label">${k}</span>
                <div class="row g8 baseline" style="margin-top:8px"><span class="stat__value">${b}</span><span class="t-micro muted">/ 9.0</span></div>
                <div style="margin-top:10px">${bar(pct)}</div>
            </article>`).join('')}
    </div>

    <div class="wc-cols">
        <section class="card card--edge pad-x">
            <h2 class="t-h3">Bài của bạn, kèm nhận xét</h2>
            <div class="annot" style="margin-top:12px">
                <p class="t-body">It is often argued that public money would be better spent on public transport than on building new roads.
                <span class="annot__tag annot__tag--good">${icon('check', 12)} Câu chủ đề rõ</span></p>
                <p class="t-body">While I accept that road expansion can relieve congestion in the short term, I believe that investment in public transport produces
                <span class="hl" data-note="Trạng từ chỉ mức độ giúp lập luận chặt hơn.">greater</span> long-term benefits for both the environment and social equality.</p>
                <p class="t-body">On the one hand, supporters of road building point out that
                <span class="hl hl--bad" data-note="Câu quá dài (38 từ) và thiếu động từ chính. Tách thành 2 câu.">the construction of additional lanes may reduce journey times for drivers in the short term although it frequently induces new demand which eventually returns traffic to its previous level of congestion and sometimes worse than before</span>.</p>
                <div class="hr" style="margin:14px 0"></div>
                <p class="t-body muted">…</p>
            </div>
            <div class="row g8 wrap" style="margin-top:14px">
                <span class="chip chip--correct">${icon('check', 14)} Câu chủ đề rõ</span>
                <span class="chip chip--wrong">${icon('cross', 14)} 3 câu quá dài</span>
                <span class="chip chip--amber">${icon('sparkle', 14)} 5 từ lặp</span>
            </div>
        </section>

        <div class="stack g16">
            <section class="card card--edge pad-x">
                <h2 class="t-h3">Sửa lỗi cụ thể</h2>
                <ul class="stack g12" style="margin-top:12px">
                    ${[
                        ['Lặp từ', '"important" xuất hiện 3 lần', 'Thử: crucial, vital, significant'],
                        ['Câu quá dài', 'Câu 3 dài 38 từ', 'Tách thành 2 câu, mỗi câu một ý'],
                        ['Mạo từ', '"in the short term" thiếu "the" ở câu 2', 'Thêm "the" trước "short term"'],
                    ].map(([t, d, fix]) => `
                        <li class="rowbox">
                            <span class="chip chip--amber">${t}</span>
                            <p class="t-micro soft" style="margin-top:8px">${d}</p>
                            <p class="t-micro" style="margin-top:4px;color:var(--correct)">${icon('arrowRight', 12)} ${fix}</p>
                        </li>`).join('')}
                </ul>
            </section>
            <div class="row g8">
                <a class="btn btn--primary grow" href="22-writing-take.html">Viết lại bài này</a>
                <a class="btn btn--ghost" href="21-writing-list.html">Bài khác</a>
            </div>
        </div>
    </div>
</main>`),
  style: `
.result-hero { display: flex; gap: 20px; align-items: center; }
@media (max-width: 639px) { .result-hero { flex-direction: column; text-align: center; } }
.wc-cols { display: grid; grid-template-columns: 1.25fr .75fr; gap: 16px; margin-top: 16px; }
@media (max-width: 1023px) { .wc-cols { grid-template-columns: 1fr; } }
.annot p { margin-top: 12px; }
.annot__tag { display: inline-flex; align-items: center; gap: 4px; font-size: .75rem; font-weight: 700; padding: 2px 8px; border-radius: var(--r-chip); background: var(--correct-soft); color: var(--correct); margin-left: 4px; }
.hl { background: color-mix(in srgb, var(--amber) 40%, transparent); border-bottom: 2px solid var(--attention); border-radius: 2px; cursor: help; }
.hl--bad { background: var(--wrong-soft); border-bottom-color: var(--wrong); }
` },

/* ==================================================================== 24 */
'24-speaking-list': { file: '24-speaking-list.html', title: 'Speaking — chủ đề', subtitle: 'Part 1/2/3 + conversation', group: 'IELTS',
  note: 'Yêu cầu micro được nói rõ trước khi bắt đầu', body: wrap('practice', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Luyện Speaking</h1>
    <p class="t-micro muted">Ghi âm và phân tích phát âm, độ trôi chảy</p></div>
    <a class="btn btn--ghost btn--sm" href="26-speaking-result.html">${icon('clock', 16)} Bài đã làm</a>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <div class="card card--flat pad row g12" style="margin-bottom:16px">
        <span style="color:var(--teal)">${icon('mic', 20)}</span>
        <p class="t-micro soft grow">Speaking cần quyền truy cập micro và kết nối bảo mật (HTTPS). Trình duyệt sẽ hỏi bạn ở lần ghi đầu tiên.</p>
    </div>

    <div class="pills" style="margin-bottom:16px">
        <a class="pill" href="24-speaking-list.html" aria-current="page">${icon('target', 16)} Theo chủ đề</a>
        <a class="pill" href="27-custom-speaking.html">${icon('chat', 16)} Hội thoại AI</a>
        <a class="pill" href="25-speaking-take.html">${icon('play', 16)} Đề ngẫu nhiên</a>
    </div>

    <h2 class="t-h3" style="margin-bottom:12px">Part 2 — Cue card</h2>
    <div class="grid g-3">
        ${[
            ['Describe a place you like to visit', 'Part 2 · 2 phút nói', 0, ''],
            ['Describe a person who influenced you', 'Part 2 · 2 phút nói', 6.0, '78'],
            ['Describe a skill you want to learn', 'Part 2 · 2 phút nói', 0, ''],
            ['Describe an important decision', 'Part 2 · 2 phút nói', 6.5, '85'],
            ['Describe a book you enjoyed', 'Part 2 · 2 phút nói', 0, ''],
            ['Describe a time you helped someone', 'Part 2 · 2 phút nói', 5.5, '68'],
        ].map(([t, meta, band, score]) => `
            <article class="card card--edge pad-x">
                <div class="between">
                    <span class="chip chip--outline">Cue card</span>
                    ${band ? `<span class="band">${band}</span>` : ''}
                </div>
                <h3 class="t-h3" style="margin-top:12px">${t}</h3>
                <p class="t-micro muted">${meta}</p>
                ${score ? `<div style="margin-top:10px">${bar(score)}</div>` : ''}
                <a class="btn btn--${band ? 'ghost' : 'primary'} btn--sm btn--block" style="margin-top:14px"
                   href="${band ? '26-speaking-result.html' : '25-speaking-take.html'}">${band ? 'Xem kết quả' : 'Bắt đầu nói'}</a>
            </article>`).join('')}
    </div>
</main>`) },

/* ==================================================================== 25 */
'25-speaking-take': { file: '25-speaking-take.html', title: 'Speaking — ghi âm', subtitle: 'Sóng âm · đồng hồ', group: 'IELTS',
  note: 'Trạng thái ghi rõ ràng, có nút dừng to', shell: true, body: `
<div class="spk">
    <header class="exam__bar">
        <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Thoát">${icon('cross', 18)}</button>
        <div class="grow" style="min-width:0"><span class="t-label truncate" style="display:block">Speaking Part 2</span>
        <span class="t-micro muted">Describe a place you like to visit</span></div>
        <span class="chip chip--wrong" id="recstate">${icon('mic', 14)} Đang ghi âm</span>
    </header>

    <main class="spk__main" id="main">
        <section class="card card--hero pad-x spk__cue">
            <span class="chip chip--outline">Cue card</span>
            <h1 class="t-h2" style="margin-top:12px">Describe a place you like to visit.</h1>
            <p class="t-body soft" style="margin-top:6px">You should say:</p>
            <ul class="stack g8" style="margin-top:8px">
                ${['where it is', 'how often you go there', 'what you do there', 'and explain why you like it'].map((t) => `
                    <li class="row g8 t-body"><span style="color:var(--teal)">${icon('arrowRight', 14)}</span>${t}</li>`).join('')}
            </ul>
            <div class="row g8" style="margin-top:14px">
                <span class="chip">1 phút chuẩn bị</span><span class="chip">2 phút nói</span>
            </div>
        </section>

        <section class="card card--edge pad-x spk__rec" aria-live="polite">
            <div class="row g16">
                <span data-lexi="thinking" data-size="md" data-label="Lexi đang lắng nghe"></span>
                <div class="grow">
                    <span class="t-micro muted">Đang ghi âm</span>
                    <div class="mono" style="font-size:2.5rem;line-height:1.1" id="clock">01:14</div>
                    <div class="wave" aria-hidden="true">
                        ${Array.from({ length: 48 }, (_, i) => {
                            const h = [18, 34, 52, 70, 44, 26, 60, 82, 48, 30, 66, 40][i % 12];
                            return `<span style="height:${h}%"></span>`;
                        }).join('')}
                    </div>
                    <p class="t-micro muted">Còn 46 giây. Nói tự nhiên, đừng lo lỗi nhỏ.</p>
                </div>
            </div>

            <div class="row g12" style="justify-content:center;margin-top:20px">
                <button class="btn btn--ghost" type="button">${icon('pause', 18)} Tạm dừng</button>
                <a class="btn btn--primary btn--lg" href="26-speaking-result.html">${icon('check', 18)} Dừng &amp; chấm điểm</a>
            </div>
        </section>

        <div class="row g8" style="justify-content:center">
            <button class="btn btn--ghost btn--sm" type="button">Ghi lại từ đầu</button>
            <button class="btn btn--ghost btn--sm" type="button">Nghe lại đoạn vừa nói</button>
        </div>
    </main>
</div>`,
  style: `
.spk { min-height: 100vh; display: flex; flex-direction: column; background: var(--canvas); }
.spk__main { flex: 1; width: 100%; max-width: 760px; margin-inline: auto; padding: 20px 16px 40px; display: flex; flex-direction: column; gap: 16px; }
.spk__cue { text-align: left; }
.spk__rec { text-align: left; }
.wave { display: flex; align-items: center; gap: 3px; height: 68px; margin-top: 14px; }
.wave span { flex: 1; border-radius: 999px; background: var(--teal); min-height: 6px; }
@media (prefers-reduced-motion: no-preference) {
    .wave span { animation: wv 1.4s ease-in-out infinite; }
    .wave span:nth-child(3n) { animation-delay: .12s; }
    .wave span:nth-child(4n) { animation-delay: .24s; }
    .wave span:nth-child(5n) { animation-delay: .36s; }
}
@keyframes wv { 0%,100% { transform: scaleY(.55); } 50% { transform: scaleY(1); } }
` },

/* ==================================================================== 26 */
'26-speaking-result': { file: '26-speaking-result.html', title: 'Speaking — kết quả', subtitle: 'Band + analytics giọng nói', group: 'IELTS',
  note: 'Số liệu giọng nói thật, không phóng đại', body: wrap('practice', `
<header class="shell__header">
    <a class="btn btn--ghost btn--icon btn--sm" href="24-speaking-list.html" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Speaking — Describe a place</h1>
    <p class="t-micro muted">1 phút 58 giây · 214 từ</p></div>
    <button class="btn btn--ghost btn--sm" type="button">${icon('headphones', 16)} Nghe lại</button>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <section class="card card--hero pad-x result-hero">
        <div data-lexi="happy" data-size="lg" data-label="Lexi"></div>
        <div class="grow">
            <span class="t-micro muted">Band ước tính</span>
            <div class="row g12 baseline"><span class="t-display" style="font-family:var(--font-mono);color:var(--teal)">6.0</span>
                <span class="chip chip--teal">${icon('chart', 14)} Trôi chảy hơn lần trước</span></div>
            <p class="t-body soft">Bạn nói liền mạch, ít ngập ngừng. Phát âm đuôi từ còn thiếu.</p>
        </div>
    </section>

    <div class="grid g-4" style="margin-top:16px">
        ${[['Fluency', '6.5', 74], ['Lexical Resource', '6.0', 66], ['Grammar', '5.5', 58], ['Pronunciation', '6.0', 64]].map(([k, b, pct]) => `
            <article class="card card--edge pad-x">
                <span class="t-label">${k}</span>
                <div class="row g8 baseline" style="margin-top:8px"><span class="stat__value">${b}</span><span class="t-micro muted">/ 9.0</span></div>
                <div style="margin-top:10px">${bar(pct)}</div>
            </article>`).join('')}
    </div>

    <div class="spk-cols">
        <section class="card card--edge pad-x">
            <h2 class="t-h3">Phân tích giọng nói</h2>
            <ul class="stack g12" style="margin-top:12px">
                ${[
                    ['Tốc độ nói', '142 từ/phút', 'Trong khoảng tự nhiên (120–160)'],
                    ['Thời gian im lặng', '6.2 giây (5%)', 'Chủ yếu ở đầu bài'],
                    ['Từ đệm', '4 lần "um"', 'Giảm bằng cách ngắt câu ngắn'],
                    ['Từ vựng lặp', '3 lần "beautiful"', 'Thử: stunning, picturesque'],
                ].map(([k, v, note]) => `
                    <li class="between wrap g12" style="padding:10px 0;border-bottom:2px solid var(--border)">
                        <span class="t-micro soft">${k}</span>
                        <span class="row g8"><span class="mono">${v}</span><span class="t-micro muted">${note}</span></span>
                    </li>`).join('')}
            </ul>
        </section>

        <section class="card card--edge pad-x">
            <h2 class="t-h3">Transcript</h2>
            <p class="t-micro muted">Có thể có sai sót nhỏ do nhận dạng giọng nói</p>
            <div class="transcript" style="margin-top:10px">
                <p><span class="mono muted">00:00</span> Well, um, the place I would like to talk about is a small coastal town…</p>
                <p><span class="mono muted">00:24</span> I usually go there maybe twice a year with my family, and we always…</p>
                <p><span class="mono muted">00:52</span> The most <span class="hl hl--bad">beautiful</span> thing is the sunset over the harbour…</p>
                <p class="muted">…</p>
            </div>
            <a class="btn btn--primary btn--sm btn--block" style="margin-top:12px" href="25-speaking-take.html">Nói lại chủ đề này</a>
        </section>
    </div>
</main>`),
  style: `
.result-hero { display: flex; gap: 20px; align-items: center; }
@media (max-width: 639px) { .result-hero { flex-direction: column; text-align: center; } }
.spk-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
@media (max-width: 1023px) { .spk-cols { grid-template-columns: 1fr; } }
.transcript p { font-size: .875rem; color: var(--ink-soft); margin-top: 8px; line-height: 1.6; }
.hl--bad { background: var(--wrong-soft); border-bottom: 2px solid var(--wrong); border-radius: 2px; }
` },

/* ==================================================================== 27 */
'27-custom-speaking': { file: '27-custom-speaking.html', title: 'Hội thoại AI tự chọn chủ đề', subtitle: 'Chat · streaming', group: 'IELTS',
  note: 'Credit hiển thị trước, không giật mình', shell: true, body: `
<div class="chat">
    <header class="exam__bar">
        <a class="btn btn--ghost btn--icon btn--sm" href="24-speaking-list.html" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>
        <div class="grow" style="min-width:0"><span class="t-label truncate" style="display:block">Hội thoại AI</span>
        <span class="t-micro muted">Chủ đề: Du lịch bền vững · lượt 4</span></div>
        <span class="chip chip--teal">${icon('coin', 14)} 12 credit</span>
    </header>

    <div class="chat__body" id="main">
        <div class="chat__log" aria-live="polite">
            <div class="msg msg--ai">
                <span data-lexi="explain" data-size="xs"></span>
                <div class="bubble bubble--lexi bubble--left">Chúng ta nói về du lịch bền vững nhé. Theo bạn, du lịch đại chúng gây hại gì cho địa phương?</div>
            </div>
            <div class="msg msg--me">
                <div class="bubble bubble--right">I think it can destroy the environment because too many people visit the same place and it makes a lot of rubbish.</div>
            </div>
            <div class="msg msg--ai">
                <span data-lexi="thinking" data-size="xs"></span>
                <div class="bubble bubble--lexi bubble--left">
                    Ý tốt. Thử dùng <strong>"overtourism"</strong> thay cho "too many people" — tự nhiên hơn trong Writing.
                    <span class="t-micro muted" style="display:block;margin-top:6px">Bạn muốn mình sửa lại cả câu không?</span>
                </div>
            </div>
            <div class="msg msg--me">
                <div class="bubble bubble--right">Yes please, and then ask me the next question.</div>
            </div>
            <div class="msg msg--ai">
                <span data-lexi="explain" data-size="xs"></span>
                <div class="bubble bubble--lexi bubble--left">
                    <em>"Overtourism can damage the environment, as large numbers of visitors generate substantial waste in the same area."</em>
                    <span class="t-micro muted" style="display:block;margin-top:6px">Đang nói…</span>
                </div>
            </div>
        </div>

        <div class="chat__suggest">
            <span class="t-micro muted">Gợi ý</span>
            <div class="row g8 wrap" style="margin-top:6px">
                ${['Cho tôi một câu hỏi khó hơn', 'Sửa lỗi ngữ pháp của tôi', 'Giải thích "overtourism"'].map((s) => `<button class="chip chip--outline" type="button">${s}</button>`).join('')}
            </div>
        </div>

        <form class="chat__input" onsubmit="return false">
            <button class="btn btn--ghost btn--icon" type="button" aria-label="Ghi âm">${icon('mic', 20)}</button>
            <label class="grow"><span class="sr-only">Nhập tin nhắn</span>
                <input class="input" placeholder="Nhập câu trả lời hoặc bấm micro để nói…" /></label>
            <button class="btn btn--primary" type="submit">${icon('arrowRight', 18)}</button>
        </form>
        <p class="t-micro muted" style="text-align:center;padding-bottom:8px">Mỗi lượt AI tốn 1 credit · còn 12 credit</p>
    </div>
    <div class="chat__bar only-mobile"></div>
</div>`,
  style: `
.chat { min-height: 100vh; display: flex; flex-direction: column; background: var(--canvas); }
.chat__body { flex: 1; width: 100%; max-width: 780px; margin-inline: auto; display: flex; flex-direction: column; padding: 16px; gap: 12px; }
.chat__log { flex: 1; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
.msg { display: flex; gap: 10px; align-items: flex-end; }
.msg--me { justify-content: flex-end; }
.msg .bubble { max-width: min(78%, 520px); }
.chat__input { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 2px solid var(--border-strong); border-radius: var(--r-card); padding: 8px; box-shadow: 0 4px 0 0 var(--border); }
.chat__input .input { border: 0; box-shadow: none; }
.chat__input .input:focus { outline: none; }
.chat__bar { height: calc(var(--shell-tabbar) + env(safe-area-inset-bottom, 0px)); }
` },

/* ==================================================================== 28 */
'28-leaderboard': { file: '28-leaderboard.html', title: 'Bảng xếp hạng', subtitle: 'Podium + hạng của bạn', group: 'Tiến độ',
  note: 'Không phơi 50 người lạ · mặc định tắt, dùng biệt danh', body: wrap('progress', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Bảng xếp hạng</h1>
    <p class="t-micro muted">Tuần 13–19/10 · 1,204 người tham gia</p></div>
    <div class="segmented" role="group" aria-label="Khoảng thời gian">
        <button aria-pressed="true">Tuần</button><button aria-pressed="false">Tháng</button>
    </div>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--focus" id="main">
    <!-- Your own standing first: the only comparison that motivates -->
    <section class="card card--hero pad-x">
        <div class="between wrap g16">
            <div class="row g16">
                <span class="rank">214</span>
                <div>
                    <strong class="t-h3" style="display:block">Minh (bạn)</strong>
                    <span class="t-micro muted">Top 18% tuần này · hạng 214 / 1,204</span>
                </div>
            </div>
            <div class="row g8"><span class="chip chip--amber">${icon('star', 14)} 2,480 XP</span>
                <span class="chip chip--correct">${icon('chart', 14)} ↑ 32 hạng</span></div>
        </div>
        <div class="row g12" style="margin-top:14px">
            <span class="t-micro muted" style="flex:0 0 auto">Bạn</span>${bar(82)}
            <span class="t-micro muted" style="flex:0 0 auto">Top 10%</span>
        </div>
    </section>

    <section class="card card--edge pad-x" style="margin-top:16px">
        <div class="between"><h2 class="t-h3">Ba người dẫn đầu</h2><span class="t-micro muted">Biệt danh công khai</span></div>
        <ol class="podium" style="margin-top:16px">
            ${[['2', 'linh.reads', '3,120'], ['1', 'bao.ielts', '3,840'], ['3', 'thaovy', '2,960']].map(([r, n, xp]) => `
                <li class="podium__i podium__i--${r}">
                    <span class="podium__av">${n.charAt(0).toUpperCase()}</span>
                    <strong class="t-label">${n}</strong>
                    <span class="t-micro muted">${xp} XP</span>
                    <span class="podium__base mono">${r}</span>
                </li>`).join('')}
        </ol>
    </section>

    <section class="card card--edge pad-x" style="margin-top:16px">
        <h2 class="t-h3">Huy hiệu tuần này</h2>
        <p class="t-micro muted">Huy hiệu được chứng minh là có tác dụng thúc đẩy hơn thứ hạng.</p>
        <div class="grid g-auto" style="margin-top:12px">
            ${[
                ['flame', 'Chuỗi 7 ngày', 'done'],
                ['star', '10,000 XP', 'done'],
                ['headphones', 'Nghe 60 phút', '' ],
                ['pen', 'Viết 5 bài', ''],
            ].map(([ic, t, done]) => `
                <div class="rowbox rowbox--center" style="${done ? '' : 'opacity:.62'}">
                    <span style="color:${done ? 'var(--amber)' : 'var(--ink-faint)'}">${icon(ic, 22)}</span>
                    <span class="grow t-micro">${t}</span>
                    ${done ? `<span style="color:var(--correct)">${icon('check', 16)}</span>` : icon('lock', 16)}
                </div>`).join('')}
        </div>
    </section>

    <div class="card card--flat pad row g12" style="margin-top:16px">
        <span style="color:var(--ink-muted)">${icon('shield', 20)}</span>
        <p class="t-micro soft grow">Bảng xếp hạng mặc định tắt. Bạn có thể tắt hoàn toàn hoặc đổi biệt danh bất kỳ lúc nào trong Cài đặt.</p>
        <a class="btn btn--ghost btn--sm" href="35-settings.html">Cài đặt</a>
    </div>
</main>`),
  style: `
.rank { width: 62px; height: 62px; display: grid; place-items: center; border-radius: var(--r-chip); background: var(--teal-soft); color: var(--teal); font-family: var(--font-mono); font-size: 1.375rem; font-weight: 700; }
.podium { display: flex; align-items: flex-end; justify-content: center; gap: 12px; list-style: none; padding: 0; }
.podium__i { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1 1 0; max-width: 160px; }
.podium__av { width: 52px; height: 52px; border-radius: 999px; background: var(--teal); color: var(--on-teal); display: grid; place-items: center; font-weight: 800; font-size: 1.125rem; }
.podium__base { display: grid; place-items: center; width: 100%; border-radius: var(--r-control) var(--r-control) 0 0; background: var(--surface-alt); color: var(--ink-muted); font-weight: 700; }
.podium__i--1 .podium__av { width: 64px; height: 64px; background: var(--amber); color: var(--on-amber); }
.podium__i--1 .podium__base { height: 76px; background: var(--amber-soft); color: var(--attention); }
.podium__i--2 .podium__base { height: 56px; }
.podium__i--3 .podium__base { height: 40px; }
` },

/* ==================================================================== 29 */
'29-weekly-report': { file: '29-weekly-report.html', title: 'Báo cáo tuần', subtitle: 'XP theo ngày + điểm mạnh/yếu', group: 'Tiến độ',
  note: 'Chỉ số đều là dữ liệu luyện tập thật', body: wrap('progress', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Báo cáo tuần</h1>
    <p class="t-micro muted">Tuần 13–19/10/2026</p></div>
    <button class="btn btn--ghost btn--sm" type="button">${icon('clock', 16)} Các tuần trước</button>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <section class="card card--hero pad-x report-head">
        <div data-lexi="excited" data-size="md" data-label="Lexi"></div>
        <div class="grow">
            <h2 class="t-h2">Tuần tốt nhất của bạn trong 2 tháng</h2>
            <p class="t-body soft">Bạn học 6/7 ngày, nhiều hơn tuần trước 2 ngày. Writing vẫn là kỹ năng yếu nhất.</p>
        </div>
        <div class="row g8"><span class="chip chip--amber">${icon('star', 14)} 1,240 XP</span></div>
    </section>

    <div class="grid g-4" style="margin-top:16px">
        ${stat('6/7', 'Ngày có học', 'teal', 'flame')}
        ${stat('148', 'Phút học', '', 'clock')}
        ${stat('9', 'Bài hoàn thành', '', 'check')}
        ${stat('5.9', 'Band trung bình', 'amber', 'chart')}
    </div>

    <section class="card card--edge pad-x" style="margin-top:16px">
        <div class="between"><h2 class="t-h3">XP theo ngày</h2><span class="t-micro muted">Tổng 1,240 XP</span></div>
        <div class="days" role="img" aria-label="XP theo từng ngày trong tuần">
            ${[['T2', 180], ['T3', 240], ['T4', 0], ['T5', 320], ['T6', 160], ['T7', 220], ['CN', 120]].map(([d, v]) => `
                <div class="days__c">
                    <div class="days__track"><span class="days__fill ${v === 0 ? 'days__fill--off' : ''}" style="height:${v / 320 * 100}%"></span></div>
                    <span class="t-micro ${v === 0 ? 'muted' : ''}">${d}</span>
                </div>`).join('')}
        </div>
    </section>

    <div class="rep-cols">
        <section class="card card--edge pad-x">
            <h2 class="t-h3">Theo module</h2>
            <ul class="stack g12" style="margin-top:12px">
                ${[['Từ vựng', '34 từ mới · 82%', 82], ['Listening', '3 section · 78%', 78], ['Reading', '2 passage · 66%', 66], ['Writing', '1 bài · 6.0 band', 60], ['Speaking', '2 bài · 6.0 band', 60]].map(([t, m, pct]) => `
                    <li>
                        <div class="between"><span class="t-label">${t}</span><span class="t-micro muted">${m}</span></div>
                        <div style="margin-top:6px">${bar(pct)}</div>
                    </li>`).join('')}
            </ul>
        </section>

        <div class="stack g16">
            <section class="card card--edge pad-x">
                <h2 class="t-h3">Điểm nổi bật</h2>
                <ul class="stack g12" style="margin-top:12px">
                    ${[
                        ['check', 'Chuỗi 12 ngày — dài nhất từ trước tới nay'],
                        ['chart', 'Reading tăng 0.5 band so với tuần trước'],
                        ['cross', 'Writing chỉ làm 1 bài, ít hơn mục tiêu 2 bài'],
                    ].map(([ic, t]) => `<li class="row g12"><span style="color:var(--${ic === 'cross' ? 'wrong' : ic === 'check' ? 'correct' : 'teal'})">${icon(ic, 18)}</span><span class="t-body">${t}</span></li>`).join('')}
                </ul>
            </section>
            <section class="card card--edge pad-x">
                <h2 class="t-h3">Mục tiêu tuần tới</h2>
                <div class="stack g10" style="margin-top:10px">
                    ${[['Học 6 ngày', true], ['Viết 2 bài Writing', false], ['Ôn hết 128 từ trong sổ tay', false]].map(([t, on]) => `
                        <label class="row g12 t-body" style="min-height:44px"><input type="checkbox" ${on ? 'checked' : ''}/> ${t}</label>`).join('')}
                </div>
                <a class="btn btn--primary btn--sm btn--block" style="margin-top:12px" href="04-home.html">Đưa vào kế hoạch ngày</a>
            </section>
        </div>
    </div>
</main>`),
  style: `
.report-head { display: flex; gap: 16px; align-items: center; }
@media (max-width: 639px) { .report-head { flex-direction: column; text-align: center; } }
.days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; height: 180px; margin-top: 16px; }
.days__c { display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; }
.days__track { flex: 1; width: 100%; max-width: 44px; background: var(--surface-alt); border-radius: var(--r-sm); display: flex; align-items: flex-end; padding: 3px; }
.days__fill { width: 100%; border-radius: var(--r-sm); background: var(--amber); display: block; min-height: 8px; }
.days__fill--off { background: var(--border); min-height: 6px; }
.rep-cols { display: grid; grid-template-columns: 1.1fr .9fr; gap: 16px; margin-top: 16px; }
@media (max-width: 1023px) { .rep-cols { grid-template-columns: 1fr; } }
` },

/* ==================================================================== 30 */
'30-challenges': { file: '30-challenges.html', title: 'Thử thách tuần', subtitle: 'Mục tiêu cộng đồng', group: 'Tiến độ',
  note: 'Không tạo áp lực xã hội · không có đồng hồ đếm ngược đỏ', body: wrap('progress', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Thử thách tuần</h1>
    <p class="t-micro muted">Kết thúc Chủ nhật 19/10 · không bắt buộc</p></div>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--focus" id="main">
    <section class="card card--hero pad-x">
        <div class="between wrap g16">
            <div>
                <span class="chip chip--amber">Đang diễn ra</span>
                <h2 class="t-h2" style="margin-top:10px">Hoàn thành 5 bài Listening trong tuần</h2>
                <p class="t-body soft">3 / 5 bài · còn 3 ngày</p>
            </div>
            <div data-lexi="excited" data-size="md" data-label="Lexi"></div>
        </div>
        <div style="margin-top:16px">${bar(60, 'amber')}</div>
        <div class="row g8" style="margin-top:10px">
            <span class="chip">+300 XP</span><span class="chip">Huy hiệu Tai Thính</span>
        </div>
        <a class="btn btn--primary btn--block" style="margin-top:16px" href="16-ielts-list.html">Làm bài Listening tiếp theo</a>
    </section>

    <section class="card card--edge pad-x" style="margin-top:16px">
        <h2 class="t-h3">Thử thách khác</h2>
        <ul class="stack g12" style="margin-top:12px">
            ${[
                ['Viết 2 bài Writing', '0 / 2', 0, '+400 XP'],
                ['Ôn 100 từ trong sổ tay', '34 / 100', 34, '+250 XP'],
                ['Học 6 ngày trong tuần', '5 / 6', 83, '+350 XP'],
            ].map(([t, p, pct, xp]) => `
                <li class="rowbox rowbox--wrap">
                    <span class="grow"><strong class="t-label" style="display:block">${t}</strong>
                        <span class="t-micro muted">${p}</span>
                        <div style="margin-top:8px;max-width:280px">${bar(pct)}</div></span>
                    <span class="chip chip--amber">${xp}</span>
                </li>`).join('')}
        </ul>
    </section>

    <div class="card card--flat pad row g12" style="margin-top:16px">
        <span style="color:var(--ink-muted)">${icon('shield', 20)}</span>
        <p class="t-micro soft grow">Thử thách không ảnh hưởng đến band hay lộ trình. Bỏ qua cũng không mất gì.</p>
        <a class="btn btn--ghost btn--sm" href="35-settings.html">Tắt thử thách</a>
    </div>
</main>`),
},

/* ==================================================================== 31 */
'31-rewards': { file: '31-rewards.html', title: 'Phần thưởng & nhiệm vụ', subtitle: 'Hai tab · nhiệm vụ và vật phẩm đã mở', group: 'Tiến độ',
  note: 'Hai tab: Nhiệm vụ · Vật phẩm. Tab Đổi thưởng CẦN backend mua/đổi (chưa có endpoint nào) — xem SCREENS-V2 §31.', body: wrap('progress', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Phần thưởng</h1>
    <p class="t-micro muted">Nhiệm vụ và vật phẩm bạn đã mở</p></div>
    <div class="row g8"><span class="chip chip--amber">${icon('coin', 14)} 240</span>
        <span class="chip chip--teal">${icon('star', 14)} 2,480 XP</span></div>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main" data-tabs="rw">
    <div class="segmented" role="tablist" aria-label="Mục" style="margin-bottom:16px">
        <button role="tab" id="rw-mission-tab" aria-controls="rw-mission" aria-selected="true" data-tab="rw-mission">Nhiệm vụ</button>
        <button role="tab" id="rw-inv-tab" aria-controls="rw-inv" aria-selected="false" data-tab="rw-inv">Vật phẩm</button>
    </div>

    <!--
        WHAT THIS TAB MAY AND MAY NOT SHOW — measured against the backend, not assumed.

        UserRewardMissionResponse.rewardDefinitions is a SEALED interface: its only members are
        CREDIT {amount, expiryDays} and INVENTORY_ITEM {itemCode, quantity}. There is no XP reward,
        so xpValueOf in useGamification always returns null and the "+50 XP" chip this mockup used to
        draw had NO SOURCE. Only CREDIT entries can be summed, and a mission with no credit reward
        gets NO chip rather than a "0 credit" chip.

        RewardMissionStatus is LOCKED or CLAIMED and there is no claim route: the backend grants the
        reward when the trigger fires (claimedAt is set by the server). So the "Đã nhận" button that
        used to sit on a finished mission was a control that could only do nothing.

        NOTE FOR WHOEVER EDITS THIS FILE: this comment lives INSIDE a template literal, so a
        backtick anywhere in the prose ends the string. Use plain quotes.
    -->
    <div data-panel="rw-mission" role="tabpanel" aria-labelledby="rw-mission-tab">
        <h2 class="t-h2" style="margin-bottom:12px">Nhiệm vụ đang mở</h2>
        <div class="grid g-3">
            ${[
                ['Học 3 ngày liên tiếp', '3 / 3', 100, 'done', '+2 credit'],
                ['Hoàn thành 5 bài Reading', '3 / 5', 60, '', '+5 credit'],
                ['Đạt 80% bài test từ vựng', '0 / 1', 0, '', ''],
                ['Nói 10 phút trong tuần', '6 / 10', 60, '', '+3 credit'],
                ['Ôn hết từ đến hạn', '12 / 34', 35, '', ''],
                ['Viết 1 bài Task 2', '1 / 1', 100, 'done', '+10 credit'],
            ].map(([t, p, pct, state, credit]) => `
                <article class="card card--edge pad-x">
                    <div class="between">${credit ? `<span class="chip chip--amber">${icon('coin', 14)} ${credit}</span>` : '<span></span>'}
                        ${state === 'done' ? `<span class="chip chip--correct">${icon('check', 14)} Xong</span>` : ''}</div>
                    <h3 class="t-h3" style="margin-top:12px">${t}</h3>
                    <p class="t-micro muted">${p}</p>
                    <div style="margin-top:10px">${bar(pct, state === 'done' ? '' : 'amber')}</div>
                    ${state === 'done'
                        ? `<p class="t-micro muted" style="margin-top:12px">Phần thưởng được cộng tự động</p>`
                        : `<a class="btn btn--primary btn--sm btn--block" style="margin-top:12px" href="04-home.html">Làm ngay</a>`}
                </article>`).join('')}
        </div>
    </div>

    <!--
        INVENTORY. The fields below are the ones UserInventoryItemResponse actually returns:
        item.type, item.usageType, item.name, item.description, item.assetUrl, item.rarity,
        grantSource, grantedAt, equipped, used.

        The filter row is buildable rather than decorative, because inventoryItemType, used and name
        are real query parameters — and it is needed: the list is paginated, and the screen used to
        show the first 8 rows with no way to reach the rest.

        A LOCKED CARD IS GONE. The item catalogue is admin-only (/api/admin/inventory/items), so a
        user's inventory contains only what they own and there is no data behind "Chưa mở".
    -->
    <div data-panel="rw-inv" hidden role="tabpanel" aria-labelledby="rw-inv-tab">
        <div class="between wrap g12" style="margin-bottom:12px">
            <h2 class="t-h2">Vật phẩm của bạn · 12</h2>
            <div class="pills" role="group" aria-label="Lọc vật phẩm">
                <button class="pill" type="button" aria-pressed="true">Tất cả</button>
                <button class="pill" type="button" aria-pressed="false">Huy hiệu</button>
                <button class="pill" type="button" aria-pressed="false">Khung avatar</button>
                <button class="pill" type="button" aria-pressed="false">Thẻ thưởng</button>
            </div>
        </div>
        <div class="grid g-4">
            ${[
                ['Khung avatar: Lá', 'Khung avatar · Đã trang bị', 'shield', true],
                ['Hiệu ứng tên: Sóng', 'Hiệu ứng · Đã mở', 'sparkle', false],
                ['Lexi: Khăn quàng', 'Trang trí · Đã dùng', 'star', false],
                ['Thẻ cộng 5 credit', 'Thẻ thưởng · Đã dùng', 'coin', false],
            ].map(([t, s, ic, equipped]) => `
                <article class="card card--edge pad-x" style="text-align:center">
                    <span style="display:inline-grid;place-items:center;width:64px;height:64px;border-radius:var(--r-card);background:var(--surface-alt);color:var(--teal)">${icon(ic, 28)}</span>
                    <h3 class="t-h3" style="margin-top:12px">${t}</h3>
                    <p class="t-micro muted">${s}</p>
                    ${equipped
                        ? `<button class="btn btn--ghost btn--sm btn--block" style="margin-top:12px" type="button">Bỏ trang bị</button>`
                        : `<button class="btn btn--primary btn--sm btn--block" style="margin-top:12px" type="button">Trang bị</button>`}
                </article>`).join('')}
        </div>
        <div class="row" style="justify-content:center;margin-top:16px">
            <button class="btn btn--ghost" type="button">Tải thêm</button>
        </div>
        <!-- The one product statement the removed shop tab carried, kept because it is a commitment
             rather than a feature: a purchasable streak repair turns encouragement into debt. -->
        <p class="t-micro muted" style="text-align:center;margin-top:12px">
            v2 không bán streak freeze. Ngày nghỉ được tặng tự động, không mua được.
        </p>
    </div>
</main>`),
},

/* ==================================================================== 32 */
'32-credits': { file: '32-credits.html', title: 'Ví credit', subtitle: 'Số dư · bảng phí · lịch sử', group: 'Tiến độ',
  note: 'Bảng phí công khai · nói rõ cái gì miễn phí', body: wrap('progress', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Ví credit</h1>
    <p class="t-micro muted">Credit dùng cho các hành động AI tốn chi phí thật</p></div>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <section class="card card--hero pad-x">
        <div class="between wrap g16">
            <div>
                <span class="t-micro muted">Số dư hiện tại</span>
                <div class="row g12 baseline"><span class="t-display" style="font-family:var(--font-mono);color:var(--teal)">240</span>
                    <span class="t-body muted">credit</span></div>
                <p class="t-micro muted" style="margin-top:6px">8 credit hết hạn vào 31/10/2026</p>
            </div>
            <div class="row g8"><a class="btn btn--primary" href="32-credits.html">Nạp credit</a>
                <a class="btn btn--ghost" href="31-rewards.html">Đổi bằng XP</a></div>
        </div>
    </section>

    <div class="cr-cols">
        <section class="card card--edge pad-x">
            <h2 class="t-h3">Bảng phí theo hành động</h2>
            <ul class="stack" style="margin-top:10px">
                ${[
                    ['Làm đề IELTS (Listening + Reading)', 1, 'IELTS_START'],
                    ['Chấm Writing Task 1 &amp; 2', 1, 'WRITING_START'],
                    ['Chấm Writing Practice', 1, 'WRITING_PRACTICE_START'],
                    ['Hỏi AI Coach (mỗi tin nhắn)', 1, 'AI_CHAT'],
                    ['Tạo bài test từ vựng bằng AI', 2, 'VOCABULARY_TEST_GENERATE'],
                    ['Giải thích từ bằng AI', 1, 'AI_EXPLAIN'],
                    ['Hội thoại Speaking với AI (mỗi lượt)', 1, 'SPEAKING_CONVERSATION'],
                ].map(([label, cost, code]) => `
                    <li class="between wrap g8" style="padding:12px 0;border-bottom:2px solid var(--border)">
                        <span><strong class="t-label" style="display:block">${label}</strong>
                            <span class="t-micro muted mono">${code}</span></span>
                        <span class="chip chip--teal">${icon('coin', 14)} ${cost}</span>
                    </li>`).join('')}
            </ul>
            <div class="verdict" style="margin-top:14px;border-color:var(--correct);background:var(--correct-soft);box-shadow:0 4px 0 0 var(--correct)">
                <span style="color:var(--correct)">${icon('check', 20)}</span>
                <span class="t-micro">Làm đề, sổ tay từ vựng và báo cáo tiến độ <strong>không tốn credit</strong>. Bạn được cấp credit miễn phí đủ cho phần học cốt lõi.</span>
            </div>
        </section>

        <div class="stack g16">
            <section class="card card--edge pad-x">
                <h2 class="t-h3">Lịch sử giao dịch</h2>
                <ul class="stack g8" style="margin-top:10px">
                    ${[
                        ['−1', 'Chấm Writing Task 2', '13/10 15:04'],
                        ['+50', 'Hoàn credit (chấm lỗi)', '13/10 15:06'],
                        ['−1', 'Giải thích từ "mitigate"', '13/10 14:20'],
                        ['−1', 'Làm đề Cambridge 19 Test 1', '13/10 13:40'],
                        ['+100', 'Thưởng chuỗi 7 ngày', '06/10 09:12'],
                    ].map(([amt, label, when]) => `
                        <li class="between wrap g8" style="padding:8px 0;border-bottom:2px solid var(--border)">
                            <span><strong class="t-label" style="display:block">${label}</strong><span class="t-micro muted">${when}</span></span>
                            <span class="mono" style="color:${amt.startsWith('+') ? 'var(--correct)' : 'var(--ink-soft)'}">${amt}</span>
                        </li>`).join('')}
                </ul>
            </section>
            <section class="card card--flat pad-x">
                <h2 class="t-h3">Credit tạm giữ</h2>
                <p class="t-micro soft" style="margin-top:6px">Khi một hành động AI đang chạy, credit được tạm giữ và hoàn lại nếu hành động thất bại. Bạn không bao giờ mất credit vì lỗi hệ thống.</p>
            </section>
        </div>
    </div>
</main>`),
  style: `.cr-cols { display: grid; grid-template-columns: 1.15fr .85fr; gap: 16px; margin-top: 16px; } @media (max-width: 1023px) { .cr-cols { grid-template-columns: 1fr; } }` },

/* =============================================================== 33b · menu */
/**
 * The account block, OPEN.
 *
 * A specimen frame rather than a variant of one screen, because this panel is shell furniture: it
 * is reachable from every screen in the product, from the same 44px avatar button, so reviewing it
 * once beside the account screens is reviewing it everywhere. It exists because the top-right of
 * the header had NEVER been drawn — `headerRight` was a `shell()` parameter no screen passed — and
 * the app filled the gap with a letter and a link, with no real avatar, no account menu and no
 * membership, even though `/auth/me` already returns all three.
 *
 * WHAT THE ROWS ARE AND WHERE THEY GO is the content, because the point of the frame is to fix the
 * anatomy: identity (who), membership (what plan, until when), the three account destinations, then
 * sign-out on its own.
 */
'33b-account-menu': { file: '33b-account-menu.html', title: 'Menu tài khoản (đang mở)', subtitle: 'Avatar · hạng · điều hướng tài khoản', group: 'Tài khoản',
  note: 'Disclosure, không phải role=menu: panel chỉ có link nên không hứa điều hướng bằng phím mũi tên', body: wrap('account', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Menu tài khoản</h1>
    <p class="t-micro muted">Mở từ avatar ở góc phải, giống nhau trên mọi màn</p></div>
    ${accountHeader({ open: true, unread: 3, initial: 'M', tier: 'Premium' })}
</header>
<main class="shell__content shell__content--focus" id="main">
    <section class="card card--edge pad-x">
        <h2 class="t-h3">Trong panel có gì</h2>
        <ul class="stack g12" style="margin-top:12px">
            <li><strong class="t-label">Danh tính</strong><p class="t-body muted">Avatar thật (hoặc chữ cái đầu khi tài khoản chưa có ảnh), tên hiển thị, email.</p></li>
            <li><strong class="t-label">Hạng thành viên</strong><p class="t-body muted">Tier và ngày hết hạn. Hạng là thông tin, KHÔNG khoá tính năng nào — cùng nguyên tắc với level.</p></li>
            <li><strong class="t-label">Ba điểm đến</strong><p class="t-body muted">Hồ sơ · Cài đặt · Thông báo, mỗi dòng cao 44px.</p></li>
            <li><strong class="t-label">Đăng xuất</strong><p class="t-body muted">Tách riêng, màu <span class="mono">--wrong</span>, và luôn là hành động cuối cùng.</p></li>
        </ul>
    </section>

    <section class="card card--flat pad-x" style="margin-top:16px">
        <h2 class="t-h3">Vì sao là disclosure, không phải menu</h2>
        <p class="t-body muted" style="margin-top:6px">
            Chuẩn <span class="mono">role="menu"</span> đòi điều hướng bằng phím mũi tên và roving
            focus. Panel này chỉ có link, nên dùng disclosure (<span class="mono">aria-expanded</span>
            + <span class="mono">aria-controls</span> + danh sách link) mới đúng: hứa một hành vi
            bàn phím mà không làm là cùng loại nói dối với việc in một band chưa đo.
        </p>
    </section>
</main>`),
},

/* ==================================================================== 33 */
'33-profile': { file: '33-profile.html', title: 'Trang cá nhân', subtitle: 'Mục tiêu band · trang trí · Lexi', group: 'Tài khoản',
  note: 'Lexi tiến hoá theo level, chỉ hiển thị ở đây và lúc mở khoá', body: wrap('account', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Trang cá nhân</h1>
    <p class="t-micro muted">Thành viên từ 02/2026</p></div>
    <a class="btn btn--ghost btn--sm" href="35-settings.html">${icon('settings', 16)} Cài đặt</a>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <section class="card card--hero pad-x prof-head">
        <span class="prof-av">M<span class="prof-av__frame" aria-hidden="true"></span></span>
        <div class="grow">
            <h2 class="t-h2">Minh Nguyễn</h2>
            <p class="t-micro muted">minh@email.com · Gói miễn phí</p>
            <div class="row g8 wrap" style="margin-top:10px">
                <span class="chip chip--teal">Mục tiêu band 6.5</span>
                <span class="chip chip--amber">${icon('flame', 14)} Chuỗi 12 ngày</span>
                <span class="chip">${icon('star', 14)} 2,480 XP</span>
            </div>
        </div>
        <div class="row g8"><button class="btn btn--ghost btn--sm" type="button">${icon('pen', 16)} Sửa hồ sơ</button></div>
    </section>

    <div class="grid g-4" style="margin-top:16px">
        ${stat('48', 'Bài đã hoàn thành', 'teal', 'check')}
        ${stat('128', 'Từ trong sổ tay', '', 'book')}
        ${stat('6.0', 'Band ước tính', 'amber', 'chart')}
        ${stat('18', 'Huy hiệu', '', 'trophy')}
    </div>

    <div class="prof-cols">
        <div class="stack g16">
            <section class="card card--edge pad-x">
                <h2 class="t-h3">Mục tiêu học tập</h2>
                <div class="stack g16" style="margin-top:12px">
                    <div class="between"><span class="t-label">Band mục tiêu</span><span class="band">6.5</span></div>
                    <div class="between"><span class="t-label">Ngày thi dự kiến</span><span class="t-body mono">20/12/2026</span></div>
                    <div class="between"><span class="t-label">Thời gian học mỗi ngày</span><span class="t-body mono">20 phút</span></div>
                </div>
                <div class="field" style="margin-top:14px">
                    <span class="field__label">Tiến độ tới mục tiêu</span>
                    ${bar(75)}
                    <span class="field__help">Band hiện tại 6.0 → mục tiêu 6.5 · còn 68 ngày</span>
                </div>
                <button class="btn btn--ghost btn--sm btn--block" style="margin-top:12px" type="button">Đổi mục tiêu</button>
            </section>

            <section class="card card--edge pad-x">
                <h2 class="t-h3">Lexi của bạn</h2>
                <div class="row g16" style="margin-top:10px">
                    <span data-lexi="happy" data-size="lg" data-label="Lexi"></span>
                    <div class="grow">
                        <span class="chip chip--teal">Intermediate</span>
                        <p class="t-body soft" style="margin-top:8px">Lexi đã đồng hành cùng bạn 4 tháng và giữ nhịp học trong 12 ngày liên tiếp.</p>
                        <div class="field" style="margin-top:10px">
                            <div class="between"><span class="t-micro muted">Tiến độ tới mốc tiếp theo</span><span class="t-micro mono">62%</span></div>
                            ${bar(62, 'amber')}
                            <span class="field__help">Cần một bài Writing hoặc Speaking đạt band 6.0 để mở mốc tiếp theo</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div class="stack g16">
            <section class="card card--edge pad-x">
                <div class="between"><h2 class="t-h3">Trang trí đang dùng</h2><a class="t-micro" href="31-rewards.html">Đổi</a></div>
                <div class="grid g-2" style="margin-top:12px">
                    ${[['Khung avatar', 'Lá', 'shield'], ['Hiệu ứng tên', 'Sóng', 'sparkle']].map(([k, v, ic]) => `
                        <div class="rowbox" style="text-align:center;flex-direction:column;align-items:center">
                            <span style="color:var(--teal)">${icon(ic, 22)}</span>
                            <p class="t-micro muted" style="margin-top:6px">${k}</p>
                            <strong class="t-label">${v}</strong>
                        </div>`).join('')}
                </div>
            </section>

            <section class="card card--edge pad-x">
                <h2 class="t-h3">Huy hiệu gần đây</h2>
                <div class="row g8 wrap" style="margin-top:10px">
                    ${['Chuỗi 7 ngày', '10,000 XP', 'Reading 7.0', '100 từ'].map((b) => `<span class="chip chip--amber">${icon('star', 14)} ${b}</span>`).join('')}
                </div>
            </section>

            <section class="card card--edge pad-x">
                <h2 class="t-h3">Hoạt động gần đây</h2>
                <ul class="stack g8" style="margin-top:10px">
                    ${[['Hoàn thành Cambridge 19 Test 1', 'Hôm nay'], ['Lưu 4 từ mới', 'Hôm qua'], ['Đạt chuỗi 12 ngày', '2 ngày trước']].map(([t, w]) => `
                        <li class="between" style="padding:8px 0;border-bottom:2px solid var(--border)">
                            <span class="t-micro soft">${t}</span><span class="t-micro muted">${w}</span></li>`).join('')}
                </ul>
            </section>
        </div>
    </div>
</main>`),
  style: `
.prof-head { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
.prof-av { position: relative; width: 80px; height: 80px; border-radius: 999px; background: var(--teal); color: var(--on-teal); display: grid; place-items: center; font-size: 2rem; font-weight: 800; flex: 0 0 auto; }
.prof-av__frame { position: absolute; inset: -6px; border-radius: 999px; border: 3px solid var(--amber); }
.prof-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
@media (max-width: 1023px) { .prof-cols { grid-template-columns: 1fr; } }
` },

/* ==================================================================== 34 */
'34-notifications': { file: '34-notifications.html', title: 'Trung tâm thông báo', subtitle: 'Filter + đọc/chưa đọc', group: 'Tài khoản',
  note: 'Có công tắc tắt nhắc học ngay trong ngữ cảnh', body: wrap('account', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Thông báo</h1>
    <p class="t-micro muted">3 chưa đọc</p></div>
    <button class="btn btn--ghost btn--sm" type="button">${icon('check', 16)} Đánh dấu đã đọc</button>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--focus" id="main">
    <div class="pills" style="margin-bottom:16px" role="tablist" aria-label="Lọc thông báo">
        <a class="pill" href="34-notifications.html" aria-current="page">Tất cả</a>
        <a class="pill" href="34-notifications.html">Chưa đọc (3)</a>
        <a class="pill" href="34-notifications.html">Học tập</a>
        <a class="pill" href="34-notifications.html">Hệ thống</a>
    </div>

    <ul class="stack g8">
        ${[
            ['sparkle', 'Nhắc học hôm nay', 'Bạn còn 3 nhiệm vụ trong kế hoạch. 20 phút là đủ.', '5 phút trước', true, 'teal'],
            ['pen', 'Bài Writing đã chấm xong', 'Writing Task 2 — Public transport đạt band 6.5.', '1 giờ trước', true, 'teal'],
            ['star', 'Chúc mừng chuỗi 12 ngày!', 'Bạn đang giữ nhịp tốt. Nghỉ một ngày cũng không sao — v2 tặng 2 ngày nghỉ mỗi tháng.', '3 giờ trước', true, 'amber'],
            ['trophy', 'Bạn tăng 32 hạng', 'Tuần này bạn ở top 18% bảng xếp hạng.', 'Hôm qua', false, ''],
            ['shield', 'Chính sách credit đã cập nhật', 'Bảng phí mới áp dụng từ 01/11. Phần học cốt lõi vẫn miễn phí.', '2 ngày trước', false, ''],
            ['book', '34 từ đến hạn ôn', 'Ôn hết sẽ mất khoảng 9 phút.', '3 ngày trước', false, ''],
        ].map(([ic, title, body, when, unread, tone]) => `
            <li class="card ${unread ? 'card--edge' : ''} pad row g16" style="${unread ? 'border-color:var(--teal)' : ''}">
                <span class="notif__ic notif__ic--${tone || 'plain'}">${icon(ic, 20)}</span>
                <div class="grow">
                    <div class="row g8"><strong class="t-label">${title}</strong>
                        ${unread ? '<span class="badge" style="height:8px;min-width:8px;padding:0"></span>' : ''}</div>
                    <p class="t-micro soft" style="margin-top:2px">${body}</p>
                    <span class="t-micro muted">${when}</span>
                </div>
                <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Tuỳ chọn">${icon('filter', 16)}</button>
            </li>`).join('')}
    </ul>

    <section class="card card--flat pad-x" style="margin-top:16px">
        <h2 class="t-h3">Bạn muốn nhận thông báo thế nào?</h2>
        <div class="stack g8" style="margin-top:10px">
            ${[['Nhắc học hằng ngày', true], ['Khi bài chấm xong', true], ['Tin từ cộng đồng', false]].map(([t, on]) => `
                <label class="between" style="min-height:44px">
                    <span class="t-body">${t}</span>
                    <button class="switch" type="button" role="switch" aria-checked="${on}" data-toggle><span></span></button>
                </label>`).join('')}
        </div>
        <a class="btn btn--ghost btn--sm" style="margin-top:12px" href="35-settings.html">Tạm dừng tất cả nhắc học</a>
    </section>
</main>`),
  style: `
.notif__ic { width: 44px; height: 44px; border-radius: var(--r-control); display: grid; place-items: center; background: var(--surface-alt); color: var(--ink-muted); flex: 0 0 auto; }
.notif__ic--teal { background: var(--teal-soft); color: var(--teal); }
.notif__ic--amber { background: var(--amber-soft); color: var(--attention); }
.switch { width: 52px; height: 30px; border-radius: 999px; border: 2px solid var(--border-strong); background: var(--surface-alt); position: relative; cursor: pointer; padding: 0; flex: 0 0 auto; }
.switch span { position: absolute; top: 2px; left: 2px; width: 22px; height: 22px; border-radius: 999px; background: var(--surface); border: 2px solid var(--border-strong); transition: transform var(--m-fast) var(--ease-out); }
.switch[aria-checked='true'] { background: var(--teal); border-color: var(--teal); }
.switch[aria-checked='true'] span { transform: translateX(22px); border-color: var(--teal); }
` },

/* ==================================================================== 35 */
'35-settings': { file: '35-settings.html', title: 'Cài đặt', subtitle: 'Học tập · thông báo · giao diện', group: 'Tài khoản',
  note: 'Hai công tắc gamification nằm ở nhóm đầu tiên, một chạm', body: wrap('account', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Cài đặt</h1>
    <p class="t-micro muted">Mọi thay đổi được lưu tự động</p></div>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--wide" id="main">
    <div class="set-cols">
        <nav class="card card--edge pad-sm hide-lg" aria-label="Mục cài đặt" style="position:sticky;top:80px">
            <div class="nav">
                ${[['Học tập', true], ['Nhắc học &amp; chuỗi', false], ['Thông báo', false], ['Giao diện', false], ['Tài khoản', false], ['Dữ liệu', false]].map(([t, on]) => `
                    <a class="nav__item" href="#${t.replace(/[^a-z]/gi, '')}" ${on ? 'aria-current="page"' : ''}>${t}</a>`).join('')}
            </div>
        </nav>

        <div class="stack g16">
            <!-- The gamification controls sit FIRST, both one tap, no submenu -->
            <section class="card card--edge pad-x" id="Nhchc">
                <h2 class="t-h3">Nhắc học &amp; chuỗi</h2>
                <p class="t-micro muted" style="margin-top:4px">Hai công tắc này tắt hẳn tính năng, không chỉ ẩn thông báo.</p>
                <div class="stack" style="margin-top:12px">
                    <label class="between" style="min-height:56px;border-bottom:2px solid var(--border)">
                        <span><strong class="t-label" style="display:block">Tạm dừng tất cả nhắc học</strong>
                            <span class="t-micro muted">Chuỗi vẫn được giữ, giao diện sẽ không nhắc bạn nữa</span></span>
                        <button class="switch" type="button" role="switch" aria-checked="false" data-toggle><span></span></button>
                    </label>
                    <label class="between" style="min-height:56px;border-bottom:2px solid var(--border)">
                        <span><strong class="t-label" style="display:block">Tắt theo dõi chuỗi ngày</strong>
                            <span class="t-micro muted">Số ngày sẽ hiển thị như một tính năng đang tắt, không phải như một món nợ</span></span>
                        <button class="switch" type="button" role="switch" aria-checked="false" data-toggle><span></span></button>
                    </label>
                    <div class="between" style="min-height:56px">
                        <span><strong class="t-label" style="display:block">Ngày nghỉ tự động</strong>
                            <span class="t-micro muted">2 ngày mỗi tháng, áp dụng tự động và không thể mua thêm</span></span>
                        <span class="chip chip--correct">${icon('check', 14)} 2 / 2 còn lại</span>
                    </div>
                </div>
            </section>

            <section class="card card--edge pad-x" id="Hctp">
                <h2 class="t-h3">Học tập</h2>
                <div class="stack" style="margin-top:12px">
                    <div class="between wrap g8" style="min-height:56px;border-bottom:2px solid var(--border)">
                        <span><strong class="t-label" style="display:block">Band mục tiêu</strong>
                            <span class="t-micro muted">Dùng để chọn độ khó bài gợi ý</span></span>
                        <div class="segmented"><button aria-pressed="false">5.5</button><button aria-pressed="true">6.5</button><button aria-pressed="false">7.5</button></div>
                    </div>
                    <div class="between wrap g8" style="min-height:56px;border-bottom:2px solid var(--border)">
                        <span><strong class="t-label" style="display:block">Thời gian học mỗi ngày</strong>
                            <span class="t-micro muted">Kế hoạch ngày sẽ gói trong khoảng này</span></span>
                        <div class="segmented"><button aria-pressed="false">10 phút</button><button aria-pressed="true">20 phút</button><button aria-pressed="false">40 phút</button></div>
                    </div>
                    <label class="between" style="min-height:56px">
                        <span><strong class="t-label" style="display:block">Tự động phát âm thanh</strong>
                            <span class="t-micro muted">Mặc định tắt cho người dùng mới</span></span>
                        <button class="switch" type="button" role="switch" aria-checked="false" data-toggle><span></span></button>
                    </label>
                </div>
            </section>

            <section class="card card--edge pad-x" id="Thngbo">
                <h2 class="t-h3">Thông báo</h2>
                <div class="stack" style="margin-top:12px">
                    ${[['Nhắc học hằng ngày', true, '20:00'], ['Khi bài Writing chấm xong', true, ''], ['Bảng xếp hạng &amp; thử thách', false, ''], ['Tin hệ thống', true, '']].map(([t, on, time]) => `
                        <label class="between" style="min-height:56px;border-bottom:2px solid var(--border)">
                            <span><strong class="t-label" style="display:block">${t}</strong>${time ? `<span class="t-micro muted">Lúc ${time}</span>` : ''}</span>
                            <button class="switch" type="button" role="switch" aria-checked="${on}" data-toggle><span></span></button>
                        </label>`).join('')}
                </div>
            </section>

            <section class="card card--edge pad-x" id="Giaodin">
                <h2 class="t-h3">Giao diện</h2>
                <div class="between wrap g8" style="min-height:56px;border-bottom:2px solid var(--border);margin-top:12px">
                    <span><strong class="t-label" style="display:block">Chế độ màu</strong>
                        <span class="t-micro muted">v2 có một giao diện duy nhất, chỉ đổi sáng/tối</span></span>
                    <div class="segmented"><button aria-pressed="false">Sáng</button><button aria-pressed="false">Tối</button><button aria-pressed="true">Theo hệ thống</button></div>
                </div>
                <div class="between wrap g8" style="min-height:56px">
                    <span><strong class="t-label" style="display:block">Cỡ chữ</strong>
                        <span class="t-micro muted">Ảnh hưởng cả phần bài đọc</span></span>
                    <div class="segmented"><button aria-pressed="true">Vừa</button><button aria-pressed="false">Lớn</button><button aria-pressed="false">Rất lớn</button></div>
                </div>
                <div class="verdict" style="margin-top:14px;border-color:var(--info);background:color-mix(in srgb,var(--info) 10%,var(--surface));box-shadow:0 4px 0 0 var(--info)">
                    <span style="color:var(--info)">${icon('shield', 20)}</span>
                    <span class="t-micro">Bản v2 bỏ 9 theme profile của v1 để có một ngôn ngữ thiết kế thống nhất. Sáng/tối vẫn theo hệ điều hành.</span>
                </div>
            </section>

            <section class="card card--edge pad-x" id="Dliu">
                <h2 class="t-h3">Dữ liệu</h2>
                <div class="row g8 wrap" style="margin-top:12px">
                    <button class="btn btn--ghost btn--sm" type="button">Xuất dữ liệu học tập</button>
                    <button class="btn btn--ghost btn--sm" type="button">Xoá lịch sử chat AI</button>
                    <button class="btn btn--danger btn--sm" type="button">Xoá tài khoản</button>
                </div>
            </section>
        </div>
    </div>
</main>`),
  style: `
.set-cols { display: grid; grid-template-columns: 240px 1fr; gap: 20px; align-items: start; }
@media (max-width: 1023px) { .set-cols { grid-template-columns: 1fr; } }
.pad-sm { padding: 10px; }
.switch { width: 52px; height: 30px; border-radius: 999px; border: 2px solid var(--border-strong); background: var(--surface-alt); position: relative; cursor: pointer; padding: 0; flex: 0 0 auto; }
.switch span { position: absolute; top: 2px; left: 2px; width: 22px; height: 22px; border-radius: 999px; background: var(--surface); border: 2px solid var(--border-strong); transition: transform var(--m-fast) var(--ease-out); }
.switch[aria-checked='true'] { background: var(--teal); border-color: var(--teal); }
.switch[aria-checked='true'] span { transform: translateX(22px); border-color: var(--teal); }
` },

/* ========================================================= 36b · panel ==== */
/**
 * The floating helper, OPEN — and the fix for a contradiction in this package.
 *
 * `DESIGN-V2.md` §7.3 has always said the 56px helper "Opens the Lexi panel", but the mockup drew
 * `<a href="36-ai-chat.html">`, and the app followed the mockup: pressing "Hỏi Lexi" navigated away
 * from the screen the question was about. That is the one thing a floating helper must not do.
 *
 * The panel is a NON-MODAL dialog on purpose: the page behind it stays readable and scrollable, so
 * a learner can look at the passage or the question they are asking about. `aria-modal="true"`
 * would claim the opposite. It is anchored bottom-right at >=1024px and becomes a sheet above the
 * tab bar on phones, because a 380px popover next to a 56px button does not fit a 390px screen.
 *
 * It is a SPECIMEN frame, not a variant of one route: the helper is shell furniture present on
 * every shell screen except the timed ones (see the Sparingly Rule), so reviewing it once reviews
 * it everywhere. `/ai-chat` (screen 36) remains the full-page version with history and context.
 */
'36b-lexi-panel': { file: '36b-lexi-panel.html', title: 'Lexi — panel nổi', subtitle: 'Mở từ nút 56px · không rời màn đang xem', group: 'Tài khoản',
  note: 'Dialog KHÔNG modal: trang phía sau vẫn đọc được · cùng nội dung với AI Coach', body: wrap('account', `
<header class="shell__header">
    <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Panel của Lexi</h1>
    <p class="t-micro muted">Hỏi ngay tại chỗ, không mất màn đang làm</p></div>
    ${accountHeader()}
</header>
<main class="shell__content shell__content--focus" id="main">
    <section class="card card--edge pad-x">
        <h2 class="t-h3">Nút nổi mở gì</h2>
        <ul class="stack g12" style="margin-top:12px">
            <li><strong class="t-label">Một panel, không phải một trang</strong><p class="t-body muted">Bấm nút là panel hiện ngay tại chỗ; nội dung đang đọc vẫn nằm sau lưng nó.</p></li>
            <li><strong class="t-label">Lexi nói rõ cô ấy thấy gì</strong><p class="t-body muted">Dòng ngữ cảnh ("Đang xem: Trang chủ") để người học không phải đoán.</p></li>
            <li><strong class="t-label">Ba gợi ý, không phải mười</strong><p class="t-body muted">Vừa đủ để bắt đầu khi ô nhập còn trống — lúc dễ bỏ cuộc nhất.</p></li>
            <li><strong class="t-label">Chi phí nằm ở ô gửi</strong><p class="t-body muted">Trước khi bấm, như mọi chỗ khác trong sản phẩm.</p></li>
        </ul>
    </section>

    <section class="card card--flat pad-x" style="margin-top:16px">
        <h2 class="t-h3">Không xuất hiện ở đâu</h2>
        <p class="t-body muted" style="margin-top:6px">
            Trong phòng thi, phòng viết và phòng nói (Sparingly Rule): một chú cún nói chuyện giữa
            bài đọc 60 phút là mối nguy, không phải người bạn đồng hành. Vì các màn đó nằm ngoài
            shell, chúng không có nút này.
        </p>
    </section>
</main>`, { lexiOpen: true }),
},

/* ==================================================================== 36 */
'36-ai-chat': { file: '36-ai-chat.html', title: 'AI Coach', subtitle: 'Chat streaming · credit badge', group: 'Tài khoản',
  note: 'Nêu rõ chi phí mỗi tin nhắn trước khi gửi', shell: true, body: `
<div class="chat">
    <header class="exam__bar">
        <a class="btn btn--ghost btn--icon btn--sm" href="04-home.html" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>
        <span data-lexi="idle" data-size="xs"></span>
        <div class="grow" style="min-width:0"><span class="t-label truncate" style="display:block">Lexi — AI Coach</span>
        <span class="t-micro muted">Biết tiến độ và điểm yếu của bạn</span></div>
        <span class="chip chip--teal">${icon('coin', 14)} 240</span>
        <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Lịch sử">${icon('clock', 18)}</button>
    </header>

    <div class="chat__body" id="main">
        <div class="chat__log" aria-live="polite">
            <div class="msg msg--ai">
                <span data-lexi="idle" data-size="xs"></span>
                <div class="bubble bubble--lexi bubble--left">Chào Minh! Tuần này bạn mạnh Listening, yếu Matching Headings. Bạn muốn luyện dạng đó hay hỏi gì khác?</div>
            </div>
            <div class="msg msg--me">
                <div class="bubble bubble--right">Giải thích cho mình cách làm dạng Matching Headings nhanh hơn.</div>
            </div>
            <div class="msg msg--ai">
                <span data-lexi="explain" data-size="xs"></span>
                <div class="bubble bubble--lexi bubble--left">
                    <strong>Ba bước:</strong>
                    <ol style="margin:8px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:4px">
                        <li>Đọc câu chủ đề — thường là câu đầu và câu cuối đoạn.</li>
                        <li>Gạch chân danh từ chính, bỏ qua từ nối.</li>
                        <li>So với tiêu đề: đúng khi <em>nghĩa</em> khớp, không phải khi <em>từ</em> trùng.</li>
                    </ol>
                    <span class="t-micro muted" style="display:block;margin-top:8px">Bạn hay chọn theo từ trùng — đó là lý do 3 câu sai lần trước.</span>
                </div>
            </div>
            <div class="msg msg--ai">
                <span data-lexi="explain" data-size="xs"></span>
                <div class="bubble bubble--lexi bubble--left">
                    <span class="t-micro muted">Đang trả lời…</span>
                    <span class="sk" style="display:block;width:120px;height:10px;margin-top:8px"></span>
                </div>
            </div>
        </div>

        <div class="chat__suggest">
            <div class="row g8 wrap">
                ${['Cho tôi 5 câu luyện tập', 'Xem điểm yếu của tôi', 'Lên kế hoạch tuần này'].map((s) => `<button class="chip chip--outline" type="button">${s}</button>`).join('')}
            </div>
        </div>

        <form class="chat__input" onsubmit="return false">
            <label class="grow"><span class="sr-only">Nhập câu hỏi</span><input class="input" placeholder="Hỏi Lexi về bài của bạn…" /></label>
            <button class="btn btn--primary" type="submit">${icon('arrowRight', 18)} Gửi · 1 credit</button>
        </form>
    </div>
    <div class="chat__bar only-mobile"></div>
</div>`,
  style: `
.chat { min-height: 100vh; display: flex; flex-direction: column; background: var(--canvas); }
.chat__body { flex: 1; width: 100%; max-width: 780px; margin-inline: auto; display: flex; flex-direction: column; padding: 16px; gap: 12px; }
.chat__log { flex: 1; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
.msg { display: flex; gap: 10px; align-items: flex-end; }
.msg--me { justify-content: flex-end; }
.msg .bubble { max-width: min(78%, 540px); }
.chat__input { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 2px solid var(--border-strong); border-radius: var(--r-card); padding: 8px; box-shadow: 0 4px 0 0 var(--border); }
.chat__input .input { border: 0; }
.chat__input .input:focus { outline: none; }
.chat__bar { height: calc(var(--shell-tabbar) + env(safe-area-inset-bottom, 0px)); }
` },

};
