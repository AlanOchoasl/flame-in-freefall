import { MAX_SELECTED } from '../views/compare/selection';

// The explorer's choices live in the address, e.g. "#/ranking?profile=detection&ids=PSI-47,PSI-25".
// Everything here is pure: parse, validate against the loaded data, serialize and build links.

export interface ExplorerState {
  /** Environment profile id. */
  profile: string | null;
  /** The investigation shown in the interpretation panel. */
  selected: string | null;
  /** The comparison, at most MAX_SELECTED accessions. */
  ids: string[];
  /** The map's investigation filter. */
  investigation: string | null;
  flame: string | null;
  fuel: string | null;
  /** Ignition results the map leaves out, e.g. ["no", "flash"]. */
  hide: string[];
  /** "in": the map shows only the tests inside the expected Moon-base zone. */
  zone: string | null;
}

export const NO_EXPLORER_STATE: ExplorerState = {
  profile: null,
  selected: null,
  ids: [],
  investigation: null,
  flame: null,
  fuel: null,
  hide: [],
  zone: null,
};

// The order the parameters are written in, so the same state always gives the same address.
const KEYS = ['profile', 'selected', 'ids', 'investigation', 'flame', 'fuel', 'hide', 'zone'] as const;

const text = (query: URLSearchParams, key: string): string | null => {
  const value = query.get(key)?.trim();
  return value ? value : null;
};

const unique = (values: string[]): string[] => [...new Set(values)];

export function parseExplorerQuery(query: URLSearchParams): ExplorerState {
  const ids = unique((query.get('ids') ?? '').split(',').map((id) => id.trim()).filter(Boolean)).slice(0, MAX_SELECTED);
  return {
    profile: text(query, 'profile'),
    selected: text(query, 'selected'),
    ids,
    investigation: text(query, 'investigation'),
    flame: text(query, 'flame'),
    fuel: text(query, 'fuel'),
    hide: unique((query.get('hide') ?? '').split(',').map((value) => value.trim()).filter(Boolean)),
    zone: text(query, 'zone'),
  };
}

/** What the loaded data accepts. A list left out means "do not check that choice". */
export interface KnownValues {
  profiles?: string[];
  /** Every investigation in the catalog: valid for `selected` and `ids`. */
  accessions?: string[];
  /** Investigations that have test rows: valid for the map's `investigation` filter. */
  accessionsWithTests?: string[];
  flames?: string[];
  fuels?: string[];
  outcomes?: string[];
  zones?: string[];
}

const accepted = (value: string | null, known: string[] | undefined): string | null =>
  value !== null && (known === undefined || known.includes(value)) ? value : null;

/** Drops every value the data does not know, so the page falls back to its default instead of failing. */
export function cleanExplorerState(state: ExplorerState, known: KnownValues): ExplorerState {
  return {
    profile: accepted(state.profile, known.profiles),
    selected: accepted(state.selected, known.accessions),
    ids: state.ids.filter((id) => known.accessions === undefined || known.accessions.includes(id)).slice(0, MAX_SELECTED),
    investigation: accepted(state.investigation, known.accessionsWithTests),
    flame: accepted(state.flame, known.flames),
    fuel: accepted(state.fuel, known.fuels),
    hide: state.hide.filter((value) => known.outcomes === undefined || known.outcomes.includes(value)),
    zone: accepted(state.zone, known.zones),
  };
}

export const mergeExplorerState = (state: ExplorerState, patch: Partial<ExplorerState>): ExplorerState => ({
  ...state,
  ...patch,
});

/** The query string without the leading "?". Defaults (null, empty list) are left out. */
export function serializeExplorerQuery(state: ExplorerState): string {
  const params = new URLSearchParams();
  for (const key of KEYS) {
    if (key === 'ids' || key === 'hide') {
      if (state[key].length > 0) params.set(key, state[key].join(','));
    } else if (state[key] !== null) {
      params.set(key, state[key]);
    }
  }
  // Commas in a list stay readable: "ids=PSI-47,PSI-25".
  return params.toString().replace(/%2C/g, ',');
}

export function explorerHash(path: string, state: ExplorerState): string {
  const query = serializeExplorerQuery(state);
  return query === '' ? `#${path}` : `#${path}?${query}`;
}

/** A link to `path` that keeps the explorer choices of the current address and drops any other parameter. */
export const carryExplorerState = (path: string, query: URLSearchParams): string =>
  explorerHash(path, parseExplorerQuery(query));

/** The current hash with a patch applied to its explorer choices; the route stays the same. */
export function patchHash(hash: string, patch: Partial<ExplorerState>): string {
  const withoutHash = hash.replace(/^#/, '');
  const [path = '/', search = ''] = withoutHash.split('?');
  const state = mergeExplorerState(parseExplorerQuery(new URLSearchParams(search)), patch);
  return explorerHash(path === '' ? '/' : path, state);
}

export const EXPLORER_QUERY_CHANGE = 'explorer-query-change';

/**
 * Changes the explorer choices in the address without adding a history entry. `hashchange` does not
 * fire for `replaceState`, so a small event tells the router to read the address again.
 */
export function replaceExplorerState(patch: Partial<ExplorerState>): void {
  const next = patchHash(window.location.hash, patch);
  if (next === window.location.hash) return;
  window.history.replaceState(window.history.state, '', next);
  window.dispatchEvent(new Event(EXPLORER_QUERY_CHANGE));
}
