# 04 - AI Agent Behavioral Guardrails

## Memory Bank Protocol
- **At the start of EVERY new session or task**, you MUST read all markdown documents inside the `memory_bank/` directory (`projectBrief.md`, `systemArchitecture.md`, `progress.md`) to catch up on previous progress and establish state context before writing any code.
- **Self-Documentation Requirement:** If you complete a task that alters the codebase layout or resolves a known bug, you are required to modify and update `memory_bank/progress.md` to reflect the new state of the project before concluding the conversation.

## Code Modification Protocol
- **Incremental Diffing Only:** When modifying large files (like `src/App.jsx` or `RunLogger.jsx`), execute surgical line block replacements. Do not strip out working context or overwrite structural loops.
- **Code Preservation:** You are strictly forbidden from eliminating inactive code snippets, comment notes, legacy hooks, or structural helper functions unless specifically tasked to perform refactoring.

## Bug Elimination & Pre-compilation Checks
- **No Unused React Imports:** Do not include `import React from 'react';` at the top of JSX files unless standard hooks (`useState`, etc.) are being extracted.
- **No Temporal Hoisting:** Declare data gathering structures, fetching routines, and auxiliary components (like `fetchRuns`) *before* referencing or running them within secondary blocks or execution loops like `useEffect`.
- **Pure Render Lifecycles:** Never inject impure calls like `Date.now()` or direct side effects inside the component's main rendering loop. Wrap state modifications and timestamps in event handlers or lifecycle hooks.
- **Async UI Feedback:** Ensure write routines (like saving scores or deleting histories in tables like `practice_runs`) feature explicitly handled UI toggle states (`loading`, `isPending`) to block accidental double-click form submission spikes.

## Workspace Tool Isolation
- All computation formulas, score metrics, layout constants, and parsing configurations related to a specific event must remain locked inside that tool's specific directory.
- Do not export tool-specific business calculations into global spaces like `src/App.jsx`.

## Automated Quality Gate
- After editing files, you are required to run `npm run lint` within the integration execution sandbox.
- You must verify that your modifications are cleanly structured and do not create unused variables or structural breaking issues.
