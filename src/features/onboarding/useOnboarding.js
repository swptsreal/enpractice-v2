import { useCallback, useState } from 'react';
import { profileApi } from '../../api';
import { unwrapData } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Onboarding state, and the two jobs that need it.
 *
 *   `useOnboardingGate`  answers ONE question for the shell: "should this person be shown
 *                        onboarding right now?" The answer is computed by the server
 *                        (`onboarding.required`) rather than re-derived here, so a new
 *                        status value added later cannot silently mean something
 *                        different on the client.
 *
 *   `useSubmitOnboarding` writes the survey answers and the finishing status together.
 *
 * WHY THE GATE ASKS FOR `/user/profile/summary` AND NOT THE FULL PROFILE: this runs once
 * per app load for every signed-in user, so it has to be the cheap endpoint. The full
 * `/user/profile` also aggregates recommendations, recent activity and the leaderboard —
 * three extra queries for a boolean.
 *
 * WHY A GUEST ISSUES NO REQUEST AT ALL: the shell also renders for a signed-out visitor
 * (the root route hands them the landing page), and firing an authenticated request there
 * would 401 on every visit. The loader short-circuits instead.
 */

/**
 * Has the gate already fired in THIS page load?
 *
 * Module scope, deliberately, and it is not a cache: the gate must fire once per page
 * load, not once per mount. `/onboarding` lives outside the shell, so navigating there
 * unmounts the shell; when the visitor presses Back, the shell mounts again and a
 * component-level flag would immediately bounce them forward again — a navigation trap
 * the user cannot escape with the Back button.
 *
 * A page load, not a session: someone who abandons onboarding on step 3 gets it again on
 * their next visit, which is the intended behaviour, because nothing was recorded.
 */
let autoOpenedThisLoad = false;

export function hasOnboardingAutoOpened() {
    return autoOpenedThisLoad;
}

export function markOnboardingAutoOpened() {
    autoOpenedThisLoad = true;
}

/** Test-only: module state must not leak between tests. */
export function resetOnboardingAutoOpen() {
    autoOpenedThisLoad = false;
}

export function useOnboardingGate() {
    const { isAuthenticated } = useAuth();

    const loader = useCallback(
        () => (isAuthenticated ? profileApi.getSummary().then(unwrapData) : Promise.resolve(null)),
        [isAuthenticated]
    );

    const { data, loading, error, reload } = useAsyncData(loader, 'onboarding-gate');

    const onboarding = data?.onboarding ?? null;

    return {
        /* The whole summary, because the shell also reads the streak from it. */
        summary: data ?? null,
        onboarding,
        shouldOpen: onboarding?.required === true,
        /* `null` means "server never said", which is not the same as "server said no". */
        requiredVersion: onboarding?.requiredVersion ?? null,
        loading,
        error,
        reload,
    };
}

/**
 * Write the answers and the finishing status.
 *
 * The caller gets the rejection as well as the state, so a caller that wants to stay on
 * the screen and show the reason can, while the shell keeps working with the state alone.
 */
export function useSubmitOnboarding() {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const submit = useCallback(async (payload) => {
        setSaving(true);
        setError(null);
        try {
            return unwrapData(await profileApi.submitOnboarding(payload));
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setSaving(false);
        }
    }, []);

    return { submit, saving, error, reset: () => setError(null) };
}
