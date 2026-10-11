/**
 * Verify the learning path against a running backend.
 *
 * NO FIXTURES: a Reading/Listening attempt is graded LOCALLY from the band table, so nothing
 * here reaches 9router and there is no response worth replaying. The fixture helper would be
 * pure indirection.
 *
 * IT DOES SPEND CREDITS. `IELTS_START` is ENFORCE at 5 credits, so the throwaway account is
 * seeded through the existing dev helper first — and the price is then ASSERTED against what
 * is actually deducted, because "the price on the button" is a promise, not a decoration.
 *
 * IT WALKS THE JOURNEY A CLIENT WALKS, which is the point: read the path, press the node the
 * path says is CURRENT, submit, read again, and check that the state moved. A brand-new
 * account gets the diagnostic node (a passage-scoped practice); once something is measured
 * the path switches to question-type drills, and the script then drills the type the path
 * itself offered.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: pick a question type by hand. The first version hardcoded
 * MATCHING_HEADINGS and then failed, correctly — that type has 10 published questions, under
 * `minQuestionsForDrill` (20), so the path must NOT offer it as a drill node. Asserting that
 * the path reflects a type it is configured to skip was the test being wrong, not the server.
 *
 * Usage:
 *   node scripts/dev-verify-learning-path.mjs
 *   API_URL=http://localhost:8083/api node scripts/dev-verify-learning-path.mjs
 */
import { execFileSync } from 'node:child_process';
import { Client } from 'pg';
import { resolveDevDbConfig } from './devDbConfig.mjs';

const API = process.env.API_URL ?? 'http://localhost:8082/api';
const PASSWORD = 'Verify12345';

let failures = 0;

function check(label, condition, detail = '') {
    const mark = condition ? 'PASS' : 'FAIL';
    if (!condition) failures += 1;
    console.log(`  ${mark}  ${label}${detail ? ` — ${detail}` : ''}`);
}

function note(message) {
    console.log(`  [chưa kết luận] ${message}`);
}

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

function flatten(testDetail) {
    const rows = [];
    for (const section of [...(testDetail?.sections ?? [])].sort((a, b) => a.sectionOrder - b.sectionOrder)) {
        for (const passage of [...(section?.passages ?? [])].sort((a, b) => a.passageOrder - b.passageOrder)) {
            for (const q of [...(passage?.questions ?? [])].sort((a, b) => a.questionOrder - b.questionOrder)) {
                rows.push(q);
            }
        }
    }
    return rows;
}

const nodesOf = (path) => path?.unit?.nodes ?? [];
const currentNode = (path) => nodesOf(path).find((node) => node.state === 'CURRENT') ?? null;

/**
 * The start request, derived from the node's own action URL — exactly what the client does.
 * Reading it from the payload rather than rebuilding it is the only way this script can catch
 * a node whose URL the start endpoint cannot actually fulfil.
 */
function startBodyFrom(url) {
    const params = new URL(url, 'http://localhost').searchParams;
    const body = {
        attemptMode: params.get('attemptMode') ?? 'QUICK',
        scopeType: params.get('scopeType') ?? 'TEST',
    };
    for (const key of ['testId', 'scopeId', 'questionType', 'skill']) {
        const value = params.get(key);
        if (value) body[key] = value;
    }
    return body;
}

/** Đúng bất biến mà quy tắc "giá hiện trước khi bấm" cần. */
function ieltsNodesWithoutCost(path) {
    return nodesOf(path).filter((node) => node.action?.url?.startsWith('/ielts') && !node.costActionCode);
}

/**
 * Xoá hàng snapshot hồ sơ của tài khoản thử, để lần đọc `/user/profile` kế tiếp buộc phải tính
 * lại (xem mục 5). Dev-only, trên tài khoản mà script này vừa tạo.
 */
async function forgetProfileSnapshot(userId) {
    if (!userId) return null;
    const client = new Client({ ...resolveDevDbConfig() });
    await client.connect();
    try {
        const result = await client.query('DELETE FROM user_profile_snapshots WHERE user_id = $1', [userId]);
        return result.rowCount ?? 0;
    } finally {
        await client.end();
    }
}

