import type { CsvRow } from './read-csv.ts';
import type { DataQualityEntry } from './clean-number.ts';

export type FlameType = 'normal' | 'inverse';
export type Outcome = 'yes' | 'no' | 'flash' | 'not-reported';

export interface ExperimentRecord {
  id: string;
  accession: string;
  flameType: FlameType;
  fuel: { species: string | null; raw: string; inferred: boolean };
  o2Fraction: number | null;
  o2FractionAfterTest: number | null;
  pressureBar: number | null;
  pressureIsApproximate: boolean;
  tadK: number | null;
  zst: number | null;
  outcome: Outcome | null;
  coolFlame: { value: boolean | null; raw: string | null };
  selfExtOrFlowTermRaw: string | null;
  tfpRaw: string | null;
  pageUrl: string;
  dataQuality: DataQualityEntry[];
}

export interface FlaggedRecord extends ExperimentRecord {
  isPlottable: boolean;
  inMoonBaseZone: boolean;
}

export interface Mapper {
  accession: string;
  filePattern: RegExp;
  mapRow: (row: CsvRow) => ExperimentRecord;
}
