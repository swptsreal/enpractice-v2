/**
 * Nguồn dữ liệu SEO duy nhất cho các route public.
 *
 * Module này KHÔNG được dùng API của browser (`window`, `document`) hay của Vite
 * (`import.meta.env`) để `public/_worker.js` và `scripts/prerender.mjs` có thể
 * đọc được bằng Node thuần.
 *
 * `tests/seoRoutes.test.js` so khớp bảng dữ liệu dưới đây với bảng mirror trong
 * `public/_worker.js` — sửa một bên mà không sửa bên kia sẽ fail test.
 */

export const SITE_ORIGIN = 'https://enpractice.site';

/** Ngôn ngữ dùng cho metadata trong HTML gốc do edge trả về. */
export const SEO_DEFAULT_LANGUAGE = 'vi';

export const ROBOTS_INDEX = 'index, follow';
export const ROBOTS_NOINDEX = 'noindex, follow';

/**
 * Route được index. `prerender: true` nghĩa là nội dung tĩnh đủ an toàn để render
 * sẵn ở build time (không phụ thuộc API) — xem `scripts/prerender.mjs`.
 */
export const INDEXABLE_ROUTES = {
    '/': {
        slug: 'home',
        prerender: true,
        changefreq: 'weekly',
        priority: '1.0',
        title: {
            vi: 'EN Practice – Luyện IELTS & Từ Vựng Tiếng Anh Miễn Phí',
            en: 'EN Practice – Learn English & Prepare for IELTS with AI',
        },
        description: {
            vi: 'Luyện thi IELTS 4 kỹ năng Listening, Reading, Writing, Speaking với AI chấm điểm tự động, ôn từ vựng ngắt quãng và trợ lý AI cá nhân. Miễn phí bắt đầu.',
            en: 'Practice IELTS Listening, Reading, Writing and Speaking with instant AI grading, spaced-repetition vocabulary and a personal AI coach. Free to start.',
        },
    },
    '/vocabulary': {
        slug: 'vocabulary',
        changefreq: 'weekly',
        priority: '0.9',
        title: {
            vi: 'Kiểm Tra Từ Vựng Tiếng Anh Bằng AI | EN Practice',
            en: 'AI Vocabulary Test | EN Practice',
        },
        description: {
            vi: 'Làm bài test từ vựng tiếng Anh do AI sinh theo chủ đề, nhận điểm ngay và lộ trình ôn tập cá nhân hóa. Dùng miễn phí, không cần đăng nhập.',
            en: 'Take AI-generated English vocabulary tests by topic, get instant scoring and a personalised review plan. Free to use without signing up.',
        },
    },
    '/vocabulary/check': {
        slug: 'vocabulary-check',
        changefreq: 'weekly',
        priority: '0.8',
        title: {
            vi: 'Tra Từ & Hỏi AI Nghĩa Của Từ Tiếng Anh | EN Practice',
            en: 'Check a Word & Ask AI | EN Practice',
        },
        description: {
            vi: 'Tra nghĩa, phiên âm, ví dụ và hỏi AI về bất kỳ từ tiếng Anh nào. Lưu từ vào sổ tay cá nhân để ôn tập sau.',
            en: 'Look up meaning, pronunciation and examples, and ask AI about any English word. Save words to your personal dictionary for later review.',
        },
    },
    '/dictionary': {
        slug: 'dictionary',
        changefreq: 'weekly',
        priority: '0.8',
        title: {
            vi: 'Sổ Tay Từ Vựng Tiếng Anh Cá Nhân | EN Practice',
            en: 'Personal Dictionary | EN Practice',
        },
        description: {
            vi: 'Quản lý sổ tay từ vựng cá nhân: lưu từ mới, gắn thẻ, ghi chú và ôn lại theo lịch ngắt quãng để nhớ lâu hơn.',
            en: 'Manage your personal dictionary: save new words, tag and annotate them, and review on a spaced-repetition schedule so they stick.',
        },
    },
    '/review': {
        slug: 'review',
        changefreq: 'weekly',
        priority: '0.7',
        title: {
            vi: 'Ôn Tập Từ Vựng Ngắt Quãng | EN Practice',
            en: 'Spaced-Repetition Vocabulary Review | EN Practice',
        },
        description: {
            vi: 'Ôn lại từ vựng đã học theo thuật toán ngắt quãng, tập trung vào đúng những từ bạn sắp quên. Miễn phí.',
            en: 'Review saved words with a spaced-repetition schedule that targets exactly what you are about to forget. Free to use.',
        },
    },
    '/evaluation': {
        slug: 'evaluation',
        changefreq: 'weekly',
        priority: '0.7',
        title: {
            vi: 'Đánh Giá Năng Lực & Tiến Độ Học Tiếng Anh | EN Practice',
            en: 'Learning Insights & Progress | EN Practice',
        },
        description: {
            vi: 'Xem điểm mạnh, điểm yếu và tiến độ học tiếng Anh của bạn qua dữ liệu luyện tập thực tế, kèm gợi ý cải thiện từ AI.',
            en: 'See your English learning strengths, weaknesses and progress from real practice data, with AI suggestions on what to improve next.',
        },
    },
    '/ai-chat': {
        slug: 'ai-chat',
        changefreq: 'weekly',
        priority: '0.8',
        title: {
            vi: 'Trò Chuyện Tiếng Anh Với AI | EN Practice',
            en: 'AI English Coach | EN Practice',
        },
        description: {
            vi: 'Luyện hội thoại tiếng Anh 1-1 với AI: sửa lỗi ngữ pháp, gợi ý cách diễn đạt tự nhiên hơn và giải thích ngay trong lúc trò chuyện.',
            en: 'Practise English conversation one-to-one with AI: get grammar corrections, more natural phrasing and instant explanations while you chat.',
        },
    },
    '/custom-speaking': {
        slug: 'custom-speaking',
        changefreq: 'weekly',
        priority: '0.7',
        title: {
            vi: 'Luyện Nói Tiếng Anh Theo Chủ Đề Tự Chọn | EN Practice',
            en: 'Custom Speaking Practice | EN Practice',
        },
        description: {
            vi: 'Tự chọn tình huống và chủ đề, luyện nói tiếng Anh với AI đóng vai, nhận phản hồi về phát âm, ngữ pháp và độ trôi chảy.',
            en: 'Pick your own scenario and topic, practise speaking with an AI role-play partner, and get feedback on pronunciation, grammar and fluency.',
        },
    },
};

