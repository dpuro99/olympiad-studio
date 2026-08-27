import ComingSoon from '../general/ComingSoon';
import ArcVisualizer from './electricvehicle/ArcVisualizer';
import RunLogger from './electricvehicle/RunLogger';
import ScoreCalc from './electricvehicle/ScoreCalc';

// Central registry mapping Science Olympiad events to their modules and categories
export const EVENT_REGISTRY = {
  anatomy: { name: "Anatomy and Physiology", code: "ANAT", division: "C", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
  boomilever: { name: "Boomilever", code: "BOOM", division: "C", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
  chemlab: { name: "Chemistry Lab", code: "CHEM", division: "C", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
  circuitlab: { name: "Circuit Lab", code: "CIRC", division: "C", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
  designergenes: { name: "Designer Genes", code: "GENE", division: "C", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
  dynamicplanet: { name: "Dynamic Planet", code: "DYN", division: "C", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
  ev: {
    name: "Electric Vehicle",
    code: "EV",
    division: "C",
    description: "Design, build, and test a vehicle that uses electrical energy for propulsion.",
    categories: ["Event", "Design", "Programming", "Testing", "Competition"],
    modules: [
      { 
        id: "arc", 
        ti: "ti-vector-triangle", 
        label: "Arc Visualizer", 
        cat: "Design", 
        live: true, 
        requiresAuth: false,
        component: ArcVisualizer,
        desc: "Visualize arc geometry and compute wheel arc lengths based on 2026 rules." 
      },
      { 
        id: "score", 
        ti: "ti-trophy", 
        label: "Score Calculator", 
        cat: "Testing", 
        live: true, 
        requiresAuth: false,
        component: ScoreCalc,
        desc: "Estimate practice run scores from distance and time errors, optional can bonus, and manual penalties." 
      },
      { 
        id: "hw", 
        ti: "ti-cpu", 
        label: "Hardware Planner", 
        cat: "Design", 
        live: false, 
        component: ComingSoon,
        desc: "Select motors, encoders, batteries, and wheels." 
      },
      { 
        id: "lookup", 
        ti: "ti-table", 
        label: "Lookup Table", 
        cat: "Programming", 
        live: false, 
        component: ComingSoon,
        desc: "Build a speed-to-PWM mapping from measured drive data." 
      },
      { 
        id: "pid", 
        ti: "ti-wave-sine", 
        label: "PID Simulator", 
        cat: "Programming", 
        live: false, 
        component: ComingSoon,
        desc: "Simulate and tune your control loop without hardware." 
      },
      { 
        id: "codegen", 
        ti: "ti-code", 
        label: "Code Generator", 
        cat: "Programming", 
        live: false, 
        component: ComingSoon,
        desc: "Generate Arduino starter code from your build specs." 
      },
      { 
        id: "log", 
        ti: "ti-file-analytics", 
        label: "Run Logger", 
        cat: "Testing", 
        live: true, 
        requiresAuth: true,
        component: RunLogger,
        desc: "Log and analyze practice runs over time." 
      },
      { 
        id: "comp", 
        ti: "ti-flag", 
        label: "Competition Day", 
        cat: "Competition", 
        live: false, 
        component: ComingSoon,
        desc: "Pre-run parameter calculator and event checklist." 
      }
    ]
  },
  entomology: { name: "Entomology", code: "ENTO", division: "C", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
  machines: { name: "Machines", code: "MACH", division: "C", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
  metricmastery: { name: "Metric Mastery", code: "METR", division: "B", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
  rocksandminerals: { name: "Rocks and Minerals", code: "ROCK", division: "C", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
  writeitdoit: { name: "Write It, Do It", code: "WIDI", division: "B", description: "...", categories: ["Event"], modules: [{ id: "main", ti: "ti-clipboard", label: "Overview", cat: "Event", live: false, component: ComingSoon, desc: "Coming soon." }] },
};
