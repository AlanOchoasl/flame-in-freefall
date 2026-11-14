# Tasks

Tasks are unassigned; each contributor claims a numbered group before starting. Target: before Sunday 12:00 (Argentina); feature freeze Sunday 16:00. No task should exceed 2 hours. All data comes from cached processed JSON; if a file fails, preserve the current error state instead of inserting mock values.

## 1. Reconcile design authority

- [x] 1.1 (Sat by 20:00, ≤1h) Update the still-open `design-system` light-only spec, design and proposal and mark `docs/DESIGN_PROMPT.md` as superseded by `docs/design/DIRECTION_CONCEPT.md`; verify no active planning artifact still instructs implementers to ship light-only.

## 2. Shared frame and theme

- [x] 2.1 (Sun by 09:00, ≤2h) Add dark/light semantic tokens and theme-aware aliases to `app/src/styles.css`, preserving current component names and `44px` targets; verify both themes on all existing routes and no external assets.
- [x] 2.2 (Sun by 09:30, ≤1h) Build compact header, non-monitoring notice, PSI attribution and accessible Light/Dark selector in `App.tsx`; verify system preference, manual selection, route focus and 360px Menu behavior.

## 3. Working screens

- [x] 3.1 (Sun by 10:00, ≤2h) Restyle Ranking and Compare as compact panels with legible source-backed scores and missing-data statuses; verify profile/filter/compare actions and keyboard focus are unchanged.
- [x] 3.2 (Sun by 11:00, ≤2h) Restyle Coverage map and overlay/marker tokens using real processed tests, dashed expected zone and table alternative; verify filter counts, legend shapes, selected details and no invented points in both themes.
- [x] 3.3 (Sun by 11:30, ≤1h) Apply the panel/citation/AI-label language to Investigation detail, About and shared loading/empty/error states; verify all links, review labels and missing data remain truthful.

## 4. Cross-route integration

- [x] 4.1 (Sun by 12:00, ≤1h) Build and run the demo-path checks at 360px and desktop in dark/light with Tab navigation; verify no horizontal page scroll, plot/table parity, readable labels and no synthetic example values in `app/`.

## Workflow follow-up

- Review and archive only after implementation and project verification are complete.
