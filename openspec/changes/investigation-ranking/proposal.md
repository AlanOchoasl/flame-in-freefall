# Proposal

**Label: Must**

## Why

The challenge asks the dashboard to rank investigations by relevance to fire safety in crew environments. A ranking nobody can inspect would fail on validity, so the score must be transparent: every point traceable to a data field and to the challenge statement.

## What Changes

- Add four environment profiles (crew cabin, lunar base / pressurized rover, detection, suppression), each with documented weights stored in a data file.
- Compute a deterministic score per investigation from catalog and experiment data; show the per-factor breakdown and evidence.
- Treat missing evidence as "not assessed", never as zero evidence of relevance silently.
- Show a "How this ranking works" panel stating the basis and that this is a heuristic, not a NASA assessment.
- Provide a Ranking view with the selected profile and filters.

## Capabilities

### New Capabilities
- `investigation-ranking`: transparent, profile-based relevance ranking of PSI investigations for fire safety.

### Modified Capabilities
<!-- none -->

## Impact

- New pure scoring code with tests, `data/ranking/profiles.json`, and the Ranking view in `app/`.
- Reads: `catalog.json` (topics, fuel phase, platform, sub-area), `experiments.json` (per-investigation Moon-zone counts).
- Basis: `Recursos/Enunciado oficial - Flame in Freefall.md` (prevention via material flammability, detection via SAME, suppression via FLEX, Moon-base atmosphere).

## Out of scope (No)

Machine-learned scoring, per-test scoring, user-defined weights, claims of safety, ranking of non-PSI sources.
