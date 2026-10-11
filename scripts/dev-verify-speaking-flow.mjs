/**
 * DEV verification of the Speaking module against the running backend.
 *
 * The microphone cannot be driven from a script, but everything AROUND the recording
 * can be: the topic list, the topic detail (cue card + follow-ups), a submit with a
 * transcript and no audio, and the asynchronous grading. That covers every field the
 * UI maps.
 *
 * Usage:
 *   node scripts/dev-verify-speaking-flow.mjs <email> <password>          # replay (mặc định)
 *   node scripts/dev-verify-speaking-flow.mjs <email> <password> --live   # gọi AI thật + ghi fixture
 *
 * AI steps (fixture): speaking.submit (AI chấm) và speaking.poll (vòng poll chờ GRADED).
 * Live anyway: login, GET /speaking/topics, GET /speaking/topics/{id}, history,
 * highest-scores. The microphone cannot be driven from a script either way.
 *
 * Costs one credit (SPEAKING_START) when run with --live.
 */
import { createFixtures, parseVerificationArgs } from './lib/verifyFixtures.mjs';

const base = process.env.API_URL ?? 'http://localhost:8082/api';
const { live, args } = parseVerificationArgs();
const [email, password] = args;

if (!email || !password) {
    console.error('usage: node scripts/dev-verify-speaking-flow.mjs <email> <password> [--live]');
    process.exit(1);
}

