/** Page titles, one table, consumed by the shell header. */
export const PAGE_TITLES = {
    '/home': 'home.title',
    '/path': 'nav.path',
    '/dictionary': 'nav.dictionary',
    '/vocabulary/check': 'nav.vocabCheck',
    '/vocabulary': 'nav.vocabTest',
    /* `/review` had no entry, so the shell header fell back to `common.appName` and showed the
       product name as if it were the screen's title. Same key as its rail entry. */
    '/review': 'nav.review',
    /* The result step shares the heading with `/review` on purpose, because the mockup draws both
       screens with "Ôn tập từ vựng" and separates them with the SUBTITLE under it — "Chọn khoảng thời
       gian, nhóm từ và số từ" vs "Kết quả phiên ôn". It used to carry its own title ("Kết quả"); that
       made the header jump on a transition inside one flow, and the second line says it better. */
    '/review/result': 'nav.review',
    '/ielts': 'ielts.title',
    '/ielts/history': 'ielts.history',
    '/writing': 'nav.writing',
    '/speaking': 'nav.speaking',
    '/speaking/attempts': 'nav.speaking',
    '/custom-speaking': 'nav.customSpeaking',
    '/custom-speaking/history': 'customSpeaking.historyTitle',
    '/ai-chat': 'nav.aiChat',
    '/leaderboard': 'nav.leaderboard',
    '/rewards': 'nav.rewards',
    '/credits': 'nav.credits',
    '/notifications': 'nav.notifications',
    '/settings': 'nav.settings',
    '/profile': 'nav.account',
    '/weekly-report': 'nav.progress',
    /* `/challenges` had no entry either, so its header showed the product name while the page's own
       first line was the challenge progress. */
    '/challenges': 'challenges.title',
};

export const HOME_TITLE = { '/home': 'home.title' };

/**
 * The title for a pathname.
 *
 * One route is dynamic and still needs a real heading: `/custom-speaking/:conversationId` is the
 * result step (27e), and before this it fell back to `common.appName` — so the header read
 * "EN Practice" over a conversation result. Its other destinations have exact entries above, and
 * the chat lives outside the shell and draws its own heading.
 */
export function pageTitleKey(pathname) {
    const exact = PAGE_TITLES[pathname];
    if (exact) return exact;
    if (/^\/custom-speaking\/[^/]+$/.test(pathname)) return 'customSpeaking.resultTitle';
    return 'common.appName';
}
