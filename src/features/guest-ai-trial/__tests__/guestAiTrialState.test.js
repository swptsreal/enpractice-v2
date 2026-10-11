import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import {
    getGuestErrorAction,
    getGuestRetryDelay,
    getRealtimeAuthAction,
    getQuotaBlockedUntil,
    isQuotaBlocked,
    parseGuestErrorCode,
} from '../guestAiTrialState.js';

const vite = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
});
test.after(() => vite.close());

const { shouldAttachAccessToken, shouldLogApiPayload } =
    await vite.ssrLoadModule(
    '/src/api/axiosClient.js'
);
const { GUEST_SESSION_PATH, GUEST_SESSION_REQUEST_CONFIG } =
    await vite.ssrLoadModule('/src/api/guestSessionApi.js');

test('guest session request suppresses refresh and auth header', () => {
    assert.equal(GUEST_SESSION_PATH, '/guest/sessions');
    assert.deepEqual(GUEST_SESSION_REQUEST_CONFIG, {
        skipAuthRefresh: true,
        skipAuthHeader: true,
        skipDebugLog: true,
    });
    assert.equal(
        shouldAttachAccessToken(GUEST_SESSION_REQUEST_CONFIG, 'auth-token'),
        false
    );
    assert.equal(shouldAttachAccessToken({}, 'auth-token'), true);
    assert.equal(shouldLogApiPayload(GUEST_SESSION_REQUEST_CONFIG), false);
    assert.equal(shouldLogApiPayload({}), true);
});

test('maps guest transport errors to bounded actions', () => {
    assert.equal(getGuestErrorAction('GUEST_TOKEN_EXPIRED'), 'renew');
    assert.equal(getGuestErrorAction('GUEST_TRIAL_DISABLED'), 'disable');
    assert.equal(getGuestErrorAction('GUEST_TRIAL_UNAVAILABLE'), 'backoff');
    assert.equal(getGuestErrorAction('UNKNOWN'), 'stop');
});

test('parses error code from event, REST error, and STOMP frame', () => {
    assert.equal(parseGuestErrorCode({ errorCode: 'AI_TIMEOUT' }), 'AI_TIMEOUT');
    assert.equal(parseGuestErrorCode({ status: 403 }), 'GUEST_TRIAL_DISABLED');
    assert.equal(
        parseGuestErrorCode({ headers: { message: 'GUEST_TRIAL_DISABLED' } }),
        'GUEST_TRIAL_DISABLED'
    );
    assert.equal(
        parseGuestErrorCode({ body: '{"errorCode":"GUEST_TOKEN_EXPIRED"}' }),
        'GUEST_TOKEN_EXPIRED'
    );
});

test('tracks quota block only when reset is in the future', () => {
    const now = Date.parse('2026-07-30T10:00:00Z');
    const reset = '2026-07-31T00:00:00+07:00';
    const blockedUntil = getQuotaBlockedUntil(null, { quotaResetAt: reset }, now);
    assert.equal(blockedUntil, Date.parse(reset));
    assert.equal(isQuotaBlocked(blockedUntil, now), true);
    assert.equal(isQuotaBlocked(blockedUntil, Date.parse(reset)), false);
    assert.equal(getQuotaBlockedUntil(blockedUntil, {}, now), blockedUntil);
});
test('maps auth state to realtime sync action', () => {
    assert.equal(getRealtimeAuthAction({ loading: true }), 'wait');
    assert.equal(
        getRealtimeAuthAction({ loading: false, isAuthenticated: true }),
        'connect-authenticated'
    );
    assert.equal(
        getRealtimeAuthAction({ loading: false, isAuthenticated: false }),
        'deactivate'
    );
});

test('caps guest retry backoff', () => {
    assert.equal(getGuestRetryDelay(0), 1000);
    assert.equal(getGuestRetryDelay(1), 3000);
    assert.equal(getGuestRetryDelay(2), 10000);
    assert.equal(getGuestRetryDelay(20), 30000);
});
