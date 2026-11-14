# Spec Delta

## Purpose

Defines how the console's choices (environment profile, selected investigation, comparison, map filters) are kept in the address, so a page can be reloaded, shared and left and re-entered without losing what the person was looking at.

## ADDED Requirements

### Requirement: The explorer state is held in the address
The console SHALL keep these choices in the query part of the address: `profile` (environment profile id), `selected` (the investigation shown in the interpretation panel), `ids` (the comparison, up to 3 accessions), `investigation` (the map's investigation filter), and `flame`, `fuel` and `outcome` (the map's other filters). Opening an address SHALL restore the choices it contains. A choice left at its default SHALL NOT appear in the address.

#### Scenario: Reload keeps the profile
- **WHEN** a user selects the Fire detection profile and reloads the page
- **THEN** the Fire detection profile is still selected and the ranking shows the detection order

#### Scenario: Shared link
- **WHEN** a user copies the address after selecting a profile, adding two investigations to the comparison and filtering the map by fuel, and opens it in a new tab
- **THEN** the new tab shows the same profile, the same comparison and the same map filter

#### Scenario: Older addresses keep working
- **WHEN** a user opens `#/compare?ids=PSI-159,PSI-25` or `#/map?investigation=PSI-159`
- **THEN** the comparison holds those two investigations, or the map is filtered to PSI-159, as before

### Requirement: Unknown values are ignored
A parameter whose value is not in the loaded data (an unknown profile id, an accession not in the catalog, a filter value that no test has, more than 3 comparison ids) SHALL be ignored, and the page SHALL fall back to the default for that choice. The page MUST NOT show an error for it.

#### Scenario: Unknown accession
- **WHEN** a user opens `#/ranking?selected=PSI-9999`
- **THEN** the interpretation panel shows the first ranked investigation and no error message appears

### Requirement: In-page changes do not fill the history
A change made inside the console (profile, selected investigation, comparison, map filters) SHALL replace the current history entry. Moving to another route, to an investigation detail or to About SHALL add a history entry.

#### Scenario: Back button
- **WHEN** a user opens the console from About, changes the profile three times and presses Back
- **THEN** the About screen is shown

### Requirement: Links keep the state
The navigation links, the section links of the console, the links from the console to an investigation detail and the detail's "Back to the explorer" link SHALL carry the explorer state. The investigation detail SHALL accept the state in its address and return it unchanged.

#### Scenario: Round trip through the detail
- **WHEN** a user selects the Fire detection profile, adds PSI-47 to the comparison, opens the detail of PSI-47 and follows "Back to the explorer"
- **THEN** the console shows the Fire detection profile and PSI-47 is still in the comparison

#### Scenario: Navigation link
- **WHEN** a user with a comparison and a profile selected uses the Compare link of the navigation
- **THEN** the comparison and the profile are unchanged

### Requirement: Show tests on the map
Each ranking row SHALL offer a "Show tests on the map" action. Activating it SHALL set the map's investigation filter to that investigation, scroll to the map and name the filter in the map's active filters. The map SHALL follow a change of the `investigation` parameter after it is first shown, and a "Clear" action SHALL remove the filter and the parameter.

#### Scenario: From a ranking row
- **WHEN** a user activates "Show tests on the map" on the PSI-25 row
- **THEN** the map lists only PSI-25's tests, and the address contains `investigation=PSI-25`

#### Scenario: Investigation without test rows
- **WHEN** the investigation has no normalized test rows
- **THEN** the action says there are none and does not filter the map to an empty result without saying so
