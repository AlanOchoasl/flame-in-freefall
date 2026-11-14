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
The console SHALL offer one button per profile in the profiles file, with the selected one marked by `aria-pressed`. Selecting a profile SHALL re-rank the list and change the default interpreted investigation.

#### Scenario: Switching profile
- **WHEN** a user selects Fire detection
- **THEN** the ranking shows the detection order and its heading names the profile

### Requirement: Side column
The side column SHALL show the relevance ranking (first five investigations, "Show all N" for the rest), the interpretation of the selected investigation (AI summary with its label, or the PSI text) and the coverage gaps with the count of plotted tests in the expected zone. Each ranking row SHALL show its score out of the maximum, a "No normalized test rows" mark when it has none, and links to the detail, to add it to the comparison and to PSI.

#### Scenario: Interpreting a row
- **WHEN** a user activates "Interpret" on a ranking row
- **THEN** the interpretation panel shows that investigation and the row is marked selected

### Requirement: Each panel fails alone
Each panel SHALL load and fail independently, naming the file it could not load, without blocking the others.

#### Scenario: Missing summaries file
- **WHEN** the summaries file cannot be loaded
- **THEN** the ranking, the map and the comparison work and the interpretation shows the PSI text

### Requirement: Focus and layout
Moving to a section route SHALL move focus to that section's heading. The page SHALL have one `h1`. Below 1024 px the columns SHALL stack, and no screen SHALL scroll sideways at 360 px except tables and the plot inside their own area.

#### Scenario: Phone width
- **WHEN** the viewport is 360 px wide
- **THEN** the columns are one column and the page does not scroll sideways
