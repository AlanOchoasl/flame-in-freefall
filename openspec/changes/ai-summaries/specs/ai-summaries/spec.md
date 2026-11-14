# Spec Delta

## Purpose

Defines the AI-written summaries of PSI investigations so they stay faithful to NASA's text, are checked and reviewed by a person, and are always labeled as AI-generated.

## ADDED Requirements

### Requirement: Summary record per investigation
For each investigation the system SHALL store a plain summary (at most 120 words), a fire-safety relevance note (at most 60 words), the model name, the generation date, the prompt version, the source fields used and a `reviewed` flag.

#### Scenario: Record shape
- **WHEN** `summaries.json` is read
- **THEN** every entry has all of those fields and `aiGenerated` true

### Requirement: Grounded in the investigation's own text
Generation SHALL use only the objectives, approach, hypothesis and earth-benefits text of that investigation. The stored prompt SHALL forbid facts from outside that text.

#### Scenario: Prompt in the repo
- **WHEN** a reviewer opens the repo
- **THEN** the exact prompt and its version are present

### Requirement: Numeric guard
The check SHALL fail if a summary contains a number that does not appear in the source text of the same investigation, and SHALL list each offending number and accession.

#### Scenario: Invented number
- **WHEN** a summary says "20 tests" and the source text has no 20
- **THEN** the check fails naming that accession and number

### Requirement: Length and identity checks
The check SHALL fail for summaries over the word limits, for entries whose accession is not in the catalog, and for empty text.

#### Scenario: Unknown accession
- **WHEN** an entry has accession `PSI-9999`
- **THEN** the check fails naming it

### Requirement: Human review gate
A summary SHALL have `reviewed` true only after a person read it against the source. The app SHALL label unreviewed summaries as such, and a strict check SHALL fail while any displayed summary is unreviewed.

#### Scenario: Strict check before submission
- **WHEN** the strict check runs and one summary is unreviewed
- **THEN** it fails listing that accession

### Requirement: Fallback is the NASA text
When no valid summary exists, the app SHALL show the PSI objectives text labeled as NASA PSI text. It MUST NOT show blank or invented text.

#### Scenario: Summary missing
- **WHEN** an investigation has no summary entry
- **THEN** the PSI objectives are shown with the PSI label

### Requirement: Always labeled and reproducible
Every shown summary SHALL carry the AI-generated label with the model name and review status. The model, date and prompt version SHALL be recorded for each entry so the AI-use declaration can cite them.

#### Scenario: Declaration data
- **WHEN** the team prepares the AI-use description
- **THEN** model, date and prompt version are available from the file

### Requirement: No secrets and no runtime calls
The repository MUST NOT contain API keys, and the app MUST NOT call an AI service at runtime.

#### Scenario: Searching the repo
- **WHEN** the repo is searched for keys
- **THEN** none are found and `.env` is ignored by git
