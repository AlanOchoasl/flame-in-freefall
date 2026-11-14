# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Saturday 14 Nov, Argentina, and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Build window: 13:00–20:00. Plan B for every task: input is the committed cached JSON and the curation file is hand-edited, so nothing depends on live PSI access. If curation is not reviewed by Sat 19:30, ship with unreviewed flags visible; strict mode is only required before submission.

Reuses the Node + TypeScript scaffold from `data-pipeline` task 1.1.

## 1. Contract

Depends on: nothing. Unblocks the frontend (stub file).

- [ ] 1.1 (by 14:00, ≤1h) Write the TypeScript types for the record and dataset from design.md, plus a 3-record stub `data/processed/catalog.json` so the frontend can start; verify the stub type-checks and loads as JSON.

## 2. Normalization

Depends on: 1. Tasks 2.1 and 2.2 are independent of each other.

- [ ] 2.1 (by 15:30, ≤1.5h) Implement text, list, date and epoch-date normalizers (split on two or more spaces, MM-DD-YYYY → ISO, empty → `null`) with unit tests built from real rows (PSI-69/PSI-142 related list, PSI-159 empty dates); verify all tests pass.
- [ ] 2.2 (by 15:30, ≤1h) Implement the sub-area alias table (the 12 observed spellings), the `isCombustionScience` flag and the derived `testTables` file-name link, with tests; verify the three gaseous-fuel spellings share one normalized value and PSI-159 lists its CSV files.

## 3. Curation and build

Depends on: 1 and 2. Task 3.3 depends on nothing and can start at once.

- [ ] 3.1 (by 17:30, ≤2h) Load the curation file and `data/curation/vocabularies.json`, validate vocabularies and accessions (unknown accession or value fails the build), merge into records, mark uncurated records unreviewed; verify tests for the typo case (`PSI-1599`) and for an unreviewed value.
- [ ] 3.2 (by 19:00, ≤1.5h) Write `data/processed/catalog.json` with metadata, add `--strict`, and add an offline smoke check that runs twice and compares records (ignoring `generatedAt`); verify the file has 26 records and the smoke check passes with the network disabled.
- [ ] 3.3 (by 15:30, ≤1h) Seed `hardwareGroup` in the curation file from the statement's Hardware section (ACME six → `acme-cir`; FLEX, FLEX-2, CFI → `mdca-cir`; BASS, BASS-II, SPICE, SLICE → `msg-flow-duct`), each with source "Challenge statement, Hardware section"; verify each entry matches the statement text.

## 4. Curating the 26 investigations

Depends on: 3.3 for the file; verification needs 3.2. Split by accession range (first 13 / last 13) between whoever claims the tasks.

- [ ] 4.1 (by 19:30, ≤3h) Curate `fuelPhase`, `topics` and `measurements` for the first 13 accessions in catalog order, citing the text each value came from; set `reviewed: true` only after reading the objectives and approach; verify the build passes and the counts of reviewed values are reported.
- [ ] 4.2 (by 19:30, ≤3h) Same for the last 13 accessions; verify the build passes in strict mode for those accessions.

## 5. Documentation and citation

Depends on: 3.2 for docs; 5.2 can start once the dashboard knows which investigations it shows.

- [ ] 5.1 (Sun by 11:00, ≤30 min) Document the record shape, vocabularies and the strict flag in `data/processed/README.md`; verify the documented commands run as written.
- [ ] 5.2 (Sun by 14:00, ≤1h) Capture the DOI of each investigation shown in the dashboard from its PSI page ("Cite this Investigation") and fill it in the curation file; verify the DOIs appear in the output. Plan B: leave `doi` null and cite the PSI page link.

## Workflow follow-up

- Archive the change after review and after milestone 1 (Saturday 20:00) is met.
