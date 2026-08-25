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

## Data and Authentication

- `src/supabaseClient.js` owns the singleton browser Supabase client.
- Authentication uses Google OAuth through Supabase Auth.
- `App.jsx` calls `getSession()` during startup and subscribes to `onAuthStateChange`.
- Practice runs are stored in the `practice_runs` table and should be filtered by both the authenticated user id and event id.
- Row Level Security is part of the data-safety contract; client-side filters do not replace database policies.
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

Shared views consume registry data. New tools must be registered rather than hardcoded into `Home.jsx` or `App.jsx`. Unfinished tools use `live: false` and render `ComingSoon` unless a deliberate preview behavior is specified.

`requiresAuth: true` identifies modules that need an authenticated Supabase user or another backend capability. `App.jsx` gates those modules for guests with the shared `AuthRequired` view before the module component mounts. Backend-dependent tools should declare this capability in the registry instead of implementing guest checks themselves.

## Module Boundaries

- `src/components/general/` contains the public landing page, dashboard shell views, and shared coming-soon state.
- `src/components/events/[event-name]/` contains event-specific UI and domain logic.
- EV geometry belongs in `electricvehicle/ArcVisualizer.jsx` or a nearby EV utility module.
- EV scoring belongs in `electricvehicle/ScoreCalc.jsx` or a nearby EV utility module.
- EV practice persistence belongs in `electricvehicle/RunLogger.jsx` and must respect auth and RLS.
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