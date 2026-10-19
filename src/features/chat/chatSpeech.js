/**
 * What Lexi's answer SOUNDS like.
 *
 * The coach answers in markdown (headings, bold, ordered lists, links), and the TTS endpoint
 * synthesises exactly the string it is given. Sending the raw markdown makes it read the
 * punctuation out loud — "asterisk asterisk matching" — so the text is reduced to prose first.
 *
 * Deliberately conservative: it removes FORMATTING and keeps WORDS. It does not summarise, drop
 * examples or reorder anything, because the spoken version has to be the same answer the learner
 * is reading, not a paraphrase of it.
 */
export function stripMarkdownForSpeech(markdown) {
    if (!markdown) return '';

    let text = String(markdown);

    /* Fenced and inline code: the fences are punctuation, the content is words. */
    text = text.replace(/```[a-zA-Z0-9]*\n?/g, ' ').replace(/`/g, ' ');

    /* Links and images become their label (or nothing at all for an image with no alt). */
    text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

    /* Headings, quotes and list markers. `1.` becomes nothing: the number IS the marker. */
    text = text.replace(/^\s{0,3}#{1,6}\s+/gm, '');
    text = text.replace(/^\s{0,3}>\s?/gm, '');
    text = text.replace(/^\s{0,3}[-*+]\s+/gm, '');
    text = text.replace(/^\s{0,3}\d+[.)]\s+/gm, '');

    /* Emphasis markers, and markdown's horizontal rule. */
    text = text.replace(/(\*\*|__|\*|_)/g, '');
    text = text.replace(/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/gm, '');

    /* Table pipes read as "pipe" if they survive, and no table belongs in speech. */
    text = text.replace(/\|/g, ' ');

    /* Collapse the whitespace the removals left behind. */
    return text.replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '. ').replace(/\s+([.,!?;:])/g, '$1').trim();
}
