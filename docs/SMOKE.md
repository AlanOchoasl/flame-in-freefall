# Smoke checklist (manual)

Run it on the public URL (https://flame-in-freefall-indol.vercel.app) after each deploy and before submission. Open each screen directly by its address. Mark any failure in "Known gaps".

## Checklist

- [ ] **Data:** `/data/catalog.json`, `/data/experiments.json` and `/data/profiles.json` open (200). `/data/summaries.json` is 404 until the summaries are published; About must then say so, naming the file.
- [ ] **Frame:** the first Tab stop is "Skip to content" and it focuses the main area without changing the address; every screen has a distinct title and the footer names NASA PSI.
- [ ] **Not found:** `#/nope` shows "Not found" with its own title and a link to Ranking; `#/investigation/PSI-9999` names the accession.
- [ ] **Ranking** (`#/ranking`): "26 of 26 investigations"; switching Environment re-ranks (Detection puts PSI-101 first); Fuel phase "solid" gives 4; a filter combination with no match shows "Clear filters"; "Score breakdown" and "How this ranking works" open.
- [ ] **Compare** (`#/compare`): searching "SAFFIRE" lists 3; adding two investigations shows the table with same/differs marks and the address gets `?ids=`; reloading that address restores the selection; a fourth shows "You can compare up to 3 investigations."; Remove buttons name the accession.
- [ ] **Coverage map** (`#/map`): "629 of 660 tests plotted"; "66 of 629" in the Moon-base zone; PSI-10 alone is "296 of 327"; filters update the count; "Show as table" lists rows with "Show 50 more rows"; the CSV button is present.
- [ ] **Detail** (`#/investigation/PSI-159`): O2 12–85 %, pressure 0.50–3.31 bar, ranking position for four profiles, related links; PSI-69 says "no normalized test data".
- [ ] **About** (`#/about`): 26 sources with DOI links; known limits.
- [ ] **360 px:** no horizontal page scroll on any screen (tables scroll inside their own area); the Menu button opens the navigation; Escape closes it.
- [ ] **No outside requests:** all requests go to the app's own origin; no "MOCKUP" or "sample-placeholder" in the build.
- [ ] **Offline:** known gap (see below).

## Last run: 2026-11-14, deploy of `main` at 51c9c8a

All checklist items passed except those listed below. After the PSI-10 normal flames were added (660 records), the Coverage map counts (629 of 660 plotted, 66 of 629 in the zone) and Detail for PSI-10 (327 tests, 19.8–85 % O2, 0.43–3.06 bar, ethylene and propane) were checked again on the public URL; the other screens were last run on 1d73b5f. Ranking, Compare, Coverage map, 360 px (7 routes) and the build search were run in the browser against the public URL; all 16 requests were same-origin.

## Known gaps (found in this run)

1. **Offline:** no service worker, so the app does not work offline after a reload (`app-shell` requires it).
2. **Compare number format (fixed):** Compare now shows "12–85 % O2" and "0.50–3.31 bar" like Detail, using `formatO2Range` and `formatPressureRange`. Ranges are rounded, so two ranges that differ only beyond the rounding show as the same.
3. **Map points are not keyboard-focusable;** the table is the keyboard alternative.
4. **Ranking panel copy:** "Weights and wording come from the official challenge statement" overstates it: the rationales quote the statement, the point values are the team's judgment. Also "up to 1 points".
5. **About** shows the AI-use error until `summaries.json` exists.
6. **Not done:** grayscale review (`design-system` 4.1), `Marker`/`TagChip`/`CountLine`/`CitationBlock`/`ScoreBreakdown` components (2.2, 2.3), contrast script (1.3). The Menu fixes are in PR #28.
