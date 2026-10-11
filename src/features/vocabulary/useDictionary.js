import { useCallback, useEffect, useMemo, useState } from 'react';
import { dictionaryApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';

/* A data hook has to start its request in an effect, and the loading flag has to be
   set before it starts — the rule is right about component code and wrong about
   this primitive. Scoped to this file so every other file stays guarded. */
/* eslint-disable react-hooks/set-state-in-effect */

/**
 * The vocabulary notebook: browse, filter, edit, favourite, and review words.
 *
 * Contract read from the backend controller and CONFIRMED against the running
 * backend (2026-10-11):
 *
 *   GET    /dictionary           params keyword, wordType, isFavorite,
 *                                proficiencyLevel, tag, page, size, sortBy, sortDir
 *          -> Spring Page<DictionaryWordResponse>  (`content`, `number`)
 *   GET    /dictionary/stats     -> { totalWords, favoriteWords, wordsToReviewToday,
 *                                     newWords, learningWords, masteredWords }
 *   GET    /dictionary/due-review params words, mode, page, size
 *          -> Spring Page<DictionaryWordResponse>, sorted by nextReviewAt ascending
 *   POST   /dictionary           -> a word
 *   PUT    /dictionary/{id}
 *   DELETE /dictionary/{id}
 *   PATCH  /dictionary/{id}/favorite
 *   PATCH  /dictionary/{id}/review  BODY { performanceScore }   <- 0..5, @Valid
 *
 * Two details that are easy to get wrong:
 *
 *  1. This module returns Spring's native `Page`, so the item array is `content`
 *     and the page number is `number` — not `items`/`page` like /vocabulary-tests.
 *     `readPage` handles both; reading only one shape reports page 0 forever.
 *  2. `/dictionary/{id}/review` takes its score in the REQUEST BODY. Sending it as
 *     a query parameter fails with HTTP 500 "Required request body is missing",
 *     which reads like a server fault rather than a caller mistake.
 *
 * `proficiencyLevel` is 0-5 and is the memory tier, so it drives both the mastery
 * ring and the "hay quên" (forgetful) sort.
 */

/** Memory tiers, as the design defines them: 0 new, 1-3 learning, 4-5 mastered. */
export const MEMORY_FILTERS = [
    { id: 'all', labelKey: 'dictionary.filterAll' },
    { id: 'forgetful', labelKey: 'dictionary.filterForgetful' },
    { id: 'new', labelKey: 'dictionary.filterNew', level: 0 },
    { id: 'learning', labelKey: 'dictionary.filterLearning', level: 1 },
    { id: 'mastered', labelKey: 'dictionary.filterMastered', level: 4 },
];

/**
 * The four recall buttons, mapped onto the backend's real 0-5 scale.
 *
 * Verified live: performanceScore 0 and 2 keep the level at 0 with a near-immediate
 * next review, while 4 moves it to 1 and 5 to 2 with progressively later dates.
 * The scale is validated server-side (`@Min(0) @Max(5)`; posting 9 returns 400).
 *
 * The design specifies showing each button's resulting interval. The backend does
 * NOT return the interval schedule, and it depends on the word's current level as
 * well as the score, so per-button day counts would be invented. The buttons
 * therefore name the recall quality and the schedule direction instead, and the
 * real next-review date is shown after the fact on the result.
 */
export const RECALL_OPTIONS = [
    { score: 0, id: 'forgot', labelKey: 'dictionary.recallForgot', hintKey: 'dictionary.recallForgotHint', tone: 'wrong' },
    { score: 2, id: 'hard', labelKey: 'dictionary.recallHard', hintKey: 'dictionary.recallHardHint', tone: 'amber' },
    { score: 4, id: 'good', labelKey: 'dictionary.recallGood', hintKey: 'dictionary.recallGoodHint', tone: 'teal' },
    { score: 5, id: 'easy', labelKey: 'dictionary.recallEasy', hintKey: 'dictionary.recallEasyHint', tone: 'correct' },
];

/* ------------------------------------------------------------------- stats */

export function useDictionaryStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await dictionaryApi.getStats();
            setStats(unwrapData(response));
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return { stats, loading, error, reload: load };
}

