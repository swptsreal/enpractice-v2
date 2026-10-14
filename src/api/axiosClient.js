import axios from "axios";
import { getCurrentLanguage } from "../i18n";

/**
 * EN Practice — Custom Axios Client
 * Configured with auth session helpers, refresh-token retry, and API unwrap logic.
 */
export const API_ROOT = String(import.meta.env.VITE_API_URL ?? "")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
export const API_BASE_URL = `${API_ROOT}/api`;
const LEGACY_TOKEN_KEY = "en_practice_token";
const ACCESS_TOKEN_KEY = "en_practice_access_token";
const REFRESH_TOKEN_KEY = "en_practice_refresh_token";
const ACCESS_TOKEN_EXPIRES_AT_KEY = "en_practice_access_token_expires_at";
const REFRESH_TOKEN_EXPIRES_AT_KEY = "en_practice_refresh_token_expires_at";
const TIMEOUT = 15000;
const EXPIRY_SKEW_MS = 30 * 1000;

function clearLegacyToken() {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
}

function unwrapApiBody(body, fallbackStatus = 200) {
    if (body && typeof body === "object" && "success" in body) {
        if (!body.success) {
            throw new ApiError(
                body.message || "Yeu cau that bai.",
                fallbackStatus,
                body.data,
            );
        }

        return body.data;
    }

    return body;
}

export function getAccessToken() {
    clearLegacyToken();
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    clearLegacyToken();
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAccessTokenExpiresAt() {
    return localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
}

export function getRefreshTokenExpiresAt() {
    return localStorage.getItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
}

export function getAuthSession() {
    clearLegacyToken();

    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (!accessToken && !refreshToken) {
        return null;
    }

    return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt: getAccessTokenExpiresAt(),
        refreshTokenExpiresAt: getRefreshTokenExpiresAt(),
    };
}

export function isTokenExpired(expiresAt, skewMs = EXPIRY_SKEW_MS) {
    if (!expiresAt) return true;

    const expiresAtMs = new Date(expiresAt).getTime();
    if (Number.isNaN(expiresAtMs)) return true;

    return expiresAtMs <= Date.now() + skewMs;
}

export function hasValidAccessToken() {
    const accessToken = getAccessToken();
    const accessTokenExpiresAt = getAccessTokenExpiresAt();
    return !!accessToken && !isTokenExpired(accessTokenExpiresAt);
}

export function hasRefreshToken() {
    return !!getRefreshToken();
}

export function hasToken() {
    return !!(getAccessToken() || getRefreshToken());
}

export function setAuthSession(session) {
    clearLegacyToken();

    const {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
    } = session || {};

    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    if (accessTokenExpiresAt) {
        localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, accessTokenExpiresAt);
    } else {
        localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
    }

    if (refreshTokenExpiresAt) {
        localStorage.setItem(
            REFRESH_TOKEN_EXPIRES_AT_KEY,
            refreshTokenExpiresAt,
        );
    } else {
        localStorage.removeItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
    }
}

export function clearAuthSession() {
    clearLegacyToken();
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
    localStorage.removeItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
}

export function getToken() {
    return getAccessToken();
}

export function setToken(token) {
    setAuthSession({ accessToken: token });
}

export function removeToken() {
    clearAuthSession();
}

export class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: TIMEOUT,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Internal-Key": import.meta.env.VITE_INTERNAL_KEY,
    },
});

let refreshPromise = null;

function dispatchLogoutEvent(reason = "unknown") {
    window.dispatchEvent(
        new CustomEvent("auth:logout", {
            detail: { reason },
        }),
    );
}

function dispatchUserEvent(user) {
    if (!user) return;

    window.dispatchEvent(
        new CustomEvent("auth:user", {
            detail: { user },
        }),
    );
}

function isRefreshRequest(config) {
    return config?.url?.includes("/auth/refresh");
}

function shouldSkipRefresh(config) {
    const url = config?.url || "";
    return (
        !!config?.skipAuthRefresh ||
        isRefreshRequest(config) ||
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/logout")
    );
}

async function requestRefreshToken() {
    const refreshToken = getRefreshToken();
    const refreshTokenExpiresAt = getRefreshTokenExpiresAt();

    if (!refreshToken || isTokenExpired(refreshTokenExpiresAt, 0)) {
        clearAuthSession();
        throw new ApiError(
            "Phien dang nhap het han. Vui long dang nhap lai.",
            401,
        );
    }

    const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        {
            timeout: TIMEOUT,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Language": getCurrentLanguage(),
                "X-Internal-Key": import.meta.env.VITE_INTERNAL_KEY,
            },
        },
    );

    const data = unwrapApiBody(response.data, response.status);
    setAuthSession({
        accessToken: data?.accessToken,
        refreshToken: data?.refreshToken || refreshToken,
        accessTokenExpiresAt: data?.accessTokenExpiresAt,
        refreshTokenExpiresAt:
            data?.refreshTokenExpiresAt || refreshTokenExpiresAt,
    });
    dispatchUserEvent(data?.user);

    return data;
}

