/* Screens 07–15 — Vocabulary. */
import { shell, icon, stat, bar, emptyState, skeletonCard } from '../assets/shell.js';
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
                <a class="nav__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 20)}<span>Học</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
            <div class="nav__group">Từ vựng</div>
            <div class="nav">
                <a class="nav__item" href="07-vocabulary-check.html" aria-current="page">${icon('search', 18)}<span>Tra từ &amp; hỏi AI</span></a>
                <a class="nav__item" href="12-dictionary.html">${icon('book', 18)}<span>Sổ tay từ vựng</span></a>
                <a class="nav__item" href="08-vocabulary-list.html">${icon('target', 18)}<span>Test từ vựng</span></a>
                <a class="nav__item" href="13-dictionary-review.html">${icon('sparkle', 18)}<span>Ôn flashcard</span></a>
                <a class="nav__item" href="14-evaluation.html">${icon('chart', 18)}<span>Đánh giá năng lực</span></a>
                <a class="nav__item" href="15-review.html">${icon('clock', 18)}<span>Ôn ngắt quãng</span></a>
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
            <a class="tabbar__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 22)}<span>Học</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33-profile.html">${icon('user', 22)}<span>Cá nhân</span></a>
        </nav>
    </div>
</div>`,
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
                <a class="nav__item" href="07-vocabulary-check.html">${icon('book', 20)}<span>Học</span></a>
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
                        ['Education', '20 từ · 10 phút', 'AI tạo', 0],
                        ['Environment', '25 từ · 12 phút', 'AI tạo', 0],
                        ['Technology', '20 từ · 10 phút', 'Của tôi', 72],
                        ['Health', '18 từ · 9 phút', 'Của tôi', 85],
                        ['Urbanisation', '22 từ · 11 phút', 'AI tạo', 0],
                        ['Culture', '20 từ · 10 phút', 'Của tôi', 60],
                    ].map(([topic, meta, src, score]) => `
                        <article class="card card--edge pad-x">
                            <div class="between">
                                <span class="chip ${src === 'AI tạo' ? 'chip--teal' : ''}">${src}</span>
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
            <a class="tabbar__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 22)}<span>Học</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33-profile.html">${icon('user', 22)}<span>Cá nhân</span></a>
        </nav>
    </div>
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
.take { min-height: 100vh; display: flex; flex-direction: column; background: var(--canvas); }
.take__bar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 2px solid var(--border); background: var(--surface); }
.take__main { flex: 1; width: 100%; max-width: 680px; margin-inline: auto; padding: 28px 16px 120px; text-align: center; }
.take__answers { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; text-align: left; }
.take__answers .answer[aria-pressed='true'] { border-color: var(--teal); background: var(--teal-soft); box-shadow: 0 4px 0 0 var(--teal-strong); }
.take__answers .answer[aria-pressed='true'] .answer__key { border-color: var(--teal); color: var(--teal); }
.take__foot { position: sticky; bottom: 0; background: var(--surface); border-top: 2px solid var(--border); padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); }
.take__foot-inner { max-width: 680px; margin-inline: auto; display: flex; align-items: center; gap: 12px; }
@media (max-width: 479px) { .take__foot-inner .btn--ghost { display: none; } .take__foot-inner .btn--primary { width: 100%; } }
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
                <a class="nav__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 20)}<span>Học</span></a>
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
            <a class="tabbar__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 22)}<span>Học</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33-profile.html">${icon('user', 22)}<span>Cá nhân</span></a>
        </nav>
    </div>
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
                <a class="nav__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 20)}<span>Học</span></a>
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
            <a class="tabbar__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 22)}<span>Học</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33-profile.html">${icon('user', 22)}<span>Cá nhân</span></a>
        </nav>
    </div>
</div>`,
    style: `
.tbl { width: 100%; border-collapse: collapse; }
.tbl th { text-align: left; padding: 12px 16px; font-size: .8125rem; font-weight: 700; color: var(--ink-muted); background: var(--surface-alt); border-bottom: 2px solid var(--border); }
.tbl td { padding: 12px 16px; border-bottom: 2px solid var(--border); vertical-align: middle; }
.tbl tr:last-child td { border-bottom: 0; }
`,
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
                <a class="nav__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 20)}<span>Học</span></a>
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
            <a class="tabbar__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 22)}<span>Học</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33-profile.html">${icon('user', 22)}<span>Cá nhân</span></a>
        </nav>
    </div>
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
                <a class="nav__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 20)}<span>Học</span></a>
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
            <a class="tabbar__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 22)}<span>Học</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33-profile.html">${icon('user', 22)}<span>Cá nhân</span></a>
        </nav>
    </div>
</div>`,
    style: `
.eval-head { display: flex; gap: 20px; align-items: center; }
.eval-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
@media (max-width: 1023px) { .eval-cols { grid-template-columns: 1fr; } }
`,
},

