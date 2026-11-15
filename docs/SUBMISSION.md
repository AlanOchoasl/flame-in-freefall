# Project page: text for the NASA Space Apps submission

Drafts for the fields of the project page (https://www.spaceappschallenge.org/resources/project-submission-guide/). Everything must be **in English**. The numbers below are computed from the committed data files (26 investigations, 25 reviewed summaries, 333 tests, 165 combinations of oxygen and pressure, 48 tests in the expected Moon-base zone, 41 of them with ignition); check them again if the data changes.

Before pasting, fill the two marks in **[BRACKETS]**: the demo link and the logo sentence in "Use of SI". The form's character limits are not known; each block is written so it can be cut from the bottom.

## 1. Project Name

Flame in Freefall: a fire-safety explorer for NASA's microgravity combustion data

## 2. High-Level Project Summary

NASA has published decades of microgravity combustion experiments in its PSI repository, but the results sit in dozens of separate records that are hard to find, compare and read for fire safety. Flame in Freefall is a free, open-source web explorer that puts 26 PSI investigations in one research console. It ranks them by relevance for four environments (crew cabin, lunar base or pressurized rover, fire detection, fire suppression), compares up to three side by side, and maps 333 real flame tests by oxygen and pressure against the expected Moon-base atmosphere, showing where data exists and where it does not. Every AI-written summary is labeled and reviewed by a person. It matters because fire safety in crewed spacecraft and Moon bases depends on this evidence.

## 3. Link to Project Demo

[PASTE THE PUBLIC LINK OF THE DEMO HERE. It must open without login, password or registration; test it in a private window.]

## 4. Link to Final Project

- Live app: https://alanochoasl.github.io/flame-in-freefall/
- Source code (Apache-2.0): https://github.com/AlanOchoasl/flame-in-freefall

## 5. Detailed Project Description

**What it does.** One page, three tools, and a detail page for every investigation:

- **Relevance ranking.** Orders the 26 investigations for the chosen environment. Every score shows its breakdown and the quote from the challenge statement behind each weight. It is a team heuristic, not a NASA rating, and the app says so.
- **Coverage map.** Each circle is one combination of oxygen and pressure; its size is the number of tests there and its slices are how they ended (ignited, no ignition, flash only). The dashed area is the expected Moon-base atmosphere (30 % oxygen or more, 10.2 psi or less, about 0.70 bar). 48 of the 333 tests fall inside it, and the flame ignited in 41 of them. Empty areas mean "not tested", never "safe". Tapping a circle says whether it is inside the zone and why, and lists its tests. Filters and a table view (10 rows per page) are included.
- **Comparison.** Two or three investigations side by side, with "same" and "differs" marks, and a visible reason wherever a value is missing.
- **Investigation detail.** Objective, approach, measurements, test ranges, ranking position in each environment, related investigations and the citation with its DOI.
- **About.** Sources, licenses, how AI was used and the known limits.

**How it works.** A static web app (React and TypeScript) with no backend. A build pipeline normalizes the PSI catalog and the experimental tables into versioned JSON files; a single data-access module reads them and fails with a clear message per file. The ranking, the map and the comparison are computed in the browser by ordinary, tested code. The app makes no request outside its own origin, calls no AI service while running, and works offline through a service worker. It was specified first with OpenSpec and has more than 350 automated tests.

**What we hope to achieve.** To make NASA's combustion evidence easier to find, compare and question, and to be honest about what it does not cover. The data, the code and the specifications are open, and `docs/EXTENDING.md` explains how to add a new investigation, a table or an environment profile.

**Limits we state in the app.** Only one investigation (PSI-159) has normalized test tables with a declared open license, so the map shows its 333 tests. They burn gaseous fuels (ethane, butane, propane), not spacecraft materials, and PSI holds no partial-gravity combustion data, so none of the points is a Moon-gravity test. The Moon-base zone comes from the challenge statement and is expected, not final. The tables of PSI-10 are not used because it declares no license.

**Tools.** React 19, TypeScript, Vite, Recharts, Lucide icons, a hand-written service worker, Vitest, Node.js scripts, OpenSpec, GitHub Actions and GitHub Pages; the Gemini API for the summaries; the Claude Code assistant for development. Fonts: Inter, Space Grotesk and JetBrains Mono (SIL Open Font License), bundled with the app.

## 6. Use of Super Intelligence (SI)

- **Code, tests and documents.** An AI coding assistant (Claude Code, by Anthropic) helped write much of the code, the automated tests, the OpenSpec specifications and the documentation. The team chose what to build, ran the tests and the license checks, and reviewed and merged every change. Commits carry a "Co-Authored-By" line that records it.
- **Data: plain-language summaries.** 25 summaries and fire-safety notes were drafted with Google Gemini (`gemini-3.6-flash`, prompt version 1.0.0, `prompts/summary.md`) from each investigation's own PSI text only. A script rejects any number that is not in the source and any text over the length limit, and a person read every summary against its source before it was published. The app labels each one "AI-generated (model), reviewed by a person". The model, date, prompt version and source fields are stored in `data/processed/summaries.json`.
- **Images.** [LOGO SENTENCE: write it after Pipo's decision. If the logos stay: "The project logos in app/public/branding/ were generated with an AI tool; their C2PA metadata says so and they carry a visible AI-generated mark." If they are replaced: "No image in the project was generated with AI."]
- **Team-only aid.** A Spanish reading aid used to review the summaries was produced by an AI assistant. It is not part of the app.
- **What SI did not do.** It did not come up with the idea. The test data, the totals, the map, the ranking and the comparison come from NASA PSI tables and ordinary code, and no AI runs inside the app. No NASA logo or mark was generated or modified.

## 7. NASA Data

- **NASA Physical Sciences Informatics (PSI), Combustion Science repository** (https://psi.nasa.gov/physci/repo/search?q=combustion): the 26 investigation records returned by its search (title, objectives, approach, hypothesis, hardware, dates, related investigations, DOI), each linked to its PSI page.
- **PSI-159 experimental tables** ("Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases", DOI 10.60555/cyt1-kh64, license CC0-1.0): 333 tests with oxygen, pressure, fuel, flame type, ignition outcome and calculated flame temperature. This is the data behind the coverage map.
- **NASA Space Apps 2026 challenge statement, "Flame in Freefall":** the expected Moon-base atmosphere, the Earth-air and spacesuit references, and the rationale quoted in the ranking.
- **Not used:** the tables of PSI-10 (DOI 10.60555/w4zy-bt45), because PSI declares no license for them.

## 8. Space Agency Partner Data and Other References

No Space Agency Partner data was used.

**Data**
- NASA PSI Combustion Science repository: https://psi.nasa.gov/physci/repo/search?q=combustion. The 26 investigations and their DOIs are in the appendix below, in the About screen of the app and in `data/processed/catalog.json`.
- NASA Space Apps Challenge 2026, challenge "Flame in Freefall" (official statement).

**Software** (all free and open source; the full list of 79 packages and licenses is in `THIRD_PARTY_LICENSES.md`)
- React and React DOM 19 (MIT), Recharts 3 (MIT), Lucide React (ISC; some icons carry Feather's MIT attribution), Vite 8 (MIT), TypeScript 7 (Apache-2.0), Vitest 5 (MIT).
- Fonts bundled locally: Inter, Space Grotesk and JetBrains Mono (SIL Open Font License 1.1).

**AI and services**
- Google Gemini API, model `gemini-3.6-flash`, for the summaries (see "Use of SI").
- Claude Code (Anthropic), development assistant.
- GitHub, GitHub Actions and GitHub Pages, for the repository, the build and the hosting.

**Images and text.** No third-party image, audio or video is included. The project logos are described in "Use of SI". All text in the app is written by the team, produced by the labeled summaries or quoted from NASA PSI and the challenge statement.

**Project license.** Apache-2.0 (`LICENSE`).

## Appendix: the 26 PSI investigations and their DOIs

| Accession | Title | DOI |
|---|---|---|
| PSI-10 | Advanced Combustion via Microgravity Experiments / Flame Design | 10.60555/w4zy-bt45 |
| PSI-20 | Advanced Combustion via Microgravity Experiments - Burning Rate Emulator | 10.60555/vb93-3y72 |
| PSI-21 | Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame | 10.60555/23e1-9950 |
| PSI-22 | Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames | 10.60555/se5a-8c73 |
| PSI-23 | Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames | 10.60555/k57n-p030 |
| PSI-25 | Burning and Suppression of Solids - II | 10.60555/4qc4-de67 |
| PSI-26 | Burning and Suppression of Solids | 10.60555/58h4-dy80 |
| PSI-39 | Cool Flames Investigation | 10.60555/m6pj-a914 |
| PSI-47 | Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2 | 10.60555/ztgj-d202 |
| PSI-60 | Computational and Experimental Analysis of SPICE Data Sets | 10.60555/mzjm-yv57 |
| PSI-62 | Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography | 10.60555/e9xp-ex83 |
| PSI-68 | Flame Extinguishment Experiment - 2 | 10.60555/byp8-h018 |
| PSI-69 | Flame Extinguishment Experiment | 10.60555/mbq8-0451 |
| PSI-98 | Spacecraft Fire Safety Experiment-I | 10.60555/0t15-1z43 |
| PSI-99 | Spacecraft Fire Experiment-II | 10.60555/2chp-m469 |
| PSI-100 | Spacecraft Fire Experiment-III | 10.60555/040q-4h36 |
| PSI-101 | Smoke Aerosol Measurement Experiment-Reflight | 10.60555/2np7-jv14 |
| PSI-102 | Smoke and Aerosol Measurement Experiment | 10.60555/gd4k-8h62 |
| PSI-106 | Structure and Liftoff In Combustion Experiment | 10.60555/pm12-rg61 |
| PSI-107 | Smoke Point In Co-flow Experiment | 10.60555/9kbh-e962 |
| PSI-108 | Surface Tension Driven Convection Experiment-1 | 10.60555/j1z3-bw42 |
| PSI-115 | Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity | 10.60555/q0v5-1v28 |
| PSI-117 | Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis | 10.60555/gz0q-b577 |
| PSI-142 | Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames | 10.60555/80qf-vj95 |
| PSI-159 | Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases | 10.60555/cyt1-kh64 |
| PSI-181 | Structure and Properties of Pb-Sn and Pb-free Sn-Ag-Cu Solders Produced in Terrestrial vs. Microgravity Environments under Extremes of Elevated and Cryo Temperatures | 10.60555/td9e-cz97 |

## Checklist from the submission guide

- [ ] Demo is a video of 30 seconds or less, or a deck of at most 7 slides including the title slide; in English (a video may be in another language only with English subtitles); public link tested in a private window.
- [ ] A deck names the team, its members and the challenge.
- [ ] No image, video, audio or likeness of anyone under 18, and no NASA logo or mark in the demo.
- [ ] Every field above pasted, in English.
- [ ] "Terms and Conditions" and "Confirm All Work is Original" ticked.
- [ ] "Submit for Judging" pressed and the confirmation banner seen before Sunday 15 November, 23:59 (local time of the Local Event). The page can be edited and sent again until then; only the last saved version is judged.
