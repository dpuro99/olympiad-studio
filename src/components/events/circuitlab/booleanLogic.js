const MAX_VARIABLES = 4;

export const GATES = {
  AND: { label: 'AND', inputs: 2, symbol: '·', expression: 'A · B', evaluate: (a, b) => (a && b ? 1 : 0) },
  OR: { label: 'OR', inputs: 2, symbol: '+', expression: 'A + B', evaluate: (a, b) => (a || b ? 1 : 0) },
  NOT: { label: 'NOT', inputs: 1, symbol: '‾', expression: "A'", evaluate: (a) => (a ? 0 : 1) },
  NAND: { label: 'NAND', inputs: 2, universal: true, symbol: '↑', expression: '(A · B)\u2032', evaluate: (a, b) => (a && b ? 0 : 1) },
  NOR: { label: 'NOR', inputs: 2, universal: true, symbol: '↓', expression: '(A + B)\u2032', evaluate: (a, b) => (a || b ? 0 : 1) },
  XOR: { label: 'XOR', inputs: 2, symbol: '⊕', expression: 'A ⊕ B', evaluate: (a, b) => (a !== b ? 1 : 0) },
  XNOR: { label: 'XNOR', inputs: 2, symbol: '⊙', expression: '(A ⊕ B)\u2032', evaluate: (a, b) => (a === b ? 1 : 0) }
};

function tokenize(input) {
  const source = input.toUpperCase();
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) { i += 1; continue; }
    if (ch === '(' || ch === ')') { tokens.push({ type: ch }); i += 1; continue; }
    if (ch === "'" || ch === '!' || ch === '~' || ch === '\u2032') { tokens.push({ type: 'NOT' }); i += 1; continue; }
    if (ch === '&') { tokens.push({ type: 'AND' }); i += source[i + 1] === '&' ? 2 : 1; continue; }
    if (ch === '|') { tokens.push({ type: 'OR' }); i += source[i + 1] === '|' ? 2 : 1; continue; }
    if (ch === '*' || ch === '\u00b7' || ch === '.') { tokens.push({ type: 'AND' }); i += 1; continue; }
    if (ch === '+') { tokens.push({ type: 'OR' }); i += 1; continue; }
    if (ch === '^') { tokens.push({ type: 'XOR' }); i += 1; continue; }
    if (ch === '\u2295') { tokens.push({ type: 'XOR' }); i += 1; continue; }
    if (/[A-Z]/.test(ch)) {
      let j = i;
      while (j < source.length && /[A-Z]/.test(source[j])) j += 1;
      const word = source.slice(i, j);
      if (word === 'AND' || word === 'OR' || word === 'NOT' || word === 'XOR') {
        tokens.push({ type: word });
      } else if (word.length === 1) {
        tokens.push({ type: 'VAR', name: word });
      } else {
        return { error: `Unrecognized term "${word}". Use variable letters A\u2013D with the operators AND, OR, NOT, XOR.` };
      }
      i = j;
      continue;
    }
    return { error: `Unexpected character "${ch}". Use variables A\u2013D with AND, OR, NOT, XOR and parentheses.` };
  }
  return { tokens };
}

function parseTokens(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];

  const parsePrimary = () => {
    const token = peek();
    if (!token) throw new Error('Unexpected end of expression.');
    if (token.type === 'VAR') { pos += 1; return { op: 'VAR', name: token.name }; }
    if (token.type === '(') {
      pos += 1;
      const node = parseOr();
      if (!peek() || peek().type !== ')') throw new Error('Missing closing parenthesis.');
      pos += 1;
      return node;
    }
    throw new Error('Expected a variable or "(" in the expression.');
  };

  const parseUnary = () => {
    if (peek() && peek().type === 'NOT') { pos += 1; return { op: 'NOT', operand: parseUnary() }; }
    let node = parsePrimary();
    while (peek() && peek().type === 'NOT') { pos += 1; node = { op: 'NOT', operand: node }; }
    return node;
  };

  const parseAnd = () => {
    let node = parseUnary();
    while (peek() && peek().type === 'AND') { pos += 1; node = { op: 'AND', left: node, right: parseUnary() }; }
    return node;
  };

  const parseXor = () => {
    let node = parseAnd();
    while (peek() && peek().type === 'XOR') { pos += 1; node = { op: 'XOR', left: node, right: parseAnd() }; }
    return node;
  };

  const parseOr = () => {
    let node = parseXor();
    while (peek() && peek().type === 'OR') { pos += 1; node = { op: 'OR', left: node, right: parseXor() }; }
    return node;
  };

  const ast = parseOr();
  if (pos !== tokens.length) throw new Error('Unexpected trailing input. Separate terms with an operator.');
  return ast;
}

