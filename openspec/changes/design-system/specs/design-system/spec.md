# Spec Delta

## Purpose

Defines the visual tokens and the shared components every screen uses, so the screens look and behave consistently and stay accessible. It does not repeat labeling or missing-value rules already in `dashboard-app`; it fixes how they look.

## ADDED Requirements

### Requirement: One token block
The app SHALL define its colors, spacing, radius, type scale, focus ring and target size as CSS custom properties in a single `:root` block in `app/src/styles.css`. The names `--text`, `--background`, `--muted`, `--accent`, `--border`, `--gutter` and `--target-size` SHALL be kept. Component styles SHALL use these properties and SHALL NOT repeat literal color values.

#### Scenario: Changing the accent
- **WHEN** `--accent` is edited in the token block
- **THEN** every accent use on every screen changes with no other edit

#### Scenario: Legacy names intact
- **WHEN** the token block is replaced by the design tokens
- **THEN** the existing About and Investigation detail screens still render with the same property names

### Requirement: System fonts and no external assets
The app SHALL use only system font stacks and SHALL NOT load any font, icon, image or stylesheet from outside its own files. Icons SHALL be Unicode glyphs or inline SVG written in the repository.

#### Scenario: Offline load
- **WHEN** the app is opened with no network after the first load
- **THEN** every screen renders with its final typography and no missing icon

### Requirement: Theme compatibility and reduced motion
The app SHALL support the approved dark and light palettes according to `console-appearance`, while preserving the shared component styling. Transitions SHALL be disabled when the user prefers reduced motion.

#### Scenario: Reduced motion
- **WHEN** the system asks for reduced motion
- **THEN** no transition or animation runs

#### Scenario: Shared components in either palette
- **WHEN** a visitor selects either color theme
- **THEN** shared components remain readable and use the selected theme's semantic tokens

### Requirement: Contrast
Body and label text SHALL have a contrast ratio of at least 4.5:1 against its background. Borders of form controls, map markers, overlays and the focus ring SHALL have at least 3:1 against the surface they sit on. The ratios of the token pairs listed in `design.md` SHALL be re-measured on the shipped CSS and the results recorded.

#### Scenario: Control border
- **WHEN** a select or text input is shown on the surface color
- **THEN** its border is at least 3:1 against that surface

#### Scenario: Measured pairs
- **WHEN** the team runs the contrast check on the shipped tokens
- **THEN** every pair in the design table meets its threshold

### Requirement: Meaning never depends on color alone
Every status SHALL be shown with a text word and, where the component defines one, a glyph, in addition to color. This covers unreviewed, not assessed, approximate, same, differs, both missing, AI-generated, NASA PSI text, error and the four map outcomes.

#### Scenario: Grayscale
- **WHEN** a screen is viewed in grayscale
- **THEN** every status above remains identifiable by its word or glyph

### Requirement: Visible focus
Every interactive element SHALL show a focus ring at least `--focus-width` thick in `--focus`, with a 2 px offset, and no element SHALL remove it without a replacement. Touch targets SHALL be at least `--target-size` high and wide.

#### Scenario: Tabbing
- **WHEN** a user tabs through a screen
- **THEN** each focused control shows the ring

### Requirement: Provenance labels
Text written by AI SHALL carry the AI label (glyph `✦`, text "AI-generated", the model name and the review status) in the AI color pair, set apart from the text by a dashed box. Text copied from NASA PSI SHALL carry the PSI label (glyph `▤`, text "NASA PSI text") in the PSI color pair, set apart by a solid left rule. The two labels SHALL NOT share a style.

#### Scenario: AI summary
- **WHEN** a summary written by AI is shown
- **THEN** it sits in the AI box with the label naming the model and whether a person reviewed it

#### Scenario: PSI fallback
- **WHEN** no AI summary exists and the PSI objectives are shown
- **THEN** they carry the PSI label in the PSI style

