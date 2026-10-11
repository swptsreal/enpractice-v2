import test from 'node:test';
import assert from 'node:assert/strict';
import {
    createGuestSessionManager,
    normalizeGuestSession,
} from '../guestAiTrialSession.js';

function createMemoryStorage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        },
        removeItem(key) {
            values.delete(key);
        },
    };
}

test('normalizes a valid unexpired guest session', () => {
    const session = normalizeGuestSession(
        {
            guestId: 'guest-1',
            guestToken: 'signed-token',
            expiresAt: '2026-08-29T10:00:00Z',
        },
        Date.parse('2026-07-30T10:00:00Z')
    );

    assert.deepEqual(session, {
        guestId: 'guest-1',
        guestToken: 'signed-token',
        expiresAt: '2026-08-29T10:00:00Z',
    });
});

test('rejects expired or malformed sessions', () => {
    assert.equal(
        normalizeGuestSession(
            {
                guestId: 'guest-1',
                guestToken: 'signed-token',
                expiresAt: '2026-07-01T00:00:00Z',
            },
            Date.parse('2026-07-30T10:00:00Z')
        ),
        null
    );
    assert.equal(normalizeGuestSession({ guestId: 'guest-1' }), null);
});

test('deduplicates concurrent guest session creation', async () => {
    const storage = createMemoryStorage();
    let createCalls = 0;
    let resolveCreate;
    const createSession = () => {
        createCalls += 1;
        return new Promise((resolve) => {
            resolveCreate = resolve;
        });
    };
    const manager = createGuestSessionManager({
        storage,
        createSession,
        now: () => Date.parse('2026-07-30T10:00:00Z'),
    });

    const first = manager.getOrCreate();
    const second = manager.getOrCreate();

    assert.equal(createCalls, 1);
    resolveCreate({
        guestId: 'guest-1',
        guestToken: 'signed-token',
        expiresAt: '2026-08-29T10:00:00Z',
    });

    assert.deepEqual(await first, await second);
});

test('reuses stored session and supports forced renewal', async () => {
    const stored = {
        guestId: 'guest-old',
        guestToken: 'old-token',
        expiresAt: '2026-08-29T10:00:00Z',
    };
    const storage = createMemoryStorage({
        guest_ai_trial_session: JSON.stringify(stored),
    });
    let createCalls = 0;
    const manager = createGuestSessionManager({
        storage,
        createSession: async () => {
            createCalls += 1;
            return {
                guestId: 'guest-new',
                guestToken: 'new-token',
                expiresAt: '2026-09-01T00:00:00Z',
            };
        },
        now: () => Date.parse('2026-07-30T10:00:00Z'),
    });

    assert.deepEqual(await manager.getOrCreate(), stored);
    assert.equal(createCalls, 0);
    assert.equal((await manager.getOrCreate({ forceNew: true })).guestId, 'guest-new');
    assert.equal(createCalls, 1);
});
