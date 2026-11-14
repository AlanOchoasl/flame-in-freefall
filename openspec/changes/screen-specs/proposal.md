# Proposal

**Label: Must**

## Why

The view changes (ranking, comparator, coverage map, summaries) and `app-shell` define behavior, data and rules, but no change says what each screen contains, in what order, or what it shows while loading, empty or broken. Investigation detail has no content spec at all. Without screen-level specs three people will each invent their own layout and the demo will look inconsistent.

## What Changes

- One screen spec per route: Ranking, Compare, Coverage map, Investigation detail, About, Not found.
- Each spec lists the content blocks in order, the states (loading, file failed, empty result, normal), the 360 px layout and the keyboard order.
- Records two routing decisions: `#/` redirects to Ranking, and About lives at `#/about`.
- A low-fidelity wireframe (text) per screen in `design.md`, so the team can build without a design tool.
- Behavior already specified elsewhere is referenced, not repeated.

## Capabilities

### New Capabilities
- `screen-layouts`: content blocks, states, responsive and keyboard behavior of every dashboard screen, plus the home and About routes.

### Modified Capabilities
<!-- none; app-shell is reconciled by task 4.1 instead of editing its delta here -->

## Impact

- Docs only until the views are built; then guides `app/` view components and the shared layout.
- Depends on: `app-shell`, `investigation-ranking`, `investigation-comparator`, `coverage-map`, `ai-summaries`, `investigation-catalog`.
- Source for tone and scope: `Recursos/Enunciado oficial - Flame in Freefall.md`.

## Out of scope (No)

Brand identity, final colors and typography, illustrations or NASA logos, animations, dark mode, a landing/marketing page, any new data field, any change to scoring, comparison or map behavior.
