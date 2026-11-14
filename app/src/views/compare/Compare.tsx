import { useState } from 'react';
import { AiLabel, PsiTextLabel } from '../../components/AiLabel';
import { DataState } from '../../components/DataState';
import { NotAvailable } from '../../components/NotAvailable';
import { PsiLink } from '../../components/PsiLink';
import { getCatalog, getExperiments, getSummaries } from '../../data/dataAccess';
import type { CatalogRecord, SummaryEntry } from '../../data/types';
import { useDataResult } from '../../data/useDataResult';
import { findSummary } from '../detailModel';
import type { ViewProps } from '../types';
import { buildComparison, type Cell, type RowMarker } from './comparisonModel';
import {
  addToSelection,
  compareHash,
  MIN_TO_COMPARE,
  parseSelection,
  removeFromSelection,
  searchInvestigations,
} from './selection';

const LONG_TEXT = 280;

const MARKER_TEXT: Record<RowMarker, (count: number) => string> = {
  same: () => '= same',
  differs: () => '≠ differs',
  'all-missing': (count) => (count === 2 ? 'both missing' : 'all missing'),
};

function Picker({ records, ids }: { records: CatalogRecord[]; ids: string[] }) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const select = (next: string[]) => {
    window.location.hash = compareHash(next);
  };
  const add = (accession: string) => {
    const result = addToSelection(ids, accession);
    setMessage(result.message);
    if (!result.message) select(result.ids);
  };
  const matches = searchInvestigations(records, text).filter((record) => !ids.includes(record.accession));

  return (
    <section className="compare-picker" aria-labelledby="picker-title">
      <h2 id="picker-title">Choose investigations</h2>
      <p role="status">{ids.length} of 3 selected</p>
      <ul className="compare-selected" aria-label="Selected investigations">
        {ids.map((id) => (
          <li key={id}>
            {id}{' '}
            <button
              type="button"
              aria-label={`Remove ${id}`}
              onClick={() => {
                setMessage(null);
                select(removeFromSelection(ids, id));
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <label>
        Search by title, acronym or accession{' '}
        <input type="search" value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      {message ? <p role="alert">{message}</p> : null}
      <ul className="compare-options" aria-label="Investigations to add">
        {matches.slice(0, 8).map((record) => (
          <li key={record.accession}>
            {record.accession} {record.acronym ? `(${record.acronym}) ` : ''}
            {record.title}{' '}
            <button type="button" aria-label={`Add ${record.accession}`} onClick={() => add(record.accession)}>
              Add
            </button>
          </li>
        ))}
      </ul>
      {matches.length === 0 ? <p>No investigation matches.</p> : null}
    </section>
  );
}

function CellView({ cell, accession, longText }: { cell: Cell; accession: string; longText: boolean }) {
  if (cell.values.length === 0) {
    return cell.missingReason === 'no-normalized-test-data' ? (
      <>
        <NotAvailable reason="no-normalized-test-data" /> <PsiLink accession={accession} />
      </>
    ) : (
      <NotAvailable reason={cell.missingReason ?? 'not-in-psi-record'} />
    );
  }
  const text = cell.values.join(', ');
  const shown =
    longText && text.length > LONG_TEXT ? (
      <details>
        <summary>{text.slice(0, LONG_TEXT)}…</summary>
        {text}
      </details>
    ) : (
      text
    );
  return (
    <>
      {shown}
      {cell.unreviewed ? <span> ◐ unreviewed</span> : null}
    </>
  );
}

function SummaryCell({ record, entry }: { record: CatalogRecord; entry: SummaryEntry | undefined }) {
  if (entry) {
    return (
      <>
        <AiLabel model={entry.model} reviewed={entry.reviewed} />
        <p>{entry.summary}</p>
      </>
    );
  }
  return (
    <>
      <PsiTextLabel />
      <p>{record.objectives ?? <NotAvailable reason="not-in-psi-record" />}</p>
    </>
  );
}

function ComparisonTable({ records, summaries }: { records: CatalogRecord[]; summaries: SummaryEntry[] }) {
  const experiments = useDataResult(getExperiments);
  return (
    <DataState state={experiments} label="The test conditions">
      {(file) => {
        const model = buildComparison(records, file.investigations);
        return (
          <div className="table-scroll" tabIndex={0} role="region" aria-label="Comparison table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Row</th>
                  {records.map((record) => (
                    <th scope="col" key={record.accession}>
                      <a href={`#/investigation/${record.accession}`}>{record.accession}</a>
                      <br />
                      {record.acronym ?? record.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Summary</th>
                  {records.map((record) => (
                    <td key={record.accession}>
                      <SummaryCell record={record} entry={findSummary(summaries, record.accession)} />
                    </td>
                  ))}
                </tr>
                {model.rows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">
                      {row.label}
                      {row.marker ? <div>{MARKER_TEXT[row.marker](records.length)}</div> : <div><PsiTextLabel /></div>}
                    </th>
                    {row.cells.map((cell, index) => (
                      <td key={model.accessions[index]}>
                        <CellView cell={cell} accession={model.accessions[index]} longText={row.marker === null} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }}
    </DataState>
  );
}

export function Compare({ query }: ViewProps) {
  const catalog = useDataResult(getCatalog);
  const summaries = useDataResult(getSummaries);

  return (
    <>
      <h1>Compare</h1>
      <p className="view-intro">Compare recorded conditions and source text side by side. Missing values stay visible.</p>
      <DataState state={catalog} label="The list of investigations">
        {(file) => {
          const ids = parseSelection(query, file.records.map((record) => record.accession));
          const selected = ids.flatMap((id) => file.records.filter((record) => record.accession === id));
          return (
            <>
              <Picker records={file.records} ids={ids} />
              {selected.length < MIN_TO_COMPARE ? (
                <p>Select at least {MIN_TO_COMPARE} investigations to compare them.</p>
              ) : (
                <ComparisonTable records={selected} summaries={summaries.status === 'ok' ? summaries.data.entries : []} />
              )}
            </>
          );
        }}
      </DataState>
    </>
  );
}
