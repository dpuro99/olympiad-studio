// Chemistry Lab C — Supporting-tool practice logic (no UI).
//
// Everything here is generated or computed from a small, verified set of
// constants: standard atomic weights, the ion list from the 2027 Division C
// Rules Manual §3.d (pp. C14–C15), and a curated set of reaction species that
// the balancer solves at runtime. Problems are generated, never drawn from a
// fixed answer bank.
//
// Manual source: Division C Rules Manual, §3.c (nomenclature, formula writing,
// stoichiometry) and §3.d (required ion knowledge), pp. C14–C15.

// Standard atomic weights (g/mol), IUPAC conventional values.
export const ATOMIC_MASSES = {
  H: 1.008,
  He: 4.0026,
  Li: 6.94,
  Be: 9.0122,
  B: 10.81,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  Na: 22.99,
  Mg: 24.305,
  Al: 26.982,
  Si: 28.085,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  Ar: 39.948,
  K: 39.098,
  Ca: 40.078,
  Cr: 51.996,
  Mn: 54.938,
  Fe: 55.845,
  Co: 58.933,
  Ni: 58.693,
  Cu: 63.546,
  Zn: 65.38,
  Br: 79.904,
  Rb: 85.468,
  Sr: 87.62,
  Ag: 107.868,
  I: 126.904,
  Cs: 132.905,
  Ba: 137.327,
  Pb: 207.2
};

export const AVOGADRO = 6.022e23;
// Molar volume of an ideal gas at STP (0 °C, 1 atm), L/mol.
export const MOLAR_VOLUME = 22.4;

// Ion library transcribed from manual §3.d. `level` records where the ion is
// expected: 'regional' (main-group monatomic ions plus the listed polyatomic
// ions) or 'state' (State/National additions). `romanNumeral` flags transition
// metals whose charge must be specified with a Stock Roman numeral.
export const IONS = [
  // Regional monatomic cations — main group elements.
  { formula: 'Li', charge: 1, name: 'lithium', level: 'regional', polyatomic: false },
  { formula: 'Na', charge: 1, name: 'sodium', level: 'regional', polyatomic: false },
  { formula: 'K', charge: 1, name: 'potassium', level: 'regional', polyatomic: false },
  { formula: 'Rb', charge: 1, name: 'rubidium', level: 'regional', polyatomic: false },
  { formula: 'Cs', charge: 1, name: 'cesium', level: 'regional', polyatomic: false },
  { formula: 'Be', charge: 2, name: 'beryllium', level: 'regional', polyatomic: false },
  { formula: 'Mg', charge: 2, name: 'magnesium', level: 'regional', polyatomic: false },
  { formula: 'Ca', charge: 2, name: 'calcium', level: 'regional', polyatomic: false },
  { formula: 'Sr', charge: 2, name: 'strontium', level: 'regional', polyatomic: false },
  { formula: 'Ba', charge: 2, name: 'barium', level: 'regional', polyatomic: false },
  { formula: 'Al', charge: 3, name: 'aluminum', level: 'regional', polyatomic: false },
  // Regional monatomic anions — main group elements.
  { formula: 'H', charge: -1, name: 'hydride', level: 'regional', polyatomic: false },
  { formula: 'N', charge: -3, name: 'nitride', level: 'regional', polyatomic: false },
  { formula: 'O', charge: -2, name: 'oxide', level: 'regional', polyatomic: false },
  { formula: 'F', charge: -1, name: 'fluoride', level: 'regional', polyatomic: false },
  { formula: 'P', charge: -3, name: 'phosphide', level: 'regional', polyatomic: false },
  { formula: 'S', charge: -2, name: 'sulfide', level: 'regional', polyatomic: false },
  { formula: 'Cl', charge: -1, name: 'chloride', level: 'regional', polyatomic: false },
  { formula: 'Br', charge: -1, name: 'bromide', level: 'regional', polyatomic: false },
  { formula: 'I', charge: -1, name: 'iodide', level: 'regional', polyatomic: false },
  // Regional polyatomic ions.
  { formula: 'NH4', charge: 1, name: 'ammonium', level: 'regional', polyatomic: true },
  { formula: 'C2H3O2', charge: -1, name: 'acetate', level: 'regional', polyatomic: true },
  { formula: 'HCO3', charge: -1, name: 'bicarbonate', level: 'regional', polyatomic: true },
  { formula: 'CO3', charge: -2, name: 'carbonate', level: 'regional', polyatomic: true },
  { formula: 'CN', charge: -1, name: 'cyanide', level: 'regional', polyatomic: true },
  { formula: 'OH', charge: -1, name: 'hydroxide', level: 'regional', polyatomic: true },
  { formula: 'NO3', charge: -1, name: 'nitrate', level: 'regional', polyatomic: true },
  { formula: 'PO4', charge: -3, name: 'phosphate', level: 'regional', polyatomic: true },
  { formula: 'SO4', charge: -2, name: 'sulfate', level: 'regional', polyatomic: true },
  // State/National cations — transition metals and their variable charges.
  { formula: 'Cu', charge: 1, name: 'copper', romanNumeral: true, level: 'state', polyatomic: false },
  { formula: 'Cu', charge: 2, name: 'copper', romanNumeral: true, level: 'state', polyatomic: false },
  { formula: 'Fe', charge: 2, name: 'iron', romanNumeral: true, level: 'state', polyatomic: false },
  { formula: 'Fe', charge: 3, name: 'iron', romanNumeral: true, level: 'state', polyatomic: false },
  { formula: 'Ag', charge: 1, name: 'silver', level: 'state', polyatomic: false },
  { formula: 'Zn', charge: 2, name: 'zinc', level: 'state', polyatomic: false },
  // State/National polyatomic anions — the -ite/-ate and hypo-/per- families.
  { formula: 'CrO4', charge: -2, name: 'chromate', level: 'state', polyatomic: true },
  { formula: 'Cr2O7', charge: -2, name: 'dichromate', level: 'state', polyatomic: true },
  { formula: 'MnO4', charge: -1, name: 'permanganate', level: 'state', polyatomic: true },
  { formula: 'O2', charge: -2, name: 'peroxide', level: 'state', polyatomic: true },
  { formula: 'SCN', charge: -1, name: 'thiocyanate', level: 'state', polyatomic: true },
  { formula: 'ClO', charge: -1, name: 'hypochlorite', level: 'state', polyatomic: true },
  { formula: 'ClO2', charge: -1, name: 'chlorite', level: 'state', polyatomic: true },
  { formula: 'ClO3', charge: -1, name: 'chlorate', level: 'state', polyatomic: true },
  { formula: 'ClO4', charge: -1, name: 'perchlorate', level: 'state', polyatomic: true },
  { formula: 'NO2', charge: -1, name: 'nitrite', level: 'state', polyatomic: true },
  { formula: 'SO3', charge: -2, name: 'sulfite', level: 'state', polyatomic: true }
];

