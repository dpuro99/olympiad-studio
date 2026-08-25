# System Architecture Rules

- The project is a React 19 + Vite SPA using local React state and Supabase JS. Do not add a router or state library without a demonstrated need and user approval.
- `src/App.jsx` owns theme, auth/session state, landing/dashboard gating, selected event, and active module state.
- `src/supabaseClient.js` owns the singleton browser client and must read configuration from Vite environment variables.
- `src/components/events/registry.js` is the source of truth for event and module registration.
- `src/components/events/[event-name]/` owns event-specific UI and domain logic.
- `src/components/general/` owns shared landing, lobby/workspace views, and coming-soon states.

## Registry Contract

New tools must be registered in `registry.js`, not hardcoded into `App.jsx` or `Home.jsx`. Modules use the established `id`, `ti`, `label`, `cat`, `live`, `component`, and `desc` fields. Unfinished tools use `live: false` and `ComingSoon`.

## State and Data Boundaries

- Preserve the two-level local navigation model: event lobby, then event workspace/module.
- Practice-run queries and mutations must include the authenticated user and event identity.
- Client-side filters do not replace Supabase Row Level Security.
- Database errors must not be represented as an empty successful result or as unmarked fake user data.
- Keep event formulas out of global controller files.
