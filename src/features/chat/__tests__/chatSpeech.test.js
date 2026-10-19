import test from 'node:test';
import assert from 'node:assert/strict';
import { stripMarkdownForSpeech } from '../chatSpeech.js';

/**
 * Lexi answers in markdown and the TTS endpoint synthesises exactly the string it is given, so
 * the raw answer would be read aloud with its punctuation: "asterisk asterisk matching". These
 * pin the reduction to prose — and pin that it is a REDUCTION OF FORMATTING, not a rewrite.
 */
test('removes emphasis markers but keeps the words', () => {
    assert.equal(stripMarkdownForSpeech('**Ba bước:** đọc câu chủ đề'), 'Ba bước: đọc câu chủ đề');
    assert.equal(stripMarkdownForSpeech('Dùng *nghĩa*, không phải _từ_'), 'Dùng nghĩa, không phải từ');
});

test('drops heading and list markers, numbers included', () => {
    const answer = ['## Điểm mạnh', '- Trả lời đúng trọng tâm', '1. Đọc câu đầu', '2. Bỏ qua từ nối'].join('\n');
    const spoken = stripMarkdownForSpeech(answer);
    assert.equal(spoken.includes('#'), false);
    assert.equal(spoken.includes('-'), false);
    assert.match(spoken, /Điểm mạnh/);
    assert.match(spoken, /Đọc câu đầu/);
    /* The list markers are gone, so the order survives as word order rather than as "one dot". */
    assert.match(spoken, /Bỏ qua từ nối/);
});

test('keeps link labels and drops the URLs, because a URL read aloud is noise', () => {
    assert.equal(
        stripMarkdownForSpeech('Xem [bài mẫu](https://example.com/very/long/path) trước'),
        'Xem bài mẫu trước'
    );
});

test('keeps code content and drops the fences', () => {
    assert.equal(stripMarkdownForSpeech('```js\nconst a = 1;\n```'), 'const a = 1;');
    assert.equal(stripMarkdownForSpeech('gọi `map()` là xong'), 'gọi map() là xong');
});

test('handles empty and null without throwing', () => {
    assert.equal(stripMarkdownForSpeech(''), '');
    assert.equal(stripMarkdownForSpeech(null), '');
    assert.equal(stripMarkdownForSpeech(undefined), '');
});

test('does not paraphrase: every word of the answer survives', () => {
    const answer = 'Bạn hay chọn theo từ trùng — đó là lý do 3 câu sai lần trước.';
    const spoken = stripMarkdownForSpeech(answer);
    for (const word of ['chọn', 'từ trùng', '3 câu sai']) {
        assert.ok(spoken.includes(word), `missing "${word}" in "${spoken}"`);
    }
});
