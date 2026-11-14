import type { SummaryEntry } from '../data/types';

export interface AiUseFacts {
  total: number;
  reviewed: number;
  models: string[];
  promptVersions: string[];
  firstGenerated: string | null;
  lastGenerated: string | null;
}

const unique = (values: string[]) => [...new Set(values)].sort();

// Facts for the About screen, read from the summaries file so the text never drifts from the data.
export function summariseAiUse(entries: SummaryEntry[]): AiUseFacts {
  const dates = entries.map((entry) => entry.generatedAt).sort();
  return {
    total: entries.length,
    reviewed: entries.filter((entry) => entry.reviewed).length,
    models: unique(entries.map((entry) => entry.model)),
    promptVersions: unique(entries.map((entry) => entry.promptVersion)),
    firstGenerated: dates[0] ?? null,
    lastGenerated: dates[dates.length - 1] ?? null,
  };
}
