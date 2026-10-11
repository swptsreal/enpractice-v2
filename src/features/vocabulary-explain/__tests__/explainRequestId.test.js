import test from 'node:test';
import assert from 'node:assert/strict';
import { createExplainRequestId } from '../vocabularyExplainState.js';

/**
 * The backend parses `requestId` with `UUID.fromString` and answers INVALID_REQUEST
 * — streaming NOTHING — for anything else. So this is a hard requirement, not a
 * formatting preference.
 *
 * These cases matter because jsdom (and modern browsers over HTTPS) always provide
 * `crypto.randomUUID`, which is why the broken v1 fallback survived its own test
 * suite and was only caught by streaming against the real backend.
 */
const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** A crypto-like object with getRandomValues but NO randomUUID. */
const insecureCrypto = {
    getRandomValues: (bytes) => {
        for (let i = 0; i < bytes.length; i += 1) bytes[i] = (i * 37 + 11) % 256;
        return bytes;
    },
};

test('uses crypto.randomUUID when the runtime provides it', () => {
    const id = createExplainRequestId({ randomUUID: () => '11111111-2222-4333-8444-555555555555' });
    assert.equal(id, '11111111-2222-4333-8444-555555555555');
});

test('fallback without randomUUID still returns a v4 UUID', () => {
    /* This is the case v1 got wrong: it produced "explain-<ts>-<rand>". */
    const id = createExplainRequestId(insecureCrypto);
    assert.match(id, V4, `expected a v4 UUID, got ${id}`);
});

test('fallback with NO crypto at all still returns a v4 UUID', () => {
    /* Weak entropy, but the SHAPE must hold or the request is rejected outright. */
    for (let i = 0; i < 25; i += 1) {
        assert.match(createExplainRequestId(undefined), V4);
    }
});

test('generated ids are unique, so a retry is not a DUPLICATE_REQUEST', () => {
    /* The backend tracks request ids and can answer DUPLICATE_REQUEST, so two calls
       must never collide. The deterministic stub above would collide, which is why
       this uses the real crypto path. */
    const ids = new Set(Array.from({ length: 500 }, () => createExplainRequestId()));
    assert.equal(ids.size, 500);
});

test('sets the version and variant nibbles correctly', () => {
    /* A "UUID-shaped" string with the wrong version nibble still fails
       UUID.fromString? No — Java accepts any hex there. But a wrong version means a
       malformed generator, so pin it. */
    const id = createExplainRequestId(insecureCrypto);
    assert.equal(id[14], '4', 'version nibble must be 4');
    assert.ok(['8', '9', 'a', 'b'].includes(id[19]), `variant nibble was ${id[19]}`);
});

test('is exactly the 36-character canonical form', () => {
    const id = createExplainRequestId(insecureCrypto);
    assert.equal(id.length, 36);
    assert.equal(id.split('-').map((p) => p.length).join(','), '8,4,4,4,12');
});
