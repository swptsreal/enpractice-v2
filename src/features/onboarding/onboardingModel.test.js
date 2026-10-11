import { describe, expect, it } from 'vitest';
import {
    BAND_OPTIONS,
    MINUTE_OPTIONS,
    ONBOARDING_STATUS,
    ONBOARDING_STEPS,
    SKILL_OPTIONS,
    bandTitle,
    buildOnboardingPayload,
    progressFor,
    readOnboardingAnswers,
} from './onboardingModel';

/**
 * The wizard's data layer.
 *
 * The payload tests matter more than they look: the backend applies only the fields it
 * receives, so "the user skipped this question" and "the user cleared this question" are
 * different requests, and sending a null would silently wipe a goal the user set earlier.
 */
describe('onboarding steps', () => {
    it('is the four steps the design specifies, in order', () => {
        expect(ONBOARDING_STEPS).toEqual(['goal', 'skill', 'time', 'confirm']);
    });

    it('reports the mockup progress values, not step indices', () => {
        expect(progressFor('goal')).toBe(25);
        expect(progressFor('skill')).toBe(50);
        expect(progressFor('time')).toBe(75);
        expect(progressFor('confirm')).toBe(100);
        expect(progressFor('nope')).toBe(0);
    });

    it('offers exact half bands, because the backend stores ONE number', () => {
        /* A range like "6.0 – 6.5" would force the client to invent a midpoint. Each option
           here is a value the backend can store verbatim. */
        const bands = BAND_OPTIONS.map((option) => option.band);
        expect(bands).toEqual([5.0, 5.5, 6.0, 6.5, 7.0, 7.5, null]);
        expect(BAND_OPTIONS.every((option) => option.band == null || typeof option.band === 'number')).toBe(true);
    });

    it('labels a band with one decimal and leaves "not set" to i18n', () => {
        expect(bandTitle({ band: 5 })).toBe('5.0');
        expect(bandTitle({ band: 6.5 })).toBe('6.5');
        expect(bandTitle({ band: null })).toBeNull();
    });

    it('uses the backend skill enum values, not display labels', () => {
        const values = SKILL_OPTIONS.map((option) => option.value);
        expect(values).toEqual(['LISTENING', 'READING', 'WRITING', 'SPEAKING', null]);
    });

    it('lets the daily goal be skipped, so there is no "0 minutes" option', () => {
        expect(MINUTE_OPTIONS.map((option) => option.value)).toEqual([10, 20, 30, 45, 60]);
        expect(MINUTE_OPTIONS.every((option) => option.value > 0)).toBe(true);
    });
});

describe('readOnboardingAnswers', () => {
    it('reads the account back so reopening the wizard does not erase it', () => {
        expect(
            readOnboardingAnswers({
                goals: { targetIeltsBand: 6.5, preferredSkill: 'WRITING', dailyGoalMinutes: 45 },
            })
        ).toEqual({ band: 6.5, skill: 'WRITING', minutes: 45 });
    });

    it('reports a brand-new account as all-null rather than guessing', () => {
        expect(readOnboardingAnswers({ goals: { dailyGoalMinutes: 30 } })).toEqual({
            band: null,
            skill: null,
            minutes: 30,
        });
        expect(readOnboardingAnswers(null)).toEqual({ band: null, skill: null, minutes: null });
    });
});

describe('buildOnboardingPayload', () => {
    it('sends the status, the server version and every answered question', () => {
        const payload = buildOnboardingPayload(
            { status: ONBOARDING_STATUS.COMPLETED, band: 6.5, skill: 'SPEAKING', minutes: 30 },
            1
        );

        expect(payload).toEqual({
            status: 'COMPLETED',
            version: 1,
            targetIeltsBand: 6.5,
            preferredSkill: 'SPEAKING',
            dailyGoalMinutes: 30,
        });
    });

    it('OMITS a skipped question instead of sending null', () => {
        /* `PUT /user/profile/onboarding` applies only what it receives, so null would be a
           request to erase. Skipping must mean "leave it as it is". */
        const payload = buildOnboardingPayload(
            { status: ONBOARDING_STATUS.SKIPPED, band: null, skill: null, minutes: null },
            1
        );

        expect(payload).toEqual({ status: 'SKIPPED', version: 1 });
        expect('targetIeltsBand' in payload).toBe(false);
        expect('preferredSkill' in payload).toBe(false);
        expect('dailyGoalMinutes' in payload).toBe(false);
    });

    it('takes the version from the server rather than assuming 1', () => {
        expect(buildOnboardingPayload({ status: 'COMPLETED', band: null, skill: null, minutes: null }, 4)).toMatchObject(
            { version: 4 }
        );
    });

    it('ignores an empty string as a skill', () => {
        expect(buildOnboardingPayload({ status: 'COMPLETED', band: null, skill: '', minutes: null }, 1)).toEqual({
            status: 'COMPLETED',
            version: 1,
        });
    });
});
