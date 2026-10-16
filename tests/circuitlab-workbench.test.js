import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkDrillAnswer,
  compileSchematic,
  evaluateSchematic,
  generateDrill,
  kmapLayout,
  kmapMinimize,
  layoutSchematic,
  multiOutputTruthTable,
  parseMintermInput,
  schematicTruthTable
} from '../src/components/events/circuitlab/booleanLogic.js';

test('K-map minimization reduces simple functions to their prime terms', () => {
  const and = kmapMinimize('A AND B');
  assert.deepEqual(and.minterms, [3]);
  assert.equal(and.form, 'A \u00b7 B');

  const or = kmapMinimize('A OR B');
  assert.deepEqual(or.minterms, [1, 2, 3]);
  assert.equal(or.form, 'A  +  B');

  const three = kmapMinimize('(A AND B) OR (A AND C) OR (B AND C)');
  assert.deepEqual(three.minterms, [3, 5, 6, 7]);
  assert.equal(three.implicants.length, 3);
});

test('K-map minimization handles the all-ones and all-zeros cases', () => {
  assert.equal(kmapMinimize('A OR NOT A').form, '1');
  assert.equal(kmapMinimize('A AND NOT A').form, '0');
});

test('K-map minimization keeps an XNOR function as two two-literal terms', () => {
  const xnor = kmapMinimize('NOT (A XOR B)');
  assert.deepEqual(xnor.minterms, [0, 3]);
  assert.equal(xnor.implicants.length, 2);
  assert.equal(xnor.form, 'A \u00b7 B  +  A\u2032 \u00b7 B\u2032');
});

test('K-map layout produces a gray-code grid covering every minterm once', () => {
  const layout = kmapLayout(4);
  assert.equal(layout.rows.length, 4);
  const cells = layout.rows.flatMap((row) => row.cells);
  assert.equal(cells.length, 16);
  assert.deepEqual([...cells].sort((a, b) => a - b), Array.from({ length: 16 }, (_, index) => index));

  const two = kmapLayout(2);
  assert.deepEqual(two.colLabels, ['B=0', 'B=1']);
  assert.equal(two.hasRowLabels, true);
});

test('multi-output truth table evaluates each output column', () => {
  const table = multiOutputTruthTable([
    { label: 'Sum', expression: 'A XOR B' },
    { label: 'Carry', expression: 'A AND B' }
  ]);
  assert.deepEqual(table.variables, ['A', 'B']);
  assert.deepEqual(table.outputs, ['Sum', 'Carry']);
  assert.equal(table.rows.length, 4);
  const last = table.rows[table.rows.length - 1];
  assert.deepEqual(last.inputs, { A: 1, B: 1 });
  assert.equal(last.values.Sum, 0);
  assert.equal(last.values.Carry, 1);
});

test('multi-output truth table reports the offending output on error', () => {
  const result = multiOutputTruthTable([{ label: 'Y', expression: 'A AND ' }]);
  assert.match(result.error, /^Y:/);
});

test('generated drills are self-consistent and grade answers', () => {
  let seed = 12345;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let iteration = 0; iteration < 40; iteration += 1) {
    const drill = generateDrill(random);
    assert.ok(drill.minterms.length > 0 && drill.minterms.length < 2 ** drill.variables.length);
    assert.ok(/[A-D]/.test(drill.minimizedForm));
    if (drill.type === 'choice') {
      assert.equal(drill.options.length, 4);
      assert.equal(drill.options.filter((option) => option.correct).length, 1);
      assert.equal(drill.options[drill.correctIndex].correct, true);
      const graded = checkDrillAnswer(drill, { index: drill.correctIndex });
      assert.equal(graded.correct, true);
      const wrong = checkDrillAnswer(drill, { index: (drill.correctIndex + 1) % 4 });
      assert.equal(wrong.correct, false);
    } else {
      const graded = checkDrillAnswer(drill, { text: drill.minterms.join(', ') });
      assert.equal(graded.correct, true);
      const wrong = checkDrillAnswer(drill, { text: '99' });
      assert.equal(wrong.correct, false);
    }
  }
});

test('minterm input parsing ignores order, repeats, and separators', () => {
  assert.deepEqual(parseMintermInput('3, 1, 1 and 0'), [0, 1, 3]);
  assert.deepEqual(parseMintermInput('none'), []);
});

