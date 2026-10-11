import test from 'node:test';
import assert from 'node:assert/strict';
import { GUEST_TRIAL_STATUSES } from '../guestAiTrialConstants.js';
import {
    getGuestAiActionState,
    getGuestErrorTranslationKey,
} from '../guestAiTrialUi.js';

test('authenticated actions ignore guest trial status', () => {
    assert.deepEqual(
        getGuestAiActionState({
            isAuthenticated: true,
            guestTrialStatus: GUEST_TRIAL_STATUSES.DISABLED,
        }),
        { visible: true, disabled: false }
    );
});

test('disabled guest trial hides floating entries and disables inline explain', () => {
    assert.deepEqual(
        getGuestAiActionState({
            isAuthenticated: false,
            guestTrialStatus: GUEST_TRIAL_STATUSES.DISABLED,
            surface: 'floating',
        }),
        { visible: false, disabled: true }
    );
    assert.deepEqual(
        getGuestAiActionState({
            isAuthenticated: false,
            guestTrialStatus: GUEST_TRIAL_STATUSES.DISABLED,
            surface: 'inline',
        }),
        { visible: true, disabled: true }
    );
});

test('maps quota and availability errors to stable translation keys', () => {
    assert.equal(
        getGuestErrorTranslationKey('GUEST_DAILY_LIMIT_REACHED'),
        'guestAiTrial.errors.guestDailyLimit'
    );
    assert.equal(
        getGuestErrorTranslationKey('IP_DAILY_LIMIT_REACHED'),
        'guestAiTrial.errors.ipDailyLimit'
    );
});

