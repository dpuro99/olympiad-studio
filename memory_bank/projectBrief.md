# Olympiad Studio: Project Brief

## Product Purpose

Olympiad Studio is a focused workspace platform for Science Olympiad teams. It brings event-specific engineering calculations, visualizers, practice logging, and competition preparation into one registry-driven React application.

The product should feel like a practical engineering workbench: dense enough for repeated use, clear about units and assumptions, and trustworthy about what is official versus provisional.

## Current Scope

- The frontend is a React 19 + Vite single-page application with local state navigation and no routing library.
- Google sign-in is handled through Supabase Auth. Signed-in users enter the dashboard; signed-out users see the public landing page.
- Electric Vehicle (Division C) is the only registered event workspace.
- Live EV tools are Arc Visualizer, Score Calculator, and Run Logger.
- Hardware Planner, Lookup Table, PID Simulator, Code Generator, and Competition Day are planned modules currently represented by `ComingSoon`.
- The platform is structured to add more Science Olympiad events later without hardcoding event modules into shared dashboard layouts.

## Users and Outcomes

The primary users are Science Olympiad students and coaches preparing, testing, and refining event devices. They need to:

- model physical geometry and design decisions;
- calculate or inspect run results;
- preserve practice history and notes;
- understand the assumptions behind every result; and
- move quickly between event tools during preparation.

## Product Truthfulness

Official Science Olympiad rules are authoritative. Do not invent, infer, or present an unverified formula as official. Provisional calculations must be labeled as assumptions and should identify the rule or source that still needs confirmation.

## Technical Conventions

- Supabase is the backend service and should use Vite environment variables for browser configuration.
- `src/components/events/registry.js` is the source of truth for event and module registration.
- Event-specific formulas, parsing, and UI belong inside the owning event directory.
- Theme tokens are defined in `src/index.css` and applied through `data-theme`.
- Tabler Icons are loaded from the CDN in `index.html`.
- Numeric and technical values use the monospace theme token.
- Unfinished functionality uses `live: false` and/or `ComingSoon`.