// Designer Genes — molecular sequence engine.
// Pure functions only (no React, no DOM). The standard genetic code and the
// restriction-enzyme recognition sites are invariant facts, not Science
// Olympiad rules; season scope and manual citations live in
// src/seasons/<year>/designergenes.js.

export const START_CODON = 'AUG';
export const STOP_CODE = '*';

// Standard genetic code (RNA codons). 64 codons, three stops.
export const CODON_TABLE = Object.freeze({
  UUU: { code: 'F', name: 'Phenylalanine' },
  UUC: { code: 'F', name: 'Phenylalanine' },
  UUA: { code: 'L', name: 'Leucine' },
  UUG: { code: 'L', name: 'Leucine' },
  CUU: { code: 'L', name: 'Leucine' },
  CUC: { code: 'L', name: 'Leucine' },
  CUA: { code: 'L', name: 'Leucine' },
  CUG: { code: 'L', name: 'Leucine' },
  AUU: { code: 'I', name: 'Isoleucine' },
  AUC: { code: 'I', name: 'Isoleucine' },
  AUA: { code: 'I', name: 'Isoleucine' },
  AUG: { code: 'M', name: 'Methionine (start)' },
  GUU: { code: 'V', name: 'Valine' },
  GUC: { code: 'V', name: 'Valine' },
  GUA: { code: 'V', name: 'Valine' },
  GUG: { code: 'V', name: 'Valine' },
  UCU: { code: 'S', name: 'Serine' },
  UCC: { code: 'S', name: 'Serine' },
  UCA: { code: 'S', name: 'Serine' },
  UCG: { code: 'S', name: 'Serine' },
  CCU: { code: 'P', name: 'Proline' },
  CCC: { code: 'P', name: 'Proline' },
  CCA: { code: 'P', name: 'Proline' },
  CCG: { code: 'P', name: 'Proline' },
  ACU: { code: 'T', name: 'Threonine' },
  ACC: { code: 'T', name: 'Threonine' },
  ACA: { code: 'T', name: 'Threonine' },
  ACG: { code: 'T', name: 'Threonine' },
  GCU: { code: 'A', name: 'Alanine' },
  GCC: { code: 'A', name: 'Alanine' },
  GCA: { code: 'A', name: 'Alanine' },
  GCG: { code: 'A', name: 'Alanine' },
  UAU: { code: 'Y', name: 'Tyrosine' },
  UAC: { code: 'Y', name: 'Tyrosine' },
  UAA: { code: STOP_CODE, name: 'Stop' },
  UAG: { code: STOP_CODE, name: 'Stop' },
  CAU: { code: 'H', name: 'Histidine' },
  CAC: { code: 'H', name: 'Histidine' },
  CAA: { code: 'Q', name: 'Glutamine' },
  CAG: { code: 'Q', name: 'Glutamine' },
  AAU: { code: 'N', name: 'Asparagine' },
  AAC: { code: 'N', name: 'Asparagine' },
  AAA: { code: 'K', name: 'Lysine' },
  AAG: { code: 'K', name: 'Lysine' },
  GAU: { code: 'D', name: 'Aspartic acid' },
  GAC: { code: 'D', name: 'Aspartic acid' },
  GAA: { code: 'E', name: 'Glutamic acid' },
  GAG: { code: 'E', name: 'Glutamic acid' },
  UGU: { code: 'C', name: 'Cysteine' },
  UGC: { code: 'C', name: 'Cysteine' },
  UGA: { code: STOP_CODE, name: 'Stop' },
  UGG: { code: 'W', name: 'Tryptophan' },
  CGU: { code: 'R', name: 'Arginine' },
  CGC: { code: 'R', name: 'Arginine' },
  CGA: { code: 'R', name: 'Arginine' },
  CGG: { code: 'R', name: 'Arginine' },
  AGU: { code: 'S', name: 'Serine' },
  AGC: { code: 'S', name: 'Serine' },
  AGA: { code: 'R', name: 'Arginine' },
  AGG: { code: 'R', name: 'Arginine' },
  GGU: { code: 'G', name: 'Glycine' },
  GGC: { code: 'G', name: 'Glycine' },
  GGA: { code: 'G', name: 'Glycine' },
  GGG: { code: 'G', name: 'Glycine' }
});

