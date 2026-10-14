import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRIMARY_NAV, SECONDARY_NAV, MOBILE_PRIMARY_NAV, MORE_NAV, activePrimaryId } from './navigation';
/* The REAL locale bundles, not the seed: the seed is the input and the bundle is what ships, and the
   failure this catches — a rail label that exists in one and not the other — is invisible otherwise. */
import en from '../i18n/locales/en';
import vi from '../i18n/locales/vi';

/**
 * The rail is the only map of the product a learner has, so three things about it must hold and are
 * cheap to break: every destination must exist, a section tab must land on that SECTION, and the
 * names in the rail must be the names in the locale.
 *
 * These tests are here because two of them were violated. The primary "Học" tab pointed at
 * `/vocabulary/check` — the dictionary lookup — so it was the SAME destination as the rail's own
 * "Tra từ & hỏi AI" item, and the vocabulary practice screens (`/vocabulary`, `/vocabulary/test`,
 * `/vocabulary/result`, `/vocabulary/history`) sat one level deeper than the tab that leads into
 * them. The mockup's rail carried the same artefact (`Học` → `07-vocabulary-check.html`, while every
 * vocabulary frame marked it `aria-current="page"`), and it was corrected there first.
 *
 * The label was wrong too: it named neither the section nor a destination, so the tab that opened a
 * dictionary lookup went unnoticed. It is now "Từ vựng" — the section, whose two destinations are the
 * test list (`/vocabulary`, the landing) and the review (`/review`).
 */
describe('navigation', () => {
    it('places AI Coach in primary navigation and moves Từ vựng to secondary navigation', () => {
        const aiChat = PRIMARY_NAV.find((item) => item.id === 'aiChat');
        expect(aiChat.to).toBe('/ai-chat');
        expect(aiChat.labelKey).toBe('nav.aiChat');

        const vocab = SECONDARY_NAV.find((item) => item.to === '/vocabulary');
        expect(vocab).toBeDefined();
        expect(vocab.labelKey).toBe('nav.learn');

        expect(PRIMARY_NAV.some((item) => item.to === '/vocabulary')).toBe(false);
        expect(SECONDARY_NAV.some((item) => item.to === '/ai-chat')).toBe(false);
    });

    it('names the tabs after their sections and gives each destination resolved labels', () => {
        expect(vi.nav.aiChat).toBe('AI Coach');
        expect(en.nav.aiChat).toBe('AI Coach');
        expect(vi.nav.learn).toBe('Từ vựng');
        expect(en.nav.learn).toBe('Vocabulary');

        const review = SECONDARY_NAV.find((item) => item.to === '/review');
        expect(review, '/review is not on the rail').toBeDefined();
        expect(review.labelKey).toBe('nav.review');
        expect(vi.nav.review).toBe('Ôn tập từ vựng');
        expect(en.nav.review).toBe('Vocabulary review');

        /* Every rail label must resolve, or the rail renders a raw key. */
        for (const key of [...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => item.labelKey)) {
            const [, leaf] = key.split('.');
            expect(vi.nav[leaf], `vi is missing ${key}`).toBeTruthy();
            expect(en.nav[leaf], `en is missing ${key}`).toBeTruthy();
        }
    });

    it('assigns activePrimaryId correctly for primary routes and returns null for secondary', () => {
        expect(activePrimaryId('/ai-chat')).toBe('aiChat');
        expect(activePrimaryId('/ai-chat/history')).toBe('aiChat');
        expect(activePrimaryId('/ielts')).toBe('practice');
        expect(activePrimaryId('/writing')).toBe('practice');
        expect(activePrimaryId('/speaking')).toBe('practice');
        expect(activePrimaryId('/custom-speaking')).toBe('practice');
        expect(activePrimaryId('/weekly-report')).toBe('progress');
        expect(activePrimaryId('/leaderboard')).toBe('progress');
        expect(activePrimaryId('/profile')).toBe('account');
        expect(activePrimaryId('/settings')).toBe('account');
        expect(activePrimaryId('/home')).toBe('home');
        expect(activePrimaryId('/')).toBe('home');

        // Secondary routes have no primary tab active
        expect(activePrimaryId('/vocabulary')).toBeNull();
        expect(activePrimaryId('/dictionary')).toBeNull();
        expect(activePrimaryId('/review')).toBeNull();
    });

    it('never points the rail at a screen that has no route', () => {
        /* Read the real route table rather than a copy of it: a list of paths in a test would drift
           from `App.jsx`, and the failure this guards against is exactly "the nav leads somewhere
           that does not exist" — the question a missing screen raises. */
        const appSource = readFileSync(resolve(process.cwd(), 'src/App.jsx'), 'utf8');
        const declared = new Set([...appSource.matchAll(/path="([^"]+)"/g)].map((match) => match[1]));

        expect(declared.size).toBeGreaterThan(20);

        const destinations = [...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => item.to);
        const missing = destinations.filter((to) => !declared.has(to));
        expect(missing, `rail destinations with no <Route path>: ${missing.join(', ')}`).toEqual([]);
    });

    it('gives every destination a distinct path, so no two labels lead to one screen', () => {
        const destinations = [...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => item.to);
        expect(new Set(destinations).size).toBe(destinations.length);
    });

    it('provides mobile navigation with "Thêm" replacing "Cá nhân" and housing remaining sidebar items', () => {
        expect(MOBILE_PRIMARY_NAV.map((i) => i.id)).toEqual([
            'home',
            'aiChat',
            'practice',
            'progress',
            'more',
        ]);
        expect(vi.nav.more).toBe('Thêm');
        expect(en.nav.more).toBe('More');

        expect(MORE_NAV.some((item) => item.to === '/profile')).toBe(true);
        for (const item of SECONDARY_NAV) {
            expect(MORE_NAV.some((m) => m.to === item.to)).toBe(true);
        }

        for (const key of MORE_NAV.map((item) => item.labelKey)) {
            const [, leaf] = key.split('.');
            expect(vi.nav[leaf], `vi is missing ${key}`).toBeTruthy();
            expect(en.nav[leaf], `en is missing ${key}`).toBeTruthy();
        }
    });
});
