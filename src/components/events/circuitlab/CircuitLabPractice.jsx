import { useState } from 'react';
import { calculateSeriesParallel, calculateOhmsLaw } from './circuitUtils';
import {
  Button,
  Card,
  ListField,
  NumberField,
  ResultPanel,
  SectionHeading,
  StatusMessage,
  ToolHeader
} from '../../general/ui/primitives';

export default function CircuitLabPractice() {
  const [resistanceRows, setResistanceRows] = useState(['']);
  const [resistanceResult, setResistanceResult] = useState(null);
  const [resistanceError, setResistanceError] = useState('');
  const [ohmInputs, setOhmInputs] = useState({ voltage: '', current: '', resistance: '' });
  const [ohmResult, setOhmResult] = useState(null);
  const [ohmError, setOhmError] = useState('');

  const handleResistanceChange = (rows) => {
    setResistanceRows(rows);
    setResistanceResult(null);
    setResistanceError('');
  };

  const handleOhmChange = (field, value) => {
    setOhmInputs((current) => ({ ...current, [field]: value }));
    setOhmResult(null);
    setOhmError('');
  };

  const submitResistance = (event) => {
    event.preventDefault();
    const values = resistanceRows
      .filter((row) => row !== '')
      .map((row) => Number(row))
      .filter((value) => Number.isFinite(value));
    const result = calculateSeriesParallel({ resistances: values });
    if (result.error) {
      setResistanceError(result.error);
      setResistanceResult(null);
    } else {
      setResistanceError('');
      setResistanceResult(result);
    }
  };

  const submitOhm = (event) => {
    event.preventDefault();
    const result = calculateOhmsLaw({
      voltage: ohmInputs.voltage,
      current: ohmInputs.current,
      resistance: ohmInputs.resistance
    });
    if (result.error) {
      setOhmError(result.error);
      setOhmResult(null);
    } else {
      setOhmError('');
      setOhmResult(result);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
      <ToolHeader
        eyebrow="Circuit Lab C · 2027 · Manual C16–C17"
        purpose="A learning calculator for Ohm’s law and series/parallel equivalent resistance, driven entirely by values you enter. It is practice support, not an official event score or a substitute for the hands-on tasks."
        manualReference="2027 Division C Rules Manual, pp. C16–C17"
        steps={[
          'For equivalent resistance, add one row per resistor and enter each resistance in ohms.',
          'Choose Calculate equivalent resistance to see both the series total and the parallel total.',
          'For Ohm’s law, enter exactly two of voltage, current, and resistance; the calculator solves for the third.',
          'Keep units consistent (volts, amps, ohms).'
        ]}
      />

      <Card as="form" onSubmit={submitResistance} style={{ display: 'grid', gap: 12 }}>
        <SectionHeading style={{ fontSize: 15 }}>Equivalent resistance (series and parallel)</SectionHeading>
        <ListField
          label="Resistance values"
          unit="Ω"
          values={resistanceRows}
          onChange={handleResistanceChange}
          addLabel="Add resistor"
          placeholder="e.g. 100"
        />
        {resistanceError && <StatusMessage tone="error">{resistanceError}</StatusMessage>}
        {resistanceResult && (
          <ResultPanel style={{ display: 'grid', gap: 6 }}>
            <div>Series: <strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(resistanceResult.series.toPrecision(6))} {resistanceResult.seriesUnit}</strong> ({resistanceResult.equationSeries})</div>
            <div>Parallel: <strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(resistanceResult.parallel.toPrecision(6))} {resistanceResult.parallelUnit}</strong> ({resistanceResult.equationParallel})</div>
          </ResultPanel>
        )}
        <Button type="submit" variant="primary" style={{ justifySelf: 'start' }}>Calculate equivalent resistance</Button>
      </Card>

      <Card as="form" onSubmit={submitOhm} style={{ display: 'grid', gap: 12 }}>
        <SectionHeading style={{ fontSize: 15 }}>Ohm’s law</SectionHeading>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Enter exactly two of voltage, current, and resistance. The calculator solves for the remaining value.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <NumberField label="Voltage" unit="V" value={ohmInputs.voltage} onChange={(event) => handleOhmChange('voltage', event.target.value)} />
          <NumberField label="Current" unit="A" value={ohmInputs.current} onChange={(event) => handleOhmChange('current', event.target.value)} />
          <NumberField label="Resistance" unit="Ω" value={ohmInputs.resistance} onChange={(event) => handleOhmChange('resistance', event.target.value)} />
        </div>
        {ohmError && <StatusMessage tone="error">{ohmError}</StatusMessage>}
        {ohmResult && (
          <ResultPanel>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(ohmResult.value.toPrecision(6))} {ohmResult.unit}</strong>
            <div style={{ marginTop: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>{ohmResult.equation}</div>
          </ResultPanel>
        )}
        <Button type="submit" variant="primary" style={{ justifySelf: 'start' }}>Calculate unknown</Button>
      </Card>
    </div>
  );
}
