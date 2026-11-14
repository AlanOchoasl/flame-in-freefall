import { SOURCE_FIELDS } from "./types.ts";
import type {
  CheckIssue,
  CheckOptions,
  CheckResult,
  InvestigationSource,
  SummaryEntry,
} from "./types.ts";

const DEFAULT_MAX_WORDS = { summary: 120, fireSafetyRelevance: 60 };
const SUPPORTED_MAJOR_VERSION = 1;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function wordCount(value: string): number {
  const trimmed = value.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u00A0/g, " ");
}

/**
 * Extracts standalone numbers. Digits inside words or formulas (O2, CO2,
 * C2H4, 1g) are ignored on purpose: they are notation, not claims.
 */
export function extractNumbers(value: string): string[] {
  const normalized = normalizeText(value).replace(/(\d),(?=\d{3}\b)/g, "$1");
  return [...normalized.matchAll(/(?<![A-Za-z0-9])\d+(?:[.,]\d+)?(?![A-Za-z0-9])/g)].map(
    (match) => match[0],
  );
}

function canonicalNumber(value: string): string {
  const withoutThousands = value.replace(/,(?=\d{3}\b)/g, "");
  return withoutThousands.replace(",", ".").replace(/^(-?)0+(?=\d)/, "$1");
}

function numberSet(values: string[]): Set<string> {
  return new Set(values.map(canonicalNumber));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function schemaMajorVersion(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = /^(\d+)\./.exec(value);
  return match ? Number(match[1]) : null;
}

function sourceText(investigation: InvestigationSource): string {
  return [
    investigation.title,
    investigation.objectives,
    investigation.approach,
    investigation.hypothesis,
    investigation.earthBenefits,
  ].join("\n");
}

function checkNumbers(
  entry: SummaryEntry,
  investigation: InvestigationSource,
  issues: CheckIssue[],
): void {
  const allowed = numberSet([
    ...extractNumbers(sourceText(investigation)),
    ...extractNumbers(investigation.accession),
  ]);

  for (const field of ["summary", "fireSafetyRelevance"] as const) {
    for (const found of extractNumbers(entry[field])) {
      if (!allowed.has(canonicalNumber(found))) {
        issues.push({
          accession: entry.accession,
          field,
          message: `number "${found}" does not appear in the investigation's source text`,
        });
      }
    }
  }
}

function checkSourceFields(value: unknown, entry: SummaryEntry, issues: CheckIssue[]): void {
  if (!Array.isArray(value)) {
    issues.push({
      accession: entry.accession,
      field: "sourceFields",
      message: "must be an array of source field names",
    });
    return;
  }

  const actual = value.filter((item): item is string => typeof item === "string");
  const expected = new Set<string>(SOURCE_FIELDS);
  const unique = new Set(actual);

  if (
    actual.length !== SOURCE_FIELDS.length ||
    unique.size !== actual.length ||
    actual.some((item) => !expected.has(item))
  ) {
    issues.push({
      accession: entry.accession,
      field: "sourceFields",
      message: `must list exactly: ${SOURCE_FIELDS.join(", ")}`,
    });
  }
}

/**
 * Validates a summaries file against the catalog. Pure: no filesystem access,
 * so it can be unit-tested and reused by the generation script.
 */
export function checkSummaries(
  file: unknown,
  catalog: InvestigationSource[],
  options: CheckOptions = {},
): CheckResult {
  const maxWords = options.maxWords ?? DEFAULT_MAX_WORDS;
  const issues: CheckIssue[] = [];
  const byAccession = new Map(catalog.map((item) => [item.accession, item]));

  if (!isObject(file)) {
    return {
      checked: 0,
      issues: [{ accession: "(file)", message: "summaries file must be a JSON object" }],
    };
  }

  const major = schemaMajorVersion(file.schemaVersion);
  if (major === null || major !== SUPPORTED_MAJOR_VERSION) {
    issues.push({
      accession: "(file)",
      field: "schemaVersion",
      message: `unsupported schemaVersion "${String(file.schemaVersion)}"; expected major ${SUPPORTED_MAJOR_VERSION}.x`,
    });
  }

  if (!Array.isArray(file.entries)) {
    issues.push({
      accession: "(file)",
      field: "entries",
      message: "must be an array",
    });
    return { checked: 0, issues };
  }

  if (file.entries.length === 0) {
    issues.push({
      accession: "(file)",
      field: "entries",
      message: "has no summaries; run the generation script first",
    });
  }

  const seen = new Set<string>();

  for (const raw of file.entries) {
    if (!isObject(raw)) {
      issues.push({ accession: "(unknown)", message: "entry must be an object" });
      continue;
    }

    const entry = raw as unknown as SummaryEntry;
    const accession = typeof entry.accession === "string" ? entry.accession : "(unknown)";

    if (!isNonEmptyString(entry.accession)) {
      issues.push({ accession, field: "accession", message: "must be a non-empty string" });
      continue;
    }

    if (seen.has(accession)) {
      issues.push({ accession, message: "duplicate accession" });
      continue;
    }
    seen.add(accession);

    const investigation = byAccession.get(accession);
    if (!investigation) {
      issues.push({
        accession,
        message: "accession is not in the catalog",
      });
      continue;
    }

    for (const field of ["summary", "fireSafetyRelevance"] as const) {
      const value = entry[field];
      if (!isNonEmptyString(value)) {
        issues.push({
          accession,
          field,
          message: "must be a non-empty string",
        });
        continue;
      }

      const words = wordCount(value);
      if (words > maxWords[field]) {
        issues.push({
          accession,
          field,
          message: `${words} words, maximum is ${maxWords[field]}`,
        });
      }
    }

    if (entry.aiGenerated !== true) {
      issues.push({
        accession,
        field: "aiGenerated",
        message: "must be true; every stored summary is AI-generated",
      });
    }

    if (typeof entry.reviewed !== "boolean") {
      issues.push({
        accession,
        field: "reviewed",
        message: "must be a boolean",
      });
    }

    if (!isNonEmptyString(entry.model)) {
      issues.push({
        accession,
        field: "model",
        message: "must name the model used",
      });
    }

    if (!isNonEmptyString(entry.promptVersion)) {
      issues.push({
        accession,
        field: "promptVersion",
        message: "must name the prompt version",
      });
    }

    if (!isNonEmptyString(entry.generatedAt) || !ISO_DATE.test(entry.generatedAt)) {
      issues.push({
        accession,
        field: "generatedAt",
        message: "must be an ISO date (YYYY-MM-DD)",
      });
    }

    checkSourceFields(entry.sourceFields, entry, issues);

    if (isNonEmptyString(entry.summary) && isNonEmptyString(entry.fireSafetyRelevance)) {
      checkNumbers(entry, investigation, issues);
    }

    if (options.strict && entry.reviewed !== true) {
      issues.push({
        accession,
        field: "reviewed",
        message: "unreviewed summary; a person must read it before submission",
      });
    }
  }

  return { checked: file.entries.length, issues };
}

export function formatIssues(issues: CheckIssue[]): string {
  return issues
    .map((issue) => {
      const field = issue.field ? ` ${issue.field}` : "";
      return `  ${issue.accession}${field}: ${issue.message}`;
    })
    .join("\n");
}
