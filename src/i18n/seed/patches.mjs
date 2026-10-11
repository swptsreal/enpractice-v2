/**
 * Locale gap patches.
 *
 * v1's two locale files are NOT parallel, and the gaps are real rather than
 * cosmetic. Two distinct problems, found by `scripts/i18n-audit.mjs` after the
 * ported logic layer started calling these keys.
 *
 * PROBLEM 1 — plural forms are skewed in OPPOSITE directions, and the English
 * side is a live bug.
 *
 * i18next only selects `key_one` / `key_other` when the call passes a `count`
 * option. v1's code calls these keys WITHOUT one:
 *
 *     t('dictionary.reviewCard.dueTitle', { count: n })   <- plural form selected
 *     t('profilePage.goalMessages.remaining', { minutes }) <- NO count: bare key
 *
 * and the locale files disagree about which shape to store:
 *
 *     vi.js:  dueTitle:   '{{count}} từ đến hạn hôm nay'      (bare)
 *     en.js:  dueTitle_one / dueTitle_other                    (plural)
 *
 * So in Vietnamese the plural calls miss, and in English the bare calls miss.
 * Every combination renders a raw key to a user. The fix is to make BOTH locales
 * carry BOTH shapes: the bare key for non-count calls, and `_one`/`_other` for
 * count calls. Vietnamese has no plural distinction, so its `_one` and `_other`
 * are identical strings — that is correct, not lazy.
 *
 * PROBLEM 2 — keys that exist in one language only:
 *   en is missing: writingPractice.detail.variantSentence, .estimatedMinutes,
 *                  loginPage.benefits.ai.*, loginPage.benefits.secure.*
 *   vi is missing: loginPage.benefits.secure.*
 *
 * This file states the gaps explicitly and the merge script applies them, so the
 * fact that v1's locales are out of sync is recorded rather than lost the next
 * time locales are re-merged from v1.
 *
 * Translations are written from the Vietnamese source (vi is the original and
 * the index language) and from the surrounding copy in v1's en.js.
 */

/** The seven plural strings whose bare key is missing from en.js. */
const EN_BARE_PLURALS = {
    'profilePage.units.daysLong': '{{count}} days',
    'profilePage.vocabulary.wordsCount': '{{count}} words',
    'profilePage.goalMessages.remaining': "Only {{count}} minutes to go before you hit today's goal!",
    'speaking.list.subtitle': '{{count}} speaking topics ready to practise',
    'writing.list.subtitle': '{{count}} writing tasks ready to practise',
    'dictionary.list.subtitle': '{{count}} saved words ready to review',
    'dictionary.reviewCard.dueTitle': '{{count}} words are due today',
};

/** The six plural strings whose `_one`/`_other` forms are missing from vi.js. */
const VI_PLURAL_FORMS = {
    'profilePage.units.daysLong': ['{{count}} ngày', '{{count}} ngày'],
    'profilePage.vocabulary.wordsCount': ['{{count}} từ', '{{count}} từ'],
    'profilePage.goalMessages.remaining': [
        'Chỉ còn {{count}} phút nữa là bạn chạm mục tiêu hôm nay rồi, cố lên nhé!',
        'Chỉ còn {{count}} phút nữa là bạn chạm mục tiêu hôm nay rồi, cố lên nhé!',
    ],
    'speaking.list.subtitle': ['{{count}} chủ đề luyện nói', '{{count}} chủ đề luyện nói'],
    'writing.list.subtitle': ['{{count}} đề Writing', '{{count}} đề Writing'],
    'dictionary.list.subtitle': ['{{count}} từ đã lưu', '{{count}} từ đã lưu'],
    'dictionary.reviewCard.dueTitle': ['{{count}} từ đến hạn hôm nay', '{{count}} từ đến hạn hôm nay'],
};

export const EN_ADDITIONS = {
    ...EN_BARE_PLURALS,

    /* writingPractice detail: vi has these three, en got only variantSummary. */
    'writingPractice.detail.difficulty': 'Difficulty',
    'writingPractice.detail.variantSentence': '{{count}} sentences',
    'writingPractice.detail.estimatedMinutes': 'About {{count}} minutes',

    /* loginPage.benefits: vi has `ai`, en has `secure` — neither has both. */
    'loginPage.benefits.ai.title': 'Feedback from AI grading',
    'loginPage.benefits.ai.description':
        'Writing and Speaking are marked against the four IELTS criteria, with the reason for every mark.',
    'loginPage.benefits.secure.title': 'Your progress is saved',
    'loginPage.benefits.secure.description':
        'Vocabulary, results and history stay on your account, across phone and laptop.',
};

export const VI_ADDITIONS = {
    /* writingPractice.detail.variantSummary: en has it, vi never got it. */
    'writingPractice.detail.variantSummary':
        '{{sentenceCount}} câu • khoảng {{estimatedMinutes}} phút',

    /* loginPage.benefits.secure.*: en has it, vi never got it. */
    'loginPage.benefits.secure.title': 'Tiến độ của bạn được lưu lại',
    'loginPage.benefits.secure.description':
        'Từ vựng, kết quả và lịch sử nằm trong tài khoản của bạn, dùng được trên cả điện thoại và máy tính.',
};

/**
 * Expand the plural maps into the flat patch shape the merge script consumes.
 * Kept as a function so `patches.mjs` stays a readable statement of the gaps
 * rather than a wall of generated keys.
 */
export function expandPluralPatches() {
    const en = { ...EN_ADDITIONS };
    const vi = { ...VI_ADDITIONS };

    for (const [base, [one, other]] of Object.entries(VI_PLURAL_FORMS)) {
        vi[`${base}_one`] = one;
        vi[`${base}_other`] = other;
    }

    /* `writingPractice.detail.variantSummary` exists in vi only; give en the
       same two interpolations so the string is not a raw key. */
    en['writingPractice.detail.variantSummary'] =
        '{{sentenceCount}} sentences • about {{estimatedMinutes}} minutes';

    return { en, vi };
}

