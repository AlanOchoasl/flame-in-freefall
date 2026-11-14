import { useState } from 'react';
import { AiLabel, PsiTextLabel } from '../../components/AiLabel';
import { DataState } from '../../components/DataState';
import { PsiLink } from '../../components/PsiLink';
import { getCatalog, getExperiments, getRankingProfiles, getSummaries } from '../../data/dataAccess';
import type { CatalogRecord, SummaryEntry } from '../../data/types';
import { useDataResult } from '../../data/useDataResult';
import { rankInvestigations, type FactorId, type RankedInvestigation, type RankingProfile } from '../../lib/ranking';
import { findSummary } from '../detailModel';
import { testCoverageByAccession } from '../rankingPosition';
import { filterRanked, NO_RANKING_FILTERS, rankingFilterOptions, type RankingFilters } from './rankingFilters';

const FACTOR_LABELS: Record<FactorId, string> = {
  topicMatch: 'Topic match',
  solidFuelFlammability: 'Solid-fuel flammability',
  nasaFireSafetyLabel: 'NASA fire-safety label',
  moonBaseAtmosphere: 'Moon-base atmosphere tests',
  microgravityProjectType: 'Microgravity investigation',
};

const SHORT_SUMMARY = 220;

const DISCLAIMER =
  'This ranking is a heuristic built by the team from the challenge statement and PSI fields. It is not an assessment by NASA.';

function ShortSummary({ record, entry }: { record: CatalogRecord; entry: SummaryEntry | undefined }) {
  if (entry) {
    return (
      <>
        <AiLabel model={entry.model} reviewed={entry.reviewed} />
        <p>{entry.summary}</p>
      </>
    );
  }
  const text = record.objectives ?? '';
  return (
    <>
      <PsiTextLabel />
      <p>{text.length > SHORT_SUMMARY ? `${text.slice(0, SHORT_SUMMARY)}…` : text || '— not in the PSI record'}</p>
    </>
  );
}

function Breakdown({ item }: { item: RankedInvestigation }) {
  return (
    <details>
      <summary>Score breakdown</summary>
      <ul>
        {item.breakdown.map((factor) => (
          <li key={factor.id}>
            {FACTOR_LABELS[factor.id]}:{' '}
            {factor.status === 'not-assessed' ? '⊘ not assessed' : `${factor.points} of ${factor.maxPoints}`} — {factor.evidence}
          </li>
        ))}
      </ul>
    </details>
  );
}

function RankedItem({ item, rank, record, entry }: { item: RankedInvestigation; rank: number; record: CatalogRecord; entry: SummaryEntry | undefined }) {
  const { accession, curated } = item.investigation;
  return (
    <li>
      <h3>
        #{rank} {accession} {record.acronym ? `(${record.acronym}) ` : ''}
        {record.title}
      </h3>
      <p className="ranking-score">
        {item.score} of {item.maximumScore} points
        {item.basedOnUnreviewedTags ? ' · ◐ based on unreviewed tags' : ''}
      </p>
      <p className="ranking-meta">
        Fuel phase: {curated.fuelPhase.value.join(', ') || '—'} · Topics: {curated.topics.value.join(', ') || '—'}
      </p>
      {item.note ? <p>{item.note}</p> : null}
      <ShortSummary record={record} entry={entry} />
      <Breakdown item={item} />
      <p className="ranking-links">
        <a href={`#/investigation/${accession}`}>Details</a> · <a href={`#/compare?ids=${accession}`}>Compare</a> ·{' '}
        <PsiLink accession={accession} />
      </p>
    </li>
  );
}

function HowItWorks({ profile, sourceUrl }: { profile: RankingProfile; sourceUrl: string }) {
  return (
    <details>
      <summary>How this ranking works</summary>
      <p>{DISCLAIMER}</p>
      <p>
        Weights and wording come from the{' '}
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
          official challenge statement
        </a>
        . Profile: {profile.label}.
      </p>
      <ul>
        {(Object.entries(profile.factors) as [FactorId, NonNullable<RankingProfile['factors'][FactorId]>][]).map(([id, factor]) => (
          <li key={id}>
            <strong>
              {FACTOR_LABELS[id]} (up to {factor.maxPoints} points)
            </strong>
            : {factor.rationale} <q>{factor.sourceQuote}</q>
          </li>
        ))}
      </ul>
    </details>
  );
}

interface RankingData {
  records: CatalogRecord[];
  profiles: RankingProfile[];
  sourceUrl: string;
  coverage: ReturnType<typeof testCoverageByAccession>;
  summaries: SummaryEntry[];
}

function RankingScreen({ data }: { data: RankingData }) {
  const [profileId, setProfileId] = useState(data.profiles[0].id);
  const [filters, setFilters] = useState<RankingFilters>(NO_RANKING_FILTERS);
  const profile = data.profiles.find((p) => p.id === profileId) ?? data.profiles[0];
  const ranked = rankInvestigations(data.records, profile, data.coverage);
  const options = rankingFilterOptions(ranked);
  const shown = filterRanked(ranked, filters);
  const recordOf = (accession: string) => data.records.find((r) => r.accession === accession)!;

  return (
    <>
      <label className="ranking-profile">
        Environment{' '}
        <select value={profile.id} onChange={(event) => setProfileId(event.target.value)}>
          {data.profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
       <fieldset className="ranking-filters">
        <legend>Filters</legend>
        <label>
          Fuel phase{' '}
          <select value={filters.fuelPhase ?? ''} onChange={(e) => setFilters({ ...filters, fuelPhase: e.target.value || null })}>
            <option value="">All</option>
            {options.fuelPhases.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>{' '}
        <label>
          Topic{' '}
          <select value={filters.topic ?? ''} onChange={(e) => setFilters({ ...filters, topic: e.target.value || null })}>
            <option value="">All</option>
            {options.topics.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </fieldset>
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
        <ol className="ranking-list">
          {shown.map(({ item, rank }) => (
            <RankedItem
              key={item.investigation.accession}
              item={item}
              rank={rank}
              record={recordOf(item.investigation.accession)}
              entry={findSummary(data.summaries, item.investigation.accession)}
            />
          ))}
        </ol>
      )}
      <HowItWorks profile={profile} sourceUrl={data.sourceUrl} />
    </>
  );
}

export function Ranking() {
  const catalog = useDataResult(getCatalog);
  const experiments = useDataResult(getExperiments);
  const profiles = useDataResult(getRankingProfiles);
  const summaries = useDataResult(getSummaries);

  // Summaries are optional: without them every item falls back to the PSI text.
  return (
    <>
      <h1>Investigation ranking</h1>
      <p className="view-intro">Explore source-backed investigations ranked by a transparent team heuristic, not a NASA assessment.</p>
      <DataState state={catalog} label="The list of investigations">
        {(catalogFile) => (
          <DataState state={experiments} label="The test data">
            {(experimentsFile) => (
              <DataState state={profiles} label="The ranking profiles">
                {(profilesFile) => (
                  <RankingScreen
                    data={{
                      records: catalogFile.records,
                      profiles: profilesFile.profiles,
                      sourceUrl: profilesFile.source.url,
                      coverage: testCoverageByAccession(experimentsFile.investigations),
                      summaries: summaries.status === 'ok' ? summaries.data.entries : [],
                    }}
                  />
                )}
              </DataState>
            )}
          </DataState>
        )}
      </DataState>
    </>
  );
}
