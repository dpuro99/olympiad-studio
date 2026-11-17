import { lazy } from 'react';
import { ACTIVE_DATA } from '../../seasons/active.js';
import { ACTIVE_SEASON } from '../../seasons/manifest.js';

const CourseGeometry = lazy(() => import('./electricvehicle/CourseGeometry'));
const RunLogger = lazy(() => import('./electricvehicle/RunLogger'));
const ScoreCalc = lazy(() => import('./electricvehicle/ScoreCalc'));
const GasLawPractice = lazy(() => import('./chemlab/GasLawPractice'));
const KineticsPractice = lazy(() => import('./chemlab/KineticsPractice'));
const StoichiometryPractice = lazy(() => import('./chemlab/StoichiometryPractice'));
const FreshwaterTools = lazy(() => import('./dynamicplanet/FreshwaterTools'));
const FreshwaterToolbox = lazy(() => import('./dynamicplanet/FreshwaterToolbox'));
const MapPractice = lazy(() => import('./dynamicplanet/MapPractice'));
const CircuitLabPractice = lazy(() => import('./circuitlab/CircuitLabPractice'));
const DigitalLogicWorkbench = lazy(() => import('./circuitlab/DigitalLogicWorkbench'));
const BoomileverEstimator = lazy(() => import('./boomilever/BoomileverEstimator'));
const BoomileverBuildLog = lazy(() => import('./boomilever/BoomileverBuildLog'));
const AnatomyPractice = lazy(() => import('./anatomy/AnatomyPractice'));
const AnatomyReferenceCompiler = lazy(() => import('./anatomy/AnatomyReferenceCompiler'));
const DesignerGenesReferenceCompiler = lazy(() => import('./designergenes/DesignerGenesReferenceCompiler'));
const MolecularSequenceWorkbench = lazy(() => import('./designergenes/MolecularSequenceWorkbench'));
const ChemistryLabReferenceCompiler = lazy(() => import('./chemlab/ChemistryLabReferenceCompiler'));
const CircuitLabReferenceCompiler = lazy(() => import('./circuitlab/CircuitLabReferenceCompiler'));
const DynamicPlanetReferenceCompiler = lazy(() => import('./dynamicplanet/DynamicPlanetReferenceCompiler'));
const RocksAndMineralsReferenceCompiler = lazy(() => import('./rocksandminerals/RocksAndMineralsReferenceCompiler'));
const MineralIdKey = lazy(() => import('./rocksandminerals/MineralIdKey'));
const SpecimenPractice = lazy(() => import('./rocksandminerals/SpecimenPractice'));

function overview({ name, code, division, description, eventUrl, manualReference, ruleSummary, journey = [], additionalModules = [] }) {
  // The manual-verified summary is event-level data now: the field guide shows
  // it directly, so there is no separate "Event Overview" tool to open.
  return {
    year: ACTIVE_SEASON.year,
    name,
    code,
    division,
    description,
    categories: ['Event'],
    journey,
    manualReference,
    ruleSummary,
    eventUrl,
    rulesUrl: ACTIVE_SEASON.rulesUrl,
    modules: additionalModules
  };
}


