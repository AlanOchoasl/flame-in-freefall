# Design

## Context

Depends on `data-pipeline` (`isPlottable`, `inMoonBaseZone`, `pressureIsApproximate`, outcome, per-record links) and `app-shell`. Observed (original numbers; since 2026-11-14 PSI-10 is left out for lack of a declared license, so the data is PSI-159 only: 333 records, all plottable, 48 in the zone): Must set 453 records, 442 plottable, 66 in the zone (PSI-159 normal 20, inverse 28, PSI-10 inverse 18); PSI-159 spans about 0.5–3.3 bar and 12–85 % O2. The statement gives the zone, 14.7 psi Earth and 4.3 psi / 100 % O2 spacesuit values. See proposal.md.

## Goals / Non-Goals

**Goals:** an accurate map that can be read in one look and does not overclaim.
**Non-Goals:** modelling, interpolation between points, safety verdicts.

## Decisions

1. **Recharts `ScatterChart`** (verified exports: `Scatter`, `ReferenceArea`, `ReferenceLine`, marker shapes `circle`, `cross`, `diamond`, `square`, `star`, `triangle`, `wye`). Under 700 points, so no performance work. Alternative: hand-written SVG.
2. **Encoding:** color from a color-blind-safe palette plus shape (e.g. circle = yes, triangle = no, diamond = flash, cross = not-reported; final choice at build). Points in the zone get a heavier outline using the `inMoonBaseZone` flag; the map never recomputes the zone.
3. **Axes:** x 0–100 % O2; y pressure in bar from 0 to about 3.5. Reference overlays use bar values converted from psi with 1 psi = 0.0689476 bar, shown with both units.
4. **Insight text is built from the data** by a pure function and tested; no hard-coded numbers.
5. **Overplotting:** many tests share conditions; use semi-transparent markers and show the count when several points coincide.
6. **Table:** the same filtered array feeds the table; no libraries. The filtered-data download was dropped on 2026-11-15 at the team's request (irrelevant to the demo).
7. **Standard disclaimers are constants** reused by the About section.

8. **Axes and labels (from the mockup review).** The mockup drew no tick values and put overlay labels over the data. The plot reserves a margin for tick labels and overlay labels; overlays are drawn first so points sit on top; labels use the margin or leader lines. Ticks: O2 every 20 %, pressure at most six ticks with the unit in the axis title.
9. **Narrow screens.** The plot keeps a 480 px minimum inside a scrollable, focusable region; everything else stacks in one column. Alternative: shrink the plot (the mockup did, and it became unreadable at about 230 px).
10. **Table paging** is a 10-row slice of the same filtered array with numbered page buttons (changed on 2026-11-15 at the team's request; it was a "show 50 more rows" button). The page logic is pure (`pagination.ts`) and tested; a new filter remounts the table, so it starts on page 1; no virtualization or pagination library.

Data flow: `experiments.json` → filter → chart / table / insight.

## Risks / Trade-offs

- [Reads as "the Moon is unsafe or safe"] → computed wording only reports test coverage; limits stated in the panel.
- [Gaseous-fuel tests, not materials] → stated explicitly; BASS and SAFFIRE are not on this map.
- [Overplotted points hide each other] → transparency and counts.
- [Keyboard access to chart points is limited] → table alternative.
- [PSI-10 has no outcome] → shown as `not-reported`, a distinct marker, never as `no`.

## Open Questions

- Final marker shapes and palette (cosmetic; decided during build).
