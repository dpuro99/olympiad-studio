---
description: Update the memory bank, run checks, then commit and push to this project's GitHub remote
agent: build
---

Commit and push the current changes to this project's GitHub repository.

Scope and safety:
- This command operates ONLY on the repository you are currently in (the project's own working directory). Stage, commit, and push run against that repo's remote/upstream. Never push to a different or "universal" repository.
- Never stage or commit secrets/credentials, `.env` files, or ignored vendored material.
- Always write a commit message. For non-trivial changes include a short body/description of what changed. If `$ARGUMENTS` is provided, use it as the commit message.

Steps:
1. Review what changed: run `git status --short`, `git diff`, and `git diff --cached`.
2. Update the project's memory/context docs (e.g. `memory_bank/progress.md`) if scope, architecture, behavior, known bugs, or uncertainties changed.
3. Run the project's test, lint, and build commands (per the project's AGENTS.md). Fix any failures before committing.
4. Stage the intended files (current repo only). Never stage `rules/*.pdf` or `.env`.
5. Commit with a concise message in the repo's existing style plus a body/description for non-trivial changes. If `$ARGUMENTS` is provided, use it as the commit message.
6. Push to the current branch's upstream. If none exists, set one with `git push -u origin HEAD`.

Report the commit hash and the push result.