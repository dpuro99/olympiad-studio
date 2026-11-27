import { useEffect, useState } from 'react';
import { ACTIVE_DATA } from '../../seasons/active.js';
import {
  buildPresetList,
  elapsedSeconds,
  formatClock,
  parseDuration,
  phaseAtElapsed,
  presetById,
  remainingSeconds
} from './genericTimerUtils.js';
import {
  Button,
  Card,
  HelpText,
  ResultPanel,
  SelectField,
  StatusMessage,
  TextField,
  ToolHeader
} from './ui/primitives.jsx';

export default function GenericEventTimer() {
  const presets = buildPresetList(ACTIVE_DATA.general.timerPresets);
  const [presetId, setPresetId] = useState(presets[0].id);
  const [customInput, setCustomInput] = useState('10:00');
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState('Choose a timed window and start when you are ready.');

  const preset = presetById(presets, presetId) ?? presets[0];
  const isCustom = preset.id === 'custom';
  const customSeconds = parseDuration(customInput);
  const durationSeconds = isCustom ? customSeconds ?? 0 : preset.totalSeconds;
  const durationMs = durationSeconds * 1000;
  const elapsed = elapsedSeconds({ accumulatedMs, startedAt, now });
  const clock = formatClock(remainingSeconds(durationSeconds, elapsed));
  const phase = phaseAtElapsed(preset, elapsed);
  const citation = phase?.phase?.citation ?? preset.citation;
  const manualReference = phase?.phase?.manualReference ?? preset.manualReference;
  const running = startedAt !== null;
  const complete = durationMs > 0 && elapsed * 1000 >= durationMs;

  useEffect(() => {
    if (startedAt === null) return undefined;

    const interval = window.setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (tick - startedAt + accumulatedMs >= durationMs) {
        setAccumulatedMs(durationMs);
        setStartedAt(null);
        setMessage(`${preset.label} finished.`);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [accumulatedMs, durationMs, preset.label, startedAt]);

  const resetTimer = (nextMessage = 'Timer reset.') => {
    setAccumulatedMs(0);
    setStartedAt(null);
    setNow(Date.now());
    setMessage(nextMessage);
  };

  const handlePresetChange = (event) => {
    setPresetId(event.target.value);
    resetTimer('Preset selected. Start when you are ready.');
  };

  const handleCustomChange = (event) => {
    setCustomInput(event.target.value);
    resetTimer('Custom duration updated.');
  };

  const startTimer = () => {
    if (durationMs <= 0) {
      setMessage('Enter a valid custom duration before starting.');
      return;
    }
    const tick = Date.now();
    const baseMs = elapsed * 1000 >= durationMs ? 0 : accumulatedMs;
    setAccumulatedMs(baseMs);
    setStartedAt(tick);
    setNow(tick);
    setMessage('Timer running.');
  };

  const pauseTimer = () => {
    const tick = Date.now();
    const heldMs = startedAt === null
      ? accumulatedMs
      : Math.min(durationMs, accumulatedMs + Math.max(0, tick - startedAt));
    setAccumulatedMs(heldMs);
    setStartedAt(null);
    setNow(tick);
    setMessage('Timer paused.');
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <ToolHeader
        eyebrow="Practice timer"
        purpose="Choose a timed window from the manuals, or set your own practice interval. The countdown updates live as you run it."
        steps={[
          'Pick a preset with a printed time limit, or choose a custom duration.',
          'Start, pause, and reset as you practise a run or a written phase.',
          'Use the cited source under the clock when you need to check the official wording.'
        ]}
        manualReference={isCustom ? null : manualReference}
      />

      <Card style={{ display: 'grid', gap: 12 }}>
        <SelectField
          label="Preset"
          value={presetId}
          onChange={handlePresetChange}
          help="WIDI includes both manual-timed phases in one sequence."
        >
          {presets.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </SelectField>
        {isCustom && (
          <TextField
            label="Custom duration (mm:ss)"
            value={customInput}
            onChange={handleCustomChange}
            placeholder="10:00"
            help="Bare numbers are read as seconds. Custom intervals are practice only."
          />
        )}
        <HelpText>{isCustom ? ACTIVE_DATA.general.customNote : ACTIVE_DATA.general.timingNote}</HelpText>
        {isCustom && customSeconds === null && (
          <StatusMessage tone="error">Enter a duration as mm:ss or a whole number of seconds.</StatusMessage>
        )}
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <div
          role="timer"
          aria-label="Time remaining"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(46px, 10vw, 76px)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: complete ? 'var(--color-text-success)' : 'var(--color-text-primary)',
            textAlign: 'center',
            padding: '12px 0 4px'
          }}
        >
          {clock}
        </div>
        <StatusMessage tone={complete ? 'success' : 'status'}>{message}</StatusMessage>

        <ResultPanel>
          <div style={{ fontWeight: 700 }}>
            {phase?.total > 1
              ? `Phase ${phase.index + 1} of ${phase.total}: ${phase.phase.label}`
              : phase?.phase?.label}
          </div>
          <div style={{ marginTop: 3 }}>
            {formatClock(phase?.phaseRemainingSeconds ?? 0)} left in this phase
          </div>
          {citation && (
            <div style={{ marginTop: 6, color: 'var(--color-text-tertiary)', fontSize: 11 }}>
              Source: {citation}{manualReference ? ` · ${manualReference}` : ''}
            </div>
          )}
          {!citation && <div style={{ marginTop: 6, color: 'var(--color-text-tertiary)', fontSize: 11 }}>{ACTIVE_DATA.general.customNote}</div>}
        </ResultPanel>

        {phase?.total > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} aria-label="Timer phases">
            {preset.phases.map((item, index) => (
              <span
                key={item.id}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border-secondary)',
                  background: index === phase.index ? 'var(--color-accent-muted)' : 'var(--color-background-tertiary)',
                  color: index === phase.index ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                  fontSize: 11.5,
                  fontWeight: 600
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Button variant="primary" onClick={running ? pauseTimer : startTimer} disabled={durationMs <= 0 && !running}>
            {running ? 'Pause timer' : 'Start timer'}
          </Button>
          <Button onClick={() => resetTimer()}>Reset timer</Button>
        </div>
      </Card>
    </div>
  );
}
