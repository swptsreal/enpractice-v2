import test from 'node:test';
import assert from 'node:assert/strict';
import {
    mergeChatMessages,
    normalizeHistoryMessage,
    normalizeHistoryPage,
} from '../chatHistoryMapper.js';

const USER_ID = 'user-1';

function historyMessage(overrides = {}) {
    return {
        id: 'server-1',
        sequence: 10,
        role: 'USER',
        status: 'COMPLETE',
        content: 'Hello',
        clientMessageId: 'client-1',
        replyToMessageId: null,
        errorCode: null,
        createdAt: '2026-08-01T03:10:20.123Z',
        completedAt: '2026-08-01T03:10:20.123Z',
        ...overrides,
    };
}

test('normalizes persisted history metadata for UI state', () => {
    assert.deepEqual(normalizeHistoryMessage(historyMessage(), USER_ID), {
        id: 'server-1',
        serverId: 'server-1',
        sequence: 10,
        clientMessageId: 'client-1',
        replyToMessageId: null,
        role: 'user',
        senderId: USER_ID,
        content: 'Hello',
        status: 'completed',
        errorCode: null,
        createdAt: '2026-08-01T03:10:20.123Z',
        completedAt: '2026-08-01T03:10:20.123Z',
        source: 'history',
    });
});

test('maps REST streaming history to interrupted', () => {
    const message = normalizeHistoryMessage(
        historyMessage({ role: 'ASSISTANT', status: 'STREAMING' }),
        USER_ID
    );

    assert.equal(message.status, 'interrupted');
    assert.equal(message.role, 'assistant');
    assert.equal(message.senderId, 'AI');
});

test('sorts normalized history by ascending sequence', () => {
    const messages = normalizeHistoryPage(
        [
            historyMessage({ id: 'server-3', sequence: 3 }),
            historyMessage({ id: 'server-1', sequence: 1 }),
            historyMessage({ id: 'server-2', sequence: 2 }),
        ],
        USER_ID
    );

    assert.deepEqual(
        messages.map((message) => message.sequence),
        [1, 2, 3]
    );
});

test('reconciles optimistic user by clientMessageId', () => {
    const optimistic = {
        id: 'client-1',
        serverId: null,
        sequence: null,
        clientMessageId: 'client-1',
        replyToMessageId: null,
        role: 'user',
        senderId: USER_ID,
        content: 'Hello',
        status: 'sending',
        errorCode: null,
        createdAt: '2026-08-01T03:10:19.000Z',
        completedAt: null,
        source: 'optimistic',
    };
    const persisted = normalizeHistoryMessage(historyMessage(), USER_ID);

    const merged = mergeChatMessages([optimistic], [persisted]);

    assert.equal(merged.length, 1);
    assert.equal(merged[0].id, 'server-1');
    assert.equal(merged[0].serverId, 'server-1');
    assert.equal(merged[0].sequence, 10);
    assert.equal(merged[0].status, 'completed');
    assert.equal(merged[0].source, 'history');
});

test('keeps terminal live content while adding REST metadata', () => {
    const live = {
        id: 'assistant-1',
        serverId: 'assistant-1',
        sequence: null,
        clientMessageId: 'client-1',
        replyToMessageId: null,
        role: 'assistant',
        senderId: 'AI',
        content: 'Final answer',
        status: 'completed',
        errorCode: null,
        createdAt: '2026-08-01 10:10:20',
        completedAt: '2026-08-01 10:10:22',
        source: 'live',
    };
    const staleHistory = normalizeHistoryMessage(
        historyMessage({
            id: 'assistant-1',
            sequence: 11,
            role: 'ASSISTANT',
            status: 'STREAMING',
            content: 'Final',
            clientMessageId: null,
            replyToMessageId: 'server-1',
            completedAt: null,
        }),
        USER_ID
    );

    const [merged] = mergeChatMessages([live], [staleHistory]);

    assert.equal(merged.status, 'completed');
    assert.equal(merged.content, 'Final answer');
    assert.equal(merged.sequence, 11);
    assert.equal(merged.replyToMessageId, 'server-1');
    assert.equal(merged.source, 'live');
});

test('deduplicates persisted IDs and leaves unsequenced live messages last', () => {
    const first = normalizeHistoryMessage(
        historyMessage({ id: 'server-1', sequence: 1 }),
        USER_ID
    );
    const duplicate = normalizeHistoryMessage(
        historyMessage({ id: 'server-1', sequence: 1, content: 'Updated' }),
        USER_ID
    );
    const live = {
        ...first,
        id: 'live-1',
        serverId: 'live-1',
        sequence: null,
        role: 'assistant',
        senderId: 'AI',
        source: 'live',
    };

    const merged = mergeChatMessages([first, live], [duplicate]);

    assert.equal(merged.length, 2);
    assert.equal(merged[0].id, 'server-1');
    assert.equal(merged[1].id, 'live-1');
});
