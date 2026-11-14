# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Saturday 14 Nov, Argentina, and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Plan B for every task: the data is the committed CSV samples, so nothing depends on live PSI access.

## 1. Setup

- [ ] 1.1 (by 14:00, ≤1h) Scaffold the Node + TypeScript package with a test runner and a `build:data` script; verify `npm test` runs one placeholder test and `npm run build:data` runs without error.

## 2. Parsing and cleaning

- [ ] 2.1 (by 15:00, ≤2h) Read the four CSVs with a maintained CSV parser, normalize header whitespace, and skip rows with no test id; verify a test shows 179 / 154 / 207 / 120 kept rows and 861 skipped in the PSI-159 inverse file.
- [ ] 2.2 (by 16:00, ≤1h) Implement numeric cleaning: `#DIV/0!`, `#VALUE!`, `RAMP`, `RAMPED`, `LOW O2`, `-` and empty become `null` plus a data-quality flag; verify unit tests on real sample cells, including a kept row with `null` `Tad`.

## 3. Source mappers

- [ ] 3.1 (by 17:30, ≤2h) Map PSI-159 normal and inverse to the unified record (flame type, fuel, O2 before test, bar, `Tad`, `Zst`, outcome yes/no/flash case-insensitively, cool-flame flag, raw self-ext value); verify spot-check tests of 3 rows per file.
- [ ] 3.2 (by 18:30, ≤1h) Map PSI-10 normal and inverse (atm → bar at 1.01325, outcome `not-reported`, ethylene inferred and flagged for inverse); verify a test that 1.0 atm gives 1.01325 bar.

## 4. Output and provenance

- [ ] 4.1 (by 19:00, ≤1h) Write `data/processed/experiments.json` with generation date, source file names, per-file row counts, unplottable-record counts, and per-record source id and link; verify the file validates against the TypeScript type and has 660 records.
- [ ] 4.2 (by 19:30, ≤1h) Add a smoke check that runs the whole pipeline offline on the cached samples twice and compares the outputs; verify it passes with the network disabled.
- [ ] 4.3 (by 15:00, ≤30 min) Publish a 20-row stub `experiments.json` so the frontend can start; verify the file loads as valid JSON.

## 5. Documentation

- [ ] 5.1 (by 20:00, ≤1h) Document the schema, the cleaning rules and the data-quality flags in `data/processed/README.md`; verify the documented command regenerates the file as written.
- [ ] 5.2 (by 20:00, ≤30 min) Capture each investigation's DOI from its "Cite this Investigation" link and fill the dataset metadata; verify both DOIs appear in the output.

## Workflow follow-up

- Archive the change after review and milestone 1 (Saturday 20:00) is met.
