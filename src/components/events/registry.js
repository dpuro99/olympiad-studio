import EventRulesOverview from '../general/EventRulesOverview';
import ArcVisualizer from './electricvehicle/ArcVisualizer';
import RunLogger from './electricvehicle/RunLogger';
import ScoreCalc from './electricvehicle/ScoreCalc';
import GasLawPractice from './chemlab/GasLawPractice';
import KineticsPractice from './chemlab/KineticsPractice';
import FreshwaterTools from './dynamicplanet/FreshwaterTools';
import CircuitLabPractice from './circuitlab/CircuitLabPractice';
import BoomileverEstimator from './boomilever/BoomileverEstimator';
import AnatomyPractice from './anatomy/AnatomyPractice';

function overview({ name, code, division, description, eventUrl, manualReference, ruleSummary, additionalModules = [] }) {
  return {
    year: 2027,
    name,
    code,
    division,
    description,
    categories: ['Event'],
    modules: [{
      id: 'main',
      ti: 'ti-clipboard',
      label: '2027 Event Overview',
      cat: 'Event',
      live: true,
      year: 2027,
      component: EventRulesOverview,
      desc: 'Read a concise summary verified against the 2027 Rules Manual.',
      eventName: name,
      manualReference,
      ruleSummary,
      eventUrl,
      rulesUrl: 'https://www.soinc.org/rules-2027'
    }, ...additionalModules]
  };
}

