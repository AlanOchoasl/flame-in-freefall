import { PSI_SEARCH_URL } from './labelText';

// Names the data source on every screen, as required by app-shell.
export function DataSourceNote() {
  return (
    <p className="data-source-note">
      Data: NASA Physical Sciences Informatics (PSI),{' '}
      <a href={PSI_SEARCH_URL} target="_blank" rel="noopener noreferrer">
        Combustion Science repository
      </a>
      . Not an official NASA product.
    </p>
  );
}