// Curated reaction species. The balancer derives the coefficients, so these are
// inputs to a solver rather than a stored answer key; a unit test proves every
// entry balances into positive integers.
export const REACTIONS = [
  { label: 'Combustion of methane', reactants: ['CH4', 'O2'], products: ['CO2', 'H2O'] },
  { label: 'Combustion of ethane', reactants: ['C2H6', 'O2'], products: ['CO2', 'H2O'] },
  { label: 'Combustion of propane', reactants: ['C3H8', 'O2'], products: ['CO2', 'H2O'] },
  { label: 'Combustion of ethanol', reactants: ['C2H6O', 'O2'], products: ['CO2', 'H2O'] },
  { label: 'Synthesis of water', reactants: ['H2', 'O2'], products: ['H2O'] },
  { label: 'Synthesis of ammonia', reactants: ['N2', 'H2'], products: ['NH3'] },
  { label: 'Sodium chloride formation', reactants: ['Na', 'Cl2'], products: ['NaCl'] },
  { label: 'Magnesium oxide formation', reactants: ['Mg', 'O2'], products: ['MgO'] },
  { label: 'Aluminum oxide formation', reactants: ['Al', 'O2'], products: ['Al2O3'] },
  { label: 'Iron(III) oxide formation', reactants: ['Fe', 'O2'], products: ['Fe2O3'] },
  { label: 'Decomposition of hydrogen peroxide', reactants: ['H2O2'], products: ['H2O', 'O2'] },
  { label: 'Decomposition of calcium carbonate', reactants: ['CaCO3'], products: ['CaO', 'CO2'] },
  { label: 'Decomposition of potassium chlorate', reactants: ['KClO3'], products: ['KCl', 'O2'] },
  { label: 'Decomposition of sodium bicarbonate', reactants: ['NaHCO3'], products: ['Na2CO3', 'H2O', 'CO2'] },
  { label: 'Zinc and hydrochloric acid', reactants: ['Zn', 'HCl'], products: ['ZnCl2', 'H2'] },
  { label: 'Magnesium and hydrochloric acid', reactants: ['Mg', 'HCl'], products: ['MgCl2', 'H2'] },
  { label: 'Aluminum and hydrochloric acid', reactants: ['Al', 'HCl'], products: ['AlCl3', 'H2'] },
  { label: 'Iron and copper(II) sulfate', reactants: ['Fe', 'CuSO4'], products: ['FeSO4', 'Cu'] },
  { label: 'Silver nitrate and sodium chloride', reactants: ['AgNO3', 'NaCl'], products: ['AgCl', 'NaNO3'] },
  { label: 'Calcium chloride and sodium carbonate', reactants: ['CaCl2', 'Na2CO3'], products: ['CaCO3', 'NaCl'] },
  { label: 'Lead(II) nitrate and potassium iodide', reactants: ['Pb(NO3)2', 'KI'], products: ['PbI2', 'KNO3'] },
  { label: 'Barium chloride and sodium sulfate', reactants: ['BaCl2', 'Na2SO4'], products: ['BaSO4', 'NaCl'] },
  { label: 'Hydrochloric acid and sodium hydroxide', reactants: ['HCl', 'NaOH'], products: ['NaCl', 'H2O'] },
  { label: 'Sulfuric acid and sodium hydroxide', reactants: ['H2SO4', 'NaOH'], products: ['Na2SO4', 'H2O'] },
  { label: 'Nitric acid and potassium hydroxide', reactants: ['HNO3', 'KOH'], products: ['KNO3', 'H2O'] },
  { label: 'Hydrochloric acid and sodium bicarbonate', reactants: ['HCl', 'NaHCO3'], products: ['NaCl', 'H2O', 'CO2'] }
];

