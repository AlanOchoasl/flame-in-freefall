# Spec Delta

## Purpose

Defines the normalized dataset of PSI-159 and PSI-10 test conditions and outcomes that the ranking, comparator and coverage map consume, so every test is comparable, traceable to NASA, and free of silently altered values.

## ADDED Requirements

### Requirement: Unified experiment record
The system SHALL output one record per real test row with: id, investigation accession, flame type (`normal` or `inverse`), fuel, O2 mole fraction, pressure in bar, `Tad` in K, `Zst`, ignition outcome, cool-flame result, the raw `SE/FT` and `TFP` values, and a data-quality list.

#### Scenario: Same field names for all sources
- **WHEN** the pipeline runs on PSI-159 and PSI-10 tables
- **THEN** every record has the same field names regardless of source column names

### Requirement: Blank rows skipped and counted
The system SHALL skip rows with no test identifier and SHALL report rows read, kept and skipped per source file.

#### Scenario: Empty rows in PSI-159 inverse
- **WHEN** the PSI-159 inverse table has rows with no test identifier
- **THEN** they are reported as skipped and 154 records remain for that file

### Requirement: Pressure in bar with approximation flag
The system SHALL express pressure in bar, converting atm with 1 atm = 1.01325 bar. Records from PSI-159, whose column is "approx p (bar)", SHALL carry `pressureIsApproximate: true`.

#### Scenario: PSI-10 pressure in atm
- **WHEN** a PSI-10 row has a mean pressure of 1.0 atm
- **THEN** its record has 1.01325 bar and `pressureIsApproximate` false

### Requirement: Dirty values become null with a flag
The system MUST NOT drop a real row or invent a value because a cell is invalid. Cells such as `#DIV/0!`, `#VALUE!`, `RAMP`, `RAMPED`, `LOW O2`, `-` or empty SHALL become `null` and the record SHALL name the affected fields in its data-quality list.

#### Scenario: Ramped PSI-10 row
- **WHEN** a PSI-10 row has `RAMP` in `Tad (K)`
- **THEN** the record is kept, `tadK` is `null`, and the data-quality list names `tadK`

### Requirement: Ignition outcome mapping
The system SHALL map the PSI-159 "Hot ignition" values case-insensitively to `yes`, `no` or `flash`. Records from PSI-10, which has no outcome column, SHALL have outcome `not-reported`, never `no`.

#### Scenario: Mixed-case values
- **WHEN** PSI-159 contains `Yes` and `yes`
- **THEN** both records have outcome `yes`

### Requirement: Cool-flame result is three-valued
The system SHALL set the cool-flame result to `true` when the raw "Cool flame?" value starts with `yes`, `false` when it starts with `no`, and `null` when empty or unrecognized, always keeping the raw text. An empty value MUST NOT become `false`.

#### Scenario: Composite raw values
- **WHEN** the raw values are `yes, PCI-D`, `no, PCI-hot` and an empty cell
- **THEN** the results are `true`, `false` and `null`, with the raw text kept

### Requirement: Uninterpreted columns kept raw
The system SHALL keep the "Self-ext or flow term" and `TFP` values as raw strings and MUST NOT derive any meaning from them.

#### Scenario: Raw value carried through
- **WHEN** a row has `SE` in the self-ext column
- **THEN** its record has the raw value `SE` and no field derived from it

### Requirement: Plottable and Moon-base-zone flags
Each record SHALL have `isPlottable`, true when O2 fraction and pressure are both numeric, and `inMoonBaseZone`, true when plottable, O2 fraction ≥ 0.30 and pressure ≤ 0.7033 bar (10.2 psi), boundaries inclusive. The thresholds come from the challenge statement.

#### Scenario: A point inside the zone
- **WHEN** a record has O2 0.35 and pressure 0.60 bar
- **THEN** `inMoonBaseZone` is true

#### Scenario: Missing pressure
- **WHEN** a record has no numeric pressure
- **THEN** `isPlottable` and `inMoonBaseZone` are false

### Requirement: Per-investigation summary
The output SHALL include, per investigation, the record count, plottable count, minimum and maximum O2 fraction and pressure, count in the Moon-base zone, and the list of fuels.

#### Scenario: Summary for PSI-159
- **WHEN** the output is read
- **THEN** the PSI-159 summary counts match its records

### Requirement: Provenance
Each record SHALL include the investigation's PSI page link. The output SHALL include the generation date, source file names, per-file row counts and the plottable total.

#### Scenario: Citing a point
- **WHEN** a consumer reads a record
- **THEN** it can show the PSI investigation and link with no other lookup

### Requirement: Schema version
The output SHALL declare a `schemaVersion` starting at `1.0.0`, and a change that removes or renames a field SHALL raise the major version.

#### Scenario: Reading the version
- **WHEN** a consumer opens the output
- **THEN** it finds `schemaVersion` at the top level

### Requirement: Offline and deterministic
The system SHALL read only local files and MUST NOT use the network. Two runs on the same inputs SHALL produce identical output apart from the generation date.

#### Scenario: Run without network
- **WHEN** the pipeline runs with no network
- **THEN** it completes and writes the dataset
