/**
 * One-off verification of the IELTS session contract against the running backend.
 *
 * It mirrors exactly what `src/features/ielts/useIeltsSession.js` does:
 *   start a session -> flatten sections/passages/questions -> submit every
 *   question -> read the attempt back from the result endpoint.
 *
 * Usage:
 *   node scripts/dev-verify-ielts-flow.mjs <email> <password>            # replay (mặc định)
 *   node scripts/dev-verify-ielts-flow.mjs <email> <password> --live     # gọi AI thật + ghi fixture
 *
 * AI steps (fixture): ielts.start, ielts.submit (chấm điểm).
 * Live anyway: login, GET /ielts/tests, GET /ielts/attempts/{id} — JWT hết hạn và id
 * của một lần chạy cũ không dùng lại được.
 *
 * Starting an attempt consumes one credit (IELTS session start).
 */
import { createFixtures, parseVerificationArgs } from './lib/verifyFixtures.mjs';

const base = process.env.API_URL ?? 'http://localhost:8082/api';
const { live, args } = parseVerificationArgs();
const [email, password] = args;

if (!email || !password) {
    console.error('usage: node scripts/dev-verify-ielts-flow.mjs <email> <password> [--live]');
    process.exit(1);
}

const fx = createFixtures({
    script: 'ielts-flow',
    live,
    steps: [
        {
            key: 'ielts.start',
            note: 'POST /ielts/sessions/start — sinh đề + chấm (AI)',
            credit: 'ielts session start (1 credit)',
        },
        { key: 'ielts.submit', note: 'POST /ielts/sessions/{id}/submit — AI chấm điểm', credit: 'ielts submit (AI)' },
    ],
});

async function call(path, { method = 'GET', token, body } = {}) {
    const res = await fetch(`${base}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Accept-Language': 'vi',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try {
        json = text ? JSON.parse(text) : null;
    } catch {
        /* leave null */
    }
    return { status: res.status, json, text };
}

/* --- the same flatten the app does, so the counts must agree --- */
function flatten(testDetail) {
    const rows = [];
    for (const section of [...(testDetail?.sections ?? [])].sort((a, b) => a.sectionOrder - b.sectionOrder)) {
        for (const passage of [...(section?.passages ?? [])].sort((a, b) => a.passageOrder - b.passageOrder)) {
            for (const q of [...(passage?.questions ?? [])].sort((a, b) => a.questionOrder - b.questionOrder)) {
                rows.push({ ...q, passageTitle: passage.title, audioUrl: section.audioUrl ?? null });
            }
        }
    }
    return rows;
}

const login = await call('/auth/login', { method: 'POST', body: { email, password } });
if (login.status !== 200) {
    console.error(`login failed: HTTP ${login.status}`);
    process.exit(1);
}
const token = login.json.data.accessToken;
console.log('login ok (live)');

const tests = await call('/ielts/tests?page=0&size=50', { token });
const test = tests.json.data.items.find((t) => t.skill === 'LISTENING') ?? tests.json.data.items[0];
console.log(`test: ${test.title} [${test.skill}]`);

const session = await fx.run('ielts.start', async () => {
    const started = await call('/ielts/sessions/start', {
        method: 'POST',
        token,
        body: { testId: test.id, attemptMode: 'FULL', scopeType: 'TEST' },
    });
    if (started.status !== 200) {
        console.error(`start failed: HTTP ${started.status} ${started.text?.slice(0, 160)}`);
        process.exit(1);
    }
    return started.json.data;
});
const questions = flatten(session.testDetail);

console.log(`\nstarted session ${session.attemptId}`);
console.log(`  server totalQuestions : ${session.totalQuestions}`);
console.log(`  flattenQuestions mine : ${questions.length}`);
console.log(`  MATCH                 : ${session.totalQuestions === questions.length ? 'YES' : 'NO — mapping is wrong'}`);

const optioned = questions.filter((q) => (q.options ?? []).length > 0).length;
const typed = questions.filter((q) => (q.options ?? []).length === 0).length;
console.log(`  option questions      : ${optioned}`);
console.log(`  typed/completion      : ${typed}`);
console.log(`  question types        : ${[...new Set(questions.map((q) => q.questionType))].join(', ')}`);
const withAudio = questions.filter((q) => q.audioUrl).length;
console.log(`  questions with audio  : ${withAudio}`);

/* Deliberately answer the FIRST option of optioned questions and a wrong word for
   the typed ones, so the result exercises both a hit and a miss. */
const answers = questions.map((q) => {
    const opts = q.options ?? [];
    return { questionId: q.id, userAnswer: [opts.length > 0 ? opts[0] : 'zzz-wrong'] };
});

const scored = await fx.run('ielts.submit', async () => {
    const submitted = await call(`/ielts/sessions/${session.attemptId}/submit`, {
        method: 'POST',
        token,
        body: { attemptId: session.attemptId, answers, timeSpentSeconds: 1200 },
    });
    if (submitted.status !== 200) {
        console.error(`submit failed: HTTP ${submitted.status} ${submitted.text?.slice(0, 200)}`);
        process.exit(1);
    }
    return submitted.json.data;
});
console.log(`\nsubmitted`);
console.log(`  correctCount      : ${scored.correctCount} / ${scored.totalQuestions}`);
console.log(`  accuracyPercent   : ${scored.accuracyPercent}`);
console.log(`  bandScore         : ${scored.bandScore}`);
console.log(`  results           : ${scored.results?.length}`);
const r0 = scored.results?.[0];
if (r0) {
    console.log(`  result[0] keys    : ${Object.keys(r0).join(', ')}`);
    console.log(`  result[0] correct : ${JSON.stringify(r0.correctAnswer)}`);
    console.log(`  result[0] user    : ${JSON.stringify(r0.userAnswer)}`);
    console.log(`  result[0] hasExpl : ${r0.explanation != null}`);
}
const anyTrue = scored.results?.some((r) => r.isCorrect);
console.log(`  at least one hit  : ${anyTrue}`);

/* The result page re-reads the attempt rather than trusting navigation state.
   Non-AI read, so it stays live in both modes. In replay the id comes from the
   recording, so a 404 here just means the backend state moved on — not a failure of
   the replay. */
const reread = await call(`/ielts/attempts/${session.attemptId}`, { token });
console.log(`\nGET /ielts/attempts/{id}  HTTP ${reread.status}`);
if (reread.status !== 200 && fx.isReplay) {
    console.log(`  [replay] attempt từ fixture không còn trên backend — bỏ qua bước đọc này`);
}
if (reread.status === 200) {
    const d = reread.json.data;
    console.log(`  bandScore      : ${d.bandScore}`);
    console.log(`  correctCount   : ${d.correctCount}`);
    console.log(`  results        : ${d.results?.length}`);
    console.log(`  testDetail     : ${d.testDetail ? 'present' : 'MISSING'}`);
    console.log(`  reopenable     : ${d.bandScore != null && (d.results?.length ?? 0) > 0 ? 'YES' : 'NO'}`);
}
