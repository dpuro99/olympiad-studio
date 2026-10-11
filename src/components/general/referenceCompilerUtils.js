// Shared engine logic for the Reference & Study Compiler.
// Pure functions only (no React, no DOM) so the same engine can back every
// event config (sheet mode and, later, binder mode). Per-event objectives and
// allowed-resource copy live in each event's referenceCompilerConfig.js.

export const COMPILER_STATUS = {
  NOT_STARTED: 'not-started',
  STUDYING: 'studying',
  CONFIDENT: 'confident'
};

export const STATUS_ORDER = [
  COMPILER_STATUS.NOT_STARTED,
  COMPILER_STATUS.STUDYING,
  COMPILER_STATUS.CONFIDENT
];

export const STATUS_LABELS = {
  [COMPILER_STATUS.NOT_STARTED]: 'Not started',
  [COMPILER_STATUS.STUDYING]: 'Studying',
  [COMPILER_STATUS.CONFIDENT]: 'Confident'
};

export const LEVEL_LABELS = {
  core: 'Core',
  'state-national': 'State/National',
  'national-only': 'National'
};

// Approximate printable capacity heuristics. The manual fixes the sheet size,
// not the characters that fit; these presets are guidance, not a rule.
export const DENSITY_PRESETS = [
  { id: 'compact', label: 'Compact', charsPerSide: 5200, hint: 'Two columns, ~9 pt' },
  { id: 'standard', label: 'Standard', charsPerSide: 3600, hint: 'Two columns, ~10 pt' },
  { id: 'large', label: 'Large', charsPerSide: 2400, hint: 'Single column, ~11 pt' }
];

export const DEFAULT_DENSITY = 'standard';

export function createEmptyState() {
  return { objectiveStatus: {}, blocks: [], density: DEFAULT_DENSITY };
}

export function normalizeStatus(status) {
  return STATUS_ORDER.includes(status) ? status : COMPILER_STATUS.NOT_STARTED;
}

export function setObjectiveStatus(state, objectiveId, status) {
  if (!objectiveId) return state;
  return {
    ...state,
    objectiveStatus: { ...state.objectiveStatus, [objectiveId]: normalizeStatus(status) }
  };
}

function createBlockId() {
  return `blk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isValidBlock(block) {
  return Boolean(block)
    && typeof block.id === 'string'
    && typeof block.objectiveId === 'string';
}

export function addBlock(state, { objectiveId, title = '', body = '' }) {
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  if (!objectiveId || (!cleanTitle && !cleanBody)) return state;
  const block = { id: createBlockId(), objectiveId, title: cleanTitle, body: cleanBody };
  return { ...state, blocks: [...state.blocks, block] };
}

export function updateBlock(state, id, patch) {
  return {
    ...state,
    blocks: state.blocks.map((block) => (
      block.id === id ? { ...block, ...patch, id: block.id, objectiveId: block.objectiveId } : block
    ))
  };
}

export function removeBlock(state, id) {
  return { ...state, blocks: state.blocks.filter((block) => block.id !== id) };
}

export function countCharacters(blocks) {
  return blocks.reduce((sum, block) => (
    sum + (block.title || '').length + (block.body || '').length
  ), 0);
}

export function computeBudget(charCount, charsPerSide, sides = 2) {
  const capacity = Math.max(0, Number(charsPerSide) || 0) * Math.max(1, Number(sides) || 1);
  const ratio = capacity > 0 ? charCount / capacity : 0;
  const overBy = Math.max(0, charCount - capacity);
  return { charCount, capacity, ratio, overBy, over: charCount > capacity };
}

export function indexObjectives(config) {
  const map = new Map();
  for (const group of config.objectiveGroups || []) {
    for (const objective of group.objectives || []) {
      map.set(objective.id, { ...objective, groupId: group.id, groupLabel: group.label });
    }
  }
  return map;
}

export function selectVisibleBlocks(config, state, { pruneConfident = false } = {}) {
  if (!pruneConfident) return state.blocks;
  const objectives = indexObjectives(config);
  return state.blocks.filter((block) => {
    if (!objectives.has(block.objectiveId)) return true;
    const status = normalizeStatus(state.objectiveStatus[block.objectiveId]);
    return status !== COMPILER_STATUS.CONFIDENT;
  });
}

export function assembleSheet(config, state, { pruneConfident = false } = {}) {
  const visible = selectVisibleBlocks(config, state, { pruneConfident });
  const byObjective = new Map();
  for (const block of visible) {
    if (!byObjective.has(block.objectiveId)) byObjective.set(block.objectiveId, []);
    byObjective.get(block.objectiveId).push(block);
  }
  return (config.objectiveGroups || [])
    .map((group) => ({
      group,
      sections: (group.objectives || [])
        .filter((objective) => byObjective.has(objective.id))
        .map((objective) => ({ objective, blocks: byObjective.get(objective.id) }))
    }))
    .filter((entry) => entry.sections.length > 0);
}

export function progressSummary(config, state) {
  const summary = { total: 0, [COMPILER_STATUS.NOT_STARTED]: 0, [COMPILER_STATUS.STUDYING]: 0, [COMPILER_STATUS.CONFIDENT]: 0 };
  for (const group of config.objectiveGroups || []) {
    for (const objective of group.objectives || []) {
      summary.total += 1;
      summary[normalizeStatus(state.objectiveStatus[objective.id])] += 1;
    }
  }
  return summary;
}

export function serializeState(state) {
  return JSON.stringify(state);
}

export function safeParseState(serialized) {
  try {
    const data = JSON.parse(serialized);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { error: 'Saved reference sheet has an unsupported format.' };
    }
    if (data.blocks !== undefined && !Array.isArray(data.blocks)) {
      return { error: 'Saved reference sheet has an unsupported format.' };
    }
    const density = DENSITY_PRESETS.some((preset) => preset.id === data.density)
      ? data.density
      : DEFAULT_DENSITY;
    return {
      value: {
        objectiveStatus: (data.objectiveStatus && typeof data.objectiveStatus === 'object' && !Array.isArray(data.objectiveStatus))
          ? data.objectiveStatus
          : {},
        blocks: Array.isArray(data.blocks) ? data.blocks.filter(isValidBlock) : [],
        density
      }
    };
  } catch {
    return { error: 'Saved reference sheet could not be read.' };
  }
}
