# Olympiad Studio

React 19 + Vite single-page app of rule-grounded Science Olympiad preparation tools. Event workspaces are registered in `src/components/events/registry.js`; navigation is local state in `src/App.jsx` (no router).

## Setup

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

`src/supabaseClient.js` throws if either Supabase env var is missing. Supabase currently provides Google OAuth only; practice tools persist explicitly to browser `localStorage`.

## Scripts

- `npm run dev` — Vite dev server (base path `/olympiad-studio/`)
- `npm test` — Node's built-in test runner over `tests/`; single file: `npm test -- tests/electricvehicle-score.test.js`
- `npm run lint` — ESLint
- `npm run build` — production build to `dist/`
- `npm run deploy` — build then publish `dist/` with `gh-pages`

Node is invoked through npm; there is no standalone `node` on the shell PATH.

## Contributing

See `AGENTS.md` for commands, conventions, and gotchas, and `.opencode/skill/build-event-tool/SKILL.md` for the event-tool workflow. `memory_bank/` holds project context. New tools must be registered in `registry.js`; event-specific logic stays inside its event folder. Never commit the official rule manuals in `rules/` or `.env`.
