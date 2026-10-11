import { describe, expect, it, vi } from 'vitest';

/**
 * The ported v1 logic layer must evaluate.
 *
 * `_design/PROPOSAL.md` §5.1 marks src/api, src/hooks, src/contexts and
 * src/utils as keep-as-is, so the risk in porting them is not logic — it is a
 * missing transitive import or an env var that only existed in the v1 build. A
 * module that fails to evaluate throws at import time, so importing the barrels
 * is a real check rather than a smoke test.
 *
 * If this file starts failing after a v1 change, re-copy the directory rather
 * than patching the copy: divergence between the two is the thing that would
 * make the port expensive later.
 */

/**
 * Every other test runs against a stubbed api (src/test/apiMock.js) so it never
 * touches the network. This file is the exception: its whole purpose is to assert
 * the REAL barrel's export surface, so the stub must be lifted.
 */
vi.unmock('./api');

describe('ported v1 logic layer', () => {
    it('evaluates the api barrel', async () => {
        await expect(import('./api')).resolves.toBeTruthy();
    });

    it('re-exports the api modules the v2 screens depend on first', async () => {
        const api = await import('./api');

        /* Asserted by name so a failure says WHICH module went missing rather
           than "the barrel is broken". These are the domains the three anchor
           screens and the Phase 3 modules need first. */
        const required = [
            'authApi',
            'ieltsApi',
            'vocabularyTestApi',
            'dictionaryApi',
            'dashboardApi',
            'writingApi',
            'speakingApi',
            'leaderboardApi',
            'rewardMissionApi',
            'notificationApi',
            'creditApi',
            'weeklyReportApi',
            'aiChatApi',
            'profileApi',
            'recordsApi',
            'mascotApi',
            'checkInApi',
            'challengeApi',
            'recommendationApi',
            'achievementApi',
            'inventoryApi',
            'xpMilestoneApi',
        ];

        const missing = required.filter((name) => api[name] === undefined);
        expect(missing, `api barrel is missing: ${missing.join(', ')}`).toEqual([]);

        for (const name of required) {
            expect(api[name], `${name} should expose at least one method`).toBeTypeOf('object');
            expect(Object.keys(api[name]).length, `${name} has no methods`).toBeGreaterThan(0);
        }
    });

    it('exposes the token helpers the auth flow depends on', async () => {
        const api = await import('./api');
        expect(typeof api.hasToken).toBe('function');
    });

    it('evaluates the utils barrel and the date/ielts helpers', async () => {
        const date = await import('./utils/date');
        const ielts = await import('./utils/ielts');
        expect(Object.keys(date).length).toBeGreaterThan(0);
        expect(Object.keys(ielts).length).toBeGreaterThan(0);
    });
});
