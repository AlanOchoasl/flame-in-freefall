# Flame in Freefall — components

Tokens: `:root` block at top of `Flame in Freefall.dc.html` (`--text --background --muted --accent --border --gutter --target-size` kept; added surface, AI/PSI, status, outcome, zone, spacing, radius, type, focus).

- **Shell** (skip link, header + nav with aria-current, h1, footer) — every screen; nav collapses to a Menu button < 640 px.
- **AI label** (dashed violet box, ✦) — Ranking (Lunar, PSI-159), Detail PSI-159.
- **PSI label** (solid left rule, ▤) — Ranking summaries, Compare long-text rows, Detail summary fallback + PSI text.
- **Markers**: ◐ unreviewed, ⊘ not assessed (+reason), ≈ approximate, = same / ≠ differs / both missing — Ranking, Compare, Map details, Detail.
- **Missing value** (— + reason, optional PSI link) — Compare, Detail.
- **Tag chips** (fuel: square, topic: pill) — Ranking.
- **Score breakdown** (points / max + evidence) — Ranking.
- **Data state block** (loading / failed / empty / normal) — Ranking, Map (empty), About (AI failed).
- **Count line** — Ranking, Compare picker, Map.
- **Citation block** — Detail; DOI list — About.
- **Mockup states bar** (dark strip, outside the frame) — width 1280/768/360/fluid + per-screen frames.