// ---------------------------------------------------------------- numbers ---

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
}

function lcm(a, b) {
  return Math.abs((a / gcd(a, b)) * b) || 1;
}

function rat(n, d = 1) {
  let num = n;
  let den = d;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  return { n: num / g, d: den / g };
}

const ratSub = (a, b) => rat(a.n * b.d - b.n * a.d, a.d * b.d);
const ratMul = (a, b) => rat(a.n * b.n, a.d * b.d);
const ratDiv = (a, b) => rat(a.n * b.d, a.d * b.n);

export function formatNumber(value, digits = 4) {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e5 || abs < 1e-3) return value.toExponential(3);
  return String(Number(value.toPrecision(digits)));
}

function romanNumeral(value) {
  return { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII' }[value] || String(value);
}

function pick(array, random) {
  return array[Math.floor(random() * array.length)];
}

function randomInt(min, max, random) {
  return min + Math.floor(random() * (max - min + 1));
}

// ---------------------------------------------------------------- formulas ---

// Parse a chemical formula into an element-count map. Supports subscripts and
// nested parentheses/brackets, e.g. Ca(NO3)2 or Al2(SO4)3.
export function parseFormula(input) {
  if (typeof input !== 'string' || !input.trim()) return { error: 'Enter a chemical formula.' };
  const s = input.replace(/\s+/g, '');
  let i = 0;

  function readNumber() {
    let digits = '';
    while (i < s.length && /[0-9]/.test(s[i])) {
      digits += s[i];
      i += 1;
    }
    return digits ? parseInt(digits, 10) : 1;
  }

  function parseSequence(stops) {
    const counts = {};
    while (i < s.length && !stops.includes(s[i])) {
      const ch = s[i];
      if (ch === '(' || ch === '[') {
        const close = ch === '(' ? ')' : ']';
        i += 1;
        const inner = parseSequence(close);
        if (inner.error) return inner;
        if (s[i] !== close) return { error: `Missing "${close}" in ${input}.` };
        i += 1;
        const mult = readNumber();
        for (const [element, count] of Object.entries(inner.counts)) {
          counts[element] = (counts[element] || 0) + count * mult;
        }
      } else if (/[A-Z]/.test(ch)) {
        let symbol = ch;
        i += 1;
        if (i < s.length && /[a-z]/.test(s[i])) {
          symbol += s[i];
          i += 1;
        }
        if (!(symbol in ATOMIC_MASSES)) return { error: `Unknown element "${symbol}".` };
        const mult = readNumber();
        counts[symbol] = (counts[symbol] || 0) + mult;
      } else {
        return { error: `Unexpected character "${ch}" in ${input}.` };
      }
    }
    return { counts };
  }

  const result = parseSequence('');
  if (result.error) return result;
  if (i !== s.length || Object.keys(result.counts).length === 0) {
    return { error: `Could not read "${input}" as a chemical formula.` };
  }
  return { counts: result.counts };
}

export function molarMass(formula) {
  const parsed = parseFormula(formula);
  if (parsed.error) return parsed;
  let mass = 0;
  for (const [element, count] of Object.entries(parsed.counts)) {
    mass += ATOMIC_MASSES[element] * count;
  }
  return { mass, counts: parsed.counts };
}

// Compare two formulas by composition rather than by string, so CH3COO and
// C2H3O2 are recognised as the same species.
export function formulasMatch(a, b) {
  const left = parseFormula(a);
  const right = parseFormula(b);
  if (left.error || right.error) return false;
  const elements = new Set([...Object.keys(left.counts), ...Object.keys(right.counts)]);
  for (const element of elements) {
    if ((left.counts[element] || 0) !== (right.counts[element] || 0)) return false;
  }
  return true;
}

// -------------------------------------------------------------- ions/names ---

function wrapIon(ion, count) {
  if (count === 1) return ion.formula;
  return ion.polyatomic ? `(${ion.formula})${count}` : `${ion.formula}${count}`;
}

// Combine a cation and an anion into a neutral ionic formula and name. Charges
// are crossed and reduced by their GCD; a repeated polyatomic ion is wrapped in
// parentheses. Transition metals with variable charge use a Stock Roman numeral.
export function combineIons(cation, anion) {
  if (!cation || !anion || cation.charge <= 0 || anion.charge >= 0) {
    return { error: 'Choose one cation and one anion.' };
  }
  const cationCharge = cation.charge;
  const anionCharge = -anion.charge;
  const g = gcd(cationCharge, anionCharge);
  const cationCount = anionCharge / g;
  const anionCount = cationCharge / g;
  const formula = wrapIon(cation, cationCount) + wrapIon(anion, anionCount);
  const cationName = cation.romanNumeral ? `${cation.name}(${romanNumeral(cationCharge)})` : cation.name;
  return {
    formula,
    name: `${cationName} ${anion.name}`,
    cation,
    anion,
    cationCount,
    anionCount
  };
}

// ----------------------------------------------------------------- balance ---

function rref(rows, columnCount) {
  const m = rows.map((row) => row.slice());
  const pivots = [];
  let r = 0;
  for (let c = 0; c < columnCount && r < m.length; c += 1) {
    let pivotRow = r;
    while (pivotRow < m.length && m[pivotRow][c].n === 0) pivotRow += 1;
    if (pivotRow === m.length) continue;
    [m[r], m[pivotRow]] = [m[pivotRow], m[r]];
    const pivotValue = m[r][c];
    for (let j = 0; j < columnCount; j += 1) m[r][j] = ratDiv(m[r][j], pivotValue);
    for (let k = 0; k < m.length; k += 1) {
      if (k !== r && m[k][c].n !== 0) {
        const factor = m[k][c];
        for (let j = 0; j < columnCount; j += 1) {
          m[k][j] = ratSub(m[k][j], ratMul(factor, m[r][j]));
        }
      }
    }
    pivots.push(c);
    r += 1;
  }
  return { m, pivots };
}

// Solve for the smallest positive integer coefficients that balance the given
// reactant and product formulas, via exact rational Gaussian elimination.
export function balanceEquation(reactants, products) {
  const species = [...reactants, ...products];
  const parsed = species.map(parseFormula);
  const bad = parsed.findIndex((entry) => entry.error);
  if (bad >= 0) return { error: parsed[bad].error };

  const elements = [];
  for (const entry of parsed) {
    for (const element of Object.keys(entry.counts)) {
      if (!elements.includes(element)) elements.push(element);
    }
  }

  const rows = elements.map((element) => species.map((_, index) => {
    const count = parsed[index].counts[element] || 0;
    return rat(index < reactants.length ? count : -count, 1);
  }));

  const { m, pivots } = rref(rows, species.length);
  const freeColumns = [];
  for (let c = 0; c < species.length; c += 1) {
    if (!pivots.includes(c)) freeColumns.push(c);
  }
  if (freeColumns.length !== 1) {
    return { error: 'This set of species does not form a single balanceable reaction.' };
  }

  const free = freeColumns[0];
  const solution = species.map(() => rat(0, 1));
  solution[free] = rat(1, 1);
  pivots.forEach((pivotColumn, rowIndex) => {
    const value = m[rowIndex][free];
    solution[pivotColumn] = rat(-value.n, value.d);
  });

  let denominatorLcm = 1;
  for (const value of solution) denominatorLcm = lcm(denominatorLcm, value.d);
  let integers = solution.map((value) => value.n * (denominatorLcm / value.d));
  let common = 0;
  for (const value of integers) common = gcd(common, value);
  if (common > 1) integers = integers.map((value) => value / common);
  if (integers.every((value) => value < 0)) integers = integers.map((value) => -value);
  if (integers.some((value) => value <= 0)) {
    return { error: 'Could not balance this reaction.' };
  }

  return { coefficients: integers, elements };
}

function coefficientPrefix(value) {
  return value === 1 ? '' : `${value} `;
}

export function formatEquation(reactants, products, coefficients) {
  const left = reactants
    .map((formula, index) => `${coefficientPrefix(coefficients[index])}${formula}`)
    .join(' + ');
  const right = products
    .map((formula, index) => `${coefficientPrefix(coefficients[reactants.length + index])}${formula}`)
    .join(' + ');
  return `${left} \u2192 ${right}`;
}

// ------------------------------------------------------------- conversion ---

const CONVERSION_SPECIES = [
  'H2O', 'CO2', 'NaCl', 'C6H12O6', 'CaCO3', 'KClO3', 'C2H6O',
  'NaOH', 'H2SO4', 'CuSO4', 'AgNO3', 'MgO', 'Fe2O3', 'NH4NO3'
];
const GAS_SPECIES = ['O2', 'N2', 'H2', 'CO2', 'CH4', 'He', 'Ar'];
const NICE_MASSES = [2, 4, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 100];
const NICE_MOLES = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5];

