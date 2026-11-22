import { useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  evaluateSwitchRun,
  generateFaultCase,
  generateMysteryCase,
  generateSwitchCase,
  gradeFault,
  gradeMystery,
  lampIsLit,
  simulateFaultVoltages,
  toggleSwitch
} from './handsOnUtils';
import {
  Button,
  Card,
  Collapsible,
  HelpText,
  NumberField,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  Tabs,
  ToolHeader
} from '../../general/ui/primitives';

const svgLabel = { fill: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' };
const svgValue = { fill: 'var(--color-accent-primary)', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700 };
const wire = { stroke: 'var(--color-text-tertiary)', strokeWidth: 2, fill: 'none' };
const hintStyle = { color: 'var(--color-text-tertiary)', fontSize: 11, lineHeight: 1.5 };

function InteractiveNode({ x, y, width, label, value, description, onClick }) {
  const activate = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    if (event.type === 'keydown') event.preventDefault();
    onClick();
  };
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={description}
      onClick={activate}
      onKeyDown={activate}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={x} y={y} width={width} height="34" rx="6"
        fill="var(--color-background-info)" stroke="var(--color-accent-primary)" strokeWidth="2"
      />
      <text x={x + width / 2} y={y + 15} textAnchor="middle" style={svgLabel}>{label}</text>
      {value !== undefined && <text x={x + width / 2} y={y + 28} textAnchor="middle" style={svgValue}>{value}</text>}
    </g>
  );
}

function SeriesBoard({ supply, components, readings, probes = [], onProbe }) {
  return (
    <svg viewBox="0 0 440 160" role="group" aria-label="Low-voltage DC series circuit" style={{ width: '100%', maxWidth: 520 }}>
      <g aria-hidden="true">
        <path d="M 40 30 H 400 V 120 H 40 V 76" {...wire} />
        <line x1="34" y1="70" x2="34" y2="86" stroke="var(--color-text-primary)" strokeWidth="3" />
        <line x1="46" y1="74" x2="46" y2="82" stroke="var(--color-text-primary)" strokeWidth="3" />
        <text x="40" y="20" textAnchor="middle" style={svgLabel}>{supply} V DC</text>
      </g>
      {components.map((component, index) => {
        const x = 90 + index * 108;
        return (
          <g key={component.id}>
            <InteractiveNode
              x={x} y={103} width={62}
              label={component.label}
              value={probes.includes(component.id) && readings[component.id] !== undefined
                ? `${readings[component.id]} V`
                : undefined}
              description={`Measure voltage across ${component.label}`}
              onClick={() => onProbe(component.id)}
            />
            <text x={x + 31} y="152" textAnchor="middle" style={svgLabel}>click / Enter to probe</text>
          </g>
        );
      })}
    </svg>
  );
}

function SwitchBoard({ positions, lit, onToggle }) {
  const blade = (x, position, name) => {
    const endY = position === 'upper' ? 42 : 70;
    return (
      <g>
        <InteractiveNode
          x={x} y={12} width={56}
          label={`SW ${name}`}
          value={position}
          description={`Switch ${name}: on ${position}. Activate to change traveler.`}
          onClick={() => onToggle(name)}
        />
        <line x1={x + 28} y1="46" x2={x + 56} y2={endY} stroke="var(--color-accent-primary)" strokeWidth="3" />
      </g>
    );
  };
  return (
    <svg viewBox="0 0 440 160" role="group" aria-label="Two SPDT switches wired to a lamp" style={{ width: '100%', maxWidth: 520 }}>
      <g aria-hidden="true">
        <path d="M 40 120 H 150 M 290 120 H 400 V 40 H 365" {...wire} />
        <line x1="40" y1="112" x2="40" y2="128" stroke="var(--color-text-primary)" strokeWidth="3" />
        <line x1="46" y1="115" x2="46" y2="125" stroke="var(--color-text-primary)" strokeWidth="3" />
        <text x="40" y="145" textAnchor="middle" style={svgLabel}>DC supply</text>
        <line x1="70" y1="42" x2="350" y2="42" {...wire} />
        <line x1="70" y1="70" x2="350" y2="70" {...wire} />
        <circle cx="385" cy="120" r="15" fill={lit ? 'var(--color-accent-primary)' : 'var(--color-background-secondary)'} stroke="var(--color-accent-primary)" strokeWidth="2" />
        <text x="385" y="150" textAnchor="middle" style={svgValue}>{lit ? 'LAMP ON' : 'LAMP OFF'}</text>
      </g>
      {blade(100, positions.a, 'A')}
      {blade(275, positions.b, 'B')}
    </svg>
  );
}

function ProbeLegend({ components, probes, readings }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {components.map((component) => (
        <span key={component.id} style={hintStyle}>
          {component.label}: {probes.includes(component.id) ? `${readings[component.id]} V` : 'not measured'}
        </span>
      ))}
    </div>
  );
}

