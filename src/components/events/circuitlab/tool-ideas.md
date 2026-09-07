## Circuit Lab C — Tool Specs

### Tool: Ohm's Law & Power Multi-Variable Solver
**Event:** Circuit Lab C
**Purpose:** Build fluency in solving Ohm's Law and power equations with any subset of variables given — students must rapidly solve for unknowns under time pressure in the written test portion.
**Core interaction loop:**
1. Tool presents a scenario: "A resistor has 12V across it and draws 2A. What is its resistance? What power does it dissipate?"
2. User enters the unknown value(s), optionally showing their work/formula.
3. Tool validates the answer and reveals the correct solution with all relevant formulas (V=IR, P=VI, P=I²R, P=V²/R) highlighted.
4. Tool optionally asks a follow-up (e.g., "If the voltage triples but resistance stays the same, what happens to the current and power?").
**Content/data needed:** Problem bank covering all combinations of V, I, R, P — varying difficulty (single-variable unknowns → multi-step scenarios combining Ohm's Law and power).
**UI components:** Scenario display; input field(s) for unknown(s); formula reference panel (collapsible); solution reveal with working; optional unit selector for power output.
**Feedback/scoring logic:** Per-problem accuracy; wrong answers trigger solution reveal and are queued for later replay; session summary highlights which variable relationships (V-I, I-R, power) need more practice.


---

### Tool: Kirchhoff's Law Circuit Analyzer
**Event:** Circuit Lab C
**Purpose:** Practice applying KCL (current law) and KVL (voltage law) to multi-loop circuits — a core analytical skill tested in the written portion and essential for understanding complex circuits.
**Core interaction loop:**
1. Tool displays a multi-loop circuit diagram with labeled resistors, batteries, and a junction or loop point highlighted.
2. User applies KCL or KVL (as prompted) to write the constraint equation(s).
3. User solves for unknown currents or voltages.
4. Tool validates the equation setup and the final answer.
**Content/data needed:** Circuit bank with 2-loop, 3-loop, and mixed scenarios; some with dependent sources; problems with varying difficulty and current/voltage unknowns.
**UI components:** Interactive circuit diagram (can select a junction for KCL or a loop for KVL); equation-builder tool (text input or visual formula constructor); step-by-step solution reveal showing current/voltage assignments, equation setup, and algebraic solution.
**Feedback/scoring logic:** Equation setup accuracy tracked separately from final answer accuracy (user might set up equations correctly but solve them wrong, or vice versa); incorrect equation setup triggers hint about KCL/KVL application at that point.


---

### Tool: Mystery Resistor Problem Solver
**Event:** Circuit Lab C
**Purpose:** Practice the reasoning required for the hands-on task: determining resistance using only voltage measurements in a circuit (no ohmmeter), applying Ohm's Law creatively.
**Core interaction loop:**
1. Tool describes a circuit setup (e.g., "A 10V battery is connected in series with a known 5Ω resistor and an unknown resistor. A voltmeter reads 6V across the unknown resistor").
2. User determines the unknown resistance using only the given information, showing work.
3. Tool validates the answer and reveals the full solution, highlighting the Ohm's Law application at each step.
4. Tool can show alternative mystery-resistor scenarios (different series/parallel arrangements, multiple unknowns, etc.).
**Content/data needed:** Problem bank of mystery-resistor scenarios with varying complexity: series circuit, series-parallel, multiple unknowns, etc.
**UI components:** Circuit diagram display; problem description; calculation workspace/input area; solution reveal showing the voltage/current reasoning chain.
**Feedback/scoring logic:** Per-problem accuracy; incorrect answers trigger working backward from the solution (e.g., "What current flows through the known resistor, given the voltage drop across it?").


---

### Tool: Circuit Diagram Interpreter & Builder
**Event:** Circuit Lab C
**Purpose:** Practice reading/drawing correct circuit schematics, identifying series vs. parallel components, and predicting behavior (voltage division, current split, etc.).
**Core interaction loop:**
1. Tool displays a circuit diagram and asks: "What is the equivalent resistance?" or "How does the current split between these parallel branches?" or "What voltage appears across this component?"
2. User analyzes the circuit and enters the answer with reasoning.
3. Tool validates and reveals the correct analysis with series/parallel identification highlighted.
4. Alternatively, tool gives a circuit description (text) and asks user to draw the schematic using a simple circuit-drawing tool.
**Content/data needed:** Bank of circuit diagrams (increasing complexity from simple series/parallel to mixed); for each, questions about equivalent resistance, voltage division, current split, and power.
**UI components:** Circuit diagram display or drawing canvas; multiple-choice or numeric input for questions; circuit-element palette for building circuits (resistors, batteries, switches, wires); solution reveal with series/parallel annotations.
**Feedback/scoring logic:** Per-question accuracy; incorrect analyses trigger prompts to identify series vs. parallel groupings first, then recalculate.


---

### Tool: Multimeter Reading Simulator & Validator
**Event:** Circuit Lab C
**Purpose:** Practice correct multimeter connection (parallel for voltage, series for current, proper polarity) and reading accuracy — essential for Part II hands-on tasks.
**Core interaction loop:**
1. Tool presents a circuit and asks the student to measure a specific quantity (e.g., "Measure the voltage across R2").
2. Student selects multimeter setting (V, A, or Ω), selects the measurement points/probes, and reads the simulated meter display.
3. Tool validates correct multimeter setup (parallel for V, series for A, polarity correct) and correct reading.
4. Tool can present the same circuit with variations (different power supply voltage, component values) to reinforce the procedure.
**Content/data needed:** Circuit diagrams with labeled components; simulated multimeter displays showing realistic readings for each scenario; reference for correct meter setup per measurement type.
**UI components:** Circuit diagram with draggable multimeter probe connectors; multimeter setting selector (V/A/Ω, AC/DC where relevant); simulated meter display (analog or digital); visual feedback on probe placement (green for correct series/parallel, red for incorrect).
**Feedback/scoring logic:** Setup accuracy checked first (if probes connected wrong, meter reads show "ERROR" or are out-of-range, prompting student to reconsider setup); reading accuracy then validated.


---

### Tool: LED Brightness Equalizer Calculator
**Event:** Circuit Lab C
**Purpose:** Practice circuit design reasoning for a hands-on task: given a supply voltage and two identical LEDs, design a series/parallel circuit so the LEDs are equally bright.
**Core interaction loop:**
1. Tool presents a scenario: "You have two identical 2V/20mA LEDs and a 12V power supply. Design a circuit so both LEDs are equally bright."
2. User proposes a circuit configuration (series, parallel, series with limiting resistor, mixed) and specifies any resistor values needed.
3. Tool validates the design: checks if both LEDs get the same current and voltage (for equal brightness), confirms components aren't over-spec'd, and calculates power dissipation.
4. Tool reveals the correct approach with analysis of why the proposed design does or doesn't work.
**Content/data needed:** LED specifications (forward voltage, rated current); power supply voltages; resistor value calculators (for current-limiting).
**UI components:** Circuit-drawing canvas (place LEDs, battery, resistors, connect); LED and resistor parameter inputs; current/voltage calculator for each LED; pass/fail indication on design validation.
**Feedback/scoring logic:** Design validated for equal current through both LEDs (equal brightness), component ratings, and feasibility; incorrect designs trigger analysis of where brightness inequality occurs (e.g., "If LEDs are in series, they get the same current but different voltages — are you sure they're equally bright?").


---

### Tool: Electromagnetic Force & Motion Calculator
**Event:** Circuit Lab C
**Purpose:** Practice calculating force on current-carrying conductors in magnetic fields and understanding motor operation — a core Part I knowledge area.
**Core interaction loop:**
1. Tool presents a scenario: "A 10cm wire carrying 5A is in a perpendicular 0.2T magnetic field. What force acts on the wire?"
2. User calculates the force using F=BIL (or the vector form) and optionally determines direction using the right-hand rule.
3. Tool validates the calculation and reveals the correct answer with formula and direction reasoning.
4. Tool can extend the scenario (e.g., "If the wire is at 30° to the field, what is the new force?").
**Content/data needed:** Problem bank for F=BIL calculations (perpendicular and angled cases), right-hand rule direction determination, and scenarios involving torque in motors.
**UI components:** Problem display; formula reference (F=BIL with vector/angle version); input fields for magnitude and direction; solution reveal with diagram showing force direction.
**Feedback/scoring logic:** Magnitude and direction graded separately; incorrect directions prompt right-hand-rule visualization.


---

### Tool: AC vs. DC & Transformer Conceptual Explainer
**Event:** Circuit Lab C
**Purpose:** Build understanding of AC vs. DC characteristics (waveforms, power, hazards), and how transformers work with AC — core Part I knowledge that requires conceptual reasoning, not just formula application.
**Core interaction loop:**
1. Tool presents a scenario or question: "Why do transformers only work with AC, not DC?" or "A 120V AC household outlet delivers power — what does '120V' actually mean?"
2. User enters a free-text explanation or selects from conceptual options (e.g., "Because DC doesn't produce a changing magnetic flux").
3. Tool reveals a correct explanation emphasizing the physical mechanism (AC creates time-varying flux → induces secondary voltage; DC creates static flux → no induction).
4. Tool can ask follow-up applications (e.g., "If I use a rectifier to convert AC to DC, will a transformer still work? Why or why not?").
**Content/data needed:** Set of AC/DC and transformer conceptual prompts with model explanations emphasizing electromagnetic induction and flux change.
**UI components:** Prompt display; free-text input or multiple-choice conceptual options; model explanation reveal; animated diagram (optional) showing AC waveform vs. static DC field.
**Feedback/scoring logic:** Free-text responses scored against keyword checklist (mentions "changing flux," "induction," "time-varying," etc.); multiple-choice responses directly validated.


---

### Tool: Diode & Transistor Behavior Analyzer (State/National)
**Event:** Circuit Lab C
**Purpose:** Build understanding of basic PN-junction diode behavior, PNP/NPN transistor operation, and op-amp principles — State/National-only content that is a hard jump from Regional-level prep.
**Core interaction loop:**
1. Tool presents a diode circuit and asks: "If the diode is forward-biased with 1V across it, what current flows?" (uses typical forward voltage ~0.7V; below this, negligible current).
2. User predicts the current/voltage behavior, then tool validates.
3. For transistors: tool shows an NPN circuit and asks whether the transistor is in cutoff, active, or saturation based on base-emitter and collector-emitter voltages.
4. For op-amps: tool presents a simple inverting or non-inverting configuration and asks the user to predict Vout based on the inputs and gain formula.
**Content/data needed:** Diode I-V characteristic reference; transistor bias regions (cutoff/active/saturation); op-amp gain formulas for inverting/non-inverting/differential configurations.
**UI components:** Circuit diagram with diode/transistor/op-amp; voltage input fields; bias-region or output selector; solution reveal with characteristic curve or gain calculation.
**Feedback/scoring logic:** Diode current validated against characteristic curve; transistor bias region checked against Vbe/Vce thresholds; op-amp output validated against gain formula.

---

### Tool: Historical Figures Quick Reference & Quiz
**Event:** Circuit Lab C
**Purpose:** Ensure students can quickly answer the "free points" guaranteed historical-figure questions: Ampere, Coulomb, Kirchhoff, Volta, Ohm, Tesla, Faraday and their contributions.
**Core interaction loop:**
1. Tool shows a scientist's name and asks: "What is this person credited with?" or shows a contribution and asks "Who is this credited to?"
2. User selects from a list or types the answer.
3. Tool reveals the correct answer and a brief fact (e.g., "Ampere — quantified the relationship between current and magnetic force; unit of current named after him").
4. Tool cycles through all seven figures, randomizing order, with emphasis on previously-missed figures.
**Content/data needed:** Table of 7 scientists: `{name, contribution, unit_named_after, interesting_fact}`.
**UI components:** Single-question card; multiple-choice or text-input selector; fact reveal; progress indicator (X of 7 figures).
**Feedback/scoring logic:** Per-scientist accuracy; all seven must be learned to "pass" the module; weak figures are requeued.

