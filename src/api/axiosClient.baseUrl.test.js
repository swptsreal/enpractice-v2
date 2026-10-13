import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * `VITE_API_URL` is a BASE url and `axiosClient.js` is the only place that adds `/api` and
 * `baseURL`, so this is where a wrong value turns into every request 404-ing at once.
 *
 * Two failure modes are pinned, and the second is the one the migration actually risks:
 * an EMPTY base must compose to the relative `/api` (that is what makes the dev proxy and
 * therefore both realtime sockets work), and a value that still carries the old `/api`
 * suffix must not become `/api/api` — `.env` is gitignored and per-machine, so a stale
 * value on another box is a real possibility.
 */
async function baseUrlFor(value) {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', value);
    const mod = await import('./axiosClient.js');
    return mod.API_BASE_URL;
}

describe('axiosClient — the /api suffix is added in exactly one place', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('composes a relative /api from an empty base, which is the dev proxy path', async () => {
        expect(await baseUrlFor('')).toBe('/api');
    });

    it('appends /api once to an absolute base, with or without a trailing slash', async () => {
        expect(await baseUrlFor('http://localhost:8082')).toBe('http://localhost:8082/api');
        expect(await baseUrlFor('https://api.enpractice.site/')).toBe('https://api.enpractice.site/api');
    });

    it('tolerates a base that still carries the old /api suffix, so a stale value cannot double up', async () => {
        expect(await baseUrlFor('http://localhost:8082/api')).toBe('http://localhost:8082/api');
        expect(await baseUrlFor('https://api.enpractice.site/api/')).toBe('https://api.enpractice.site/api');
    });

    it('never produces a doubled prefix, whichever shape is handed to it', async () => {
        for (const value of ['', 'http://h:8082', 'http://h:8082/', 'http://h:8082/api', 'https://h/api/']) {
            expect(await baseUrlFor(value)).not.toContain('/api/api');
        }
    });
});
