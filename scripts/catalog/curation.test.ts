import { describe, expect, it } from 'vitest';
import { countUnreviewed, curatedBlock, validateCuration } from './curation.ts';
import type { CurationFile, Vocabularies } from './types.ts';

const vocab: Vocabularies = {
  schemaVersion: '1.0.0',
  hardwareGroup: ['acme-cir', 'other', 'unknown'],
  fuelPhase: ['gas', 'solid'],
  topics: ['detection', 'suppression'],
};
const known = ['PSI-159', 'PSI-98'];
const file = (entries: CurationFile['entries']): CurationFile => ({ schemaVersion: '1.0.0', entries });
const ok = { value: 'acme-cir', source: 'Challenge statement', reviewed: true };

describe('validateCuration', () => {
  it('accepts a valid file', () => {
    expect(validateCuration(file({ 'PSI-159': { hardwareGroup: ok } }), vocab, known)).toEqual([]);
  });
  it('fails and names an accession that is not in the catalog (typo case)', () => {
    const errors = validateCuration(file({ 'PSI-1599': { hardwareGroup: ok } }), vocab, known);
    expect(errors).toEqual(['Curation names unknown accession "PSI-1599"']);
  });
  it('fails on a value outside the vocabulary and lists the allowed ones', () => {
    const errors = validateCuration(file({ 'PSI-159': { fuelPhase: { value: ['plasma'], source: 'x', reviewed: false } } }), vocab, known);
    expect(errors[0]).toContain('"plasma" is not in the vocabulary (gas, solid)');
  });
  it('requires a source note when there is a value', () => {
    const errors = validateCuration(file({ 'PSI-159': { topics: { value: ['detection'], source: null, reviewed: false } } }), vocab, known);
    expect(errors[0]).toContain('needs a "source" note');
  });
  it('allows an empty value without a source', () => {
    expect(validateCuration(file({ 'PSI-159': { topics: { value: [], source: null, reviewed: false } } }), vocab, known)).toEqual([]);
  });
  it('requires reviewed to be true or false', () => {
    const bad = { value: 'other', source: 'x', reviewed: 'yes' } as unknown as typeof ok;
    expect(validateCuration(file({ 'PSI-98': { hardwareGroup: bad } }), vocab, known)[0]).toContain('"reviewed" must be true or false');
  });
  it('catches a misspelled field name', () => {
    const entry = { fuelphase: ok } as unknown as CurationFile['entries'][string];
    expect(validateCuration(file({ 'PSI-159': entry }), vocab, known)).toEqual(['PSI-159: unknown field "fuelphase"']);
  });
  it('checks the DOI shape', () => {
    expect(validateCuration(file({ 'PSI-98': { doi: '10.60555/0t15-1z43' } }), vocab, known)).toEqual([]);
    expect(validateCuration(file({ 'PSI-98': { doi: 'not a doi' } }), vocab, known)[0]).toContain('does not look like a DOI');
  });
});

describe('curatedBlock and countUnreviewed', () => {
  it('gives an uncurated investigation empty, unreviewed fields', () => {
    const block = curatedBlock(undefined);
    expect(block.hardwareGroup).toEqual({ value: null, source: null, reviewed: false });
    expect(block.fuelPhase).toEqual({ value: [], source: null, reviewed: false });
    expect(countUnreviewed(block)).toBe(4);
  });
  it('counts only the unreviewed fields', () => {
    expect(countUnreviewed(curatedBlock({ hardwareGroup: ok }))).toBe(3);
  });
});
