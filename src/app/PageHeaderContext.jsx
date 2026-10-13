import { useState } from 'react';
import PageHeaderContext from './PageHeaderContextCore';

/**
 * Publishes the shell header's optional subtitle line.
 *
 * Mounted by `AppLayout` around the chrome, so a page can call
 * `useSetPageHeaderSubtitle('Mục tiêu band 6.5 · Unit 2 / 6')` and the header picks it up.
 * The state and the hooks live in `PageHeaderContextCore.js`; this file exports the component
 * only, so Fast Refresh keeps working.
 */
export function PageHeaderProvider({ children }) {
    const [subtitle, setSubtitle] = useState(null);
    return (
        <PageHeaderContext.Provider value={{ subtitle, setSubtitle }}>
            {children}
        </PageHeaderContext.Provider>
    );
}

export default PageHeaderProvider;
