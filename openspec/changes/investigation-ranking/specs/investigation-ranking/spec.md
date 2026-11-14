# Spec Delta

## Purpose

Defines how investigations are ranked by relevance to a chosen crew environment, so the ranking is deterministic, explainable and honest about missing evidence.

## ADDED Requirements

### Requirement: Environment profiles
The system SHALL offer the profiles defined in the profiles data file, initially `crew-cabin`, `lunar-base-rover`, `detection` and `suppression`. Selecting a profile SHALL re-rank all investigations.

#### Scenario: Switching profile
- **WHEN** a user changes the profile from `crew-cabin` to `detection`
- **THEN** the list is re-ranked using the detection weights

#### Scenario: New profile added in data
- **WHEN** a profile entry is added to the profiles file
- **THEN** it appears in the selector after rebuild with no code change

### Requirement: Weights are data with a rationale
Factor weights SHALL be stored in a data file, each with a rationale and a source, and changing a weight MUST NOT require a code change. A missing weight SHALL fail the build.

#### Scenario: Weight changed in the file
- **WHEN** a weight in the profiles file is edited
- **THEN** the ranking reflects it after rebuild with no code edit

### Requirement: Score is the sum of explicit factors
The score SHALL be the sum of points from named factors: topic match, solid-fuel flammability, NASA fire-safety label, Moon-base atmosphere coverage (lunar profile only) and microgravity project type. The system SHALL show each factor's points out of its maximum with its evidence text.

#### Scenario: Breakdown shown
- **WHEN** a user expands an investigation's score
- **THEN** each factor appears with points, maximum and the field value that produced it

### Requirement: Missing evidence is not assessed
When a factor cannot be evaluated because the data is absent, the system SHALL mark it "not assessed" and SHALL state why. For the Moon-base factor, an investigation with no normalized test rows is "not assessed", not zero.

#### Scenario: Investigation without test rows
- **WHEN** an investigation has no rows in the experiments data
- **THEN** the atmosphere factor reads "not assessed: no normalized test data"

### Requirement: Non-combustion records listed last
Records whose research area is not Combustion Science SHALL be listed after all combustion records, with a note, regardless of points.

#### Scenario: Materials Science record
- **WHEN** an investigation is outside Combustion Science
- **THEN** it appears after every combustion investigation with a note

### Requirement: Unreviewed tags are flagged
If any factor used a curated value with `reviewed` false, the investigation SHALL show a "based on unreviewed tags" marker.

#### Scenario: Unreviewed topic
- **WHEN** the topic factor used an unreviewed topic tag
- **THEN** the marker is shown on that investigation

### Requirement: Deterministic order
For the same data and profile the order SHALL be identical. Ties SHALL be broken by accession in ascending order.

#### Scenario: Equal scores
- **WHEN** two investigations have equal points
- **THEN** the one with the lower accession is listed first

### Requirement: Basis and disclaimer visible
The Ranking view SHALL include a panel explaining each factor, its weight and the challenge-statement text it follows, and SHALL say this is a heuristic and not an assessment by NASA.

#### Scenario: Opening the panel
- **WHEN** a user opens "How this ranking works"
- **THEN** every factor and the disclaimer are shown

### Requirement: Filters
The Ranking view SHALL filter by fuel phase and topic, and SHALL show how many investigations match.

#### Scenario: Filtering by solid fuel
- **WHEN** the fuel-phase filter is `solid`
- **THEN** only investigations tagged `solid` are listed and the count is shown
