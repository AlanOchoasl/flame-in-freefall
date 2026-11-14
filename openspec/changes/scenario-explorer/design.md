# Design

## Context

See proposal.md (Why). Current state, observed on 2026-11-14:

- `app/` is React + TypeScript + Vite, static. Data arrives through `app/src/data/dataAccess.ts`. `app/scripts/sync-data.mjs` copies `data/processed/*.json` and `data/ranking/*.json` into `app/public/data/`. Vercel runs `sync:data` before `build`.
- `rankInvestigations(investigations, profile, testCoverage)` in `app/src/lib/ranking.ts` already ranks for any profile. `testCoverage` is a plain record keyed by accession.
- `data/ranking/profiles.json` has 4 profiles: `crew-cabin`, `lunar-base-rover`, `detection` and `suppression`.
- Curation (`data/curation/investigations.curation.json`) has no `fuelPhase` or `topics` for PSI-20, 21, 22, 23, 25, 26, 47, 68 and 69. Because of that, BASS, FLEX and DAFT score 3 of 11 and fall into no pillar.
- Cached PSI tables checked by hand:
  - BASS-II "Calibrated initial O2 % by vol": 13.6–22.2 % (129 rows).
  - SAFFIRE-I "Percent O2": about 21.5 %. SAFFIRE-II "Percent O2": about 21.5–22.1 %.
  - FLEX: 274 rows, O2 mole fraction 0.12–0.34. Fuels: methanol 157, heptane 117. "Test end": Extinction 186, Disruption 61, Completion 27.

## Goals / Non-Goals

**Goals:** reuse the ranking function and the views that are already built. Keep every new fact in a reviewable data file. Add no new dependency.

**Non-Goals:**
- Parsing FLEX, BASS or SAFFIRE tables in code. The facts are hand-copied, each with its source.
- Changing the scoring factors.

## Decisions

1. **Scenarios are the existing ranking profiles.**
   - `profiles.json` keeps `crew-cabin` and `lunar-base-rover`. Each profile gains `atmosphere` entries (`{ label, value, source, expected }`).
   - `detection` and `suppression` are removed, because they become pillar filters.
   - Alternative rejected: a separate scenario list mapped to profiles. That would be two lists for one concept.
2. **`data/ranking/scenarios.json`** (`schemaVersion` "1.0.0") holds:
   - `gaps[]`: `{ id, scenario, severity: major|partial|no-data, title, text, source, sourceUrl?, computed?, reviewed }`.
   - `facts[]`: `{ pillar, text, accession, table, columns, reviewed }`.
   - It lives in `data/ranking/` because that folder is already synced. Alternative rejected: changing the sync script for a new folder.
   - `computed: "moonBaseZoneCount"` tells the view to fill in the count from `experiments.json` (via the existing coverage-map insight helper). This keeps typed-in numbers out of the file.
3. **Pillars come from curated topics:**
   - `material-flammability` → Prevent;
   - `detection` → Detect;
   - `suppression` → Suppress.

   An investigation can sit in more than one pillar. Order inside a pillar follows `rankInvestigations` for the scenario.
4. **Readable labels:** a `labels` map is added to `data/curation/vocabularies.json`, and `sync-data` copies that one file. The UI never prints a raw slug.
5. **Validation:** `scripts/validate-ranking-profiles.mjs`, which already runs in `build`, also checks `scenarios.json`:
   - `schemaVersion` is present;
   - every gap and fact has a non-empty `source`;
   - scenario ids exist in `profiles.json`;
   - pillar ids are valid;
   - `accession` exists in the catalog.
6. **Routes:**
   - `#/` → `#/scenario/lunar-base-rover`;
   - `#/scenario/<id>`;
   - `#/investigations?scenario=<id>&goal=<pillar>`;
   - `#/ranking` redirects to `#/investigations` so old links keep working.

   Moon base is the default because the challenge statement centers on it.
7. **Heading focus fix:** the heading keeps `tabIndex={-1}` and programmatic focus for screen readers. The ring is drawn only on `:focus-visible`.

Data flow:

1. **Source:** PSI catalog JSON and cached CSVs in `data/sample/`.
2. **Processing:**
   - `catalog.json` and `experiments.json` come from the existing scripts;
   - `scenarios.json` facts and gaps are written by a person, with a source per entry, and validated at build;
   - `sync-data` copies the files.
3. **Visualization:** `dataAccess` → Scenario view (ranking per scenario → pillars; gaps with computed counts) and Investigations view.

## Risks / Trade-offs

- **Hand-copied facts can drift from the tables.** → Each fact names the table and columns. `reviewed` stays false until a second person checks it, and the unreviewed marker shows until then.
- **Curation of PSI-25/26/47/68/69 needs science reading, about 1 h.** → If it is not reviewed in time, the tags ship with `reviewed: false` and the marker (the existing rule).
- **Removing two profiles changes the "ranking position per profile" block on Detail.** → That block is data-driven; only its spec example changes.
- **Ranking and Coverage map views are already built.** → Ranking is restyled, not rewritten. The coverage map is untouched.

## Migration Plan

1. Data files first (profiles, scenarios, labels, curation). Run `npm run build:data` and the validator.
2. Then the views. Keep the `#/ranking` redirect.
3. Rollback: revert the commits. The old views stay in git history.

## Open Questions

- The exact gap texts for `crew-cabin`. Content only: the curator writes them in `scenarios.json`, with their sources.
