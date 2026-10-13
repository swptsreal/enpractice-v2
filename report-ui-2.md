## Rà soát UI lần 2

- Layout tổng: scroll trong content chứ không phải cả header như hiện tại
- Màn /vocabulary/check đang hiển thị ở dạng guest (full screen, header login)
- Ws hệ thống chưa kết nối thành công, màn /ai-chat khi gửi không có response, tương tự với màn speaking, custom-speaking
- Màn ielts/take đang scroll page nên xảy ra trường hợp nếu đoạn văn dài thì pagination sẽ bị đẩy xuống dưới
- profile cơ bản trên header: chưa có popover, chưa render avatar, chưa có membership api/auth/me
- Màn path: mục tiêu band render chưa hợp lý, lỗi {{nodes}} bài · 1 bài kiểm tra cuối unit, Unit tiếp theo render chưa center
- Bubble Hỏi Lexi đang chỉ là redirect, mong muốn hiển thị popup chat
- màn vocabulary/result lỗi vocabularyTestApi.getAttempt is not a function at useVocabularyTest.js:449:14

Cần redesign mockup và code lại

- Màn rewards: Đang trình bày tất cả theo chiều dọc, inventory chưa hợp lý

Lưu ý:

- Khi kiểm tra các màn, đối chiếu lại với mockup, nếu có khác biệt phải báo cáo lại. Cần thay đổi thiết kế thì phải đi từ mockup
- Phải test đầy đủ playwright
