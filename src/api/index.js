/**
 * API barrel export
 * Import tất cả từ một nơi: import { authApi, recordsApi } from '@/api'
 */

export { default as axiosClient } from './axiosClient';
export {
    getAccessToken,
    getRefreshToken,
    getAccessTokenExpiresAt,
    getRefreshTokenExpiresAt,
    getAuthSession,
    setAuthSession,
    clearAuthSession,
    hasRefreshToken,
    hasValidAccessToken,
    isTokenExpired,
    refreshAccessToken,
    ensureValidAccessToken,
    getToken,
    setToken,
    removeToken,
    hasToken,
    ApiError,
} from './axiosClient';
export { authApi } from './authApi';
export { recordsApi } from './recordsApi';
export { reviewsApi } from './reviewsApi';
export { ieltsApi } from './ieltsApi';
export { writingApi } from './writingApi';
export { leaderboardApi } from './leaderboardApi';
export { profileApi } from './profileApi';
export { notificationApi } from './notificationApi';
export { dashboardApi } from './dashboardApi';
export { checkInApi } from './checkInApi';
export { xpMilestoneApi } from './xpMilestoneApi';
export { inventoryApi } from './inventoryApi';
export { rewardMissionApi } from './rewardMissionApi';
export { writingPracticeApi } from './writingPracticeApi';
export { creditApi } from './creditApi';

/**
 * Added in v2. These nine modules exist in v1 but are NOT re-exported from this
 * barrel, so v1's pages reach them by deep path. The v2 screens want one import
 * site, and mixing "the barrel" with "deep paths" is how a codebase acquires two
 * conventions for the same thing.
 *
 * Additive only — nothing removed, no module body touched — so re-copying this
 * directory from v1 stays a safe operation.
 */
export { vocabularyTestApi } from './vocabularyTestApi';
export { default as dictionaryApi } from './dictionaryApi';
export { speakingApi } from './speakingApi';
export { speechApi } from './speechApi';
export { default as weeklyReportApi } from './weeklyReportApi';
export { aiChatApi } from './aiChatApi';
export { mascotApi } from './mascotApi';
export { challengeApi } from './challengeApi';
export { recommendationApi } from './recommendationApi';
export { achievementApi } from './achievementApi';
export { learningPathApi } from './learningPathApi';

