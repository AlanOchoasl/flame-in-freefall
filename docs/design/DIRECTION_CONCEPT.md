# Monitoring console design proposal

## Proposal

Present Flame in Freefall as a **PSI research console**: an interactive way to monitor coverage and evidence in a cached experimental catalog. It is not a live spacecraft monitor, a fire alarm, or an operational risk predictor.

The interface opens on the investigation ranking with the experimental envelope as its main instrument. It then exposes the four challenge capabilities: rank, compare, map test conditions, and interpret PSI records with reviewed, labeled AI summaries.

## Palette and theme control

The HTML concept implements both palettes in the root palette.md:

- **Dark:** black canvas and charcoal surfaces; #0099FF for links, focus, selection, and plotted marks; #0B3D91 for filled selected controls with white text; #FFBB00 for the lunar reference zone.
- **Light:** #F6F7F9 canvas, white surfaces, blue #0B3D91 actions, and zone amber #A15C00 with a 12% fill and dashed boundary.
- Red is reserved for brand or error states. It never encodes experimental outcomes or a fire-safety verdict.
- All four outcomes use the action blue plus distinct marker shapes, so color never carries the result by itself.
- The page follows the operating-system preference until someone chooses Light or Dark. The visible toggle sets an explicit theme.
- The palette's logo guidance applies if the official insignia is used. This concept does not include it; it uses a text source citation and keeps the non-endorsement notice.
- Sample WCAG contrast calculations for palette text/action pairs: dark secondary 13.08:1, dark muted 9.04:1, dark action 7.00:1; light secondary 9.64:1, light muted 5.96:1, light action 10.04:1; zone label 12.36:1 dark and 5.19:1 light. These calculations do not replace a final rendered-state/accessibility review.

This palette is still a proposal, not an adopted app theme. The current docs/DESIGN_PROMPT.md and OpenSpec design-system change require a light theme and list dark mode as out of scope. The team must update those specs before implementing both themes in the app.

## Does the direction cover the challenge?

The challenge statement asks for an SI-powered web dashboard that summarizes, ranks, and interprets combustion investigations, and suggests finding relevant studies, comparing them, and surfacing data for fire-safety insights. This console composition covers those needs when treated as a shared shell around the project's existing routes:

| Challenge capability | Console treatment | Existing project route/data |
| --- | --- | --- |
| Find relevant investigations | Explainable ranking by crew cabin, lunar base/rover, detection, and suppression profiles | Ranking; curated catalog + ranking profiles |
| Compare investigations | Side-by-side evidence, conditions, and explicit missing/not-reported values | Compare; catalog + normalized tests |
| Explore test conditions | O2 × pressure map, filters, overlays, table alternative, point details, visible gaps | Coverage map; 453 test rows, 442 plottable, 66 in expected lunar zone |
| Summarize and interpret | Precomputed AI summary, fire-safety note, provenance label, and human-review state | Detail/About and summary file; 13 reviewed entries in current main |
| Trace evidence | PSI links and DOI citations at investigation/test level | Detail, comparison, About |

The first console draft showed only a map and a small ranking list. This revision adds visible comparison and AI interpretation previews and identifies the investigation-detail and About drill-downs. A single screen cannot replace the separate routes and states required by OpenSpec.

## Verified facts used in the mockup

- The current processed catalog contains 26 investigations.
- The current normalized test file contains 453 rows; 442 have both O2 and pressure; 66 fall in the challenge-statement lunar range.
- PSI-159 has 333 normalized rows, all plottable, with 48 in that range. PSI-10 has 120 rows, 109 plottable, with 18 in that range.
- PSI-159 tests use butane, ethane, and propane. PSI-10's ethylene fuel label is inferred from table columns; its table has no hot-ignition outcome field.
- The current lunar ranking's first three positions are PSI-25, PSI-26, and PSI-98, each 8/11 points. These studies have no rows in the normalized test set. This shows that relevance and experimental coverage answer different questions.
- There are 13 precomputed, human-reviewed AI summaries in data/processed/summaries.json; the mockup uses PSI-10's reviewed label and a shortened paraphrase of its stored summary.

**The scatter coordinates in the HTML are placeholders**, not measured PSI points. Replace them with data-driven marks before presenting the design as a working product. Counts, study metadata, and ranking values are from current processed files and the ranking function.

## Scientific and product guardrails

- Label the lunar range as expected per the challenge statement, not a final habitat requirement or hazard zone.
- Keep the limits visible: mapped tests use gaseous fuels; they do not test spacecraft materials, and the current PSI set has no partial-gravity combustion data.
- Distinguish PSI measurements, challenge-statement reference atmospheres, curated tags, ranking heuristics, and AI-generated text.
- AI summaries remain precomputed, source-grounded, labeled, and marked as human-reviewed. No runtime AI claims.
- Keep loading, error, empty, and missing-data states; table and keyboard access; PSI citations and DOI; accessible names and contrast.
- Show Earth-air and spacesuit references alongside the lunar range on the coverage map.
- Keep the notice: **Not an official NASA product.** Do not add NASA imagery or insignia without checking the event and NASA rules.

## Scope for implementation

This is a visual direction proposal only. It does not authorize replacing the app or dropping any Must route. If the team accepts it, update the OpenSpec design-system and screen-specs changes first, then implement the tokens and shared shell incrementally on the existing Ranking, Compare, Coverage map, Detail, and About routes.

Review the static example at direction-concept.html. Its controls and navigation are illustrative and do not implement app behavior.
