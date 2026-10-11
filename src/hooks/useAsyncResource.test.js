import { describe, expect, it } from 'vitest';
import { classifyError } from './useAsyncResource';

/**
 * `classifyError` decides which error panel a user sees, so a bug here means a wrong
 * message — or, as it turned out, NO message at all.
 *
 * THE BUG THIS FILE EXISTS FOR: the "no status -> network" check used to sit AFTER
 * `if (status >= 500)`. With `status === undefined` that comparison is `false`, so
 * execution fell past the whole numeric block and reached
 * `(error.errorCode ?? error.code)`, which throws when `error` is null. `AsyncBoundary`
 * then crashed while rendering its own error state, and a user with a flaky connection
 * got a BLANK SCREEN on every screen in the app instead of "check your connection".
 *
 * It survived because every existing test used an error carrying a `status`.
 */
describe('classifyError — no-status errors', () => {
    it('classifies a plain Error as a network problem, not a crash', () => {
        /* The exact object axios produces for a dropped connection. */
        const result = classifyError(new Error('Network Error'));
        expect(result.kind).toBe('network');
        expect(result.key).toBe('common.error.network');
        expect(result.retryable).toBe(true);
    });

    it('survives a null or undefined error', () => {
        /* This is what actually threw: `error.errorCode` with error === null. */
        expect(() => classifyError(null)).not.toThrow();
        expect(() => classifyError(undefined)).not.toThrow();
        expect(classifyError(null).kind).toBe('unknown');
    });

    it('survives an error-shaped object with no status', () => {
        expect(classifyError({ message: 'boom' }).kind).toBe('network');
        expect(classifyError({}).kind).toBe('network');
    });

    it('treats a null status like a missing one', () => {
        expect(classifyError({ status: null }).kind).toBe('network');
    });

    it('honours an explicit status 0 as a network problem too', () => {
        /* Some transports report 0 for "no response". 0 is falsy but meaningful, and
           the old `if (!status)` would have caught it while the new order must too. */
        expect(classifyError({ status: 0 }).kind).toBe('unknown');
    });
});

describe('classifyError — the real status codes', () => {
    const cases = [
        [401, 'auth', false],
        [403, 'auth', false],
        [402, 'credits', false],
        [404, 'notFound', false],
        [429, 'rateLimit', true],
        [500, 'server', true],
        [503, 'server', true],
    ];

    for (const [status, kind, retryable] of cases) {
        it(`maps ${status} to ${kind} (retryable: ${retryable})`, () => {
            const result = classifyError(Object.assign(new Error('x'), { status }));
            expect(result.kind).toBe(kind);
            expect(result.retryable).toBe(retryable);
        });
    }

    it('never offers a retry for auth, notFound or credits', () => {
        /* A retry cannot succeed for any of these, so offering one is a lie. */
        for (const status of [401, 403, 402, 404]) {
            expect(classifyError({ status }).retryable).toBe(false);
        }
    });
});

describe('classifyError — aborts and codes', () => {
    it('marks an abort as non-retryable and gives it no message', () => {
        /* A superseded request is not a user-facing failure. */
        const result = classifyError(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        expect(result.kind).toBe('aborted');
        expect(result.key).toBeNull();
    });

    it('falls back to the error code when a status is generic', () => {
        expect(classifyError({ status: 400, errorCode: 'VALIDATION_ERROR' }).key).toBe('VALIDATION_ERROR');
        expect(classifyError({ status: 400, code: 'SOME_CODE' }).key).toBe('SOME_CODE');
    });

    it('uses the caller fallback when there is nothing to go on', () => {
        expect(classifyError({ status: 400 }, 'my.fallback').key).toBe('my.fallback');
    });
});
