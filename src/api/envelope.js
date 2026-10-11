/**
 * The backend's response envelope.
 *
 * Every endpoint returns the same wrapper:
 *
 *     { "success": true, "message": "OK", "data": { ... } }
 *
 * **`axiosClient` ALREADY UNWRAPS IT.** Its response interceptor ends with
 * `return unwrapApiBody(body, response.status)`, which returns `body.data` — so a caller
 * holding the result of `await someApi.get(...)` is holding the PAYLOAD, not the envelope.
 * (v1 works the same way, and this client was ported from it.)
 *
 * An earlier version of this file claimed the opposite — "axiosClient does not unwrap it, so
 * every consumer has to" — and every loader written against that claim unwrapped a second
 * time. `payload.data` is undefined for almost every payload, so the API answered 200 with
 * the right body and EVERY screen rendered empty, with nothing in the console to explain it.
 * The lesson is in the shape of the code below: these helpers are IDEMPOTENT, because the
 * only safe assumption is that they may receive either the payload or the wrapper.
 *
 * Verified against the running backend, across `/ielts/tests`, `/ielts/attempts`,
 * `/user/dashboard/*` and `/credits/*`.
 */
export function unwrapData(value) {
    /* A raw envelope — what a `fetch` caller holds before any interceptor runs. */
    if (isEnvelope(value)) return value.data;

    /* The axios-response shape: `{ data: <envelope>, status, headers, ... }`. Nothing in the
       app passes this (the interceptor has already stripped it), but every test double that
       mocks the api module returns it, so it is supported rather than papered over. */
    if (value && typeof value === 'object' && !Array.isArray(value) && isEnvelope(value.data)) {
        return value.data.data;
    }

    /* The normal case: the client already unwrapped it. Returning it unchanged is the whole
       fix — including for a payload that carries a `data` field of its own (a dictionary word
       does), which is why this branch must not look for `.data` again. */
    return value ?? null;
}

/** True for the documented `{ success, message, data }` wrapper. */
function isEnvelope(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && 'data' in value && 'success' in value;
}

/** Same unwrapping, for when the caller already holds `response.data`. */
export function unwrapPayload(body) {
    if (body === null || body === undefined) return null;

    /* The envelope as documented. `success: false` still carries data or an
       error message; the axios layer turns non-2xx into a rejection, so a false
       flag here is informational rather than a failure. */
    if (isEnvelope(body)) {
        return body.data;
    }

    /* Some endpoints are documented as paginated and put the page object at the
       top level inside `data`; others are bare. Both are handled by the check
       above and this passthrough. */
    return body;
}

/**
 * The backend returns TWO different pagination shapes, and both are real:
 *
 *   PageResponse<T>  `{ page, size, totalElements, totalPages, items }`
 *                    — /ielts/tests, /ielts/attempts, /vocabulary-tests
 *   Spring Page<T>   `{ content, number, size, totalElements, totalPages, ... }`
 *                    — /dictionary, /dictionary/due-review
 *
 * Verified against the running backend, not inferred: the first returns `items` and
 * `page`, the second returns `content` and `number`. Reading only one shape is the
 * kind of difference that silently reports page 0 forever.
 *
 * Returns `{ items, page, size, totalElements, totalPages, hasMore }`.
 */
export function readPage(response) {
    const data = unwrapData(response) ?? {};
    const items = Array.isArray(data) ? data : (data.items ?? data.content ?? []);
    /* `page` on PageResponse, `number` on Spring Page. */
    const page = Number(data.page ?? data.number ?? 0);
    const size = Number(data.size ?? items.length);
    const totalPages = Number(data.totalPages ?? 0);

    return {
        items: Array.isArray(items) ? items : [],
        page,
        size,
        totalElements: Number(data.totalElements ?? items.length ?? 0),
        totalPages,
        hasMore: totalPages > 0 ? page + 1 < totalPages : false,
    };
}
