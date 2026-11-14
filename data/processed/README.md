# data/processed

Generated, committed data files that the app reads. Do not edit by hand.

## catalog.json
One record per PSI combustion investigation (26). Built by `scripts/catalog/` from the cached PSI data and the hand-edited curation files. Spec: `openspec/changes/investigation-catalog/`.

```bash
node scripts/catalog/cli.ts            # rebuild (offline)
node scripts/catalog/cli.ts --strict   # also fail while any curated value is unreviewed
```

Top level: `schemaVersion`, `generatedAt`, `sourceRetrieved`, `recordCount`, `unreviewedCount`, `records`. Records are sorted by ascending accession number.

### Record
| Field | Meaning |
|---|---|
| `accession`, `title`, `acronym` | Identity. `acronym` is `null` when PSI has none |
| `researchArea`, `isCombustionScience` | PSI research area; the flag is true only for "Combustion Science" |
| `projectType`, `flightPlatform` | As in PSI |
| `subResearchArea` | `{ raw, normalized }`: PSI spells it 13 ways; `normalized` unifies case and plural variants |
| `hardware` | `{ names[], links[] }` from PSI's "Experiment Hardware" |
| `keywords[]`, `relatedInvestigations[]`, `publicationTitles[]` | Split from PSI's space-separated strings |
| `startDate`, `endDate`, `releaseDate` | ISO `YYYY-MM-DD`, or `null` (4 investigations have no start date and 5 have no end date; `releaseDate` is always set) |
| `objectives`, `approach`, `hypothesis`, `earthBenefits` | PSI text, spaces collapsed, paragraphs kept. `hypothesis` is `null` for PSI-108 |
| `curated` | Hand-curated fields, each `{ value, source, reviewed }` (see below) |
| `testTables[]` | Cached CSV files in `data/sample/psi/` for this investigation |
| `pageUrl`, `doi` | Citation: PSI page and DOI (from PSI's investigation record) |

People names, funding numbers and author lists from PSI are intentionally not copied.

### Curated fields (`data/curation/`)
- `hardwareGroup`: one of `acme-cir`, `mdca-cir`, `msg-flow-duct`, `other`, `unknown`.
- `fuelPhase[]`: `gas`, `liquid-droplet`, `solid`, `aerosol-dust`, `not-combustion`.
- `topics[]`: `material-flammability`, `detection`, `suppression`, `flame-fundamentals`, `modeling`, `not-fire-safety`.
- `measurements[]`: free text (sensors / measurement types).

The allowed lists live in `data/curation/vocabularies.json`; add a value there and it is accepted. `source` says which text a value came from. **`reviewed` is `true` only after a person read the value against the PSI record.** Unreviewed values are shown as such by the app. `--strict` fails while any value is unreviewed and lists the accessions.

## experiments.json
One record per real test row of the **Must set**: PSI-159 normal flames, PSI-159 inverse flames and PSI-10 inverse flames, with the same field names whatever the source table. Built by `scripts/` from the cached CSVs in `data/sample/psi/`. Spec: `openspec/changes/data-pipeline/`.

```bash
npm run build:data    # rebuild data/processed/experiments.json (offline)
npm run smoke:data    # offline check: two runs are identical, 453 / 442 / 66, committed file is up to date
```

Regenerating changes only `generatedAt` when the inputs did not change. PSI-10 normal flames (Nice-to-have) are not included.

Top level: `schemaVersion` (`1.0.0`; a removed or renamed field raises the major version), `generatedAt`, `sources`, `plottableCount`, `investigations`, `records`.

### Sources (`sources[]`)
Every file reports `read` (rows parsed), `kept` (rows with a test id) and `skipped` (rows without one). Skipped rows are empty rows, not tests.

| File | read | kept | skipped |
|---|---|---|---|
| `PSI-159_..._CFI-G_Normal_Flames.csv` | 179 | 179 | 0 |
| `PSI-159_..._CFI-G_Inverse_Flames.csv` | 1015 | 154 | 861 |
| `PSI-10_..._Flame_Design_Inverse_Flame.csv` | 120 | 120 | 0 |

Totals: **453 records, 442 plottable, 66 in the Moon-base zone** (20 + 28 + 18).

### Record
| Field | Meaning |
|---|---|
| `id` | `<accession>:<test id>` without spaces, e.g. `PSI-159:21088A1`. Unique |
| `accession`, `pageUrl` | The PSI investigation and its page, so any point can be cited |
| `flameType` | `normal` or `inverse` |
| `fuel` | `{ species, raw, inferred }`. `raw` is the PSI label; `species` is the species name read from it (`ethane`, `propane`, `butane`, `ethylene`) or `null`; `inferred` is `true` when the table has no fuel column |
| `o2Fraction` | O2 mole fraction (0 to 1). PSI-159 normal uses "XO2 before test" |
| `o2FractionAfterTest` | PSI-159 normal only ("XO2 after test"); `null` elsewhere |
| `pressureBar` | Pressure in bar. PSI-10 values are converted from atm with 1 atm = 1.01325 bar, rounded to 7 decimals |
| `pressureIsApproximate` | `true` for PSI-159 (column "approx p (bar)"), `false` for PSI-10 (`pmean`) |
| `tadK`, `zst` | `Tad (K)` and `Zst` as in the PSI table. The meaning of `Zst` is not yet verified against PSI-159's Read Me |
| `outcome` | Hot ignition: `yes`, `no`, `flash` (case-insensitive in PSI-159) or `not-reported` (PSI-10 has no outcome column; it is **not** `no`) |
| `coolFlame` | `{ value, raw }`. `value` is `true` if the raw text starts with `yes`, `false` if it starts with `no`, `null` when empty or unrecognized; an empty cell is never `false`. `raw` keeps the text (`yes, PCI-D`). Only PSI-159 normal has this column |
| `selfExtOrFlowTermRaw`, `tfpRaw` | The "Self-ext or flow term" (`SE`, `FT`, `-`) and `TFP` (`Yes`/`No`) cells, kept raw and **not interpreted** (their meaning is not yet verified). `null` for PSI-10, which has neither column |
| `isPlottable` | `true` when `o2Fraction` and `pressureBar` are both numbers |
| `inMoonBaseZone` | `true` when plottable, `o2Fraction >= 0.30` and `pressureBar <= 0.7033` (10.2 psi), boundaries inclusive. Thresholds come from the challenge statement and live in `scripts/moon-base-zone.ts` |
| `dataQuality[]` | Cells that were not valid numbers (see below). Empty when the row is clean |

### Cleaning rules and `dataQuality`
A row is never dropped or invented because of a bad cell. The cell becomes `null` and the record says why, with `{ field, raw, reason }`:

| `reason` | Raw cell | Where it happens today |
|---|---|---|
| `spreadsheet-error` | `#DIV/0!`, `#VALUE!` | 2 PSI-159 normal rows (`tadK`, `zst`) |
| `ramped-condition` | `RAMP`, `RAMPED` | 9 PSI-10 inverse rows (`o2Fraction`, `tadK`, `zst`) |
| `low-o2-note` | `LOW O2` | 2 PSI-10 inverse rows (`o2Fraction`, `tadK`, `zst`) |
| `no-value` | `-` | none in the Must set |
| `empty` | empty cell in a numeric column | none in the Must set |
| `not-numeric` | any other text | none in the Must set |
| `not-recognized` | an outcome other than `yes`, `no`, `flash` (field `outcome`) | none in the Must set |

13 records carry entries. The 11 PSI-10 rows with a null O2 are the ones that are not plottable. The reason names are ours: the PSI tables do not define them.

### Summary (`investigations[]`)
Per investigation: `accession`, `records`, `plottable`, `inMoonBaseZone`, `o2Range` and `pressureBarRange` (`[min, max]`, ignoring nulls, or `[null, null]`) and `fuels` (sorted species names).

### Known limits
- PSI-159 fuel labels such as `30% butane` map to `species: "butane"`; the percentage is not interpreted and the raw label is kept.
- PSI-10 inverse has no fuel column (ethylene is inferred from the `XC2H4` headers) and no outcome column.
- Pressures reach about 3.3 bar; the Moon-base zone covers only the low-pressure end.
- PSI has no partial-gravity data (per the challenge statement), so none is in this file.

## Data licenses and citation (checked 2026-11-14 against PSI's investigation records)
- 25 of 26 investigations declare **CC0-1.0**.
- **PSI-10 (ACME Flame Design) declares no license in PSI's record.** It is NASA data hosted by PSI, but the license is unconfirmed: check the page's license field and ask PSI (the page lists `msfc-psi-help@mail.nasa.gov`) before submission.
- PSI asks users to cite each investigation with its DOI ("Cite this Investigation"). Every record carries its `doi`.
- The investigation record (including DOI and license) comes from the endpoint the PSI web page itself calls, `GET https://psi.nasa.gov/geode-py/ws/repo/investigations/<accession>`. It is not a documented API and may change, so the DOIs are stored in `data/curation/investigations.curation.json`.
