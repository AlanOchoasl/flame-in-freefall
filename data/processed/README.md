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
npm run smoke:data    # offline check: two runs are identical, 660 / 629 / 66, committed file is up to date
```

Regenerating changes only `generatedAt` when the inputs did not change. The file holds the four tables of PSI-159 and PSI-10: the Must set (453 records) plus PSI-10 normal flames (Nice, task 3.3; 207 records).

Top level: `schemaVersion` (`1.1.0`; a removed or renamed field raises the major version; `1.1.0` added `datasets`), `generatedAt`, `sources`, `datasets`, `plottableCount`, `investigations`, `records`.

### Datasets (`datasets[]`)
One entry per investigation in the file (PSI-159 and PSI-10), so every point can be cited. Built from `data/curation/dataset-citations.json`, which is edited by hand and says where each value came from.

| Field | Meaning |
|---|---|
| `accession`, `pageUrl` | The PSI investigation and its page |
| `doi`, `doiUrl` | The DOI of the dataset and its `https://doi.org/` link. `null` when unknown (the page link is then the citation) |
| `publisher` | Who DataCite lists as publisher (`NASA PSI`) |
| `license` | `{ spdx, url }`, or `null` when none is declared. A missing license is never filled in with a guess |
| `licenseNote` | Why the license is `null`; `null` when there is one |
| `checkedOn` | The day the DOI and license were captured |

Today: **PSI-159** has DOI `10.60555/cyt1-kh64` and license `CC0-1.0`. **PSI-10** has DOI `10.60555/w4zy-bt45` and **no declared license**. To change either, edit `dataset-citations.json` and run `npm run build:data`; `npm run smoke:data` fails if one of the two DOIs is missing from the output, and a test checks that the DOIs agree with the catalog's.

### Sources (`sources[]`)
Every file reports `read` (rows parsed), `kept` (rows with a test id) and `skipped` (rows without one). Skipped rows are empty rows, not tests.

| File | read | kept | skipped |
|---|---|---|---|
| `PSI-159_..._CFI-G_Normal_Flames.csv` | 179 | 179 | 0 |
| `PSI-159_..._CFI-G_Inverse_Flames.csv` | 1015 | 154 | 861 |
| `PSI-10_..._Flame_Design_Inverse_Flame.csv` | 120 | 120 | 0 |
| `PSI-10_..._Flame_Design_Normal_Flame.csv` | 207 | 207 | 0 |

Totals: **660 records, 629 plottable, 66 in the Moon-base zone** (20 + 28 + 18 + 0). PSI-10 normal flames add 207 records, 187 of them plottable and none in the zone; the other 20 are propane rows with no pressure.

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
| `ramped-condition` | `RAMP`, `RAMPED` | 9 PSI-10 inverse rows (`o2Fraction`, `tadK`, `zst`) and 60 PSI-10 normal rows (`tadK`, `zst`; their O2 and pressure are valid) |
| `low-o2-note` | `LOW O2` | 2 PSI-10 inverse rows (`o2Fraction`, `tadK`, `zst`) |
| `empty` | empty cell in a numeric column | 20 PSI-10 normal rows (`pressureBar`, `o2FractionAfterTest`), all propane |
| `no-value` | `-` | none |
| `not-numeric` | any other text | none |
| `not-recognized` | an outcome other than `yes`, `no`, `flash` (field `outcome`) | none |

93 records carry entries. The rows that are not plottable are the 11 PSI-10 inverse rows with a null O2 and the 20 PSI-10 normal rows with no pressure (31 in all). The reason names are ours: the PSI tables do not define them.

### Summary (`investigations[]`)
Per investigation: `accession`, `records`, `plottable`, `inMoonBaseZone`, `o2Range` and `pressureBarRange` (`[min, max]`, ignoring nulls, or `[null, null]`) and `fuels` (sorted species names).

### Known limits
- PSI-159 fuel labels such as `30% butane` map to `species: "butane"`; the percentage is not interpreted and the raw label is kept.
- PSI-10 inverse has no fuel column (ethylene is inferred from the `XC2H4` headers) and no outcome column. PSI-10 normal names its fuel by formula (`C2H4` is ethylene, `C3H8` is propane) and has no outcome column either: both PSI-10 tables are `not-reported`.
- PSI-10 normal reports O2 at the start (`XO2 (init)`, used as `o2Fraction`) and at the end of the test (`XO2 (final)`, kept as `o2FractionAfterTest`).
- Pressures reach about 3.3 bar; the Moon-base zone covers only the low-pressure end.
- PSI has no partial-gravity data (per the challenge statement), so none is in this file.

## Data licenses and citation (checked 2026-11-14 against PSI's investigation records)
- 25 of 26 investigations declare **CC0-1.0**.
- **PSI-10 (ACME Flame Design) declares no license in PSI's record.** It is NASA data hosted by PSI, but the license is unconfirmed: check the page's license field and ask PSI (the page lists `msfc-psi-help@mail.nasa.gov`) before submission.
- **Second check on 2026-11-14, through DataCite** (`https://api.datacite.org/dois/<doi>`, because PSI's investigation service answered HTTP 500 that day): PSI-159's DOI declares `cc0-1.0`; PSI-10's DOI has an **empty license list**. So PSI-10 is still unconfirmed, and `experiments.json` says so in `datasets[].licenseNote` instead of assuming CC0.
- PSI asks users to cite each investigation with its DOI ("Cite this Investigation"). Every catalog record carries its `doi`, and `experiments.json` carries the DOI and license of the two datasets it uses (`datasets[]`).
- The investigation record (including DOI and license) comes from the endpoint the PSI web page itself calls, `GET https://psi.nasa.gov/geode-py/ws/repo/investigations/<accession>`. It is not a documented API and may change, so the DOIs are stored in `data/curation/investigations.curation.json`.
