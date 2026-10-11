import { describe, expect, it } from 'vitest';
import i18n, { DEFAULT_LANGUAGE, normalizeLanguage, getCurrentLanguage } from './index';

/**
 * English is not bundled — it is fetched on demand (see `backend.read`). That is a
 * performance decision with a correctness risk: if the deferred load does not
 * resolve, an English user sees raw keys instead of text.
 *
 * These tests are the guard. They also pin the language default, because
 * Vietnamese being the default IS the product rule, not an implementation detail.
 */
describe('i18n', () => {
    it('bundles Vietnamese and defaults to it', async () => {
        await i18n.loadLanguages('vi');
        expect(DEFAULT_LANGUAGE).toBe('vi');
        expect(i18n.t('common.appName')).toBe('EN Practice');
        expect(i18n.t('common.login')).toBe('Đăng nhập');
    });

    it('resolves a real English string after switching, not a raw key', async () => {
        await i18n.changeLanguage('en');

        // the deferred load must have landed
        expect(i18n.hasLoadedNamespace('translation')).toBe(true);
        const signIn = i18n.t('common.login');
        expect(signIn).toBe('Sign in');
        expect(signIn).not.toBe('common.login');
        expect(signIn).not.toBe('Đăng nhập');

        // a second, deeper key proves the whole tree arrived, not one namespace
        expect(i18n.t('home.title')).toBe('Home');
        expect(i18n.t('ielts.title')).toBe('IELTS tests');
    });

    it('switches back to Vietnamese without a reload', async () => {
        await i18n.changeLanguage('vi');
        expect(i18n.t('common.login')).toBe('Đăng nhập');
    });

    it('normalizes unknown language tags to Vietnamese rather than undefined', () => {
        expect(normalizeLanguage('vi-VN')).toBe('vi');
        expect(normalizeLanguage('en-GB')).toBe('en');
        // the backend stores a preference; a value we do not know must fall back
        // to the product default, not become an unset Accept-Language
        expect(normalizeLanguage('fr')).toBe('vi');
        expect(normalizeLanguage(null)).toBe('vi');
        expect(normalizeLanguage(42)).toBe('vi');
    });

    it('reports the current language for the API Accept-Language header', () => {
        expect(['vi', 'en']).toContain(getCurrentLanguage());
    });
});
