# Olympiad Studio — Project Brief

Olympiad Studio is a registry-driven React (Vite SPA) workspace platform for Science Olympiad teams. It uses a centralized module registry (`src/components/events/registry.js`) to load event-specific engineering tools, visualizers, and loggers without hardcoding modules into dashboard layouts.

- **Frontend:** React + Vite (single-page, no routing library)
- **Backend:** Supabase (client-side SDK, Row Level Security)
- **Styling:** Centralized CSS custom properties (`src/index.css`) with light/dark theme support via `data-theme`
- **Icons:** Tabler Icons via CDN (`ti ti-[name]`)
- **Architecture:** Registry-driven; all modules registered in `registry.js`; unfinished features use `live: false` or `ComingSoon`

Key constraints: no hardcoded API credentials, semantic interactive elements (`<button>`/`<a>`), monospace typography for numeric/technical data, pure CSS hover states, and clean async UI feedback for mutations.