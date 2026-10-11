import assert from 'node:assert/strict';
import test from 'node:test';
import { isCreatedWithinLastDay } from './date.js';

const NOW = Date.parse('2026-07-29T12:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

test('identifies items created within the last 24 hours', () => {
    assert.equal(isCreatedWithinLastDay(NOW, NOW), true);
    assert.equal(isCreatedWithinLastDay(NOW - DAY_MS + 1, NOW), true);
    assert.equal(isCreatedWithinLastDay(NOW - DAY_MS, NOW), false);
    assert.equal(isCreatedWithinLastDay(NOW + 1, NOW), false);
    assert.equal(isCreatedWithinLastDay('invalid-date', NOW), false);
    assert.equal(isCreatedWithinLastDay(null, NOW), false);
});