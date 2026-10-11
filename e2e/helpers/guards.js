import { expect } from '@playwright/test';

/**
 * The guards that make this suite worth its runtime.
 *
 * They are aimed at the defect classes that actually shipped, not at everything that could go
 * wrong. Each one exists because a green unit gate missed the real thing:
 *
 *   - an uncaught render error (two routes threw "useCredit must be used inside CreditProvider"
 *     and drew nothing at all);
 *   - a raw i18n key on screen (`ielts.difficulty.EASY` — the audit only sees literal `t('...')`
 *     calls, so interpolation slipped past every gate);
 *   - a page that renders empty while every request returns 200 (the envelope was unwrapped twice;
 *     the network tab was clean and every screen was blank).
 */

/** Console errors that are known noise here, each with the reason it is tolerated. */
const ALLOWED_CONSOLE_ERRORS = [
    /* The STOMP client logs this when there is no authenticated realtime token; it is a dev-time
       diagnostic, not a user-visible failure. */
    /Failed to connect authenticated realtime/i,
    /* Chromium's own advice about the React devtools extension. */
    /Download the React DevTools/i,
];

/**
 * KNOWN BACKEND DEFECTS, matched on BOTH the request URL and the message so an exception cannot
 * quietly grow to cover a different failure.
 *
 * EMPTY, AND THAT IS THE POINT. The one entry that lived here was:
 *
 *   `GET /user/reports/weekly/current` answered HTTP 500 for an account with no weekly report yet,
 *   because the backend's catch-all exception handler swallowed `ResponseStatusException` and
 *   rewrote a deliberate 404 as a server error. Fixed at the source
 *   (`GlobalExceptionHandler.handleResponseStatus` in en-practice-be), and the fix is only real if
 *   the exception is gone — a path stayed free for exactly this reason.
 *
 * If a future defect has to be tolerated, add it here with the measured evidence and the condition
 * that removes it, and delete it the moment the backend is fixed.
 */
const KNOWN_FAILURES = [];

/**
 * i18n keys are `namespace.something` and the namespaces are a known, finite list, so this matches
 * app keys rather than "any word with a dot" — hostnames and decimal numbers must not trip it.
 */
const RAW_I18N_KEY =
    /\b(?:ielts|common|home|nav|profilePage|rewards|speaking|writing|vocabulary|dictionary|settings|evaluation|leaderboard|landing|onboarding|learningPath|auth|progress|weeklyReport|credits|challenges|notifications|aiChat|customSpeaking|review)\.[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)+/;

/** Text that means the page failed rather than loaded. */
const CRASH_TEXT = /useCredit must be used inside|Cannot read propert|is not a function|Minified React error/i;

/**
 * Subscribes to the page's own error channels and returns the list it fills in.
 *
 * Call this BEFORE navigating: a page that throws during hydration does not wait for us.
 */
export function collectPageProblems(page) {
    const problems = [];

    page.on('pageerror', (error) => {
        problems.push(`uncaught exception: ${error.message}`);
    });

    page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        const url = message.location()?.url ?? '';
        if (ALLOWED_CONSOLE_ERRORS.some((pattern) => pattern.test(text))) return;
        if (KNOWN_FAILURES.some((known) => known.url.test(url) && known.text.test(text))) return;
        problems.push(`console.error: ${text}${url ? ` [${url}]` : ''}`);
    });

    return problems;
}

/**
 * Fails if the page shows Vite's dev error overlay.
 *
 * A render error in dev does not blank the page — it covers it with an overlay, so without this
 * check a crash looks like a normal page to any assertion that only reads text.
 */
export async function expectNoErrorOverlay(page) {
    await expect(page.locator('vite-error-overlay'), 'Vite error overlay is present').toHaveCount(0);
}

/** Fails if a raw i18n key or crash sentence is visible. */
export async function expectNoRawKeyOrCrash(page) {
    const text = await page.locator('body').innerText();

    const key = text.match(RAW_I18N_KEY);
    expect(key ? key[0] : null, `raw i18n key rendered on screen: ${key?.[0]}`).toBeNull();

    const crash = text.match(CRASH_TEXT);
    expect(crash ? crash[0] : null, `crash text rendered on screen: ${crash?.[0]}`).toBeNull();
}

/**
 * Fails on an uncaught exception or a non-allowlisted console error.
 *
 * Reported as one list so a failure names every problem instead of only the first.
 */
export function expectNoProblems(problems) {
    expect(problems, problems.join('\n')).toEqual([]);
}
