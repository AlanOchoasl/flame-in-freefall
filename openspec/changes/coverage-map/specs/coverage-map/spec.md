# Spec Delta

## Purpose

Defines the O2 × pressure map of real test conditions, so users can see where NASA has tested, where the expected Moon-base atmosphere falls, and where there is no data.

## ADDED Requirements

### Requirement: One point per plottable test
The map SHALL show one point for each record with `isPlottable` true: O2 as a percentage on the x axis (0–100) and pressure in bar on the y axis.

#### Scenario: Plotted count
- **WHEN** the map loads the Must dataset
- **THEN** it shows one point per plottable record (333 with the current data) and, when some tests are not plotted for lacking O2 or pressure, states how many (none today)

### Requirement: Outcome encoded without relying on color
Each outcome (`yes`, `no`, `flash`, `not-reported`) SHALL have its own color and its own marker shape, and a legend SHALL list them.

#### Scenario: Grayscale reading
- **WHEN** the map is viewed in grayscale
- **THEN** the four outcomes are still distinguishable by shape

### Requirement: Reference overlays with sources
The map SHALL draw the Moon-base zone (O2 ≥ 30 %, pressure ≤ 10.2 psi ≈ 0.70 bar), Earth air (about 21 % O2, 14.7 psi ≈ 1.01 bar) and the spacesuit atmosphere (100 % O2, 4.3 psi ≈ 0.30 bar). Each SHALL be labeled with its source, and the zone SHALL be described as expected, not final.

#### Scenario: Reading the zone label
- **WHEN** a user looks at the Moon-base zone
- **THEN** its label cites the challenge statement and says the values are expected

### Requirement: Filters with counts
The map SHALL filter by investigation, flame type, fuel and outcome, and SHALL show "N of M tests plotted" after filtering.

#### Scenario: Filtering by inverse flames
- **WHEN** the flame-type filter is `inverse`
- **THEN** only inverse tests are plotted and the counts update

### Requirement: Computed insight with limits
The insight panel SHALL compute from the data how many plotted tests are in the Moon-base zone, their share, and the fuels and investigations they come from. It SHALL state that the tests burn gaseous fuels, not spacecraft materials, and that PSI holds no partial-gravity data.

#### Scenario: Insight text
- **WHEN** the dataset has 48 plotted tests in the zone out of 333
- **THEN** the panel shows those numbers computed from the records, plus both limits

### Requirement: Point details
Selecting or focusing a point SHALL show its investigation with a PSI link, test id, fuel, flame type, O2, pressure (marked approximate when flagged), `Tad`, outcome and the raw cool-flame and `SE/FT` values.

#### Scenario: Approximate pressure
- **WHEN** a point from PSI-159 is selected
- **THEN** its pressure is shown marked as approximate

### Requirement: Table alternative
The view SHALL offer the same filtered records as a table, reachable by keyboard.

#### Scenario: Switching to the table
- **WHEN** a user activates "Show as table"
- **THEN** the filtered records appear as rows with the same fields

### Requirement: No wheel zoom
The map SHALL zoom only with its zoom buttons, so that scrolling the page with the mouse over the map scrolls the page. A drag with the mouse SHALL still move a zoomed map.

#### Scenario: Wheel over the map
- **WHEN** a user turns the mouse wheel with the pointer over the map
- **THEN** the page scrolls and the map keeps its zoom

### Requirement: Readable axes
Both axes SHALL show tick marks with numeric values and units: O2 in percent from 0 to 100 with a tick at least every 20, and pressure in bar over the plotted range with at most six ticks. Each axis SHALL have a title and light gridlines at the ticks. A reader SHALL be able to read a point's approximate conditions from the axes alone.

#### Scenario: Reading a point from the axes
- **WHEN** the map is shown with its default data
- **THEN** every tick on both axes has a numeric label with its unit, so the position of any point can be read off

### Requirement: Overlay labels never hide data
Overlay areas SHALL be drawn behind the points. Overlay labels SHALL NOT overlap any plotted point: each label SHALL sit in the plot margin or outside the plot area and be tied to its overlay by position, a leader line or the legend entry. The overlays SHALL remain listed with their values and sources below the chart.

#### Scenario: Earth air label
- **WHEN** many points lie near 21 % O2 and 1 bar
- **THEN** the "Earth air" label is still fully readable and no point is drawn over its text

### Requirement: Narrow viewports keep the plot legible
The plot SHALL keep a minimum width of 480 px. When the container is narrower, the plot area SHALL scroll horizontally inside its own region (focusable, labeled) while the page itself does not scroll; the toolbar, legend, overlay descriptions, insight and details SHALL stay in the single column outside that region.

#### Scenario: 360 px viewport
- **WHEN** the viewport is 360 px wide
- **THEN** the plot is 480 px wide inside a horizontally scrollable region, its ticks and markers are as readable as on desktop, and the page has no horizontal scroll

### Requirement: Keyboard stepping through points
When the chart has focus, the arrow keys SHALL move the selection between points, Home and End SHALL jump to the first and last point in the current order, and Escape SHALL clear the selection. The point-details panel SHALL be a polite live region so the new selection is announced. This is Nice-to-have; the table alternative remains the Must for keyboard users.

#### Scenario: Stepping
- **WHEN** a user focuses the chart and presses the right arrow key
- **THEN** the next point is selected and its details are announced

### Requirement: Large tables are paged
The table alternative SHALL show 10 filtered records per page, with Previous and Next buttons and numbered page buttons (the first and last page and those next to the current one, with a gap between groups), and SHALL state "showing FIRST–LAST of M". The current page SHALL be marked, Previous SHALL be unavailable on the first page and Next on the last, a change of filters SHALL return to the first page, and no page buttons SHALL appear when the records fit on one page.

#### Scenario: Paging
- **WHEN** 333 records are filtered and the table is shown
- **THEN** 10 rows appear with "showing 1–10 of 333" and 34 pages, and activating Next shows rows 11 to 20

#### Scenario: Last page
- **WHEN** the last page is shown
- **THEN** it holds the remaining 3 rows with "showing 331–333 of 333" and Next is unavailable

#### Scenario: Changing a filter
- **WHEN** a user is on page 3 and changes a filter
- **THEN** the table shows page 1 of the new result

### Requirement: Deep link from an investigation
The map SHALL accept an `investigation` parameter in its address (for example `#/map?investigation=PSI-159`) that preselects the investigation filter. The Investigation detail screen SHALL show a "See on the Coverage map" link only for investigations that have plotted tests. This is Nice-to-have.

#### Scenario: Link from Detail
- **WHEN** a user follows "See on the Coverage map" on PSI-159
- **THEN** the map opens with the investigation filter set to PSI-159 and the count updated
