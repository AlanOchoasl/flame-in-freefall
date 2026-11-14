# Spec Delta

## Purpose

Defines the web app frame that hosts the four dashboard views, so the data loads reliably, AI and NASA content are labeled, sources are cited, and the app runs offline from a public URL.

## ADDED Requirements

### Requirement: Four views reachable by navigation
The app SHALL provide navigation to Ranking, Compare, Coverage map and Investigation detail, each with its own URL, and to an About screen at `#/about`. The bare address SHALL redirect to Ranking. Unknown URLs SHALL show a not-found message with a link home.

#### Scenario: Direct link
- **WHEN** a user opens the URL of the Coverage map view
- **THEN** that view is shown without passing through another view

#### Scenario: Unknown URL
- **WHEN** a user opens an address that matches no view
- **THEN** a not-found message with a link to Ranking is shown

### Requirement: Static data files loaded independently
The app SHALL load the catalog, experiments and summaries files separately. If one file fails to load, views that do not need it SHALL still work and the affected views SHALL say which file is missing.

#### Scenario: Missing summaries file
- **WHEN** the summaries file cannot be loaded
- **THEN** Ranking and Coverage map work and Detail shows the PSI text instead

### Requirement: Data version checked
Each data file SHALL declare a `schemaVersion`. The app SHALL refuse a file whose major version it does not support and SHALL name the file and both versions.

#### Scenario: Unsupported version
- **WHEN** a data file declares a major version the app does not support
- **THEN** the views that need it show a message naming the file and both versions

### Requirement: No network use at runtime beyond own files
The app MUST NOT request anything from outside its own origin at runtime: no CDN scripts, remote fonts, analytics or AI services.

#### Scenario: Offline use
- **WHEN** the network is disconnected after the first page load
- **THEN** all views keep working

### Requirement: AI-generated text is always labeled
Any text produced by AI SHALL be shown with an "AI-generated" label that names the model and says whether a person reviewed it. NASA text SHALL be labeled as coming from PSI.

#### Scenario: Unreviewed summary
- **WHEN** a summary has `reviewed` false
- **THEN** it shows "AI-generated, not yet reviewed" and the model name

### Requirement: Sources cited in every view
Every view SHALL name NASA PSI as its data source, and every investigation shown SHALL link to its PSI page and show its DOI when known.

#### Scenario: Investigation card
- **WHEN** an investigation is shown anywhere
- **THEN** a link to its PSI page is present

### Requirement: Missing values explain themselves
The app MUST NOT show an empty cell or a zero for missing data. It SHALL show a dash and the reason (not in the PSI record, no normalized test data, not reviewed yet).

#### Scenario: Investigation without dates
- **WHEN** an investigation has no dates
- **THEN** the date shows a dash with "not in the PSI record"

### Requirement: About and disclaimer
The app SHALL include an About screen, reachable at `#/about` and from the footer, stating that it was made for NASA Space Apps Challenge 2026, is not an official NASA product, how AI was used, the data sources and the third-party license list.

#### Scenario: Reading About
- **WHEN** a user opens About
- **THEN** it shows the AI-use description and links to THIRD_PARTY_LICENSES

### Requirement: Usable on small screens and by keyboard
The app SHALL be usable from 360 px wide to desktop, and navigation and filters SHALL be operable by keyboard.

#### Scenario: Phone width
- **WHEN** the viewport is 360 px wide
- **THEN** no view needs horizontal page scrolling except data tables inside their own scroll area

### Requirement: Public static deployment
The production build SHALL be a static folder that is deployed to a public URL, reproducible with one build command.

#### Scenario: Build and open
- **WHEN** the build command runs and the output is served
- **THEN** all views load from the public URL
