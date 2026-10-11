import { describe, expect, it } from 'vitest';
import { unwrapData, unwrapPayload, readPage } from './envelope';

/**
 * The envelope and pagination helpers are the highest-leverage code in the app:
 * every screen reads the backend through them, so one wrong assumption here is
 * wrong everywhere at once.
 *
 * These cases exist in three shapes ON PURPOSE, because the helper has to survive all three:
 *
 *   raw envelope      `{ success, message, data }`   — a fetch caller, or a non-axios source
 *   response wrapper  `{ data: <envelope> }`         — what a test double that mocks the api
 *                                                      module returns
 *   payload           `{ ...the DTO... }`            — THE REAL ONE: `axiosClient` unwraps the
 *                                                      envelope in its response interceptor, so
 *                                                      this is what every loader actually holds
 *
 * The third shape was missing, and its absence let a double unwrap ship: every screen read
 * `payload.data`, got `undefined`, and rendered empty while the network tab showed 200.
 */
const envelope = (data) => ({ data: { success: true, message: 'OK', data } });
const rawEnvelope = (data) => ({ success: true, message: 'OK', data });

describe('unwrapData', () => {
    it('PASSES A PAYLOAD THROUGH — the shape every loader actually receives', () => {
        /* `axiosClient` already returned `body.data`, so unwrapping again is the bug this
           test exists to prevent. */
        const profile = { id: 'u1', email: 'a@b.test', goals: { dailyGoalMinutes: 30 } };
        expect(unwrapData(profile)).toEqual(profile);
    });

    it('passes a payload that carries its OWN `data` field through unchanged', () => {
        /* A dictionary word has a `data` field of its own; unwrapping it would drop the word. */
        const word = { id: 'w1', word: 'mitigate', data: 'not an envelope' };
        expect(unwrapData(word)).toEqual(word);
    });

    it('passes a bare array through, because some endpoints answer with one', () => {
        const costs = [{ actionCode: 'IELTS_START', cost: 5, mode: 'ENFORCE' }];
        expect(unwrapData(costs)).toEqual(costs);
    });

    it('unwraps a raw {success, message, data} envelope', () => {
        expect(unwrapData(rawEnvelope({ id: 'x' }))).toEqual({ id: 'x' });
    });

    it('unwraps the test-double response wrapper `{ data: envelope }`', () => {
        expect(unwrapData(envelope({ id: 'x' }))).toEqual({ id: 'x' });
    });

    it('returns null for null rather than throwing', () => {
        expect(unwrapData(null)).toBeNull();
    });

    it('keeps `data: null`, which is a real answer (an empty object)', () => {
        // `/credits/transactions` on a new account legitimately has no data
        expect(unwrapData(envelope(null))).toBeNull();
        expect(unwrapData(rawEnvelope(null))).toBeNull();
    });
});

describe('unwrapPayload', () => {
    it('unwraps a payload that is already `response.data`', () => {
        expect(unwrapPayload({ success: true, message: 'Đã lưu', data: { id: 1 } })).toEqual({ id: 1 });
    });

    it('needs BOTH `data` and `success` to treat something as an envelope', () => {
        /* A dictionary word carries a `data` field of its own. Unwrapping on the
           presence of `data` alone would return the inner string and silently drop
           the rest of the record. */
        const word = { id: 'w1', word: 'mitigate', data: 'not an envelope' };
        expect(unwrapPayload(word)).toEqual(word);
    });
});

describe('readPage — the two real pagination shapes', () => {
    it('reads PageResponse, which uses `items` and `page`', () => {
        /* captured from GET /vocabulary-tests and GET /ielts/tests */
        const response = envelope({
            page: 0,
            size: 12,
            totalElements: 1,
            totalPages: 1,
            items: [{ testId: 't1' }],
        });

        const paged = readPage(response);
        expect(paged.items).toHaveLength(1);
        expect(paged.page).toBe(0);
        expect(paged.totalElements).toBe(1);
        expect(paged.hasMore).toBe(false);
    });

    it('reads Spring Page, which uses `content` and `number`', () => {
        /* captured from GET /dictionary */
        const response = envelope({
            content: [{ id: 'w1' }],
            empty: false,
            first: true,
            last: true,
            number: 0,
            numberOfElements: 1,
            size: 5,
            totalElements: 1,
            totalPages: 1,
        });

        const paged = readPage(response);
        expect(paged.items).toHaveLength(1);
        expect(paged.page).toBe(0);
        expect(paged.size).toBe(5);
        expect(paged.totalElements).toBe(1);
        expect(paged.hasMore).toBe(false);
    });

    it('reports the page number on a LATER Spring Page, which is where the bug hid', () => {
        /* The first version read only `data.page`, so every Spring Page reported
           page 0 and `hasMore` was computed from the wrong input. */
        const response = envelope({
            content: [],
            number: 2,
            size: 5,
            totalElements: 11,
            totalPages: 3,
        });

        const paged = readPage(response);
        expect(paged.page).toBe(2);
        expect(paged.hasMore).toBe(false); // 2 + 1 < 3 is false
    });

    it('reports hasMore on a middle page of a PageResponse', () => {
        const response = envelope({ page: 0, size: 10, totalElements: 25, totalPages: 3, items: [] });
        expect(readPage(response).hasMore).toBe(true);
    });

    it('treats a bare array as a full page', () => {
        /* The payload shape: `axiosClient` hands the array straight through (this is what
           `GET /credits/costs` looks like). */
        const paged = readPage([{ id: 1 }, { id: 2 }]);
        expect(paged.items).toHaveLength(2);
        expect(paged.totalElements).toBe(2);
    });

    it('reads a page out of a raw envelope too, so a non-axios caller still works', () => {
        const paged = readPage(rawEnvelope({ page: 0, size: 10, totalElements: 2, totalPages: 1, items: [{ id: 1 }] }));
        expect(paged.items).toHaveLength(1);
    });

    it('never returns a non-array items, so a list can always map over it', () => {
        for (const bad of [{}, { items: null }, { content: 'nope' }, null]) {
            expect(Array.isArray(readPage(bad).items)).toBe(true);
        }
    });
});
