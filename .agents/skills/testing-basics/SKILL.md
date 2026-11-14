---
name: testing-basics
description: Pragmatic testing rules for a 48h hackathon. Use when deciding what to test or adding tests.
---

# Testing basics

- Test only what protects the demo path: data parsing, core calculations/unit conversions, and one end-to-end smoke check (pipeline runs on `data/sample/`).
- Write the test first for parsing/calculation bugs; reproduce, then fix.
- Tests must run offline and fast (< 30 s), using cached samples — never live network.
- Use the stack's standard runner (pytest / vitest / etc.); no custom frameworks.
- Don't chase coverage numbers. A failing test that is skipped to get green is not allowed — fix it or delete it with a reason.
- Before each milestone (Sat 20:00, Sun 12:00, Sun 16:00 freeze): run the smoke check and open the deployed URL manually.
