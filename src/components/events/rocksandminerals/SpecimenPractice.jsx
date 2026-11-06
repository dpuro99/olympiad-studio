// Rocks and Minerals — Specimen Practice Drill.
// One flow: configure deck → drill. Missed list & recording are secondary, collapsed.
import { useMemo, useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import {
  CHEMICAL_CLASSES,
  buildCards,
  coverageOf,
  propertyReadouts,
  safeParseAuthored,
  SPECIMEN_STORAGE_KEY
} from './specimenCardsUtils';
import {
  buildChoices,
  buildDeck,
  buildQueue,
  createSession,
  deckStats,
  gradeChoice,
  missedCards,
  recordAttempt,
  summarizeSession
} from './specimenDrillUtils';
import {
  Button,
  Card,
  Collapsible,
  EmptyState,
  HelpText,
  PrimaryAction,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  ToggleSwitch,
  ToolHeader
} from '../../general/ui/primitives';
import PropertyForm from './PropertyForm';

const SEASON = ACTIVE_DATA.rocksandminerals;
const CITATION = SEASON.mineralKey.citation;

const bodyText = { margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.6 };
const chipStyle = { display: 'inline-block', padding: '2px 7px', borderRadius: 999, border: '1px solid var(--color-border-secondary)', background: 'var(--color-background-tertiary)', fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--color-text-primary)' };
const badgeStyle = { ...chipStyle, borderColor: 'var(--color-border-info)', background: 'var(--color-background-info)', color: 'var(--color-text-info)' };
const listStyle = { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 };
const choiceGrid = { display: 'grid', gap: 8 };

function loadAuthored() {
  try {
    const serialized = window.localStorage.getItem(SPECIMEN_STORAGE_KEY);
    if (serialized === null) return { authored: {}, error: '' };
    const parsed = safeParseAuthored(serialized);
    if (parsed.error) return { authored: {}, error: parsed.error };
    return { authored: parsed.value, error: '' };
  } catch {
    return { authored: {}, error: 'Local storage is unavailable in this browser, so property records cannot be loaded.' };
  }
}

function PropertyChips({ card }) {
  const readouts = propertyReadouts(card);
  if (!readouts.length) return <HelpText>No properties recorded for this mineral.</HelpText>;
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{readouts.map((item) => <span key={item.label} style={chipStyle}>{item.label}: {item.value}</span>)}</div>;
}

function CardDetails({ card }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline' }}>
        <strong style={{ fontSize: 14 }}>{card.name}</strong>
        <span style={chipStyle}>{card.cls}</span>
        {card.group && <span style={chipStyle}>{card.group}</span>}
        {card.level === 'state' && <span style={badgeStyle}>State/National</span>}
      </div>
      <PropertyChips card={card} />
      {card.note && <HelpText>{card.note}</HelpText>}
      {card.properties.notes && <p style={{ ...bodyText, color: 'var(--color-text-primary)' }}>{card.properties.notes}</p>}
    </div>
  );
}

