import { useState } from 'react';
import { checkDrillAnswer, generateDrill } from './booleanLogic';
import { Button, Card, SectionHeading, StatusMessage, TextField } from '../../general/ui/primitives';

export default function LogicDrill() {
  const [drill, setDrill] = useState(() => generateDrill());
  const [choice, setChoice] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const newProblem = () => {
    setDrill(generateDrill());
    setChoice(null);
    setText('');
    setResult(null);
  };

  const check = () => {
    const answer = drill.type === 'choice' ? { index: choice } : { text };
    const graded = checkDrillAnswer(drill, answer);
    setResult(graded);
    setScore((current) => ({ correct: current.correct + (graded.correct ? 1 : 0), total: current.total + 1 }));
  };

  const canCheck = drill.type === 'choice' ? choice !== null : text.trim() !== '';
  const mintermSummary = drill.minterms.map((minterm) => minterm.toString(2).padStart(drill.variables.length, '0')).join(', ');

  return (
    <Card style={{ display: 'grid', gap: 14 }}>
      <SectionHeading>Practice drill</SectionHeading>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Each problem is generated fresh &mdash; there is no fixed question bank. Given a function&rsquo;s truth table, either list its minterms or pick the minimal sum-of-products. Scoring is just for practice.
      </p>
      <StatusMessage>Score: {score.correct} / {score.total}</StatusMessage>

      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 12 }}>
          Function of {drill.variables.join(', ')}. The output is 1 for minterms{' '}
          <span style={{ fontFamily: 'var(--font-mono)' }}>{drill.minterms.join(', ')}</span>{' '}
          (binary {`{ ${mintermSummary} }`}).
        </div>
      </div>

      {drill.type === 'choice' ? (
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 6 }}>
          <legend style={{ color: 'var(--color-text-secondary)', fontSize: 11, padding: 0 }}>Choose the minimal sum-of-products</legend>
          <div role="radiogroup" aria-label="Minimized expression options" style={{ display: 'grid', gap: 6 }}>
            {drill.options.map((option, index) => (
              <label key={index} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                <input
                  type="radio"
                  name="drill-option"
                  value={index}
                  checked={choice === index}
                  onChange={() => { setChoice(index); setResult(null); }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <TextField
          label="Minterms where the output is 1"
          value={text}
          onChange={(event) => { setText(event.target.value); setResult(null); }}
          placeholder="e.g. 1, 3, 5"
          help="Separate with commas or spaces; order does not matter."
        />
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={check} disabled={!canCheck}>Check answer</Button>
        <Button onClick={newProblem}>New problem</Button>
      </div>

      {result && (
        <StatusMessage tone={result.correct ? 'success' : 'error'}>
          {result.correct ? 'Correct.' : 'Not quite.'} Correct answer: <span style={{ fontFamily: 'var(--font-mono)' }}>{result.correctAnswer}</span>
        </StatusMessage>
      )}
      {result && (
        <StatusMessage>Minimized form: <span style={{ fontFamily: 'var(--font-mono)' }}>{drill.minimizedForm}</span></StatusMessage>
      )}
    </Card>
  );
}
