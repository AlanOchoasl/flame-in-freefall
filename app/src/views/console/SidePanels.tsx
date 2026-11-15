import { useState } from 'react';
import { ArrowUpRight, BookOpen, Map, Plus } from 'lucide-react';
import { AiLabel, PsiTextLabel } from '../../components/AiLabel';
import { NotAvailable } from '../../components/NotAvailable';
import { ConsoleDialog } from '../../components/Dialog';
import { Pager } from '../../components/Pager';
import { Panel } from '../../components/Panel';
import { PsiLink } from '../../components/PsiLink';
import type { CatalogRecord, SummaryEntry } from '../../data/types';
import { clampPage, pageCount, pageRange, pageSlice } from '../../lib/pagination';
import type { InvestigationTestCoverage, RankedInvestigation, RankingProfile } from '../../lib/ranking';
import { carryExplorerState, explorerHash, mergeExplorerState, parseExplorerQuery } from '../../router/explorerQuery';
import { findSummary } from '../detailModel';
import { addToSelection } from '../compare/selection';
import { Breakdown, HowItWorks } from '../ranking/Ranking';
import { filterRanked, NO_RANKING_FILTERS, rankingFilterOptions, type RankingFilters } from '../ranking/rankingFilters';
import { profileDescription, RANKING_PAGE_SIZE } from './consoleModel';

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
          aria-label={`Open the detail of ${accession}`}
          data-tip="Open the investigation detail"
        >
          <ArrowUpRight className="action-icon" aria-hidden="true" />
        </a>
        {coverage && coverage.rowCount > 0 ? (
          <a
            className="icon-action icon-only"
            href={explorerHash('/map', mergeExplorerState(parseExplorerQuery(query), { investigation: accession }))}
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

export function RankingPanel({ id, ranked, records, profile, profiles, sourceUrl, coverage, selected, summaries, compareIds, query, onSelect, onProfileChange }: RankingPanelProps) {
  const [filters, setFilters] = useState<RankingFilters>(NO_RANKING_FILTERS);
  const [interpretOpen, setInterpretOpen] = useState(false);
  // The page belongs to one profile and one set of filters: changing either starts again on page 1.
  const listKey = `${profile.id}|${filters.fuelPhase}|${filters.topic}`;
  const [paging, setPaging] = useState({ key: listKey, page: 1 });
  // A page chosen under another profile or filter is forgotten at once, so it cannot come back later when
  // that same combination is selected again.
  if (paging.key !== listKey) setPaging({ key: listKey, page: 1 });
  const options = rankingFilterOptions(ranked);
  const shown = filterRanked(ranked, filters);
  const page = clampPage(paging.key === listKey ? paging.page : 1, shown.length, RANKING_PAGE_SIZE);
  const { from, to } = pageRange(page, shown.length, RANKING_PAGE_SIZE);
  const interpreted = records.find((record) => record.accession === selected) ?? null;
  const recordOf = (accession: string) => records.find((record) => record.accession === accession)!;

  return (
    <Panel id={id} title="Relevance ranking" subtitle={`${profile.label} · heuristic`}>
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
      <p role="status" className="ranking-caption">
        showing {from}–{to} of {shown.length} investigations
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
          {pageSlice(shown, page, RANKING_PAGE_SIZE).map(({ item, rank }) => (
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
                setInterpretOpen(true);
              }}
            />
          ))}
        </ol>
      )}
      <Pager page={page} count={pageCount(shown.length, RANKING_PAGE_SIZE)} onChange={(next) => setPaging({ key: listKey, page: next })} label="Ranking pages" />
      {interpreted ? (
        <InterpretationDialog open={interpretOpen} onClose={() => setInterpretOpen(false)} record={interpreted} entry={findSummary(summaries, interpreted.accession)} query={query} />
      ) : null}
      <p className="panel-note">Team relevance heuristic — not a NASA safety rating.</p>
      <HowItWorks profile={profile} sourceUrl={sourceUrl} />
    </Panel>
  );
}

export function InterpretationDialog({ open, onClose, record, entry, query }: { open: boolean; onClose: () => void; record: CatalogRecord; entry: SummaryEntry | undefined; query: URLSearchParams }) {
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
