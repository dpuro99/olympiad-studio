# System Architecture

## Application Flow

`src/App.jsx` is the application controller. It manages:

- theme state and synchronization to `document.documentElement[data-theme]`;
- Supabase session initialization and auth-state subscriptions;
- the public landing view versus the authenticated dashboard;
- the selected event workspace; and
- the active page, which is either the workspace home or a registered module id.

The dashboard has two local-state levels:

1. The event lobby lists registered event workspaces.
2. An event workspace lists categories and modules from that event's registry entry.

There is no URL router. Navigation state is intentionally local to the SPA for now.

## Season Boundary

The app separates three layers so an annual manual change has one place to land:

1. **Season-invariant engines** — pure logic (`booleanLogic.js`, `stoichiometry.js` core, `gasLaws.js`, `kinetics.js`, `freshwaterCalculators.js`, `freshwaterToolboxUtils.js`, `mapPracticeUtils.js`, `specimenCardsUtils.js`, `specimenDrillUtils.js`, `circuitUtils.js`, chart/UI primitives, `referenceCompilerUtils.js`, `ReferenceCompiler.jsx`) and the app shell. They contain no year literals and receive rule-derived values as data. `specimenCardsUtils.js` holds the invariant mineral property vocabulary and matching rules; `specimenDrillUtils.js` holds deck building, generated choices, grading and session scoring. The official list they operate on arrives from season data.
2. **Season data** — `src/seasons/manifest.js` (`ACTIVE_SEASON`), `src/seasons/<year>/<event>.js` (rule constants, level tables, objective/resource copy, citations), `src/seasons/active.js` (`ACTIVE_DATA`), and `src/seasons/storageKeys.js` (`storageKey(event, module)`, `fileStem(event, module)`, legacy-key migration).
3. **Active wiring** — `registry.js` derives `year`/`rulesUrl`/labels from `ACTIVE_SEASON`; components read constants from `ACTIVE_DATA` instead of duplicating them.

Reference-compiler configs declare `season: ACTIVE_SEASON`; saved state is stamped with that year so a sheet authored under an older manual is announced rather than silently losing blocks whose objectives no longer exist. `tests/season-boundary.test.js` enforces the rule that no season-year literal appears outside `src/seasons/`.

## Data and Authentication

- `src/supabaseClient.js` owns the singleton browser Supabase client.
- Authentication uses Google OAuth through Supabase Auth.
- `App.jsx` calls `getSession()` during startup and subscribes to `onAuthStateChange`.
- Supabase is used for authentication only. No backend data reads or writes exist yet; every practice tool persists explicitly to browser `localStorage` and never uploads user data.
- `requiresAuth` / `AuthRequired` exist to gate modules that will need a backend identity, but no registered module sets `requiresAuth: true` yet.
- When backend practice storage is added, it must be scoped by the authenticated user id and event id, and Row Level Security (not client-side filters) must be the guard.
- Database failures must be distinguishable from an empty result. Demo/fallback records must never appear as real user history without an explicit demo state.

## Registry Contract

`src/components/events/registry.js` is the single source of truth for event workspaces and modules. An event entry currently contains `name`, `code`, `division`, `description`, `categories`, and `modules`. A module contains:

```js
{
	id,
	ti,
	label,
	cat,
	live,
	requiresAuth,
	component,
	desc
}
```

Shared views consume registry data. New tools must be registered rather than hardcoded into `Home.jsx` or `App.jsx`. Unfinished tools use `live: false`.

`requiresAuth: true` identifies modules that need an authenticated Supabase user or another backend capability. `App.jsx` gates those modules for guests with the shared `AuthRequired` view before the module component mounts. Backend-dependent tools should declare this capability in the registry instead of implementing guest checks themselves.

## Module Boundaries

- `src/components/general/` contains the public landing page and dashboard shell views.
- `src/components/events/[event-name]/` contains event-specific UI and domain logic.
- EV geometry belongs in `electricvehicle/ArcVisualizer.jsx` or a nearby EV utility module.
- EV scoring belongs in `electricvehicle/ScoreCalc.jsx` or a nearby EV utility module.
- EV practice persistence belongs in `electricvehicle/RunLogger.jsx` and currently writes only to browser `localStorage`.
- R&M mineral property storage and candidate ranking live in `rocksandminerals/specimenCardsUtils.js`; the official mineral list, its classes/levels and the key's citations belong in season data. One `specimen-cards` store is shared by every R&M practice tool, so a second tool must extend the engine rather than open its own key.
- R&M card authoring has exactly one editor: `rocksandminerals/PropertyForm.jsx` (`PropertyForm` plus the `TagChecks` fieldset) owns the draft and the hardness-order check, while each tool keeps its own persistence and status messages. The Mineral ID Key and Specimen Practice both render it, so a property added to the vocabulary shows up in both.
- `rocksandminerals/SpecimenPractice.jsx` is a drill, not a second store: it derives its deck from the shared cards, generates choices at runtime (`buildChoices`, whose distractors exclude any mineral with an identical recorded-property signature) and keeps the session scoreboard/missed list in component state — session-only, never persisted. The drill round is remounted on a deck-membership key (`ids joined`), so the draw order is rebuilt without a state-syncing effect and never reshuffles when a card's properties are edited.
- Global files should provide composition and shared infrastructure, not event-specific formulas.

## Implementation Invariants

- Use semantic buttons or links for interactive controls.
- Keep hover styling in CSS rather than JavaScript mouse handlers.
- Use theme variables instead of scattered hardcoded UI colors.
- Keep side effects in event handlers or effects, never during render.
- Declare helpers before their use when doing so improves readability and avoids dependency/order errors.
- Mutations need pending, success, and failure states that prevent accidental duplicate submissions.
- Destructive actions require an explicit confirmation step.
- Preserve responsive behavior: tool panels should stack cleanly on narrow screens.
- Treat formula and rule changes as domain changes requiring verification and focused tests.