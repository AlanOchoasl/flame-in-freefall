import type { InvestigationSource, SummaryEntry, SummariesFile } from "./types.ts";

export interface GeneratedText {
  summary: string;
  fireSafetyRelevance: string;
}

export const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
      description: "Plain-language summary, at most 120 words.",
    },
    fireSafetyRelevance: {
      type: "string",
      description: "Fire-safety relevance note, at most 60 words.",
    },
  },
  required: ["summary", "fireSafetyRelevance"],
} as const;

export function fillPrompt(template: string, investigation: InvestigationSource): string {
  const values: Record<string, string> = {
    title: investigation.title,
    objectives: investigation.objectives,
    approach: investigation.approach,
    hypothesis: investigation.hypothesis,
    earthBenefits: investigation.earthBenefits,
  };

  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, key: string) => {
    if (!(key in values)) {
      throw new Error(`Unknown prompt placeholder ${placeholder}`);
    }
    return values[key] ?? "";
  });
}

export function parseModelOutput(value: string | undefined): GeneratedText {
  if (!value || value.trim().length === 0) {
    throw new Error("the model returned no text");
  }

  const cleaned = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const parsed: unknown = JSON.parse(cleaned);

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("the model output is not a JSON object");
  }

  const record = parsed as Record<string, unknown>;
  if (typeof record.summary !== "string" || typeof record.fireSafetyRelevance !== "string") {
    throw new Error("the model output must contain summary and fireSafetyRelevance strings");
  }

  return {
    summary: record.summary.trim(),
    fireSafetyRelevance: record.fireSafetyRelevance.trim(),
  };
}

export interface MergeResult {
  file: SummariesFile;
  keptReviewed: string[];
}

/**
 * Merges generated entries by accession. Reviewed entries survive unless
 * `force` is set, so regenerating never destroys human review work.
 */
export function mergeEntries(
  existing: SummariesFile,
  generated: SummaryEntry[],
  catalog: InvestigationSource[],
  force: boolean,
): MergeResult {
  const entries = new Map(existing.entries.map((entry) => [entry.accession, entry]));
  const keptReviewed: string[] = [];

  for (const entry of generated) {
    const previous = entries.get(entry.accession);
    if (previous?.reviewed && !force) {
      keptReviewed.push(entry.accession);
      continue;
    }
    entries.set(entry.accession, entry);
  }

  const order = new Map(catalog.map((item, index) => [item.accession, index]));
  const sorted = [...entries.values()].sort((left, right) => {
    const leftIndex = order.get(left.accession) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = order.get(right.accession) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex || left.accession.localeCompare(right.accession);
  });

  return {
    file: { schemaVersion: existing.schemaVersion, entries: sorted },
    keptReviewed,
  };
}
