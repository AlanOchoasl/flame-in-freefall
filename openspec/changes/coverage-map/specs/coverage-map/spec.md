# Spec Delta

## Purpose

Defines the O2 × pressure map of real test conditions, so users can see where NASA has tested, where the expected Moon-base atmosphere falls, and where there is no data.

## ADDED Requirements

### Requirement: One point per plottable test
The map SHALL show one point for each record with `isPlottable` true: O2 as a percentage on the x axis (0–100) and pressure in bar on the y axis.

#### Scenario: Plotted count
- **WHEN** the map loads the Must dataset
- **THEN** it shows 442 points and states that 11 tests are not plotted for lacking O2 or pressure

### Requirement: Outcome encoded without relying on color
Each outcome (`yes`, `no`, `flash`, `not-reported`) SHALL have its own color and its own marker shape, and a legend SHALL list them.

#### Scenario: Grayscale reading
- **WHEN** the map is viewed in grayscale
- **THEN** the four outcomes are still distinguishable by shape

### Requirement: Reference overlays with sources
The map SHALL draw the Moon-base zone (O2 ≥ 30 %, pressure ≤ 10.2 psi ≈ 0.70 bar), Earth air (about 21 % O2, 14.7 psi ≈ 1.01 bar) and the spacesuit atmosphere (100 % O2, 4.3 psi ≈ 0.30 bar). Each SHALL be labeled with its source, and the zone SHALL be described as expected, not final.

#### Scenario: Reading the zone label
- **WHEN** a user looks at the Moon-base zone
- **THEN** its label cites the challenge statement and says the values are expected

### Requirement: Filters with counts
The map SHALL filter by investigation, flame type, fuel and outcome, and SHALL show "N of M tests plotted" after filtering.

#### Scenario: Filtering by inverse flames
- **WHEN** the flame-type filter is `inverse`
- **THEN** only inverse tests are plotted and the counts update

### Requirement: Computed insight with limits
The insight panel SHALL compute from the data how many plotted tests are in the Moon-base zone, their share, and the fuels and investigations they come from. It SHALL state that the tests burn gaseous fuels, not spacecraft materials, and that PSI holds no partial-gravity data.

#### Scenario: Insight text
- **WHEN** the dataset has 66 plotted tests in the zone out of 442
- **THEN** the panel shows those numbers computed from the records, plus both limits

### Requirement: Point details
Selecting or focusing a point SHALL show its investigation with a PSI link, test id, fuel, flame type, O2, pressure (marked approximate when flagged), `Tad`, outcome and the raw cool-flame and `SE/FT` values.

#### Scenario: Approximate pressure
- **WHEN** a point from PSI-159 is selected
- **THEN** its pressure is shown marked as approximate

### Requirement: Table alternative
The view SHALL offer the same filtered records as a table, reachable by keyboard.

#### Scenario: Switching to the table
- **WHEN** a user activates "Show as table"
- **THEN** the filtered records appear as rows with the same fields

### Requirement: Download filtered data
The view SHALL let a user download the filtered records as a file generated in the browser.

#### Scenario: Download
- **WHEN** a user downloads with a filter applied
- **THEN** the file contains exactly the filtered records and their source links
