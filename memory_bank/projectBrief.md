# Olympiad Studio: Project Brief

## Product Purpose

Olympiad Studio is a focused workspace platform for Science Olympiad teams. It brings event-specific, rule-grounded preparation tools and practice tracking into one registry-driven React application.

The product should feel like a practical engineering workbench: clear about units and assumptions, and trustworthy about what is official versus provisional.

## Current Scope

- React 19 + Vite single-page application with local state navigation.
- Google sign-in uses Supabase Auth; Supabase is authentication-only. Practice tools persist explicitly in the user's browser (`localStorage`), never to a backend.
- The registry includes eight Division C events and Write It, Do It B from the official 2027 event slate.
- Official 2027 Division B/C manuals are stored in the locally ignored `rules/` directory; do not commit or deploy these PDFs.
- Registered events have manual-backed 2027 overview summaries. Live interactive tools exist for Electric Vehicle, Chemistry Lab, Circuit Lab, Dynamic Planet, Boomilever, and Anatomy and Physiology; Designer Genes, Rocks and Minerals, and Write It, Do It currently have overview modules only.

## Product Truthfulness

- The official current-year Science Olympiad Rules Manual is authoritative; event-page summaries and practice resources do not replace it.
- Do not invent or infer official rules or scoring formulas.
- Rule-specific calculations cite the verified manual provision and account for current corrections and clarifications.
- Clearly distinguish rule-derived calculators from tools that merely support practice.

## Technical Conventions

- `src/components/events/registry.js` is the source of truth for event/module registration.
- Event-specific formulas, parsing, and UI belong inside the owning event directory.
- Theme tokens are defined in `src/index.css` and applied through `data-theme`.
- Unfinished functionality uses `live: false`.