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
 * Console errors tolerated only when THEY AND THE URL both match.
 *
 * The font stylesheet is loaded from Google's CDN (`index.html`), so a network hiccup produces
 * `Failed to load resource: net::ERR_NETWORK_CHANGED` in the console and the whole smoke run goes
 * red — twice, on unrelated screens, in the middle of a run that was otherwise green. That is not
 * an application defect: no app code is on the stack, and nothing the app can do would change it.
 *
 * THE SECOND ENTRY IS OUR OWN ORIGIN, AND STILL ONLY FOR `net::ERR_*`. On this machine the network
 * drops mid-run, which surfaces as `net::ERR_NETWORK_CHANGED` against the dev server's own paths —
 * `/api/learning-path` on one run, `/src/app/AppLayout.jsx` on the next — while other tests in the
 * same run pass. `net::ERR_<CODE>` is the browser reporting that the request never completed at the
 * TRANSPORT layer: there is no response and therefore no app behaviour to blame.
 *
 * IT STAYS NARROW ON PURPOSE, and the distinction is the whole point of keeping this list explicit:
 *   - a 4xx/5xx from our API is `... the server responded with a status of 500`, which does NOT
 *     match `net::ERR_`, so real backend failures still fail the run;
 *   - a transport failure against a DIFFERENT host (a typo'd or dead third-party origin) still
 *     fails, because only our own origin is listed here;
 *   - the match requires the URL too, so a console message about a network failure cannot be
 *     silenced by merely being worded like this one.
 */
const ALLOWED_CONSOLE_ERROR_PAIRS = [
    {
        text: /Failed to load resource: net::ERR_/i,
        url: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//i,
        reason: 'font CDN network failure — external to the app',
    },
    {
        text: /Failed to load resource: net::ERR_/i,
        url: /^https:\/\/localhost:5273\//i,
        reason: 'dev-server transport failure (net::ERR_*) — no response reached the app',
    },
];

/** Is this console error one of the tolerated (text, url) pairs? */
function isToleratedPair(text, url) {
    if (!url) return false;
    return ALLOWED_CONSOLE_ERROR_PAIRS.some((pair) => pair.text.test(text) && pair.url.test(url));
}

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

/**
 * An UNSUBSTITUTED i18n variable, e.g. `{{nodes}} bài · 1 bài kiểm tra cuối unit`.
 *
 * This is the sibling of the raw-key check and it shipped to production in the bundle: the
 * `{{…}}` form is NOT caught by `RAW_I18N_KEY` (there is no dot) and it was NOT caught by
 * `scripts/i18n-audit.mjs`, which only asked whether a key existed. `/path` printed it because
 * the locale interpolates `{{nodes}}` while the call site passed `{ count: … }`.
 *
 * It is checked on the rendered page, not on the source, so a value reached by a dynamic key
 * (`t(\`x.${kind}\`)`) is covered too — the case no source scanner can see.
 */
const RAW_PLACEHOLDER = /\{\{\s*[a-zA-Z0-9_]+\s*\}\}/;

/** Text that means the page failed rather than loaded. */
const CRASH_TEXT = /useCredit must be used inside|Cannot read propert|is not a function|Minified React error/i;

/**
 * Navigate, retrying ONLY a transport-level failure.
 *
 * `page.goto: net::ERR_NETWORK_CHANGED at https://localhost:5273/...` is the machine's network stack
 * being reconfigured (a VPN or Wi-Fi change) while Chromium's network service is mid-request. It is
 * not the app: `localhost` is not reachable through a tunnel, and the same run passes the identical
 * route a minute later. Without this, a suite that verifies 27 screens goes red for the Wi-Fi.
 *
 * ONLY `net::ERR_` IS RETRIED, and only twice. A 404, a 500, a TLS error or a render failure is a
 * real result and is reported immediately — the whole point of the guard suite is that it does not
 * learn to tolerate defects.
 */
export async function gotoWithRetry(page, path, options = { waitUntil: 'domcontentloaded' }) {
    let lastError;
    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            return await page.goto(path, options);
        } catch (error) {
            lastError = error;
            if (!/net::ERR_/.test(String(error?.message))) throw error;
            console.log(`[guards] transport failure on ${path} (attempt ${attempt + 1}): ${error.message}`);
            await page.waitForTimeout(1000);
        }
    }
    throw lastError;
}

/**
 * Fail unless the page actually drew something.
 *
 * `body.innerText` is polled rather than read once, because the alternative is a fixed sleep that
 * is either too short (a slow API makes an empty page look like a blank screen) or too long on
 * every screen. The bar is deliberately low — 40 characters — because this is a smoke check about
 * "did anything render", not a copy assertion.
 *
 * ── THE ONE RETRY, AND WHY IT IS EVIDENCE-GATED ───────────────────────────────
 *
 * On this machine the network drops mid-load often enough to matter: the document arrives, the
 * module graph does not, and React never mounts — a pure-white page, `innerText` empty, no app
 * error anywhere. That is indistinguishable from a real crash UNLESS the console says so, so a
 * retry is taken ONLY when the collected problems contain a transport-level `net::ERR_` (and only
 * once). If a mounted-but-empty screen, a thrown exception or an app-origin API failure is the
 * cause, the retry is skipped and the original failure stands. Every retry prints its reason.
 *
 * `problems` is the array from `collectPageProblems(page)`.
 */
