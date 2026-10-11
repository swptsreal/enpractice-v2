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

export const PRIMARY_NAV = [
    { id: 'home', to: '/home', labelKey: 'nav.home', icon: Home },
    { id: 'learn', to: '/vocabulary/check', labelKey: 'nav.learn', icon: BookOpen },
    { id: 'practice', to: '/ielts', labelKey: 'nav.practice', icon: Target },
    { id: 'progress', to: '/weekly-report', labelKey: 'nav.progress', icon: ChartLine },
    { id: 'account', to: '/profile', labelKey: 'nav.account', icon: UserRound },
];

export const SECONDARY_NAV = [
    { to: '/path', labelKey: 'nav.path', icon: Route },
    { to: '/dictionary', labelKey: 'nav.dictionary', icon: BookMarked },
    { to: '/vocabulary/check', labelKey: 'nav.vocabCheck', icon: Search },
    { to: '/vocabulary', labelKey: 'nav.vocabTest', icon: BookOpen },
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
