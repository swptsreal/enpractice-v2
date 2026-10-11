import { useCallback, useEffect, useState } from 'react';
import { profileApi } from '../api/profileApi';
import { inventoryApi } from '../api/inventoryApi';
import { getUserDecorations, getUserIdentity } from '../utils/profile';

export default function useUserProfileDetail(enabled = true) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async () => {
        if (!enabled) {
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await profileApi.getProfile();
            const userId = getUserIdentity(data);
            let equippedItems = getUserDecorations();

            if (userId) {
                try {
                    const equippedData = await inventoryApi.getEquippedItems(
                        userId
                    );
                    equippedItems = getUserDecorations(equippedData);
                } catch (equippedError) {
                    console.warn(
                        'Failed to fetch equipped profile items:',
                        equippedError
                    );
                }
            }

            const nextProfile = { ...data, equippedItems };
            setProfile(nextProfile);
            return nextProfile;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        fetchProfile().catch(() => {});
    }, [enabled, fetchProfile]);

    return {
        profile,
        loading,
        error,
        setProfile,
        refetchProfile: fetchProfile,
    };
}