export function parseExpression(expression) {
  if (typeof expression !== 'string' || expression.trim() === '') {
    return { error: 'Enter a Boolean expression.' };
  }
  const { tokens, error } = tokenize(expression);
  if (error) return { error };
  if (tokens.length === 0) return { error: 'Enter a Boolean expression.' };
  try {
    const ast = parseTokens(tokens);
    const variables = [...collectVariables(ast)].sort();
    if (variables.length > MAX_VARIABLES) {
      return { error: `This workbench supports up to ${MAX_VARIABLES} variables (A\u2013D).` };
    }
    if (variables.length === 0) {
      return { error: 'Use at least one variable (A\u2013D).' };
    }
    return { ast, variables };
  } catch (err) {
    return { error: err.message };
  }
}

function collectVariables(ast, set = new Set()) {
  if (!ast) return set;
  if (ast.op === 'VAR') set.add(ast.name);
  if (ast.operand) collectVariables(ast.operand, set);
  if (ast.left) collectVariables(ast.left, set);
  if (ast.right) collectVariables(ast.right, set);
  return set;
}

export function evaluateAst(ast, assignment) {
  switch (ast.op) {
    case 'VAR': return assignment[ast.name] ? 1 : 0;
    case 'NOT': return evaluateAst(ast.operand, assignment) ? 0 : 1;
    case 'AND': return evaluateAst(ast.left, assignment) && evaluateAst(ast.right, assignment) ? 1 : 0;
    case 'OR': return evaluateAst(ast.left, assignment) || evaluateAst(ast.right, assignment) ? 1 : 0;
    case 'XOR': return evaluateAst(ast.left, assignment) !== evaluateAst(ast.right, assignment) ? 1 : 0;
    default: return 0;
  }
}

function buildAssignments(variables) {
  const rows = 2 ** variables.length;
  const assignments = [];
  for (let index = 0; index < rows; index += 1) {
    const assignment = {};
    variables.forEach((name, position) => {
      assignment[name] = (index >> (variables.length - 1 - position)) & 1;
    });
    assignments.push(assignment);
  }
  return assignments;
}

export function generateTruthTable(expression) {
  const parsed = parseExpression(expression);
  if (parsed.error) return { error: parsed.error };
  const { ast, variables } = parsed;
  const rows = buildAssignments(variables).map((assignment) => ({
    inputs: assignment,
    output: evaluateAst(ast, assignment)
  }));
  return { expression, variables, rows };
}

export function canonicalSumOfProducts(expression) {
  const table = generateTruthTable(expression);
  if (table.error) return table;
  const { variables, rows } = table;
  const ones = rows.filter((row) => row.output === 1);
  if (ones.length === 0) return { form: '0', minterms: [] };
  if (ones.length === rows.length) return { form: '1', minterms: rows.map((_, index) => index) };
  const terms = ones.map((row) => variables
    .map((name) => (row.inputs[name] === 1 ? name : `${name}\u2032`))
    .join(' \u00b7 '));
  const minterms = ones.map((row) => parseInt(variables.map((name) => row.inputs[name]).join(''), 2));
  return { form: terms.join('  +  '), minterms };
}

export function expressionsEquivalent(expressionA, expressionB) {
  const first = parseExpression(expressionA);
  if (first.error) return { error: `First expression: ${first.error}` };
  const second = parseExpression(expressionB);
  if (second.error) return { error: `Second expression: ${second.error}` };
  const variables = [...new Set([...first.variables, ...second.variables])].sort();
  if (variables.length > MAX_VARIABLES) {
    return { error: `This workbench supports up to ${MAX_VARIABLES} variables (A\u2013D).` };
  }
  const rows = buildAssignments(variables).map((assignment) => ({
    inputs: assignment,
    a: evaluateAst(first.ast, assignment),
    b: evaluateAst(second.ast, assignment)
  }));
  const difference = rows.find((row) => row.a !== row.b) || null;
  return { equivalent: difference === null, variables, rows, difference };
}

