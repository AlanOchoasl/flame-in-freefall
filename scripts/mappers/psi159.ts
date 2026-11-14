import { cleanNumber, type DataQualityEntry } from '../clean-number.ts';
import type { CsvRow } from '../read-csv.ts';
import type { ExperimentRecord, FlameType, Mapper, Outcome } from '../experiment-record.ts';

const ACCESSION = 'PSI-159';
const PAGE_URL = `https://psi.nasa.gov/physci/repo/data/investigations/${ACCESSION}`;
const KNOWN_SPECIES = ['ethane', 'propane', 'butane', 'ethylene'];
const KNOWN_OUTCOMES: string[] = ['yes', 'no', 'flash'];

interface Columns {
  flameType: FlameType;
  o2: string;
  selfExt: string;
}

const NORMAL: Columns = { flameType: 'normal', o2: 'XO2 before test', selfExt: 'Self-ext or flow term' };
const INVERSE: Columns = { flameType: 'inverse', o2: 'XO2', selfExt: 'Self -ext or flow term' };

function textOrNull(value: string | undefined): string | null {
  const text = (value ?? '').trim();
  return text === '' ? null : text;
}

function speciesOf(fuelLabel: string): string | null {
  const label = fuelLabel.toLowerCase();
  return KNOWN_SPECIES.find((species) => label.includes(species)) ?? null;
}

function outcomeOf(raw: string | undefined, issues: DataQualityEntry[]): Outcome | null {
  const text = (raw ?? '').trim().toLowerCase();
  if (text === '') return null;
  if (KNOWN_OUTCOMES.includes(text)) return text as Outcome;
  issues.push({ field: 'outcome', raw: text, reason: 'not-recognized' });
  return null;
}

function coolFlameOf(raw: string | undefined): ExperimentRecord['coolFlame'] {
  const text = textOrNull(raw);
  if (text === null) return { value: null, raw: null };
  const lower = text.toLowerCase();
  if (lower.startsWith('yes')) return { value: true, raw: text };
  if (lower.startsWith('no')) return { value: false, raw: text };
  return { value: null, raw: text };
}

function mapRow(columns: Columns, row: CsvRow): ExperimentRecord {
  const issues: DataQualityEntry[] = [];
  const number = (column: string, field: string): number | null => {
    const { value, issue } = cleanNumber(row[column], field);
    if (issue) issues.push(issue);
    return value;
  };
  const fuelRaw = (row.Fuel ?? '').trim();

  return {
    id: `${ACCESSION}:${row.Test.replace(/\s+/g, '')}`,
    accession: ACCESSION,
    flameType: columns.flameType,
    fuel: { species: speciesOf(fuelRaw), raw: fuelRaw, inferred: false },
    o2Fraction: number(columns.o2, 'o2Fraction'),
    o2FractionAfterTest: columns === NORMAL ? number('XO2 after test', 'o2FractionAfterTest') : null,
    pressureBar: number('approx p (bar)', 'pressureBar'),
    pressureIsApproximate: true,
    tadK: number('Tad (K)', 'tadK'),
    zst: number('Zst', 'zst'),
    outcome: outcomeOf(row['Hot ignition'], issues),
    coolFlame: coolFlameOf(row['Cool flame?']),
    selfExtOrFlowTermRaw: textOrNull(row[columns.selfExt]),
    tfpRaw: textOrNull(row.TFP),
    pageUrl: PAGE_URL,
    dataQuality: issues,
  };
}

export const psi159NormalMapper: Mapper = {
  accession: ACCESSION,
  filePattern: /^PSI-159_.*Normal_Flames\.csv$/,
  mapRow: (row) => mapRow(NORMAL, row),
};

export const psi159InverseMapper: Mapper = {
  accession: ACCESSION,
  filePattern: /^PSI-159_.*Inverse_Flames\.csv$/,
  mapRow: (row) => mapRow(INVERSE, row),
};
