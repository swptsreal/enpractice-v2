/**
 * One place that turns an API base into a WebSocket URL.
 *
 * Both realtime sockets in the app need the same three decisions, and both got them
 * wrong in the same way, so this is shared rather than duplicated a third time.
 *
 * ── THE RULE ──────────────────────────────────────────────────────────────────
 *
 *   1. RELATIVE base (`/api`, the documented dev configuration) means the page talks
 *      to its own origin and the dev server proxies `/ws`. The scheme and host MUST
 *      come from `window.location`: a relative path handed to `new WebSocket()` is not
 *      a URL at all — it throws `SyntaxError` — and an absolute `ws://localhost:8082`
 *      built from the fallback is MIXED CONTENT on the https dev page, which the
 *      browser blocks before a single frame is sent.
 *
 *      That second case is not hypothetical: it is why `/ai-chat`, speaking and
 *      custom-speaking all showed "no response" while the backend broker log read
 *      `WebSocketSession[0 current WS(0) ... 0 total]`. The socket was never opened,
 *      so there was nothing to authenticate and nothing to answer on.
 *
 *   2. ABSOLUTE base (`http://localhost:8082/api`, or a deployed host) means the socket
 *      goes straight there, so `http` -> `ws` and `https` -> `wss`.
 *
 *   3. `wss` is chosen from `window.location.protocol`, never from the API base —
 *      an https page must never open a `ws:` socket.
 *
 * `location` is injectable so the https branch is testable: jsdom serves http and
 * cannot be talked into changing its own protocol.
 */
export function resolveWsUrl(path, options = {}) {
    const apiBaseUrl =
        options.apiBaseUrl ?? (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined);
    const location = options.location ?? (typeof window !== 'undefined' ? window.location : undefined);

    const suffix = path.startsWith('/') ? path : `/${path}`;

    /* Strip the API prefix so `/ws/...` is appended to the ORIGIN, not to `/api`.
       Anchored to the end on purpose: an unanchored `.replace('/api','')` would also
       mangle a host or path that merely contains those characters. */
    const base = String(apiBaseUrl ?? '').replace(/\/api\/?$/, '');

    if (!/^https?:\/\//i.test(base)) {
        if (!location) {
            throw new Error(`Cannot resolve "${path}" to a WebSocket URL without window.location`);
        }
        const scheme = location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${scheme}//${location.host}${suffix}`;
    }

    return `${base.replace(/^http/i, 'ws')}${suffix}`;
}
