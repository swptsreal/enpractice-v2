import assert from 'node:assert/strict';
import test from 'node:test';

import { buildVocabularyGeneratePayload } from '../vocabularyTest.js';

test('adds a non-blank clientRequestId to generate payload', () => {
    const payload = buildVocabularyGeneratePayload({
        questionCount: 10,
        sources: ['ALL'],
    });

    assert.equal(typeof payload.clientRequestId, 'string');
    assert.notEqual(payload.clientRequestId.trim(), '');
});
