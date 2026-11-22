# Circuit Lab C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C16–C17. Separate written-test scope from hands-on practice. Do not teach or score explicitly excluded material as event content. A paper reference binder of any size and up to two Class III calculators are allowed. Written work is 50–75%; hands-on is 25–50%. The written scope is broad (historical figures, fields, DC circuits, PN-junction devices, Kirchhoff, digital logic); the current practice tool covers only a slice of it. Because a binder of any size is allowed, the Reference & Study Compiler runs in binder mode.

## Tool: Circuit Practice
- **Status:** Live — `src/components/events/circuitlab/CircuitLabPractice.jsx` (logic in `circuitUtils.js`)
- **Category:** Practice
- **Goal:** Practice Ohm's law, power/energy, series/parallel equivalent resistance, and Kirchhoff's laws from user-entered values.
- **Core interaction loop:** 1) Ohm's law tab: supply exactly two of voltage, current, resistance; the solver returns the third. 2) Equivalent-resistance tab: enter comma-separated resistances; the solver reports the series sum and the parallel reciprocal-sum result. 3) Power/energy and Kirchhoff (KVL/KCL) practice for a supplied resistor network.
- **Content & data:** Manual §3 written topics (Ohm's law, power/energy, resistance in series/parallel, Kirchhoff's laws — manual pp. C16–C17); user-entered values only; no preset questions.
- **UI components:** Input forms, network sketch, result readouts.
- **Interactivity:** Live: R_eq and Ohm's law derive from the fields as typed, with a live series/parallel schematic and an Ohm's-law triangle; there is no Calculate gate.
- **Scoring & feedback:** Practice feedback; labeled a learning calculator, not an official event score. State/National-only clock/timing/flip-flop, transistor bias/logic, and ideal op-amp content is excluded at Regional.
- **Level gating:** exclude capacitance, AC theory, inductance, Thevenin/Norton, oscilloscopes; complex numbers/matrices/calculus are out of scope.
- **Persistence:** none.
- **Open questions:** how far to extend the network solver (single-loop vs multi-loop KVL/KCL) while staying within listed math.

## Tool: Digital Logic and Boolean Workbench
- **Status:** Live — `src/components/events/circuitlab/DigitalLogicWorkbench.jsx` (logic in `booleanLogic.js`; panels `KMapMinimizer.jsx`, `MultiOutputTruthTable.jsx`, `CircuitCanvas.jsx`, `LogicDrill.jsx`, shared `TruthTable.jsx`)
- **Category:** Practice
- **Goal:** Practice digital logic, Boolean expressions, De Morgan's law, Karnaugh-map minimization, and combinational circuits.
- **Core interaction loop:** 1) Gate truth tables: pick AND/OR/NOT/XOR/NAND/NOR and read the full truth table (universal gates flagged). 2) Expression → truth table: type any expression over A–D with AND/OR/NOT/XOR, symbols, and parentheses; get the truth table plus canonical sum-of-products. 3) Karnaugh map: type an expression and see its 1s placed on a gray-code grid with shaded, numbered groups and the minimal sum-of-products (Quine–McCluskey). 4) Equivalence: compare two expressions across all inputs, e.g. the two sides of De Morgan's law, and see the first differing row. 5) Multi-output table: name several outputs and give each an expression; generate a combined truth table. 6) Combinational circuits: guided half adder, full adder, and 2:1 multiplexer truth tables. 7) Circuit canvas: place inputs/gates/an output, drag nodes to arrange them, wire outputs to inputs by dragging or clicking, click a wire to remove it, use Tidy up to lay the circuit out left to right, and watch each node's value update live with the full truth table; the circuit is saved in the browser. 8) Practice drill: generated minimization/recall problems with instant feedback.
- **Content & data:** Manual core written topics — digital logic, Boolean expressions, De Morgan's law, Karnaugh maps, and combinational circuits (manual pp. C16–C17); user-entered/generated logic, not a fixed question bank. Binary representation and addition underpin the adder circuits.
- **UI components:** Mode tabs, gate/circuit selectors, expression inputs, generated truth tables, a shaded K-map grid, multi-output table, a draggable circuit canvas with clickable SVG wires, live values, and a Tidy-up auto-layout, and a self-scoring drill. (Wiring supports pointer drag *and* click-to-connect, and wires are focusable delete buttons, so it stays keyboard-accessible and headlessly testable.)
- **Interactivity:** Live + direct manipulation (reference implementation): canvas, K-map, and truth tables update continuously; explicit buttons only for Generate/Check.
- **Scoring & feedback:** Verifies truth tables, canonical and minimized sum-of-products, equivalence, and drill answers; practice only, labeled not an official score.
- **Level gating:** clock/timing concepts and flip-flops gated to State/National and excluded from this tool; combinational logic is the core.
- **Persistence:** the canvas (nodes, wires, input values) is saved to browser `localStorage` (`olympiad-studio.circuitlab-c.2027-logic-canvas`) and restored on load.
- **Open questions:** whether to add clocked/sequential elements (excluded at Regional); confirm the exact set of combinational elements emphasized in the 2027 manual.

