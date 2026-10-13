import { useCallback, useMemo, useState } from 'react';
import { recordsApi, reviewsApi } from '../../api';
import { unwrapData } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';
import { sanitizeWordFilter } from './reviewSession';

/**
 * Data for the review flow: how many words each group has, the words themselves, and the
 * stored-session calls that make the result step possible.
 *
 * These are the endpoints the flow was designed against, and they are the pre-existing ones —
 * `GET /records/review-counts`, `GET /records/review-words`, `POST /reviews`, `GET /reviews/last`.
 * Nothing here invents a parameter: the earlier draft of this screen read `dictionaryStats` off the
 * profile and handed off to the flashcard endpoint, which is why it could not offer a time window or
 * a word group at all.
 */

/** The three counts, for the group options. The endpoint takes no `group`: it answers all three. */
export function useReviewCounts(params) {
    const key = useMemo(
        () => ['review-counts', params.rangeMode, params.from, params.to, params.week, params.month].join('|'),
        [params.rangeMode, params.from, params.to, params.week, params.month]
    );

    const loader = useCallback(
        () =>
            recordsApi
                .getReviewCounts({
                    rangeMode: params.rangeMode,
                    from: params.from,
                    to: params.to,
                    week: params.week,
                    month: params.month,
                })
                .then(unwrapData),
        [params.rangeMode, params.from, params.to, params.week, params.month]
    );

    const { data, loading, error, reload } = useAsyncData(loader, key);

    return {
        counts: {
            unreviewed: Number(data?.unreviewed ?? 0),
            wrong: Number(data?.wrong ?? 0),
            all: Number(data?.all ?? 0),
        },
        /* `loading` covers EVERY fetch, including the refetch after a preset change; `loaded` is
           "have I ever got an answer". The couple matters: replacing the whole screen with a
           skeleton on a refetch makes the scrollport shorter than the current scroll offset, so the
           browser clamps it and the page jumps to the top the moment a preset is tapped. The screen
           therefore keeps the previous numbers on screen while the new ones arrive. */
        loaded: data !== null,
        loading,
        error,
        reload,
    };
}

/**
 * The words for one session, fetched once.
 *
 * `enabled` is false until the learner actually starts, because the config screen must not pull 300
 * word objects just to show three counts.
 */
export function useReviewWords(params, enabled) {
    const wordFilter = sanitizeWordFilter(params.words).join(',');
    const key = useMemo(
        () => ['review-words', enabled ? 'on' : 'off', params.rangeMode, params.from, params.to, params.week, params.month, params.group, params.limit, wordFilter].join('|'),
        [enabled, params.rangeMode, params.from, params.to, params.week, params.month, params.group, params.limit, wordFilter]
    );

    const loader = useCallback(() => {
        if (!enabled) return Promise.resolve([]);
        return recordsApi
            .getReviewWords({
                rangeMode: params.rangeMode,
                from: params.from,
                to: params.to,
                week: params.week,
                month: params.month,
                group: params.group,
                limit: params.limit,
                words: wordFilter || undefined,
            })
            .then(unwrapData);
    }, [enabled, params.rangeMode, params.from, params.to, params.week, params.month, params.group, params.limit, wordFilter]);

    const { data, loading, error, reload } = useAsyncData(loader, key);

    return { words: Array.isArray(data) ? data : [], loading, error, reload };
}

/**
 * The previous session, read BEFORE this one is stored.
 *
 * Order matters and it is not obvious: `GET /reviews/last` answers with the *second* latest row, so
 * called after the save it would return the session before the one just finished — which happens to
 * be the same row, but only by coincidence of how that query is written. Reading it first makes the
 * comparison mean "against the last session", whatever the endpoint does afterwards.
 */
export function usePreviousSession() {
    const loader = useCallback(() => reviewsApi.getLast().then(unwrapData), []);
    const { data, loading } = useAsyncData(loader, 'review-previous-session');
    return { previous: data ?? null, loading };
}

/** `POST /reviews`, with the failure surfaced rather than swallowed. */
export function useSaveReviewSession() {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const save = useCallback(async (payload) => {
        setSaving(true);
        setError(null);
        try {
            await reviewsApi.save(payload);
            return true;
        } catch (cause) {
            setError(cause);
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    return { save, saving, error };
}
