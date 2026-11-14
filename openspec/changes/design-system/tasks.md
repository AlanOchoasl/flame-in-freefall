# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Saturday 14 Nov (Sunday where stated), Argentina, and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Plan B for every task: keep the current plain styling and ship the view unstyled; the specs of each view do not depend on this change.

## 1. Tokens

Depends on: `app-shell` 1.2 (scaffold).

- [x] 1.1 (by 19:00, ≤1h) Replace the `:root` block in `app/src/styles.css` with the token table from `design.md`, keeping the seven existing names; verify About and Investigation detail still render and the build passes.
- [x] 1.2 (by 19:30, ≤30 min) Add the focus ring, reduced-motion rule and minimum target size to the base styles; verify by tabbing through About.
- [ ] 1.3 (Nice, Sun by 11:00, ≤1h) Write a small script that computes the contrast of every pair in the `design.md` table from the shipped CSS and prints pass or fail; verify it fails when a token is changed to a low-contrast value. Plan B: measure the pairs once by hand and record the results in `docs/SMOKE.md`.

## 2. Shared components

Depends on: 1.1. Files: `app/src/components/`.

- [x] 2.1 (Sun by 09:00, ≤1.5h) Restyle `AiLabel`, `PsiTextLabel`, `NotAvailable` and `DataState` as specified (AI box, PSI rule, missing value, four states with the "Try again" and "Clear filters" actions); verify each state by forcing it, and that `labelText.test.ts` still passes.
- [ ] 2.2 (Sun by 09:30, ≤1h) Add `Marker` (six kinds), `TagChip` (square and pill), `CountLine` (polite live region) and `CitationBlock`; verify with a screen reader or by reading the DOM that each marker exposes its word.
- [ ] 2.3 (Sun by 10:30, ≤1h) Add `ScoreBreakdown` with the toggle button; verify the keyboard path and that focus stays on the button. Used by the Ranking view (`investigation-ranking` 2.1).

## 3. Header

Depends on: 1.1 and `screen-specs` 1.1.

- [x] 3.1 (Sun by 10:00, ≤1h) Build the responsive header with the 640 px Menu button; verify at 360 px that the Menu opens by keyboard, the skip link is still first and the current item is marked.

## 4. Checks

Depends on: 2 and 3.

- [ ] 4.1 (Sun by 12:00, ≤1h) Check the shipped screens in grayscale, with Tab only and at 360 px; verify each status is identifiable without color and note any gap in `docs/SMOKE.md`.
- [ ] 4.2 (Sun by 12:00, ≤15 min) Search the build output for "MOCKUP", "sample-placeholder" and "Sample summary text"; verify none appears.

## Workflow follow-up

- Archive the change after milestone 2 (Sunday 12:00) is met.
