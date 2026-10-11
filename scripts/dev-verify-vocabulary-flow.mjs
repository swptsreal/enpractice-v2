/**
 * DEV verification of the vocabulary module contract against the running backend.
 *
 * Mirrors what src/features/vocabulary/useVocabularyTest.js does:
 *   list -> generate -> poll until READY -> start -> answer -> submit -> reopen.
 *
 * Usage:
 *   node scripts/dev-verify-vocabulary-flow.mjs <email> <password>          # replay (mặc định)
 *   node scripts/dev-verify-vocabulary-flow.mjs <email> <password> --live   # gọi AI thật + ghi fixture
 *
 * AI steps (fixture): vocabulary.generate (AI sinh câu hỏi), vocabulary.pollReady (vòng
 * poll chờ READY), vocabulary.start, vocabulary.submit.
 * Live anyway: login, GET /vocabulary-tests, POST /dictionary (seed), history, reopen —
 * đều không gọi AI.
 *
 * Costs one credit (VOCABULARY_TEST_GENERATE) when run with --live.
 */
import { createFixtures, parseVerificationArgs } from './lib/verifyFixtures.mjs';

const base = process.env.API_URL ?? 'http://localhost:8082/api';
const { live, args } = parseVerificationArgs();
const [email, password] = args;

if (!email || !password) {
    console.error('usage: node scripts/dev-verify-vocabulary-flow.mjs <email> <password> [--live]');
    process.exit(1);
}

