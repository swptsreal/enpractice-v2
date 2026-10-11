/**
 * DEV-only database connection resolution.
 *
 * Resolution order, most authoritative first:
 *
 *   1. en-practice-be/.env — the documented source. Spring Boot loads it and its
 *      SPRING_DATASOURCE_* variables OVERRIDE application-local.yml, so the yml's
 *      value is not the password in use. Anyone reading only the yml gets
 *      "password authentication failed".
 *   2. the running postgres container's env — catches a .env that has drifted.
 *   3. application-local.yml — last resort for a native Postgres.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BACKEND = () => join(process.cwd(), '..', 'en-practice-be');

/** Minimal dotenv parser: handles `KEY=value`, comments and blank lines. */
function readDotEnv() {
    let raw;
    try {
        raw = readFileSync(join(BACKEND(), '.env'), 'utf8');
    } catch {
        return null;
    }
    const out = {};
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx === -1) continue;
        out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
    return out;
}

export function readDbConfigFromDotEnv() {
    const env = readDotEnv();
    if (!env?.SPRING_DATASOURCE_URL) return null;
    const { hostname, port, pathname } = new URL(env.SPRING_DATASOURCE_URL.replace('jdbc:', ''));
    return {
        host: hostname,
        port: Number(port || 5432),
        database: pathname.replace(/^\//, ''),
        user: env.SPRING_DATASOURCE_USERNAME,
        password: env.SPRING_DATASOURCE_PASSWORD,
    };
}

export function readDbConfigFromDocker() {
    const container = process.env.DEV_PG_CONTAINER ?? 'en_practice_postgres';
    try {
        const out = execFileSync(
            'docker',
            ['inspect', container, '--format', '{{range .Config.Env}}{{println .}}{{end}}'],
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
        );
        const env = Object.fromEntries(
            out
                .split('\n')
                .filter((line) => line.includes('='))
                .map((line) => {
                    const idx = line.indexOf('=');
                    return [line.slice(0, idx), line.slice(idx + 1)];
                })
        );
        if (!env.POSTGRES_USER || !env.POSTGRES_PASSWORD) return null;
        return {
            host: '127.0.0.1',
            port: Number(process.env.DEV_PG_PORT ?? 5432),
            database: env.POSTGRES_DB ?? 'en_practice',
            user: env.POSTGRES_USER,
            password: env.POSTGRES_PASSWORD,
        };
    } catch {
        return null;
    }
}

export function readDbConfigFromYml() {
    /* Resolved from the PROCESS CWD, not from import.meta.url: the sibling backend
       repo is two levels up from the v2 repo root, but these files sit in scripts/. */
    let raw;
    try {
        raw = readFileSync(join(BACKEND(), 'src', 'main', 'resources', 'application-local.yml'), 'utf8');
    } catch {
        return null;
    }
    /* Scope the parse to the `datasource:` block: the file also has a Redis
       `password:` further down, so a whole-file match picks up the wrong one. */
    const i = raw.indexOf('datasource:');
    const j = raw.indexOf('redis:', i);
    const block = raw.slice(i, j === -1 ? undefined : j);

    const url = block.match(/url:\s*(jdbc:postgresql:\/\/[^\s]+)/)?.[1];
    const username = block.match(/username:\s*([^\s${]+)/)?.[1];
    const password = block.match(/password:\s*([^\s${]+)/)?.[1];
    if (!url) return null;
    const { hostname, port, pathname } = new URL(url.replace('jdbc:', ''));
    return {
        host: hostname,
        port: Number(port || 5432),
        database: pathname.replace(/^\//, ''),
        user: username,
        password,
    };
}

/** Resolve a local-dev connection, refusing anything that is not localhost. */
export function resolveDevDbConfig() {
    const cfg = readDbConfigFromDotEnv() ?? readDbConfigFromDocker() ?? readDbConfigFromYml();
    if (!cfg) {
        console.error('could not determine the dev database connection');
        console.error('expected ../en-practice-be/.env, or the en_practice_postgres container, or application-local.yml');
        process.exit(1);
    }
    if (!['localhost', '127.0.0.1'].includes(cfg.host)) {
        console.error(`refusing to touch a non-local database: ${cfg.host}`);
        process.exit(1);
    }
    return cfg;
}
