import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the REAL backend and the REAL dev server.
 *
 * This exists because of what the first UI review and the following afternoon proved: the whole
 * `verify` gate can be green — 444 unit tests, i18n, contrast, build — while the browser renders
 * empty screens, prints `ielts.difficulty.EASY` on a card, or throws
 * "useCredit must be used inside CreditProvider" on two routes. Unit tests here mock the api
 * module, so they cannot see any of that; they agreed with an implementation that disagreed with
 * the runtime. Playwright drives the actual page.
 *
 * THINGS THAT ARE NOT OBVIOUS:
 *
 * 1. THE DEV SERVER SPEAKS HTTPS WITH A SELF-SIGNED CERTIFICATE (`basicSsl()` in vite.config.js),
 *    so `ignoreHTTPSErrors` is required in both `use` and `webServer`. Without it every
 *    navigation fails with a TLS error and the report blames the app.
 *
 * 2. THE PORT IS 5273, NOT 5173, AND `--strictPort` IS SET. 5173 is where the v1 dev server and
 *    the developer's own server live; if E2E used it, Playwright would happily test whatever was
 *    already running — a different app, at a different commit. Strict port means "fail loudly"
 *    instead of "silently move to 5274 and test something else".
 *
 * 3. ONE WORKER, SERIAL. These tests share one dev server, one dev database and one account.
 *    Parallel workers would fight over the same rows and produce failures that mean nothing.
 *
 * 4. IT NEEDS THE BACKEND ON 8082. `npm run verify` does NOT run this suite — it is a separate
 *    command (`npm run test:e2e`) precisely because E2E has an external dependency that the unit
 *    gate must not have.
 */
const PORT = Number(process.env.E2E_PORT ?? 5273);
const BASE_URL = `https://localhost:${PORT}`;

export default defineConfig({
    testDir: './e2e',
    globalSetup: './e2e/global-setup.js',
    timeout: 45_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    reporter: [['list']],
    outputDir: 'e2e/.artifacts',
    use: {
        baseURL: BASE_URL,
        ignoreHTTPSErrors: true,
        locale: 'vi-VN',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        storageState: 'e2e/.auth/state.json',
        /**
         * A SYNTHETIC MICROPHONE. The speaking screens record real audio, and headless Chromium
         * answers `getUserMedia` with NotSupportedError without a device — the conversation flow
         * could not be driven past the record button. `--use-fake-ui-for-media-stream` also
         * auto-accepts the permission prompt, so no test depends on a browser dialog. Both flags
         * are inert for every other suite, which never asks for media.
         */
        launchOptions: {
            args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
        },
    },
    projects: [
        {
            name: 'desktop',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
        },
        {
            /* The product is mobile-first (tab bar, thumb-reachable actions) and the shell is
               where a layout regression costs the most, so the same pass runs on a phone. */
            name: 'mobile',
            use: { ...devices['Pixel 7'] },
        },
    ],
    webServer: {
        command: `npm run dev -- --port ${PORT} --strictPort`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        ignoreHTTPSErrors: true,
        timeout: 120_000,
        stdout: 'ignore',
        stderr: 'pipe',
        /**
         * The dev server is HTTPS, and an absolute `http://localhost:8082` in `.env` is blocked as
         * mixed content. An empty value makes axios use the relative `/api` path, which Vite proxies
         * to the backend. Without this every authenticated E2E screen falls back to /login.
         */
        env: { ...process.env, VITE_API_URL: '' },
    },
});
