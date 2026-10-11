# EN Practice v2 — design package

Read in this order:

1. **[PROPOSAL.md](PROPOSAL.md)** — the recommendation. Design read, the audited problem in v1, the v2 direction, the tech-stack changes with verified versions, the rollout plan, the honest tradeoffs, and **five decisions that need your answer** (§9).
2. **[DESIGN-V2.md](DESIGN-V2.md)** — the design system. Tokens with measured contrast, type, shape, the press mechanic, motion, the Lexi mascot system, components, layout, gamification ethics, the accessibility floor, the banned list, and the verification gates.
3. **[SCREENS-V2.md](SCREENS-V2.md)** — all 36 screens, each with its route, layout archetype, anatomy, states, responsive behaviour and evidence confidence.

## Open the mockups

Open **`mockup/index.html`** in a browser. Nothing to install, no server required — every file is static and works straight off disk.

The explorer has:
- the **screen list** down the left, grouped like the product's navigation;
- a **Phone / Tablet / Desktop** width switch (review at **Phone** first — the screens are authored mobile-first, so phone width is the honest view);
- a **light / dark** switch, which flips both the explorer and the previewed screen;
- live interactions in the preview: tab switching, answer selection, switch toggles, and revealing an answer verdict.

The screens are also openable individually (`mockup/18-ielts-take.html`).

## Rebuild the mockups

They are compiled from data, so a design change is a token change plus a rebuild, not 36 hand-edits:

```powershell
node _design/mockup/_src/build.mjs            # regenerate all 36 screens + the explorer registry
python _design/mockup/_src/verify.py          # structural gate
python _design/mockup/_src/check_nested_cards.py  # depth gate
python _design/contrast_check.py              # WCAG gate
```

- `mockup/assets/tokens.css` — the single source of truth for colour, shape, motion and type.
- `mockup/assets/lexi.js` — the mood map onto the real Lexi illustrations, with their measured intrinsic sizes.
- `mockup/assets/*.webp` — Lexi, copied from [`assets/`](assets/) at build time so the mockups work offline.
- `mockup/assets/shell.js` — the icon set and the two navigation affordances.
- `mockup/_src/screens-{a,b,c,d}.mjs` — the screen definitions, one entry per screen.

## Lexi

Ten finished Lexi illustrations live in [`assets/`](assets/) and are used as-is — no illustration work is required for v2. They are mapped onto ten product states in `DESIGN-V2.md §7.2`: `idle`, `happy`, `sad`, `thinking`, `celebrate`, `explain`, `sleepy`, `excited`, `approve`, `coffee`.

**One thing to confirm: the provenance and licence of these files.** They were already present in the workspace before this build, with a July 2026 timestamp, and I could not establish where they came from.

## The two verification gates

Both are part of the deliverable, not a one-off check. They are the mechanism that keeps v1's problems from recurring: `contrast_check.py` caught **5 real failures** in my own first palette draft (an input border measuring 1.56:1, i.e. invisible), and `verify.py` catches dead links, unbalanced tags, missing token stylesheets and any hard-coded colour that leaks into screen markup.

`impeccable detect` results and the judgement made about every finding are recorded in **DESIGN-V2.md §14.1**, including the two genuine accessibility defects it found that were fixed rather than argued away.