function generateConversionProblem(random) {
  const subtypes = ['massToMoles', 'molesToMass', 'molesToParticles', 'particlesToMoles', 'molesToVolume', 'massToParticles'];
  const subtype = pick(subtypes, random);
  const substance = subtype === 'molesToVolume' ? pick(GAS_SPECIES, random) : pick(CONVERSION_SPECIES, random);
  const molar = molarMass(substance).mass;

  let given;
  let ask;
  let answerValue;
  let steps;

  if (subtype === 'massToMoles') {
    const mass = pick(NICE_MASSES, random);
    answerValue = mass / molar;
    given = { value: `${mass} g`, label: `Mass of ${substance}` };
    ask = { label: `Moles of ${substance}`, unit: 'mol' };
    steps = [
      `Molar mass of ${substance} = ${formatNumber(molar)} g/mol.`,
      `moles = mass ÷ molar mass = ${mass} g ÷ ${formatNumber(molar)} g/mol = ${formatNumber(answerValue)} mol.`
    ];
  } else if (subtype === 'molesToMass') {
    const moles = pick(NICE_MOLES, random);
    answerValue = moles * molar;
    given = { value: `${moles} mol`, label: `Moles of ${substance}` };
    ask = { label: `Mass of ${substance}`, unit: 'g' };
    steps = [
      `Molar mass of ${substance} = ${formatNumber(molar)} g/mol.`,
      `mass = moles × molar mass = ${moles} mol × ${formatNumber(molar)} g/mol = ${formatNumber(answerValue)} g.`
    ];
  } else if (subtype === 'molesToParticles') {
    const moles = pick(NICE_MOLES, random);
    answerValue = moles * AVOGADRO;
    given = { value: `${moles} mol`, label: `Moles of ${substance}` };
    ask = { label: `Number of formula units of ${substance}`, unit: 'particles' };
    steps = [
      `Use Avogadro’s number, 6.022 × 10²³ particles/mol.`,
      `particles = moles × 6.022 × 10²³ = ${moles} × 6.022 × 10²³ = ${formatNumber(answerValue)} particles.`
    ];
  } else if (subtype === 'particlesToMoles') {
    const moles = pick(NICE_MOLES, random);
    const particles = moles * AVOGADRO;
    answerValue = moles;
    given = { value: `${formatNumber(particles)} particles`, label: `Formula units of ${substance}` };
    ask = { label: `Moles of ${substance}`, unit: 'mol' };
    steps = [
      `Use Avogadro’s number, 6.022 × 10²³ particles/mol.`,
      `moles = particles ÷ 6.022 × 10²³ = ${formatNumber(particles)} ÷ 6.022 × 10²³ = ${formatNumber(answerValue)} mol.`
    ];
  } else if (subtype === 'molesToVolume') {
    const moles = pick(NICE_MOLES, random);
    answerValue = moles * MOLAR_VOLUME;
    given = { value: `${moles} mol`, label: `Moles of ${substance} gas` };
    ask = { label: `Volume of ${substance} at STP`, unit: 'L' };
    steps = [
      `At STP (0 °C, 1 atm), one mole of gas occupies 22.4 L.`,
      `volume = moles × 22.4 L/mol = ${moles} mol × 22.4 L/mol = ${formatNumber(answerValue)} L.`
    ];
  } else {
    const mass = pick(NICE_MASSES, random);
    const moles = mass / molar;
    answerValue = moles * AVOGADRO;
    given = { value: `${mass} g`, label: `Mass of ${substance}` };
    ask = { label: `Number of formula units of ${substance}`, unit: 'particles' };
    steps = [
      `Molar mass of ${substance} = ${formatNumber(molar)} g/mol.`,
      `moles = ${mass} g ÷ ${formatNumber(molar)} g/mol = ${formatNumber(moles)} mol.`,
      `particles = ${formatNumber(moles)} mol × 6.022 × 10²³ = ${formatNumber(answerValue)} particles.`
    ];
  }

  return {
    mode: 'convert',
    substance,
    subtype,
    molarMass: molar,
    given,
    ask,
    answerValue,
    solution: {
      summary: `${substance} — ${ask.label}.`,
      steps
    }
  };
}

