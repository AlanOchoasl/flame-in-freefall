# Spec Delta

## Purpose

Defines the visual and interaction contract of the research-console presentation across existing PSI exploration routes, including an explicit accessible color-theme preference.

## ADDED Requirements

### Requirement: Research-console frame
The app SHALL show a consistent compact header, current-route navigation, PSI attribution on every route, without representing cached data as live spacecraft telemetry. The methodological statement (an experimental data explorer, not a spacecraft monitor or an operational fire-risk predictor) is shown in the footer shared by every screen and no longer as a band under the header.

#### Scenario: Navigate between existing routes
- **WHEN** a visitor opens Ranking, Compare, Coverage map, Investigation detail or About
- **THEN** the shared frame identifies the current route and says this is an experimental data explorer, not a spacecraft monitor or operational fire-risk predictor

### Requirement: Accessible theme selection
The app SHALL provide dark and light palettes with a visible Light / Dark control. Until explicitly selected, the palette SHALL follow the user's operating-system preference; a manual selection SHALL take precedence during subsequent route changes.

#### Scenario: Initial system preference
- **WHEN** a visitor opens the app without a manual theme selection
- **THEN** the displayed palette and pressed control match the current system preference

#### Scenario: Manual selection
- **WHEN** a visitor chooses Dark or Light
- **THEN** the whole app, including plot marks and reference overlays, adopts that palette and the selected control is visibly and programmatically marked

### Requirement: Consistent route content
The app SHALL use the selected palette's compact panels, readable labels, distinct statuses and visible focus indications across the five existing views without changing routing or scientific computation.

#### Scenario: View change
- **WHEN** a visitor switches between ranking, comparison, map, detail and method
- **THEN** chart, controls, data rows, loading/error/empty states and citations remain legible and visually consistent

### Requirement: Evidence-backed plot
The coverage plot SHALL position one mark per plottable processed PSI test by recorded O2 fraction and pressure; outcome shapes SHALL distinguish reported values, and the expected lunar-condition overlay SHALL be labeled as a reference from the challenge, not a safety result.

#### Scenario: Missing or unknown outcome
- **WHEN** a test has no reported outcome
- **THEN** the plot and legend display it as not reported, never as an ignition result

#### Scenario: Filtered view
- **WHEN** map filters change
- **THEN** marks, counts, inspector and the table alternative reflect the same underlying records, not illustrative concept data

### Requirement: Data fidelity and mobile access
The app SHALL derive visible numbers from available processed data, show unavailable values explicitly, and keep controls and the map's table alternative accessible at 360px without page-wide horizontal overflow.

#### Scenario: Empty or missing data
- **WHEN** a dataset is missing or a filter matches nothing
- **THEN** the view shows its current data-state message rather than a fabricated count, chart or placeholder DOI
