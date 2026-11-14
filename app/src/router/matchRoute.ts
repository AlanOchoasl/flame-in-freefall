export interface RouteMatch<V> {
  view: V;
  params: Record<string, string>;
  query: URLSearchParams;
}

// Splits "#/compare?ids=a,b" into a path ("/compare") and its query string.
function parseHash(hash: string): { path: string; query: URLSearchParams } {
  const withoutHash = hash.replace(/^#/, '');
  const [path = '', search = ''] = withoutHash.split('?');
  return { path: path === '' ? '/' : path, query: new URLSearchParams(search) };
}

function matchPath(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const expected = patternParts[i];
    const actual = pathParts[i];
    if (expected.startsWith(':')) {
      if (actual === '') return null;
      params[expected.slice(1)] = decodeURIComponent(actual);
    } else if (expected !== actual) {
      return null;
    }
  }
  return params;
}

export function matchRoute<V extends { path: string }>(hash: string, views: V[]): RouteMatch<V> | null {
  const { path, query } = parseHash(hash);
  for (const view of views) {
    const params = matchPath(view.path, path);
    if (params) return { view, params, query };
  }
  return null;
}
