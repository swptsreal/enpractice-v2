import test from 'node:test';
import assert from 'node:assert/strict';
import {
    CHAT_SCROLL_THRESHOLD_PX,
    isNearChatBottom,
    shouldRequestChatScroll,
} from '../chatScrollState.js';

test('detects viewport near chat bottom using shared threshold', () => {
    assert.equal(CHAT_SCROLL_THRESHOLD_PX, 120);
    assert.equal(
        isNearChatBottom({
            scrollHeight: 1000,
            scrollTop: 680,
            clientHeight: 200,
        }),
        true
    );
    assert.equal(
        isNearChatBottom({
            scrollHeight: 1000,
            scrollTop: 500,
            clientHeight: 200,
        }),
        false
    );
});

test('requests scroll only for optimistic send and START', () => {
    assert.equal(shouldRequestChatScroll('send'), true);
    assert.equal(shouldRequestChatScroll('START'), true);
    assert.equal(shouldRequestChatScroll('DELTA'), false);
    assert.equal(shouldRequestChatScroll('COMPLETE'), false);
    assert.equal(shouldRequestChatScroll('ERROR'), false);
    assert.equal(shouldRequestChatScroll('prepend'), false);
});