export function gateTruthTable(gateId) {
  const gate = GATES[gateId];
  if (!gate) return { error: `Unknown gate "${gateId}".` };
  const variables = gate.inputs === 1 ? ['A'] : ['A', 'B'];
  const rows = buildAssignments(variables).map((assignment) => ({
    inputs: assignment,
    output: gate.inputs === 1
      ? gate.evaluate(assignment.A)
      : gate.evaluate(assignment.A, assignment.B)
  }));
  return { gate: gateId, label: gate.label, universal: Boolean(gate.universal), variables, rows };
}

const GUIDED_CIRCUITS = {
  'half-adder': {
    label: 'Half adder',
    variables: ['A', 'B'],
    note: 'Adds two 1-bit inputs: Sum = A ⊕ B, Carry = A · B. Manual §3.c.viii / §3.e.iii.',
    outputs: [
      { label: 'Sum', expression: 'A XOR B' },
      { label: 'Carry', expression: 'A AND B' }
    ]
  },
  'full-adder': {
    label: 'Full adder',
    variables: ['A', 'B', 'C'],
    note: 'Adds two 1-bit inputs (A, B) plus a carry-in (C), producing Sum and Carry-out. Manual §3.c.viii / §3.e.iii.',
    outputs: [
      { label: 'Sum', expression: 'A XOR B XOR C' },
      { label: 'Carry', expression: '(A AND B) OR (C AND (A XOR B))' }
    ]
  },
  'mux-2-1': {
    label: '2:1 multiplexer',
    variables: ['A', 'B', 'S'],
    note: 'Selects input A when S = 0 and input B when S = 1: Y = (A · S‾) + (B · S). Manual §3.c.viii.',
    outputs: [
      { label: 'Y', expression: '(A AND NOT S) OR (B AND S)' }
    ]
  }
};

export function guidedCircuit(kind) {
  const definition = GUIDED_CIRCUITS[kind];
  if (!definition) return { error: `Unknown circuit "${kind}".` };
  const parsedOutputs = definition.outputs.map((output) => {
    const parsed = parseExpression(output.expression);
    if (parsed.error) return { error: parsed.error };
    return { ...output, ast: parsed.ast };
  });
  const failure = parsedOutputs.find((output) => output.error);
  if (failure) return { error: failure.error };
  const rows = buildAssignments(definition.variables).map((assignment) => ({
    inputs: assignment,
    values: Object.fromEntries(parsedOutputs.map((output) => [output.label, evaluateAst(output.ast, assignment)]))
  }));
  return {
    kind,
    label: definition.label,
    note: definition.note,
    variables: definition.variables,
    outputs: definition.outputs.map(({ label, expression }) => ({ label, expression })),
    rows
  };
}

export const GUIDED_CIRCUIT_IDS = Object.keys(GUIDED_CIRCUITS);
export const GATE_IDS = Object.keys(GATES);
export { MAX_VARIABLES };

// ---------------------------------------------------------------------------
// Karnaugh-map minimization (Quine–McCluskey over at most four variables)
// ---------------------------------------------------------------------------

function variableLetters(count) {
  return Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index));
}

function onesCount(value) {
  let count = 0;
  let remaining = value;
  while (remaining) { count += remaining & 1; remaining >>= 1; }
  return count;
}

function literalCount(term, count) {
  return count - onesCount(term.mask);
}

function termCoversMinterm(term, minterm) {
  return (minterm & ~term.mask) === term.value;
}

function termLabel(term, variables) {
  const count = variables.length;
  const literals = [];
  for (let position = 0; position < count; position += 1) {
    const bitPosition = count - 1 - position;
    if ((term.mask >> bitPosition) & 1) continue;
    const bit = (term.value >> bitPosition) & 1;
    literals.push(bit === 1 ? variables[position] : `${variables[position]}\u2032`);
  }
  return literals.length ? literals.join(' \u00b7 ') : '1';
}

