# scripts/ — verify scripts & fixture mode

Các script `dev-verify-*.mjs` chạy thẳng vào backend thật (`http://localhost:8082/api`) và
hầu hết đều khiến backend gọi AI **qua 9router (local gateway, tính token thật, tốn tiền)**.
Vì vậy mọi bước sinh AI đều có **fixture mode** để chạy lại miễn phí.

## Hai chế độ

| | Lệnh | Hành vi |
|---|---|---|
| **replay** (mặc định) | `node scripts/dev-verify-ielts-flow.mjs <email> <password>` | Đọc kết quả đã ghi từ `scripts/fixtures/…`. **Không gọi AI.** |
| **live** | `node scripts/dev-verify-ielts-flow.mjs <email> <password> --live` | Gọi backend thật cho các bước AI **và ghi/refresh fixture**. |

`--live` in cảnh báo ngay đầu (liệt kê bước gọi AI + bước tốn credit) trước khi chạm mạng:

```
==============================================================================
!! CHẾ ĐỘ --live: các bước dưới đây gọi AI THẬT qua 9router — token thật, tốn tiền
==============================================================================
  script  : scripts/dev-verify-explain-stream.mjs
  fixture : scripts/fixtures/explain-stream/
  Bước gọi AI:
    1. explain.stream             STOMP /app/vocabulary/explain (word="mitigate")
  Bước TỐN CREDIT:
    - explain.stream → AI_EXPLAIN
  Login và các GET danh sách/chi tiết vẫn gọi backend thật, nhưng không gọi AI.
  Chỉ dùng --live khi thật cần thiết.
```

> ⚠️ **Chỉ dùng `--live` khi thật cần.** Mỗi lần chạy `--live` là request AI thật qua
> 9router, tính token/credit thật. Replay là mặc định chính vì lý do đó.

## Fixture nằm ở đâu

```
scripts/fixtures/<tên-script>/<key>.json
```

`<key>` là **nhãn ổn định do script tự đặt** (`ielts.start`, `explain.stream`,
`custom-speaking.turn.1`…), **không** phải URL thô — backend sinh id mới mỗi lần chạy nên
key theo URL sẽ luôn miss.

Nội dung file:

```json
{
  "script": "ielts-flow",
  "key": "ielts.start",
  "recordedAt": "2026-01-01T00:00:00.000Z",
  "value": { "attemptId": "…", "testDetail": { "…": "…" } }
}
```

`value` là nguyên văn thứ bước đó trả về. Đừng sửa tay: muốn ghi lại thì xoá file (hoặc cả
thư mục) rồi chạy `--live`.

## Thiếu fixture thì sao

**Không bao giờ tự động fallback sang live.** Ở chế độ replay, script kiểm tra fixture bắt
buộc **trước khi** gọi mạng (kể cả login) và dừng ngay:

```
$ node scripts/dev-verify-ielts-flow.mjs <email> <password>
Chế độ replay: thiếu 2 fixture cho dev-verify-ielts-flow.mjs:
  - scripts/fixtures/ielts-flow/ielts.start.json
  - scripts/fixtures/ielts-flow/ielts.submit.json
  Ghi tất cả bằng: node scripts/dev-verify-ielts-flow.mjs --live
Thiếu fixture scripts/fixtures/ielts-flow/ielts.start.json — chạy: node scripts/dev-verify-ielts-flow.mjs --live
$ echo $?
1
```

## Bước nào được ghi fixture

Chỉ bước **sinh ra AI**. Login và mọi GET danh sách/chi tiết **luôn live** (JWT hết hạn;
id của lần chạy cũ không dùng lại được).

