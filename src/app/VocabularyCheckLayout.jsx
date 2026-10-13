import { useAuth } from '../contexts/AuthContext';
import AppLayout from './AppLayout';
import ProviderLayout from './ProviderLayout';

/**
 * `/vocabulary/check` wears two different chromes depending on WHO is looking, and that is the
 * whole point of this component.
 *
 * The screen is the product's no-account trial — "Học thử không cần tài khoản" is a peer action on
 * the landing page and on the login card — so for a VISITOR it must stay full-bleed with no
 * sidebar, no tab bar and no floating Lexi: chrome belonging to an account they do not have.
 *
 * But the mockup draws screen 07 INSIDE the shell (rail, header, tab bar — `_design/mockup/
 * 07-vocabulary-check.html`), and that is what a signed-in learner should get: it is the "Học"
 * destination in the rail, and rendering it chrome-free for them produced the reported defect —
 * the page looked like guest mode, with a "Đăng nhập" button in its header, and no way back to the
 * rest of the app except the browser's Back button.
 *
 * WHY A LAYOUT ROUTE RATHER THAN A BRANCH INSIDE THE PAGE: both layouts already render an
 * `<Outlet />` and already mount the Credit -> RealtimeStomp -> VocabularyExplain provider chain
 * (see `ProviderLayout.jsx`), so the page itself needs no knowledge of either. Deciding here keeps
 * `VocabularyCheckPage` about vocabulary.
 *
 * `loading` renders nothing rather than guessing: `AuthContext` starts in that state, and painting
 * the guest chrome first would flash a "Đăng nhập" button at a signed-in user on every reload.
 */
export default function VocabularyCheckLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return null;

    return isAuthenticated ? <AppLayout /> : <ProviderLayout />;
}
