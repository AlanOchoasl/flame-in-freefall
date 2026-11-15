# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Saturday 14 Nov (Sunday where stated), Argentina, and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Plan B for every task: develop against the stub JSON files; the comparison model is pure.

## 1. Comparison model

Depends on: `investigation-catalog` types and stub (task 1.1).

- [x] 1.1 (by 18:30, ≤2h) Implement the pure function that builds rows, normalized values, same/differs markers and missing-value reasons, with unit tests for equal sets, differing fuel phases, a range, one missing value (marked differs) and all values missing (marked both missing, never same); verify all tests pass.

## 2. Compare view

Depends on: 1.1 and `app-shell` 2.1, 4.1.

- [x] 2.1 (Sun by 09:30, ≤1.5h) Build the picker (three searchable menus, the third optional, limit of three) and the comparison table with a sticky first column; verify the limit message, that each selected chip has a "Remove PSI-xx" accessible name (see `screen-layouts`, Compare picker interaction) and that the table scrolls inside itself at 360 px.
- [x] 2.2 (Sun by 10:30, ≤1h) Store the selection in the URL hash and restore it; verify opening a copied URL shows the same two investigations.
- [x] 2.3 (Sun by 11:30, ≤1h) Show AI summaries with the label when present and the PSI objectives otherwise; verify an investigation with no summary shows the fallback with the PSI-text label.

## Workflow follow-up

- Archive the change after milestone 2 (Sunday 12:00) is met.
