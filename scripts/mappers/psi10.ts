import { cleanNumber, type DataQualityEntry } from '../clean-number.ts';
import type { CsvRow } from '../read-csv.ts';
import type { ExperimentRecord, FlameType, Mapper } from '../experiment-record.ts';

const ACCESSION = 'PSI-10';
const PAGE_URL = `https://psi.nasa.gov/physci/repo/data/investigations/${ACCESSION}`;
const BAR_PER_ATM = 1.01325;
const BAR_DECIMALS = 7;

// The normal-flame table names its fuel by chemical formula.
const SPECIES_OF_FORMULA: Record<string, string> = { C2H4: 'ethylene', C3H8: 'propane' };

function atmToBar(atm: number | null): number | null {
  return atm === null ? null : Number((atm * BAR_PER_ATM).toFixed(BAR_DECIMALS));
}

// What differs between the two PSI-10 tables; the rest (pressure in atm, Tad, Zst, no outcome) is shared.
interface Table {
  flameType: FlameType;
  o2Column: string;
  /** "XO2 (final)": O2 at the end of the test. The inverse table has none. */
  o2AfterColumn: string | null;
  fuelOf: (row: CsvRow) => ExperimentRecord['fuel'];
}

const INVERSE: Table = {
  flameType: 'inverse',
  o2Column: 'XO2',
  o2AfterColumn: null,
  // The table has no fuel column; its headers name the fuel fraction XC2H4 (ethylene).
  fuelOf: () => ({ species: 'ethylene', raw: 'XC2H4', inferred: true }),
};

const NORMAL: Table = {
  flameType: 'normal',
  o2Column: 'XO2 (init)',
  o2AfterColumn: 'XO2 (final)',
  fuelOf: (row) => {
    const formula = (row.Fuel ?? '').trim();
    return { species: SPECIES_OF_FORMULA[formula] ?? null, raw: formula, inferred: false };
  },
};

function mapRow(table: Table, row: CsvRow): ExperimentRecord {
  const issues: DataQualityEntry[] = [];
  const number = (column: string, field: string): number | null => {
    const { value, issue } = cleanNumber(row[column], field);
    if (issue) issues.push(issue);
    return value;
  };

  return {
    id: `${ACCESSION}:${row.Test.replace(/\s+/g, '')}`,
    accession: ACCESSION,
    flameType: table.flameType,
    fuel: table.fuelOf(row),
    o2Fraction: number(table.o2Column, 'o2Fraction'),
    o2FractionAfterTest: table.o2AfterColumn === null ? null : number(table.o2AfterColumn, 'o2FractionAfterTest'),
    pressureBar: atmToBar(number('pmean (atm)', 'pressureBar')),
    pressureIsApproximate: false,
    tadK: number('Tad (K)', 'tadK'),
    zst: number('mean Zst', 'zst'),
    outcome: 'not-reported',
    coolFlame: { value: null, raw: null },
    selfExtOrFlowTermRaw: null,
    tfpRaw: null,
    pageUrl: PAGE_URL,
    dataQuality: issues,
  };
}

export const psi10InverseMapper: Mapper = {
  accession: ACCESSION,
  filePattern: /^PSI-10_.*Inverse_Flame\.csv$/,
  mapRow: (row) => mapRow(INVERSE, row),
};

export const psi10NormalMapper: Mapper = {
  accession: ACCESSION,
  filePattern: /^PSI-10_.*Normal_Flame\.csv$/,
  mapRow: (row) => mapRow(NORMAL, row),
};