export async function expectBodyHasContent(page, { minLength = 40, timeout = 15_000, problems = [] } = {}) {
    let text = '';
    try {
        await expect
            .poll(
                async () => {
                    text = (await page.locator('body').innerText()).trim();
                    return text.length;
                },
                {
                    timeout,
                    message: `body text never reached ${minLength} characters — the screen rendered nothing`,
                }
            )
            .toBeGreaterThan(minLength);
        return text;
    } catch (error) {
        /* Transient-transport evidence. `net::ERR_*` is the browser's own verdict that a request
           never completed, and a dynamic import that failed to fetch is the same event seen from the
           route's side. Note that the `net::ERR_*` console entry may have been ALLOWED above (our own
           origin is on the pair list now), so the module-fetch sentence has to count on its own —
           otherwise the evidence is suppressed and the retry never runs. */
        const transportFailure = problems.find(isTransportProblem);
        if (!transportFailure) throw error;

        /* Two attempts, because the failing thing is the machine's network, not the app: the reload
           itself can land in the same outage (observed as `[vite] ws proxy error: read ECONNRESET`
           alongside the browser's `net::ERR_NETWORK_CHANGED`). */
        for (let attempt = 1; attempt <= 2; attempt += 1) {
            console.log(
                `[guards] blank page after a transport failure — reload attempt ${attempt}/2: ${transportFailure}`
            );
            await page.waitForTimeout(1500 * attempt);
            await gotoWithRetry(page, page.url());
            try {
                await expect
                    .poll(async () => (await page.locator('body').innerText()).trim().length, {
                        timeout,
                        message: `body text never reached ${minLength} characters after reload ${attempt} — the screen is genuinely empty`,
                    })
                    .toBeGreaterThan(minLength);
                /* The page loaded on a fresh navigation, which is the evidence that the transport
                   failures were transient — see the helper for why nothing else is cleared. */
                clearTransportProblems(problems);
                return (await page.locator('body').innerText()).trim();
            } catch (retryError) {
                if (attempt === 2) throw retryError;
            }
        }
        throw error;
    }
}

/**
 * Is this problem a transient TRANSPORT failure rather than app behaviour?
 *
 * Kept as one predicate so the retry trigger and the clearing can never disagree — they did once:
 * allowing our own origin's `net::ERR_*` above removed the evidence the retry looked for, so a
 * blank page caused by a dropped module load was reported as a crash instead of being retried.
 */
function isTransportProblem(problem) {
    return (
        /net::ERR_/.test(problem) ||
        /Failed to fetch dynamically imported module/.test(problem) ||
        /Importing a module script failed/.test(problem)
    );
}

/**
 * Drop the transport problems that a fresh, SUCCESSFUL navigation has just disproved — nothing else.
 *
 * On this machine the network cuts out mid-load often enough that a dynamically imported module
 * fails (`Failed to fetch dynamically imported module: …/AppLayout.jsx`) and the route renders
 * blank. Once the reload succeeds, those entries describe a transient outage rather than the app,
 * and leaving them in fails a screen that is in fact fine.
 *
 * IT CANNOT HIDE REAL BREAKAGE, for two reasons. First, it only runs at all after the page rendered
 * on a fresh navigation, so a module path that is genuinely wrong fails the reload and the guard
 * throws instead. Second, only transport-shaped entries are removed: a `TypeError`, an uncaught
 * exception with a stack of its own, or an app-origin 4xx/5xx is kept and still fails the run.
 * Every removal is printed.
 */
function clearTransportProblems(problems) {
    const removed = problems.filter(isTransportProblem);
    if (removed.length === 0) return 0;

    const kept = problems.filter((problem) => !isTransportProblem(problem));
    problems.length = 0;
    problems.push(...kept);
    for (const problem of removed) {
        console.log(`[guards] cleared, disproved by a successful reload: ${problem}`);
    }
    return removed.length;
}

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
        if (isToleratedPair(text, url)) return;
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

/** Fails if a raw i18n key, an unsubstituted variable, or a crash sentence is visible. */
export async function expectNoRawKeyOrCrash(page) {
    const text = await page.locator('body').innerText();

    const key = text.match(RAW_I18N_KEY);
    expect(key ? key[0] : null, `raw i18n key rendered on screen: ${key?.[0]}`).toBeNull();

    const placeholder = text.match(RAW_PLACEHOLDER);
    expect(
        placeholder ? placeholder[0] : null,
        `unsubstituted i18n variable rendered on screen: ${placeholder?.[0]}`
    ).toBeNull();

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
