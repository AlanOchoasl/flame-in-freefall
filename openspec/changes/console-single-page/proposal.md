# Proposal

**Label: Must**

## Why

The team chose `docs/design/direction-concept.html` as the design: a single research-console page with dataset tiles, a coverage map, a comparison, a side column with the ranking, the interpretation and the coverage gaps. The app was five separate pages, each reading like an informational page. This change makes the console the main screen.

## What Changes

- `#/ranking`, `#/compare` and `#/map` open one page, the console, and scroll to their section. The three routes share one component, so moving between them keeps the page state (profile, selected investigation, filters, comparison).
- The console shows, in order: title and environment profile buttons, four dataset tiles computed from the data files, a main column (coverage map, comparison) and a side column (relevance ranking, plain-language interpretation, coverage gaps), then the detail-route and interpretation-boundaries panels.
- Investigation detail (`#/investigation/<accession>`) and About (`#/about`) stay as their own screens.
- Supersedes the separate Ranking, Compare and Coverage map screens of `screen-specs`. `scenario-explorer` (a different home screen) is not compatible and stays on hold.

## Capabilities

### New Capabilities
- `console-page`: the single-page console and its section routes.

### Modified Capabilities
<!-- screen-specs, investigation-ranking, investigation-comparator and coverage-map are unarchived: edited in their own folders by their owners. -->

## Impact

- `app/src/views/console/`, `app/src/components/Panel.tsx`, `app/src/views/index.tsx`, `app/src/styles.css`, `app/src/router/useRouteChrome.ts`. No data, dependency or scoring change.
- Data: the existing processed JSON from NASA PSI Combustion Science, https://psi.nasa.gov/physci/repo/search?q=combustion.

## Out of scope (No)

A new home screen by scenario, new data, runtime AI, monitoring or risk language, NASA marks, new fonts or assets, changes to the ranking score.
