// Designer Genes — Genetics Workbench pure logic (no React/DOM, no season
// literals). The manual supplies topic scope and citations in season data;
// everything here is a standard genetics relationship used as a study aid.

const normalizeInput = (value) => String(value ?? '').replace(/\s+/g, '');

/** Split a genotype like `AaBb` into `{ letter, pair }` loci, or return an error. */
function parseLoci(input) {
  const raw = normalizeInput(input);
  if (!raw || !/^[A-Za-z]+$/.test(raw) || raw.length % 2 !== 0) {
    return { error: 'Enter allele pairs such as Aa or AaBb (letters only, in pairs).' };
  }
  const loci = [];
  const seen = new Set();
  for (let i = 0; i < raw.length; i += 2) {
    const first = raw[i];
    const second = raw[i + 1];
    const letter = first.toUpperCase();
    if (first.toUpperCase() !== second.toUpperCase()) {
      return { error: `The pair “${first}${second}” must use the same letter.` };
    }
    if (seen.has(letter)) {
      return { error: `The locus ${letter} appears more than once.` };
    }
    seen.add(letter);
    const bothUpper = first === letter && second === letter;
    const bothLower = first !== letter && second !== letter;
    const pair = bothUpper ? `${letter}${letter}` : bothLower ? `${letter.toLowerCase()}${letter.toLowerCase()}` : `${letter}${letter.toLowerCase()}`;
    loci.push({ letter, pair });
  }
  return { loci };
}

const optionsFor = (pair) => {
  const letter = pair[0].toUpperCase();
  if (pair === `${letter}${letter}`) return [letter];
  if (pair === `${letter.toLowerCase()}${letter.toLowerCase()}`) return [letter.toLowerCase()];
  return [letter, letter.toLowerCase()];
};

/** Gametes from a parent genotype; deterministic order, duplicates removed. */
export function gametesFor(input) {
  const parsed = parseLoci(input);
  if (parsed.error) return parsed;
  const gametes = parsed.loci
    .map((locus) => optionsFor(locus.pair))
    .reduce((prefixes, options) => prefixes.flatMap((prefix) => options.map((allele) => prefix + allele)), ['']);
  return { letters: parsed.loci.map((locus) => locus.letter), gametes: [...new Set(gametes)].sort() };
}

/** Combine two gametes into a genotype with the dominant allele written first. */
export function combineGametes(a, b) {
  if (a.length !== b.length) return '';
  return [...a].map((allele, index) => {
    const letter = allele.toUpperCase();
    const uppercaseCount = [allele, b[index]].filter((char) => char === letter).length;
    return uppercaseCount === 2 ? `${letter}${letter}` : uppercaseCount === 1 ? `${letter}${letter.toLowerCase()}` : `${letter.toLowerCase()}${letter.toLowerCase()}`;
  }).join('');
}

const phenotypeOf = (genotype) => genotype.match(/../g)
  .map((pair) => (pair[0] === pair[0].toUpperCase() ? `${pair[0]}-` : pair.toLowerCase()))
  .join(' ');

const tally = (values) => {
  const counts = new Map();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, fraction: count / values.length }))
    .sort((a, b) => b.count - a.count || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
};

/** Full mono-/di-/trihybrid Punnett square with genotype and phenotype tallies. */
export function punnettCross(parentA, parentB) {
  const a = gametesFor(parentA);
  const b = gametesFor(parentB);
  if (a.error) return a;
  if (b.error) return b;
  if (a.letters.join() !== b.letters.join()) {
    return { error: 'Both parents must use the same loci in the same order.' };
  }
  const grid = a.gametes.map((rowGamete) => b.gametes.map((columnGamete) => combineGametes(rowGamete, columnGamete)));
  const zygotes = grid.flat();
  return {
    loci: a.letters,
    gametesA: a.gametes,
    gametesB: b.gametes,
    grid,
    genotypes: tally(zygotes),
    phenotypes: tally(zygotes.map(phenotypeOf)),
    total: zygotes.length
  };
}

const hardyResult = (p) => {
  const q = 1 - p;
  return {
    p,
    q,
    frequencies: [
      { label: 'Homozygous dominant (p²)', value: p * p },
      { label: 'Heterozygous (2pq)', value: 2 * p * q },
      { label: 'Homozygous recessive (q²)', value: q * q }
    ]
  };
};

export function hardyFromP(pInput) {
  const p = Number(pInput);
  if (!Number.isFinite(p) || p < 0 || p > 1) return { error: 'Enter an allele frequency from 0 to 1.' };
  return hardyResult(p);
}

export function hardyFromRecessive(affectedInput, totalInput) {
  const affected = Number(affectedInput);
  const total = Number(totalInput);
  if (!Number.isFinite(affected) || !Number.isFinite(total) || total <= 0 || affected < 0 || affected > total) {
    return { error: 'Enter a recessive count between 0 and the total population.' };
  }
  const q = Math.sqrt(affected / total);
  return { ...hardyResult(1 - q), source: 'recessive phenotype count' };
}

export function hardyFromDominant(affectedInput, totalInput) {
  const affected = Number(affectedInput);
  const total = Number(totalInput);
  if (!Number.isFinite(affected) || !Number.isFinite(total) || total <= 0 || affected < 0 || affected > total) {
    return { error: 'Enter a dominant count between 0 and the total population.' };
  }
  const recessive = 1 - affected / total;
  const q = Math.sqrt(Math.max(0, recessive));
  return { ...hardyResult(1 - q), source: 'dominant phenotype count' };
}

