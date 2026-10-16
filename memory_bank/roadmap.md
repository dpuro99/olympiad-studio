# Olympiad Studio — Roadmap

**Version:** 1.0 · **Created:** 2026-10-16

## How to use this document

- **Per-tool contracts live in each event's `tool-ideas.md` (`## Tool:` blocks)** — this roadmap never restates them; it sequences them and records decisions. Build via `.opencode/skill/build-event-tool/SKILL.md`.
- **Resume rule:** at the start of a session, read this file + `progress.md`; the "Current position" line below says where you are. Each tool build is a self-contained session: read the spec block, build logic-first, verify, update this doc's Current position.
- **Every phase exit:** `npm test` + `npm run lint` + `npm run build` green, `tests/e2e/app-map.json` updated, `/audit` baseline run, `memory_bank/` updated, commits only on explicit ask.
- **Sizing legend:** S ≤ half session · M ≈ one session · L ≈ multiple sessions.
- **Roadmap maintenance:** when work is completed, move Current position and strike the item's status. Substantive scope/decision changes get a dated changelog line at the bottom of this file and a version bump (e.g. 1.1) — append, never rewrite history.

**Current position:** Phase 1 not started · next build = Phase 1 (Season Boundary Foundation) or Phase 2 item 1 (DG Molecular Sequence Workbench). Recommended order: Phase 1 first, so new tools land on the right side of the season boundary from day one.

## Invariants (apply to every phase)

- Never invent rules/formulas; cite the manual page/§ beside rule-derived copy; treat FAQ as authoritative only when live.
- Regional/Invitational default; State/National-gated content behind an explicit toggle.
- Student-authored or generated tools over hardcoded question banks.
- Interactivity-first: live derivation during render; explicit buttons only for side effects; authoring tools keep Save plus live derived feedback.
- Lazy `registry.js` registration; no eager tool imports; no new dependencies without asking.
- **Season boundary:** engines stay season-free (no year literals, no rule constants inlined); rule constants, citations, and storage-key stems live in season data (see Phase 1). New tools must follow this from day one.

## Known quirks / drift (Phase 0 items)

| # | Issue | Fix |
|---|---|---|
| 1 | `electricvehicle/tool-ideas.md` Course & Geometry still `Status: Planned` though shipped | flip to `Live` + component path |
| 2 | `projectBrief.md` says DG/R&M overview-only — both have live Reference & Study Compilers | rewrite the "Current Scope" bullet |
| 3 | Docs cite module counts (27) that go stale | prefer "see `tests/e2e/app-map.json`" over hardcoded counts |
| 4 | chemlab spec omits `gasLawNotebook.js` / `experimentNotebook.js` | add to the spec's logic/UI fields |
| 5 | EV overview module id is `arc`, not `main`; only event not built via `overview()` | documented quirk — do NOT rename (app-map + tests key off it) |

---

## Phase 0 — Housekeeping · S

Deliverables: table above applied; this roadmap created; `progress.md` "Remaining Work" replaced by a pointer + Current-position mirror. Exit: docs consistent with registry.

## Phase 1 — Season Boundary Foundation · M

Goal: make the season boundary explicit so every future tool (and every future rollover) has one place to change when the rulebook changes. Based on a full audit (2026-10-16) of what is season-bound vs invariant in the current code.

**Architecture (three layers):**

1. **Season-invariant** — pure engines (`booleanLogic.js`, `balanceEquation`/stoichiometry core, `gasLaws.js`, `kinetics.js`, `freshwaterCalculators.js`, `circuitUtils.js`, `chartUtils.js`/`charts.jsx`/`primitives.jsx`, `referenceCompilerUtils.js`, `ReferenceCompiler.jsx`), CSV/safe-parse helpers, app shell, auth, audit harness. *Rule: no season literals; anything rule-derived arrives as imported data.*
2. **Season data** — a season manifest (`{ year, rulesUrl, manualLabel }`) plus per-event season files holding rule constants (EV scoring numbers, Boomilever cap/bonus/tiers, chem `IONS`/`REACTIONS`, anatomy `SYSTEMS`, compiler objective lists + resource constraints), citations, and storage-key stems. One `ACTIVE_SEASON` constant selects the current data.
3. **Active wiring** — registry entries (deriving `year`/`rulesUrl` from the manifest) and JSX copy that imports constants *from season data* instead of hand-duplicating them (e.g. "7,500 g" in `BoomileverEstimator.jsx`, "2500"/"480" in `ScoreCalc.jsx` — real drift hazards today).

