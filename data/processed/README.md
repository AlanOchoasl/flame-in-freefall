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
One record per real test row of **PSI-159** (normal flames and inverse flames), with the same field names whatever the source table. Built by `scripts/` from the cached CSVs in `data/sample/psi/`. Spec: `openspec/changes/data-pipeline/`.

**PSI-10 is not in this file.** PSI declares no license for that investigation, and the team rule is that no dataset is used without a verified license (see "Excluded datasets" below and "Data licenses and citation").

```bash
npm run build:data    # rebuild data/processed/experiments.json (offline)
npm run smoke:data    # offline check: two runs are identical, 333 / 333 / 48, PSI-10 absent, committed file is up to date
```

Regenerating changes only `generatedAt` when the inputs did not change.

Top level: `schemaVersion` (`1.2.0`; a removed or renamed field raises the major version; `1.1.0` added `datasets` and `1.2.0` added `excluded`), `generatedAt`, `sources`, `datasets`, `excluded`, `plottableCount`, `investigations`, `records`.

### Datasets (`datasets[]`)
One entry per investigation in the file (today only PSI-159), so every point can be cited. Built from `data/curation/dataset-citations.json`, which is edited by hand and says where each value came from.

| Field | Meaning |
|---|---|
| `accession`, `pageUrl` | The PSI investigation and its page |
| `doi`, `doiUrl` | The DOI of the dataset and its `https://doi.org/` link. `null` when unknown (the page link is then the citation) |
| `publisher` | Who DataCite lists as publisher (`NASA PSI`) |
| `license` | `{ spdx, url }`, or `null` when none is declared. A missing license is never filled in with a guess |
| `licenseNote` | Why the license is `null`; `null` when there is one |
| `checkedOn` | The day the DOI and license were captured |

Today: **PSI-159** has DOI `10.60555/cyt1-kh64` and license `CC0-1.0`. `npm run smoke:data` fails if that DOI is missing from the output, and a test checks that the DOIs agree with the catalog's.

### Excluded datasets (`excluded[]`)
A dataset that is **not used** is declared in the data itself, so a reader of `experiments.json` can see what was left out and why. Each entry has `accession`, `pageUrl`, `doi`, `doiUrl`, `publisher`, `reason` and `checkedOn`.

Today: **PSI-10** (DOI `10.60555/w4zy-bt45`), because no license is declared: the license fields of PSI's own record are empty and so is the DataCite record. The build refuses to run if a record of an excluded dataset reaches the output, and `smoke:data` checks that none does.

To use PSI-10 again, PSI has to declare a license. Then move its entry from `excluded` to `entries` in `data/curation/dataset-citations.json`, bring back its CSVs, mappers and tests from git history (the commit that added the normal-flame table is `254f5d7`, and it contains the mapper for both PSI-10 tables), list the files in `MUST_FILES` in `scripts/pipeline.ts`, and update the counts that tests and docs hard-code.

### Sources (`sources[]`)
Every file reports `read` (rows parsed), `kept` (rows with a test id) and `skipped` (rows without one). Skipped rows are empty rows, not tests.

| File | read | kept | skipped |
|---|---|---|---|
| `PSI-159_..._CFI-G_Normal_Flames.csv` | 179 | 179 | 0 |
| `PSI-159_..._CFI-G_Inverse_Flames.csv` | 1015 | 154 | 861 |

Totals: **333 records, 333 plottable, 48 in the Moon-base zone** (20 + 28).

