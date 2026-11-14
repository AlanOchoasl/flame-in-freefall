# Design

## Context

Input is cached CSVs in `data/sample/psi/` (observed 2026-11-14). See proposal.md for motivation.

| File | Real rows | Pressure | O2 column | Outcome columns |
|---|---|---|---|---|
| PSI-159 Normal | 179 | `approx p (bar)` | ` XO2 before test` (leading space) | `Hot ignition`, `Cool flame?` (8 filled), `Self-ext or flow term` |
| PSI-159 Inverse | 154 (1,015 read; 861 blank) | `approx p (bar)` | `XO2` | `Hot ignition` (Yes/yes/No/no/flash), `Self -ext or flow term` |
| PSI-10 Inverse | 120 | `pmean (atm)` | `XO2` | none |
| PSI-10 Normal (Nice) | 207 | `pmean (atm)` | `XO2 (init)` | none |

Observed: Must set = 453 rows, 442 plottable (PSI-10 inverse has 11 rows with null O2). Full set = 660 rows, 629 plottable (PSI-10 normal has 20 rows with empty pressure). In the Moon-base zone: PSI-159 normal 20, inverse 28, PSI-10 inverse 18, PSI-10 normal 0 → **66**. Raw cool-flame values: `no, PCI-hot` and seven `yes, PCI-x`. Dirty cells: `#DIV/0!`, `#VALUE!`, `RAMP`, `RAMPED`, `LOW O2`, `-`. PSI-10 inverse has no fuel column (headers name `XC2H4`).

## Goals / Non-Goals

**Goals:** one JSON the views load without more cleaning; every transformation traceable.
**Non-Goals:** interpreting `SE/FT/TFP`, any physics or derived science, other investigations.

## Decisions

1. **Node 22 + TypeScript, run directly.** Verified here: with `"type": "module"` in `package.json`, `node file.ts` runs without extra tooling (only erasable TS syntax; imports need the `.ts` extension). Fewer dependencies for a mixed-skill team.
2. **CSV parser: `csv-parse` (MIT, 7.0.3 on the registry).** Verified: `import { parse } from 'csv-parse/sync'; parse(text, { columns: true })` handles quoted commas, which the `Comments` columns contain.
3. **Test runner: Vitest (MIT, 5.1.0).** Same ecosystem as the app's Vite.
4. **Committed output `data/processed/experiments.json`.** The demo works offline; the UI never runs the pipeline.
5. **One mapper per source file** (declarative header table after trimming/collapsing whitespace). Alternative (generic fuzzy match): harder to test, may mismatch silently.
6. **Fuel:** raw label plus canonical species (`butane`, `propane`, `ethane`, `ethylene`); `C2H4` → ethylene and `C3H8` → propane by standard formulas; for PSI-10 inverse, ethylene is inferred from `XC2H4` and flagged `inferred`. No fuel fraction is computed from texts like `30% butane`.
7. **O2 for PSI-159 normal is "before test"**; "after test" is kept as an extra field.
8. **Moon-base zone constants** in one file: O2 ≥ 0.30, pressure ≤ 0.7033 bar (10.2 psi × 0.0689476), from the statement. Views read the flag; none recomputes it.
9. **Stub first:** a 20-row `experiments.json` so the UI is unblocked early.

### Output contract (one record, values from the first PSI-159 normal row)

```json
{
  "id": "PSI-159:21088A1",
  "accession": "PSI-159",
  "flameType": "normal",
  "fuel": { "species": "ethane", "raw": "ethane", "inferred": false },
  "o2Fraction": 0.3939,
  "pressureBar": 0.9443956,
  "pressureIsApproximate": true,
  "tadK": 2719.323211,
  "zst": 0.102651783,
  "outcome": "yes",
  "coolFlame": { "value": null, "raw": null },
  "selfExtOrFlowTermRaw": "SE",
  "tfpRaw": "No",
  "isPlottable": true,
  "inMoonBaseZone": false,
  "dataQuality": [],
  "pageUrl": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-159"
}
```

The file wraps `records` with `generatedAt`, `sources` (file, read, kept, skipped), `plottableCount`, and `investigations` (per-investigation summary).

Data flow: `data/sample/psi/*.csv` → per-source mapper + cleaning → `data/processed/experiments.json` → views.

## Risks / Trade-offs

- [PSI changes the files] → CSVs are committed; no network.
- [Misread column] → explicit mappers; tests assert row counts and spot-check 3 values per file.
- [Null O2/pressure] → `isPlottable` false; the map reports how many are not plotted.
- [PSI-10 has no outcome] → `not-reported` is distinct from `no`.
- [Licence] → PSI-98's page shows CC0 and a DOI; confirm each used investigation's licence and DOI from its page before submission.

## Open Questions

- Meaning of `SE`, `FT`, `TFP`, `Zst`: verify in the PSI-159 Read Me before the UI explains them. The pipeline does not depend on it.
