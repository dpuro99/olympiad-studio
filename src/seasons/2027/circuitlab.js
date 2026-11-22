// Circuit Lab — 2027 Division C rule constants.
// Source: 2027 Division C Rules Manual, pp. C16–C17.
export const circuitlab2027 = Object.freeze({
  year: 2027,
  manualReference: 'Division C Rules Manual, pp. C16–C17',
  handsOn: Object.freeze({
    // The manual names task types; it prints no circuits, component values,
    // fault models, data or task rubric. Those are teaching conventions in the
    // engine and are labelled as such in the tool, never as official content.
    context: Object.freeze({
      breadboard: Object.freeze({
        citation: '§3.b (p. C17)',
        detail: 'Participants must be familiar with breadboard and multimeter operation, and may ask the Event Supervisor about a breadboard’s internal wiring.'
      }),
      safety: Object.freeze({
        citation: '§3.d (p. C17)',
        detail: 'Participants must not be exposed to soldering, high-power circuits and AC circuits. Simulations here use only low-voltage DC.'
      }),
      scoring: Object.freeze({
        citation: '§4.a–c (p. C17)',
        detail: 'High score wins; hands-on work is 25–50% of the score. These drills give practice feedback only, never an official score.'
      })
    }),
    tasks: Object.freeze([
      Object.freeze({
        id: 'mystery-resistor',
        label: 'Mystery resistor',
        citation: '§3.c.i (p. C17)',
        detail: 'Determine the value of a mystery resistor in a circuit using only voltage measurements.'
      }),
      Object.freeze({
        id: 'three-way-switch',
        label: 'SPDT three-way switch',
        citation: '§3.c.vii (p. C17)',
        detail: 'Wire a 3-way switch using SPDT switches.'
      }),
      Object.freeze({
        id: 'troubleshooting',
        label: 'Troubleshooting',
        citation: '§3.c.vi (p. C17)',
        detail: 'Troubleshoot a faulty circuit.'
      })
    ]),
    // Listed by the manual but not simulated in v1: each would need apparatus
    // detail the rules do not print, so any case key would be fabricated.
    notSimulated: Object.freeze([
      Object.freeze({ citation: '§3.c.ii', detail: 'Calculate the power supplied to a circuit.' }),
      Object.freeze({ citation: '§3.c.iii', detail: 'Hook up two LEDs so they are equally bright.' }),
      Object.freeze({ citation: '§3.c.iv', detail: 'Read a USB charger label and calculate battery charge time.' }),
      Object.freeze({ citation: '§3.c.v', detail: 'Construct a logic circuit to mimic a given truth table.' }),
      Object.freeze({ citation: '§3.c.viii', detail: 'Create a specified equivalent resistance from given resistors.' })
    ])
  })
});
