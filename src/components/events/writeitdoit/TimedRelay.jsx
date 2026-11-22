import { useEffect, useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  connectionOptions,
  connectionValue,
  formatTime,
  generateStructure,
  reviewStructure,
  scanDescription
} from './relayUtils';
import {
  Button,
  Card,
  CheckboxField,
  HelpText,
  PrimaryAction,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  Stepper,
  TextAreaField,
  ToolHeader
} from '../../general/ui/primitives';

const PHASES = [
  { id: 'writer', label: 'Write' },
  { id: 'builder', label: 'Build' },
  { id: 'review', label: 'Review' }
];
const CHECKLIST = [
  'No drawings or diagrams in my description',
  'I described size, color, location, orientation and connections',
  'I used only a writing utensil'
];

const mono = { fontFamily: 'var(--font-mono)' };
const pieceCard = {
  padding: 12, borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border-tertiary)',
  background: 'var(--color-background-tertiary)', display: 'grid', gap: 8
};

function Timer({ label, seconds, running, onToggle, disabled }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: 12 }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
      <span role="timer" aria-label={`${label} remaining`} style={{ ...mono, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {formatTime(seconds)}
      </span>
      <Button onClick={onToggle} disabled={disabled || seconds <= 0} aria-label={`${running ? 'Pause' : 'Start'} ${label.toLowerCase()} timer`}>
        <i className={`ti ${running ? 'ti-player-pause' : 'ti-player-play'}`} aria-hidden="true"></i>
        {running ? 'Pause' : 'Start'}
      </Button>
      {seconds <= 0 && <StatusMessage tone="error">Time is up — stop work and move on.</StatusMessage>}
    </Card>
  );
}