/* -------------------------------------------------------------------- list */

/**
 * The word list.
 *
 * `query` is passed straight through as the request params, so the screen owns the
 * filter state and this hook owns the fetching. Requests are sequenced with a
 * counter so a slow response for "mit" cannot overwrite the results for "mitigate"
 * after the user keeps typing — the same class of race that made the vocabulary
 * list stick on a spinner.
 *
 * ── WHY THE DEFAULT SORT IS `created_at`, NOT `updated_at` ────────────────────
 *
 * Verified against the running backend (2026-10-11), five words added in order:
 *
 *     GET ?sortBy=updated_at&sortDir=asc   -> alpha, bravo, charlie, delta, echo
 *     PATCH /dictionary/{charlie}/favorite
 *     GET ?sortBy=updated_at&sortDir=asc   -> alpha, bravo, delta, echo, charlie
 *
 * The PATCH bumps `updatedAt` (13:29:54 → 13:30:02 in the rows), so sorting by it
 * moves the row the user just touched to the far end of the list — the reported
 * "từ bị đẩy xuống cuối danh sách". The same sort puts a NEWLY ADDED word last as
 * well, because a new word is the newest `updatedAt` there is:
 *
 *     POST /dictionary {word: foxtrot}
 *     GET ?sortBy=updated_at&sortDir=asc   -> …, charlie, foxtrot   (new word LAST)
 *     GET ?sortBy=created_at&sortDir=desc  -> foxtrot, …            (new word FIRST)
 *
 * `created_at` is written once and never changes, so the notebook has a stable
 * order that a favourite toggle cannot disturb (the same PATCH leaves the
 * `created_at` ordering byte-identical), and `desc` puts the thing the user just
 * added where they are looking. The backend's own default is exactly this:
 * `GET /dictionary` with no sort params answers `created_at desc`.
 */
export function useDictionaryWords(query = {}) {
    const params = useMemo(
        () => ({
            page: query.page ?? 0,
            size: query.size ?? 20,
            sortBy: query.sortBy ?? 'created_at',
            /* `desc` = newest first. `sortDir` is only overridden by the
               "hay quên" view, which sorts by the review schedule instead. */
            sortDir: query.sortDir ?? 'desc',
            ...(query.keyword ? { keyword: query.keyword } : {}),
            ...(query.tag ? { tag: query.tag } : {}),
            ...(query.isFavorite ? { isFavorite: true } : {}),
            ...(query.proficiencyLevel !== undefined ? { proficiencyLevel: query.proficiencyLevel } : {}),
        }),
        [
            query.page,
            query.size,
            query.sortBy,
            query.sortDir,
            query.keyword,
            query.tag,
            query.isFavorite,
            query.proficiencyLevel,
        ]
    );

    /* The serialised params are the request identity, so a filter change refetches
       and an unrelated re-render does not. */
    const key = JSON.stringify(params);

    /* `params` is memoised and `key` is its serialisation, so depending on `key`
       alone is precisely equivalent to depending on `params` — and it keeps the
       loader stable when an unrelated field of `query` changes identity. */
    const loader = useCallback(
        () => dictionaryApi.searchWords(params).then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );

    const { data, loading, error, reload: refetch } = useAsyncData(loader, key);

    const serverItems = useMemo(() => data?.items ?? [], [data]);

    /**
     * Local edits, so a mutation does not have to re-ask the server for the page.
     *
     * A refetch after a mutation is what produced the second half of the reported
     * bug: `AsyncBoundary` shows the skeleton while `loading` is true, so the whole
     * list flashed and came back in the server's order with the edited row moved.
     * Editing the array that is already on screen keeps every row exactly where the
     * user was reading it.
     *
     * The edit is tagged with the request `key` it was made against, so a filter
     * change (a new key) discards it automatically and the server's fresh answer is
     * what renders. No effect is needed for that — the tag is compared during
     * render, which is why this cannot arrive one frame late.
     */
    const [localEdit, setLocalEdit] = useState(null);

    const items = localEdit && localEdit.key === key ? localEdit.items : serverItems;

    /* An explicit reload is the user asking the SERVER again, so local edits go. */
    const reload = useCallback(() => {
        setLocalEdit(null);
        refetch();
    }, [refetch]);

    /** Apply a change to the visible array, without touching the server. */
    const editInPlace = useCallback(
        (change) => {
            setLocalEdit((prev) => {
                const base = prev && prev.key === key ? prev.items : serverItems;
                return { key, items: change(base) };
            });
        },
        [key, serverItems]
    );

    /** Patch one row's fields, in place. Order is preserved by construction. */
    const patchItem = useCallback(
        (id, changes) => {
            editInPlace((list) => list.map((w) => (w.id === id ? { ...w, ...changes } : w)));
        },
        [editInPlace]
    );

    /** Drop one row, in place. */
    const dropItem = useCallback(
        (id) => {
            editInPlace((list) => list.filter((w) => w.id !== id));
        },
        [editInPlace]
    );

    /** Put a just-created word at the TOP: that is where the user is looking. */
    const prependItem = useCallback(
        (word) => {
            if (!word?.id) return;
            editInPlace((list) => [word, ...list.filter((w) => w.id !== word.id)]);
        },
        [editInPlace]
    );

    return {
        items,
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 0,
        page: data?.page ?? 0,
        loading,
        error,
        reload,
        patchItem,
        dropItem,
        prependItem,
    };
}

