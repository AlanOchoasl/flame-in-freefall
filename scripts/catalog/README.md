# Investigation catalog build

Reads `data/sample/psi-catalog/investigations.json` (cached PSI data) and the hand-edited files in `data/curation/`, and writes `data/processed/catalog.json`. Offline, no network. Spec: `openspec/changes/investigation-catalog/`.

```bash
node scripts/catalog/cli.ts            # build
node scripts/catalog/cli.ts --strict   # also fail while any curated value is unreviewed
npx vitest run scripts/catalog         # tests
npx tsc -p scripts/catalog/tsconfig.json   # type-check
```

Needs Node 22+ (runs `.ts` directly; only erasable TypeScript syntax and `.ts` import extensions are allowed) and, for tests and type-check, the dev dependencies `vitest`, `typescript` and `@types/node`.

## Curating (`data/curation/investigations.curation.json`)
Each value has `{ "value", "source", "reviewed" }`. `source` says which text it came from. Set `reviewed` to `true` only after a person has read it against the PSI record. Allowed values for `hardwareGroup`, `fuelPhase` and `topics` are in `data/curation/vocabularies.json`; `measurements` is free text. A typo in an accession, a field name or a value fails the build with a message.
