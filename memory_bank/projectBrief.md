# Olympiad Studio: Project Brief

## Product Purpose

Olympiad Studio is a focused workspace platform for Science Olympiad teams. It brings event-specific preparation tools and practice tracking into one registry-driven React application.

The product should feel like a practical engineering workbench: clear about units and assumptions, and trustworthy about what is official versus provisional.

## Current Scope

- The frontend is a React 19 + Vite single-page application with local state navigation and no routing library.
- Google sign-in is handled through Supabase Auth; practice journal persistence uses Supabase.
- The event registry includes only the events represented in this project that appear on the official 2027 B/C event slate.
- Electric Vehicle has a high-level objective summary and generic practice journal. Numeric scoring and rule-specific tools are disabled pending verification against the complete 2027 Rules Manual.
- Other event workspaces currently provide official-source links; rule-specific tools are not yet implemented.

## Product Truthfulness

- The official current-year Science Olympiad Rules Manual is authoritative. Event-page summaries, prior-year notes, and practice resources do not replace it.
- Do not invent or infer official rules or scoring formulas.
- Rule-specific calculations must cite the verified rule provision and account for current corrections and clarifications.
- Unverified draft notes must not be presented as current rules.

## Technical Conventions

- Supabase is the backend service and should use Vite environment variables for browser configuration.
- `src/components/events/registry.js` is the source of truth for event and module registration.
- Event-specific formulas, parsing, and UI belong inside the owning event directory.
- Theme tokens are defined in `src/index.css` and applied through `data-theme`.
- Unfinished functionality uses `live: false` and `ComingSoon`.