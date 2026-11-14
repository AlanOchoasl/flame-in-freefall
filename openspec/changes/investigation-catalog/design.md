# Design

## Context

Input: `data/sample/psi-catalog/investigations.json`, 26 investigations, retrieved 2026-11-14 from the endpoint the PSI web page itself calls (not a documented API; it may change, hence the cached copy). See proposal.md for motivation. Observed in the data:

- Empty values: `Acronym` 6/26, dates 4/26, `Hypothesis` 1/26 (PSI-108), `SubResearch Area` 2/26, `Experiment Hardware` name empty 6/26.
- `SubResearch Area` has 12 distinct spellings, e.g. `Flames of Gaseous Fuels`, `Flames of gaseous fuel`, `Flames of gaseous fuels`, `Gaseous`.
- Keywords, related investigations, hardware names and links are strings separated by runs of spaces. Dates are `MM-DD-YYYY`; the release date is an epoch number.
- All 26 have objectives, approach and earth-benefits text. There is **no field for sensors/measurements, fuel phase, fire-safety topic or hardware group**.
- The statement groups hardware: ACME's six experiments use the Combustion Integrated Rack (CIR); FLEX, FLEX-2 and CFI use the droplet apparatus (MDCA) in the CIR; BASS, BASS-II, SPICE and SLICE use the Microgravity Science Glovebox flow duct.

## Goals / Non-Goals

**Goals:** one trustworthy record per investigation; every judgment call is visible and reviewable.
**Non-Goals:** scoring, UI, summaries, test rows, any science claim that the source text does not state.

## Decisions

1. **Node + TypeScript script, no framework.** Same language as the UI and the `data-pipeline` change; reuses its scaffold.
2. **Committed static output `data/processed/catalog.json`.** The demo then works offline and the UI never runs the build.
3. **Curation lives in a hand-edited JSON file** keyed by accession, merged at build time. Alternative (curate inside the output): gets overwritten on rebuild. Alternative (AI-only tagging): unverifiable. AI may *draft* entries to save time, but only a person sets `reviewed: true`.
4. **Curated vocabularies (fixed lists; editing them is a spec change):**
   - `hardwareGroup`: `acme-cir`, `mdca-cir`, `msg-flow-duct`, `other`, `unknown`. Seeded from the statement's text.
   - `fuelPhase` (array): `gas`, `liquid-droplet`, `solid`, `aerosol-dust`, `not-combustion`.
   - `topics` (array): `material-flammability`, `detection`, `suppression`, `flame-fundamentals`, `modeling`, `not-fire-safety`. The first three come straight from the statement's prevention/detection/suppression framing.
   - `measurements` (array of free text, from the approach text, e.g. "thermocouples", "radiometers", "cameras").
   Each value is `{ value, source, reviewed }`; `source` says which text it came from.
5. **Sub-area normalization via an explicit alias table** (lowercase, trimmed, known variants mapped), not general stemming. Unknown values pass through lowercased and are reported.
6. **Dates:** epoch → UTC date; `MM-DD-YYYY` → ISO. Invalid → `null` plus a warning.
7. **Test tables are linked by file-name prefix** (`PSI-159_…csv` in `data/sample/psi/`), so the link needs no curation.
8. **Privacy/minimalism:** person names, author lists and funding numbers are not copied to the output; publication titles are kept for references.

### Output contract (record shape; values shortened)

```json
{
  "accession": "PSI-159",
  "title": "Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases(ACME CFI-G)",
  "acronym": "ACME CFI-G",
  "researchArea": "Combustion Science",
  "isCombustionScience": true,
  "projectType": "Microgravity Investigation",
  "flightPlatform": "International Space Station (ISS)",
  "subResearchArea": { "raw": "Flames of Gaseous Fuels", "normalized": "flames of gaseous fuels" },
  "hardware": { "names": ["ACME", "Combustion Integrated Rack (CIR)"], "links": ["https://www1.grc.nasa.gov/..."] },
  "keywords": ["chemical kinetics", "ethane", "..."],
  "relatedInvestigations": [],
  "startDate": null,
  "endDate": null,
  "releaseDate": "2025-11-20",
  "objectives": "…", "approach": "…", "hypothesis": "…", "earthBenefits": "…",
  "publicationTitles": ["Spherical gas-fueled cool diffusion flames", "…"],
  "curated": {
    "hardwareGroup": { "value": "acme-cir", "source": "Challenge statement, Hardware section", "reviewed": true },
    "fuelPhase": { "value": ["gas"], "source": "Approach text", "reviewed": false },
    "topics": { "value": ["flame-fundamentals"], "source": "Objectives text", "reviewed": false },
    "measurements": { "value": [], "source": null, "reviewed": false }
  },
  "testTables": ["PSI-159_Experimental_table_CFI-G_Normal_Flames.csv", "…"],
  "pageUrl": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-159",
  "doi": null
}
```

The dataset file wraps the records with `generatedAt`, `sourceRetrieved`, `recordCount` and `unreviewedCount`. The `hardware.names` split above is illustrative: the source string has two names separated by two spaces and the real split rule is "two or more spaces".

Data flow: `data/sample/psi-catalog/investigations.json` + `data/curation/investigations.curation.json` + file names in `data/sample/psi/` → merge/normalize → `data/processed/catalog.json` → React views (separate changes).

## Risks / Trade-offs

- [Curation needs science reading and the team is not expert] → source note + `reviewed` flag on every value; hardware group seeded from the statement; UI can show "not reviewed"; split the 26 investigations among three people.
- [Splitting on "two or more spaces" breaks a name that contains a double space] → unit tests on real rows; raw string kept in the cached source.
- [PSI changes the data] → input is cached and committed.
- [Curated vocabularies too coarse] → editing them is a visible spec change, not a silent drift.

## Open Questions

- How to capture each DOI (the PSI page shows one under "Cite this Investigation"): by hand, or by reading the investigation detail endpoint. Deferrable: `doi` stays `null` until then, and the strict build before submission can require it.