const RESIDUE_NAMES = Object.freeze(
  Object.values(CODON_TABLE).reduce((names, entry) => {
    if (!names[entry.code]) names[entry.code] = entry.name.replace(' (start)', '');
    return names;
  }, {})
);

export function residueName(code) {
  return RESIDUE_NAMES[code] || 'Unassigned';
}

// Every codon that does not terminate translation, used by the generator so a
// random sequence always translates into a readable peptide.
const SENSE_CODONS = Object.freeze(
  Object.keys(CODON_TABLE).filter((codon) => CODON_TABLE[codon].code !== STOP_CODE)
);

// Common type II recognition sites. All are palindromic, which is why the
// reverse complement of the site is the same site.
export const RESTRICTION_ENZYMES = Object.freeze([
  { name: 'EcoRI', site: 'GAATTC' },
  { name: 'BamHI', site: 'GGATCC' },
  { name: 'HindIII', site: 'AAGCTT' },
  { name: 'PstI', site: 'CTGCAG' },
  { name: 'SalI', site: 'GTCGAC' },
  { name: 'XhoI', site: 'CTCGAG' },
  { name: 'KpnI', site: 'GGTACC' },
  { name: 'SacI', site: 'GAGCTC' },
  { name: 'SmaI', site: 'CCCGGG' },
  { name: 'NotI', site: 'GCGGCCGC' },
  { name: 'XbaI', site: 'TCTAGA' },
  { name: 'NdeI', site: 'CATATG' },
  { name: 'AluI', site: 'AGCT' },
  { name: 'HaeIII', site: 'GGCC' }
]);

export const MUTATION_KINDS = Object.freeze({
  SILENT: 'silent',
  MISSENSE: 'missense',
  NONSENSE: 'nonsense',
  STOP_LOSS: 'stop-loss',
  FRAMESHIFT: 'frameshift',
  IN_FRAME_INDEL: 'in-frame-indel'
});

export const MUTATION_LABELS = Object.freeze({
  [MUTATION_KINDS.SILENT]: 'Silent',
  [MUTATION_KINDS.MISSENSE]: 'Missense',
  [MUTATION_KINDS.NONSENSE]: 'Nonsense',
  [MUTATION_KINDS.STOP_LOSS]: 'Stop-loss',
  [MUTATION_KINDS.FRAMESHIFT]: 'Frameshift',
  [MUTATION_KINDS.IN_FRAME_INDEL]: 'In-frame insertion or deletion'
});

/**
 * Normalize typed or pasted sequence text. Whitespace is ignored; anything
 * outside the requested alphabet is reported instead of silently dropped.
 */
export function normalizeSequence(raw, { alphabet = 'DNA' } = {}) {
  const cleaned = String(raw ?? '').toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return { sequence: '', error: 'Enter a sequence to analyze.' };
  const allowed = alphabet === 'RNA' ? 'ACGU' : 'ACGT';
  const invalid = [...new Set([...cleaned].filter((base) => !allowed.includes(base)))];
  if (invalid.length > 0) {
    return {
      sequence: '',
      error: `Unexpected ${invalid.length === 1 ? 'character' : 'characters'}: ${invalid.join(', ')}. ${alphabet} uses ${allowed.split('').join('/')}.`
    };
  }
  return { sequence: cleaned, error: null };
}

/** Base composition and GC percentage (T and U are treated as the same base). */
export function gcContent(sequence) {
  const counts = { A: 0, T: 0, C: 0, G: 0 };
  for (const base of String(sequence ?? '').toUpperCase()) {
    if (base === 'U') counts.T += 1;
    else if (base in counts) counts[base] += 1;
  }
  const total = counts.A + counts.T + counts.C + counts.G;
  const gc = counts.C + counts.G;
  return {
    counts,
    total,
    gc,
    at: counts.A + counts.T,
    percent: total === 0 ? 0 : (gc / total) * 100
  };
}

