import { useCallback, useEffect, useState } from 'react';
import { inventoryApi } from '../api/inventoryApi';
import { getUserDecorations, getUserIdentity } from '../utils/profile';

export default function useUserDecorations(user, enabled = true) {
    const [decorations, setDecorations] = useState(getUserDecorations());

    const userId = getUserIdentity(user);

    const fetchDecorations = useCallback(async () => {
        if (!enabled || !userId) {
            setDecorations(getUserDecorations());
            return getUserDecorations();
        }

        try {
            const data = await inventoryApi.getEquippedItems(userId);
            const nextDecorations = getUserDecorations(data);
            setDecorations(nextDecorations);
            return nextDecorations;
        } catch (error) {
            console.warn('Failed to fetch equipped user items:', error);
            const emptyDecorations = getUserDecorations();
            setDecorations(emptyDecorations);
            return emptyDecorations;
        }
    }, [enabled, userId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDecorations().catch(() => {});
    }, [fetchDecorations]);

    return decorations;
}
