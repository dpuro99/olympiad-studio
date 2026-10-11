# Decisions

Append-only log of architectural and process decisions, with the reasoning. Newest entries go at the bottom. Do not rewrite history; add a new entry that supersedes an old one if needed.

## 2026-10-09

- **Git push authentication works through Windows Git Credential Manager.** WSL git uses the helper script `~/.local/bin/git-credential-manager.sh` (set as `git config --global credential.helper`), which delegates to `/mnt/c/Program Files/Git/mingw64/bin/git-credential-manager.exe`. It reuses the GitHub credentials already stored by Windows, so pushes are non-interactive. A space-free wrapper is required because git splits credential.helper on whitespace. The git identity (`David` / `dpuro14@gmail.com`) lives in the repo-local `.git/config`, and this file is not committed.
- **WSL cannot write `git config` on the OneDrive mount.** `git config user.name`/`email` fails with `chmod ... Operation not permitted` on `.git/config.lock`. Workaround: edit `.git/config` directly. Global config (`~/.gitconfig`) is on the Linux filesystem and writes fine.

- **Line endings normalized to LF in the repository.** Added `.gitattributes` (`* text=auto` plus explicit `eol=lf` for source and `binary` for images/PDFs) and ran `git add --renormalize`. The working tree had accumulated CRLF from Windows editors, which turned small edits into whole-file diffs and would have polluted `git blame`. Rationale: keep reviewable diffs and a consistent repository.

- **Memory bank is the cross-session memory mechanism.** opencode has no persistent memory between sessions, so `memory_bank/` (`projectBrief.md`, `systemArchitecture.md`, `progress.md`, `decisions.md`) is the durable project context. `memory_bank/projectBrief.md`, `systemArchitecture.md`, and `decisions.md` are auto-loaded every session via the `instructions` field in the root `opencode.json`; `progress.md` is read on demand because it changes often.

- **`/commit-push` custom command.** Added `.opencode/command/commit-push.md` so a single command reviews changes, updates `memory_bank/progress.md`, runs `npm test`/`lint`/`build`, commits, and pushes. Rationale: make the memory-update step part of the standard workflow instead of relying on recall.

- **Navigation stays router-free.** `src/App.jsx` owns theme, auth/session, landing-vs-dashboard gating, selected event, and active module through local state. Do not add a router or state library without a demonstrated need and approval.

- **Supabase is authentication only.** Google OAuth via `src/supabaseClient.js`; practice tools persist explicitly to browser `localStorage`. When backend practice storage is added, it must be scoped by authenticated user id and event id and guarded by Row Level Security, not client-side filters.

- **Domain scope.** Focus on Regional/Invitational material unless asked otherwise. Prefer student-authored data tools over hardcoded quiz/answer banks. Never invent Science Olympiad rules or scoring formulas; cite the manual page/section beside rule-specific summaries and calculators.

## 2026-10-10

- **Event tool components are lazy-loaded.** `registry.js` wraps each event tool in `React.lazy(() => import(...))` (see the `ti-*` module `component` shape); `App.jsx` renders them inside a single `<Suspense>` fallback. Rationale: shrink the initial bundle (634 kB → 561 kB) and ship only the tool a user opens. `EventRulesOverview` stays an eager import so event overviews remain part of the main chunk. New event tools should keep the same lazy pattern; do not add eager top-level `import` of tool components to `registry.js`.
