# Design

## Context

Input is four cached CSVs in `data/sample/psi/` (observed 2026-11-14). See proposal.md for motivation.

| File | Real rows | Pressure | O2 column | Outcome columns |
|---|---|---|---|---|
| PSI-159 Normal | 179 | `approx p (bar)` | ` XO2 before test` (leading space) | `Hot ignition`, `Cool flame?` (8 filled), `Self-ext or flow term` |
| PSI-159 Inverse | 154 (1,015 read; 861 blank) | `approx p (bar)` | `XO2` | `Hot ignition` (Yes/yes/No/no/flash), `Self -ext or flow term` |
| PSI-10 Normal | 207 | `pmean (atm)` | `XO2 (init)` | none |
| PSI-10 Inverse | 120 | `pmean (atm)` | `XO2` | none |

Observed quirks: header whitespace and spelling differ between files; PSI-10 normal has `RAMP`/`RAMPED` in 60 rows; PSI-10 inverse has `RAMP`/`LOW O2` in 11 rows; PSI-159 has `#DIV/0!` and `#VALUE!`; PSI-10 inverse has no fuel column (headers name `XC2H4`). There is no code in the repo yet.

## Goals / Non-Goals

**Goals:**
- One JSON file the map UI can load with no further cleaning.
- Every transformation is traceable and never hides a bad value.

**Non-Goals:**
- Interpreting `SE`/`FT`/`TFP` or any science; no derived physics.
- Supporting other investigations beyond a small per-source mapper table.

## Decisions

1. **Plain Node + TypeScript script, no framework.** The team knows Node/TS; the UI is React + TS + Vite, so both share types. Alternative (Python/pandas): faster for CSVs but adds a second language to a mixed-skill team.
2. **Output is a committed static file, `data/processed/experiments.json`.** The demo then works offline and the UI team never runs the pipeline. Alternative (generate at web build time): adds a failure point on demo day.
3. **One mapper per source file** (declarative column-name table + small functions), matching headers after trimming and collapsing whitespace. Alternative (one generic fuzzy matcher): harder to test and could silently mismatch.
4. **A maintained CSV parser library**, chosen at implementation after checking its documentation; the `Comments` columns can contain commas and quotes, so hand-splitting is unsafe.
5. **Fuel:** keep a raw label (e.g. `30% butane`) and a canonical species (`butane`, `propane`, `ethane`, `ethylene`). Mapping `C2H4` → ethylene and `C3H8` → propane uses standard chemical formulas. For PSI-10 inverse, species is `ethylene`, inferred from the `XC2H4` headers and flagged as `inferred`. I do not compute any fuel fraction from the `30%` prefix, because what it refers to is unverified.
6. **O2 for PSI-159 normal uses "before test"** as the initial value; the "after test" value is kept as an extra field.
7. **Test runner:** the Vite-compatible runner (Vitest is the likely choice; confirm in its docs). Tests use rows copied from the real samples.
8. **Stub first:** publish a 20-row `experiments.json` early so the UI developer is unblocked.

Data flow: `data/sample/psi/*.csv` → per-source mapper + cleaning → `data/processed/experiments.json` → React map (separate change).

## Risks / Trade-offs

- [PSI changes or removes the files] → CSVs are committed; the pipeline never touches the network.
- [Misreading a column] → mappers are explicit, and tests assert row counts and 3–4 spot-checked values per file.
- [`null` O2 or pressure makes a point unplottable] → the UI plots only records with both values; counts of unplottable records are reported in the dataset metadata.
- [Mixing PSI-10 (no outcome) with PSI-159] → `not-reported` is a distinct outcome, never `no`.
- [Licence/citation] → PSI-98's page shows CC0 and a DOI; the per-investigation DOI is not yet captured. A placeholder field is kept and filled from each page's "Cite this Investigation" before submission.

## Open Questions

- Meaning of `SE`, `FT`, `TFP` and `Zst`: verify in the PSI-159 Read Me before the glossary uses them. The pipeline does not depend on it.
