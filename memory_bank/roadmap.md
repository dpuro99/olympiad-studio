# Olympiad Studio — Roadmap

**Version:** 1.8 · **Created:** 2026-10-16

## How to use this document

- **Per-tool contracts live in each event's `tool-ideas.md` (`## Tool:` blocks)** — this roadmap never restates them; it sequences them and records decisions. Build via `.opencode/skill/build-event-tool/SKILL.md`.
- **Resume rule:** at the start of a session, read this file + `progress.md`; the "Current position" line below says where you are. Each tool build is a self-contained session: read the spec block, build logic-first, verify, update this doc's Current position.
- **Every phase exit:** `npm test` + `npm run lint` + `npm run build` green, `tests/e2e/app-map.json` updated, `/audit` baseline run, `memory_bank/` updated, commits only on explicit ask.
- **Sizing legend:** S ≤ half session · M ≈ one session · L ≈ multiple sessions.
- **Roadmap maintenance:** when work is completed, move Current position and strike the item's status. Substantive scope/decision changes get a dated changelog line at the bottom of this file and a version bump (e.g. 1.1) — append, never rewrite history.

**Current position:** Phase 0 complete (2026-10-19) · Phase 1 complete (2026-10-27) · Phase 2 items 1–5 (DG Molecular Sequence Workbench, DP Freshwater Calculator Toolbox, DP Map & Hydrograph Practice, R&M Mineral ID Key, R&M Specimen Practice) complete (2026-10-27 → 2026-11-01) · **Phase 2.5 complete (2026-11-21): Track B batches B1–B4 and Track A all done, fully verified, committed locally as `78c2baa` (not pushed)** · Phase 2 item 6 (Anatomy Respiratory Data Practice) complete, verified, and committed locally as `301ef7d` (2026-11-21, not pushed; 119/119 full audit sweep, baseline stamped) · Circuit Lab PN-Junction / LED Calculator (**row 9**, built out of sequence) committed locally as `51c5141`; full audit passed 122/122 with baseline stamped (2026-11-21) · Anatomy System Diagram Drill (**row 7**) committed locally as `dde017c`; full audit passed 125/125 with baseline stamped (2026-11-21) · Anatomy Digestive/Immune Process Practice (**row 8**) committed locally as `18afe57`; full audit passed 128/128 with baseline stamped (2026-11-22) · DG Genetics Workbench (**row 10**) committed locally as `e641eda`; full audit passed 131/131 with baseline stamped (2026-11-22) · DG Karyotype & Meiosis Drill (**row 11**) committed locally as `4200e4b`; full audit passed 134/134 with baseline stamped (2026-11-22) · WIDI Timed Relay (**row 12**) committed locally as `138bd97`; full audit passed 137/137 with baseline stamped (2026-11-22) · Phase 2 exit audit complete (no spec/registry drift) · Phase 3 item 1 (EV Kit/Program Compliance Checklist) committed locally as `7b66ab4` (+ `e0fcc49` e2e fix); full audit passed 140/140 with baseline stamped (2026-11-22) · Phase 3 item 2 (Boomilever Structure Compliance Worksheet) committed locally as `bb42dad` and fully audited 143/143 with baseline stamped to `c655dfc` (2026-11-22) · Phase 3 item 3 (Circuit Lab Safe Hands-on Task Simulator) committed locally as `e4cdb6c` and fully audited 146/146 with baseline stamped to `adeeb4f` (2026-11-22) · next = Phase 3 item 4. Nothing pushed.

## Invariants (apply to every phase)

- Never invent rules/formulas; cite the manual page/§ beside rule-derived copy; treat FAQ as authoritative only when live.
- Regional/Invitational default; State/National-gated content behind an explicit toggle.
- Student-authored or generated tools over hardcoded question banks.
- Interactivity-first: live derivation during render; explicit buttons only for side effects; authoring tools keep Save plus live derived feedback.
- Lazy `registry.js` registration; no eager tool imports; no new dependencies without asking.
- **Season boundary:** engines stay season-free (no year literals, no rule constants inlined); rule constants, citations, and storage-key stems live in season data (see Phase 1). New tools must follow this from day one.

## Known quirks / drift (Phase 0 items — all applied 2026-10-19)

| # | Issue | Fix |
|---|---|---|
| 1 | `electricvehicle/tool-ideas.md` Course & Geometry still `Status: Planned` though shipped | flip to `Live` + component path |
| 2 | `projectBrief.md` says DG/R&M overview-only — both have live Reference & Study Compilers | rewrite the "Current Scope" bullet |
| 3 | Docs cite module counts (27) that go stale | prefer "see `tests/e2e/app-map.json`" over hardcoded counts |
| 4 | chemlab spec omits `gasLawNotebook.js` / `experimentNotebook.js` | add to the spec's logic/UI fields |
| 5 | EV overview module id is `arc`, not `main`; only event not built via `overview()` | documented quirk — do NOT rename (app-map + tests key off it) |

