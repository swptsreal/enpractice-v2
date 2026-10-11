import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import vi from './locales/vi';
/* English is NOT imported here on purpose — see `backend` below. */

export const SUPPORTED_LANGUAGES = ['vi', 'en'];
export const DEFAULT_LANGUAGE = 'vi';
export const LANGUAGE_STORAGE_KEY = 'en_practice_language';

/**
 * A language detector that does NOT sniff the browser.
 *
 * PRODUCT.md is explicit: "tiếng Việt là mặc định và là ngôn ngữ index; tiếng
 * Anh là bản dịch đầy đủ, người dùng tự chuyển." Defaulting to navigator.language
 * would render the English tree to, say, a Japanese browser and to crawlers whose
 * Accept-Language is not Vietnamese — which contradicts both halves of that
 * sentence (Vietnamese is the default; English is a *user* action).
 *
 * So: an explicit stored choice wins, everything else is Vietnamese.
 */
const explicitChoiceOnly = {
    name: 'explicitChoiceOnly',
    lookup() {
        if (typeof window === 'undefined') return undefined;
        const stored = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
        return SUPPORTED_LANGUAGES.includes(stored) ? stored : undefined;
    },
    cacheUserLanguage(lng) {
        if (typeof window === 'undefined') return;
        if (SUPPORTED_LANGUAGES.includes(lng)) {
            window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, lng);
        }
    },
};

const detector = new LanguageDetector();
detector.addDetector(explicitChoiceOnly);

/**
 * Version note: react-i18next 17 requires i18next >= 26.2 AND declares a
 * TypeScript peer, so this pair is held at i18next 25 / react-i18next 16 for v2
 * and the two-major upgrade is taken later as an isolated change. A library
 * migration is not mixed into a visual rewrite.
 */

/**
 * Only Vietnamese is bundled into the entry.
 *
 * Vietnamese is the default AND the index language, and it is what nearly every
 * visitor sees, so shipping the English tree in the first download spends ~26 kB
 * gzip on a language most people will not select. English is fetched on demand the
 * first time someone actually switches, and i18next caches it from then on.
 */
const resources = {
    vi: { translation: vi },
};

i18n.use(detector)
    .use(
        resourcesToBackend((language, _namespace) => {
            /* `vi` is already in memory, so this is only ever reached for `en`.
               Returning a promise is what lets Vite split it into its own chunk. */
            if (language === 'en') return import('./locales/en').then((mod) => mod.default);
            return Promise.reject(new Error(`no bundled resources for "${language}"`));
        })
    )
    .use(initReactI18next)
    .init({
        resources,
        supportedLngs: SUPPORTED_LANGUAGES,
        lng: DEFAULT_LANGUAGE,
        fallbackLng: DEFAULT_LANGUAGE,
        interpolation: { escapeValue: false },
        detection: {
            order: ['explicitChoiceOnly'],
            caches: ['explicitChoiceOnly'],
        },
        /* Let i18next accept the bundled `vi` tree without asking the backend, and
           only request what is genuinely missing. */
        partialBundledLanguages: true,
    });

/**
 * i18next's init is asynchronous even when the resources are already in memory.
 * Exporting the promise lets the entry point (and tests) wait for readiness
 * instead of rendering raw keys on the first paint — with bundled resources the
 * wait is a microtask, so it costs nothing and removes a class of
 * flash-of-key bugs.
 */
export const i18nReady = new Promise((resolve) => {
    if (i18n.isInitialized) resolve(i18n);
    else i18n.on('initialized', () => resolve(i18n));
});

/**
 * Coerce anything to a supported language tag.
 *
 * The ported v1 layer imports this (`utils/profile.js`,
 * `hooks/useNotificationsPage.js`) because the backend stores a preferred
 * language per user. A value it does not recognise must fall back to Vietnamese,
 * not to `undefined` — an unrecognised tag sent as `Accept-Language` would make
 * the backend pick its own default instead of the product's.
 */
export function normalizeLanguage(value) {
    if (typeof value !== 'string') return DEFAULT_LANGUAGE;
    const lower = value.toLowerCase();
    if (lower.startsWith('vi')) return 'vi';
    if (lower.startsWith('en')) return 'en';
    return DEFAULT_LANGUAGE;
}

/**
 * The language to send to the API (`Accept-Language` in `api/axiosClient.js`) and
 * to report as the user's preference.
 *
 * Reads the explicit stored choice, then the live i18next instance, then the
 * default — deliberately NOT `navigator.language`, for the same reason the
 * detector does not: Vietnamese is the default and the index language, and
 * English is a user action.
 */
export function getCurrentLanguage() {
    if (typeof window !== 'undefined') {
        const stored = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
        if (SUPPORTED_LANGUAGES.includes(stored)) return stored;
    }
    return normalizeLanguage(i18n.resolvedLanguage || i18n.language);
}

export default i18n;
