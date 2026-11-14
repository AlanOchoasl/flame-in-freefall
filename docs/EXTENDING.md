# Extending the dashboard

Short recipes for the changes we expect to make. Each one was followed once on a throwaway change and reverted (see "How this was checked"). Commands run from the repository root unless stated.

## How the pieces fit

```
data/sample/*            cached PSI inputs (catalog JSON, test-table CSVs)
data/curation/*          hand-edited tags, validated against vocabularies.json
        |  node scripts/catalog/cli.ts      -> data/processed/catalog.json
        |  npm run build:data               -> data/processed/experiments.json
        |  (summaries scripts)              -> data/processed/summaries.json
data/ranking/profiles.json                  ranking profiles and weights
        |  cd app && npm run sync:data      copies them to app/public/data/
        v
app/src/data/dataAccess.ts   the only place that loads data (getCatalog, getExperiments,
        |                    getSummaries, getRankingProfiles)
        v
app/src/views/*              screens, listed once in app/src/views/index.ts
```

Rules that keep this cheap to extend: lists that vary (profiles, vocabularies, views, mappers) live in one place; every data file carries a `schemaVersion` that the loader checks; views never fetch or parse files themselves.

## 1. Add a screen

1. Create `app/src/views/MyView.tsx`. The component receives `{ params, query }` (`ViewProps`). Start with an `<h1>`: focus moves to it on every route change.
2. Load data with `useDataResult(getCatalog)` (or another loader) and render it inside `<DataState state={...} label="...">`, which handles loading, failed (naming the file), empty and normal. Use the shared components (`AiLabel`, `PsiTextLabel`, `PsiLink`, `NotAvailable`, `DataSourceNote`) instead of local wording.
3. Add one entry to `views` in `app/src/views/index.ts`:
   ```ts
   { path: '/my-view', title: 'My view', component: MyView, inNav: true }
   ```
   A `:name` segment in `path` arrives in `params.name`; the query string arrives in `query`. `inNav: false` keeps it out of the menu.

Nothing else changes: the router, menu, document title and Not found screen read the same list.

## 2. Add a ranking profile

1. In `data/ranking/profiles.json`, copy an existing profile object, then change `id`, `label` and the factor values (`maxPoints`, points, `rationale`, `sourceQuote`). Quote the challenge statement in `sourceQuote`. Factor ids: `topicMatch`, `solidFuelFlammability`, `nasaFireSafetyLabel`, `moonBaseAtmosphere`, `microgravityProjectType`.
2. Copy **every** field of each factor. `npm run build` in `app/` validates only the four built-in ids (`crew-cabin`, `lunar-base-rover`, `detection`, `suppression`), so a mistake in a new profile is not caught.
3. `cd app && npm run sync:data`.

The Investigation detail screen lists every profile in the file, so the new one appears with no code change; the Ranking screen's profile selector is specified to do the same.

To add a new scoring **factor**, add its id to `FactorId` and a `case` in `scoreFactor` in `app/src/lib/ranking.ts`, then use it in the profiles.

## 3. Add a test-table mapper (a new PSI table in `experiments.json`)

**First, check the license.** No dataset is used without a verified license. Read `licenseName` in the PSI investigation record (`https://psi.nasa.gov/geode-py/ws/repo/investigations/<accession>`) and the `rightsList` of its DOI on DataCite (`https://api.datacite.org/dois/<doi>`). If a license is declared, add the investigation under `entries` in `data/curation/dataset-citations.json`. If none is declared, do not add its data: list it under `excluded` with the reason, as PSI-10 is. The build refuses to run if a record of an excluded dataset reaches the output.

1. Put the CSV in `data/sample/psi/`. Keep small samples only; name it with the investigation's accession as prefix (`PSI-xx_...csv`), which also links it to its catalog record.
2. Create `scripts/mappers/<name>.ts` exporting a `Mapper`: `{ accession, filePattern, mapRow }`. `filePattern` is a regex on the file name; `mapRow` returns one `ExperimentRecord`. Use `cleanNumber` for numeric cells so values like `#DIV/0!` or `RAMP` become `null` with a data-quality entry. Convert pressure to bar and keep O2 as a fraction. `scripts/mappers/psi159.ts` is the template.
3. Register it in `MAPPERS` in `scripts/mappers/index.ts` **and** add the file name to `MUST_FILES` in `scripts/pipeline.ts` (a registered mapper alone does not include the file).
4. Add a test beside it (see `psi159.test.ts`).
5. `npm run build:data` regenerates `data/processed/experiments.json`. Then update the guards that hard-code today's numbers, or they will fail on purpose:
   - `EXPECTED` in `scripts/smoke-data.ts` (records, plottable, in the Moon-base zone);
   - the mapper count asserted in `scripts/mappers/psi159.test.ts` ("registers each mapper once").
