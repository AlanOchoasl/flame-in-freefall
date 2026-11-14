# Monitoring console design proposal

## Proposal

Present Flame in Freefall as a **PSI research console**: an interactive way to monitor the coverage and evidence in a cached experimental catalog. The console is not a live spacecraft monitor, a fire alarm, or an operational risk predictor.

The interface opens on the investigation ranking with the experimental envelope as its main instrument. It then exposes the four challenge capabilities: rank, compare, map test conditions, and interpret PSI records with reviewed, labeled AI summaries.

## Palette

The HTML concept uses the dark tokens proposed in the root `palette.md`:

- Black canvas and charcoal surfaces for console hierarchy.
- NASA blue `#0099FF` for links, focus, selection, and data marks.
- Brand blue `#0B3D91` for selected controls.
- Amber `#FFBB00` only for the expected Moon-base range.
- Red stays unused in scientific outcome encoding; reserve it for brand or error states.
- Outcomes share the blue and use distinct marker shapes, so hue does not carry the result.

This is a proposal, not an adopted product theme. The current `docs/DESIGN_PROMPT.md` and OpenSpec design-system change require a light theme. The team must revise those specs before implementing the dark palette in the app. The palette's NASA logo guidance is intentionally not applied; keep the interface's text source citation and do not add the insignia.

## Does the direction cover the challenge?

The challenge statement asks for an SI-powered web dashboard that summarizes, ranks, and interprets combustion investigations, and specifically suggests finding relevant studies, comparing them, and surfacing data for fire-safety insights. This console composition covers those needs when treated as a shared shell around the project's existing routes:

| Challenge capability | Console treatment | Existing project route/data |
| --- | --- | --- |
| Find relevant investigations | Explainable ranking by crew cabin, lunar base/rover, detection, and suppression profiles | Ranking; curated catalog + ranking profiles |
| Compare investigations | Side-by-side evidence, conditions, and explicit missing/not-reported values | Compare; catalog + normalized tests |
| Explore test conditions | O2 × pressure map, filters, overlays, table alternative, point details, visible gaps | Coverage map; 453 test rows, 442 plottable, 66 in expected lunar zone |
| Summarize and interpret | Precomputed AI summary, fire-safety note, provenance label, and human-review state | Detail/About and summary file; 13 reviewed entries in current `main` |
| Trace evidence | PSI links and DOI citations at investigation/test level | Detail, comparison, About |

The previous console sketch was incomplete: it showed a map and a small ranking list but did not make comparison or AI interpretation part of the screen system. This revision adds previews of all four capabilities and identifies the investigation detail/About drill-downs. A single screenshot still cannot replace the separate routes and states already required by OpenSpec.

## Verified facts used in the mockup

- The current processed catalog contains 26 investigations.
- The current normalized test file contains 453 rows; 442 have both O2 and pressure; 66 fall in the challenge-statement lunar range.
- PSI-159 has 333 normalized rows, all plottable, with 48 in that range. PSI-10 has 120 rows, 109 plottable, with 18 in that range.
- PSI-159 tests use butane, ethane, and propane. PSI-10's ethylene fuel label is inferred from table columns; its table has no hot-ignition outcome field.
- The current lunar ranking's first three positions are PSI-25, PSI-26, and PSI-98, each 8/11 points. These studies have no rows in the normalized test set. That distinction is useful: relevance ranking and experimental coverage answer different questions.
- There are 13 precomputed, human-reviewed AI summaries in `data/processed/summaries.json`; the mockup uses PSI-10's reviewed label and a shortened paraphrase of its stored summary.

**The scatter coordinates in the HTML are placeholders**, not measured PSI points. Replace them with data-driven marks before the design is presented as a working product. Counts, study metadata and the ranking values above are from the current processed files and ranking function.

## Scientific and product guardrails

- Label the lunar range as expected per the challenge statement, not a final habitat requirement or hazard zone.
- Keep the limits visible: mapped tests use gaseous fuels; they do not test spacecraft materials, and the current PSI set has no partial-gravity combustion data.
- Distinguish PSI measurements, challenge-statement reference atmospheres, curated tags, ranking heuristics, and AI-generated text.
- AI summaries remain precomputed, source-grounded, labeled, and marked as human-reviewed. No runtime AI claims.
- Keep loading, error, empty, and missing-data states; table and keyboard access; PSI citations and DOI; accessible names and contrast.
- Show Earth-air and spacesuit references alongside the lunar range on the coverage map.
- Keep the notice: **Not an official NASA product.** Do not add NASA imagery or insignia without checking the event and NASA rules.

## Scope for implementation

This is a visual direction proposal only. It does not authorize replacing the app or dropping any Must route. If the team accepts it, update the OpenSpec `design-system` and `screen-specs` changes first, then implement the tokens and shared shell incrementally on the existing Ranking, Compare, Coverage map, Detail, and About routes.

Review the static example at `direction-concept.html`. Its controls and navigation are illustrative and do not function.
