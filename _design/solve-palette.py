"""Solve for the minimal token correction that makes each failing pair pass.

Keeps hue and saturation, moves lightness only, and reports the smallest move
that clears the threshold. Minimal moves are the point: the palette was chosen
deliberately, so a fix should be the least change that makes it legal rather
than a new palette.
"""
import colorsys
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return '#' + ''.join(f'{round(max(0, min(1, c)) * 255):02X}' for c in rgb)


def luminance(hex_color):
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = hex_to_rgb(hex_color)
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def move_lightness(hex_color, dl):
    """Return the colour with HSL lightness shifted by dl (fraction, -1..1)."""
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = max(0.0, min(1.0, l + dl))
    return rgb_to_hex(colorsys.hls_to_rgb(h, l, s))


def solve(fg, bg, need, direction):
    """Smallest |dl| on fg that reaches `need`. direction: -1 darker, +1 lighter."""
    step = 0.002 * direction
    current = fg
    for _ in range(400):
        current = move_lightness(fg, step)
        if ratio(current, bg) >= need:
            return current, ratio(current, bg)
        step += 0.002 * direction
    return None, ratio(current, bg)


CASES = [
    ('light ink-muted on surface-alt', '#5E7683', '#F3F0E8', 4.5, -1),
    ('light correct on correct-soft', '#12855A', '#E3F4EC', 4.5, -1),
    ('light wrong on wrong-soft', '#C93B36', '#FBE9E8', 4.5, -1),
    # check the neighbouring pairs do not regress when these move
    ('light ink-muted on canvas (after)', None, '#FBF8F2', 4.5, -1),
]

print(f"{'pair':<40}{'current':>9}{'new':>10}{'ratio':>8}")
print('-' * 70)
for label, fg, bg, need, direction in CASES:
    if fg is None:
        continue
    before = ratio(fg, bg)
    new, after = solve(fg, bg, need, direction)
    print(f'{label:<40}{before:>9.2f}{after:>10.2f}   {fg} -> {new}')

# show the resulting tokens as a block to paste
print()
resolved = {}
for label, fg, bg, need, direction in CASES:
    if fg is None:
        continue
    new, after = solve(fg, bg, need, direction)
    resolved[label] = (fg, new)

ink_muted = resolved['light ink-muted on surface-alt'][1]
print('proposed token values:')
print(f'  --ink-muted (light) : {ink_muted}')
print(f'  --correct   (light) : {resolved["light correct on correct-soft"][1]}')
print(f'  --wrong     (light) : {resolved["light wrong on wrong-soft"][1]}')
print()
print('verify neighbours with the new ink-muted:')
for bgname, bg in [('canvas', '#FBF8F2'), ('surface', '#FFFFFF'), ('surface-alt', '#F3F0E8')]:
    print(f'  ink-muted on {bgname:<12} {ratio(ink_muted, bg):.2f}')
