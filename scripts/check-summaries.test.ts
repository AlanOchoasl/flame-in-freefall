import { describe, expect, it } from "vitest";
import { checkSummaries, extractNumbers, wordCount } from "./lib/check-summaries.ts";
import type { InvestigationSource, SummaryEntry, SummariesFile } from "./lib/types.ts";

const catalog: InvestigationSource[] = [
  {
    accession: "PSI-159",
    title: "Cool Flames Investigation with Gases",
    objectives:
      "Determine the conditions for cool diffusion flames for propane at pressures from 0.25 atm to 5 atm.",
    approach:
      "Spherical diffusion flame tests aboard the ISS observed with cameras, radiometers and thermocouples.",
    hypothesis: "Steady cool diffusion flames exist on spherical burners.",
    earthBenefits: "Improves cool flame kinetics and engine efficiency by 60%.",
  },
  {
    accession: "PSI-25",
    title: "Burning and Suppression of Solids - II",
    objectives: "Study burning and suppression of solid materials in microgravity.",
    approach: "Burn solid samples in the Microgravity Science Glovebox.",
    hypothesis: "Airflow changes flammability limits.",
    earthBenefits: "Informs spacecraft material selection.",
  },
];

function validEntry(overrides: Partial<SummaryEntry> = {}): SummaryEntry {
  return {
    accession: "PSI-159",
    summary:
      "The investigation tests cool diffusion flames with propane at pressures between 0.25 and 5 atm on the International Space Station.",
    fireSafetyRelevance:
      "The work informs flame fundamentals for fire safety in crewed spacecraft cabins.",
    aiGenerated: true,
    model: "gemini-3.6-flash",
    generatedAt: "2026-11-14",
    promptVersion: "1.0.0",
    sourceFields: ["objectives", "approach", "hypothesis", "earthBenefits"],
    reviewed: true,
    ...overrides,
  };
}

function fileWith(entries: SummaryEntry[], schemaVersion = "1.0.0"): SummariesFile {
  return { schemaVersion, entries };
}

describe("wordCount", () => {
  it("ignores repeated whitespace", () => {
    expect(wordCount("  one   two\nthree ")).toBe(3);
  });
});

describe("extractNumbers", () => {
  it("ignores digits inside chemical formulas and gravity notation", () => {
    expect(extractNumbers("O2 and CO2 in 1g and 0g")).toEqual([]);
  });

  it("extracts standalone numbers and ranges", () => {
    expect(extractNumbers("between 0.25 and 5 atm, from 500-1000 K")).toEqual([
      "0.25",
      "5",
      "500",
      "1000",
    ]);
  });
});

describe("checkSummaries", () => {
  it("accepts a valid reviewed entry", () => {
    const result = checkSummaries(fileWith([validEntry()]), catalog);
    expect(result.issues).toEqual([]);
    expect(result.checked).toBe(1);
  });

  it("flags a number that is not in the source text", () => {
    const result = checkSummaries(
      fileWith([validEntry({ summary: "The study ran 20 tests on the station." })]),
      catalog,
    );
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toMatchObject({
      accession: "PSI-159",
      field: "summary",
    });
    expect(result.issues[0]?.message).toContain("20");
  });

  it("does not treat notation like O2 as an invented number", () => {
    const result = checkSummaries(
      fileWith([
        validEntry({
          summary:
            "Cool flames were observed with cameras and thermocouples; O2 and CO2 levels were recorded on the ISS.",
        }),
      ]),
      catalog,
    );
    expect(result.issues).toEqual([]);
  });

  it("flags an over-length summary", () => {
    const summary = Array.from({ length: 121 }, () => "word").join(" ");
    const result = checkSummaries(fileWith([validEntry({ summary })]), catalog);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.message).toContain("121 words");
  });

  it("flags an unknown accession", () => {
    const result = checkSummaries(fileWith([validEntry({ accession: "PSI-9999" })]), catalog);
    expect(result.issues[0]).toMatchObject({
      accession: "PSI-9999",
    });
    expect(result.issues[0]?.message).toContain("not in the catalog");
  });

  it("flags an empty summary", () => {
    const result = checkSummaries(fileWith([validEntry({ summary: "   " })]), catalog);
    expect(result.issues[0]).toMatchObject({ accession: "PSI-159", field: "summary" });
  });

  it("flags duplicate accessions", () => {
    const result = checkSummaries(fileWith([validEntry(), validEntry()]), catalog);
    expect(result.issues[0]?.message).toContain("duplicate");
  });

  it("flags wrong sourceFields", () => {
    const result = checkSummaries(
      fileWith([validEntry({ sourceFields: ["objectives", "approach"] })]),
      catalog,
    );
    expect(result.issues[0]).toMatchObject({ field: "sourceFields" });
  });

  it("fails strict mode while a summary is unreviewed", () => {
    const result = checkSummaries(fileWith([validEntry({ reviewed: false })]), catalog, {
      strict: true,
    });
    expect(result.issues[0]?.message).toContain("unreviewed");
  });

  it("accepts unreviewed drafts outside strict mode", () => {
    const result = checkSummaries(fileWith([validEntry({ reviewed: false })]), catalog);
    expect(result.issues).toEqual([]);
  });

  it("rejects an unsupported schema major version", () => {
    const result = checkSummaries(fileWith([validEntry()], "2.0.0"), catalog);
    expect(result.issues[0]).toMatchObject({ field: "schemaVersion" });
  });
});
