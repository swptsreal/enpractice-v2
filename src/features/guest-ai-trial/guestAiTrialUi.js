import { GUEST_TRIAL_STATUSES } from './guestAiTrialConstants.js';

export function getGuestAiActionState({
    isAuthenticated,
    guestTrialStatus,
    surface = 'inline',
    quotaBlocked = false,
}) {
    if (isAuthenticated) return { visible: true, disabled: false };
    const trialDisabled =
        guestTrialStatus === GUEST_TRIAL_STATUSES.DISABLED;
    return {
        visible: !(trialDisabled && surface === 'floating'),
        disabled: trialDisabled || quotaBlocked,
    };
}

const ERROR_KEYS = Object.freeze({
    GUEST_TRIAL_DISABLED: 'guestAiTrial.errors.disabled',
    GUEST_TOKEN_EXPIRED: 'guestAiTrial.errors.tokenExpired',
    GUEST_DAILY_LIMIT_REACHED: 'guestAiTrial.errors.guestDailyLimit',
    IP_DAILY_LIMIT_REACHED: 'guestAiTrial.errors.ipDailyLimit',
    GUEST_TRIAL_UNAVAILABLE: 'guestAiTrial.errors.unavailable',
    DUPLICATE_REQUEST: 'guestAiTrial.errors.duplicateRequest',
});

export function getGuestErrorTranslationKey(errorCode) {
    return ERROR_KEYS[errorCode] ?? 'guestAiTrial.errors.generic';
}

