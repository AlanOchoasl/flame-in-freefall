# Design prompt v1 — Flame in Freefall (for Claude Design)

How to use: paste everything below the line into Claude Design. Ask for one self-contained `.html` (or a `.zip` with HTML/CSS/JS), then port the tokens to `app/src/styles.css`.
Sources of every constraint: `openspec/changes/screen-specs`, `investigation-ranking`, `investigation-comparator`, `coverage-map`, `ai-summaries`, `app-shell`.

---

## Role and goal

Design the UI/UX of a web dashboard called **Flame in Freefall**, as a clickable, responsive HTML mockup. Design desktop first (about 1280 px wide), and make every screen responsive down to 360 px (single column, no horizontal page scroll). Light theme only.

The app helps **professors, students and aerospace engineers** explore the 26 NASA PSI combustion-science investigations to understand fire safety in spacecraft and on the Moon (NASA Space Apps 2026 challenge "Flame in Freefall"). The unit of the app is the *investigation*, not the individual test.

Data source: NASA Physical Sciences Informatics (PSI), https://psi.nasa.gov/physci/repo/search?q=combustion. The app is **not** an official NASA product.

## Tone and visual direction

- Sober, scientific, trustworthy. Think lab instrument panel, not sci-fi game. Calm, high contrast, generous spacing, information-dense where the user is comparing.
- One accent color plus neutrals. Semantic colors only for status markers.
- **System font stack only** (`system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`). No web fonts, no CDN, no external images or icon fonts. Icons, if any, are inline SVG you draw yourself.
- **No NASA logo, no NASA imagery, no stock photos, no space illustrations.** No dark mode, no animations beyond subtle state transitions (respect `prefers-reduced-motion`).
- Accessibility is a hard requirement: WCAG AA contrast, visible 3 px focus ring, touch targets at least 44 px, focus order equals visual order, a "Skip to content" link first, status is never conveyed by color alone.
- Copy is in English. **Do not invent science or numbers.** Use only the sample data below; explanatory copy describes the screen, not the science.

## Shared frame (every screen)

Order: skip link → header (app name "Flame in Freefall", nav: Ranking · Compare · Coverage map · About; current item marked visually and with `aria-current="page"`) → `<h1>` screen title → content → footer.
Footer: "Data: NASA PSI (link) · Not an official NASA product · AI-generated text is always labeled" and a link to About.
On phones the nav must stay reachable (compact bar or menu, your call).

## Shared components (design these once, reuse everywhere)

1. **AI label**: "AI-generated · model `<name>` · reviewed by a person" or "… · not reviewed yet". Visually distinct from the PSI label.
2. **PSI label**: "NASA PSI text" (used when text is copied from PSI, including the fallback when no AI summary exists).
3. **Markers**: `unreviewed` (curated tag not yet checked by a person), `not assessed` (factor lacks data, always with the reason), `approximate` (pressure value flagged approximate), `same` / `differs` (comparison rows).
4. **Missing value**: a dash plus the reason, never blank or zero. Reasons: "not in the PSI record", "no normalized test data" (with a link to the PSI page), "not reviewed yet".
5. **Tag chips**: fuel phase and topic.
6. **Score breakdown**: expandable, shows each factor as `points / max` with the evidence text.
7. **Data state block** with four states: loading (no placeholder numbers), failed (names the file, e.g. "Could not load catalog.json", other screens still reachable), empty (says what matched nothing, shows active filters, offers "Clear filters"), normal.
8. **Count line**: "14 of 26 investigations", "442 of 442 tests plotted".
9. **Citation block**: PSI page link + DOI.

## Screens

### 1. Ranking — `#/ranking` (home; `#/` redirects here)

Order: profile selector → filters (Fuel phase, Topic) with match count → ranked list → collapsed panel "How this ranking works".

