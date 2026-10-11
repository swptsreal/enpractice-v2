import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

/**
 * Bỏ header `Origin` trên request mà Vite chuyển tiếp tới backend.
 *
 * Cần thiết vì browser LUÔN gửi origin của trang dev, còn CORS của backend chỉ cho
 * `https://localhost:5173` và `https://localhost:5174` — nên cùng một app mở ở
 * `https://127.0.0.1:5173` hay từ điện thoại qua `https://192.168.x.x:5173` sẽ bị từ chối.
 * Không có header này thì Spring coi đó là lời gọi cùng origin và không áp allowlist.
 */
function withoutOrigin(proxy) {
    const drop = (proxyReq) => proxyReq.removeHeader('origin');
    proxy.on('proxyReq', drop);
    proxy.on('proxyReqWs', drop);
}

/**
 * Three things about this config are load-bearing and easy to change wrongly.
 *
 * 1. THE TWO TEST RUNNERS.
 *
 *    The ported v1 logic layer ships tests written against node:test and
 *    node:assert, run by Node's own runner via `npm run test:node`. Vitest cannot
 *    execute those -- it reports "No test suite found" -- so the exclude list keeps
 *    them out of the UI suite.
 *
 *    The exclusion matches every tests directory by pattern, rather than naming the
 *    three paths that happened to exist when it was written. That matters: with a
 *    named list, adding any new test file under a tests directory made vitest pick
 *    it up and fail the whole UI suite with a confusing loader error. A pattern
 *    cannot drift that way.
 *
 *    One node:test file lives OUTSIDE a tests directory (the date utilities), so it
 *    is listed separately below.
 *
 * 2. LONG COMMENTS BELONG ABOVE THIS OBJECT, NOT INSIDE IT.
 *
 *    A multi-line block comment placed among the object's properties makes
 *    esbuild's config parse fail with a misleading "Expected } but found exclude".
 *    The message points at the property AFTER the comment, so it reads like a
 *    missing brace rather than a comment problem, and the file looks correct while
 *    refusing to load. Keep multi-line blocks at module scope; use `//` inline.
 *
 * 3. HTTPS IS NOT OPTIONAL, AND IT NEEDS THE PLUGIN.
 *
 *    Speaking requires getUserMedia, which the Web Speech API only grants in a
 *    secure context. The host is exposed so phones and tablets on the same WiFi can
 *    reach the dev server.
 *
 *    `server.https: true` ON ITS OWN DOES NOT WORK: it tells Vite to serve TLS but
 *    provides no certificate, so the handshake fails and Chrome reports
 *    ERR_SSL_VERSION_OR_CIPHER_MISMATCH — the site looks down rather than insecure.
 *    `basicSsl()` is what generates the self-signed certificate. v1 configures this
 *    correctly; v2 shipped the flag without the plugin, which is why the dev server
 *    was unreachable from a browser.
 *
 *    Note the browser will warn once about the self-signed certificate (Advanced ->
 *    proceed); that is expected, and it is the only way to get a microphone on a
 *    phone over the LAN, since http://<lan-ip> is not a secure context.
 *
 * 4. THE DEV SERVER PROXIES `/api` AND `/ws`, SO THE PAGE ONLY TALKS TO ITS OWN ORIGIN.
 *
 *    The API is on http://localhost:8082 and the page is on https://localhost:5173,
 *    which is a cross-origin call to a non-TLS host. Proxying removes three problems
 *    at once, and none of them are hypothetical:
 *
 *      - mixed content, which some browsers block outright on an https page;
 *      - CORS, whose allowlist here is `https://localhost:5173,https://localhost:5174`
 *        only — so the SAME app opened at https://127.0.0.1:5173, or from a phone at
 *        https://192.168.x.x:5173, gets every request rejected. That is the exact
 *        configuration the HTTPS flag exists to support (phone + microphone);
 *      - the port drift: if 5173 is taken the server moves to 5174, then 5175, and
 *        the allowlist stops matching.
 *
 *    The forwarded request drops its `Origin` header: the browser sends the dev
 *    server's origin, and Spring's CORS filter rejects any origin outside its
 *    allowlist even for a request Vite is about to make server-to-server. With no
 *    Origin header Spring treats it as a plain same-origin call.
 *
 *    This is why `VITE_API_URL` is `/api` in `.env` rather than an absolute URL: a
 *    relative base resolves against whatever origin the browser is actually on.
 */
export default defineConfig({
    plugins: [react(), tailwindcss(), basicSsl()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.js'],
        include: ['src/**/*.test.{js,jsx}'],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            'src/**/__tests__/**',
            'src/utils/*.test.js',
        ],
        css: false,
    },
    server: {
        host: true,
        https: true,
        proxy: {
            '/api': { target: 'http://localhost:8082', configure: withoutOrigin },
            '/ws': { target: 'ws://localhost:8082', ws: true, configure: withoutOrigin },
        },
    },
});
