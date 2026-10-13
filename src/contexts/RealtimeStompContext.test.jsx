import { StrictMode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/**
 * THE PROVIDER'S CLIENT AND CONTROLLER MUST BE THE SAME PAIR.
 *
 * The bug this file pins was invisible: `/vocabulary/check` said "Đang kết nối tới máy chủ AI…"
 * forever, no WebSocket was ever constructed, and NOTHING was logged — because two controllers
 * existed over one `Client`. React StrictMode invokes lazy `useState` initializers twice; the second
 * `new Client(...)` was discarded but the second `createRealtimeTransportController({ client })`
 * received the FIRST client and re-assigned its `beforeConnect` / `onConnect` callbacks. The live
 * controller then drove `client.activate()` while the callback read a discarded controller's
 * `targetMode` — `idle` — threw "Realtime target mode is idle", and left the promise `connect()`
 * returned unsettled.
 *
 * So the assertion is the OUTCOME (the socket reaches CONNECTED and the context reports it) under
 * StrictMode, with a fake client whose `activate()` runs its own `beforeConnect` and then completes
 * the handshake the way stompjs does. One controller or two, this is what has to happen.
 */

/* Every client the provider constructs. StrictMode builds TWO (the second pass's is discarded), so
   a test must assert on the one that actually connected, not on the most recently constructed. */
const createdClients = [];
vi.mock('@stomp/stompjs', () => {
    class FakeClient {
        constructor(config) {
            this.brokerURL = config.brokerURL;
            this.active = false;
            this.connected = false;
            this.connectHeaders = {};
            this.reconnectDelay = 0;
            this.beforeConnect = null;
            this.onConnect = null;
            this.onDisconnect = null;
            this.onStompError = null;
            this.onWebSocketClose = null;
            /* Exposed so the test can read the state of the object the provider actually uses. */
            createdClients.push(this);
        }

        activate() {
            this.active = true;
            /* stompjs awaits `beforeConnect` and only then opens the socket; a THROW here is the
               failure mode, and it must surface instead of being swallowed. */
            Promise.resolve()
                .then(() => this.beforeConnect?.())
                .then(() => {
                    if (!this.active) return;
                    this.connected = true;
                    this.onConnect?.({});
                })
                .catch((error) => {
                    this.activationError = error;
                });
        }

        async deactivate() {
            this.active = false;
            this.connected = false;
        }

        publish() {
            return true;
        }
    }

    return { Client: FakeClient };
});

vi.mock('../api', () => ({
    ensureValidAccessToken: async () => 'access-token-for-test',
}));

vi.mock('./AuthContext', () => ({
    useAuth: () => ({ loading: false, isAuthenticated: true, user: { id: 'u1' } }),
}));

const { RealtimeStompProvider } = await import('./RealtimeStompContext');
const { useRealtimeStomp } = await import('./RealtimeStompContextCore');

function Probe() {
    const { isConnected, mode } = useRealtimeStomp();
    return (
        <output data-testid="state">{`${mode}:${isConnected ? 'connected' : 'connecting'}`}</output>
    );
}

describe('RealtimeStompProvider', () => {
    it('reaches a CONNECTED authenticated socket under StrictMode', async () => {
        render(
            <StrictMode>
                <RealtimeStompProvider>
                    <Probe />
                </RealtimeStompProvider>
            </StrictMode>
        );

        await waitFor(() =>
            expect(screen.getByTestId('state').textContent).toBe('authenticated:connected')
        );

        /* The activation carried the bearer header, which only happens when `beforeConnect` ran
           from the SAME controller that set the mode. */
        const connected = createdClients.filter((client) => client.connected);
        expect(connected).toHaveLength(1);
        expect(connected[0].connectHeaders.Authorization).toBe('Bearer access-token-for-test');
        expect(connected[0].activationError).toBeUndefined();
    });
});