export async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = requestRefreshToken()
            .catch((error) => {
                clearAuthSession();
                dispatchLogoutEvent("expired");
                throw error;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

export async function ensureValidAccessToken() {
    const accessToken = getAccessToken();
    const accessTokenExpiresAt = getAccessTokenExpiresAt();

    if (accessToken && !isTokenExpired(accessTokenExpiresAt)) {
        return accessToken;
    }

    if (!hasRefreshToken()) {
        return null;
    }

    const refreshData = await refreshAccessToken();
    return refreshData?.accessToken || getAccessToken();
}

export function shouldAttachAccessToken(config, accessToken) {
    return Boolean(accessToken && !config?.skipAuthHeader);
}

export function shouldLogApiPayload(config) {
    return !config?.skipDebugLog;
}
axiosClient.interceptors.request.use(
    async (config) => {
        if (!shouldSkipRefresh(config) && hasRefreshToken()) {
            const accessToken = getAccessToken();
            const accessTokenExpiresAt = getAccessTokenExpiresAt();

            if (!accessToken || isTokenExpired(accessTokenExpiresAt)) {
                try {
                    await refreshAccessToken();
                } catch (error) {
                    return Promise.reject(error);
                }
            }
        }

        const accessToken = getAccessToken();
        if (shouldAttachAccessToken(config, accessToken)) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        config.headers["Accept-Language"] = getCurrentLanguage();

        if (import.meta.env.DEV && shouldLogApiPayload(config)) {
            console.log(
                `%c[API] ${config.method?.toUpperCase()} ${config.url}`,
                "color: #6366f1; font-weight: bold;",
                config.data || "",
            );
        }

        return config;
    },
    () => Promise.reject(new ApiError("Loi cau hinh request.", 0)),
);

axiosClient.interceptors.response.use(
    (response) => {
        const body = response.data;

        if (import.meta.env.DEV && shouldLogApiPayload(response.config)) {
            console.log(
                `%c[API] ✓ ${response.status} ${response.config.url}`,
                "color: #10b981; font-weight: bold;",
                body,
            );
        }

        return unwrapApiBody(body, response.status);
    },
    async (error) => {
        if (!error.response) {
            const message =
                error.code === "ECONNABORTED"
                    ? "Request timeout. Vui long kiem tra ket noi mang."
                    : "Khong the ket noi den server. Vui long thu lai.";

            if (import.meta.env.DEV && shouldLogApiPayload(error.config)) {
                console.error(
                    "%c[API] ✗ Network Error",
                    "color: #ef4444; font-weight: bold;",
                    error.message,
                );
            }

            return Promise.reject(new ApiError(message, 0));
        }

        const { status, data, config } = error.response;
        const originalRequest = error.config || config || {};

        if (import.meta.env.DEV && shouldLogApiPayload(originalRequest)) {
            console.error(
                `%c[API] ✗ ${status} ${originalRequest?.url}`,
                "color: #ef4444; font-weight: bold;",
                data,
            );
        }

        if (
            status === 401 &&
            !originalRequest._retry &&
            !shouldSkipRefresh(originalRequest) &&
            hasRefreshToken()
        ) {
            originalRequest._retry = true;

            try {
                const refreshData = await refreshAccessToken();
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${refreshData.accessToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        if (status === 401) {
            clearAuthSession();
            dispatchLogoutEvent("expired");
            const message =
                data?.message ||
                "Phien dang nhap het han. Vui long dang nhap lai.";
            return Promise.reject(new ApiError(message, 401, data?.data));
        }

        if (status === 403) {
            const message =
                data?.message || "Ban khong co quyen truy cap tai nguyen nay.";
            return Promise.reject(new ApiError(message, 403, data?.data));
        }

        if (status === 422) {
            const message = data?.message || "Du lieu khong hop le.";
            return Promise.reject(new ApiError(message, 422, data?.data));
        }

        if (status >= 500) {
            const message =
                data?.message || "Loi server. Vui long thu lai sau.";
            return Promise.reject(new ApiError(message, status, data?.data));
        }

        const message =
            data?.message || data?.error || `Request failed (${status})`;
        return Promise.reject(new ApiError(message, status, data?.data));
    },
);

export default axiosClient;
