import { useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import { buildChoices, describeResults } from './diagramDrillUtils.js';
import {
  Button,
  Card,
  Collapsible,
  HelpText,
  ResultPanel,
  SectionHeading,
  StatusMessage,
  Stepper,
  Tabs,
  ToolHeader
} from '../../general/ui/primitives';

const SOURCE = `${ACTIVE_SEASON.year} Division C Rules Manual, pp. C3–C5`;
const DIAGRAMS = ACTIVE_DATA.anatomy.diagrams;

const STEPS = [
  'Pick one of the three systems: respiratory, digestive, or immune.',
  'Select a numbered target on the schematic, then choose the structure name that matches it. Every readout updates as you work.',
  'Check labels when you are done to reveal the manual-cited names and short study notes for every target.'
];

const WORKFLOW = [
  { label: 'Choose a system' },
  { label: 'Label every target' },
  { label: 'Check and review' }
];

// Positions are cosmetic; the pure engine decides correctness from the target
// ids below, so moving a marker can never change a grade.
const VIEWS = {
  respiratory: {
    caption: 'Schematic airway from pharynx down to the alveolar sacs.',
    shapes: (
      <g fill="none" stroke="var(--color-text-tertiary)" strokeWidth={2} strokeLinecap="round">
        <path d="M 250 30 L 250 100" />
        <path d="M 250 100 L 210 140 M 250 100 L 290 140" />
        <path d="M 210 140 L 210 165 M 290 140 L 290 165" />
        <path d="M 210 165 L 195 185 M 210 165 L 225 185 M 290 165 L 275 185 M 290 165 L 305 185" />
        <circle cx="195" cy="205" r="18" />
        <circle cx="225" cy="205" r="18" />
        <circle cx="275" cy="205" r="18" />
        <circle cx="305" cy="205" r="18" />
      </g>
    ),
    hotspots: [
      { id: 'pharynx', x: 250, y: 30 },
      { id: 'larynx', x: 250, y: 65 },
      { id: 'trachea', x: 250, y: 100 },
      { id: 'bronchi', x: 250, y: 140 },
      { id: 'bronchioles', x: 250, y: 180 },
      { id: 'alveoli', x: 250, y: 245 }
    ]
  },
  digestive: {
    caption: 'Schematic alimentary canal with the named accessory organs.',
    shapes: (
      <g fill="none" stroke="var(--color-text-tertiary)" strokeWidth={2} strokeLinecap="round">
        <circle cx="110" cy="60" r="16" />
        <path d="M 132 70 Q 170 100 190 110 L 230 140" />
        <path d="M 230 140 Q 280 120 300 160 Q 285 195 240 185 Q 215 160 230 140 Z" />
        <path d="M 240 185 Q 250 215 245 240" />
        <path d="M 245 240 Q 285 255 330 235 L 360 200" />
        <path d="M 330 120 L 390 120 L 390 165 L 330 165 Z" />
        <path d="M 295 180 Q 320 190 345 180" />
      </g>
    ),
    hotspots: [
      { id: 'salivaryGlands', x: 110, y: 60 },
      { id: 'esophagus', x: 180, y: 105 },
      { id: 'stomach', x: 255, y: 155 },
      { id: 'liver', x: 360, y: 140 },
      { id: 'gallbladder', x: 345, y: 175 },
      { id: 'pancreas', x: 300, y: 195 },
      { id: 'smallIntestine', x: 270, y: 250 },
      { id: 'largeIntestine', x: 360, y: 225 }
    ]
  },
  immune: {
    caption: 'Schematic placement of the named immune organs and tissue.',
    shapes: (
      <g fill="none" stroke="var(--color-text-tertiary)" strokeWidth={2} strokeLinecap="round">
        <path d="M 60 50 L 440 50 L 440 270 L 60 270 Z" />
        <circle cx="200" cy="200" r="20" />
        <path d="M 250 70 Q 275 90 250 120 Q 225 90 250 70 Z" />
        <path d="M 350 165 Q 380 165 380 195 Q 350 205 340 185 Z" />
        <circle cx="400" cy="110" r="12" />
      </g>
    ),
    hotspots: [
      { id: 'skin', x: 100, y: 60 },
      { id: 'boneMarrow', x: 200, y: 200 },
      { id: 'thymus', x: 250, y: 95 },
      { id: 'spleen', x: 355, y: 185 },
      { id: 'lymphNodes', x: 400, y: 110 }
    ]
  }
};

const seededRandom = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

function hotspotKey(spotId, index) {
  return `${spotId}-${index}`;
}

function DiagramSurface({ view, structures, answers, activeId, revealed, result, onSelect }) {
  const nameById = new Map(structures.map((structure) => [structure.id, structure.name]));
  const verdict = new Map((result?.rows || []).map((row) => [row.hotspotId, row.correct]));
  return (
    <svg
      viewBox="0 0 500 300"
      style={{ width: '100%', height: 'auto', maxWidth: 640, display: 'block', margin: '0 auto' }}
      role="group"
      aria-label={view.caption}
    >
      <g aria-hidden="true">{view.shapes}</g>
      {view.hotspots.map((spot, index) => {
        const key = hotspotKey(spot.id, index);
        const answer = answers[key];
        const chosenName = answer ? nameById.get(answer) : null;
        const active = activeId === key;
        const state = revealed ? (verdict.get(key) ? 'correct' : 'incorrect') : chosenName ? 'chosen' : 'empty';
        const stroke = active ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)';
        const fill = state === 'correct'
          ? 'var(--color-text-success)'
          : state === 'incorrect'
            ? 'var(--color-text-danger)'
            : active
              ? 'var(--color-accent-primary)'
              : 'var(--color-background-tertiary)';
        return (
          <g
            key={key}
            role="button"
            tabIndex={0}
            aria-label={`Target ${index + 1}${chosenName ? `, labelled ${chosenName}` : ', unlabelled'}`}
            aria-pressed={active}
            onClick={() => onSelect(key)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(key);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={spot.x} cy={spot.y} r={17} fill={fill} stroke={stroke} strokeWidth={active ? 3 : 1.5} />
            <text
              x={spot.x}
              y={spot.y + 4}
              fontSize={12}
              fontWeight={700}
              textAnchor="middle"
              fill="var(--color-text-inverse)"
              aria-hidden="true"
            >
              {index + 1}
            </text>
            {chosenName && !revealed && (
              <text x={spot.x} y={spot.y - 24} fontSize={10} textAnchor="middle" fill="var(--color-text-secondary)" aria-hidden="true">
                {chosenName}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function SystemDiagramDrill() {
  const [diagramId, setDiagramId] = useState(DIAGRAMS[0].id);
  const [answers, setAnswers] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [result, setResult] = useState(null);

  const diagram = DIAGRAMS.find((entry) => entry.id === diagramId) || DIAGRAMS[0];
  const view = VIEWS[diagram.id];
  const structures = diagram.structures;
  const hotspots = view.hotspots.map((spot, index) => ({
    ...spot,
    id: hotspotKey(spot.id, index),
    structureId: spot.id
  }));

  const activeIndex = hotspots.findIndex((spot) => spot.id === activeId);
  const activeSpot = activeIndex >= 0 ? hotspots[activeIndex] : null;
  // Choices are a cheap pure derivation from the selected target. Computing
  // them during render keeps the seeded order stable without a memo the React
  // Compiler cannot preserve across these derived arrays.
  let choices = [];
  if (activeSpot) {
    const seed = activeSpot.structureId.split('').reduce((total, char) => total + char.charCodeAt(0), activeIndex + 1);
    choices = buildChoices(structures, activeSpot.structureId, 4, seededRandom(seed)).choices || [];
  }

  const labelledCount = hotspots.filter((spot) => answers[spot.id]).length;
  const currentStep = result ? 2 : labelledCount === hotspots.length ? 1 : 0;

  const chooseSystem = (id) => {
    setDiagramId(id);
    setAnswers({});
    setActiveId(null);
    setResult(null);
  };

  const chooseAnswer = (structureId) => {
    if (!activeSpot) return;
    setAnswers((previous) => ({ ...previous, [activeSpot.id]: structureId }));
    setResult(null);
  };

  const checkLabels = () => {
    setResult(describeResults({ hotspots }, structures, answers));
  };

  const reset = () => {
    setAnswers({});
    setActiveId(null);
    setResult(null);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ToolHeader
        purpose="Identify structures on schematic diagrams of the three systems in the current manual. Select a numbered target, choose a name, then check your work to see the manual-cited key."
        steps={STEPS}
        manualReference={SOURCE}
      >
        <StatusMessage>
          Practice identification only — target names come from the manual's content outline; the short notes are general biology study aids, not official text or a scoring key.
        </StatusMessage>
      </ToolHeader>

      <Stepper steps={WORKFLOW} currentStep={currentStep} />
      <Tabs
        tabs={DIAGRAMS.map((entry) => ({ id: entry.id, label: entry.label || '' }))}
        active={diagramId}
        onChange={chooseSystem}
        ariaLabel="Anatomy system"
      />

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>{diagram.id === 'respiratory' ? 'Respiratory' : diagram.id === 'digestive' ? 'Digestive' : 'Immune'} schematic</SectionHeading>
        <HelpText>{view.caption} Source for these names: {diagram.citation}. Select a numbered target, then pick its name below.</HelpText>
        <DiagramSurface
          view={view}
          structures={structures}
          answers={answers}
          activeId={activeId}
          revealed={Boolean(result)}
          result={result}
          onSelect={(id) => { setActiveId(id); setResult(null); }}
        />
        <StatusMessage>
          {activeSpot
            ? `Target ${activeIndex + 1} selected. Choose the matching structure name below.`
            : `Select a numbered target to label it. ${labelledCount} of ${hotspots.length} labelled.`}
        </StatusMessage>
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Structure names</SectionHeading>
        <HelpText>{activeSpot ? `Choose the name for target ${activeIndex + 1}.` : 'Select a target on the diagram to see its choices.'}</HelpText>
        <div role="group" aria-label="Structure name choices" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {choices.map((choice) => (
            <Button
              key={choice.id}
              variant={activeSpot && answers[activeSpot.id] === choice.id ? 'primary' : 'secondary'}
              aria-pressed={Boolean(activeSpot && answers[activeSpot.id] === choice.id)}
              disabled={!activeSpot}
              onClick={() => chooseAnswer(choice.id)}
            >
              {choice.name}
            </Button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={checkLabels} disabled={labelledCount === 0}>
            Check labels
          </Button>
          <Button onClick={reset} disabled={labelledCount === 0 && !result}>Clear labels</Button>
        </div>
      </Card>

      {result && (
        <Card style={{ display: 'grid', gap: 10 }}>
          <SectionHeading>Key and feedback</SectionHeading>
          <ResultPanel>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>
                {result.correctCount} of {result.total} correct
                {result.unansweredIds.length > 0 ? ` · ${result.unansweredIds.length} left unlabelled` : ''}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <caption style={{ textAlign: 'left', color: 'var(--color-text-tertiary)', fontSize: 12, paddingBottom: 6 }}>
                  Manual-listed names and study notes for every target.
                </caption>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Target</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Correct name</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Your label</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, index) => (
                    <tr key={row.hotspotId}>
                      <td style={{ padding: '5px 8px' }}>{index + 1}</td>
                      <td style={{ padding: '5px 8px' }}>
                        <strong>{row.expectedName}</strong>
                        {row.note && <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{row.note}</div>}
                      </td>
                      <td style={{ padding: '5px 8px', color: row.correct ? 'var(--color-text-success)' : 'var(--color-text-danger)' }}>
                        {row.chosenName}{row.correct ? ' ✓' : ' ✕'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Collapsible summary="Manual scope and level note">
                <HelpText>
                  Names are limited to the structures the manual lists in {diagram.citation}. Notes are general biology
                  study aids, not official rules text. State/National additions (for example immune signalling and detailed
                  immunoglobulin structure) are outside this drill.
                </HelpText>
                <HelpText>Source: {SOURCE}. This does not replace the official Rules Manual.</HelpText>
              </Collapsible>
            </div>
          </ResultPanel>
        </Card>
      )}
    </div>
  );
}
