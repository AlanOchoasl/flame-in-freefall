import { ExternalLink } from 'lucide-react';
import { doiUrl, psiInvestigationUrl } from './labelText';

// Cites an investigation: link to its PSI page and its DOI when known. The small arrow says the link opens another site.
// `iconOnly` shows just the arrow (dense rows); the accessible name and the tooltip keep the full text.
export function PsiLink({ accession, doi, iconOnly = false }: { accession: string; doi?: string | null; iconOnly?: boolean }) {
  const text = `${accession} on NASA PSI`;
  if (iconOnly) {
    return (
      <a className="icon-action icon-only" href={psiInvestigationUrl(accession)} target="_blank" rel="noopener noreferrer" aria-label={`${text} (opens in a new tab)`} title={text}>
        <ExternalLink className="action-icon" aria-hidden="true" />
      </a>
    );
  }
  return (
    <span>
      <a href={psiInvestigationUrl(accession)} target="_blank" rel="noopener noreferrer">
        {text}
        <ExternalLink className="link-icon" aria-hidden="true" />
      </a>
      {doi ? (
        <>
          {' · DOI '}
          <a href={doiUrl(doi)} target="_blank" rel="noopener noreferrer">
            {doi}
            <ExternalLink className="link-icon" aria-hidden="true" />
          </a>
        </>
      ) : null}
    </span>
  );
}
