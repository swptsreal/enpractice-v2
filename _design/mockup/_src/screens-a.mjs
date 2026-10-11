/* Screens 01–03 — Marketing & Auth. */
import { shell, icon, bar, SHELL_CSS } from '../assets/shell.js';
import { lexi } from '../assets/lexi.js';

export const screens = {

/* ==================================================================== 01 */
'01-landing': {
    file: '01-landing.html',
    title: 'Landing',
    subtitle: 'Persuade · chưa đăng nhập',
    group: 'Marketing & Auth',
    note: 'Hero + 6 section · variance cao nhất trong hệ',
    body: `
<div class="landing">
    <header class="landing__nav">
        <div class="container row g12">
            <a class="row g8" href="01-landing.html" style="color:inherit">
                ${lexi({ mood: 'idle', size: 'xs' })}
                <strong class="t-h3">EN Practice</strong>
            </a>
            <nav class="row g24 hide-lg" style="margin-left:24px" aria-label="Trong trang">
                <a class="t-label soft" href="#skills">Kỹ năng</a>
                <a class="t-label soft" href="#how">Cách học</a>
                <a class="t-label soft" href="#free">Miễn phí</a>
                <a class="t-label soft" href="#faq">Hỏi đáp</a>
            </nav>
            <div class="grow"></div>
            <a class="btn btn--ghost btn--sm" href="02-login.html">Đăng nhập</a>
            <a class="btn btn--primary btn--sm" href="02-login.html">Bắt đầu miễn phí</a>
        </div>
    </header>

    <!-- HERO: asymmetric split, not a centred stack. Fits one viewport. -->
    <section class="hero-wash">
        <div class="container hero">
            <div class="hero__copy">
                <span class="chip chip--teal">${icon('sparkle', 14)} AI chấm Writing &amp; Speaking</span>
                <h1 class="t-display-xl">Luyện IELTS<br/>mỗi ngày một bước.</h1>
                <p class="t-body-lg soft" style="max-width:44ch">
                    Từ vựng, Listening, Reading, Writing, Speaking. Chấm điểm theo tiêu chí
                    IELTS và chỉ ra lỗi trên chính bài của bạn. Phần học cốt lõi miễn phí.
                </p>
                <div class="row g12 wrap">
                    <a class="btn btn--primary btn--lg" href="02-login.html">Bắt đầu miễn phí ${icon('arrowRight', 18)}</a>
                    <a class="btn btn--ghost btn--lg" href="#how">Xem cách hoạt động</a>
                </div>
                <p class="t-micro muted">Không cần thẻ. Không cam kết điểm số.</p>
            </div>

            <!-- Product mock: real UI, labelled as illustration in the caption. -->
            <figure class="hero__mock" aria-label="Minh hoạ giao diện bài chấm Writing">
                <div class="mock__chrome">
                    <span class="mock__dot"></span><span class="mock__dot"></span><span class="mock__dot"></span>
                    <span class="t-micro muted" style="margin-left:8px">enpractice.site/writing/submission</span>
                </div>
                <div class="mock__body">
                    <div class="between">
                        <span class="t-label">Writing Task 2</span>
                        <span class="band">6.5</span>
                    </div>
                    <div class="stack g8" style="margin-top:12px">
                        ${['Task Response', 'Coherence & Cohesion', 'Lexical Resource', 'Grammar'].map((c, i) => `
                            <div>
                                <div class="between"><span class="t-micro soft">${c}</span><span class="t-micro mono">${[6.5, 7, 6, 6.5][i]}</span></div>
                                ${bar([72, 78, 66, 72][i])}
                            </div>`).join('')}
                    </div>
                    <div class="verdict" style="margin-top:14px;padding:10px 12px">
                        ${lexi({ mood: 'explain', size: 'xs' })}
                        <span class="t-micro">Đoạn 2 lặp "important" 3 lần — thử "crucial", "vital".</span>
                    </div>
                </div>
                <figcaption class="t-micro muted" style="padding:8px 12px;border-top:2px solid var(--border)">
                    Minh hoạ sản phẩm, không phải bài làm của người dùng thật.
                </figcaption>
            </figure>
        </div>
    </section>

    <!-- Four skills: 4 real cells, no filler, no centred card row -->
    <section class="container section" id="skills">
        <h2 class="t-display">Bốn kỹ năng, một vòng lặp</h2>
        <p class="t-body soft" style="max-width:56ch;margin-top:8px">
            Làm bài → nhận phản hồi có căn cứ → được gợi ý bài tiếp theo. Không phải bốn công cụ rời.
        </p>
        <div class="grid g-auto" style="margin-top:24px">
            ${[
                ['headphones', 'Listening', 'Nghe theo section, xem transcript sau khi nộp.'],
                ['book', 'Reading', 'Đọc bài và trả lời song song, có điều hướng câu hỏi.'],
                ['pen', 'Writing', 'AI chấm theo 4 tiêu chí và sửa lỗi ngay trên bài.'],
                ['mic', 'Speaking', 'Ghi âm theo cue card, phân tích phát âm và độ trôi chảy.'],
            ].map(([ic, t, d]) => `
                <article class="card card--edge pad-x">
                    <span class="skill__icon">${icon(ic, 26)}</span>
                    <h3 class="t-h3" style="margin-top:12px">${t}</h3>
                    <p class="t-body muted" style="margin-top:4px">${d}</p>
                </article>`).join('')}
        </div>
    </section>

    <!-- Vocabulary band: the second half of the product, asymmetric -->
    <section class="container section">
        <div class="band-split">
            <div class="card card--hero pad-x" style="background:var(--teal-soft);border-color:var(--teal)">
                <span class="chip chip--teal">${icon('book', 14)} Từ vựng</span>
                <h2 class="t-h2" style="margin-top:12px">Sổ tay từ vựng biết bạn quên từ nào</h2>
                <p class="t-body soft" style="margin-top:8px">
                    Lưu từ khi đang đọc, gắn thẻ, và ôn lại theo lịch ngắt quãng.
                    Từ hay sai sẽ tự quay lại nhiều hơn.
                </p>
                <div class="row g8 wrap" style="margin-top:16px">
                    <span class="chip">Ôn ngắt quãng</span>
                    <span class="chip">Tra từ bằng AI</span>
                    <span class="chip">Test do AI tạo</span>
                </div>
            </div>
            <div class="stack g16">
                ${[
                    ['07-vocabulary-check.html', 'search', 'Tra từ &amp; hỏi AI', 'Giải thích theo ngữ cảnh bài bạn đang đọc.'],
                    ['12-dictionary.html', 'book', 'Sổ tay cá nhân', 'Lưu, gắn thẻ, ghi chú, theo dõi mức độ nhớ.'],
                    ['13-dictionary-review.html', 'target', 'Ôn flashcard', 'Thẻ lật, 4 mức nhớ, lặp lại ngắt quãng.'],
                ].map(([h, ic, t, d]) => `
                    <a class="card card--edge pad row g16" href="${h}" style="color:inherit">
                        <span class="row" style="width:44px;height:44px;display:grid;place-items:center;border-radius:var(--r-control);background:var(--surface-alt);color:var(--teal)">${icon(ic, 22)}</span>
                        <span class="grow"><strong class="t-h3" style="display:block">${t}</strong><span class="t-micro muted">${d}</span></span>
                        ${icon('arrowRight', 18)}
                    </a>`).join('')}
            </div>
        </div>
    </section>

    <!-- How it works: 3 steps, numbered by real sequence -->
    <section class="container section" id="how">
        <h2 class="t-display">Cách hoạt động</h2>
        <ol class="steps" style="margin-top:24px">
            ${[
                ['Làm một bài ngắn', 'Chọn kỹ năng hoặc để hệ thống gợi ý theo mục tiêu band của bạn.'],
                ['Nhận phản hồi có căn cứ', 'Writing và Speaking được chấm theo tiêu chí IELTS, kèm lý do cụ thể.'],
                ['Theo lộ trình', 'Điểm yếu được đưa vào kế hoạch ngày. XP và báo cáo tuần giữ nhịp.'],
            ].map(([t, d], i) => `
                <li class="step">
                    <span class="step__num mono">${i + 1}</span>
                    <div><h3 class="t-h3">${t}</h3><p class="t-body muted" style="margin-top:4px">${d}</p></div>
                </li>`).join('')}
        </ol>
    </section>

    <!-- Free boundary: must be honest, per PRODUCT.md -->
    <section class="container section" id="free">
        <div class="card card--hero pad-x" style="border-color:var(--border-strong)">
            <div class="free-split">
                <div>
                    <h2 class="t-h2">Học cốt lõi miễn phí</h2>
                    <p class="t-body soft" style="margin-top:8px;max-width:52ch">
                        Bạn được cấp credit miễn phí đủ cho phần học cốt lõi. Credit chỉ dùng cho
                        các hành động AI tốn chi phí thật, và bảng phí được công khai trong ví.
                    </p>
                </div>
                <ul class="stack g12" style="min-width:260px">
                    ${[
                        ['check', 'Làm đề Listening &amp; Reading'],
                        ['check', 'Sổ tay từ vựng &amp; ôn ngắt quãng'],
                        ['check', 'Báo cáo tiến độ hằng tuần'],
                        ['coin', 'Hành động AI tốn credit (có bảng phí)'],
                    ].map(([ic, t]) => `<li class="row g12"><span style="color:var(--teal)">${icon(ic, 18)}</span><span class="t-body">${t}</span></li>`).join('')}
                </ul>
            </div>
        </div>
    </section>

    <!-- FAQ: 4 real questions, answers open by default on the first -->
    <section class="container section" id="faq">
        <h2 class="t-display">Câu hỏi thường gặp</h2>
        <div class="stack g12" style="margin-top:20px;max-width:820px">
            ${[
                ['Trải nghiệm học cốt lõi có thật sự miễn phí không?', 'Có. Bạn được cấp đủ credit miễn phí cho phần học cốt lõi để bắt đầu.'],
                ['AI chấm Writing có đáng tin không?', 'Bài được chấm theo 4 tiêu chí IELTS và luôn kèm lý do cùng đoạn cụ thể. Bạn nên xem đây là phản hồi luyện tập, không phải điểm thi chính thức.'],
                ['Có cần cài app không?', 'Không. Đây là web app, có thể thêm vào màn hình chính để nhận nhắc học. Speaking cần micro và kết nối HTTPS.'],
                ['Tôi tự học, không có giáo viên — có phù hợp không?', 'Đây chính là nhóm người dùng sản phẩm được làm cho: phản hồi trên bài của bạn và một lý do cụ thể để quay lại ngày mai.'],
            ].map(([q, a], i) => `
                <details class="faq" ${i === 0 ? 'open' : ''}>
                    <summary class="t-h3">${q}</summary>
                    <p class="t-body muted" style="margin-top:8px">${a}</p>
                </details>`).join('')}
        </div>
    </section>

    <section class="container section">
        <div class="cta-band">
            ${lexi({ mood: 'excited', size: 'lg', label: 'Lexi' })}
            <div class="grow">
                <h2 class="t-display" style="font-size:2rem">Bắt đầu bài đầu tiên hôm nay</h2>
                <p class="t-body soft">Mất khoảng 10 phút. Không cần thẻ.</p>
            </div>
            <a class="btn btn--primary btn--lg" href="02-login.html">Bắt đầu miễn phí</a>
        </div>
    </section>

    <footer class="landing__foot">
        <div class="container row g24 wrap between">
            <div class="row g8">${lexi({ mood: 'idle', size: 'xs' })}<strong class="t-label">EN Practice</strong></div>
            <nav class="row g24 wrap" aria-label="Chân trang">
                <a class="t-micro muted" href="01-landing.html">Giới thiệu</a>
                <a class="t-micro muted" href="#faq">Hỏi đáp</a>
                <a class="t-micro muted" href="35-settings.html">Cài đặt</a>
            </nav>
            <span class="t-micro muted">© 2026 enpractice.site</span>
        </div>
    </footer>
</div>`,
    style: `
.landing__nav { position: sticky; top: 0; z-index: 20; background: var(--surface); border-bottom: 2px solid var(--border); }
.landing__nav .container { min-height: 68px; }
.hero { display: grid; grid-template-columns: 1.05fr .95fr; gap: 48px; align-items: center; padding: 56px 0 72px; }
@media (max-width: 1023px) { .hero { grid-template-columns: 1fr; gap: 32px; padding: 32px 0 40px; } }
.hero__copy { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.hero__mock { margin: 0; background: var(--surface); border: 2px solid var(--border-strong); border-radius: var(--r-hero); overflow: hidden; box-shadow: 0 6px 0 -2px var(--border), 0 28px 48px -28px rgb(20 35 43 / .4); }
.mock__chrome { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border-bottom: 2px solid var(--border); background: var(--surface-alt); }
.mock__dot { width: 10px; height: 10px; border-radius: 999px; background: var(--border-strong); }
.mock__body { padding: 16px; }
.section { padding: 64px 0; }
@media (max-width: 767px) { .section { padding: 40px 0; } }
.skill__icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: var(--r-control); background: var(--teal-soft); color: var(--teal); }
.band-split { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 1023px) { .band-split { grid-template-columns: 1fr; } }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 0; list-style: none; }
@media (max-width: 767px) { .steps { grid-template-columns: 1fr; } }
.step { display: flex; gap: 14px; }
.step__num { flex: 0 0 auto; width: 40px; height: 40px; display: grid; place-items: center; border-radius: var(--r-chip); background: var(--amber); color: var(--on-amber); font-weight: 700; }
.free-split { display: flex; gap: 32px; justify-content: space-between; flex-wrap: wrap; }
.faq { background: var(--surface); border: 2px solid var(--border); border-radius: var(--r-card); padding: 16px 18px; box-shadow: 0 4px 0 0 var(--border); }
.faq summary { cursor: pointer; list-style: none; }
.faq summary::-webkit-details-marker { display: none; }
.faq[open] summary { color: var(--teal); }
.cta-band { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; padding: 28px; border-radius: var(--r-hero); background: var(--teal-soft); border: 2px solid var(--teal); }
.landing__foot { border-top: 2px solid var(--border); background: var(--surface); padding: 24px 0; }
`,
},

/* ==================================================================== 02 */
'02-login': {
    file: '02-login.html',
    title: 'Đăng nhập / Đăng ký',
    subtitle: 'Auth · có guest trial',
    group: 'Marketing & Auth',
    note: 'Split panel · 1 cột dưới 1024px',
    body: `
<div class="auth">
    <aside class="auth__side hero-wash">
        <a class="row g8" href="01-landing.html" style="color:inherit">
            ${lexi({ mood: 'idle', size: 'xs' })}<strong class="t-h3">EN Practice</strong>
        </a>
        <div class="grow" style="display:flex;flex-direction:column;justify-content:center;gap:20px">
            ${lexi({ mood: 'excited', size: 'lg', label: 'Lexi chào bạn' })}
            <h2 class="t-display" style="font-size:2rem">Chào bạn, mình là Lexi.</h2>
            <p class="t-body-lg soft" style="max-width:36ch">
                Mình sẽ giữ nhịp học cho bạn và chỉ ra lỗi trên chính bài bạn làm.
            </p>
            <ul class="stack g12">
                ${[
                    'Phản hồi theo tiêu chí chấm IELTS',
                    'Sổ tay từ vựng biết bạn quên từ nào',
                    'Kế hoạch ngày gọn trong 10 phút',
                ].map((t) => `<li class="row g12"><span style="color:var(--teal)">${icon('check', 18)}</span><span class="t-body">${t}</span></li>`).join('')}
            </ul>
        </div>
        <p class="t-micro muted">Đây là minh hoạ giao diện. Không có số liệu người dùng thật.</p>
    </aside>

    <main class="auth__main" id="main">
        <div class="card card--raised pad-x auth__card">
            <div class="segmented" style="width:100%" role="tablist" aria-label="Chế độ">
                <button role="tab" aria-selected="true" data-act="toggle" style="flex:1">Đăng nhập</button>
                <button role="tab" aria-selected="false" data-act="toggle" style="flex:1">Đăng ký</button>
            </div>

            <h1 class="t-h1" style="margin-top:20px">Đăng nhập</h1>
            <p class="t-body muted" style="margin-top:4px">Tiếp tục lộ trình học của bạn.</p>

            <form class="stack g16" style="margin-top:20px" onsubmit="return false">
                <label class="field">
                    <span class="field__label">Email</span>
                    <input class="input" type="email" placeholder="ban@email.com" autocomplete="email" />
                </label>
                <label class="field">
                    <span class="field__label">Mật khẩu</span>
                    <input class="input" type="password" placeholder="Ít nhất 8 ký tự" autocomplete="current-password" />
                </label>
                <div class="between">
                    <label class="row g8 t-micro soft"><input type="checkbox" /> Ghi nhớ đăng nhập</label>
                    <a class="t-micro" href="02-login.html">Quên mật khẩu?</a>
                </div>
                <button class="btn btn--primary btn--block btn--lg" type="submit">Đăng nhập</button>
            </form>

            <div class="or"><span>hoặc</span></div>

            <div class="stack g12">
                <button class="btn btn--ghost btn--block" type="button">${icon('search', 18)} Tiếp tục với Google</button>
                <a class="btn btn--ghost btn--block" href="04-home.html">Học thử không cần tài khoản</a>
            </div>
            <p class="t-micro muted" style="margin-top:12px;text-align:center">
                Chế độ học thử dùng AI trong hạn mức mỗi ngày và không lưu tiến độ.
            </p>
        </div>
    </main>
</div>`,
    style: `
.auth { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
.auth__side { padding: 40px; display: flex; flex-direction: column; gap: 20px; border-right: 2px solid var(--border); }
.auth__main { display: grid; place-items: center; padding: 32px 20px; background: var(--canvas); }
.auth__card { width: 100%; max-width: 460px; }
@media (max-width: 1023px) {
    .auth { grid-template-columns: 1fr; }
    .auth__side { display: none; }
}
.or { position: relative; text-align: center; margin: 20px 0; }
.or::before { content: ''; position: absolute; inset: 50% 0 auto; height: 2px; background: var(--border); }
.or span { position: relative; background: var(--surface); padding: 0 10px; font-size: .8125rem; color: var(--ink-muted); }
`,
},

/* ==================================================================== 03 */
'03-onboarding': {
    file: '03-onboarding.html',
    title: 'Onboarding lần đầu',
    subtitle: '4 bước · Lexi dẫn dắt',
    group: 'Marketing & Auth',
    note: 'Không có nav · 1 quyết định mỗi bước',
    body: `
<div class="onb">
    <header class="onb__bar">
        <div class="row g12" style="width:100%;max-width:760px;margin-inline:auto">
            <span class="t-micro muted">Bước 1 / 4</span>
            <div class="grow">${bar(25)}</div>
            <a class="t-micro muted" href="04-home.html">Bỏ qua</a>
        </div>
    </header>

    <main class="onb__main" id="main">
        <div class="row g16" style="align-items:flex-end;justify-content:center;margin-bottom:8px">
            ${lexi({ mood: 'happy', size: 'xl', label: 'Lexi đang cười' })}
            <div class="bubble bubble--lexi bubble--left" style="max-width:280px">
                Mục tiêu band của bạn là bao nhiêu? Mình sẽ chọn bài vừa sức.
            </div>
        </div>

        <h1 class="t-display" style="text-align:center">Bạn đang nhắm band nào?</h1>
        <p class="t-body muted" style="text-align:center;max-width:48ch;margin:8px auto 0">
            Chọn một mục tiêu. Bạn đổi được bất cứ lúc nào trong phần Cá nhân.
        </p>

        <div class="onb__options" data-group>
            ${[
                ['5.0 – 5.5', 'Nền tảng · xây thói quen học'],
                ['6.0 – 6.5', 'Mục tiêu phổ biến nhất'],
                ['7.0 – 7.5', 'Cần độ chính xác cao'],
                ['Chưa xác định', 'Để Lexi gợi ý sau bài đầu tiên'],
            ].map(([b, d], i) => `
                <button class="onb__opt" type="button" data-act="select" aria-pressed="${i === 1}">
                    <span class="band">${b}</span>
                    <span class="grow"><strong class="t-h3" style="display:block">${b}</strong><span class="t-micro muted">${d}</span></span>
                    <span class="onb__radio" aria-hidden="true">${i === 1 ? icon('check', 16) : ''}</span>
                </button>`).join('')}
        </div>
    </main>

    <footer class="onb__foot">
        <div class="row g12" style="width:100%;max-width:760px;margin-inline:auto">
            <button class="btn btn--ghost" type="button" disabled>Quay lại</button>
            <div class="grow"></div>
            <a class="btn btn--primary btn--lg" href="04-home.html">Tiếp tục ${icon('arrowRight', 18)}</a>
        </div>
    </footer>
</div>`,
    style: `
.onb { min-height: 100vh; display: flex; flex-direction: column; }
.onb__bar { padding: 16px 20px; border-bottom: 2px solid var(--border); }
.onb__main { flex: 1; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; }
.onb__options { width: 100%; max-width: 560px; margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
.onb__opt {
    display: flex; align-items: center; gap: 14px; width: 100%; min-height: 76px; padding: 14px 16px;
    border: 2px solid var(--border-strong); border-radius: var(--r-card); background: var(--surface);
    color: inherit; text-align: left; cursor: pointer; box-shadow: 0 4px 0 0 var(--border-strong);
    transition: transform 90ms var(--ease-out), box-shadow 90ms var(--ease-out);
}
.onb__opt:active { transform: translateY(4px); box-shadow: 0 0 0 0 var(--border-strong); }
.onb__opt[aria-pressed='true'] { border-color: var(--teal); background: var(--teal-soft); box-shadow: 0 4px 0 0 var(--teal-strong); }
.onb__radio { width: 26px; height: 26px; border-radius: 999px; border: 2px solid var(--border-strong); display: grid; place-items: center; color: var(--teal); }
.onb__opt[aria-pressed='true'] .onb__radio { border-color: var(--teal); background: var(--teal); color: var(--on-teal); }
.onb__foot { padding: 16px 20px; border-top: 2px solid var(--border); background: var(--surface); }
`,
},

};