function chooseMinimumCover(onSet, primeList, coverage, count) {
  const primeCount = primeList.length;
  if (primeCount === 0) return [];
  if (primeCount > 20) {
    return primeList.map((_, index) => index);
  }
  let best = null;
  const limit = 1 << primeCount;
  for (let mask = 1; mask < limit; mask += 1) {
    const size = onesCount(mask);
    if (best && size > best.size) continue;
    const covered = new Set();
    let literals = 0;
    for (let index = 0; index < primeCount; index += 1) {
      if (!(mask & (1 << index))) continue;
      coverage[index].forEach((minterm) => covered.add(minterm));
      literals += literalCount(primeList[index], count);
    }
    if (covered.size !== onSet.length) continue;
    if (!best || size < best.size || (size === best.size && literals < best.literals)) {
      best = { size, literals, mask };
    }
  }
  if (!best) return primeList.map((_, index) => index);
  const indices = [];
  for (let index = 0; index < primeCount; index += 1) {
    if (best.mask & (1 << index)) indices.push(index);
  }
  return indices;
}

function minimizeMinterms(variables, minterms) {
  const count = variables.length;
  const total = 2 ** count;
  const onSet = [...new Set(minterms)].filter((minterm) => minterm >= 0 && minterm < total).sort((a, b) => a - b);
  if (onSet.length === 0) return { minterms: [], implicants: [], form: '0' };
  if (onSet.length === total) {
    return { minterms: onSet, implicants: [{ mask: total - 1, value: 0, covered: onSet.slice() }], form: '1' };
  }

  let current = onSet.map((minterm) => ({ mask: 0, value: minterm }));
  const primeMap = new Map();
  while (current.length) {
    const used = new Array(current.length).fill(false);
    const combined = [];
    const seen = new Set();
    for (let a = 0; a < current.length; a += 1) {
      for (let b = a + 1; b < current.length; b += 1) {
        const first = current[a];
        const second = current[b];
        if (first.mask !== second.mask) continue;
        const difference = first.value ^ second.value;
        if (difference !== 0 && (difference & (difference - 1)) === 0) {
          used[a] = true;
          used[b] = true;
          const mask = first.mask | difference;
          const value = first.value & ~difference;
          const key = `${mask}:${value}`;
          if (!seen.has(key)) { seen.add(key); combined.push({ mask, value }); }
        }
      }
    }
    current.forEach((term, index) => {
      if (!used[index]) primeMap.set(`${term.mask}:${term.value}`, term);
    });
    current = combined;
  }

  const primeList = [...primeMap.values()];
  const coverage = primeList.map((term) => new Set(onSet.filter((minterm) => termCoversMinterm(term, minterm))));
  const chosen = chooseMinimumCover(onSet, primeList, coverage, count);
  const implicants = chosen.map((index) => ({
    mask: primeList[index].mask,
    value: primeList[index].value,
    covered: [...coverage[index]].sort((a, b) => a - b)
  }));
  implicants.sort((a, b) => {
    const literals = literalCount(a, count) - literalCount(b, count);
    if (literals !== 0) return literals;
    const labelA = termLabel(a, variables);
    const labelB = termLabel(b, variables);
    return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
  });
  const labeled = implicants.map((term) => ({ ...term, label: termLabel(term, variables) }));
  const form = labeled.map((term) => term.label).join('  +  ');
  return { minterms: onSet, implicants: labeled, form };
}

export function kmapMinimize(expression) {
  const table = generateTruthTable(expression);
  if (table.error) return table;
  const { variables, rows } = table;
  const minterms = rows
    .filter((row) => row.output === 1)
    .map((row) => parseInt(variables.map((name) => row.inputs[name]).join(''), 2));
  return { variables, ...minimizeMinterms(variables, minterms) };
}

function axisBits(width) {
  if (width <= 1) return [0, 1];
  return [0, 1, 3, 2];
}

