/**
 * Tests for the fixture record/replay helper.
 *
 * These run with `node --test scripts/lib/verifyFixtures.test.mjs` and touch nothing
 * but a temporary directory: no backend, no socket, no AI. The producers are fakes, so
 * a regression that secretly called the network would show up as an unresolved fetch
 * instead of a silent pass.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
    FIXTURE_ROOT,
    MissingFixtureError,
    createFixtures,
    fixtureDisplayPath,
    missingFixtureMessage,
    parseVerificationArgs,
} from './verifyFixtures.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF_URL = pathToFileURL(path.join(HERE, 'verifyFixtures.mjs')).href;

/** Swallow the helper's progress chatter so the test output stays readable. */
const silent = { log() {}, error() {} };

let tempSeq = 0;
function tempRoot() {
    tempSeq += 1;
    return fs.mkdtempSync(path.join(os.tmpdir(), `verify-fixtures-${tempSeq}-`));
}

/** Build a store that throws instead of killing the test runner. */
function store(root, live, options = {}) {
    return createFixtures({
        script: 'demo-flow',
        live,
        root,
        logger: silent,
        onMissing: (error) => {
            throw error;
        },
        exit: (code) => {
            throw new Error(`[exit ${code}]`);
        },
        ...options,
    });
}

/** A replay store whose "missing fixture" handler throws instead of exiting. */
function replayStore(root, options = {}) {
    return store(root, false, options);
}

function liveStore(root, options = {}) {
    return store(root, true, options);
}

test('parseVerificationArgs: tách --live khỏi tham số vị trí, không phụ thuộc thứ tự', () => {
    assert.deepEqual(parseVerificationArgs(['--live', 'a@b.c', 'pw']), { live: true, args: ['a@b.c', 'pw'] });
    assert.deepEqual(parseVerificationArgs(['a@b.c', 'pw', '--live']), { live: true, args: ['a@b.c', 'pw'] });
    assert.deepEqual(parseVerificationArgs(['a@b.c', 'pw']), { live: false, args: ['a@b.c', 'pw'] });
    assert.deepEqual(parseVerificationArgs(['a@b.c', 'pw', 'mitigate']), { live: false, args: ['a@b.c', 'pw', 'mitigate'] });
    assert.deepEqual(parseVerificationArgs([]), { live: false, args: [] });
});

test('missingFixtureMessage: đúng định dạng lỗi đã chốt trong thiết kế', () => {
    assert.equal(
        missingFixtureMessage('ielts-flow', 'ielts.start'),
        'Thiếu fixture scripts/fixtures/ielts-flow/ielts.start.json — chạy: node scripts/dev-verify-ielts-flow.mjs --live'
    );
    assert.equal(fixtureDisplayPath('explain-stream', 'explain.stream'), 'scripts/fixtures/explain-stream/explain.stream.json');
});

test('replay: đọc fixture đã ghi, KHÔNG gọi producer', async (t) => {
    const root = tempRoot();
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const payload = { attemptId: 'attempt-1', totalQuestions: 3, nested: { options: ['a', 'b'] } };
    const recorder = liveStore(root);
    const recorded = await recorder.run('demo.step', async () => payload);
    assert.deepEqual(recorded, payload);

    const replayer = replayStore(root);
    let producerCalls = 0;
    const replayed = await replayer.run('demo.step', async () => {
        producerCalls += 1;
        throw new Error('replay không được gọi producer');
    });

    assert.equal(producerCalls, 0);
    assert.deepEqual(replayed, payload);
    assert.equal(replayer.isReplay, true);
    assert.equal(replayer.mode, 'replay');
});

test('record: ghi file đúng vị trí kèm metadata, và replay đọc lại đúng giá trị', async (t) => {
    const root = tempRoot();
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const recorder = liveStore(root);
    await recorder.run('demo.submit', async () => ({ band: 6.5 }), { note: 'ghi chú' });

    const file = path.join(root, 'demo-flow', 'demo.submit.json');
    assert.equal(recorder.fixturePath('demo.submit'), file);
    assert.equal(fs.existsSync(file), true);
    assert.equal(recorder.has('demo.submit'), true);

    const envelope = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(envelope.script, 'demo-flow');
    assert.equal(envelope.key, 'demo.submit');
    assert.equal(envelope.note, 'ghi chú');
    assert.equal(typeof envelope.recordedAt, 'string');
    assert.deepEqual(envelope.value, { band: 6.5 });

    // A fresh store over the same directory replays the same value.
    assert.deepEqual(await replayStore(root).run('demo.submit', null), { band: 6.5 });
});

test('replay: thiếu fixture thì báo lỗi rõ ràng và không chạy producer', async (t) => {
    const root = tempRoot();
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const fx = replayStore(root);
    let producerCalls = 0;
    await assert.rejects(
        () =>
            fx.run('demo.step', async () => {
                producerCalls += 1;
                return 1;
            }),
        (error) => {
            assert.ok(error instanceof MissingFixtureError);
            assert.equal(error.code, 'MISSING_FIXTURE');
            assert.equal(error.key, 'demo.step');
            assert.equal(
                error.message,
                'Thiếu fixture scripts/fixtures/demo-flow/demo.step.json — chạy: node scripts/dev-verify-demo-flow.mjs --live'
            );
            return true;
        }
    );
    assert.equal(producerCalls, 0);
});

