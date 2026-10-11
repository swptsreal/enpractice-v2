import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import dictionaryApi from '../api/dictionaryApi';
import * as localDict from '../utils/localDictionary';

/**
 * useDictionary.js
 * Hook trung tâm cho dictionary.
 * - Chưa đăng nhập → dùng localDictionary (localStorage)
 * - Đã đăng nhập → dùng dictionaryApi (HTTP)
 */

export function useDictionary() {
    const { isAuthenticated } = useAuth();

    // ── searchWords ────────────────────────────────────────────────────────────
    const searchWords = useCallback(async (params) => {
        if (!isAuthenticated) {
            // Trả về shape giống BE để DictionaryPage không cần thay đổi logic
            return localDict.searchWords(params);
        }
        const res = await dictionaryApi.searchWords(params);
        // axiosClient có thể đã unwrap, hỗ trợ cả hai trường hợp
        return res?.content ? res : (res?.data ?? res);
    }, [isAuthenticated]);

    // ── getStats ───────────────────────────────────────────────────────────────
    const getStats = useCallback(async () => {
        if (!isAuthenticated) {
            return localDict.getStats();
        }
        return dictionaryApi.getStats();
    }, [isAuthenticated]);

    // ── getDueReviews ──────────────────────────────────────────────────────────
    const getDueReviews = useCallback(async (params) => {
        if (!isAuthenticated) {
            return localDict.getDueReviews(params);
        }
        return dictionaryApi.getDueReviews(params);
    }, [isAuthenticated]);

    // ── addWord ────────────────────────────────────────────────────────────────
    const addWord = useCallback(async (data) => {
        if (!isAuthenticated) {
            return localDict.addWord(data);
        }
        return dictionaryApi.addWord(data);
    }, [isAuthenticated]);

    // ── updateWord ─────────────────────────────────────────────────────────────
    const updateWord = useCallback(async (id, data) => {
        if (!isAuthenticated) {
            return localDict.updateWord(id, data);
        }
        return dictionaryApi.updateWord(id, data);
    }, [isAuthenticated]);

    // ── deleteWord ─────────────────────────────────────────────────────────────
    const deleteWord = useCallback(async (id) => {
        if (!isAuthenticated) {
            return localDict.deleteWord(id);
        }
        return dictionaryApi.deleteWord(id);
    }, [isAuthenticated]);

    // ── toggleFavorite ─────────────────────────────────────────────────────────
    const toggleFavorite = useCallback(async (id) => {
        if (!isAuthenticated) {
            return localDict.toggleFavorite(id);
        }
        return dictionaryApi.toggleFavorite(id);
    }, [isAuthenticated]);

    // ── reviewWord ─────────────────────────────────────────────────────────────
    const reviewWord = useCallback(async (id, performanceScore) => {
        if (!isAuthenticated) {
            return localDict.reviewWord(id, performanceScore);
        }
        return dictionaryApi.reviewWord(id, performanceScore);
    }, [isAuthenticated]);

    return useMemo(
        () => ({
            isLocal: !isAuthenticated,
            searchWords,
            getStats,
            getDueReviews,
            addWord,
            updateWord,
            deleteWord,
            toggleFavorite,
            reviewWord,
        }),
        [
            addWord,
            deleteWord,
            getDueReviews,
            getStats,
            isAuthenticated,
            reviewWord,
            searchWords,
            toggleFavorite,
            updateWord,
        ]
    );
}
