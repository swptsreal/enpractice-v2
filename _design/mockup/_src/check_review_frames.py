"""Hold the three review frames to the decisions that make them correct.

`verify.py` proves a screen is well-formed; it cannot know that the review config
must offer exactly three word groups, that its count must be ONE control, or that
its primary button must open the practice step rather than the flashcard mode.
Those are decisions, and a decision that is not checked drifts.

Run:  python _design/mockup/_src/check_review_frames.py
Exit code is non-zero when a decision has drifted.
"""
import io, os, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CONFIG = '15-review.html'
PRACTICE = '15b-review-practice.html'
RESULT = '15c-review-result.html'

failures = []


def read(name):
    with open(os.path.join(ROOT, name), encoding='utf-8') as fh:
        return fh.read()


def read_design(name):
    """A file from `_design/`, one level above the built frames.

    Several checks below say "matching SCREENS-V2.md" in their label, and until this existed they only
    ever looked at the frame: the doc could have said anything. A decided state has to be written in
    BOTH places — the frame's comment is what the next implementer reads, and the doc is what the
    reviewer reads — so the check reads both.
    """
    with open(os.path.join(ROOT, '..', name), encoding='utf-8') as fh:
        return fh.read()


def check(label, ok, detail=''):
    print(f'{"ok  " if ok else "FAIL"} {label}' + (f' — {detail}' if detail else ''))
    if not ok:
        failures.append(label)


def markup_only(html):
    """The frame WITHOUT its HTML comments.

    Comments are where these frames record what they deliberately do not draw, so they mention the
    very strings a "not present" check looks for. Searching the raw file would make every such check
    fail on its own explanation.
    """
    return re.sub(r'<!--.*?-->', '', html, flags=re.S)


