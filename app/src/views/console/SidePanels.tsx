import { useState } from 'react';
import { AiLabel, PsiTextLabel } from '../../components/AiLabel';
import { NotAvailable } from '../../components/NotAvailable';
import { Panel } from '../../components/Panel';
import { PsiLink } from '../../components/PsiLink';
import type { CatalogRecord, ExperimentRecord, SummaryEntry } from '../../data/types';
import type { InvestigationTestCoverage, RankedInvestigation, RankingProfile } from '../../lib/ranking';
import { carryExplorerState, explorerHash, mergeExplorerState, parseExplorerQuery } from '../../router/explorerQuery';
import { addToSelection } from '../compare/selection';
import { computeInsight, describeInsight } from '../coverageMap/insight';
import { Breakdown, DISCLAIMER, HowItWorks } from '../ranking/Ranking';
import { filterRanked, NO_RANKING_FILTERS, rankingFilterOptions, type RankingFilters } from '../ranking/rankingFilters';
import { visibleRows } from './consoleModel';

interface RankingPanelProps {
  id: string;
  ranked: RankedInvestigation[];
  records: CatalogRecord[];
  profile: RankingProfile;
  sourceUrl: string;
  coverage: Record<string, InvestigationTestCoverage>;
  selected: string;
  compareIds: string[];
  query: URLSearchParams;
  onSelect: (accession: string) => void;
}

function RankedRow({ item, rank, record, coverage, selected, compareIds, query, onSelect }: {
  item: RankedInvestigation;
  rank: number;
  record: CatalogRecord;
  coverage: InvestigationTestCoverage | undefined;
  selected: boolean;
  compareIds: string[];
  query: URLSearchParams;
  onSelect: (accession: string) => void;
}) {
  const { accession, curated } = item.investigation;
  const addResult = addToSelection(compareIds, accession);
  return (
    <li className={selected ? 'ranked-row is-selected' : 'ranked-row'}>
      <p className="ranked-top">
        <span className="accession">
          #{rank} · {accession}
        </span>
        <span className="score">
          {item.score} / {item.maximumScore} pts
        </span>
      </p>
      <h3 className="study-name">
        {record.acronym ? `${record.acronym}: ` : ''}
        {record.title}
      </h3>
      <p className="study-meta">
        Fuel phase: {curated.fuelPhase.value.join(', ') || '—'} · Topics: {curated.topics.value.join(', ') || '—'}
      </p>
      <p className="evidence-marks">
        {!coverage || coverage.rowCount === 0 ? <span className="evidence-mark">No normalized test rows</span> : null}
        {item.basedOnUnreviewedTags ? <span className="evidence-mark">◐ based on unreviewed tags</span> : null}
        {item.note ? <span className="evidence-mark">{item.note}</span> : null}
      </p>
      <p className="row-actions">
        <button type="button" aria-pressed={selected} aria-label={`Interpret ${accession}`} onClick={() => onSelect(accession)}>
          Interpret
        </button>
        <a href={carryExplorerState(`/investigation/${accession}`, query)}>Detail</a>
        {coverage && coverage.rowCount > 0 ? (
          <a href={explorerHash('/map', mergeExplorerState(parseExplorerQuery(query), { investigation: accession }))}>Show tests on the map</a>
        ) : (
          <span className="evidence-mark">Nothing to show on the map</span>
        )}
        {compareIds.includes(accession) ? (
          <span className="evidence-mark">In comparison</span>
        ) : addResult.message ? null : (
          <a href={explorerHash('/compare', mergeExplorerState(parseExplorerQuery(query), { ids: addResult.ids }))}>Add compare</a>
        )}
        <PsiLink accession={accession} />
      </p>
      <Breakdown item={item} />
    </li>
  );
}

