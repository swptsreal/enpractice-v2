import { afterEach, describe, expect, it, vi } from "vitest";

async function baseUrlFor(value) {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", value);
    const mod = await import("./axiosClient.js");
    return mod.API_BASE_URL;
}

describe("axiosClient — the /api suffix is added in exactly one place", () => {
    afterEach(() => vi.unstubAllEnvs());

    it("composes a relative /api from an empty base, which is the dev proxy path", async () => {
        expect(await baseUrlFor("")).toBe("/api");
    });

    it("appends /api once to an absolute base, with or without a trailing slash", async () => {
        expect(await baseUrlFor("http://localhost:8082")).toBe(
            "http://localhost:8082/api",
        );
        expect(await baseUrlFor("https://api.enpractice.site/")).toBe(
            "https://api.enpractice.site/api",
        );
    });

    it("tolerates a base that still carries the old /api suffix, so a stale value cannot double up", async () => {
        expect(await baseUrlFor("http://localhost:8082/api")).toBe(
            "http://localhost:8082/api",
        );
        expect(await baseUrlFor("https://api.enpractice.site/api/")).toBe(
            "https://api.enpractice.site/api",
        );
    });

    it("never produces a doubled prefix, whichever shape is handed to it", async () => {
        for (const value of [
            "",
            "http://h:8082",
            "http://h:8082/",
            "http://h:8082/api",
            "https://h/api/",
        ]) {
            expect(await baseUrlFor(value)).not.toContain("/api/api");
        }
    });
});
