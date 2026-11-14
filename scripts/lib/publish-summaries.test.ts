import { describe, expect, it } from "vitest";
import { leftOut, reviewedOnly } from "./publish-summaries.ts";
import type { SummariesFile, SummaryEntry } from "./types.ts";

function entry(accession: string, reviewed: boolean): SummaryEntry {
  return {
    accession,
    summary: "A summary.",
    fireSafetyRelevance: "A relevance note.",
    aiGenerated: true,
    model: "test-model",
    generatedAt: "2026-11-14",
    promptVersion: "1.0.0",
    sourceFields: ["objectives"],
    reviewed,
  };
}

const file: SummariesFile = {
  schemaVersion: "1.0.0",
  entries: [entry("PSI-10", true), entry("PSI-20", false), entry("PSI-21", true)],
};

describe("publishing summaries", () => {
  it("keeps only reviewed entries, in order, with the schema version", () => {
    const published = reviewedOnly(file);
    expect(published.schemaVersion).toBe("1.0.0");
    expect(published.entries.map((e) => e.accession)).toEqual(["PSI-10", "PSI-21"]);
  });

  it("lists the unreviewed accessions that were left out", () => {
    expect(leftOut(file)).toEqual(["PSI-20"]);
  });

  it("does not modify the draft file", () => {
    reviewedOnly(file);
    expect(file.entries).toHaveLength(3);
  });
});
