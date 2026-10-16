import { useEffect, useState } from 'react';
import {
  Card,
  Eyebrow,
  HelpText,
  RangeField,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  ToolHeader,
  ToggleSwitch
} from '../../general/ui/primitives';
import { LineChart } from '../../general/ui/charts';
import { clamp } from '../../general/ui/chartUtils';
import {
  LEVELS,
  MAX_VEHICLE_LENGTH_CM,
  MAX_VEHICLE_WIDTH_CM,
  PUSHER_BONUS_RATE_PT_PER_CM,
  levelById,
  scoreSweep,
  summarizeCourse
} from './courseUtils';

const STORAGE_KEY = 'olympiad-studio.electricvehicle-c.2027-course-geometry';

const DEFAULT_SCENARIO = {
  levelId: 'regional',
  bottleLineM: 2,
  targetTimeSec: 10,
  runTimeSec: 10,
  vehicleDistanceCm: 200,
  bottleDistanceCm: 30,
  pusherOpeningWidthCm: 35,
  bottleFullyPastLine: false
};

const NUMERIC_KEYS = ['bottleLineM', 'targetTimeSec', 'runTimeSec', 'vehicleDistanceCm', 'bottleDistanceCm', 'pusherOpeningWidthCm'];

function isValidScenario(value) {
  if (!value || typeof value !== 'object') return false;
  const numericOk = NUMERIC_KEYS.every((key) => Number.isFinite(value[key]));
  const levelOk = LEVELS.some((level) => level.id === value.levelId);
  return numericOk && levelOk;
}

function loadScenario() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { scenario: DEFAULT_SCENARIO, corrupted: false };
    const parsed = JSON.parse(raw);
    if (!isValidScenario(parsed)) return { scenario: DEFAULT_SCENARIO, corrupted: true };
    return { scenario: { ...DEFAULT_SCENARIO, ...parsed }, corrupted: false };
  } catch {
    return { scenario: DEFAULT_SCENARIO, corrupted: true };
  }
}

// Top-down course diagram. The bottle-line handle is a real slider: pointer
// drag *or* arrow keys move it, and the numeric range control below is the
// precise keyboard path. All positions come from props, so the surface is a
// pure function of state.
const COURSE = { w: 320, h: 132, x0: 26, x1: 300, groundY: 76, maxM: 5, minM: 0.5 };
const PX_PER_M = (COURSE.x1 - COURSE.x0) / COURSE.maxM;
const GUIDE_LEVELS = [2, 3, 4];

function roundTenth(value) {
  return Math.round(value * 10) / 10;
}

