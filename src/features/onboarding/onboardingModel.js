/**
 * Màn onboarding (screen 03) dưới dạng DỮ LIỆU, không phải JSX.
 *
 * Tách khỏi trang vì ba thứ ở đây cần test được mà không phải render:
 * bước nào tồn tại, mỗi bước có lựa chọn gì, và payload gửi lên backend.
 *
 * HAI QUYẾT ĐỊNH KHÁC MOCKUP, cả hai đều vì không được bịa dữ liệu:
 *
 *  1. **Band là từng mốc 0.5, không phải dải "6.0 – 6.5" như mockup.** Backend chỉ có
 *     MỘT trường `targetIeltsBand` (Float). Với một dải, client buộc phải tự chọn một
 *     con số đại diện (trung bình cộng 6.25) — đó là con số người dùng chưa từng nói,
 *     và nó sẽ hiện lại nguyên văn trên trang Cá nhân. Chọn mốc thật thì giá trị lưu
 *     đúng bằng thứ người dùng bấm.
 *
 *  2. **Bước 2 hỏi MỘT kỹ năng khó nhất, không phải tự đánh giá cả 4 kỹ năng.**
 *     `user_profiles.preferredSkill` là một chuỗi duy nhất; không có cột nào giữ vector
 *     4 mức tự đánh giá. Hỏi 4 mức rồi chỉ lưu 1 giá trị suy diễn ("kỹ năng bị đánh giá
 *     thấp nhất") là thu thập dữ liệu rồi vứt đi, và khi 4 mức bằng nhau thì suy diễn đó
 *     còn sai. Hỏi đúng câu mà backend trả lời được.
 *
 * Giá trị kỹ năng là CHUỖI HOA (`LISTENING`...), khớp với cách v1 và app mobile ghi vào
 * `preferredSkill` — xem `en-practice/docs/mobile/...phase-9...md`: "machine value, không
 * gửi label hiển thị". Nhãn hiển thị lấy từ `skillLabelKey()` của module IELTS để ánh xạ
 * HOA → key i18n chữ thường chỉ tồn tại ở một chỗ.
 */

/** Bốn bước, đúng thứ tự trong SCREENS-V2 §03. */
export const ONBOARDING_STEPS = ['goal', 'skill', 'time', 'confirm'];

/** Hai trạng thái client được phép gửi. `NOT_STARTED` là mặc định của server, không gửi lên. */
export const ONBOARDING_STATUS = Object.freeze({
    COMPLETED: 'COMPLETED',
    SKIPPED: 'SKIPPED',
});

/**
 * `band: null` = "Chưa xác định" — gửi lên bằng cách KHÔNG gửi trường nào, nên mục tiêu
 * cũ (nếu có) được giữ nguyên. Đây là lựa chọn mà SCREENS-V2 mô tả: "Skipping sets the
 * goal to chưa xác định and Lexi infers it after the first scored attempt".
 */
export const BAND_OPTIONS = [
    { band: 5.0, whyKey: 'onboarding.goal.foundation' },
    { band: 5.5, whyKey: 'onboarding.goal.foundation' },
    { band: 6.0, whyKey: 'onboarding.goal.common' },
    { band: 6.5, whyKey: 'onboarding.goal.common' },
    { band: 7.0, whyKey: 'onboarding.goal.precision' },
    { band: 7.5, whyKey: 'onboarding.goal.precision' },
    { band: null, titleKey: 'onboarding.unset', whyKey: 'onboarding.goal.unknownWhy' },
];

export const SKILL_OPTIONS = [
    { value: 'LISTENING', whyKey: 'onboarding.skill.whyListening' },
    { value: 'READING', whyKey: 'onboarding.skill.whyReading' },
    { value: 'WRITING', whyKey: 'onboarding.skill.whyWriting' },
    { value: 'SPEAKING', whyKey: 'onboarding.skill.whySpeaking' },
    { value: null, titleKey: 'onboarding.skill.unknown', whyKey: 'onboarding.skill.unknownWhy' },
];

export const MINUTE_OPTIONS = [
    { value: 10, titleKey: 'onboarding.time.opt10', whyKey: 'onboarding.time.why10' },
    { value: 20, titleKey: 'onboarding.time.opt20', whyKey: 'onboarding.time.why20' },
    { value: 30, titleKey: 'onboarding.time.opt30', whyKey: 'onboarding.time.why30' },
    { value: 45, titleKey: 'onboarding.time.opt45', whyKey: 'onboarding.time.why45' },
    { value: 60, titleKey: 'onboarding.time.opt60', whyKey: 'onboarding.time.why60' },
];

/** Nhãn của một mốc band. `null` không có nhãn số — nó có `titleKey` riêng. */
export function bandTitle(option) {
    return option.band == null ? null : option.band.toFixed(1);
}

/** Thanh tiến độ của mockup: 25 / 50 / 75 / 100, không phải chỉ số bước. */
export function progressFor(step) {
    const index = ONBOARDING_STEPS.indexOf(step);
    if (index < 0) return 0;
    return Math.round(((index + 1) / ONBOARDING_STEPS.length) * 100);
}

/**
 * Giá trị đang có trên tài khoản, dùng để mở lại onboarding mà không xoá lựa chọn cũ.
 *
 * `dailyGoalMinutes` của tài khoản mới là 30 (backend đặt mặc định) — hiện nó là đúng
 * thực tế, không phải gợi ý của client.
 */
export function readOnboardingAnswers(profile) {
    const goals = profile?.goals ?? null;
    return {
        band: goals?.targetIeltsBand ?? null,
        skill: goals?.preferredSkill ?? null,
        minutes: goals?.dailyGoalMinutes ?? null,
    };
}

/**
 * Body của `PUT /user/profile/onboarding`.
 *
 * Trường nào không có giá trị thì KHÔNG gửi: backend chỉ áp dụng trường khác null, nên
 * bỏ qua một câu hỏi nghĩa là "giữ nguyên cái đang có", không phải "xoá đi".
 *
 * `version` lấy từ `onboarding.requiredVersion` của server, không hardcode ở client —
 * nếu client tự đặt số, một lần bump version ở backend sẽ khiến mọi client cũ gửi sai số.
 */
export function buildOnboardingPayload({ status, band, skill, minutes }, version) {
    const payload = { status, version };
    if (typeof band === 'number') payload.targetIeltsBand = band;
    if (typeof skill === 'string' && skill.length > 0) payload.preferredSkill = skill;
    if (typeof minutes === 'number') payload.dailyGoalMinutes = minutes;
    return payload;
}
