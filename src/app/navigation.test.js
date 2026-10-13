import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRIMARY_NAV, SECONDARY_NAV, activePrimaryId } from './navigation';
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
    it('lands the "Từ vựng" tab on the vocabulary practice list, not on the lookup screen', () => {
        const learn = PRIMARY_NAV.find((item) => item.id === 'learn');
        expect(learn.to).toBe('/vocabulary');

        /* The lookup screen keeps its own, separately named destination — the rail must not list one
           screen under two labels, which is what made the tab look like it led into the section. */
        const lookup = SECONDARY_NAV.find((item) => item.labelKey === 'nav.vocabCheck');
        expect(lookup.to).toBe('/vocabulary/check');
        expect(lookup.to).not.toBe(learn.to);

        /* And the practice list itself is NOT repeated in the secondary group either: it is the
           section LANDING, reachable from the tab, so a second entry would put two rail items on one
           screen and highlight both. The label still names the screen for its header — `pageTitles`
           maps `/vocabulary` to `nav.vocabTest`. */
        expect(SECONDARY_NAV.some((item) => item.to === '/vocabulary')).toBe(false);
    });

    it('names the tab after its SECTION, and gives the section both of its destinations', () => {
        /* A label that names neither the section nor a destination is how the wrong landing survived:
           "Học" was unverifiable by reading it. */
        expect(vi.nav.learn).toBe('Từ vựng');
        expect(en.nav.learn).toBe('Vocabulary');

        /* `/review` is the section's second destination — the review you do after the test — so it is
           on the rail, and under the same name its page title uses. Without it a designed screen had
           no way in. */
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

    it('keeps the whole vocabulary module inside the "Từ vựng" section', () => {
        /* The landing changed; the SECTION did not. If this regressed, the rail would lose its
           highlight as soon as a learner opened the test list the tab just sent them to. */
        for (const pathname of [
            '/vocabulary',
            '/vocabulary/check',
            '/vocabulary/test',
            '/vocabulary/result/abc',
            '/vocabulary/history',
            '/dictionary',
            '/dictionary/review',
            '/review',
            '/evaluation',
            '/path',
        ]) {
            expect(activePrimaryId(pathname), pathname).toBe('learn');
        }
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
});
