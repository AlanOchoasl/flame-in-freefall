# Monitoring console design proposal

## Proposal

Present Flame in Freefall as a PSI research console for exploring the evidence in a cached experimental catalog. It is not a live spacecraft monitor, fire alarm, or operational risk predictor.

Use the Mission Control reference for visual language: dark command-panel surfaces, subtle grid texture, compact dataset status, a large central plot, blue data markers, and a focused test inspector. Preserve the scientific logic of the existing coverage map: each mark is one test positioned by its recorded oxygen concentration and pressure.

There is one quantitative map: **O2 concentration × pressure**. Do not add a separate investigation-topology graph or connect tests with lines that imply unsupported relationships.

## Palette and theme control

The HTML concept implements both palettes in the root palette.md:

- **Dark:** black canvas and charcoal surfaces; #0099FF for links, focus, selection, and data marks; #0B3D91 for filled selected controls with white text; #FFBB00 for the lunar reference zone.
- **Light:** #F6F7F9 canvas, white surfaces, blue #0B3D91 actions, and zone amber #A15C00 with a 12% fill and dashed boundary.
- Red is reserved for brand or error states. It never encodes experimental outcomes or a fire-safety verdict.
- Outcomes use distinct marker shapes, so color never carries the result by itself.
- The page follows the operating-system preference until someone chooses Light or Dark. The visible toggle sets an explicit theme.
- The palette's official-logo guidance is not applied: this concept uses no NASA insignia, only a PSI source citation and a non-endorsement notice.
- Sample WCAG contrast calculations for palette text/action pairs: dark secondary 13.08:1, dark muted 9.04:1, dark action 7.00:1; light secondary 9.64:1, light muted 5.96:1, light action 10.04:1; zone label 12.36:1 dark and 5.19:1 light. A final rendered-state/accessibility review is still needed.

The dark palette conflicts with the current docs/DESIGN_PROMPT.md and OpenSpec design-system change, which require a light-only theme. Update those specs before implementing both themes in the app.

## What the map answers

- X-axis: oxygen concentration in percent.
- Y-axis: pressure in bar.
- One point: one real, plottable PSI test.
- Shape: recorded outcome (yes, no, flash, not-reported).
- Amber dashed area: expected Moon-base range from the challenge statement, not a hazard rating or final habitat specification.
- Reference conditions: Earth air and spacesuit atmosphere, labeled outside the plotting area so labels do not cover data.
- Filters: investigation, flame type, fuel, and outcome; counts update after filtering.
- Selecting a real point opens the test inspector with PSI source and the recorded conditions.

The normalized sample has 453 test records; 442 include both O2 and pressure, and 66 are in the expected lunar range. The concept embeds the cached normalized test rows and plots those 442 actual conditions. The current mapped tests use gaseous fuels; they do not test spacecraft materials, and the PSI set has no partial-gravity combustion data.

The concept plots the 442 actual plottable records from `data/processed/experiments.json`. Its investigation, flame type, fuel, and outcome filters update the points; selecting a point reveals its record and PSI source. Arrow keys move between visible points. This is still a static design proposal; it does not replace the application.

## Does the direction cover the challenge?

| Challenge capability | Console treatment | Existing project route/data |
| --- | --- | --- |
| Find relevant investigations | Explainable ranking by crew cabin, lunar base/rover, detection, and suppression | Ranking; curated catalog + profiles |
| Compare investigations | Side-by-side evidence, conditions, and explicit missing/not-reported values | Compare; catalog + normalized tests |
| Explore test conditions | O2 × pressure plot, filters, reference conditions, table alternative, point details, visible gaps | Coverage map; 453 records, 442 plottable, 66 in expected lunar range |
| Summarize and interpret | Precomputed AI summary, fire-safety note, provenance label, human-review state | Detail/About and summaries |
| Trace evidence | PSI links and DOI citations | Detail, comparison, About |

The console arrangement covers the project's four capabilities, but one screen does not replace separate Ranking, Compare, Coverage map, Detail, and About routes or their loading/error/empty/accessibility states.

## Product guardrails

- Use measured PSI values for points; use challenge-statement values only for reference lines and the expected lunar range.
- Keep axis units and numeric ticks legible. Keep all overlays labeled in a legend or a separate reference list.
- Preserve the table alternative, keyboard access, filters, download, source citations, and missing-data reasons required by OpenSpec.
- Keep the ranking labeled as a team heuristic, not a NASA assessment. Keep AI summaries precomputed, source-grounded, labeled, and reviewed.
- Keep **Not an official NASA product** visible. Do not add NASA images or insignia without checking event and NASA rules.

## Scope

This is a visual proposal only. It does not authorize replacing the current app. If the team accepts it, update OpenSpec first to reconcile the requested dark theme with the current light-only spec, then restyle the existing routes incrementally.
