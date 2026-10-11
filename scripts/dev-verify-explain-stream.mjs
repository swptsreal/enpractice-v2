/**
 * DEV verification of the vocabulary AI-explain STREAM against the running backend.
 *
 * This closes the last unverified path in the vocabulary module. Everything else has
 * been exercised against the real server; the explain stream had only been checked
 * for shape (destinations match the backend's `@MessageMapping`) and by unit tests of
 * the state machine. Those cannot prove that a real frame ever arrives.
 *
 * What it does, mirroring `VocabularyExplainContext` + `vocabularyExplainState`:
 *
 *   ws://.../ws/realtime-chat        STOMP handshake, `Authorization: Bearer <jwt>`
 *                                    on the UPGRADE request (WebSocketHandshakeInterceptor
 *                                    reads it there, not from a CONNECT frame)
 *   SUBSCRIBE /user/queue/vocabulary/explain
 *   SEND      /app/vocabulary/explain  { requestId, word }
 *   ... then fold START / DELTA / COMPLETE / ERROR exactly as the reducer does.
 *
 * Usage:
 *   node scripts/dev-verify-explain-stream.mjs <email> <password> [word]          # replay
 *   node scripts/dev-verify-explain-stream.mjs <email> <password> [word] --live   # AI thật + ghi fixture
 *
 * AI step (fixture): explain.stream. Replay prints the recorded final result and does
 * NOT open a socket at all — there is no way for a replay to spend credit here.
 * Login and the balance GET stay live.
 *
 * Costs one credit (AI_EXPLAIN) when run with --live.
 */
import { Client } from '@stomp/stompjs';
import WebSocket from 'ws';

import { createFixtures, parseVerificationArgs } from './lib/verifyFixtures.mjs';

const API = process.env.API_URL ?? 'http://localhost:8082/api';
const WS = (process.env.WS_URL ?? 'ws://localhost:8082') + '/ws/realtime-chat';

const { live, args } = parseVerificationArgs();
const [email, password, word = 'mitigate'] = args;
if (!email || !password) {
    console.error('usage: node scripts/dev-verify-explain-stream.mjs <email> <password> [word] [--live]');
    process.exit(1);
}

const fx = createFixtures({
    script: 'explain-stream',
    live,
    steps: [
        {
            key: 'explain.stream',
            note: `STOMP /app/vocabulary/explain (word="${word}", toàn bộ START/DELTA/COMPLETE)`,
            credit: 'AI_EXPLAIN',
        },
    ],
});

async function login() {
    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (res.status !== 200) {
        console.error(`login failed: HTTP ${res.status}`);
        process.exit(1);
    }
    const json = await res.json();
    return json.data.accessToken;
}

const token = await login();
console.log('login ok (live)');

if (fx.isLive) {
    console.log(`socket: ${WS}`);
    const balanceBefore = await fetch(`${API}/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` },
    })
        .then((r) => r.json())
        .then((j) => j.data?.availableBalance)
        .catch(() => null);
    console.log(`credits before: ${balanceBefore}`);
}

/* MUST be a UUID: the backend parses this with UUID.fromString and answers
   INVALID_REQUEST — streaming nothing — for anything else. An earlier version of
   this script used `verify-<timestamp>`, which produced exactly that error and
   looked like a backend fault. */
const requestId = crypto.randomUUID();

/**
 * Drive one real explain stream and resolve with the folded result.
 *
 * Resolves — never exits — so the caller can decide whether the outcome deserves to be
 * recorded. `status` is one of:
 *   complete | error   : a terminal frame arrived (recordable)
 *   transport-error | timeout : the socket itself misbehaved (NOT recordable)
 */
