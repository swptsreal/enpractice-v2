import {
    Home,
    BookOpen,
    Target,
    ChartLine,
    UserRound,
    Trophy,
    Gift,
    Coins,
    Bell,
    Settings,
    Sparkles,
    Mic,
    PenLine,
    MessagesSquare,
    Search,
    BookMarked,
    Route,
    Clock,
} from 'lucide-react';

/**
 * Navigation, in one place.
 *
 * v1 had THREE navigation affordances for one product: a 292px antd Menu
 * sidebar with submenus, a header, and a separate left Drawer on mobile — and
 * its nav data was nested, so 10 of 23 destinations sat behind two clicks.
 *
 * v2 has two:
 *   >=1024px  a 264px sidebar rail, every destination FLAT
 *   <1024px   a bottom tab bar with 5 thumb-reachable destinations
 * plus a segmented control inside a page when a module has sub-modes.
 *
 * The secondary group is not hidden either — it is a labelled section in the
 * same rail, one click away.
 */

/**
 * The five primary destinations, each a SECTION, and each href that section's LANDING page.
 *
 * `Học` pointed at `/vocabulary/check` — the dictionary lookup — which was wrong twice over. It made
 * the primary tab and the group's own "Tra từ & hỏi AI" item the SAME destination (the rail listed it
 * twice), and it hid the section's actual work: `/vocabulary` (the test list), `/vocabulary/test`,
 * `/vocabulary/result` and `/vocabulary/history` sat one level deeper than the tab that claims to
 * lead into them. The mockup's rail had the same artefact — `Học` → `07-vocabulary-check.html` while
 * every vocabulary frame marked it `aria-current="page"` — and it is fixed there first
 * (`_design/mockup/assets/shell.js` PRIMARY), because the design is the source of truth.
 *
 * THE LABEL IS THE SECTION. The section is the vocabulary module — where you TEST words
 * (`/vocabulary`) and where you REVIEW them (`/review`, now listed below) — so the tab reads
 * "Từ vựng" (`nav.learn`) and lands on the test list. "Học" named neither the section nor a
 * destination: it read as if the whole product were "học", which is exactly how a tab that opened a
 * dictionary lookup went unnoticed.
 *
 * `activePrimaryId` covers the whole module, so the tab stays highlighted on the lookup, the review
 * and the evaluation screens too. A section tab highlights for its section; only its landing changes.
 */
export const PRIMARY_NAV = [
    { id: 'home', to: '/home', labelKey: 'nav.home', icon: Home },
    { id: 'learn', to: '/vocabulary', labelKey: 'nav.learn', icon: BookOpen },
    { id: 'practice', to: '/ielts', labelKey: 'nav.practice', icon: Target },
    { id: 'progress', to: '/weekly-report', labelKey: 'nav.progress', icon: ChartLine },
    { id: 'account', to: '/profile', labelKey: 'nav.account', icon: UserRound },
];

export const SECONDARY_NAV = [
    { to: '/path', labelKey: 'nav.path', icon: Route },
    { to: '/dictionary', labelKey: 'nav.dictionary', icon: BookMarked },
    { to: '/vocabulary/check', labelKey: 'nav.vocabCheck', icon: Search },
    /* The "Từ vựng" section's OTHER destination, beside the test list the tab opens. A section tab
       can only open one screen, so the review needs its own entry or a designed screen has no way in
       — which is the state this was in. Same label as its page title (`nav.review`), so the rail and
       the header cannot disagree. */
    { to: '/review', labelKey: 'nav.review', icon: Clock },
    /* `/vocabulary` — "Test từ vựng" — is deliberately NOT listed here. It is the "Từ vựng" section's
       LANDING, and the primary tab already goes there, so listing it again put two rail entries on
       one screen (both highlighted at once). The label still names the screen: `pageTitles` maps
       `/vocabulary` to `nav.vocabTest` for its header. */
    { to: '/writing', labelKey: 'nav.writing', icon: PenLine },
    { to: '/speaking', labelKey: 'nav.speaking', icon: Mic },
    { to: '/custom-speaking', labelKey: 'nav.customSpeaking', icon: MessagesSquare },
    { to: '/ai-chat', labelKey: 'nav.aiChat', icon: Sparkles },
    { to: '/leaderboard', labelKey: 'nav.leaderboard', icon: Trophy },
    { to: '/rewards', labelKey: 'nav.rewards', icon: Gift },
    { to: '/credits', labelKey: 'nav.credits', icon: Coins },
    { to: '/notifications', labelKey: 'nav.notifications', icon: Bell },
    { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];

/**
 * Which primary destination owns a pathname. The rail and the tab bar must
 * agree, so this is computed once rather than per component.
 */
export function activePrimaryId(pathname) {
    if (pathname.startsWith('/ielts') || pathname.startsWith('/writing') || pathname.startsWith('/speaking') || pathname.startsWith('/custom-speaking')) {
        return 'practice';
    }
    if (pathname.startsWith('/vocabulary') || pathname.startsWith('/dictionary') || pathname.startsWith('/review') || pathname.startsWith('/evaluation') || pathname.startsWith('/path')) {
        return 'learn';
    }
    if (pathname.startsWith('/leaderboard') || pathname.startsWith('/rewards') || pathname.startsWith('/credits') || pathname.startsWith('/weekly-report') || pathname.startsWith('/challenges') || pathname.startsWith('/xp')) {
        return 'progress';
    }
    if (pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/notifications') || pathname.startsWith('/ai-chat')) {
        return 'account';
    }
    return 'home';
}
