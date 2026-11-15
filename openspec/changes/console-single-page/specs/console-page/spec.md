# Spec Delta

## Purpose

Defines the console: one page that holds the ranking, the coverage map, the comparison and the interpretation, so a visitor sees the evidence together instead of across separate pages.

## ADDED Requirements

### Requirement: Section routes open one page
The routes `#/ranking`, `#/compare` and `#/map` SHALL show the same console page and scroll to the Relevance ranking, Compare investigations and Test conditions sections. Moving between them SHALL NOT reset the selected profile, selected investigation, filters or comparison.

#### Scenario: Direct link to the map
- **WHEN** a user opens `#/map`
- **THEN** the console is shown scrolled to the Test conditions section

#### Scenario: Moving between sections
- **WHEN** a user selects the Fire detection profile and then follows the Compare link
- **THEN** the page scrolls to the comparison and the Fire detection profile is still selected

### Requirement: Dataset tiles are computed
The four tiles (investigations, test records, plotted tests, tests in the expected Moon-base zone) SHALL be computed from the loaded files. A number MUST NOT be typed into the code or the copy.

#### Scenario: Data changes
- **WHEN** the experiments file gains records
- **THEN** the tiles show the new totals with no code change

### Requirement: Environment profile buttons
The Relevance ranking panel SHALL offer one button per profile in the profiles file, with the selected one marked by `aria-pressed`. Selecting a profile SHALL re-rank the list and re-rank the list.

#### Scenario: Switching profile
- **WHEN** a user selects Fire detection
- **THEN** the ranking shows the detection order and its heading names the profile

### Requirement: Side column
The side column SHALL show the relevance ranking, the interpretation and the coverage gaps. "Interpret" on a row SHALL open the interpretation of that investigation (AI summary with its label and a highlighted fire-safety note, or the PSI text) in a modal dialog. The count of plotted tests in the expected zone lives in the map card "What the data shows", which follows the map filters.

#### Scenario: Interpreting a row
- **WHEN** a user activates "Interpret" on a ranking row
- **THEN** a modal dialog shows the interpretation of that investigation and the row is marked

### Requirement: Ranking rows
Each ranking row SHALL show its score out of the maximum, a "No normalized test rows" mark when it has none, and links to the detail, to add it to the comparison and to PSI.

#### Scenario: A row without tests
- **WHEN** an investigation has no normalized test rows
- **THEN** its row shows the "No normalized test rows" mark and no map link

### Requirement: The ranking is paged
The relevance ranking SHALL list 10 investigations per page, with Previous, Next and numbered page buttons, and SHALL put its fuel-phase and topic filters above the list. The caption SHALL read "showing FIRST–LAST of M investigations".

#### Scenario: Paging the ranking
- **WHEN** the ranking has 26 investigations and the panel is shown
- **THEN** the panel lists #1 to #10 with "showing 1–10 of 26 investigations" and the page buttons Previous, 1, 2, 3 and Next; page 3 lists #21 to #26 and Next is unavailable

#### Scenario: Changing the profile or a filter
- **WHEN** a user is on page 3 and selects another profile or a filter
- **THEN** the list starts again on page 1 of the new result, and the page buttons disappear when the result fits on one page

### Requirement: Each panel fails alone
Each panel SHALL load and fail independently, naming the file it could not load, without blocking the others.

#### Scenario: Missing summaries file
- **WHEN** the summaries file cannot be loaded
- **THEN** the ranking, the map and the comparison work and the interpretation dialog shows the PSI text

### Requirement: Focus and layout
Moving to a section route SHALL move focus to that section's heading. The page SHALL have one `h1`. Below 1024 px the columns SHALL stack, and no screen SHALL scroll sideways at 360 px except tables and the plot inside their own area.

#### Scenario: Phone width
- **WHEN** the viewport is 360 px wide
- **THEN** the columns are one column and the page does not scroll sideways
