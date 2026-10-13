import { createContext, useContext, useEffect } from 'react';

/**
 * The shared state behind `PageHeaderContext.jsx`.
 *
 * Split from the provider for the same reason `CreditContextCore` / `RealtimeStompContextCore` /
 * `VocabularyExplainContextCore` are split: a module that exports BOTH a component and plain
 * functions defeats React Fast Refresh, and the lint rule that says so is right. The provider is
 * the only component; everything here is state plumbing.
 *
 * WHAT THIS IS FOR: one line of page context under the shell's `<h1>`, published by the page.
 * The mockup for screen 06 puts "Mục tiêu band 6.5 · Unit 2 / 6" in the shell HEADER as a
 * `t-micro` line. `AppLayout` renders that header for every shell route, so the value has to
 * travel from a page that is a SIBLING of the header — neither a prop (the page does not render
 * the header) nor `PAGE_TITLES` (a static route -> key map that holds no data) can carry it.
 *
 * Deliberately narrow: a string, cleared on unmount, no other slots. Anything more belongs to a
 * real header model, and inventing one for a single screen would be the wrong trade.
 */
const PageHeaderContext = createContext(null);

/** Read side, used by the shell. */
export function usePageHeaderSubtitle() {
    return useContext(PageHeaderContext)?.subtitle ?? null;
}

/**
 * Write side, used by a page.
 *
 * The cleanup clears the line when the page unmounts, so a subtitle can never leak onto the next
 * route — the failure mode where `/home` shows "Unit 2 / 6" from a path screen the user has
 * already left.
 */
export function useSetPageHeaderSubtitle(subtitle) {
    const setSubtitle = useContext(PageHeaderContext)?.setSubtitle;

    useEffect(() => {
        if (!setSubtitle) return undefined;
        setSubtitle(subtitle ?? null);
        return () => setSubtitle(null);
    }, [setSubtitle, subtitle]);
}

export default PageHeaderContext;
