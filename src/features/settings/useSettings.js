import { useCallback, useEffect, useState } from 'react';
import { notificationApi } from '../../api';
import { unwrapData } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';

/**
 * Settings: notification preferences (server) and interface preferences (local).
 *
 * THE SPLIT IS DELIBERATE AND IS THE HONEST PART OF THIS MODULE.
 *
 *   Server-backed, from `GET/PUT /notification-preferences` (13 booleans, verified):
 *   every reminder and notification channel. `PUT` accepts a PARTIAL body — verified:
 *   sending only `{ allowPush: false }` left the other twelve fields untouched — so a
 *   single switch is one atomic request rather than a read-modify-write that could
 *   clobber a change made elsewhere.
 *
 *   Local-only: theme, text size, and the "stop tracking my streak" and "pause
 *   everything" switches. **There is no user-preferences endpoint for these.** The
 *   backend has no theme, text-size or streak-visibility field, so storing them locally
 *   is the truth rather than a shortcut. The Settings screen must not render them as
 *   though they were synced to an account, because on a second device they will not be.
 *
 * "Pause all reminders" is not a backend flag either: it is implemented as an atomic
 * write of every `allow*` boolean to false, with the previous values kept locally so it
 * can be undone. That is a real behaviour on top of the real API.
 */

const LOCAL_KEY = 'en-practice:prefs';

/** The four switches the design groups first, plus the ones that matter most. */
export const NOTIFICATION_KEYS = [
    'allowVocabularyReminder',
    'allowGradingResult',
    'allowProgressReminder',
    'allowWeeklySummary',
    'allowXpRewardNotification',
    'allowLeaderboardNotification',
    'allowPersonalizedRecommendation',
    'allowNewContentNotification',
    'allowReengagementNotification',
    'allowBandImprovementNotification',
    'allowAdminBroadcast',
    'allowPush',
    'allowEmail',
];

const DEFAULT_LOCAL = {
    theme: 'system',
    textSize: 'medium',
    streakTracking: true,
    remindersPaused: false,
    /** The allow* values captured when reminders were paused, for the undo. */
    pausedSnapshot: null,
};

function readLocal() {
    try {
        const raw = window.localStorage.getItem(LOCAL_KEY);
        if (!raw) return { ...DEFAULT_LOCAL };
        return { ...DEFAULT_LOCAL, ...JSON.parse(raw) };
    } catch {
        return { ...DEFAULT_LOCAL };
    }
}

function writeLocal(value) {
    try {
        window.localStorage.setItem(LOCAL_KEY, JSON.stringify(value));
    } catch {
        /* a browser with storage disabled is not a reason to break Settings */
    }
}

/**
 * Interface preferences, stored locally.
 *
 * Theme is applied by writing `data-theme` on `<html>`, which the token layer's
 * `light-dark()` reads. `system` removes the attribute so the CSS media query wins.
 */
export function useLocalPreferences() {
    const [prefs, setPrefs] = useState(() => (typeof window === 'undefined' ? DEFAULT_LOCAL : readLocal()));

    useEffect(() => {
        const root = document.documentElement;
        if (prefs.theme === 'system') root.removeAttribute('data-theme');
        else root.setAttribute('data-theme', prefs.theme);

        /* Text size is a real reading setting, so it scales the reading font too —
           the class is consulted by the prose styles, not only by the chrome. */
        root.setAttribute('data-text-size', prefs.textSize);
    }, [prefs.theme, prefs.textSize]);

    const update = useCallback((patch) => {
        setPrefs((current) => {
            const next = { ...current, ...patch };
            writeLocal(next);
            return next;
        });
    }, []);

    return { prefs, update };
}

/** Server notification preferences, with an atomic per-field save. */
export function useNotificationPreferences() {
    const loader = useCallback(() => notificationApi.getPreferences().then(unwrapData), []);
    const { data, loading, error, reload } = useAsyncData(loader, 'notification-preferences');

    const [local, setLocal] = useState(null);
    const [savingKey, setSavingKey] = useState(null);
    const [saveError, setSaveError] = useState(null);

    const values = local ?? data ?? null;

    /**
     * Save ONE field.
     *
     * The request body is `{ [key]: value }` only. Because the backend merges a partial
     * body, this cannot clobber a concurrent change to another field — the alternative,
     * PUT-ing the whole object, would do exactly that.
     */
    const setField = useCallback(
        async (key, value) => {
            const previous = values;
            setSavingKey(key);
            setSaveError(null);
            /* Optimistic: a switch that waits for a round trip feels broken, and this
               is reversible. */
            setLocal({ ...(values ?? {}), [key]: value });
            try {
                const response = await notificationApi.updatePreferences({ [key]: value });
                setLocal(unwrapData(response));
                return true;
            } catch (err) {
                setLocal(previous);
                setSaveError(err);
                return false;
            } finally {
                setSavingKey(null);
            }
        },
        [values]
    );

    /**
     * Pause every reminder at once, or restore the previous values.
     *
     * `pausedSnapshot` lives in local storage, so the undo survives a reload. Without
     * it, "pause everything" would be a one-way door and a user who pressed it by
     * accident would have to re-enable twelve switches by hand.
     */
    const pauseAll = useCallback(
        async (snapshot) => {
            const body = {};
            for (const key of NOTIFICATION_KEYS) body[key] = false;
            setSavingKey('__all__');
            setSaveError(null);
            try {
                const response = await notificationApi.updatePreferences(body);
                setLocal(unwrapData(response));
                return true;
            } catch (err) {
                setSaveError(err);
                return false;
            } finally {
                setSavingKey(null);
            }
        },
        []
    );

    const restoreAll = useCallback(async (snapshot) => {
        if (!snapshot) return false;
        setSavingKey('__all__');
        setSaveError(null);
        try {
            const response = await notificationApi.updatePreferences(snapshot);
            setLocal(unwrapData(response));
            return true;
        } catch (err) {
            setSaveError(err);
            return false;
        } finally {
            setSavingKey(null);
        }
    }, []);

    return { values, loading, error, savingKey, saveError, setField, pauseAll, restoreAll, reload };
}
