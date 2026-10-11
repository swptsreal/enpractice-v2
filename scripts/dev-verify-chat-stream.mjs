/**
 * DEV verification of the AI chat stream against the running backend.
 *
 * Mirrors what `src/features/chat/useAiChat.js` does:
 *   SUBSCRIBE /topic/realtime-chat/{userId}
 *   SEND      /app/realtime-chat  { clientMessageId, content, senderId }
 *   fold START / DELTA* / COMPLETE | ERROR
 *
 * The identity in the topic is the user's UUID, which `authUtil.getUserId(principal)`
 * resolves from the socket session — confirmed by reading the handler, and confirmed here
 * by receiving a frame at all.
 *
 * Usage:
 *   node scripts/dev-verify-chat-stream.mjs <email> <password> [question]          # replay
 *   node scripts/dev-verify-chat-stream.mjs <email> <password> [question] --live   # AI thật + ghi fixture
 *
 * AI step (fixture): chat.turn. Replay prints the recorded final result and does NOT
 * open a socket, so a replay cannot spend credit. Login stays live (the JWT is not
 * replayable, and the topic identity comes from it).
 *
 * Costs one credit (AI_CHAT) when run with --live.
 */
import { Client } from '@stomp/stompjs';
import WebSocket from 'ws';

import { createFixtures, parseVerificationArgs } from './lib/verifyFixtures.mjs';

const API = process.env.API_URL ?? 'http://localhost:8082/api';
const WS = (process.env.WS_URL ?? 'ws://localhost:8082') + '/ws/realtime-chat';

const { live, args } = parseVerificationArgs();
const [email, password, question = 'How do I improve my Matching Headings accuracy?'] = args;
if (!email || !password) {
    console.error('usage: node scripts/dev-verify-chat-stream.mjs <email> <password> [question] [--live]');
    process.exit(1);
}

const fx = createFixtures({
    script: 'chat-stream',
    live,
    steps: [
        {
            key: 'chat.turn',
            note: `STOMP /app/realtime-chat (toàn bộ START/DELTA/COMPLETE cho một câu hỏi)`,
            credit: 'AI_CHAT',
        },
    ],
});

const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
});
if (loginRes.status !== 200) {
    console.error(`login failed: HTTP ${loginRes.status}`);
    process.exit(1);
}
const login = await loginRes.json();
const token = login.data.accessToken;
/* The topic is built from the user's id, and the login payload carries it. */
const userId = login.data.user?.id ?? login.data.userId ?? login.data.id;
console.log('login ok (live)');
console.log(`userId (topic identity): ${userId}`);

const topic = `/topic/realtime-chat/${userId}`;
const clientMessageId = crypto.randomUUID();

/**
 * Drive one real chat turn and resolve with the folded result.
 *
 * Resolves — never exits — so the caller can decide whether the outcome deserves to be
 * recorded. `status` is one of:
 *   complete | error          : a terminal frame arrived (recordable)
 *   transport-error | timeout : the socket itself misbehaved (NOT recordable)
 */
function runLiveTurn() {
    return new Promise((resolve) => {
        const events = [];
        let content = '';
        let settled = false;
        let timer = null;

        const client = new Client({
            webSocketFactory: () => new WebSocket(WS, { headers: { Authorization: `Bearer ${token}` } }),
            reconnectDelay: 0,
            debug: () => {},
        });

        const finish = (status, detail) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            client.deactivate().finally(() =>
                resolve({ question, clientMessageId, status, detail: detail ?? null, events, content })
            );
        };

        client.onConnect = () => {
            console.log('STOMP connected');

            client.subscribe(topic, (frame) => {
                let event;
                try {
                    event = JSON.parse(frame.body);
                } catch {
                    return;
                }
                events.push(event.type);
                if (event.type === 'DELTA') content += event.content ?? '';
                else if (event.type === 'COMPLETE') content = event.content ?? content;
                else if (event.type === 'ERROR') {
                    console.log(
                        `  ERROR code=${event.errorCode} required=${event.requiredCredit ?? '—'} available=${event.availableCredit ?? '—'}`
                    );
                }
                if (event.type === 'COMPLETE' || event.type === 'ERROR') {
                    finish(event.type === 'COMPLETE' ? 'complete' : 'error');
                }
            });

            console.log(`SUBSCRIBE ${topic}`);
            console.log(`SEND /app/realtime-chat  "${question}"`);
            client.publish({
                destination: '/app/realtime-chat',
                body: JSON.stringify({ clientMessageId, content: question, senderId: userId }),
            });
        };

        client.onStompError = (frame) => {
            if (settled) return;
            console.log(`STOMP error: ${frame.headers?.message}`);
            console.log(frame.body?.slice(0, 300));
            finish('transport-error', `STOMP error: ${frame.headers?.message ?? 'unknown'}`);
        };
        client.onWebSocketError = (error) => {
            if (settled) return;
            console.log(`WebSocket error: ${error?.message ?? error}`);
            finish('transport-error', String(error?.message ?? error));
        };
        client.onWebSocketClose = (event) => {
            /* deactivate() after a normal finish closes the socket too: ignore that. */
            if (settled) return;
            console.log(`socket closed early (code ${event?.code})`);
            finish('transport-error', `socket closed (code ${event?.code})`);
        };

        console.log('connecting…');
        client.activate();

        timer = setTimeout(() => {
            console.log('\ntimed out after 90s');
            finish('timeout', 'quá 90s không có frame kết thúc');
        }, 90_000);
    });
}

function report(result) {
    const collapsed = [];
    for (const type of result.events ?? []) {
        const last = collapsed[collapsed.length - 1];
        if (type === 'DELTA' && last?.type === 'DELTA') last.count += 1;
        else collapsed.push({ type, count: 1 });
    }
    const content = result.content ?? '';
    const deltaCount = (result.events ?? []).filter((t) => t === 'DELTA').length;

    console.log('\n--- result ---');
    if (fx.isReplay) console.log(`  nguồn          : fixture ${fx.fixtureDisplay('chat.turn')} (không mở socket)`);
    console.log(`  final status   : ${result.status}`);
    if (fx.isReplay) console.log(`  question đã ghi: ${result.question ?? '—'}`);
    console.log(`  event sequence : ${collapsed.map((e) => (e.count > 1 ? `${e.type} x${e.count}` : e.type)).join(' -> ')}`);
    console.log(`  delta count    : ${deltaCount}`);
    console.log(`  content chars  : ${content.length}`);
    if (content) {
        console.log('  first 240 chars:');
        console.log(`    ${content.slice(0, 240).replace(/\n/g, '\n    ')}`);
    }
    console.log(`  is markdown?   : ${/^#|\*\*|^\d\. /m.test(content) ? 'YES' : 'plain'}`);
    console.log(`  streamed       : ${deltaCount > 1 ? 'YES (token by token)' : 'NO'}`);
    console.log(
        `  reached final  : ${(result.events ?? []).includes('COMPLETE') ? 'COMPLETE' : (result.events ?? []).includes('ERROR') ? 'ERROR' : 'never'}`
    );
    if (result.detail) console.log(`  detail         : ${result.detail}`);
}

let result;
if (fx.isReplay) {
    result = fx.read('chat.turn');
} else {
    result = await runLiveTurn();
    if (result.status === 'complete' || result.status === 'error') {
        fx.write('chat.turn', result);
    } else {
        /* A socket/transport failure is not an outcome worth replaying forever. */
        console.error(`không ghi fixture vì stream kết thúc bất thường (${result.status})`);
    }
}

report(result);
process.exit(result.status === 'complete' ? 0 : 1);
