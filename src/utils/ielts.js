import { BookOpen, Headphones } from 'lucide-react';

export function getBandScoreColor(score) {
    if (typeof score !== 'number') return '#4f46e5';
    if (score >= 8.5) return '#16a34a';
    if (score >= 7) return '#0891b2';
    if (score >= 5.5) return '#d97706';
    return '#dc2626';
}

export const difficultyConfig = {
    EASY: { color: 'green', label: 'Easy' },
    MEDIUM: { color: 'orange', label: 'Medium' },
    HARD: { color: 'red', label: 'Hard' },
};

export const skillConfig = {
    READING: {
        icon: BookOpen,
        color: '#8b5cf6',
        bg: 'bg-purple-50',
        tagColor: 'purple',
        label: 'Reading',
    },
    LISTENING: {
        icon: Headphones,
        color: '#3b82f6',
        bg: 'bg-blue-50',
        tagColor: 'blue',
        label: 'Listening',
    },
};

/* ----------------------------------------------------- library filters */

/**
 * The skills the test library can be filtered by, in the backend's own spelling,
 * and a normaliser for the value that arrives from the URL query string.
 *
 * VERIFIED against the running backend (not guessed from the enum name):
 *
 *   GET /ielts/tests?skill=LISTENING&page=0&size=100
 *        -> 200, totalElements 7, every returned item skill=LISTENING
 *   GET /ielts/tests?skill=READING&page=0&size=100
 *        -> 200, totalElements 8, every returned item skill=READING
 *   GET /ielts/tests?skill=listening
 *        -> 400 { code: VALIDATION_ERROR, message:
 *             "No enum constant com.swpts.enpracticebe.entity.IeltsTest.Skill.listening" }
 *   GET /ielts/tests?skill=SPEAKING
 *        -> 400, same shape — the Skill enum has NO SPEAKING member
 *   GET /ielts/tests?skill=WRITING&page=0&size=5
 *        -> 200, totalElements 0 — a valid member, but the library holds no
 *           Writing tests (and Writing, like Speaking, has its own module route)
 *
 * Two consequences the list screen depends on:
 *
 *  - The value is CASE-SENSITIVE UPPERCASE. Sending the lowercase i18n key
 *    through would answer 400 and turn a filter click into an error panel, so
 *    the normaliser accepts either case and rejects anything the enum cannot
 *    parse instead of forwarding it.
 *  - The list is Listening + Reading only. SPEAKING would be a 400 and WRITING
 *    would always be empty, so neither is offered as a filter here; both are
 *    separate modules reached from their own routes.
 */
export const IELTS_SKILL_FILTERS = ['LISTENING', 'READING'];

/** `?skill=reading` -> `READING`; unknown or absent -> null ("no filter"). */
export function normalizeSkillFilter(value) {
    const skill = String(value ?? '')
        .trim()
        .toUpperCase();
    return IELTS_SKILL_FILTERS.includes(skill) ? skill : null;
}

export const IELTS_ATTEMPT_MODES = {
    FULL: 'FULL',
    QUICK: 'QUICK',
};

export const IELTS_SCOPE_TYPES = {
    TEST: 'TEST',
    SECTION: 'SECTION',
    PASSAGE: 'PASSAGE',
};

export function isQuickAttempt(attemptMode) {
    return String(attemptMode || '').toUpperCase() === IELTS_ATTEMPT_MODES.QUICK;
}

export function getIeltsAccuracy(attempt = {}) {
    if (typeof attempt.accuracyPercent === 'number') {
        return attempt.accuracyPercent;
    }

    if (
        typeof attempt.correctCount === 'number' &&
        typeof attempt.totalQuestions === 'number' &&
        attempt.totalQuestions > 0
    ) {
        return (attempt.correctCount / attempt.totalQuestions) * 100;
    }

    return 0;
}

export function getIeltsAttemptModeLabel(attemptMode, t) {
    return isQuickAttempt(attemptMode)
        ? t('ielts.common.quickTest')
        : t('ielts.common.fullTest');
}

export function getIeltsScopeLabel(scopeType, t) {
    switch (String(scopeType || '').toUpperCase()) {
        case IELTS_SCOPE_TYPES.SECTION:
            return t('ielts.common.section');
        case IELTS_SCOPE_TYPES.PASSAGE:
            return t('ielts.common.passage');
        case IELTS_SCOPE_TYPES.TEST:
        default:
            return t('ielts.common.test');
    }
}

export function getIeltsScopeDisplayTitle(scopeType, scopeTitle, t) {
    if (scopeTitle) {
        return scopeTitle;
    }

    return getIeltsScopeLabel(scopeType, t);
}

export function getIeltsAttemptDisplayLabel(attempt = {}, t) {
    const modeLabel = getIeltsAttemptModeLabel(attempt.attemptMode, t);
    if (!isQuickAttempt(attempt.attemptMode)) {
        return modeLabel;
    }

    const scopeLabel = getIeltsScopeDisplayTitle(
        attempt.scopeType,
        attempt.scopeTitle,
        t
    );

    return `${modeLabel} - ${scopeLabel}`;
}

