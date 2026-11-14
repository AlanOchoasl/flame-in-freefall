# Proposal

**Label: Must**

## Why

The coverage map and the ranking need test conditions from NASA's experiments, but the PSI tables use different column names, units and dirty cells (`#DIV/0!`, `RAMP`, blank rows). Without one normalized dataset every view would parse CSVs its own way.

## What Changes

- A TypeScript script reads the cached CSVs in `data/sample/psi/` and writes `data/processed/experiments.json`.
- **Must:** PSI-159 normal and inverse flames, PSI-10 inverse flames (453 rows, 442 plottable). **Nice-to-have:** PSI-10 normal flames (+207 rows; none falls in the Moon-base zone).
- Normalizes flame type, fuel, O2 fraction, pressure (bar), `Tad`, `Zst`, ignition outcome and cool-flame result; keeps every real row; invalid cells become `null` with a flag.
- Adds `isPlottable` and `inMoonBaseZone` per row, and a per-investigation summary (ranges and counts) for the ranking and comparator.
- Keeps `SE/FT` and `TFP` raw, uninterpreted. Offline, deterministic, with unit tests and a smoke check.

- **Update 2026-11-14:** the PSI-10 tables (inverse and normal flames) are left out of the output, because PSI declares no license for that investigation and no dataset is used without a verified license. They are declared under `excluded` in `experiments.json`. The counts above that include PSI-10 are the history of this change; today the file has 333 records, all plottable, 48 in the Moon-base zone.

## Capabilities

### New Capabilities
- `experiment-data`: normalized, provenance-tagged test conditions and outcomes from PSI-159 and PSI-10.

### Modified Capabilities
<!-- none -->

## Impact

- New code, tests, and `data/processed/experiments.json` (committed, offline).
- PSI-159: https://psi.nasa.gov/physci/repo/data/investigations/PSI-159 · PSI-10: https://psi.nasa.gov/physci/repo/data/investigations/PSI-10
- Moon-base zone comes from the challenge statement: O2 ≥ 30 %, pressure ≤ 10.2 psi.

## Out of scope (No)

Other investigations (BASS, SAFFIRE, SAME… have few or non-comparable rows), raw images/video, backend, any UI, glossary text, any predictive model.
