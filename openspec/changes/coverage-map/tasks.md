# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Saturday 14 Nov (Sunday where stated), Argentina, and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Plan B for every task: develop against the 20-row stub `experiments.json`; the helpers are pure.

## 1. Helpers

Depends on: `data-pipeline` contract and stub (task 4.4).

- [ ] 1.1 (by 18:30, ≤1.5h) Implement pure helpers: filter, counts ("N of M plotted", not-plotted count), psi↔bar overlay constants, insight computation and CSV building; verify unit tests with synthetic records (a point at O2 0.30 / 0.7033 bar counts as in zone; missing pressure is not plotted).

## 2. Map view

Depends on: 1.1 and `app-shell` 2.1, 4.1.

- [x] 2.1 (Sun by 09:30, ≤2h) Build the scatter with outcome color + shape, legend, and the Moon-base zone, Earth air and spacesuit overlays labeled with sources; verify the Must dataset shows 442 points and the not-plotted note.
- [x] 2.2 (Sun by 10:30, ≤1.5h) Add filters (investigation, flame type, fuel, outcome) with counts and the point-details panel with PSI links; verify filtering updates counts and approximate pressure is marked.
- [x] 2.3 (Sun by 11:30, ≤1h) Add the computed insight panel with both limits; verify numbers equal those computed from the records (66 of 442 for the Must set).
- [x] 2.4 (Sun by 11:30, ≤1h) Add numeric ticks, axis titles and gridlines, and move the overlay labels so none covers a point; verify at 1280 px that every tick is labeled with its unit and no label overlaps a point (zoom the browser to 200 % as a second check).

## 3. Accessibility and export

Depends on: 2.2.

- [x] 3.1 (Sun by 12:00, ≤1h) Add "Show as table" reachable by keyboard; verify it shows the same filtered records.
- [x] 3.2 (Nice, Sun by 13:30, ≤1h) Add the filtered-data download (CSV or JSON) with source links; verify the file has exactly the filtered rows.
- [ ] 3.3 (Sun by 13:30, ≤45 min) Give the plot a 480 px minimum inside a focusable scroll region and check the map in grayscale and at 360 px; verify the four outcomes are distinguishable by shape, ticks stay readable and the page has no horizontal scroll.
- [x] 3.4 (Sun by 13:30, ≤30 min) Page the table (50 rows, "Show 50 more rows", "showing N of M"); verify the download still has every filtered record.
- [ ] 3.5 (Nice, Sun by 14:00, ≤1h) Add arrow-key stepping with a live-region details panel; verify Escape clears the selection.
- [ ] 3.6 (Nice, Sun by 14:00, ≤30 min) Read the `investigation` address parameter and add the "See on the Coverage map" link in Detail for investigations with plotted tests; verify the link from PSI-159 and that PSI-25 shows no link.

## Workflow follow-up

- Archive the change after milestone 2 (Sunday 12:00) is met.
