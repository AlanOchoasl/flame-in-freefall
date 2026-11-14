# Spec Delta

## Purpose

Defines what each dashboard screen contains, in what order, and how it behaves while loading, failing, empty, on a phone and by keyboard. It does not repeat the rules of Ranking, Compare, Coverage map or AI summaries; it references them.

## ADDED Requirements

### Requirement: Route table
The app SHALL expose these routes: `#/` (redirects to `#/ranking`), `#/ranking`, `#/compare`, `#/map`, `#/investigation/<accession>`, `#/about`. Any other hash SHALL show the Not found screen.

#### Scenario: Opening the root
- **WHEN** a user opens the app with no hash or `#/`
- **THEN** the Ranking screen is shown and the address becomes `#/ranking`

#### Scenario: Unknown accession
- **WHEN** a user opens `#/investigation/PSI-9999` and the catalog has no such accession
- **THEN** the Not found screen is shown and names the accession

### Requirement: Common frame on every screen
Every screen SHALL show, in this order: a header with the app name and navigation (Ranking, Compare, Coverage map, About), the screen title, the screen content, and a footer with the PSI source link and the "not an official NASA product" notice. The current screen SHALL be marked in the navigation.

#### Scenario: Footer present
- **WHEN** any screen is shown
- **THEN** the footer names NASA PSI as the data source with a link

#### Scenario: Current screen marked
- **WHEN** the Coverage map screen is shown
- **THEN** its navigation item is marked as current for assistive technology and visually

### Requirement: Screen states
Every screen that reads data files SHALL handle four states: loading, failed (naming the file), empty result, and normal. A loading state SHALL NOT show partial or placeholder numbers.

#### Scenario: Catalog failed
- **WHEN** the catalog file fails to load and a user opens Ranking
- **THEN** the screen shows a message naming the catalog file and the other screens that do not need it stay reachable

#### Scenario: Filters match nothing
- **WHEN** the Ranking filters match no investigation
- **THEN** the screen says no investigation matches, shows the active filters and offers to clear them

### Requirement: Ranking screen content
The Ranking screen SHALL show, in order: the profile selector, the filters with the match count, the ranked list, and the collapsed "How this ranking works" panel. Each list item SHALL show rank, accession, title, total points, the fuel-phase and topic tags, the not-assessed and unreviewed markers, a short summary (AI-labeled, or PSI text as fallback), and links to Detail, to Compare and to its PSI page. Behavior follows `investigation-ranking`.

#### Scenario: Reading one item
- **WHEN** the Ranking screen is shown
- **THEN** each item exposes its score breakdown by an expandable control reachable by keyboard

#### Scenario: Add to comparison
- **WHEN** a user chooses "Compare" on an item
- **THEN** Compare opens with that accession preselected

### Requirement: Compare screen content
The Compare screen SHALL show, in order: the picker with the selection count, the comparison table, and, when fewer than two investigations are selected, an instruction instead of the table. The first table column SHALL stay visible while the table scrolls horizontally inside its own area. Behavior follows `investigation-comparison`.

#### Scenario: Fewer than two selected
- **WHEN** one investigation is selected
- **THEN** the screen asks for at least one more and shows no table

### Requirement: Coverage map screen content
The Coverage map screen SHALL show, in order: a one-sentence explanation of the axes, the filters with the "N of M tests plotted" count, the chart with legend and overlays, the insight panel, and the point-details panel. The table alternative and the download SHALL be reachable from the chart toolbar. Behavior follows `coverage-map`.

#### Scenario: Insight below the chart on a phone
- **WHEN** the viewport is 360 px wide
- **THEN** the filters, chart, insight and details stack in one column in that order

### Requirement: Compare picker interaction
The Compare picker SHALL list matching investigations (by title, acronym or accession) each with an "Add" button, SHALL show the selected investigations as removable chips, and SHALL give each remove button an accessible name that includes the accession (for example "Remove PSI-159"). Adding beyond three SHALL show the limit message and leave the selection unchanged.

#### Scenario: Removing a selection
- **WHEN** a user activates "Remove PSI-159" on its chip
- **THEN** it leaves the selection, the count and the address update, and the table is replaced by the instruction if fewer than two remain

#### Scenario: Searching
- **WHEN** a user types "SAFFIRE" in the picker
- **THEN** only investigations whose title, acronym or accession contain it are listed