export function kmapLayout(count) {
  const variables = variableLetters(count);
  let rowVars;
  let colVars;
  if (count === 1) { rowVars = []; colVars = [0]; }
  else if (count === 2) { rowVars = [0]; colVars = [1]; }
  else if (count === 3) { rowVars = [0]; colVars = [1, 2]; }
  else { rowVars = [0, 1]; colVars = [2, 3]; }

  const bitsFor = (vars) => (vars.length <= 1 ? [0, 1] : axisBits(vars.length));
  const rowBits = rowVars.length === 0 ? [0] : bitsFor(rowVars);
  const colBits = bitsFor(colVars);
  const project = (vars, bits) => {
    let value = 0;
    vars.forEach((position, index) => {
      value |= ((bits >> (vars.length - 1 - index)) & 1) << (count - 1 - position);
    });
    return value;
  };
  const label = (vars, bits) => vars
    .map((position, index) => `${variables[position]}=${(bits >> (vars.length - 1 - index)) & 1}`)
    .join(', ');

  const rows = rowBits.map((rowBitsValue) => ({
    label: rowVars.length ? label(rowVars, rowBitsValue) : '',
    cells: colBits.map((colBitsValue) => project(rowVars, rowBitsValue) | project(colVars, colBitsValue))
  }));
  return {
    variables,
    rowVars,
    colVars,
    rows,
    colLabels: colBits.map((bits) => label(colVars, bits)),
    hasRowLabels: rowVars.length > 0
  };
}

// ---------------------------------------------------------------------------
// Custom multi-output truth table
// ---------------------------------------------------------------------------

export function multiOutputTruthTable(outputs) {
  if (!Array.isArray(outputs) || outputs.length === 0) {
    return { error: 'Add at least one output.' };
  }
  const labels = new Set();
  const parsedList = [];
  for (let index = 0; index < outputs.length; index += 1) {
    const output = outputs[index];
    const label = (output.label || '').trim() || `Y${index + 1}`;
    if (labels.has(label)) return { error: `Duplicate output name "${label}".` };
    labels.add(label);
    const parsed = parseExpression(output.expression);
    if (parsed.error) return { error: `${label}: ${parsed.error}` };
    parsedList.push({ label, expression: output.expression, ast: parsed.ast, variables: parsed.variables });
  }
  const variables = [...new Set(parsedList.flatMap((entry) => entry.variables))].sort();
  if (variables.length > MAX_VARIABLES) {
    return { error: `This workbench supports up to ${MAX_VARIABLES} variables (A\u2013D).` };
  }
  const rows = buildAssignments(variables).map((assignment) => ({
    inputs: assignment,
    values: Object.fromEntries(parsedList.map((entry) => [entry.label, evaluateAst(entry.ast, assignment)]))
  }));
  return { variables, outputs: parsedList.map((entry) => entry.label), rows };
}

// ---------------------------------------------------------------------------
// Generated practice drill (minimization / minterm recall)
// ---------------------------------------------------------------------------

function canonicalTerm(variables, minterm) {
  const count = variables.length;
  const literals = [];
  for (let position = 0; position < count; position += 1) {
    const bit = (minterm >> (count - 1 - position)) & 1;
    literals.push(bit === 1 ? variables[position] : `${variables[position]}\u2032`);
  }
  return literals.join(' \u00b7 ');
}

function expressionFromMinterms(variables, onSet) {
  const total = 2 ** variables.length;
  if (onSet.length === 0) return '0';
  if (onSet.length === total) return '1';
  return onSet.map((minterm) => canonicalTerm(variables, minterm)).join('  +  ');
}

function formFromTerms(variables, terms) {
  if (!terms.length) return '0';
  return terms.map((term) => termLabel(term, variables)).join('  +  ');
}

function termsCoverMinterm(terms, minterm) {
  return terms.some((term) => termCoversMinterm(term, minterm));
}

function termsEquivalent(first, second, total) {
  for (let minterm = 0; minterm < total; minterm += 1) {
    if (termsCoverMinterm(first, minterm) !== termsCoverMinterm(second, minterm)) return false;
  }
  return true;
}

