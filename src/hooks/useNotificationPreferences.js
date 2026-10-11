import { useCallback, useEffect, useMemo, useState } from 'react';
import i18n from '../i18n';
import { notificationApi } from '../api/notificationApi';
import { NOTIFICATION_PREFERENCE_KEYS } from '../features/notification/constants/notificationTypes';

function pickComparablePreferences(preferences) {
    return NOTIFICATION_PREFERENCE_KEYS.reduce((accumulator, key) => {
        accumulator[key] = Boolean(preferences?.[key]);
        return accumulator;
    }, {});
}

export function useNotificationPreferences({ enabled = true } = {}) {
    const [preferences, setPreferences] = useState(null);
    const [draft, setDraft] = useState(null);
    const [loading, setLoading] = useState(enabled);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadPreferences = useCallback(async () => {
        if (!enabled) {
            setPreferences(null);
            setDraft(null);
            setLoading(false);
            return null;
        }

        setLoading(true);
        setError('');

        try {
            const response = await notificationApi.getPreferences();
            setPreferences(response);
            setDraft(response);
            return response;
        } catch (loadError) {
            setError(
                loadError?.message ||
                    i18n.t('notificationCenter.preferences.messages.loadError')
            );
            throw loadError;
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        loadPreferences().catch(() => {});
    }, [loadPreferences]);

    const updateDraftField = useCallback((key, value) => {
        setDraft((prev) => ({
            ...(prev || {}),
            [key]: value,
        }));
    }, []);

    const hasChanges = useMemo(() => {
        if (!preferences || !draft) return false;

        return (
            JSON.stringify(pickComparablePreferences(preferences)) !==
            JSON.stringify(pickComparablePreferences(draft))
        );
    }, [draft, preferences]);

    const savePreferences = useCallback(async () => {
        if (!draft) return null;

        setSaving(true);
        setError('');

        const payload = pickComparablePreferences(draft);

        try {
            const response = await notificationApi.updatePreferences(payload);
            const nextPreferences = response
                ? { ...draft, ...response }
                : {
                      ...draft,
                      updatedAt:
                          draft.updatedAt || new Date().toISOString(),
                  };
            setPreferences(nextPreferences);
            setDraft(nextPreferences);
            return nextPreferences;
        } catch (saveError) {
            setError(
                saveError?.message ||
                    i18n.t('notificationCenter.preferences.messages.saveError')
            );
            throw saveError;
        } finally {
            setSaving(false);
        }
    }, [draft]);

    return {
        preferences: draft,
        loading,
        saving,
        error,
        hasChanges,
        loadPreferences,
        updateDraftField,
        savePreferences,
    };
}

export default useNotificationPreferences;
