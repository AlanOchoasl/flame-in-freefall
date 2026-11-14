import type { Mapper } from '../experiment-record.ts';
import { psi159InverseMapper, psi159NormalMapper } from './psi159.ts';

// Adding another PSI table = one new mapper file plus one entry here, and a license check first:
// see "excluded" in data/curation/dataset-citations.json (PSI-10 is left out for having none).
export const MAPPERS: Mapper[] = [psi159NormalMapper, psi159InverseMapper];

export function findMapper(fileName: string): Mapper | undefined {
  return MAPPERS.find((mapper) => mapper.filePattern.test(fileName));
}
