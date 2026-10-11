import { useCallback, useMemo } from 'react';
import { useCredit } from '../contexts/CreditContextCore';
import { checkCreditActionAccess } from '../features/credits/creditAccess';
import { getCreditIssueFromError } from '../features/credits/creditPolicy';

export default function useCreditAction(actionCode) {
    const credit = useCredit();
    const costEntry = credit.getCost(actionCode);

    const precheck = useCallback(async () => {
        const decision = await checkCreditActionAccess({
            credit,
            actionCode,
            costEntry,
        });
        return decision.allowed;
    }, [actionCode, costEntry, credit]);

    const execute = useCallback(
        async (operation, { precheck: shouldPrecheck = true } = {}) => {
            const decision = await checkCreditActionAccess({
                credit,
                actionCode,
                costEntry,
                precheck: shouldPrecheck,
            });

            if (!decision.allowed) {
                return { blocked: true, data: null };
            }

            try {
                return { blocked: false, data: await operation() };
            } catch (error) {
                const issue = getCreditIssueFromError(error);
                if (issue) {
                    credit.showAccessIssue({
                        ...issue,
                        actionCode: issue.actionCode || actionCode,
                    });
                    return { blocked: true, data: null, error };
                }
                throw error;
            } finally {
                credit.refreshBalance().catch(() => {});
            }
        },
        [actionCode, costEntry, credit]
    );

    return useMemo(
        () => ({ actionCode, costEntry, execute, precheck }),
        [actionCode, costEntry, execute, precheck]
    );
}
