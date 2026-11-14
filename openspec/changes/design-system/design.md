# Design

## Context

Static React + TypeScript + Vite app (`app-shell`). The app already has plain-HTML `About` and `InvestigationDetail` screens and shared pieces in `app/src/components/` (`AiLabel`/`PsiTextLabel`, `NotAvailable`, `DataState`, `DataSourceNote`, `PsiLink`) with a minimal `styles.css` (7 tokens, system fonts). The mockup (`docs/design/`) is the visual reference; this change turns it into rules the team can build and test against. Behavior of each screen stays in its own change.

## Goals / Non-Goals

**Goals:** one token block; the same component looks everywhere; accessible by construction; a mockup-to-code mapping that costs little time.
**Non-Goals:** brand identity beyond these tokens, dark mode, animation, new components not in the mockup.

## Decisions

1. **Tokens live in one `:root` block in `app/src/styles.css`.** The existing names (`--text --background --muted --accent --border --gutter --target-size`) are kept so current screens keep working; the rest are added. Alternative: a CSS-in-JS or Tailwind setup; rejected (new dependency, no gain).
2. **sRGB hex values, not `oklch()`.** The mockup defines colors in `oklch()`; they were converted (conversion checked by recomputing contrast ratios from the hex). Reason: the current CSS uses hex, contrast checking is simpler, and no browser-support question remains.
3. **`--border-strong` is `#838992`, not the mockup's `#9aa0a8`.** The mockup value is 2.64:1 on white; WCAG 2.2 asks 3:1 for the border of an input. `#838992` is 3.52:1 on white and 3.29:1 on `--background`.
4. **Existing components are extended, not replaced.** `AiLabel`, `PsiTextLabel`, `NotAvailable`, `DataState` and `PsiLink` get the mockup look; new ones (`Marker`, `TagChip`, `CountLine`, `CitationBlock`, `ScoreBreakdown`) are added next to them. Label wording stays in `labelText.ts` (already tested).
5. **Markers use glyph + text + color.** Glyphs come from the mockup (`◐` unreviewed, `⊘` not assessed, `≈` approximate, `=` same, `≠` differs). They are plain Unicode text, so no icon font or image is needed. Alternative: inline SVG icons; rejected as extra work.
6. **Responsive header with one breakpoint at 640 px.** Below it, the nav list collapses behind a Menu button with `aria-expanded` and `aria-controls`; the skip link stays first.
7. **The mockup is never shipped.** Its "MOCKUP STATES" bar, sample placeholders ("Sample summary text", `10.xxxx/sample-placeholder`) and the `support.js` runtime stay out of `app/`. `support.js` is not even committed (license unverified, see `docs/design/README.md`).

Data flow: not applicable; this change renders data already loaded by `data-access`.

### Tokens (starting values, from the mockup, converted)

| Group | Tokens |
|---|---|
| Surface and text | `--text #1c1e22`, `--background #f7f7f5`, `--surface #ffffff`, `--muted #575d66`, `--border #d4d6da`, `--border-strong #838992` |
| Accent | `--accent #a63d02`, `--accent-strong #842c00`, `--accent-weak #ffede5` |
| Provenance | `--ai #513f91`, `--ai-weak #f3f1ff`, `--psi #3d4450`, `--psi-weak #eef0f3` |
| Status | `--status-unreviewed #7b5100` on `--status-unreviewed-weak #fff0d0`; `--status-approx #005e82`; `--status-same #206133`; `--status-differs #913100`; `--status-error #a92227` on `--status-error-weak #ffefed`; `--status-na #575d66` |
| Map outcomes | `--outcome-yes #c94e0c`, `--outcome-no #065da0`, `--outcome-flash #982f93`, `--outcome-nr #7a8089` |
| Map overlays | `--zone-moon #b7e5bf` (40 % opacity), `--zone-moon-edge #236436`, `--zone-earth #1c1e22`, `--zone-suit #513f91` |
| Focus | `--focus #1a56c4`, `--focus-width 3px` |
| Spacing, radius | `--space-1..7` = 4, 8, 12, 16, 24, 32, 48 px; `--radius-1 4px`, `--radius-2 8px`; `--gutter clamp(16px, 4vw, 32px)` |
| Type | `--fs-xs 13px`, `--fs-sm 14px`, `--fs-base 16px`, `--fs-lg 18px`, `--fs-xl 22px`, `--fs-2xl 28px`, `--lh 1.5`; `--font` system stack; `--mono` system monospace stack |
| Targets | `--target-size 44px` |

### Measured contrast (WCAG relative-luminance formula, computed 2026-11-14)

Text pairs: text on background 15.56, text on surface 16.69, muted on background 6.19, muted on surface 6.64, accent-strong on surface 8.96, accent on surface 6.41, AI on AI-weak 7.67, PSI on PSI-weak 8.59, unreviewed on its weak fill 6.17, error on its weak fill 6.39, approx 7.17, same 7.41, differs 7.91 (all on surface). Graphics (3:1 needed): outcome-yes 4.61, no 6.83, flash 6.64, not-reported 3.98, zone-moon-edge 7.10, focus 6.62; `--border-strong` 3.52 (white). These are starting measurements; task 1.3 re-checks them against the shipped CSS.

## Risks / Trade-offs

- [Mockup drifts from the shipped CSS] → tokens are copied once, then the CSS is the source; the mockup is reference only.
- [Hex conversion shifts a color] → contrast re-measured from the shipped CSS (task 1.3).
- [Unicode glyphs render differently per OS] → each glyph is always paired with a text word, so a missing glyph loses nothing.
- [Styling time competes with building the views] → components are styled as each view is built; task 2 is capped and the Plan B is the current plain styling.

## Open Questions

- Does the team want the small "square" glyph/logo mark of the mockup header? It is drawn as inline SVG (no asset); default: keep it, drop it if it costs time.