test('schematic compiler evaluates a wired circuit over all input combinations', () => {
  const nodes = [
    { id: 'A', type: 'IN' }, { id: 'B', type: 'IN' },
    { id: 'G1', type: 'XOR' }, { id: 'G2', type: 'AND' },
    { id: 'SUM', type: 'OUT' }, { id: 'CARRY', type: 'OUT' }
  ];
  const wires = [
    { from: 'A', to: 'G1', port: 'a' }, { from: 'B', to: 'G1', port: 'b' },
    { from: 'A', to: 'G2', port: 'a' }, { from: 'B', to: 'G2', port: 'b' },
    { from: 'G1', to: 'SUM', port: 'a' }, { from: 'G2', to: 'CARRY', port: 'a' }
  ];
  const compiled = compileSchematic({ nodes, wires });
  assert.ok(!compiled.error);
  const sum = [];
  const carry = [];
  for (const assignment of [{ A: 0, B: 0 }, { A: 0, B: 1 }, { A: 1, B: 0 }, { A: 1, B: 1 }]) {
    const values = evaluateSchematic(compiled, assignment);
    sum.push(values.SUM);
    carry.push(values.CARRY);
  }
  assert.deepEqual(sum, [0, 1, 1, 0]);
  assert.deepEqual(carry, [0, 0, 0, 1]);
});

test('schematic truth table treats unconnected inputs as 0 and needs an OUTPUT node', () => {
  const rows = schematicTruthTable(
    [{ id: 'A', type: 'IN' }, { id: 'B', type: 'IN' }, { id: 'G1', type: 'OR' }, { id: 'OUT', type: 'OUT' }],
    [{ from: 'A', to: 'G1', port: 'a' }, { from: 'G1', to: 'OUT', port: 'a' }]
  );
  assert.deepEqual(rows.rows.map((row) => row.values.Output), [0, 0, 1, 1]);

  const missing = schematicTruthTable([{ id: 'A', type: 'IN' }, { id: 'G1', type: 'NOT' }], []);
  assert.match(missing.error, /OUTPUT node/);
});

test('schematic compiler rejects feedback loops, bad ports, and double connections', () => {
  const loop = compileSchematic({
    nodes: [{ id: 'G1', type: 'AND' }, { id: 'G2', type: 'OR' }],
    wires: [{ from: 'G2', to: 'G1', port: 'a' }, { from: 'G1', to: 'G2', port: 'a' }]
  });
  assert.match(loop.error, /feedback loop/);

  const badPort = compileSchematic({
    nodes: [{ id: 'A', type: 'IN' }, { id: 'G1', type: 'NOT' }],
    wires: [{ from: 'A', to: 'G1', port: 'b' }]
  });
  assert.match(badPort.error, /second input/);

  const double = compileSchematic({
    nodes: [{ id: 'A', type: 'IN' }, { id: 'B', type: 'IN' }, { id: 'G1', type: 'AND' }],
    wires: [{ from: 'A', to: 'G1', port: 'a' }, { from: 'B', to: 'G1', port: 'a' }]
  });
  assert.match(double.error, /already has a wire/);
});

test('schematic layout places inputs left, gates by depth, and outputs rightmost', () => {
  const nodes = [
    { id: 'A', type: 'IN', x: 400, y: 400 },
    { id: 'B', type: 'IN', x: 400, y: 300 },
    { id: 'G1', type: 'AND', x: 10, y: 10 },
    { id: 'G2', type: 'NOT', x: 10, y: 90 },
    { id: 'OUT', type: 'OUT', x: 10, y: 200 }
  ];
  const wires = [
    { from: 'A', to: 'G1', port: 'a' },
    { from: 'B', to: 'G1', port: 'b' },
    { from: 'G1', to: 'G2', port: 'a' },
    { from: 'G2', to: 'OUT', port: 'a' }
  ];
  const { nodes: placed, error } = layoutSchematic(nodes, wires);
  assert.equal(error, undefined);
  const byId = Object.fromEntries(placed.map((node) => [node.id, node]));
  assert.equal(byId.A.x, byId.B.x);
  assert.ok(byId.G1.x > byId.A.x);
  assert.ok(byId.G2.x > byId.G1.x);
  assert.ok(byId.OUT.x > byId.G2.x);
  for (const node of placed) {
    assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
  }
  assert.notEqual(byId.A.y, byId.B.y);
});

test('schematic layout reports an error for invalid circuits', () => {
  const result = layoutSchematic(
    [{ id: 'G1', type: 'AND' }, { id: 'G2', type: 'OR' }],
    [{ from: 'G2', to: 'G1', port: 'a' }, { from: 'G1', to: 'G2', port: 'a' }]
  );
  assert.match(result.error, /feedback loop/);
});
