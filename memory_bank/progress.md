# Project Status

## Verified Current State

- React 19 + Vite single-page application is running without a routing library.
- Supabase provides Google OAuth and persistence for practice runs.
- `src/App.jsx` controls theme, authentication/session state, the public landing view, the event lobby, the selected event, and the active module.
- `src/components/events/registry.js` is the source of truth for event workspaces and modules.
- Electric Vehicle is the only registered event. Arc Visualizer, Score Calculator, and Run Logger are live; the remaining EV modules render `ComingSoon`.
- Event-specific code is isolated under `src/components/events/electricvehicle/`.
- The UI uses CSS custom properties and a `data-theme` attribute for light/dark themes.

## Known Technical Debt

- Supabase URL and anon key are currently hardcoded in `src/supabaseClient.js`; move them to Vite environment variables before treating configuration as production-safe.
- Some navigation and event cards use clickable `div` elements and JavaScript hover handlers instead of semantic controls and CSS states.
- Several components use hardcoded colors and inline SVGs despite the stated design rules.
- `RunLogger` uses dummy fallback records when the database request fails, which can make unavailable data look real.
- Mutation feedback, error presentation, and authenticated delete scoping need review.
- There are no focused automated tests for registry behavior, geometry calculations, score calculations, or persistence workflows.

## Domain Uncertainties

- The 2026 Electric Vehicle score inputs used by the preparation estimator are verified: base score 100, distance score 2.0 pt/cm, time score absolute target/run-time difference, and can bonus `-0.5 x (110 - Inside Can Distance)`.
- The score tool intentionally remains a single-run preparation estimator. Two-run selection, failed-run scoring, event-time bonus, and automatic violation categories are out of scope; users manually enter optional penalty points.
- The arc visualizer is a design estimator. The rules define can placement and track geometry, but do not prescribe a single vehicle turning model.
- Arc terminology and the relationship between the selected inner-can distance and the visualized path still need product clarification.

## Recent Improvements

- Lint is clean across the project.
- Dashboard cards and navigation controls use semantic buttons with CSS hover/focus states.
- Run Logger distinguishes database errors from empty history, prevents duplicate saves, shows delete progress, and scopes deletes by user and event.
- Score calculation is isolated in `scoreUtils.js` and covered by focused Node tests using the official worked example.
- Guest mode is available from the landing page and opens the dashboard with in-memory calculator use; Run Logger requires Google sign-in and does not contact Supabase while in guest mode.
- Backend access is now modular: registry entries declare `requiresAuth`, and `App.jsx` renders the shared `AuthRequired` gate before protected tools mount.

## Working Agreement

- Run `npm run lint` after JavaScript/JSX changes and `npm run build` for changes affecting application integration.
- Keep event calculations and rule-specific behavior inside the owning event directory.
- Record meaningful architecture, scope, behavior, or uncertainty changes here; do not add progress noise for routine edits.

## Next Milestones

1. Consolidate `.clinerules/` around this verified project state and the discovery-question workflow.
2. Resolve security and accessibility mismatches.
3. Verify the Electric Vehicle domain formulas and add focused tests.
4. Improve persistence and error states in `RunLogger`.