// ---------------------------------------------------------- limiting reagent ---

const MASS_POOL = [1, 2, 4, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100];

function buildLimiting(random) {
  const twoReactant = REACTIONS.filter((reaction) => reaction.reactants.length === 2);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const reaction = pick(twoReactant, random);
    const balance = balanceEquation(reaction.reactants, reaction.products);
    if (balance.error) continue;
    const coefficients = balance.coefficients;
    const productIndex = randomInt(0, reaction.products.length - 1, random);
    const product = reaction.products[productIndex];
    const productCoefficient = coefficients[reaction.reactants.length + productIndex];
    const masses = reaction.reactants.map(() => pick(MASS_POOL, random));

    const reactants = reaction.reactants.map((formula, index) => {
      const mm = molarMass(formula).mass;
      const moles = masses[index] / mm;
      const productMoles = (moles * productCoefficient) / coefficients[index];
      return { formula, mass: masses[index], molarMass: mm, moles, productMoles };
    });

    const productMoles = reactants.map((entry) => entry.productMoles);
    const minMoles = Math.min(...productMoles);
    const maxMoles = Math.max(...productMoles);
    // Require a clear winner so "the limiting reagent" is unambiguous.
    if (maxMoles - minMoles < 0.02 * maxMoles) continue;

    const limitingIndex = productMoles.indexOf(minMoles);
    const theoreticalMoles = minMoles;
    const theoreticalMass = theoreticalMoles * molarMass(product).mass;

    return {
      reaction,
      coefficients,
      reactants: reactants.map((entry, index) => ({ ...entry, isLimiting: index === limitingIndex })),
      product,
      productCoefficient,
      limiting: reactants[limitingIndex].formula,
      theoreticalMoles,
      theoreticalMass
    };
  }
  return null;
}

