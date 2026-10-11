/**
 * Record/replay fixtures for the `scripts/dev-verify-*.mjs` scripts.
 *
 * WHY THIS EXISTS
 * ---------------
 * Every dev-verify script drives the REAL backend, and most of those steps make the
 * backend call an LLM through the local 9router gateway. Each run therefore bills real
 * tokens. Re-running a flow to re-check a field mapping, a status sequence or a UI
 * contract must not cost anything, so the AI-producing steps are recorded once and
 * replayed from disk afterwards.
 *
 * RULES BAKED IN HERE
 * -------------------
 *  1. REPLAY is the default. `--live` is opt-in per run, and it writes/refreshes the
 *     fixture as a side effect of the run that produced the data.
 *  2. A missing fixture NEVER falls back to live. `preflight()` fails before any
 *     network call, and `read()` fails if a step is reached without a recording. Both
 *     print the exact command that records it and exit 1.
 *  3. Only AI-producing steps are wrapped (`fx.run`). Login and read-only GETs stay
 *     live: the JWT expires, and a recorded attempt id belongs to an older backend
 *     state.
 *  4. Keys are stable labels chosen by the script author ('ielts.start',
 *     'explain.stream', 'custom-speaking.turn.1', …), never a raw URL. The backend
 *     mints a new id on every run, so a URL-keyed cache would always miss.
 *
 * FIXTURE FILE FORMAT (`scripts/fixtures/<script>/<key>.json`)
 * -----------------------------------------------------------
 *     { "script": "ielts-flow", "key": "ielts.start",
 *       "recordedAt": "2026-…", "value": <whatever the step returned> }
 *
 * `value` is opaque to this helper: it is whatever the producer resolved with, and
 * `read()`/`run()` hand it back untouched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Repo root, derived from this file so error messages do not depend on the cwd. */
const REPO_ROOT = path.resolve(LIB_DIR, '..', '..');

/** Absolute `scripts/fixtures`, stable no matter which directory the script runs from. */
export const FIXTURE_ROOT = path.join(REPO_ROOT, 'scripts', 'fixtures');

const LIVE_FLAG = '--live';

/**
 * Split `--live` out of the command line so the positional arguments keep their
 * meaning wherever the flag is written.
 *
 * @param {string[]} [argv] defaults to `process.argv.slice(2)`
 * @returns {{ live: boolean, args: string[] }}
 */
export function parseVerificationArgs(argv = process.argv.slice(2)) {
    return { live: argv.includes(LIVE_FLAG), args: argv.filter((arg) => arg !== LIVE_FLAG) };
}

/**
 * Path shown in messages, always relative to the repo root so it can be copy-pasted.
 *
 * @param {string} script fixture folder name, e.g. `ielts-flow`
 * @param {string} key stable step label, e.g. `ielts.start`
 */
export function fixtureDisplayPath(script, key) {
    return `scripts/fixtures/${script}/${key}.json`;
}

/**
 * The one message a missing fixture is allowed to produce.
 *
 * @param {string} script fixture folder name
 * @param {string} key stable step label
 * @param {string} [scriptFile] defaults to `dev-verify-<script>.mjs`
 */
export function missingFixtureMessage(script, key, scriptFile = `dev-verify-${script}.mjs`) {
    return `Thiếu fixture ${fixtureDisplayPath(script, key)} — chạy: node scripts/${scriptFile} --live`;
}

export class MissingFixtureError extends Error {
    constructor(script, key, scriptFile = `dev-verify-${script}.mjs`) {
        super(missingFixtureMessage(script, key, scriptFile));
        this.name = 'MissingFixtureError';
        this.code = 'MISSING_FIXTURE';
        this.script = script;
        this.key = key;
    }
}

/**
 * Build the record/replay store for one script.
 *
 * @param {object} options
 * @param {string} options.script fixture folder name, e.g. `ielts-flow`
 * @param {boolean} [options.live] `--live` was passed. Required — never inferred.
 * @param {Array<{ key: string, note?: string, credit?: string|null, required?: boolean }>} [options.steps]
 *        the AI-producing steps of the script. Drives the `--live` warning and the
 *        replay preflight. `required: false` marks a step that a run may legitimately
 *        never reach (so it is not checked by `preflight`).
 * @param {string} [options.root] fixture root, defaults to `scripts/fixtures`
 * @param {string} [options.scriptFile] defaults to `dev-verify-<script>.mjs`
 * @param {{ log: Function, error: Function }} [options.logger] defaults to `console`
 * @param {(error: MissingFixtureError) => void} [options.onMissing] replaces the default
 *        "print and exit 1" handler (tests inject a thrower)
 * @param {(code: number) => never} [options.exit] injectable exit, for tests
 */
