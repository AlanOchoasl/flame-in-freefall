import type { CuratedBlock, CuratedFieldName, CurationEntry, CurationFile, Reviewed, Vocabularies } from './types.ts';

const CURATED_FIELDS: CuratedFieldName[] = ['hardwareGroup', 'fuelPhase', 'topics', 'measurements'];
const ENTRY_KEYS = new Set<string>([...CURATED_FIELDS, 'doi']);
const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function hasValue(field: CuratedFieldName, item: Reviewed<unknown>): boolean {
  return field === 'hardwareGroup' ? item.value !== null : Array.isArray(item.value) && item.value.length > 0;
}

function validateItem(accession: string, field: CuratedFieldName, item: unknown, vocab: Vocabularies, errors: string[]): void {
  const where = `${accession}.${field}`;
  if (typeof item !== 'object' || item === null) {
    errors.push(`${where}: expected an object { value, source, reviewed }`);
    return;
  }
  const entry = item as Reviewed<unknown>;
  if (typeof entry.reviewed !== 'boolean') errors.push(`${where}: "reviewed" must be true or false`);

  const isScalar = field === 'hardwareGroup';
  const shapeOk = isScalar
    ? entry.value === null || typeof entry.value === 'string'
    : Array.isArray(entry.value) && entry.value.every((v) => typeof v === 'string');
  if (!shapeOk) {
    errors.push(`${where}: "value" has the wrong type`);
    return;
  }

  if (field !== 'measurements') {
    const allowed = vocab[field];
    const values = isScalar ? (entry.value === null ? [] : [entry.value as string]) : (entry.value as string[]);
    for (const v of values) {
      if (!allowed.includes(v)) errors.push(`${where}: "${v}" is not in the vocabulary (${allowed.join(', ')})`);
    }
  }

  if (hasValue(field, entry) && !isNonEmptyString(entry.source)) {
    errors.push(`${where}: a value needs a "source" note saying which text it came from`);
  }
}

/** Returns every problem found; an empty list means the curation file is valid. */
export function validateCuration(curation: CurationFile, vocab: Vocabularies, knownAccessions: string[]): string[] {
  const errors: string[] = [];
  const known = new Set(knownAccessions);
  for (const [accession, entry] of Object.entries(curation.entries)) {
    if (!known.has(accession)) {
      errors.push(`Curation names unknown accession "${accession}"`);
      continue;
    }
    for (const key of Object.keys(entry)) {
      if (!ENTRY_KEYS.has(key)) errors.push(`${accession}: unknown field "${key}"`);
    }
    for (const field of CURATED_FIELDS) {
      if (entry[field] !== undefined) validateItem(accession, field, entry[field], vocab, errors);
    }
    if (entry.doi !== undefined && entry.doi !== null && !DOI_PATTERN.test(entry.doi)) {
      errors.push(`${accession}.doi: "${entry.doi}" does not look like a DOI (10.xxxx/...)`);
    }
  }
  return errors;
}

/** Curated block for one investigation. Anything not curated is empty and unreviewed. */
export function curatedBlock(entry: CurationEntry | undefined): CuratedBlock {
  return {
    hardwareGroup: entry?.hardwareGroup ?? { value: null, source: null, reviewed: false },
    fuelPhase: entry?.fuelPhase ?? { value: [], source: null, reviewed: false },
    topics: entry?.topics ?? { value: [], source: null, reviewed: false },
    measurements: entry?.measurements ?? { value: [], source: null, reviewed: false },
  };
}

export function countUnreviewed(block: CuratedBlock): number {
  return CURATED_FIELDS.filter((field) => !block[field].reviewed).length;
}
