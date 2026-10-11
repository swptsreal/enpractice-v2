/**
 * DEV helper: find an existing account that already has credits, so the IELTS
 * session flow can be verified without seeding anything.
 *
 * Read-only. Prints wallet balances and a few row counts.
 *
 * Usage: node scripts/dev-find-credit-account.mjs
 */
import { Client } from 'pg';
import { resolveDevDbConfig } from './devDbConfig.mjs';

const client = new Client(resolveDevDbConfig());
await client.connect();

try {
    const { rows } = await client.query(`
        SELECT u.email, u.display_name, w.available_balance, w.status
        FROM credit_wallet w
        JOIN users u ON u.id = w.user_id
        WHERE w.available_balance > 0
        ORDER BY w.available_balance DESC
        LIMIT 20
    `);

    if (rows.length === 0) {
        console.log('no account has a positive credit balance');
    } else {
        console.log(`${rows.length} account(s) with credits:`);
        for (const r of rows) {
            console.log(
                `  ${String(r.available_balance).padStart(6)}  ${r.email}  (${r.display_name ?? '—'}) [${r.status}]`
            );
        }
    }

    const { rows: counts } = await client.query(`
        SELECT
          (SELECT COUNT(*) FROM users) AS users,
          (SELECT COUNT(*) FROM credit_wallet) AS wallets,
          (SELECT COUNT(*) FROM ielts_attempt) AS attempts
    `);
    console.log(`\nusers=${counts[0].users} wallets=${counts[0].wallets} ielts_attempts=${counts[0].attempts}`);
} catch (error) {
    console.error('failed:', error.message);
    process.exitCode = 1;
} finally {
    await client.end();
}