/* ------------------------------------------------------------- mutations */

/**
 * Favourite / delete. Both are optimistic: the row updates immediately and rolls
 * back on failure, because a favourite toggle that waits for a round trip feels
 * broken on a slow connection and this is a low-stakes, reversible action.
 */
export function useWordMutations() {
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState(null);

    const toggleFavorite = useCallback(async (id) => {
        setBusyId(id);
        setError(null);
        try {
            const response = await dictionaryApi.toggleFavorite(id);
            return unwrapData(response);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setBusyId(null);
        }
    }, []);

    const remove = useCallback(async (id) => {
        setBusyId(id);
        setError(null);
        try {
            await dictionaryApi.deleteWord(id);
            return true;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setBusyId(null);
        }
    }, []);

    const save = useCallback(async (id, patch) => {
        setBusyId(id);
        setError(null);
        try {
            const response = await dictionaryApi.updateWord(id, patch);
            return unwrapData(response);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setBusyId(null);
        }
    }, []);

    const addWord = useCallback(async (word) => {
        setError(null);
        try {
            const response = await dictionaryApi.addWord(word);
            return unwrapData(response);
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    return { toggleFavorite, remove, save, addWord, busyId, error };
}

/* ------------------------------------------------------------------ review */

export function useDueReview({ words = '', mode = '', size = 50 } = {}) {
    const key = `${words}|${mode}|${size}`;
    const loader = useCallback(
        () => dictionaryApi.getDueReviews({ words, mode, page: 0, size }).then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data, loading, error, reload } = useAsyncData(loader, key);

    return { items: data?.items ?? [], total: data?.totalElements ?? 0, loading, error, reload };
}

/**
 * Score one word and report the scheduled next review.
 *
 * The score is the backend's 0-5 `performanceScore`, which is validated server-side.
 * The returned word carries the new `proficiencyLevel` and `nextReviewAt`, so the
 * UI can show the real consequence of the choice rather than a predicted one.
 */
export function useReviewWord() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const score = useCallback(async (wordId, performanceScore) => {
        setSubmitting(true);
        setError(null);
        try {
            const response = await dictionaryApi.reviewWord(wordId, performanceScore);
            return unwrapData(response);
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, []);

    return { score, submitting, error };
}