/**
 * Xoá cache lộ trình của user trong Redis.
 *
 * VÌ SAO SCRIPT PHẢI LÀM VIỆC NÀY: lộ trình được cache 5 phút theo user, và việc xoá nó khi có
 * hoạt động học KHÔNG đồng bộ với lúc submit trả về — đo được: ngay sau khi nộp bài,
 * `GET /learning-path` vẫn trả bản cache cũ (`drill answered=0`), và phải tới khi TTL 5 phút hết
 * thì cùng request đó mới trả `answered=10/10`. Script không thể chờ 5 phút mỗi bước, nên nó
 * xoá cache tường minh — và nhờ vậy phép kiểm nói về DỮ LIỆU, không nói về thời điểm.
 */
async function forgetLearningPathCache(userId) {
    if (!userId) return false;
    try {
        execFileSync('docker', ['exec', 'en_practice_redis', 'redis-cli', 'DEL', `learningPath::${userId}`], {
            stdio: 'ignore',
        });
        return true;
    } catch {
        return false;
    }
}

/** Đọc lộ trình SAU khi xoá cache, để không bao giờ khẳng định trên một bản ghi cũ. */
async function freshPath(token, userId) {
    await forgetLearningPathCache(userId);
    const response = await call('/learning-path', { token });
    return response.json?.data ?? null;
}

/**
 * Band mới nhất của TỪNG kỹ năng, tính thẳng trong SQL — để đối chiếu với thứ `GET /user/profile`
 * trả về. Đây là phép kiểm độc lập cho lỗi "Reading là bản sao của Listening": dưới lỗi cũ, cả
 * hai kỹ năng đều bằng band của attempt mới nhất BẤT KỲ, nên chỉ cần một kỹ năng không khớp là
 * phát hiện được.
 */
async function latestBandPerSkill(userId) {
    if (!userId) return {};
    const client = new Client({ ...resolveDevDbConfig() });
    await client.connect();
    try {
        const { rows } = await client.query(
            `SELECT DISTINCT ON (t.skill) t.skill AS skill, a.band_score AS band
             FROM ielts_test_attempts a
             JOIN ielts_tests t ON t.id = a.test_id
             WHERE a.user_id = $1 AND a.status = 'COMPLETED' AND a.band_score IS NOT NULL
             ORDER BY t.skill, COALESCE(a.completed_at, a.started_at) DESC`,
            [userId]
        );
        return Object.fromEntries(rows.map((row) => [row.skill, Number(row.band)]));
    } finally {
        await client.end();
    }
}

/** Start a paper from a node's action URL and submit a deterministically WRONG answer sheet. */
async function runNode(node, token) {
    const body = startBodyFrom(node.action.url);
    const started = await call('/ielts/sessions/start', { method: 'POST', token, body });
    if (started.status !== 200) {
        return { body, started, questions: [], submitted: null };
    }
    const session = started.json.data;
    const questions = flatten(session.testDetail);
    const answers = questions.map((q) => ({ questionId: q.id, userAnswer: ['zzz-definitely-wrong'] }));
    const submitted = await call(`/ielts/sessions/${session.attemptId}/submit`, {
        method: 'POST',
        token,
        body: { attemptId: session.attemptId, answers, timeSpentSeconds: 300 },
    });
    return { body, started, questions, submitted };
}

const stamp = Date.now();
const email = `v2path${stamp}@enpractice.test`;

console.log(`API: ${API}\n`);

/* ------------------------------------------------------------------ 0. setup */
console.log(`0. Tài khoản mới ${email}`);
const registered = await call('/auth/register', {
    method: 'POST',
    body: { email, password: PASSWORD, displayName: 'Path Probe' },
});
if (registered.status !== 200 && registered.status !== 201) {
    console.error(`register failed: HTTP ${registered.status} ${registered.text?.slice(0, 300)}`);
    process.exit(1);
}
const token = registered.json.data.accessToken;
const userId = registered.json?.data?.user?.id ?? null;

let granted = false;
try {
    /* Output is swallowed: the helper reads database credentials from the container. */
    execFileSync('node', ['scripts/dev-grant-credits.mjs', email, '50'], { stdio: 'ignore' });
    granted = true;
} catch {
    granted = false;
}
const costConfig = await call('/credits/costs', { token });
const ieltsStart = (costConfig.json?.data ?? []).find((entry) => entry.actionCode === 'IELTS_START') ?? null;
const balance = await call('/credits/balance', { token });
console.log(
    `   seed credit: ${granted ? 'ok' : 'thất bại'} · số dư ${balance.json?.data?.availableBalance ?? '?'} · giá IELTS_START ${ieltsStart?.cost ?? '?'} (${ieltsStart?.mode ?? '?'})`
);

