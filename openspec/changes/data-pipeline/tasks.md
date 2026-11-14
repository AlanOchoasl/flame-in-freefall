# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Saturday 14 Nov, Argentina, and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Plan B for every task: the data is the committed CSV samples, so nothing depends on live PSI access.

This module group 1 also scaffolds the shared Node + TypeScript setup used by `investigation-catalog`.

## 1. Setup

Depends on: nothing.

- [ ] 1.1 (by 14:00, ≤1h) Create `package.json` with `"type": "module"`, `csv-parse` and `vitest`, a `build:data` script and a `test` script; verify `npm test` runs a placeholder test and `node scripts/check-licenses.mjs` passes (note: Vite is not needed here).

## 2. Parsing and cleaning

Depends on: 1.

- [ ] 2.1 (by 15:30, ≤1.5h) Read the three Must CSVs with `csv-parse`, normalize header whitespace, skip rows without a test id; verify a test shows 179 / 154 / 120 kept rows and 861 skipped in the PSI-159 inverse file.
- [ ] 2.2 (by 16:00, ≤1h) Numeric cleaning: `#DIV/0!`, `#VALUE!`, `RAMP`, `RAMPED`, `LOW O2`, `-` and empty become `null` plus a data-quality entry; verify tests on real cells, including a kept row with `null` `tadK`.

## 3. Source mappers

Depends on: 2. Tasks 3.1 and 3.2 are independent.

- [ ] 3.1 (by 17:30, ≤2h) Register mappers in a single list and map PSI-159 normal and inverse (flame type, fuel, O2 before test, bar + approximate flag, `Tad`, `Zst`, outcome, three-valued cool-flame with raw text, raw `SE/FT` and `TFP`); verify spot-check tests of 3 rows per file and that `no, PCI-hot` → `false`, `yes, PCI-D` → `true`, empty → `null`.
- [ ] 3.2 (by 18:00, ≤1h) Map PSI-10 inverse (atm → bar, outcome `not-reported`, ethylene inferred and flagged); verify 1.0 atm gives 1.01325 bar.
- [ ] 3.3 (Nice, by Sun 12:00, ≤1h) Map PSI-10 normal (RAMP/RAMPED rows kept with nulls); verify 207 kept rows and 187 plottable.

## 4. Flags, summary and output

Depends on: 3.1, 3.2.

- [ ] 4.1 (by 18:30, ≤1h) Add `isPlottable`, `inMoonBaseZone` (constants in one file) and the per-investigation summary; verify tests on boundary values (O2 exactly 0.30; 0.7033 bar) and that the Must set has 442 plottable and 66 in the zone.
- [ ] 4.2 (by 19:00, ≤1h) Write `data/processed/experiments.json` with metadata, provenance and per-file counts; verify it matches the contract in design.md and has 453 records.
- [ ] 4.3 (by 19:30, ≤1h) Smoke check: run the pipeline twice offline on the cached samples and compare outputs ignoring `generatedAt`; verify it passes with the network disabled.
- [ ] 4.4 (by 14:30, ≤30 min) Publish a 20-row stub `experiments.json` following the contract so views can start; verify it loads as valid JSON.

## 5. Documentation and citation

Depends on: 4.2 for docs.

- [ ] 5.1 (Sun by 11:00, ≤1h) Document the schema, cleaning rules and data-quality entries in `data/processed/README.md`; verify the documented command regenerates the file as written.
- [ ] 5.2 (Sun by 14:00, ≤30 min) Capture the DOI and licence of PSI-159 and PSI-10 from their pages ("Cite this Investigation") and fill the dataset metadata; verify both DOIs appear in the output. Plan B: leave `doi` null and cite the page link.

## Workflow follow-up

- Archive the change after review and after milestone 1 (Saturday 20:00) is met.