## Tool: PN-Junction / LED Calculator
- **Status:** Live — `src/components/events/circuitlab/LedCalculator.jsx` (logic in `ledUtils.js`)
- **Category:** Calculator
- **Goal:** Size LED series resistors and analyze silicon PN-junction devices (diodes/LEDs).
- **Core interaction loop:** 1) Enter supply voltage, LED forward voltage, and target current. 2) Read the required series resistor and dissipated power. 3) Check diode/LED orientation and forward-drop assumptions.
- **Content & data:** Manual-listed silicon PN-junction devices (diodes/LEDs); user-entered values.
- **UI components:** Input form, result readout, reference panel.
- **Interactivity:** Live: the required series resistor and dissipated power derive from the inputs as typed.
- **Scoring & feedback:** Practice calculator; labeled not an official score.
- **Level gating:** exclude unlisted nonlinear devices.
- **Persistence:** none.

## Tool: Safe Hands-on Task Simulator
- **Status:** Live — `src/components/events/circuitlab/SafeHandsOnSimulator.jsx` (engine in `handsOnUtils.js`)
- **Category:** Practice
- **Goal:** Train breadboard/multimeter habits and practice rule-listed hands-on task types.
- **Core interaction loop:** 1) Choose one of the three implemented manual-listed tasks (voltage-only mystery resistor §3.c.i, SPDT 3-way switch §3.c.vii, troubleshooting §3.c.vi) and note its printed citation. 2) Generate or reuse a seeded low-voltage DC case, probe components by clicking or pressing Enter on the labelled circuit nodes, and work out the answer. 3) Check the answer and read the stated teaching convention behind the simulation.
- **Content & data:** The task list is manual §3.c.i–viii (p. C17) — the earlier §2/§4 pointer was wrong, since §2 is event parameters and §4 is scoring. Season data (`src/seasons/2027/circuitlab.js`) owns §3.b (breadboard/multimeter familiarity), §3.d (no soldering, high-power or AC exposure) and §4.a–c (hands-on is 25–50%). The manual prints no circuits, component values, fault models or task rubric, so values/cases are labelled teaching simulations, never official apparatus. Rescoped from an open-ended breadboard sim to concrete manual-listed tasks; v1 implements the three roadmap-named tasks; the other five are listed with citations but explicitly not simulated so no fabricated task key ships.
- **UI components:** Task tabs, seed control, responsive SVG circuit boards with focusable probe/switch nodes, labelled duplicate controls for keyboard and headless use, live measurement legend, answer fields, feedback panel and a collapsible list of the unsimulated tasks.
- **Interactivity:** Direct manipulation: circuit nodes are focusable buttons (pointer click plus Enter/Space); voltages, lamp state and task milestones derive live from the case and the student's probes/toggles. `New case`, `Check`, `Activate switch` and `Restart wiring` are explicit side-effect actions.
- **Scoring & feedback:** Practice-only feedback with the worked divider derivation or revealed simulated fault; no official score, task time or ES ruling. The tool states that no prohibited hazardous exposure is simulated.
- **Level gating:** none — hands-on tasks are core.
- **Persistence:** none; the case seed is shown so a case can be revisited.

## Tool: Reference & Study Compiler
- **Status:** Live — `src/components/events/circuitlab/CircuitLabReferenceCompiler.jsx` (shared engine `src/components/general/ReferenceCompiler.jsx`)
- **Category:** Notebook
- **Goal:** Build the allowed reference binder and track coverage of the manual's topics.
- **Core interaction loop:** 1) Work the objective checklist transcribed from the manual's topic list and mark each item Not started / Studying / Confident. 2) Author reference blocks (text, tables, diagrams) filed under the matching objective. 3) Export a print-ready, paginated binder with a tab/section index.
- **Content & data:** Objective outline transcribed from manual pp. C16–C17 (rule-derived, no invented content); user-authored reference content only. Allowed resource: paper notes/resources of any size/content/source; binders, removable pages, tabs, and labels permitted.
- **UI components:** Objective checklist with status + level filter, reference block editor grouped by objective, section/tab index, paginated print/export.
- **Interactivity:** Authoring tool: live budget and index preview update as you edit; Save/Print/Export are explicit actions.
- **Scoring & feedback:** none (organizer).
- **Level gating:** objectives tagged Core / State-National / National-only; excluded topics (capacitance, AC, Thevenin/Norton, etc.) are not offered as objectives.
- **Persistence:** localStorage (explicit save/restore); print-to-PDF and JSON export; text escaped.
- **Open questions:** shared engine with per-event config (binder mode); binder mode ships after sheet mode.
