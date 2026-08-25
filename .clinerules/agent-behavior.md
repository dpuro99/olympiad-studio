# AI Agent Workflow

## Context First

- At the start of every task, read all files in `memory_bank/` before writing code.
- Treat the memory bank as verified project context, while treating its explicit uncertainty notes as unresolved requirements.
- Inspect the owning component, nearby call sites, and relevant configuration before editing.

## Discovery and Decisions

- For every non-trivial request, identify the decisions that could affect the user's result: goal, users, behavior, visual direction, constraints, edge cases, and definition of done.
- Ask a concise, prioritized set of questions before editing when important details are missing. Do not assume the first prompt fully expresses the user's vision.
- Minor implementation details already determined by project conventions may be resolved autonomously.
- Ask for confirmation before destructive operations, broad refactors, dependency or schema changes, credential/configuration changes, or changes to existing user data or public behavior unless clearly authorized.

## Implementation

- Make the smallest root-cause change that satisfies the request.
- Preserve unrelated user work. Do not remove code merely because it is inactive; remove or refactor it when it is demonstrably dead, harmful, or explicitly in scope.
- Keep event formulas, scoring, parsing, and layout constants inside the owning event directory.
- Never invent Science Olympiad rules. Label assumptions and provisional formulas clearly.
- Keep render functions pure; put side effects in event handlers or effects.
- Give mutations pending, success, and failure states and prevent duplicate submissions.

## Validation and Handoff

- After editing, run the narrowest relevant validation first.
- Run `npm run lint` after JavaScript/JSX changes and `npm run build` for integration or configuration changes.
- Review the resulting diff for scope, accessibility, responsive behavior, and accidental credential exposure.
- Update `memory_bank/progress.md` when scope, architecture, behavior, known bugs, or uncertainties change meaningfully.
- Report changed files, validation results, assumptions, and remaining risks.
