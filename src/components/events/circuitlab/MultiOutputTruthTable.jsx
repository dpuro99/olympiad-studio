import { useState } from 'react';
import { multiOutputTruthTable } from './booleanLogic';
import TruthTable from './TruthTable';
import { Button, Card, SectionHeading, StatusMessage, TextField } from '../../general/ui/primitives';

const blankRow = () => ({ label: '', expression: '' });

export default function MultiOutputTruthTable() {
  const [rows, setRows] = useState([
    { label: 'Sum', expression: 'A XOR B' },
    { label: 'Carry', expression: 'A AND B' }
  ]);
  const [result, setResult] = useState(null);

  const update = (index, patch) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setResult(null);
  };

  const generate = (event) => {
    event.preventDefault();
    setResult(multiOutputTruthTable(rows));
  };

  return (
    <Card as="form" onSubmit={generate} style={{ display: 'grid', gap: 14 }}>
      <SectionHeading>Multi-output truth table</SectionHeading>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Give each output a name and a Boolean expression. The table shows every output for each input combination &mdash; useful for a circuit block such as an adder with Sum and Carry. Inputs are the union of the variables you use.
      </p>
      <div style={{ display: 'grid', gap: 10 }}>
        {rows.map((row, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px, 140px) 1fr auto', gap: 8, alignItems: 'end' }}>
            <TextField
              label={`Output ${index + 1} name`}
              value={row.label}
              onChange={(event) => update(index, { label: event.target.value })}
              placeholder={`Y${index + 1}`}
            />
            <TextField
              label={`Output ${index + 1} expression`}
              value={row.expression}
              onChange={(event) => update(index, { expression: event.target.value })}
              placeholder="e.g. A XOR B"
            />
            {rows.length > 1 && (
              <Button
                variant="danger"
                aria-label={`Remove output ${index + 1}`}
                onClick={() => { setRows((current) => current.filter((_, i) => i !== index)); setResult(null); }}
              >
                ×
              </Button>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button onClick={() => { setRows((current) => [...current, blankRow()]); setResult(null); }}>+ Add output</Button>
        <Button type="submit" variant="primary">Generate truth table</Button>
      </div>
      {result && result.error && <StatusMessage tone="error">{result.error}</StatusMessage>}
      {result && !result.error && (
        <TruthTable
          variables={result.variables}
          headers={result.outputs}
          rows={result.rows}
          caption="Every output column for each input combination"
        />
      )}
    </Card>
  );
}
