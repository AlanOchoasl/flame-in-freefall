---
name: nasa-data-sources
description: Rules for finding, using and citing NASA/partner data without inventing anything. Use when selecting datasets, calling a data API, or citing sources.
---

# NASA data sources

- Primary source for this challenge: NASA PSI Combustion Science repository — https://psi.nasa.gov/physci/repo/search?q=combustion (listed in `Recursos/`).
- **Never invent** datasets, endpoints, query parameters, file formats or field names. Inspect the real files/pages first and write down what you actually saw (format, size, units, license/terms).
- If the PSI repository has no API, don't assume one: use downloaded files, document how they were obtained, and keep only small samples in `data/sample/`.
- Each dataset entry in the docs records: name, official link, access date, format, units, size, usage terms.
- Cache what the demo needs; the demo must work with no network.
- Respect each site's data-use terms; NASA does not endorse non-US sites.
- Cite every dataset in README, project page and demo (video overlay or slide). Official links only.
- Uncertain figures: say "approximately" and tell the team to verify against the source.