/* ==================================================================== 15 */
'15-review': {
  file: '15-review.html',
  title: 'Ôn tập ngắt quãng',
  subtitle: 'Config → practice → result',
  group: 'Từ vựng',
  note: 'Bước 1/3 · cho thấy trước sẽ mất bao lâu',
  body: `
<div class="shell">
    <aside class="shell__rail">
        <a class="shell__brand" href="04-home.html"><span data-lexi="idle" data-size="xs"></span>
            <span class="grow"><span class="t-h3" style="display:block">EN Practice</span><span class="t-micro muted">Mỗi ngày một bước</span></span></a>
        <nav class="shell__nav" aria-label="Điều hướng chính">
            <div class="nav">
                <a class="nav__item" href="04-home.html">${icon('home', 20)}<span>Trang chủ</span></a>
                <a class="nav__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 20)}<span>Học</span></a>
                <a class="nav__item" href="16-ielts-list.html">${icon('target', 20)}<span>Luyện tập</span></a>
                <a class="nav__item" href="29-weekly-report.html">${icon('chart', 20)}<span>Tiến độ</span></a>
                <a class="nav__item" href="33-profile.html">${icon('user', 20)}<span>Cá nhân</span></a>
            </div>
        </nav>
    </aside>

    <div class="shell__main">
        <header class="shell__header">
            <div class="grow" style="min-width:0"><h1 class="t-h1 truncate">Ôn tập ngắt quãng</h1>
            <p class="t-micro muted">Bước 1 / 3 — chọn nội dung ôn</p></div>
        </header>

        <main class="shell__content shell__content--focus" id="main">
            <ol class="stepper" aria-label="Tiến trình">
                ${['Chọn nội dung', 'Ôn', 'Kết quả'].map((s, i) => `
                    <li class="stepper__i ${i === 0 ? 'is-on' : ''}"><span class="stepper__d mono">${i + 1}</span><span class="t-micro ${i === 0 ? '' : 'muted'}">${s}</span></li>`).join('')}
            </ol>

            <section class="card card--edge pad-x" style="margin-top:20px">
                <div class="row g12">
                    <span data-lexi="explain" data-size="sm"></span>
                    <p class="t-body grow">Bạn có <strong>34 từ</strong> đến hạn. Ôn hết sẽ mất khoảng <strong>9 phút</strong>.</p>
                </div>

                <fieldset style="border:0;padding:0;margin-top:20px">
                    <legend class="t-label" style="margin-bottom:10px">Nội dung ôn</legend>
                    <div class="stack g8" data-group>
                        ${[
                            ['Ôn từ vựng đến hạn', '34 từ · 9 phút', true],
                            ['Từ hay quên', '8 từ · 3 phút', false],
                            ['Theo thẻ bạn chọn', 'Environment, Health', false],
                            ['Ôn tất cả sổ tay', '128 từ · 34 phút', false],
                        ].map(([t, m, on]) => `
                            <button class="answer" type="button" data-select aria-pressed="${on}" style="min-height:58px">
                                <span class="answer__key" style="border-radius:999px">${on ? icon('check', 14) : ''}</span>
                                <span class="grow"><strong class="t-label" style="display:block">${t}</strong><span class="t-micro muted">${m}</span></span>
                            </button>`).join('')}
                    </div>
                </fieldset>

                <div class="row g12 wrap" style="margin-top:20px">
                    <div class="grow">
                        <span class="t-micro muted">Chiều ôn</span>
                        <div class="segmented" style="margin-top:4px">
                            <button aria-pressed="true">Anh → Việt</button>
                            <button aria-pressed="false">Việt → Anh</button>
                            <button aria-pressed="false">Trộn</button>
                        </div>
                    </div>
                </div>
            </section>

            <div class="row g12" style="margin-top:16px">
                <a class="btn btn--primary btn--lg grow" href="13-dictionary-review.html">Bắt đầu ôn (9 phút)</a>
                <a class="btn btn--ghost btn--lg" href="04-home.html">Để sau</a>
            </div>
        </main>

        <nav class="tabbar only-mobile" aria-label="Điều hướng chính">
            <a class="tabbar__item" href="04-home.html">${icon('home', 22)}<span>Trang chủ</span></a>
            <a class="tabbar__item" href="07-vocabulary-check.html" aria-current="page">${icon('book', 22)}<span>Học</span></a>
            <a class="tabbar__item" href="16-ielts-list.html">${icon('target', 22)}<span>Luyện tập</span></a>
            <a class="tabbar__item" href="29-weekly-report.html">${icon('chart', 22)}<span>Tiến độ</span></a>
            <a class="tabbar__item" href="33-profile.html">${icon('user', 22)}<span>Cá nhân</span></a>
        </nav>
    </div>
</div>`,
    style: `
.stepper { display: flex; gap: 8px; align-items: center; padding: 0; }
.stepper__i { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: var(--r-chip); background: var(--surface-alt); }
.stepper__i.is-on { background: var(--teal-soft); }
.stepper__d { width: 22px; height: 22px; border-radius: 999px; background: var(--surface); display: grid; place-items: center; font-size: .6875rem; }
.stepper__i.is-on .stepper__d { background: var(--teal); color: var(--on-teal); }
.answer[aria-pressed='true'] { border-color: var(--teal); background: var(--teal-soft); box-shadow: 0 4px 0 0 var(--teal-strong); }
`,
},

};
