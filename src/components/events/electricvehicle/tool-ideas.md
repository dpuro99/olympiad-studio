# Electric Vehicle C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C26–C31 + official EV FAQ (checked Oct 8, 2026). The 2027 format is set-time + bottle push + reverse stop; old arc/can geometry and can-bonus assumptions are obsolete. EV already has the strongest tool set in the registry (score calculator + run logger), so the remaining planned work is complementary.

## Tool: Event Overview
- **Status:** Live — `src/components/events/electricvehicle/ArcVisualizer.jsx`
- **Category:** Overview
- **Goal:** Read the verified 2027 task, construction constraints, and run procedure.
- **Core interaction loop:** Scroll the overview summary; follow links to the official FAQ and rules.
- **Content & data:** Manual pp. C26–C31; 8-AA limit, 80 cm length, 35 cm width, rigid custom pusher, rear measurement point, impound, 8-minute/two-run window; official code-contribution clarification link.
- **UI components:** Summary sections + source links.
- **Interactivity:** Non-interactive by design: a static, verified reference summary. An interactive summary would add nothing; geometry practice is served by the Course & Geometry tool below.
- **Scoring & feedback:** Reference only; not scoring.
- **Level gating:** Bottle position varies by level (2 m Regional/Invitational, 3 m State, 4 m National).
- **Persistence:** none.

## Tool: Course & Geometry
- **Status:** Planned — `src/components/events/electricvehicle/CourseGeometry.jsx` (logic in `courseUtils.js`)
- **Category:** Calculator
- **Goal:** Explore the set-time + bottle push + reverse-stop course geometry interactively: course distance (by level), target time, average speed, and pusher/stop accuracy.
- **Core interaction loop:** 1) Drag sliders / enter values for course distance (2 m Regional-Invitational, 3 m State, 4 m National), target time, and pusher opening. 2) Watch required average speed, per-segment pacing, and the scoring tradeoffs update live on an interactive course diagram. 3) Read the manual-cited formulas beside the diagram.
- **Content & data:** Manual pp. C26–C31 + official EV FAQ; the verified 2027 scoring contract (run = `100 + Distance + Time + Bonuses + Run Penalties`; distance = `2 × vehicle distance + bottle distance`; time = `0.5 × |target − run|`; pusher bonus, penalties). Rule-derived geometry only — cite the manual beside the diagram.
- **UI components:** Interactive SVG course diagram (draggable markers + hover readouts), slider + numeric inputs, live derived readouts, manual citation panel.
- **Interactivity:** Live + direct manipulation — the core of this tool; values and the diagram update continuously as sliders move (keyboard-accessible sliders).
- **Scoring & feedback:** Educational estimate with assumptions shown; not an official prediction; cites the manual.
- **Level gating:** bottle distance by level (2 / 3 / 4 m); National event-time bonus noted.
- **Persistence:** localStorage for the last scenario (optional).
- **Open questions:** exact course-diagram affordances; verify the pp. C26–C31 geometry and FAQ before labeling any derived distance rule-exact.

## Tool: Score Calculator
- **Status:** Live — `src/components/events/electricvehicle/ScoreCalc.jsx` (logic in `scoreUtils.js`)
- **Category:** Calculator
- **Goal:** Compute two EV run scores and the final score from user-entered measurements.
- **Core interaction loop:** 1) Enter target time, run time, vehicle/bottle distances, pusher opening width. 2) Flag bottle/target status, violations, failed run. 3) View per-run breakdown and final score. 4) Toggle National event-time bonus and impound status for the final score.
- **Content & data:** 2027 scoring contract — run = `100 + Distance + Time + Bonuses + Run Penalties`; distance = `2 × vehicle distance (cm) + bottle distance (cm)` (failed run = 2500; bottle not past target / moving-bottle violation → 400); time = `0.5 × |target − run|` (failed = 0.00); bottle bonus −20 if fully past line; pusher bonus `(opening − 35.0) × 1.5`; penalties competition +150, construction +300, non-modification +50; final = better run + National-only `(event time used − 480)/30` + 5000 if not impounded. Verified against the manual's example runs.
- **UI components:** Run input panels, per-run breakdown table, final-score summary.
- **Interactivity:** Live: per-run and final scores derive from the inputs as typed.
- **Scoring & feedback:** Rounds to 2 decimals; labels results practice, not an ES ruling.
- **Level gating:** Event-time bonus and 4 m bottle line are National-only.
- **Persistence:** none (see Run Logger for saved runs).

## Tool: Practice Run Logger
- **Status:** Live — `src/components/events/electricvehicle/RunLogger.jsx`
- **Category:** Notebook
- **Goal:** Save measured practice runs locally with verified 2027 scoring.
- **Core interaction loop:** 1) Record raw ES measurements, success/failure, bottle position/handling, violations, kit-modification notes. 2) Auto-calculate score per the Score Calculator contract. 3) View run history; export as CSV.
- **Content & data:** User-supplied measurements only; same scoring contract as Score Calculator.
- **UI components:** Run entry form, history list, CSV export.
- **Interactivity:** Authoring/log: live score preview as a run is entered; Save and CSV export are explicit actions.
- **Scoring & feedback:** Uses verified formulas; warns this is not an ES ruling.
- **Level gating:** National-only final factors toggled by the user.
- **Persistence:** localStorage, explicit save/restore; CSV export escaped and formula-injection-safe.

## Tool: Kit/Programming Compliance Checklist
- **Status:** Planned
- **Category:** Worksheet
- **Goal:** Help teams self-check the two functional kit modifications, self-built pusher, and code contribution rules.
- **Core interaction loop:** Check each constraint in turn; read guidance; record what was documented.
- **Content & data:** Manual construction rules + official code-contribution clarification (current/non-roster student link from the FAQ).
- **UI components:** Checklist with per-rule status; source citations per rule.
- **Interactivity:** Live: each constraint's status updates as it is checked, with its citation.
- **Scoring & feedback:** Report-only; must not claim to pre-judge an ES inspection.
- **Level gating:** none.
- **Persistence:** none (or localStorage if requested).

## Tool: Run Planning Estimator
- **Status:** Planned
- **Category:** Calculator
- **Goal:** Explore the speed/time tradeoffs of the set-time-then-reverse task.
- **Core interaction loop:** 1) Enter target time and the vehicle/bottle distances for a practice scenario. 2) Estimate required average speed and turn/reverse behavior under user-supplied assumptions. 3) Compare scenarios.
- **Content & data:** Manual task format and scoring contract plus explicit user-supplied assumptions; educational only, not a prediction of official results.
- **UI components:** Input form, estimate card, visible assumptions editor.
- **Interactivity:** Live: the estimate and requirements recompute as inputs/assumptions change; side-by-side scenario comparison.
- **Scoring & feedback:** No official score; an educational estimate with assumptions shown.
- **Level gating:** bottle position by level (2/3/4 m); National event-time bonus noted.
- **Persistence:** none.
- **Open questions:** keep this only if the modeled assumptions remain clearly educational and never imply an official prediction.
