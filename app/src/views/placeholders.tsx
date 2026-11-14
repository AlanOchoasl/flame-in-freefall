

export const NotFound = ({ requested, message }: { requested: string; message?: string }) => (
  <>
    <h1>Not found</h1>
    {message ? <p>{message}</p> : null}
    <p>
      Nothing at <code>{requested}</code>. <a href="#/ranking">Go to Ranking</a>.
    </p>
  </>
);
