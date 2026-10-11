Rà soát UI lần 1

- UI chung

* lỗi i18 ielts.difficulty.EASY
* scroll chưa tính header
* toggle dark/light theme chưa hoạt động

- Màn ielts list

* item: title - questions - time quá gần nhau
* nút chuyển listening/reading không hoạt động
* listening/reading và dễ/trung bình/khó tag cần có màu riêng

- Màn ielts take

* Câu hỏi phải render ở dạng markdown

- màn dictionary

* toggle favorite màn có load lại, từ đó bị đẩy xuống cuối danh sách
* Từ mới thêm cũng bị đẩy xuống cuối list

- Màn writing/task/{id}

* lỗi useCredit must be used inside CreditProvider

- màn writing list

* item: Nút viết bài và xem kết quả lệch ui

- màn speaking practice

* lỗi useCredit must be used inside CreditProvider

- màn vocabulary check

* Mất UI hệ thống, chỉ còn lại card nhập từng

- Vocabulary test

* Bấm +5 -> loop api /api/vocabulary-tests

- màn profile

* chưa render avatarUrl
* chưa thể hiện dictionaryStats, vocabProgress, weekSkills, bandProgress

- màn reward

* chỉ thấy gọi xp history
* chưa có xp-milestones, reward-missions, user/inventory
