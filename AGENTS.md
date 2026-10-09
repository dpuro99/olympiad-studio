# AGENTS.md

Olympiad Studio: React 19 + Vite SPA of rule-grounded Science Olympiad prep tools. No router — navigation is local state in `src/App.jsx`.

## Commands

- `npm run dev` — Vite dev server (base path `/olympiad-studio/`)
- `npm test` — Node's built-in test runner over `tests/`; run one file with `npm test -- tests/electricvehicle-score.test.js`
- `npm run lint`, `npm run build`
- `npm run deploy` — build + `gh-pages -d dist` (GitHub Pages)

`node` is not on this shell's PATH (Windows Node is invoked through npm). Always run scripts via npm, e.g. `npm test`, not `node --test`.

## Baseline is not green — check before blaming your change

- `npm test`: 4 pre-existing failures — `tests/anatomy-notes.test.js`; a `'Tier 3'` expectation in `tests/boomilever-estimator.test.js`; manual-citation regex mismatches in `tests/dynamicplanet-freshwater.test.js` and `tests/dynamicplanet-circuitlab.test.js`.
- `npm run lint`: 13 pre-existing errors in `anatomy/AnatomyPractice.jsx`, `anatomy/anatomyNotes.js`, `circuitlab/CircuitLabPractice.jsx`.

## Start here

- `memory_bank/` (`projectBrief.md`, `systemArchitecture.md`, `progress.md`) is treated as verified project context — read it first.
- `.clinerules/` (`architecture.md`, `agent-behavior.md`, `ui-and-design.md`, `security-and-data.md`) holds the binding conventions. `.github/agents/ToolBuilder.agent.md` documents the tool-building workflow.

## Architecture

- `src/components/events/registry.js` is the single source of truth for events/modules. Register new tools there with `id, ti, label, cat, live, requiresAuth, component, desc`; never hardcode into `App.jsx`/`Home.jsx`. Unfinished tools use `live: false` + `ComingSoon`; backend tools set `requiresAuth: true` (App gates guests via `AuthRequired`).
- `src/components/events/<event>/` owns that event's formulas, parsing, constants, and UI. Keep event logic out of global files.
- `src/components/general/` = shared landing/dashboard/coming-soon views.
- Supabase provides Google OAuth. `src/supabaseClient.js` is the singleton client and reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (throws if either is missing). Practice runs live in the `practice_runs` table and must be filtered by authenticated user + event; RLS is the real guard, not client filters.

## Repo gotchas

- Events follow an `info.md` + `tool-ideas.md` spec pattern inside their folder — use these as the source spec when building tools.
- Stale, unregistered event folders exist under `src/components/events/`: `entomology/`, `machines/`, `metricmastery/`. They are not on the 2027 slate — do not wire them into the registry.
- Tests load source files with `readFileSync` and regex-match exact strings (e.g. manual citations in `registry.js`). Editing registry copy can break tests.
- `rules/*.pdf` (official manuals) and `.env` are gitignored — never commit or deploy them. Style via `data-theme` on the document root + CSS custom props in `src/index.css`; use Tabler Icons through the `ti-*` CDN class convention; technical values/units use monospace.

## Domain rules

- Never invent Science Olympiad rules or scoring formulas. Cite the manual page/section beside rule-specific summaries and calculators.
- Current preference: Regional/Invitational scope only unless asked; prefer student-authored data tools over hardcoded quiz/answer banks.
- After domain/UI changes run `npm test`, `npm run lint`, `npm run build`, and update `memory_bank/progress.md` when scope, architecture, or behavior changes.