function DrillPanel({ question, card, mode, phase, lastResult, onChoose, onReveal, onSelfGrade, onNext, onSkip }) {
  const prompting = phase === 'prompt';
  const selfGrading = mode === 'flashcard';
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>{prompting ? 'Which mineral is this?' : card.name}</SectionHeading>
        <p style={bodyText}>{prompting ? 'Work from the recorded properties only. The name is hidden until you answer or reveal it.' : `${card.cls}${card.group ? ` · ${card.group}` : ''}${card.level === 'state' ? ' · State/National' : ''}`}</p>
        <PropertyChips card={card} />
        {prompting && !selfGrading && question.graded && <div style={choiceGrid} role="group" aria-label="Answer choices">{question.options.map((option) => <Button key={option.id} onClick={() => onChoose(option.id)} style={{ textAlign: 'left', padding: '11px 13px', fontSize: 13 }}>{option.name}</Button>)}</div>}
        {prompting && !selfGrading && !question.graded && <HelpText>Only one mineral in the deck has recorded properties — reveal it and judge yourself.</HelpText>}
        {!prompting && <CardDetails card={card} />}
      </Card>
      {phase === 'answered' && lastResult && <ResultPanel>{lastResult.correct ? `Correct — ${card.name}.` : lastResult.chosenName ? `Not quite — you chose ${lastResult.chosenName}. The answer is ${card.name}.` : `Revealed without answering — the answer is ${card.name}.`}</ResultPanel>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {prompting && (<><Button variant="primary" onClick={onReveal}>{selfGrading ? 'Reveal answer' : 'Give up and reveal'}</Button><Button onClick={onSkip}>Skip</Button></>)}
        {phase === 'answered' && <Button variant="primary" onClick={onNext}>Next card</Button>}
        {phase === 'revealed' && (<><Button variant="primary" onClick={() => onSelfGrade(true)}>Got it</Button><Button variant="danger" onClick={() => onSelfGrade(false)}>Missed it</Button></>)}
      </div>
    </div>
  );
}

function Drill({ deck, cards, session, onAttempt, onRestart, onEdit }) {
  const [queue] = useState(() => buildQueue(deck));
  const [position, setPosition] = useState(0);
  const [mode, setMode] = useState('graded');
  const [phase, setPhase] = useState('prompt');
  const [lastResult, setLastResult] = useState(null);
  const currentId = queue.length ? queue[position % queue.length] : null;
  const currentCard = useMemo(() => (currentId ? cards.find((card) => card.id === currentId) ?? null : null), [cards, currentId]);
  const question = useMemo(() => (currentCard ? buildChoices(currentCard, deck) : null), [currentCard, deck]);
  const summary = summarizeSession(session);
  const advance = () => { setPosition((c) => (c + 1) % queue.length); setPhase('prompt'); setLastResult(null); };
  const choose = (optionId) => { if (phase !== 'prompt' || !question || !currentCard) return; const result = gradeChoice(question, optionId); onAttempt(currentCard, result.correct); setLastResult(result); setPhase('answered'); };
  const reveal = () => { if (phase !== 'prompt' || !currentCard) return; if (mode === 'flashcard') { setPhase('revealed'); return; } onAttempt(currentCard, false); setLastResult({ correct: false, chosenName: '' }); setPhase('answered'); };
  const selfGrade = (correct) => { if (phase !== 'revealed' || !currentCard) return; onAttempt(currentCard, correct); advance(); };
  const changeMode = (next) => { setMode(next); setPhase('prompt'); setLastResult(null); };
  if (!currentCard || !question) return null;
  return (
    <Card style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionHeading>Drill</SectionHeading>
        <HelpText>Card {(position % queue.length) + 1} of {queue.length}</HelpText>
      </div>
      <div role="tablist" aria-label="Drill mode" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['graded', 'flashcard'].map((id) => <Button key={id} role="tab" aria-selected={mode === id} variant={mode === id ? 'primary' : 'secondary'} onClick={() => changeMode(id)}>{id === 'graded' ? 'Graded' : 'Flashcard'}</Button>)}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', fontSize: 12, color: 'var(--color-text-secondary)' }}>
        <span>Asked <strong>{summary.asked}</strong></span>
        <span>Correct <strong>{summary.correct}</strong></span>
        <span>Missed <strong>{summary.missed}</strong></span>
        <span>Accuracy <strong>{summary.accuracy === null ? '—' : `${summary.accuracy}%`}</strong></span>
        <Button onClick={onRestart} style={{ marginLeft: 'auto', padding: '4px 9px', fontSize: 11 }}>Restart</Button>
      </div>
      <DrillPanel question={question} card={currentCard} mode={mode} phase={phase} lastResult={lastResult} onChoose={choose} onReveal={reveal} onSelfGrade={selfGrade} onNext={advance} onSkip={advance} />
      <Button aria-label={`Edit properties for ${currentCard.name}`} onClick={() => onEdit(currentCard.id)} style={{ padding: '4px 9px', fontSize: 11 }}>Edit this card</Button>
    </Card>
  );
}