export function mapTwoPoint(parentalInput, recombinantInput) {
  const parental = Number(parentalInput);
  const recombinant = Number(recombinantInput);
  if (!Number.isFinite(parental) || !Number.isFinite(recombinant) || parental < 0 || recombinant < 0 || parental + recombinant <= 0) {
    return { error: 'Enter non-negative parental and recombinant counts with a positive total.' };
  }
  const total = parental + recombinant;
  const frequency = recombinant / total;
  return { total, parental, recombinant, frequency, centiMorgans: frequency * 100 };
}

const hamming = (a, b) => [...a].filter((char, index) => char !== b[index]).length;

const complementOf = (genotype) => [...genotype]
  .map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()))
  .join('');

/**
 * Three-point testcross mapping from eight progeny classes.
 * `classes` is `[{ id, gamete: 'ABC', count: 25 }, ...]`; letters are positional,
 * and the two largest classes are the parentals, the two smallest the DCOs.
 */
export function mapThreePoint(classes) {
  const entries = Array.isArray(classes) ? classes : [];
  if (entries.length !== 8) return { error: 'Provide all eight progeny classes for a three-point cross.' };
  for (const entry of entries) {
    if (!/^[A-Za-z]{3}$/.test(entry.gamete || '') || !Number.isFinite(Number(entry.count)) || Number(entry.count) < 0) {
      return { error: 'Each class needs a three-letter gamete and a non-negative count.' };
    }
  }
  const letters = [...entries[0].gamete.toUpperCase()];
  if (new Set(letters).size !== 3 || entries.some((entry) => [...entry.gamete.toUpperCase()].join() !== letters.join())) {
    return { error: 'All eight classes must use the same three loci.' };
  }
  // Keep the original case: uppercase/lowercase is exactly the allele data the
  // gene-order and interval logic reads. Only validation looks at upper case.
  const byCount = entries.map((entry) => ({ ...entry, count: Number(entry.count) }))
    .sort((a, b) => b.count - a.count || (a.gamete < b.gamete ? -1 : a.gamete > b.gamete ? 1 : 0));
  const parentals = [byCount[0], byCount[1]];
  const dcos = [byCount[6], byCount[7]];
  const total = byCount.reduce((sum, entry) => sum + entry.count, 0);
  if (total <= 0) return { error: 'The progeny counts must have a positive total.' };
  if (parentals[0].gamete !== complementOf(parentals[1].gamete)) {
    return { error: 'The two most common classes must be complementary parentals.' };
  }
  if (dcos[0].gamete !== complementOf(dcos[1].gamete)) {
    return { error: 'The two least common classes must be complementary double crossovers.' };
  }
  const nearestParental = (gamete) => (hamming(gamete, parentals[0].gamete) <= hamming(gamete, parentals[1].gamete) ? parentals[0].gamete : parentals[1].gamete);
  const differences = dcos[0].gamete.split('').map((char, index) => (char === nearestParental(dcos[0].gamete)[index] ? null : index)).filter((index) => index !== null);
  if (differences.length !== 1) return { error: 'A double crossover must differ from its parental at exactly the middle locus.' };
  const middleIndex = differences[0];
  const leftIndex = [0, 1, 2].find((index) => index !== middleIndex && Math.abs(index - middleIndex) === 1);
  const rightIndex = [0, 1, 2].find((index) => index !== middleIndex && index !== leftIndex);
  const order = [leftIndex, middleIndex, rightIndex].map((index) => letters[index]);

  const recombines = (entry, first, second) => {
    const reference = nearestParental(entry.gamete);
    return (entry.gamete[first] === reference[first]) !== (entry.gamete[second] === reference[second]);
  };
  const leftCount = byCount.filter((entry) => recombines(entry, leftIndex, middleIndex)).reduce((sum, entry) => sum + entry.count, 0);
  const rightCount = byCount.filter((entry) => recombines(entry, middleIndex, rightIndex)).reduce((sum, entry) => sum + entry.count, 0);
  const firstFrequency = leftCount / total;
  const secondFrequency = rightCount / total;
  const observedDco = dcos.reduce((sum, entry) => sum + entry.count, 0);
  const expectedDco = firstFrequency * secondFrequency * total;
  return {
    total,
    geneOrder: order,
    intervals: [
      { label: `${order[0]}–${order[1]}`, frequency: firstFrequency, centiMorgans: firstFrequency * 100 },
      { label: `${order[1]}–${order[2]}`, frequency: secondFrequency, centiMorgans: secondFrequency * 100 }
    ],
    observedDco,
    expectedDco,
    coefficientOfCoincidence: expectedDco > 0 ? observedDco / expectedDco : null,
    interference: expectedDco > 0 ? 1 - observedDco / expectedDco : null,
    parentals: parentals.map((entry) => entry.gamete),
    dcos: dcos.map((entry) => entry.gamete)
  };
}

const ratio = (numerator, denominator) => {
  const top = Number(numerator);
  const bottom = Number(denominator);
  return Number.isFinite(top) && Number.isFinite(bottom) && bottom > 0 ? top / bottom : null;
};

export function heritabilityEstimates({ vg, vp, va, response, selectionDifferential } = {}) {
  return {
    broad: ratio(vg, vp),
    narrow: ratio(va, vp),
    realized: ratio(response, selectionDifferential)
  };
}
