import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveWsUrl } from './wsUrl';

/**
 * These cases are the difference between a live socket and a silent one.
 *
 * The regression they pin: with an ABSOLUTE `VITE_API_URL`, the URL builder returned
 * `ws://localhost:8082/ws/realtime-chat` for a page served over https. The browser blocks
 * mixed content, no frame is ever sent, and the UI reports "no response" — the hardest
 * failure to diagnose because nothing in the app logs an error.
 *
 * And with an EMPTY base (the documented dev value), the same class of bug produces a
 * RELATIVE url: `/ws/speaking/stt`, which `new WebSocket()` rejects with
 * `SyntaxError: The URL '/ws/speaking/stt' is not valid` — the dead `useWsSpeechRecording`
 * hook had exactly that.
 */
describe('resolveWsUrl', () => {
    const httpsLocal = { protocol: 'https:', host: 'localhost:5173' };
    const httpLocal = { protocol: 'http:', host: 'localhost:5273' };

    afterEach(() => vi.unstubAllEnvs());

    it('derives an absolute wss URL from an empty base on an https page', () => {
        /* EMPTY and `/api` are the same case — both mean "same origin, the dev server
           proxies". `/api` is kept because it is what the value used to be. */
        expect(resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: '', location: httpsLocal })).toBe(
            'wss://localhost:5173/ws/realtime-chat'
        );
        expect(resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: '/api', location: httpsLocal })).toBe(
            'wss://localhost:5173/ws/realtime-chat'
        );
    });

    it('derives ws (not wss) from an empty base on an http page', () => {
        expect(resolveWsUrl('/ws/speaking/stt', { apiBaseUrl: '', location: httpLocal })).toBe(
            'ws://localhost:5273/ws/speaking/stt'
        );
    });

    it('treats a missing base as same-origin, so a build box with no .env still gets a socket', async () => {
        /* `apiBaseUrl: undefined` does NOT mean "no base" — the parameter falls back to
           `import.meta.env.VITE_API_URL`, so asserting on `undefined` reads the DEVELOPER'S
           `.env` and silently changes meaning when that file changes. This case must control
           the env itself, which is also the situation it describes: a build with no `.env`. */
        vi.resetModules();
        vi.stubEnv('VITE_API_URL', undefined);

        const { resolveWsUrl: fresh } = await import('./wsUrl.js');

        expect(fresh('/ws/realtime-chat', { location: httpsLocal })).toBe('wss://localhost:5173/ws/realtime-chat');
    });

    it('maps a BASE url to ws/wss without needing a /api suffix', () => {
        /* The shape `.env.production` documents: the backend base, no `/api`. */
        expect(
            resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: 'http://localhost:8082', location: httpsLocal })
        ).toBe('ws://localhost:8082/ws/realtime-chat');
        expect(
            resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: 'https://api.enpractice.site', location: httpLocal })
        ).toBe('wss://api.enpractice.site/ws/realtime-chat');
    });

    it('still accepts a base that carries a /api suffix, so an older value cannot double up', () => {
        expect(
            resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: 'http://localhost:8082/api', location: httpsLocal })
        ).toBe('ws://localhost:8082/ws/realtime-chat');
        expect(
            resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: 'https://api.enpractice.site/api', location: httpLocal })
        ).toBe('wss://api.enpractice.site/ws/realtime-chat');
    });

    it('preserves a query string, which the speech socket authenticates with', () => {
        expect(
            resolveWsUrl('/ws/speaking/stt?token=abc', { apiBaseUrl: '', location: httpsLocal })
        ).toBe('wss://localhost:5173/ws/speaking/stt?token=abc');
    });

    it('does not mangle a base when the path also contains "api"', () => {
        /* An unanchored .replace('/api','') would turn this into `ws://host/v1/ws`. */
        expect(
            resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: 'http://localhost:8082/api/v1/api', location: httpsLocal })
        ).toBe('ws://localhost:8082/api/v1/ws/realtime-chat');
    });

    it('accepts a path without a leading slash', () => {
        expect(resolveWsUrl('ws/realtime-chat', { apiBaseUrl: '', location: httpsLocal })).toBe(
            'wss://localhost:5173/ws/realtime-chat'
        );
    });
});
