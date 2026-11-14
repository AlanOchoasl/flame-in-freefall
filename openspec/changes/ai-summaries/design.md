# Design

## Context

26 investigations, each with objectives, approach, earth-benefits text (all 26) and hypothesis (25 of 26; PSI-108 lacks one). Objectives run 236–1,265 characters. The team has Gemini access; whether it is the app or an API key is unconfirmed. The 2026 Terms were read by the team and AI use is allowed; the use must be described on the project page. See proposal.md.

## Goals / Non-Goals

**Goals:** summaries a researcher can trust because each one is checkable against the source.
**Non-Goals:** new science, comparisons, or anything from outside the PSI text.

## Decisions

1. **Precomputed, static JSON.** No keys in the browser, no latency, works offline. Alternative (live calls): fragile demo and an exposed key.
2. **Two generation paths, same output file:** (a) paste drafts from the Gemini app into `data/ai/summaries.draft.json`; (b) a script using an API key from `.env` (ignored by git). The script is **not written until the team confirms API access** and someone reads Google's current documentation for the model name, limits and output format. Nothing about the API is assumed here.
3. **Prompt kept at `prompts/summary.md`**, versioned (`promptVersion`), one investigation per call, English output in plain language for students and engineers.
4. **Numeric guard:** extract numbers from the summary and require each to appear in the source text; strict and cheap, catches the most dangerous invention. It does not catch wrong words, so human review is required.
5. **Review:** a person reads each summary against the source and sets `reviewed: true`; about 26 reviews, a few minutes each.
6. **Check script in Node + TypeScript** (same setup as the other builds), run before every commit of `summaries.json` and in strict mode before submission.

Data flow: `catalog.json` text → prompt → Gemini → draft JSON → check script → human review → `data/processed/summaries.json` → app.

## Risks / Trade-offs

- [AI states something not in the text] → numeric guard, review gate, fallback to PSI text.
- [Review not finished in time] → unreviewed label stays visible; only reviewed ones are promoted in the demo; the rest fall back to PSI text.
- [Gemini access turns out to be app-only] → path (a) needs no key.
- [A reviewer approves without reading] → the label says "reviewed", so the team must mean it.
- [Free-tier limits or model names differ from assumptions] → read the docs first; fall back to path (a).

## Open Questions

- App or API access, and which model: decided by the team after reading Google's documentation. It does not change the specs.