function buildDrillOptions(variables, onSet, minimized, random) {
  const count = variables.length;
  const total = 2 ** count;
  const onSetSet = new Set(onSet);
  const correctTerms = minimized.implicants.map((term) => ({ mask: term.mask, value: term.value }));
  const options = [{ label: minimized.form, correct: true }];
  const candidates = [];
  correctTerms.forEach((_, index) => candidates.push(correctTerms.filter((__, other) => other !== index)));
  for (let minterm = 0; minterm < total; minterm += 1) {
    if (!onSetSet.has(minterm)) candidates.push([...correctTerms, { mask: 0, value: minterm }]);
  }
  for (const term of correctTerms) {
    for (let bitPosition = 0; bitPosition < count; bitPosition += 1) {
      if ((term.mask >> bitPosition) & 1) continue;
      const flipped = { mask: term.mask, value: term.value ^ (1 << bitPosition) };
      candidates.push([...correctTerms.filter((entry) => entry !== term), flipped]);
    }
  }
  const seen = new Set([minimized.form]);
  for (const terms of candidates) {
    if (options.length >= 4) break;
    const label = formFromTerms(variables, terms);
    if (seen.has(label) || termsEquivalent(terms, correctTerms, total)) continue;
    seen.add(label);
    options.push({ label, correct: false });
  }
  const fillers = ['0', '1', ...variables, ...variables.map((name) => `${name}\u2032`)];
  for (const filler of fillers) {
    if (options.length >= 4) break;
    if (seen.has(filler)) continue;
    let terms;
    if (filler === '0') terms = [];
    else if (filler === '1') terms = [{ mask: total - 1, value: 0 }];
    else {
      const complemented = filler.includes('\u2032');
      const position = variables.indexOf(complemented ? filler.slice(0, -1) : filler);
      const bitPosition = count - 1 - position;
      const bit = complemented ? 0 : 1;
      terms = [{ mask: (total - 1) ^ (1 << bitPosition), value: bit << bitPosition }];
    }
    if (termsEquivalent(terms, correctTerms, total)) continue;
    seen.add(filler);
    options.push({ label: filler, correct: false });
  }
  for (let index = options.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [options[index], options[swap]] = [options[swap], options[index]];
  }
  return options;
}

export function generateDrill(random = Math.random) {
  const count = random() < 0.5 ? 2 : 3;
  const variables = variableLetters(count);
  const total = 2 ** count;
  let onSet;
  do {
    onSet = [];
    for (let minterm = 0; minterm < total; minterm += 1) {
      if (random() < 0.5) onSet.push(minterm);
    }
  } while (onSet.length === 0 || onSet.length === total);

  const minimized = minimizeMinterms(variables, onSet);
  const expression = expressionFromMinterms(variables, onSet);
  const type = random() < 0.5 ? 'minterms' : 'choice';
  if (type === 'choice') {
    const options = buildDrillOptions(variables, onSet, minimized, random);
    const correctIndex = options.findIndex((option) => option.correct);
    return { type, variables, minterms: onSet, minimizedForm: minimized.form, expression, options, correctIndex };
  }
  return { type, variables, minterms: onSet, minimizedForm: minimized.form, expression };
}

export function parseMintermInput(text) {
  const matches = String(text).match(/\d+/g) || [];
  return [...new Set(matches.map(Number))].sort((a, b) => a - b);
}

export function checkDrillAnswer(drill, answer) {
  if (drill.type === 'choice') {
    const correct = answer.index === drill.correctIndex;
    return { correct, correctAnswer: drill.options[drill.correctIndex].label };
  }
  const parsed = parseMintermInput(answer.text);
  const expected = drill.minterms;
  const correct = parsed.length === expected.length && expected.every((minterm) => parsed.includes(minterm));
  return { correct, correctAnswer: expected.join(', ') };
}

// ---------------------------------------------------------------------------
// Circuit canvas: schematic compiler + simulator (graph, cycle-aware)
// ---------------------------------------------------------------------------

export const GATE_ARITY = Object.fromEntries(
  Object.entries(GATES).map(([id, gate]) => [id, gate.inputs])
);

const isInputType = (type) => type === 'IN';
const arityOf = (type) => (type === 'OUT' ? 1 : GATE_ARITY[type]);

