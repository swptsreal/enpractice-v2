import test from 'node:test';
import assert from 'node:assert/strict';
import {
    getWritingDifficultyTagStyle,
    getWritingStatusTagStyle,
    getWritingTaskTypeTagStyle,
} from '../writingTag.js';

test('maps writing task type tags to shared palette colors', () => {
    const task1 = getWritingTaskTypeTagStyle('TASK_1', { isDark: false });
    const task2 = getWritingTaskTypeTagStyle('TASK_2', { isDark: false });

    assert.equal(task1.color, 'var(--app-primary)');
    assert.equal(task2.color, 'var(--app-secondary)');
    assert.equal(task1.fontWeight, 600);
});

test('maps writing difficulty tags to semantic colors', () => {
    const easy = getWritingDifficultyTagStyle('EASY', { isDark: false });
    const medium = getWritingDifficultyTagStyle('MEDIUM', { isDark: false });
    const hard = getWritingDifficultyTagStyle('HARD', { isDark: false });

    assert.equal(easy.color, 'var(--app-success)');
    assert.equal(medium.color, 'var(--app-accent)');
    assert.equal(hard.color, 'var(--app-danger)');
});

test('maps writing status tags to semantic colors', () => {
    const inProgress = getWritingStatusTagStyle('IN_PROGRESS', { isDark: false });
    const completed = getWritingStatusTagStyle('COMPLETED', { isDark: false });
    const failed = getWritingStatusTagStyle('FAILED', { isDark: false });
    const neutral = getWritingStatusTagStyle('UNKNOWN', { isDark: false });

    assert.equal(inProgress.color, 'var(--app-primary)');
    assert.equal(completed.color, 'var(--app-success)');
    assert.equal(failed.color, 'var(--app-danger)');
    assert.equal(neutral.color, 'var(--app-text-secondary-color)');
});
