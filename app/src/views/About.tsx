import { DataState } from '../components/DataState';
import { PsiLink } from '../components/PsiLink';
import { PSI_SEARCH_URL } from '../components/labelText';
import { getCatalog, getExperiments, getSummaries } from '../data/dataAccess';
import { useDataResult } from '../data/useDataResult';
import { summariseAiUse } from './aiUse';

const LICENSES_URL = 'https://github.com/AlanOchoasl/flame-in-freefall/blob/main/THIRD_PARTY_LICENSES.md';

function AiUseDetails() {
  const summaries = useDataResult(getSummaries);

  return (
    <DataState state={summaries} label="The AI-use details">
      {(file) => {
        const facts = summariseAiUse(file.entries);
        if (facts.total === 0) return <p>No AI summaries have been generated yet.</p>;
        return (
          <ul>
            <li>
              Summaries: {facts.total}, of which {facts.reviewed} reviewed by a person.
            </li>
            <li>Model: {facts.models.join(', ')}.</li>
            <li>Prompt version: {facts.promptVersions.join(', ')}.</li>
            <li>
              Generated: {facts.firstGenerated}
              {facts.lastGenerated !== facts.firstGenerated ? ` to ${facts.lastGenerated}` : ''}.
            </li>
          </ul>
        );
      }}
    </DataState>
  );
}

function DataCoverage() {
  const experiments = useDataResult(getExperiments);
  return (
    <DataState state={experiments} label="The test data">
      {(file) => {
        const plottable = file.records.filter((record) => record.isPlottable).length;
        const withTests = file.investigations.filter((summary) => summary.records > 0).length;
        return (
          <p>
            Today the app holds {file.records.length} normalized tests from {withTests} investigation{withTests === 1 ? '' : 's'}; {plottable} of them have both
            oxygen and pressure and appear on the coverage map.
          </p>
        );
      }}
    </DataState>
  );
}

function InvestigationSources() {
  const catalog = useDataResult(getCatalog);

  return (
    <DataState state={catalog} label="The list of investigations">
      {(file) => (
        <details>
          <summary>The {file.records.length} investigations and their PSI pages</summary>
          <ul>
            {file.records.map((record) => (
              <li key={record.accession}>
                {record.title ?? record.accession} — <PsiLink accession={record.accession} doi={record.doi} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </DataState>
  );
}

export function About() {
  return (
    <>
      <h1>About</h1>

      <section className="research-panel"><h2>What is this</h2>
      <p>
        A dashboard to find, rank and compare the NASA combustion investigations on fire in microgravity, built for the
        NASA Space Apps Challenge 2026, challenge &ldquo;Flame in Freefall&rdquo;.
      </p>
      <p>
        <strong>This is not an official NASA product.</strong> NASA does not endorse it.
      </p>
      </section>

      <section className="research-panel"><h2>How AI was used</h2>
      <p>
        Plain-language summaries were written by AI before the app was built, using only each investigation&rsquo;s own
        PSI text. Every summary is labeled as AI-generated and shows its model and whether a person reviewed it. The
        app does not call any AI service while you use it. The ranking and the coverage map are computed by ordinary
        code from the data and use no AI.
      </p>
      <p>
        The summaries were written with Google Gemini. The app&rsquo;s code, tests and documentation were written with
        the help of an AI coding assistant, Claude Code (Anthropic), directed and reviewed by the team.
      </p>
      <AiUseDetails />
      </section>

      <section className="research-panel"><h2>Data sources</h2>
      <p>
        All data comes from the NASA Physical Sciences Informatics (PSI) repository:{' '}
        <a href={PSI_SEARCH_URL} target="_blank" rel="noopener noreferrer">
          Combustion Science
        </a>
        . The test conditions on the coverage map come from the experimental tables of PSI-159 (license CC0-1.0).
      </p>
      <DataCoverage />
      <InvestigationSources />
      </section>

      <section className="research-panel"><h2>Known limits</h2>
      <ul>
        <li>PSI holds no partial-gravity combustion data, so nothing here covers Moon or Mars gravity.</li>
        <li>
          The coverage map shows tests from PSI-159 only. They burn gaseous fuels, not spacecraft materials.
        </li>
        <li>
          The experimental tables of PSI-10 (DOI 10.60555/w4zy-bt45) are not used: PSI declares no license for that
          investigation, and this project uses no dataset without a verified license.
        </li>
        <li>
          The Moon-base zone (30% oxygen or more, 10.2 psi or less) is the expected range given in the challenge
          statement, not a final design value.
        </li>
        <li>The ranking is a rule-based heuristic made by this team, not an assessment by NASA.</li>
        <li>Some curated tags (fuel phase, topics, measurements) may not be reviewed yet; they are marked where shown.</li>
      </ul>
      </section>

      <section className="research-panel"><h2>Open-source licenses</h2>
      <p>
        <a href={LICENSES_URL} target="_blank" rel="noopener noreferrer">
          Third-party licenses
        </a>{' '}
        lists the libraries this app uses. The fonts (Space Grotesk, Inter and JetBrains Mono) are bundled with the app under the SIL Open Font License 1.1, so
        no font is requested from another site.
      </p>
      </section>
    </>
  );
}