// Current season entries are limited to events on Science Olympiad's official 2027 B/C slate.
export const EVENT_REGISTRY = {
  anatomy: overview({
    name: 'Anatomy and Physiology', code: 'ANAT', division: 'C',
    description: '2027 focus: respiratory, digestive, and immune systems.',
    manualReference: 'Division C Rules Manual, pp. C3–C5',
    ruleSummary: [
      'Written test or lab-practical stations; up to two participants, about 50 minutes, Class II calculator.',
      'One two-sided 8.5 × 11 in notes sheet is allowed; multiple sheets, affixed labels, and extra sheets are prohibited.',
      'Content is respiratory, digestive, and immune systems, with tournament-level additions listed in the manual.'
    ],
    additionalModules: [{
      id: 'anatomy-notes',
      ti: 'ti-notebook',
      label: 'Practice Notes',
      cat: 'Event',
      live: true,
      year: 2027,
      requiresAuth: false,
      component: AnatomyPractice,
      desc: 'Record study observations for respiratory, digestive, and immune systems; save locally and export as CSV.',
      eventName: 'Anatomy and Physiology',
      manualReference: 'Division C Rules Manual, pp. C3–C5',
      eventUrl: 'https://www.soinc.org/anatomy-and-physiology-c',
      rulesUrl: 'https://www.soinc.org/rules-2027'
    }],
    eventUrl: 'https://www.soinc.org/anatomy-and-physiology-c'
  }),
  boomilever: overview({
    name: 'Boomilever', code: 'BOOM', division: 'C',
    description: 'Build a cantilevered structure to support a load from a testing wall.',
    manualReference: 'Division C Rules Manual, pp. C7–C12',
    ruleSummary: [
      'One prebuilt wood-and-adhesive structure; Eye Protection B; no impound; six-minute setup/testing window.',
      'Base wall-contact boundary is above 15 cm; optional bonus boundary is above 10 cm and requires holding 15 kg.',
      'Score is Load Scored ÷ Structure Mass; eligible Load Scored Bonus is 7,500 g.'
    ],
    additionalModules: [{
      id: 'boomilever-estimator',
      ti: 'ti-ruler',
      label: 'Efficiency Estimator',
      cat: 'Event',
      live: true,
      year: 2027,
      requiresAuth: false,
      component: BoomileverEstimator,
      desc: 'Estimate structural efficiency from user-entered load supported and structure mass.',
      eventName: 'Boomilever',
      manualReference: 'Division C Rules Manual, pp. C7–C12',
      eventUrl: 'https://www.soinc.org/boomilever-c',
      rulesUrl: 'https://www.soinc.org/rules-2027'
    }],
    eventUrl: 'https://www.soinc.org/boomilever-c'
  }),
  chemlab: overview({
    name: 'Chemistry Lab', code: 'CHEM', division: 'C',
    description: '2027 chemistry tasks and questions focus on kinetics and gases.',
    manualReference: 'Division C Rules Manual, pp. C14–C15',
    ruleSummary: [
      'At least two activities are required: one on gases and one on kinetics; time is not scored or a tiebreaker.',
      'Stoichiometry/nomenclature are supporting tools and may appear; State/National add quantitative kinetics work.',
      'Points are split evenly between kinetics and gases; cleanup can incur up to a 10% penalty.'
    ],
    additionalModules: [{
      id: 'gas-laws',
      ti: 'ti-flask',
      label: 'Gas-Law Practice',
      cat: 'Event',
      live: true,
      year: 2027,
      requiresAuth: false,
      component: GasLawPractice,
      desc: 'Practice the gas laws listed in the 2027 manual with unit-aware unknown solving.',
      eventName: 'Chemistry Lab',
      manualReference: 'Division C Rules Manual, §3.e, p. C14',
      eventUrl: 'https://www.soinc.org/chemistry-lab-c-0',
      rulesUrl: 'https://www.soinc.org/rules-2027'
    }, {
      id: 'kinetics',
      ti: 'ti-activity',
      label: 'Kinetics Practice',
      cat: 'Event',
      live: true,
      year: 2027,
      requiresAuth: false,
      component: KineticsPractice,
      desc: 'Plan a user-defined reaction-rate experiment and calculate rates from entered measurements (Regional/Invitational scope).',
      eventName: 'Chemistry Lab',
      manualReference: 'Division C Rules Manual, §3.f.i, p. C14',
      eventUrl: 'https://www.soinc.org/chemistry-lab-c-0',
      rulesUrl: 'https://www.soinc.org/rules-2027'
    }],
    eventUrl: 'https://www.soinc.org/chemistry-lab-c-0'
  }),
  circuitlab: overview({
    name: 'Circuit Lab', code: 'CIRC', division: 'C',
    description: 'Hands-on tasks and questions about electricity and electronics.',
    manualReference: 'Division C Rules Manual, pp. C16–C17',
    ruleSummary: [
      'Open paper reference materials are allowed; ES supplies hands-on materials. At least one hands-on task is required.',
      '2027 written topics include digital logic, PN-junction devices, circuit analysis and listed State/National extensions.',
      'Capacitance, inductance, AC circuit theory, oscilloscopes, Thevenin/Norton and other stated topics are excluded.'
    ],
    additionalModules: [{
      id: 'circuit-practice',
      ti: 'ti-circuit',
      label: 'Circuit Practice Calculator',
      cat: 'Event',
      live: true,
      year: 2027,
      requiresAuth: false,
      component: CircuitLabPractice,
      desc: 'Practice Ohm’s law, series/parallel equivalent resistance, and basic circuit calculations from user-entered measurements.',
      eventName: 'Circuit Lab',
      manualReference: 'Division C Rules Manual, pp. C16–C17',
      eventUrl: 'https://www.soinc.org/circuit-lab-c',
      rulesUrl: 'https://www.soinc.org/rules-2027'
    }],
    eventUrl: 'https://www.soinc.org/circuit-lab-c'
  }),
  designergenes: overview({
    name: 'Designer Genes', code: 'GENE', division: 'C',
    description: 'Questions, problems, and data analysis in classic, evolutionary, and molecular genetics.',
    manualReference: 'Division C Rules Manual, pp. C20–C21',
    ruleSummary: [
      'Written test, possibly at stations; one two-sided notes sheet and two Class II calculators are allowed.',
      'Exhaustive scope emphasizes quantitative reasoning, data interpretation and evidence-based conclusions.',
      '2027 molecular-expression scope is eukaryotic; specified tournament levels add gene mapping, heritability and techniques.'
    ],
    eventUrl: 'https://www.soinc.org/designer-genes-c'
  }),
  dynamicplanet: overview({
    name: 'Dynamic Planet', code: 'DYN', division: 'C',
    description: '2027 focus: properties and processes of Earth’s fresh waters.',
    manualReference: 'Division C Rules Manual, pp. C24–C25',
    ruleSummary: [
      'Exam and/or timed stations; a binder of any size is allowed, but cannot be removed during applicable specimen/display stations.',
      'Scope covers hydrology, streams/fluvial processes, groundwater/karst, lakes/wetlands and freshwater monitoring.',
      'Human impacts, floods, paleohydrology, maps, stream gauging and hydrographs are also included.'
    ],
    additionalModules: [{
      id: 'freshwater-tools',
      ti: 'ti-ripple',
      label: 'Freshwater Measurement Tools',
      cat: 'Event',
      live: true,
      year: 2027,
      requiresAuth: false,
      component: FreshwaterTools,
      desc: 'Calculate stream discharge and user-entered water-budget balance from your own measurements.',
      eventName: 'Dynamic Planet',
      manualReference: 'Division C Rules Manual, §3.f, pp. C24–C25',
      eventUrl: 'https://www.soinc.org/dynamic-planet-c',
      rulesUrl: 'https://www.soinc.org/rules-2027'
    }],
    eventUrl: 'https://www.soinc.org/dynamic-planet-c'
  }),
  ev: {
    year: 2027,
    name: 'Electric Vehicle',
    code: 'EV',
    division: 'C',
    description: 'Design, build, and test an electric vehicle that pushes a bottle past a line, then reverses to stop near a target.',
    categories: ['Event', 'Testing'],
    modules: [
      {
        id: 'arc', ti: 'ti-vector-triangle', label: '2027 Event Overview', cat: 'Event',
        live: true, year: 2027, requiresAuth: false, component: ArcVisualizer,
        desc: 'Verified task, construction constraints, and run procedure from the 2027 manual.',
        eventUrl: 'https://www.soinc.org/electric-vehicle-c', rulesUrl: 'https://www.soinc.org/rules-2027'
      },
      {
        id: 'score', ti: 'ti-trophy', label: 'Score Calculator', cat: 'Testing',
        live: true, year: 2027, requiresAuth: false, component: ScoreCalc,
        desc: 'Calculate two EV run scores and the final score using the 2027 manual formula.',
        eventUrl: 'https://www.soinc.org/electric-vehicle-c', rulesUrl: 'https://www.soinc.org/rules-2027'
      },
      {
        id: 'log', ti: 'ti-file-analytics', label: 'Practice Run Logger', cat: 'Testing',
        live: true, year: 2027, requiresAuth: false, component: RunLogger,
        desc: 'Save measured practice runs locally with the verified 2027 score calculation.',
        eventUrl: 'https://www.soinc.org/electric-vehicle-c', rulesUrl: 'https://www.soinc.org/rules-2027'
      }
    ]
  },
  rocksandminerals: overview({
    name: 'Rocks and Minerals', code: 'ROCK', division: 'C',
    description: 'Identify and classify rocks and minerals and connect them to geologic processes, Earth history, resources, and society.',
    manualReference: 'Division C Rules Manual, pp. C52–C56',
    ruleSummary: [
      'Identification is 30–50% of points; rock and mineral topics are balanced. Teams may bring the 2027 list, binder and field guide.',
      'Scope includes properties, identification, composition, formation, igneous/sedimentary/metamorphic processes and economic uses.',
      'State/National include specified thin-section photomicrograph skills; consult the official 2027 specimen list and its footnotes.'
    ],
    eventUrl: 'https://www.soinc.org/rocks-and-minerals-c'
  }),
  writeitdoit: overview({
    name: 'Write It, Do It', code: 'WIDI', division: 'B',
    description: 'One participant writes instructions for an object; a teammate builds from that description.',
    manualReference: 'Division B Rules Manual, p. B61',
    ruleSummary: [
      'Exactly two participants; writer has 25 minutes and builder has 20 minutes. Only the writer may bring a writing utensil; no other resources.',
      'Drawings/diagrams of the model or subsections are prohibited; subsection drawing ranks Tier 2 and a picture of the model disqualifies.',
      'Pieces score for size, color, location, orientation and/or connection; build-phase time breaks ties.'
    ],
    eventUrl: 'https://www.soinc.org/write-it-do-it-b'
  })
};
