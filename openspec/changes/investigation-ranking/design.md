# Design

## Context

Depends on `investigation-catalog` (topics, fuel phase, platform, normalized sub-area, research-area flag) and `data-pipeline` (per-investigation `moonZoneCount`). Observed in the catalog: PSI's own sub-area labels include `Spacecraft Fire Safety` (10 of 26), `Fire Safety` (1) and `Spacecraft Fire, Smoke Distribution` (1). The statement ties relevance to: prevention through material flammability (solids: BASS, SAFFIRE), detection (SAME, SAME-R), suppression (FLEX), and a Moon-base atmosphere of ≥ 30 % O2 at ≤ 10.2 psi. There is no partial-gravity data. See proposal.md.

## Goals / Non-Goals

**Goals:** a score a reader can audit in one minute.
**Non-Goals:** predicting safety, ranking by quality of science, learning weights.

## Decisions

1. **Additive points, not a weighted percentage.** Easy to explain and to recompute by hand. Alternative (normalize to 0–100 over assessed factors): inflates investigations with little evidence.
2. **Factors and maximum points (proposal; needs a science read-through by the team):**

| Factor | Points | Rule |
|---|---|---|
| Topic match | 0–3 | 3 if the investigation has the profile's primary topic, 1 if it has another fire-safety topic, else 0 |
| Solid-fuel flammability | 0–2 | `crew-cabin`, `lunar-base-rover`: 2 if fuel phase includes solid. `detection`: 1 if solid or aerosol-dust. `suppression`: 0 |
| NASA fire-safety label | 0–2 | 2 if the normalized sub-area is one of PSI's fire-safety labels listed above |
| Moon-base atmosphere (lunar profile only) | 0–3 | 3 if ≥ 10 tests in the zone, 2 if 1–9, 0 if tests exist but none in the zone, not assessed if no test rows |
| Microgravity project type | 0–1 | 1 if project type is a microgravity investigation |

   Primary topic: `material-flammability` for crew cabin and lunar; `detection`; `suppression`. Maximums: crew-cabin 8, lunar 11, detection 7, suppression 6.
3. **Profiles and weights live in `data/ranking/profiles.json`** (factors are code: a new factor is one function plus one registry entry) with rationale and source per factor, validated at build. The scoring function is pure and has no knowledge of specific accessions.
4. **Not-assessed is explicit** so BASS/SAFFIRE (no normalized rows) are not silently penalized.
5. **Ranking logic in the app's `src/lib/`**, no extra dependencies.

Data flow: `catalog.json` + `experiments.json` + `profiles.json` → score function → ranked list with breakdown → Ranking view.

## Risks / Trade-offs

- [The weights are my judgment, not NASA's] → disclaimer on screen; rationale in the file; team science review before the demo.
- [Hardware-group and topic tags are hand-curated and may be wrong] → unreviewed marker; reviewed flag required before submission.
- [Lunar profile favors PSI-159/PSI-10, the only ones with rows] → "not assessed" shown; limitation stated in the panel.
- [Ranking read as a safety verdict] → wording: "relevance to this environment", never "safe".

## Open Questions

- None blocking. Weights can be tuned later without changing specs.
