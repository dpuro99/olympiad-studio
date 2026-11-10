import { useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  CASE_KINDS,
  checkAnswers,
  formatCaseValue,
  generateCase
} from './mapPracticeUtils';
import {
  Button,
  Card,
  HelpText,
  NumberField,
  ResultPanel,
  SectionHeading,
  StatusMessage,
  Tabs,
  ToolHeader
} from '../../general/ui/primitives';

const TABS = [
  { id: 'contour', label: 'Contour gradient' },
  { id: 'streamOrder', label: 'Stream order' },
  { id: 'wellMap', label: 'Water table' },
  { id: 'hydrograph', label: 'Hydrograph' }
];

const PURPOSE = 'Practise the interpretation tasks Dynamic Planet asks for: contour gradients on a topographic map, Strahler stream order, a water table drawn from well data, and a storm hydrograph. Every case is generated from a seed, so you can retry the same case or move on to a new one.';

const STEPS = [
  'Pick a case type and read the diagram.',
  'Enter your answers, or keep the seed and try the same case again.',
  'Check your answers to see the worked reasoning and the revealed map.',
];

const bodyText = { margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 };
const captionText = { ...bodyText, fontSize: 10 };
const questionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 };
const actionRow = { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' };
const citationStyle = { ...bodyText, borderTop: '1px solid var(--color-border-tertiary)', paddingTop: 8 };
const figureStyle = { width: '100%', height: 'auto', display: 'block', maxWidth: 560 };
const ink = 'var(--color-text-primary)';
const muted = 'var(--color-text-secondary)';
const accent = 'var(--color-text-info)';

const initialSession = () => ({
  seed: '1',
  answers: {},
  checked: false
});

const seedFrom = (text) => {
  const parsed = Number.parseInt(text, 10);
  if (!Number.isInteger(parsed)) return 1;
  return Math.abs(parsed) % 1000000 || 1;
};

// ---------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------

const MAP_WIDTH = 420;
const MAP_HEIGHT = 300;
const MAP_PAD = { left: 18, right: 16, top: 14, bottom: 34 };
const mapPlotWidth = MAP_WIDTH - MAP_PAD.left - MAP_PAD.right;
const mapPlotHeight = MAP_HEIGHT - MAP_PAD.top - MAP_PAD.bottom;
const mapX = (x, extent) => MAP_PAD.left + (x / extent.xMax) * mapPlotWidth;
const mapY = (y, extent) => MAP_PAD.top + mapPlotHeight - (y / extent.yMax) * mapPlotHeight;

function MapFrame() {
  return (
    <>
      <rect
        x={MAP_PAD.left}
        y={MAP_PAD.top}
        width={mapPlotWidth}
        height={mapPlotHeight}
        fill="none"
        stroke="var(--color-border-secondary)"
        strokeWidth="1"
      />
      <ScaleBar />
    </>
  );
}

function ScaleBar() {
  const y = MAP_PAD.top + mapPlotHeight + 18;
  const unit = mapPlotWidth / 4;
  return (
    <g>
      <line x1={MAP_PAD.left} y1={y} x2={MAP_PAD.left + unit} y2={y} stroke={muted} strokeWidth="2" />
      <line x1={MAP_PAD.left} y1={y - 4} x2={MAP_PAD.left} y2={y + 4} stroke={muted} strokeWidth="1.5" />
      <line x1={MAP_PAD.left + unit} y1={y - 4} x2={MAP_PAD.left + unit} y2={y + 4} stroke={muted} strokeWidth="1.5" />
      <text x={MAP_PAD.left + unit + 6} y={y + 4} fontSize="10" fontFamily="var(--font-mono)" fill={muted}>
        1 km
      </text>
    </g>
  );
}

function ContourFigure({ drawing }) {
  const { contours, interval, points, levels, extent } = drawing;
  const markers = [
    { point: points.a, label: 'A' },
    { point: points.b, label: 'B' }
  ];
  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true" style={figureStyle}>
      <MapFrame />
      {contours.map((contour, index) => {
        const path = contour.segments
          .map(([start, end]) => `M${mapX(start[0], extent).toFixed(1)} ${mapY(start[1], extent).toFixed(1)}L${mapX(end[0], extent).toFixed(1)} ${mapY(end[1], extent).toFixed(1)}`)
          .join(' ');
        const isIndex = index % 5 === 0;
        // Label each line at its lowest drawn point so the values stay legible.
        const lowest = contour.segments
          .flat()
          .reduce((best, point) => (point[1] < best[1] ? point : best), contour.segments[0][0]);
        return (
          <g key={contour.level}>
            <path
              d={path}
              fill="none"
              stroke={isIndex ? ink : muted}
              strokeWidth={isIndex ? 1.6 : 1}
            />
            <text
              x={mapX(lowest[0], extent) + 4}
              y={mapY(lowest[1], extent) + 12}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fill={muted}
              stroke="var(--color-background-primary)"
              strokeWidth="2.5"
              paintOrder="stroke"
            >
              {contour.level}
            </text>
          </g>
        );
      })}
      {markers.map(({ point, label }) => (
        <g key={label}>
          <circle cx={mapX(point.x, extent)} cy={mapY(point.y, extent)} r="4.5" fill={accent} />
          <text
            x={mapX(point.x, extent) + 7}
            y={mapY(point.y, extent) - 6}
            fontSize="12"
            fontWeight="600"
            fill={ink}
          >
            {label}
          </text>
        </g>
      ))}
      <text x={MAP_PAD.left} y={MAP_PAD.top - 2} fontSize="9" fontFamily="var(--font-mono)" fill={muted}>
        contour interval {interval} m · A {levels.a} m · B {levels.b} m
      </text>
    </svg>
  );
}