// Current season entries are limited to events on Science Olympiad's official current-season B/C slate.
export const EVENT_REGISTRY = {
  anatomy: overview({
    name: 'Anatomy and Physiology', code: 'ANAT', division: 'C',
    description: `Focus for ${ACTIVE_SEASON.year}: respiratory, digestive, and immune systems.`,
    manualReference: 'Division C Rules Manual, pp. C3–C5',
    ruleSummary: [
      'Written test or lab-practical stations; up to two participants, about 50 minutes, Class II calculator.',
      'One two-sided 8.5 × 11 in notes sheet is allowed; multiple sheets, affixed labels, and extra sheets are prohibited.',
      'Content is respiratory, digestive, and immune systems, with tournament-level additions listed in the manual.'
    ],
    additionalModules: [{
      id: 'anatomy-notes',
      stage: 'record',
      gain: 'observations while you study → saved notes and a CSV export',
      signal: 'notes',
      ti: 'ti-notebook',
      label: 'Practice Notes',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: AnatomyPractice,
      desc: 'Record study observations for respiratory, digestive, and immune systems; save locally and export as CSV.',
      eventName: 'Anatomy and Physiology',
      manualReference: 'Division C Rules Manual, pp. C3–C5',
      eventUrl: 'https://www.soinc.org/anatomy-and-physiology-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'anatomy-reference-compiler',
      stage: 'prepare',
      gain: 'objectives you mark → one printable double-sided sheet',
      signal: 'sheet',
      ti: 'ti-notes',
      label: 'Reference & Study Compiler',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: AnatomyReferenceCompiler,
      desc: 'Track the manual’s objectives and compile the one allowed double-sided reference sheet; save locally, print, and export JSON.',
      eventName: 'Anatomy and Physiology',
      manualReference: 'Division C Rules Manual, pp. C3–C5',
      eventUrl: 'https://www.soinc.org/anatomy-and-physiology-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }],
    eventUrl: 'https://www.soinc.org/anatomy-and-physiology-c'
  }),
  boomilever: overview({
    name: 'Boomilever', code: 'BOOM', division: 'C',
    description: 'Build a cantilevered structure to support a load from a testing wall.',
    journey: ['boomilever-estimator', 'boomilever-build-log'],
    manualReference: 'Division C Rules Manual, pp. C7–C12',
    ruleSummary: [
      'One prebuilt wood-and-adhesive structure; Eye Protection B; no impound; six-minute setup/testing window.',
      'Base wall-contact boundary is above 15 cm; optional bonus boundary is above 10 cm and requires holding 15 kg.',
      'Score is Load Scored ÷ Structure Mass; eligible Load Scored Bonus is 7,500 g.'
    ],
    additionalModules: [{
      id: 'boomilever-estimator',
      stage: 'reference',
      gain: 'load supported and structure mass → efficiency score',
      ti: 'ti-ruler',
      label: 'Efficiency Estimator',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: BoomileverEstimator,
      desc: 'Estimate structural efficiency from user-entered load supported and structure mass.',
      eventName: 'Boomilever',
      manualReference: 'Division C Rules Manual, pp. C7–C12',
      eventUrl: 'https://www.soinc.org/boomilever-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'boomilever-build-log',
      stage: 'record',
      gain: 'each prototype and test result → saved build history and CSV',
      signal: 'buildLog',
      ti: 'ti-clipboard-list',
      label: 'Build/Test Log',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: BoomileverBuildLog,
      desc: 'Track each prototype\'s build details and test results, compare efficiencies, and export CSV.',
      eventName: 'Boomilever',
      manualReference: 'Division C Rules Manual, pp. C7–C12',
      eventUrl: 'https://www.soinc.org/boomilever-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }],
    eventUrl: 'https://www.soinc.org/boomilever-c'
  }),
  chemlab: overview({
    name: 'Chemistry Lab', code: 'CHEM', division: 'C',
    description: `${ACTIVE_SEASON.year} chemistry tasks and questions focus on kinetics and gases.`,
    manualReference: 'Division C Rules Manual, pp. C14–C15',
    ruleSummary: [
      'At least two activities are required: one on gases and one on kinetics; time is not scored or a tiebreaker.',
      'Stoichiometry/nomenclature are supporting tools and may appear; State/National add quantitative kinetics work.',
      'Points are split evenly between kinetics and gases; cleanup can incur up to a 10% penalty.'
    ],
    additionalModules: [{
      id: 'gas-laws',
      stage: 'practice',
      gain: 'known quantities in their units → the unknown, with the law shown',
      ti: 'ti-flask',
      label: 'Gas-Law Practice',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: GasLawPractice,
      desc: `Practice the gas laws listed in the ${ACTIVE_SEASON.year} manual with unit-aware unknown solving.`,
      eventName: 'Chemistry Lab',
      manualReference: 'Division C Rules Manual, §3.e, p. C14',
      eventUrl: 'https://www.soinc.org/chemistry-lab-c-0',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'kinetics',
      stage: 'practice',
      gain: 'trial measurements → observed rate and a saved notebook',
      signal: 'kinetics',
      ti: 'ti-activity',
      label: 'Kinetics Practice',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: KineticsPractice,
      desc: 'Plan a user-defined reaction-rate experiment and calculate rates from entered measurements (Regional/Invitational scope).',
      eventName: 'Chemistry Lab',
      manualReference: 'Division C Rules Manual, §3.f.i, p. C14',
      eventUrl: 'https://www.soinc.org/chemistry-lab-c-0',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'stoichiometry',
      stage: 'practice',
      gain: 'a generated equation or compound → balanced work, step by step',
      ti: 'ti-atom',
      label: 'Stoichiometry & Nomenclature',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: StoichiometryPractice,
      desc: 'Generated practice balancing equations, mole/mass/particle/gas-volume conversions, limiting reagent, percent yield, and ionic name ↔ formula.',
      eventName: 'Chemistry Lab',
      manualReference: 'Division C Rules Manual, §3.c–d, pp. C14–C15',
      eventUrl: 'https://www.soinc.org/chemistry-lab-c-0',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'chemlab-reference-compiler',
      stage: 'prepare',
      gain: 'objectives you mark → one printable sheet per participant',
      signal: 'sheet',
      ti: 'ti-notes',
      label: 'Reference & Study Compiler',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: ChemistryLabReferenceCompiler,
      desc: 'Track the manual’s objectives and compile each participant’s allowed double-sided reference sheet; save locally, print, and export JSON.',
      eventName: 'Chemistry Lab',
      manualReference: 'Division C Rules Manual, pp. C14–C15',
      eventUrl: 'https://www.soinc.org/chemistry-lab-c-0',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }],
    eventUrl: 'https://www.soinc.org/chemistry-lab-c-0'
  }),
  circuitlab: overview({
    name: 'Circuit Lab', code: 'CIRC', division: 'C',
    description: 'Hands-on tasks and questions about electricity and electronics.',
    manualReference: 'Division C Rules Manual, pp. C16–C17',
    ruleSummary: [
      'Open paper reference materials are allowed; ES supplies hands-on materials. At least one hands-on task is required.',
      `${ACTIVE_SEASON.year} written topics include digital logic, PN-junction devices, circuit analysis and listed State/National extensions.`,
      'Capacitance, inductance, AC circuit theory, oscilloscopes, Thevenin/Norton and other stated topics are excluded.'
    ],
    additionalModules: [{
      id: 'circuit-practice',
      stage: 'practice',
      gain: 'resistance and voltage you enter → current, power, and equivalent resistance',
      ti: 'ti-bulb',
      label: 'Circuit Practice Calculator',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: CircuitLabPractice,
      desc: 'Practice Ohm’s law, series/parallel equivalent resistance, and basic circuit calculations from user-entered measurements.',
      eventName: 'Circuit Lab',
      manualReference: 'Division C Rules Manual, pp. C16–C17',
      eventUrl: 'https://www.soinc.org/circuit-lab-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'digital-logic',
      stage: 'practice',
      gain: 'gates you wire or an expression you type → a live truth table',
      signal: 'canvas',
      ti: 'ti-binary',
      label: 'Digital Logic Workbench',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: DigitalLogicWorkbench,
      desc: 'Build and check digital logic gates, truth tables, Boolean expressions, De Morgan’s Law equivalences, and combinational circuits such as adders and multiplexers.',
      eventName: 'Circuit Lab',
      manualReference: 'Division C Rules Manual, pp. C16–C17',
      eventUrl: 'https://www.soinc.org/circuit-lab-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'circuitlab-reference-compiler',
      stage: 'prepare',
      gain: 'objectives you mark → a printable reference binder',
      signal: 'binder',
      ti: 'ti-notes',
      label: 'Reference & Study Compiler',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: CircuitLabReferenceCompiler,
      desc: 'Track the manual’s objectives and compile an allowed reference binder; save locally, print, and export JSON.',
      eventName: 'Circuit Lab',
      manualReference: 'Division C Rules Manual, pp. C16–C17',
      eventUrl: 'https://www.soinc.org/circuit-lab-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
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
      `${ACTIVE_SEASON.year} molecular-expression scope is eukaryotic; specified tournament levels add gene mapping, heritability and techniques.`
    ],
    additionalModules: [{
      id: 'molecular-sequences',
      stage: 'practice',
      gain: 'a DNA sequence → reading frames, translation, and mutation calls',
      ti: 'ti-dna',
      label: 'Molecular Sequence Workbench',
      cat: 'Practice',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: MolecularSequenceWorkbench,
      desc: `Transcribe, translate, read frames, classify mutations, and map restriction sites live; ${ACTIVE_SEASON.year} scope with user-entered or generated sequences.`,
      eventName: 'Designer Genes',
      manualReference: ACTIVE_DATA.designergenes.manualReference,
      eventUrl: 'https://www.soinc.org/designer-genes-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'designergenes-reference-compiler',
      stage: 'prepare',
      gain: 'objectives you mark → one printable double-sided sheet',
      signal: 'sheet',
      ti: 'ti-notes',
      label: 'Reference & Study Compiler',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: DesignerGenesReferenceCompiler,
      desc: 'Track the manual’s objectives and compile the one allowed double-sided reference sheet; save locally, print, and export JSON.',
      eventName: 'Designer Genes',
      manualReference: 'Division C Rules Manual, pp. C20–C21',
      eventUrl: 'https://www.soinc.org/designer-genes-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }],
    eventUrl: 'https://www.soinc.org/designer-genes-c'
  }),
  dynamicplanet: overview({
    name: 'Dynamic Planet', code: 'DYN', division: 'C',
    description: `${ACTIVE_SEASON.year} focus: properties and processes of Earth’s fresh waters.`,
    journey: ['freshwater-toolbox', 'freshwater-tools', 'map-practice', 'dynamicplanet-reference-compiler'],
    manualReference: 'Division C Rules Manual, pp. C24–C25',
    ruleSummary: [
      'Exam and/or timed stations; a binder of any size is allowed. If the event features rotation through material-display stations, nothing may be removed from the binder throughout the event.',
      'Scope covers hydrology, streams/fluvial processes, groundwater/karst, lakes/wetlands and freshwater monitoring.',
      'Human impacts, floods, paleohydrology, maps, stream gauging and hydrographs are also included.'
    ],
    additionalModules: [{
      id: 'freshwater-tools',
      stage: 'reference',
      gain: 'field measurements → discharge and a balanced water budget',
      ti: 'ti-ripple',
      label: 'Freshwater Measurement Tools',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: FreshwaterTools,
      desc: 'Calculate stream discharge and user-entered water-budget balance from your own measurements.',
      eventName: 'Dynamic Planet',
      manualReference: 'Division C Rules Manual, §3.a.ii, §3.f.ii–iii, §3.h.ii, pp. C24–C25',
      eventUrl: 'https://www.soinc.org/dynamic-planet-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'freshwater-toolbox',
      stage: 'reference',
      gain: 'a quantity in mixed units → an SI answer with its basis',
      ti: 'ti-calculator',
      label: 'Freshwater Calculator Toolbox',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: FreshwaterToolbox,
      desc: 'Unit-aware live calculators for sinuosity, hydraulic gradient, Darcy groundwater flow, residence time, flood recurrence, and Manning open-channel flow, each tied to its manual section.',
      eventName: 'Dynamic Planet',
      manualReference: 'Division C Rules Manual, §3.a.ii, §3.d.i, §3.f.iii–iv, §3.g.iii, pp. C24–C25',
      eventUrl: 'https://www.soinc.org/dynamic-planet-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'map-practice',
      stage: 'practice',
      gain: 'a generated map or hydrograph → an answer and the worked reasoning',
      ti: 'ti-map-2',
      label: 'Map & Hydrograph Practice',
      cat: 'Practice',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: MapPractice,
      desc: 'Generated topographic, stream-network, water-table and storm-hydrograph cases: read the map, answer, then check the worked reasoning.',
      eventName: 'Dynamic Planet',
      manualReference: 'Division C Rules Manual, §3.c.ii, §3.k.i–iii, pp. C24–C25',
      eventUrl: 'https://www.soinc.org/dynamic-planet-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'dynamicplanet-reference-compiler',
      stage: 'prepare',
      gain: 'topics you mark → a printable reference binder',
      signal: 'binder',
      ti: 'ti-notes',
      label: 'Reference & Study Compiler',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: DynamicPlanetReferenceCompiler,
      desc: 'Track the manual’s course content and compile an allowed binder; save locally, print, and export JSON.',
      eventName: 'Dynamic Planet',
      manualReference: 'Division C Rules Manual, pp. C24–C25',
      eventUrl: 'https://www.soinc.org/dynamic-planet-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }],
    eventUrl: 'https://www.soinc.org/dynamic-planet-c'
  }),
  ev: {
    year: ACTIVE_SEASON.year,
    name: 'Electric Vehicle',
    code: 'EV',
    division: 'C',
    description: 'Design, build, and test an electric vehicle that pushes a bottle past a line, then reverses to stop near a target.',
    categories: ['Event', 'Testing'],
    journey: ['score', 'course', 'log'],
    manualReference: 'Division C Rules Manual, pp. C26–C31',
    ruleSummary: [
      'The vehicle travels for a set time, pushes a water bottle past a line, then reverses to stop near the Target Point.',
      'Electrical energy comes from at most eight AA batteries; lithium/lead batteries and energy storage beyond battery output are prohibited.',
      'Maximum dimensions: 80.0 cm long and 35.0 cm wide. A fixed, rigid Bottle Pusher leads the vehicle; the rear Measurement Point is the vehicle’s rearmost part.',
      'One vehicle is impounded. Teams receive up to 8 minutes of Event Time and up to two runs.',
      'The Event Supervisor announces Target Distance, Target Time, and Bottle Line Distance after impound; values are shared by teams at that competition.'
    ],
    eventUrl: 'https://www.soinc.org/electric-vehicle-c',
    rulesUrl: ACTIVE_SEASON.rulesUrl,
    clarificationsUrl: 'https://www.soinc.org/faq/electric-vehicle-div-c',
    modules: [
      {
        id: 'score', ti: 'ti-trophy', label: 'Score Calculator', cat: 'Testing',
        stage: 'reference',
        gain: 'target time and measured distances → two run scores and the final score',
        live: true, year: ACTIVE_SEASON.year, requiresAuth: false, component: ScoreCalc,
        desc: `Calculate two EV run scores and the final score using the ${ACTIVE_SEASON.year} manual formula.`,
        eventName: 'Electric Vehicle',
        manualReference: 'Division C Rules Manual, pp. C26–C31',
        eventUrl: 'https://www.soinc.org/electric-vehicle-c', rulesUrl: ACTIVE_SEASON.rulesUrl
      },
      {
        id: 'course', ti: 'ti-map-2', label: 'Course & Geometry', cat: 'Testing',
        stage: 'reference',
        gain: 'level distance and target time → pacing, sensitivity, and score tradeoffs',
        live: true, year: ACTIVE_SEASON.year, requiresAuth: false, component: CourseGeometry,
        desc: `Drag the bottle line and explore set-time pacing, sensitivity, and the live ${ACTIVE_SEASON.year} run-score tradeoffs.`,
        eventName: 'Electric Vehicle',
        manualReference: 'Division C Rules Manual, pp. C26–C31',
        eventUrl: 'https://www.soinc.org/electric-vehicle-c', rulesUrl: ACTIVE_SEASON.rulesUrl
      },
      {
        id: 'log', ti: 'ti-file-analytics', label: 'Practice Run Logger', cat: 'Testing',
        stage: 'record',
        gain: 'each measured run → saved history with the verified score',
        signal: 'runs',
        live: true, year: ACTIVE_SEASON.year, requiresAuth: false, component: RunLogger,
        desc: `Save measured practice runs locally with the verified ${ACTIVE_SEASON.year} score calculation.`,
        eventName: 'Electric Vehicle',
        manualReference: 'Division C Rules Manual, pp. C26–C31',
        eventUrl: 'https://www.soinc.org/electric-vehicle-c', rulesUrl: ACTIVE_SEASON.rulesUrl
      }
    ]
  },
  rocksandminerals: overview({
    name: 'Rocks and Minerals', code: 'ROCK', division: 'C',
    description: 'Identify and classify rocks and minerals and connect them to geologic processes, Earth history, resources, and society.',
    journey: ['mineral-id-key', 'specimen-practice', 'rocksandminerals-reference-compiler'],
    manualReference: 'Division C Rules Manual, pp. C52–C56',
    ruleSummary: [
      `Identification is 30–50% of points; rock and mineral topics are balanced. Teams may bring the ${ACTIVE_SEASON.year} list, binder and field guide.`,
      'Scope includes properties, identification, composition, formation, igneous/sedimentary/metamorphic processes and economic uses.',
      `State/National include specified thin-section photomicrograph skills; consult the official ${ACTIVE_SEASON.year} specimen list and its footnotes.`
    ],
    additionalModules: [{
      id: 'mineral-id-key',
      stage: 'reference',
      gain: 'properties you observe → ranked candidates and why each is ruled out',
      signal: 'cards',
      ti: 'ti-diamond',
      label: 'Mineral ID Key',
      cat: 'Practice',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: MineralIdKey,
      desc: 'Narrow the official mineral list from the properties you observe; record properties, fill in the CSV, and see exactly why each mineral is ruled out.',
      eventName: 'Rocks and Minerals',
      manualReference: 'Division C Rules Manual, pp. C55–C56 (official mineral list)',
      eventUrl: 'https://www.soinc.org/rocks-and-minerals-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'specimen-practice',
      stage: 'practice',
      gain: 'your recorded cards → a graded drill and a missed list',
      ti: 'ti-cards',
      label: 'Specimen Practice',
      cat: 'Practice',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: SpecimenPractice,
      desc: 'Drill the official mineral list with generated multiple-choice or self-graded flashcards; configure the deck scope and class, review missed cards, and quick-record properties inline.',
      eventName: 'Rocks and Minerals',
      manualReference: 'Division C Rules Manual, pp. C55–C56 (official mineral list)',
      eventUrl: 'https://www.soinc.org/rocks-and-minerals-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }, {
      id: 'rocksandminerals-reference-compiler',
      stage: 'prepare',
      gain: 'topics and specimens you mark → a printable reference binder',
      signal: 'binder',
      ti: 'ti-notes',
      label: 'Reference & Study Compiler',
      cat: 'Event',
      live: true,
      year: ACTIVE_SEASON.year,
      requiresAuth: false,
      component: RocksAndMineralsReferenceCompiler,
      desc: 'Track the manual’s topics and specimen list and compile the allowed binder; save locally, print, and export JSON.',
      eventName: 'Rocks and Minerals',
      manualReference: 'Division C Rules Manual, pp. C52–C56',
      eventUrl: 'https://www.soinc.org/rocks-and-minerals-c',
      rulesUrl: ACTIVE_SEASON.rulesUrl
    }],
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