test('replay: preflight chặn TRƯỚC khi script chạm mạng (login vẫn live)', (t) => {
    const root = tempRoot();
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const lines = [];
    const logger = { log: (line) => lines.push(String(line)), error: (line) => lines.push(String(line)) };

    assert.throws(
        () =>
            createFixtures({
                script: 'demo-flow',
                live: false,
                root,
                logger,
                steps: [{ key: 'demo.a' }, { key: 'demo.b' }],
                onMissing: (error) => {
                    throw error;
                },
            }),
        /Thiếu fixture scripts\/fixtures\/demo-flow\/demo\.a\.json/
    );
    // Both missing fixtures are listed, plus the exact record command.
    const text = lines.join('\n');
    assert.match(text, /thiếu 2 fixture/);
    assert.match(text, /scripts\/fixtures\/demo-flow\/demo\.a\.json/);
    assert.match(text, /scripts\/fixtures\/demo-flow\/demo\.b\.json/);
    assert.match(text, /node scripts\/dev-verify-demo-flow\.mjs --live/);
});

test('replay: preflight bỏ qua bước required:false và cho qua khi fixture đã có', async (t) => {
    const root = tempRoot();
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const steps = [{ key: 'demo.a' }, { key: 'demo.b', required: false }];
    await liveStore(root).run('demo.a', async () => ({ ok: true }));

    const fx = replayStore(root, { steps });
    assert.deepEqual(fx.preflight(), []);
    assert.deepEqual(await fx.run('demo.a', null), { ok: true });

    // demo.b was never recorded, so reaching it is still a hard failure — not a live call.
    assert.throws(() => fx.read('demo.b'), /Thiếu fixture scripts\/fixtures\/demo-flow\/demo\.b\.json/);
});

test('live: fixture cũ bị ghi đè, preflight không chặn', async (t) => {
    const root = tempRoot();
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const first = liveStore(root);
    await first.run('demo.step', async () => ({ run: 1 }));
    const second = liveStore(root, { steps: [{ key: 'demo.step' }] });
    assert.deepEqual(second.preflight(), []);
    assert.deepEqual(await second.run('demo.step', async () => ({ run: 2 })), { run: 2 });
    assert.deepEqual(await replayStore(root).run('demo.step', null), { run: 2 });
});

test('write() ở chế độ replay là lỗi lập trình, không âm thầm ghi', (t) => {
    const root = tempRoot();
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const fx = replayStore(root);
    assert.throws(() => fx.write('demo.step', { a: 1 }), /chỉ hợp lệ ở chế độ --live/);
    assert.equal(fs.existsSync(path.join(root, 'demo-flow', 'demo.step.json')), false);
});

test('fixture hỏng (JSON sai) cũng fail sạch thay vì replay rác', (t) => {
    const root = tempRoot();
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    const lines = [];
    const build = () =>
        store(root, false, {
            logger: { log: (line) => lines.push(String(line)), error: (line) => lines.push(String(line)) },
        });

    const file = path.join(root, 'demo-flow', 'demo.step.json');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '{ not json', 'utf8');

    assert.throws(() => build().read('demo.step'), /\[exit 1\]/);
    assert.match(lines.join('\n'), /Fixture hỏng/);
    assert.match(lines.join('\n'), /node scripts\/dev-verify-demo-flow\.mjs --live/);

    lines.length = 0;
    fs.writeFileSync(file, JSON.stringify({ script: 'demo-flow', key: 'demo.step' }), 'utf8');
    assert.throws(() => build().read('demo.step'), /\[exit 1\]/);
    assert.match(lines.join('\n'), /thiếu trường "value"/);
});

test('announceLive: liệt kê bước gọi AI và bước tốn credit', () => {
    const lines = [];
    const logger = { log: (line) => lines.push(String(line)), error: (line) => lines.push(String(line)) };
    /* No `root` on purpose: announceLive only prints, and this exercises the real
       repo-relative fixture label. */
    createFixtures({
        script: 'explain-stream',
        live: true,
        logger,
        steps: [{ key: 'explain.stream', note: 'STOMP /app/vocabulary/explain', credit: 'AI_EXPLAIN' }],
    });

    const text = lines.join('\n');
    assert.match(text, /CHẾ ĐỘ --live/);
    assert.match(text, /9router/);
    assert.match(text, /explain\.stream/);
    assert.match(text, /Bước TỐN CREDIT/);
    assert.match(text, /AI_EXPLAIN/);
    assert.match(text, /scripts\/dev-verify-explain-stream\.mjs/);
    assert.match(text, /scripts\/fixtures\/explain-stream\//);
});

test('FIXTURE_ROOT trỏ vào scripts/fixtures của repo', () => {
    assert.equal(FIXTURE_ROOT, path.resolve(HERE, '..', 'fixtures'));
});

test('CLI thật: thiếu fixture thì exit 1, in đúng thông báo, không chạy tiếp', (t) => {
    const dir = tempRoot();
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

    const entry = path.join(dir, 'entry.mjs');
    fs.writeFileSync(
        entry,
        [
            `import { createFixtures } from ${JSON.stringify(SELF_URL)};`,
            'const fx = createFixtures({',
            "    script: 'demo-flow',",
            '    live: false,',
            `    root: ${JSON.stringify(path.join(dir, 'fixtures'))},`,
            "    steps: [{ key: 'demo.step' }],",
            '});',
            "console.log('đã chạm tới phần thân script — sai, phải fail trước đó');",
            "void fx;",
            '',
        ].join('\n'),
        'utf8'
    );

    const result = spawnSync(process.execPath, [entry], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(
        result.stderr,
        /Thiếu fixture scripts\/fixtures\/demo-flow\/demo\.step\.json — chạy: node scripts\/dev-verify-demo-flow\.mjs --live/
    );
    assert.equal(result.stdout.includes('đã chạm tới phần thân script'), false);
});