const fx = createFixtures({
    script: 'speaking-flow',
    live,
    steps: [
        { key: 'speaking.submit', note: 'POST /speaking/topics/{id}/submit — AI chấm', credit: 'SPEAKING_START (+ AI)' },
        { key: 'speaking.poll', note: 'GET /speaking/attempts/{id} tới khi GRADED — AI chấm nền' },
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

/* --- 1. topic list ------------------------------------------------------- */
const list = await call('/speaking/topics?page=0&size=10', { token });
console.log(`\nGET /speaking/topics  HTTP ${list.status}`);
if (list.status !== 200) {
    console.error(list.text?.slice(0, 200));
    process.exit(1);
}
const page = list.json.data;
console.log(`  shape    : ${Object.keys(page).join(', ')}`);
console.log(`  items    : ${page.items?.length} of ${page.totalElements}`);
if (!page.items?.length) {
    console.error('no speaking topics exist; cannot verify further');
    process.exit(0);
}
const item = page.items[0];
console.log(`  item keys: ${Object.keys(item).join(', ')}`);
console.log(`  parts    : ${[...new Set(page.items.map((t) => t.part))].join(', ')}`);
console.log(`  first    : [${item.part}] ${String(item.question).slice(0, 90)}`);

/* --- 2. topic detail: cue card + follow-ups ------------------------------ */
const detail = await call(`/speaking/topics/${item.id}`, { token });
console.log(`\nGET /speaking/topics/{id}  HTTP ${detail.status}`);
const topic = detail.json?.data;
if (topic) {
    console.log(`  keys          : ${Object.keys(topic).join(', ')}`);
    console.log(`  part          : ${topic.part}`);
    console.log(`  question      : ${String(topic.question).slice(0, 110)}`);
    console.log(`  cueCard       : ${topic.cueCard ? `"${String(topic.cueCard).slice(0, 130)}"` : 'null'}`);
    console.log(`  cueCard <br>? : ${/<br/i.test(String(topic.cueCard ?? '')) ? 'YES - must convert to text' : 'no'}`);
    console.log(`  followUps     : ${JSON.stringify(topic.followUpQuestions)?.slice(0, 200)}`);
}

/* --- 3. submit with a transcript and NO audio --------------------------- */
/* What the browser produces: Web Speech API transcript plus client-side analytics.
   This is the exact shape the app will send. */
const transcript =
    'I would like to talk about a skill I learned recently, which is cooking. I started learning it about six months ago because I was spending a lot of money eating out. At first I was quite bad at it, and I burned almost everything I tried to make. Then I decided to follow proper recipes instead of guessing, and that changed everything. I think it is a useful skill because it saves money and it is healthier. Also, cooking for friends has become one of my favourite ways to relax. Overall I would say it took me about three months to feel confident, and I am still learning.';

console.log(`\nPOST /speaking/topics/{id}/submit  (transcript ${transcript.split(/\s+/).length} words, no audio)`);
const attempt = await fx.run('speaking.submit', async () => {
    const submitted = await call(`/speaking/topics/${item.id}/submit`, {
        method: 'POST',
        token,
        body: {
            transcript,
            audioUrl: null,
            timeSpentSeconds: 105,
            speechAnalytics: {
                wordCount: transcript.split(/\s+/).length,
                wordsPerMinute: 142.0,
                pauseCount: 4,
                avgPauseDurationMs: 620.0,
                longPauseCount: 1,
                fillerWordCount: 2,
                fillerWords: ['um', 'like'],
            },
        },
    });
    console.log(`  HTTP ${submitted.status}`);
    if (submitted.status !== 200 && submitted.status !== 202) {
        console.error(`  ${submitted.text?.slice(0, 320)}`);
        process.exit(1);
    }
    return submitted.json.data;
});
console.log(`  keys       : ${Object.keys(attempt).join(', ')}`);
console.log(`  attemptId  : ${attempt.id}`);
console.log(`  status     : ${attempt.status}`);
console.log(`  band now   : ${attempt.overallBandScore}`);
console.log(`  analytics  : ${attempt.speechAnalytics ? Object.keys(attempt.speechAnalytics).join(', ') : 'null'}`);

/* --- 4. poll until GRADED ---------------------------------------------- */
/**
 * One fixture step for the whole poll: replay returns the recorded status sequence and
 * the final GRADED attempt, without waiting on the background grader.
 */
const grading = await fx.run('speaking.poll', async () => {
    const startedAt = Date.now();
    const seen = [attempt.status];
    const polls = [];
    let current = attempt;
    for (let i = 0; i < 30; i += 1) {
        if (current.status === 'GRADED' || current.status === 'FAILED') break;
        await new Promise((r) => setTimeout(r, 3000));
        const poll = await call(`/speaking/attempts/${current.id}`, { token });
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
console.log(`\n--- graded ---`);
console.log(`  status sequence : ${grading.statusSequence.join(' -> ')}`);
console.log(`  time to grade   : ${grading.timeToGradeSeconds}s${fx.isReplay ? ' (ghi lại từ lần --live)' : ''}`);
console.log(`  band            : ${graded.overallBandScore}`);
console.log(
    `  criteria        : FLU=${graded.fluencyScore} LEX=${graded.lexicalScore} GRA=${graded.grammarScore} PRO=${graded.pronunciationScore}`
);
const feedback = String(graded.aiFeedback ?? '');
console.log(`  aiFeedback      : ${feedback.length} chars`);
if (feedback) console.log(`  feedback head   : ${feedback.slice(0, 190).replace(/\n/g, ' / ')}`);
console.log(`  is markdown?    : ${/^#|\*\*|^- /m.test(feedback) ? 'YES' : 'plain'}`);
/* The graded attempt carries the full analytics incl. wordDetails, the submit response
   only the summary — same split the original script relied on. */
const analytics = graded.speechAnalytics;
if (analytics) {
    console.log(`  analytics keys  : ${Object.keys(analytics).join(', ')}`);
    console.log(`  wpm             : ${analytics.wordsPerMinute}`);
    console.log(`  fillers         : ${JSON.stringify(analytics.fillerWords)}`);
    console.log(`  wordDetails     : ${analytics.wordDetails?.length ?? 'absent'} entries`);
}

/* --- 5. history + highest scores --------------------------------------- */
const attempts = await call('/speaking/attempts?page=0&size=5', { token });
console.log(`\nGET /speaking/attempts  HTTP ${attempts.status}`);
if (attempts.status === 200) {
    const a = attempts.json.data;
    console.log(`  items   : ${a.items?.length} of ${a.totalElements}`);
    if (a.items?.[0]) console.log(`  item keys: ${Object.keys(a.items[0]).join(', ')}`);
}
const scores = await call('/speaking/topics/highest-scores', {
    method: 'POST',
    token,
    body: { topicIds: [item.id] },
});
console.log(`\nPOST /speaking/topics/highest-scores  HTTP ${scores.status}`);
if (scores.status === 200) {
    console.log(`  ${JSON.stringify(scores.json.data)?.slice(0, 240)}`);
}
