import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * `useOnboardingGate` — the shell's one question, and the flag that bounds it.
 *
 * REQUEST COUNT IS THE POINT. This hook runs in the shell on every signed-in screen, so:
 *
 *   - a signed-out visitor must issue NO request (the shell renders while `RequireAuth` is
 *     deciding, and it used to render around the landing page too, so a naive loader put a
 *     401 on every visit),
 *   - a signed-in user must issue exactly ONE.
 *
 * The navigation itself is covered by `src/app/OnboardingAutoOpen.test.jsx`; here the
 * contract is the answer and the guard.
 */
let authenticated = true;

const getSummary = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    profileApi: { getSummary: (...args) => getSummary(...args) },
}));

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({ isAuthenticated: authenticated, loading: false, user: null }),
}));

const { i18nReady } = await import('../../i18n');
const {
    hasOnboardingAutoOpened,
    markOnboardingAutoOpened,
    resetOnboardingAutoOpen,
    useOnboardingGate,
} = await import('./useOnboarding');

beforeAll(async () => {
    await i18nReady;
});

beforeEach(() => {
    authenticated = true;
    getSummary.mockReset();
    resetOnboardingAutoOpen();
});

/** Renders only the hook's answer, so the assertion is about data rather than markup. */
function GateProbe() {
    const { shouldOpen, requiredVersion, loading } = useOnboardingGate();
    return (
        <div>
            <span>open:{String(shouldOpen)}</span>
            <span>version:{String(requiredVersion)}</span>
            <span>loading:{String(loading)}</span>
        </div>
    );
}

const summaryWith = (onboarding) => ({
    data: { success: true, message: 'OK', data: { id: 'u1', currentStreak: 4, onboarding } },
});

describe('useOnboardingGate', () => {
    it('opens when the server says required', async () => {
        getSummary.mockResolvedValue(summaryWith({ required: true, requiredVersion: 1 }));

        render(<GateProbe />);

        expect(await screen.findByText('open:true')).toBeInTheDocument();
        expect(screen.getByText('version:1')).toBeInTheDocument();
        expect(getSummary).toHaveBeenCalledTimes(1);
    });

    it('stays closed when the server says not required, and reports the current version', async () => {
        getSummary.mockResolvedValue(summaryWith({ required: false, requiredVersion: 1 }));

        render(<GateProbe />);

        expect(await screen.findByText('open:false')).toBeInTheDocument();
        expect(screen.getByText('version:1')).toBeInTheDocument();
    });

    it('treats a missing onboarding block as "do not open", not as "open"', async () => {
        /* An older backend that does not send the block yet must not trigger a wizard. */
        getSummary.mockResolvedValue(summaryWith(undefined));

        render(<GateProbe />);

        expect(await screen.findByText('open:false')).toBeInTheDocument();
        expect(screen.getByText('version:null')).toBeInTheDocument();
    });

    it('asks the backend nothing at all for a signed-out visitor', async () => {
        authenticated = false;

        render(<GateProbe />);

        expect(await screen.findByText('open:false')).toBeInTheDocument();
        expect(getSummary).not.toHaveBeenCalled();
    });
});

describe('the once-per-page-load guard', () => {
    it('is false until it is marked, then stays true', () => {
        resetOnboardingAutoOpen();
        expect(hasOnboardingAutoOpened()).toBe(false);

        markOnboardingAutoOpened();
        expect(hasOnboardingAutoOpened()).toBe(true);

        /* Marking again is harmless and must not reset anything. */
        markOnboardingAutoOpened();
        expect(hasOnboardingAutoOpened()).toBe(true);
    });
});