### Requirement: Status markers
The app SHALL provide one marker component with these kinds, each with its glyph, word and color: unreviewed (`◐`), not assessed (`⊘`, always followed by the reason), approximate (`≈`), same (`=`), differs (`≠`), both missing. Markers SHALL be text elements readable by assistive technology, not images.

#### Scenario: Not assessed with a reason
- **WHEN** a ranking factor cannot be evaluated
- **THEN** its marker reads "not assessed" followed by the reason

#### Scenario: Marker for assistive technology
- **WHEN** a screen reader reads an unreviewed value
- **THEN** it announces the word "unreviewed", not only a glyph

### Requirement: Missing value display
A missing value SHALL be shown as a dash, the reason text and, for "no normalized test data", a link to the PSI page. The dash glyph SHALL be hidden from assistive technology and the reason SHALL be read. This follows `dashboard-app`.

#### Scenario: Missing pressure range
- **WHEN** an investigation has no test rows
- **THEN** the pressure row shows the dash, "no normalized test data" and the PSI link

### Requirement: Tag chips
Fuel-phase tags SHALL be rendered as square-cornered chips and topic tags as pill-shaped chips, both with the tag's text, so the two kinds are distinguishable without color.

#### Scenario: Two kinds side by side
- **WHEN** an item shows a fuel phase and two topics
- **THEN** the fuel phase is a square chip and the topics are pills

### Requirement: Data-state block
The shared data-state helper SHALL render four states with fixed looks: loading (`role="status"`, `aria-busy`, no numbers), failed (`role="alert"`, error color and glyph `⚠`, the file name, a "Try again" action and links to the screens that still work), empty (dashed box, what matched nothing, active filters, "Clear filters" action) and normal.

#### Scenario: File failed
- **WHEN** the catalog fails to load
- **THEN** an alert names the catalog file, offers "Try again" and links to Coverage map and About

#### Scenario: Empty filters
- **WHEN** filters match nothing
- **THEN** the empty block lists the active filters and a "Clear filters" button that restores the full list

### Requirement: Count line
Screens with filters SHALL show a count line (for example "14 of 26 investigations" or "442 of 442 tests plotted") in a polite live region so a change in the count is announced.

#### Scenario: Filter applied
- **WHEN** a filter reduces the list
- **THEN** the count line updates and is announced

### Requirement: Score breakdown
The score breakdown SHALL list each factor with `points / max`, its evidence text and, if not assessed, the not-assessed marker with the reason. It SHALL open and close with a button whose state is exposed (`aria-expanded`) and SHALL NOT move focus when toggled.

#### Scenario: Opening the breakdown
- **WHEN** a user activates "Breakdown" on a ranked item
- **THEN** the factors appear below it and focus stays on the button

### Requirement: Citation block
The citation block SHALL show the PSI page link and the DOI when known, and "DOI not recorded" otherwise. A placeholder DOI SHALL NOT be shown.

#### Scenario: DOI unknown
- **WHEN** an investigation has no DOI in the catalog
- **THEN** the block says the DOI is not recorded and still shows the PSI link

### Requirement: Responsive header
The header SHALL show the app name and the navigation inline at 640 px and wider. Below 640 px the navigation SHALL collapse behind a "Menu" button with `aria-expanded` and `aria-controls`, the skip link SHALL remain the first focusable element, and the current screen SHALL stay marked in the opened menu.

#### Scenario: Phone width
- **WHEN** the viewport is 360 px wide
- **THEN** the header shows the app name and a Menu button, and activating it reveals the four navigation links

### Requirement: Mockup scaffolding is not shipped
The "MOCKUP STATES" bar, sample placeholder texts and the mockup's runtime script SHALL NOT appear in `app/`.

#### Scenario: Searching the build
- **WHEN** the built app is searched for "MOCKUP", "sample-placeholder" and "Sample summary text"
- **THEN** none is found
