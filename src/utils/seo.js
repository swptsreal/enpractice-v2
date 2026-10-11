import {
    ROBOTS_INDEX,
    ROBOTS_NOINDEX,
    SEO_DEFAULT_LANGUAGE,
    SITE_ORIGIN,
    getLocalizedRouteMeta,
    resolveRouteSeo,
} from '../seo/routeSeo';

export const SITE_URL = (
    import.meta.env.VITE_SITE_URL || SITE_ORIGIN
).replace(/\/+$/, '');

const DEFAULT_APP_DESCRIPTION =
    'EN Practice – nền tảng luyện tiếng Anh và IELTS với AI chấm điểm tự động.';

function normalizeCanonicalPath(pathname) {
    const path = pathname || '/';
    if (path.length > 1 && path.endsWith('/')) {
        return path.slice(0, -1);
    }
    return path;
}

export function getCanonicalUrl(pathname) {
    return `${SITE_URL}${normalizeCanonicalPath(pathname || '/')}`;
}

function upsertMeta(attribute, key, content) {
    if (!content) {
        return;
    }

    let element = document.head.querySelector(
        `meta[${attribute}="${key}"]`
    );

    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }

    element.setAttribute('content', content);
}

function upsertCanonical(href) {
    let link = document.querySelector('link[rel="canonical"]');

    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
    }

    link.setAttribute('href', href);
}

/**
 * Ghi metadata SEO của một route vào `<head>`.
 *
 * Dùng chung bảng dữ liệu với `public/_worker.js` nên title/description/canonical
 * mà client ghi khớp với HTML gốc do edge trả về.
 *
 * Route thuộc app shell không có metadata riêng: `options.fallbackTitle`
 * (title theo i18n) được dùng để `og:title` không lệch khỏi `<title>`.
 *
 * @returns {{ handled: boolean, kind: string, canonical: string, title?: string, description?: string, robots: string }}
 */
export function applySeoMeta(
    pathname,
    language = SEO_DEFAULT_LANGUAGE,
    options = {}
) {
    const resolved = resolveRouteSeo(pathname);
    const canonical = getCanonicalUrl(resolved.path);
    const isIndexable = resolved.kind === 'indexable';
    const localized = isIndexable
        ? getLocalizedRouteMeta(resolved.route, language)
        : null;
    const robots = isIndexable ? ROBOTS_INDEX : ROBOTS_NOINDEX;
    const description = localized?.description || DEFAULT_APP_DESCRIPTION;
    const title = localized?.title || options.fallbackTitle || null;

    if (typeof document === 'undefined') {
        return {
            handled: false,
            kind: resolved.kind,
            canonical,
            robots,
            title,
            description,
        };
    }

    if (title) {
        document.title = title;
    }

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertCanonical(canonical);

    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta(
        'property',
        'og:locale',
        language === 'vi' ? 'vi_VN' : 'en_US'
    );

    upsertMeta('name', 'twitter:url', canonical);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    return {
        handled: Boolean(localized?.title),
        kind: resolved.kind,
        canonical,
        title,
        description,
        robots,
    };
}

/** Giữ lại cho tương thích: chỉ đồng bộ canonical + og:url + twitter:url. */
export function applySeoCanonical(pathname) {
    if (typeof document === 'undefined') {
        return;
    }

    const url = getCanonicalUrl(pathname);
    upsertCanonical(url);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
        ogUrl.setAttribute('content', url);
    }

    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) {
        twitterUrl.setAttribute('content', url);
    }
}
