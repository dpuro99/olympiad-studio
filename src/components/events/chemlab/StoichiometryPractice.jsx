import { Fragment, useState } from 'react';
import { checkProblem, formatNumber, generateProblem } from './stoichiometry';
import {
  Button, Card, HelpText, ResultPanel, SectionHeading, StatusMessage, Tabs, TextField,
  ToggleSwitch, ToolHeader
} from '../../general/ui/primitives';

const TABS = [
  { id: 'balance', label: 'Balance equations' },
  { id: 'convert', label: 'Mole conversions' },
  { id: 'limiting', label: 'Limiting reagent' },
  { id: 'yield', label: 'Percent yield' },
  { id: 'nomenclature', label: 'Name ↔ formula' }
];

const PURPOSE = 'Unlimited generated practice for Chemistry Lab’s supporting skills: balancing equations, mole/mass/particle/gas-volume conversions, limiting reagent, percent yield, and ionic name ↔ formula. Every problem is generated fresh — there is no fixed question bank, and results are practice only, not official answers.';

const STEPS = [
  'Choose a mode below, and switch on “State & National ions” if you want the expanded ion list.',
  'Work the generated problem with a calculator and paper.',
  'Press Check to grade and reveal the step-by-step worked solution.',
  'Press New problem for another one; your practice score tracks this session only.'
];

const coefficientInputStyle = {
  width: 56,
  padding: '6px 8px',
  background: 'var(--color-background-tertiary)',
  border: '1px solid var(--color-border-secondary)',
  color: 'var(--color-text-primary)',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'var(--font-mono)'
};

function initialAnswer(problem) {
  if (!problem) return '';
  if (problem.mode === 'balance') return problem.species.map(() => '');
  if (problem.mode === 'limiting') return { limiting: '', mass: '' };
  return '';
}

function answerReady(problem, answer) {
  if (!problem) return false;
  if (problem.mode === 'balance') return answer.every((value) => String(value).trim() !== '');
  if (problem.mode === 'limiting') return Boolean(answer.limiting) && String(answer.mass).trim() !== '';
  return String(answer).trim() !== '';
}

function BalanceAnswer({ problem, answer, onChange }) {
  const setCoefficient = (index, value) => {
    const next = answer.slice();
    next[index] = value;
    onChange(next);
  };
  const renderSpecies = (species, offset) => species.map((entry, index) => {
    const position = offset + index;
    return (
      <Fragment key={`${entry.formula}-${position}`}>
        {index > 0 && <span aria-hidden="true" style={{ color: 'var(--color-text-secondary)' }}>+</span>}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            aria-label={`Coefficient for ${entry.formula}`}
            value={answer[position]}
            onChange={(event) => setCoefficient(position, event.target.value)}
            style={coefficientInputStyle}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{entry.formula}</span>
        </span>
      </Fragment>
    );
  });

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {renderSpecies(problem.species.slice(0, problem.reactantCount), 0)}
      <span aria-hidden="true" style={{ color: 'var(--color-text-info)', fontSize: 16 }}>→</span>
      {renderSpecies(problem.species.slice(problem.reactantCount), problem.reactantCount)}
    </div>
  );
}

function ProblemAnswer({ problem, answer, onChange }) {
  if (problem.mode === 'balance') {
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <HelpText>Enter the smallest whole-number coefficient for each species (use 1 when no coefficient is needed).</HelpText>
        <BalanceAnswer problem={problem} answer={answer} onChange={onChange} />
      </div>
    );
  }

  if (problem.mode === 'convert') {
    return (
      <TextField
        label={`${problem.ask.label} (${problem.ask.unit})`}
        value={answer}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter your answer"
        help="Scientific notation such as 3.011e23 is accepted."
      />
    );
  }

  if (problem.mode === 'limiting') {
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 6 }}>
          <legend style={{ color: 'var(--color-text-secondary)', fontSize: 11, padding: 0 }}>Which reactant is limiting?</legend>
          <div role="radiogroup" aria-label="Limiting reactant" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {problem.reactants.map((entry) => (
              <label key={entry.formula} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                <input
                  type="radio"
                  name="limiting-reactant"
                  value={entry.formula}
                  checked={answer.limiting === entry.formula}
                  onChange={() => onChange({ ...answer, limiting: entry.formula })}
                />
                {entry.formula}
              </label>
            ))}
          </div>
        </fieldset>
        <TextField
          label={`Theoretical yield of ${problem.product} (g)`}
          value={answer.mass}
          onChange={(event) => onChange({ ...answer, mass: event.target.value })}
          placeholder="Enter your answer"
        />
      </div>
    );
  }

  if (problem.mode === 'yield') {
    const label = problem.variant === 'percent'
      ? `Percent yield of ${problem.product} (%)`
      : `Actual yield of ${problem.product} (g)`;
    return (
      <TextField
        label={label}
        value={answer}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter your answer"
      />
    );
  }

  const label = problem.direction === 'formulaFromName' ? 'Chemical formula' : 'Compound name';
  return (
    <TextField
      label={label}
      value={answer}
      onChange={(event) => onChange(event.target.value)}
      placeholder={problem.direction === 'formulaFromName' ? 'e.g. Ca(NO3)2' : 'e.g. calcium nitrate'}
      help={problem.direction === 'formulaFromName' ? 'Cation first; use parentheses for a repeated polyatomic ion.' : undefined}
    />
  );
}

