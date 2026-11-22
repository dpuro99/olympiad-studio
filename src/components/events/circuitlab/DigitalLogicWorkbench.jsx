import { useState } from 'react';
import {
  canonicalSumOfProducts,
  expressionsEquivalent,
  GATES,
  GATE_IDS,
  gateTruthTable,
  generateTruthTable,
  GUIDED_CIRCUIT_IDS,
  guidedCircuit
} from './booleanLogic';
import TruthTable from './TruthTable';
import KMapMinimizer from './KMapMinimizer';
import MultiOutputTruthTable from './MultiOutputTruthTable';
import LogicDrill from './LogicDrill';
import CircuitCanvas from './CircuitCanvas';
import {
  Button,
  Card,
  Collapsible,
  Eyebrow,
  HelpText,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  Stepper,
  TextField,
  ToolHeader
} from '../../general/ui/primitives';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';

const MANUAL_REFERENCE = `${ACTIVE_SEASON.year} Division C Rules Manual, §3.c.viii & §3.e.iv, pp. C16–C17`;

const MODES = [
  { id: 'gates', label: 'Gate truth tables' },
  { id: 'expression', label: 'Expression → truth table' },
  { id: 'kmap', label: 'Karnaugh map' },
  { id: 'equivalence', label: 'Equivalence' },
  { id: 'multi', label: 'Multi-output table' },
  { id: 'circuits', label: 'Combinational circuits' },
  { id: 'builder', label: 'Circuit canvas' },
  { id: 'drill', label: 'Practice drill' }
];

const WORKFLOW = [
  { label: 'Pick a tool' },
  { label: 'Enter or wire' },
  { label: 'Read the result' }
];
const REFERENCE_SUMMARY = 'Manual scope and reference (expand for details)';

const MODULE_STEP = {
  gates: 0, expression: 0, multi: 0,
  kmap: 1, circuits: 1, builder: 1,
  equivalence: 2, drill: 2
};

