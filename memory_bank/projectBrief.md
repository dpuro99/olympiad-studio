# Olympiad Studio: Project Brief

## Product Purpose

Olympiad Studio is a focused workspace platform for Science Olympiad teams. It brings event-specific, rule-grounded preparation tools and practice tracking into one registry-driven React application.

The product should feel like a practical engineering workbench: clear about units and assumptions, and trustworthy about what is official versus provisional.

## Current Scope

- React 19 + Vite single-page application with local state navigation.
- Google sign-in uses Supabase Auth; Supabase is authentication-only. Practice tools persist explicitly in the user's browser (`localStorage`), never to a backend.
- The registry includes eight Division C events and Write It, Do It B from the official 2027 event slate.
- Official 2027 Division B/C manuals are stored in the locally ignored `rules/` directory; do not commit or deploy these PDFs.
- Registered events have manual-backed 2027 overview summaries. Live interactive tools exist for Electric Vehicle (score calculator, course & geometry, practice run logger), Chemistry Lab (gas-law practice, kinetics notebook, stoichiometry & nomenclature), Circuit Lab (circuit practice calculator, digital logic workbench), Dynamic Planet (freshwater measurement tools, unit-aware calculator toolbox, generated map/hydrograph practice), Boomilever (efficiency estimator, build/test log), Anatomy and Physiology (practice-notes journal), Rocks and Minerals (mineral ID key over the official list, and a specimen-practice drill over the same student-authored cards), and Designer Genes (molecular sequence workbench). The shared Reference & Study Compiler is live for the six study events (Anatomy, Designer Genes, Chemistry Lab, Circuit Lab, Dynamic Planet, Rocks and Minerals). Designer Genes also has the compiler; Write It, Do It has an overview only.

## Product Truthfulness

- The official current-year Science Olympiad Rules Manual is authoritative; event-page summaries and practice resources do not replace it.
- Do not invent or infer official rules or scoring formulas.
- Content the manual does not print is never shipped as data: the official mineral list supplies names, chemical classes and levels only, so every mineral property in the ID key is student-authored.
- Rule-specific calculations cite the verified manual provision and account for current corrections and clarifications.
- Clearly distinguish rule-derived calculators from tools that merely support practice.

## Technical Conventions

- `src/components/events/registry.js` is the source of truth for event/module registration.
- Season-specific rule constants, citations, and storage/export name stems live in `src/seasons/` (`ACTIVE_SEASON` manifest, per-event `2027/` data, `ACTIVE_DATA` wiring); engines and JSX copy stay season-free.
- Event-specific formulas, parsing, and UI belong inside the owning event directory.
- Theme tokens are defined in `src/index.css` and applied through `data-theme`.
- Unfinished functionality uses `live: false`.