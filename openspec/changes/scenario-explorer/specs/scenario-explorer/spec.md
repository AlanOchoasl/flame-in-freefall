# Spec Delta

## Purpose

Lets a user pick a crewed habitat and see, on one screen, what PSI investigations say about preventing, detecting and suppressing fire there, and which evidence is missing.

## ADDED Requirements

### Requirement: Scenarios come from data
The app SHALL offer the scenarios listed in the profiles data file, initially `crew-cabin` and `lunar-base-rover`. Each scenario SHALL carry a label, its atmosphere values (O2, pressure, gravity) and a source for each value. Adding a scenario to the file SHALL add it to the picker with no code change.

#### Scenario: New scenario in data
- **WHEN** a scenario entry is added to the profiles file and the app is rebuilt
- **THEN** it appears in the scenario picker

### Requirement: Scenario route and default
The scenario screen SHALL be at `#/scenario/<id>`. `#/` SHALL redirect to `#/scenario/lunar-base-rover`. An unknown id SHALL show the Not found screen naming the id.

#### Scenario: Opening the app
- **WHEN** a user opens the app with no hash
- **THEN** the Moon base and pressurized rover scenario is shown and the address is `#/scenario/lunar-base-rover`

#### Scenario: Unknown scenario
- **WHEN** a user opens `#/scenario/mars-dome`
- **THEN** the Not found screen names `mars-dome` and links to the default scenario

### Requirement: Scenario picker
The screen SHALL show every scenario as a selectable card with its label and a one-line atmosphere summary. Choosing a card SHALL update the address and every block on the screen. The picker SHALL be operable by keyboard as one radio group.

#### Scenario: Switching scenario
- **WHEN** a user selects "Spacecraft & station cabin"
- **THEN** the address becomes `#/scenario/crew-cabin` and the context, gaps and pillars change to that scenario

### Requirement: Scenario context block
The screen SHALL show the selected scenario's O2, pressure (psi with the bar value) and gravity, each with its source. Values marked expected in the source SHALL be labeled "expected, not final".

#### Scenario: Moon base values
- **WHEN** the Moon base scenario is shown
- **THEN** the block shows O2 ≥ 30 %, pressure ≤ 10.2 psi (≈ 0.70 bar) labeled expected, and links the challenge statement as source

### Requirement: Evidence gaps from data
The screen SHALL list the gaps defined for the scenario in `data/ranking/scenarios.json`, before the pillars. Each gap SHALL show a severity word with a glyph (major gap, partial evidence, no data), a title, a sentence of evidence and its source. A gap with `reviewed` false SHALL carry the unreviewed marker.

#### Scenario: Gap with source
- **WHEN** the Moon base scenario is shown
- **THEN** each gap shows its severity word, its text and a link or name for its source

#### Scenario: Unreviewed gap
- **WHEN** a gap entry has `reviewed` false
- **THEN** it is shown with the unreviewed marker

### Requirement: Computed counts are not typed in
Any count in a gap that can be derived from the processed data (for example, tests in the Moon-base zone) SHALL be computed from `experiments.json` at runtime, not stored as text.

#### Scenario: Moon-base-zone count
- **WHEN** the experiments file holds 66 plottable tests in the Moon-base zone
- **THEN** the gap reads "66 of 442 plotted tests" and changes if the data changes

### Requirement: Three fire-safety pillars
The screen SHALL show three pillars, Prevent, Detect and Suppress, mapped from the curated topics `material-flammability`, `detection` and `suppression`. Each pillar SHALL list its top three investigations in the selected scenario's ranking order, each linking to its Detail screen, and SHALL show how many investigations it holds with a link to the Investigations list filtered by that pillar.

#### Scenario: Pillar order follows the scenario
- **WHEN** the scenario changes
- **THEN** each pillar's top three follow the new scenario's ranking

#### Scenario: Pillar link
- **WHEN** a user follows "All suppression investigations"
- **THEN** the Investigations list opens filtered to Suppress for the same scenario

### Requirement: One fact per pillar from a PSI table
Each pillar SHALL show at most one fact from `scenarios.json`, labeled "From PSI test tables", naming the PSI test table it comes from. A pillar with no fact for the scenario SHALL show no fact block, not a placeholder.

#### Scenario: Fact source shown
- **WHEN** the Suppress pillar shows its FLEX fact
- **THEN** the fact names PSI-69 and its test table as source

### Requirement: Investigations without pillar tags
An investigation whose topics are not curated SHALL NOT appear in any pillar. The screen SHALL state how many fire-safety-relevant investigations are not tagged yet.

#### Scenario: Untagged record
- **WHEN** PSI-69 has no curated topics
- **THEN** it is absent from Suppress and the screen notes the count of untagged investigations

### Requirement: Links to deeper views
The screen SHALL end with links to the Coverage map, Compare and the Investigations list for the selected scenario.

#### Scenario: Dig deeper
- **WHEN** a user follows "All 26 investigations"
- **THEN** the Investigations list opens ranked for the selected scenario

### Requirement: Heuristic disclaimer
The pillars block SHALL state that the selection is rule-based, link to how it is chosen, and say it is a heuristic and not a NASA assessment. The screen SHALL NOT show risk scores, accident probabilities or "safe" labels.

#### Scenario: Reviewing the screen
- **WHEN** the team reviews the screen copy
- **THEN** it contains the disclaimer and no risk or safety verdict