function TargetCard({ structure, vocabulary }) {
  return (
    <Card style={{ display: 'grid', gap: 10 }}>
      <SectionHeading>Synthetic target</SectionHeading>
      <HelpText>{vocabulary.notes.object}</HelpText>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))' }}>
        {structure.pieces.map((piece) => (
          <div key={piece.id} style={pieceCard}>
            <strong style={{ fontSize: 13 }}>
              <span {...mono}>{piece.id}</span> · {piece.materialLabel}
            </strong>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 10px', fontSize: 12 }}>
              <dt style={{ color: 'var(--color-text-tertiary)' }}>Size</dt><dd style={{ margin: 0, ...mono }}>{piece.size}</dd>
              <dt style={{ color: 'var(--color-text-tertiary)' }}>Color</dt><dd style={{ margin: 0, ...mono }}>{piece.color}</dd>
              <dt style={{ color: 'var(--color-text-tertiary)' }}>Location</dt><dd style={{ margin: 0, ...mono }}>{piece.location}</dd>
              <dt style={{ color: 'var(--color-text-tertiary)' }}>Orientation</dt><dd style={{ margin: 0, ...mono }}>{piece.orientation}</dd>
              <dt style={{ color: 'var(--color-text-tertiary)' }}>Connection</dt><dd style={{ margin: 0, ...mono }}>{connectionValue(piece.connectedTo)}</dd>
            </dl>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WriterPhase({ structure, widi, description, onDescription, checks, onCheck, scan, seconds, running, onTimer, onAdvance }) {
  const ready = checks.filter(Boolean).length;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <TargetCard structure={structure} vocabulary={widi} />
      <Timer label="Writing time" seconds={seconds} running={running} onToggle={onTimer} />
      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Your written description</SectionHeading>
        <TextAreaField
          label="Description for your builder"
          value={description}
          onChange={(event) => onDescription(event.target.value)}
          rows={9}
          placeholder="Describe each piece so someone who cannot see the target can rebuild it."
          help="Words, numerals, abbreviations and scientific symbols are allowed in context; drawings and diagrams are not."
        />
        {!scan.clean && (
          <StatusMessage tone="error">
            Possible drawing reference found: {scan.flagged.map((phrase) => `“${phrase}”`).join(', ')}. {widi.drawingCheck.subsectionConsequence} {widi.drawingCheck.modelConsequence}
          </StatusMessage>
        )}
        <div style={{ display: 'grid', gap: 8 }}>
          <SectionHeading>Self-check before handing it over</SectionHeading>
          {CHECKLIST.map((item, index) => (
            <CheckboxField
              key={item}
              label={item}
              checked={checks[index]}
              onChange={(event) => onCheck(index, event.target.checked)}
            />
          ))}
          <HelpText>{ready} of {CHECKLIST.length} checked. These are your own reminders, not an official ruling.</HelpText>
        </div>
        <div>
          <PrimaryAction label="Hide target and start build phase" onClick={onAdvance} />
        </div>
        <HelpText>{widi.notes.writing}</HelpText>
      </Card>
    </div>
  );
}

function PieceForm({ structure, widi, guesses, onGuess }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {structure.pieces.map((piece) => {
        const guess = guesses[piece.id] || {};
        const options = connectionOptions(structure, piece.id);
        return (
          <div key={piece.id} style={pieceCard}>
            <strong style={{ fontSize: 13 }}>
              <span {...mono}>{piece.id}</span> · {piece.materialLabel}
            </strong>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <SelectField label={`Size for ${piece.id}`} value={guess.size || ''} onChange={(event) => onGuess(piece.id, 'size', event.target.value)}>
                <option value="">Choose size</option>
                {widi.vocabulary.materials.find((material) => material.id === piece.material).sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </SelectField>
              <SelectField label={`Color for ${piece.id}`} value={guess.color || ''} onChange={(event) => onGuess(piece.id, 'color', event.target.value)}>
                <option value="">Choose color</option>
                {widi.vocabulary.colors.map((color) => <option key={color} value={color}>{color}</option>)}
              </SelectField>
              <SelectField label={`Location for ${piece.id}`} value={guess.location || ''} onChange={(event) => onGuess(piece.id, 'location', event.target.value)}>
                <option value="">Choose location</option>
                {widi.vocabulary.locations.map((location) => <option key={location} value={location}>{location}</option>)}
              </SelectField>
              <SelectField label={`Orientation for ${piece.id}`} value={guess.orientation || ''} onChange={(event) => onGuess(piece.id, 'orientation', event.target.value)}>
                <option value="">Choose orientation</option>
                {widi.vocabulary.orientations.map((orientation) => <option key={orientation} value={orientation}>{orientation}</option>)}
              </SelectField>
              <SelectField label={`Connection for ${piece.id}`} value={guess.connection || ''} onChange={(event) => onGuess(piece.id, 'connection', event.target.value)}>
                <option value="">Choose connection</option>
                {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </SelectField>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BuilderPhase({ structure, widi, description, guesses, onGuess, recorded, seconds, running, onTimer, onReveal }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Timer label="Building time" seconds={seconds} running={running} onToggle={onTimer} />
      <Card style={{ display: 'grid', gap: 8 }}>
        <SectionHeading>Description passed to the builder</SectionHeading>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
          {description || 'No description was written in the first phase.'}
        </p>
        <HelpText>{widi.notes.building}</HelpText>
      </Card>
      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Record what you built</SectionHeading>
        <HelpText>The target is hidden. Record each piece from the description; the review compares your entries with the target only when you reveal it.</HelpText>
        <PieceForm structure={structure} widi={widi} guesses={guesses} onGuess={onGuess} />
        <StatusMessage>
          {recorded} of {structure.pieces.length} pieces have every dimension recorded.
        </StatusMessage>
        <div>
          <PrimaryAction label="Reveal target and review" onClick={onReveal} />
        </div>
      </Card>
    </div>
  );
}

function ReviewPhase({ structure, review, widi, buildSeconds, onRestart }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <TargetCard structure={structure} vocabulary={widi} />
      <ResultPanel>
        <strong>Practice comparison: {review.matched} of {review.possible} piece details agreed with the target.</strong>
        <p style={{ margin: '8px 0 0' }}>Building-phase time recorded: <span {...mono}>{formatTime(buildSeconds)}</span></p>
        <HelpText>{widi.notes.tiebreaker}</HelpText>
      </ResultPanel>
      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Piece-by-piece comparison</SectionHeading>
        <div style={{ display: 'grid', gap: 8 }}>
          {review.rows.map((row) => (
            <div key={row.id} style={pieceCard}>
              <strong style={{ fontSize: 13, ...mono }}>{row.id}</strong>
              <div style={{ display: 'grid', gap: 4 }}>
                {widi.rubric.dimensions.map((dimension) => {
                  const ok = row.checks[dimension.id];
                  return (
                    <div key={dimension.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, flexWrap: 'wrap' }}>
                      <span
                        aria-label={`${dimension.label} for ${row.id}: ${ok ? 'matched' : 'different'}`}
                        style={{ color: ok ? 'var(--color-text-success)' : 'var(--color-text-danger)', fontWeight: 700, width: 16 }}
                      >
                        {ok ? '✓' : '✗'}
                      </span>
                      <span style={{ minWidth: 82, color: 'var(--color-text-tertiary)' }}>{dimension.label}</span>
                      <span {...mono}>target {String(row.target[dimension.id] === null ? 'none' : row.target[dimension.id])}</span>
                      <span {...mono}>yours {String(row.guess[dimension.id] === undefined || row.guess[dimension.id] === '' ? 'not recorded' : row.guess[dimension.id])}</span>
                    </div>
                  );
                })}
              </div>
              <HelpText>{row.matched} of {row.total} dimensions agreed.</HelpText>
            </div>
          ))}
        </div>
        <HelpText>{widi.notes.practiceOnly}</HelpText>
        <StatusMessage tone="error">{widi.drawingCheck.subsectionConsequence} {widi.drawingCheck.modelConsequence}</StatusMessage>
        <div>
          <PrimaryAction label="Generate a new structure" onClick={onRestart} />
        </div>
      </Card>
    </div>
  );
}

export default function TimedRelay() {
  const widi = ACTIVE_DATA.writeitdoit;
  const [seed, setSeed] = useState(1031);
  const [phase, setPhase] = useState('writer');
  const [description, setDescription] = useState('');
  const [checks, setChecks] = useState([false, false, false]);
  const [guesses, setGuesses] = useState({});
  const [seconds, setSeconds] = useState(widi.timings.writingSeconds);
  const [running, setRunning] = useState(false);
  const [buildSeconds, setBuildSeconds] = useState(0);

  const structure = generateStructure(seed, widi.vocabulary);
  const scan = scanDescription(description, widi.drawingCheck.phrases);
  const recorded = structure.pieces.filter((piece) => {
    const guess = guesses[piece.id] || {};
    return widi.rubric.dimensions.every((dimension) => {
      const value = guess[dimension.id];
      return value !== undefined && value !== '';
    });
  }).length;
  const review = phase === 'review' ? reviewStructure(structure, guesses, widi.rubric.dimensions) : null;

  const atZero = seconds <= 0;
  useEffect(() => {
    if (!running || atZero) return undefined;
    const id = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, atZero]);

  const reset = (nextSeed) => {
    setSeed(nextSeed);
    setPhase('writer');
    setDescription('');
    setChecks([false, false, false]);
    setGuesses({});
    setSeconds(widi.timings.writingSeconds);
    setRunning(false);
    setBuildSeconds(0);
  };
  const setCheck = (index, value) => setChecks((current) => current.map((item, i) => (i === index ? value : item)));
  const setGuess = (pieceId, key, value) => setGuesses((current) => ({
    ...current,
    [pieceId]: { ...current[pieceId], [key]: value }
  }));
  const beginBuild = () => {
    setPhase('builder');
    setSeconds(widi.timings.buildingSeconds);
    setRunning(false);
  };
  const reveal = () => {
    setBuildSeconds(widi.timings.buildingSeconds - seconds);
    setRunning(false);
    setPhase('review');
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <ToolHeader
        eyebrow={`Write It, Do It B · ${ACTIVE_SEASON.year} · Manual B62`}
        purpose="Run a full writer → builder → review rep against a reproducible synthetic object. The target is hidden during the build phase, the manual's phase timers are shown live, and the review compares recorded piece details for practice only — never an official score."
        manualReference={widi.manualReference}
        steps={[
          'Study the generated target and write a description during the 25-minute writing timer; drawings and diagrams are prohibited.',
          'Hand the description to a builder, hide the target, and record the rebuilt pieces during the 20-minute building timer.',
          'Reveal the target and review each piece for size, color, location, orientation and connection.'
        ]}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Structure seed <span {...mono}>{seed}</span>
          </span>
          <Button onClick={() => reset(seed + 1)}>New structure</Button>
        </div>
        <HelpText>{widi.notes.practiceOnly} The object vocabulary is drawn from the materials the manual lists as examples, not an official model.</HelpText>
      </ToolHeader>
      <Stepper steps={PHASES} currentStep={PHASES.findIndex((item) => item.id === phase)} />
      {phase === 'writer' && (
        <WriterPhase
          structure={structure} widi={widi} description={description} onDescription={setDescription}
          checks={checks} onCheck={setCheck} scan={scan} seconds={seconds} running={running}
          onTimer={() => setRunning((value) => !value)} onAdvance={beginBuild}
        />
      )}
      {phase === 'builder' && (
        <BuilderPhase
          structure={structure} widi={widi} description={description} guesses={guesses} onGuess={setGuess}
          recorded={recorded} seconds={seconds} running={running}
          onTimer={() => setRunning((value) => !value)} onReveal={reveal}
        />
      )}
      {phase === 'review' && (
        <ReviewPhase structure={structure} review={review} widi={widi} buildSeconds={buildSeconds} onRestart={() => reset(seed + 1)} />
      )}
      <Card style={{ display: 'grid', gap: 6 }}>
        <SectionHeading>Manual citations</SectionHeading>
        <HelpText><strong>Object:</strong> {widi.citations.object} · <strong>Writing:</strong> {widi.citations.writing} · <strong>Drawings:</strong> {widi.citations.drawings}</HelpText>
        <HelpText><strong>Building:</strong> {widi.citations.building} · <strong>Rubric:</strong> {widi.citations.scoring} · <strong>Drawing tiers:</strong> {widi.citations.drawingTiers} · <strong>Tiebreaker:</strong> {widi.citations.tiebreaker}</HelpText>
      </Card>
    </div>
  );
}
