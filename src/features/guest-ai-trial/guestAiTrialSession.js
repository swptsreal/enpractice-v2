import { GUEST_SESSION_STORAGE_KEY } from './guestAiTrialConstants.js';

export function normalizeGuestSession(value, now = Date.now()) {
    if (!value || typeof value !== 'object') return null;
    const guestId = String(value.guestId || '').trim();
    const guestToken = String(value.guestToken || '').trim();
    const expiresAt = String(value.expiresAt || '').trim();
    const expiresAtMs = Date.parse(expiresAt);

    if (!guestId || !guestToken || !expiresAt) return null;
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= now) return null;

    return { guestId, guestToken, expiresAt };
}

export function createGuestSessionManager({
    storage = globalThis.localStorage,
    createSession,
    now = Date.now,
} = {}) {
    if (typeof createSession !== 'function') {
        throw new TypeError('createSession must be a function');
    }

    let pendingCreation = null;

    const clear = () => storage?.removeItem(GUEST_SESSION_STORAGE_KEY);

    const read = () => {
        try {
            const raw = storage?.getItem(GUEST_SESSION_STORAGE_KEY);
            if (!raw) return null;
            const session = normalizeGuestSession(JSON.parse(raw), now());
            if (!session) clear();
            return session;
        } catch {
            clear();
            return null;
        }
    };

    const write = (value) => {
        const session = normalizeGuestSession(value, now());
        if (!session) {
            const error = new Error('Invalid guest session response');
            error.code = 'GUEST_TRIAL_UNAVAILABLE';
            throw error;
        }
        storage?.setItem(GUEST_SESSION_STORAGE_KEY, JSON.stringify(session));
        return session;
    };

    const getOrCreate = async ({ forceNew = false } = {}) => {
        if (forceNew) clear();
        const stored = read();
        if (stored) return stored;
        if (pendingCreation) return pendingCreation;

        pendingCreation = Promise.resolve(createSession())
            .then(write)
            .finally(() => {
                pendingCreation = null;
            });
        return pendingCreation;
    };

    return { read, clear, getOrCreate };
}
