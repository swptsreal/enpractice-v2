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

/* The ported axios client logs every request. Useful in development, noise in a
   test run that mounts many routes. */
if (import.meta.env.MODE === 'test') {
    const originalLog = console.log;
    console.log = (...args) => {
        if (typeof args[0] === 'string' && args[0].startsWith('[API]')) return;
        originalLog(...args);
    };
}
