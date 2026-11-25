// The compilers are the single source of truth for objective mastery. This
// list only names where to read them; it duplicates no objective text, rules or
// citations, all of which live in the per-event configs and season data.
import anatomyReferenceCompilerConfig from '../../events/anatomy/referenceCompilerConfig.js';
import chemistryLabReferenceCompilerConfig from '../../events/chemlab/referenceCompilerConfig.js';
import circuitLabReferenceCompilerConfig from '../../events/circuitlab/referenceCompilerConfig.js';
import designerGenesReferenceCompilerConfig from '../../events/designergenes/referenceCompilerConfig.js';
import dynamicPlanetReferenceCompilerConfig from '../../events/dynamicplanet/referenceCompilerConfig.js';
import rocksAndMineralsReferenceCompilerConfig from '../../events/rocksandminerals/referenceCompilerConfig.js';

const configs = [
  anatomyReferenceCompilerConfig,
  chemistryLabReferenceCompilerConfig,
  circuitLabReferenceCompilerConfig,
  designerGenesReferenceCompilerConfig,
  dynamicPlanetReferenceCompilerConfig,
  rocksAndMineralsReferenceCompilerConfig
];

export const OBJECTIVE_TRACKER_SOURCES = Object.freeze(configs.map((config) => Object.freeze({
  eventId: config.eventId,
  eventName: config.eventName,
  moduleId: `${config.eventId}-reference-compiler`,
  config
})));
