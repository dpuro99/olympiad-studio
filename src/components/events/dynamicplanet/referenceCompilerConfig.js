// Dynamic Planet C — Reference & Study Compiler config (binder mode).
// Objectives transcribed from the verified 2027 overview in ./info.md,
// which cites Division C Rules Manual pp. C24–C25. Binder mode with
// no-removal reminder for specimen/display stations.

export const dynamicPlanetReferenceCompilerConfig = {
  eventId: 'dynamicplanet',
  eventName: 'Dynamic Planet',
  division: 'C',
  mode: 'binder',
  storageKey: 'olympiad-studio.dynamicplanet-c.2027-reference-binder',
  fileStem: 'dynamicplanet-c-2027-reference-binder',
  manualReference: 'Division C Rules Manual, pp. C24–C25',
  resource: {
    title: 'One binder of any size/content/source per team',
    summary: 'Tabs, labels, lamination, and sheet protectors permitted.',
    sides: 0,
    constraints: [
      'Nothing may be removed from the binder during specimen/display stations.',
      'Any content/source allowed per team.'
    ]
  },
  objectivesNote: 'Topic outline transcribed from the manual summary (freshwater-focused for 2027).',
  objectiveGroups: [
    {
      id: 'hydrology',
      label: 'Hydrology fundamentals',
      objectives: [
        { id: 'dp-hydro-cycle', label: 'Hydrologic cycle, water budgets, critical zone, reservoirs, residence time', level: 'core' },
        { id: 'dp-climate', label: 'Climatic/topographic controls; arid–semiarid–humid regimes', level: 'core' }
      ]
    },
    {
      id: 'basins-streams',
      label: 'Drainage basins & streams',
      objectives: [
        { id: 'dp-basins', label: 'Drainage basins, watersheds, stream order/network patterns', level: 'core' },
        { id: 'dp-sediment', label: 'Fluvial sediment, transport/capacity, channel patterns, bedforms, geomorphology/landforms', level: 'core' },
        { id: 'dp-flow', label: 'Streamflow, open-channel relationships, floods, recurrence intervals', level: 'core' }
      ]
    },
    {
      id: 'groundwater',
      label: 'Groundwater & karst',
      objectives: [
        { id: 'dp-gw', label: 'Groundwater, aquifers, hydraulic gradients, surface-water exchange, saltwater intrusion, karst', level: 'core' }
      ]
    },
    {
      id: 'lakes-wetlands',
      label: 'Lakes & wetlands',
      objectives: [
        { id: 'dp-lakes', label: 'Lakes/wetlands: formation, water budgets, stratification/turnover, shoreline processes, wetland types', level: 'core' }
      ]
    },
    {
      id: 'records-human',
      label: 'Records, mapping, and human impacts',
      objectives: [
        { id: 'dp-records', label: 'Geologic/paleohydrologic records', level: 'core' },
        { id: 'dp-human', label: 'Human impacts, engineering, extraction, and pollution', level: 'core' },
        { id: 'dp-mapping', label: 'Freshwater mapping, well data, gauging, hydrographs, and monitoring', level: 'core' }
      ]
    }
  ]
};

export default dynamicPlanetReferenceCompilerConfig;
