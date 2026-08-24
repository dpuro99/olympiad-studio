# 03 - Security, Data Integrity & A11y Rules

## Credential Safety & Data Integrity
- **STRICT ENFORCEMENT:** Never copy-paste or expose physical project API keys or endpoints into the source tree.
- Always reference database parameters securely via the environment envelope using `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.

## User Semantics & Accessibility (a11y)
- **Interactive Elements:** Do not create clickable element bindings or navigation selectors out of flat layout wrappers like standard `div` or `span` components. Always rely on semantic `<button>` or anchor `<a>` primitives to protect natural keyboard tab indexing and assistive screen-reader tracking.
- **Destructive Confirmations:** Any operation that removes records permanently (such as clearing logs or deleting records from the running history panel) must require an intermediate prompt, alert popover, or double-click check phase from the user before executing.
- **Hover Styles:** Manage hover states purely via CSS pseudo-classes (`:hover`) in the stylesheet. Do not use JavaScript mouse events (`onMouseEnter`, `onMouseLeave`) for styling purposes.
