import { useEffect } from 'react';
import { DataState } from '../../components/DataState';
import { MetricTile, Panel } from '../../components/Panel';
import { getCatalog, getExperiments, getRankingProfiles, getSummaries } from '../../data/dataAccess';
import { useDataResult } from '../../data/useDataResult';
import { rankInvestigations } from '../../lib/ranking';
import { explorerHash, parseExplorerQuery, replaceExplorerState } from '../../router/explorerQuery';
import { SECTION_CHANGE, visibleSection, type Band, type ConsoleSectionId } from '../../router/visibleSection';
import { CompareBody } from '../compare/Compare';
import { parseSelection } from '../compare/selection';
import { CoverageMapBody, mapFiltersFromQuery, writeMapFilters } from '../coverageMap/CoverageMap';
import { findSummary } from '../detailModel';
import { testCoverageByAccession } from '../rankingPosition';
import type { ViewProps } from '../types';
import { consoleMetrics, profileDescription } from './consoleModel';
import { BoundariesPanel, GapsPanel, InterpretationPanel, RankingPanel } from './SidePanels';

const SECTION_IDS: Record<string, string> = { compare: 'comparison', map: 'coverage' };

// The routes #/ranking, #/compare and #/map open this one page and scroll to their section.
export function Console({ query, section = 'ranking' }: ViewProps) {
  const catalog = useDataResult(getCatalog);
  const experiments = useDataResult(getExperiments);
  const profiles = useDataResult(getRankingProfiles);
  const summaries = useDataResult(getSummaries);
  // The profile, the selected investigation, the comparison and the map filters live in the address.
  const explorer = parseExplorerQuery(query);
  const knownSelected =
    catalog.status === 'ok' && catalog.data.records.some((record) => record.accession === explorer.selected) ? explorer.selected : null;

  // While the page scrolls, tell the header which section is being read so its menu follows.
  useEffect(() => {
    const ids: ConsoleSectionId[] = ['ranking', 'comparison', 'coverage'];
    let frame = 0;
    const report = () => {
      frame = 0;
      const bands: Partial<Record<ConsoleSectionId, Band>> = {};
      for (const id of ids) {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        if (rect) bands[id] = { top: rect.top, bottom: rect.bottom };
      }
      window.dispatchEvent(new CustomEvent(SECTION_CHANGE, { detail: visibleSection(bands, window.innerHeight * 0.35) }));
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(report);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  // A deep link to a section scrolls there on the first load; later route changes move focus instead.
  useEffect(() => {
    const target = SECTION_IDS[section];
    if (target) document.getElementById(target)?.scrollIntoView();
  }, []);

  return (
    <div className="console-page">
      <section className="page-heading" aria-labelledby="console-title">
        <div>
          <p className="eyebrow">EXPLORATION CONTEXT / RELEVANCE RANKING</p>
          <h1 id="console-title">Investigation explorer</h1>
        </div>
        <DataState state={profiles} label="The ranking profiles">
          {(file) => {
            const active = file.profiles.find((profile) => profile.id === explorer.profile) ?? file.profiles[0];
            return (
              <div className="profile-picker">
                <p id="profile-label" className="profile-label">
                  Environment profile
                </p>
                <div className="profile-control" role="group" aria-labelledby="profile-label">
                  {file.profiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      aria-pressed={profile.id === active.id}
                      onClick={() => replaceExplorerState({ profile: profile.id === file.profiles[0].id ? null : profile.id })}
                    >
                      {profile.label}
                    </button>
                  ))}
                </div>
                <p className="profile-description">{profileDescription(active)}</p>
              </div>
            );
          }}
        </DataState>
      </section>

      <DataState state={catalog} label="The dataset totals">
        {(catalogFile) => (
          <DataState state={experiments} label="The dataset totals">
            {(experimentsFile) => {
              const metrics = consoleMetrics(catalogFile.records.length, experimentsFile);
              return (
                <section className="metrics" aria-label="Dataset totals">
                  <MetricTile value={metrics.investigations} label="investigations in catalog" />
                  <MetricTile value={metrics.tests} label="normalized test records" />
                  <MetricTile
                    value={metrics.withTests}
                    label={`of ${metrics.investigations} investigations have test data`}
                    hint="The map shows only these"
                  />
                  <MetricTile
                    value={metrics.inZone}
                    label="inside expected lunar zone"
                    hint="Show them on the map"
                    href={explorerHash('/map', { ...explorer, zone: 'in' })}
                  />
                </section>
              );
            }}
          </DataState>
        )}
      </DataState>

      <div className="workspace">
        <div className="main-column">
          <Panel id="coverage" title="Test conditions · O₂ × pressure" subtitle="The quantitative coverage map · one point per plottable test" routeFocus={section === 'map'}>
            <DataState state={experiments} label="The test data">
              {(file) => (
                <CoverageMapBody records={file.records} filters={mapFiltersFromQuery(query, file.records)} onFiltersChange={writeMapFilters} />
              )}
            </DataState>
          </Panel>
          <Panel id="comparison" title="Compare investigations" subtitle="Shared and different evidence · PSI source-linked" routeFocus={section === 'compare'}>
            <CompareBody query={query} />
          </Panel>
        </div>

        <div className="side-column">
          <DataState state={catalog} label="The list of investigations">
            {(catalogFile) => (
              <DataState state={experiments} label="The test data">
                {(experimentsFile) => (
                  <DataState state={profiles} label="The ranking profiles">
                    {(profilesFile) => {
                      const profile = profilesFile.profiles.find((p) => p.id === explorer.profile) ?? profilesFile.profiles[0];
                      const coverage = testCoverageByAccession(experimentsFile.investigations);
                      const ranked = rankInvestigations(catalogFile.records, profile, coverage);
                      const firstRanked = ranked[0].investigation.accession;
                      const record = catalogFile.records.find((r) => r.accession === explorer.selected) ?? catalogFile.records.find((r) => r.accession === firstRanked)!;
                      const selectedAccession = record.accession;
                      const entries = summaries.status === 'ok' ? summaries.data.entries : [];
                      return (
                        <>
                          <RankingPanel
                            id="ranking"
                            ranked={ranked}
                            records={catalogFile.records}
                            profile={profile}
                            sourceUrl={profilesFile.source.url}
                            coverage={coverage}
                            selected={selectedAccession}
                            compareIds={parseSelection(query, catalogFile.records.map((r) => r.accession))}
                            query={query}
                            onSelect={(accession) => replaceExplorerState({ selected: accession === firstRanked ? null : accession })}
                          />
                          <InterpretationPanel id="interpretation" record={record} entry={findSummary(entries, record.accession)} query={query} />
                          <GapsPanel id="gaps" tests={experimentsFile.records} />
                        </>
                      );
                    }}
                  </DataState>
                )}
              </DataState>
            )}
          </DataState>
        </div>
      </div>

      <BoundariesPanel id="boundaries" selected={knownSelected} query={query} />
    </div>
  );
}
