import { Outlet } from 'react-router-dom';
import { CreditProvider } from '../contexts/CreditContext';
import { RealtimeStompProvider } from '../contexts/RealtimeStompContext';
import { VocabularyExplainProvider } from '../contexts/VocabularyExplainContext';

/**
 * The provider chain, as a wrapper around arbitrary children.
 *
 * ORDER IS A REAL DEPENDENCY CHAIN, not a style choice:
 *
 *   CreditProvider            reads only AuthContext.
 *   RealtimeStompProvider     reads AuthContext and the guest-session api.
 *   VocabularyExplainProvider reads BOTH: it prechecks the credit cost and publishes
 *                             over STOMP, and calls `refreshBalance()` when a stream
 *                             starts.
 *
 * These stay out of `main.jsx` on purpose. Importing them statically would put the STOMP
 * client in the FIRST download for every visitor; both layouts that use them are lazy,
 * so the cost is paid only on a screen that needs them.
 *
 * WHY THIS TAKES `children` RATHER THAN RENDERING AN `Outlet`: `AppLayout` already owns
 * the shell and its own `<Outlet />`, so it needs the providers wrapped AROUND its
 * chrome, not a second outlet in between. An earlier version had `AppLayout` render
 * `<ProviderLayout>` as a child, which put ProviderLayout's `Outlet` in the tree first —
 * so the child route never rendered and every shell screen came up blank.
 */
export function ProviderStack({ children }) {
    return (
        <CreditProvider>
            <RealtimeStompProvider>
                <VocabularyExplainProvider>{children}</VocabularyExplainProvider>
            </RealtimeStompProvider>
        </CreditProvider>
    );
}

/**
 * The provider chain for a route branch, with no chrome.
 *
 * The guest trial (`/vocabulary/check`) needs the AI explain stack but must NOT render
 * the sidebar, tab bar or floating Lexi. Before this existed, that route sat inside
 * `AppLayout` behind `RequireAuth`, so a guest who clicked "Học thử không cần tài khoản"
 * — a peer action on both the landing page and the login card — was redirected to
 * `/login`. The product promised a no-account trial that the routing made impossible.
 */
export default function ProviderLayout() {
    return (
        <ProviderStack>
            <Outlet />
        </ProviderStack>
    );
}