- Profiles (data-driven, so the selector must handle more later): **Crew cabin**, **Lunar base / pressurized rover**, **Detection**, **Suppression**.
- Filter values — Fuel phase: gas, solid, liquid-droplet, aerosol-dust, not-combustion. Topic: flame-fundamentals, modeling, material-flammability, detection, suppression, not-fire-safety.
- Each list item: rank, accession (PSI-xx), title (+ acronym), total points "n / max", fuel-phase and topic chips, markers (`not assessed`, `based on unreviewed tags`), a short summary (AI-labeled, or PSI text as fallback), expandable "Breakdown", and three links: **Detail · Compare · PSI page**.
- Breakdown factors and max points: topic match (3), solid-fuel flammability (2, 1 in Detection, 0 in Suppression), NASA fire-safety label (2), Moon-base atmosphere (3, Lunar profile only), microgravity project type (1). When a factor cannot be evaluated: "not assessed: no normalized test data" (only 2 of 26 investigations have test rows, so this is the common case; design it as normal, not as an error).
- Non-combustion records (research area not Combustion Science) are listed after all combustion ones, with a note.
- "How this ranking works" panel: each factor, its weight, the challenge-statement text it follows, and the disclaimer "heuristic, not an assessment by NASA".
- Frames to show: normal (Crew cabin, 14 of 26 with filter solid or topic), profile switched to Lunar (re-ranked, breakdown open on one item), empty filter result, catalog file failed.
- Clicking "Compare" on an item opens Compare with that item preselected.

### 2. Compare — `#/compare?ids=PSI-159,PSI-98`

Order: picker (search by title, acronym or accession; "2 of 3 selected"; limit message when a 4th is attempted) → comparison table. With fewer than 2 selected: an instruction and no table.

- Rows: objectives, flight platform, hardware, fuel phase, topics, measurements, O2 range, pressure range, fuels tested, dates, related investigations, earth benefits, summary (AI-labeled or PSI text).
- Every row except the long-text ones carries a **same / differs** marker (text, not only color).
- First column sticky; the table scrolls horizontally inside its own area only.
- Unreviewed values carry the marker; missing values use the dash + reason component.
- Selection lives in the URL (shareable).
- Frames: 2 selected (PSI-159 vs PSI-98, shows both populated and dash states), 1 selected (instruction), limit reached.

### 3. Coverage map — `#/map`

Order: one-sentence axes explanation → filters (Investigation, Flame type, Fuel, Outcome) with "N of M tests plotted" → chart with legend and overlays (chart toolbar holds "Show as table" and "Download filtered data") → insight panel → point-details panel. On phones: one column in that order.

- Scatter: x = O2 % (0–100), y = pressure in bar. One point = one test. 442 plotted; "11 tests not plotted (missing O2 or pressure)" is stated.
- Four outcomes, each with **its own color AND marker shape** (legend lists them): `yes` (flame), `no`, `flash`, `not-reported`. Must stay distinguishable in grayscale.
- Reference overlays, each labeled with source: **Moon-base zone** (O2 ≥ 30 %, pressure ≤ 10.2 psi ≈ 0.70 bar; labeled "expected, per the challenge statement", not final), **Earth air** (about 21 % O2, 14.7 psi ≈ 1.01 bar), **Spacesuit atmosphere** (100 % O2, 4.3 psi ≈ 0.30 bar). Make data gaps visible (large empty regions are part of the story).
- Insight panel (computed, shown as sample): "66 of 442 plotted tests (15 %) are in the Moon-base zone, from PSI-159 and PSI-10, all burning gaseous fuels." Plus the two limits: tests burn gaseous fuels, not spacecraft materials; PSI holds no partial-gravity data.
- Point details (on select or keyboard focus): investigation + PSI link, test id, fuel, flame type, O2 %, pressure bar (marked approximate for PSI-159), adiabatic flame temperature `Tad`, outcome, raw cool-flame and `SE/FT` values.
- Table alternative (same fields) reachable by keyboard; the chart must be keyboard-operable.
- Frames: normal, a point selected, filter yielding 0 tests, table view.
- Generate plausible-looking sample points in the mockup, but keep the stated totals (442, 66) consistent and label the mockup data as sample.

### 4. Investigation detail — `#/investigation/PSI-159`

