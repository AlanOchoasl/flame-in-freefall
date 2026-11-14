// Temporary screens: each owner replaces its component when their view is built.

export const Ranking = () => <h1>Ranking</h1>;
export const Compare = () => <h1>Compare</h1>;
export const CoverageMap = () => <h1>Coverage map</h1>;

export const NotFound = ({ requested, message }: { requested: string; message?: string }) => (
  <>
    <h1>Not found</h1>
    {message ? <p>{message}</p> : null}
    <p>
      Nothing at <code>{requested}</code>. <a href="#/ranking">Go to Ranking</a>.
    </p>
  </>
);
