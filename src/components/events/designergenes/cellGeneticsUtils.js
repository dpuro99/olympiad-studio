// Pure model for the mitosis/meiosis drill. It carries invariant biology only:
// stage cues, chromosome-count outcomes and count-derived karyotype notation.
// The season file owns the manual citations, level gate and basis statements.

export const CUE_TEXT = {
  condensed: 'Chromosomes are condensed and visible.',
  envelope: 'The nuclear envelope breaks down.',
  singles: 'Individual chromosomes line up at the equator.',
  pairs: 'Homologous pairs (tetrads) line up at the equator.',
  crossingOver: 'Homologous chromosomes pair and may cross over.',
  sisterSplit: 'Sister chromatids separate toward opposite poles.',
  homologSplit: 'Homologous chromosomes separate; sister chromatids stay joined.',
  haploid: 'The cells are already haploid.',
  diploid: 'The forming nuclei are diploid.',
  dyads: 'Each chromosome still has two sister chromatids.',
  monads: 'Each chromosome is a single chromatid.',
  oneDivision: 'One division follows one round of DNA replication.',
  twoDivisions: 'Two divisions follow one round of DNA replication.',
  twoNuclei: 'Two nuclei form.',
  fourNuclei: 'Four nuclei form.'
};

export const DIVISION_TEXT = {
  mitosis: 'Mitosis',
  'meiosis-i': 'Meiosis I',
  'meiosis-ii': 'Meiosis II'
};

// Each entry is a set of observable cues. Cue sets are deliberately disjoint
// enough that a case built from one stage can be classified without guessing:
// classifyStage returns every stage whose model contains *all* supplied cues.
export const STAGES = [
  { id: 'mitosis-prophase', division: 'mitosis', label: 'Prophase — mitosis', cues: ['condensed', 'envelope', 'dyads', 'oneDivision'] },
  { id: 'mitosis-metaphase', division: 'mitosis', label: 'Metaphase — mitosis', cues: ['singles', 'dyads', 'oneDivision'] },
  { id: 'mitosis-anaphase', division: 'mitosis', label: 'Anaphase — mitosis', cues: ['sisterSplit', 'monads', 'oneDivision'] },
  { id: 'mitosis-telophase', division: 'mitosis', label: 'Telophase — mitosis', cues: ['diploid', 'monads', 'twoNuclei', 'oneDivision'] },
  { id: 'meiosis-i-prophase', division: 'meiosis-i', label: 'Prophase I — meiosis', cues: ['crossingOver', 'dyads', 'twoDivisions'] },
  { id: 'meiosis-i-metaphase', division: 'meiosis-i', label: 'Metaphase I — meiosis', cues: ['pairs', 'dyads', 'twoDivisions'] },
  { id: 'meiosis-i-anaphase', division: 'meiosis-i', label: 'Anaphase I — meiosis', cues: ['homologSplit', 'dyads', 'twoDivisions'] },
  { id: 'meiosis-i-telophase', division: 'meiosis-i', label: 'Telophase I — meiosis', cues: ['haploid', 'dyads', 'twoNuclei', 'twoDivisions'] },
  { id: 'meiosis-ii-prophase', division: 'meiosis-ii', label: 'Prophase II — meiosis', cues: ['condensed', 'dyads', 'haploid', 'twoDivisions'] },
  { id: 'meiosis-ii-metaphase', division: 'meiosis-ii', label: 'Metaphase II — meiosis', cues: ['singles', 'dyads', 'haploid', 'twoDivisions'] },
  { id: 'meiosis-ii-anaphase', division: 'meiosis-ii', label: 'Anaphase II — meiosis', cues: ['sisterSplit', 'monads', 'haploid', 'twoDivisions'] },
  { id: 'meiosis-ii-telophase', division: 'meiosis-ii', label: 'Telophase II — meiosis', cues: ['haploid', 'monads', 'fourNuclei', 'twoDivisions'] }
];

const GAMETE_OUTCOMES = {
  'meiosis-i': ['n+1', 'n+1', 'n−1', 'n−1'],
  'meiosis-ii': ['n+1', 'n−1', 'n', 'n']
};

const ZYGOTE_TEXT = {
  'n+1': '2n+1 — trisomic',
  'n−1': '2n−1 — monosomic',
  n: '2n — euploid'
};

export const AUTOSOMES = Array.from({ length: 22 }, (_, index) => String(index + 1));
export const KARYOTYPE_ROWS = [...AUTOSOMES, 'sex'];

const KARYOTYPE_PATTERNS = [
  { id: 'normal', sex: 'XX' },
  { id: 'normal', sex: 'XY' },
  { id: 'trisomy', extra: '21', sex: 'XX' },
  { id: 'trisomy', extra: '18', sex: 'XY' },
  { id: 'trisomy', extra: '13', sex: 'XX' },
  { id: 'sex-monosomy', sex: 'X' },
  { id: 'sex-trisomy', sex: 'XXX' },
  { id: 'sex-trisomy', sex: 'XXY' },
  { id: 'sex-trisomy', sex: 'XYY' }
];

