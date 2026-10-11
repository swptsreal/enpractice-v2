/**
 * One-off DEV helper: give a test account credits so the IELTS session flow can
 * be exercised end to end.
 *
 * Why this exists: the credit API is READ-ONLY (`/credits/balance`,
 * `/credits/transactions`, `/credits/costs`). There is no grant endpoint, and a
 * new account gets an empty wallet, so POST /ielts/sessions/start answers 402 and
 * no one can start a test. The only way to test the session flow without one is
 * to seed a wallet directly.
 *
 * This is a LOCAL DEVELOPMENT script. It talks straight to the dev database and
 * refuses to run against anything that is not localhost.
 *
 * Usage:
 *   node scripts/dev-grant-credits.mjs <email> [amount]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';

const email = process.argv[2];
const amount = Number(process.argv[3] ?? 100);

if (!email) {
    console.error('usage: node scripts/dev-grant-credits.mjs <email> [amount]');
    process.exit(1);
}
if (!Number.isFinite(amount) || amount <= 0) {
    console.error('amount must be a positive number');
    process.exit(1);
}

/**
 * Credentials come from the RUNNING POSTGRES CONTAINER, not from
 * `application-local.yml`.
 *
 * That yml says `password: en_practice`, which Postgres rejects: the actual dev
 * database is the `en_practice_postgres` Docker container and its password is
 * different. Reading the container env is both correct and self-updating, so this
 * does not rot the next time someone recreates the volume.
 */
function readDbConfigFromDocker() {
    const container = process.env.DEV_PG_CONTAINER ?? 'en_practice_postgres';
    try {
        const out = execFileSync('docker', ['inspect', container, '--format', '{{range .Config.Env}}{{println .}}{{end}}'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        });
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
            port: 5432,
            database: env.POSTGRES_DB ?? 'en_practice',
            user: env.POSTGRES_USER,
            password: env.POSTGRES_PASSWORD,
        };
    } catch {
        return null;
    }
}

/** Fallback: parse the backend's local profile. Used when Docker is unavailable. */
function readDbConfigFromYml() {
    /* Resolved from the PROCESS CWD, not from import.meta.url: the sibling backend
       repo is two levels up from the v2 repo root, but this file sits in scripts/. */
    const path = join(process.cwd(), '..', 'en-practice-be', 'src', 'main', 'resources', 'application-local.yml');
    let raw;
    try {
        raw = readFileSync(path, 'utf8');
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

const cfg = readDbConfigFromDocker() ?? readDbConfigFromYml();
if (!cfg) {
    console.error('could not determine the dev database connection');
    process.exit(1);
}
if (!['localhost', '127.0.0.1'].includes(cfg.host)) {
    console.error(`refusing to write to a non-local database: ${cfg.host}`);
    process.exit(1);
}

const client = new Client(cfg);
await client.connect();

try {
    const { rows: users } = await client.query(
        'SELECT id, email FROM users WHERE email = $1',
        [email]
    );
    if (users.length === 0) {
        console.error(`no user with email ${email}`);
        process.exit(1);
    }
    const userId = users[0].id;

    await client.query('BEGIN');

    /* The wallet is normally created lazily by the service; upsert so this works
       whether or not that has happened yet. */
    const { rows: wallets } = await client.query(
        `INSERT INTO credit_wallet (id, user_id, available_balance, reserved_balance, status)
         VALUES (gen_random_uuid(), $1, 0, 0, 'ACTIVE')
         ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
         RETURNING id, available_balance`,
        [userId]
    );
    const walletId = wallets[0].id;
    const before = Number(wallets[0].available_balance);

    /* A credit lot is where spendable credits actually live; `available_balance`
       is the denormalised total the balance endpoint reads. */
    await client.query(
        `INSERT INTO credit_lot
            (id, wallet_id, source_type, original_amount, remaining_amount, reserved_amount,
             expires_at, reference_type, reference_id)
         VALUES (gen_random_uuid(), $1, 'ADMIN_GRANT', $2, $2, 0, NOW() + INTERVAL '30 days',
                 'DEV_SEED', $3)`,
        [walletId, amount, email]
    );

    const { rows: after } = await client.query(
        `UPDATE credit_wallet
            SET available_balance = available_balance + $2, updated_at = NOW()
          WHERE id = $1
          RETURNING available_balance`,
        [walletId, amount]
    );

    await client.query(
        `INSERT INTO credit_transaction
            (id, wallet_id, transaction_type, source_type, amount,
             available_balance_after, reserved_balance_after, idempotency_key,
             reference_type, reference_id, metadata)
         VALUES (gen_random_uuid(), $1, 'GRANT', 'ADMIN_GRANT', $2, $3, 0, $4,
                 'DEV_SEED', $5, '{"reason":"v2 session-flow verification","local":true}'::jsonb)`,
        [walletId, amount, Number(after[0].available_balance), `dev-seed-${userId}-${Date.now()}`, email]
    );

    await client.query('COMMIT');

    console.log(`granted ${amount} credits to ${email}`);
    console.log(`  wallet   ${walletId}`);
    console.log(`  balance  ${before} -> ${after[0].available_balance}`);
} catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('failed:', error.message);
    process.exitCode = 1;
} finally {
    await client.end();
}
