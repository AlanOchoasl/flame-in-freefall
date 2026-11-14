// Text logic for the shared labels, kept apart from React so it can be tested.

export const PSI_SEARCH_URL = 'https://psi.nasa.gov/physci/repo/search?q=combustion';

export type MissingReason = 'not-in-psi-record' | 'no-normalized-test-data' | 'not-reviewed';

const MISSING_REASON_TEXT: Record<MissingReason, string> = {
  'not-in-psi-record': 'not in the PSI record',
  'no-normalized-test-data': 'no normalized test data',
  'not-reviewed': 'not reviewed yet',
};

export function aiLabelText(model: string, reviewed: boolean): string {
  return reviewed ? `AI-generated (${model}), reviewed by a person` : `AI-generated, not yet reviewed (${model})`;
}

export function missingReasonText(reason: MissingReason): string {
  return MISSING_REASON_TEXT[reason];
}

export function psiInvestigationUrl(accession: string): string {
  return `https://psi.nasa.gov/physci/repo/data/investigations/${accession}`;
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${doi}`;
}
