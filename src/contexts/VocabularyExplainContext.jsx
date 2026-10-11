import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CREDIT_ACTIONS } from '../features/credits/creditConstants';
import {
    GUEST_ERROR_CODES,
    REALTIME_MODES,
} from '../features/guest-ai-trial/guestAiTrialConstants';
import {
    getQuotaBlockedUntil,
    isQuotaBlocked,
} from '../features/guest-ai-trial/guestAiTrialState';
import {
    createExplainRequestId,
    createVocabularyExplainState,
    getVocabularyExplainContract,
    isVocabularyExplainActive,
    markVocabularyExplainsDisconnected,
    normalizeVocabularyExplainWord,
    reduceVocabularyExplainRequests,
    selectActiveGuestExplainRequestId,
} from '../features/vocabulary-explain/vocabularyExplainState';
import useCreditAction from '../hooks/useCreditAction';
import { useAuth } from './AuthContext';
import { useCredit } from './CreditContextCore';
import { useRealtimeStomp } from './RealtimeStompContextCore';
import VocabularyExplainContext from './VocabularyExplainContextCore';


export function VocabularyExplainProvider({ children }) {
    const [requestsById, setRequestsById] = useState({});
    const [explainBlockedUntil, setExplainBlockedUntil] = useState(null);
    const requestsRef = useRef({});
    const wasConnectedRef = useRef(false);
    const { isAuthenticated } = useAuth();
    const { refreshBalance, showAccessIssue } = useCredit();
    const explainCreditAction = useCreditAction(CREDIT_ACTIONS.AI_EXPLAIN);
    const {
        ensureConnected,
        guestTrialStatus,
        handleGuestError,
        isConnected,
        publish,
        subscribe,
    } = useRealtimeStomp();

    const updateRequests = useCallback((updater) => {
        const next =
            typeof updater === 'function'
                ? updater(requestsRef.current)
                : updater;
        requestsRef.current = next;
        setRequestsById(next);
        return next;
    }, []);

    const cancel = useCallback(
        (requestId) => {
            const request = requestId
                ? requestsRef.current[requestId]
                : null;
            if (!request) return false;

            if (isVocabularyExplainActive(request)) {
                const contract = getVocabularyExplainContract(request.mode);
                publish(contract.cancelDestination, { requestId });
            }

            updateRequests((current) => {
                if (!current[requestId]) return current;
                const next = { ...current };
                delete next[requestId];
                return next;
            });
            return true;
        },
        [publish, updateRequests]
    );

    const start = useCallback(
        async (word) => {
            const mode = isAuthenticated
                ? REALTIME_MODES.AUTHENTICATED
                : REALTIME_MODES.GUEST;

            if (
                mode === REALTIME_MODES.AUTHENTICATED &&
                !(await explainCreditAction.precheck())
            ) {
                return null;
            }
            if (
                mode === REALTIME_MODES.GUEST &&
                isQuotaBlocked(explainBlockedUntil)
            ) {
                const error = new Error('Guest explain quota is blocked');
                error.code = GUEST_ERROR_CODES.DAILY_LIMIT;
                throw error;
            }

            await ensureConnected();

            if (mode === REALTIME_MODES.GUEST) {
                const activeGuestRequestId =
                    selectActiveGuestExplainRequestId(requestsRef.current);
                if (activeGuestRequestId) cancel(activeGuestRequestId);
            }

            const normalizedWord = normalizeVocabularyExplainWord(word, {
                lowercase: mode === REALTIME_MODES.GUEST,
            });
            const requestId = createExplainRequestId();
            updateRequests((current) => ({
                ...current,
                [requestId]: createVocabularyExplainState(
                    requestId,
                    normalizedWord,
                    { mode }
                ),
            }));

            const contract = getVocabularyExplainContract(mode);
            const published = publish(contract.destination, {
                requestId,
                word: normalizedWord,
            });
            if (!published) {
                updateRequests((current) => ({
                    ...current,
                    [requestId]: {
                        ...current[requestId],
                        status: 'error',
                        errorCode: 'CONNECTION_CLOSED',
                        errorMessage: 'Realtime connection is not available',
                    },
                }));
            }

            return requestId;
        },
        [
            cancel,
            ensureConnected,
            explainBlockedUntil,
            explainCreditAction,
            isAuthenticated,
            publish,
            updateRequests,
        ]
    );

    useEffect(() => {
        const mode = isAuthenticated
            ? REALTIME_MODES.AUTHENTICATED
            : REALTIME_MODES.GUEST;
        const contract = getVocabularyExplainContract(mode);

        return subscribe(contract.queue, (frame) => {
            let event;
            try {
                event = JSON.parse(frame.body);
            } catch (error) {
                console.error(
                    'Failed to parse vocabulary explain event',
                    error
                );
                return;
            }

            const request = event?.requestId
                ? requestsRef.current[event.requestId]
                : null;
            if (!request) return;

            if (request.mode === REALTIME_MODES.AUTHENTICATED) {
                if (event.type === 'START') {
                    refreshBalance().catch(() => {});
                }
                if (
                    event.type === 'ERROR' &&
                    event.errorCode === 'INSUFFICIENT_CREDIT'
                ) {
                    showAccessIssue({
                        reason: 'INSUFFICIENT_CREDIT',
                        actionCode: CREDIT_ACTIONS.AI_EXPLAIN,
                        requiredCredit: Number(event.requiredCredit || 0),
                        availableBalance: Number(event.availableCredit || 0),
                    });
                }
            } else {
                if (
                    event.errorCode === GUEST_ERROR_CODES.DAILY_LIMIT ||
                    event.errorCode === GUEST_ERROR_CODES.IP_DAILY_LIMIT
                ) {
                    setExplainBlockedUntil((current) =>
                        getQuotaBlockedUntil(current, event)
                    );
                }
                if (
                    event.errorCode === GUEST_ERROR_CODES.TOKEN_EXPIRED ||
                    event.errorCode === GUEST_ERROR_CODES.TRIAL_DISABLED ||
                    event.errorCode === GUEST_ERROR_CODES.TRIAL_UNAVAILABLE
                ) {
                    handleGuestError(event).catch(() => {});
                }
            }

            updateRequests((current) =>
                reduceVocabularyExplainRequests(current, event)
            );
        });
    }, [
        handleGuestError,
        isAuthenticated,
        refreshBalance,
        showAccessIssue,
        subscribe,
        updateRequests,
    ]);

    useEffect(() => {
        if (!isQuotaBlocked(explainBlockedUntil)) return undefined;
        const delay = Math.max(0, explainBlockedUntil - Date.now());
        const timeoutId = setTimeout(() => setExplainBlockedUntil(null), delay);
        return () => clearTimeout(timeoutId);
    }, [explainBlockedUntil]);

    useEffect(() => {
        const disconnected = wasConnectedRef.current && !isConnected;
        wasConnectedRef.current = isConnected;
        if (!disconnected) return undefined;

        let cancelled = false;
        queueMicrotask(() => {
            if (!cancelled) {
                updateRequests(markVocabularyExplainsDisconnected);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [isConnected, updateRequests]);

    useEffect(
        () => () => {
            for (const request of Object.values(requestsRef.current)) {
                if (isVocabularyExplainActive(request)) {
                    const contract = getVocabularyExplainContract(
                        request.mode
                    );
                    publish(contract.cancelDestination, {
                        requestId: request.requestId,
                    });
                }
            }
            requestsRef.current = {};
        },
        [publish]
    );

    const value = useMemo(
        () => ({
            requestsById,
            start,
            cancel,
            isConnected,
            isBlocked: isQuotaBlocked(explainBlockedUntil),
            guestTrialStatus,
            costEntry: isAuthenticated
                ? explainCreditAction.costEntry
                : null,
        }),
        [
            cancel,
            explainBlockedUntil,
            explainCreditAction.costEntry,
            guestTrialStatus,
            isAuthenticated,
            isConnected,
            requestsById,
            start,
        ]
    );

    return (
        <VocabularyExplainContext.Provider value={value}>
            {children}
        </VocabularyExplainContext.Provider>
    );
}

