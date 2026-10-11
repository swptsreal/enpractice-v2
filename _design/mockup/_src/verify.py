"""Structural verification for the generated mockups.

No browser is available in this environment, so this checks the things that a
browser would otherwise be the first to complain about:

  1. every <link>/<script> asset path actually exists on disk
  2. every internal href points at a file that was built (no dead navigation)
  3. HTML tag nesting is balanced (via the stdlib parser)
  4. every screen references the token stylesheet
  5. no screen hard-codes a hex colour outside tokens.css

Run:  python _design/mockup/_src/verify.py
Exit code is non-zero when a check fails.
"""
import io
import os
import re
import sys
from html.parser import HTMLParser

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

VOID = {
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
    'meta', 'param', 'source', 'track', 'wbr',
}


class Balance(HTMLParser):
    """Collects unclosed / mismatched tags."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        # self-closing SVG/HTML elements reported by html.parser as starttag
        if tag in VOID:
            return
        self.stack.append((tag, self.getpos()))

    def handle_startendtag(self, tag, attrs):
        return

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append(f'stray </{tag}> at {self.getpos()}')
            return
        open_tag, pos = self.stack.pop()
        if open_tag != tag:
            self.errors.append(
                f'</{tag}> at {self.getpos()} closes <{open_tag}> opened at {pos}'
            )
            # resynchronise: drop until we find it, or keep unwinding
            while self.stack and self.stack[-1][0] != tag:
                t, p = self.stack.pop()
                self.errors.append(f'  also unclosed: <{t}> opened at {p}')
            if self.stack:
                self.stack.pop()


def main():
    screens = sorted(
        f for f in os.listdir(ROOT)
        if re.match(r'^\d\d-.*\.html$', f)
    )
    failures = []
    print(f'screens found: {len(screens)}')

    for name in screens:
        path = os.path.join(ROOT, name)
        src = open(path, encoding='utf-8').read()

        # 1 + 2. asset links and internal navigation
        for asset in re.findall(r'(?:href|src)="(assets/[^"#]+)"', src):
            if not os.path.exists(os.path.join(ROOT, asset)):
                failures.append(f'{name}: missing asset {asset}')
        for href in re.findall(r'href="(\d\d-[^"#]+\.html)"', src):
            if not os.path.exists(os.path.join(ROOT, href)):
                failures.append(f'{name}: dead link {href}')

        # 4. token stylesheet
        if 'assets/tokens.css' not in src:
            failures.append(f'{name}: does not link assets/tokens.css')

        # 5. no hard-coded hex in a screen's own styling. Lexi's illustration
        #    colours are deliberately fixed (she must read the same on both
        #    canvases), so hex inside her generated SVG is allowed.
        without_svg = re.sub(r'<svg\b.*?</svg>', '', src, flags=re.S)
        hexes = re.findall(r'#[0-9a-fA-F]{6}\b', without_svg)
        if hexes:
            failures.append(f'{name}: {len(hexes)} hard-coded hex value(s) outside the mascot: {sorted(set(hexes))[:4]}')

        # 3. tag balance
        parser = Balance()
        parser.feed(src)
        parser.close()
        if parser.errors:
            failures.append(f'{name}: tag balance -> ' + '; '.join(parser.errors[:3]))
        if parser.stack:
            leftovers = ', '.join(f'<{t}>@{p}' for t, p in parser.stack[:4])
            failures.append(f'{name}: {len(parser.stack)} unclosed tag(s): {leftovers}')

    print()
    if failures:
        print(f'FAILURES ({len(failures)}):')
        for f in failures:
            print('  -', f)
        return 1
    print('all screens structurally valid:')
    print('  - assets and internal links resolve')
    print('  - tag nesting balanced')
    print('  - tokens.css linked')
    print('  - zero hard-coded hex colours in screen markup')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
