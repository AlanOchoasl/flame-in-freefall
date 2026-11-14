import { cleanNumber, type DataQualityEntry } from '../clean-number.ts';
import type { CsvRow } from '../read-csv.ts';
import type { ExperimentRecord, Mapper } from '../experiment-record.ts';

const ACCESSION = 'PSI-10';
const PAGE_URL = `https://psi.nasa.gov/physci/repo/data/investigations/${ACCESSION}`;
const BAR_PER_ATM = 1.01325;
const BAR_DECIMALS = 7;

function atmToBar(atm: number | null): number | null {
  return atm === null ? null : Number((atm * BAR_PER_ATM).toFixed(BAR_DECIMALS));
}

function mapInverseRow(row: CsvRow): ExperimentRecord {
  const issues: DataQualityEntry[] = [];
  const number = (column: string, field: string): number | null => {
    const { value, issue } = cleanNumber(row[column], field);
    if (issue) issues.push(issue);
    return value;
  };

  return {
    id: `${ACCESSION}:${row.Test.replace(/\s+/g, '')}`,
    accession: ACCESSION,
    flameType: 'inverse',
    // The table has no fuel column; its headers name the fuel fraction XC2H4 (ethylene).
    fuel: { species: 'ethylene', raw: 'XC2H4', inferred: true },
    o2Fraction: number('XO2', 'o2Fraction'),
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
  mapRow: mapInverseRow,
};
