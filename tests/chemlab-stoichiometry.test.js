import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AVOGADRO,
  IONS,
  REACTIONS,
  balanceEquation,
  checkProblem,
  combineIons,
  formatEquation,
  formulasMatch,
  generateProblem,
  molarMass,
  parseFormula
} from '../src/components/events/chemlab/stoichiometry.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function findIon(formula, charge) {
  const ion = IONS.find((entry) => entry.formula === formula && entry.charge === charge);
  assert.ok(ion, `ion ${formula} (${charge}) should exist`);
  return ion;
}

function massBalanceHolds(reactants, products, coefficients) {
  const elements = new Set();
  const count = (formula) => {
    const parsed = parseFormula(formula);
    assert.ok(!parsed.error, `${formula} should parse`);
    for (const element of Object.keys(parsed.counts)) elements.add(element);
    return parsed.counts;
  };
  const left = reactants.map((formula) => ({ counts: count(formula), coeff: coefficients[reactants.indexOf(formula)] }));
  const right = products.map((formula, index) => ({ counts: count(formula), coeff: coefficients[reactants.length + index] }));
  for (const element of elements) {
    const leftTotal = left.reduce((sum, entry) => sum + (entry.counts[element] || 0) * entry.coeff, 0);
    const rightTotal = right.reduce((sum, entry) => sum + (entry.counts[element] || 0) * entry.coeff, 0);
    if (leftTotal !== rightTotal) return false;
  }
  return true;
}

test('parseFormula handles subscripts, parentheses and brackets', () => {
  assert.deepEqual(parseFormula('H2O').counts, { H: 2, O: 1 });
  assert.deepEqual(parseFormula('Ca(NO3)2').counts, { Ca: 1, N: 2, O: 6 });
  assert.deepEqual(parseFormula('Al2(SO4)3').counts, { Al: 2, S: 3, O: 12 });
  assert.deepEqual(parseFormula('[NH4]2SO4').counts, { N: 2, H: 8, S: 1, O: 4 });
  assert.deepEqual(parseFormula('CuSO4').counts, { Cu: 1, S: 1, O: 4 });
});

test('parseFormula reports clear errors', () => {
  assert.ok(parseFormula('').error);
  assert.ok(parseFormula('Xx2').error);
  assert.ok(parseFormula('H2O)').error);
  assert.ok(parseFormula('(H2O').error);
});

test('molarMass matches standard atomic weights', () => {
  assert.ok(Math.abs(molarMass('H2O').mass - 18.015) < 0.02);
  assert.ok(Math.abs(molarMass('NaCl').mass - 58.44) < 0.02);
  assert.ok(Math.abs(molarMass('(NH4)2SO4').mass - 132.14) < 0.05);
});

test('formulasMatch compares composition, not spelling', () => {
  assert.equal(formulasMatch('CH3COO', 'C2H3O2'), true);
  assert.equal(formulasMatch('NaCl', 'ClNa'), true);
  assert.equal(formulasMatch('NaCl', 'NaCl2'), false);
  assert.equal(formulasMatch('nope', 'NaCl'), false);
});

test('combineIons crosses charge and reduces to the smallest whole formula', () => {
  const sodium = findIon('Na', 1);
  const chloride = findIon('Cl', -1);
  const calcium = findIon('Ca', 2);
  const oxide = findIon('O', -2);
  const aluminum = findIon('Al', 3);
  const ammonium = findIon('NH4', 1);
  const sulfate = findIon('SO4', -2);
  const magnesium = findIon('Mg', 2);

  assert.equal(combineIons(sodium, chloride).formula, 'NaCl');
  assert.equal(combineIons(sodium, chloride).name, 'sodium chloride');
  assert.equal(combineIons(calcium, chloride).formula, 'CaCl2');
  assert.equal(combineIons(aluminum, oxide).formula, 'Al2O3');
  assert.equal(combineIons(magnesium, sulfate).formula, 'MgSO4');
  assert.equal(combineIons(ammonium, sulfate).formula, '(NH4)2SO4');
  assert.equal(combineIons(ammonium, sulfate).name, 'ammonium sulfate');
});

test('combineIons uses Stock Roman numerals only for variable-charge metals', () => {
  const copperTwo = findIon('Cu', 2);
  const copperOne = findIon('Cu', 1);
  const ironThree = findIon('Fe', 3);
  const silver = findIon('Ag', 1);
  const chloride = findIon('Cl', -1);

  assert.equal(combineIons(copperTwo, chloride).name, 'copper(II) chloride');
  assert.equal(combineIons(copperOne, chloride).formula, 'CuCl');
  assert.equal(combineIons(ironThree, chloride).formula, 'FeCl3');
  assert.equal(combineIons(ironThree, chloride).name, 'iron(III) chloride');
  assert.equal(combineIons(silver, chloride).name, 'silver chloride');
});

