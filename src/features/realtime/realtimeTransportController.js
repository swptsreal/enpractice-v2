import { REALTIME_MODES } from '../guest-ai-trial/guestAiTrialConstants.js';

function createConnectionError(message, code = 'CONNECTION_CLOSED') {
    const error = new Error(message);
    error.code = code;
    return error;
}

export function createRealtimeTransportController({
    client,
    subscriptions,
    getAuthToken,
    getGuestSession,
    onSnapshot = () => {},
    onError = () => {},
}) {
    let targetMode = REALTIME_MODES.IDLE;
    let guestSession = null;
    let snapshot = {
        mode: REALTIME_MODES.IDLE,
        isConnected: false,
        guestSession: null,
        connectionVersion: 0,
    };
    let pendingConnection = null;
    let intentionalDisconnect = false;
    let errorHandler = onError;

    const emit = (next) => {
        snapshot = { ...snapshot, ...next };
        onSnapshot(snapshot);
    };

    const rejectPending = (error) => {
        pendingConnection?.reject(error);
        pendingConnection = null;
    };

    const handleClosed = (value) => {
        subscriptions.unbind();
        emit({ isConnected: false });
        rejectPending(createConnectionError('Realtime connection closed'));
        if (!intentionalDisconnect) errorHandler(value);
    };

    client.beforeConnect = async () => {
        try {
            client.reconnectDelay =
                targetMode === REALTIME_MODES.AUTHENTICATED ? 5000 : 0;

            if (targetMode === REALTIME_MODES.AUTHENTICATED) {
                const accessToken = await getAuthToken();
                if (!accessToken) {
                    throw createConnectionError(
                        'Authenticated realtime token is unavailable',
                        'AUTH_TOKEN_UNAVAILABLE'
                    );
                }
                guestSession = null;
                client.connectHeaders = {
                    Authorization: `Bearer ${accessToken}`,
                };
                return;
            }

            if (targetMode === REALTIME_MODES.GUEST) {
                guestSession = await getGuestSession({
                    forceNew: Boolean(pendingConnection?.forceNew),
                });
                client.connectHeaders = {
                    Authorization: `Bearer ${guestSession.guestToken}`,
                };
                return;
            }

            throw createConnectionError('Realtime target mode is idle');

        } catch (error) {
            rejectPending(error);
            await deactivate();
        }
    };

    client.onConnect = () => {
        subscriptions.bind(client);
        emit({
            mode: targetMode,
            isConnected: true,
            guestSession:
                targetMode === REALTIME_MODES.GUEST ? guestSession : null,
            connectionVersion: snapshot.connectionVersion + 1,
        });
        pendingConnection?.resolve(snapshot);
        pendingConnection = null;
    };

    client.onDisconnect = handleClosed;
    client.onStompError = handleClosed;
    client.onWebSocketClose = handleClosed;

    /**
     * DEACTIVATE IS SERIALIZED, AND THAT IS THE FIX FOR A SILENT DEAD SOCKET.
     *
     * The shell's provider runs `controller.deactivate()` from an effect cleanup, and React's
     * StrictMode runs that cleanup and the re-mounted effect back to back. `deactivate()` awaits
     * `client.deactivate()`, so it is still in flight when the re-run calls `connect()` — and its
     * trailing `targetMode = REALTIME_MODES.IDLE` then lands AFTER `connect()` set the mode.
     * `client.beforeConnect` reads `targetMode`, finds IDLE and throws "Realtime target mode is
     * idle"; by then `pendingConnection` has already been nulled, so `rejectPending` is a no-op and
     * the promise `connect()` returned NEVER SETTLES. The observable result is exactly what was
     * reported: no WebSocket is ever constructed, nothing is logged, and the screen says
     * "Đang kết nối tới máy chủ AI…" forever. Measured: `beforeConnect {targetMode: 'idle'}` while
     * the requested mode was `authenticated`.
     *
     * So every call shares ONE in-flight promise and `connect()` awaits it before touching the
     * mode. A second caller joins the first instead of starting a competing teardown.
     */
    let deactivatePromise = null;
    const deactivate = () => {
        if (!deactivatePromise) {
            deactivatePromise = (async () => {
                rejectPending(createConnectionError('Realtime mode changed'));
                subscriptions.unbind();
                intentionalDisconnect = true;
                try {
                    if (client.active) await client.deactivate();
                } finally {
                    intentionalDisconnect = false;
                }
                targetMode = REALTIME_MODES.IDLE;
                guestSession = null;
                client.connectHeaders = {};
                emit({
                    mode: REALTIME_MODES.IDLE,
                    isConnected: false,
                    guestSession: null,
                });
            })().finally(() => {
                deactivatePromise = null;
            });
        }
        return deactivatePromise;
    };

    const connect = async (mode, { forceNew = false } = {}) => {
        /* WAIT FOR A TEARDOWN IN FLIGHT *BEFORE* READING THE SNAPSHOT.
           A `deactivate()` that has not emitted yet still reports the OLD connection, so deciding
           first and awaiting later would early-return "already connected in this mode" — and then the
           teardown lands and leaves the controller idle with nobody left to reconnect. Deciding on
           the post-teardown state is also what keeps the trailing `targetMode = IDLE` from landing
           after this call set the mode (see the note on `deactivate` above). */
        if (deactivatePromise) await deactivatePromise.catch(() => {});

        if (snapshot.isConnected && snapshot.mode === mode && !forceNew) {
            return snapshot;
        }
        if (pendingConnection?.mode === mode && !forceNew) {
            return pendingConnection.promise;
        }
        if (client.active || snapshot.mode !== REALTIME_MODES.IDLE) {
            await deactivate();
        }

        targetMode = mode;
        let resolve;
        let reject;
        const promise = new Promise((nextResolve, nextReject) => {
            resolve = nextResolve;
            reject = nextReject;
        });
        pendingConnection = { mode, forceNew, promise, resolve, reject };
        client.activate();
        return promise;
    };

    const publish = (destination, body) => {
        if (!client.connected) return false;
        client.publish({
            destination,
            body: typeof body === 'string' ? body : JSON.stringify(body),
        });
        return true;
    };

    return {
        connectAuthenticated: () => connect(REALTIME_MODES.AUTHENTICATED),
        ensureGuestConnected: () => connect(REALTIME_MODES.GUEST),
        renewGuestConnection: () =>
            connect(REALTIME_MODES.GUEST, { forceNew: true }),
        deactivate,
        publish,
        setErrorHandler: (handler = () => {}) => {
            errorHandler = handler;
        },
        getSnapshot: () => snapshot,
    };
}
