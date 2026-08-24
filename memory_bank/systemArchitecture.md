# System Architecture

- **App Controller:** `src/App.jsx` manages global state (Theme, Current View/Event/Module). No routing library.
- **Supabase Client:** `src/supabaseClient.js` sets up the global browser client using `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- **Registry:** `src/components/events/registry.js` is the single source of truth for modules.
- **Event Tools:** `src/components/events/[event-name]/` contains isolated calculation, simulation, and scoring logic.
- **Shell:** `src/components/general/` provides `Home.jsx`, `LandingHome.jsx`, `ComingSoon.jsx`.

Design rules:
- Theme via `document.documentElement.setAttribute('data-theme', theme)`
- CSS variables only (`var(--bg-primary)`, etc.)
- Monospace for numeric/technical data
- Flexbox wrap + responsive CSS grids
- No temporal hoisting; declare fetch/side-effect functions before `useEffect`
- No `Date.now()` or direct side effects in render loop
- Async button states (`loading`/`isPending`) for mutations
- Semantic `<button>`/`<a>` for all interactive elements
- Destructive actions require confirmation/double-click
- Hover states via CSS `:hover` only