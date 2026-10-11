/**
 * DEV verification of the Writing module against the running backend.
 *
 * Mirrors what src/features/writing/useWriting.js will do:
 *   list tasks -> read a task -> submit an essay -> poll until GRADED -> reopen.
 *
 * The grading is ASYNCHRONOUS, so the important things to confirm are the status
 * values, the shape of a graded submission, and how long grading actually takes (the
 * UI promises the user a wait, so that wait has to be real).
 *
 * Usage:
 *   node scripts/dev-verify-writing-flow.mjs <email> <password>           # replay (mặc định)
 *   node scripts/dev-verify-writing-flow.mjs <email> <password> --live    # gọi AI thật + ghi fixture
 *
 * AI steps (fixture): writing.submit (AI chấm bài) và writing.poll (vòng poll chờ GRADED).
 * Live anyway: login, GET /writing/tasks, GET /writing/tasks/{id}, history, highest-scores.
 *
 * Costs one credit (WRITING_START) when run with --live.
 */
import { createFixtures, parseVerificationArgs } from './lib/verifyFixtures.mjs';

const base = process.env.API_URL ?? 'http://localhost:8082/api';
const { live, args } = parseVerificationArgs();
const [email, password] = args;

if (!email || !password) {
    console.error('usage: node scripts/dev-verify-writing-flow.mjs <email> <password> [--live]');
    process.exit(1);
}

