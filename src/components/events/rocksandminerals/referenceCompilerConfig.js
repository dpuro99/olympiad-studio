// Rocks and Minerals C — Reference & Study Compiler config (binder mode + pinned external items).
// Objectives transcribed from the verified 2027 overview in ./info.md,
// which cites Division C Rules Manual pp. C52–C56. Binder plus external items allowed.

export const rocksAndMineralsReferenceCompilerConfig = {
  eventId: 'rocksandminerals',
  eventName: 'Rocks and Minerals',
  division: 'C',
  mode: 'binder',
  storageKey: 'olympiad-studio.rocksandminerals-c.2027-reference-binder',
  fileStem: 'rocksandminerals-c-2027-reference-binder',
  manualReference: 'Division C Rules Manual, pp. C52–C56',
  resource: {
    title: 'Binder + commercial field guide + 2027 National Rocks and Minerals List',
    summary: 'One binder of any size, one commercial field guide, and one copy of the 2027 National Rocks and Minerals List.',
    sides: 0,
    constraints: [
      'During specimen/display stations, only the official list may be removed from the binder.',
      'Teams may not bring specimens.',
      'No HCl; no taste tests.'
    ]
  },
  objectivesNote: 'Topic outline transcribed from the manual summary. State/National adds thin-section photomicrographs (mineral/texture limits) and pegmatite/incompatible-element notes.',
  objectiveGroups: [
    {
      id: 'general',
      label: 'General concepts',
      objectives: [
        { id: 'rm-definitions', label: 'Definitions; properties/relationships', level: 'core' },
        { id: 'rm-technique', label: 'ID approach; observation vs diagnostic properties', level: 'core' }
      ]
    },
    {
      id: 'minerals',
      label: 'Minerals',
      objectives: [
        { id: 'rm-min-properties', label: 'Physical/other properties, limited habits, formula/property relationships', level: 'core' },
        { id: 'rm-min-series', label: 'Solid-solution series, two-component phase diagrams, polymorphs', level: 'core' },
        { id: 'rm-min-groups', label: 'Mineral groups, silicate structures, and crystal systems', level: 'core' },
        { id: 'rm-min-formation', label: 'Mineral formation/environments and Bowen’s series', level: 'core' },
        { id: 'rm-min-uses', label: 'Uses and listed gemstones', level: 'core' },
        { id: 'rm-min-state', label: 'Pegmatites and incompatible elements; thin-section photomicrograph limits (State/National)', level: 'state-national' }
      ]
    },
    {
      id: 'rocks',
      label: 'Rocks',
      objectives: [
        { id: 'rm-igneous', label: 'Igneous: textures, compositions, formations, plate settings, melt evolution', level: 'core' },
        { id: 'rm-sedimentary', label: 'Sedimentary: textures, grain properties, environments, structures', level: 'core' },
        { id: 'rm-metamorphic', label: 'Metamorphic: textures, minerals, protoliths, grades/facies, tectonic settings', level: 'core' },
        { id: 'rm-rockcycle', label: 'Rock cycle and uses', level: 'core' },
        { id: 'rm-rocks-state', label: 'Thin-section photomicrographs for rocks (State/National)', level: 'state-national' }
      ]
    },
    {
      id: 'specimen-list',
      label: 'Specimen list & ID',
      objectives: [
        { id: 'rm-list', label: '2027 National Rocks and Minerals List (seed cards; reference only)', level: 'core' },
        { id: 'rm-id-strategy', label: 'Identification strategy and distinguishing pairs', level: 'core' }
      ]
    }
  ]
};

export default rocksAndMineralsReferenceCompilerConfig;