function MysteryPanel({ caseData, task }) {
  const [probes, setProbes] = useState([]);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const components = [
    { id: 'known', label: 'R1 known' },
    { id: 'unknown', label: 'RX ?' }
  ];
  const result = checked ? gradeMystery(caseData, probes, answer) : null;
  const probe = (id) => {
    setProbes((current) => (current.includes(id) ? current : [...current, id]));
    setChecked(false);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card style={{ display: 'grid', gap: 8 }}>
        <SectionHeading>{task.label}</SectionHeading>
        <HelpText>{task.detail}</HelpText>
        <HelpText><strong>Manual:</strong> {task.citation}</HelpText>
        <HelpText>
          A {caseData.supply} V DC loop contains a known {caseData.known} Ω resistor and one hidden resistor.
          The simulated meter is ideal; readings are rounded for display only. This is a teaching circuit,
          not an event-supplied apparatus or official task.
        </HelpText>
      </Card>
      <SeriesBoard
        supply={caseData.supply}
        components={components}
        readings={caseData.readings}
        probes={probes}
        onProbe={probe}
      />
      <ProbeLegend components={components} probes={probes} readings={caseData.readings} />
      <Card style={{ display: 'grid', gap: 8 }}>
        <NumberField
          label="Your resistance for RX"
          unit="Ω"
          value={answer}
          onChange={(event) => { setAnswer(event.target.value); setChecked(false); }}
        />
        <div>
          <Button onClick={() => setChecked(true)} disabled={probes.length === 0 || answer === ''}>Check my value</Button>
        </div>
      </Card>
      {result && (
        <ResultPanel>
          <strong>{result.correct ? 'Correct — value matches the simulated resistor.' : 'Not matched yet.'}</strong>
          <p style={{ margin: '8px 0 0' }}>{result.feedback}</p>
          <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{result.derivation}</p>
          <HelpText>Simulated RX = {result.expected} Ω; accepted within {result.tolerance} Ω for display rounding.</HelpText>
        </ResultPanel>
      )}
    </div>
  );
}

function SwitchPanel({ caseData, task }) {
  const [positions, setPositions] = useState(caseData.positions);
  const [log, setLog] = useState([]);
  const lit = lampIsLit(positions);
  const progress = evaluateSwitchRun(log);
  const activate = (which) => {
    const next = toggleSwitch(positions, which);
    setPositions(next);
    setLog((current) => [...current, { switch: which, lit: lampIsLit(next) }]);
  };
  const milestones = [
    { label: 'Light the lamp', done: progress.lit },
    { label: 'Turn it off using the other switch', done: progress.offWithOther },
    { label: 'Turn it back on using the first switch', done: progress.backOnWithFirst }
  ];

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card style={{ display: 'grid', gap: 8 }}>
        <SectionHeading>{task.label}</SectionHeading>
        <HelpText>{task.detail}</HelpText>
        <HelpText><strong>Manual:</strong> {task.citation}</HelpText>
        <HelpText>
          Simulated wiring convention: each SPDT common chooses one of two travelers, and the lamp lights
          when both switches choose the same traveler. The manual names the task but prints no wiring diagram,
          so this circuit is a teaching model, not an official apparatus.
        </HelpText>
      </Card>
      <SwitchBoard positions={positions} lit={lit} onToggle={activate} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button onClick={() => activate('a')}>Activate switch A</Button>
        <Button onClick={() => activate('b')}>Activate switch B</Button>
        <Button variant="secondary" onClick={() => { setPositions(caseData.positions); setLog([]); }}>Restart wiring</Button>
      </div>
      <ResultPanel>
        <strong>
          {progress.complete
            ? 'Sequence complete — either switch can change the lamp.'
            : `${milestones.filter((item) => item.done).length} of 3 milestones done.`}
        </strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 13, lineHeight: 1.7 }}>
          {milestones.map((item) => <li key={item.label}>{item.done ? '✓' : '○'} {item.label}</li>)}
        </ul>
        <HelpText>Practice feedback only — the manual sets no task score or timing for this drill.</HelpText>
      </ResultPanel>
    </div>
  );
}

