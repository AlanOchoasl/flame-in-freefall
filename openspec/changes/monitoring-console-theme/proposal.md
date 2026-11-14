# Proposal

## Why

The app currently uses a light-only visual system while the team selected `docs/design/direction-concept.html` as the monitoring-console direction. Reconcile the contradictory light-only plan before implementing a coherent, accessible visual shell across the existing routes.

## What Changes

- **Must:** apply the concept's dark/ light token pairs, initially following the operating-system preference, with an explicit Light / Dark selector.
- **Must:** bring the shared header, methodological notice, citation and five existing views into a compact research-console vocabulary; keep each view's existing navigation and data behavior.
- **Must:** style the existing coverage plot using recorded NASA PSI points and outcome shapes; no dummy values or synthetic measurements in the app.
- **No:** new Monitor route, real-time telemetry, fabricated counters or scores, additional dependencies/assets, NASA marks, or scientific changes to the ranking algorithm or data pipeline.

Dataset: [NASA Physical Science Informatics (PSI) Combustion Science](https://psi.nasa.gov/physci/repo/search?q=combustion), via the existing processed JSON.

## Capabilities

### New Capabilities

- `console-appearance`: shared presentation, dual-theme selection and route-wide visual/accessible states; supersedes the light-only appearance requirement of the still-open `design-system` change upon review.

### Modified Capabilities

None. The existing `design-system` change is not archived in `openspec/specs/`; its light-only line needs to be retired or revised before both changes can be applied as one coherent requirement set.

## Impact

Existing `app/src/styles.css`, `app/src/App.tsx`, the ranking/compare/map/detail/about view styles, and documentation of the superseded light-only decision. No network, backend or dependency change.
