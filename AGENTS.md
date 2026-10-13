# Agent Instructions

Mọi thay đổi UI, UX, copy trên màn, state flow và kiến trúc trong repo này phải đi qua mockup trước.

## Nguồn chuẩn bắt buộc

- **Mockup là nguồn chuẩn duy nhất cho những gì hiện trên màn hình.** Sinh ra từ dữ liệu ở
  `_design/mockup/_src/screens-{a,b,c,d}.mjs`, build bằng `node _design/mockup/_src/build.mjs`.
  Mỗi frame có `file`, `title`, `subtitle`, `group`, `note`, `body` — phần `note` **là một phần của
  thiết kế**, không phải chú thích.
- Đọc và áp dụng: `_design/SCREENS-V2.md` (từng màn: route, layout, anatomy, state, responsive) và
  `_design/DESIGN-V2.md` (token, type, shape, danh sách bị cấm ở §13).
- Thứ tự bắt buộc khi một khẳng định mới xuất hiện trên màn hình:
  **mockup → `_design/SCREENS-V2.md` → code.** Không có đường tắt từ code lên màn hình.
- Ưu tiên component nền trong `src/components/ui` (`Card`, `RowBox`, `Button`, `Chip`, `Stat`,
  `ProgressBar`, `Band`, `AsyncBoundary`) và token trong `src/styles/tokens.css` thay vì hardcode
  màu, radius, spacing, typography.

## Quy tắc thực thi bắt buộc

- **Không bịa thông tin trên màn mà không thông qua mockup.** Không tự thêm câu mô tả, note, lưu ý,
  nhãn phụ, caption, dòng giải thích, hay con số mà frame không vẽ. Nếu thấy cần một dòng chữ mới,
  việc phải làm là sửa mockup trước, rồi ghi vào `SCREENS-V2.md`, rồi mới tới code.
- **Đối chiếu lại với mockup khi kiểm tra màn.** Mọi khác biệt phải báo cáo lại, không tự quyết.
  Cần thay đổi thiết kế thì phải đi từ mockup.
- **A11y không phải "bịa".** `aria-label`, `sr-only`, `role`, trạng thái `loading`/`empty`/`error`
  được phép giữ kể cả khi frame không vẽ — màn trắng hoặc nút không có tên là lỗi thật. Chỉ chữ
  **hiển thị** mới chịu luật mockup.
- Chỉ thêm UI phục vụ trực tiếp mục tiêu chính của màn hình. Không hiển thị thông tin trùng lặp,
  debug, kỹ thuật, hay nhãn nội bộ.
- Không lồng card trong card — inset row dùng `RowBox`. Không màu literal ngoài `tokens.css`.
  Màu không bao giờ là tín hiệu duy nhất (kèm glyph + nhãn).
- Nút bấm được thì phải giải thích được vì sao bị vô hiệu — không để nút disabled trần.
- i18n: `src/i18n/locales/*` là **file sinh ra**, `src/i18n/seed/*` là đầu vào. `npm run locales:merge`
  hiện đang bị chặn bởi các namespace mồ côi, nên phải **sửa tay vào cả `seed/*` và `locales/*`**.
- Trước khi xong: chạy `npm run verify` (contrast + i18n + lint + test + build) và 3 gate mockup
  `verify.py`, `check_nested_cards.py`, `check_review_frames.py` — tất cả phải exit 0.

## Kiểm thử

- Phải test đầy đủ playwright cho màn vừa sửa.
- **Không chạy full e2e suite nhiều lần** — một lượt tốn ~20 phút. Chạy theo từng màn
  (`npx playwright test e2e/<spec>.spec.js`), hoặc gom hết thay đổi rồi chạy một lần.
- Luôn assert **mọi** request body, không assert số lượng request: React StrictMode gọi loader hai
  lần trong dev nên số request khác giữa dev và prod.
- Logic không tầm thường phải để lại một check chạy được (unit test, hoặc assert).

## Windows / PowerShell

Repo này phát triển trên Windows. Dùng PowerShell, ưu tiên `Get-Content` / `Set-Content` /
`Copy-Item` / `Move-Item` / `Remove-Item`. Với sửa text phức tạp thì dùng Python thay vì shell.
Không dùng `apply_patch`, here-doc, `sed -i`, `perl -pi`. Giữ nguyên encoding và line ending của
file đang có; file mới ghi UTF-8 không BOM.

Nếu có xung đột, ưu tiên `_design/SCREENS-V2.md` và `_design/DESIGN-V2.md`.