function FaultPanel({ caseData, task }) {
  const [probes, setProbes] = useState([]);
  const [answerAt, setAnswerAt] = useState('r1');
  const [answerType, setAnswerType] = useState('open');
  const [checked, setChecked] = useState(false);
  const readings = simulateFaultVoltages(caseData);
  const components = [
    { id: 'r1', label: `R1 ${caseData.resistors.r1} Ω` },
    { id: 'r2', label: `R2 ${caseData.resistors.r2} Ω` },
    { id: 'r3', label: `R3 ${caseData.resistors.r3} Ω` }
  ];
  const result = checked ? gradeFault(caseData, probes, { at: answerAt, type: answerType }) : null;
  const probe = (id) => {
    setProbes((current) => (current.includes(id) ? current : [...current, id]));
    setChecked(false);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card style={{ display: 'grid', gap: 8 }}>
        <SectionHeading>{task.label}</SectionHeading>
        <HelpText>{task.detail}</HelpText>
        <HelpText><strong>Manual:</strong> {task.citation}</HelpText>
        <HelpText>
          A {caseData.supply} V DC series loop has exactly one simulated fault — an open component or a short
          across one. The manual names troubleshooting but supplies no circuit or fault model, so this
          single-fault teaching model must not be read as an event apparatus.
        </HelpText>
      </Card>
      <SeriesBoard
        supply={caseData.supply}
        components={components}
        readings={readings}
        probes={probes}
        onProbe={probe}
      />
      <ProbeLegend components={components} probes={probes} readings={readings} />
      <Card style={{ display: 'grid', gap: 8 }}>
        <SelectField
          label="Faulty component"
          value={answerAt}
          onChange={(event) => { setAnswerAt(event.target.value); setChecked(false); }}
        >
          {components.map((component) => <option key={component.id} value={component.id}>{component.label}</option>)}
        </SelectField>
        <SelectField
          label="Fault type"
          value={answerType}
          onChange={(event) => { setAnswerType(event.target.value); setChecked(false); }}
        >
          <option value="open">Open (full supply voltage across it)</option>
          <option value="short">Short (zero voltage across it)</option>
        </SelectField>
        <div>
          <Button onClick={() => setChecked(true)} disabled={probes.length === 0}>Check my diagnosis</Button>
        </div>
      </Card>
      {result && (
        <ResultPanel>
          <strong>{result.correct ? 'Correct diagnosis.' : 'Diagnosis not matched yet.'}</strong>
          <p style={{ margin: '8px 0 0' }}>{result.feedback}</p>
          {checked && (
            <HelpText>Simulated fault: {caseData.fault.type} at {caseData.fault.at}.</HelpText>
          )}
        </ResultPanel>
      )}
    </div>
  );
}

export default function SafeHandsOnSimulator() {
  const circuit = ACTIVE_DATA.circuitlab;
  const rules = circuit.handsOn;
  const [active, setActive] = useState(rules.tasks[0].id);
  const [seed, setSeed] = useState('42');

  const numericSeed = Number.isFinite(Number(seed)) && seed !== '' ? Math.trunc(Number(seed)) : 42;
  const task = rules.tasks.find((item) => item.id === active) ?? rules.tasks[0];

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <ToolHeader
        eyebrow={`Circuit Lab C · ${ACTIVE_SEASON.year} · Manual C17`}
        purpose="Practice three low-voltage DC tasks the manual actually lists. Generate a teaching case, probe the circuit with the pointer or keyboard, and check your work — the feedback is practice-only and is not an Event Supervisor result."
        manualReference={circuit.manualReference}
        steps={[
          'Pick one of the three manual-listed task types and note its printed citation.',
          'Use the seed to make a reproducible case, then probe components in the diagram or with the labelled controls.',
          'Work from the readings, check your answer, and read the stated convention behind the simulation.'
        ]}
      >
        <StatusMessage>
          Low-voltage DC teaching models only. No soldering, high-power or AC circuit is simulated as an event task.
        </StatusMessage>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 8 }}>
        <SectionHeading>Manual context</SectionHeading>
        <HelpText><strong>{rules.context.breadboard.citation}</strong> — {rules.context.breadboard.detail}</HelpText>
        <HelpText><strong>{rules.context.safety.citation}</strong> — {rules.context.safety.detail}</HelpText>
        <HelpText><strong>{rules.context.scoring.citation}</strong> — {rules.context.scoring.detail}</HelpText>
      </Card>

      <Tabs
        tabs={rules.tasks.map((item) => ({ id: item.id, label: item.label }))}
        active={active}
        onChange={setActive}
        ariaLabel="Hands-on task types"
      />

      <Card style={{ display: 'grid', gap: 8 }}>
        <NumberField
          label="Case seed"
          value={seed}
          onChange={(event) => setSeed(event.target.value)}
          help="The seed is shown so you can return to the same case; each task gives it the same meaning."
        />
        <div>
          <Button variant="secondary" onClick={() => setSeed(String(Math.floor(Math.random() * 100000) + 1))}>
            New case
          </Button>
        </div>
      </Card>

      {active === 'mystery-resistor' && (
        <MysteryPanel key={`mystery-${numericSeed}`} caseData={generateMysteryCase(numericSeed)} task={task} />
      )}
      {active === 'three-way-switch' && (
        <SwitchPanel key={`switch-${numericSeed}`} caseData={generateSwitchCase(numericSeed)} task={task} />
      )}
      {active === 'troubleshooting' && (
        <FaultPanel key={`fault-${numericSeed}`} caseData={generateFaultCase(numericSeed)} task={task} />
      )}

      <Collapsible summary="Other manual-listed tasks (not simulated here)">
        <HelpText>
          The manual also lists these hands-on tasks. They are not v1 simulations because the rules print
          no apparatus, dataset or task key; inventing one would present fabricated content as event material.
        </HelpText>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 13, lineHeight: 1.7 }}>
          {rules.notSimulated.map((item) => (
            <li key={item.citation}>{item.detail} <strong>{item.citation}</strong></li>
          ))}
        </ul>
      </Collapsible>
    </div>
  );
}