| Script | Key fixture (bước AI) |
|---|---|
| `dev-verify-ielts-flow.mjs` | `ielts.start`, `ielts.submit` |
| `dev-verify-writing-flow.mjs` | `writing.submit`, `writing.poll` |
| `dev-verify-speaking-flow.mjs` | `speaking.submit`, `speaking.poll` |
| `dev-verify-vocabulary-flow.mjs` | `vocabulary.generate`, `vocabulary.pollReady`, `vocabulary.start`\*, `vocabulary.submit`\* |
| `dev-verify-explain-stream.mjs` | `explain.stream` (STOMP, tốn credit `AI_EXPLAIN`) |
| `dev-verify-chat-stream.mjs` | `chat.turn` (STOMP, tốn credit `AI_CHAT`) |
| `dev-verify-custom-speaking.mjs` | `custom-speaking.start`, `custom-speaking.turn.1`, `custom-speaking.finish` |

\* Chỉ chạy khi test sinh ra đạt `READY`, nên được đánh dấu `required: false` (thiếu cũng
không chặn replay; gặp đúng bước đó mà chưa có fixture thì vẫn fail rõ ràng).

Vài điểm đáng lưu ý khi replay:

- **Luồng poll** (`writing.poll`, `speaking.poll`, `vocabulary.pollReady`) replay trả lại
  nguyên chuỗi status đã ghi **và kết quả cuối** — không sleep, không poll lại. Replay một
  luồng chấm bài mất ~0.1s thay vì 30–90s.
- **Stream (STOMP)** replay chỉ in kết quả cuối đã ghi, **không mở socket** — nên không thể
  tốn credit do replay.
- Replay **vẫn cần backend đang chạy** cho login và các GET không tốn AI.
- Đọc lại theo id đã ghi (`GET /ielts/attempts/{id}`, `GET …/vocabulary-tests/attempts/{id}`…)
  có thể 404 nếu DB backend đã reset; script in cảnh báo `[replay]` và bỏ qua, không tính là
  lỗi replay.
- Fixture là artifact local: `scripts/fixtures/` đã được thêm vào `.gitignore` (bản ghi mang
  id và câu trả lời của máy này, và hỏng khi DB được reset).

## Helper & test

- `scripts/lib/verifyFixtures.mjs` — `parseVerificationArgs()`, `createFixtures()`
  (`run` / `read` / `write` / `preflight` / `announceLive`).
- `scripts/lib/verifyFixtures.test.mjs` — test record + replay bằng thư mục tạm và producer
  giả, **không cần mạng**:

```bash
node --test scripts/lib/verifyFixtures.test.mjs
```

Test này cũng nằm trong `npm run test:node` (glob `scripts/lib/*.test.mjs`) và trong
`npm run verify`, nên nó không thể bị bỏ quên.

## Script không gọi AI

`dev-verify-onboarding-flow.mjs` kiểm tra trạng thái onboarding (`PUT /user/profile/onboarding`,
cột `user_profiles.onboarding_*`). Nó **không cần fixture** vì không gọi AI lần nào — chỉ
đăng ký hai tài khoản dùng-một-lần rồi ghi/đọc profile:

```bash
node scripts/dev-verify-onboarding-flow.mjs
API_URL=http://localhost:8083/api node scripts/dev-verify-onboarding-flow.mjs
```

## Biến môi trường

- `API_URL` (mặc định `http://localhost:8082/api`)
- `WS_URL` (mặc định `ws://localhost:8082`) — chỉ `dev-verify-explain-stream.mjs` và
  `dev-verify-chat-stream.mjs`

## Cách dùng thường gặp

```bash
# Chạy lại kiểm tra contract mà không tốn AI (mặc định)
node scripts/dev-verify-ielts-flow.mjs learner@example.com 'matkhau'

# Ghi/refresh fixture — CHỈ khi thật cần (tốn token AI thật)
node scripts/dev-verify-ielts-flow.mjs learner@example.com 'matkhau' --live

# Ghi lại đúng một bước: xoá fixture của bước đó rồi chạy --live
Remove-Item scripts/fixtures/writing-flow/writing.poll.json
node scripts/dev-verify-writing-flow.mjs learner@example.com 'matkhau' --live
```
