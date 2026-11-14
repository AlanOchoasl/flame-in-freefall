import { describe, expect, it } from 'vitest';
import { aiLabelText, doiUrl, missingReasonText, psiInvestigationUrl } from './labelText';

describe('aiLabelText', () => {
  it('says "not yet reviewed" and names the model for an unreviewed summary', () => {
    expect(aiLabelText('gemini-x', false)).toBe('AI-generated, not yet reviewed (gemini-x)');
  });

  it('differs for a reviewed summary and still names the model', () => {
    const reviewed = aiLabelText('gemini-x', true);
    expect(reviewed).not.toBe(aiLabelText('gemini-x', false));
    expect(reviewed).toContain('gemini-x');
    expect(reviewed).toContain('reviewed by a person');
  });
});

describe('missingReasonText', () => {
  it('gives a reason for each kind of missing value', () => {
    expect(missingReasonText('not-in-psi-record')).toBe('not in the PSI record');
    expect(missingReasonText('no-normalized-test-data')).toBe('no normalized test data');
    expect(missingReasonText('not-reviewed')).toBe('not reviewed yet');
  });
});

describe('links', () => {
  it('builds the PSI page link from the accession', () => {
    expect(psiInvestigationUrl('PSI-159')).toBe('https://psi.nasa.gov/physci/repo/data/investigations/PSI-159');
  });

  it('builds the DOI link', () => {
    expect(doiUrl('10.26030/abc')).toBe('https://doi.org/10.26030/abc');
  });
});
