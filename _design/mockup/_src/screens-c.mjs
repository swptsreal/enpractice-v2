/* Screens 07–15c — Vocabulary. */
import { shell, icon, stat, bar, emptyState, skeletonCard, accountHeader, lexiFab, lexiPanel } from '../assets/shell.js';
import { lexi } from '../assets/lexi.js';

export const screens = {

/* ==================================================================== 07 */
'07-vocabulary-check': {
    file: '07-vocabulary-check.html',
    title: 'Tra từ & hỏi AI',
    subtitle: 'Streaming explain · guest được dùng thử',
    group: 'Từ vựng',
    note: 'Ô nhập là trọng tâm · credit hiển thị trước khi tốn',
    body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html"><span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span></a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="36-ai-chat.html">${icon('sparkle', 20)}<span>AI Coach</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
            <div class="nav__group">Khác</div>
            <div class="nav">
                <a class="nav__item" href="07-vocabulary-check.html" aria-current="page">${icon('search', 18)}<span>Tra từ &amp; hỏi AI</span></a>
                <a class="nav__item" href="12-dictionary.html">${icon('book', 18)}<span>Sổ tay từ vựng</span></a>
                <a class="nav__item" href="08-vocabulary-list.html">${icon('book', 18)}<span>Từ vựng</span></a>
                <a class="nav__item" href="13-dictionary-review.html">${icon('sparkle', 18)}<span>Ôn flashcard</span></a>
                <a class="nav__item" href="14-evaluation.html">${icon('chart', 18)}<span>Đánh giá năng lực</span></a>
                <a class="nav__item" href="15-review.html">${icon('clock', 18)}<span>Ôn tập từ vựng</span></a>
            </div>
        </nav>
        <div class="shell__foot"><div class="row g8" style="padding:0 4px">
            <span class="chip chip--amber">${icon('flame', 14)} 12 ngày</span>
            <span class="chip chip--teal">${icon('coin', 14)} 240</span>
        </div></div>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Tra từ &amp; hỏi AI</h1>
            <p class="t-micro muted">Giải thích theo ngữ cảnh, không phải định nghĩa suông</p></div>
            <span class="chip chip--teal">${icon('coin', 14)} AI explain · 1 credit</span>
            ${accountHeader()}
</header>

        <main class="shell__content shell__content--focus" id="main">
            <section class="card card--edge pad-x">
                <label class="field">
                    <span class="field__label">Từ hoặc cụm từ bạn muốn hiểu</span>
                    <div class="row g8">
                        <input class="input" value="mitigate" aria-describedby="hint" />
                        <button class="btn btn--ghost btn--icon" type="button" aria-label="Đọc to">${icon('headphones', 20)}</button>
                    </div>
                    <span class="field__help" id="hint">Ví dụ: mitigate, take into account, a double-edged sword</span>
                </label>

                <label class="field" style="margin-top:14px">
                    <span class="field__label">Ngữ cảnh <span class="muted" style="font-weight:600">(tuỳ chọn, nhưng giúp AI trả lời đúng hơn)</span></span>
                    <textarea class="textarea" style="min-height:80px">Governments can mitigate the effects of air pollution by investing in public transport.</textarea>
                </label>

                <div class="between wrap g12" style="margin-top:16px">
                    <div class="row g8 wrap">
                        <span class="chip">IELTS Writing</span>
                        <span class="chip">Học thuật</span>
                    </div>
                    <button class="btn btn--primary" type="button">
                        ${icon('sparkle', 18)} Giải thích <span class="t-micro" style="opacity:.8">−1 credit</span>
                    </button>
                </div>
            </section>

            <!-- Streaming result, mid-flight: this is what the wait should look like -->
            <section class="card card--edge pad-x" style="margin-top:16px" aria-live="polite">
                <div class="between">
                    <div class="row g12">
                        <h2 class="t-h2" style="font-family:var(--font-display)">mitigate</h2>
                        <span class="mono" style="color:var(--teal)">/ˈmɪtɪɡeɪt/</span>
                    </div>
                    <span class="chip chip--teal">${icon('sparkle', 14)} Đang trả lời…</span>
                </div>

                <div class="stack g12" style="margin-top:14px">
                    <div>
                        <span class="t-micro muted">Nghĩa trong ngữ cảnh này</span>
                        <p class="t-body-lg" style="margin-top:2px">làm giảm bớt mức độ nghiêm trọng của một điều xấu</p>
                    </div>
                    <div>
                        <span class="t-micro muted">Vì sao hợp với câu của bạn</span>
                        <p class="t-body" style="margin-top:2px">
                            "Mitigate" đi với một <em>tác động tiêu cực</em>, không đi với một việc tốt.
                            Ở đây tác động tiêu cực là air pollution, nên cách dùng của bạn chính xác.
                        </p>
                    </div>
                    <div>
                        <span class="t-micro muted">Dễ nhầm với</span>
                        <ul class="stack g8" style="margin-top:6px">
                            <li class="row g8"><span class="chip chip--wrong">khác</span><span class="t-body"><strong>prevent</strong> — chặn hẳn, không phải chỉ giảm</span></li>
                            <li class="row g8"><span class="chip chip--teal">gần nghĩa</span><span class="t-body"><strong>alleviate</strong> — giảm đau/khó chịu, thiên về cảm giác</span></li>
                        </ul>
                    </div>
                    <div class="sk" style="width:44%;height:12px"></div>
                    <div class="sk" style="width:30%;height:12px"></div>
                </div>

                <div class="row g8 wrap" style="margin-top:18px">
                    <button class="btn btn--primary btn--sm" type="button" data-reveal="saved" data-announce="Đã lưu mitigate vào sổ tay">
                        ${icon('plus', 16)} Lưu vào sổ tay
                    </button>
                    <button class="btn btn--ghost btn--sm" type="button">${icon('chat', 16)} Hỏi thêm</button>
                </div>
                <div class="verdict" id="saved" hidden style="margin-top:12px">
                    <span style="color:var(--correct)">${icon('check', 20)}</span>
                    <span class="t-micro">Đã lưu <strong>mitigate</strong> vào sổ tay · gắn thẻ <em>Environment</em> · ôn lại sau 1 ngày</span>
                </div>
            </section>

            <section class="card card--flat pad-x" style="margin-top:16px">
                <span class="t-micro muted">Gần đây</span>
                <div class="row g8 wrap" style="margin-top:8px">
                    ${['sustainable', 'a double-edged sword', 'controversial', 'implement'].map((w) => `
                        <a class="chip chip--outline" href="12-dictionary.html">${w}</a>`).join('')}
                </div>
            </section>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="36-ai-chat.html">${icon('sparkle', 22)}<span>AI Coach</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33b-account-menu.html">${icon('menu', 22)}<span>Thêm</span></a>
        </nav>
    </div>
    ${lexiFab()}
</div>`,
},

/* ================================================================ 07 · guest */
/* Same screen, the OTHER chrome. `/vocabulary/check` is the no-account trial the landing page and
   the login card both promise ("Học thử không cần tài khoản"), so a visitor gets it full-bleed:
   no rail, no tab bar, no floating Lexi — chrome belonging to an account they do not have — and a
   slim bar that carries only a brand link and a way to sign in.

   IT SHOWS LESS ON PURPOSE. A visitor has no recent lookups and no saved words, so the "Gần đây"
   strip that screen 07 draws has nothing truthful to put in it. Drawing it anyway would be a
   mockup of data the viewer cannot have, which is the failure mode this design package keeps
   calling out.

   Both frames come from ONE screen number, because they are one screen: the split is decided by
   `VocabularyCheckLayout` in the app, from the session, not by two different pages. */
'07b-vocabulary-check-guest': {
    file: '07b-vocabulary-check-guest.html',
    title: 'Tra từ & hỏi AI — khách',
    subtitle: 'Không cần tài khoản · full-bleed, không có shell',
    group: 'Từ vựng',
    note: 'Biến thể KHÁCH của 07 · cùng màn, khác chrome · hạn mức AI mỗi ngày',
    body: `
<style>
    /* Page-specific, the same idiom 02-login.html uses for a surface that has no shell. */
    .guest__bar {
        position: sticky; top: 0; z-index: 30;
        border-bottom: 2px solid var(--border); background: var(--surface);
    }
    .guest__bar-inner {
        display: flex; align-items: center; gap: 12px;
        max-width: 820px; margin: 0 auto; padding: 8px 14px; min-height: 56px;
    }
    .guest__wrap { max-width: 820px; margin: 0 auto; padding: 20px 14px 40px; }
</style>

<a class="sr-only" href="#main">Bỏ qua tới nội dung</a>

<!-- The anchor strip. Deliberately NOT a <nav>: this surface has no navigation, and the app's own
     test asserts that no nav landmark renders for a guest. -->
<header class="guest__bar">
    <div class="guest__bar-inner">
        <a class="row g8" href="01-landing.html" style="color:inherit">
            <span data-lexi="idle" data-size="xs"></span>
            <span class="t-label">EN Practice</span>
        </a>
        <span class="grow"></span>
        <a class="btn btn--primary btn--sm" href="02-login.html">Đăng nhập</a>
    </div>
</header>

<main class="guest__wrap" id="main">
    <p class="t-micro muted">Giải thích theo ngữ cảnh, không phải định nghĩa suông</p>
    <!-- Why this screen has no shell, said in words rather than left for the visitor to read as a
         broken page. Only true for a guest: a signed-in learner is inside the shell (screen 07). -->
    <p class="t-micro muted" style="margin-top:4px">
        Học thử không cần tài khoản. AI dùng trong hạn mức mỗi ngày và tiến độ không được lưu.
    </p>

    <section class="card card--edge pad-x" style="margin-top:16px">
        <label class="field">
            <span class="field__label">Từ hoặc cụm từ bạn muốn hiểu</span>
            <div class="row g8">
                <input class="input" value="mitigate" aria-describedby="guest-hint" />
                <button class="btn btn--ghost btn--icon" type="button" aria-label="Đọc to">${icon('headphones', 20)}</button>
            </div>
            <span class="field__help" id="guest-hint">Ví dụ: mitigate, take into account, a double-edged sword</span>
        </label>

        <label class="field" style="margin-top:14px">
            <span class="field__label">Ngữ cảnh <span class="muted" style="font-weight:600">(tuỳ chọn, nhưng giúp AI trả lời đúng hơn)</span></span>
            <textarea class="textarea" style="min-height:80px">Governments can mitigate the effects of air pollution by investing in public transport.</textarea>
        </label>

        <div class="between wrap g12" style="margin-top:16px">
            <span class="chip chip--teal">${icon('sparkle', 14)} Còn 3 lượt hôm nay</span>
            <!-- The cost is still on the button while it is unpressed: the free/paid boundary is
                 stated at the moment of decision on this surface too, not only inside the app. -->
            <button class="btn btn--primary" type="button">
                ${icon('sparkle', 18)} Giải thích <span class="t-micro" style="opacity:.8">−1 credit</span>
            </button>
        </div>
    </section>

    <!-- The honest end of a guest session: what happens when the quota is gone, and the one action
         that keeps the work (an account). No nagging, no countdown. -->
    <section class="card card--flat pad-x" style="margin-top:16px">
        <h2 class="t-h3">Hết lượt học thử thì sao?</h2>
        <p class="t-body muted" style="margin-top:6px">
            Bạn vẫn tra từ và lưu sổ tay miễn phí. Phần giải thích bằng AI mở lại vào ngày mai,
            hoặc ngay khi bạn tạo tài khoản — và tiến độ sẽ được giữ lại.
        </p>
        <div class="row g8 wrap" style="margin-top:12px">
            <a class="btn btn--primary btn--sm" href="02-login.html">Tạo tài khoản</a>
            <a class="btn btn--ghost btn--sm" href="01-landing.html">Xem sản phẩm làm được gì</a>
        </div>
    </section>
</main>`,
},

/* ==================================================================== 08 */
'08-vocabulary-list': {
    file: '08-vocabulary-list.html',
    title: 'Test từ vựng',
    subtitle: 'Toolbar + lưới thẻ đề',
    group: 'Từ vựng',
    note: 'Empty/loading/error đều được thiết kế',
    body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html"><span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span></a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="36-ai-chat.html">${icon('sparkle', 20)}<span>AI Coach</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
        </nav>
        <div class="shell__foot"><div class="row g8" style="padding:0 4px">
            <span class="chip chip--amber">${icon('flame', 14)} 12 ngày</span>
            <span class="chip chip--teal">${icon('coin', 14)} 240</span>
        </div></div>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Test từ vựng</h1>
            <p class="t-micro muted">Bài test do AI tạo từ chủ đề bạn chọn</p></div>
            <a class="btn btn--primary btn--sm" href="09-vocabulary-take.html">${icon('plus', 16)} Tạo bài mới</a>
            ${accountHeader()}
</header>

        <main class="shell__content shell__content--wide" id="main">
            <!-- Tabs + filter toolbar (v1 has no mobile equivalent of this) -->
            <div class="row g12 wrap" data-tabs="vb" style="margin-bottom:16px">
                <div class="segmented" role="tablist" aria-label="Trạng thái">
                    <button role="tab" id="vb-all-tab" aria-controls="vb-all" aria-selected="true" data-tab="vb-all">Tất cả</button>
                    <button role="tab" id="vb-new-tab" aria-controls="vb-new" aria-selected="false" data-tab="vb-new">Chưa làm</button>
                    <button role="tab" id="vb-done-tab" aria-controls="vb-done" aria-selected="false" data-tab="vb-done">Đã làm</button>
                </div>
                <div class="grow"></div>
                <button class="btn btn--ghost btn--sm" type="button">${icon('filter', 16)} Chủ đề</button>
                <button class="btn btn--ghost btn--sm" type="button">${icon('chart', 16)} Lịch sử</button>
            </div>

            <div data-panel="vb-all" role="tabpanel" aria-labelledby="vb-all-tab">
                <h2 class="t-h2" style="margin-bottom:12px">Bài test có sẵn</h2>
                <div class="grid g-auto">
                    ${[
                        ['Education', '20 từ · 10 phút', 'AI tạo', 0, true],
                        ['Environment', '25 từ · 12 phút', 'AI tạo', 0, false],
                        ['Technology', '20 từ · 10 phút', 'Của tôi', 72, false],
                        ['Health', '18 từ · 9 phút', 'Của tôi', 85, false],
                        ['Urbanisation', '22 từ · 11 phút', 'AI tạo', 0, false],
                        ['Culture', '20 từ · 10 phút', 'Của tôi', 60, false],
                    ].map(([topic, meta, src, score, isNew]) => `
                        <article class="card card--edge pad-x">
                            <div class="between">
                                <div class="row g8">
                                    <span class="chip ${src === 'AI tạo' ? 'chip--teal' : ''}">${src}</span>
                                    ${isNew ? '<span class="chip chip--amber">New</span>' : ''}
                                </div>
                                ${score ? `<span class="band">${score}%</span>` : ''}
                            </div>
                            <h3 class="t-h3" style="margin-top:12px">${topic}</h3>
                            <p class="t-micro muted">${meta}</p>
                            <div class="row g8" style="margin-top:14px">
                                <a class="btn btn--${score ? 'ghost' : 'primary'} btn--sm grow" href="09-vocabulary-take.html">
                                    ${score ? 'Làm lại' : 'Bắt đầu'}
                                </a>
                                <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Thêm">${icon('plus', 16)}</button>
                            </div>
                        </article>`).join('')}
                </div>
            </div>
            <div data-panel="vb-new" hidden role="tabpanel" aria-labelledby="vb-new-tab">
                <h2 class="t-h2" style="margin-bottom:12px">Chưa làm</h2>
                ${emptyState({ title: 'Không còn bài chưa làm', body: 'Bạn đã làm hết các bài hiện có. Tạo bài mới theo chủ đề bạn muốn.', action: '<a class="btn btn--primary" href="09-vocabulary-take.html">Tạo bài mới</a>' })}
            </div>
            <div data-panel="vb-done" hidden role="tabpanel" aria-labelledby="vb-done-tab">
                <h2 class="t-h2" style="margin-bottom:12px">Đã làm</h2>
                <div class="grid g-auto">${skeletonCard(2)}${skeletonCard(2)}${skeletonCard(2)}</div>
                <p class="t-micro muted" style="text-align:center;margin-top:12px">Đang tải lịch sử…</p>
            </div>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="36-ai-chat.html">${icon('sparkle', 22)}<span>AI Coach</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33b-account-menu.html">${icon('menu', 22)}<span>Thêm</span></a>
        </nav>
    </div>
    ${lexiFab()}
</div>`,
},

/* ==================================================================== 09 */
'09-vocabulary-take': {
    file: '09-vocabulary-take.html',
    title: 'Làm bài test từ vựng',
    subtitle: '1 câu / màn · feedback ngay',
    group: 'Từ vựng',
    note: 'Nút kiểm tra dính đáy, an toàn với ngón tay',
    body: `
<div class="take">
    <header class="take__bar">
        <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Thoát">${icon('cross', 18)}</button>
        <div class="grow" style="max-width:520px">${bar(40)}</div>
        <span class="t-micro mono muted">4 / 10</span>
        <span class="chip chip--amber">${icon('star', 14)} 30 XP</span>
    </header>

    <main class="take__main" id="main">
        <p class="t-micro muted">Chọn nghĩa đúng của từ</p>
        <h1 class="t-display" style="margin-top:6px">mitigate</h1>
        <div class="row g8" style="justify-content:center;margin-top:8px">
            <button class="btn btn--ghost btn--sm" type="button">${icon('headphones', 16)} Nghe</button>
            <span class="mono muted">/ˈmɪtɪɡeɪt/</span>
        </div>

        <div class="take__answers" data-group>
            <button class="answer" type="button" data-select data-announce="Đã chọn A"><span class="answer__key">A</span><span>làm cho trầm trọng thêm</span></button>
            <button class="answer" type="button" data-select data-announce="Đã chọn B" aria-pressed="true"><span class="answer__key">B</span><span>làm giảm bớt mức độ nghiêm trọng</span></button>
            <button class="answer" type="button" data-select data-announce="Đã chọn C"><span class="answer__key">C</span><span>đo lường chính xác</span></button>
            <button class="answer" type="button" data-select data-announce="Đã chọn D"><span class="answer__key">D</span><span>phản đối công khai</span></button>
        </div>

        <!-- Verdict: colour + glyph + text, so it never relies on hue alone -->
        <div class="verdict" id="verdict" hidden>
            <span style="color:var(--correct)">${icon('check', 22)}</span>
            <div class="grow">
                <strong class="t-label">Chính xác</strong>
                <p class="t-micro soft">"Mitigate" đi với tác động tiêu cực cần giảm bớt, không phải với việc tốt.</p>
            </div>
            <span data-lexi="happy" data-size="xs"></span>
        </div>
    </main>

    <footer class="take__foot">
        <div class="take__foot-inner">
            <button class="btn btn--ghost" type="button" disabled>${icon('arrowLeft', 18)} Câu trước</button>
            <div class="grow"></div>
            <button class="btn btn--primary btn--lg" type="button" data-reveal="verdict" data-announce="Chính xác. Đáp án đúng là B. Cộng 10 XP">
                Kiểm tra ${icon('arrowRight', 18)}
            </button>
        </div>
    </footer>
</div>`,
    style: `
.take__answers { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; text-align: left; }
.take__answers .answer[aria-pressed='true'] { border-color: var(--teal); background: var(--teal-soft); box-shadow: 0 4px 0 0 var(--teal-strong); }
.take__answers .answer[aria-pressed='true'] .answer__key { border-color: var(--teal); color: var(--teal); }
`,
},

/* ==================================================================== 10 */
'10-vocabulary-result': {
    file: '10-vocabulary-result.html',
    title: 'Kết quả test từ vựng',
    subtitle: 'Band + Lexi + ôn từ sai',
    group: 'Từ vựng',
    note: 'Kết quả dẫn thẳng tới hành động tiếp theo',
    body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html"><span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span></a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="36-ai-chat.html">${icon('sparkle', 20)}<span>AI Coach</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
        </nav>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            <a class="btn btn--ghost btn--icon btn--sm" href="08-vocabulary-list.html" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>
            <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Kết quả · Education</h1>
            <p class="t-micro muted">Nộp lúc 14:32 · 10 câu · 6 phút 12 giây</p></div>
            ${accountHeader()}
</header>

        <main class="shell__content shell__content--wide" id="main">
            <!-- Headline result: score is the hero, Lexi reacts to it -->
            <section class="card card--hero pad-x result-head">
                <div class="result-head__lexi" data-lexi="celebrate" data-size="lg" data-label="Lexi ăn mừng"></div>
                <div class="grow">
                    <span class="t-micro muted">Kết quả</span>
                    <div class="row g12 baseline">
                        <span class="t-display" style="color:var(--teal);font-family:var(--font-mono)">8/10</span>
                        <span class="band">80%</span>
                    </div>
                    <p class="t-body soft" style="margin-top:6px">Tốt hơn lần trước 1 câu. Hai từ sai đều thuộc nhóm học thuật.</p>
                    <div class="row g8 wrap" style="margin-top:14px">
                        <span class="chip chip--amber">${icon('star', 14)} +120 XP</span>
                        <span class="chip chip--correct">${icon('check', 14)} Chuỗi 12 ngày</span>
                    </div>
                </div>
            </section>

            <div class="result-cols">
                <section class="card card--edge pad-x">
                    <h2 class="t-h3">Từ cần ôn lại</h2>
                    <ul class="stack g8" style="margin-top:12px">
                        ${[
                            ['mitigate', 'làm giảm bớt', 'Bạn chọn: làm trầm trọng thêm'],
                            ['prevalent', 'phổ biến', 'Bạn chọn: có hại'],
                        ].map(([w, right, wrong]) => `
                            <li class="wrongrow">
                                <span style="color:var(--wrong);flex:0 0 auto">${icon('cross', 18)}</span>
                                <span class="grow">
                                    <strong class="t-label">${w}</strong>
                                    <span class="t-micro soft" style="display:block">Đúng: ${right}</span>
                                    <span class="t-micro muted" style="display:block">${wrong}</span>
                                </span>
                                <button class="btn btn--ghost btn--sm" type="button">${icon('plus', 14)} Lưu</button>
                            </li>`).join('')}
                    </ul>
                    <div class="row g8" style="margin-top:14px">
                        <a class="btn btn--primary btn--sm grow" href="13-dictionary-review.html">Ôn 2 từ này ngay</a>
                        <a class="btn btn--ghost btn--sm" href="12-dictionary.html">Sổ tay</a>
                    </div>
                </section>

                <div class="stack g16">
                    <section class="card card--edge pad-x">
                        <h2 class="t-h3">Chi tiết 10 câu</h2>
                        <ul class="stack g8" style="margin-top:12px">
                            ${Array.from({ length: 10 }, (_, i) => {
                                const ok = i !== 3 && i !== 7;
                                return `<li class="row g12" style="padding:8px 0;border-bottom:2px solid var(--border)">
                                    <span class="mono muted" style="width:20px">${i + 1}</span>
                                    <span class="grow t-micro">${['mitigate','prevalent','curriculum','sustainable','allocate','compulsory','literacy','incentive','diverse','enrolment'][i]}</span>
                                    <span style="color:var(--${ok ? 'correct' : 'wrong'})">${icon(ok ? 'check' : 'cross', 16)}</span>
                                </li>`; }).join('')}
                        </ul>
                    </section>
                    <div class="row g8">
                        <a class="btn btn--primary grow" href="08-vocabulary-list.html">Làm bài khác</a>
                        <a class="btn btn--ghost" href="04-home.html">Về trang chủ</a>
                    </div>
                </div>
            </div>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="36-ai-chat.html">${icon('sparkle', 22)}<span>AI Coach</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33b-account-menu.html">${icon('menu', 22)}<span>Thêm</span></a>
        </nav>
    </div>
    ${lexiFab()}
</div>`,
    style: `
.result-head { display: flex; gap: 20px; align-items: center; }
@media (max-width: 639px) { .result-head { flex-direction: column; text-align: center; align-items: center; } }
.result-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
@media (max-width: 1023px) { .result-cols { grid-template-columns: 1fr; } }
.wrongrow { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border-radius: var(--r-control); background: var(--surface-alt); }
`,
},

/* ==================================================================== 11 */
'11-vocabulary-history': {
    file: '11-vocabulary-history.html',
    title: 'Lịch sử test từ vựng',
    subtitle: 'Table → card dưới 768px',
    group: 'Từ vựng',
    note: 'Sửa lỗi cuộn ngang của v1',
    body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html"><span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span></a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="36-ai-chat.html">${icon('sparkle', 20)}<span>AI Coach</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
        </nav>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            <a class="btn btn--ghost btn--icon btn--sm" href="08-vocabulary-list.html" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>
            <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Lịch sử test từ vựng</h1>
            <p class="t-micro muted">12 bài · điểm trung bình 74%</p></div>
            <button class="btn btn--ghost btn--sm" type="button">${icon('filter', 16)} Lọc</button>
            ${accountHeader()}
</header>

        <main class="shell__content shell__content--wide" id="main">
            <div class="grid g-4" style="margin-bottom:16px">
                ${stat('12', 'Bài đã làm', 'teal', 'target')}
                ${stat('74%', 'Trung bình', '', 'chart')}
                ${stat('38', 'Từ đã học', '', 'book')}
                ${stat('+1,240', 'XP từ từ vựng', 'amber', 'star')}
            </div>

            <!-- Desktop: a real table. The same data collapses to cards, not scroll. -->
            <section class="card card--edge" style="overflow:hidden">
                <div class="hide-lg scroll-x">
                    <table class="tbl">
                        <thead><tr>
                            <th>Chủ đề</th><th>Ngày</th><th>Điểm</th><th>Thời gian</th><th>XP</th><th></th>
                        </tr></thead>
                        <tbody>
                            ${[
                                ['Education', '13/10/2026', '8/10', '6:12', '+120'],
                                ['Environment', '11/10/2026', '7/10', '7:05', '+100'],
                                ['Technology', '09/10/2026', '9/10', '5:48', '+140'],
                                ['Health', '06/10/2026', '6/10', '6:30', '+90'],
                                ['Urbanisation', '03/10/2026', '7/10', '6:55', '+100'],
                            ].map(([t, d, s, tm, xp]) => `
                                <tr>
                                    <td><strong>${t}</strong></td>
                                    <td class="muted">${d}</td>
                                    <td><span class="band">${s}</span></td>
                                    <td class="mono muted">${tm}</td>
                                    <td class="mono" style="color:var(--attention)">${xp}</td>
                                    <td><a class="btn btn--ghost btn--sm" href="10-vocabulary-result.html">Xem</a></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Mobile: one card per attempt. No horizontal scroll, ever. -->
                <ul class="only-mobile stack" style="padding:12px">
                    ${[
                        ['Education', '13/10/2026', '8/10', '+120 XP'],
                        ['Environment', '11/10/2026', '7/10', '+100 XP'],
                        ['Technology', '09/10/2026', '9/10', '+140 XP'],
                        ['Health', '06/10/2026', '6/10', '+90 XP'],
                    ].map(([t, d, s, xp]) => `
                        <li style="border-bottom:2px solid var(--border)">
                            <a class="row g12" href="10-vocabulary-result.html" style="color:inherit;padding:12px 4px">
                                <span class="grow">
                                    <strong class="t-label" style="display:block">${t}</strong>
                                    <span class="t-micro muted">${d} · ${xp}</span>
                                </span>
                                <span class="band">${s}</span>
                                ${icon('arrowRight', 16)}
                            </a>
                        </li>`).join('')}
                </ul>
            </section>

            <div class="row g12" style="justify-content:center;margin-top:20px">
                <button class="btn btn--ghost btn--sm" type="button">Tải thêm</button>
            </div>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="36-ai-chat.html">${icon('sparkle', 22)}<span>AI Coach</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33b-account-menu.html">${icon('menu', 22)}<span>Thêm</span></a>
        </nav>
    </div>
    ${lexiFab()}
</div>`,
},

/* ==================================================================== 12 */
'12-dictionary': {
    file: '12-dictionary.html',
    title: 'Sổ tay từ vựng',
    subtitle: 'Mastery ring · tag · note',
    group: 'Từ vựng',
    note: 'Danh sách + chi tiết, dưới 1024px thành 1 cột',
    body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html"><span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span></a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="36-ai-chat.html">${icon('sparkle', 20)}<span>AI Coach</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
        </nav>
        <div class="shell__foot"><div class="row g8" style="padding:0 4px">
            <span class="chip chip--amber">${icon('flame', 14)} 12 ngày</span>
            <span class="chip chip--teal">${icon('coin', 14)} 240</span>
        </div></div>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Sổ tay từ vựng</h1>
            <p class="t-micro muted">128 từ · 12 từ đến hạn ôn hôm nay</p></div>
            <a class="btn btn--primary btn--sm" href="13-dictionary-review.html">${icon('sparkle', 16)} Ôn 12 từ</a>
            ${accountHeader()}
</header>

        <main class="shell__content shell__content--wide" id="main">
            <div class="grid g-4" style="margin-bottom:16px">
                ${stat('128', 'Tổng số từ', 'teal', 'book')}
                ${stat('12', 'Đến hạn hôm nay', 'amber', 'clock')}
                ${stat('86', 'Đã nhớ', '', 'check')}
                ${stat('18', 'Hay quên', '', 'cross')}
            </div>

            <div class="row g12 wrap" style="margin-bottom:16px">
                <label class="field grow" style="max-width:420px">
                    <span class="sr-only">Tìm trong sổ tay</span>
                    <input class="input" placeholder="Tìm từ, nghĩa hoặc ghi chú…" />
                </label>
                <div class="segmented" role="group" aria-label="Lọc">
                    <button aria-pressed="true">Tất cả</button>
                    <button aria-pressed="false">Hay quên</button>
                    <button aria-pressed="false">Đã nhớ</button>
                </div>
                <div class="grow"></div>
                <button class="btn btn--ghost btn--sm" type="button">${icon('filter', 16)} Thẻ</button>
            </div>

            <div class="dict-cols">
                <!-- List -->
                <section class="stack g12" aria-label="Danh sách từ">
                    ${[
                        ['mitigate', '/ˈmɪtɪɡeɪt/', 'làm giảm bớt', 'Environment', 42, 'wrong'],
                        ['prevalent', '/ˈprevələnt/', 'phổ biến, thịnh hành', 'Health', 58, 'attention'],
                        ['sustainable', '/səˈsteɪnəbl/', 'bền vững', 'Environment', 88, ''],
                        ['allocate', '/ˈæləkeɪt/', 'phân bổ', 'Education', 34, 'wrong'],
                    ].map(([w, ipa, mean, tag, lvl, tone], i) => `
                        <article class="card ${i === 0 ? 'card--edge' : ''} pad row g16 dict-row" style="${i === 0 ? 'border-color:var(--teal)' : ''}">
                            <span class="ring" data-lvl="${lvl}" role="img" aria-label="Mức độ nhớ ${lvl}%">
                                <svg viewBox="0 0 36 36" width="46" height="46" aria-hidden="true">
                                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--surface-alt)" stroke-width="4"/>
                                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="${tone === 'wrong' ? 'var(--wrong)' : tone === 'attention' ? 'var(--amber)' : 'var(--teal)'}"
                                        stroke-width="4" stroke-linecap="round" stroke-dasharray="${lvl * 0.974} 100" transform="rotate(-90 18 18)"/>
                                </svg>
                                <span class="mono" style="font-size:.6875rem">${lvl}</span>
                            </span>
                            <span class="grow">
                                <span class="row g8 wrap"><strong class="t-h3">${w}</strong><span class="mono muted">${ipa}</span></span>
                                <span class="t-body soft" style="display:block">${mean}</span>
                                <span class="chip chip--outline" style="margin-top:6px">${tag}</span>
                            </span>
                            <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Nghe">${icon('headphones', 16)}</button>
                        </article>`).join('')}
                    <button class="btn btn--ghost btn--block" type="button">Tải thêm 20 từ</button>
                </section>

                <!-- Detail: an aside on desktop, a full screen below 1024px -->
                <aside class="card card--edge pad-x hide-lg" aria-label="Chi tiết từ">
                    <div class="between">
                        <div>
                            <h2 class="t-h2" style="font-family:var(--font-display)">mitigate</h2>
                            <span class="mono" style="color:var(--teal)">/ˈmɪtɪɡeɪt/</span>
                        </div>
                        <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Đóng">${icon('cross', 16)}</button>
                    </div>
                    <div class="row g8" style="margin-top:10px">
                        <span class="chip chip--teal">động từ</span>
                        <span class="chip chip--outline">Environment</span>
                        <span class="chip chip--wrong">hay quên</span>
                    </div>
                    <dl class="stack g12" style="margin-top:16px">
                        <div><dt class="t-micro muted">Nghĩa</dt><dd class="t-body-lg">làm giảm bớt mức độ nghiêm trọng</dd></div>
                        <div><dt class="t-micro muted">Ví dụ</dt><dd class="t-body">Governments can <strong>mitigate</strong> air pollution by investing in public transport.</dd></div>
                        <div><dt class="t-micro muted">Ghi chú của bạn</dt><dd class="t-body soft">Đi với tác động tiêu cực, không đi với việc tốt.</dd></div>
                        <div><dt class="t-micro muted">Lịch ôn</dt><dd class="t-body mono">Lần tới: 14/10 · mức 2/5</dd></div>
                    </dl>
                    <div class="row g8" style="margin-top:16px">
                        <button class="btn btn--primary btn--sm grow" type="button">Sửa ghi chú</button>
                        <button class="btn btn--ghost btn--sm" type="button">Xoá</button>
                    </div>
                </aside>
            </div>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="36-ai-chat.html">${icon('sparkle', 22)}<span>AI Coach</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33b-account-menu.html">${icon('menu', 22)}<span>Thêm</span></a>
        </nav>
    </div>
    ${lexiFab()}
</div>`,
    style: `
.dict-cols { display: grid; grid-template-columns: 1.25fr .75fr; gap: 16px; align-items: start; }
@media (max-width: 1023px) { .dict-cols { grid-template-columns: 1fr; } }
.ring { position: relative; display: grid; place-items: center; flex: 0 0 auto; }
.ring > span { position: absolute; }
.ring svg { display: block; }
`,
},