---

## Phase 0 — Housekeeping · S · ✅ DONE (2026-10-19)

Deliverables: table above applied; this roadmap created; `progress.md` "Remaining Work" replaced by a pointer + Current-position mirror. Exit: docs consistent with registry. **Complete 2026-10-19** — all five quirks applied (including a WIDI/compiler correction in `progress.md`), plus a policy that living docs avoid volatile counts.

## Phase 1 — Season Boundary Foundation · M · ✅ DONE (2026-10-27)

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

**Complete 2026-10-27.** `src/seasons/` now holds the manifest (`ACTIVE_SEASON`), `storageKeys.js` (`storageKey`/`fileStem`/legacy migration), per-event `2027/` data, and `active.js` (`ACTIVE_DATA`); engines take constants as parameters; the Reference Compiler configs declare `season`, stamp saved state, and warn when a sheet came from another manual or targets retired objectives; `tests/season-boundary.test.js` makes a year literal outside `src/seasons/` a test failure. See `decisions.md` (2026-10-27).

## Phase 2 — Remaining Priority-1 compute tools · ~12 builds

Order below = recommended build order. Each: pure logic module + `node:test` first → JSX → lazy registry entry + app-map → e2e interaction flow. New tools follow the Phase 1 season-boundary convention.

| # | Tool (spec location) | Scope anchor | Manual verify | Size | Notes / risks |
|---|---|---|---|---|---|
| 1 | ~~**DG Molecular Sequence Workbench** (`designergenes`)~~ ✅ 2026-10-27 | complement → mRNA → protein (standard genetic code), mutation consequences, generated sequences; live annotated output | DG §3 transcription/translation scope | M | Shipped: `MolecularSequenceWorkbench.jsx` + `sequenceUtils.js`; season scope/citations in `src/seasons/2027/designergenes.js` |
| 2 | ~~**DP Freshwater Calculator Toolbox** (`dynamicplanet`)~~ ✅ 2026-10-27 | sinuosity, hydraulic gradient, Darcy flow, residence time, flood recurrence, Manning flow — each cited; stream order deferred to item 3 | re-verified all six against the manual text + FAQ; no unbacked formula shipped | M | Shipped: `FreshwaterToolbox.jsx` + `freshwaterToolboxUtils.js`; citations/basis in `src/seasons/2027/dynamicplanet.js`. Ranked-record recurrence plotting dropped (manual prints no convention); stream order moved to item 3 |
| 3 | ~~**DP Map & Hydrograph Practice** (`dynamicplanet`)~~ ✅ 2026-10-27 | generated contour-gradient, Strahler stream-order, water-table and storm-hydrograph cases; seed-reproducible, graded with a worked solution | §3.k.i topographic maps, §3.k.ii water table from wells, §3.k.iii hydrographs/lag time, §3.c.ii stream order (all verified in the manual text) | L | Shipped: `MapPractice.jsx` + `mapPracticeUtils.js`; conventions (Strahler, centroid lag) stated per case in `src/seasons/2027/dynamicplanet.js`. Seeds make cases reproducible, so no persistence is needed |
| 4 | ~~**R&M Mineral ID Key** (`rocksandminerals`)~~ ✅ 2026-10-28 | property-filter key narrowing official-list minerals | 2027 official mineral list, student-seeded not scraped | M | Shipped: `MineralIdKey.jsx` + `specimenCardsUtils.js`; 81-mineral skeleton (names/class/level) in `src/seasons/2027/rocksandminerals.js`, all properties student-authored. Seeding question closed 2026-10-28 |
| 5 | ~~**R&M Specimen Practice** (`rocksandminerals`)~~ ✅ 2026-11-01 | drill over student-authored cards: generated multiple-choice, flashcard self-grade, missed list | official list framing only (pp. C55–C56) | M | Shipped: `SpecimenPractice.jsx` + `specimenDrillUtils.js`, sharing the `specimen-cards` store and the extracted `PropertyForm.jsx` editor with item 4. Drill session is session-only |
| 6 | ~~**Anatomy Respiratory Data Practice** (`anatomy`)~~ ✅ 2026-11-21 | generated spirometry/flow-volume loops, obstructive vs restrictive, ratios | anatomy §3 respiratory scope | M | Shipped as `RespiratoryDataPractice.jsx` + `respiratoryDataUtils.js`, committed `301ef7d`; generator math labelled an educational simulation, not clinical |
| 7 | ~~**Anatomy System Diagram Drill** (`anatomy`)~~ ✅ 2026-11-21 | SVG click-to-label + keyboard path, revealed names/functions | labeled structures = manual-listed only | L | Built as `SystemDiagramDrill.jsx` + `diagramDrillUtils.js`: 3 minimal state-drawn SVG schematics, manual-listed names only (§3.a.iii/§3.b.ii–iv/§3.c.i), cosmetic hotspots, keyboard path, session-only |
| 8 | ~~**Anatomy Digestive/Immune Process Practice** (`anatomy`)~~ ✅ 2026-11-22 | case-based ordering/classification, immediate feedback | §3.b/§3.c listed processes only | M | Shipped as `ProcessPractice.jsx` + `processPracticeUtils.js`, committed `18afe57`; six manual-cited cases, level-gated additions, no persistence. Immunization/immunoglobulin classes deliberately not turned into answer keys (manual prints no distinguishing detail) |
| 9 | ~~**Circuit Lab PN-Junction/LED Calculator** (`circuitlab`)~~ ✅ 2026-11-21 | series resistor sizing, forward drops, power | §3.e semiconductor scope | S | Shipped early (out of row order) as `LedCalculator.jsx` + `ledUtils.js`; live-derive, teaching presets labelled, no persistence |
| 10 | ~~**DG Genetics Workbench** (`designergenes`)~~ ✅ 2026-11-22 | Mendelian crosses/population genetics/gene mapping with shown work | §3 genetics scope | L | Built as `GeneticsWorkbench.jsx` + `geneticsUtils.js` (9 unit cases): Punnett squares, Hardy–Weinberg, two-/three-point mapping and heritability with tournament-level gates. Pedigrees/epistasis not shipped: the manual names them but prints no datasets, so a case key would be invented. |
| 11 | ~~**DG Karyotype & Meiosis Drill** (`designergenes`)~~ ✅ 2026-11-22 | stage classification, nondisjunction, karyotypes | §3.ii.1–3 verified; V(D)J/class switching gated §3.ii.4 | M | |
| 12 | ~~**WIDI Timed Relay + Structure Generator** (`writeitdoit`)~~ ✅ 2026-11-22 | full writer→builder→review rep, seeded structure generator, phase timers, rubric reveal | §2–4 verified on printed p. B62 (PDF p. 66) | M | ✅ Consolidated into one `timed-relay` module; Writer/Builder specs folded as phases |

