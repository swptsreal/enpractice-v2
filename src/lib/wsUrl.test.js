import { describe, expect, it } from 'vitest';
import { resolveWsUrl } from './wsUrl';

/**
 * These four cases are the difference between a live socket and a silent one.
 *
 * The regression they pin: with an absolute `VITE_API_URL`, `getRealtimeStompUrl()`
 * returned `ws://localhost:8082/ws/realtime-chat` for a page served over https. The
 * browser blocks mixed content, no frame is ever sent, and the UI reports "no response"
 * — the hardest failure to diagnose because nothing in the app logs an error.
 *
 * And with `VITE_API_URL=/api` (the documented dev value), the same class of bug
 * produces a RELATIVE url: `/ws/speaking/stt`, which `new WebSocket()` rejects with
 * `SyntaxError: The URL '/ws/speaking/stt' is not valid` — the dead `useWsSpeechRecording`
 * hook had exactly that.
 */
describe('resolveWsUrl', () => {
    const httpsLocal = { protocol: 'https:', host: 'localhost:5173' };
    const httpLocal = { protocol: 'http:', host: 'localhost:5273' };

    it('derives an absolute wss URL from a relative base on an https page', () => {
        expect(resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: '/api', location: httpsLocal })).toBe(
            'wss://localhost:5173/ws/realtime-chat'
        );
    });

    it('derives ws (not wss) from a relative base on an http page', () => {
        expect(resolveWsUrl('/ws/speaking/stt', { apiBaseUrl: '/api', location: httpLocal })).toBe(
            'ws://localhost:5273/ws/speaking/stt'
        );
    });

    it('treats a missing base as relative, so an empty .env cannot leak an absolute socket', () => {
        expect(resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: undefined, location: httpsLocal })).toBe(
            'wss://localhost:5173/ws/realtime-chat'
        );
    });

    it('keeps an absolute base, stripping only the /api suffix', () => {
        expect(
            resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: 'http://localhost:8082/api', location: httpsLocal })
        ).toBe('ws://localhost:8082/ws/realtime-chat');
        expect(
            resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: 'https://api.enpractice.site/api', location: httpLocal })
        ).toBe('wss://api.enpractice.site/ws/realtime-chat');
    });

    it('preserves a query string, which the speech socket authenticates with', () => {
        expect(
            resolveWsUrl('/ws/speaking/stt?token=abc', { apiBaseUrl: '/api', location: httpsLocal })
        ).toBe('wss://localhost:5173/ws/speaking/stt?token=abc');
    });

    it('does not mangle an absolute base when the path also contains "api"', () => {
        /* An unanchored .replace('/api','') would turn this into `ws://host/v1/ws`. */
        expect(
            resolveWsUrl('/ws/realtime-chat', { apiBaseUrl: 'http://localhost:8082/api/v1/api', location: httpsLocal })
        ).toBe('ws://localhost:8082/api/v1/ws/realtime-chat');
    });

    it('accepts a path without a leading slash', () => {
        expect(resolveWsUrl('ws/realtime-chat', { apiBaseUrl: '/api', location: httpsLocal })).toBe(
            'wss://localhost:5173/ws/realtime-chat'
        );
    });
});
