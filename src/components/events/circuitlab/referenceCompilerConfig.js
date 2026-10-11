// Circuit Lab C — Reference & Study Compiler config (binder mode).
// Objectives transcribed from the verified 2027 overview in ./info.md,
// which cites Division C Rules Manual pp. C16–C17. Binder mode allows
// a paper binder of any size (tabs/removable pages permitted).

export const circuitLabReferenceCompilerConfig = {
  eventId: 'circuitlab',
  eventName: 'Circuit Lab',
  division: 'C',
  mode: 'binder',
  storageKey: 'olympiad-studio.circuitlab-c.2027-reference-binder',
  fileStem: 'circuitlab-c-2027-reference-binder',
  manualReference: 'Division C Rules Manual, pp. C16–C17',
  resource: {
    title: 'Binder of any size with paper notes/resources',
    summary: 'Binders, books, removable pages, tabs, and labels are allowed.',
    sides: 0,
    constraints: [
      'Any content/source permitted; no explicit page limit stated.',
      'Teams may bring basic multimeters at the Event Supervisor’s discretion.'
    ]
  },
  objectivesNote: 'Topic outline transcribed from the manual summary. Explicit exclusions are enforced by level gating (capacitance/AC/Thevenin/Norton/oscilloscopes not offered).',
  objectiveGroups: [
    {
      id: 'history',
      label: 'Historical figures & fundamentals',
      objectives: [
        { id: 'cl-historical', label: 'Ampere, Coulomb, Kirchhoff, Volta, Ohm, Hertz, Boole', level: 'core' },
        { id: 'cl-charge', label: 'Charge, fields, and Coulomb’s law', level: 'core' }
      ]
    },
    {
      id: 'dc-basics',
      label: 'DC basics, circuits, and components',
      objectives: [
        { id: 'cl-dc-hazards', label: 'DC/AC characteristics and hazards', level: 'core' },
        { id: 'cl-ivrpe', label: 'Current, voltage, resistance, power, and energy', level: 'core' },
        { id: 'cl-circuits', label: 'DC circuits, components, series/parallel, open/short, Ohm’s law, schematics', level: 'core' }
      ]
    },
    {
      id: 'devices',
      label: 'Devices & analysis',
      objectives: [
        { id: 'cl-pn', label: 'Silicon PN-junction devices (diodes/LEDs)', level: 'core' },
        { id: 'cl-kirchhoff', label: 'Kirchhoff’s laws', level: 'core' }
      ]
    },
    {
      id: 'digital',
      label: 'Digital logic',
      objectives: [
        { id: 'cl-boolean', label: 'Digital logic, Boolean expressions, De Morgan’s law, combinational circuits', level: 'core' },
        { id: 'cl-timing', label: 'Clock/timing concepts and flip-flops', level: 'state-national' }
      ]
    },
    {
      id: 'state-national',
      label: 'State/National extensions',
      objectives: [
        { id: 'cl-transistors', label: 'PNP/NPN bias, gain, and simple transistor logic', level: 'state-national' },
        { id: 'cl-opamp', label: 'Ideal op-amp principles and applications', level: 'state-national' }
      ]
    },
    {
      id: 'hands-on',
      label: 'Hands-on practice notes',
      objectives: [
        { id: 'cl-hands-on', label: 'Breadboard/multimeter notes, troubleshooting, and task procedures', level: 'core' }
      ]
    }
  ]
};

export default circuitLabReferenceCompilerConfig;
