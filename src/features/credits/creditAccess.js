import { evaluateCreditAction } from './creditPolicy.js';

export async function checkCreditActionAccess({
    credit,
    actionCode,
    costEntry,
    precheck = true,
}) {
    let latestCosts = credit.costsByCode || {};
    let latestBalance = {
        availableBalance: credit.availableBalance,
        walletStatus: credit.walletStatus,
    };

    try {
        latestCosts = (await credit.ensureFreshCosts()) || latestCosts;
    } catch {
        latestCosts = credit.costsByCode || latestCosts;
    }

    if (precheck && latestCosts[actionCode]?.mode === 'ENFORCE') {
        try {
            latestBalance =
                (await credit.ensureFreshBalance()) || latestBalance;
        } catch {
            latestBalance = {
                availableBalance: credit.availableBalance,
                walletStatus: credit.walletStatus,
            };
        }
    }

    const latestCostEntry = latestCosts[actionCode] || costEntry;
    const decision = evaluateCreditAction({
        costEntry: latestCostEntry,
        availableBalance: latestBalance.availableBalance,
        walletStatus: latestBalance.walletStatus,
        precheck,
    });

    if (!decision.allowed) {
        credit.showAccessIssue({
            reason: decision.reason,
            actionCode,
            requiredCredit: Number(latestCostEntry?.cost || 0),
            availableBalance: latestBalance.availableBalance,
        });
    }

    return {
        ...decision,
        costEntry: latestCostEntry,
        availableBalance: latestBalance.availableBalance,
        walletStatus: latestBalance.walletStatus,
    };
}
