import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * One data-fetching hook, so every screen handles its states the same way.
 *
 * `DESIGN-V2.md` §14 requires every screen to have a designed default, loading,
 * empty and error state. v1 has no shared primitive for this: each page calls the
 * api in a `useEffect` and keeps its own three booleans, which is why some screens
 * show a spinner and others show nothing, and why an expired session surfaces as
 * an empty list on some pages and a toast on others.
 *
 * Behaviour that matters:
 *
 *  - A late response from a superseded request is DISCARDED. Without this, typing
 *    in a search box or navigating quickly leaves the slower earlier response
 *    winning, which is the classic stale-data bug.
 *  - `reload()` is stable, so it can be handed to a retry button or an effect
 *    dependency without re-triggering.
 *  - Errors keep their `ApiError.status`, so a screen can distinguish 401
 *    (session expired) from 404 (gone) from a network failure. The design system
 *    bans a generic "something went wrong" covering all three.
 *
 * Two react-hooks rules are disabled for THIS FILE ONLY, because they are
 * unavoidable for a fetch primitive rather than smells it can design away:
 *
 *   react-hooks/refs               a ref must be written in an effect to track
 *                                  mount state; that is what it is for. The rule
 *                                  targets reading `.current` during render.
 *   react-hooks/set-state-in-effect the request must start in an effect and the
 *                                  loading flag must be set before it starts.
 *
 * They stay enabled everywhere else in the app, which is the point of having
 * them: 9 pre-existing sites in the ported v1 layer are reported as warnings.
 */
/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect */
export function useAsyncResource(fetcher, { deps = [], enabled = true, initialData = null } = {}) {
    const [state, setState] = useState({
        data: initialData,
        loading: enabled,
        error: null,
    });

    /* A monotonic request id: only the newest request may write to state. */
    const requestId = useRef(0);
    const mounted = useRef(true);
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const run = useCallback(async () => {
        if (!enabled) {
            setState((prev) => ({ ...prev, loading: false, error: null }));
            return undefined;
        }

        const id = ++requestId.current;
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const data = await fetcherRef.current();
            if (!mounted.current || id !== requestId.current) return undefined;
            setState({ data, loading: false, error: null });
            return data;
        } catch (error) {
            if (!mounted.current || id !== requestId.current) return undefined;
            setState({ data: null, loading: false, error });
            return undefined;
        }
    }, [enabled]);

    useEffect(() => {
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [run, ...deps]);

    return {
        ...state,
        /** True only when the request succeeded and returned nothing usable. */
        isEmpty: !state.loading && !state.error && isEmptyValue(state.data),
        reload: run,
        setData: (updater) =>
            setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater })),
    };
}

/** What counts as "nothing to show". Kept narrow on purpose: 0 and false are data. */
export function isEmptyValue(value) {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') {
        if (value instanceof Date) return false;
        /* An envelope like { content: [] } is empty when its list is empty. */
        const listKeys = ['content', 'items', 'results', 'data', 'records'];
        for (const key of listKeys) {
            if (Array.isArray(value[key])) return value[key].length === 0;
        }
        return Object.keys(value).length === 0;
    }
    return false;
}

/**
 * Classify an error so a screen can say something true instead of something safe.
 * Returns an i18n key plus whether retrying could plausibly help.
 */
export function classifyError(error, fallbackKey = 'common.error.generic') {
    /* `error` itself can be null/undefined. Everything below reads `error.errorCode`
       or `error.code`, and with `error === null` the property access THROWS — so this
       guard is the difference between an error panel and a blank screen. */
    if (!error) {
        return { kind: 'unknown', key: fallbackKey, retryable: true };
    }

    /* Read the status defensively rather than with `error instanceof ApiError`.
       `instanceof` throws a TypeError when the class is not a function — which happens
       in any test or bundle where the `ApiError` export is missing — and a duck-typed
       status is what every caller actually relies on anyway. */
    const status = error?.status;

    if (error?.name === 'AbortError') {
        return { kind: 'aborted', key: null, retryable: false };
    }

    /**
     * NO STATUS MEANS THE REQUEST NEVER COMPLETED — checked BEFORE the numeric
     * comparisons, and that ordering is the fix for a real bug.
     *
     * It used to sit after `if (status >= 500)`. With `status === undefined` that
     * comparison is `false`, so execution fell PAST the whole numeric block and landed
     * on `(error.errorCode ?? error.code)`, which throws when `error` is null. The
     * result was that `AsyncBoundary` crashed while rendering its own error state, so
     * a user with a flaky connection saw a BLANK SCREEN instead of "Check your
     * connection" plus a retry — on every screen in the app.
     *
     * Every test that existed happened to use an error carrying a `status`, which is
     * why this survived: axios network failures do not always set one.
     */
    if (status === undefined || status === null) {
        return { kind: 'network', key: 'common.error.network', retryable: true };
    }

    if (status === 401 || status === 403) {
        return { kind: 'auth', key: 'common.error.sessionExpired', retryable: false };
    }
    /**
     * 402 is the credit gate: `IELTS_START`, `WRITING_START` and the rest reserve
     * credits before they run, and answer 402 when the wallet cannot cover them.
     * Verified against the running backend — a fresh account gets 402 from
     * POST /ielts/sessions/start.
     *
     * It is NOT a failure and NOT an auth problem, so it gets its own message and
     * a link to the wallet rather than a retry that cannot succeed.
     */
    if (status === 402) {
        return { kind: 'credits', key: 'common.error.notEnoughCredits', retryable: false };
    }
    if (status === 404) {
        return { kind: 'notFound', key: 'common.error.notFound', retryable: false };
    }
    if (status === 429) {
        return { kind: 'rateLimit', key: 'common.error.tooManyRequests', retryable: true };
    }
    if (status >= 500) {
        return { kind: 'server', key: 'common.error.server', retryable: true };
    }

    return { kind: 'unknown', key: error.errorCode ?? error.code ?? fallbackKey, retryable: true };
}

export { useAsyncResource as default };
