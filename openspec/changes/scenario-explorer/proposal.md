# Proposal

**Label: Must**

## Why

The app opens on a 26-card list (about 10,700 px) that answers nothing and shows internal tags. The challenge asks for fire-safety insights per crewed habitat: what PSI evidence exists to prevent, detect and suppress fire, and what is still unknown. Mockup: https://claude.ai/artifact/RsqagZtdhn1ZC2vcZMddNk (boards Home and Investigations).

## What Changes

- New home at `#/scenario/<id>`: a scenario picker, the scenario's atmosphere context, evidence-gap cards and three pillars (Prevent, Detect, Suppress). Each pillar shows its top investigations and one fact taken from a PSI test table.
- Evidence gaps and pillar facts live in `data/ranking/scenarios.json`. The file has a `schemaVersion`, and every gap and fact carries a `source` and a `reviewed` flag. The Moon-base-zone count is computed from `experiments.json`, not typed in.
- Edits to in-flight (unarchived) changes:
  - `investigation-ranking`: detection and suppression become pillar filters, no longer profiles. The Ranking view becomes a compact "Investigations" table.
  - `screen-specs`: new routes and navigation.
  - `design-system`: readable labels, gap and pillar cards, compact rows, a heading focus fix.
  - `investigation-catalog`: curate BASS, BASS-II, DAFT, FLEX and FLEX-2.

Dataset: NASA PSI Combustion Science, https://psi.nasa.gov/physci/repo/search?q=combustion, cached in `data/sample/`.

## Capabilities

### New Capabilities
- `scenario-explorer`: home screen by habitat scenario, with context, evidence gaps and fire-safety pillars.

### Modified Capabilities
<!-- none: affected capabilities exist only in unarchived changes, edited directly -->

## Impact

- `app/src/views/`: new Scenario view; Ranking becomes Investigations.
- Data: new `scenarios.json`; labels in `vocabularies.json`; `profiles.json` reduced to scenarios; curation for PSI-25, 26, 47, 68, 69.

## Out of scope (No)

- "Earth applications" scenario (Nice).
- Adding FLEX or BASS tables to the experiments pipeline.
- Curating the ACME records PSI-20 to PSI-23.
- Any runtime AI.
- Risk or accident predictions.
- Partial-gravity estimates.
- Dark mode.
