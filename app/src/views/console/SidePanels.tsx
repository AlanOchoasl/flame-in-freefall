import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, BookOpen, ListOrdered, Map, Plus } from 'lucide-react';
import { AiLabel, PsiTextLabel } from '../../components/AiLabel';
import { NotAvailable } from '../../components/NotAvailable';
import { Panel } from '../../components/Panel';
import { PsiLink } from '../../components/PsiLink';
import type { CatalogRecord, SummaryEntry } from '../../data/types';
import type { InvestigationTestCoverage, RankedInvestigation, RankingProfile } from '../../lib/ranking';
import { carryExplorerState, explorerHash, mergeExplorerState, parseExplorerQuery } from '../../router/explorerQuery';
import { findSummary } from '../detailModel';
import { addToSelection } from '../compare/selection';
import { Breakdown, HowItWorks } from '../ranking/Ranking';
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
  /** The investigation last opened for interpretation, if any. */
  selected: string | null;
  summaries: SummaryEntry[];
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
        <button type="button" className="icon-action" aria-haspopup="dialog" aria-label={`Interpret ${accession}`} onClick={() => onSelect(accession)}>
          <BookOpen className="action-icon" aria-hidden="true" />
          Interpret
        </button>
        <a
          className="icon-action icon-only"
          href={carryExplorerState(`/investigation/${accession}`, query)}
          onClick={onAction}
          aria-label={`Open the detail of ${accession}`}
          data-tip="Open the investigation detail"
        >
          <ArrowUpRight className="action-icon" aria-hidden="true" />
        </a>
        {coverage && coverage.rowCount > 0 ? (
          <a
            className="icon-action icon-only"
            href={explorerHash('/map', mergeExplorerState(parseExplorerQuery(query), { investigation: accession }))}
            onClick={onAction}
            aria-label={`Show the tests of ${accession} on the map`}
            data-tip="Show its tests on the map"
          >
            <Map className="action-icon" aria-hidden="true" />
          </a>
        ) : (
          <span className="icon-action icon-only is-disabled" role="img" aria-label="Nothing to show on the map" data-tip="No tests to show on the map">
            <Map className="action-icon" aria-hidden="true" />
          </span>
        )}
        {compareIds.includes(accession) ? (
          <span className="evidence-mark">In comparison</span>
        ) : addResult.message ? null : (
          <a
            className="icon-action icon-only"
            href={explorerHash('/compare', mergeExplorerState(parseExplorerQuery(query), { ids: addResult.ids }))}
            onClick={onAction}
            aria-label={`Add ${accession} to the comparison`}
            data-tip="Add to the comparison"
          >
            <Plus className="action-icon" aria-hidden="true" />
          </a>
        )}
        <PsiLink accession={accession} iconOnly />
      </p>
      <Breakdown item={item} />
    </li>
  );
}

// The full list opens in a native <dialog>: it traps focus, closes on Esc and returns focus to the button that opened it.
export function ConsoleDialog({ open, onClose, titleId, className, children }: { open: boolean; onClose: () => void; titleId: string; className?: string; children: ReactNode }) {
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
      className={className ? `ranking-dialog ${className}` : 'ranking-dialog'}
      aria-labelledby={titleId}
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

export function RankingPanel({ id, ranked, records, profile, profiles, sourceUrl, coverage, selected, summaries, compareIds, query, onSelect, onProfileChange }: RankingPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  // "Interpret" opens the summary in a second dialog; when it came from the full list, that list can be reopened from it.
  const [interpretOpen, setInterpretOpen] = useState(false);
  const [cameFromList, setCameFromList] = useState(false);
  const interpreted = records.find((record) => record.accession === selected) ?? null;
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
        setCameFromList(inDialog);
        if (inDialog) closeDialog();
        setInterpretOpen(true);
      }}
      onAction={inDialog ? closeDialog : undefined}
    />
  );

  return (
    <Panel
      id={id}
      title="Relevance ranking"
      subtitle={`${profile.label} · heuristic`}
      action={
        <button
          type="button"
          className="icon-action panel-action"
          aria-haspopup="dialog"
          aria-label={`See all ${ranked.length} investigations in the ranking`}
          data-tip="Open the full ranking"
          onClick={() => setDialogOpen(true)}
        >
          <ListOrdered className="action-icon" aria-hidden="true" />
          <span className="panel-action-text">See all {ranked.length}</span>
        </button>
      }
    >
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
      <p className="ranking-caption">
        Top {top.length} of {ranked.length} investigations
      </p>
      <ol className="ranked-list">{top.map(renderRow(false))}</ol>
      {ranked.length > top.length ? (
        <button type="button" className="show-all" aria-haspopup="dialog" onClick={() => setDialogOpen(true)}>
          Show all {ranked.length}
        </button>
      ) : null}
      <ConsoleDialog open={dialogOpen} onClose={closeDialog} titleId="ranking-dialog-title">
        <AllRankedList ranked={ranked} profileLabel={profile.label} renderRow={renderRow(true)} onClose={closeDialog} />
      </ConsoleDialog>
      {interpreted ? (
        <InterpretationDialog
          open={interpretOpen}
          onClose={() => setInterpretOpen(false)}
          onBack={
            cameFromList
              ? () => {
                  setInterpretOpen(false);
                  setDialogOpen(true);
                }
              : undefined
          }
          record={interpreted}
          entry={findSummary(summaries, interpreted.accession)}
          query={query}
        />
      ) : null}
      <p className="panel-note">Team relevance heuristic — not a NASA safety rating.</p>
      <HowItWorks profile={profile} sourceUrl={sourceUrl} />
    </Panel>
  );
}

export function InterpretationDialog({ open, onClose, onBack, record, entry, query }: { open: boolean; onClose: () => void; /** Set when the dialog was opened from the full ranking list. */ onBack?: () => void; record: CatalogRecord; entry: SummaryEntry | undefined; query: URLSearchParams }) {
  return (
    <ConsoleDialog open={open} onClose={onClose} titleId="interpretation-title" className="interpret-dialog">
      <div className="ranking-dialog-body">
        <div className="ranking-dialog-head">
          <div>
            <h2 id="interpretation-title">
              {record.acronym ? `${record.acronym}: ` : ''}
              {record.title}
            </h2>
            <p className="ranking-dialog-sub">{record.accession} · plain-language interpretation</p>
          </div>
          <div className="dialog-buttons">
            {onBack ? (
              <button type="button" onClick={onBack}>
                ← Back to the ranking
              </button>
            ) : null}
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        {entry ? (
          <>
            <AiLabel model={entry.model} reviewed={entry.reviewed} />
            <p>{entry.summary}</p>
            <div className="fire-note">
              <strong>Fire-safety note</strong>
              <p>{entry.fireSafetyRelevance}</p>
            </div>
          </>
        ) : (
          <>
            <PsiTextLabel />
            <p>{record.objectives ?? <NotAvailable reason="not-in-psi-record" />}</p>
          </>
        )}
        <p className="row-actions">
          <a href={carryExplorerState(`/investigation/${record.accession}`, query)} onClick={onClose}>
            Open the investigation detail
          </a>
          <PsiLink accession={record.accession} doi={record.doi} />
        </p>
      </div>
    </ConsoleDialog>
  );
}