**Phase 2 exit — complete 2026-11-22:** every Division C event has ≥2 interactive tools; WIDI has the relay; chemlab remains complete. Re-audited all 9 `tool-ideas.md` statuses against `EVENT_REGISTRY`: no drift (Live ↔ registered module, folded specs accounted for, 5 remaining Planned blocks belong to Phase 3/backburner). Next: Phase 3 item 1.

## Phase 2.5 — Intuitive workflow & tool simplification · ~14 passes

Approved 2026-11-17. Runs before Phase 3; Phase 2 item 6 and the rest of that queue are deferred until this phase exits.

**Why:** every live tool is a full page that surfaces all controls at once, and an event is a list of tools rather than a workflow. The 2026-11-05 pass proved the fix but covered only 4 tools; the 2026-11-12 field guide gave events a reading order without simplifying any tool. This phase was previously recorded only in `activeContext.md`, so it lost to "next build" every session — recording it here is the point.

**Track A — per-event workflow (9 events).** Each event's `journey` reads as "do this, then this"; each `gain` states the output the tool produces; `EventHome.jsx` names the single next step in the student's words. No new components; registry `journey`/`gain`/`stage` + guide copy only. The guide stays a reading order, never a gate.

**Track B — per-tool simplification (every live module).** Batches, smallest-blast-radius first; **Track B runs before Track A** because the "less busy" complaint is the direct one and it establishes the idiom Track A frames.

| # | Batch | Modules |
|---|---|---|
| B1 | Single-purpose calculators | CircuitLabPractice, ScoreCalc, BoomileverEstimator, FreshwaterTools, KineticsPractice, GasLawPractice |
| B2 | Multi-mode tools → one mode at a time | FreshwaterToolbox (6 calculators, first pass), StoichiometryPractice (balance vs nomenclature), DigitalLogicWorkbench (tab shell) |
| B3 | Authoring & records | RunLogger, BoomileverBuildLog, AnatomyPractice, shared ReferenceCompiler |
| B4 | Direct-manipulation surfaces | CourseGeometry, CircuitCanvas, MapPractice |

**Per-tool contract (all batches):**

