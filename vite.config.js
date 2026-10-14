import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

function withoutOrigin(proxy) {
    const drop = (proxyReq) => proxyReq.removeHeader("origin");
    proxy.on("proxyReq", drop);
    proxy.on("proxyReqWs", drop);
}

function requireDeployApiUrl() {
    return {
        name: "en-practice:require-deploy-api-url",
        configResolved(config) {
            if (!process.env.CF_PAGES) return;

            const value = String(
                loadEnv(config.mode, process.cwd(), "VITE_").VITE_API_URL ?? "",
            );

            if (
                /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/?$/i.test(
                    value,
                )
            ) {
                throw new Error(
                    `VITE_API_URL is "${value}", which is only reachable from the machine that built this bundle.\n` +
                        "Set it in Cloudflare: Workers & Pages -> this project -> Settings -> Environment variables -> Production.",
                );
            }

            if (!/^https?:\/\//i.test(value)) {
                throw new Error(
                    `VITE_API_URL is ${value ? `"${value}"` : "unset"}, so the deployed bundle would call its own origin ` +
                        `(${process.env.CF_PAGES_URL ?? "the Pages domain"}) instead of the backend.\n` +
                        "An EMPTY base is the correct value for local development only, where the dev server proxies /api and /ws.\n" +
                        "Set it in Cloudflare: Workers & Pages -> this project -> Settings -> Environment variables -> Production,\n" +
                        "to the backend BASE url with NO /api suffix (for example https://api.example.com), then REDEPLOY —\n" +
                        "the value is baked in at build time, so an existing deployment is not affected by adding it.",
                );
            }
        },
    };
}

export default defineConfig({
    plugins: [react(), tailwindcss(), basicSsl(), requireDeployApiUrl()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test/setup.js"],
        include: ["src/**/*.test.{js,jsx}"],
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "src/**/__tests__/**",
            "src/utils/*.test.js",
        ],
        css: false,
    },
    server: {
        host: true,
        https: true,
        proxy: {
            "/api": {
                target: "http://localhost:8082",
                configure: withoutOrigin,
            },
            "/ws": {
                target: "ws://localhost:8082",
                ws: true,
                configure: withoutOrigin,
            },
        },
    },
});
