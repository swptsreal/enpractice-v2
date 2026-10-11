import test from 'node:test';
import assert from 'node:assert/strict';
import { REALTIME_MODES } from '../../guest-ai-trial/guestAiTrialConstants.js';
import { createRealtimeTransportController } from '../realtimeTransportController.js';

function createFakeClient() {
    return {
        active: false,
        connected: false,
        connectHeaders: {},
        reconnectDelay: 5000,
        activateCalls: 0,
        deactivateCalls: 0,
        publishCalls: [],
        activate() {
            this.active = true;
            this.activateCalls += 1;
        },
        async deactivate() {
            this.active = false;
            this.connected = false;
            this.deactivateCalls += 1;
            this.onDisconnect?.({});
        },
        publish(frame) {
            this.publishCalls.push(frame);
        },
    };
}

test('guest connection remains lazy and deduplicates callers', async () => {
    const client = createFakeClient();
    let sessionCalls = 0;
    const controller = createRealtimeTransportController({
        client,
        subscriptions: { bind() {}, unbind() {} },
        getAuthToken: async () => null,
        getGuestSession: async () => {
            sessionCalls += 1;
            return {
                guestId: 'guest-1',
                guestToken: 'guest-token',
            };
        },
    });

    assert.equal(client.activateCalls, 0);
    const first = controller.ensureGuestConnected();
    const second = controller.ensureGuestConnected();
    await client.beforeConnect();
    client.connected = true;
    client.onConnect();

    assert.deepEqual(await first, await second);
    assert.equal(sessionCalls, 1);
    assert.equal(client.activateCalls, 1);
    assert.equal(client.reconnectDelay, 0);
    assert.equal(controller.getSnapshot().mode, REALTIME_MODES.GUEST);
    assert.deepEqual(client.connectHeaders, {
        Authorization: 'Bearer guest-token',
    });
});

test('authenticated mode never creates guest session', async () => {
    const client = createFakeClient();
    let sessionCalls = 0;
    const controller = createRealtimeTransportController({
        client,
        subscriptions: { bind() {}, unbind() {} },
        getAuthToken: async () => 'auth-token',
        getGuestSession: async () => {
            sessionCalls += 1;
            return null;
        },
    });

    const pending = controller.connectAuthenticated();
    await client.beforeConnect();
    client.connected = true;
    client.onConnect();
    await pending;

    assert.equal(sessionCalls, 0);
    assert.equal(client.reconnectDelay, 5000);
    assert.equal(controller.getSnapshot().mode, REALTIME_MODES.AUTHENTICATED);
    assert.deepEqual(client.connectHeaders, {
        Authorization: 'Bearer auth-token',
    });
});

test('publish never queues while disconnected', () => {
    const client = createFakeClient();
    const controller = createRealtimeTransportController({
        client,
        subscriptions: { bind() {}, unbind() {} },
        getAuthToken: async () => null,
        getGuestSession: async () => null,
    });

    assert.equal(controller.publish('/app/test', { value: 1 }), false);
    assert.equal(client.publishCalls.length, 0);
});

test('intentional deactivate does not report transport error', async () => {
    const client = createFakeClient();
    let errorCalls = 0;
    const controller = createRealtimeTransportController({
        client,
        subscriptions: { bind() {}, unbind() {} },
        getAuthToken: async () => 'auth-token',
        getGuestSession: async () => null,
        onError: () => {
            errorCalls += 1;
        },
    });

    const pending = controller.connectAuthenticated();
    await client.beforeConnect();
    client.connected = true;
    client.onConnect();
    await pending;
    await controller.deactivate();

    assert.equal(errorCalls, 0);
    /* `connectionVersion` is part of the snapshot on purpose: it increments on every
       successful connect, and `RealtimeStompContext` reads it to tell a genuinely new
       connection from a replayed snapshot — which is how a stale stream event is
       discarded after a reconnect. This expectation was written before that field
       existed (the controller file in v1 is two hours newer than this test), so the
       test was already failing there. The controller is correct; the expectation
       was stale. One successful connect means version 1. */
    assert.deepEqual(controller.getSnapshot(), {
        mode: REALTIME_MODES.IDLE,
        isConnected: false,
        guestSession: null,
        connectionVersion: 1,
    });
});
test('updates transport error handler without rebuilding controller', () => {
    const client = createFakeClient();
    let errorCalls = 0;
    const controller = createRealtimeTransportController({
        client,
        subscriptions: { bind() {}, unbind() {} },
        getAuthToken: async () => null,
        getGuestSession: async () => null,
    });

    controller.setErrorHandler(() => {
        errorCalls += 1;
    });
    client.onStompError({});

    assert.equal(errorCalls, 1);
});
test('beforeConnect failure rejects caller and stops activation', async () => {
    const client = createFakeClient();
    const sessionError = new Error('Guest session unavailable');
    const controller = createRealtimeTransportController({
        client,
        subscriptions: { bind() {}, unbind() {} },
        getAuthToken: async () => null,
        getGuestSession: async () => {
            throw sessionError;
        },
    });

    const pending = controller.ensureGuestConnected();
    await client.beforeConnect();

    await assert.rejects(pending, sessionError);
    assert.equal(client.active, false);
    assert.equal(client.deactivateCalls, 1);
});
