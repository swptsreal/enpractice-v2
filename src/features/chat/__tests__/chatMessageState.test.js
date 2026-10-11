import test from 'node:test';
import assert from 'node:assert/strict';
import {
    applyIncomingEvent,
    createOptimisticUserMessage,
    getRetryableMessage,
    markMessageSendFailed,
    markUnresolvedSendingMessages,
} from '../chatMessageState.js';

test('creates normalized optimistic user message', () => {
    const message = createOptimisticUserMessage({
        clientMessageId: 'client-1',
        content: 'Hello',
        senderId: 'user-1',
        timestamp: '2026-08-01T03:10:20.123Z',
        source: 'optimistic',
    });

    assert.equal(message.id, 'client-1');
    assert.equal(message.serverId, null);
    assert.equal(message.role, 'user');
    assert.equal(message.status, 'sending');
    assert.equal(message.clientMessageId, 'client-1');
});

test('START completes optimistic user and creates one streaming assistant', () => {
    const optimistic = createOptimisticUserMessage({
        clientMessageId: 'client-1',
        content: 'Hello',
        senderId: 'user-1',
        timestamp: '2026-08-01T03:10:20.123Z',
    });

    const messages = applyIncomingEvent([optimistic], {
        type: 'START',
        messageId: 'ai-1',
        clientMessageId: 'client-1',
        senderId: 'AI',
        content: '',
    });

    assert.equal(messages.length, 2);
    assert.equal(messages[0].status, 'completed');
    assert.equal(messages[1].id, 'ai-1');
    assert.equal(messages[1].serverId, 'ai-1');
    assert.equal(messages[1].role, 'assistant');
    assert.equal(messages[1].status, 'streaming');
});

test('reduces START DELTA COMPLETE by assistant messageId', () => {
    let messages = [];
    messages = applyIncomingEvent(messages, {
        type: 'START',
        messageId: 'ai-1',
        clientMessageId: 'client-1',
        senderId: 'AI',
        content: '',
    });
    messages = applyIncomingEvent(messages, {
        type: 'DELTA',
        messageId: 'ai-1',
        clientMessageId: 'client-1',
        content: 'Hel',
    });
    messages = applyIncomingEvent(messages, {
        type: 'DELTA',
        messageId: 'ai-1',
        clientMessageId: 'client-1',
        content: 'lo',
    });
    messages = applyIncomingEvent(messages, {
        type: 'COMPLETE',
        messageId: 'ai-1',
        clientMessageId: 'client-1',
        content: 'Hello',
    });

    assert.equal(messages.length, 1);
    assert.equal(messages[0].status, 'completed');
    assert.equal(messages[0].content, 'Hello');
    assert.equal(messages[0].clientMessageId, 'client-1');
});

test('duplicate COMPLETE upserts existing assistant bubble', () => {
    const completed = applyIncomingEvent([], {
        type: 'COMPLETE',
        messageId: 'ai-1',
        clientMessageId: 'client-1',
        content: 'Hello',
    });
    const duplicate = applyIncomingEvent(completed, {
        type: 'COMPLETE',
        messageId: 'ai-1',
        clientMessageId: 'client-1',
        content: 'Hello again',
    });

    assert.equal(duplicate.length, 1);
    assert.equal(duplicate[0].content, 'Hello again');
});

test('DUPLICATE_IN_PROGRESS does not create a second error bubble', () => {
    const streaming = applyIncomingEvent([], {
        type: 'START',
        messageId: 'ai-1',
        clientMessageId: 'client-1',
    });
    const duplicate = applyIncomingEvent(streaming, {
        type: 'ERROR',
        messageId: 'ai-1',
        clientMessageId: 'client-1',
        errorCode: 'DUPLICATE_IN_PROGRESS',
        content: 'Already running',
    });

    assert.equal(duplicate.length, 1);
    assert.equal(duplicate[0].status, 'streaming');
});

test('marks publish failure and exposes retryable message', () => {
    const optimistic = createOptimisticUserMessage({
        clientMessageId: 'client-2',
        content: 'Retry me',
        senderId: 'user-1',
    });
    const failed = markMessageSendFailed([optimistic], 'client-2');

    assert.equal(failed[0].status, 'error');
    assert.equal(getRetryableMessage(failed, 'client-2'), failed[0]);
});

test('marks unresolved sending messages after reconnect reconciliation', () => {
    const found = createOptimisticUserMessage({
        clientMessageId: 'client-found',
        content: 'Found',
        senderId: 'user-1',
    });
    const missing = createOptimisticUserMessage({
        clientMessageId: 'client-missing',
        content: 'Missing',
        senderId: 'user-1',
    });

    const reconciled = markUnresolvedSendingMessages(
        [found, missing],
        new Set(['client-found'])
    );

    assert.equal(reconciled[0].status, 'sending');
    assert.equal(reconciled[1].status, 'error');
});

test('ERROR is terminal and keeps error metadata', () => {
    const messages = applyIncomingEvent([], {
        type: 'ERROR',
        messageId: 'ai-2',
        clientMessageId: 'client-2',
        errorCode: 'AI_STREAM_FAILED',
        content: 'Timed out',
    });

    assert.equal(messages[0].status, 'error');
    assert.equal(messages[0].errorCode, 'AI_STREAM_FAILED');
    assert.equal(messages[0].clientMessageId, 'client-2');
});
