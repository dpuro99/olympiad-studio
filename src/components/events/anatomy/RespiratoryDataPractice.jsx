import { useMemo, useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import {
  PATTERN_IDS,
  PATTERN_LABELS,
  REFERENCE_P50,
  SHIFT_IDS,
  SHIFT_LABELS,
  checkGasExchange,
  checkSpirometry,
  expiratoryFlow,
  generateGasExchangeCase,
  generateSpirometryCase,
  inspiratoryFlow,
  oxygenSaturation,
  sampleLoop,
  sampleOxygenCurve
} from './respiratoryDataUtils.js';
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
  Stepper,
  Tabs,
  ToolHeader
} from '../../general/ui/primitives';

const MODES = [
  { id: 'spirometry', label: 'Spirometry & flow-volume' },
  { id: 'gas', label: 'Gas exchange & O₂–Hb' }
];

const WORKFLOW = [
  { label: 'Choose a case' },
  { label: 'Read the plot' },
  { label: 'Classify & check' }
];

const STEPS = [
  'Leave the case type on Random, or pick normal, obstructive, or restrictive to drill one pattern.',
  'Move the slider to read flow or saturation off the generated plot; the lung-volume table gives the rest.',
  'Enter the computed values and the pattern, then press Check to grade and reveal the reasoning.',
  'Press New case for another one. Scores are practice only and last just for this visit.'
];

const SIMULATION_NOTICE = 'Generated teaching data — not patient measurements and not official Science Olympiad answers.';
const LEVEL_NOTE =
  'This tool stays on the Regional respiratory topics the manual lists: lung volumes, spirometry, ' +
  'flow-volume loops, gas exchange and oxygen transport. Respiratory regulation and additional ' +
  'disorders are State/National content and are not modelled here.';

const radioStyle = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)' };

function ChoiceGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 6 }}>
      <legend style={{ color: 'var(--color-text-secondary)', fontSize: 12, padding: 0, fontWeight: 500 }}>{legend}</legend>
      <div role="radiogroup" aria-label={legend} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {options.map((option) => (
          <label key={option.id} style={radioStyle}>
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={(event) => onChange(event.target.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function linePath(points, toX, toY) {
  return points.map((point, index) => `${index ? 'L' : 'M'} ${toX(point.x).toFixed(1)} ${toY(point.y).toFixed(1)}`).join(' ');
}

// ---------------------------------------------------------------------------
// Spirometry: generated flow-volume loop + volume table
// ---------------------------------------------------------------------------

function FlowVolumeLoop({ caseData, cursorFraction, onCursorChange }) {
  const { expiratory, inspiratory, fvc } = useMemo(() => sampleLoop(caseData, 60), [caseData]);
  const width = 520;
  const height = 260;
  const left = 56;
  const right = 18;
  const top = 18;
  const bottom = 38;
  const maxFlow = caseData.pef * 1.12;
  const minFlow = -caseData.pef * 0.7;
  const toX = (volume) => left + (volume / fvc) * (width - left - right);
  const toY = (flow) => top + ((maxFlow - flow) / (maxFlow - minFlow)) * (height - top - bottom);
  const cursorVolume = (fvc * cursorFraction) / 100;
  const expFlow = expiratoryFlow(caseData, cursorVolume);
  const inspFlow = inspiratoryFlow(caseData, cursorVolume);
  const axis = 'var(--color-border-secondary)';

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', maxWidth: 560 }}
        role="img"
        aria-label={`Generated flow-volume loop: ${caseData.label.toLowerCase()} pattern, forced vital capacity ${fvc} millilitres, peak expiratory flow ${caseData.pef} litres per minute.`}
      >
        <line x1={left} y1={toY(0)} x2={width - right} y2={toY(0)} stroke={axis} strokeWidth={1} />
        <line x1={left} y1={top} x2={left} y2={height - bottom} stroke={axis} strokeWidth={1} />
        <line x1={width - right} y1={top} x2={width - right} y2={height - bottom} stroke={axis} strokeWidth={1} />
        <path d={linePath(inspiratory, toX, toY)} fill="none" stroke="var(--color-accent-secondary)" strokeWidth={2.5} />
        <path d={linePath(expiratory, toX, toY)} fill="none" stroke="var(--color-accent-primary)" strokeWidth={2.5} />
        <line
          x1={toX(cursorVolume)} y1={top} x2={toX(cursorVolume)} y2={height - bottom}
          stroke="var(--color-text-tertiary)" strokeWidth={1} strokeDasharray="4 4"
        />
        <circle cx={toX(cursorVolume)} cy={toY(expFlow)} r={4} fill="var(--color-accent-primary)" />
        <circle cx={toX(cursorVolume)} cy={toY(inspFlow)} r={4} fill="var(--color-accent-secondary)" />
        <text x={left} y={height - bottom + 16} fontSize={11} fill="var(--color-text-tertiary)">0 (RV)</text>
        <text x={width - right} y={height - bottom + 16} fontSize={11} fill="var(--color-text-tertiary)" textAnchor="end">{fvc} mL (TLC)</text>
        <text x={left - 8} y={toY(0) + 4} fontSize={11} fill="var(--color-text-tertiary)" textAnchor="end">0</text>
        <text x={left - 8} y={toY(caseData.pef) + 4} fontSize={11} fill="var(--color-text-tertiary)" textAnchor="end">{caseData.pef}</text>
        <text x={(width + left - right) / 2} y={height - 4} fontSize={11} fill="var(--color-text-tertiary)" textAnchor="middle">Volume above RV (mL)</text>
        <text x={14} y={(height - bottom + top) / 2} fontSize={11} fill="var(--color-text-tertiary)" textAnchor="middle" transform={`rotate(-90 14 ${(height - bottom + top) / 2})`}>Flow (L/min)</text>
      </svg>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={cursorFraction}
        onChange={(event) => onCursorChange(Number(event.target.value))}
        aria-label="Read flow at volume"
        style={{ width: '100%', accentColor: 'var(--color-accent-primary)' }}
      />
      <StatusMessage>
        At <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(cursorVolume)} mL</span> above RV:{' '}
        expiratory <span style={{ fontFamily: 'var(--font-mono)' }}>{expFlow} L/min</span>, inspiratory{' '}
        <span style={{ fontFamily: 'var(--font-mono)' }}>{inspFlow} L/min</span>.
      </StatusMessage>
    </div>
  );
}

const VOLUME_ROWS = [
  ['TV', 'Tidal volume'],
  ['IRV', 'Inspiratory reserve volume'],
  ['ERV', 'Expiratory reserve volume'],
  ['RV', 'Residual volume'],
  ['tlc', 'Total lung capacity'],
  ['fvc', 'Forced vital capacity'],
  ['fev1', 'FEV₁']
];

function SpiroPanel() {
  const [type, setType] = useState('');
  const [seed, setSeed] = useState(7);
  const [answer, setAnswer] = useState({ fvc: '', ratio: '', pattern: '' });
  const [result, setResult] = useState(null);
  const [cursorFraction, setCursorFraction] = useState(50);

  const caseData = useMemo(
    () => generateSpirometryCase({ type: type || undefined, seed }),
    [type, seed]
  );

  const setField = (field, value) => {
    setAnswer((current) => ({ ...current, [field]: value }));
    setResult(null);
  };
  const newCase = () => {
    setSeed((current) => current + 1);
    setAnswer({ fvc: '', ratio: '', pattern: '' });
    setResult(null);
  };
  const ready = String(answer.fvc).trim() !== '' && String(answer.ratio).trim() !== '' && answer.pattern !== '';
  const check = () => setResult(checkSpirometry(caseData, answer));

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Stepper steps={WORKFLOW} currentStep={result ? 2 : ready ? 1 : 0} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: 220, flex: 1 }}>
          <SelectField label="Case type" value={type} onChange={(event) => {
            setType(event.target.value);
            setAnswer({ fvc: '', ratio: '', pattern: '' });
            setResult(null);
          }}>
            <option value="">Random</option>
            {PATTERN_IDS.map((id) => <option key={id} value={id}>{PATTERN_LABELS[id]}</option>)}
          </SelectField>
        </div>
        <Button onClick={newCase}>New case</Button>
      </div>
      <HelpText>Case #{caseData.seed} · generated from the manual-listed respiratory topics, with a fixed seed so you can return to it.</HelpText>

      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Flow-volume loop</SectionHeading>
        <FlowVolumeLoop caseData={caseData} cursorFraction={cursorFraction} onCursorChange={setCursorFraction} />
      </Card>

      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Lung volumes and capacities</SectionHeading>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <caption style={{ textAlign: 'left', color: 'var(--color-text-tertiary)', fontSize: 12, paddingBottom: 6 }}>
            All values in mL. Total lung capacity and forced vital capacity are sums you can check yourself.
          </caption>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Measure</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Name</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {VOLUME_ROWS.map(([key, name]) => (
              <tr key={key}>
                <td style={{ padding: '5px 8px', fontFamily: 'var(--font-mono)' }}>{key === 'tlc' ? 'TLC' : key === 'fvc' ? 'FVC' : key === 'fev1' ? 'FEV₁' : key}</td>
                <td style={{ padding: '5px 8px', color: 'var(--color-text-secondary)' }}>{name}</td>
                <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{caseData.volumes[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{ display: 'grid', gap: 14 }}>
        <SectionHeading>Your read</SectionHeading>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <NumberField label="FVC from the volumes" unit="mL" value={answer.fvc} onChange={(event) => setField('fvc', event.target.value)} />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <NumberField label="FEV1 / FVC" value={answer.ratio} onChange={(event) => setField('ratio', event.target.value)} help="A decimal such as 0.78." />
          </div>
        </div>
        <ChoiceGroup
          legend="Pattern"
          name="spiro-pattern"
          options={PATTERN_IDS.map((id) => ({ id, label: PATTERN_LABELS[id] }))}
          value={answer.pattern}
          onChange={(value) => setField('pattern', value)}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={check} disabled={!ready}>Check answers</Button>
          <Button onClick={newCase}>New case</Button>
        </div>

        {result && (
          <>
            <StatusMessage tone={result.correct ? 'success' : 'error'}>
              {result.correct ? 'Correct.' : 'Not quite.'} FVC {result.checks.fvc ? '✓' : '✗'} · FEV1/FVC{' '}
              {result.checks.ratio ? '✓' : '✗'} · pattern {result.checks.pattern ? '✓' : '✗'}
            </StatusMessage>
            <ResultPanel>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Expected: FVC {result.expected.fvc} mL · FEV₁ {result.expected.fev1} mL · FEV1/FVC {result.expected.ratio} · {result.expected.patternLabel}</div>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{result.reasoning}</p>
            </ResultPanel>
          </>
        )}
        <Collapsible summary="Level note and manual scope">
          <HelpText>{LEVEL_NOTE} Source: {ACTIVE_DATA.anatomy.manualReference}.</HelpText>
        </Collapsible>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gas exchange: O2-haemoglobin dissociation curve
// ---------------------------------------------------------------------------

function OxygenCurve({ caseData, cursorPo2, onCursorChange }) {
  const casePoints = useMemo(() => sampleOxygenCurve(caseData.p50, 60), [caseData.p50]);
  const referencePoints = useMemo(() => sampleOxygenCurve(REFERENCE_P50, 60), []);
  const width = 520;
  const height = 260;
  const left = 56;
  const right = 18;
  const top = 18;
  const bottom = 38;
  const toX = (po2) => left + (po2 / 120) * (width - left - right);
  const toY = (sat) => top + ((100 - sat) / 100) * (height - top - bottom);
  const caseSat = oxygenSaturation(cursorPo2, caseData.p50);
  const refSat = oxygenSaturation(cursorPo2, REFERENCE_P50);
  const axis = 'var(--color-border-secondary)';

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', maxWidth: 560 }}
        role="img"
        aria-label={`Oxygen-haemoglobin curve for a ${caseData.label.toLowerCase()} generated case with P50 ${caseData.p50} millimetres of mercury, drawn against the reference curve.`}
      >
        <line x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} stroke={axis} strokeWidth={1} />
        <line x1={left} y1={top} x2={left} y2={height - bottom} stroke={axis} strokeWidth={1} />
        <path d={linePath(referencePoints, toX, toY)} fill="none" stroke="var(--color-text-tertiary)" strokeWidth={2} strokeDasharray="6 5" />
        <path d={linePath(casePoints, toX, toY)} fill="none" stroke="var(--color-accent-primary)" strokeWidth={2.5} />
        <line
          x1={toX(cursorPo2)} y1={top} x2={toX(cursorPo2)} y2={height - bottom}
          stroke="var(--color-text-tertiary)" strokeWidth={1} strokeDasharray="4 4"
        />
        <circle cx={toX(cursorPo2)} cy={toY(caseSat)} r={4} fill="var(--color-accent-primary)" />
        <circle cx={toX(cursorPo2)} cy={toY(refSat)} r={4} fill="var(--color-text-tertiary)" />
        <text x={left} y={height - bottom + 16} fontSize={11} fill="var(--color-text-tertiary)">0</text>
        <text x={width - right} y={height - bottom + 16} fontSize={11} fill="var(--color-text-tertiary)" textAnchor="end">120 mmHg</text>
        <text x={left - 8} y={toY(0) + 4} fontSize={11} fill="var(--color-text-tertiary)" textAnchor="end">0%</text>
        <text x={left - 8} y={toY(100) + 4} fontSize={11} fill="var(--color-text-tertiary)" textAnchor="end">100%</text>
        <text x={(width + left - right) / 2} y={height - 4} fontSize={11} fill="var(--color-text-tertiary)" textAnchor="middle">PO₂ (mmHg)</text>
        <text x={14} y={(height - bottom + top) / 2} fontSize={11} fill="var(--color-text-tertiary)" textAnchor="middle" transform={`rotate(-90 14 ${(height - bottom + top) / 2})`}>Saturation (%)</text>
      </svg>
      <input
        type="range"
        min="0"
        max="120"
        step="1"
        value={cursorPo2}
        onChange={(event) => onCursorChange(Number(event.target.value))}
        aria-label="Read saturation at PO2"
        style={{ width: '100%', accentColor: 'var(--color-accent-primary)' }}
      />
      <StatusMessage>
        At PO₂ <span style={{ fontFamily: 'var(--font-mono)' }}>{cursorPo2} mmHg</span>: case curve{' '}
        <span style={{ fontFamily: 'var(--font-mono)' }}>{caseSat}%</span>, reference curve{' '}
        <span style={{ fontFamily: 'var(--font-mono)' }}>{refSat}%</span>. Dashed = reference (P50 {REFERENCE_P50} mmHg).
      </StatusMessage>
    </div>
  );
}

function GasPanel() {
  const [shift, setShift] = useState('');
  const [seed, setSeed] = useState(11);
  const [answer, setAnswer] = useState({ saturation: '', shift: '' });
  const [result, setResult] = useState(null);
  const [cursorPo2, setCursorPo2] = useState(70);

  const caseData = useMemo(
    () => generateGasExchangeCase({ shift: shift || undefined, seed }),
    [shift, seed]
  );

  const setField = (field, value) => {
    setAnswer((current) => ({ ...current, [field]: value }));
    setResult(null);
  };
  const newCase = () => {
    setSeed((current) => current + 1);
    setAnswer({ saturation: '', shift: '' });
    setResult(null);
  };
  const ready = String(answer.saturation).trim() !== '' && answer.shift !== '';
  const check = () => setResult(checkGasExchange(caseData, answer));

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Stepper steps={WORKFLOW} currentStep={result ? 2 : ready ? 1 : 0} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: 220, flex: 1 }}>
          <SelectField label="Case shift" value={shift} onChange={(event) => {
            setShift(event.target.value);
            setAnswer({ saturation: '', shift: '' });
            setResult(null);
          }}>
            <option value="">Random</option>
            {SHIFT_IDS.map((id) => <option key={id} value={id}>{SHIFT_LABELS[id]}</option>)}
          </SelectField>
        </div>
        <Button onClick={newCase}>New case</Button>
      </div>
      <ResultPanel>
        In this generated case the PaO₂ is <span style={{ fontFamily: 'var(--font-mono)' }}>{caseData.po2} mmHg</span> and P50 is{' '}
        <span style={{ fontFamily: 'var(--font-mono)' }}>{caseData.p50} mmHg</span>. Read saturation off the solid case curve.
      </ResultPanel>

      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Oxygen–haemoglobin curve</SectionHeading>
        <OxygenCurve caseData={caseData} cursorPo2={cursorPo2} onCursorChange={setCursorPo2} />
      </Card>

      <Card style={{ display: 'grid', gap: 14 }}>
        <SectionHeading>Your read</SectionHeading>
        <div style={{ maxWidth: 260 }}>
          <NumberField label="Saturation at the case PaO2" unit="%" value={answer.saturation} onChange={(event) => setField('saturation', event.target.value)} />
        </div>
        <ChoiceGroup
          legend="Curve shift"
          name="gas-shift"
          options={SHIFT_IDS.map((id) => ({ id, label: SHIFT_LABELS[id] }))}
          value={answer.shift}
          onChange={(value) => setField('shift', value)}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={check} disabled={!ready}>Check answers</Button>
          <Button onClick={newCase}>New case</Button>
        </div>

        {result && (
          <>
            <StatusMessage tone={result.correct ? 'success' : 'error'}>
              {result.correct ? 'Correct.' : 'Not quite.'} Saturation {result.checks.saturation ? '✓' : '✗'} · shift{' '}
              {result.checks.shift ? '✓' : '✗'}
            </StatusMessage>
            <ResultPanel>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Expected: saturation {result.expected.saturation}% · {result.expected.shiftLabel} (reference curve at this PO₂: {result.expected.referenceSaturation}%)
              </div>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{result.reasoning}</p>
            </ResultPanel>
          </>
        )}
        <Collapsible summary="Level note and manual scope">
          <HelpText>{LEVEL_NOTE} Source: {ACTIVE_DATA.anatomy.manualReference}.</HelpText>
        </Collapsible>
      </Card>
    </div>
  );
}

export default function RespiratoryDataPractice() {
  const [mode, setMode] = useState('spirometry');
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ToolHeader
        purpose="Read generated respiratory data the way the event asks you to: interpret lung volumes and a flow-volume loop, or an oxygen–haemoglobin curve, then classify the pattern and check your reasoning. Every case is generated fresh — there is no fixed question bank, and results are practice only."
        steps={STEPS}
        manualReference={ACTIVE_DATA.anatomy.manualReference}
      >
        <StatusMessage>{SIMULATION_NOTICE}</StatusMessage>
      </ToolHeader>
      <Card style={{ display: 'grid', gap: 16 }}>
        <Tabs tabs={MODES} active={mode} onChange={setMode} ariaLabel="Respiratory data practice modes" />
        {mode === 'spirometry' ? <SpiroPanel /> : <GasPanel />}
      </Card>
    </div>
  );
}
