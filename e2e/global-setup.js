import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { request } from '@playwright/test';

/**
 * Signs in ONCE, through the API, and saves the browser state every test reuses.
 *
 * Logging in through the UI in each test would be slower and would couple every test to the login
 * form's markup. The API returns exactly the four fields the app stores, so the state file is just
 * those values under the keys `axiosClient` reads — if those key names ever change, this file is
 * the single place that has to change with them.
 *
 * The account is FIXED (`v2e2e@enpractice.test`) rather than fresh per run: screens that show
 * history, streaks or progress are only worth looking at once the account has some, and the
 * screenshots then show a real screen instead of a first-run empty state. Credits are topped up
 * only when the balance is low, so repeated runs do not inflate it.
 *
 * The backend must be running on 8082. That is the point of this suite: it talks to the real thing.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');

/**
 * NOTE THE TRAILING SLASH. Playwright resolves a request path against `baseURL` with `new URL()`,
 * and a leading-slash path REPLACES the whole path: `new URL('/auth/login', 'http://host/api')`
 * is `http://host/auth/login`, not `http://host/api/auth/login`. The first run of this suite
 * failed exactly that way — every call answered 401 because it never reached the API prefix.
 * With the slash, relative paths (`auth/login`) resolve where you expect.
 */
const API = `${(process.env.E2E_API_URL ?? 'http://localhost:8082/api').replace(/\/+$/, '')}/`;
const EMAIL = process.env.E2E_EMAIL ?? 'v2e2e@enpractice.test';
const PASSWORD = process.env.E2E_PASSWORD ?? 'Verify12345';
const STATE_PATH = resolve(HERE, '.auth/state.json');

const TOKEN_KEYS = {
    accessToken: 'en_practice_access_token',
    refreshToken: 'en_practice_refresh_token',
    accessTokenExpiresAt: 'en_practice_access_token_expires_at',
    refreshTokenExpiresAt: 'en_practice_refresh_token_expires_at',
};

/**
 * The backend rejects requests without the internal key, exactly as the browser client's requests
 * carry it. Reading it from `.env` (rather than hardcoding) keeps this working when someone rotates
 * the value locally; `.env` is gitignored, so the fallback is what a fresh clone gets.
 */
function internalKey() {
    if (process.env.E2E_INTERNAL_KEY) return process.env.E2E_INTERNAL_KEY;
    try {
        const env = readFileSync(resolve(REPO, '.env'), 'utf8');
        const line = env.split('\n').find((candidate) => candidate.startsWith('VITE_INTERNAL_KEY='));
        if (line) return line.slice('VITE_INTERNAL_KEY='.length).trim();
    } catch {
        /* No .env: the default below is what the committed .env.example documents. */
    }
    return 'internal-key';
}

/** Posts JSON and reports the HTTP status alongside the parsed body, because 4xx is expected. */
async function post(api, path, data, token) {
    const response = await api.post(path, {
        data,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        failOnStatusCode: false,
    });
    const body = await response.json().catch(() => null);
    return { status: response.status(), body };
}

export default async function globalSetup() {
    const api = await request.newContext({
        baseURL: API,
        ignoreHTTPSErrors: true,
        extraHTTPHeaders: { 'X-Internal-Key': internalKey() },
    });

    /* Registration is attempted, not required: on the second run the account already exists and
       the API answers 4xx, which is a success for our purposes. */
    const registration = await post(api, 'auth/register', {
        email: EMAIL,
        password: PASSWORD,
        displayName: 'E2E Learner',
    });

    const login = await post(api, 'auth/login', { email: EMAIL, password: PASSWORD });
    if (login.status !== 200 || !login.body?.data?.accessToken) {
        throw new Error(
            `E2E could not sign in as ${EMAIL} (login HTTP ${login.status}, register HTTP ${registration.status}). ` +
                `login body: ${JSON.stringify(login.body)}\n` +
                `Is the backend on 8082 running? Does ${API}require the X-Internal-Key header?`
        );
    }

    const session = login.body.data;
    const token = session.accessToken;
    const auth = { Authorization: `Bearer ${token}` };

    /**
     * THE ACCOUNT MUST BE A RETURNING USER, NOT A FIRST-RUN ONE.
     *
     * A fresh account has `onboarding.required = true`, and the app then routes EVERY screen to the
     * wizard — which is correct behaviour, and it made the first version of this suite photograph
     * the same "Bước 1 / 4" screen 27 times under 27 different names. Proof that the suite works,
     * and proof that a fixture which skips setup tests nothing.
     *
     * The payload is the same one `scripts/dev-verify-onboarding-flow.mjs` submits, including
     * `version` from the server: the server tells us which version it requires, so this keeps
     * working when CURRENT_ONBOARDING_VERSION is bumped.
     */
    const profileResponse = await api.get('user/profile', { headers: auth, failOnStatusCode: false });
    const profileBody = await profileResponse.json().catch(() => null);
    const onboarding = profileBody?.data?.onboarding;

    if (onboarding?.required) {
        const completed = await api.put('user/profile/onboarding', {
            headers: auth,
            failOnStatusCode: false,
            data: {
                status: 'COMPLETED',
                version: onboarding.requiredVersion ?? 1,
                targetIeltsBand: 6.5,
                preferredSkill: 'SPEAKING',
                dailyGoalMinutes: 45,
            },
        });
        if (completed.status() !== 200) {
            console.warn(
                `[e2e] onboarding could not be completed (HTTP ${completed.status()}): ` +
                    `${(await completed.text()).slice(0, 200)} — every screen will show the wizard.`
            );
        }
    }

    /* Top up ONLY when low: this suite spends real credits on the flows it drives, and a
       top-up on every run would hide a genuine "you cannot afford this" state. */
    const balanceResponse = await api.get('credits/balance', {
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
    });
    const balanceBody = await balanceResponse.json().catch(() => null);
    const available = balanceBody?.data?.availableBalance ?? 0;

    let granted = 0;
    if (available < 20) {
        try {
            execFileSync('node', ['scripts/dev-grant-credits.mjs', EMAIL, '50'], {
                cwd: REPO,
                stdio: 'ignore',
            });
            granted = 50;
        } catch (error) {
            /* Not fatal: the money-free screens still run, and the expensive ones will say why. */
            console.warn(`[e2e] could not grant credits (${error.message}); continuing.`);
        }
    }

    const localStorage = Object.entries(TOKEN_KEYS)
        .filter(([field]) => session[field])
        .map(([field, key]) => ({ name: key, value: String(session[field]) }));

    const origin = process.env.E2E_BASE_URL ?? `https://localhost:${process.env.E2E_PORT ?? 5273}`;

    mkdirSync(dirname(STATE_PATH), { recursive: true });
    writeFileSync(
        STATE_PATH,
        JSON.stringify({ cookies: [], origins: [{ origin, localStorage }] }, null, 2)
    );

    console.log(
        `[e2e] signed in as ${EMAIL} (balance ${available}${granted ? ` -> +${granted}` : ''}); ` +
            `state written for ${origin}`
    );

    await api.dispose();
}