function limitingSteps(base) {
  const steps = [`Balanced equation: ${formatEquation(base.reaction.reactants, base.reaction.products, base.coefficients)}.`];
  for (const entry of base.reactants) {
    steps.push(
      `${entry.formula}: ${entry.mass} g ÷ ${formatNumber(entry.molarMass)} g/mol = ${formatNumber(entry.moles)} mol; ` +
      `× (${base.productCoefficient} mol ${base.product} ÷ ${base.coefficients[base.reaction.reactants.indexOf(entry.formula)]} mol ${entry.formula}) = ${formatNumber(entry.productMoles)} mol ${base.product}.`
    );
  }
  steps.push(
    `The smaller amount of ${base.product} comes from ${base.limiting}, so ${base.limiting} is limiting.`
  );
  steps.push(
    `Theoretical yield = ${formatNumber(base.theoreticalMoles)} mol × ${formatNumber(molarMass(base.product).mass)} g/mol = ${formatNumber(base.theoreticalMass)} g ${base.product}.`
  );
  return steps;
}

function generateLimitingProblem(random) {
  const base = buildLimiting(random);
  if (!base) return null;
  return {
    mode: 'limiting',
    reactants: base.reactants,
    product: base.product,
    limiting: base.limiting,
    theoreticalMass: base.theoreticalMass,
    theoreticalMoles: base.theoreticalMoles,
    equation: formatEquation(base.reaction.reactants, base.reaction.products, base.coefficients),
    solution: {
      summary: `${base.limiting} is limiting; theoretical yield of ${base.product} is ${formatNumber(base.theoreticalMass)} g.`,
      steps: limitingSteps(base)
    }
  };
}