export function createFixtures({
    script,
    live = false,
    steps = [],
    root = FIXTURE_ROOT,
    scriptFile = `dev-verify-${script}.mjs`,
    logger = console,
    onMissing = null,
    exit = (code) => process.exit(code),
} = {}) {
    if (!script) throw new Error('createFixtures: thiếu tên script (dùng làm tên thư mục fixture)');

    const fixtureDir = path.join(root, script);
    const log = (...args) => logger.log(...args);
    const err = (...args) => logger.error(...args);
    const missing = onMissing ?? ((error) => {
        err(error.message);
        exit(1);
    });
    const dirLabel = root === FIXTURE_ROOT ? `scripts/fixtures/${script}/` : fixtureDir;

    const api = {
        script,
        scriptFile,
        root,
        dir: fixtureDir,
        /** 'live' (call the backend, write fixtures) or 'replay' (read fixtures only). */
        mode: live ? 'live' : 'replay',
        isLive: live,
        isReplay: !live,

        /** Absolute path of one fixture. */
        fixturePath: (key) => path.join(fixtureDir, `${key}.json`),
        /** Repo-relative path of one fixture, for messages. */
        fixtureDisplay: (key) => fixtureDisplayPath(script, key),
        /** Has this step been recorded? */
        has: (key) => fs.existsSync(api.fixturePath(key)),

        /** No fixture for `key`: report it the one approved way and stop the process. */
        failMissing(key) {
            const error = new MissingFixtureError(script, key, scriptFile);
            missing(error);
            throw error; // reached only when a test injects a non-throwing onMissing
        },

        /** Read the whole envelope (`{ script, key, recordedAt, value }`). */
        readRecord(key) {
            const file = api.fixturePath(key);
            if (!fs.existsSync(file)) api.failMissing(key);

            let envelope;
            try {
                envelope = JSON.parse(fs.readFileSync(file, 'utf8'));
            } catch (cause) {
                err(`Fixture hỏng, không parse được JSON: ${api.fixtureDisplay(key)}`);
                err(`  ${cause.message}`);
                err(`  Xoá file rồi ghi lại: node scripts/${scriptFile} --live`);
                exit(1);
                throw cause;
            }
            if (envelope === null || typeof envelope !== 'object' || !('value' in envelope)) {
                err(`Fixture sai định dạng (thiếu trường "value"): ${api.fixtureDisplay(key)}`);
                err(`  Xoá file rồi ghi lại: node scripts/${scriptFile} --live`);
                exit(1);
            }

            log(
                `  [replay] ${key} ← ${api.fixtureDisplay(key)}` +
                    `${envelope.recordedAt ? ` (ghi lúc ${envelope.recordedAt})` : ''} — không gọi AI`
            );
            return envelope;
        },

        /** Read the recorded value of `key`. Hard-fails when it was never recorded. */
        read(key) {
            return api.readRecord(key).value;
        },

        /** Write a fixture. Only valid in `--live`; in replay it is a programming error. */
        write(key, value, meta = {}) {
            if (!live) throw new Error(`[fixtures] write('${key}') chỉ hợp lệ ở chế độ --live`);
            fs.mkdirSync(fixtureDir, { recursive: true });
            const envelope = { script, key, recordedAt: new Date().toISOString(), ...meta, value };
            fs.writeFileSync(api.fixturePath(key), `${JSON.stringify(envelope, null, 2)}\n`, 'utf8');
            log(`  [live] ghi fixture ${api.fixtureDisplay(key)}`);
            return value;
        },

        /**
         * The single entry point for an AI-producing step.
         * live  -> run `producer()`, record what it resolved with, return it.
         * replay-> return the recording, without calling `producer` at all.
         */
        async run(key, producer, meta = {}) {
            if (!live) return api.read(key);
            if (typeof producer !== 'function') {
                throw new TypeError(`[fixtures] run('${key}') cần một hàm producer`);
            }
            const value = await producer();
            api.write(key, value, meta);
            return value;
        },

        /** The `--live` warning, printed before anything else touches the network. */
        announceLive() {
            if (!live) return;
            log('');
            log('='.repeat(78));
            log('!! CHẾ ĐỘ --live: các bước dưới đây gọi AI THẬT qua 9router — token thật, tốn tiền');
            log('='.repeat(78));
            log(`  script  : scripts/${scriptFile}`);
            log(`  fixture : ${dirLabel}`);
            if (steps.length > 0) {
                log('  Bước gọi AI:');
                steps.forEach((step, index) => {
                    log(`    ${index + 1}. ${String(step.key).padEnd(26)} ${step.note ?? ''}`.trimEnd());
                });
                const credits = steps.filter((step) => step.credit);
                if (credits.length > 0) {
                    log('  Bước TỐN CREDIT:');
                    for (const step of credits) log(`    - ${step.key} → ${step.credit}`);
                }
            } else {
                log('  (script này không khai báo bước AI nào)');
            }
            log('  Login và các GET danh sách/chi tiết vẫn gọi backend thật, nhưng không gọi AI.');
            log('  Chỉ dùng --live khi thật cần thiết.');
            log('');
        },

        /**
         * In replay, verify that every required fixture is on disk BEFORE the script
         * touches the network (login is live even in replay, so without this the
         * missing-fixture error would only show up after a successful login).
         *
         * @returns {string[]} the missing keys (always empty in live mode)
         */
        preflight() {
            if (live) return [];
            const required = steps.filter((step) => step?.key && step.required !== false);
            const missingKeys = required.map((step) => step.key).filter((key) => !api.has(key));
            if (missingKeys.length === 0) return [];

            if (missingKeys.length > 1) {
                err(`Chế độ replay: thiếu ${missingKeys.length} fixture cho ${scriptFile}:`);
                for (const key of missingKeys) err(`  - ${fixtureDisplayPath(script, key)}`);
                err(`  Ghi tất cả bằng: node scripts/${scriptFile} --live`);
            }
            api.failMissing(missingKeys[0]);
            return missingKeys;
        },
    };

    if (live) api.announceLive();
    else api.preflight();

    return api;
}