test('balanceEquation finds the smallest positive integer coefficients', () => {
  assert.deepEqual(balanceEquation(['CH4', 'O2'], ['CO2', 'H2O']).coefficients, [1, 2, 1, 2]);
  assert.deepEqual(balanceEquation(['Fe', 'O2'], ['Fe2O3']).coefficients, [4, 3, 2]);
  assert.deepEqual(balanceEquation(['H2SO4', 'NaOH'], ['Na2SO4', 'H2O']).coefficients, [1, 2, 1, 2]);
  assert.deepEqual(balanceEquation(['NaHCO3'], ['Na2CO3', 'H2O', 'CO2']).coefficients, [2, 1, 1, 1]);
  assert.equal(
    formatEquation(['CH4', 'O2'], ['CO2', 'H2O'], [1, 2, 1, 2]),
    'CH4 + 2 O2 \u2192 CO2 + 2 H2O'
  );
});

test('every curated reaction balances with positive integers and conserves mass', () => {
  for (const reaction of REACTIONS) {
    const result = balanceEquation(reaction.reactants, reaction.products);
    assert.ok(!result.error, `${reaction.label} should balance`);
    assert.equal(result.coefficients.length, reaction.reactants.length + reaction.products.length);
    assert.ok(result.coefficients.every((value) => Number.isInteger(value) && value > 0), `${reaction.label} coefficients`);
    assert.ok(massBalanceHolds(reaction.reactants, reaction.products, result.coefficients), `${reaction.label} mass balance`);
  }
});

test('generated problems accept their own answer and reject a wrong one', () => {
  const modes = ['balance', 'convert', 'limiting', 'yield', 'nomenclature'];
  for (const mode of modes) {
    const random = mulberry32(mode.length * 7919 + 3);
    for (let index = 0; index < 25; index += 1) {
      const problem = generateProblem(mode, { level: index % 2 === 0 ? 'regional' : 'state', random });
      assert.ok(problem, `${mode} should generate a problem`);

      const key = (() => {
        if (mode === 'balance') return problem.coefficients.map(String);
        if (mode === 'convert') return String(problem.answerValue);
        if (mode === 'limiting') return { limiting: problem.limiting, mass: String(problem.theoreticalMass) };
        if (mode === 'yield') return String(problem.answerValue);
        return problem.direction === 'formulaFromName' ? problem.formula : problem.name;
      })();
      assert.equal(checkProblem(problem, key).correct, true, `${mode} should mark its key correct`);

      const wrong = (() => {
        if (mode === 'balance') return problem.coefficients.map((value, i) => (i === 0 ? value + 1 : value));
        if (mode === 'convert') return String(problem.answerValue * 1.5 + 1);
        if (mode === 'limiting') {
          const other = problem.reactants.find((entry) => entry.formula !== problem.limiting);
          return { limiting: other.formula, mass: String(problem.theoreticalMass * 3) };
        }
        if (mode === 'yield') return String(problem.answerValue * 1.5 + 1);
        return problem.direction === 'formulaFromName' ? 'Zzz9' : 'not a compound';
      })();
      assert.equal(checkProblem(problem, wrong).correct, false, `${mode} should mark a wrong answer incorrect`);
      assert.ok(problem.solution && problem.solution.steps.length > 0, `${mode} should carry a worked solution`);
    }
  }
});

test('regional nomenclature stays within the Regional ion list', () => {
  const stateOnly = new Set(
    IONS.filter((ion) => ion.level === 'state').map((ion) => ion.name)
  );
  const random = mulberry32(2027);
  for (let index = 0; index < 60; index += 1) {
    const problem = generateProblem('nomenclature', { level: 'regional', random });
    const used = problem.name.split(/[()\s]+/).filter(Boolean);
    for (const token of used) {
      assert.equal(stateOnly.has(token), false, `regional problem should not use "${token}"`);
    }
  }
});

test('conversion answers are physically consistent', () => {
  const random = mulberry32(99);
  for (let index = 0; index < 40; index += 1) {
    const problem = generateProblem('convert', { random });
    const molar = molarMass(problem.substance).mass;
    if (problem.subtype === 'massToMoles') {
      const mass = parseFloat(problem.given.value);
      assert.ok(Math.abs(problem.answerValue - mass / molar) < 1e-9);
    }
    if (problem.subtype === 'molesToParticles') {
      const moles = parseFloat(problem.given.value);
      assert.ok(Math.abs(problem.answerValue - moles * AVOGADRO) < 1);
    }
  }
});
