import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OnboardingAutoOpen from './OnboardingAutoOpen';
import { hasOnboardingAutoOpened, resetOnboardingAutoOpen } from '../features/onboarding/useOnboarding';

/**
 * The one behaviour a first-run flow can get badly wrong: bouncing the user.
 *
 * `/onboarding` sits outside the shell, so the component that opens it unmounts on the way
 * there. If the guard were component state, pressing Back would re-mount the shell, see the
 * same "onboarding required" answer, and push the user forward again — a navigation loop
 * they cannot escape. The guard is module state for exactly that reason, and these tests
 * are what hold it in place.
 */
function mount(shouldOpen) {
    return render(
        <MemoryRouter initialEntries={['/home']}>
            <Routes>
                <Route
                    path="/home"
                    element={
                        <>
                            <OnboardingAutoOpen shouldOpen={shouldOpen} />
                            <div>home screen</div>
                        </>
                    }
                />
                <Route path="/onboarding" element={<div>onboarding screen</div>} />
            </Routes>
        </MemoryRouter>
    );
}

beforeEach(() => {
    resetOnboardingAutoOpen();
});

describe('OnboardingAutoOpen', () => {
    it('opens onboarding when the server says it is required', async () => {
        mount(true);
        expect(await screen.findByText('onboarding screen')).toBeInTheDocument();
        expect(hasOnboardingAutoOpened()).toBe(true);
    });

    it('stays put when the server says it is not needed', async () => {
        mount(false);
        expect(await screen.findByText('home screen')).toBeInTheDocument();
        expect(hasOnboardingAutoOpened()).toBe(false);
    });

    it('does NOT fire twice, so Back is not a trap', async () => {
        /* First load opens onboarding. */
        const first = mount(true);
        await screen.findByText('onboarding screen');
        first.unmount();

        /* The user presses Back: the shell mounts again and asks the same question. It must
           not push them forward a second time. */
        mount(true);
        expect(await screen.findByText('home screen')).toBeInTheDocument();
        expect(screen.queryByText('onboarding screen')).not.toBeInTheDocument();
    });

    it('fires again on a fresh page load, because nothing was recorded', async () => {
        const first = mount(true);
        await screen.findByText('onboarding screen');
        first.unmount();

        /* A reload is a new module instance in the browser; this is the test-runner
           equivalent, and it is what makes abandoning the wizard harmless. */
        resetOnboardingAutoOpen();
        mount(true);
        expect(await screen.findByText('onboarding screen')).toBeInTheDocument();
    });
});