/* ==================================================================== 13 */
'13-dictionary-review': {
    file: '13-dictionary-review.html',
    title: 'Ôn flashcard SRS',
    subtitle: 'Lật thẻ · 4 mức nhớ',
    group: 'Từ vựng',
    note: 'Một thẻ một màn · 4 nút to, dễ bấm bằng ngón cái',
    body: `
<div class="take">
    <header class="take__bar">
        <button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Thoát">${icon('cross', 18)}</button>
        <div class="grow" style="max-width:520px">${bar(33, 'amber')}</div>
        <span class="t-micro mono muted">4 / 12</span>
    </header>

    <main class="take__main" id="main" style="max-width:720px">
        <!-- The card. Face is the prompt, not a definition. -->
        <article class="flash" aria-live="polite">
            <div class="between">
                <span class="chip chip--outline">Environment</span>
                <button class="btn btn--ghost btn--sm" type="button">${icon('headphones', 16)} Nghe</button>
            </div>

            <div class="flash__face">
                <h1 class="t-display" style="font-family:var(--font-display)">mitigate</h1>
                <span class="mono muted">/ˈmɪtɪɡeɪt/</span>
            </div>

            <div class="flash__example">
                <span class="t-micro muted">Ví dụ của bạn</span>
                <p class="t-body-lg" style="margin-top:2px">Governments can <mark>mitigate</mark> air pollution by investing in public transport.</p>
            </div>

            <div class="flash__answer" id="answer" hidden>
                <div class="hr" style="margin:16px 0"></div>
                <span class="t-micro muted">Nghĩa</span>
                <p class="t-h3" style="margin-top:2px">làm giảm bớt mức độ nghiêm trọng</p>
                <p class="t-body soft" style="margin-top:8px">Đi với tác động tiêu cực cần giảm bớt — không đi với một việc tốt.</p>
            </div>

            <div class="row g12" style="justify-content:center;margin-top:20px">
                <button class="btn btn--primary btn--lg" type="button" data-reveal="answer" data-announce="Đã hiện nghĩa của mitigate">Hiện nghĩa</button>
            </div>
        </article>
    </main>

    <!-- 4 levels of recall: bigger than 44px, colour + label, not colour alone -->
    <footer class="take__foot">
        <div class="take__foot-inner" style="max-width:720px">
            <span class="t-micro muted hide-lg" style="flex:0 0 auto">Bạn nhớ từ này ở mức nào?</span>
            <div class="srs">
                ${[
                    ['again', 'Quên', 'wrong'],
                    ['hard', 'Khó', 'attention'],
                    ['good', 'Được', 'teal'],
                    ['easy', 'Dễ', 'correct'],
                ].map(([k, label, tone]) => `
                    <button class="srs__btn srs__btn--${k}" type="button" data-select data-announce="Đã ghi mức ${label} · từ này sẽ quay lại theo lịch ngắn hơn">
                        <span class="t-label">${label}</span>
                        <span class="t-micro muted">${({ again: '<1 ngày', hard: '2 ngày', good: '5 ngày', easy: '12 ngày' })[k]}</span>
                    </button>`).join('')}
            </div>
        </div>
    </footer>
</div>`,
    style: `
.flash { background: var(--surface); border: 2px solid var(--border-strong); border-radius: var(--r-hero); padding: 24px; box-shadow: 0 6px 0 -2px var(--border), 0 20px 40px -28px rgb(20 35 43 / .35); text-align: left; }
.flash__face { text-align: center; padding: 28px 0 8px; }
.flash__example { margin-top: 16px; padding: 14px 16px; background: var(--surface-alt); border-radius: var(--r-card); }
.flash__example mark { background: color-mix(in srgb, var(--amber) 42%, transparent); color: inherit; border-radius: 3px; padding: 0 2px; }
.srs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 100%; }
.srs__btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-height: 56px; padding: 8px; border: 2px solid var(--border-strong); border-radius: var(--r-control); background: var(--surface); cursor: pointer; box-shadow: 0 4px 0 0 var(--border-strong); transition: transform 90ms var(--ease-out), box-shadow 90ms var(--ease-out); }
.srs__btn:active { transform: translateY(4px); box-shadow: 0 0 0 0 var(--border-strong); }
.srs__btn--wrong { border-color: var(--wrong); box-shadow: 0 4px 0 0 var(--wrong); }
.srs__btn--hard { border-color: var(--attention); box-shadow: 0 4px 0 0 var(--attention); }
.srs__btn--good { border-color: var(--teal); box-shadow: 0 4px 0 0 var(--teal-strong); }
.srs__btn--easy { border-color: var(--correct); box-shadow: 0 4px 0 0 var(--correct); }
@media (max-width: 479px) { .srs { grid-template-columns: repeat(2, 1fr); } .take__foot-inner > .t-micro { display: none; } }
`,
},

