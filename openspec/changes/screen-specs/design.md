# Design

## Context

Six screens, one shared frame, static JSON data, React + TypeScript (see `app-shell`). The team has no designer; wireframes are text so they live in the repo and review as a diff. Behavior is already specified in `investigation-ranking`, `investigation-comparator`, `coverage-map`, `ai-summaries` and `app-shell`; this change only fixes layout, order, states and routes.

## Goals / Non-Goals

**Goals:** one consistent frame; the same four states everywhere; every block named so tasks and tests can point at it.
**Non-Goals:** visual identity, final palette, typography, motion, dark mode, new data.

## Decisions

1. **Home is Ranking.** `#/` redirects to `#/ranking`. It is the screen that answers the challenge's first bullet and needs no extra page. Alternative: a landing page; rejected as extra work with no data behind it.
2. **About is a route (`#/about`), not a section.** The app-shell delta says "About section"; a route is the simplest way to deep-link it from the footer and the project page. Reconciled by task 4.1.
3. **One frame component** (header, nav, title, footer, skip link) wraps every view. Views declared in the single view list from `app-shell` gain a `title` used for the document title.
4. **One state helper** renders loading, failed (names the file), empty and normal, so views do not each invent error text. It uses `NotAvailable` and `DataSourceNote` from `app-shell`.
5. **Detail screen is the only new content.** It assembles fields that already exist in `catalog.json`, `experiments.json` (per-investigation ranges) and `summaries.json`; no new field is required. Ranking position per profile is computed by the ranking function.
6. **Mobile first at 360 px**, single column; wide screens only add side-by-side areas where noted in the wireframes.
7. **Wireframes are ASCII**, low fidelity, below. They fix order and grouping, not pixels.

Data flow: `data/processed/*.json` → data-access module → state helper → screen blocks.

### Frame (all screens)

```
[skip to content]
+------------------------------------------------+
| Flame in Freefall   Ranking Compare Map About  |
+------------------------------------------------+
| <h1> Screen title </h1>                        |
| ...screen content...                           |
+------------------------------------------------+
| Data: NASA PSI (link) · Not an official NASA   |
| product · AI text is labeled                   |
+------------------------------------------------+
```

### Ranking (`#/ranking`)

```
Profile: [Crew cabin v]   Fuel phase [..]  Topic [..]  (14 of 26)
+--------------------------------------------------+
| 1  PSI-xx  Title            58 / 100             |
|    [solid] [flammability]  [not assessed] [unrev]|
|    AI summary (labeled) or PSI text              |
|    [Breakdown v]  Detail · Compare · PSI page    |
+--------------------------------------------------+
| 2  ...                                           |
[How this ranking works v]  (heuristic, not NASA)
```

### Compare (`#/compare?ids=…`)

```
Pick up to 3: [search title/acronym/accession]  2 of 3
+------------+------------+------------+
| Row        | PSI-159    | PSI-25     |
| Platform   | ISS   same | ISS        |
| Fuel phase | gas  diff  | solid      |
| O2 range   | 21–85 %    | — no test data (PSI link)
| Summary    | AI-labeled | PSI text   |
```

### Coverage map (`#/map`)

```
Axes: O2 % (x) vs pressure bar (y). One point = one test.
Filters [investigation][flame][fuel][outcome]  442 of 442
+-----------------------------+  [Show as table][Download]
| scatter + legend + overlays |
+-----------------------------+
Insight: 66 of 442 in the Moon-base zone. Limits...
Point details: investigation, test, fuel, O2, p, outcome
```

### Investigation detail (`#/investigation/PSI-159`)

```
PSI-159 · Title (ACRONYM)           [PSI page] DOI
Summary (AI label) + Fire-safety note
Facts: platform · hardware · fuel phase · topics · measurements
PSI text: objectives / approach / hypothesis / earth benefits
Test conditions: O2 range · pressure range · fuels  | no normalized test data
Ranking position: crew cabin #3 · lunar #1 · detection #12 · suppression #20
Related: PSI-25, PSI-142      Citation: PSI link + DOI
```

### About (`#/about`) and Not found

```
About: what it is · not official NASA · AI use (model/date/prompt)
       sources + DOIs · known limits · THIRD_PARTY_LICENSES
Not found: "Nothing at #/xyz"  [Go to Ranking]
```

## Risks / Trade-offs

- [Wireframes drift from the build] → each screen task verifies against its spec scenarios, not the drawing.
- [Detail screen is large for the time left] → it only assembles existing fields; if short on time, ship blocks in spec order and drop later ones (ranking position first).
- [About as a route conflicts with the app-shell wording] → task 4.1 aligns the app-shell delta; behavior is the same.
- [Copy invents science] → the "No new text claims" requirement and a copy review (task 3.2).

## Open Questions

- Do we want the project name and a short tagline in the header? Cosmetic; decided during build.
- Should Ranking items offer "add to Compare" for several items at once? Not required; the one-item link is the Must.