function runLiveStream() {
    return new Promise((resolve) => {
        const events = [];
        let markdown = '';
        let settled = false;
        let timer = null;

        const client = new Client({
            /* `brokerURL` would make @stomp/stompjs pick its own WebSocket implementation
               and give us no way to add the Authorization header. The handshake
               interceptor reads the token from the UPGRADE request, so the socket is
               built by hand. */
            webSocketFactory: () =>
                new WebSocket(WS, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            reconnectDelay: 0,
            debug: () => {},
        });

        const finish = (status, detail) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            client.deactivate().finally(() => resolve({ word, requestId, status, detail: detail ?? null, events, markdown }));
        };

        client.onConnect = () => {
            console.log('STOMP connected');

            client.subscribe('/user/queue/vocabulary/explain', (frame) => {
                let event;
                try {
                    event = JSON.parse(frame.body);
                } catch {
                    console.log(`  (unparseable frame) ${frame.body?.slice(0, 120)}`);
                    return;
                }

                events.push(event.type);
                /* The same fold the app's reducer performs. */
                if (event.type === 'START') {
                    console.log(`  START   word=${event.word} quotaRemaining=${event.quotaRemaining ?? '—'}`);
                } else if (event.type === 'DELTA') {
                    markdown += event.content ?? '';
                } else if (event.type === 'COMPLETE') {
                    markdown = event.content ?? markdown;
                } else if (event.type === 'ERROR') {
                    console.log(`  ERROR   code=${event.errorCode} message=${event.message}`);
                    console.log(
                        `          requiredCredit=${event.requiredCredit ?? '—'} availableCredit=${event.availableCredit ?? '—'}`
                    );
                }

                if (event.isFinal || event.type === 'COMPLETE' || event.type === 'ERROR') {
                    finish(event.type === 'COMPLETE' ? 'complete' : 'error');
                }
            });

            console.log(`SEND /app/vocabulary/explain  { requestId: ${requestId}, word: "${word}" }`);
            client.publish({
                destination: '/app/vocabulary/explain',
                body: JSON.stringify({ requestId, word }),
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
            console.log(`WebSocket closed before completion (code ${event?.code})`);
            finish('transport-error', `socket closed (code ${event?.code})`);
        };

        console.log('connecting…');
        client.activate();

        /* Bounded: an AI stream that never terminates must not hang the script forever. */
        timer = setTimeout(() => {
            console.log('\ntimed out after 90s');
            finish('timeout', 'quá 90s không có frame kết thúc');
        }, 90_000);
    });
}

function report(result) {
    /* Collapse the DELTA run: a real explanation arrives as hundreds of small
       deltas, and printing each one buries the result it is meant to illustrate. */
    const collapsed = [];
    for (const type of result.events ?? []) {
        const last = collapsed[collapsed.length - 1];
        if (type === 'DELTA' && last?.type === 'DELTA') {
            last.count += 1;
        } else {
            collapsed.push({ type, count: 1 });
        }
    }
    const sequence = collapsed
        .map(({ type, count }) => (count > 1 ? `${type} x${count}` : type))
        .join(' -> ');
    const markdown = result.markdown ?? '';
    const deltaCount = (result.events ?? []).filter((t) => t === 'DELTA').length;

    console.log('\n--- result ---');
    if (fx.isReplay) console.log(`  nguồn          : fixture ${fx.fixtureDisplay('explain.stream')} (không mở socket)`);
    console.log(`  final status   : ${result.status}`);
    if (fx.isReplay) console.log(`  word đã ghi    : ${result.word ?? '—'}`);
    console.log(`  event sequence : ${sequence}`);
    console.log(`  delta count    : ${deltaCount}`);
    console.log(`  markdown chars : ${markdown.length}`);
    if (markdown) {
        console.log('  first 220 chars:');
        console.log(`    ${markdown.slice(0, 220).replace(/\n/g, '\n    ')}`);
    }
    console.log(`  started with START frame : ${result.events?.[0] === 'START' ? 'YES' : 'NO'}`);
    console.log(`  streamed token by token  : ${deltaCount > 1 ? 'YES (real streaming)' : 'NO (single chunk)'}`);
    if (result.detail) console.log(`  detail         : ${result.detail}`);
}

let result;
if (fx.isReplay) {
    result = fx.read('explain.stream');
} else {
    result = await runLiveStream();
    if (result.status === 'complete' || result.status === 'error') {
        fx.write('explain.stream', result);
    } else {
        /* A socket/transport failure is not an outcome worth replaying forever. */
        console.error(`không ghi fixture vì stream kết thúc bất thường (${result.status})`);
    }
}

report(result);
process.exit(result.status === 'complete' ? 0 : 1);
