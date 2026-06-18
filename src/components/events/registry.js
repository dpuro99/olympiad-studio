import ComingSoon from '../general/ComingSoon';
import ArcVisualizer from './electricvehicle/ArcVisualizer';
import ScoreCalc from './electricvehicle/ScoreCalc';

// Central registry mapping Science Olympiad events to their modules and categories
export const EVENT_REGISTRY = {
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
        component: ArcVisualizer,
        desc: "Visualize arc geometry and compute wheel arc lengths based on 2026 rules." 
      },
      { 
        id: "score", 
        ti: "ti-trophy", 
        label: "Score Calculator", 
        cat: "Event", 
        live: true, 
        component: ScoreCalc,
        desc: "Compute official run scores from distance and time errors with Can Bonus multipliers." 
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
        live: false, 
        component: ComingSoon,
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
};
