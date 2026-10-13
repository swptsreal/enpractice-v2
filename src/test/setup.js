import '@testing-library/jest-dom/vitest';
import './apiMock';

/**
 * jsdom does not implement matchMedia, and the shell uses it for the
 * mobile/desktop switch. Stub it so component tests do not crash on mount.
 */
if (!window.matchMedia) {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });
}

/**
 * Node 25 ships its OWN global `localStorage`, and it SHADOWS the one jsdom installs.
 *
 * Measured on Node v25.9.0: `typeof window.localStorage === 'object'` but
 * `window.localStorage.setItem === undefined` (Node's webstorage global is inert
 * without `--localstorage-file`, and it prints
 * "`--localstorage-file` was provided without a valid path" on every run). Because
 * `window === globalThis` under vitest's jsdom environment, the app's very first
 * `window.localStorage.getItem(...)` — in `src/i18n/index.js`, at import time —
 * threw `TypeError: window.localStorage?.setItem is not a function`, and **28 of 32
 * test files failed to load**. The suite looked broken while the code was fine.
 *
 * Two ways out: pin Node 22 LTS for the project, or make the environment work. Pinning
 * is the deeper fix but it cannot be enforced from inside the repo for everyone, and a
 * red suite that is really an environment fact is the most expensive kind of red. So
 * this installs a real in-memory Storage ONLY when the platform's own is unusable —
 * jsdom's own implementation is left alone wherever it works.
 */
function createMemoryStorage() {
    const store = new Map();
    return {
        get length() {
            return store.size;
        },
        key(index) {
            return Array.from(store.keys())[index] ?? null;
        },
        getItem(key) {
            const name = String(key);
            return store.has(name) ? store.get(name) : null;
        },
        setItem(key, value) {
            store.set(String(key), String(value));
        },
        removeItem(key) {
            store.delete(String(key));
        },
        clear() {
            store.clear();
        },
    };
}

if (typeof window !== 'undefined' && typeof window.localStorage?.setItem !== 'function') {
    for (const name of ['localStorage', 'sessionStorage']) {
        Object.defineProperty(window, name, {
            value: createMemoryStorage(),
            configurable: true,
            writable: true,
        });
    }
}

/* The ported axios client logs every request. Useful in development, noise in a
   test run that mounts many routes. */
if (import.meta.env.MODE === 'test') {
    const originalLog = console.log;
    console.log = (...args) => {
        if (typeof args[0] === 'string' && args[0].startsWith('[API]')) return;
        originalLog(...args);
    };
}
