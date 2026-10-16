import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  generateTruthTable,
  canonicalSumOfProducts,
  expressionsEquivalent,
  gateTruthTable,
  guidedCircuit,
  parseExpression
} from '../src/components/events/circuitlab/booleanLogic.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');

const outputs = (expression) => generateTruthTable(expression).rows.map((row) => row.output);
const values = (table, label) => table.rows.map((row) => row.values[label]);

test('truth tables evaluate NOT, AND, OR and XOR over every input combination', () => {
  assert.deepEqual(outputs('NOT A'), [1, 0]);
  assert.deepEqual(outputs('A AND B'), [0, 0, 0, 1]);
  assert.deepEqual(outputs('A OR B'), [0, 1, 1, 1]);
  assert.deepEqual(outputs('A XOR B'), [0, 1, 1, 0]);
});

test('truth tables accept symbolic operators, implicit NOT and parentheses', () => {
  assert.deepEqual(outputs("A \u00b7 B"), outputs('A AND B'));
  assert.deepEqual(outputs('A + B'), outputs('A OR B'));
  assert.deepEqual(outputs("A'"), outputs('NOT A'));
  assert.deepEqual(outputs('!(A + B)'), outputs('NOT (A OR B)'));
  assert.deepEqual(outputs('A AND (B OR NOT C)'), outputs('A \u00b7 (B + C\u2032)'));
});

test('De Morgan\u2019s Law equivalences hold over all inputs', () => {
  const first = expressionsEquivalent('NOT (A AND B)', '(NOT A) OR (NOT B)');
  assert.equal(first.equivalent, true);
  assert.equal(first.difference, null);

  const second = expressionsEquivalent('NOT (A OR B)', '(NOT A) AND (NOT B)');
  assert.equal(second.equivalent, true);
});

test('unequal expressions report the first differing input row', () => {
  const result = expressionsEquivalent('A AND B', 'A OR B');
  assert.equal(result.equivalent, false);
  assert.deepEqual(result.difference.inputs, { A: 0, B: 1 });
  assert.equal(result.difference.a, 0);
  assert.equal(result.difference.b, 1);
});

test('canonical sum-of-products formats minterms and constants', () => {
  const xor = canonicalSumOfProducts('A XOR B');
  assert.equal(xor.form, "A\u2032 \u00b7 B  +  A \u00b7 B\u2032");
  assert.deepEqual(xor.minterms, [1, 2]);
  assert.equal(canonicalSumOfProducts('A AND NOT A').form, '0');
  assert.equal(canonicalSumOfProducts('A OR NOT A').form, '1');
});

test('invalid expressions return clear errors instead of throwing', () => {
  assert.match(parseExpression('').error, /Enter a Boolean expression/);
  assert.match(parseExpression('A B').error, /trailing input/i);
  assert.match(parseExpression('A AND').error, /Unexpected end of expression/i);
  assert.match(parseExpression('AB').error, /Unrecognized term/i);
  assert.match(parseExpression('A AND (B').error, /closing parenthesis/i);
  assert.match(parseExpression('A + B + C + D + E').error, /up to 4 variables/);
});

test('gate truth tables cover the listed gates including universal gates', () => {
  assert.deepEqual(gateTruthTable('AND').rows.map((row) => row.output), [0, 0, 0, 1]);
  assert.deepEqual(gateTruthTable('NAND').rows.map((row) => row.output), [1, 1, 1, 0]);
  assert.deepEqual(gateTruthTable('NOR').rows.map((row) => row.output), [1, 0, 0, 0]);
  assert.deepEqual(gateTruthTable('XNOR').rows.map((row) => row.output), [1, 0, 0, 1]);
  assert.equal(gateTruthTable('NAND').universal, true);
  assert.equal(gateTruthTable('NOR').universal, true);
  assert.deepEqual(gateTruthTable('NOT').rows.map((row) => row.output), [1, 0]);
});

test('guided combinational circuits match their standard truth tables', () => {
  const halfAdder = guidedCircuit('half-adder');
  assert.deepEqual(values(halfAdder, 'Sum'), [0, 1, 1, 0]);
  assert.deepEqual(values(halfAdder, 'Carry'), [0, 0, 0, 1]);

  const fullAdder = guidedCircuit('full-adder');
  assert.deepEqual(values(fullAdder, 'Sum'), [0, 1, 1, 0, 1, 0, 0, 1]);
  assert.deepEqual(values(fullAdder, 'Carry'), [0, 0, 0, 1, 0, 1, 1, 1]);

  const mux = guidedCircuit('mux-2-1');
  const rows = mux.rows;
  assert.equal(rows.find((row) => row.inputs.S === 0 && row.inputs.A === 1).values.Y, 1);
  assert.equal(rows.find((row) => row.inputs.S === 1 && row.inputs.B === 1).values.Y, 1);
  assert.equal(rows.find((row) => row.inputs.S === 1 && row.inputs.B === 0).values.Y, 0);
});

test('Circuit Lab registry advertises the manual-cited digital logic workbench', () => {
  assert.match(registrySource, /id: 'digital-logic'/);
  assert.match(registrySource, /Division C Rules Manual, pp\. C16\u2013C17/);
  assert.match(registrySource, /digital logic/i);
});
