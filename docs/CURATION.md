# Curation guide — first 13 investigations (task 4.1)

Scope: `fuelPhase`, `topics` and `measurements` for the first 13 accessions in
catalog order. `hardwareGroup` belongs to task 3.3 and is intentionally not
filled here.

Files:

- `data/curation/investigations.curation.json` — hand-edited values.
- `data/curation/vocabularies.json` — allowed values; the build validates them.
- `scripts/check-curation.ts` — pre-build check (accessions, vocabulary, sources).

## Allowed values

- `fuelPhase`: `gas`, `liquid-droplet`, `solid`, `aerosol-dust`, `not-combustion`.
- `topics`: `material-flammability`, `detection`, `suppression`, `flame-fundamentals`, `modeling`, `not-fire-safety`.
- `measurements`: free text, only instruments or diagnostics named in the Approach text.

## Rules

1. Read **Objectives** and **Approach** before setting anything.
2. Put the text that supports the value in `source`: `"Objectives text"`,
   `"Approach text"`, `"Research area: ..."`, etc.
3. Set `reviewed: true` only after reading and agreeing. When in doubt, leave
   it `false`; an unreviewed value is visible, a wrong one is not.
4. Do not invent measurements. A purely computational study may have an empty
   list or a single entry such as `"direct numerical simulation"`.
5. `PSI-181` (Materials Science) and `PSI-108` (Fluid Physics) are **not
   combustion**. Use `not-combustion` and `not-fire-safety`; the ranking lists
   them last by design.
6. Scope of a topic:
   - `material-flammability`: flammability limits, ignition or flame spread over solids.
   - `detection`: smoke, aerosols, particle size, detector response.
   - `suppression`: extinguishing agents, dilution, extinction as a suppression mechanism.
   - `flame-fundamentals`: cool flames, soot, flame structure, droplet or gaseous flame physics.
   - `modeling`: CFD, numerical simulation, kinetic or soot models.
   - `not-fire-safety`: no fire-safety objective stated.

## Suggested reading (verify, do not copy blindly)

| # | Accession | Expected fuel phase | Expected topics | Where to look |
|---|---|---|---|---|
| 1 | PSI-117 | `liquid-droplet` | `flame-fundamentals`, `modeling` | Objectives: n-alkane droplet cool flames; Approach: CFD |
| 2 | PSI-159 | `gas` | `flame-fundamentals`, `modeling` | Objectives: propane/butane/pentane; CFD and kinetics |
| 3 | PSI-10 | `gas` | `flame-fundamentals` | Objectives: C2H4/CH4 soot and extinction limits |
| 4 | PSI-62 | `solid` | `material-flammability`, `modeling` | Approach: PMMA and wax; Objectives: FGM |
| 5 | PSI-60 | `gas` | `flame-fundamentals`, `modeling` | Sub-area Gaseous; Approach: SPICE coflow data |
| 6 | PSI-181 | `not-combustion` | `not-fire-safety` | Research area Materials Science; solder joints |
| 7 | PSI-142 | `gas` | `flame-fundamentals`, `modeling` | Objectives: ozone-sensitized counterflow flames |
| 8 | PSI-108 | `not-combustion` | `not-fire-safety` | Research area Fluid Physics; thermocapillary flow |
| 9 | PSI-101 | `aerosol-dust` | `detection` | Objectives: smoke particle size and detectors |
| 10 | PSI-115 | `aerosol-dust` | `detection`, `modeling` | Approach: DBP smoke simulation |
| 11 | PSI-98 | `solid` | `material-flammability` | Approach: Sibal fabric; Objectives: flammability limits |
| 12 | PSI-39 | `liquid-droplet` | `flame-fundamentals`, `suppression` | Objectives: n-dodecane and helium dilution |
| 13 | PSI-102 | `aerosol-dust` | `detection` | Objectives: smoke particle size and detector response |

## Check

```powershell
npm run check:curation
npm run check:curation -- --strict   # only before submission, after 4.2
```

It reports how many values are reviewed and unreviewed. `--strict` is expected
to fail until task 4.2 finishes the last 13 accessions.
