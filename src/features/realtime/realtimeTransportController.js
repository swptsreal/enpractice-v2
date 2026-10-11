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

    const deactivate = async () => {
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
    };

    const connect = async (mode, { forceNew = false } = {}) => {
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
