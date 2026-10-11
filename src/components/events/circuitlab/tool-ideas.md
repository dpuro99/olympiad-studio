# Circuit Lab C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C16–C17. Separate written-test scope from hands-on practice. Do not teach or score explicitly excluded material as event content. A paper reference binder of any size and up to two Class III calculators are allowed. Written work is 50–75%; hands-on is 25–50%.

## Tool: Circuit Practice
- **Status:** Live — `src/components/events/circuitlab/CircuitLabPractice.jsx` (logic in `circuitlab.js`)
- **Category:** Practice
- **Goal:** Practice written-test topics with generation across circuits, logic, and semiconductor basics.
- **Core interaction loop:** 1) Pick a topic (Ohm's law, series/parallel, open/short, schematic, Kirchhoff, PN junction/diode/LED, Boolean/truth tables, De Morgan, combinational logic, or two-unknown solver). 2) Solve generated questions (auto-generated with a seed) or enter values into the solver. 3) Reveal the solution and reset topic/seed on demand.
- **Content & data:** Manual §3 written-test topics; auto-generated numeric questions and deterministic (seeded) examples; the two-unknown solver covers series/parallel equivalents.
- **UI components:** Topic menu, question/answer panel, solution reveal, reset.
- **Scoring & feedback:** Practice feedback; not an official answer key. State/National-only clock/timing/flip-flop, transistor bias/logic, and ideal op-amp content stays excluded at Regional.
- **Level gating:** exclude capacitance, AC theory, inductance, Thevenin/Norton, oscilloscopes.
- **Persistence:** session state (topic + seed) only.

## Tool: Safe Hands-on Task Simulator
- **Status:** Planned
- **Category:** Practice
- **Goal:** Train breadboard/multimeter basics and practice rule-listed task types.
- **Core interaction loop:** 1) Choose a task type (voltage-only mystery resistor, power, equally bright LEDs, charger-label analysis, truth-table circuit, troubleshooting, SPDT 3-way switch, equivalent resistance). 2) Walk through a guided simulation. 3) Review the underlying rule/technique.
- **Content & data:** Manual hands-on task list; low-voltage supplied components only.
- **UI components:** Task chooser, guided simulation, reference panel.
- **Scoring & feedback:** Practice feedback; never simulate prohibited hazardous exposure as an event procedure.
- **Level gating:** none.
- **Persistence:** none.