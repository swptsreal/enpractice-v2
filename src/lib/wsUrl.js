export function resolveWsUrl(path, options = {}) {
    const apiBaseUrl =
        options.apiBaseUrl ??
        (typeof import.meta !== "undefined"
            ? import.meta.env?.VITE_API_URL
            : undefined);
    const location =
        options.location ??
        (typeof window !== "undefined" ? window.location : undefined);

    const suffix = path.startsWith("/") ? path : `/${path}`;
    const base = String(apiBaseUrl ?? "").replace(/\/api\/?$/, "");

    if (!/^https?:\/\//i.test(base)) {
        if (!location) {
            throw new Error(
                `Cannot resolve "${path}" to a WebSocket URL without window.location`,
            );
        }
        const scheme = location.protocol === "https:" ? "wss:" : "ws:";
        return `${scheme}//${location.host}${suffix}`;
    }

    return `${base.replace(/^http/i, "ws")}${suffix}`;
}
