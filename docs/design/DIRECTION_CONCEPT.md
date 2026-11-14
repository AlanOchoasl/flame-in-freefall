# Visual direction concept — Flame in Freefall

## Purpose

This concept proposes a more memorable, story-led visual direction for the project. It is a discussion artifact for the team, not a replacement for the current app or its scientific specifications.

## The idea

**Fire behaves differently up here.** Start with the scientific contrast that makes the challenge distinctive: in microgravity, flames do not rise in the familiar way. Then let people explore the PSI investigations and the test conditions that inform fire safety for crewed spacecraft and lunar habitats.

The interface should feel like an editorial science feature connected to a working research tool: dramatic in its opening, precise in its data views. Avoid institutional portal styling and avoid generic science-fiction decoration.

## Visual language

- Deep charcoal opening section, warm paper-like data surfaces, ember orange for emphasis, and cool blue for selected measurement references.
- Large editorial headline and short explanatory copy, balanced with a clear path into the investigation catalog.
- Original CSS or inline-SVG flame motif, abstract and clearly decorative. No NASA logo, NASA imagery, stock photo, external font, or third-party asset.
- Use the existing system font stack and current accessible focus treatment.
- Motion is optional and restrained; honor `prefers-reduced-motion`.
- Keep all interface copy in English. Preserve source links, AI labels, uncertainty markers, and the disclaimer that the project is not an official NASA product.

## Suggested opening screen

1. Compact project identity and navigation.
2. Dark feature panel: **“Fire behaves differently up here.”**
3. One sentence: explore NASA PSI combustion investigations and the conditions they tested to support fire-safety research for human space exploration.
4. Primary action: **Explore investigations**. Secondary action: **See the test conditions**.
5. A real-data preview of oxygen fraction versus pressure. Mark the expected Moon-base zone as described by the challenge statement; label it as an expected range, not a habitat recommendation.
6. A compact evidence strip with counts only after verifying them against the loaded dataset. Link directly to NASA PSI.

## Data views

- **Explore:** investigation list with searchable/filterable study metadata and a clear route to detail pages.
- **Compare:** preserve the side-by-side comparison because the challenge asks users to interpret similarities and differences.
- **Test conditions:** give the oxygen-versus-pressure chart more visual prominence. One point represents one test; retain filters, keyboard-accessible table alternative, and visible data gaps.
- **Investigation detail:** tell each study's story with its PSI objective, approach, conditions, measurements, source link, and DOI.
- Keep ranking as an explainable exploration aid. Label the score as a team-built heuristic, not a NASA assessment.

## Guardrails

- The challenge asks for an SI-powered dashboard that summarizes, ranks, and interprets PSI findings. This concept changes presentation and narrative, not that product scope.
- Never imply that tests cover materials or gravity conditions they do not cover. State the limits next to the visualization and insight.
- Distinguish measured PSI data from challenge-statement reference conditions and team-derived interpretations.
- Cite PSI investigations and DOIs in the product. AI-generated text remains labeled and grounded in source text.
- Reuse existing project dependencies and assets. This concept adds no packages or external resources.

## Team review questions

1. Does the editorial opening make the microgravity-fire problem clearer than the current dashboard-first entry?
2. Should the first action lead to the investigation catalog or the test-condition chart?
3. Does the visual direction feel distinctive while remaining credible for researchers and students?

## Status

Proposed direction for team feedback. Do not treat the static concept page as implementation approval; follow the project's OpenSpec workflow before changing the product UI.
