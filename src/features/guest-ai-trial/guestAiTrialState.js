import { GUEST_ERROR_CODES } from './guestAiTrialConstants.js';

export function getGuestErrorAction(errorCode) {
    switch (errorCode) {
        case GUEST_ERROR_CODES.TOKEN_EXPIRED:
            return 'renew';
        case GUEST_ERROR_CODES.TRIAL_DISABLED:
            return 'disable';
        case GUEST_ERROR_CODES.TRIAL_UNAVAILABLE:
            return 'backoff';
        default:
            return 'stop';
    }
}

export function parseGuestErrorCode(value) {
    if (!value) return null;
    if (value.errorCode) return value.errorCode;
    if (value.headers?.message) {
        const match = String(value.headers.message).match(/[A-Z][A-Z_]{3,}/);
        if (match) return match[0];
    }
    if (value.code && String(value.code).startsWith('GUEST_')) {
        return value.code;
    }
    if (value.status === 403) return GUEST_ERROR_CODES.TRIAL_DISABLED;
    if (value.status === 503) return GUEST_ERROR_CODES.TRIAL_UNAVAILABLE;

    if (typeof value.body === 'string') {
        try {
            return parseGuestErrorCode(JSON.parse(value.body));
        } catch {
            const match = value.body.match(/[A-Z][A-Z_]{3,}/);
            return match?.[0] ?? null;
        }
    }

    return null;
}

export function getQuotaBlockedUntil(
    currentBlockedUntil,
    event,
    now = Date.now()
) {
    const next = Date.parse(event?.quotaResetAt || '');
    if (!Number.isFinite(next) || next <= now) return currentBlockedUntil;
    return Math.max(Number(currentBlockedUntil || 0), next);
}

export function isQuotaBlocked(blockedUntil, now = Date.now()) {
    return Number.isFinite(Number(blockedUntil)) && Number(blockedUntil) > now;
}
export function getRealtimeAuthAction({ loading, isAuthenticated }) {
    if (loading) return 'wait';
    return isAuthenticated ? 'connect-authenticated' : 'deactivate';
}

export function getGuestRetryDelay(retryCount) {
    const delays = [1000, 3000, 10000, 30000];
    const index = Math.max(0, Math.floor(Number(retryCount) || 0));
    return delays[Math.min(index, delays.length - 1)];
}
