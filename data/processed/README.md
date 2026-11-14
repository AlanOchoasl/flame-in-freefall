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

## Data licenses and citation (checked 2026-11-14 against PSI's investigation records)
- 25 of 26 investigations declare **CC0-1.0**.
- **PSI-10 (ACME Flame Design) declares no license in PSI's record.** It is NASA data hosted by PSI, but the license is unconfirmed: check the page's license field and ask PSI (the page lists `msfc-psi-help@mail.nasa.gov`) before submission.
- PSI asks users to cite each investigation with its DOI ("Cite this Investigation"). Every record carries its `doi`.
- The investigation record (including DOI and license) comes from the endpoint the PSI web page itself calls, `GET https://psi.nasa.gov/geode-py/ws/repo/investigations/<accession>`. It is not a documented API and may change, so the DOIs are stored in `data/curation/investigations.curation.json`.
