// The five stages an event's tools fall into.
//
// This is a reading order, not a gate: every tool stays one click away and
// nothing is locked behind a previous step. The order is the order a student
// typically works in — read the rules, build the allowed resource, practise the
// skills, keep a record of what happened — with look-up calculators last
// because they are used while the other four happen.
export const STAGES = ['learn', 'prepare', 'practice', 'record', 'reference'];

export const STAGE_META = {
  learn: {
    label: 'Learn the rules',
    short: 'Learn',
    icon: 'ti-book',
    description: 'What the event asks for, and what the manual already prints.'
  },
  prepare: {
    label: 'Build your resources',
    short: 'Prepare',
    icon: 'ti-notes',
    description: 'The notes sheet or binder you are allowed to bring.'
  },
  practice: {
    label: 'Practice the skills',
    short: 'Practice',
    icon: 'ti-barbell',
    description: 'Generated problems, drills, and workbenches.'
  },
  record: {
    label: 'Record your results',
    short: 'Record',
    icon: 'ti-clipboard-list',
    description: 'Notebooks and logs for what you measured or built.'
  },
  reference: {
    label: 'Look it up',
    short: 'Reference',
    icon: 'ti-calculator',
    description: 'Calculators and keys you reach for mid-task.'
  }
};

/** Position of a stage in the canonical order; unknown stages sort last. */
export function stageIndex(stage) {
  const index = STAGES.indexOf(stage);
  return index === -1 ? STAGES.length : index;
}

/** A module with no stage recorded falls back to `practice` rather than vanishing. */
export function normalizeStage(stage) {
  return STAGES.includes(stage) ? stage : 'practice';
}

export function stageMeta(stage) {
  return STAGE_META[normalizeStage(stage)];
}
