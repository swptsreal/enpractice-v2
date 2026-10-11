import test from 'node:test';
import assert from 'node:assert/strict';
import { REALTIME_MODES } from '../../guest-ai-trial/guestAiTrialConstants.js';
import {
    createVocabularyExplainState,
    getVocabularyExplainContract,
    normalizeVocabularyExplainWord,
    reduceVocabularyExplain,
    selectActiveGuestExplainRequestId,
} from '../vocabularyExplainState.js';

test('guest explain uses public private queue and cancel destination', () => {
    assert.deepEqual(getVocabularyExplainContract(REALTIME_MODES.GUEST), {
        queue: '/user/queue/public/vocabulary/explain',
        destination: '/app/public/vocabulary/explain',
        cancelDestination: '/app/public/vocabulary/explain/cancel',
    });
});

test('authenticated explain contract remains unchanged', () => {
    assert.deepEqual(
        getVocabularyExplainContract(REALTIME_MODES.AUTHENTICATED),
        {
            queue: '/user/queue/vocabulary/explain',
            destination: '/app/vocabulary/explain',
            cancelDestination: '/app/vocabulary/explain/cancel',
        }
    );
});

test('guest word normalization trims and lowercases', () => {
    assert.equal(
        normalizeVocabularyExplainWord('  Elaborate  ', { lowercase: true }),
        'elaborate'
    );
    assert.equal(normalizeVocabularyExplainWord('Elaborate'), 'Elaborate');
});

test('reducer stores quota metadata only from supplied events', () => {
    const state = createVocabularyExplainState(
        'request-1',
        'word',
        { mode: REALTIME_MODES.GUEST }
    );
    const next = reduceVocabularyExplain(state, {
        requestId: 'request-1',
        type: 'START',
        quotaRemaining: 2,
        quotaResetAt: '2026-07-31T00:00:00+07:00',
    });
    assert.equal(next.quotaRemaining, 2);
    assert.equal(next.quotaResetAt, '2026-07-31T00:00:00+07:00');
});

test('selects only active guest request for replacement', () => {
    const requests = {
        auth: {
            requestId: 'auth',
            mode: REALTIME_MODES.AUTHENTICATED,
            status: 'streaming',
        },
        oldGuest: {
            requestId: 'oldGuest',
            mode: REALTIME_MODES.GUEST,
            status: 'streaming',
        },
        completeGuest: {
            requestId: 'completeGuest',
            mode: REALTIME_MODES.GUEST,
            status: 'complete',
        },
    };
    assert.equal(
        selectActiveGuestExplainRequestId(requests),
        'oldGuest'
    );
});

