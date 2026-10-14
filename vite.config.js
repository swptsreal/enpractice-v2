import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

function withoutOrigin(proxy) {
    const drop = (proxyReq) => proxyReq.removeHeader("origin");
    proxy.on("proxyReq", drop);
    proxy.on("proxyReqWs", drop);
}

export default defineConfig({
    plugins: [react(), tailwindcss(), basicSsl()],
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