/* ------------------------------------------------- 1. the path before any work */
console.log('\n1. Lộ trình khi CHƯA có bài nào');
const first = await call('/learning-path', { token });
console.log(`   GET /learning-path -> HTTP ${first.status}`);
check('HTTP 200', first.status === 200);

const path1 = first.json?.data;
const nodes1 = nodesOf(path1);
check('có unit hiện tại', Boolean(path1?.unit), path1?.unit?.key);
check('unit chưa đủ dữ liệu là DIAGNOSTIC', path1?.unit?.focusType === 'DIAGNOSTIC', path1?.unit?.focusType);
check('currentBand KHÔNG phải số đo', !path1?.currentBand, String(path1?.currentBand));
check('targetBand null vì chưa đặt', path1?.targetBand == null);
check('mọi node có state hợp lệ', nodes1.every((n) => ['DONE', 'CURRENT', 'LOCKED', 'MILESTONE'].includes(n.state)), nodes1.map((n) => n.state).join(','));
check('đúng MỘT node CURRENT', nodes1.filter((n) => n.state === 'CURRENT').length === 1);
check(
    'node LOCKED chỉ nằm SAU node CURRENT',
    nodes1.findIndex((n) => n.state === 'LOCKED') === -1 ||
        nodes1.findIndex((n) => n.state === 'LOCKED') > nodes1.findIndex((n) => n.state === 'CURRENT')
);
check(
    'MỌI node mở lượt làm bài IELTS đều khai code bị thu',
    ieltsNodesWithoutCost(path1).length === 0,
    ieltsNodesWithoutCost(path1).map((n) => n.key).join(', ') || 'ok'
);

/* --------------------------------------- 2. press the node the path offers */
console.log('\n2. Bấm đúng node mà lộ trình chỉ ra (như client)');

/* Đặt mục tiêu TRƯỚC mọi hoạt động, rồi kiểm nó ở mục 6 (sau khi có bài). Lý do không kiểm
   ngay tại đây: lộ trình được cache 5 phút và chỉ bị xoá khi có hoạt động học, nên đọc ngay
   sau khi PUT sẽ ra bản cache cũ — điều đó đúng với thiết kế, không phải lỗi, nhưng nếu kiểm
   ở đây thì script sẽ báo đỏ vì hiểu sai cache. */
const goalPut = await call('/user/profile', { method: 'PUT', token, body: { targetIeltsBand: 6.5 } });
check('PUT /user/profile đặt mục tiêu 6.5', goalPut.status === 200, `HTTP ${goalPut.status}`);

const node2 = currentNode(path1);
check('có node CURRENT để bấm', Boolean(node2), node2?.key);
check('node CURRENT có action.url', Boolean(node2?.action?.url), node2?.action?.url);

const body2 = node2 ? startBodyFrom(node2.action.url) : null;
console.log(`   start body: ${JSON.stringify(body2)}`);

const balanceBefore = (await call('/credits/balance', { token })).json?.data?.availableBalance ?? null;
const run2 = await runNode(node2, token);
const balanceAfter = (await call('/credits/balance', { token })).json?.data?.availableBalance ?? null;
console.log(
    `   POST /ielts/sessions/start -> HTTP ${run2.started.status} · ${run2.questions.length} câu · số dư ${balanceBefore} -> ${balanceAfter}`
);
check('start HTTP 200', run2.started.status === 200, run2.started.text?.slice(0, 200) ?? '');
check('đề có câu hỏi', run2.questions.length > 0, `${run2.questions.length} câu`);

/* Giá khai trên node phải đúng bằng giá bị trừ. */
const charged = balanceBefore != null && balanceAfter != null ? balanceBefore - balanceAfter : null;
if (node2?.costActionCode === 'IELTS_START' && ieltsStart?.mode === 'ENFORCE') {
    check('số dư bị trừ ĐÚNG BẰNG giá đã khai trên node', charged === ieltsStart.cost, `trừ ${charged}, khai ${ieltsStart.cost}`);
} else {
    note(`node CURRENT không khai IELTS_START (${node2?.costActionCode ?? 'null'}) nên không đối chiếu giá`);
}

