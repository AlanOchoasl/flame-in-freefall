# Spec Delta

## Purpose

Defines the catalog of PSI combustion investigations that the dashboard reads, so every view works from one clean, traceable record per investigation and can tell reviewed facts from unreviewed ones.

## ADDED Requirements

### Requirement: One record per investigation
The system SHALL output exactly one record per investigation in the cached PSI catalog, identified by its accession (e.g. `PSI-159`), with title, acronym, research area, project type, flight platform, objectives, approach, hypothesis, earth-benefits text, keywords, related investigations and dates.

#### Scenario: All investigations present
- **WHEN** the build runs on the cached catalog of 26 investigations
- **THEN** the output contains 26 records with unique accessions

### Requirement: Missing values are null, never invented
The system MUST represent empty source values as `null` and MUST NOT fill them with guesses. This applies to empty acronyms, dates, hypothesis and sub-area.

#### Scenario: Investigation without dates
- **WHEN** a source record has empty start and end dates
- **THEN** its record has both dates as `null`

### Requirement: Lists and dates are normalized
The system SHALL split space-separated source strings (keywords, related investigations, hardware names and links) into arrays, collapse repeated whitespace in text, and output dates as ISO `YYYY-MM-DD`, including the epoch release date.

#### Scenario: Related investigations string
- **WHEN** the source value is `PSI-69     PSI-142`
- **THEN** the record lists `["PSI-69", "PSI-142"]`

#### Scenario: Release date
- **WHEN** the source release date is the epoch number 1781049600
- **THEN** the record shows the corresponding ISO date

### Requirement: Sub-area spellings unified, raw preserved
The system SHALL keep the raw sub-research-area text and SHALL add a normalized value that treats spellings differing only in case, plural or surrounding space as the same.

#### Scenario: Gaseous-fuel variants
- **WHEN** records use `Flames of Gaseous Fuels`, `Flames of gaseous fuel` and `Flames of gaseous fuels`
- **THEN** all three share one normalized value and keep their own raw text

### Requirement: Curated fields carry source and review status
The system SHALL merge curated fields (hardware group, fuel phase, fire-safety topics, measurements) from the curation file. Each curated value SHALL include a source note and a `reviewed` flag, and records without curation SHALL have those fields empty and unreviewed.

#### Scenario: Unreviewed value shown as such
- **WHEN** a curated value has `reviewed: false`
- **THEN** the output keeps it with `reviewed: false` and the metadata counts it as unreviewed

### Requirement: Curation errors fail the build
The system MUST fail with a clear message if the curation file names an accession that is not in the catalog, or uses a value outside the allowed lists.

#### Scenario: Typo in an accession
- **WHEN** the curation file contains `PSI-1599`
- **THEN** the build stops and names that accession

### Requirement: Strict mode for submission
The system SHALL offer a strict mode that exits with an error while any curated value is unreviewed, and SHALL list the offending accessions.

#### Scenario: Strict build with pending review
- **WHEN** strict mode runs and one value is unreviewed
- **THEN** it exits with an error listing that accession

### Requirement: Research-area flag without editorializing
The system SHALL set a boolean `isCombustionScience` from the PSI research-area field. Records outside Combustion Science SHALL be kept.

#### Scenario: Materials Science record
- **WHEN** a record's research area is `Materials Science`
- **THEN** it is kept with `isCombustionScience` false

### Requirement: Link to test tables
The system SHALL list, for each record, the cached test-table files whose name starts with its accession, so views can tell which investigations have test-row data.

#### Scenario: Investigation with tables
- **WHEN** `PSI-159` has cached table files
- **THEN** its record lists those file names

### Requirement: Provenance
Each record SHALL include its official PSI page link and a DOI field, `null` until captured. The output SHALL include the generation date, the source retrieval date, record count and counts of unreviewed values.

#### Scenario: Citing an investigation
- **WHEN** a consumer reads any record
- **THEN** it has the PSI page link and the DOI, or `null` for the DOI

### Requirement: Schema version
The output SHALL declare a `schemaVersion` starting at `1.0.0`, and a change that removes or renames a field SHALL raise the major version.

#### Scenario: Reading the version
- **WHEN** a consumer opens the catalog
- **THEN** it finds `schemaVersion` at the top level

### Requirement: Offline and deterministic
The system SHALL read only local files and MUST NOT use the network. Two runs on the same inputs SHALL produce identical records.

#### Scenario: Build without network
- **WHEN** the build runs with no network
- **THEN** it completes and writes the catalog