export function RankingPanel({ id, ranked, records, profile, sourceUrl, coverage, selected, compareIds, query, onSelect }: RankingPanelProps) {
  const [filters, setFilters] = useState<RankingFilters>(NO_RANKING_FILTERS);
  const [expanded, setExpanded] = useState(false);
  const options = rankingFilterOptions(ranked);
  const shown = filterRanked(ranked, filters);
  const rows = visibleRows(shown, expanded);
  const recordOf = (accession: string) => records.find((record) => record.accession === accession)!;

  return (
    <Panel id={id} title="Relevance ranking" subtitle={`${profile.label} · heuristic`} tag={`${ranked.length} studies`}>
      <div className="panel-filters">
        <label>
          Fuel phase
          <select value={filters.fuelPhase ?? ''} onChange={(event) => setFilters({ ...filters, fuelPhase: event.target.value || null })}>
            <option value="">All</option>
            {options.fuelPhases.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Topic
          <select value={filters.topic ?? ''} onChange={(event) => setFilters({ ...filters, topic: event.target.value || null })}>
            <option value="">All</option>
            {options.topics.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <p role="status" className="result-count">
        {shown.length} of {ranked.length} investigations
      </p>
      {shown.length === 0 ? (
        <div role="status">
          <p>No investigation matches the filters.</p>
          <button type="button" onClick={() => setFilters(NO_RANKING_FILTERS)}>
            Clear filters
          </button>
        </div>
      ) : (
        <ol className="ranked-list">
          {rows.map(({ item, rank }) => (
            <RankedRow
              key={item.investigation.accession}
              item={item}
              rank={rank}
              record={recordOf(item.investigation.accession)}
              coverage={coverage[item.investigation.accession]}
              selected={item.investigation.accession === selected}
              compareIds={compareIds}
              query={query}
              onSelect={onSelect}
            />
          ))}
        </ol>
      )}
      {shown.length > rows.length || expanded ? (
        <button type="button" className="show-all" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show fewer' : `Show all ${shown.length}`}
        </button>
      ) : null}
      <p className="panel-note">Team relevance heuristic — not a NASA safety rating.</p>
      <HowItWorks profile={profile} sourceUrl={sourceUrl} />
    </Panel>
  );
}

export function InterpretationPanel({ id, record, entry, query }: { id: string; record: CatalogRecord; entry: SummaryEntry | undefined; query: URLSearchParams }) {
  return (
    <Panel id={id} title="Plain-language interpretation" subtitle={`${record.accession} · source-grounded summary`}>
      {entry ? (
        <>
          <AiLabel model={entry.model} reviewed={entry.reviewed} />
          <p>{entry.summary}</p>
          <p>
            <strong>Fire-safety note:</strong> {entry.fireSafetyRelevance}
          </p>
        </>
      ) : (
        <>
          <PsiTextLabel />
          <p>{record.objectives ?? <NotAvailable reason="not-in-psi-record" />}</p>
        </>
      )}
      <p className="row-actions">
        <a href={carryExplorerState(`/investigation/${record.accession}`, query)}>Open the investigation detail</a>
        <PsiLink accession={record.accession} doi={record.doi} />
      </p>
    </Panel>
  );
}

export function GapsPanel({ id, tests }: { id: string; tests: ExperimentRecord[] }) {
  const data = computeInsight(tests);
  const insight = describeInsight(data);
  return (
    <Panel id={id} title="Coverage gaps" tag="Interpret with care">
      <p className="progress-row">
        <span>Plotted tests in the expected Moon-base zone</span>
        <strong>
          {data.inZone} / {data.plotted}
        </strong>
      </p>
      <progress value={data.inZone} max={Math.max(data.plotted, 1)} aria-label="Share of plotted tests in the expected Moon-base zone" />
      <ul className="map-limits">
        {insight.limits.map((limit) => (
          <li key={limit}>{limit}</li>
        ))}
      </ul>
      <p className="panel-note">An empty area of the map means no recorded test, never evidence of safety.</p>
    </Panel>
  );
}

export function BoundariesPanel({ id, selected, query }: { id: string; selected: string | null; query: URLSearchParams }) {
  return (
    <div className="bottom-line">
      <Panel id={`${id}-detail`} title="Investigation detail route" tag="Drill-down">
        <p>
          Study objective, approach, hypothesis, measurements, test ranges, ranking positions, AI summary, DOI and PSI citation. Missing
          fields keep their reason.
        </p>
        {selected ? (
          <p className="row-actions">
            <a href={carryExplorerState(`/investigation/${selected}`, query)}>Open {selected}</a>
          </p>
        ) : null}
      </Panel>
      <Panel id={id} title="Interpretation boundaries" tag="About / sources">
        <p>{DISCLAIMER}</p>
        <p>The lunar zone is expected from the challenge statement, not a final habitat specification. AI text is precomputed and labeled.</p>
        <p className="row-actions">
          <a href={carryExplorerState('/about', query)}>About, sources and licenses</a>
        </p>
      </Panel>
    </div>
  );
}