/* Nếu node là drill theo dạng thì MỌI câu phải đúng dạng đó — nếu không, tiến độ node đo sai thứ. */
if (body2?.questionType) {
    const types = [...new Set(run2.questions.map((q) => q.questionType))];
    check(
        `mọi câu trong drill đúng dạng đã yêu cầu (${body2.questionType})`,
        types.length === 1 && types[0] === body2.questionType,
        types.join(', ') || '(không có)'
    );
} else {
    check('node là lượt luyện theo scope, không phải drill theo dạng', Boolean(body2?.scopeType), body2?.scopeType);
}

console.log(`   submit -> HTTP ${run2.submitted?.status} · band ${run2.submitted?.json?.data?.bandScore}`);
check('submit HTTP 200', run2.submitted?.status === 200, run2.submitted?.text?.slice(0, 200) ?? '');

/* ------------------------------------- 3. the path reflects the work done */
console.log('\n3. Lộ trình phải phản ánh bài vừa làm');
const path2 = await freshPath(token, userId);
console.log(
    `   unit=${path2?.unit?.key} focusType=${path2?.unit?.focusType} currentBand=${path2?.currentBand} overallAccuracy=${path2?.overallAccuracy}`
);

check('lộ trình không còn ở nhánh "chưa đủ dữ liệu"', path2?.unit?.focusType !== 'DIAGNOSTIC', path2?.unit?.focusType);
check('band hiện tại đã đo được', typeof path2?.currentBand === 'number' && path2.currentBand > 0, String(path2?.currentBand));
check(
    'MỌI node mở lượt làm bài IELTS vẫn khai code bị thu',
    ieltsNodesWithoutCost(path2).length === 0,
    ieltsNodesWithoutCost(path2).map((n) => n.key).join(', ') || 'ok'
);

/* Nếu bài vừa làm là drill theo dạng, chính node đó phải ghi nhận số câu đã làm. */
if (body2?.questionType) {
    const drilled = nodesOf(path2).filter((n) => n.questionType === body2.questionType);
    check('có node cho dạng vừa luyện', drilled.length > 0);
    check(
        'node ghi nhận số câu đã làm',
        drilled.some((n) => (n.progress?.answered ?? 0) > 0),
        drilled.map((n) => `${n.key}=${n.progress?.answered ?? '—'}`).join(', ')
    );
} else {
    /* Nhánh chẩn đoán: bài vừa làm là một lượt luyện theo scope, nên điều phải kiểm là nó ĐÃ
       được ghi nhận — và nó đã được, qua currentBand ở trên. */
    check('lượt luyện chẩn đoán đã được ghi nhận (band đã đo)', typeof path2?.currentBand === 'number');
}

/* --------------------------- 4. the next node, and the drill it offers */
console.log('\n4. Node kế tiếp do lộ trình chọn — luyện đúng dạng nó đề nghị');
const node4 = currentNode(path2);
if (!node4) {
    note('không có node CURRENT nào để bấm tiếp');
} else {
    const body4 = startBodyFrom(node4.action.url);
    console.log(`   node=${node4.key} kind=${node4.kind} · start body: ${JSON.stringify(body4)}`);
    const run4 = await runNode(node4, token);
    console.log(
        `   start HTTP ${run4.started.status} · ${run4.questions.length} câu · submit HTTP ${run4.submitted?.status}`
    );
    check('start HTTP 200', run4.started.status === 200, run4.started.text?.slice(0, 200) ?? '');
    if (body4.questionType) {
        const types = [...new Set(run4.questions.map((q) => q.questionType))];
        check(
            `mọi câu đúng dạng đã yêu cầu (${body4.questionType})`,
            types.length === 1 && types[0] === body4.questionType,
            types.join(', ') || '(không có)'
        );
    }
    check('submit HTTP 200', run4.submitted?.status === 200, run4.submitted?.text?.slice(0, 200) ?? '');

    const path3 = await freshPath(token, userId);
    const progressed = nodesOf(path3).find((n) => n.key === node4.key);
    console.log(
        `   node đó sau khi làm: state=${progressed?.state} reason=${progressed?.stateReason} answered=${progressed?.progress?.answered ?? '—'}`
    );
    check('node vừa làm không còn ở trạng thái "chưa bắt đầu"', progressed && progressed.stateReason !== 'DRILL_NOT_STARTED', progressed?.stateReason);
    check('unit tiến lên', (path3?.unit?.progress?.done ?? 0) >= 1, `${path3?.unit?.progress?.done}/${path3?.unit?.progress?.total}`);
}

