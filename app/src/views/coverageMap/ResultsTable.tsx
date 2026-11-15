import { useState } from 'react';
import type { ExperimentRecord } from '../../data/types';
import { OUTCOME_SHORT_LABELS } from './filters';

const PAGE = 50;

// The filtered tests as a table (keyboard-friendly alternative to the chart), paged by 50.
export function ResultsTable({ records }: { records: ExperimentRecord[] }) {
  const [shown, setShown] = useState(PAGE);
  const rows = records.slice(0, shown);
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
      <p role="status">
        showing {Math.min(shown, records.length)} of {records.length}
      </p>
      {shown < records.length ? (
        <button type="button" onClick={() => setShown(shown + PAGE)}>
          Show {PAGE} more rows
        </button>
      ) : null}
    </section>
  );
}
