# Proposal

**Label: Must**

## Why

The challenge asks for a dashboard that summarizes, ranks and compares investigations. All three views, and the AI summaries, need one clean catalog of the 26 PSI investigations. The PSI data has messy text lists and 13 spellings of the research sub-area, and it lacks fields the statement cares about (hardware group, fuel phase, fire-safety topic, sensors).

## What Changes

- Add a TypeScript build script that reads the cached PSI catalog (`data/sample/psi-catalog/investigations.json`) and a hand-reviewed curation file, and writes one static file, `data/processed/catalog.json`.
- Normalize text, lists, dates and sub-area spellings; keep the raw values next to the normalized ones.
- Curated fields (hardware group, fuel phase, topics, measurements) each carry a source note and a `reviewed` flag. Unreviewed values are marked, never trusted silently.
- Link each investigation to its cached test tables and to its official PSI page; leave a DOI field for later.
- Add a `--strict` mode that fails while anything is unreviewed (used before submission).

## Capabilities

### New Capabilities
- `investigation-catalog`: normalized, curated, provenance-tagged catalog of PSI combustion investigations, for ranking, comparison, the coverage map and summaries.

### Modified Capabilities
<!-- none -->

## Impact

- New code and tests; new input `data/curation/investigations.curation.json` (hand-edited); new output `data/processed/catalog.json` (committed, offline).
- Source: PSI repository, 26 investigations. Page pattern: https://psi.nasa.gov/physci/repo/data/investigations/PSI-<n>
- Challenge statement: `Recursos/Enunciado oficial - Flame in Freefall.md`.

## Out of scope (No)

The ranking score, the UI, AI summary generation, test-row data (the `data-pipeline` change), live PSI access, partial-gravity data (none exists in PSI, per the statement).
