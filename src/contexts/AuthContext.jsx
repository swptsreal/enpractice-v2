import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import {
    clearAuthSession,
    getAuthSession,
    hasRefreshToken,
    isTokenExpired,
    refreshAccessToken,
    setAuthSession,
} from "../api";
import { authApi } from "../api/authApi";
import { recordsApi } from "../api/recordsApi";
import dictionaryApi from "../api/dictionaryApi";
import {
    getAll as getLocalDictionary,
    clearAll as clearLocalDictionary,
} from "../utils/localDictionary";

const AuthContext = createContext(null);
const USER_STORAGE_KEY = "en_practice_user";

function getStoredUser() {
    try {
        const raw = localStorage.getItem(USER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error("Failed to parse stored auth user:", error);
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
}

function setStoredUser(user) {
    if (!user) {
        localStorage.removeItem(USER_STORAGE_KEY);
        return;
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Auth Provider — manages login/register/logout state
 * On first login, auto-imports localStorage data to server
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user;

    const refreshUser = useCallback(async () => {
        if (!hasRefreshToken()) {
            setUser(null);
            setStoredUser(null);
            return null;
        }

        const data = await authApi.getMe();
        setUser(data);
        setStoredUser(data);
        return data;
    }, []);

    const patchUser = useCallback((partialUser) => {
        setUser((currentUser) =>
            currentUser
                ? (() => {
                      const nextUser = { ...currentUser, ...partialUser };
                      setStoredUser(nextUser);
                      return nextUser;
                  })()
                : currentUser,
        );
    }, []);

    // Restore session on mount
    useEffect(() => {
        if (hasRefreshToken()) {
            const storedUser = getStoredUser();
            if (storedUser) {
                setUser(storedUser);
            }

            const bootstrapSession = async () => {
                const session = getAuthSession();

                if (!session?.refreshToken) {
                    throw new Error("Missing refresh token");
                }

                if (
                    !session.accessToken ||
                    !session.accessTokenExpiresAt ||
                    isTokenExpired(session.accessTokenExpiresAt)
                ) {
                    await refreshAccessToken();
                }

                return refreshUser();
            };

            bootstrapSession()
                .catch((error) => {
                    const status = error?.status ?? error?.response?.status;

                    if (status === 401) {
                        clearAuthSession();
                        setStoredUser(null);
                        setUser(null);
                        return;
                    }

                    console.error(
                        "Failed to restore auth session. Keeping cached session if available:",
                        error,
                    );
                    setUser((currentUser) => currentUser ?? storedUser ?? null);
                })
                .finally(() => setLoading(false));
        } else {
            setStoredUser(null);
            setLoading(false);
        }
    }, [refreshUser]);

    // Listen for forced logout (401 from axiosClient interceptor)
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            setStoredUser(null);
        };
        window.addEventListener("auth:logout", handleLogout);
        return () => window.removeEventListener("auth:logout", handleLogout);
    }, []);

    useEffect(() => {
        const handleUserUpdate = (event) => {
            const nextUser = event?.detail?.user;
            if (!nextUser) return;

            setUser(nextUser);
            setStoredUser(nextUser);
        };

        window.addEventListener("auth:user", handleUserUpdate);
        return () => window.removeEventListener("auth:user", handleUserUpdate);
    }, []);

    /**
     * Import localStorage records/sessions to server on first login
     */
    const importLocalData = useCallback(async () => {
        try {
            const STORAGE_KEY = "en_practice_records";
            const REVIEW_SESSIONS_KEY = "en_practice_review_sessions";

            const recordsRaw = localStorage.getItem(STORAGE_KEY);
            const records = recordsRaw ? JSON.parse(recordsRaw) : [];

            const sessionsRaw = localStorage.getItem(REVIEW_SESSIONS_KEY);
            const sessions = sessionsRaw ? JSON.parse(sessionsRaw) : [];

            if (records.length === 0 && sessions.length === 0) return;

            await recordsApi.importData({ records, reviewSessions: sessions });

            // Clear localStorage after successful import
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(REVIEW_SESSIONS_KEY);

            console.log(
                `Imported ${records.length} records and ${sessions.length} review sessions`,
            );
        } catch (error) {
            console.error("Failed to import local data:", error);
            // Don't throw — import failure shouldn't block login
        }
    }, []);

    /**
     * Sync offline dictionary words (localStorage) lên DB sau khi login/register.
     * Gọi addWord cho từng từ, bỏ qua lỗi từng từ để không block login.
     */
    const importDictionaryData = useCallback(async () => {
        try {
            const words = getLocalDictionary();
            if (words.length === 0) return;

            // Push từng từ lên BE (bỏ qua field chỉ dùng local)
            const results = await Promise.allSettled(
                words.map(
                    ({
                        id: _id,
                        masteryLevel: _m,
                        nextReviewDate: _n,
                        createdAt: _c,
                        ...rest
                    }) =>
                        dictionaryApi.addWord({
                            sourceType: "MANUAL",
                            ...rest,
                        }),
                ),
            );

            const succeeded = results.filter(
                (r) => r.status === "fulfilled",
            ).length;
            console.log(
                `Dictionary sync: ${succeeded}/${words.length} words imported to DB`,
            );

            // Xóa localStorage sau khi đã sync (kể cả partial success)
            clearLocalDictionary();
        } catch (error) {
            console.error("Failed to import dictionary data:", error);
            // Không throw — không block login
        }
    }, []);

    const storeSession = useCallback((data) => {
        setAuthSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiresAt: data.accessTokenExpiresAt,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        });
        setUser(data.user);
        setStoredUser(data.user);
    }, []);

    const login = useCallback(
        async (email, password) => {
            const data = await authApi.login({ email, password });
            storeSession(data);

            // Sync localStorage data lên DB (records + dictionary)
            await Promise.all([importLocalData(), importDictionaryData()]);

            return data.user;
        },
        [importLocalData, importDictionaryData, storeSession],
    );

    /**
     * Đăng ký tài khoản.
     *
     * KHÔNG mở phiên đăng nhập: backend trả `{ email, verificationRequired, resendAvailableAt }`
     * và gửi mail xác thực. Người dùng chỉ vào được app sau khi bấm liên kết đó — email gõ sai nghĩa
     * là mất luôn đường khôi phục mật khẩu, nên đây là bước không được bỏ qua.
     */
    const register = useCallback(async (email, password, displayName) => {
        return authApi.register({ email, password, displayName });
    }, []);

    /**
     * Xác thực email bằng token trong mail. Đây mới là lúc mở phiên; dữ liệu offline được đồng bộ
     * ở đúng thời điểm login thường, để hai đường vào app có cùng kết quả.
     */
    const verifyEmail = useCallback(
        async (token) => {
            const data = await authApi.verifyEmail({ token });
            storeSession(data);
            await Promise.all([importLocalData(), importDictionaryData()]);
            return data.user;
        },
        [importLocalData, importDictionaryData, storeSession],
    );

    /**
     * Đổi mật khẩu. Backend revoke mọi phiên cũ và trả session mới, nên session trong máy phải được
     * thay bằng session mới này — nếu không, request kế tiếp sẽ 401.
     */
    const changePassword = useCallback(
        async (currentPassword, newPassword) => {
            const data = await authApi.changePassword({
                currentPassword,
                newPassword,
            });
            storeSession(data);
            return data.user;
        },
        [storeSession],
    );

    const logout = useCallback(() => {
        const refreshToken = getAuthSession()?.refreshToken;
        if (refreshToken) {
            authApi.logout(refreshToken).catch(() => {});
        }
        clearAuthSession();
        setStoredUser(null);
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        verifyEmail,
        changePassword,
        logout,
        refreshUser,
        patchUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