/* ==================================================================== 14 */
'14-evaluation': {
  file: '14-evaluation.html',
  title: 'Đánh giá năng lực',
  subtitle: 'Theo 4 kỹ năng · band ước tính',
  group: 'Từ vựng',
  note: 'Không tô hồng kết quả · nêu rõ đâu là ước tính',
  body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html"><span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span></a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="36-ai-chat.html">${icon('sparkle', 20)}<span>AI Coach</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
        </nav>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Đánh giá năng lực</h1>
            <p class="t-micro muted">Cập nhật sau 24 bài làm gần nhất</p></div>
            <button class="btn btn--primary btn--sm" type="button">${icon('play', 16)} Làm bài đánh giá mới</button>
            ${accountHeader()}
</header>

        <main class="shell__content shell__content--wide" id="main">
            <section class="card card--hero pad-x eval-head">
                <div class="grow">
                    <span class="t-micro muted">Band ước tính từ dữ liệu luyện tập</span>
                    <div class="row g12 baseline"><span class="t-display" style="font-family:var(--font-mono);color:var(--teal)">6.0</span>
                        <span class="chip chip--teal">${icon('chart', 14)} +0.5 trong 30 ngày</span></div>
                    <p class="t-micro muted" style="margin-top:8px;max-width:56ch">
                        Đây là ước tính từ bài luyện trên nền tảng, không phải kết quả thi chính thức.
                        Sai số thường gặp khoảng ±0.5 band.
                    </p>
                </div>
                <div data-lexi="explain" data-size="md" data-label="Lexi giải thích"></div>
            </section>

            <div class="grid g-4" style="margin-top:16px">
                ${[['Listening', '6.5', 78, 'headphones'], ['Reading', '6.0', 68, 'book'], ['Writing', '5.5', 54, 'pen'], ['Speaking', '6.0', 62, 'mic']]
                    .map(([k, b, pct, ic]) => `
                    <article class="card card--edge pad-x">
                        <div class="row g8" style="color:var(--teal)">${icon(ic, 18)}<span class="t-label">${k}</span></div>
                        <div class="row g8 baseline" style="margin-top:10px">
                            <span class="stat__value" style="color:var(--ink)">${b}</span>
                            <span class="t-micro muted">/ 9.0</span>
                        </div>
                        <div style="margin-top:10px">${bar(pct)}</div>
                        <span class="t-micro muted" style="display:block;margin-top:6px">Độ chính xác ${pct}%</span>
                    </article>`).join('')}
            </div>

            <div class="eval-cols">
                <section class="card card--edge pad-x">
                    <h2 class="t-h3">Điểm mạnh theo dạng câu hỏi</h2>
                    <ul class="stack g12" style="margin-top:12px">
                        ${[['Multiple Choice', 84], ['Sentence Completion', 76], ['Matching Information', 71]].map(([t, v]) => `
                            <li><div class="between"><span class="t-micro soft">${t}</span><span class="t-micro mono">${v}%</span></div>
                            <div style="margin-top:4px">${bar(v)}</div></li>`).join('')}
                    </ul>
                </section>
                <section class="card card--edge pad-x">
                    <h2 class="t-h3">Cần cải thiện</h2>
                    <ul class="stack g12" style="margin-top:12px">
                        ${[['Matching Headings', 42], ['True / False / Not Given', 58], ['Writing Task 1 — Overview', 49]].map(([t, v]) => `
                            <li><div class="between"><span class="t-micro soft">${t}</span><span class="t-micro mono">${v}%</span></div>
                            <div style="margin-top:4px">${bar(v, 'amber')}</div></li>`).join('')}
                    </ul>
                    <a class="btn btn--primary btn--sm btn--block" style="margin-top:14px" href="06-path.html">Đưa vào lộ trình</a>
                </section>
            </div>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="36-ai-chat.html">${icon('sparkle', 22)}<span>AI Coach</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33b-account-menu.html">${icon('menu', 22)}<span>Thêm</span></a>
        </nav>
    </div>
    ${lexiFab()}
</div>`,
    style: `
.eval-head { display: flex; gap: 20px; align-items: center; }
.eval-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
@media (max-width: 1023px) { .eval-cols { grid-template-columns: 1fr; } }
`,
},

/* ============================================================== 15 · 15b · 15c

   The review flow is THREE steps, and all three are designed here because the
   step that carried the most of v1's value — the practice — had no frame at
   all, so nobody could see it. Frames:

     15-review.html           step 1 · choose the window, the group, the count
     15b-review-practice.html step 2 · answer by typing, one word at a time
     15c-review-result.html   step 3 · how it went, and what to do about it

   THE CONFIG IS THE OLD APP'S CONFIG, re-expressed. v1 (current) asked for a
   TIME WINDOW (all / 7d / 30d / week / month / custom), a WORD GROUP
   (never reviewed / frequently missed / all) and a COUNT, and the backend has
   the endpoints for exactly those three: `/records/review-words` and
   `/records/review-counts` take `rangeMode`, `from`, `to`, `week`, `month`,
   `group`, `limit`. An earlier draft of this frame replaced the window with
   four hand-picked "content" options ("due today", "words you forget", "by
   deck", "whole notebook") — three of which no endpoint could answer, which is
   what happens when a screen is designed before the contract is read.

   TWO CONTROLS, NOT THREE, for direction. v1 (current) offers en-vi and vi-en;
   the "Mixed" option an earlier draft showed would have to be stored in a
   single `direction` string the server keeps verbatim, and no per-word
   direction exists, so it was dropped rather than shipped as a label that lies.

   THE COUNT IS A RANGE, CAPPED BY WHAT IS AVAILABLE. Asking for 50 words when
   8 are due is a promise the screen cannot keep; the cap is the group's own
   count, so the slider's maximum IS the answer to "how many have I got".

   NO STEPPER AND NO BACK BUTTON ON STEP 1. Two reasons, both about this step
   being an ENTRY point rather than a place you navigate into:

     1. `/review` is opened from the rail ("Từ vựng") and, on a phone, from the
        bottom tab bar. A back button there has nowhere honest to go — the first
        build pointed it at `/evaluation`, which is a different hub, so it read
        as "back" and landed somewhere the learner had never been.
     2. The stepper spent the top of the screen saying "1 of 3" before the
        learner had agreed to anything. The three-step shape is already implied
        by the start button, which names the session it will start; the stepping
        is worth showing DURING the flow, which is why 15c keeps its own
        stepper.

   NO STEPPER ANYWHERE. Step 1 dropped it (an entry point has no step to announce),
   and step 3 dropped it too: the flow is over, so a "3 of 3" badge states something
   the learner already knows, and it sits in the most valuable strip of the screen
   directly above the result they came for. The three-step shape is carried by the
   flow itself — the start button names the session it opens, and the result's own
   exits ("Ôn lại N từ khó", "Ôn lại", "Sổ tay từ vựng") say what to do next.

   The step-3 header no longer claims "Bước 3 / 3" either; the subheader names the
   screen instead.
*/

/* ==================================================================== 15 */
'15-review': {
    file: '15-review.html',
    title: 'Ôn tập từ vựng',
    subtitle: 'Chọn khoảng thời gian · nhóm từ · số từ',
    group: 'Từ vựng',
    note: 'nói trước sẽ ôn gì và mất bao lâu',
    body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html"><span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span></a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="36-ai-chat.html">${icon('sparkle', 20)}<span>AI Coach</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
        </nav>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Ôn tập từ vựng</h1>
            <p class="t-micro muted">Chọn khoảng thời gian, nhóm từ và số từ</p></div>
            ${accountHeader()}
</header>

        <main class="shell__content shell__content--focus" id="main">
            <section class="card card--edge pad-x">
                <div class="row g12">
                    <span data-lexi="explain" data-size="sm"></span>
                    <p class="t-body grow">Bạn có <strong>34 từ</strong> đến hạn. Ôn hết sẽ mất khoảng <strong>9 phút</strong>.</p>
                </div>
            </section>

            <!-- 1 · the window. Presets first: the common answer is one tap, and
                 "Tùy chỉnh" is the only one that needs a date input. -->
            <section class="card card--edge pad-x" style="margin-top:16px">
                <span class="t-label" style="display:block">Khoảng thời gian</span>
                <p class="t-micro muted" style="margin-top:2px">Ôn lại đúng giai đoạn bạn muốn: vài ngày gần đây, một tuần hoặc một tháng cụ thể.</p>

                <div class="pills" style="margin-top:12px" data-group role="group" aria-label="Khoảng thời gian">
                    ${[
                        ['Toàn bộ', false],
                        ['7 ngày', false],
                        ['30 ngày', false],
                        ['Tuần này', false],
                        ['Tháng này', false],
                        ['Tùy chỉnh', true],
                    ].map(([label, on]) => `<button class="pill" type="button" data-select aria-pressed="${on}">${label}</button>`).join('')}
                </div>

                <div class="row g8 wrap" style="margin-top:12px">
                    <span class="field grow"><span class="field__label">Từ ngày</span>
                        <input class="input" type="date" value="2026-10-01" aria-label="Từ ngày"></span>
                    <span class="field grow"><span class="field__label">Đến ngày</span>
                        <input class="input" type="date" value="2026-10-13" aria-label="Đến ngày"></span>
                </div>
                <p class="t-micro muted" style="margin-top:8px">Đang chọn: 2026-10-01 → 2026-10-13</p>
            </section>

            <!-- 2 · the group. Each option carries ITS OWN count, because "which
                 words" is the question this screen exists to answer. -->
            <section class="card card--edge pad-x" style="margin-top:16px">
                <span class="t-label" style="display:block">Nhóm từ cần ôn</span>
                <p class="t-micro muted" style="margin-top:2px">Ưu tiên từ chưa ôn để không bỏ sót, hoặc tập trung vào nhóm từ hay sai.</p>

                <div class="stack g8" style="margin-top:12px" data-group role="group" aria-label="Nhóm từ">
                    ${[
                        ['Từ chưa ôn', 'Chưa từng xuất hiện trong phiên ôn nào', '26 từ', true],
                        ['Từ hay sai', 'Tỉ lệ sai trên 50%', '8 từ', false],
                        ['Toàn bộ từ', 'Mọi từ trong khoảng đã chọn', '41 từ', false],
                    ].map(([label, hint, count, on]) => `
                        <button class="answer" type="button" data-select aria-pressed="${on}" style="min-height:58px">
                            <span class="answer__key" style="border-radius:999px">${on ? icon('check', 14) : ''}</span>
                            <span class="grow"><strong class="t-label" style="display:block">${label}</strong><span class="t-micro muted">${hint}</span></span>
                            <span class="mono" style="flex:0 0 auto">${count}</span>
                        </button>`).join('')}
                </div>
            </section>

            <!-- 3 · direction and count, side by side once there is room. -->
            <section class="card card--edge pad-x" style="margin-top:16px">
                <div class="review-two">
                    <div>
                        <span class="t-label" style="display:block">Chiều ôn</span>
                        <p class="t-micro muted" style="margin-top:2px">Đổi hướng ôn tùy mục tiêu: nhận diện nhanh hay nhớ chủ động sâu hơn.</p>
                        <div class="segmented" style="margin-top:10px" data-group role="group" aria-label="Chiều ôn">
                            <button type="button" data-select aria-pressed="true">Anh → Việt</button>
                            <button type="button" data-select aria-pressed="false">Việt → Anh</button>
                        </div>
                    </div>

                    <div>
                        <span class="t-label" style="display:block">Số từ trong phiên này</span>
                        <p class="t-micro muted" style="margin-top:2px">Một lượt ôn ngắn nhưng tập trung thường hiệu quả hơn một phiên quá dài.</p>
                        <!-- ONE control for one number. A slider AND quick-pick chips would be two
                             controls claiming the same value, and the mockup's own selection script
                             would happily show "10" and "20" pressed at once. The marks answer the
                             only question the slider raises: what is the maximum, and why. -->
                        <div class="row g12" style="margin-top:14px">
                            <input class="range grow" type="range" min="1" max="26" value="20" aria-label="Số từ trong phiên này" aria-describedby="count-range">
                            <span class="t-h3 mono" style="flex:0 0 auto">20</span>
                        </div>
                        <div id="count-range" class="row between mono t-micro muted" style="margin-top:4px">
                            <span>1</span><span>13</span><span>26</span>
                        </div>
                        <p class="t-micro muted" style="margin-top:6px">Tối đa 26 từ — số từ chưa ôn trong khoảng đã chọn.</p>
                    </div>
                </div>
            </section>

            <div class="row g12 wrap" style="margin-top:16px">
                <a class="btn btn--primary btn--lg grow" href="15b-review-practice.html">Bắt đầu ôn (20 từ · 5 phút)</a>
                <a class="btn btn--ghost btn--lg" href="04-home.html">Để sau</a>
            </div>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="36-ai-chat.html">${icon('sparkle', 22)}<span>AI Coach</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33b-account-menu.html">${icon('menu', 22)}<span>Thêm</span></a>
        </nav>
    </div>
    ${lexiFab()}
</div>`,
    style: `
.answer[aria-pressed='true'] { border-color: var(--teal); background: var(--teal-soft); box-shadow: 0 4px 0 0 var(--teal-strong); }
.answer[aria-pressed='true'] .answer__key { border-color: var(--teal); color: var(--teal); }
.review-two { display: grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 640px) { .review-two { grid-template-columns: 1fr 1fr; } }
/* A native range, because a slider built from divs cannot be dragged by keyboard. Track and thumb
   are the only two parts that need colour, and both take tokens. */
.range { -webkit-appearance: none; appearance: none; height: 24px; background: transparent; }
.range::-webkit-slider-runnable-track { height: 10px; border-radius: var(--r-chip); background: var(--surface-alt); border: 2px solid var(--border); }
.range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 26px; height: 26px; margin-top: -10px; border-radius: 999px; background: var(--teal); border: 2px solid var(--teal-strong); }
.range::-moz-range-track { height: 10px; border-radius: var(--r-chip); background: var(--surface-alt); border: 2px solid var(--border); }
.range::-moz-range-thumb { width: 24px; height: 24px; border-radius: 999px; background: var(--teal); border: 2px solid var(--teal-strong); }
`,
},

