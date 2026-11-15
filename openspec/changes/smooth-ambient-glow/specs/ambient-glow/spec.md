## ADDED Requirements

### Requirement: Soft decorative background
The ambient glow SHALL fade to transparent before its rectangular boundary in both themes and SHALL NOT intercept input or change page layout.

#### Scenario: Glow moves behind the dashboard
- **WHEN** the decorative glow travels across the viewport
- **THEN** it has soft elliptical edges and continuous turns without hard rectangular seams

### Requirement: Motion preferences
The glow SHALL remain stationary when reduced motion is requested and SHALL pause while the document is hidden.

#### Scenario: Reduced motion is enabled
- **WHEN** the user enables reduced motion
- **THEN** animation stops and a soft stationary glow remains visible
