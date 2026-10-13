import { expect } from '@playwright/test';

/**
 * Screenshots that survive the shell becoming a fixed viewport.
 *
 * `page.screenshot({ fullPage: true })` captures the DOCUMENT box. That was correct while the
 * document scrolled, and it silently stopped being correct the moment `AppLayout` became
 * `h-dvh` with `<main>` as its own scrollport: the document is now exactly one viewport tall, so
 * every `fullPage` shot collapsed to viewport height and everything below the fold — Settings'
 * "Dữ liệu" section, the lower nodes of `/path`, the bottom of Home — simply disappeared from the
 * PNG. No assertion failed. The only thing that broke was the artifact a human reviews, which is
 * exactly the thing nobody notices is missing.
 *
 * Playwright does not stitch nested scrollers, so the fix is to give the inner scroller the room
 * it needs BEFORE shooting: measure `#main`'s content height and grow the viewport to fit, capped
 * so one pathological page cannot ask for a 40,000px bitmap. `fullPage` then has nothing extra to
 * do, which is why the shot below is a plain viewport capture.
 */
const MAX_CAPTURE_HEIGHT = 8000;

export async function captureScreen(page, filePath) {
    const viewport = page.viewportSize() ?? { width: 1280, height: 900 };

    const contentHeight = await page.evaluate(() => {
        const main = document.querySelector('#main');
        /* Both cases are handled: the shell's inner scrollport when there is one, and the document
           for the surfaces that live outside it (landing, login, onboarding, take screens). */
        const inner = main ? main.scrollHeight : 0;
        const outer = document.documentElement.scrollHeight;
        return Math.max(inner, outer);
    });

    const height = Math.min(Math.max(contentHeight, viewport.height), MAX_CAPTURE_HEIGHT);
    if (height !== viewport.height) await page.setViewportSize({ width: viewport.width, height });

    /* A scrollport that has been grown still clips its own overflow, so reset the two properties
       that make it one. Scoped to the shot: the assertions in the calling test have already run,
       and the page is discarded immediately after. */
    await page.addStyleTag({
        content: '#main { overflow: visible !important; height: auto !important; }',
    });

    await page.screenshot({ path: filePath, fullPage: true });
}

/**
 * The layout contract the shell now keeps.
 *
 * Asserted in a real browser because jsdom has no layout engine: `App.test.jsx` can prove the
 * routes render, and cannot prove that the header stopped moving or that the document stopped
 * scrolling. Returns the two measurements so a caller can report them on failure.
 */
export async function measureScrollContainers(page) {
    return page.evaluate(() => {
        const main = document.querySelector('#main');
        const doc = document.documentElement;
        return {
            /* The route the app actually settled on. It is in the measurement because a missing
               `#main` almost always means a REDIRECT — `/onboarding` and `/login` are outside the
               shell — and without this the failure reads as "the shell is broken" when the app is
               simply somewhere else. */
            path: window.location.pathname,
            documentScrolls: doc.scrollHeight > doc.clientHeight + 1,
            mainExists: Boolean(main),
            mainScrolls: main ? main.scrollHeight > main.clientHeight + 1 : false,
            mainScrollTop: main ? main.scrollTop : null,
        };
    });
}

/**
 * The two layout contracts are SEPARATE, and conflating them is how this check would lie.
 *
 *   shell routes   the document does not scroll AND `#main` is the scrollport
 *   everything else — landing, login, onboarding, `/vocabulary/check`, `/ielts/take`,
 *                    `/writing/task/:id`, `/speaking/practice/:id`, `/vocabulary/test`,
 *                    `/dictionary/review` — scroll the DOCUMENT and have no `#main` at all
 *
 * They are mounted outside `AppLayout` on purpose (see `src/App.jsx`), so asserting the shell
 * contract on a take screen fails with "#main is missing" and reads like a broken shell when the
 * screen is exactly where it should be.
 */
export async function expectDocumentDoesNotScroll(page) {
    const m = await measureScrollContainers(page);
    expect(
        m.documentScrolls,
        `the document scrolls on ${m.path} (scrollHeight > clientHeight)`
    ).toBe(false);
}

/** The shell contract: the document is fixed and `#main` is what scrolls. */
export async function expectShellScrollport(page) {
    const m = await measureScrollContainers(page);
    expect(
        m.mainExists,
        `#main is missing on ${m.path} — either the shell did not mount, or the app redirected outside it (onboarding/login)`
    ).toBe(true);
    await expectDocumentDoesNotScroll(page);
}
