import type { ViewProps } from './types';

// Temporary screens: each owner replaces its component when their view is built.

export const Compare = () => <h1>Compare</h1>;
export const CoverageMap = () => <h1>Coverage map</h1>;

export const InvestigationDetail = ({ params }: ViewProps) => <h1>Investigation {params.accession}</h1>;

export const NotFound = ({ requested }: { requested: string }) => (
  <>
    <h1>Not found</h1>
    <p>
      Nothing at <code>{requested}</code>. <a href="#/ranking">Go to Ranking</a>.
    </p>
  </>
);
