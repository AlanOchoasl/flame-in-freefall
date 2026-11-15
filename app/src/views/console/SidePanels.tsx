import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AiLabel, PsiTextLabel } from '../../components/AiLabel';
import { NotAvailable } from '../../components/NotAvailable';
import { Panel } from '../../components/Panel';
import { PsiLink } from '../../components/PsiLink';
import type { CatalogRecord, SummaryEntry } from '../../data/types';
import type { InvestigationTestCoverage, RankedInvestigation, RankingProfile } from '../../lib/ranking';
import { carryExplorerState, explorerHash, mergeExplorerState, parseExplorerQuery } from '../../router/explorerQuery';
import { addToSelection } from '../compare/selection';
import { Breakdown, DISCLAIMER, HowItWorks } from '../ranking/Ranking';
import { filterRanked, NO_RANKING_FILTERS, rankingFilterOptions, type RankingFilters } from '../ranking/rankingFilters';
import { profileDescription, topRows } from './consoleModel';

interface RankingPanelProps {
  id: string;
  ranked: RankedInvestigation[];
  records: CatalogRecord[];
  profile: RankingProfile;
  profiles: RankingProfile[];
  sourceUrl: string;
  coverage: Record<string, InvestigationTestCoverage>;
  selected: string;
  compareIds: string[];
  query: URLSearchParams;
  onSelect: (accession: string) => void;
  onProfileChange: (profileId: string) => void;
}

function RankedRow({ item, rank, record, coverage, selected, compareIds, query, onSelect, onAction }: {
  item: RankedInvestigation;
  rank: number;
  record: CatalogRecord;
  coverage: InvestigationTestCoverage | undefined;
  selected: boolean;
  compareIds: string[];
  query: URLSearchParams;
  onSelect: (accession: string) => void;
  /** Called when a link of the row moves the page, so a dialog holding the row can close. */
  onAction?: () => void;
}) {
  const { accession, curated } = item.investigation;
  const addResult = addToSelection(compareIds, accession);
  return (
    <li className={selected ? 'ranked-row is-selected' : 'ranked-row'}>
      <p className="ranked-top">
        <span className="rank-line">
          <span className="rank-no">#{rank}</span>
          <span className="accession">{accession}</span>
        </span>
        <span className="score-cell">
          <span className="score">
            {item.score} / {item.maximumScore} pts
          </span>
          <span className="score-bar" aria-hidden="true">
            <span style={{ width: `${item.maximumScore > 0 ? Math.round((item.score / item.maximumScore) * 100) : 0}%` }} />
          </span>
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
        <a href={carryExplorerState(`/investigation/${accession}`, query)} onClick={onAction}>
            Detail
          </a>
        {coverage && coverage.rowCount > 0 ? (
          <a href={explorerHash('/map', mergeExplorerState(parseExplorerQuery(query), { investigation: accession }))} onClick={onAction}>
            Show tests on the map
          </a>
        ) : (
          <span className="evidence-mark">Nothing to show on the map</span>
        )}
        {compareIds.includes(accession) ? (
          <span className="evidence-mark">In comparison</span>
        ) : addResult.message ? null : (
          <a href={explorerHash('/compare', mergeExplorerState(parseExplorerQuery(query), { ids: addResult.ids }))} onClick={onAction}>
            Add compare
          </a>
        )}
        <PsiLink accession={accession} />
      </p>
      <Breakdown item={item} />
    </li>
  );
}

// The full list opens in a native <dialog>: it traps focus, closes on Esc and returns focus to the button that opened it.
function RankingDialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="ranking-dialog"
      aria-labelledby="ranking-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open ? children : null}
    </dialog>
  );
}

function AllRankedList({ ranked, profileLabel, renderRow, onClose }: { ranked: RankedInvestigation[]; profileLabel: string; renderRow: (row: { item: RankedInvestigation; rank: number }) => ReactNode; onClose: () => void }) {
  const [filters, setFilters] = useState<RankingFilters>(NO_RANKING_FILTERS);
  const options = rankingFilterOptions(ranked);
  const shown = filterRanked(ranked, filters);
  return (
    <div className="ranking-dialog-body">
      <div className="ranking-dialog-head">
        <div>
          <h2 id="ranking-dialog-title">All {ranked.length} investigations, ranked</h2>
          <p className="ranking-dialog-sub">{profileLabel} · team heuristic, not a NASA safety rating</p>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="ranking-toolbar">
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
      </div>
      {shown.length === 0 ? (
        <div role="status">
          <p>No investigation matches the filters.</p>
          <button type="button" onClick={() => setFilters(NO_RANKING_FILTERS)}>
            Clear filters
          </button>
        </div>
      ) : (
        <ol className="ranked-list">{shown.map(renderRow)}</ol>
      )}
    </div>
  );
}

export function RankingPanel({ id, ranked, records, profile, profiles, sourceUrl, coverage, selected, compareIds, query, onSelect, onProfileChange }: RankingPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const recordOf = (accession: string) => records.find((record) => record.accession === accession)!;
  const closeDialog = () => setDialogOpen(false);
  const top = topRows(filterRanked(ranked, NO_RANKING_FILTERS));

  const renderRow = (inDialog: boolean) => ({ item, rank }: { item: RankedInvestigation; rank: number }) => (
    <RankedRow
      key={item.investigation.accession}
      item={item}
      rank={rank}
      record={recordOf(item.investigation.accession)}
      coverage={coverage[item.investigation.accession]}
      selected={item.investigation.accession === selected}
      compareIds={compareIds}
      query={query}
      onSelect={(accession) => {
        onSelect(accession);
        if (inDialog) {
          closeDialog();
          document.getElementById('interpretation')?.scrollIntoView();
        }
      }}
      onAction={inDialog ? closeDialog : undefined}
    />
  );

  return (
    <Panel id={id} title="Relevance ranking" subtitle={`${profile.label} · heuristic`} tag={`${ranked.length} studies`}>
      <div className="profile-picker">
        <p id="profile-label" className="profile-label">
          Environment profile
        </p>
        <div className="profile-control" role="group" aria-labelledby="profile-label">
          {profiles.map((option) => (
            <button key={option.id} type="button" aria-pressed={option.id === profile.id} onClick={() => onProfileChange(option.id)}>
              {option.label}
            </button>
          ))}
        </div>
        <p className="profile-description">{profileDescription(profile)}</p>
      </div>
      <ol className="ranked-list">{top.map(renderRow(false))}</ol>
      {ranked.length > top.length ? (
        <button type="button" className="show-all" aria-haspopup="dialog" onClick={() => setDialogOpen(true)}>
          Show all {ranked.length}
        </button>
      ) : null}
      <RankingDialog open={dialogOpen} onClose={closeDialog}>
        <AllRankedList ranked={ranked} profileLabel={profile.label} renderRow={renderRow(true)} onClose={closeDialog} />
      </RankingDialog>
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
        <p>This is an experimental data explorer, not a spacecraft monitor or an operational fire-risk predictor.</p>
        <p>The lunar zone is expected from the challenge statement, not a final habitat specification. AI text is precomputed and labeled.</p>
        <p className="row-actions">
          <a href={carryExplorerState('/about', query)}>About, sources and licenses</a>
        </p>
      </Panel>
    </div>
  );
}
