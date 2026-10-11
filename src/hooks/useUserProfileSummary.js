import { useCallback, useState } from 'react';
import { profileApi } from '../api/profileApi';

export default function useUserProfileSummary() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetched, setFetched] = useState(false);

    const loadSummary = useCallback(
        async ({ force = false } = {}) => {
            if (loading) {
                return summary;
            }

            if (fetched && !force) {
                return summary;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await profileApi.getSummary();
                setSummary(data);
                setFetched(true);
                return data;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [fetched, loading, summary]
    );

    const resetSummary = useCallback(() => {
        setSummary(null);
        setError(null);
        setLoading(false);
        setFetched(false);
    }, []);

    return {
        summary,
        loading,
        error,
        fetched,
        setSummary,
        loadSummary,
        refreshSummary: () => loadSummary({ force: true }),
        resetSummary,
    };
}
