# Circuit Lab C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C16–C17. Separate written-test scope from hands-on practice. Do not teach or score explicitly excluded material as event content. A paper reference binder of any size and up to two Class III calculators are allowed. Written work is 50–75%; hands-on is 25–50%. See the manual's hands-on task list before building a simulator.

## Tool: Circuit Practice
- **Status:** Live — `src/components/events/circuitlab/CircuitLabPractice.jsx` (logic in `circuitUtils.js`)
- **Category:** Practice
- **Goal:** Practice Ohm's law and series/parallel equivalent resistance from user-entered values.
- **Core interaction loop:** 1) Ohm's law tab: supply exactly two of voltage, current, resistance; the solver returns the third. 2) Equivalent-resistance tab: enter comma-separated resistances; the solver reports the series sum and the parallel reciprocal-sum result.
- **Content & data:** Manual §3 written topics (Ohm's law, resistance in series/parallel — manual pp. C16–C17); user-entered values only; no preset questions.
- **UI components:** Two input forms and result readouts.
- **Scoring & feedback:** Practice feedback; labeled a learning calculator, not an official event score. State/National-only clock/timing/flip-flop, transistor bias/logic, and ideal op-amp content is excluded at Regional.
- **Level gating:** exclude capacitance, AC theory, inductance, Thevenin/Norton, oscilloscopes.
- **Persistence:** none.

## Tool: Safe Hands-on Task Simulator
- **Status:** Planned
- **Category:** Practice
- **Goal:** Train breadboard/multimeter basics and practice rule-listed task types.
- **Core interaction loop:** 1) Choose a task type. 2) Walk through a guided simulation using manual-listed requirements. 3) Review the underlying rule/technique.
- **Content & data:** Manual hands-on task list: voltage-only mystery resistor, power, equally bright LEDs, charger-label analysis, truth-table circuit, troubleshooting, SPDT 3-way switch, equivalent resistance (manual §2/§4, pp. C16–C17); low-voltage supplied components only.
- **UI components:** Task chooser, guided simulation, reference panel.
- **Scoring & feedback:** Practice feedback; never simulate prohibited hazardous exposure as an event procedure.
- **Level gating:** none.
- **Persistence:** none.