# Tasks

## 1. Background correction (before Sunday 12:00, cap 1 hour)
- [x] 1.1 Fade and mask the gradient edges in both themes; replace bouncing motion with continuous drift and preserve motion preferences.
- [x] 1.2 Run the app build and validate the specification. Inspect desktop/mobile rendering if a browser is available; report any visual verification limitation. No network data is required.

Verification: `npm run build` in `app/` passed (including TypeScript and ranking-profile validation); `openspec validate smooth-ambient-glow --strict` passed; `git diff --check` passed. Vite reports a bundle-size advisory. Visual desktop/mobile verification remains unavailable because the browser could not reach the sandboxed local server in this session.