// ------------------------------------------------------------ percent yield ---

function generateYieldProblem(random) {
  const base = buildLimiting(random);
  if (!base) return null;
  const variant = random() < 0.5 ? 'percent' : 'actual';
  const theoreticalMass = base.theoreticalMass;
  const equation = formatEquation(base.reaction.reactants, base.reaction.products, base.coefficients);

  if (variant === 'percent') {
    const factor = 0.5 + random() * 0.45;
    const actualMass = Number((theoreticalMass * factor).toPrecision(3));
    const answerValue = (actualMass / theoreticalMass) * 100;
    return {
      mode: 'yield',
      variant: 'percent',
      product: base.product,
      equation,
      theoreticalMass,
      actualMass,
      answerValue,
      solution: {
        summary: `Percent yield = ${formatNumber(answerValue)}%.`,
        steps: [
          `Balanced equation: ${equation}.`,
          `Theoretical yield of ${base.product} = ${formatNumber(theoreticalMass)} g.`,
          `Percent yield = (actual ÷ theoretical) × 100 = (${formatNumber(actualMass)} g ÷ ${formatNumber(theoreticalMass)} g) × 100 = ${formatNumber(answerValue)}%.`
        ]
      }
    };
  }

  const percent = randomInt(55, 98, random);
  const answerValue = theoreticalMass * (percent / 100);
  return {
    mode: 'yield',
    variant: 'actual',
    product: base.product,
    equation,
    theoreticalMass: theoreticalMass,
    percent,
    answerValue,
    solution: {
      summary: `Actual yield = ${formatNumber(answerValue)} g ${base.product}.`,
      steps: [
        `Balanced equation: ${equation}.`,
        `Theoretical yield of ${base.product} = ${formatNumber(theoreticalMass)} g.`,
        `Actual yield = (percent yield ÷ 100) × theoretical = (${percent} ÷ 100) × ${formatNumber(theoreticalMass)} g = ${formatNumber(answerValue)} g.`
      ]
    }
  };
}

// ------------------------------------------------------------- nomenclature ---

function generateNomenclatureProblem(level, random) {
  const cationPool = IONS.filter((ion) => ion.charge > 0 && (level === 'state' || ion.level === 'regional'));
  const anionPool = IONS.filter((ion) => ion.charge < 0 && (level === 'state' || ion.level === 'regional'));
  const cation = pick(cationPool, random);
  const anion = pick(anionPool, random);
  const combined = combineIons(cation, anion);
  const direction = random() < 0.5 ? 'formulaFromName' : 'nameFromFormula';
  const chargePhrase = `${cation.name}${cation.romanNumeral ? ` (${romanNumeral(cation.charge)})` : ''} is ${cation.charge}+; ` +
    `${anion.name} is ${anion.charge}.`;

  return {
    mode: 'nomenclature',
    direction,
    name: combined.name,
    formula: combined.formula,
    solution: {
      summary: `${combined.name} — ${combined.formula}.`,
      steps: [
        chargePhrase,
        `Charges cross to neutralise: ${combined.cationCount} × ${cation.charge}+ and ${combined.anionCount} × ${anion.charge}.`,
        `Formula: ${combined.formula}; name: ${combined.name}.`
      ]
    }
  };
}