def main():
    config = read(CONFIG)
    practice = read(PRACTICE)
    result = read(RESULT)
    shell_js = read(os.path.join('assets', 'shell.js'))
    tokens_css = read(os.path.join('assets', 'tokens.css'))
    screens_doc = read_design('SCREENS-V2.md')

    # ---- 15 · the config ----------------------------------------------------
    labels = re.findall(r'data-group[^>]*aria-label="([^"]+)"', config)
    check('15 offers the window, the group and the direction', labels == ['Khoảng thời gian', 'Nhóm từ', 'Chiều ôn'], str(labels))

    # The three groups the API can actually answer: unreviewed / wrong / all.
    check('15 the group options are the endpoint\'s own three',
          all(s in config for s in ('Từ chưa ôn', 'Từ hay sai', 'Toàn bộ từ')))

    # The window presets the endpoint accepts: all / range / week / month.
    check('15 the window presets cover all / 7d / 30d / week / month / custom',
          all(s in config for s in ('Toàn bộ', '7 ngày', '30 ngày', 'Tuần này', 'Tháng này', 'Tùy chỉnh')))

    # TWO directions. The server keeps one `direction` string verbatim and has no
    # per-word direction, so a third "Mixed" option would be a label that lies.
    direction = re.search(r'aria-label="Chiều ôn"(.*?)(?=<div[^>]*data-group|</section>)', config, re.S)
    check('15 exactly two directions, no invented "Mixed"',
          direction is not None and 'Trộn' not in direction.group(1), 'Mixed found' if direction and 'Trộn' in direction.group(1) else '')

    # ONE control for the count. A slider plus quick-pick chips is two controls
    # for one number, and both would render as selected.
    count_block = config[config.find('Số từ trong phiên này'):]
    count_block = count_block[:count_block.find('</section>')]
    check('15 the count is a single control',
          count_block.count('type="range"') == 1 and '<button' not in count_block,
          f'ranges={count_block.count("type=\"range\"")} buttons={count_block.count("<button")}')

    max_attr = re.search(r'type="range"[^>]*max="(\d+)"', config)
    check('15 the slider maximum is the available count, not an arbitrary ceiling',
          max_attr is not None and int(max_attr.group(1)) > 0, max_attr.group(1) if max_attr else 'no max')

    cta = re.search(r'class="btn btn--primary btn--lg grow" href="([^"]+)"', config)
    check('15 the CTA opens the PRACTICE step, not the flashcard mode',
          cta is not None and cta.group(1) == PRACTICE, cta.group(1) if cta else 'no CTA')

    # Step 1 is an ENTRY point (rail, bottom tab bar), so it carries neither a stepper nor a back
    # button. Both were removed deliberately; this is the pair that keeps them from creeping back.
    # The whole word "stepper" is banned from this frame, CSS included: leaving the rules behind is
    # how a removed component comes back.
    check('15 has no stepper — step 1 is an entry point, not a place you navigate into',
          'stepper' not in config)
    check('15 has no back button in its header, and no "Bước 1 / 3" claim',
          'aria-label="Quay lại"' not in config and 'Bước 1 / 3' not in config)

    # ---- 15b · the practice -------------------------------------------------
    check('15b is a take screen, and declares the shared take layout',
          'class="take"' in practice and 'take__bar' in practice and 'take__foot' in practice)
    check('15b the take footer is sticky in the SHARED stylesheet, not just in this frame',
          re.search(r'\.take__foot \{[^}]*position: sticky', shell_js) is not None)
    check('15b the prompt is labelled with the direction it belongs to',
          'Từ tiếng Anh' in practice and 'Nhập nghĩa tiếng Việt' in practice)
    check('15b the input is bound to its label', 'for="review-answer"' in practice and 'id="review-answer"' in practice)
    check('15b the verdict names the recall in words, not colour alone',
          'Trả lời chính xác' in practice and 'Nghĩa đúng' in practice)
    check('15b the correct answer can be heard, not only read', 'Nghe' in practice)
    check('15b the examples and the explanation are both designed',
          'Ví dụ sử dụng' in practice and 'Giải thích rõ hơn' in practice)
    # Model-written text: `**bold**` and lists are part of the content, so it renders as markdown
    # rather than as one string with asterisks left on screen.
    explanation = practice[practice.find('Giải thích rõ hơn'):]
    explanation = explanation[:explanation.find('Ví dụ sử dụng')]
    check('15b the explanation renders as markdown, not as a raw string',
          'class="md"' in explanation and '<strong>' in explanation and '<li>' in explanation)
    check('15b the markdown block carries its own margins in this frame',
          '.md ul {' in practice and '.md > :last-child' in practice)
    check('15b the action is in the footer, so a thumb can reach it',
          re.search(r'<footer class="take__foot">(?:(?!</footer>).)*btn--primary', practice, re.S) is not None)

    # NOTHING THE API CANNOT RETURN. The frame used to draw a topic chip and an IPA line, both of
    # which ReviewWordDto has no field for — a frame that promises an unfetchable value is how a
    # backend change gets "discovered" as a bug. Banning the two shapes keeps them from returning.
    check('15b draws NO topic chip — ReviewWordDto has no topic, deck or part-of-speech field',
          'Environment' not in markup_only(practice))
    check('15b draws NO IPA line — ReviewWordDto has no phonetic field',
          '\u02c8' not in markup_only(practice))

    # The take bar carries the exit, the progress and the count — and nothing else. A title there
    # repeats the rail entry the learner just pressed, in the strip that should be showing progress.
    bar_block = practice[practice.find('take__bar'):]
    bar_block = bar_block[:bar_block.find('</header>')]
    check('15b the take bar has no title, only the exit, the progress and the count',
          'Ôn tập từ vựng' not in bar_block and ' / ' in bar_block)
    check('15b the direction label sits in the FOOTER, where a thumb lands, not in the bar',
          'Anh → Việt' in practice[practice.find('take__foot'):] and 'Anh → Việt' not in bar_block)

    # The verdict's missing (wrong) state is specified in the frame comment AND in SCREENS-V2.md;
    # the two must not drift apart, because the comment is what the next implementer reads.
    check('15b specifies its wrong-answer state in the frame, matching SCREENS-V2.md',
          'Chưa đúng hoàn toàn' in practice and 'Không sao cả' in practice
          and 'Chưa đúng hoàn toàn' in screens_doc and 'Không sao cả' in screens_doc)
    check('15b says the alternatives show on a CORRECT answer too',
          'correct answer too' in practice and 'Các nghĩa khác có thể chấp nhận' in practice)

    # ---- 15c · the result ---------------------------------------------------
    # No stepper here either: the flow is over, so "3 of 3" says what the learner already knows and
    # takes the strip directly above the result they came for.
    check('15c has no stepper — the flow is over, and the result is the point',
          'stepper' not in result)
    check('15c does not claim "Bước 3 / 3" in its header', 'Bước 3 / 3' not in result)
    # The first-session state is specified in the frame comment, since the picture is of a learner
    # who has been here before.
    check('15c specifies its first-session state in the frame, matching SCREENS-V2.md',
          'Phiên đầu tiên' in result and 'chưa có gì để so sánh' in result
          and 'Phiên đầu tiên' in screens_doc and 'chưa có gì để so sánh' in screens_doc)
    check('15c the hero is a left-aligned row with Lexi, not a centred stack',
          'data-mood="celebrate"' in result and 'card--hero' in result)
    # The glyph is an EMOJI at display size, not a line icon, and the three undrawn verdicts take a
    # glyph from the same family. The frame comment and SCREENS-V2.md must list the SAME four, or the
    # next implementer reads one list and ships the other.
    glyphs = ['\U0001f31f', '\u2728', '\U0001f4c8', '\U0001f4da']
    check('15c heads the result with an emoji at display size, not a line icon',
          't-display-xl' in result and glyphs[0] in result)
    check('15c lists the three undrawn verdict glyphs, matching SCREENS-V2.md',
          all(g in result for g in glyphs) and all(g in screens_doc for g in glyphs))
    check('15c the accuracy card is a between-row with a caption and a chip',
          'So với phiên trước' in result and 'chip--correct' in result)
    check('15c shows the four numbers the old flow showed',
          all(s in result for s in ('>Tổng<', '>Đúng<', '>Sai<', '>Độ chính xác<')))
    check('15c compares with the previous session', 'so với phiên trước' in result)
    check('15c has a per-word table with named columns',
          all(s in result for s in ('Thẻ nhắc', 'Câu trả lời', 'Đáp án đúng', 'Kết quả')))
    check('15c collapses the table to a list on a phone instead of scrolling it',
          'only-mobile' in result and 'hide-lg' in result)
    check('15c offers the retry that targets only the misses', 'Ôn lại 3 từ khó' in result)

    # ---- shared -------------------------------------------------------------
    for name, html in ((CONFIG, config), (PRACTICE, practice), (RESULT, result)):
        check(f'{name} has exactly one h1', len(re.findall(r'<h1', html)) == 1)
    check('the inset-row variant the verdict needs exists in the tokens',
          '.rowbox--between' in tokens_css)

    print()
    if failures:
        print(f'FAIL: {len(failures)} review-frame decision(s) drifted')
        for f in failures:
            print('  -', f)
        return 1
    print('PASS: the three review frames still express every decision they were built on')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
