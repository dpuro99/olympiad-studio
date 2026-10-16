import { useState } from 'react';
import { calculateSeriesParallel, calculateOhmsLaw, parseResistanceRows } from './circuitUtils';
import { Card, HelpText, ListField, NumberField, ResultPanel, SectionHeading, StatusMessage, ToolHeader } from '../../general/ui/primitives';

const SOURCE = '2027 Division C Rules Manual, pp. C16–C17';

function formatNumber(value) {
  if (!Number.isFinite(value)) return '—';
  return String(Number(value.toPrecision(6)));
}

// A resistor drawn as a labelled box. Presentational only; the parent lays it out.
function ResistorBox({ x, y, width, height, label, vertical = false }) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height} rx={4}
        fill="var(--color-background-tertiary)" stroke="var(--color-text-info)" strokeWidth={1.5}
      />
      <text
        x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fontFamily="var(--font-mono)" fontSize={11} fill="var(--color-text-primary)"
        transform={vertical ? `rotate(-90 ${cx} ${cy})` : undefined}
      >
        {label}
      </text>
    </g>
  );
}

// Live series + parallel schematic. Redraws as resistors are added or edited.
function ResistorNetworkDiagram({ values }) {
  const shown = values.slice(0, 8);
  const extra = values.length - shown.length;
  const n = shown.length;
  const labels = shown.map((value) => `${formatNumber(value)} Ω`);
  const step = n > 1 ? 560 / (n - 1) : 0;
  const boxW = n > 1 ? Math.min(64, step * 0.72) : 64;
  const boxH = 30;

  return (
    <svg
      viewBox="0 0 640 250" width="100%" role="img"
      aria-label={`Series and parallel schematic for ${n} resistor${n === 1 ? '' : 's'}${extra > 0 ? `, showing the first 8` : ''}`}
      style={{ display: 'block', maxWidth: 640, height: 'auto' }}
    >
      <line x1={40} y1={40} x2={600} y2={40} stroke="var(--color-border-secondary)" strokeWidth={2} />
      <text x={40} y={26} fontFamily="var(--font-mono)" fontSize={11} fill="var(--color-text-secondary)">Series</text>
      {shown.map((_, index) => {
        const cx = n > 1 ? 40 + index * step : 320;
        return (
          <ResistorBox key={`s${index}`} x={cx - boxW / 2} y={40 - boxH / 2} width={boxW} height={boxH} label={labels[index]} />
        );
      })}

      <line x1={40} y1={150} x2={600} y2={150} stroke="var(--color-border-secondary)" strokeWidth={2} />
      <line x1={40} y1={150} x2={40} y2={220} stroke="var(--color-border-secondary)" strokeWidth={2} />
      <line x1={600} y1={150} x2={600} y2={220} stroke="var(--color-border-secondary)" strokeWidth={2} />
      <line x1={40} y1={220} x2={600} y2={220} stroke="var(--color-border-secondary)" strokeWidth={2} />
      <text x={40} y={136} fontFamily="var(--font-mono)" fontSize={11} fill="var(--color-text-secondary)">Parallel</text>
      {shown.map((_, index) => {
        const cx = n > 1 ? 40 + index * step : 320;
        return (
          <g key={`p${index}`}>
            <line x1={cx} y1={150} x2={cx} y2={172} stroke="var(--color-border-secondary)" strokeWidth={2} />
            <ResistorBox x={cx - 15} y={172} width={30} height={26} label={labels[index]} vertical />
            <line x1={cx} y1={198} x2={cx} y2={220} stroke="var(--color-border-secondary)" strokeWidth={2} />
          </g>
        );
      })}
      {extra > 0 && (
        <text x={320} y={244} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} fill="var(--color-text-secondary)">
          +{extra} more not drawn
        </text>
      )}
    </svg>
  );
}

function ohmUnknown(inputs) {
  const has = (field) => String(inputs[field]).trim() !== '';
  if (has('voltage') && has('current')) return 'resistance';
  if (has('voltage') && has('resistance')) return 'current';
  if (has('current') && has('resistance')) return 'voltage';
  return null;
}

// The Ohm's-law triangle with the solved-for quantity highlighted.
function OhmsLawTriangle({ unknown, result }) {
  const colour = (field) => (unknown === field ? 'var(--color-text-info)' : 'var(--color-text-secondary)');
  const weight = (field) => (unknown === field ? 700 : 400);
  const value = unknown === 'resistance' ? 'R' : unknown === 'current' ? 'I' : unknown === 'voltage' ? 'V' : '';
  return (
    <svg viewBox="0 0 220 190" width="160" role="img" aria-label="Ohm's law triangle: V equals I times R"
      style={{ display: 'block', height: 'auto' }}>
      <polygon points="110,20 20,170 200,170" fill="var(--color-background-tertiary)" stroke="var(--color-border-secondary)" strokeWidth={2} />
      <line x1={110} y1={20} x2={110} y2={170} stroke="var(--color-border-tertiary)" strokeWidth={1} />
      <line x1={65} y1={95} x2={155} y2={95} stroke="var(--color-border-tertiary)" strokeWidth={1} />
      <text x={110} y={80} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={22} fill={colour('voltage')} fontWeight={weight('voltage')} dominantBaseline="central">V</text>
      <text x={75} y={140} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={20} fill={colour('current')} fontWeight={weight('current')} dominantBaseline="central">I</text>
      <text x={150} y={140} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={20} fill={colour('resistance')} fontWeight={weight('resistance')} dominantBaseline="central">R</text>
      {unknown && result && (
        <text x={110} y={188} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={12} fill="var(--color-text-info)">
          {value} = {formatNumber(result.value)} {result.unit}
        </text>
      )}
    </svg>
  );
}

