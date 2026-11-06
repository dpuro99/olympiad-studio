import { useMemo, useRef, useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { fileStem } from '../../../seasons/storageKeys.js';
import {
  ACID_OPTIONS,
  CHEMICAL_CLASSES,
  CLEAVAGE_OPTIONS,
  HARDNESS_MIN,
  HARDNESS_TOLERANCE,
  LUSTER_OPTIONS,
  MAGNETIC_OPTIONS,
  MINERAL_KEY,
  SPECIMEN_STORAGE_KEY,
  STREAK_OPTIONS,
  activeCriteriaCount,
  buildCards,
  buildCardsCsv,
  cardsInScope,
  coverageOf,
  createCriteria,
  hasRecordedProperties,
  importCardsCsv,
  propertyReadouts,
  rankCandidates,
  safeParseAuthored
} from './specimenCardsUtils';
import PropertyForm from './PropertyForm';
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

const SEASON = ACTIVE_DATA.rocksandminerals;
const LEVEL_NOTE = MINERAL_KEY.levelNote;
const HARDNESS_CHOICES = Array.from({ length: 19 }, (_, index) => (HARDNESS_MIN + index * 0.5).toFixed(1));

const bodyText = { margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.6 };
const chipStyle = {
  display: 'inline-block', padding: '2px 7px', borderRadius: 999,
  border: '1px solid var(--color-border-secondary)', background: 'var(--color-background-tertiary)',
  fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--color-text-primary)'
};
const badgeStyle = { ...chipStyle, borderColor: 'var(--color-border-info)', background: 'var(--color-background-info)', color: 'var(--color-text-info)' };
const listStyle = { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 };
const rowStyle = { display: 'grid', gap: 6, padding: 12, border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' };

const COMMON_LUSTER = LUSTER_OPTIONS.slice(0, 5);
const MORE_LUSTER = LUSTER_OPTIONS.slice(5);
const COMMON_CLEAVAGE = CLEAVAGE_OPTIONS;
const COMMON_STREAK = STREAK_OPTIONS.slice(0, 5);
const MORE_STREAK = STREAK_OPTIONS.slice(5);

function loadAuthored() {
  try {
    const serialized = window.localStorage.getItem(SPECIMEN_STORAGE_KEY);
    if (serialized === null) return { authored: {}, error: '' };
    const parsed = safeParseAuthored(serialized);
    if (parsed.error) return { authored: {}, error: parsed.error };
    return { authored: parsed.value, error: '' };
  } catch {
    return { authored: {}, error: 'Local storage is unavailable in this browser, so property records cannot be saved or restored.' };
  }
}

function PropertyChips({ card }) {
  const readouts = propertyReadouts(card);
  if (!readouts.length) return <HelpText>No properties recorded yet.</HelpText>;
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{readouts.map((item) => <span key={item.label} style={chipStyle}>{item.label}: {item.value}</span>)}</div>;
}

function CandidateRow({ card, onEdit, conflict }) {
  return (
    <li style={rowStyle}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline' }}>
        <strong style={{ fontSize: 13 }}>{card.name}</strong>
        <span style={chipStyle}>{card.cls}</span>
        {card.group && <span style={chipStyle}>{card.group}</span>}
        {card.level === 'state' && <span style={badgeStyle}>State/National</span>}
        <Button aria-label={`Edit properties for ${card.name}`} onClick={() => onEdit(card.id)} style={{ marginLeft: 'auto', padding: '4px 9px', fontSize: 11 }}>Edit</Button>
      </div>
      <PropertyChips card={card} />
      {card.note && <HelpText>{card.note}</HelpText>}
      {card.properties.notes && <p style={{ ...bodyText, color: 'var(--color-text-primary)' }}>{card.properties.notes}</p>}
      {conflict && <p style={{ margin: 0, color: 'var(--color-text-danger)', fontSize: 11, lineHeight: 1.5 }}>Ruled out on {conflict.property}: you observed {conflict.wanted}, recorded {conflict.recorded}.</p>}
    </li>
  );
}

export default function MineralIdKey() {
  const [initial] = useState(loadAuthored);
  const [authored, setAuthored] = useState(initial.authored);
  const [storageError, setStorageError] = useState(initial.error);
  const [includeState, setIncludeState] = useState(false);
  const [criteria, setCriteria] = useState(createCriteria);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState({ text: '', error: false });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const importRef = useRef(null);

  const cards = useMemo(() => buildCards(authored), [authored]);
  const visible = useMemo(() => cardsInScope(cards, includeState), [cards, includeState]);
  const coverage = coverageOf(cards);
  const active = activeCriteriaCount(criteria);
  const ranked = useMemo(() => rankCandidates(visible, criteria), [visible, criteria]);
  const editingCard = editingId ? cards.find((card) => card.id === editingId) : null;

  const persist = (next) => { setAuthored(next); try { window.localStorage.setItem(SPECIMEN_STORAGE_KEY, JSON.stringify(next)); setStorageError(''); return true; } catch { setStorageError('Local storage is unavailable, so this change is kept for this session only.'); return false; } };

  const setCriterion = (key, value) => { setCriteria((current) => ({ ...current, [key]: value })); setMessage({ text: '', error: false }); };
  const toggleTag = (key, id) => { setCriteria((current) => { const selected = current[key]; return { ...current, [key]: selected.includes(id) ? selected.filter((tag) => tag !== id) : [...selected, id] }; }); setMessage({ text: '', error: false }); };
  const startEditing = (id) => { if (!cards.some((entry) => entry.id === id)) return; setEditingId(id); setMessage({ text: '', error: false }); };
  const cancelEditing = () => { setEditingId(''); };
  const saveProperties = (properties) => { if (!editingCard) return; const saved = persist({ ...authored, [editingCard.id]: properties }); setMessage({ text: saved ? `Properties saved for ${editingCard.name}.` : `Properties for ${editingCard.name} updated for this session; local storage is unavailable.`, error: !saved }); cancelEditing(); };
  const exportCsv = () => { const blob = new Blob([buildCardsCsv(cards)], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${fileStem('rocksandminerals', 'specimen-cards')}.csv`; link.click(); URL.revokeObjectURL(url); setMessage({ text: 'Mineral list exported as CSV with the properties you have recorded.', error: false }); };
  const importCsv = async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { const text = await file.text(); const result = importCardsCsv(text); if (result.error) { setMessage({ text: result.error, error: true }); return; } const next = { ...authored, ...result.authored }; const saved = persist(next); const parts = [`Imported properties for ${result.applied.length} mineral${result.applied.length === 1 ? '' : 's'}.`]; if (result.skipped.length) parts.push(`Ignored ${result.skipped.length} unknown name${result.skipped.length === 1 ? '' : 's'}: ${result.skipped.slice(0, 4).join(', ')}${result.skipped.length > 4 ? '…' : ''}.`); if (result.ignoredValues) parts.push(`${result.ignoredValues} value${result.ignoredValues === 1 ? '' : 's'} were not recognised and were left blank.`); if (!saved) parts.push('Local storage is unavailable, so this import is kept for this session only.'); setMessage({ text: parts.join(' '), error: false }); } catch { setMessage({ text: 'That file could not be read. Export the CSV first, then fill it in and import it back.', error: true }); } };
  const clearAll = () => { if (!window.confirm('Delete every recorded mineral property in this browser?')) return; try { window.localStorage.removeItem(SPECIMEN_STORAGE_KEY); setStorageError(''); setAuthored({}); setMessage({ text: 'Recorded mineral properties cleared.', error: false }); } catch { setMessage({ text: 'Local storage is unavailable, so saved properties could not be cleared.', error: true }); } cancelEditing(); };

  const recordedCards = visible.filter((card) => hasRecordedProperties(card.properties));
  const candidateCards = active ? ranked.matched.map((entry) => entry.card) : recordedCards;

  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 960 }}>
      <ToolHeader
        eyebrow={`Rocks & Minerals C · ${SEASON.year}`}
        purpose={`Pick what you see. The list narrows instantly. No properties are pre-filled — you record what you observe.`}
        manualReference={MINERAL_KEY.citation}
      />

      {storageError && <StatusMessage tone="error">{storageError}</StatusMessage>}

      {/* ── MAIN FLOW: Observations → Candidates ── */}
      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>What did you observe?</SectionHeading>

        <div style={{ display: 'grid', gap: 10 }}>
          {/* Row 1: Most common observations — always visible */}
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Luster</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {COMMON_LUSTER.map((opt) => (
                  <Button key={opt.id} variant={criteria.luster.includes(opt.id) ? 'primary' : 'secondary'} onClick={() => toggleTag('luster', opt.id)} style={{ padding: '6px 10px', fontSize: 12 }}>{opt.label}</Button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Cleavage / fracture</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {COMMON_CLEAVAGE.map((opt) => (
                  <Button key={opt.id} variant={criteria.cleavage.includes(opt.id) ? 'primary' : 'secondary'} onClick={() => toggleTag('cleavage', opt.id)} style={{ padding: '6px 10px', fontSize: 12 }}>{opt.label}</Button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Streak</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {COMMON_STREAK.map((opt) => (
                  <Button key={opt.id} variant={criteria.streak.includes(opt.id) ? 'primary' : 'secondary'} onClick={() => toggleTag('streak', opt.id)} style={{ padding: '6px 10px', fontSize: 12 }}>{opt.label}</Button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Hardness + quick filters */}
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <SelectField label={`Hardness (Mohs, ±${HARDNESS_TOLERANCE})`} value={criteria.hardness} onChange={(event) => setCriterion('hardness', event.target.value)} help="Leave at Any if not tested.">
              <option value="">Any</option>
              {HARDNESS_CHOICES.map((v) => <option key={v} value={v}>{v}</option>)}
            </SelectField>
            <SelectField label="Chemical class" value={criteria.cls} onChange={(event) => setCriterion('cls', event.target.value)}>
              <option value="">Any class</option>
              {CHEMICAL_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </SelectField>
          </div>

          {/* Advanced — collapsed by default */}
          <Collapsible summary={`Advanced observations (${MORE_LUSTER.length + MORE_STREAK.length + ACID_OPTIONS.length + MAGNETIC_OPTIONS.length} more)`} defaultOpen={false}>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>More luster</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{MORE_LUSTER.map((opt) => <Button key={opt.id} variant={criteria.luster.includes(opt.id) ? 'primary' : 'secondary'} onClick={() => toggleTag('luster', opt.id)} style={{ padding: '6px 10px', fontSize: 12 }}>{opt.label}</Button>)}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>More streak</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{MORE_STREAK.map((opt) => <Button key={opt.id} variant={criteria.streak.includes(opt.id) ? 'primary' : 'secondary'} onClick={() => toggleTag('streak', opt.id)} style={{ padding: '6px 10px', fontSize: 12 }}>{opt.label}</Button>)}</div>
              </div>
              <SelectField label="Acid reaction" value={criteria.acid} onChange={(event) => setCriterion('acid', event.target.value)} help="Study aid only — HCl not used at tournament."><option value="">Any</option>{ACID_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</SelectField>
              <SelectField label="Magnet" value={criteria.magnetic} onChange={(event) => setCriterion('magnetic', event.target.value)}><option value="">Any</option>{MAGNETIC_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</SelectField>
            </div>
          </Collapsible>

          {/* Clear button */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 4 }}>
            <Button onClick={() => setCriteria(createCriteria())} disabled={active === 0}>Clear all</Button>
            <HelpText>{active === 0 ? 'No observations selected.' : `${active} selected — candidates update live below.`}</HelpText>
          </div>
        </div>
      </Card>

      {/* ── CANDIDATES ── */}
      <Card style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <SectionHeading>Candidates</SectionHeading>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--color-text-secondary)' }}>
            <ToggleSwitch label="State/National" checked={includeState} onChange={(e) => setIncludeState(e.target.checked)} help={LEVEL_NOTE} />
            {active > 0 && <span>{ranked.matched.length} match · {ranked.unknown.length} need props · {ranked.excluded.length} ruled out</span>}
            {active === 0 && <span>{recordedCards.length} with recorded properties</span>}
          </div>
        </div>

        <ResultPanel>{active === 0 ? `No observations selected — showing ${recordedCards.length} mineral${recordedCards.length === 1 ? '' : 's'} with recorded properties (out of ${visible.length} in scope).` : `Matching ${ranked.matched.length} of ${visible.length} in-scope minerals.`}</ResultPanel>

        {candidateCards.length === 0 ? (
          <EmptyState
            icon={active === 0 ? 'ti-database' : 'ti-filter-off'}
            title={active === 0 ? 'Nothing recorded yet' : 'No matches'}
            description={active === 0 ? 'Record properties below, or export CSV, fill it in, and import it back.' : 'No mineral matches every observation with a recorded value. Relax an observation, or record more properties.'}
            action={active === 0 ? <PrimaryAction label="Record properties" icon="ti-edit" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} /> : undefined}
          />
        ) : (
          <ul style={listStyle} aria-label="Matching minerals">{candidateCards.map((card) => <CandidateRow key={card.id} card={card} onEdit={startEditing} />)}</ul>
        )}

        {/* Hidden buckets — one toggle */}
        {active > 0 && (ranked.unknown.length > 0 || ranked.excluded.length > 0) && (
          <Collapsible summary={`Show ${ranked.unknown.length} needing props + ${ranked.excluded.length} ruled out`}>
            {ranked.unknown.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{ranked.unknown.length} need properties recorded</div>
                <ul style={listStyle}>{ranked.unknown.map(({ card }) => <CandidateRow key={card.id} card={card} onEdit={startEditing} />)}</ul>
                <HelpText>Missing: {Array.from(new Set(ranked.unknown.flatMap((e) => e.verdict.missing))).join(', ') || 'nothing'}. Record those to judge.</HelpText>
              </div>
            )}
            {ranked.excluded.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{ranked.excluded.length} ruled out</div>
                <ul style={listStyle}>{ranked.excluded.map(({ card, verdict }) => <CandidateRow key={card.id} card={card} onEdit={startEditing} conflict={verdict.conflicts[0]} />)}</ul>
              </div>
            )}
          </Collapsible>
        )}

        {active === 0 && recordedCards.length < visible.length && (
          <Collapsible summary={`${visible.length - recordedCards.length} in-scope minerals have no properties recorded`}>
            <p style={{ ...bodyText, marginTop: 8 }}>{visible.filter((c) => !hasRecordedProperties(c.properties)).map((c) => c.name).join(' · ')}</p>
          </Collapsible>
        )}
      </Card>

      {/* ── RECORD PROPERTIES (only when editing) ── */}
      {editingCard && (
        <Card style={{ display: 'grid', gap: 10, borderColor: 'var(--color-accent-primary)', boxShadow: 'var(--shadow-md)' }}>
          <SectionHeading>Recording: {editingCard.name}</SectionHeading>
          <PropertyForm key={editingCard.id} card={editingCard} onSave={saveProperties} onCancel={cancelEditing} />
          {message.text && <StatusMessage tone={message.error ? 'error' : 'status'}>{message.text}</StatusMessage>}
        </Card>
      )}

      {/* ── FOOTER: Backup actions (minimal) ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', paddingTop: 4, borderTop: '1px solid var(--color-border-tertiary)', color: 'var(--color-text-tertiary)', fontSize: 11 }}>
        <span>{coverage.recorded} of {coverage.total} minerals have recorded properties.</span>
        <Button onClick={exportCsv} style={{ padding: '4px 10px', fontSize: 11 }}>Export CSV</Button>
        <Button onClick={() => importRef.current?.click()} style={{ padding: '4px 10px', fontSize: 11 }}>Import CSV</Button>
        <input ref={importRef} type="file" accept="text/csv,.csv" onChange={importCsv} style={{ display: 'none' }} />
        <Button variant="danger" onClick={clearAll} disabled={coverage.recorded === 0} style={{ padding: '4px 10px', fontSize: 11 }}>Clear all</Button>
        {message.text && <StatusMessage tone={message.error ? 'error' : 'status'} style={{ marginLeft: 'auto' }}>{message.text}</StatusMessage>}
      </div>
    </div>
  );
}