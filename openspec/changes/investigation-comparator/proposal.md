# Proposal

**Label: Must**

## Why

The statement asks users to see "similarities and differences between different investigations" and how tests within one differ. Reading 26 PSI pages side by side is exactly the overload the challenge describes.

## What Changes

- A Compare view: pick 2–3 investigations and see them in one table (objectives, platform, hardware, fuel phase, topics, measurements, test conditions, dates, related investigations, earth benefits).
- Rows where all selected values match are marked "same"; differing rows are marked.
- Missing values show a dash with the reason; unreviewed curated values are marked.
- The selection lives in the URL, so a comparison can be shared.

## Capabilities

### New Capabilities
- `investigation-comparison`: side-by-side comparison of 2–3 PSI investigations.

### Modified Capabilities
<!-- none -->

## Impact

- New Compare view and pure comparison logic with tests in `app/`.
- Reads `catalog.json`, `experiments.json` (per-investigation ranges), and `summaries.json` (optional).

## Out of scope (No)

Comparing individual tests, statistical analysis, more than three investigations, editing data.
