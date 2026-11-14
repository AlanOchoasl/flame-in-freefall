# Proposal

**Label: Must**

## Why

`screen-specs` fixes what each screen contains but explicitly left colors, typography and component looks out of scope, so the three unbuilt views (Ranking, Compare, Coverage map) would each be styled ad hoc. A clickable UI mockup now exists (`docs/design/mockup.dc.html`, made from `docs/DESIGN_PROMPT.md`). Review found it good on labels, markers and structure, and found gaps that the specs must close before the team builds from it.

## What Changes

- One design-token block (colors, spacing, radius, type scale, focus ring, target size) in `app/src/styles.css`, taken from the mockup with the corrections found in review (a darker `--border-strong`, sRGB hex instead of `oklch()`).
- A fixed set of shared components with their look and states: AI label, PSI label, status markers, missing value, tag chips, score breakdown, data-state block, count line, citation block.
- Responsive header: navigation collapses to a Menu button below 640 px.
- Contrast and non-color-only rules, with the measured ratios recorded.
- Mockup-driven fixes to other changes, edited in place: readable axes, overlay labels and narrow-width plot in `coverage-map`; a "both missing" row state in `investigation-comparator`; the out-of-scope list of `screen-specs`.

## Capabilities

### New Capabilities
- `design-system`: tokens, shared components, contrast, focus and responsive header.

### Modified Capabilities
- `coverage-map`, `investigation-comparator`, `screen-specs`: edited in their own change folders (not delta-of-delta); see `design.md`.

## Impact

- `app/src/styles.css`, `app/src/components/*`, the app header in `app/src/App.tsx`. No new dependency, font or image.
- Data: none new. It presents NASA PSI data: https://psi.nasa.gov/physci/repo/search?q=combustion.
- Reference files: `docs/design/` (mockup, components list, README).

## Out of scope (No)

Dark mode, animations beyond state transitions, NASA logos or imagery, illustrations, web fonts, an icon library, a landing page, any new data field or behavior outside the items listed above.