export function createRng(seed) {
  // mulberry32: sequential seeds must still produce visibly different cases,
  // which a plain LCG with adjacent seeds does not (its first draw barely moves).
  let state = (Number(seed) || 1) >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(items, rng) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function classifyStage(cueIds) {
  const cues = [...new Set(cueIds)];
  if (!cues.length || cues.some((cue) => !CUE_TEXT[cue])) return [];
  return STAGES.filter((stage) => cues.every((cue) => stage.cues.includes(cue)));
}

export function makeStageCase(seed) {
  const rng = createRng(seed);
  const target = STAGES[Math.floor(rng() * STAGES.length)];
  const candidates = [
    ...target.cues.map((cue) => [cue]),
    ...target.cues.flatMap((first, index) => target.cues.slice(index + 1).map((second) => [first, second])),
    [...target.cues]
  ];
  const unique = candidates.filter((cues) => {
    const matches = classifyStage(cues);
    return matches.length === 1 && matches[0].id === target.id;
  });
  const chosen = unique[Math.floor(rng() * unique.length)];
  const distractors = shuffled(STAGES.filter((stage) => stage.id !== target.id), rng).slice(0, 3);
  return {
    seed,
    stageId: target.id,
    cues: chosen.map((cue) => ({ id: cue, text: CUE_TEXT[cue] })),
    options: shuffled([target, ...distractors], rng).map((stage) => ({ id: stage.id, label: stage.label }))
  };
}

export function checkStageCase(caseData, selectedId) {
  const answer = STAGES.find((stage) => stage.id === caseData.stageId);
  return {
    correct: selectedId === caseData.stageId,
    answerId: answer.id,
    answerLabel: answer.label,
    division: DIVISION_TEXT[answer.division],
    explanation: answer.cues.map((cue) => CUE_TEXT[cue]).join(' ')
  };
}

export function gameteOutcomes(division) {
  if (!GAMETE_OUTCOMES[division]) return { error: 'Choose a meiotic division to derive its gamete outcomes.' };
  return [...GAMETE_OUTCOMES[division]];
}

export function zygoteOutcomes(division) {
  const gametes = gameteOutcomes(division);
  if (gametes.error) return gametes;
  return gametes.map((gamete) => ZYGOTE_TEXT[gamete]);
}

export function makeNondisjunctionCase(seed) {
  const rng = createRng(seed);
  const division = rng() < 0.5 ? 'meiosis-i' : 'meiosis-ii';
  const options = [
    { id: 'meiosis-i', label: 'Meiosis I' },
    { id: 'meiosis-ii', label: 'Meiosis II' },
    { id: 'mitosis', label: 'Mitosis' }
  ];
  return {
    seed,
    division,
    gametes: shuffled(gameteOutcomes(division), rng),
    options: shuffled(options, rng),
    answerId: division
  };
}

export function checkNondisjunctionCase(caseData, selectedId) {
  return {
    correct: selectedId === caseData.division,
    answerId: caseData.division,
    answerLabel: DIVISION_TEXT[caseData.division],
    gametes: gameteOutcomes(caseData.division),
    zygotes: zygoteOutcomes(caseData.division)
  };
}

export function buildKaryotype(autosomeCounts, sex) {
  const autosomes = {};
  for (const chromosome of AUTOSOMES) autosomes[chromosome] = autosomeCounts[chromosome] ?? 2;
  return { autosomes, sex };
}

export function describeKaryotype(karyotype) {
  const extraChromosome = AUTOSOMES.find((chromosome) => karyotype.autosomes[chromosome] !== 2);
  const total = AUTOSOMES.reduce((sum, chromosome) => sum + karyotype.autosomes[chromosome], 0) + karyotype.sex.length;
  const sexCount = karyotype.sex.length;
  const sexAbnormal = sexCount !== 2 || (sexCount === 2 && karyotype.sex !== 'XX' && karyotype.sex !== 'XY');
  const notation = `${total},${karyotype.sex}${extraChromosome ? `,${karyotype.autosomes[extraChromosome] > 2 ? '+' : '-'}${extraChromosome}` : ''}`;
  if (!extraChromosome && !sexAbnormal) {
    return { total, notation, abnormalRow: 'none', label: 'No chromosome abnormality detected', detail: 'All 22 autosome pairs have two copies and the sex complement is typical.' };
  }
  if (extraChromosome && !sexAbnormal) {
    const count = karyotype.autosomes[extraChromosome];
    const kind = count > 2 ? 'Extra copy' : 'Missing copy';
    return {
      total, notation, abnormalRow: extraChromosome,
      label: `${kind} of chromosome ${extraChromosome}`,
      detail: `Chromosome ${extraChromosome} has ${count} copies instead of two, so the complement has ${total} chromosomes (${notation}).`
    };
  }
  if (!extraChromosome) {
    return {
      total, notation, abnormalRow: 'sex',
      label: `Sex-chromosome complement ${karyotype.sex}`,
      detail: `All autosomes are paired; the ${karyotype.sex} complement gives ${total} chromosomes (${notation}).`
    };
  }
  return {
    total, notation, abnormalRow: extraChromosome,
    label: `Chromosome ${extraChromosome} and sex complement both differ`,
    detail: `The count-derived notation is ${notation}; both the autosome and sex rows differ from the usual complement.`
  };
}

export function makeKaryotypeCase(seed) {
  const rng = createRng(seed);
  const pattern = KARYOTYPE_PATTERNS[Math.floor(rng() * KARYOTYPE_PATTERNS.length)];
  const counts = {};
  for (const chromosome of AUTOSOMES) counts[chromosome] = 2;
  if (pattern.extra) counts[pattern.extra] = 3;
  const karyotype = buildKaryotype(counts, pattern.sex);
  return { seed, karyotype, answerRow: describeKaryotype(karyotype).abnormalRow };
}

export function checkKaryotypeCase(caseData, selectedRow) {
  const description = describeKaryotype(caseData.karyotype);
  return {
    correct: selectedRow === description.abnormalRow,
    answerRow: description.abnormalRow,
    notation: description.notation,
    label: description.label,
    detail: description.detail,
    total: description.total
  };
}
