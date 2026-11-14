import { doiUrl, psiInvestigationUrl } from './labelText';

// Cites an investigation: link to its PSI page and its DOI when known.
export function PsiLink({ accession, doi }: { accession: string; doi?: string | null }) {
  return (
    <span>
      <a href={psiInvestigationUrl(accession)} target="_blank" rel="noopener noreferrer">
        {accession} on NASA PSI
      </a>
      {doi ? (
        <>
          {' · DOI '}
          <a href={doiUrl(doi)} target="_blank" rel="noopener noreferrer">
            {doi}
          </a>
        </>
      ) : null}
    </span>
  );
}
