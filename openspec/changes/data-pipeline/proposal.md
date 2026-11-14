# Proposal

**Label: Must**

## Why

The atmosphere map needs one clean dataset, but the four NASA tables use different column names, units and dirty cells (`#DIV/0!`, `RAMP`, blank rows). Without a normalizer, the UI team would parse CSVs by hand and get inconsistent results.

## What Changes

- Add a TypeScript script that reads the cached CSVs in `data/sample/psi/` and writes one static JSON file, `data/processed/experiments.json`.
- Normalize flame type, fuel, O2 fraction, pressure (to bar), `Tad`, `Zst` and ignition outcome into one record schema.
- Keep every real row (~660); convert bad cells to `null` with a data-quality flag instead of dropping or inventing values.
- Preserve the raw "Self-ext or flow term" value without interpreting it (meaning unverified).
- Add unit tests for parsing and a smoke check on the cached samples. Runs offline.

## Capabilities

### New Capabilities
- `experiment-data`: normalized, provenance-tagged dataset of PSI-159 and PSI-10 combustion experiments, ready for the web app.

### Modified Capabilities
<!-- none -->

## Impact

- New code: pipeline script, tests. New output: `data/processed/experiments.json` (committed, so the demo works offline).
- Datasets (CC0 per PSI-98's page; confirm per investigation):
  - PSI-159: https://psi.nasa.gov/physci/repo/data/investigations/PSI-159
  - PSI-10: https://psi.nasa.gov/physci/repo/data/investigations/PSI-10

## Out of scope (No)

Other PSI investigations, raw images/video, backend, the map UI, glossary text, Apollo/Mir narrative, any predictive model.
