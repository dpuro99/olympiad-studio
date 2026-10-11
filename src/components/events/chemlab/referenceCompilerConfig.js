// Chemistry Lab C — Reference & Study Compiler config (sheet mode, per-participant).
// Objectives transcribed from the verified 2027 overview in ./info.md,
// which cites Division C Rules Manual pp. C14–C15.

export const chemistryLabReferenceCompilerConfig = {
  eventId: 'chemlab',
  eventName: 'Chemistry Lab',
  division: 'C',
  mode: 'sheet',
  storageKey: 'olympiad-studio.chemlab-c.2027-reference-sheet',
  fileStem: 'chemlab-c-2027-reference-sheet',
  manualReference: 'Division C Rules Manual, pp. C14–C15',
  resource: {
    title: 'One double-sided 8.5 × 11 in sheet per participant',
    summary: 'Any content or source; one sheet, both sides (laminated/protected).',
    sides: 2,
    constraints: [
      'Lamination or protection is permitted.',
      'The equipment list is a separate allowed item (not this sheet).'
    ]
  },
  objectivesNote: 'Topic outline transcribed from the manual summary. The exact ion/formula lists and level boundaries are in the manual pp. C14–C15.',
  objectiveGroups: [
    {
      id: 'gases',
      label: 'Gases',
      objectives: [
        { id: 'cl-gas-properties', label: 'Physical properties and climate links (greenhouse gases/ozone depletion)', level: 'core' },
        { id: 'cl-gas-laws', label: 'Gas laws: Avogadro, Boyle, Charles, Dalton, Gay-Lussac, Graham, Ideal Gas', level: 'core' },
        { id: 'cl-gas-apps', label: 'Gas density, partial pressure, molar mass, and diffusion tasks', level: 'core' }
      ]
    },
    {
      id: 'kinetics',
      label: 'Kinetics',
      objectives: [
        { id: 'cl-kinetics-factors', label: 'Measure rates and effects of temperature, concentration, particle size, catalysts', level: 'core' },
        { id: 'cl-kinetics-rate-laws', label: 'Differential/integrated rate laws from data, rate constants with units', level: 'state-national' },
        { id: 'cl-kinetics-mechanisms', label: 'Mechanism validation and activation energy', level: 'state-national' }
      ]
    },
    {
      id: 'supporting',
      label: 'Supporting tools (nomenclature & stoichiometry)',
      objectives: [
        { id: 'cl-nomenclature', label: 'Nomenclature, formula writing, and required ion knowledge', level: 'core' },
        { id: 'cl-stoichiometry', label: 'Stoichiometry: mole conversions, percent yield', level: 'core' },
        { id: 'cl-ions-state', label: 'Expanded ion/formula knowledge', level: 'state-national' }
      ]
    },
    {
      id: 'general',
      label: 'General / cross-cutting',
      objectives: [
        { id: 'cl-general', label: 'General reference, data analysis, and experimental notes', level: 'core' }
      ]
    }
  ]
};

export default chemistryLabReferenceCompilerConfig;