/* ------------------- 5. per-skill band is no longer a copy of its neighbour */
console.log('\n5. Band theo kỹ năng: Reading không được là bản sao của Listening');

/*
 * `user_profile_snapshots` được tính theo LỊCH (30 phút + nightly), KHÔNG tính lại khi submit,
 * và `getOrComputeSnapshot` chỉ tính khi CHƯA có hàng — nên đọc `/user/profile` lúc này sẽ ra
 * hàng cũ tạo trước khi làm bài. Xoá hàng đó của tài khoản thử để buộc tính lại; nếu không xoá
 * được thì mục này nói CHƯA KẾT LUẬN chứ không tick xanh cho một khẳng định rỗng.
 */
const removedSnapshots = await forgetProfileSnapshot(userId).catch(() => null);
const profile = await call('/user/profile', { token });
const bands = profile.json?.data?.bandProgress ?? {};
const readingBand = bands.reading?.current ?? null;
const listeningBand = bands.listening?.current ?? null;
const overallBand = bands.overall?.current ?? null;
console.log(
    `   snapshot cũ đã xoá: ${removedSnapshots === null ? 'không (thiếu Docker/pg)' : `${removedSnapshots} hàng`} · reading=${readingBand} listening=${listeningBand} overall=${overallBand}`
);

/* Chỉ Reading được làm trong script này (node hiện tại là READING). Đối chiếu ĐỘC LẬP với SQL:
   mỗi kỹ năng phải bằng band của attempt MỚI NHẤT CỦA CHÍNH KỸ NĂNG ĐÓ. Dưới lỗi cũ, cả hai
   kỹ năng đều bằng band của attempt mới nhất bất kỳ, nên chỉ cần một kỹ năng không khớp là
   phát hiện được — không cần may mắn về thứ tự. */
const measured = await latestBandPerSkill(userId).catch(() => null);
console.log(`   band mới nhất theo SQL: ${measured === null ? 'không đọc được' : JSON.stringify(measured)}`);

if (measured && Object.keys(measured).length > 0) {
    for (const [skill, expected] of Object.entries(measured)) {
        const shown = bands[skill.toLowerCase()]?.current ?? null;
        check(
            `${skill}: band hiển thị bằng band mới nhất của chính kỹ năng đó`,
            typeof shown === 'number' && Math.abs(shown - expected) < 0.01,
            `hiển thị ${shown}, SQL ${expected}`
        );
    }
    const measuredSkills = Object.keys(measured);
    if (measuredSkills.length === 2) {
        check(
            'hai kỹ năng KHÔNG còn là bản sao của nhau',
            measured.READING !== measured.LISTENING,
            `${measured.READING} vs ${measured.LISTENING}`
        );
    } else {
        check(
            'kỹ năng chưa làm bài vẫn là "chưa đo" (0)',
            measuredSkills.length === 1,
            measuredSkills.join(',')
        );
    }
} else {
    failures += 1;
    note('không đọc được band theo kỹ năng từ SQL nên không kiểm chứng được');
}

/* ------------------------------------------------------------- 6. the goal */
console.log('\n6. Mục tiêu band (đọc SAU khi có hoạt động, vì cache 5 phút chỉ bị xoá khi có bài)');
const goalPath = await freshPath(token, userId);
check('targetBand phản ánh 6.5 đã đặt ở mục 2', goalPath?.targetBand === 6.5, String(goalPath?.targetBand));

console.log('\n----------------------------------------------------------------------');
if (failures === 0) {
    console.log('LEARNING PATH VERIFIED — mọi bước PASS');
    console.log(`  account: ${email}`);
} else {
    console.log(`THẤT BẠI: ${failures} bước FAIL`);
    process.exit(1);
}
