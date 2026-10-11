import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { creditApi } from '../api/creditApi';
import {
    BALANCE_FRESH_MS,
    COSTS_FRESH_MS,
} from '../features/credits/creditConstants';
import {
    isCreditSnapshotFresh,
    normalizeBalance,
    normalizeCostEntries,
} from '../features/credits/creditPolicy';
import { useAuth } from './AuthContext';
import CreditContext from './CreditContextCore';

const EMPTY_BALANCE = {
    availableBalance: null,
    reservedBalance: null,
    walletStatus: null,
};

export function CreditProvider({ children }) {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [balance, setBalance] = useState(EMPTY_BALANCE);
    const [costsByCode, setCostsByCode] = useState({});
    const [loading, setLoading] = useState({ balance: false, costs: false });
    const [errors, setErrors] = useState({ balance: null, costs: null });
    const [accessIssue, setAccessIssue] = useState(null);
    const balanceRef = useRef(EMPTY_BALANCE);
    const costsRef = useRef({});
    const lastBalanceFetchedAtRef = useRef(null);
    const lastCostsFetchedAtRef = useRef(null);
    const sessionActiveRef = useRef(false);
    const sessionGenerationRef = useRef(0);

    const resetCredits = useCallback(() => {
        sessionActiveRef.current = false;
        sessionGenerationRef.current += 1;
        balanceRef.current = EMPTY_BALANCE;
        costsRef.current = {};
        lastBalanceFetchedAtRef.current = null;
        lastCostsFetchedAtRef.current = null;
        setBalance(EMPTY_BALANCE);
        setCostsByCode({});
        setLoading({ balance: false, costs: false });
        setErrors({ balance: null, costs: null });
        setAccessIssue(null);
    }, []);

    const refreshBalance = useCallback(async () => {
        if (!sessionActiveRef.current) return balanceRef.current;
        const requestGeneration = sessionGenerationRef.current;
        setLoading((current) => ({ ...current, balance: true }));
        setErrors((current) => ({ ...current, balance: null }));
        try {
            const nextBalance = normalizeBalance(await creditApi.getBalance());
            if (requestGeneration !== sessionGenerationRef.current) {
                return balanceRef.current;
            }
            balanceRef.current = nextBalance;
            lastBalanceFetchedAtRef.current = Date.now();
            setBalance(nextBalance);
            return nextBalance;
        } catch (error) {
            if (requestGeneration === sessionGenerationRef.current) {
                setErrors((current) => ({ ...current, balance: error }));
            }
            throw error;
        } finally {
            if (requestGeneration === sessionGenerationRef.current) {
                setLoading((current) => ({ ...current, balance: false }));
            }
        }
    }, []);

    const refreshCosts = useCallback(async () => {
        if (!sessionActiveRef.current) return costsRef.current;
        const requestGeneration = sessionGenerationRef.current;
        setLoading((current) => ({ ...current, costs: true }));
        setErrors((current) => ({ ...current, costs: null }));
        try {
            const nextCosts = normalizeCostEntries(await creditApi.getCosts());
            if (requestGeneration !== sessionGenerationRef.current) {
                return costsRef.current;
            }
            costsRef.current = nextCosts;
            lastCostsFetchedAtRef.current = Date.now();
            setCostsByCode(nextCosts);
            return nextCosts;
        } catch (error) {
            if (requestGeneration === sessionGenerationRef.current) {
                setErrors((current) => ({ ...current, costs: error }));
            }
            throw error;
        } finally {
            if (requestGeneration === sessionGenerationRef.current) {
                setLoading((current) => ({ ...current, costs: false }));
            }
        }
    }, []);

    const refreshCredits = useCallback(
        () => Promise.allSettled([refreshBalance(), refreshCosts()]),
        [refreshBalance, refreshCosts]
    );

    const ensureFreshBalance = useCallback(async () => {
        if (
            isCreditSnapshotFresh(
                lastBalanceFetchedAtRef.current,
                BALANCE_FRESH_MS
            )
        ) {
            return balanceRef.current;
        }
        return refreshBalance();
    }, [refreshBalance]);

    const ensureFreshCosts = useCallback(async () => {
        if (
            isCreditSnapshotFresh(
                lastCostsFetchedAtRef.current,
                COSTS_FRESH_MS
            )
        ) {
            return costsRef.current;
        }
        return refreshCosts();
    }, [refreshCosts]);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            resetCredits();
            return;
        }
        sessionActiveRef.current = true;
        refreshCredits();
    }, [authLoading, isAuthenticated, refreshCredits, resetCredits]);

    const value = useMemo(
        () => ({
            ...balance,
            costsByCode,
            loading,
            errors,
            accessIssue,
            getCost: (actionCode) => costsByCode[actionCode] || null,
            refreshBalance,
            refreshCosts,
            refreshCredits,
            ensureFreshBalance,
            ensureFreshCosts,
            showAccessIssue: setAccessIssue,
            clearAccessIssue: () => setAccessIssue(null),
            resetCredits,
        }),
        [
            accessIssue,
            balance,
            costsByCode,
            ensureFreshBalance,
            ensureFreshCosts,
            errors,
            loading,
            refreshBalance,
            refreshCosts,
            refreshCredits,
            resetCredits,
        ]
    );

    return (
        <CreditContext.Provider value={value}>
            {children}
        </CreditContext.Provider>
    );
}
