/**
 * Verify the onboarding state added in v2.
 *
 * WHAT IT CHECKS, which no unit test can check at once: the DB column from
 * `migration/V75__user_profile_onboarding.sql`, the JPA mapping in `UserProfile`, and the
 * `PUT /user/profile/onboarding` contract all agree — plus the rule the FE depends on,
 * that `onboarding.required` flips to false once the wizard has been finished OR skipped.
 *
 * NO FIXTURES, ON PURPOSE. Nothing here calls the AI: the script writes profile fields and
 * registers throwaway accounts. There is no token cost on 9router and nothing worth
 * replaying, so the record/replay helper in `scripts/lib/verifyFixtures.mjs` would only add
 * indirection. It is safe to run as often as you like.
 *
 * Usage:
 *   node scripts/dev-verify-onboarding-flow.mjs
 *   API_URL=http://localhost:8083/api node scripts/dev-verify-onboarding-flow.mjs
 *
 * It creates accounts `v2onboard<stamp>@enpractice.test` (COMPLETED path) and
 * `v2onbskip<stamp>@enpractice.test` (SKIPPED path) with password `Verify12345`, and leaves
 * them behind — they are the cheapest way to get a "brand new user" on demand.
 */
const API = process.env.API_URL ?? 'http://localhost:8082/api';
const PASSWORD = 'Verify12345';

let failures = 0;

function check(label, condition, detail = '') {
    const mark = condition ? 'PASS' : 'FAIL';
    if (!condition) failures += 1;
    console.log(`  ${mark}  ${label}${detail ? ` — ${detail}` : ''}`);
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
        /* leave null; the caller prints the raw text */
    }
    return { status: res.status, json, text };
}

async function register(email, displayName) {
    const res = await call('/auth/register', { method: 'POST', body: { email, password: PASSWORD, displayName } });
    if (res.status !== 200 && res.status !== 201) {
        console.error(`register ${email} failed: HTTP ${res.status} ${res.text?.slice(0, 300)}`);
        process.exit(1);
    }
    return res.json.data.accessToken;
}

const stamp = Date.now();
const doneEmail = `v2onboard${stamp}@enpractice.test`;
const skipEmail = `v2onbskip${stamp}@enpractice.test`;

console.log(`API: ${API}\n`);

/* ---------------------------------------------------------------- COMPLETED path */
console.log(`1. Tài khoản mới ${doneEmail}`);
const doneToken = await register(doneEmail, 'Onboarding Probe');

const fresh = await call('/user/profile', { token: doneToken });
console.log(`   GET /user/profile -> HTTP ${fresh.status}`);
const freshOnboarding = fresh.json?.data?.onboarding;
check('có khối onboarding trong response', Boolean(freshOnboarding), JSON.stringify(freshOnboarding));
check('trạng thái ban đầu là NOT_STARTED', freshOnboarding?.status === 'NOT_STARTED');
check('server yêu cầu onboarding (required = true)', freshOnboarding?.required === true);
check('requiredVersion do server trả về', Number.isInteger(freshOnboarding?.requiredVersion), String(freshOnboarding?.requiredVersion));
check('tài khoản mới chưa có mục tiêu band', fresh.json?.data?.goals?.targetIeltsBand == null);

const summary = await call('/user/profile/summary', { token: doneToken });
check(
    'GET /user/profile/summary (endpoint shell dùng) cũng có khối onboarding',
    Boolean(summary.json?.data?.onboarding),
    `required=${summary.json?.data?.onboarding?.required}`
);

console.log('\n2. Gửi onboarding ở trạng thái hoàn thành');
const submitted = await call('/user/profile/onboarding', {
    method: 'PUT',
    token: doneToken,
    body: {
        status: 'COMPLETED',
        version: freshOnboarding?.requiredVersion ?? 1,
        targetIeltsBand: 6.5,
        preferredSkill: 'SPEAKING',
        dailyGoalMinutes: 45,
    },
});
console.log(`   PUT /user/profile/onboarding -> HTTP ${submitted.status}`);
if (submitted.status !== 200) console.log(`   ${submitted.text?.slice(0, 400)}`);
check('HTTP 200', submitted.status === 200);
const afterSubmit = submitted.json?.data?.onboarding;
check('trạng thái thành COMPLETED', afterSubmit?.status === 'COMPLETED');
check('onboarding KHÔNG còn required (không tự mở lại)', afterSubmit?.required === false);
check('ghi lại thời điểm hoàn thành', Boolean(afterSubmit?.completedAt), String(afterSubmit?.completedAt));
check('lưu targetIeltsBand', submitted.json?.data?.goals?.targetIeltsBand === 6.5);
check('lưu preferredSkill', submitted.json?.data?.goals?.preferredSkill === 'SPEAKING');
check('lưu dailyGoalMinutes', submitted.json?.data?.goals?.dailyGoalMinutes === 45);