function StreamFigure({ drawing }) {
  const { nodes, links, outletId, bounds } = drawing;
  const pad = 0.55;
  const box = {
    x: bounds.minX - pad,
    y: bounds.minY - pad,
    width: bounds.maxX - bounds.minX + pad * 2,
    height: bounds.maxY - bounds.minY + pad * 2
  };
  const outlet = nodes.find((node) => node.id === outletId);
  return (
    <svg viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`} aria-hidden="true" style={figureStyle}>
      {links.map((link) => {
        const from = nodes.find((node) => node.id === link.from);
        const to = nodes.find((node) => node.id === link.to);
        return (
          <line
            key={link.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={accent}
            strokeWidth={1.2 + link.order * 1.1}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {nodes.map((node) => (
        <circle key={node.id} cx={node.x} cy={node.y} r="0.09" fill={accent} vectorEffect="non-scaling-stroke" />
      ))}
      <text
        x={outlet.x + 0.2}
        y={outlet.y + 0.05}
        fontSize={box.height * 0.085}
        fill={muted}
        fontFamily="var(--font-mono)"
      >
        outlet
      </text>
    </svg>
  );
}

function WellFigure({ drawing, revealed }) {
  const { wells, contours, point, extent, flowArrow, interval } = drawing;
  const gridLines = [];
  for (let x = extent.xMax / 4; x < extent.xMax; x += extent.xMax / 4) gridLines.push(x);
  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true" style={figureStyle}>
      <defs>
        <marker id="dp-well-flow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={accent} />
        </marker>
      </defs>
      <MapFrame />
      {gridLines.map((x) => (
        <line
          key={`gx-${x}`}
          x1={mapX(x, extent)}
          y1={MAP_PAD.top}
          x2={mapX(x, extent)}
          y2={MAP_PAD.top + mapPlotHeight}
          stroke="var(--color-border-tertiary)"
          strokeWidth="0.6"
          strokeDasharray="3 4"
        />
      ))}
      {revealed && (
        <>
          {contours.map((contour) => (
            <g key={contour.level}>
              <line
                x1={mapX(contour.segment[0][0], extent)}
                y1={mapY(contour.segment[0][1], extent)}
                x2={mapX(contour.segment[1][0], extent)}
                y2={mapY(contour.segment[1][1], extent)}
                stroke={accent}
                strokeWidth="1.2"
              />
              <text
                x={mapX(contour.segment[1][0], extent) - 18}
                y={mapY(contour.segment[1][1], extent) - 4}
                fontSize="9"
                fontFamily="var(--font-mono)"
                fill={accent}
                stroke="var(--color-background-primary)"
                strokeWidth="2.5"
                paintOrder="stroke"
              >
                {contour.level}
              </text>
            </g>
          ))}
          <line
            x1={mapX(flowArrow.from[0], extent)}
            y1={mapY(flowArrow.from[1], extent)}
            x2={mapX(flowArrow.to[0], extent)}
            y2={mapY(flowArrow.to[1], extent)}
            stroke={accent}
            strokeWidth="2"
            markerEnd="url(#dp-well-flow)"
          />
        </>
      )}
      {wells.map((well) => (
        <g key={well.id}>
          <circle cx={mapX(well.x, extent)} cy={mapY(well.y, extent)} r="4" fill="none" stroke={ink} strokeWidth="1.8" />
          <text x={mapX(well.x, extent) + 7} y={mapY(well.y, extent) + 4} fontSize="10" fontFamily="var(--font-mono)" fill={ink}>
            {well.id} · {well.head} m
          </text>
        </g>
      ))}
      <g>
        <line x1={mapX(point.x, extent) - 5} y1={mapY(point.y, extent)} x2={mapX(point.x, extent) + 5} y2={mapY(point.y, extent)} stroke={ink} strokeWidth="1.5" />
        <line x1={mapX(point.x, extent)} y1={mapY(point.y, extent) - 5} x2={mapX(point.x, extent)} y2={mapY(point.y, extent) + 5} stroke={ink} strokeWidth="1.5" />
        <text x={mapX(point.x, extent) + 7} y={mapY(point.y, extent) - 5} fontSize="12" fontWeight="600" fill={ink}>
          P
        </text>
      </g>
      <text x={MAP_PAD.left} y={MAP_PAD.top - 2} fontSize="9" fontFamily="var(--font-mono)" fill={muted}>
        {revealed ? `${interval} m contours · arrow shows flow direction` : 'well screens and point P · contours hidden until you check'}
      </text>
    </svg>
  );
}

const niceStep = (max) => [1, 2, 5, 10, 20, 25, 50, 100, 200].find((step) => max / step <= 6) ?? 500;

function HydrographFigure({ drawing }) {
  const { series, rainfall, duration } = drawing;
  const width = 460;
  const height = 320;
  const pad = { left: 46, right: 16, top: 10, bottom: 34 };
  const rainHeight = 56;
  const plotTop = pad.top + rainHeight + 14;
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - plotTop - pad.bottom;
  const peak = Math.max(...series.map((point) => point.q));
  const stepY = niceStep(peak * 1.15);
  const maxQ = Math.ceil((peak * 1.15) / stepY) * stepY;
  const toX = (t) => pad.left + (t / duration) * plotWidth;
  const toY = (q) => plotTop + plotHeight - (q / maxQ) * plotHeight;
  const line = series.map((point) => `${toX(point.t).toFixed(1)} ${toY(point.q).toFixed(1)}`).join(' L');
  const yTicks = [];
  for (let value = 0; value <= maxQ + 1e-9; value += stepY) yTicks.push(value);
  const xTicks = [];
  for (let hour = 0; hour <= duration; hour += 6) xTicks.push(hour);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={figureStyle}>
      <text x={pad.left} y={pad.top + 8} fontSize="9" fontFamily="var(--font-mono)" fill={muted}>
        rainfall (hyetograph)
      </text>
      <rect
        x={toX(rainfall.start)}
        y={pad.top + 12}
        width={toX(rainfall.start + rainfall.hours) - toX(rainfall.start)}
        height={rainHeight - 12}
        fill={accent}
        opacity="0.45"
      />
      <text
        x={toX(rainfall.start + rainfall.hours) + 6}
        y={pad.top + 12 + (rainHeight - 12) / 2 + 4}
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill={muted}
      >
        {rainfall.amount} mm
      </text>
      <line x1={pad.left} y1={plotTop + plotHeight} x2={width - pad.right} y2={plotTop + plotHeight} stroke="var(--color-border-secondary)" strokeWidth="1" />
      <line x1={pad.left} y1={plotTop} x2={pad.left} y2={plotTop + plotHeight} stroke="var(--color-border-secondary)" strokeWidth="1" />
      {yTicks.map((value) => (
        <g key={value}>
          <line
            x1={pad.left}
            y1={toY(value)}
            x2={width - pad.right}
            y2={toY(value)}
            stroke="var(--color-border-tertiary)"
            strokeWidth="0.6"
          />
          <text x={pad.left - 6} y={toY(value) + 3} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill={muted}>
            {value}
          </text>
        </g>
      ))}
      {xTicks.map((hour) => (
        <text key={hour} x={toX(hour)} y={plotTop + plotHeight + 14} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={muted}>
          {hour}
        </text>
      ))}
      <path d={`M${line}`} fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round" />
      <text x={width - pad.right} y={height - 4} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill={muted}>
        hours since start · discharge m³/s
      </text>
    </svg>
  );
}

function CaseFigure({ caseData, revealed }) {
  if (caseData.kind === 'contour') return <ContourFigure drawing={caseData.drawing} />;
  if (caseData.kind === 'streamOrder') return <StreamFigure drawing={caseData.drawing} />;
  if (caseData.kind === 'wellMap') return <WellFigure drawing={caseData.drawing} revealed={revealed} />;
  return <HydrographFigure drawing={caseData.drawing} />;
}

function figureLabel(caseData) {
  if (caseData.kind === 'contour') return 'Topographic map: contours with the two marked points A and B and a 1 km scale bar.';
  if (caseData.kind === 'streamOrder') return 'Drainage network: headwaters on the left, the outlet on the right.';
  if (caseData.kind === 'wellMap') return 'Well map: three labelled wells and point P on a one-kilometre grid.';
  return 'Storm hydrograph: rainfall bars above, discharge against time below.';
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function MapPractice() {
  const [kind, setKind] = useState(CASE_KINDS[0]);
  const [sessions, setSessions] = useState(() =>
    Object.fromEntries(CASE_KINDS.map((caseKind) => [caseKind, initialSession()]))
  );

  const session = sessions[kind];
  const seed = seedFrom(session.seed);
  const caseData = generateCase(kind, seed);
  const basis = ACTIVE_DATA.dynamicplanet.mapPractice[kind];
  const results = session.checked ? checkAnswers(caseData, session.answers) : null;
  const correctCount = results ? results.filter((result) => result.correct).length : 0;

  const update = (changes) =>
    setSessions((previous) => ({ ...previous, [kind]: { ...previous[kind], ...changes } }));

  const setAnswer = (questionId) => (event) => {
    const { value } = event.target;
    update({ answers: { ...session.answers, [questionId]: value } });
  };

  const newCase = () => update({ seed: String(seed + 1), answers: {}, checked: false });

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 860 }}>
      <ToolHeader
        eyebrow={`Dynamic Planet C · ${ACTIVE_SEASON.year} · Manual C24–C25`}
        purpose={PURPOSE}
        steps={STEPS}
        manualReference={ACTIVE_DATA.dynamicplanet.manualReference}
      >
        <p style={captionText}>
          These cases are generated practice, not past competition questions, and the answers are not an official score.
        </p>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 12 }}>
        <Tabs tabs={TABS} active={kind} onChange={setKind} ariaLabel="Map and hydrograph cases" />
        <div style={actionRow}>
          <NumberField
            label="Case seed"
            value={session.seed}
            onChange={(event) => update({ seed: event.target.value, answers: {}, checked: false })}
            min="1"
            step="1"
            help="The same seed always draws the same case, so you can retry it later."
            style={{ minWidth: 140 }}
          />
          <Button onClick={newCase}>New case</Button>
        </div>

        <SectionHeading>{caseData.title}</SectionHeading>
        <p style={bodyText}>{caseData.prompt}</p>
        <div role="img" aria-label={figureLabel(caseData)}>
          <CaseFigure caseData={caseData} revealed={session.checked} />
        </div>

        <div style={questionGrid}>
          {caseData.questions.map((question) => (
            <NumberField
              key={question.id}
              label={question.label}
              unit={question.unit}
              value={session.answers[question.id] ?? ''}
              onChange={setAnswer(question.id)}
              step="any"
              help={question.unit === 'order' || question.unit === 'segments' ? 'Whole numbers only.' : undefined}
            />
          ))}
        </div>

        <div style={actionRow}>
          <Button variant="primary" onClick={() => update({ checked: true })}>Check answers</Button>
        </div>

        {results && (
          <ResultPanel>
            <div style={{ display: 'grid', gap: 10 }}>
              <StatusMessage tone={correctCount === results.length ? 'success' : 'status'}>
                {correctCount} of {results.length} correct.
              </StatusMessage>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
                {results.map((result) => (
                  <li key={result.id} style={{ color: result.correct ? 'var(--color-text-success)' : 'var(--color-text-secondary)' }}>
                    {result.label}: {result.answered ? (result.correct ? 'correct' : 'not yet') : 'not answered'}
                    {result.correct ? '' : ` — expected ${formatCaseValue(result.expected, caseData.questions.find((question) => question.id === result.id).decimals)} ${result.unit}`}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'grid', gap: 6 }}>
                <HelpText>Worked reasoning</HelpText>
                {caseData.solution.map((line) => (
                  <p key={line} style={bodyText}>{line}</p>
                ))}
              </div>
            </div>
          </ResultPanel>
        )}

        <p style={citationStyle}>
          <strong>{basis.citation}</strong> — {basis.basis}
        </p>
      </Card>
    </div>
  );
}
