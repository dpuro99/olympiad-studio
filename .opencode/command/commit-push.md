---
description: Update the memory bank, run checks, then commit and push to GitHub
agent: build
---

Commit and push the current changes to GitHub. Follow the project conventions in AGENTS.md.

Steps:
1. Review what changed: run `git status --short`, `git diff`, and `git diff --cached`.
2. Update `memory_bank/progress.md` if scope, architecture, behavior, known bugs, or uncertainties changed.
3. Run `npm test`, `npm run lint`, and `npm run build`. Fix any failures before committing.
4. Stage the intended files with `git add -A`. Never stage `rules/*.pdf` or `.env`.
5. Commit with a concise message in the repo's existing style. If `$ARGUMENTS` is provided, use it as the commit message.
6. Push to the current branch's upstream. If none exists, set one with `git push -u origin HEAD`.

Report the commit hash and the push result.