export default function DigitalLogicWorkbench() {
  const [mode, setMode] = useState('gates');
  const [gateId, setGateId] = useState('AND');
  const [expression, setExpression] = useState('');
  const [equivA, setEquivA] = useState('');
  const [equivB, setEquivB] = useState('');
  const [circuitId, setCircuitId] = useState(GUIDED_CIRCUIT_IDS[0]);

  const gateTable = gateTruthTable(gateId);
  const circuit = guidedCircuit(circuitId);

  // Live derivations: results follow the expression as it is typed; an incomplete
  // expression gets a neutral hint instead of a parse error.
  const expressionComputation = expression.trim()
    ? generateTruthTable(expression)
    : null;
  const expressionResult = expressionComputation && !expressionComputation.error
    ? { ...expressionComputation, canonical: canonicalSumOfProducts(expression) }
    : null;
  const expressionError = expressionComputation && expressionComputation.error
    ? expressionComputation.error
    : '';

  const equivComputation = equivA.trim() && equivB.trim()
    ? expressionsEquivalent(equivA, equivB)
    : null;
  const equivResult = equivComputation && !equivComputation.error ? equivComputation : null;
  const equivError = equivComputation && equivComputation.error ? equivComputation.error : '';

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 860 }}>
      <ToolHeader
        eyebrow={`Circuit Lab C · ${ACTIVE_SEASON.year} · Manual C16–C17`}
        purpose="Build and check digital logic gates, Boolean expressions, De Morgan's Law equivalences, Karnaugh maps, and combinational circuits such as adders and multiplexers. Everything is generated from what you enter — there are no preset questions."
        manualReference={MANUAL_REFERENCE}
        steps={[
          'Type variables as letters A–D and combine them with AND, OR, NOT, and XOR (symbols · + ′ ⊕ ! also work).',
          'Use gate truth tables to check a single gate, or Expression → truth table to expand any expression.',
          'Use the Karnaugh map to minimize a function and see its groups, or Expression equivalence to test two expressions such as De Morgan\'s Law.',
          'Try the Circuit builder to wire gates and simulate, or the Practice drill to test yourself on generated problems.'
        ]}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          This is a learning tool, not an official score. Clock signals, timing diagrams, propagation delay, and flip-flops are State/National-only topics and are not covered here.
        </p>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 4 }}>
        <Stepper steps={WORKFLOW} currentStep={MODULE_STEP[mode]} />
      </Card>

      <div role="tablist" aria-label="Digital logic modes" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {MODES.map((entry) => (
          <Button
            key={entry.id}
            role="tab"
            aria-selected={mode === entry.id}
            variant={mode === entry.id ? 'primary' : 'secondary'}
            onClick={() => setMode(entry.id)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      {mode === 'gates' && (
        <Card style={{ display: 'grid', gap: 14 }}>
          <SectionHeading>Gate truth tables</SectionHeading>
          <SelectField label="Gate" value={gateId} onChange={(event) => setGateId(event.target.value)} style={{ maxWidth: 320 }}>
            {GATE_IDS.map((id) => <option key={id} value={id}>{GATES[id].label}</option>)}
          </SelectField>
          <HelpText>
            Expression: <span style={{ fontFamily: 'var(--font-mono)' }}>{GATES[gateId].expression}</span>
            {GATES[gateId].universal && ' · A universal gate, which alone can implement any Boolean function.'}
          </HelpText>
          <TruthTable
            variables={gateTable.variables}
            headers={['Output']}
            rows={gateTable.rows}
            caption={`${gateTable.label} output for each input combination`}
          />
        </Card>
      )}

      {mode === 'expression' && (
        <Card style={{ display: 'grid', gap: 14 }}>
          <SectionHeading>Expression truth table</SectionHeading>
          <TextField
            label="Boolean expression"
            value={expression}
            onChange={(event) => { setExpression(event.target.value); }}
            placeholder="e.g. (A AND B) OR NOT C"
            help="Variables A–D; operators AND, OR, NOT, XOR and parentheses."
          />
          {expressionError && <StatusMessage tone="error">{expressionError}</StatusMessage>}
          {expressionResult && (
            <>
              <ResultPanel style={{ display: 'grid', gap: 4 }}>
                <div>Canonical sum-of-products: <span style={{ fontFamily: 'var(--font-mono)' }}>{expressionResult.canonical.form}</span></div>
                {expressionResult.canonical.minterms.length > 0 && (
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
                    Minterms (output = 1): {expressionResult.canonical.minterms.join(', ')}
                  </div>
                )}
              </ResultPanel>
              <TruthTable
                variables={expressionResult.variables}
                headers={['Output']}
                rows={expressionResult.rows}
                caption={`Truth table for ${expressionResult.expression}`}
              />
            </>
          )}
          {!expression.trim() && <HelpText>Type a Boolean expression above to see its truth table as you type.</HelpText>}
        </Card>
      )}

      {mode === 'kmap' && <KMapMinimizer />}

      {mode === 'equivalence' && (
        <Card style={{ display: 'grid', gap: 14 }}>
          <SectionHeading>Expression equivalence</SectionHeading>
          <HelpText>
            Two expressions are equivalent when they produce the same output for every input combination — the basis of De Morgan&rsquo;s Law and Boolean simplification.
          </HelpText>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            <TextField label="First expression" value={equivA} onChange={(event) => setEquivA(event.target.value)} placeholder="e.g. NOT (A AND B)" />
            <TextField label="Second expression" value={equivB} onChange={(event) => setEquivB(event.target.value)} placeholder="e.g. (NOT A) OR (NOT B)" />
          </div>
          {equivError && <StatusMessage tone="error">{equivError}</StatusMessage>}
          {equivResult && (
            <>
              <ResultPanel style={{ display: 'grid', gap: 4 }}>
                <div>
                  {equivResult.equivalent
                    ? 'Equivalent: the two expressions match on every input combination.'
                    : 'Not equivalent: the expressions differ on at least one input combination.'}
                </div>
                {!equivResult.equivalent && (
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    First difference at {Object.entries(equivResult.difference.inputs).map(([name, value]) => `${name}=${value}`).join(', ')}: first = {equivResult.difference.a}, second = {equivResult.difference.b}
                  </div>
                )}
              </ResultPanel>
              <TruthTable
                variables={equivResult.variables}
                headers={['First', 'Second']}
                rows={equivResult.rows.map((row) => ({ inputs: row.inputs, values: { First: row.a, Second: row.b } }))}
                caption="Output of each expression for every input combination"
              />
            </>
          )}
          {!equivA.trim() || !equivB.trim()
            ? <HelpText>Fill in both expressions to compare them as you type.</HelpText>
            : null}
        </Card>
      )}

      {mode === 'multi' && <MultiOutputTruthTable />}

      {mode === 'circuits' && (
        <Card style={{ display: 'grid', gap: 14 }}>
          <SectionHeading>Guided combinational circuits</SectionHeading>
          <SelectField label="Circuit" value={circuitId} onChange={(event) => setCircuitId(event.target.value)} style={{ maxWidth: 320 }}>
            {GUIDED_CIRCUIT_IDS.map((id) => <option key={id} value={id}>{guidedCircuit(id).label}</option>)}
          </SelectField>
          <HelpText>{circuit.note}</HelpText>
          <div style={{ display: 'grid', gap: 4 }}>
            {circuit.outputs.map((output) => (
              <div key={output.label} style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                {output.label}: <span style={{ fontFamily: 'var(--font-mono)' }}>{output.expression}</span>
              </div>
            ))}
          </div>
          <TruthTable
            variables={circuit.variables}
            headers={circuit.outputs.map((output) => output.label)}
            rows={circuit.rows}
            caption={`${circuit.label} truth table`}
          />
        </Card>
      )}

      {mode === 'builder' && <CircuitCanvas />}

      {mode === 'drill' && <LogicDrill />}

      <Card>
        <Collapsible summary={REFERENCE_SUMMARY} style={{ borderTop: 'none', paddingTop: 0 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <Eyebrow>Reference</Eyebrow>
            <HelpText>
              Covered by manual §3.c.viii (digital logic gates, truth tables, universal gate sets, Boolean expressions, De Morgan&rsquo;s Law, combinational logic circuits) and §3.e.iv. Binary representation and addition (§3.e.iii) underpin the adder circuits. This does not replace the official Rules Manual.
            </HelpText>
          </div>
        </Collapsible>
      </Card>
    </div>
  );
}