export function getIeltsPrimaryResultText(attempt = {}, t) {
    if (isQuickAttempt(attempt.attemptMode)) {
        return t('ielts.common.accuracyValue', {
            value: getIeltsAccuracy(attempt).toFixed(1),
        });
    }

    if (typeof attempt.bandScore === 'number') {
        return t('ielts.common.bandValue', {
            value: attempt.bandScore.toFixed(1),
        });
    }

    return '—';
}

export function parseIeltsLaunchIntent(search = '') {
    const params = new URLSearchParams(search);
    const testId = params.get('testId') || null;
    const attemptMode = params.get('attemptMode') || null;
    const scopeType = params.get('scopeType') || null;
    const scopeId = params.get('scopeId') || null;

    return {
        mode: params.get('mode') || null,
        skill: params.get('skill') || null,
        testId,
        attemptMode,
        scopeType,
        scopeId,
        sourceRecommendationKey:
            params.get('sourceRecommendationKey') || null,
        sourceSurface: params.get('sourceSurface') || null,
        shouldDirectStart: Boolean(
            testId && attemptMode && scopeType && scopeId
        ),
        hasTestIdOnly: Boolean(testId) && !(attemptMode && scopeType && scopeId),
    };
}

export function buildIeltsSessionPayload({
    testId,
    attemptMode,
    scopeType,
    scopeId,
    sourceRecommendationKey,
    sourceSurface,
}) {
    return {
        testId,
        attemptMode,
        scopeType,
        scopeId,
        ...(sourceRecommendationKey
            ? { sourceRecommendationKey }
            : {}),
        ...(sourceSurface ? { sourceSurface } : {}),
    };
}

export function getScopedTestDetail(session = {}) {
    const testDetail = session?.testDetail;
    if (!testDetail?.sections?.length) {
        return testDetail || null;
    }

    const scopeType = String(session.scopeType || '').toUpperCase();
    const scopeId = session.scopeId;

    if (!scopeId || scopeType === IELTS_SCOPE_TYPES.TEST) {
        return testDetail;
    }

    if (scopeType === IELTS_SCOPE_TYPES.SECTION) {
        const section = testDetail.sections.find((item) => item.id === scopeId);
        return section
            ? { ...testDetail, sections: [section] }
            : testDetail;
    }

    if (scopeType === IELTS_SCOPE_TYPES.PASSAGE) {
        for (const section of testDetail.sections) {
            const passage = section.passages?.find((item) => item.id === scopeId);
            if (passage) {
                const contextualPassages =
                    section.passages?.filter(
                        (item) =>
                            item.id === scopeId ||
                            item.sharedContentOnly ||
                            !item.questions?.length
                    ) || [];

                return {
                    ...testDetail,
                    sections: [
                        {
                            ...section,
                            passages: contextualPassages.length
                                ? contextualPassages
                                : [passage],
                        },
                    ],
                };
            }
        }
    }

    return testDetail;
}

/* ---------------------------------------------------- exam content text */

/**
 * Exam content (`passage.content`, `question.questionText`) is MARKDOWN carrying
 * one non-markdown habit: literal `<br>` tags.
 *
 * Measured over the WHOLE seeded library before writing this — all 15 tests,
 * 663 passages and questions, read from `GET /ielts/tests/{id}` on the running
 * backend — so the translation below is shaped by the data, not by taste:
 *
 *   `**bold**`              29 passages   (real markdown)
 *   `![alt](url)`           21 passages   (real markdown images)
 *   `| a | b |` + `|---|`    2 passages   (real GFM tables)
 *   `## heading`             1 passage
 *   `- item`                 9 passages
 *   `<br>`                  13 passages   <- the ONLY html tag present
 *
 * The content therefore goes to the Markdown renderer, and `<br>` is translated
 * rather than the renderer being handed raw HTML: react-markdown leaves raw HTML
 * inert on purpose, and turning `rehype-raw` on to draw one tag would also make
 * every `<script>` or `<img onerror>` in content-sourced text live DOM.
 *
 * The translation is PER LINE, because the two contexts need different markdown:
 *
 *  - Normal flow: the `<br>` becomes a CommonMark hard break — two trailing
 *    spaces on that line, so the line's own newline does the work and renders as
 *    a real `<br>`. A hard break inside a TABLE ROW would split the row into two
 *    rows (verified in a render), so it must not be used there.
 *  - Table row: the `<br>` becomes the character reference `&#10;`, which stays
 *    inside the cell and renders as a newline inside the cell's text. The take
 *    screen gives table cells `whitespace-pre-line`, so those newlines read as
 *    line breaks; without that rule they degrade to a space rather than to a
 *    broken table.
 *
 * Everything else is left exactly as it arrived: paragraph breaks, the source's
 * hard-wrapped lines (Markdown reflows those into a paragraph, which is what the
 * PDF-style extraction intended) and unpaired `**` markers, which Markdown
 * correctly leaves literal instead of bolding the rest of the passage.
 */
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const BR_TAG = /[ \t]*<br\s*\/?>/gi;

export function normalizeExamMarkdown(text) {
    if (text === null || text === undefined) return text;

    return String(text)
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => {
            if (TABLE_ROW.test(line)) return line.replace(BR_TAG, '&#10;');

            /* Nothing follows the tag on this line, so the break the tag stood
               for is the line break that is already about to happen. */
            return line.replace(BR_TAG, (tag, offset) =>
                line.slice(offset + tag.length).trim() === '' ? '  ' : '  \n'
            );
        })
        .join('\n');
}
