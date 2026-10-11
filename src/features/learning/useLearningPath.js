import { useCallback } from 'react';
import { learningPathApi } from '../../api';
import { unwrapData } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';

/**
 * Learning path (screen 06).
 *
 * THE SERVER DECIDES STATE, THE CLIENT DECIDES WORDS. `state` (`DONE | CURRENT | LOCKED |
 * MILESTONE`) and `stateReason` (a fixed machine code) arrive computed, because the rule is
 * "how much of this question type have you answered correctly, and has the previous node
 * finished" — a rule the client must not keep a second copy of. What comes back is never a
 * sentence: every label is an i18n key chosen here, so the API stays language-neutral and
 * Vietnamese is not baked into a JSON payload.
 *
 * The one exception is `title`, and it is deliberate: for a node made of CONTENT (an IELTS
 * test's name, a speaking topic's question) the title is authored prose in one language and
 * there is nothing to translate it from. For a drill node the title is derived here from
 * `questionType`, and the server's `title` is only a fallback.
 *
 * WHY THE V1 `features/learning/*` MODULES ARE NOT PORTED FOR THIS. v1's `learningAnalytics`
 * and `learningAction` are referenced by four hooks under `src/hooks/` that nothing imports —
 * they cannot resolve their imports today, which is recorded as tech debt. Porting ~700 lines
 * of localStorage analytics to serve a screen that navigates a URL the API already hands it
 * would be a large change with no user-visible effect. The debt stays debt; a node launch just
 * navigates `action.url`.
 */

/** The four states the design system defines for a path node. */
export const NODE_STATES = Object.freeze({
    DONE: 'DONE',
    CURRENT: 'CURRENT',
    LOCKED: 'LOCKED',
    MILESTONE: 'MILESTONE',
});

/** Node kinds the API can return. `UNIT_CHECK` is the unit's milestone. */
export const NODE_KINDS = Object.freeze({
    TYPE_DRILL: 'TYPE_DRILL',
    SCOPED_PRACTICE: 'SCOPED_PRACTICE',
    WRITING_TASK: 'WRITING_TASK',
    SPEAKING_TOPIC: 'SPEAKING_TOPIC',
    VOCAB_REVIEW: 'VOCAB_REVIEW',
    UNIT_CHECK: 'UNIT_CHECK',
});

/**
 * Static maps, never interpolated keys.
 *
 * `t(\`…${value}\`)` is rejected by the i18n audit because a missing key then fails at
 * runtime instead of at build time. Every mapping here is a literal table, so a typo is a
 * missing-key warning in the audit rather than a raw key on screen.
 */
export const STATE_LABEL_KEYS = {
    DONE: 'learningPath.stateDone',
    CURRENT: 'learningPath.stateCurrent',
    LOCKED: 'learningPath.stateLocked',
    MILESTONE: 'learningPath.stateMilestone',
};

/** Why a node is where it is. A fixed set; the server must not invent new codes. */
export const REASON_LABEL_KEYS = {
    DRILL_TARGET_MET: 'learningPath.reason.drillTargetMet',
    DRILL_IN_PROGRESS: 'learningPath.reason.drillInProgress',
    DRILL_NOT_STARTED: 'learningPath.reason.drillNotStarted',
    PRACTICE_COMPLETED: 'learningPath.reason.practiceCompleted',
    PRACTICE_NOT_STARTED: 'learningPath.reason.practiceNotStarted',
    SUBMISSION_GRADED: 'learningPath.reason.submissionGraded',
    SUBMISSION_NOT_GRADED: 'learningPath.reason.submissionNotGraded',
    ATTEMPT_GRADED: 'learningPath.reason.attemptGraded',
    ATTEMPT_NOT_GRADED: 'learningPath.reason.attemptNotGraded',
    VOCAB_DUE: 'learningPath.reason.vocabDue',
    VOCAB_CLEAR: 'learningPath.reason.vocabClear',
    NEEDS_PREVIOUS_NODE: 'learningPath.reason.needsPreviousNode',
    NEEDS_ALL_UNIT_NODES: 'learningPath.reason.needsAllUnitNodes',
    WEAKEST_MEASURED_TYPE: 'learningPath.reason.weakestMeasuredType',
    NEXT_IN_UNIT: 'learningPath.reason.nextInUnit',
    UNIT_CHECK: 'learningPath.reason.unitCheck',
    DIAGNOSTIC_BASELINE: 'learningPath.reason.diagnosticBaseline',
};

/**
 * The 11 IELTS question types, as display names.
 *
 * These are proper exam terms, so the two languages differ only where Vietnamese genuinely
 * has its own words ("Nối tiêu đề" for Matching Headings) — the same split the IELTS screens
 * already use for `LISTENING`/`READING`.
 */
