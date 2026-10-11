"""WCAG 2.1 contrast verification for the EN Practice v2 palette.

Every token pair used in the shipped UI is measured here so the design doc can
quote real numbers instead of assumed ones. Run:  python contrast_check.py
"""

from __future__ import annotations

# ---------------------------------------------------------------- palette ---
# Brand: "Lexi's Night Flight". Teal = sky/feathers, amber = owl eyes + XP.
# Dark ink carries a teal cast (hue 196) rather than neutral grey.
C = {
    "light": {
        "primary": "#0E7C6B",
        "primary-strong": "#0A6355",
        "primary-soft": "#E4F5F0",
        "accent": "#F5B32E",
        "accent-soft": "#FDF3DC",
        "canvas": "#FBF8F2",
        "surface": "#FFFFFF",
        "surface-alt": "#F3F0E8",
        "ink": "#14232B",
        "ink-soft": "#3B525E",
        "ink-muted": "#5E7683",
        "ink-faint": "#8FA3AD",
        "border": "#E4E0D4",
        # 3:1 against BOTH canvas and surface, because this is the border of
        # text inputs, selected answer tiles and the sidebar rail - a meaningful
        # boundary, not a divider. WCAG 2.1 SC 1.4.11.
        "border-strong": "#8B8674",
        "success": "#12855A",
        "warning": "#9C5809",
        "danger": "#C93B36",
        "info": "#0B6E8F",
        "wrong-dark": "#8E228E",
    },
    "dark": {
        "primary": "#4FCDB6",
        "primary-strong": "#7ADDC9",
        "primary-soft": "#123B37",
        "accent": "#F7C455",
        "accent-soft": "#3C2F12",
        "canvas": "#0C161B",
        "surface": "#14232B",
        "surface-alt": "#1C2F38",
        "ink": "#EAF4F2",
        "ink-soft": "#B9CECB",
        "ink-muted": "#8DA5A3",
        "ink-faint": "#647C7B",
        "border": "#25393F",
        "border-strong": "#647C7B",
        "success": "#4BD08B",
        "warning": "#E8A838",
        "danger": "#F07C74",
        "info": "#5CC2E0",
        "wrong-dark": "#D48CE0",
    },
}

# action label colour to test against each filled surface
ACTION_LABEL = {"light": "#FFFFFF", "dark": "#0C161B"}

# ------------------------------------------------------------- contrast -----
def srgb_to_lin(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
    return 0.2126 * srgb_to_lin(r) + 0.7152 * srgb_to_lin(g) + 0.0722 * srgb_to_lin(b)


def ratio(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


# ------------------------------------------------------------------ tests ---
# (label, foreground token, background token, required ratio)
TESTS = [
    # primary action label on every filled primary state
    ("action label on primary", "label", "primary", 4.5),
    ("action label on primary-strong", "label", "primary-strong", 4.5),
    # amber CTA (XP / continue) - dark ink label, not white
    ("dark ink on accent", "accent-ink", "accent", 4.5),
    # body + heading ink over both canvases
    ("ink on canvas", "ink", "canvas", 4.5),
    ("ink on surface", "ink", "surface", 4.5),
    ("ink on surface-alt", "ink", "surface-alt", 4.5),
    ("ink-soft on canvas", "ink-soft", "canvas", 4.5),
    ("ink-soft on surface", "ink-soft", "surface", 4.5),
    # metadata tier: 4.5 is the floor for real sentences
    ("ink-muted on canvas", "ink-muted", "canvas", 4.5),
    ("ink-muted on surface", "ink-muted", "surface", 4.5),
    # accent text (links, active nav)
    ("primary text on canvas", "primary", "canvas", 4.5),
    ("primary text on surface", "primary", "surface", 4.5),
    ("primary text on primary-soft", "primary", "primary-soft", 4.5),
    # status semantics are text too
    ("success on surface", "success", "surface", 4.5),
    ("warning on surface", "warning", "surface", 4.5),
    ("danger on surface", "danger", "surface", 4.5),
    ("info on surface", "info", "surface", 4.5),
    # borders + focus rings: 3:1 non-text floor
    ("border-strong on canvas", "border-strong", "canvas", 3.0),
    ("border-strong on surface", "border-strong", "surface", 3.0),
    ("primary focus ring on canvas", "primary", "canvas", 3.0),
]

# tokens that must NOT be used for text (reported separately)
DECORATION_ONLY = [
    ("ink-faint on canvas", "ink-faint", "canvas"),
    ("ink-faint on surface", "ink-faint", "surface"),
    ("border on canvas", "border", "canvas"),
]


def token(mode: str, name: str) -> str:
    if name == "label":
        return ACTION_LABEL[mode]
    if name == "accent-ink":
        # the dark-mode accent is lighter, so it still takes dark ink; in light
        # mode the amber is mid-lightness and also takes the dark ink.
        return "#14232B"
    return C[mode][name]


def main() -> int:
    failures: list[str] = []
    print("=" * 78)
    print("EN PRACTICE v2 - WCAG 2.1 CONTRAST AUDIT")
    print("=" * 78)
    for mode in ("light", "dark"):
        print(f"\n--- {mode.upper()} ---")
        print(f"{'pair':<38}{'ratio':>8}{'need':>7}  verdict")
        print("-" * 78)
        for label, fg, bg, need in TESTS:
            r = ratio(token(mode, fg), token(mode, bg))
            ok = r >= need
            if not ok:
                failures.append(f"{mode}: {label} = {r:.2f} < {need}")
            print(
                f"{label:<38}{r:>8.2f}{need:>7.1f}  {'PASS' if ok else '*** FAIL'}"
            )
        print("\n  decoration-only tokens (must never carry a sentence):")
        for label, fg, bg in DECORATION_ONLY:
            r = ratio(token(mode, fg), token(mode, bg))
            print(f"    {label:<34}{r:>8.2f}  {'ok as decoration' if r < 4.5 else 'HIGH - move to text tier'}")

    print("\n" + "=" * 78)
    if failures:
        print(f"FAILURES ({len(failures)}):")
        for f in failures:
            print("  -", f)
        return 1
    print("ALL REQUIRED PAIRS PASS.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