console.log('\n3. Đọc lại để chắc chắn đã ghi vào DB');
const reread = await call('/user/profile', { token: doneToken });
check('band đọc lại đúng', reread.json?.data?.goals?.targetIeltsBand === 6.5, String(reread.json?.data?.goals?.targetIeltsBand));
check('skill đọc lại đúng', reread.json?.data?.goals?.preferredSkill === 'SPEAKING');
check('required đọc lại vẫn false', reread.json?.data?.onboarding?.required === false);

console.log('\n4. Validation phải trả 400 (không phải 500)');
const badBodies = [
    ['thiếu status và version', {}],
    ['status NOT_STARTED không được gửi lên', { status: 'NOT_STARTED', version: 1 }],
    ['giá trị enum sai', { status: 'BOGUS', version: 1 }],
    ['thiếu version', { status: 'COMPLETED' }],
    ['version = 0', { status: 'COMPLETED', version: 0 }],
    ['band ngoài 0..9', { status: 'COMPLETED', version: 1, targetIeltsBand: 12 }],
];
for (const [label, body] of badBodies) {
    const res = await call('/user/profile/onboarding', { method: 'PUT', token: doneToken, body });
    check(`${label} -> 400`, res.status === 400, `HTTP ${res.status}`);
}

console.log('\n5. PUT /user/profile (cũ) vẫn hoạt động và không đụng trạng thái onboarding');
const legacy = await call('/user/profile', { method: 'PUT', token: doneToken, body: { weeklyWordGoal: 70 } });
check('HTTP 200', legacy.status === 200, `HTTP ${legacy.status}`);
check('onboarding vẫn COMPLETED', legacy.json?.data?.onboarding?.status === 'COMPLETED');
check('weeklyWordGoal đã lưu', legacy.json?.data?.goals?.weeklyWordGoal === 70);

/* ------------------------------------------------------------------- SKIPPED path */
console.log(`\n6. Tài khoản thứ hai ${skipEmail} — bỏ qua onboarding`);
const skipToken = await register(skipEmail, 'Onboarding Skip Probe');
const skipProfile = await call('/user/profile', { token: skipToken });
const skipVersion = skipProfile.json?.data?.onboarding?.requiredVersion ?? 1;

const skipped = await call('/user/profile/onboarding', {
    method: 'PUT',
    token: skipToken,
    body: { status: 'SKIPPED', version: skipVersion },
});
console.log(`   PUT /user/profile/onboarding -> HTTP ${skipped.status}`);
check('HTTP 200', skipped.status === 200);
const skippedState = skipped.json?.data?.onboarding;
check('trạng thái SKIPPED', skippedState?.status === 'SKIPPED');
check('SKIPPED cũng tắt required (không hỏi lại)', skippedState?.required === false);
check('không tự bịa mục tiêu band', skipped.json?.data?.goals?.targetIeltsBand == null);
check('không tự bịa kỹ năng ưu tiên', skipped.json?.data?.goals?.preferredSkill == null);

const skipReread = await call('/user/profile/summary', { token: skipToken });
check(
    'summary đọc lại: SKIPPED vẫn required=false',
    skipReread.json?.data?.onboarding?.status === 'SKIPPED' && skipReread.json?.data?.onboarding?.required === false
);

/* ------------------------------------------------------------------------ summary */
console.log('\n----------------------------------------------------------------------');
if (failures === 0) {
    console.log('ONBOARDING FLOW VERIFIED — mọi bước PASS');
    console.log(`  account hoàn thành : ${doneEmail}`);
    console.log(`  account bỏ qua     : ${skipEmail}`);
} else {
    console.log(`THẤT BẠI: ${failures} bước FAIL`);
    process.exit(1);
}