/** DNA complement. U is read as T so RNA input still complements. */
export function complement(sequence) {
  const pairs = { A: 'T', T: 'A', U: 'A', C: 'G', G: 'C' };
  return [...String(sequence ?? '').toUpperCase()].map((base) => pairs[base] ?? base).join('');
}

/** Reverse complement — the opposite strand written 5' → 3'. */
export function reverseComplement(sequence) {
  return [...complement(sequence)].reverse().join('');
}

/** DNA → mRNA. Sequence already written as RNA is returned unchanged. */
export function transcribe(sequence) {
  return String(sequence ?? '').toUpperCase().replace(/T/g, 'U');
}

/**
 * Translate a DNA or RNA sequence from its first base.
 * `protein` holds residue codes only; stop codons are reported in `codons`.
 */
export function translate(sequence, { stopAtStop = true } = {}) {
  const rna = transcribe(sequence);
  const codons = [];
  let stopIndex = null;
  for (let index = 0; index + 3 <= rna.length; index += 3) {
    const codon = rna.slice(index, index + 3);
    const entry = CODON_TABLE[codon];
    const isStop = entry?.code === STOP_CODE;
    codons.push({
      index,
      position: index / 3 + 1,
      codon,
      code: entry ? entry.code : null,
      name: entry ? entry.name : 'Unassigned codon',
      isStart: codon === START_CODON,
      isStop
    });
    if (isStop && stopAtStop) {
      stopIndex = codons.length - 1;
      break;
    }
  }
  const translated = stopIndex === null ? codons : codons.slice(0, stopIndex + 1);
  const residues = translated.filter((codon) => !codon.isStop && codon.code);
  return {
    protein: residues.map((codon) => codon.code).join(''),
    codons: translated,
    stoppedEarly: stopIndex !== null,
    stopCodon: stopIndex === null ? null : translated[stopIndex].codon,
    leftoverBases: stopIndex === null ? rna.length % 3 : 0
  };
}

/**
 * All three reading frames of both strands. Frame 1 starts at the first base;
 * the minus strand uses the reverse complement, so frame -1 is its first base.
 */
export function readingFrames(sequence, { includeReverse = true } = {}) {
  const dna = String(sequence ?? '').toUpperCase();
  const build = (template, strand) => [0, 1, 2].map((offset) => {
    const result = translate(template.slice(offset), { stopAtStop: false });
    return {
      id: `${strand}${offset + 1}`,
      strand,
      offset,
      template,
      codons: result.codons,
      protein: result.protein,
      marked: result.codons.map((codon) => (codon.isStop ? STOP_CODE : codon.code ?? '?')).join(''),
      leftoverBases: result.leftoverBases
    };
  });
  return includeReverse
    ? [...build(dna, '+'), ...build(reverseComplement(dna), '-')]
    : build(dna, '+');
}

/** Every recognition site present in the sequence, with 1-based positions. */
export function findRestrictionSites(sequence, enzymes = RESTRICTION_ENZYMES) {
  const dna = String(sequence ?? '').toUpperCase().replace(/U/g, 'T');
  return enzymes
    .map((enzyme) => {
      const positions = [];
      let from = 0;
      for (;;) {
        const at = dna.indexOf(enzyme.site, from);
        if (at === -1) break;
        positions.push({ start: at + 1, end: at + enzyme.site.length });
        from = at + 1;
      }
      return { ...enzyme, positions, count: positions.length };
    })
    .filter((enzyme) => enzyme.count > 0);
}

function compareCodons(referenceProtein, variantProtein, codonIndex) {
  const refCodon = referenceProtein.codons[codonIndex];
  const varCodon = variantProtein.codons[codonIndex];
  if (!refCodon || !varCodon) return { kind: MUTATION_KINDS.FRAMESHIFT };
  if (refCodon.code === varCodon.code) return { kind: MUTATION_KINDS.SILENT };
  if (varCodon.isStop) return { kind: MUTATION_KINDS.NONSENSE };
  if (refCodon.isStop) return { kind: MUTATION_KINDS.STOP_LOSS };
  return { kind: MUTATION_KINDS.MISSENSE };
}