- one primary action; every other control secondary
- inputs split "what you know" (visible) vs "advanced" (collapsed)
- one live-derived result panel in a fixed position — never behind a Calculate button
- saved history collapsed, newest few visible
- no in-tool `<h2>` repeating the page `<h1>`
- every string the unit/e2e tests regex stays verbatim; `app-map.json` guard updated only when anchor text genuinely moved
- authoring tools keep explicit Save/Print/Export plus a live derived signal (budget bar, score preview)

**Exit:** every live module opens on one clear primary action; every event guide reads as an ordered workflow; `npm test`/`lint`/`build` green; e2e green including 375 px overflow and unique-heading guards; a new tool can be built by copying the idiom.

## Phase 3 — Compliance & hands-on layer · ~5 builds

| # | Tool | Scope anchor | Size |
|---|---|---|---|
| 1 | ~~EV Kit/Programming Compliance Checklist~~ ✅ 2026-11-22 | cited per-constraint checkboxes; §3.k.i–iv + §3.l (spec's §8.r pointer was wrong) | M |
| 2 | ~~Boomilever Structure Compliance Worksheet~~ ✅ 2026-11-22 | wall contact, chain, loading block — cite §3 | M |
| 3 | ~~Circuit Lab Safe Hands-on Task Simulator~~ ✅ 2026-11-22 (`e4cdb6c`) | manual-listed task types only (mystery resistor §3.c.i, 3-way switch §3.c.vii, troubleshooting §3.c.vi); other five listed but not simulated | L |
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
| Closed | 2026-10-28 | R&M Mineral ID Key seeding: official-list skeleton (name + chemical class + level from manual pp. C55–C56) with **all properties student-authored**; no pre-filled property data (user decision). |
| Open | — | Objective Tracker shape: shared ReferenceCompiler feature vs per-event module (decide at Phase 3.4). |
| Open | — | Division B scope: stay 8C + WIDI, or grow into more Division B events (whole new events — much larger than Phase 2)? |
| Open | — | Coach/team features: multi-user schema (coach sees team history, shared sheets) during Phase 4? Different privacy story (minors' data) — decide before schema design. |
| Open | — | Offline/PWA support for gyms with bad Wi-Fi — promote to a phase or stay backburner? |
| Open | — | User-facing archive: should archived seasons ever be visible to students (e.g. state tournaments still on old rules) with a disclaimer, or is the archive purely internal? |

## Changelog

- **2026-10-16 (v1.0)** — Roadmap created. Phases: housekeeping → season-boundary foundation → 12 remaining Priority-1 tools → compliance layer → backend (Supabase RLS) → polish → continuous ops + mid-season rules upkeep → annual fresh-brainstorm season rollover with git-tag archive. Open decisions logged (Division B scope, coach features, offline/PWA, WIDI consolidation, R&M seeding, Objective Tracker shape, user-facing archive).
- **2026-10-19 (v1.1)** — Phase 0 (Housekeeping) complete. EV Course & Geometry spec flipped `Planned` → `Live`; `projectBrief.md` scope bullet rewritten to the real live-tool set; `progress.md` WIDI/compiler line corrected (WIDI has overview only) and volatile module/test counts replaced with durable phrasing; chemlab spec names `gasLawNotebook.js`/`experimentNotebook.js`. Policy recorded: living docs point at `tests/e2e/app-map.json` instead of hardcoded counts; dated changelog/history entries keep their counts. Current position → Phase 1.
- **2026-10-27 (v1.2)** — Phase 1 (Season Boundary Foundation) complete. `src/seasons/` now holds the manifest (`ACTIVE_SEASON`), per-event season data, `ACTIVE_DATA`, and `storageKey`/`fileStem`/legacy migration; engines take rule constants as data and the Reference Compiler stamps sessions with their season. `tests/season-boundary.test.js` fails on any year literal outside `src/seasons/`. Current position → Phase 2 item 1.
- **2026-10-27 (v1.3)** — Phase 2 item 1 complete: DG Molecular Sequence Workbench (complement/reverse complement, transcription, translation, six reading frames, mutation classification, State/National restriction mapping) built logic-first on `sequenceUtils.js` with 9 unit cases, registered lazily, added to the app-map and the designergenes e2e flow. Current position → Phase 2 item 2 (DP Freshwater Calculator Toolbox), which begins with re-verifying each formula against the manual/FAQ and dropping any that are not backed.
- **2026-10-27 (v1.4)** — Phase 2 item 2 complete: DP Freshwater Calculator Toolbox. Re-verified every candidate formula against the 2027 Div C manual text (pp. C24–C25) and the event FAQ: the manual lists freshwater topics and prints no formulas, so the toolbox ships six calculators that each record the section naming the quantity plus an explicit basis string (`src/seasons/2027/dynamicplanet.js`) — sinuosity (manual asks for the calculation), hydraulic gradient, Darcy flow, residence time, flood recurrence (definitional `T = 1/P` + n-year chance), and Manning flow. Dropped: ranked-record recurrence plotting (no printed convention) and stream order (needs a network surface + an explicit Strahler/Shreve convention — it belongs to item 3, the generated map/hydrograph tool). Unit conversion is its own tested layer (`toSI`/`fromSI`/`unitOptions`), the UI is live with no Calculate button, and a shared `MeasureField` primitive (number + unit select) was added. Current position → Phase 2 item 3.
- **2026-10-27 (v1.5)** — Phase 2 item 3 complete: DP Map & Hydrograph Practice. The manual text was re-read first, which fixed the scope to the four interpretation tasks it actually names: §3.k.i topographic-map features, §3.k.ii water table from well data, §3.k.iii stream gauging/hydrographs/lag time, plus §3.c.ii stream order (the item the toolbox deferred here because it needs a drawn network). Each case is generated from an integer seed by a pure engine (`mapPracticeUtils.js`): a synthetic height field contoured with marching squares (A and B sit on labelled contours, so relief is read, not guessed), a binary tributary network ordered with Strahler (Shreve noted), three well heads fitted to a water-table plane with regular 5 m contours and a downhill flow arrow revealed on check, and a synthetic hydrograph with its hyetograph. Conventions the manual does not fix are stated in the case, and the citations live in `src/seasons/2027/dynamicplanet.js`. Current position → Phase 2 item 4 (R&M Mineral ID Key).
- **2026-10-28 (v1.6)** — Phase 2 item 4 complete: R&M Mineral ID Key, and the seeding open decision is closed. The manual's official list (pp. C55–C56) prints names, chemical-class groupings and State/National asterisks but **no per-mineral properties** (footnote 1: diagnostic material is provided at the tournament), so shipping property values would have invented an answer key. Per the user decision, `src/seasons/2027/rocksandminerals.js` transcribes the list as a skeleton (81 minerals, 27 starred State/National) and every property value is student-authored, inline or by CSV round-trip. `specimenCardsUtils.js` holds the property vocabulary, hardness-window matching, the match/unknown/excluded buckets and the CSV codec, with `specimen-cards` as the shared store item 5 will reuse. Current position → Phase 2 item 5 (R&M Specimen Practice).
- **2026-11-17 (v1.8)** — Added Phase 2.5 (Intuitive workflow & tool simplification), after the user confirmed the two-part goal from the 2026-11-05 "Tool intuitiveness overhaul" that had never been roadmapped: each event must read as an intuitive workflow, and every tool must be less busy/easier to use. Two tracks — per-event workflow framing (Track A) and per-tool de-cluttering (Track B) — with Track B first and `FreshwaterToolbox.jsx` as the opening pass. It is placed at 2.5, not 6, because Phase 6 is already Season rollover and renumbering would break existing cross-references. The old "58 uncommitted files" blocker recorded in `activeContext.md` was re-checked: the tree now holds 27 entries, all this project's own uncommitted redesign + field-guide work, so those are committed as the clean baseline before simplification begins. Phase 2 item 6 is deferred until Phase 2.5 exits.
- **2026-11-01 (v1.7)** — Phase 2 item 5 complete: R&M Specimen Practice. The drill reads the same `specimen-cards` store as the Mineral ID Key (nothing is re-authored or duplicated), builds its questions at runtime from the recorded properties (`specimenDrillUtils.js`: deck scope → shuffled queue → generated multiple-choice with same-class distractors and an identical-property exclusion), and keeps the session scoreboard/missed list session-only. The property editor was extracted to `PropertyForm.jsx` so both R&M tools author through one component. Current position → Phase 2 item 6 (Anatomy Respiratory Data Practice).
- **2026-11-21 (v1.9)** — Phase 2.5 complete. Track B shipped in four verified batches: B1 (six single-purpose calculators), B2 (Stoichiometry + Digital Logic, with generation/equivalence made live), B3 (three logs/notebooks + the shared ReferenceCompiler, with explicit Save/Export kept and steppers/collapsibles added), B4 (CourseGeometry, CircuitCanvas, MapPractice — the canvas and seed generator deliberately untouched). Track A reviewed all nine event journeys and gains: they already read as ordered, output-focused workflows, so no reorder was made; the guide's bare "Next" label became "Up next" with the step's `gain` printed in the rail. Every batch passed `npm test` (191/191), `npm run lint`, `npm run build`, and focused Playwright with 375 px + unique-heading guards (last runs 79/79 and 80/80). All work is uncommitted on `ca3b54e`; no push or PR. Current position → Phase 2 item 6 (Anatomy Respiratory Data Practice).
- **2026-11-21 (v2.0)** — Circuit Lab PN-Junction / LED Calculator shipped (table row 9, built ahead of rows 7–8 because it was the smallest remaining compute tool). `ledUtils.js` + `LedCalculator.jsx`, 8 unit cases, lazy registry entry, app-map + circuitlab e2e, spec flipped to Live. Device physics is an invariant engine with labelled teaching presets; the manual supplies only scope/citation. Corrected an off-by-two bookkeeping label: earlier notes called this "Phase 2 item 7", but row 7 is the Anatomy System Diagram Drill. Verified `npm test` 209/209, lint clean, build passed, focused Playwright 91/91. Current position → commit + full audit, then resume at row 7.
- **2026-11-21 (v2.1)** — Anatomy System Diagram Drill (row 7) built logic-first: `diagramDrillUtils.js` (reproducible shuffle, same-system choices, correct/wrong/unanswered grading, reveal join) with 5 unit cases, manual-listed structure names transcribed into `src/seasons/2027/anatomy.js` with §3.a.iii/§3.b.ii–iv/§3.c.i citations, and a lazy `SystemDiagramDrill.jsx` (three schematic SVGs, keyboard-focusable numbered hotspots, live choice derivation, explicit Check/reveal, no persistence). Diagrams are cosmetic — the pure engine grades from target ids, so moving a marker cannot change an answer. A visible caption plus `role="group"` on the SVG keep the hotspots in the accessibility tree; decorative shapes are `aria-hidden`. Verified `npm test` 214/214, lint clean, build passed (lazy chunk ~10 kB), focused Playwright 3/3. Current position → commit on approval, full audit, then row 8 (Digestive/Immune Process Practice).
- **2026-11-21 (v2.2)** — Row 7 (Anatomy System Diagram Drill) close-out: "Go" authorized the local commit and full audit. Committed as `dde017c` (`Add anatomy system diagram drill`, 13 files, 642 insertions, clean tree); full sweep `npm run test:e2e:changed -- full` passed 125/125 in 11.7 min and stamped the baseline to `dde017c`; `AUDIT.md` refreshed (125/125 E2E, 214/214 unit, 154 screenshots, drill flow added). Nothing pushed, no PR. Current position → row 8 (Digestive/Immune Process Practice); manual scope for it verified from pp. C4–C5 (§3.b.ii–viii, §3.c.ii–vi) with the spec's State/National and National gates confirmed.
- **2026-11-21 (v2.3)** — Row 8 (Anatomy Digestive/Immune Process Practice) built logic-first: `processPracticeUtils.js` (level filter, injectable shuffle, order/classify grading) with 5 unit cases, six manual-cited cases in `src/seasons/2027/anatomy.js`, and a lazy `ProcessPractice.jsx` (Level/Case selects, Stepper, ordering or classification controls, live progress counter, explicit Check/reveal, no persistence). The built tool covers only names/processes the manual prints (§3.b.i–viii, §3.c.ii–iii, plus level-gated §3.c.ix and §3.c.xi). Immunization and the five immunoglobulin classes (§3.c.v–vi) were deliberately **not** turned into cases: the manual names them but prints no distinguishing detail, so any answer-key grouping would have been invented; they stay in the Reference Compiler objectives. A unit test caught a real engine bug where an over-long ordering answer still scored all-correct — fixed by making completeness part of `allCorrect`. Verified `npm test` 219/219, lint clean, build passed (pre-existing >600 kB advisory), focused Playwright 3/3 (render, 375 px, anatomy flow). Current position → commit on approval and full audit; next unbuilt row is 10 (DG Genetics Workbench), since row 9 (LED calculator) is already committed.
- **2026-11-22 (v2.4)** — Row 8 (Anatomy Digestive/Immune Process Practice) close-out: "Go" authorized the local commit and full audit. Committed as `18afe57` (`Add anatomy digestive/immune process practice`, 13 files, 701 insertions, clean tree); full sweep `npm run test:e2e:changed -- full` passed 128/128 in 23.6 min and stamped the baseline to `18afe57`; `AUDIT.md` refreshed (128/128 E2E, 219/219 unit, 159 screenshots, process-practice flow added). Nothing pushed, no PR. Manual scope for row 10 (DG Genetics Workbench) verified read-only from pp. C20–C21: mono/di/trihybrid Punnett squares and probability rules, pedigrees, epistasis, Hardy–Weinberg assumptions/calculations, allele-frequency change mechanisms, additive-allele gene-count estimation, and State/National two-/three-gene mapping plus heritability. Current position → row 10.
- **2026-11-22 (v2.5)** — Row 10 (DG Genetics Workbench) built logic-first and verified, still uncommitted. `geneticsUtils.js` (gamete generation, Punnett grid/tallies, Hardy–Weinberg from p or a phenotype count, two-/three-point mapping with DCO interference, heritability ratios) with 9 unit cases; `src/seasons/2027/designergenes.js` gained citations, level gates and basis strings stating which relationships are standard conventions rather than printed rules. Lazy `GeneticsWorkbench.jsx` has four live tabs (Punnett, Hardy–Weinberg, gated gene mapping, gated heritability), one fixed result panel per tab, and no persistence. Pedigrees and epistasis were deliberately not shipped: the manual names them but prints no datasets, so a fabricated case key would invent rules content. Two test-found bugs fixed at source: the three-point mapper was uppercasing gamete alleles (destroying parental/DCO comparison) and used locale-dependent sorting; deterministic case-preserving comparisons now apply. In the UI, Hardy rows were passed to a tally table expecting `count`/`fraction` and crashed the panel — a dedicated frequency table fixed it. Verified `npm test` 228/228, lint clean, build passed (pre-existing >600 kB advisory), focused Playwright 3/3 (render, 375 px, DG flow). Current position → commit row 10 on approval, then full audit; rows 11–12 remain.
- **2026-11-22 (v2.6)** — Row 10 (DG Genetics Workbench) close-out: "Continue by yourself" authorized the recommended local commit and full audit. Committed as `e641eda` (`Add Designer Genes genetics workbench`, 13 files, 865 insertions, clean tree); full sweep `npm run test:e2e:changed -- full` passed 131/131 in 5.5 min and stamped the baseline to `e641eda`; `AUDIT.md` refreshed (131/131 E2E, 228/228 unit, 164 screenshots, genetics-workbench flow added). Nothing pushed, no PR. Current position → row 11 (DG Karyotype and Meiosis Drill).
- **2026-11-22 (v2.7)** — Row 11 (DG Karyotype & Meiosis Drill) built logic-first and verified, still uncommitted. Manual §3.ii verified (pp. C20–C21): stages/nondisjunction/karyotypes at base scope; V(D)J recombination and class switching are State/National with no printed detail, so they ship as a level-gated note and never as fabricated cases. `cellGeneticsUtils.js` (stage-cue classification, nondisjunction gamete/zygote derivation, count-derived karyotype notation, seeded cases) with 6 unit cases; lazy `KaryotypeMeiosisDrill.jsx` has three tabs, direct-manipulation chromosome rows, explicit Check/reveal, no persistence. A unit test exposed a real RNG defect — a plain LCG made sequential seeds collapse to one karyotype pattern — fixed with mulberry32 and covered by a diversity assertion. Verification: `npm test` 234/234, lint clean, build passed (pre-existing >600 kB advisory), focused Playwright 3/3 (render, 375 px, DG flow). Current position → commit row 11, then full audit; row 12 remains.
- **2026-11-22 (v2.8)** — Row 11 (DG Karyotype & Meiosis Drill) close-out: the standing "Continue by yourself" approval path covered the local commit and full audit. Committed as `4200e4b` (`Add Designer Genes karyotype and meiosis drill`, 13 files, 716 insertions, clean tree); full sweep `npm run test:e2e:changed -- full` passed 134/134 in 5.5 min and stamped the baseline to `4200e4b`; `AUDIT.md` refreshed (134/134 E2E, 234/234 unit, 169 screenshots, drill flow added). Nothing pushed, no PR. Current position → row 12 (WIDI Timed Relay + Structure Generator), which carries an open consolidation choice: fold Writer/Builder practice into phases of one relay tool vs ship three modules.
- **2026-11-22 (v2.9)** — Row 12 (WIDI Timed Relay) built logic-first and verified. The open consolidation question was resolved without asking: one lazy `timed-relay` module with Write → Build → Review phases, because Writer Practice and Builder Practice are fragments of the same rep and three modules would split the timer, the hand-off and the target gate. Manual cited as printed p. B62 (PDF p. 66) — the old B61 reference was the stale TOC number. `relayUtils.js` (7 unit cases) generates seeded synthetic targets from the manual's example-material vocabulary, derives connection choices and a practice-only five-dimension review, scans descriptions for drawing references and formats the phase timers. `TimedRelay.jsx` gates the target during build, runs live 25:00/20:00 timers, records a builder guess per piece and reveals a per-dimension comparison; no persistence, no official score. Two defects were fixed at source: unrecorded connections counting as free-standing matches, and a missing target card in the review phase (caught by the browser flow). Verification: `npm test` 241/241, lint clean, build passed (pre-existing >600 kB advisory), focused Playwright 4/4. Current position → commit row 12, then full audit.
- **2026-11-22 (v3.0)** — Row 12 (WIDI Timed Relay) close-out under the standing "Continue by yourself" approval path. Committed as `138bd97` (`Add WIDI timed relay with structure generator`, 15 files, 734 insertions, clean tree); full sweep `npm run test:e2e:changed -- full` passed 137/137 in 5.8 min and stamped the baseline to `138bd97`; `AUDIT.md` refreshed (137/137 E2E, 241/241 unit, 174 screenshots, relay flow added). Nothing pushed, no PR. Current position → remaining Phase 2 roadmap rows.
- **2026-11-22 (v3.1)** — Phase 3 item 1 (EV Kit/Programming Compliance Checklist) built logic-first and verified. The spec's `§8.r` citation was wrong; the manual puts these rules in §3.k.i–iv (kit modifications/pusher/parts + non-modification penalty) and §3.l (program developed by ≥1 of the 15 team members, single-source prohibited), printed p. C27, corrected in `tool-ideas.md` and `info.md`. `complianceUtils.js` (5 unit cases) owns status shapes/immutable updates, kit-only filtering and a live summary that treats a missing entry as unreviewed. Lazy `KitComplianceChecklist.jsx` renders four cited check rows with Compliant/Needs work/Not reviewed buttons and notes, a live `n of m` summary, a kit switch that hides inapplicable clauses, the official FAQ clarification and a confirm-gated Reset. No persistence; explicitly self-check, not an ES ruling. The FAQ answer text could not be verified from the page, so the tool quotes the verifiable question and points to the FAQ as authoritative instead of paraphrasing an unverified rule. Verification: `npm test` 246/246, lint clean, build passed (pre-existing >600 kB advisory), focused Playwright 4/4. Next: commit locally, full audit.
- **2026-11-22 (v3.2)** — Phase 3 item 1 (EV compliance checklist) close-out under the standing "Continue by yourself" approval path. Committed as `7b66ab4` (`Add EV kit and program compliance checklist`, 14 files, 386 insertions) plus `e0fcc49` (`Fix EV guide e2e row count for compliance tool`, 1 file) after the first full sweep caught a stale EV guide row-count assertion; nothing pushed. Full sweep `npm run test:e2e:changed -- full` passed 140/140 in 5.6 min and stamped the baseline to `e0fcc49`; `AUDIT.md` refreshed (140/140 E2E, 246/246 unit, 179 screenshots). Current position → Phase 3 item 2 (Boomilever Structure Compliance Worksheet).
- **2026-11-22 (v3.3)** — Phase 3 item 2 (Boomilever Structure Compliance Worksheet) built logic-first and verified. Every printed limit and consequence was re-checked against the extracted manual text before any code shipped: chain centerline 40–45 cm (§3.e.i) and ≤2.5 cm from centerline (§3.e.ii), contact-depth lines at 10/15/20 cm below the bolt center (§6.b.iii), ABOVE-the-line contact rule with Tier 2 (§3.h.i) and the bonus fallback plus 15 kg gate (§3.i.i–ii, including the note that Tier 2 structures tiered for another rule can still earn the bonus), vertical contact width ±4 cm (§3.f/§6.b.iv), block above the bolt before sand (§3.g), and the construction/material rules (§2.d, §3.a–d, §7.a/c/d). `complianceUtils.js` (8 unit cases) owns immutable status updates, absolute-value offset grading, the derived consequence panels and a live `n of m` summary where a missing entry is unreviewed. Lazy `StructureComplianceWorksheet.jsx` (stage practice, no persistence) has three live geometry fields, a base-option switch, the 15 kg gate, ten three-state cited check rows, an official FAQ link and a confirm-gated Reset; it explicitly assigns no tier, bonus or score. Registered as `id: 'structure-compliance'`, app-map + Boomilever e2e added, spec status Live. Two test-found fixes at source: uncontrolled-input snap-back in the controlled numeric fields, and an e2e substring collision with the summary's "n out of range" copy. Verification: `npm test` 254/254, lint clean, build passed (pre-existing >600 kB advisory; lazy chunk 8.30 kB), focused Playwright 1/1, full audit 143/143 in 6.0 min with baseline stamped to `c655dfc`; `AUDIT.md` refreshed (143/143 E2E, 254/254 unit, 184 screenshots). Next: Phase 3 item 3 (Circuit Lab Safe Hands-on Task Simulator).