/* =================================================================== 15b */
'15b-review-practice': {
    file: '15b-review-practice.html',
    title: 'Ôn tập · đang làm',
    subtitle: 'Gõ đáp án · máy chấm · xem lại giải thích',
    group: 'Từ vựng',
    note: 'Một từ một màn · bàn phím là chính',
    body: `
<div class="take">
    <header class="take__bar">
        <a class="btn btn--ghost btn--icon btn--sm" href="15-review.html" aria-label="Thoát">${icon('cross', 18)}</a>
        <div class="grow" style="max-width:520px">${bar(35, 'amber')}</div>
        <span class="t-micro mono muted">7 / 20</span>
    </header>

    <main class="take__main" id="main" style="text-align:left">
        <!-- The prompt is the ENGLISH word, because "Anh → Việt" was chosen. The
             label above it says so, so the input below cannot be ambiguous.

             NO TOPIC CHIP AND NO PHONETIC. Both were drawn here in an earlier pass
             and BOTH were drawn from data the API cannot return: ReviewWordDto
             carries englishWord, normalizedWord, correctMeaning,
             alternatives, acceptedMeaningsVi, meaningExplanation and
             exampleSentences — there is no topic, deck or part-of-speech field,
             and no IPA. A frame may not promise a value nobody can fetch, so the
             chip and the phonetic line are gone and the gate keeps them out. -->
        <article class="card card--hero card--edge pad-x" style="text-align:center">
            <div class="row" style="justify-content:flex-end">
                <button class="btn btn--ghost btn--sm" type="button">${icon('headphones', 16)} Nghe</button>
            </div>

            <div style="padding:16px 0 8px">
                <span class="t-micro muted" style="display:block">Từ tiếng Anh</span>
                <h1 class="t-display" style="font-family:var(--font-display);margin-top:4px">mitigate</h1>
            </div>
        </article>

        <div class="field" style="margin-top:16px">
            <label class="field__label" for="review-answer">Nhập nghĩa tiếng Việt</label>
            <input class="input" id="review-answer" type="text" value="làm giảm bớt" autocomplete="off" spellcheck="false">
            <span class="field__help">Enter để kiểm tra · Esc để thoát</span>
        </div>

        <!-- The verdict. ONE card, and everything inside it is a .rowbox: an inset
             surface for the answer pair, an inset surface per example, and never a
             card inside a card. Shown in its ANSWERED state — before checking, this
             block is absent and the footer button reads "Kiểm tra".

             THE MISSING STATE, specified here because a frame is a picture of one
             moment and a session has more than one. Answering WRONG renders the SAME
             card with these differences, and they are the whole of it:

               - glyph and border take --wrong instead of --correct;
               - title "Chưa đúng hoàn toàn" (not "Trả lời chính xác");
               - body "Không sao cả. Xem lại đáp án đúng một lần nữa sẽ giúp bạn nhớ
                 lâu hơn.";
               - the answer row's label is "Từ tiếng Anh đúng" and the row shows the
                 English word when the direction is Việt → Anh, so it always names the
                 half the learner did NOT supply;
               - "Các nghĩa khác có thể chấp nhận" appears whenever the word HAS
                 alternatives — on a correct answer too, which is why the chips above
                 are drawn in this (correct) state. Hiding them on a hit would withhold
                 the one thing that turns a lucky match into a known word;
               - the explanation and the examples render exactly as they do here.

             The alternative rows stay ABSENT when the word has none, in either
             direction.

             SCREENS-V2.md section 15b carries the same list, and
             check_review_frames.py fails if the two stop agreeing. -->
        <section class="card card--edge pad-x" style="margin-top:16px">
            <div class="rowbox rowbox--center g12" style="border-radius:var(--r-card);padding:14px 16px">
                <span class="answer__key" style="border-color:var(--correct);background:var(--correct-soft);color:var(--correct)">${icon('check', 16)}</span>
                <span class="grow">
                    <strong class="t-label" style="display:block">Trả lời chính xác</strong>
                    <span class="t-micro muted">Rất tốt. Bạn đã nhớ chắc từ này rồi.</span>
                </span>
            </div>

            <div class="rowbox rowbox--between" style="margin-top:14px;padding:14px 16px;border-radius:var(--r-card);background:var(--correct-soft)">
                <span>
                    <span class="t-micro muted" style="display:block">Nghĩa đúng</span>
                    <strong class="t-label">mitigate → làm giảm bớt mức độ nghiêm trọng</strong>
                </span>
                <button class="btn btn--ghost btn--sm" type="button">${icon('headphones', 16)} Nghe</button>
            </div>

            <div style="margin-top:14px">
                <span class="t-micro muted" style="display:block;margin-bottom:6px">Các nghĩa khác có thể chấp nhận</span>
                <div class="row g8 wrap">
                    <span class="chip chip--teal">giảm nhẹ</span>
                    <span class="chip chip--teal">xoa dịu</span>
                </div>
            </div>

            <hr class="hr" style="margin:16px 0">

            <!-- The explanation is MARKDOWN, not a sentence. The field is model-written text that
                 uses bold, italic and lists to separate the rule from the examples, and rendering it
                 as a plain string left the asterisks on screen. Rich text here, with the same tokens
                 as the AI explain screen — and no raw HTML, because the source is untrusted model
                 output. -->
            <div class="rowbox g12" style="align-items:flex-start">
                <span class="t-micro muted" style="flex:0 0 auto;padding-top:2px">${icon('sparkle', 14)}</span>
                <div class="grow">
                    <strong class="t-micro" style="display:block">Giải thích rõ hơn</strong>
                    <div class="md">
                        <p class="t-body soft">Đi với <strong>tác động tiêu cực</strong> cần giảm bớt — không đi với một việc tốt.</p>
                        <ul class="t-body soft">
                            <li><em>mitigate the risk</em> — giảm thiểu rủi ro</li>
                            <li><em>mitigate the damage</em> — giảm nhẹ thiệt hại</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div style="margin-top:14px">
                <strong class="t-micro">Ví dụ sử dụng</strong>
                <div class="rowbox" style="margin-top:8px;padding:12px 14px;border-radius:var(--r-card);background:var(--surface-alt)">
                    <div>
                        <span class="t-body">Governments can <mark>mitigate</mark> air pollution by investing in public transport.</span>
                        <span class="t-micro muted" style="display:block;margin-top:4px">Chính phủ có thể giảm ô nhiễm không khí bằng cách đầu tư vào giao thông công cộng.</span>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- The action is in the FOOTER, not under the card: on a phone this is the
         difference between a thumb reach and a scroll. -->
    <footer class="take__foot">
        <div class="take__foot-inner">
            <span class="t-micro muted hide-sm">Anh → Việt</span>
            <span class="grow"></span>
            <a class="btn btn--primary btn--lg" href="15b-review-practice.html">Tiếp theo ${icon('arrowRight', 18)}</a>
        </div>
    </footer>
</div>`,
    style: `
.take__main { max-width: 620px; }
mark { background: var(--amber-soft); color: inherit; border-radius: 3px; padding: 0 2px; }
/* Rendered markdown: the first and last child must not add a margin of their own, or the block
   gains a phantom gap inside a card that already has padding. */
.md > :first-child { margin-top: 0; }
.md > :last-child { margin-bottom: 0; }
.md p { margin: 2px 0 0; }
.md ul { margin: 6px 0 0; padding-left: 18px; list-style: disc; }
.md li { margin-top: 2px; }
@media (max-width: 479px) { .hide-sm { display: none; } }
`,
},

