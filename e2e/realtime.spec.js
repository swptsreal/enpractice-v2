import { expect, test } from '@playwright/test';
import { collectPageProblems, expectNoProblems, gotoWithRetry } from './helpers/guards.js';

/**
 * THE SOCKET HAS TO ACTUALLY OPEN — asserted as a WebSocket, not as a UI state.
 *
 * This is the check that was missing while `/vocabulary/check` sat on "Đang kết nối tới máy chủ
 * AI…" forever. The suite passed because it never looked: the page rendered, the console was clean,
 * and the one console error that the failure DID eventually produce
 * ("Failed to connect authenticated realtime") was on the guard's allowlist as dev-time noise.
 *
 * The defect was a pair of React StrictMode bugs in the realtime provider:
 *   1. `new Client(...)` and `createRealtimeTransportController({ client })` were two separate lazy
 *      `useState` initializers. StrictMode runs initializers twice, so the second controller was
 *      bound to the FIRST client and overwrote its `beforeConnect` / `onConnect` callbacks. The live
 *      controller activated the socket while the callback read a discarded controller's `targetMode`
 *      (`idle`), threw, and left `connect()`'s promise unsettled — with no error logged.
 *   2. A `deactivate()` still in flight from the StrictMode cleanup could reset the mode after
 *      `connect()` had set it.
 *
 * So the assertion is the socket itself: a WebSocket to `/ws/realtime-chat` is constructed, and the
 * "connecting" notice clears — which only happens after the broker answers the STOMP CONNECT frame.
 */
test.describe('realtime socket', () => {
    test('opens a STOMP socket on a shell screen and clears the connecting notice', async ({ page }) => {
        const opened = [];
        page.on('websocket', (socket) => opened.push(socket.url()));

        const problems = collectPageProblems(page);
        await gotoWithRetry(page, '/vocabulary/check');
        await page.locator('#main').waitFor({ state: 'attached' });

        /* The notice is the learner-visible symptom; it must GO AWAY, not merely appear. */
        await expect
            .poll(() => page.getByText(/Đang kết nối tới máy chủ AI/).count(), {
                message: 'the screen stayed on "Đang kết nối tới máy chủ AI…"',
                timeout: 20_000,
            })
            .toBe(0);

        const realtime = opened.filter((url) => url.includes('/ws/realtime-chat'));
        expect(
            realtime,
            `no STOMP socket was constructed. Sockets seen: ${opened.join(', ') || '(none)'}`
        ).not.toHaveLength(0);

        expectNoProblems(problems);
    });

    test('survives a reload without leaving a dead socket behind', async ({ page }) => {
        /* The StrictMode race was a remount race, so the second mount is the one that matters. */
        const opened = [];
        page.on('websocket', (socket) => opened.push(socket.url()));

        await gotoWithRetry(page, '/home');
        await page.locator('#main').waitFor({ state: 'attached' });
        await page.reload();
        await page.locator('#main').waitFor({ state: 'attached' });

        await expect.poll(() => opened.filter((u) => u.includes('/ws/realtime-chat')).length, {
            message: `no STOMP socket after reload. Sockets: ${opened.join(', ') || '(none)'}`,
            timeout: 20_000,
        }).toBeGreaterThan(0);
    });
});
