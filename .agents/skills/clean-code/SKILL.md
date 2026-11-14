---
name: clean-code
description: Clean code rules for this hackathon project. Use when writing, editing or reviewing any source code.
---

# Clean code (hackathon edition)

- Names reveal intent: `parse_burn_rate`, not `proc2`. No abbreviations unless standard in combustion/NASA terms (and then document them).
- Functions do one thing, fit on a screen, take few arguments. Early returns over deep nesting.
- No dead code, no commented-out blocks, no speculative abstractions ("we might need it"). Three similar lines beat a premature helper.
- Separate layers: data loading/parsing → processing → presentation. Presentation never parses raw files.
- Constants for magic numbers/units; always state units in names or docstrings (`temperature_k`, `pressure_kpa`).
- Comments explain *why*, not *what*. Public functions get a one-line docstring.
- Handle errors at boundaries (file/network/user input); fail loudly with a clear message, never swallow exceptions.
- Fix the root cause; don't paper over. But during the event: no big refactors — leave a `TODO(next-steps)` and move on.
- Before committing: formatter/linter clean, no stray prints, no secrets.