/* =================================================================== 15c */
'15c-review-result': {
    file: '15c-review-result.html',
    title: 'Ôn tập · kết quả',
    subtitle: 'Xếp hạng · so với phiên trước · bảng chi tiết',
    group: 'Từ vựng',
    note: 'kết quả dẫn thẳng tới lượt ôn từ sai',
    body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html"><span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span></a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="36-ai-chat.html">${icon('sparkle', 20)}<span>AI Coach</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
        </nav>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            <a class="btn btn--ghost btn--icon btn--sm" href="15-review.html" aria-label="Quay lại">${icon('arrowLeft', 18)}</a>
            <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Ôn tập từ vựng</h1>
            <p class="t-micro muted">Kết quả phiên ôn</p></div>
            ${accountHeader()}
</header>

        <main class="shell__content shell__content--wide" id="main">
            <!-- THE FIRST-SESSION STATE, specified here because the picture above is of a learner who
                 has been here before. With no previous session there is nothing to compare against,
                 so the accuracy card keeps its title and drops the comparison SENTENCE — it does not
                 print "0% so với phiên trước", which would read as a collapse rather than as a first
                 attempt. The chip is replaced by the line "Phiên đầu tiên — chưa có gì để so sánh."
                 and the bar still shows the accuracy, because a first number is worth as much as a
                 delta. Everything else on the screen is unchanged.
                 SCREENS-V2.md section 15c carries the same rule. -->
            <!-- The verdict is the hero, and Lexi reacts to it.

                 THE GLYPH IS AN EMOJI, not a line icon: 🌟 at t-display-xl, with the verdict as a
                 separate h2 under it and the sentence about the session under that. Three sizes on
                 one line of sight, so the reader gets "how did it go" before "17 on 20 before
                 5 minutes 12 seconds".

                 Only the "Rất tốt" case is drawn here, so the other three verdicts take a glyph from
                 the same family and this list IS the design:
                   excellent → 🌟 · good → ✨ · improving → 📈 · needsReview → 📚
                 SCREENS-V2.md section 15c carries the same four, and check_review_frames.py fails if
                 the two stop agreeing. -->
            <section class="card card--hero card--edge pad-x">
                <div class="row g16 wrap">
                    <span data-lexi="celebrate" data-size="md"></span>
                    <div class="grow">
                        <span class="t-display-xl" aria-hidden="true">🌟</span>
                        <h2 class="t-h2" style="margin-top:4px">Rất tốt</h2>
                        <p class="t-body soft" style="margin-top:4px">Bạn đã trả lời đúng 17 trên 20 từ.</p>
                        <p class="t-micro muted" style="margin-top:6px">Phiên 20 từ · Anh → Việt · 5 phút 12 giây</p>
                    </div>
                </div>
            </section>

            <!-- Four tiles as SIBLINGS of the hero, so nothing is a card inside a card. -->
            <div class="grid g-4" style="margin-top:16px">
                ${stat('20', 'Tổng', '', 'target')}
                ${stat('17', 'Đúng', 'teal', 'check')}
                ${stat('3', 'Sai', '', 'cross')}
                ${stat('85%', 'Độ chính xác', 'amber', 'chart')}
            </div>

            <section class="card card--edge pad-x" style="margin-top:16px">
                <div class="between wrap g12">
                    <div>
                        <span class="t-label">Tỉ lệ chính xác</span>
                        <span class="t-micro muted" style="display:block">So với phiên trước</span>
                    </div>
                    <span class="chip chip--correct">${icon('arrowUp', 14)} +6% so với phiên trước</span>
                </div>
                <div style="margin-top:12px">${bar(85, '')}</div>
            </section>

            <section class="card card--edge" style="margin-top:16px;overflow:hidden">
                <div class="pad-l"><span class="t-label">Chi tiết phiên ôn</span></div>

                <!-- Desktop: a real table. -->
                <div class="hide-lg scroll-x">
                    <table class="tbl">
                        <thead><tr>
                            <th style="width:52px">#</th><th>Thẻ nhắc</th><th>Câu trả lời</th><th>Đáp án đúng</th><th style="width:110px">Kết quả</th>
                        </tr></thead>
                        <tbody>
                            ${[
                                ['mitigate', 'làm giảm bớt', 'làm giảm bớt mức độ nghiêm trọng', true],
                                ['sustainable', 'bền vững', 'bền vững', true],
                                ['deplete', 'làm cạn kiệt', 'làm suy giảm', false],
                                ['incentive', 'khuyến khích', 'khuyến khích', true],
                                ['mitigate', 'giảm nhẹ', 'làm giảm bớt mức độ nghiêm trọng', true],
                            ].map(([prompt, answer, correct, ok], i) => `
                                <tr>
                                    <td class="mono muted">${i + 1}</td>
                                    <td><strong style="color:var(--teal)">${prompt}</strong></td>
                                    <td style="color:${ok ? 'var(--correct)' : 'var(--wrong)'}">${answer}</td>
                                    <td class="soft">${correct}</td>
                                    <td><span class="chip chip--${ok ? 'correct' : 'wrong'}">${ok ? 'Đúng' : 'Sai'}</span></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Mobile: one row per word. No horizontal scroll, ever. -->
                <ul class="only-mobile stack" style="padding:12px">
                    ${[
                        ['mitigate', 'làm giảm bớt', 'làm giảm bớt mức độ nghiêm trọng', true],
                        ['deplete', 'làm cạn kiệt', 'làm suy giảm', false],
                    ].map(([prompt, answer, correct, ok]) => `
                        <li class="rowbox" style="padding:12px;align-items:flex-start">
                            <div class="grow">
                                <strong class="t-label" style="color:var(--teal)">${prompt}</strong>
                                <span class="t-micro" style="display:block;color:${ok ? 'var(--correct)' : 'var(--wrong)'}">${answer}</span>
                                <span class="t-micro muted" style="display:block">Đáp án đúng: ${correct}</span>
                            </div>
                            <span class="chip chip--${ok ? 'correct' : 'wrong'}">${ok ? 'Đúng' : 'Sai'}</span>
                        </li>`).join('')}
                </ul>
            </section>

            <div class="row g12 wrap" style="margin-top:16px">
                <a class="btn btn--primary btn--lg grow" href="15b-review-practice.html">${icon('refresh', 18)} Ôn lại 3 từ khó</a>
                <a class="btn btn--ghost btn--lg" href="15-review.html">${icon('rotate', 18)} Ôn lại</a>
                <a class="btn btn--ghost btn--lg" href="12-dictionary.html">Sổ tay từ vựng</a>
            </div>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="36-ai-chat.html">${icon('sparkle', 22)}<span>AI Coach</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33b-account-menu.html">${icon('menu', 22)}<span>Thêm</span></a>
        </nav>
    </div>
    ${lexiFab()}
</div>`,
    /* No frame-local CSS: this frame used to carry the stepper rules, and the table/list split uses
       `.hide-lg` / `.only-mobile`, which `tokens.css` owns. Leaving an empty block makes that
       explicit rather than looking like an oversight. */
    style: `
`,
},};