const fx = createFixtures({
    script: 'vocabulary-flow',
    live,
    steps: [
        {
            key: 'vocabulary.generate',
            note: 'POST /vocabulary-tests/generate — AI sinh câu hỏi từ vựng',
            credit: 'VOCABULARY_TEST_GENERATE',
        },
        { key: 'vocabulary.pollReady', note: 'GET /vocabulary-tests tới khi READY — AI sinh nền' },
        /* start/submit only run when the generated test actually reaches READY, so a
           recording that stopped early is still a valid recording. */
        { key: 'vocabulary.start', note: 'POST /vocabulary-tests/{id}/start', required: false },
        { key: 'vocabulary.submit', note: 'POST /vocabulary-tests/attempts/{id}/submit', required: false },
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

/* --- 1. list -------------------------------------------------------------- */
const list = await call('/vocabulary-tests?page=0&size=10', { token });
console.log(`\nGET /vocabulary-tests  HTTP ${list.status}`);
if (list.status !== 200) {
    console.error(list.text?.slice(0, 200));
    process.exit(1);
}
const page = list.json.data;
console.log(`  page shape keys : ${Object.keys(page).join(', ')}`);
console.log(`  items           : ${page.items?.length} of ${page.totalElements}`);
if (page.items?.length) {
    const it = page.items[0];
    console.log(`  item keys       : ${Object.keys(it).join(', ')}`);
    console.log(`  statuses seen   : ${[...new Set(page.items.map((i) => i.status))].join(', ')}`);
}

/* --- 1b. seed dictionary words ------------------------------------------- */
/**
 * A brand-new account cannot generate a test: the backend answers 400 "Not enough
 * vocabulary data" because it builds questions from the user's vocabulary records,
 * notebook and lookup events, and a fresh account has none.
 *
 * That is a real product state, not a bug, and the app renders it as an empty state
 * pointing at the notebook. To exercise the REST of the flow this script has to put
 * some words in first, which is exactly what a new user would do.
 */
const SEED_WORDS = [
    { word: 'mitigate', ipa: '/ˈmɪtɪɡeɪt/', wordType: 'verb', meaning: 'làm giảm bớt mức độ nghiêm trọng' },
    { word: 'prevalent', ipa: '/ˈprevələnt/', wordType: 'adjective', meaning: 'phổ biến, thịnh hành' },
    { word: 'sustainable', ipa: '/səˈsteɪnəbl/', wordType: 'adjective', meaning: 'bền vững' },
    { word: 'allocate', ipa: '/ˈæləkeɪt/', wordType: 'verb', meaning: 'phân bổ' },
    { word: 'compulsory', ipa: '/kəmˈpʌlsəri/', wordType: 'adjective', meaning: 'bắt buộc' },
    { word: 'incentive', ipa: '/ɪnˈsentɪv/', wordType: 'noun', meaning: 'động lực, khuyến khích' },
    { word: 'literacy', ipa: '/ˈlɪtərəsi/', wordType: 'noun', meaning: 'khả năng đọc viết' },
    { word: 'urbanisation', ipa: '/ˌɜːbənaɪˈzeɪʃn/', wordType: 'noun', meaning: 'đô thị hoá' },
];

let seeded = 0;
for (const entry of SEED_WORDS) {
    const r = await call('/dictionary', {
        method: 'POST',
        token,
        body: { ...entry, sourceType: 'MANUAL', tags: ['dev-verify'] },
    });
    if (r.status === 200 || r.status === 201) seeded += 1;
    else if (seeded === 0) console.log(`  seed failed (${r.status}): ${r.text?.slice(0, 160)}`);
}
console.log(`\nseeded dictionary words: ${seeded}/${SEED_WORDS.length}`);
if (seeded === 0) {
    console.log('  could not seed; the generation step will report "not enough data"');
}

/* --- 2. generate --------------------------------------------------------- */
/**
 * Source values are a closed enum (VocabularyTestSourceType):
 *   VOCABULARY_RECORD, USER_DICTIONARY, USER_WORD_LOOKUP_EVENT, ALL
 *
 * An empty list is the documented default and resolves to ALL, which is why the
 * app sends `sources: []` rather than inventing a value. There is NO endpoint that
 * lists them — an earlier version of this script called
 * GET /vocabulary-tests/sources, which does not exist and answers 500.
 */
const gen = await fx.run('vocabulary.generate', async () => {
    const res = await call('/vocabulary-tests/generate', {
        method: 'POST',
        token,
        body: {
            clientRequestId: `dev-verify-${Date.now()}`,
            questionCount: 5,
            sources: [],
            sourceSurface: 'VOCABULARY_TEST',
        },
    });
    console.log(`\nPOST /vocabulary-tests/generate  HTTP ${res.status}`);
    if (res.status !== 200 && res.status !== 201 && res.status !== 202) {
        console.error(`  ${res.text?.slice(0, 300)}`);
        process.exit(1);
    }
    return res.json.data;
});
console.log(`  keys            : ${Object.keys(gen).join(', ')}`);
console.log(`  testId          : ${gen.testId}`);
console.log(`  status          : ${gen.status}`);
console.log(`  message         : ${gen.message}`);

/* --- 4. poll until it is ready ------------------------------------------
 *
 * Poll the LIST, not a detail endpoint: VocabularyTestController has no
 * `GET /vocabulary-tests/{id}`. Its routes are
 *   POST /generate, GET (list), POST /{id}/start, POST /attempts/{id}/submit,
 *   GET /attempts, GET /attempts/{attemptId}
 * An earlier version of this script polled the detail path and got 12 consecutive
 * 500s ("No static resource") because the route does not exist.
 *
 * The list item carries `status`, which is what the app polls too.
 */
const ready = await fx.run('vocabulary.pollReady', async () => {
    const polls = [];
    let found = null;
    for (let i = 0; i < 14; i += 1) {
        await new Promise((r) => setTimeout(r, 2500));
        const l = await call('/vocabulary-tests?page=0&size=20', { token });
        if (l.status !== 200) {
            polls.push({ attempt: i + 1, status: `HTTP ${l.status}` });
            continue;
        }
        found = l.json.data.items.find((it) => it.testId === gen.testId) ?? null;
        polls.push({
            attempt: i + 1,
            status: found?.status ?? null,
            questions: found?.questionCount ?? null,
            title: found?.title ?? null,
        });
        if (found && String(found.status).toUpperCase() !== 'PENDING') break;
    }
    if (!found) {
        console.error('the generated test never appeared in the list');
        process.exit(1);
    }
    return { polls, listItem: found };
});

for (const poll of ready.polls) {
    console.log(
        `  poll ${poll.attempt}: status=${poll.status} questions=${poll.questions ?? '—'} title=${poll.title ?? '—'}`
    );
}

const listItem = ready.listItem;
console.log(`\nlist item for the new test`);
console.log(`  status          : ${listItem.status}`);
console.log(`  title           : ${listItem.title}`);
console.log(`  questionCount   : ${listItem.questionCount}  estimatedMinutes: ${listItem.estimatedMinutes}`);
console.log(`  selectedSources : ${JSON.stringify(listItem.selectedSources)}`);
console.log(`  attemptCount    : ${listItem.attemptCount}`);
console.log(`  all statuses    : ${[...new Set([listItem.status])].join(', ')}`);

if (String(listItem.status).toUpperCase() !== 'READY') {
    console.log('\ntest is not READY; stopping before start/submit');
    process.exit(0);
}

/* --- 5. start ----------------------------------------------------------- */
const session = await fx.run('vocabulary.start', async () => {
    const started = await call(`/vocabulary-tests/${listItem.testId}/start`, { method: 'POST', token });
    console.log(`\nPOST /vocabulary-tests/{id}/start  HTTP ${started.status}`);
    if (started.status !== 200) {
        console.error(`  ${started.text?.slice(0, 240)}`);
        process.exit(1);
    }
    return started.json.data;
});
console.log(`  attemptId       : ${session.attemptId}   questionCount: ${session.questionCount}`);
const questions = session.testDetail?.questions ?? [];
console.log(`  questions served: ${questions.length}`);
const q0 = questions[0];
if (q0) {
    console.log(`  question keys   : ${Object.keys(q0).join(', ')}`);
    console.log(`  q0 order/type   : ${q0.order} / ${q0.sourceType}`);
    console.log(`  q0 text         : ${q0.questionText}`);
    console.log(`  q0 blank        : ${q0.blankSentence}`);
    console.log(`  q0 options      : ${JSON.stringify(q0.options)}`);
    const optioned = questions.filter((q) => (q.options ?? []).length > 0).length;
    console.log(`  optioned vs all : ${optioned} / ${questions.length}`);
    console.log(`  correctAnswers leaked to client? ${q0.correctAnswers !== undefined}`);
}

/* --- 6. submit: pick option 0 everywhere -------------------------------- */
const answers = questions.map((q) => ({ questionId: q.questionId, selectedOptionIndex: 0 }));
const scored = await fx.run('vocabulary.submit', async () => {
    const submitted = await call(`/vocabulary-tests/attempts/${session.attemptId}/submit`, {
        method: 'POST',
        token,
        body: { answers, timeSpentSeconds: 90 },
    });
    console.log(`\nPOST .../attempts/{id}/submit  HTTP ${submitted.status}`);
    if (submitted.status !== 200) {
        console.error(`  ${submitted.text?.slice(0, 260)}`);
        process.exit(1);
    }
    return submitted.json.data;
});
console.log(`  totalQuestions  : ${scored.totalQuestions}   correctCount: ${scored.correctCount}`);
console.log(`  accuracyPercent : ${scored.accuracyPercent}`);
console.log(`  results         : ${scored.results?.length}`);
const r0 = scored.results?.[0];
if (r0) {
    console.log(`  result keys     : ${Object.keys(r0).join(', ')}`);
    console.log(`  r0 selectedIdx  : ${r0.selectedOptionIndex}  correctIdx: ${r0.correctOptionIndex}`);
    console.log(`  r0 selected     : ${r0.selectedAnswer}`);
    console.log(`  r0 correct      : ${r0.correctAnswer}`);
    console.log(`  r0 isCorrect    : ${r0.isCorrect}   hasExplanation: ${r0.explanation != null}`);
}

/* --- 7. reopen --------------------------------------------------------- */
const reread = await call(`/vocabulary-tests/attempts/${session.attemptId}`, { token });
console.log(`\nGET .../attempts/{id}  HTTP ${reread.status}`);
if (reread.status === 200) {
    const d = reread.json.data;
    console.log(`  correctCount    : ${d.correctCount}/${d.totalQuestions}`);
    console.log(`  reopenable      : ${(d.results?.length ?? 0) > 0 ? 'YES' : 'NO'}`);
}
const history = await call('/vocabulary-tests/attempts?page=0&size=5', { token });
console.log(`\nGET .../attempts  HTTP ${history.status}`);
if (history.status === 200) {
    const h = history.json.data;
    console.log(`  items           : ${h.items?.length} of ${h.totalElements}`);
    if (h.items?.[0]) console.log(`  history keys    : ${Object.keys(h.items[0]).join(', ')}`);
}