/**
 * Prefix của mọi route thuộc app shell (yêu cầu đăng nhập, nội dung theo từng user).
 * Các route này trả `noindex` và đồng thời là whitelist chống soft 404.
 * So khớp theo segment: `/ielts` khớp `/ielts` và `/ielts/abc`, không khớp `/ielts-x`.
 */
export const APP_ROUTE_PREFIXES = [
    '/login',
    '/home',
    '/history',
    '/dictionary/review',
    '/vocabulary',
    '/ielts',
    '/writing',
    '/writing-practice',
    '/speaking',
    '/custom-speaking',
    '/leaderboard',
    '/rewards',
    '/credits',
    '/xp',
    '/profile',
    '/notifications',
    '/weekly-report',
    '/challenges',
    '/settings',
];

/** Chuẩn hoá pathname: bỏ query/hash, bỏ dấu `/` cuối (trừ root). */
export function normalizeSeoPath(pathname) {
    const raw = String(pathname || '/')
        .split('?')[0]
        .split('#')[0];

    if (!raw || raw === '/') {
        return '/';
    }

    const trimmed = raw.replace(/\/+$/, '');

    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function isAppRoutePath(pathname) {
    const path = normalizeSeoPath(pathname);

    return APP_ROUTE_PREFIXES.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    );
}

/**
 * Phân loại một pathname thành:
 * - `indexable`: route public, được index và có thể có HTML prerender
 * - `app`: route hợp lệ nhưng thuộc app shell → noindex
 * - `unknown`: không tồn tại → phải trả HTTP 404
 */
export function resolveRouteSeo(pathname) {
    const path = normalizeSeoPath(pathname);
    const route = INDEXABLE_ROUTES[path];

    if (route) {
        return { path, kind: 'indexable', route };
    }

    if (isAppRoutePath(path)) {
        return { path, kind: 'app', route: null };
    }

    return { path, kind: 'unknown', route: null };
}

/** Metadata theo ngôn ngữ UI; fallback về ngôn ngữ mặc định của SEO. */
export function getLocalizedRouteMeta(route, language) {
    if (!route) {
        return { title: '', description: '' };
    }

    const lang = route.title?.[language] ? language : SEO_DEFAULT_LANGUAGE;

    return {
        title: route.title[lang],
        description: route.description[lang],
    };
}

/** Danh sách URL cho sitemap.xml (chỉ route indexable). */
export function getSitemapEntries() {
    return Object.entries(INDEXABLE_ROUTES).map(([path, route]) => ({
        url: `${SITE_ORIGIN}${path === '/' ? '/' : path}`,
        changefreq: route.changefreq,
        priority: route.priority,
        prerender: Boolean(route.prerender),
    }));
}