function CourseDiagram({ bottleLineM, onBottleLineChange }) {
  const [dragging, setDragging] = useState(false);
  const lineX = COURSE.x0 + bottleLineM * PX_PER_M;
  const vehiclePx = (MAX_VEHICLE_LENGTH_CM / 100) * PX_PER_M;

  const metresFromClientX = (svg, clientX) => {
    const rect = svg.getBoundingClientRect();
    const viewX = ((clientX - rect.left) / rect.width) * COURSE.w;
    return clamp(roundTenth((viewX - COURSE.x0) / PX_PER_M), COURSE.minM, COURSE.maxM);
  };
  const handleDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const handleMove = (event) => {
    if (!dragging) return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    onBottleLineChange(metresFromClientX(svg, event.clientX));
  };
  const handleUp = (event) => {
    setDragging(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const handleKey = (event) => {
    const delta = event.key === 'ArrowLeft' ? -0.1 : event.key === 'ArrowRight' ? 0.1 : 0;
    if (!delta) return;
    event.preventDefault();
    onBottleLineChange(clamp(roundTenth(bottleLineM + delta), COURSE.minM, COURSE.maxM));
  };

  return (
    <svg
      viewBox={`0 0 ${COURSE.w} ${COURSE.h}`}
      role="img"
      aria-label={`Course diagram with the bottle line at ${bottleLineM.toFixed(1)} metres`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', maxWidth: 480, height: 'auto', display: 'block' }}
    >
      <title>{`Course diagram: start line, bottle line at ${bottleLineM.toFixed(1)} m, and the reverse stop`}</title>
      <line x1={COURSE.x0} y1={COURSE.groundY} x2={COURSE.x1} y2={COURSE.groundY} stroke="var(--color-border-secondary)" />
      {GUIDE_LEVELS.map((metres) => (
        <g key={metres}>
          <line x1={COURSE.x0 + metres * PX_PER_M} y1={COURSE.groundY - 4} x2={COURSE.x0 + metres * PX_PER_M} y2={COURSE.groundY + 4} stroke="var(--color-border-tertiary)" />
          <text x={COURSE.x0 + metres * PX_PER_M} y={COURSE.groundY + 16} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)">{metres}m</text>
        </g>
      ))}
      <line x1={COURSE.x0} y1={COURSE.groundY - 26} x2={COURSE.x0} y2={COURSE.groundY} stroke="var(--color-text-secondary)" strokeDasharray="3 3" />
      <text x={COURSE.x0} y={COURSE.groundY - 30} textAnchor="middle" fontSize="9" fill="var(--color-text-secondary)">Start</text>
      <rect x={COURSE.x0} y={COURSE.groundY - 13} width={vehiclePx} height={13} rx="2" fill="var(--color-background-info)" stroke="var(--color-border-info)" />
      <text x={COURSE.x0 + vehiclePx / 2} y={COURSE.groundY - 3} textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="var(--color-text-info)">EV</text>
      <line x1={lineX} y1={COURSE.groundY - 30} x2={lineX} y2={COURSE.groundY} stroke="var(--color-text-warning)" strokeWidth="1.5" />
      <circle cx={lineX} cy={COURSE.groundY} r="5" fill="var(--color-text-warning)" />
      <line x1={lineX} y1={COURSE.groundY - 48} x2={lineX} y2={COURSE.groundY - 32} stroke="var(--color-text-warning)" />
      <text x={lineX} y={COURSE.groundY - 52} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-warning)">{bottleLineM.toFixed(1)} m</text>
      <rect
        className="ev-course-handle"
        x={lineX - 7}
        y={COURSE.groundY - 48}
        width="14"
        height="14"
        rx="3"
        tabIndex={0}
        role="slider"
        aria-label="Bottle line distance"
        aria-valuemin={COURSE.minM}
        aria-valuemax={COURSE.maxM}
        aria-valuenow={Number(bottleLineM.toFixed(1))}
        aria-valuetext={`${bottleLineM.toFixed(1)} metres`}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onKeyDown={handleKey}
      />
    </svg>
  );
}

function ScoreRow({ label, value, note }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12 }}>
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}{note ? ` — ${note}` : ''}</span>
      <span style={{ fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

export default function CourseGeometry() {
  const [initial] = useState(loadScenario);
  const [scenario, setScenario] = useState(initial.scenario);
  const [storageError, setStorageError] = useState(initial.corrupted ? 'A saved scenario could not be read, so a fresh one is shown.' : '');

  useEffect(() => {
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
      } catch {
        setStorageError('This scenario could not be saved to this browser.');
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, [scenario]);

  const setNumber = (key) => (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value)) setScenario((prev) => ({ ...prev, [key]: value }));
  };
  const setFlag = (key) => (event) => setScenario((prev) => ({ ...prev, [key]: event.target.checked }));
  const onLevelChange = (event) => {
    const levelId = event.target.value;
    setScenario((prev) => ({ ...prev, levelId, bottleLineM: levelById(levelId).bottleLineM }));
  };
  const setBottleLine = (value) => setScenario((prev) => ({ ...prev, bottleLineM: value }));

  const summary = summarizeCourse(scenario);
  const level = levelById(scenario.levelId);
  const sweep = scoreSweep({ ...scenario, centreRunTimeSec: scenario.targetTimeSec, windowSec: 2, steps: 20 });
  const sweepPoints = sweep.map((point) => ({ x: point.runTimeSec, y: point.totalScore }));
  const result = summary.runScore;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 780 }}>
      <ToolHeader
        eyebrow="Electric Vehicle C · 2027"
        title="Course pacing explorer"
        purpose="Explore the set-time then reverse course: drag the bottle line, change the target and run times, and watch the required speed and the 2027 run score respond in real time."
        manualReference="2027 Division C Rules Manual, pp. C26–C31"
        steps={[
          'Choose your competition level — the bottle line defaults to 2 m (Regional/Invitational), 3 m (State), or 4 m (National).',
          'Drag the bottle-line handle on the course diagram (or use the slider / arrow keys) to try a practice layout.',
          'Set the target time and the run time you actually achieved.',
          'Enter the measured vehicle and bottle distances and the pusher opening width.',
          'Read the required average speed and the live run-score breakdown; the chart shows how sensitive the score is to timing error.'
        ]}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          This is an educational geometry and pacing tool. It uses the verified 2027 scoring formula, but it is not an official prediction or an Event Supervisor ruling.
        </p>
      </ToolHeader>

      {storageError && <StatusMessage tone="error">{storageError}</StatusMessage>}

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Course</SectionHeading>
        <CourseDiagram bottleLineM={scenario.bottleLineM} onBottleLineChange={setBottleLine} />
        <HelpText>
          Vehicle footprint shown at the legal maximum {MAX_VEHICLE_LENGTH_CM.toFixed(1)} cm long × {MAX_VEHICLE_WIDTH_CM.toFixed(1)} cm wide. Guide marks show the 2 m, 3 m, and 4 m bottle lines.
        </HelpText>
      </Card>

      <Card style={{ display: 'grid', gap: 14 }}>
        <SectionHeading>Scenario</SectionHeading>
        <SelectField label="Level (sets the bottle-line default)" value={scenario.levelId} onChange={onLevelChange} style={{ maxWidth: 320 }}>
          {LEVELS.map((entry) => (
            <option key={entry.id} value={entry.id}>{entry.label} — {entry.bottleLineM} m</option>
          ))}
        </SelectField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <RangeField label="Bottle line distance" unit="m" value={scenario.bottleLineM} onChange={setNumber('bottleLineM')} min={COURSE.minM} max={COURSE.maxM} step={0.1} format={(value) => value.toFixed(1)} help={`${level.label} default: ${level.bottleLineM} m`} />
          <RangeField label="Target time" unit="s" value={scenario.targetTimeSec} onChange={setNumber('targetTimeSec')} min={3} max={30} step={0.5} format={(value) => value.toFixed(1)} />
          <RangeField label="Run time achieved" unit="s" value={scenario.runTimeSec} onChange={setNumber('runTimeSec')} min={3} max={30} step={0.5} format={(value) => value.toFixed(1)} />
          <RangeField label="Vehicle distance" unit="cm" value={scenario.vehicleDistanceCm} onChange={setNumber('vehicleDistanceCm')} min={0} max={1000} step={5} />
          <RangeField label="Bottle distance past line" unit="cm" value={scenario.bottleDistanceCm} onChange={setNumber('bottleDistanceCm')} min={0} max={200} step={5} />
          <RangeField label="Pusher opening width" unit="cm" value={scenario.pusherOpeningWidthCm} onChange={setNumber('pusherOpeningWidthCm')} min={30} max={45} step={0.1} format={(value) => value.toFixed(1)} help={`Bonus ${PUSHER_BONUS_RATE_PT_PER_CM} pt/cm above 35.0 cm, as measured by the ES.`} />
        </div>

        <ToggleSwitch label="Bottle finished fully past the bottle line (−20 bonus)" checked={scenario.bottleFullyPastLine} onChange={setFlag('bottleFullyPastLine')} />
      </Card>

      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Live readouts</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <ResultPanel style={{ display: 'grid', gap: 2 }}>
            <Eyebrow>Required average speed</Eyebrow>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15 }}>
              {summary.requiredSpeedMps === null ? '—' : `${summary.requiredSpeedMps.toFixed(2)} m/s`}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {summary.requiredSpeedKmh === null ? '—' : `${summary.requiredSpeedKmh.toFixed(2)} km/h`}
            </div>
          </ResultPanel>
          <ResultPanel style={{ display: 'grid', gap: 2 }}>
            <Eyebrow>Timing error</Eyebrow>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15 }}>
              {summary.timeErrorSec === null ? '—' : `${summary.timeErrorSec.toFixed(2)} s`}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>|target − run| → time term</div>
          </ResultPanel>
        </div>
        <HelpText>
          The required-speed figure assumes a constant speed to reach the bottle line within the target time. The manual does not require constant speed; treat this as a planning aid, not a rule.
        </HelpText>
      </Card>

      {result && (
        <Card style={{ display: 'grid', gap: 10 }}>
          <SectionHeading>Run score breakdown</SectionHeading>
          <ScoreRow label="Base" value={result.baseScore.toFixed(0)} />
          <ScoreRow label="Distance component" note="2 × vehicle + bottle" value={result.distanceScore.toFixed(0)} />
          <ScoreRow label="Time component" note="0.5 × |target − run|" value={result.timeScore.toFixed(2)} />
          <ScoreRow label="Bottle bonus" value={result.bottleBonus.toFixed(0)} />
          <ScoreRow label="Pusher bonus" value={result.pusherBonus.toFixed(2)} />
          <div style={{ borderTop: '1px solid var(--color-border-tertiary)', paddingTop: 8 }}>
            <ScoreRow label="Total run score (low is better)" value={result.totalScore.toFixed(2)} />
          </div>
          <HelpText>
            Run penalties (competition +150, construction +300, non-modification +50) are not modelled here; see the Score Calculator for a full run with penalties and the two-run final score.
          </HelpText>
        </Card>
      )}

      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Timing sensitivity</SectionHeading>
        <LineChart
          points={sweepPoints}
          caption="Run score versus run time across a four-second window centred on the target time"
          xLabel="Run time (s)"
          yLabel="Run score"
        />
        <HelpText>
          Lower is better. The curve bottoms out at the target time, where the time term is zero; the steepness shows how much a timing error costs.
        </HelpText>
      </Card>
    </div>
  );
}
