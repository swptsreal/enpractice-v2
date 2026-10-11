import test from 'node:test';
import assert from 'node:assert/strict';
import { REALTIME_MODES } from '../../guest-ai-trial/guestAiTrialConstants.js';
import {
    buildChatRequest,
    getChatRealtimeContract,
    GUEST_CHAT_DEFAULT_MAX_CHARACTERS,
    normalizeChatContent,
} from '../chatRealtimeContract.js';

test('guest chat uses private public queue and public app destination', () => {
    assert.deepEqual(getChatRealtimeContract(REALTIME_MODES.GUEST, null), {
        queue: '/user/queue/public/realtime-chat',
        destination: '/app/public/realtime-chat',
    });
});

test('authenticated chat keeps current topic and destination', () => {
    assert.deepEqual(
        getChatRealtimeContract(REALTIME_MODES.AUTHENTICATED, 'user-1'),
        {
            queue: '/topic/realtime-chat/user-1',
            destination: '/app/realtime-chat',
        }
    );
});

test('guest payload never sends frontend identity', () => {
    assert.deepEqual(
        buildChatRequest({
            mode: REALTIME_MODES.GUEST,
            clientMessageId: 'message-1',
            content: 'hello',
            identity: 'guest-1',
        }),
        {
            clientMessageId: 'message-1',
            content: 'hello',
            senderId: null,
            timestamp: null,
        }
    );
});

test('authenticated payload omits legacy clientId', () => {
    const request = buildChatRequest({
        mode: REALTIME_MODES.AUTHENTICATED,
        clientMessageId: 'message-1',
        content: 'hello',
        identity: 'user-1',
    });

    assert.deepEqual(Object.keys(request).sort(), [
        'clientMessageId',
        'content',
        'senderId',
        'timestamp',
    ]);
    assert.equal(request.senderId, 'user-1');
});

test('guest content precheck uses contract default limit', () => {
    assert.equal(GUEST_CHAT_DEFAULT_MAX_CHARACTERS, 1000);
    assert.equal(normalizeChatContent('  hello  '), 'hello');
    assert.throws(
        () => normalizeChatContent('x'.repeat(1001)),
        /1-1000 characters/
    );
});
