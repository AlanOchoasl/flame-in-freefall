# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Saturday 14 Nov (Sunday where stated), Argentina, and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Plan B for every task: develop against the stub `catalog.json` / `experiments.json`; the score function is pure and needs no live data.

## 1. Profiles and score function

Depends on: `investigation-catalog` types (task 1.1) for the record shape.

- [x] 1.1 (by 17:00, ≤1h) Write `data/ranking/profiles.json` with the four profiles, factors, maximum points, rationale and source (quote the statement); verify the build fails when a weight is removed.
- [x] 1.2 (by 18:30, ≤2h) Implement the pure scoring function with breakdown, "not assessed" handling, non-combustion-last rule, unreviewed marker and ordering with accession tie-break; verify unit tests cover each factor, the not-assessed case, the tie-break and a changed weight.

## 2. Ranking view

Depends on: 1.2 and `app-shell` 2.1, 4.1.

- [x] 2.1 (Sun by 09:30, ≤2h) Build the Ranking view: profile selector, ranked list, per-investigation expandable breakdown, fuel-phase and topic filters with counts; verify switching profile re-ranks and filters show the match count.
- [ ] 2.2 (Sun by 10:30, ≤1h) Add the "How this ranking works" panel with the factor table, rationale and disclaimer; verify the text matches `profiles.json`.
- [ ] 2.3 (Sun by 11:30, ≤1h) Make not-assessed and unreviewed markers visible and understandable; verify with an investigation that has no test rows.

## 3. Review

- [ ] 3.1 (Sun by 12:00, ≤1h) Team reads the weights and rationale against the challenge statement and adjusts `profiles.json`; verify a note of the review is added to the panel text.

## Workflow follow-up

- Archive the change after milestone 2 (Sunday 12:00) is met.
