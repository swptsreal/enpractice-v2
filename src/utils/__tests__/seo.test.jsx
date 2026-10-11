import { beforeEach, describe, expect, it } from 'vitest';
import { applySeoMeta } from '../seo';
import { INDEXABLE_ROUTES, SITE_ORIGIN } from '../../seo/routeSeo';

function resetHead() {
    document.head.innerHTML = [
        '<title>shell</title>',
        '<meta name="description" content="shell" />',
        '<meta name="robots" content="index, follow" />',
        `<link rel="canonical" href="${SITE_ORIGIN}/" />`,
        '<meta property="og:title" content="shell" />',
        '<meta property="og:description" content="shell" />',
        `<meta property="og:url" content="${SITE_ORIGIN}/" />`,
        '<meta property="og:locale" content="vi_VN" />',
    ].join('');
    document.title = 'shell';
}

function meta(attribute, key) {
    return document.head
        .querySelector(`meta[${attribute}="${key}"]`)
        ?.getAttribute('content');
}

function canonical() {
    return document.head
        .querySelector('link[rel="canonical"]')
        ?.getAttribute('href');
}

describe('applySeoMeta', () => {
    beforeEach(resetHead);

    it('ghi title/description/canonical riêng cho route indexable', () => {
        const result = applySeoMeta('/vocabulary', 'vi');

        expect(result.kind).toBe('indexable');
        expect(document.title).toBe(INDEXABLE_ROUTES['/vocabulary'].title.vi);
        expect(meta('name', 'description')).toBe(
            INDEXABLE_ROUTES['/vocabulary'].description.vi
        );
        expect(meta('name', 'robots')).toBe('index, follow');
        expect(meta('property', 'og:url')).toBe(
            `${SITE_ORIGIN}/vocabulary`
        );
        expect(meta('property', 'og:title')).toBe(
            INDEXABLE_ROUTES['/vocabulary'].title.vi
        );
        expect(meta('property', 'og:locale')).toBe('vi_VN');
        expect(canonical()).toBe(`${SITE_ORIGIN}/vocabulary`);
    });

    it('đổi metadata theo ngôn ngữ UI', () => {
        applySeoMeta('/dictionary', 'en');

        expect(document.title).toBe(INDEXABLE_ROUTES['/dictionary'].title.en);
        expect(meta('property', 'og:locale')).toBe('en_US');
    });

    it('chuẩn hoá dấu / cuối path', () => {
        applySeoMeta('/ai-chat/', 'vi');

        expect(canonical()).toBe(`${SITE_ORIGIN}/ai-chat`);
    });

    it('app shell bị noindex và dùng fallbackTitle cho og:title', () => {
        const result = applySeoMeta('/home', 'vi', {
            fallbackTitle: 'Trang chủ | EN Practice',
        });

        expect(result.kind).toBe('app');
        expect(document.title).toBe('Trang chủ | EN Practice');
        expect(meta('name', 'robots')).toBe('noindex, follow');
        expect(meta('property', 'og:title')).toBe('Trang chủ | EN Practice');
        expect(canonical()).toBe(`${SITE_ORIGIN}/home`);
    });

    it('không tạo trùng thẻ meta', () => {
        applySeoMeta('/vocabulary', 'vi');
        applySeoMeta('/dictionary', 'vi');

        expect(
            document.head.querySelectorAll('link[rel="canonical"]')
        ).toHaveLength(1);
        expect(
            document.head.querySelectorAll('meta[name="description"]')
        ).toHaveLength(1);
        expect(
            document.head.querySelectorAll('meta[property="og:title"]')
        ).toHaveLength(1);
    });
});
