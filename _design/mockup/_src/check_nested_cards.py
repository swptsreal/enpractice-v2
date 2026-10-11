"""Prove that no generated screen nests a card inside a card.

A card inside a card manufactures false depth, and it was one of the patterns
v1 repeated most (card > card > card across the results, progress and profile
screens). This is the check that holds the `.rowbox` fix in place.

Run:  python _design/mockup/_src/check_nested_cards.py
Exit code is non-zero when any screen nests a card.
"""
import io, os, re, sys
from html.parser import HTMLParser

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
VOID = {
    'br', 'img', 'input', 'hr', 'meta', 'link', 'path', 'circle', 'rect',
    'ellipse', 'use', 'polygon', 'line', 'stop', 'source', 'col', 'area',
    'track', 'wbr', 'base', 'param', 'embed',
}


class Cards(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []          # (tag, is_card)
        self.depth = 0           # how many cards are currently open
        self.out = []            # (depth, line, classes)

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        classes = dict(attrs).get('class', '') or ''
        is_card = 'card' in classes.split()
        if is_card:
            self.out.append((self.depth, self.getpos()[0], classes))
            self.depth += 1
        self.stack.append((tag, is_card))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        while self.stack:
            t, is_card = self.stack.pop()
            if is_card:
                self.depth -= 1
            if t == tag:
                break


def main():
    names = sorted(f for f in os.listdir(ROOT) if re.match(r'^\d\d-.*\.html$', f))
    failures = 0
    for name in names:
        src = open(os.path.join(ROOT, name), encoding='utf-8').read()
        p = Cards()
        p.feed(src)
        p.close()
        nested = [row for row in p.out if row[0] > 0]
        if nested:
            failures += len(nested)
            print(f'{name}: {len(nested)} nested card(s)')
            for depth, line, classes in nested[:8]:
                print(f'    depth {depth}  line {line}  class="{classes}"')

    print(f'\nchecked {len(names)} screens')
    if failures:
        print(f'FAIL: {failures} nested card(s)')
        return 1
    print('PASS: zero nested cards (every inset row uses .rowbox)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