// ------------------------------------------------------------------ public ---

export function generateProblem(mode, { level = 'regional', random = Math.random } = {}) {
  if (mode === 'balance') {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const reaction = pick(REACTIONS, random);
      const balance = balanceEquation(reaction.reactants, reaction.products);
      if (balance.error) continue;
      const species = [
        ...reaction.reactants.map((formula) => ({ formula })),
        ...reaction.products.map((formula) => ({ formula }))
      ];
      return {
        mode: 'balance',
        label: reaction.label,
        species,
        reactantCount: reaction.reactants.length,
        coefficients: balance.coefficients,
        solution: {
          summary: formatEquation(reaction.reactants, reaction.products, balance.coefficients),
          steps: [
            `${reaction.label}.`,
            `Conserve each element across both sides to obtain: ${formatEquation(reaction.reactants, reaction.products, balance.coefficients)}.`,
            'Coefficients must be the smallest whole-number ratio.'
          ]
        }
      };
    }
    return null;
  }
  if (mode === 'convert') return generateConversionProblem(random);
  if (mode === 'limiting') return generateLimitingProblem(random);
  if (mode === 'yield') return generateYieldProblem(random);
  if (mode === 'nomenclature') return generateNomenclatureProblem(level, random);
  return null;
}

function normalizeName(value) {
  return String(value).toLowerCase().replace(/\s+/g, '').replace(/[.]/g, '');
}

function normalizeCoefficients(values) {
  const numbers = values.map((value) => Number(value));
  if (numbers.some((value) => !Number.isInteger(value) || value <= 0)) return null;
  let common = 0;
  for (const value of numbers) common = gcd(common, value);
  return numbers.map((value) => value / common);
}

function closeEnough(value, expected, relativeTolerance) {
  if (!Number.isFinite(value)) return false;
  const tolerance = Math.max(Math.abs(expected) * relativeTolerance, 1e-9);
  return Math.abs(value - expected) <= tolerance;
}

export function checkProblem(problem, answer) {
  if (!problem) return { correct: false, expected: '—' };

  if (problem.mode === 'balance') {
    const expected = problem.coefficients;
    const normalized = Array.isArray(answer) && answer.length === expected.length
      ? normalizeCoefficients(answer)
      : null;
    const target = normalizeCoefficients(expected);
    const correct = Boolean(normalized) && normalized.every((value, index) => value === target[index]);
    return { correct, expected: expected.join(', ') };
  }

  if (problem.mode === 'convert') {
    return {
      correct: closeEnough(parseFloat(answer), problem.answerValue, 0.02),
      expected: `${formatNumber(problem.answerValue)} ${problem.ask.unit}`
    };
  }

  if (problem.mode === 'limiting') {
    const limiting = answer && typeof answer === 'object' ? answer.limiting : '';
    const mass = answer && typeof answer === 'object' ? parseFloat(answer.mass) : NaN;
    const correct = limiting === problem.limiting && closeEnough(mass, problem.theoreticalMass, 0.02);
    return {
      correct,
      expected: `${problem.limiting} limiting; ${formatNumber(problem.theoreticalMass)} g ${problem.product}`
    };
  }

  if (problem.mode === 'yield') {
    const unit = problem.variant === 'percent' ? '%' : 'g';
    return {
      correct: closeEnough(parseFloat(answer), problem.answerValue, 0.02),
      expected: `${formatNumber(problem.answerValue)} ${unit}`
    };
  }

  if (problem.mode === 'nomenclature') {
    if (problem.direction === 'formulaFromName') {
      return { correct: formulasMatch(String(answer), problem.formula), expected: problem.formula };
    }
    return { correct: normalizeName(answer) === normalizeName(problem.name), expected: problem.name };
  }

  return { correct: false, expected: '—' };
}