### Requirement: Investigation detail screen content
The Investigation detail screen SHALL show, in order: accession, title and acronym; the AI-labeled summary and fire-safety note (or the PSI objectives labeled as PSI text); the curated facts (platform, hardware group, fuel phase, topics, measurements) with unreviewed markers; the objectives, approach, hypothesis and earth-benefits text labeled as PSI text; the test-condition ranges (O2, pressure, fuels) or "no normalized test data"; the ranking position per profile; related investigations as links; and the citation block with the PSI link and DOI when known. Every missing value SHALL follow the app-shell missing-value rule.

#### Scenario: Investigation without test rows
- **WHEN** an investigation has no normalized test rows
- **THEN** the test-condition block reads "no normalized test data" with a link to its PSI page and the rest of the screen is intact

#### Scenario: Related investigation link
- **WHEN** a related accession exists in the catalog
- **THEN** it is a link to its Detail screen, and an accession not in the catalog is plain text

### Requirement: About screen content
The About screen SHALL show, in order: what the app is and the challenge it answers; the disclaimer that it is not an official NASA product; how AI was used (model, dates, prompt version from the summaries file, and that nothing is generated at runtime); the data sources with PSI links and DOIs; known limits (no partial-gravity data, gaseous fuels in the mapped tests, the ranking is a heuristic); and the link to THIRD_PARTY_LICENSES.

#### Scenario: AI-use facts from data
- **WHEN** About is shown and the summaries file loaded
- **THEN** the model, dates and prompt version shown equal those in the file

#### Scenario: Summaries file missing
- **WHEN** the summaries file failed to load
- **THEN** the AI-use block says the details could not be loaded and names the file

### Requirement: Not found screen content
The Not found screen SHALL state what was not found, show the requested address, and link to Ranking and to the navigation.

#### Scenario: Bad address
- **WHEN** a user opens `#/nothing-here`
- **THEN** the screen shows `#/nothing-here` and a link to Ranking

### Requirement: Responsive layout
Every screen SHALL be usable from 360 px to a wide desktop. At 360 px, content SHALL be one column, navigation SHALL remain reachable, and only data tables and the chart toolbar MAY scroll horizontally inside their own area. Touch targets SHALL be at least 44 px.

#### Scenario: Phone width
- **WHEN** any screen is shown at 360 px
- **THEN** the page itself does not scroll horizontally

### Requirement: Keyboard and focus order
On every screen the focus order SHALL follow the visual order. Every control SHALL show a visible focus indicator. A "skip to content" link SHALL be the first focusable element. Opening or closing a panel SHALL NOT move focus away from its trigger.

#### Scenario: Tab only
- **WHEN** a user navigates a screen with Tab alone
- **THEN** every control and link is reachable in visual order, and the skip link is first

### Requirement: Screen title and document title
Each route change SHALL set a distinct document title and move focus to the screen heading, so assistive technology announces the new screen.

#### Scenario: Navigating to Compare
- **WHEN** a user follows the Compare navigation item
- **THEN** the document title names Compare and focus is on the Compare heading

### Requirement: No new text claims
Screen copy SHALL NOT state facts about fire safety that are not in the challenge statement or the PSI text. Explanatory copy (axis labels, panel intros) SHALL describe the screen, not the science.

#### Scenario: Reviewing copy
- **WHEN** the team reviews the screen texts
- **THEN** each factual sentence cites the challenge statement or a PSI field

### Requirement: Ranking position format
The ranking position block on the Investigation detail screen SHALL list every profile in the profiles file, each with its label and the position as "#n of N" computed by the ranking function for that profile, so the values differ where the ranking differs. Non-combustion records SHALL show their position after all combustion records.

#### Scenario: Positions differ by profile
- **WHEN** PSI-159 ranks differently under Crew cabin and Lunar base
- **THEN** each profile row shows its own position and total

#### Scenario: New profile added in data
- **WHEN** a profile is added to the profiles file
- **THEN** the block shows it with no code change

### Requirement: Screens use the design system
Every screen SHALL use the tokens and shared components of `design-system` (labels, markers, missing value, data state, count line, citation) instead of local styles.

#### Scenario: Consistent labels
- **WHEN** the AI label appears on Ranking, Compare and Detail
- **THEN** it looks and reads the same on all three
