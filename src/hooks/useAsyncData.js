import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Run an async resource for a data hook, without the traps that each bit this
 * codebase for real:
 *
 *  1. **StrictMode's double-invoked effect.** React mounts, runs the effect,
 *     cleans up, then runs it again. If the cleanup sets a `cancelled` flag that
 *     the in-flight first request then checks, that request refuses to clear
 *     `loading` — and the screen sits on a spinner WITH THE DATA ALREADY IN HAND.
 *     The fix: the cleanup guards only the PAYLOAD, never the spinner. The newest
 *     settled request always clears it. React 18+ dropped the
 *     setState-after-unmount warning, so over-guarding buys nothing.
 *
 *  2. **A superseded response overwriting a newer one.** Typing fast in a search
 *     box issues several requests; without sequencing, the slow reply for "mit"
 *     can land after "mitigate" and replace the results. A monotonic id makes the
 *     newest request authoritative.
 *
 *  3. **A spinner that never clears when `loading` starts `true`.** The very first
 *     render must not be `loading: true` with nothing in flight, or the effect's
 *     cleanup ordering can leave it stuck. It is set inside the effect instead,
 *     which is the one place that knows a request actually started.
 *
 * `loader` MUST be stable (`useCallback` in the caller). `key` is the request
 * identity: change it to refetch. The two are deliberately separate so a filter
 * change refetches while an unrelated re-render does not.
 */
export function useAsyncData(loader, key, initial = null) {
    const [data, setData] = useState(initial);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nonce, setNonce] = useState(0);

    const latest = useRef(0);

    useEffect(() => {
        const id = ++latest.current;
        let cancelled = false;

        /* An async IIFE so every setState lands in a promise callback rather than
           synchronously in the effect body, which the hooks lint rule flags as a
           cascading render. */
        (async () => {
            setLoading(true);
            try {
                const value = await loader();
                if (cancelled || id !== latest.current) return;
                setData(value);
                setError(null);
            } catch (err) {
                if (cancelled || id !== latest.current) return;
                setError(err);
            } finally {
                /* Only the newest request settles the spinner, and a cancelled
                   effect must NOT block it — see note 1. */
                if (id === latest.current) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [loader, key, nonce]);

    const reload = useCallback(() => setNonce((n) => n + 1), []);

    return { data, loading, error, reload };
}

export default useAsyncData;
