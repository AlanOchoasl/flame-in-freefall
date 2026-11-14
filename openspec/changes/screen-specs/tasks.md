# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Saturday 14 Nov (Sunday where stated), Argentina, and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Plan B for every task: the wireframes in `design.md` are the source; build against the stub JSON files.

## 1. Frame and states

Depends on: `app-shell` 1.2 (scaffold) and 2.1 (router).

- [ ] 1.1 (by 19:00, ≤2h) Build the common frame (skip link, header with current-item marker, title, footer with PSI link and notice) and set the document title and heading focus on route change; verify with Tab only and by checking the title on each route.
- [ ] 1.2 (by 19:30, ≤1.5h) Build the state helper (loading, failed naming the file, empty with clear-filters action, normal); verify by removing one data file locally and by forcing an empty filter result.
- [ ] 1.3 (by 19:30, ≤30 min) Add the `#/` redirect to `#/ranking` and the `#/about` route; verify opening the bare URL lands on `#/ranking`.

## 2. Screens that have no other owner

Depends on: 1. Uses stub `catalog.json`, `experiments.json`, `summaries.json`.

- [ ] 2.1 (Sun by 09:30, ≤2h) Build Investigation detail in spec order with reasoned dashes and AI/PSI labels; verify one investigation with test rows and one without, and a related accession missing from the catalog.
- [ ] 2.2 (Sun by 10:30, ≤1h) Add ranking position per profile to Detail using the ranking function; verify it matches the Ranking screen for the same profile. Plan B: omit the block.
- [ ] 2.3 (Sun by 10:30, ≤1h) Build About with the AI-use facts read from `summaries.json` and the limits list; verify values equal the file and that a missing file shows the fallback message.
- [ ] 2.4 (Sun by 10:30, ≤30 min) Build Not found showing the requested address; verify with an unknown hash and an unknown accession.

## 3. Alignment of the view changes

Depends on: 1 and the view tasks in `investigation-ranking` 2.1, `investigation-comparator` 2.1, `coverage-map` 2.1.

- [ ] 3.1 (Sun by 12:00, ≤1.5h) Check each of Ranking, Compare and Coverage map against its block order, states, 360 px and keyboard scenarios in this spec; verify each scenario once by hand and note gaps in `docs/SMOKE.md`.
- [ ] 3.2 (Sun by 12:00, ≤1h) Review all screen copy: each factual sentence cites the challenge statement or a PSI field; verify with a read-through by two people.

## 4. Reconcile other changes

- [ ] 4.1 (by 18:00, ≤30 min) Update the `app-shell` spec and proposal so About is a route and the home route is Ranking (use `/openspec-update-change`); verify the three documents no longer contradict each other.

## Workflow follow-up

- Archive the change after milestone 2 (Sunday 12:00) is met.