6. `npm run smoke:data` and `npm test`. Commit the regenerated `experiments.json` (a test checks that it equals a fresh build), then `cd app && npm run sync:data`.

The coverage map and the test-condition ranges on the Detail screen read the new rows automatically.

## 4. Add or refresh an investigation in the catalog

1. Add its record to `data/sample/psi-catalog/investigations.json`, in the same shape as the existing entries (the cached PSI catalog).
2. Add an entry to `data/curation/investigations.curation.json`, keyed by accession: `fuelPhase`, `topics`, `measurements` (each `{ value, source, reviewed }`), `hardwareGroup` if known, and `doi` from the "Cite this Investigation" box on its PSI page. Allowed values are in `data/curation/vocabularies.json`; follow `docs/CURATION.md` and leave `reviewed: false` until a person has read it against PSI.
3. `node scripts/catalog/cli.ts` rewrites `data/processed/catalog.json`. A record with no curation entry is still built, with empty, unreviewed tags and a `null` DOI. A typo in an accession, field or value fails the build with a message (for example `Curation names unknown accession "PSI-1599"`). Run it with `--strict` before submission: it fails while any value is unreviewed.
4. `cd app && npm run sync:data`.

Ranking, Compare and Detail pick up the new record. If it has test tables, add a mapper (recipe 3).

Known issue: `npm run check:curation` rejects the current curation file (it expects `hardwareGroup` as a list and does not know `doi`). The catalog build in step 3 validates the same file, so rely on that until the check is aligned.

## 5. Add a choice to the shared address state (a new explorer parameter)

The console keeps its choices in the address (`#/ranking?profile=detection&ids=PSI-47,PSI-25`). Everything that reads or writes them goes through `app/src/router/explorerQuery.ts`.

1. Add the field to `ExplorerState` and to `NO_EXPLORER_STATE`, and its name to `KEYS` (the order the parameters are written in).
2. Read it in `parseExplorerQuery`. If the data limits its values, add the list of known values to `KnownValues` and check it in `cleanExplorerState`, so an unknown value is ignored instead of breaking the page.
3. In a panel, read the value from `query` and write a change with `replaceExplorerState({ yourField: value })`. This replaces the history entry, so Back keeps leaving the page and not each click.
4. Links to other screens that must keep the choice use `carryExplorerState(path, query)` or `explorerHash(path, state)`. Only the explorer parameters are carried; any other parameter is dropped on purpose.
5. Add cases to `explorerQuery.test.ts` (round trip, an unknown value, default omitted).

Do not keep the choice in `useState` as well: the address is the only source of truth.

## 6. Replace the static files with an API

Only `app/src/data/dataAccess.ts` calls `fetch`. To read from an API:

1. Change how `loadDataFile` builds its request (today `${BASE_URL}data/<file>`).
2. Keep what it returns: `DataResult<T>` (`ok` with data, or `error` naming the file) and the `schemaVersion` check. The four `get...` functions keep their signatures, so no view changes.

Think first about two requirements of `app-shell`: the app must not request anything outside its own origin, and it must keep working offline after the first load. An API breaks both unless you keep the static files as a fallback. A backend was deliberately left out of the Must scope.

## After any change

```bash
npm test                      # data, ranking, catalog and app logic
npm run typecheck             # scripts and shared types
cd app && npm run build       # profile validation, type check, production build
node scripts/check-licenses.mjs app   # after adding any npm package (and the same at the root)
```

## How this was checked

Recipes 1 to 4 were followed on a throwaway change in the browser and the command line, then reverted:

1. A new screen with a path parameter and one in the menu: both routes opened, the menu entry and the document title appeared, and `inNav: false` kept it out of the menu.
2. A fifth ranking profile: `npm run build` validated it, and the Detail screen listed it with no code change.
3. A mapper for the PSI-10 normal-flame table: `experiments.json` went from 453 to 660 records (629 plottable, 66 in the Moon-base zone), and the smoke check and the mapper-count test failed until their numbers were updated, which is why step 5 lists them. (That table is no longer in the project: PSI-10 declares no license, see the first paragraph of this recipe.)
4. A copied catalog record: the catalog went from 26 to 27 records, and a curation entry for an unknown accession failed the build.

Recipe 6 was checked only by searching for `fetch(` in `app/src` (one call, in `dataAccess.ts`); it was not implemented.

Recipe 5 (the address state) was written from the `explorer-state` implementation; it was not followed again on a throwaway change.