export function compileSchematic({ nodes = [], wires = [] } = {}) {
  const types = {};
  for (const node of nodes) {
    if (types[node.id] !== undefined) return { error: `Duplicate node "${node.id}".` };
    if (!isInputType(node.type) && node.type !== 'OUT' && !GATE_ARITY[node.type]) {
      return { error: `Unknown node type "${node.type}".` };
    }
    types[node.id] = node.type;
  }
  const isGate = (id) => types[id] !== undefined && !isInputType(types[id]) && types[id] !== 'OUT';

  const sources = {};
  for (const node of nodes) sources[node.id] = {};
  for (const wire of wires) {
    if (types[wire.from] === undefined) return { error: `Wire from unknown node "${wire.from}".` };
    if (types[wire.to] === undefined) return { error: `Wire to unknown node "${wire.to}".` };
    if (types[wire.from] === 'OUT') return { error: 'An OUTPUT node has no output to wire from.' };
    if (isInputType(types[wire.to])) return { error: 'An input pin has no inputs to wire to.' };
    if (wire.port !== 'a' && wire.port !== 'b') return { error: `Unknown port "${wire.port}".` };
    if (wire.port === 'b' && arityOf(types[wire.to]) !== 2) return { error: `Node ${wire.to} does not have a second input.` };
    if (sources[wire.to][wire.port]) return { error: `Input ${wire.to}.${wire.port} already has a wire.` };
    sources[wire.to][wire.port] = wire.from;
  }

  const inputs = nodes.filter((node) => isInputType(node.type)).map((node) => node.id).sort();
  const gateIds = nodes.filter((node) => types[node.id] !== undefined && !isInputType(types[node.id])).map((node) => node.id);

  const indegree = {};
  const dependents = {};
  gateIds.forEach((id) => { indegree[id] = 0; dependents[id] = []; });
  gateIds.forEach((id) => {
    for (const source of Object.values(sources[id])) {
      if (isGate(source)) {
        dependents[source].push(id);
        indegree[id] += 1;
      }
    }
  });

  const queue = gateIds.filter((id) => indegree[id] === 0);
  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    for (const next of dependents[id]) {
      indegree[next] -= 1;
      if (indegree[next] === 0) queue.push(next);
    }
  }
  if (order.length !== gateIds.length) return { error: 'The circuit has a feedback loop.' };

  const outputId = gateIds.find((id) => types[id] === 'OUT') || null;
  return { types, sources, order, inputs, outputId };
}

export function evaluateSchematic(compiled, assignment) {
  const values = { ...assignment };
  for (const id of compiled.order) {
    const source = compiled.sources[id];
    const read = (port) => {
      const reference = source[port];
      if (!reference) return 0;
      return values[reference] === undefined ? 0 : values[reference];
    };
    if (compiled.types[id] === 'OUT') {
      values[id] = read('a');
    } else {
      const evaluate = GATES[compiled.types[id]].evaluate;
      values[id] = arityOf(compiled.types[id]) === 1 ? evaluate(read('a')) : evaluate(read('a'), read('b'));
    }
  }
  return values;
}

export function schematicTruthTable(nodes, wires) {
  const compiled = compileSchematic({ nodes, wires });
  if (compiled.error) return { error: compiled.error };
  if (!compiled.outputId) return { error: 'Add an OUTPUT node to see the truth table.' };
  const rows = buildAssignments(compiled.inputs).map((assignment) => ({
    inputs: assignment,
    values: { Output: evaluateSchematic(compiled, assignment)[compiled.outputId] }
  }));
  return { inputs: compiled.inputs, rows, outputId: compiled.outputId };
}

export const LAYOUT = { columnGap: 190, rowGap: 96, left: 24, top: 24 };

export function layoutSchematic(nodes = [], wires = []) {
  const compiled = compileSchematic({ nodes, wires });
  if (compiled.error) return { error: compiled.error };
  const { sources, order, inputs } = compiled;

  const depth = {};
  inputs.forEach((id) => { depth[id] = 0; });
  for (const id of order) {
    let level = 1;
    for (const reference of Object.values(sources[id])) {
      level = Math.max(level, (depth[reference] === undefined ? 0 : depth[reference]) + 1);
    }
    depth[id] = level;
  }

  const columns = new Map();
  for (const node of nodes) {
    const level = depth[node.id] === undefined ? 0 : depth[node.id];
    if (!columns.has(level)) columns.set(level, []);
    columns.get(level).push(node);
  }

  const laidOut = [];
  for (const level of [...columns.keys()].sort((a, b) => a - b)) {
    const column = columns.get(level)
      .slice()
      .sort((a, b) => (a.y - b.y) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    column.forEach((node, index) => {
      laidOut.push({
        ...node,
        x: LAYOUT.left + level * LAYOUT.columnGap,
        y: LAYOUT.top + index * LAYOUT.rowGap
      });
    });
  }
  return { nodes: laidOut };
}