/**
 * Classify a variant against a reference coding sequence: silent, missense,
 * nonsense, stop-loss, frameshift, or an in-frame insertion/deletion.
 */
export function classifyMutation(referenceRaw, variantRaw) {
  const reference = normalizeSequence(referenceRaw);
  if (reference.error) return { error: `Reference sequence: ${reference.error}` };
  const variant = normalizeSequence(variantRaw);
  if (variant.error) return { error: `Variant sequence: ${variant.error}` };

  const refTranslation = translate(reference.sequence, { stopAtStop: false });
  const varTranslation = translate(variant.sequence, { stopAtStop: false });
  const delta = variant.sequence.length - reference.sequence.length;

  if (delta !== 0) {
    const shared = Math.min(reference.sequence.length, variant.sequence.length);
    const codonIndex = Math.floor(shared / 3);
    return {
      kind: delta % 3 === 0 ? MUTATION_KINDS.IN_FRAME_INDEL : MUTATION_KINDS.FRAMESHIFT,
      delta,
      reference: reference.sequence,
      variant: variant.sequence,
      referenceProtein: refTranslation.protein,
      variantProtein: varTranslation.protein,
      codonIndex,
      changes: []
    };
  }

  const changes = [];
  for (let index = 0; index < reference.sequence.length; index += 1) {
    if (reference.sequence[index] === variant.sequence[index]) continue;
    const codonIndex = Math.floor(index / 3);
    const codonChange = compareCodons(refTranslation, varTranslation, codonIndex);
    changes.push({
      nucleotideIndex: index,
      position: index + 1,
      codonIndex,
      codonPosition: (index % 3) + 1,
      from: reference.sequence[index],
      to: variant.sequence[index],
      referenceCodon: refTranslation.codons[codonIndex]?.codon ?? null,
      variantCodon: varTranslation.codons[codonIndex]?.codon ?? null,
      referenceCode: refTranslation.codons[codonIndex]?.code ?? null,
      variantCode: varTranslation.codons[codonIndex]?.code ?? null,
      kind: codonChange.kind
    });
  }

  const kinds = new Set(changes.map((change) => change.kind));
  let kind = MUTATION_KINDS.SILENT;
  if (kinds.has(MUTATION_KINDS.NONSENSE)) kind = MUTATION_KINDS.NONSENSE;
  else if (kinds.has(MUTATION_KINDS.STOP_LOSS)) kind = MUTATION_KINDS.STOP_LOSS;
  else if (kinds.has(MUTATION_KINDS.MISSENSE)) kind = MUTATION_KINDS.MISSENSE;

  return {
    kind: changes.length === 0 ? MUTATION_KINDS.SILENT : kind,
    delta: 0,
    identical: changes.length === 0,
    reference: reference.sequence,
    variant: variant.sequence,
    referenceProtein: refTranslation.protein,
    variantProtein: varTranslation.protein,
    changes
  };
}

/**
 * Random coding sequence for practice. Starts with a start codon by default and
 * never contains an internal stop, so the peptide is always readable.
 * `random` is injectable so tests are deterministic.
 */
export function generateSequence({ codons = 8, random = Math.random, start = true, stop = false, alphabet = 'DNA' } = {}) {
  const isRna = alphabet === 'RNA';
  const sense = SENSE_CODONS.map((codon) => (isRna ? codon : codon.replace(/U/g, 'T')));
  const startCodon = isRna ? START_CODON : START_CODON.replace(/U/g, 'T');
  const stopCodon = isRna ? 'UAA' : 'TAA';
  let sequence = start ? startCodon : '';
  for (let index = 0; index < codons; index += 1) {
    sequence += sense[Math.floor(random() * sense.length)];
  }
  if (stop) sequence += stopCodon;
  return sequence;
}