export const QUESTION_TYPE_KEYS = {
    FORM_COMPLETION: 'learningPath.type.formCompletion',
    SINGLE_CHOICE: 'learningPath.type.singleChoice',
    MULTIPLE_CHOICE: 'learningPath.type.multipleChoice',
    MAP_LABELING: 'learningPath.type.mapLabeling',
    SENTENCE_COMPLETION: 'learningPath.type.sentenceCompletion',
    MATCHING: 'learningPath.type.matching',
    TRUE_FALSE_NOT_GIVEN: 'learningPath.type.trueFalseNotGiven',
    MATCHING_HEADINGS: 'learningPath.type.matchingHeadings',
    SUMMARY_COMPLETION: 'learningPath.type.summaryCompletion',
    YES_NO_NOT_GIVEN: 'learningPath.type.yesNoNotGiven',
    PASSAGE_COMPLETION: 'learningPath.type.passageCompletion',
};

/** A drill node's label key, or null when the title has to come from the content. */
export function nodeTitleKey(node) {
    if (!node || node.kind !== NODE_KINDS.TYPE_DRILL) return null;
    return QUESTION_TYPE_KEYS[node.questionType] ?? null;
}

/**
 * Skill names, including the one skill the IELTS screens have no key for.
 *
 * `VOCABULARY` is not an IELTS skill (`IeltsTest.Skill` is LISTENING/READING/WRITING and
 * speaking lives in its own module), so it gets its own key here rather than being forced
 * through the IELTS map.
 */
const SKILL_KEYS = {
    LISTENING: 'ielts.skill.listening',
    READING: 'ielts.skill.reading',
    WRITING: 'ielts.skill.writing',
    SPEAKING: 'ielts.skill.speaking',
    VOCABULARY: 'learningPath.skill.vocabulary',
};

export function skillKeyFor(skill) {
    return SKILL_KEYS[skill] ?? 'learningPath.skill.other';
}

const WRITING_TASK_TYPE_KEYS = {
    TASK_1: 'learningPath.writingTask1',
    TASK_2: 'learningPath.writingTask2',
};

const SPEAKING_PART_KEYS = {
    PART_1: 'learningPath.speakingPart1',
    PART_2: 'learningPath.speakingPart2',
    PART_3: 'learningPath.speakingPart3',
};

/**
 * How to write a unit's name, from machine values.
 *
 * Returns `{ skillKey, typeKey }` and lets the caller join them with " — ", because the
 * separator is punctuation the translator may want to change. A unit whose focus has no
 * translatable name (an unknown future focus) returns `typeKey: null`, and the caller falls
 * back to the server's `title` — a real string from real content beats an invented label.
 */
export function unitTitleParts(unit) {
    if (!unit) return null;

    switch (unit.focusType) {
        case 'DIAGNOSTIC':
            return { skillKey: null, typeKey: 'learningPath.starterTitle' };
        case 'VOCAB_REVIEW':
            return { skillKey: null, typeKey: 'learningPath.vocabUnit' };
        case 'QUESTION_TYPE':
            return {
                skillKey: skillKeyFor(unit.skill),
                typeKey: QUESTION_TYPE_KEYS[unit.questionType] ?? null,
            };
        case 'WRITING_TASK_TYPE':
            return {
                skillKey: skillKeyFor(unit.skill),
                typeKey: WRITING_TASK_TYPE_KEYS[unit.writingTaskType] ?? null,
            };
        case 'SPEAKING_PART':
            return {
                skillKey: skillKeyFor(unit.skill),
                typeKey: SPEAKING_PART_KEYS[unit.speakingPart] ?? null,
            };
        default:
            return { skillKey: skillKeyFor(unit.skill), typeKey: null };
    }
}

/** A band is always one decimal: "6.0" is a band, "6" reads like a count. */
export function formatBand(value) {
    return typeof value === 'number' ? value.toFixed(1) : null;
}

/**
 * The line under a node's label, as a key plus values rather than a finished string.
 *
 * Two shapes exist and they mean different things: a drill reports `answered/target` (the
 * "câu 3/10" in the design) and a finished piece of work reports `done/total`. A node with
 * neither gets no line rather than a fabricated zero.
 */
export function progressFor(node) {
    const progress = node?.progress;
    if (!progress) return null;

    if (typeof progress.answered === 'number' && typeof progress.target === 'number') {
        return {
            key: 'learningPath.drillProgress',
            values: { answered: Math.min(progress.answered, progress.target), target: progress.target },
        };
    }
    if (typeof progress.done === 'number' && typeof progress.total === 'number') {
        return { key: 'learningPath.practiceProgress', values: { done: progress.done, total: progress.total } };
    }
    return null;
}

/** A locked node is not pressable. `MILESTONE` is pressable only when it is also current. */
export function isPressable(node) {
    if (!node) return false;
    return node.state !== NODE_STATES.LOCKED;
}

/**
 * Is a band number a MEASUREMENT, or the absence of one?
 *
 * The backend uses `0` and `null` interchangeably for "nothing measured yet" (the Evaluation
 * screen already treats a zero band as unmeasured). Showing "band 0.0" to a learner who has
 * not sat anything states a result that does not exist, so both are treated as unknown.
 */
export function isMeasuredBand(value) {
    return typeof value === 'number' && value > 0;
}

export function useLearningPath() {
    const loader = useCallback(() => learningPathApi.getPath().then(unwrapData), []);
    const { data, loading, error, reload } = useAsyncData(loader, 'learning-path');

    return { path: data ?? null, loading, error, reload };
}