**Work items:**

1. Season manifest module; registry `year`/`rulesUrl` derive from it; fix the two hard-coded `rules-2027` link renderers (`EventRulesOverview.jsx`, `ArcVisualizer.jsx`) to use `mod.rulesUrl`.
2. Extract inlined rule constants into per-event season data: `scoreUtils.js` (~12 literals), `boomileverScore.js`, `stoichiometry.js` (`IONS`/`REACTIONS`), `anatomyNotes.js` (`SYSTEMS`), `buildLogUtils.js` (`BASE_OPTIONS`/`TIERS`); engines take constants as parameters (season default). `courseUtils.js` is already extracted — just move it under season data.
3. Centralize storage keys in one `storageKey(event, module, season)` helper (11 keys across 3 naming conventions today); update `tests/e2e/helpers.js` and specs that assert keys to import from it. Keys keep the year — that isolates a user's 2027 data when 2028 ships.
4. Reference Compiler: add `season` to config (replacing the engine's hardcoded `· 2027 ·` at `ReferenceCompiler.jsx:201`); stamp serialized state with `season` and show a "saved under the 2027 manual" notice when `objectiveId`s don't match the active config (today orphaned blocks silently vanish from the sheet).
5. Move season-asserting tests (regex citation strings in unit tests, app-map `expectText`s, e2e storage-key assertions) to read from season data rather than re-asserting literals.

**Exit:** no `"2027"` literals outside season folders and docs; all tests green; the boundary convention is written into the build-event-tool skill (a one-line rule: engine in the invariant layer, constants/citations in season data).

## Phase 2 — Remaining Priority-1 compute tools · ~12 builds

Order below = recommended build order. Each: pure logic module + `node:test` first → JSX → lazy registry entry + app-map → e2e interaction flow. New tools follow the Phase 1 season-boundary convention.

| # | Tool (spec location) | Scope anchor | Manual verify | Size | Notes / risks |
|---|---|---|---|---|---|
| 1 | **DG Molecular Sequence Workbench** (`designergenes`) | complement → mRNA → protein (2027 codon table), mutation consequences, generated sequences; live annotated output | DG §3 transcription/translation scope | M | Mostly invariant logic; season data = scope/citations. Pure `sequenceUtils.js` is the test core |
| 2 | **DP Freshwater Calculator Toolbox** (`dynamicplanet`) | recurrence interval, stream order, sinuosity, hydraulic gradient, residence time — each cited | re-verify each formula exists in manual/FAQ; **drop any that don't** | M | Highest rules-risk item in the phase; spec allows dropping non-manual-backed ideas |
| 3 | **DP Map & Hydrograph Practice** (`dynamicplanet`) | generated contour/stream-network/hydrograph interpretation cases | §3 map/data scope | L | Generator must be deterministic under seed for tests; reuse chart primitives |
| 4 | **R&M Mineral ID Key** (`rocksandminerals`) | property-filter dichotomous key narrowing official-list minerals | 2027 official mineral list, student-seeded not scraped | M | Open question at build: empty student-authored list + import, or minimal seed |
| 5 | **R&M Specimen Practice** (`rocksandminerals`) | student-authored specimen cards, flip/self-grade drill, CSV | official list framing only | M | Persistence + corrupt-storage handling per sibling convention |
| 6 | **Anatomy Respiratory Data Practice** (`anatomy`) | generated spirometry/flow-volume loops, obstructive vs restrictive, ratios | anatomy §3 respiratory scope | M | Label generator math clearly as educational simulation, not clinical |
| 7 | **Anatomy System Diagram Drill** (`anatomy`) | SVG click-to-label + keyboard path, revealed names/functions | labeled structures = manual-listed only | L | SVG artwork is the cost; keep diagrams minimal/schematic |
| 8 | **Anatomy Digestive/Immune Process Practice** (`anatomy`) | case-based ordering/classification, immediate feedback | §3 listed disorders scope | M | |
| 9 | **Circuit Lab PN-Junction/LED Calculator** (`circuitlab`) | series resistor sizing, forward drops, power | §3.e semiconductor scope | S | Direct sibling of CircuitLabPractice; live-derive |
| 10 | **DG Genetics Workbench** (`designergenes`) | Mendelian crosses/pedigrees/population genetics with shown work | §3 genetics scope | L | Pure probability core + unit tests; largest DG item |
| 11 | **DG Karyotype & Meiosis Drill** (`designergenes`) | stage classification, nondisjunction, karyotypes | manual scope check | M | |
| 12 | **WIDI Timed Relay + Structure Generator** (`writeitdoit`) | full writer→builder rep, parametric structure generator, phase timers, rubric reveal | WIDI §3 timings (25/20) + scoring rubric | L | **Consolidation decision at build:** fold Writer/Builder practice into phases of the relay vs ship 3 modules — decide with user, update spec statuses |

**Phase 2 exit:** every Division C event has ≥2 interactive tools; WIDI has the relay; chemlab remains complete. Checkpoint: re-audit all 9 `tool-ideas.md` statuses against the registry.

## Phase 3 — Compliance & hands-on layer · ~5 builds

| # | Tool | Scope anchor | Size |
|---|---|---|---|
| 1 | EV Kit/Programming Compliance Checklist | cited per-constraint checkboxes; §8.r kit/modification rules | M |
| 2 | Boomilever Structure Compliance Worksheet | wall contact, chain, loading block — cite §3 | M |
| 3 | Circuit Lab Safe Hands-on Task Simulator | manual-listed task types only (mystery resistor, 3-way switch, troubleshooting) | L |
| 4 | Objective Tracker scaffold | extend ReferenceCompiler mastery data; design decision: shared feature vs per-event | M |
| 5 | Promote ≤1 general tool (recommend **Generic Event Timer**) | consumes WIDI/Boomilever/EV timings; update `general/tool-ideas.md` + registry | S |

**Exit:** compliance checklist archetypes exist for EV/Boomilever/Circuit; timer promotion decision recorded.

## Phase 4 — Backend data phase (Supabase, RLS-first) · L, multi-session

Sequence (each its own session):

1. **Schema + RLS design:** tables per practice domain (or one `practice_records` with `event_id` + `kind`); every table policy `user_id = auth.uid()`. Write the design into `memory_bank/systemArchitecture.md` before any code.
2. **Migrate logs first:** EV RunLogger + Boomilever BuildLog (simplest shape) — local-first with explicit "Saved locally / Saved to account" states and an import path from localStorage export. Note: EV logs persist computed score snapshots (frozen to the season's formula); prefer Boomilever's raw-inputs-then-re-derive pattern for new schemas.
3. **Compiler sheets:** sync reference-compiler documents per event.
4. **Notebooks:** anatomy notes, kinetics experiments.
5. **Auth gating:** flip migrated modules to `requiresAuth: true`; guest mode stays fully functional on localStorage (`AuthRequired` already gates).
6. **Failure semantics:** distinguishable DB error vs empty; explicit "offline — kept locally" banner or queue; sync-conflict resolution (last-write-wins + timestamp, stated in UI); no demo records ever shown as real.
7. **History views:** cross-device per-event history.

**Constraints:** never remove localStorage support; never store anything beyond practice data; keep `.env`/keys out of git. **Exit:** a signed-in user's log survives a browser switch; a guest is never blocked from any existing tool.

## Phase 5 — Product polish & onboarding · M

- Landing/dashboard UX pass; consistent empty states for every tool with zero saved data.
- First-run experience: pick an event → suggested starter tool.
- Coach-facing one-pager ("how a team uses this").
- Help-copy audit across all modules (purpose, units, practice-vs-official label visible).
- Search/quick-jump if module count makes navigation slow (~35+ modules by end of Phase 2).

## Continuous — Ops & quality (runs alongside every phase)

- Post-deploy smoke after each `npm run deploy`; GA4 guard behavior preserved.
- Bundle budget: main chunk stays framework-only; lazy chunks < 60 kB; revisit `chunkSizeWarningLimit` only with data.
- Audit harness: drive every observable media/state; extend the resilience suite as new persistence lands.
- Track suite size honestly in `progress.md` (e2e runtime is a growing cost — prune duplication; keep cross-cutting tests in core/resilience specs).
- **Mid-season rules upkeep:** periodically check official corrections, FAQ clarifications, and state/tournament-specific updates; re-verify any live tool whose rule basis changed. Never let a live tool silently drift from current rules.

## Phase 6 — Season rollover (annual, when the new manual drops)

**Principles (user-set, 2026-10-16):**

- At season end, all tools become legacy — archived, not live.
- At season start, research + brainstorm from scratch: what are the best possible tools for each event *this year*?
- The archive is inspiration, not a menu: consulting it is allowed; letting it be the only source is not.
- Reuse is earned by overlap: if the fresh brainstorm independently produces a tool that overlaps an archived one, clone it from the season tag and adapt it to the new rules. If not, don't — even if reusing would be easier.
- Outcome of quality > outcome of convenience.
- **`main` never carries archived code.** Archived season *code* = git tag. Prior-season *data* folders stay in-repo (tiny) so the app can recognize old localStorage records ("saved under the 2027 manual" notices). Engines that are season-invariant (math/CS) are never cloned — they carry over untouched.

**Process:**

1. **Freeze** — tag the final season state in git (`season-2027`). The tag *is* the archive; clone via `git show season-2027:…`.
2. **Ingest** — new manuals into gitignored `rules/`, extract to text (throwaway tooling; PDFs never committed); sweep FAQ/clarifications; note slate changes (events added/dropped/renamed).
3. **Per-event brainstorm** — generate the best tool ideas for the new rules against the standing bar (interactivity, rule-grounded, student-authored/generated). Deliberately brainstorm *before* consulting the archive so it can't anchor the list.
4. **Reconcile with the archive** — each archived tool gets one of three outcomes:
   - **Keep + re-verify** — season-invariant logic (math/CS engines): no cloning; re-audit citations, level gating, rule-derived copy only.
   - **Clone + adapt** — concept survives but implementation is rule-bound (e.g. EV scoring formula changes → clone `scoreUtils` season data from the tag, adapt, treat as new code with tests first).
   - **Retire** — the new brainstorm found something better, or the tool no longer fits; it leaves the live registry and its spec block moves with the tag.
5. **Rewrite this roadmap** — new season's phase list emerges from the brainstorm; Current position resets; season data folders gain the new year.
6. **Verify** — full citation audit + `npm test`/`lint`/`build` + `/audit` before anything ships as the new season.

---

## Backburner (max 3, untouched unless promoted)

- **Generic Event Timer** — candidate Phase 3.5 (recommended promote).
- **Self-Quiz Flashcards** — student-authored content only; no bundled deck.
- **Rules-Change Highlighter** — candidate Phase 6 (promote only if the manual-diff work is being done by hand anyway).

## Open decisions log

| Open/Closed | Date | Decision |
|---|---|---|
| Closed | 2026-10-16 | Backend included in plan (user decision). |
| Closed | 2026-10-16 | Phased-milestone structure, no dates (user decision; agent cannot meet deadlines autonomously). |
| Closed | 2026-10-16 | No automation (user took back the automation idea). |
| Closed | 2026-10-16 | Season rollover model: fresh-brainstorm + earned reuse + git-tag archive (user decision; architecture audit → Phase 1). |
| Open | — | WIDI: fold Writer/Builder practice into the Timed Relay vs ship 3 modules (decide at Phase 2.12). |
| Open | — | R&M Mineral ID Key: ship with empty student-authored list + import, or a minimal seeded dataset (decide at Phase 2.4). |
| Open | — | Objective Tracker shape: shared ReferenceCompiler feature vs per-event module (decide at Phase 3.4). |
| Open | — | Division B scope: stay 8C + WIDI, or grow into more Division B events (whole new events — much larger than Phase 2)? |
| Open | — | Coach/team features: multi-user schema (coach sees team history, shared sheets) during Phase 4? Different privacy story (minors' data) — decide before schema design. |
| Open | — | Offline/PWA support for gyms with bad Wi-Fi — promote to a phase or stay backburner? |
| Open | — | User-facing archive: should archived seasons ever be visible to students (e.g. state tournaments still on old rules) with a disclaimer, or is the archive purely internal? |

## Changelog

- **2026-10-16 (v1.0)** — Roadmap created. Phases: housekeeping → season-boundary foundation → 12 remaining Priority-1 tools → compliance layer → backend (Supabase RLS) → polish → continuous ops + mid-season rules upkeep → annual fresh-brainstorm season rollover with git-tag archive. Open decisions logged (Division B scope, coach features, offline/PWA, WIDI consolidation, R&M seeding, Objective Tracker shape, user-facing archive).
