import { describe, expect, it } from 'vitest';
import {
    NODE_STATES,
    REASON_LABEL_KEYS,
    STATE_LABEL_KEYS,
    formatBand,
    isMeasuredBand,
    isPressable,
    nodeTitleKey,
    progressFor,
    skillKeyFor,
    unitTitleParts,
} from './useLearningPath';

/**
 * The path's pure layer.
 *
 * These are the decisions the screen must not get wrong, and all of them are about NOT
 * stating something the data does not support: a band that was never measured, a progress
 * line invented for a node that reports none, a title translated from a value we do not know.
 */
describe('band measurement', () => {
    it('treats 0 and null the same way, because the backend uses both for "not measured"', () => {
        expect(isMeasuredBand(0)).toBe(false);
        expect(isMeasuredBand(null)).toBe(false);
        expect(isMeasuredBand(undefined)).toBe(false);
        expect(isMeasuredBand(6.5)).toBe(true);
        expect(isMeasuredBand(1)).toBe(true);
    });

    it('always writes a band with one decimal', () => {
        expect(formatBand(6)).toBe('6.0');
        expect(formatBand(6.5)).toBe('6.5');
        expect(formatBand(null)).toBeNull();
    });
});

describe('node title', () => {
    it('translates a drill from its question type', () => {
        expect(nodeTitleKey({ kind: 'TYPE_DRILL', questionType: 'MATCHING_HEADINGS' })).toBe(
            'learningPath.type.matchingHeadings'
        );
    });

    it('leaves a content-backed node to the server title', () => {
        expect(nodeTitleKey({ kind: 'WRITING_TASK', questionType: null })).toBeNull();
        expect(nodeTitleKey({ kind: 'SPEAKING_TOPIC' })).toBeNull();
    });

    it('returns null for a type it has no words for, rather than a raw key', () => {
        expect(nodeTitleKey({ kind: 'TYPE_DRILL', questionType: 'SOMETHING_NEW' })).toBeNull();
    });
});

describe('progress line', () => {
    it('reads a drill as answered over target', () => {
        expect(progressFor({ progress: { answered: 3, target: 10 } })).toEqual({
            key: 'learningPath.drillProgress',
            values: { answered: 3, target: 10 },
        });
    });

    it('never shows more answered than the target', () => {
        /* The server counts lifetime answers for the type; the node's goal is the target, so
           "câu 47/10" would look like a bug rather than an achievement. */
        expect(progressFor({ progress: { answered: 47, target: 10 } }).values).toEqual({
            answered: 10,
            target: 10,
        });
    });

    it('reads finished work as done over total', () => {
        expect(progressFor({ progress: { done: 2, total: 5 } })).toEqual({
            key: 'learningPath.practiceProgress',
            values: { done: 2, total: 5 },
        });
    });

    it('shows nothing when the node reports no progress at all', () => {
        expect(progressFor({ progress: null })).toBeNull();
        expect(progressFor({ progress: { accuracy: 0.8 } })).toBeNull();
        expect(progressFor(null)).toBeNull();
    });
});

describe('pressability', () => {
    it('makes every state pressable except locked', () => {
        expect(isPressable({ state: NODE_STATES.DONE })).toBe(true);
        expect(isPressable({ state: NODE_STATES.CURRENT })).toBe(true);
        expect(isPressable({ state: NODE_STATES.MILESTONE })).toBe(true);
        expect(isPressable({ state: NODE_STATES.LOCKED })).toBe(false);
        expect(isPressable(null)).toBe(false);
    });
});

describe('unit title parts', () => {
    it('names a question-type unit from its skill and its type', () => {
        expect(unitTitleParts({ focusType: 'QUESTION_TYPE', skill: 'READING', questionType: 'MATCHING_HEADINGS' })).toEqual(
            { skillKey: 'ielts.skill.reading', typeKey: 'learningPath.type.matchingHeadings' }
        );
    });

    it('names the diagnostic and vocabulary units without a skill prefix', () => {
        expect(unitTitleParts({ focusType: 'DIAGNOSTIC' })).toEqual({
            skillKey: null,
            typeKey: 'learningPath.starterTitle',
        });
        expect(unitTitleParts({ focusType: 'VOCAB_REVIEW' })).toEqual({
            skillKey: null,
            typeKey: 'learningPath.vocabUnit',
        });
    });

    it('falls back to the server title for a focus it cannot name', () => {
        expect(unitTitleParts({ focusType: 'SOMETHING_NEW', skill: 'READING' }).typeKey).toBeNull();
        expect(unitTitleParts({ focusType: 'QUESTION_TYPE', skill: 'READING', questionType: 'UNKNOWN' }).typeKey).toBeNull();
    });

    it('gives vocabulary its own skill key, because it is not an IELTS skill', () => {
        expect(skillKeyFor('VOCABULARY')).toBe('learningPath.skill.vocabulary');
        expect(skillKeyFor('READING')).toBe('ielts.skill.reading');
        expect(skillKeyFor('NOPE')).toBe('learningPath.skill.other');
    });
});

describe('label maps are complete', () => {
    it('has words for every state', () => {
        for (const state of Object.values(NODE_STATES)) {
            expect(STATE_LABEL_KEYS[state]).toBeTruthy();
        }
    });

    it('has words for every reason the API is allowed to send', () => {
        /* The API may send exactly these codes (see _design/LEARNING-PATH.md §4). A missing
           one would render a raw i18n key under the node the learner is on. */
        const apiReasonCodes = [
            'DRILL_TARGET_MET',
            'DRILL_IN_PROGRESS',
            'DRILL_NOT_STARTED',
            'PRACTICE_COMPLETED',
            'PRACTICE_NOT_STARTED',
            'SUBMISSION_GRADED',
            'SUBMISSION_NOT_GRADED',
            'ATTEMPT_GRADED',
            'ATTEMPT_NOT_GRADED',
            'VOCAB_DUE',
            'VOCAB_CLEAR',
            'NEEDS_PREVIOUS_NODE',
            'NEEDS_ALL_UNIT_NODES',
            'WEAKEST_MEASURED_TYPE',
            'NEXT_IN_UNIT',
            'UNIT_CHECK',
            'DIAGNOSTIC_BASELINE',
        ];

        for (const code of apiReasonCodes) {
            expect(REASON_LABEL_KEYS[code], code).toBeTruthy();
        }
        expect(Object.keys(REASON_LABEL_KEYS)).toHaveLength(apiReasonCodes.length);
    });
});
