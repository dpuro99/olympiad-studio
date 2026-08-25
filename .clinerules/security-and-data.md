# Security, Data, and Accessibility Rules

## Credentials and Data

- Never hardcode or expose project credentials in source files. Use `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- Treat the Supabase anon key as browser configuration, not as authorization. Rely on Row Level Security for record protection.
- Scope user-owned reads, inserts, updates, and deletes by the authenticated user and relevant event.
- Distinguish loading, empty, error, and demo states. Never silently substitute fake records for a failed production query.
- Do not log tokens, credentials, private user data, or unnecessary database responses.

## Accessibility

- Use semantic `<button>` and `<a>` elements for all interactive controls; do not bind navigation to plain layout elements.
- Provide accessible names for icon-only controls and meaningful labels for form inputs.
- Preserve keyboard focus, disabled states, visible focus styling, and usable contrast in both themes.
- Destructive operations require an explicit confirmation step.
- Use CSS pseudo-classes for hover and focus styling rather than JavaScript mouse handlers.
