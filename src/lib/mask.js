/**
 * Che một phần email để màn hình nói được "mở hộp thư nào" mà không phơi địa chỉ đầy đủ lên màn hình
 * ai đó có thể nhìn cùng.
 */
export function maskEmail(email) {
    if (!email || typeof email !== 'string') return '';
    const at = email.indexOf('@');
    if (at < 1) return email;
    const local = email.slice(0, at);
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}***${email.slice(at)}`;
}