const fx = createFixtures({
    script: 'writing-flow',
    live,
    steps: [
        { key: 'writing.submit', note: 'POST /writing/tasks/{id}/submit — AI chấm essay', credit: 'WRITING_START (+ AI)' },
        { key: 'writing.poll', note: 'GET /writing/submissions/{id} tới khi GRADED — AI chấm nền' },
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

const login = await call('/auth/login', { method: 'POST', body: { email, password } });
if (login.status !== 200) {
    console.error(`login failed: HTTP ${login.status}`);
    process.exit(1);
}
const token = login.json.data.accessToken;
console.log('login ok (live)');

/* --- 1. task list -------------------------------------------------------- */
const list = await call('/writing/tasks?page=0&size=10', { token });
console.log(`\nGET /writing/tasks  HTTP ${list.status}`);
if (list.status !== 200) {
    console.error(list.text?.slice(0, 200));
    process.exit(1);
}
const page = list.json.data;
console.log(`  shape      : ${Object.keys(page).join(', ')}`);
console.log(`  items      : ${page.items?.length} of ${page.totalElements}`);
if (!page.items?.length) {
    console.error('no writing tasks exist; cannot verify the flow');
    process.exit(0);
}
const item = page.items[0];
console.log(`  item keys  : ${Object.keys(item).join(', ')}`);
console.log(`  taskTypes  : ${[...new Set(page.items.map((t) => t.taskType))].join(', ')}`);
console.log(`  first task : ${item.title} [${item.taskType}] min${item.minWords} max${item.maxWords} ${item.timeLimitMinutes}min`);

/* --- 2. task detail ----------------------------------------------------- */
const detail = await call(`/writing/tasks/${item.id}`, { token });
console.log(`\nGET /writing/tasks/{id}  HTTP ${detail.status}`);
const task = detail.json?.data;
if (task) {
    console.log(`  keys       : ${Object.keys(task).join(', ')}`);
    console.log(`  title      : ${task.title}`);
    console.log(`  instruction: ${String(task.instruction ?? '').slice(0, 110)}`);
    console.log(`  content    : ${String(task.content ?? '').slice(0, 110)}`);
    console.log(`  imageUrls  : ${JSON.stringify(task.imageUrls)}`);
}

/* --- 3. submit an essay ------------------------------------------------- */
const essay = [
    'Some people believe that governments should invest heavily in public transport, while others argue that building more roads is the better use of public money. This essay will discuss both views before explaining why I favour investment in public transport.',
    'On the one hand, building new roads can reduce congestion in the short term. When a new motorway opens, journey times often fall for drivers who previously queued for long periods. However, this benefit tends to be temporary, because additional road capacity encourages more people to drive, and the congestion returns within a few years.',
    'On the other hand, public transport moves far more people per unit of investment. A single metro line can carry the passengers of several motorway lanes, and it does so without adding to air pollution. Furthermore, reliable buses and trains give people on lower incomes access to jobs that would otherwise be out of reach.',
    'In conclusion, although new roads offer a quick and visible improvement, the evidence suggests that public transport delivers better long-term value for the same money, and governments should therefore prioritise it.',
].join('\n\n');

console.log(`\nPOST /writing/tasks/{id}/submit  (${essay.split(/\s+/).length} words)`);
const submission = await fx.run('writing.submit', async () => {
    const submitted = await call(`/writing/tasks/${item.id}/submit`, {
        method: 'POST',
        token,
        body: { essayContent: essay, timeSpentSeconds: 900 },
    });
    console.log(`  HTTP ${submitted.status}`);
    if (submitted.status !== 200 && submitted.status !== 202) {
        console.error(`  ${submitted.text?.slice(0, 300)}`);
        process.exit(1);
    }
    return submitted.json.data;
});
console.log(`  keys       : ${Object.keys(submission).join(', ')}`);
console.log(`  submission : ${submission.id}`);
console.log(`  status     : ${submission.status}`);
console.log(`  wordCount  : ${submission.wordCount}`);
console.log(`  band now   : ${submission.overallBandScore}`);

/* --- 4. poll until GRADED ---------------------------------------------- */
/**
 * The poll is wrapped as one fixture step: replay hands back the recorded poll
 * sequence and the FINAL graded submission without waiting 90s and without touching
 * the endpoint the grader writes to.
 */
const grading = await fx.run('writing.poll', async () => {
    const startedAt = Date.now();
    const seen = [submission.status];
    const polls = [];
    let current = submission;
    for (let i = 0; i < 30; i += 1) {
        if (current.status === 'GRADED' || current.status === 'FAILED') break;
        await new Promise((r) => setTimeout(r, 3000));
        const poll = await call(`/writing/submissions/${current.id}`, { token });
        if (poll.status !== 200) {
            polls.push({ attempt: i + 1, elapsedSeconds: Math.round((Date.now() - startedAt) / 1000), status: `HTTP ${poll.status}` });
            continue;
        }
        current = poll.json.data;
        if (seen[seen.length - 1] !== current.status) seen.push(current.status);
        polls.push({
            attempt: i + 1,
            elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
            status: current.status,
            band: current.overallBandScore ?? null,
        });
    }
    return {
        statusSequence: seen,
        timeToGradeSeconds: Math.round((Date.now() - startedAt) / 1000),
        polls,
        final: current,
    };
});

for (const poll of grading.polls) {
    console.log(`  poll ${poll.attempt} (${poll.elapsedSeconds}s): status=${poll.status} band=${poll.band ?? '—'}`);
}

const graded = grading.final;
const elapsed = grading.timeToGradeSeconds;
console.log(`\n--- graded ---`);
console.log(`  status sequence : ${grading.statusSequence.join(' -> ')}`);
console.log(`  time to grade   : ${elapsed}s${fx.isReplay ? ' (ghi lại từ lần --live)' : ''}`);
console.log(`  wordCount       : ${graded.wordCount}`);
console.log(`  band            : ${graded.overallBandScore}`);
console.log(`  criteria        : TR=${graded.taskResponseScore} COH=${graded.coherenceScore} LR=${graded.lexicalResourceScore} GRA=${graded.grammarScore}`);
console.log(`  gradedAt        : ${graded.gradedAt}`);
const feedback = String(graded.aiFeedback ?? '');
console.log(`  aiFeedback      : ${feedback.length} chars`);
if (feedback) {
    console.log(`  feedback head   : ${feedback.slice(0, 200).replace(/\n/g, ' / ')}`);
    console.log(`  is markdown?    : ${/^#|\*\*|^- |\d\. /m.test(feedback) ? 'YES' : 'plain text'}`);
}

/* --- 5. history --------------------------------------------------------- */
const subs = await call('/writing/submissions?page=0&size=5', { token });
console.log(`\nGET /writing/submissions  HTTP ${subs.status}`);
if (subs.status === 200) {
    const s = subs.json.data;
    console.log(`  items         : ${s.items?.length} of ${s.totalElements}`);
    if (s.items?.[0]) console.log(`  item keys     : ${Object.keys(s.items[0]).join(', ')}`);
    console.log(`  statuses seen : ${[...new Set((s.items ?? []).map((x) => x.status))].join(', ')}`);
}

const scores = await call('/writing/tasks/highest-scores', {
    method: 'POST',
    token,
    body: { taskIds: [item.id] },
});
console.log(`\nPOST /writing/tasks/highest-scores  HTTP ${scores.status}`);
if (scores.status === 200) {
    console.log(`  ${JSON.stringify(scores.json.data).slice(0, 220)}`);
}
