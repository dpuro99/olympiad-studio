# AGENTS.md

Olympiad Studio: React 19 + Vite SPA of rule-grounded Science Olympiad prep tools. No router — navigation is local state in `src/App.jsx`.

## Commands

- `npm run dev` — Vite dev server (base path `/olympiad-studio/`)
- `npm test` — Node's built-in test runner over `tests/`; run one file with `npm test -- tests/electricvehicle-score.test.js`
- `npm run lint`, `npm run build`
- `npm run deploy` — build + `gh-pages -d dist` (GitHub Pages)

`node` is not on this shell's PATH (Windows Node is invoked through npm). Always run scripts via npm, e.g. `npm test`, not `node --test`.

## Start here

- `memory_bank/` (`projectBrief.md`, `systemArchitecture.md`, `progress.md`) is the curated project context — read it first and treat its explicit uncertainty notes as unresolved requirements.
- Building or extending an event tool: follow `.opencode/skill/build-event-tool/SKILL.md`.

## Architecture

- `src/components/events/registry.js` is the single source of truth for events/modules. Register new tools there with `id, ti, label, cat, live, requiresAuth, component, desc`; never hardcode into `App.jsx`/`Home.jsx`. Unfinished tools use `live: false`; backend tools set `requiresAuth: true` (App gates guests via `AuthRequired`).
- `src/components/events/<event>/` owns that event's formulas, parsing, constants, and UI. Keep event logic out of global files.
- `src/App.jsx` owns theme, auth/session, landing-vs-dashboard gating, selected event, and active module. Preserve the two-level local navigation (event lobby → event workspace/module). Do not add a router or state library without a demonstrated need and approval.
- `src/components/general/` = shared landing/dashboard views.
- `src/supabaseClient.js` is the singleton Supabase client, reading `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (throws if either is missing). Supabase is Google OAuth only — there is no backend data access yet; practice tools persist to browser `localStorage`. Future backend storage must scope by authenticated user + event with RLS, not client-side filters.

## Conventions

UI and design:
- Theme via `data-theme` on the document root + CSS custom props in `src/index.css`; prefer theme variables over hardcoded colors.
- Use Tabler Icons through the `ti-*` CDN class convention; avoid hand-rolled SVGs for ordinary icons (tool-internal visualizations may use SVG).
- Flexbox/grid with wrapping; tool panels must stack cleanly on narrow screens. Technical values/units use monospace.
- Match controls to semantics (buttons act, links navigate, checkboxes toggle). Keep hover/focus styling in CSS, not JS mouse handlers.

Security, data, accessibility:
- Never hardcode credentials; read from `import.meta.env`. The Supabase anon key is browser configuration, not authorization.
- Distinguish loading/empty/error/demo states; never present fake data as real user history.
- Use semantic `<button>`/`<a>` with accessible names; preserve keyboard focus, disabled states, and contrast in both themes. Destructive actions require confirmation.

Working style:
- Make the smallest root-cause change; keep render pure (side effects in handlers/effects); give mutations pending/success/failure states that prevent duplicate submissions.
- Do not remove code merely because it is inactive; remove only demonstrably dead, harmful, or in-scope code.
- Ask a concise, prioritized set of questions when important details are missing; confirm before destructive operations, broad refactors, dependency/schema changes, credential/config changes, or changes to existing data or public behavior.

## Repo gotchas

- Events follow an `info.md` + `tool-ideas.md` spec pattern — use these as the source spec when building tools.
- Tests load source files with `readFileSync` and regex-match exact strings (e.g. manual citations in `registry.js`). Editing registry copy can break tests.
- `rules/*.pdf` (official manuals) and `.env` are gitignored — never commit or deploy them.
- Update `memory_bank/progress.md` when scope, architecture, behavior, known bugs, or uncertainties change.

## Domain rules

- Never invent Science Olympiad rules or scoring formulas. Cite the manual page/section beside rule-specific summaries and calculators; label assumptions and provisional formulas clearly.
- Current preference: Regional/Invitational scope only unless asked; prefer student-authored data tools over hardcoded quiz/answer banks.
- After domain/UI changes run `npm test`, `npm run lint`, `npm run build`.
