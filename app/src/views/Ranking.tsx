import { useState } from 'react';
import { DataState } from '../components/DataState';
import { PsiLink } from '../components/PsiLink';
import { getCatalog, getExperiments, getRankingProfiles } from '../data/dataAccess';
import type { CatalogFile, ExperimentsFile } from '../data/types';
import { useDataResult } from '../data/useDataResult';
import { rankInvestigations } from '../lib/ranking';
import { filterRanking, rankingFilterOptions, testCoverageByAccession } from '../lib/rankingViewData';
import './Ranking.css';

const profiles = getRankingProfiles().profiles;

export function Ranking() {
  const catalog = useDataResult(getCatalog);
  const experiments = useDataResult(getExperiments);
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? '');
  const [fuelPhase, setFuelPhase] = useState('');
  const [topic, setTopic] = useState('');

  return (
    <section className="ranking">
      <h1>Investigation ranking</h1>
      <p>Explore NASA PSI investigations by relevance to a selected fire-safety context.</p>
      <DataState state={catalog} label="The investigation catalog" isEmpty={(file) => file.records.length === 0}>
        {(catalogFile) => (
          <DataState state={experiments} label="The experimental data">
            {(experimentsFile) => (
              <RankingResults
                catalog={catalogFile}
                experiments={experimentsFile}
                profileId={profileId}
                setProfileId={setProfileId}
                fuelPhase={fuelPhase}
                setFuelPhase={setFuelPhase}
                topic={topic}
                setTopic={setTopic}
              />
            )}
          </DataState>
        )}
      </DataState>
    </section>
  );
}

interface RankingResultsProps {
  catalog: CatalogFile;
  experiments: ExperimentsFile;
  profileId: string;
  setProfileId: (id: string) => void;
  fuelPhase: string;
  setFuelPhase: (phase: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
}

function RankingResults({
  catalog, experiments, profileId, setProfileId, fuelPhase, setFuelPhase, topic, setTopic,
}: RankingResultsProps) {
  const profile = profiles.find((item) => item.id === profileId) ?? profiles[0];
  if (!profile) return <p role="alert">No ranking profiles are available.</p>;

  const options = rankingFilterOptions(catalog.records);
  const ranking = rankInvestigations(catalog.records, profile, testCoverageByAccession(experiments));
  const matches = filterRanking(ranking, fuelPhase, topic);

  return (
    <>
      <div className="ranking-controls">
        <label>
          Environment profile
          <select value={profile.id} onChange={(event) => setProfileId(event.target.value)}>
            {profiles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label>
          Fuel phase
          <select value={fuelPhase} onChange={(event) => setFuelPhase(event.target.value)}>
            <option value="">All fuel phases</option>
            {options.fuelPhases.map((phase) => <option key={phase} value={phase}>{phase}</option>)}
          </select>
        </label>
        <label>
          Topic
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="">All topics</option>
            {options.topics.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>
      <p className="ranking-count" role="status">
        {matches.length} of {ranking.length} investigations match
      </p>
      {matches.length === 0 ? (
        <div role="status">
          <p>No investigations match these filters.</p>
          <button type="button" onClick={() => { setFuelPhase(''); setTopic(''); }}>Clear filters</button>
        </div>
      ) : (
        <ol className="ranking-list">
          {matches.map((item) => {
            const record = catalog.records.find((entry) => entry.accession === item.investigation.accession);
            return (
              <li key={item.investigation.accession}>
                <div className="ranking-item-heading">
                  <div>
                    <h2>{item.investigation.accession} · {record?.title ?? 'Untitled investigation'}</h2>
                    <PsiLink accession={item.investigation.accession} doi={record?.doi} />
                  </div>
                  <strong className="ranking-score">{item.score} / {item.maximumScore} pts</strong>
                </div>
                {item.note && <p>{item.note}</p>}
                <details>
                  <summary>Score breakdown</summary>
                  <ul className="ranking-breakdown">
                    {item.breakdown.map((factor) => (
                      <li key={factor.id}>
                        <strong>{factor.id.replace(/([A-Z])/g, ' $1').toLowerCase()}</strong>
                        {' · '}{factor.status === 'not-assessed' ? 'Not assessed' : `${factor.points} / ${factor.maxPoints} pts`}
                        <p>{factor.evidence}</p>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
