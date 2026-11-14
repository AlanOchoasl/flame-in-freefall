# Proposal

**Label: Must**

## Why

The statement says the Moon base is expected to run at 30 % O2 or more and 10.2 psi or less, and that PSI's highest-oxygen microgravity tests are in CFI-G (up to 85 % O2). A map of real test conditions against that zone shows where NASA has data and where it does not, which is a concrete insight for fire-safety engineers.

## What Changes

- A Coverage map view: one point per plottable test (O2 % on x, pressure in bar on y), from PSI-159 and PSI-10.
- Overlays: the expected Moon-base zone, Earth air and the spacesuit atmosphere, each labeled with its source.
- Outcome is encoded by color and marker shape; filters for investigation, flame type, fuel and outcome.
- A computed insight panel (how many plotted tests fall in the zone) with honest limits stated.
- A table alternative with the same data, and a CSV download of the filtered rows.

## Capabilities

### New Capabilities
- `coverage-map`: interactive O2 × pressure map of PSI test conditions with the Moon-base zone and data gaps.

### Modified Capabilities
<!-- none -->

## Impact

- New view and pure helper code in `app/`; reads `experiments.json` only.
- Data: PSI-159 https://psi.nasa.gov/physci/repo/data/investigations/PSI-159 and PSI-10 https://psi.nasa.gov/physci/repo/data/investigations/PSI-10.

## Out of scope (No)

Predicting flammability, any model fit, materials flammability limits, partial-gravity data (none in PSI per the statement), tests outside PSI-159 and PSI-10.
