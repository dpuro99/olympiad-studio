# Circuit Lab C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C16–C17. Separate written-test scope from hands-on practice. Do not teach or score explicitly excluded material as event content. A paper reference binder of any size and up to two Class III calculators are allowed. Written work is 50–75%; hands-on is 25–50%. The written scope is broad (historical figures, fields, DC circuits, PN-junction devices, Kirchhoff, digital logic); the current practice tool covers only a slice of it. Because a binder of any size is allowed, the Reference & Study Compiler runs in binder mode.

## Tool: Circuit Practice
- **Status:** Live — `src/components/events/circuitlab/CircuitLabPractice.jsx` (logic in `circuitUtils.js`)
- **Category:** Practice
- **Goal:** Practice Ohm's law, power/energy, series/parallel equivalent resistance, and Kirchhoff's laws from user-entered values.
- **Core interaction loop:** 1) Ohm's law tab: supply exactly two of voltage, current, resistance; the solver returns the third. 2) Equivalent-resistance tab: enter comma-separated resistances; the solver reports the series sum and the parallel reciprocal-sum result. 3) Power/energy and Kirchhoff (KVL/KCL) practice for a supplied resistor network.
- **Content & data:** Manual §3 written topics (Ohm's law, power/energy, resistance in series/parallel, Kirchhoff's laws — manual pp. C16–C17); user-entered values only; no preset questions.
- **UI components:** Input forms, network sketch, result readouts.
- **Scoring & feedback:** Practice feedback; labeled a learning calculator, not an official event score. State/National-only clock/timing/flip-flop, transistor bias/logic, and ideal op-amp content is excluded at Regional.
- **Level gating:** exclude capacitance, AC theory, inductance, Thevenin/Norton, oscilloscopes; complex numbers/matrices/calculus are out of scope.
- **Persistence:** none.
- **Open questions:** how far to extend the network solver (single-loop vs multi-loop KVL/KCL) while staying within listed math.

## Tool: Digital Logic and Boolean Workbench
- **Status:** Planned
- **Category:** Practice
- **Goal:** Practice digital logic, Boolean expressions, De Morgan's law, and combinational circuits.
- **Core interaction loop:** 1) Choose a mode (gate truth table, expression ↔ truth table, Boolean simplification, build a combinational circuit such as a half/full adder or multiplexer). 2) Manipulate inputs/gates and observe outputs. 3) Check the derived truth table or simplified expression.
- **Content & data:** Manual core written topics — digital logic, Boolean expressions, De Morgan's law, and combinational circuits; user-built/generated logic, not a fixed question bank. This is one of the largest assigned written topics and currently has no tool.
- **UI components:** Gate palette, wiring canvas, truth-table panel, expression simplification checker.
- **Scoring & feedback:** Verifies truth tables and simplifications; practice only.
- **Level gating:** clock/timing concepts and flip-flops gated to State/National; keep combinational logic as the core.
- **Persistence:** none.
- **Open questions:** confirm the exact set of combinational elements emphasized in the 2027 manual.

## Tool: PN-Junction / LED Calculator
- **Status:** Planned
- **Category:** Calculator
- **Goal:** Size LED series resistors and analyze silicon PN-junction devices (diodes/LEDs).
- **Core interaction loop:** 1) Enter supply voltage, LED forward voltage, and target current. 2) Read the required series resistor and dissipated power. 3) Check diode/LED orientation and forward-drop assumptions.
- **Content & data:** Manual-listed silicon PN-junction devices (diodes/LEDs); user-entered values.
- **UI components:** Input form, result readout, reference panel.
- **Scoring & feedback:** Practice calculator; labeled not an official score.
- **Level gating:** exclude unlisted nonlinear devices.
- **Persistence:** none.

## Tool: Safe Hands-on Task Simulator
- **Status:** Planned
- **Category:** Practice
- **Goal:** Train breadboard/multimeter basics and practice rule-listed hands-on task types.
- **Core interaction loop:** 1) Choose a task type (voltage-only mystery resistor, power, equally bright LEDs, charger-label analysis, truth-table circuit, troubleshooting, SPDT 3-way switch, equivalent resistance). 2) Walk through a guided simulation using manual-listed requirements. 3) Review the underlying rule/technique.
- **Content & data:** Manual hands-on task list (manual §2/§4, pp. C16–C17); low-voltage supplied components only. Rescoped from an open-ended breadboard sim to these concrete, manual-listed tasks.
- **UI components:** Task chooser, guided simulation, reference panel.
- **Scoring & feedback:** Practice feedback; never simulate prohibited hazardous exposure as an event procedure.
- **Level gating:** none.
- **Persistence:** none.

## Tool: Reference & Study Compiler
- **Status:** Planned
- **Category:** Notebook
- **Goal:** Build the allowed reference binder and track coverage of the manual's topics.
- **Core interaction loop:** 1) Work the objective checklist transcribed from the manual's topic list and mark each item Not started / Studying / Confident. 2) Author reference blocks (text, tables, diagrams) filed under the matching objective. 3) Export a print-ready, paginated binder with a tab/section index.
- **Content & data:** Objective outline transcribed from manual pp. C16–C17 (rule-derived, no invented content); user-authored reference content only. Allowed resource: paper notes/resources of any size/content/source; binders, removable pages, tabs, and labels permitted.
- **UI components:** Objective checklist with status + level filter, reference block editor grouped by objective, section/tab index, paginated print/export.
- **Scoring & feedback:** none (organizer).
- **Level gating:** objectives tagged Core / State-National / National-only; excluded topics (capacitance, AC, Thevenin/Norton, etc.) are not offered as objectives.
- **Persistence:** localStorage (explicit save/restore); print-to-PDF and JSON export; text escaped.
- **Open questions:** shared engine with per-event config (binder mode); binder mode ships after sheet mode.
