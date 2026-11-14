# Design

## Context

See `proposal.md` for motivation and `specs/console-appearance/spec.md` for behavior. The existing app is React + TypeScript + Vite with five hash routes, working data access and Recharts. It already owns focus/navigation, filter states and table fallback. `docs/design/DIRECTION_CONCEPT.md` and `docs/design/direction-concept.html` are the selected design direction, but the HTML is a separate proposal, not application code. The still-active `design-system` OpenSpec delta says light-only; resolve that conflict before applying the implementation.

## Goals / Non-Goals

**Goals:** Visual coherence across all existing routes; two accessible themes; a chart that looks like the approved concept but renders the app's real records. Keep existing route and data contracts.

**Non-Goals:** New routes, brand marks sourced externally, live metrics, sample scientific numbers, new scoring/ingestion logic or copy-pasting the concept's embedded dataset/script.

## Decisions

1. **Reconcile before code.** Revise the old open `design-system` planning artifacts' light-only rule (and outdated `docs/DESIGN_PROMPT.md` guidance) to acknowledge the newly approved dual-theme direction. Do not alter completed task checkboxes retroactively. Alternative: ignore the contradiction; rejected because subsequent implementers would follow conflicting instructions.
2. **CSS variables in one shared file.** Preserve current aliases (`--text`, `--background`, `--surface`, `--accent`, etc.) but map them to the dark/light palette in the HTML concept so existing view CSS inherits it. Extend map-specific tokens rather than hard-coding light colors in TS modules. Alternative: Tailwind/CSS-in-JS; rejected as new infrastructure.
3. **Theme state:** CSS `prefers-color-scheme` as the initial state, `html[data-theme]` for an explicit selection; theme control exposes `aria-pressed`. Keep it across route changes; optional storage only if tests and behavior remain simple. No fake build revision or telemetry identifier.
4. **Existing routing is authoritative.** Shared header and disclaimer in `App.tsx`; Ranking stays home, Map has the dominant plot, Compare/Detail/About receive the same panel language. Adapt the HTML's column hierarchy per route rather than moving the map onto Ranking. No fabricated four-tile counts: show only counts derived from loaded JSON, if included.
5. **Keep source-backed plotting.** `data/processed/*.json` → `dataAccess` → current view calculation → `CoverageMap`/Ranking/Compare. Preserve Recharts, outcome shapes and table fallback; use theme-aware colors for the chart and dashed amber lunar overlay. Reference values come from the official challenge statement, not the mock SVG. Any AI summary remains labelled according to its actual review state.
6. **Quality floor.** 44px targets, 3px focus ring, 360px single-column layouts, no page horizontal scroll, visible units, chart/table parity, fast transitions with reduced-motion override. The mock's tiny 10px labels and decorative glyphs are not mandatory.

## Risks / Trade-offs

- [Existing CSS hard-codes light colors in nested views and map TypeScript] → inspect the affected files and migrate only actual color roles, checking each route in both themes.
- [Dark screenshot looks finished while data is still missing] → preserve loading/error/empty states and assert the plot has only records from processed JSON.
- [Pinned concept clashes with a stray `design.md` in the repo] → use the two `docs/design/` references plus verified records; never copy invented example PSI accessions, scores or DOI from an unreviewed document.
- [Theme contrast differs on embedded SVG/controls] → inspect both rendered variants and fix semantic tokens rather than one-off colors.

## Migration Plan

First reconcile OpenSpec and old prompt; then install shared theme/shell; then restyle Ranking, Map, Compare, Detail and About in small commits. Validate build, keyboard path, system theme and manual switch, and real data counts. If a view cannot be migrated before the milestone, leave its behavior intact and report the incomplete styling rather than inventing content.