### Record
| Field | Meaning |
|---|---|
| `id` | `<accession>:<test id>` without spaces, e.g. `PSI-159:21088A1`. Unique |
| `accession`, `pageUrl` | The PSI investigation and its page, so any point can be cited |
| `flameType` | `normal` or `inverse` |
| `fuel` | `{ species, raw, inferred }`. `raw` is the PSI label; `species` is the species name read from it (`ethane`, `propane` or `butane` today) or `null`; `inferred` is `true` when the table has no fuel column |
| `o2Fraction` | O2 mole fraction (0 to 1). PSI-159 normal uses "XO2 before test" |
| `o2FractionAfterTest` | PSI-159 normal only ("XO2 after test"); `null` elsewhere |
| `pressureBar` | Pressure in bar (PSI-159's column is already in bar) |
| `pressureIsApproximate` | `true` for PSI-159 (column "approx p (bar)") |
| `tadK`, `zst` | `Tad (K)` and `Zst` as in the PSI table. The meaning of `Zst` is not yet verified against PSI-159's Read Me |
| `outcome` | Hot ignition: `yes`, `no`, `flash` (case-insensitive in PSI-159), or `not-reported` for a table with no outcome column (it is **not** `no`; no table in use has that today) |
| `coolFlame` | `{ value, raw }`. `value` is `true` if the raw text starts with `yes`, `false` if it starts with `no`, `null` when empty or unrecognized; an empty cell is never `false`. `raw` keeps the text (`yes, PCI-D`). Only PSI-159 normal has this column |
| `selfExtOrFlowTermRaw`, `tfpRaw` | The "Self-ext or flow term" (`SE`, `FT`, `-`) and `TFP` (`Yes`/`No`) cells, kept raw and **not interpreted** (their meaning is not yet verified). `null` when the table has neither column |
| `isPlottable` | `true` when `o2Fraction` and `pressureBar` are both numbers |
| `inMoonBaseZone` | `true` when plottable, `o2Fraction >= 0.30` and `pressureBar <= 0.7033` (10.2 psi), boundaries inclusive. Thresholds come from the challenge statement and live in `scripts/moon-base-zone.ts` |
| `dataQuality[]` | Cells that were not valid numbers (see below). Empty when the row is clean |

### Cleaning rules and `dataQuality`
A row is never dropped or invented because of a bad cell. The cell becomes `null` and the record says why, with `{ field, raw, reason }`:

| `reason` | Raw cell | Where it happens today |
|---|---|---|
| `spreadsheet-error` | `#DIV/0!`, `#VALUE!` | 2 PSI-159 normal rows (`tadK`, `zst`) |
| `ramped-condition` | `RAMP`, `RAMPED` | none (it occurred in the PSI-10 tables, which are not used) |
| `low-o2-note` | `LOW O2` | none (same) |
| `empty` | empty cell in a numeric column | none (same) |
| `no-value` | `-` | none |
| `not-numeric` | any other text | none |
| `not-recognized` | an outcome other than `yes`, `no`, `flash` (field `outcome`) | none |

2 records carry entries (the 2 PSI-159 rows with `#DIV/0!`) and every record is plottable. The cleaning code still handles the other cases, which are covered by tests with synthetic cells. The reason names are ours: the PSI tables do not define them.

### Summary (`investigations[]`)
Per investigation: `accession`, `records`, `plottable`, `inMoonBaseZone`, `o2Range` and `pressureBarRange` (`[min, max]`, ignoring nulls, or `[null, null]`) and `fuels` (sorted species names).

### Known limits
- PSI-159 fuel labels such as `30% butane` map to `species: "butane"`; the percentage is not interpreted and the raw label is kept.
- The file holds only PSI-159, a study of cool diffusion flames of gaseous fuels. PSI-10 is left out for having no declared license, which removes half of the tests that were here before.
- Pressures reach about 3.3 bar; the Moon-base zone covers only the low-pressure end.
- PSI has no partial-gravity data (per the challenge statement), so none is in this file.

## Data licenses and citation (checked 2026-11-14 against PSI's own records and DataCite)
- **The rule:** no dataset is used without a verified license (`AGENTS.md`). It decides what is in `experiments.json`.
- **PSI-159** declares **CC0-1.0** in PSI's own investigation record, and the DataCite record of its DOI (`10.60555/cyt1-kh64`) says the same. It is used.
- **PSI-10** (ACME Flame Design, DOI `10.60555/w4zy-bt45`) declares **no license**: `licenseName`, `licenseIdentifier` and `licenseLink` are empty in PSI's record, and the DataCite record has an empty `rightsList`. The PSI repository page links no terms of use either, only a contact address (`msfc-psi-help@mail.nasa.gov`). **Its test tables are not used.** The team did not assume a license: the challenge statement offers PSI data publicly and its sister investigation PSI-159 is CC0, which suggests the field was left empty, but that is not a declaration.
- 25 of 26 investigations declare **CC0-1.0**; PSI-10 is the one that does not. The descriptive record of PSI-10 (title, objectives, summary) is still in `catalog.json`; the team decides separately whether that stays.
- PSI asks users to cite each investigation with its DOI ("Cite this Investigation"). Every catalog record carries its `doi`, and `experiments.json` carries the DOI and license of the dataset it uses (`datasets[]`) and the one it left out (`excluded[]`).
- On 2026-11-14 PSI's investigation service (`GET https://psi.nasa.gov/geode-py/ws/repo/investigations/<accession>`, the endpoint the PSI web page itself calls) answered HTTP 500 for a while, so DataCite was read first; later it answered and agreed. It is not a documented API and may change, so the DOIs are stored in `data/curation/investigations.curation.json` and `data/curation/dataset-citations.json`.