function ProblemPrompt({ problem }) {
  if (problem.mode === 'balance') {
    return (
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
        Balance this reaction: <span style={{ fontFamily: 'var(--font-mono)' }}>{problem.label.toLowerCase()}</span>.
      </p>
    );
  }
  if (problem.mode === 'convert') {
    return (
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
        Convert <strong>{problem.given.value}</strong> of <span style={{ fontFamily: 'var(--font-mono)' }}>{problem.substance}</span>.
        The molar mass you calculate is {problem.subtype === 'molesToVolume' ? 'not needed' : 'yours to determine'}.
      </p>
    );
  }
  if (problem.mode === 'limiting') {
    return (
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{problem.reactants.map((entry) => `${entry.mass} g ${entry.formula}`).join(' reacts with ')}</span>.
        Identify the limiting reactant and the theoretical yield of <span style={{ fontFamily: 'var(--font-mono)' }}>{problem.product}</span>.
      </p>
    );
  }
  if (problem.mode === 'yield') {
    return (
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
        A reaction producing <span style={{ fontFamily: 'var(--font-mono)' }}>{problem.product}</span> has a theoretical yield of{' '}
        <strong>{formatNumber(problem.theoreticalMass)} g</strong>.{' '}
        {problem.variant === 'percent'
          ? `If ${formatNumber(problem.actualMass)} g is actually collected, what is the percent yield?`
          : `If the percent yield is ${problem.percent}%, what mass is actually collected?`}
      </p>
    );
  }
  return (
    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
      {problem.direction === 'formulaFromName'
        ? <>Write the chemical formula for <strong>{problem.name}</strong>.</>
        : <>Name the ionic compound <strong style={{ fontFamily: 'var(--font-mono)' }}>{problem.formula}</strong>.</>}
    </p>
  );
}

function DrillPanel({ mode, level }) {
  const [problem, setProblem] = useState(() => generateProblem(mode, { level }));
  const [answer, setAnswer] = useState(() => initialAnswer(problem));
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const startNew = () => {
    const next = generateProblem(mode, { level });
    setProblem(next);
    setAnswer(initialAnswer(next));
    setResult(null);
  };

  const check = () => {
    const graded = checkProblem(problem, answer);
    setResult(graded);
    setScore((current) => ({ correct: current.correct + (graded.correct ? 1 : 0), total: current.total + 1 }));
  };

  if (!problem) {
    return <StatusMessage tone="error">Could not generate a problem. Try another mode.</StatusMessage>;
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <StatusMessage>Practice score: {score.correct} / {score.total}</StatusMessage>
      <SectionHeading>Problem</SectionHeading>
      <ProblemPrompt problem={problem} />
      <ProblemAnswer problem={problem} answer={answer} onChange={setAnswer} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={check} disabled={!answerReady(problem, answer)}>Check answer</Button>
        <Button onClick={startNew}>New problem</Button>
      </div>

      {result && (
        <StatusMessage tone={result.correct ? 'success' : 'error'}>
          {result.correct ? 'Correct.' : 'Not quite.'} Expected: <span style={{ fontFamily: 'var(--font-mono)' }}>{result.expected}</span>
        </StatusMessage>
      )}
      {result && (
        <ResultPanel>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{problem.solution.summary}</div>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            {problem.solution.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </ResultPanel>
      )}
    </div>
  );
}

export default function StoichiometryPractice() {
  const [mode, setMode] = useState('balance');
  const [includeState, setIncludeState] = useState(false);
  const level = includeState ? 'state' : 'regional';

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ToolHeader
        purpose={PURPOSE}
        steps={STEPS}
        manualReference="Division C Rules Manual, §3.c–d, pp. C14–C15"
      >
        <ToggleSwitch
          label="Include State & National ions"
          checked={includeState}
          onChange={(event) => setIncludeState(event.target.checked)}
          help="Off uses only the Regional ion list; on adds transition-metal ions and the -ite/-ate and hypo-/per- families from §3.d."
        />
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 16 }}>
        <Tabs tabs={TABS} active={mode} onChange={setMode} ariaLabel="Stoichiometry practice modes" />
        <DrillPanel key={`${mode}-${level}`} mode={mode} level={level} />
      </Card>
    </div>
  );
}
