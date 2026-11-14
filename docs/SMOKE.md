# Smoke checklist (manual)

Run it on the public URL (https://flame-in-freefall-indol.vercel.app) after each deploy and before submission. Open each screen directly by its address. Mark any failure in "Known gaps".

## Checklist

- [ ] **Data:** `/data/catalog.json`, `/data/experiments.json` `/data/profiles.json` and `/data/summaries.json` open (200). If a data file is missing, the screens that need it must say so, naming the file.
- [ ] **Frame:** the first Tab stop is "Skip to content" and it focuses the main area without changing the address; every screen has a distinct title and the footer names NASA PSI.
- [ ] **Not found:** `#/nope` shows "Not found" with its own title and a link to Ranking; `#/investigation/PSI-9999` names the accession.
- [ ] **Console** (`#/ranking`, `#/compare`, `#/map` open the same page and scroll to their section; moving between them keeps the page state): four tiles that equal the data (investigations, test records, plotted tests, tests in the expected zone); the four profile buttons re-rank the list (Fire detection puts PSI-47 first at the time of writing; check against `data/ranking/profiles.json`); the side column shows five ranked rows, "Show all N" and "Show fewer" work, "Interpret" changes the interpretation panel; "Add compare" fills the comparison (a row already there says "In comparison"; a fourth is refused with "You can compare up to 3 investigations."); focus lands on the section heading after a link; one `h1`.
- [ ] **Coverage map panel:** "629 of 660 tests plotted" and "66 of 629" in the expected Moon-base zone; filters update the count; "Show as table" lists rows with "Show 50 more rows"; the CSV button is present; selecting a point fills "Selected test".
- [ ] **Compare panel:** adding two investigations shows the table with same/differs marks and the address gets `?ids=`; reloading that address restores the selection; Remove buttons name the accession.
- [ ] **Detail** (`#/investigation/PSI-159`): O2 12–85 %, pressure 0.50–3.31 bar, ranking position for four profiles, related links; PSI-69 says "no normalized test data".
- [ ] **About** (`#/about`): 26 sources with DOI links; known limits; the AI-use block shows the number of summaries and how many are reviewed, the model, the prompt version and the date, equal to `summaries.json`.
- [ ] **AI summaries:** an investigation with a summary (for example `#/investigation/PSI-69`) shows the label "AI-generated (model), reviewed by a person", the summary and "Fire-safety relevance"; one without it shows its NASA text labeled "NASA PSI text". On Ranking, cards with a summary carry the AI label.
- [ ] **360 px:** no horizontal page scroll on any screen (tables scroll inside their own area); the Menu button opens the navigation; Escape closes it.
- [ ] **No outside requests:** all requests go to the app's own origin; no "MOCKUP" or "sample-placeholder" in the build.
- [ ] **Offline:** known gap (see below).

## Last run: 2026-11-14, deploy of `main` at 111fb7a

All checklist items passed except those listed below. After the PSI-10 normal flames were added (660 records), the Coverage map counts (629 of 660 plotted, 66 of 629 in the zone) and Detail for PSI-10 (327 tests, 19.8–85 % O2, 0.43–3.06 bar, ethylene and propane) were checked again on the public URL; the other screens were last run on 1d73b5f. Ranking, Compare, Coverage map, 360 px (7 routes) and the build search were run in the browser against the public URL; all 16 requests were same-origin.

## Known gaps (found in this run)

1. **Offline:** no service worker, so the app does not work offline after a reload (`app-shell` requires it).
2. **Compare number format (fixed):** Compare now shows "12–85 % O2" and "0.50–3.31 bar" like Detail, using `formatO2Range` and `formatPressureRange`. Ranges are rounded, so two ranges that differ only beyond the rounding show as the same.
3. **Map points are not keyboard-focusable;** the table is the keyboard alternative.
4. **Ranking panel copy:** "Weights and wording come from the official challenge statement" overstates it: the rationales quote the statement, the point values are the team's judgment. Also "up to 1 points".
5. **Summaries cover 13 of 26 investigations** (all reviewed, model gemini-3.6-flash, prompt 1.0.0). The other 13 show NASA text, as the spec allows. Checked on the public URL: About (13 of 13 reviewed), Detail for PSI-69 and 13 AI labels on Ranking.
6. **Not done:** grayscale review (`design-system` 4.1), `Marker`/`TagChip`/`CountLine`/`CitationBlock`/`ScoreBreakdown` components (2.2, 2.3), contrast script (1.3). The Menu fixes are in PR #28.
