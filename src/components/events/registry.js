import ComingSoon from '../general/ComingSoon';
import ArcVisualizer from './electricvehicle/ArcVisualizer';
import RunLogger from './electricvehicle/RunLogger';
import ScoreCalc from './electricvehicle/ScoreCalc';

const RULES_URL = 'https://www.soinc.org/rules-2027';

function overview({ name, code, division, description, eventUrl }) {
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
      live: false,
      year: 2027,
      component: ComingSoon,
      desc: 'Event-specific preparation content is being checked against the official 2027 Rules Manual.',
      eventUrl,
      rulesUrl: RULES_URL
    }]
  };
}

// Current season entries are limited to events on Science Olympiad's official 2027 B/C slate.
export const EVENT_REGISTRY = {
  anatomy: overview({
    name: 'Anatomy and Physiology', code: 'ANAT', division: 'C',
    description: '2027 focus: respiratory, digestive, and immune systems.',
    eventUrl: 'https://www.soinc.org/anatomy-and-physiology-c'
  }),
  boomilever: overview({
    name: 'Boomilever', code: 'BOOM', division: 'C',
    description: 'Build a cantilevered structure to support a load from a testing wall.',
    eventUrl: 'https://www.soinc.org/boomilever-c'
  }),
  chemlab: overview({
    name: 'Chemistry Lab', code: 'CHEM', division: 'C',
    description: '2027 chemistry tasks and questions focus on kinetics and gases.',
    eventUrl: 'https://www.soinc.org/chemistry-lab-c-0'
  }),
  circuitlab: overview({
    name: 'Circuit Lab', code: 'CIRC', division: 'C',
    description: 'Hands-on tasks and questions about electricity and electronics.',
    eventUrl: 'https://www.soinc.org/circuit-lab-c'
  }),
  designergenes: overview({
    name: 'Designer Genes', code: 'GENE', division: 'C',
    description: 'Questions, problems, and data analysis in classic, evolutionary, and molecular genetics.',
    eventUrl: 'https://www.soinc.org/designer-genes-c'
  }),
  dynamicplanet: overview({
    name: 'Dynamic Planet', code: 'DYN', division: 'C',
    description: '2027 focus: properties and processes of Earth’s fresh waters.',
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
        id: 'arc', ti: 'ti-vector-triangle', label: '2027 Event Objective', cat: 'Event',
        live: true, year: 2027, requiresAuth: false, component: ArcVisualizer,
        desc: 'Official overview of the 2027 vehicle task; geometry and scoring details await rule-packet verification.',
        eventUrl: 'https://www.soinc.org/electric-vehicle-c', rulesUrl: RULES_URL
      },
      {
        id: 'score', ti: 'ti-trophy', label: 'Scoring Status', cat: 'Testing',
        live: true, year: 2027, requiresAuth: false, component: ScoreCalc,
        desc: 'No numeric scoring is offered until the official 2027 rule text and corrections have been checked.',
        eventUrl: 'https://www.soinc.org/electric-vehicle-c', rulesUrl: RULES_URL
      },
      {
        id: 'log', ti: 'ti-file-analytics', label: 'Practice Journal', cat: 'Testing',
        live: true, year: 2027, requiresAuth: true, component: RunLogger,
        desc: 'Record free-form testing observations without applying unverified score or geometry assumptions.',
        eventUrl: 'https://www.soinc.org/electric-vehicle-c', rulesUrl: RULES_URL
      }
    ]
  },
  rocksandminerals: overview({
    name: 'Rocks and Minerals', code: 'ROCK', division: 'C',
    description: 'Identify and classify rocks and minerals and connect them to geologic processes, Earth history, resources, and society.',
    eventUrl: 'https://www.soinc.org/rocks-and-minerals-c'
  }),
  writeitdoit: overview({
    name: 'Write It, Do It', code: 'WIDI', division: 'B',
    description: 'One participant writes instructions for an object; a teammate builds from that description.',
    eventUrl: 'https://www.soinc.org/write-it-do-it-b'
  })
};
