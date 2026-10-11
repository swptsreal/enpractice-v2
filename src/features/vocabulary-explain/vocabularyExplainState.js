import { REALTIME_MODES } from '../guest-ai-trial/guestAiTrialConstants.js';

/**
 * A request id the backend will ACCEPT.
 *
 * `VocabularyExplainStreamEngineImpl.normalize` parses this with
 * `UUID.fromString(...)`, and on failure it emits `INVALID_REQUEST`
 * ("requestId hoặc word không hợp lệ") and streams nothing at all. A non-UUID id is
 * therefore not a degraded id — it is a total failure of the feature, and it fails
 * before anything is reserved.
 *
 * v1's fallback produced `'explain-' + Date.now() + '-' + random`, which is not a
 * UUID. That branch only runs when `crypto.randomUUID` is missing — exactly the
 * insecure-context and older-Safari case — so on those deployments every explain
 * request failed. Found by streaming against the real backend: no unit test could
 * have caught it, because jsdom always supplies `crypto.randomUUID`.
 *
 * The fallback now builds a real RFC 4122 v4 UUID. `crypto.getRandomValues` works in
 * insecure contexts where `randomUUID` does not, and `Math.random` is the last resort
 * so the SHAPE is never wrong even when entropy is weak.
 */
export function createExplainRequestId(cryptoLike = globalThis.crypto) {
    if (cryptoLike?.randomUUID) return cryptoLike.randomUUID();

    const bytes = new Uint8Array(16);
    if (cryptoLike?.getRandomValues) {
        cryptoLike.getRandomValues(bytes);
    } else {
        for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    }

    /* Pin the version (4) and the variant (10xx). */
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0'));
    return (
        `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-` +
        `${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`
    );
}

const AUTH_EXPLAIN_CONTRACT = Object.freeze({
    queue: '/user/queue/vocabulary/explain',
    destination: '/app/vocabulary/explain',
    cancelDestination: '/app/vocabulary/explain/cancel',
});
const GUEST_EXPLAIN_CONTRACT = Object.freeze({
    queue: '/user/queue/public/vocabulary/explain',
    destination: '/app/public/vocabulary/explain',
    cancelDestination: '/app/public/vocabulary/explain/cancel',
});

export const VOCABULARY_EXPLAIN_DESTINATION =
    AUTH_EXPLAIN_CONTRACT.destination;
export const VOCABULARY_EXPLAIN_CANCEL_DESTINATION =
    AUTH_EXPLAIN_CONTRACT.cancelDestination;
export const VOCABULARY_EXPLAIN_QUEUE = AUTH_EXPLAIN_CONTRACT.queue;

export function getVocabularyExplainContract(mode) {
    return mode === REALTIME_MODES.GUEST
        ? GUEST_EXPLAIN_CONTRACT
        : AUTH_EXPLAIN_CONTRACT;
}

export function normalizeVocabularyExplainWord(
    word,
    { lowercase = false } = {}
) {
    const trimmed = String(word ?? '').trim();
    const normalized = lowercase ? trimmed.toLowerCase() : trimmed;
    if (!normalized || normalized.length > 100) {
        const error = new Error(
            'Vocabulary explain word must be 1-100 characters'
        );
        error.code = 'INVALID_REQUEST';
        throw error;
    }
    return normalized;
}

export function createVocabularyExplainState(
    requestId,
    word,
    { mode = REALTIME_MODES.AUTHENTICATED } = {}
) {
    return {
        requestId,
        word,
        mode,
        markdown: '',
        status: 'pending',
        quotaRemaining: null,
        quotaResetAt: null,
    };
}

export function isVocabularyExplainActive(state) {
    return state?.status === 'pending' || state?.status === 'streaming';
}

export function reduceVocabularyExplain(state, event) {
    if (!state || event?.requestId !== state.requestId) return state;

    switch (event.type) {
        case 'START':
            return {
                ...state,
                word: event.word ?? state.word,
                markdown: '',
                status: 'streaming',
                errorCode: undefined,
                errorMessage: undefined,
                quotaRemaining:
                    event.quotaRemaining ?? state.quotaRemaining,
                quotaResetAt: event.quotaResetAt ?? state.quotaResetAt,
            };
        case 'DELTA':
            return {
                ...state,
                markdown: state.markdown + (event.content ?? ''),
            };
        case 'COMPLETE':
            return {
                ...state,
                markdown: event.content ?? state.markdown,
                status: 'complete',
            };
        case 'ERROR':
            return {
                ...state,
                status: 'error',
                errorCode: event.errorCode ?? undefined,
                errorMessage: event.message ?? undefined,
                quotaRemaining:
                    event.quotaRemaining ?? state.quotaRemaining,
                quotaResetAt: event.quotaResetAt ?? state.quotaResetAt,
            };
        default:
            return state;
    }
}

export function reduceVocabularyExplainRequests(requestsById, event) {
    const requestId = event?.requestId;
    const state = requestId ? requestsById[requestId] : null;
    if (!state) return requestsById;

    const nextState = reduceVocabularyExplain(state, event);
    if (nextState === state) return requestsById;
    return {
        ...requestsById,
        [requestId]: nextState,
    };
}

export function selectActiveGuestExplainRequestId(requestsById) {
    return (
        Object.values(requestsById).find(
            (state) =>
                state.mode === REALTIME_MODES.GUEST &&
                isVocabularyExplainActive(state)
        )?.requestId ?? null
    );
}

export function markVocabularyExplainsDisconnected(requestsById) {
    let changed = false;
    const next = {};

    for (const [requestId, state] of Object.entries(requestsById)) {
        if (isVocabularyExplainActive(state)) {
            changed = true;
            next[requestId] = {
                ...state,
                status: 'error',
                errorCode: 'CONNECTION_CLOSED',
                errorMessage: 'Realtime connection closed before completion',
            };
        } else {
            next[requestId] = state;
        }
    }

    return changed ? next : requestsById;
}