export default function CircuitLabPractice() {
  const [resistanceRows, setResistanceRows] = useState(['']);
  const [ohmInputs, setOhmInputs] = useState({ voltage: '', current: '', resistance: '' });

  const parsed = parseResistanceRows(resistanceRows);
  let resistanceResult = null;
  let resistanceError = null;
  if (parsed.error) {
    resistanceError = parsed.error;
  } else if (parsed.values.length === 1) {
    const only = parsed.values[0];
    resistanceResult = {
      series: only, parallel: only, seriesUnit: 'Ω', parallelUnit: 'Ω',
      equationSeries: 'R_eq = ΣR_i', equationParallel: '1/R_eq = Σ(1/R_i)'
    };
  } else if (parsed.values.length >= 2) {
    resistanceResult = calculateSeriesParallel({ resistances: parsed.values });
  }

  const providedOhm = ['voltage', 'current', 'resistance'].filter((field) => String(ohmInputs[field]).trim() !== '');
  const unknown = ohmUnknown(ohmInputs);
  const ohmComputation = providedOhm.length >= 2
    ? calculateOhmsLaw({ voltage: ohmInputs.voltage, current: ohmInputs.current, resistance: ohmInputs.resistance })
    : null;
  const ohmResult = ohmComputation && !ohmComputation.error ? ohmComputation : null;
  const ohmError = ohmComputation && ohmComputation.error ? ohmComputation.error : null;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
      <ToolHeader
        eyebrow="Circuit Lab C · 2027 · Manual C16–C17"
        purpose="A live learning calculator for Ohm’s law and series/parallel equivalent resistance. Readouts and the schematic update as you type; it is practice support, not an official event score or a substitute for the hands-on tasks."
        manualReference={SOURCE}
        steps={[
          'For equivalent resistance, add one row per resistor and enter each resistance in ohms; the series and parallel results update as you type.',
          'For Ohm’s law, enter exactly two of voltage, current, and resistance; the remaining value is solved live and highlighted on the triangle.'
        ]}
      />

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Equivalent resistance</SectionHeading>
        <HelpText>Resistances in ohms. The schematic and both equivalent values update as you type.</HelpText>
        <ListField label="Resistance values" unit="Ω" values={resistanceRows} onChange={setResistanceRows} addLabel="Add resistor"
          placeholder="e.g. 100" help="Leave unused rows blank." />
        <ResistorNetworkDiagram values={parsed.error ? [] : parsed.values} />
        {resistanceError && <StatusMessage tone="error">{resistanceError}</StatusMessage>}
        {resistanceResult && (
          <ResultPanel style={{ display: 'grid', gap: 4 }}>
            <div>Series: <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(resistanceResult.series)} {resistanceResult.seriesUnit}</strong> ({resistanceResult.equationSeries})</div>
            <div>Parallel: <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(resistanceResult.parallel)} {resistanceResult.parallelUnit}</strong> ({resistanceResult.equationParallel})</div>
          </ResultPanel>
        )}
        {!resistanceError && !resistanceResult && <HelpText>Add at least one resistance to see the results.</HelpText>}
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Ohm’s law</SectionHeading>
        <HelpText>Enter exactly two of voltage, current, and resistance. The third is solved live.</HelpText>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <NumberField label="Voltage" unit="V" value={ohmInputs.voltage} onChange={(event) => setOhmInputs((current) => ({ ...current, voltage: event.target.value }))} />
          <NumberField label="Current" unit="A" value={ohmInputs.current} onChange={(event) => setOhmInputs((current) => ({ ...current, current: event.target.value }))} />
          <NumberField label="Resistance" unit="Ω" value={ohmInputs.resistance} onChange={(event) => setOhmInputs((current) => ({ ...current, resistance: event.target.value }))} />
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <OhmsLawTriangle unknown={unknown} result={ohmResult} />
          <div style={{ flex: '1 1 220px', minWidth: 200 }}>
            {ohmError && <StatusMessage tone="error">{ohmError}</StatusMessage>}
            {ohmResult && (
              <ResultPanel>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(ohmResult.value)} {ohmResult.unit}</strong>
                <div style={{ marginTop: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>{ohmResult.equation}</div>
              </ResultPanel>
            )}
            {!ohmError && !ohmResult && <HelpText>Enter two known values to solve the third.</HelpText>}
          </div>
        </div>
      </Card>
    </div>
  );
}
