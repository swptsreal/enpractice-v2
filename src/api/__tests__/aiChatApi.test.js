import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAiChatHistoryParams } from '../aiChatHistoryParams.js';

test('builds latest AI chat history params with default limit', () => {
    assert.deepEqual(buildAiChatHistoryParams(), { limit: 50 });
});

test('adds exclusive beforeSequence cursor when provided', () => {
    assert.deepEqual(
        buildAiChatHistoryParams({ beforeSequence: 70, limit: 25 }),
        { limit: 25, beforeSequence: 70 }
    );
});
