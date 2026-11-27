// Cross-event season data. Timing presets derive from the event season files so
// a manual revision only has to change the owning event's constants and citation.
import { boomilever2027 } from './boomilever.js';
import { electricvehicle2027 } from './electricvehicle.js';
import { writeitdoit2027 } from './writeitdoit.js';

const widiPhases = Object.freeze([
  Object.freeze({
    id: 'writing',
    label: 'Writing',
    durationSeconds: writeitdoit2027.timings.writingSeconds,
    citation: writeitdoit2027.citations.writing,
    manualReference: writeitdoit2027.manualReference
  }),
  Object.freeze({
    id: 'building',
    label: 'Building',
    durationSeconds: writeitdoit2027.timings.buildingSeconds,
    citation: writeitdoit2027.citations.building,
    manualReference: writeitdoit2027.manualReference
  })
]);

export const general2027 = Object.freeze({
  timingNote: 'Preset lengths are transcribed from the official manuals. The timer is a practice aid and does not replace the Rules Manual.',
  customNote: 'Custom durations are self-set practice intervals, not official event limits.',
  timerPresets: Object.freeze([
    Object.freeze({
      id: 'widi-relay',
      label: 'WIDI timed relay',
      eventCode: 'widi',
      description: 'Writing phase followed by the building phase.',
      phases: widiPhases,
      manualReference: writeitdoit2027.manualReference
    }),
    Object.freeze({
      id: 'boomilever-testing',
      label: 'Boomilever testing window',
      eventCode: 'boomilever',
      description: 'Set up and test on the wall.',
      durationSeconds: boomilever2027.timings.testingSeconds,
      citation: boomilever2027.timings.citation,
      detail: boomilever2027.timings.detail,
      manualReference: boomilever2027.manualReference
    }),
    Object.freeze({
      id: 'ev-run-window',
      label: 'EV run window',
      eventCode: 'electricvehicle',
      description: 'Adjust, repair, and run the vehicle.',
      durationSeconds: electricvehicle2027.maxEventTimeSec,
      citation: '§2.c (Event Time)',
      detail: 'Teams each have 8 minutes to adjust, repair, and run their Vehicle.',
      manualReference: electricvehicle2027.manualReference
    }),
    Object.freeze({
      id: 'custom',
      label: 'Custom duration',
      eventCode: null,
      description: 'Set your own practice interval in mm:ss.',
      durationSeconds: null,
      citation: null,
      detail: null,
      manualReference: null
    })
  ])
});
