# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are deadlines for the milestone, in Argentina time: Saturday 14 Nov unless "Sun" is written. `≤Xh` is a cap per task, not an estimate. Nothing here depends on live data: every source is cached in `data/sample/` and `data/processed/`. Plan B for each group is stated in it.

## 1. Data: curation, scenarios and labels

Plan B: if the science reading runs late, ship the curated tags with `reviewed: false`, so the unreviewed marker shows. Ship gaps or facts that cannot be checked with `reviewed: false`, or drop them from the file.

- [ ] 1.1 (by 20:00, ≤1h) Curate `fuelPhase` and `topics` for PSI-25, 26, 47, 68 and 69 in `data/curation/investigations.curation.json`, quoting the PSI text or the challenge statement as `source`. Verify that `npm run check:curation` passes, that `node scripts/catalog/cli.ts` rebuilds `catalog.json`, and that PSI-69's topics include `suppression`.
- [ ] 1.2 (by 20:30, ≤1h) In `data/ranking/profiles.json`:
  - remove the `detection` and `suppression` profiles;
  - add `atmosphere` entries (O2, pressure, gravity, each with `source` and `expected`) to `crew-cabin` and `lunar-base-rover`.

  Verify that `npm run build` in `app/` passes and that the ranking unit tests still pass after their fixtures are updated.
- [ ] 1.3 (by 21:30, ≤1.5h) Write `data/ranking/scenarios.json` (`schemaVersion` "1.0.0").
  - Moon-base gaps: solids tested up to about 22 % O2 (BASS-II, SAFFIRE-I/II columns); gas only in the zone (`computed: "moonBaseZoneCount"`); no partial-gravity data (statement).
  - At least one cabin gap.
  - One fact per pillar: SAFFIRE/BASS-II, SAME, FLEX. Each names its table and columns.

  A second person re-reads every number against the CSV and sets `reviewed`. Verify that each number matches a value in the named CSV.
- [ ] 1.4 (by 21:30, ≤1h) Add a `labels` map to `data/curation/vocabularies.json` (fuel phase, topics, hardware groups, goals) and copy that file in `app/scripts/sync-data.mjs`. Verify that `npm run sync:data` copies it.
- [ ] 1.5 (by 22:00, ≤1h) Extend `scripts/validate-ranking-profiles.mjs` to check `scenarios.json` and the labels:
  - `schemaVersion` is present;
  - every gap and fact has a non-empty source;
  - scenario, pillar and accession ids are valid;
  - every vocabulary value has a label.

  Verify that the build fails when a `source` is removed or a label is missing, and passes again when it is restored.

## 2. Scenario screen

Depends on 1.2–1.4. Plan B: build against hand-made fixture JSON with the same shape as `scenarios.json`.

- [ ] 2.1 (Sun by 09:00, ≤1.5h) Add `getScenarios()` and `getVocabularyLabels()` to `app/src/data/dataAccess.ts`. Add a pure helper that maps ranked investigations to the three pillars. Verify with unit tests on the real files: pillar mapping, top-3 order following the scenario ranking, and the untagged count.
- [ ] 2.2 (Sun by 10:30, ≤2h) Build the Scenario view at `#/scenario/<id>`:
  - picker (radio cards);
  - context block;
  - gap cards, with the computed Moon-base count taken from the coverage-map insight helper;
  - pillar cards;
  - disclaimer;
  - "Dig deeper" links.

  Add the `#/` redirect and Not found for unknown ids. Verify on screen: switching scenario updates the address and blocks, the Moon-base gap reads "66 of 442", and no slug is visible.
- [ ] 2.3 (Sun by 11:00, ≤1h) Add the design-system pieces: scenario card, gap card (three severities), pillar card, readable-label chips, heading focus without a ring on mouse navigation. Verify with Tab-only navigation and at 360 px: one column, no horizontal page scroll, every target at least 44 px.

## 3. Investigations, Compare and Detail

Depends on 1.2 and 1.4. Plan B: keep the current Ranking view behind `#/investigations` with readable labels only, and leave the compact rows for after the freeze.

- [ ] 3.1 (Sun by 10:30, ≤2h) Rework the Ranking view into Investigations:
  - compact rows;
  - search and goal filters kept in the address;
  - "Compare selected";
  - "How it is scored" panel;
  - `#/ranking` redirect.

  Verify at 1280 px that at least 10 rows fit on one screen, that the Suppress filter shows FLEX and FLEX-2 (after 1.1), and that two checked rows open Compare.
- [ ] 3.2 (Sun by 11:00, ≤1h) Compare picker: show candidates only after typing or "Browse all" (at most 8), with the table placed right after the chips. Verify that opening `#/compare?ids=PSI-159,PSI-98` shows the table with no candidate list above it.
- [ ] 3.3 (Sun by 11:30, ≤1h) Detail: move the score breakdown there, for the last selected scenario; the ranking-position block lists the two scenarios. Verify on PSI-159 and PSI-25.
- [ ] 3.4 (Sun by 11:30, ≤0.5h) Update the navigation (Scenarios, Investigations, Compare, Coverage map, About) and the About known-limits text if needed. Verify `aria-current` on each screen.

## 4. Integration check

- [ ] 4.1 (Sun by 12:00, ≤1h) From a clean checkout run `npm run sync:data && npm run build` in `app/` and the root `npm test`, then open the preview in an incognito window. Verify milestone 2:
  - home → scenario → pillar → Detail → Compare works end to end;
  - the "66 of 442" and FLEX facts match the data;
  - `openspec validate --all --strict` is run and its result is recorded (see the note below).

## Workflow follow-up

- Archive after milestone 2. The edited in-flight changes (`investigation-ranking`, `screen-specs`, `design-system`, `investigation-catalog`) should be archived before or together with this one.
- Note: with OpenSpec CLI 2.0.0, `openspec validate --strict` warns that the existing "Investigation detail screen content" requirement in `screen-specs` is longer than 500 characters. That text predates this change and was left unchanged.
