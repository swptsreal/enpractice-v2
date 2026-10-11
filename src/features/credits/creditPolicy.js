import {
    CREDIT_ERROR_CODES,
    CREDIT_MODES,
    WALLET_STATUSES,
} from './creditConstants.js';

export function normalizeCostEntries(entries) {
    return (Array.isArray(entries) ? entries : []).reduce((result, entry) => {
        if (!entry?.actionCode) return result;
        result[entry.actionCode] = {
            actionCode: entry.actionCode,
            cost: Number(entry.cost || 0),
            mode: entry.mode || CREDIT_MODES.DISABLED,
        };
        return result;
    }, {});
}

export function normalizeBalance(data) {
    return {
        availableBalance:
            data?.availableBalance != null &&
            Number.isFinite(Number(data.availableBalance))
                ? Number(data.availableBalance)
                : null,
        reservedBalance:
            data?.reservedBalance != null &&
            Number.isFinite(Number(data.reservedBalance))
                ? Number(data.reservedBalance)
                : null,
        walletStatus: data?.status ?? null,
    };
}

export function isCreditSnapshotFresh(fetchedAt, ttlMs, now = Date.now()) {
    return Number.isFinite(fetchedAt) && now - fetchedAt < ttlMs;
}

export function getCreditCostDisplay(costEntry) {
    if (!costEntry || costEntry.mode === CREDIT_MODES.DISABLED) return null;
    const cost = Number(costEntry.cost || 0);
    return {
        amountLabel: `-${cost}`,
        startLabel: `(${cost} credit)`,
        observed: costEntry.mode === CREDIT_MODES.OBSERVE,
    };
}

export function evaluateCreditAction({
    costEntry,
    availableBalance = null,
    walletStatus = null,
    precheck = true,
}) {
    if (!precheck || !costEntry || costEntry.mode === CREDIT_MODES.DISABLED) {
        return { allowed: true, reason: null };
    }
    if (costEntry.mode === CREDIT_MODES.OBSERVE) {
        return { allowed: true, reason: null };
    }
    if (walletStatus === WALLET_STATUSES.FROZEN) {
        return { allowed: false, reason: CREDIT_ERROR_CODES.WALLET_FROZEN };
    }
    if (!Number.isFinite(availableBalance)) {
        return { allowed: true, reason: null };
    }
    if (availableBalance < Number(costEntry.cost || 0)) {
        return {
            allowed: false,
            reason: CREDIT_ERROR_CODES.INSUFFICIENT_CREDIT,
        };
    }
    return { allowed: true, reason: null };
}

export function getCreditIssueFromPayload(data) {
    if (!data || !Object.values(CREDIT_ERROR_CODES).includes(data.code)) {
        return null;
    }
    return {
        reason: data.code,
        actionCode: data.actionCode || null,
        requiredCredit: Number(data.requiredCredit || 0),
        availableBalance: Number(data.availableBalance || 0),
    };
}

export function getCreditIssueFromError(error) {
    return getCreditIssueFromPayload(error?.data);
}
