/**
 * Verify the custom speaking conversation flow.
 *
 * The conversation is multi-turn and EVERY turn is one AI request, so each turn gets
 * its own fixture key (`custom-speaking.turn.1`, `.turn.2`, …) instead of one shared
 * blob: a re-record can refresh one turn without throwing the rest away.
 *
 * Usage:
 *   node scripts/dev-verify-custom-speaking.mjs <email> <password>           # replay (mặc định)
 *   node scripts/dev-verify-custom-speaking.mjs <email> <password> --live    # AI thật + ghi fixture
 *
 * AI steps (fixture): custom-speaking.start, custom-speaking.turn.1,
 * custom-speaking.finish (AI chấm hội thoại).
 * Live anyway: login, GET /custom-speaking-conversations/{id}.
 */
import { createFixtures, parseVerificationArgs } from './lib/verifyFixtures.mjs';

const API = process.env.API_URL ?? 'http://localhost:8082/api';
const { live, args } = parseVerificationArgs();
const [email, password] = args;

if (!email || !password) {
    console.error('usage: node scripts/dev-verify-custom-speaking.mjs <email> <password> [--live]');
    process.exit(1);
}

const TURN_KEY = 'custom-speaking.turn.1';

const fx = createFixtures({
    script: 'custom-speaking',
    live,
    steps: [
        { key: 'custom-speaking.start', note: 'POST /custom-speaking-conversations/start — AI mở hội thoại', credit: 'AI' },
        { key: TURN_KEY, note: 'POST /{id}/turn — mỗi lượt là một request AI', credit: 'AI' },
        { key: 'custom-speaking.finish', note: 'POST /{id}/finish — AI chấm/nhận xét', credit: 'AI' },
    ],
});

async function call(path, { method = 'GET', token, body } = {}) {
    const res = await fetch(`${API}${path}`, {
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

const lg = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
});
const token = (await lg.json()).data.accessToken;
console.log('login ok (live)\n');

console.log('POST /custom-speaking-conversations/start');
const s = await fx.run('custom-speaking.start', async () => {
    const start = await call('/custom-speaking-conversations/start', {
        method: 'POST',
        token,
        body: {
            topic: 'Travel experiences and favourite destinations',
            style: 'CASUAL',
            personality: 'FRIENDLY',
            expertise: 'TRAVEL',
            voiceName: 'US_NEURAL_F',
            gradingEnabled: true,
        },
    });
    console.log(`  HTTP ${start.status}`);
    if (start.status !== 200) {
        console.log(`  ${start.text?.slice(0, 300)}`);
        process.exit(1);
    }
    return start.json.data;
});
console.log(`  keys           : ${Object.keys(s).join(', ')}`);
console.log(`  conversationId : ${s.conversationId}`);
console.log(`  title          : ${s.title}`);
console.log(`  turnNumber     : ${s.turnNumber}`);
console.log(`  maxUserTurns   : ${s.maxUserTurns}  userTurnCount: ${s.userTurnCount}`);
console.log(`  status         : ${s.status}  complete: ${s.conversationComplete}`);
console.log(`  voiceName      : ${s.voiceName}`);
console.log(`  aiMessage      : ${String(s.aiMessage).slice(0, 200)}`);

console.log('\nPOST /{id}/turn');
/* Recorded with the HTTP status: a 4xx/5xx answer is a real observed outcome and the
   replay has to reproduce exactly what the live run printed. */
const turn = await fx.run(TURN_KEY, async () => {
    const res = await call(`/custom-speaking-conversations/${s.conversationId}/turn`, {
        method: 'POST',
        token,
        body: {
            transcript:
                'I really enjoy travelling to smaller coastal towns because the pace is slower and the food is usually better. Last summer I spent two weeks in a fishing village and it was the most relaxing holiday I have had.',
            audioUrl: null,
            timeSpentSeconds: 25,
            speechAnalytics: { wordCount: 39, wordsPerMinute: 94, fillerWordCount: 0, fillerWords: null },
        },
    });
    return { httpStatus: res.status, data: res.json?.data ?? null, errorBody: res.status === 200 ? null : res.text?.slice(0, 400) };
});
console.log(`  HTTP ${turn.httpStatus}`);
if (turn.data) {
    console.log(`  keys           : ${Object.keys(turn.data).join(', ')}`);
    console.log(`  turnNumber     : ${turn.data.turnNumber}`);
    console.log(`  aiMessage      : ${String(turn.data.aiMessage).slice(0, 260)}`);
    console.log(`  complete       : ${turn.data.conversationComplete}`);
} else {
    console.log(`  ${turn.errorBody}`);
}

console.log('\nPOST /{id}/finish');
const fin = await fx.run('custom-speaking.finish', async () => {
    const res = await call(`/custom-speaking-conversations/${s.conversationId}/finish`, { method: 'POST', token });
    return { httpStatus: res.status, data: res.json?.data ?? null, errorBody: res.status === 200 ? null : res.text?.slice(0, 300) };
});
console.log(`  HTTP ${fin.httpStatus}`);
if (fin.data) console.log(`  keys: ${Object.keys(fin.data).join(', ')}`);
else if (fin.errorBody) console.log(`  ${fin.errorBody}`);

console.log('\nGET /custom-speaking-conversations/{id}');
/* Non-AI read, live in both modes: the id comes from the recording during replay, so a
   404 here just means the backend state moved on. */
const one = await call(`/custom-speaking-conversations/${s.conversationId}`, { token });
console.log(`  HTTP ${one.status}  keys: ${one.status === 200 ? Object.keys(one.json.data).join(', ') : '—'}`);
if (one.status !== 200 && fx.isReplay) {
    console.log(`  [replay] conversation từ fixture không còn trên backend — bỏ qua bước đọc này`);
}
if (one.status === 200) {
    console.log(
        `  status=${one.json.data.status} band=${one.json.data.overallScore} feedbackLen=${String(one.json.data.aiFeedback ?? '').length}`
    );
}
