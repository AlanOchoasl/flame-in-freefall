# Spec Delta

## Purpose

Defines the side-by-side comparison of investigations, so users can see at a glance what is the same, what differs, and what is unknown.

## ADDED Requirements

### Requirement: Select two or three investigations
The system SHALL let a user pick investigations with three drop-down menus, one per investigation, each listing every investigation by accession and acronym (or title). The third menu SHALL be optional. A menu SHALL be unavailable until the one before it has a choice, an investigation chosen in one menu SHALL NOT be offered in the others, and emptying a menu SHALL close the gap. Comparison SHALL start with at least two selected, and no more than three can be selected.

#### Scenario: Choosing two investigations
- **WHEN** a user chooses PSI-25 in the first menu and PSI-26 in the second
- **THEN** the comparison table shows both, and PSI-25 is not offered in the second menu

#### Scenario: Third investigation is optional
- **WHEN** two investigations are chosen
- **THEN** the third menu is available and labeled optional, and leaving it empty keeps the two-way comparison

#### Scenario: Limit reached
- **WHEN** three investigations are selected and a user tries to add a fourth from another control (for example "Add compare" on a ranking row)
- **THEN** the fourth is not added and a message explains the limit

### Requirement: Comparison rows
The comparison SHALL show these rows for each selected investigation: objectives, flight platform, hardware, fuel phase, topics, measurements, O2 range, pressure range, fuels tested, dates, related investigations and earth benefits.

#### Scenario: Two investigations selected
- **WHEN** PSI-159 and PSI-25 are selected
- **THEN** every listed row appears with a value or a reasoned dash for each

### Requirement: Same and differs markers
For rows with comparable values (everything except the long text rows), the system SHALL mark the row "same" when all selected values are equal and "differs" otherwise, comparing normalized values.

#### Scenario: Same platform, different fuel
- **WHEN** two investigations share the platform and have different fuel phases
- **THEN** the platform row is marked same and the fuel-phase row is marked differs

### Requirement: Rows where every value is missing
For a comparable row in which every selected investigation has a missing value, the system SHALL mark the row "both missing" (or "all missing" with three selected) and SHALL NOT mark it "same". A row with some missing and some present values SHALL be marked "differs".

#### Scenario: Dates missing in both
- **WHEN** neither selected investigation has dates
- **THEN** the dates row is marked "both missing", not "same"

#### Scenario: One value missing
- **WHEN** one investigation has an O2 range and the other has no normalized test data
- **THEN** the O2 row is marked "differs"

### Requirement: Missing values explain themselves
A missing value SHALL show a dash and the reason: not in the PSI record, no normalized test data, or not reviewed yet. It MUST NOT show zero or blank.

#### Scenario: No test rows
- **WHEN** an investigation has no normalized test rows
- **THEN** its O2 range reads "no normalized test data" with a link to its PSI page

### Requirement: Unreviewed values marked
Curated values with `reviewed` false SHALL carry an "unreviewed" marker in the comparison.

#### Scenario: Unreviewed fuel phase
- **WHEN** a fuel phase is unreviewed
- **THEN** the cell shows the value with the marker

### Requirement: Shareable URL
The selection SHALL be stored in the URL, and opening that URL SHALL restore it.

#### Scenario: Opening a shared link
- **WHEN** a user opens a Compare URL with two accessions
- **THEN** both investigations are preselected and shown

### Requirement: AI summaries labeled
If a plain-language summary exists for a selected investigation, the comparison SHALL show it with the AI-generated label; otherwise it SHALL show nothing invented.

#### Scenario: No summary available
- **WHEN** an investigation has no summary
- **THEN** its column shows the PSI objectives labeled as NASA PSI text
