# AGENTS.md

Olympiad Studio: React 19 + Vite SPA of rule-grounded Science Olympiad prep tools. No router — navigation is local state in `src/App.jsx`.

Generic best practices (commit policy, cross-session memory habits, a11y/security, working style) live in the global `~/.config/opencode/AGENTS.md` and apply here too. This file holds repo-specific rules only.

## Commands

- `npm run dev` — Vite dev server (base path `/olympiad-studio/`)
- `npm test` — Node's built-in test runner over `tests/`; run one file with `npm test -- tests/electricvehicle-score.test.js`
- `npm run lint`, `npm run build`
- `npm run deploy` — build + `gh-pages -d dist` (GitHub Pages)

`node` is not on this shell's PATH (Windows Node is invoked through npm). Always run scripts via npm, e.g. `npm test`, not `node --test`.

## Start here

- `memory_bank/` (`projectBrief.md`, `systemArchitecture.md`, `decisions.md`, `progress.md`) is the curated project context — read it first and treat its explicit uncertainty notes as unresolved requirements.
- Building or extending an event tool: follow `.opencode/skill/build-event-tool/SKILL.md`.

## Architecture

- `src/components/events/registry.js` is the single source of truth for events/modules. Register new tools there with `id, ti, label, cat, live, requiresAuth, component, desc` plus `eventName, manualReference, eventUrl, rulesUrl`; never hardcode into `App.jsx`/`Home.jsx`. Wire components as `lazy()` imports at the top (see the build-event-tool skill). Unfinished tools use `live: false`; backend tools set `requiresAuth: true` (App gates guests via `AuthRequired`).
- `src/components/events/<event>/` owns that event's formulas, parsing, constants, and UI. Keep event logic out of global files.
- `src/App.jsx` owns theme, auth/session, landing-vs-dashboard gating, selected event, and active module. Preserve the two-level local navigation (event lobby → event workspace/module). Do not add a router or state library without a demonstrated need and approval.
- `src/components/general/` = shared landing/dashboard views.
- `src/supabaseClient.js` is the singleton Supabase client, reading `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (throws if either is missing). Supabase is Google OAuth only — there is no backend data access yet; practice tools persist to browser `localStorage`. Future backend storage must scope by authenticated user + event with RLS, not client-side filters.

## Project conventions

- Theme via `data-theme` on the document root + CSS custom props in `src/index.css`; prefer theme variables over hardcoded colors.
- Use Tabler Icons through the `ti-*` CDN class convention (Tabler pinned at 3.49.0 in `index.html`); avoid hand-rolled SVGs for ordinary icons (tool-internal visualizations may use SVG).
- Flexbox/grid with wrapping; tool panels must stack cleanly on narrow screens. Technical values/units use monospace.
- Match controls to semantics (buttons act, links navigate, checkboxes toggle). Keep hover/focus styling in CSS, not JS mouse handlers.

## Interactivity

Interactive is the Studio's default tool idiom — tools should be live, not a form that only produces text after a button press.

- **Live derivation:** compute displayed values from state during render so they update as the student types or manipulates. Reserve explicit action buttons for side effects (save, export, print, grade, generate), never for recomputing values already in state. References: `boomilever/BoomileverEstimator.jsx`, `electricvehicle/ScoreCalc.jsx`.
- **Direct manipulation when the domain is spatial/graphical** (geometry, circuits, networks, graphs, spectra, time series): render an interactive visual surface, not only numeric readouts. Reference: `circuitlab/CircuitCanvas.jsx` (SVG overlay + positioned DOM; pointer-drag *and* a keyboard/click-to-connect fallback). Hand-rolled SVG is allowed for tool-internal visualizations.
- **Accessibility:** every interactive affordance needs a keyboard path and an accessible name; keep hover/focus styling in CSS.
- **Persistence:** persist meaningful tool state to `localStorage` with corrupt/unavailable handling.
- **Before building or keeping a non-interactive tool, ask:** (a) would a live/interactive version make sense? (b) if not, is the module itself a good idea, or would a different tool be better? Keep a non-interactive tool only when it is genuinely good as-is, and record a one-line justification in its `tool-ideas.md`. Never force interactivity onto a tool where it doesn't fit, and never keep a poor tool just because it's simple. Intrinsically authoring tools (Reference & Study Compiler, run/build logs, note journals) keep explicit Save but must show live derived feedback (e.g. the budget bar / score preview).

## Repo gotchas

- Events follow an `info.md` + `tool-ideas.md` spec pattern (`## Tool:` blocks) — use these as the source spec when building tools.
- Tests load source files with `readFileSync` and regex-match exact strings (e.g. manual citations in `registry.js`). Editing registry copy can break tests.
- `rules/*.pdf` (official manuals) and `.env` are gitignored — never commit or deploy them.
- Update `memory_bank/progress.md` (and append to `decisions.md`) when scope, architecture, behavior, known bugs, or uncertainties change.

## Domain rules

- Never invent Science Olympiad rules or scoring formulas. Cite the manual page/section beside rule-specific summaries and calculators; label assumptions and provisional formulas clearly.
- Current preference: Regional/Invitational scope only unless asked; prefer student-authored data tools over hardcoded quiz/answer banks.
- After domain/UI changes run `npm test`, `npm run lint`, `npm run build`.