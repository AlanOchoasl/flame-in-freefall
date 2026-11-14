# Spec Delta

## Purpose

Defines the normalized dataset of PSI-159 and PSI-10 combustion experiments that the web app consumes, so every experiment is comparable, traceable to its NASA source, and free of silently altered values.

## ADDED Requirements

### Requirement: Unified experiment record
The system SHALL output one record per real experiment row, with these fields: source investigation id, flame type (`normal` or `inverse`), fuel, O2 mole fraction, pressure in bar, adiabatic temperature `Tad` in K, `Zst`, ignition outcome, and cool-flame flag.

#### Scenario: Records from all four tables
- **WHEN** the pipeline runs on the cached PSI-159 and PSI-10 tables
- **THEN** the output contains records from both investigations and both flame types, all using the same field names

### Requirement: Blank rows are skipped and counted
The system SHALL skip rows with no test identifier and SHALL report how many rows were read, kept and skipped per source file.

#### Scenario: Empty trailing rows in the PSI-159 inverse table
- **WHEN** the PSI-159 inverse table contains rows with no test identifier
- **THEN** those rows are not output and the report lists them as skipped, leaving 154 records for that file

### Requirement: Pressure normalized to bar
The system SHALL express pressure in bar. Values given in atm SHALL be converted with 1 atm = 1.01325 bar.

#### Scenario: PSI-10 pressure in atm
- **WHEN** a PSI-10 row reports a mean pressure of 1.0 atm
- **THEN** its record has a pressure of 1.01325 bar

### Requirement: Dirty values become null with a flag
The system MUST NOT drop a real row or invent a value because a cell is invalid. Non-numeric cells (such as `#DIV/0!`, `#VALUE!`, `RAMP`, `RAMPED`, `LOW O2`, `-` or empty) SHALL become `null` and the record SHALL list the affected fields in a data-quality flag.

#### Scenario: Ramped PSI-10 row
- **WHEN** a PSI-10 row has `RAMP` in its `Tad (K)` cell
- **THEN** the record is kept, its `Tad` is `null`, and its data-quality flag names `Tad`

### Requirement: Ignition outcome mapping
The system SHALL map the PSI-159 "Hot ignition" values case-insensitively to `yes`, `no` or `flash`. Records from PSI-10, which has no outcome columns, SHALL have outcome `not-reported`.

#### Scenario: Mixed-case outcome values
- **WHEN** PSI-159 contains both `Yes` and `yes`
- **THEN** both records have outcome `yes`

#### Scenario: PSI-10 has no outcome
- **WHEN** a record comes from PSI-10
- **THEN** its outcome is `not-reported`, not `no`

### Requirement: Self-extinction column preserved uninterpreted
The system SHALL keep the raw "Self-ext or flow term" value of PSI-159 rows as a string field and MUST NOT derive any meaning from it.

#### Scenario: Raw value carried through
- **WHEN** a PSI-159 row has `SE` in that column
- **THEN** its record has the raw value `SE` and no derived field based on it

### Requirement: Provenance on every record and on the dataset
Each record SHALL include its source investigation id and the official page link for that investigation. The output file SHALL include the generation date, source file names and per-file row counts.

#### Scenario: Citing a point on the map
- **WHEN** a consumer reads any record
- **THEN** it can show the PSI investigation id and link without any other lookup

### Requirement: Offline and deterministic
The system SHALL read only local files and MUST NOT access the network. Running it twice on the same inputs SHALL produce identical output, apart from the generation date.

#### Scenario: Run without network
- **WHEN** the pipeline runs with no network access
- **THEN** it completes and writes the dataset
