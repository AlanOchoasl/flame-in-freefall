import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ExperimentRecord } from '../../data/types';
import { OUTCOME_SHORT_LABELS } from './filters';
import { clampPage, pageCount, pageItems, pageRange, pageSlice } from './pagination';

// The filtered tests as a table (keyboard-friendly alternative to the chart), 10 rows per page.
// The map keys this component by its filters, so a new filter starts again on page 1.
export function ResultsTable({ records }: { records: ExperimentRecord[] }) {
  const [requested, setRequested] = useState(1);
  const page = clampPage(requested, records.length);
  const count = pageCount(records.length);
  const rows = pageSlice(records, page);
  const { from, to } = pageRange(page, records.length);
  return (
    <section aria-label="Tests as a table">
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Filtered tests">
        <table>
          <thead>
            <tr>
              <th scope="col">Test</th>
              <th scope="col">Investigation</th>
              <th scope="col">Flame</th>
              <th scope="col">Fuel</th>
              <th scope="col">O2 (%)</th>
              <th scope="col">Pressure (bar)</th>
              <th scope="col">Ignition</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row">{r.id}</th>
                <td>{r.accession}</td>
                <td>{r.flameType}</td>
                <td>{r.fuel.species ?? '—'}</td>
                <td>{r.o2Fraction === null ? '—' : Math.round(r.o2Fraction * 1000) / 10}</td>
                <td>
                  {r.pressureBar === null ? '—' : `${r.pressureIsApproximate ? '≈ ' : ''}${Math.round(r.pressureBar * 1000) / 1000}`}
                </td>
                <td>{OUTCOME_SHORT_LABELS[r.outcome as keyof typeof OUTCOME_SHORT_LABELS] ?? r.outcome}</td>
                <td>
                  <a href={r.pageUrl} target="_blank" rel="noopener noreferrer">
                    PSI
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p role="status" className="table-status">
        showing {from}–{to} of {records.length}
      </p>
      {count > 1 ? (
        <nav className="table-pager" aria-label="Table pages">
          <button type="button" className="icon-action" onClick={() => setRequested(page - 1)} disabled={page === 1}>
            <ChevronLeft className="action-icon" aria-hidden="true" />
            Previous
          </button>
          {pageItems(page, count).map((item, index) =>
            item === 'gap' ? (
              <span key={`gap-${index}`} className="table-pager-gap" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className="table-pager-page"
                aria-label={`Page ${item} of ${count}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => setRequested(item)}
              >
                {item}
              </button>
            ),
          )}
          <button type="button" className="icon-action" onClick={() => setRequested(page + 1)} disabled={page === count}>
            Next
            <ChevronRight className="action-icon" aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </section>
  );
}
