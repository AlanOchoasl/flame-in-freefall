import { ChevronLeft, ChevronRight } from 'lucide-react';
import { pageItems } from '../lib/pagination';

interface PagerProps {
  /** The current page, 1-based. */
  page: number;
  /** How many pages there are. Nothing is shown when there is only one. */
  count: number;
  onChange: (page: number) => void;
  /** Names the navigation for screen readers, e.g. "Table pages". */
  label: string;
}

// Previous, numbered pages (the first, the last and those around the current one) and Next.
export function Pager({ page, count, onChange, label }: PagerProps) {
  if (count <= 1) return null;
  return (
    <nav className="pager" aria-label={label}>
      <button type="button" className="icon-action" onClick={() => onChange(page - 1)} disabled={page === 1}>
        <ChevronLeft className="action-icon" aria-hidden="true" />
        Previous
      </button>
      {pageItems(page, count).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="pager-gap" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className="pager-page"
            aria-label={`Page ${item} of ${count}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button type="button" className="icon-action" onClick={() => onChange(page + 1)} disabled={page === count}>
        Next
        <ChevronRight className="action-icon" aria-hidden="true" />
      </button>
    </nav>
  );
}
