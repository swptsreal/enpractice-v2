import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasOnboardingAutoOpened, markOnboardingAutoOpened } from '../features/onboarding/useOnboarding';

/**
 * Opens onboarding once, for a first-run account.
 *
 * IT IS A COMPONENT THAT RENDERS NOTHING, and it is separate from the shell for one
 * reason: the navigation has to be testable. The shell cannot be mounted in a test without
 * pulling in the credit provider, the STOMP client and the explain provider, so the rule
 * that matters most — "open once, and never trap the Back button" — would have had no test
 * at all.
 *
 * `shouldOpen` is passed in rather than read from the hook, because the shell already calls
 * `useOnboardingGate()` for the streak chip. Reading it here too would issue a second
 * `/user/profile/summary` request on every app load for one boolean.
 *
 * WHY THE GUARD IS MODULE STATE: `/onboarding` is outside the shell, so navigating there
 * unmounts this component. A `useRef` guard would be forgotten on that unmount, and the
 * user pressing Back would be pushed forward again — a loop with no exit. The flag lives
 * for the page load instead: once the gate has fired, Back is the user's decision.
 */
export default function OnboardingAutoOpen({ shouldOpen }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!shouldOpen || hasOnboardingAutoOpened()) return;
        markOnboardingAutoOpened();
        navigate('/onboarding');
    }, [shouldOpen, navigate]);

    return null;
}