Order: accession, title, acronym, links (PSI page, DOI) → summary + fire-safety note (AI-labeled; or PSI objectives labeled as PSI text) → Facts (platform, hardware group, fuel phase, topics, measurements, with `unreviewed` markers) → PSI text (objectives, approach, hypothesis, earth benefits; long text, make it readable) → Test conditions (tests count, O2 range, pressure range, fuels, "in Moon-base zone: n") or "no normalized test data" + PSI link → Ranking position per profile (e.g. Crew cabin #3, Lunar #1, Detection #12, Suppression #20; sample values) → Related investigations (links; plain text if not in catalog) → Citation block.
- Measurements are free text with about 70 distinct values across the catalog: show them as a plain list, not as a filter vocabulary.
- Frames: PSI-159 (rich), PSI-25 (no test rows, partial curation, unreviewed markers, PSI-text fallback summary).

### 5. About — `#/about`

Order: what the app is and the challenge it answers → "Not an official NASA product" → How AI was used (model, dates, prompt version, number reviewed; "nothing is generated at runtime"; includes the failed-to-load variant) → Data sources with PSI links and DOIs (list of 26) → Known limits (no partial-gravity data; mapped tests burn gaseous fuels; ranking is a heuristic) → link to THIRD_PARTY_LICENSES.

### 6. Not found

States what was not found, shows the requested address (e.g. `#/nothing-here` or `PSI-9999`), links to Ranking and to the nav.

## Sample data (real; use it, do not invent more)

Investigations (accession · acronym · platform · fuel phase · topics · hardware group):
- PSI-159 · ACME CFI-G · ISS · gas · flame-fundamentals, modeling · acme-cir — 333 tests, O2 12–85 %, 0.50–3.31 bar, fuels butane, ethane, propane, 48 in Moon-base zone
- PSI-10 · ACME/Flame Design · ISS · gas · flame-fundamentals · acme-cir — 120 tests, O2 21–85 %, 0.43–3.06 bar, fuel ethylene, 18 in zone
- PSI-98 · SAFFIRE-I · ISS · solid · material-flammability · other (no test rows)
- PSI-99 · SAFFIRE-II · Cygnus · solid · material-flammability · other
- PSI-100 · SAFFIRE-III · ISS · solid · material-flammability · other
- PSI-25 · BASS-II · ISS · fuel phase not curated yet · msg-flow-duct (no test rows)
- PSI-101 · SAME-R · ISS · aerosol-dust · detection · other
- PSI-102 · SAME · ISS · aerosol-dust · detection · other
- PSI-39 · CFI · ISS · liquid-droplet · flame-fundamentals, suppression · mdca-cir
- PSI-68 · FLEX-2 · ISS · not curated yet · mdca-cir
- PSI-108 · STDCE-1 · Space Shuttle · not-combustion · not-fire-safety (Fluid Physics; listed last)
- PSI-181 · "Structure and Properties of Pb-Sn and Pb-free Sn-Ag-Cu Solders Produced in Terrestrial vs. Microgravity Environments under Extremes of Elevated and Cryo Temperatures" · ISS · not-combustion · not-fire-safety (Materials Science; listed last)
Titles for the 12 above: PSI-159 "Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases", PSI-10 "Advanced Combustion via Microgravity Experiments / Flame Design", PSI-98 "Spacecraft Fire Safety Experiment-I", PSI-99 "Spacecraft Fire Experiment-II", PSI-100 "Spacecraft Fire Experiment-III", PSI-25 "Burning and Suppression of Solids - II", PSI-101 "Smoke Aerosol Measurement Experiment-Reflight", PSI-102 "Smoke and Aerosol Measurement Experiment", PSI-39 "Cool Flames Investigation", PSI-68 "Flame Extinguishment Experiment - 2".
Totals: 26 investigations (24 Combustion Science, 1 Fluid Physics, 1 Materials Science), 453 tests (442 plottable, 11 not), 66 in Moon-base zone. Outcomes: yes 263, not-reported 120, no 62, flash 8. Flame types: inverse 274, normal 179.
AI summaries: none exist yet. Sample AI text in the mockup must be clearly placeholder ("Sample summary text") and carry the AI label; show the PSI-text fallback as the default case.
Scores are sample values only; label them as such in the mockup notes.

## Deliverables

1. One self-contained `.html` file (or `.zip`: `index.html`, `styles.css`, `app.js`) with all screens reachable through hash routes and the nav, plus frames/states switchable by a small "mockup states" control (outside the app frame, clearly not part of the product).
2. A **design tokens block** at the top of the CSS as `:root` custom properties: colors (text, background, muted, accent, border, status colors, the four outcome colors, zone overlay colors), spacing scale, radius, type scale, focus ring, target size. Keep the existing names `--text --background --muted --accent --border --gutter --target-size` and add the rest.
3. A short list of the components you created and where each is used.
4. Responsive behavior shown at 1280 px, 768 px and 360 px.

## Do not

Invent datasets, numbers, fields or science claims; add screens, features or data beyond the six above (no chat/"ask the data", no landing page, no login); use NASA logos or external assets; use dark mode; rely on color alone to carry meaning; hide the AI / PSI / unreviewed labels to make things look cleaner.
