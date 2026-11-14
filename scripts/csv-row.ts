// One parsed CSV row. Kept in its own file with no imports: the app type-checks the experiment
// types (scripts/experiment-record.ts), and Vercel installs only app/, so nothing it reaches may
// import node:fs or csv-parse.
export type CsvRow = Record<string, string>;
