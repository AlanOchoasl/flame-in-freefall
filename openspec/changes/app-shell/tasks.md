# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Saturday 14 Nov, Argentina, and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Plan B for every task: the app reads committed stub JSON files, so it never waits on live data.

## 1. Decision and scaffold

Depends on: team decisions (React stack; `lightningcss` exception).

- [ ] 1.1 (by 13:30, ≤30 min) Team decides: React + TypeScript + Vite confirmed? approve or reject the `lightningcss` (MPL-2.0) exception, recorded by a person in `scripts/license-policy.json` with a reason; verify the decision is written in the team channel.
- [ ] 1.2 (by 14:30, ≤1h) Scaffold `app/` (React + TypeScript + Vite + Recharts), add `build` and `sync:data` scripts; verify `npm run build` succeeds and `node scripts/check-licenses.mjs` passes.

## 2. Layout and routing

Depends on: 1.

- [ ] 2.1 (by 16:00, ≤1.5h) Build the page layout with navigation, the hash router and the not-found page; verify each of the four routes opens directly and an invalid one shows not-found.
- [ ] 2.2 (by 17:00, ≤1h) Make the layout usable at 360 px and by keyboard (focus order, visible focus); verify manually at 360 px and with Tab only.

## 3. Data loading

Depends on: 1; uses the stub JSON files from the other changes.

- [ ] 3.1 (by 16:00, ≤1.5h) Load catalog, experiments and summaries independently with typed results and per-file error states; verify by deleting one file locally that other views still work and the message names the missing file.
- [ ] 3.2 (by 15:30, ≤30 min) Add the sync script that copies `data/processed/*.json` to `app/public/data/`; verify the copied files load under a sub-path.

## 4. Shared components

Depends on: 1. Used by every view.

- [ ] 4.1 (by 16:30, ≤1.5h) Build `AiLabel`, `PsiLink`, `NotAvailable` and `DataSourceNote` with unit tests for their text logic; verify reviewed and unreviewed AI labels differ and a missing value shows a dash plus a reason.
- [ ] 4.2 (by 17:30, ≤1h) Add the About section (not an official NASA product, AI-use description, sources, link to THIRD_PARTY_LICENSES); verify every statement matches AGENTS.md.

## 5. Deployment

Depends on: 2.

- [ ] 5.1 (Sat by 20:00, ≤1.5h) Pick the host, set the base path, deploy the current build; verify the public URL opens all four routes and works offline after the first load. Plan B: serve the built folder from another host, or from a release artifact.
- [ ] 5.2 (Sun by 12:00, ≤1h) Add a CI-free manual smoke checklist in `docs/SMOKE.md` (open each view, offline check, 360 px, keyboard); verify it is run once on the public URL.

## Workflow follow-up

- Archive the change after milestone 2 (Sunday 12:00) is met.