export default function SpecimenPractice() {
  const [initial] = useState(loadAuthored);
  const [authored, setAuthored] = useState(initial.authored);
  const [storageError, setStorageError] = useState(initial.error);
  const [includeState, setIncludeState] = useState(false);
  const [cls, setCls] = useState('');
  const [onlyRecorded, setOnlyRecorded] = useState(true);

  const cards = useMemo(() => buildCards(authored), [authored]);
  const stats = useMemo(() => deckStats(cards, { includeState, cls, onlyRecorded }), [cards, includeState, cls, onlyRecorded]);
  const deck = useMemo(() => buildDeck(cards, { includeState, cls, onlyRecorded }), [cards, includeState, cls, onlyRecorded]);
  const coverage = useMemo(() => coverageOf(cards), [cards]);

  const [session, setSession] = useState(createSession());
  const [focusCards, setFocusCards] = useState(null);
  const [round, setRound] = useState(0);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState({ text: '', error: false });
  const [showMissed, setShowMissed] = useState(false);
  const [showRecord, setShowRecord] = useState(false);

  const activeDeck = focusCards ?? deck;
  const activeKey = activeDeck.map((c) => c.id).join('|');
  const missed = useMemo(() => missedCards(session, cards), [session, cards]);
  const editingCard = editingId ? cards.find((c) => c.id === editingId) : null;
  const recordingScope = cards.filter((c) => (includeState || c.level !== 'state') && (!cls || c.cls === cls));

  const attempt = (card, correct) => setSession((s) => recordAttempt(s, card, correct));
  const restart = () => { setSession(createSession()); setFocusCards(null); setRound((c) => c + 1); setMessage({ text: '', error: false }); };
  const practiceMissed = () => { if (!missed.length) return; const ids = new Set(missed.map((c) => c.id)); setFocusCards(deck.filter((c) => ids.has(c.id))); setRound((c) => c + 1); setShowMissed(false); setMessage({ text: `Drilling ${missed.length} missed mineral${missed.length === 1 ? '' : 's'}.`, error: false }); };
  const persist = (next) => { setAuthored(next); try { window.localStorage.setItem(SPECIMEN_STORAGE_KEY, JSON.stringify(next)); setStorageError(''); return true; } catch { setStorageError('Local storage is unavailable, so this change is kept for this session only.'); return false; } };
  const saveProperties = (properties) => { if (!editingCard) return; const saved = persist({ ...authored, [editingCard.id]: properties }); setMessage({ text: saved ? `Properties saved for ${editingCard.name}.` : `Properties for ${editingCard.name} updated for this session; local storage is unavailable.`, error: !saved }); setEditingId(''); setShowRecord(false); };
  const startEditing = (id) => { if (!cards.some((c) => c.id === id)) return; setEditingId(id); setShowRecord(true); setMessage({ text: '', error: false }); };

  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 960 }}>
      <ToolHeader eyebrow={`Rocks & Minerals C · ${SEASON.year}`} purpose={`Drill the ${SEASON.year} official mineral list from properties YOU recorded. Draw order is random, name stays hidden until you answer, nothing is pre-filled.`} steps={['Set up your deck below.', 'Drill — answer or reveal, the scoreboard tracks it.', 'Missed minerals? One click to drill just those.']} manualReference={CITATION} />

      {storageError && <StatusMessage tone="error">{storageError}</StatusMessage>}

      {/* ── 1. DECK SETUP (always visible, compact) ── */}
      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Deck setup</SectionHeading>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <SelectField label="Chemical class" value={cls} onChange={(e) => setCls(e.target.value)}>
            <option value="">Any class</option>
            {CHEMICAL_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectField>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <ToggleSwitch label="Include State/National" checked={includeState} onChange={(e) => setIncludeState(e.target.checked)} help={SEASON.mineralKey.levelNote} />
          <ToggleSwitch label="Only recorded minerals" checked={onlyRecorded} onChange={(e) => setOnlyRecorded(e.target.checked)} help="Off = cards with no properties still appear (prompt with nothing)." />
        </div>
        <ResultPanel>{stats.inScope} in scope · {stats.scoped} after class · {stats.recorded} recorded · <strong>{stats.deck} in deck</strong>{focusCards && ` (${focusCards.length} missed only)`}</ResultPanel>
        {stats.deck === 0 && <StatusMessage tone="error">Deck empty. Record properties below, widen scope, or clear class filter.</StatusMessage>}
      </Card>

      {/* ── 2. DRILL (primary) ── */}
      {activeDeck.length > 0 && <Drill key={`${activeKey}#${round}`} deck={activeDeck} cards={cards} session={session} onAttempt={attempt} onRestart={restart} onEdit={startEditing} />}
      {activeDeck.length === 0 && <EmptyState icon="ti-cards" title="No cards in deck" description="Configure the deck above, then record properties for at least one mineral." />}

      {/* ── 3. MISSED (collapsed) ── */}
      {missed.length > 0 && (
        <Collapsible summary={`Missed this session — ${missed.length} mineral${missed.length === 1 ? '' : 's'}`} defaultOpen={false}>
          <Card style={{ display: 'grid', gap: 10 }}>
            <p style={bodyText}>Each was answered incorrectly or revealed. Drill them again, or fix the card if properties were wrong.</p>
            <ul style={listStyle}>{missed.map((card) => <li key={card.id} style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}><CardDetails card={card} /><Button aria-label={`Edit ${card.name}`} onClick={() => startEditing(card.id)} style={{ padding: '4px 9px', fontSize: 11 }}>Edit</Button></li>)}</ul>
            <PrimaryAction label="Practice missed again" icon="ti-refresh" onClick={practiceMissed} />
          </Card>
        </Collapsible>
      )}

      {/* ── 4. RECORD PROPERTIES (only when editing) ── */}
      {editingCard && (
        <Card style={{ display: 'grid', gap: 10, borderColor: 'var(--color-accent-primary)', boxShadow: 'var(--shadow-md)' }}>
          <SectionHeading>Recording: {editingCard.name}</SectionHeading>
          <PropertyForm key={editingCard.id} card={editingCard} onSave={saveProperties} onCancel={() => { setEditingId(''); setShowRecord(false); }} />
          {message.text && <StatusMessage tone={message.error ? 'error' : 'status'}>{message.text}</StatusMessage>}
        </Card>
      )}

      {/* ── 5. FOOTER: Quick record access + backup ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', paddingTop: 4, borderTop: '1px solid var(--color-border-tertiary)', color: 'var(--color-text-tertiary)', fontSize: 11 }}>
        <span>{coverage.recorded} of {coverage.total} minerals have recorded properties.</span>
        <SelectField label="Quick record" value={editingId} onChange={(e) => (e.target.value ? startEditing(e.target.value) : (setEditingId(''), setShowRecord(false)))} style={{ width: 'auto', minWidth: 200 }}>
          <option value="">Choose a mineral to record…</option>
          {CHEMICAL_CLASSES.map((g) => { const gcs = recordingScope.filter((c) => c.cls === g); if (!gcs.length) return null; return <optgroup key={g} label={g}>{gcs.map((c) => <option key={c.id} value={c.id}>{c.name}{c.level === 'state' ? ' (S/N)' : ''}</option>)}</optgroup>; })}
        </SelectField>
        {message.text && <StatusMessage tone={message.error ? 'error' : 'status'} style={{ marginLeft: 'auto' }}>{message.text}</StatusMessage>}
      </div>
    </div>
  );
}