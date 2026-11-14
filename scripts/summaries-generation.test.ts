import { describe, expect, it } from "vitest";
import { fillPrompt, mergeEntries, parseModelOutput } from "./lib/summaries-generation.ts";
import type { InvestigationSource, SummaryEntry, SummariesFile } from "./lib/types.ts";

const investigation: InvestigationSource = {
  accession: "PSI-159",
  title: "Cool Flames Investigation with Gases",
  objectives: "Study cool flames.",
  approach: "Use the ISS.",
  hypothesis: "Cool flames exist.",
  earthBenefits: "Better engines.",
};

const other: InvestigationSource = {
  ...investigation,
  accession: "PSI-25",
  title: "Burning and Suppression of Solids - II",
};

function entry(overrides: Partial<SummaryEntry> = {}): SummaryEntry {
  return {
    accession: "PSI-159",
    summary: "A summary.",
    fireSafetyRelevance: "A relevance note.",
    aiGenerated: true,
    model: "gemini-3.6-flash",
    generatedAt: "2026-11-14",
    promptVersion: "1.0.0",
    sourceFields: ["objectives", "approach", "hypothesis", "earthBenefits"],
    reviewed: false,
    ...overrides,
  };
}

function file(entries: SummaryEntry[]): SummariesFile {
  return { schemaVersion: "1.0.0", entries };
}

describe("fillPrompt", () => {
  it("replaces every source placeholder", () => {
    const prompt = fillPrompt(
      "{{title}}|{{objectives}}|{{approach}}|{{hypothesis}}|{{earthBenefits}}",
      investigation,
    );
    expect(prompt).toBe(
      "Cool Flames Investigation with Gases|Study cool flames.|Use the ISS.|Cool flames exist.|Better engines.",
    );
  });

  it("rejects unknown placeholders", () => {
    expect(() => fillPrompt("{{unknown}}", investigation)).toThrow("Unknown prompt placeholder");
  });
});

describe("parseModelOutput", () => {
  it("parses a plain JSON object", () => {
    expect(
      parseModelOutput('{"summary":"A summary.","fireSafetyRelevance":"A note."}'),
    ).toEqual({ summary: "A summary.", fireSafetyRelevance: "A note." });
  });

  it("parses JSON wrapped in a code fence", () => {
    expect(
      parseModelOutput('```json\n{"summary":"A summary.","fireSafetyRelevance":"A note."}\n```'),
    ).toEqual({ summary: "A summary.", fireSafetyRelevance: "A note." });
  });

  it("rejects empty output and missing fields", () => {
    expect(() => parseModelOutput("   ")).toThrow("no text");
    expect(() => parseModelOutput('{"summary":"only"}')).toThrow("fireSafetyRelevance");
  });
});

describe("mergeEntries", () => {
  it("keeps a reviewed entry unless force is set", () => {
    const existing = file([entry({ reviewed: true })]);
    const result = mergeEntries(existing, [entry({ summary: "New text." })], [investigation], false);
    expect(result.file.entries[0]?.summary).toBe("A summary.");
    expect(result.keptReviewed).toEqual(["PSI-159"]);
  });

  it("replaces a reviewed entry when force is set", () => {
    const existing = file([entry({ reviewed: true })]);
    const result = mergeEntries(existing, [entry({ summary: "New text." })], [investigation], true);
    expect(result.file.entries[0]?.summary).toBe("New text.");
  });

  it("sorts entries in catalog order", () => {
    const existing = file([]);
    const result = mergeEntries(
      existing,
      [entry({ accession: "PSI-25" }), entry({ accession: "PSI-159" })],
      [investigation, other],
      false,
    );
    expect(result.file.entries.map((item) => item.accession)).toEqual(["PSI-159", "PSI-25"]);
  });
});
