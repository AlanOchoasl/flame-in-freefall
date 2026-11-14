# Spec Delta

## Purpose

Defines offline use of the app after its first load, so the demo works with no network and a visitor on a poor connection can keep using a page they already opened.

## ADDED Requirements

### Requirement: Offline use after the first load
After the app has been opened once with a network, every screen (console, investigation detail, About, not-found) SHALL open and work with no network, including after a reload, using the same data as the last online visit.

#### Scenario: Reload offline
- **WHEN** a user opens the app online, waits until it reports being ready offline, disconnects the network and reloads on `#/map`
- **THEN** the map shows its points and the four dataset tiles show the same numbers as online

#### Scenario: Other routes offline
- **WHEN** the network is disconnected and the user opens `#/about` and `#/investigation/PSI-159` directly
- **THEN** both screens render with their data and the final styling

### Requirement: Offline readiness is shown
Once the app has stored everything it needs for offline use, the page SHALL say so in plain text ("Available offline"). It MUST NOT say so before that, and it MUST NOT show anything when service workers are unavailable.

#### Scenario: First visit
- **WHEN** a user opens the app for the first time
- **THEN** "Available offline" appears only after the pages, scripts, styles and data files are stored

### Requirement: Only the app's own files are stored
The cache SHALL hold only successful responses to requests for the app's own origin: its pages, scripts, styles and the four data files (`catalog.json`, `experiments.json`, `summaries.json`, `profiles.json`). The app MUST NOT store or request anything from another origin.

#### Scenario: Cache content
- **WHEN** the stored entries are listed after the first load
- **THEN** every entry belongs to the app's own origin and none is a failed response

### Requirement: Online visits show current data
When the network is available the app SHALL fetch the page and the data files from the network and use the stored copy only when the network request fails. After a deploy, a reload SHALL show the new version without clearing any browser data by hand.

#### Scenario: New data after a deploy
- **WHEN** a data file changes in a deploy and a user who visited before reloads online
- **THEN** the screens show the new numbers

### Requirement: A missing service worker never breaks the app
If the browser does not support service workers or registration fails, the app SHALL work as it does today (online only) and MUST NOT show an error to the visitor.

#### Scenario: Registration unavailable
- **WHEN** service workers are not available in the browser
- **THEN** every screen loads normally online
