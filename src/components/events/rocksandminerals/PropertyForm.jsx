// Rocks and Minerals — the shared specimen-property editor.
//
// Both R&M practice tools write to the same recorded-property store, so the
// editor lives here rather than inside one of them: the Mineral ID Key uses it
// to author candidate data, and the Specimen Practice drill reuses it to fill in
// a card it draws. It owns only the draft and the hardness-order check; saving
// (and its persistence/messages) stays with the tool that knows its own status
// reporting.
import { useState } from 'react';
import {
  ACID_OPTIONS,
  CLEAVAGE_OPTIONS,
  HARDNESS_MAX,
  HARDNESS_MIN,
  LUSTER_OPTIONS,
  MAGNETIC_OPTIONS,
  STREAK_OPTIONS,
  formatHardness,
  sanitizeProperties
} from './specimenCardsUtils';
import {
  Button,
  CheckboxField,
  NumberField,
  SelectField,
  StatusMessage,
  TextAreaField
} from '../../general/ui/primitives';

const groupStyle = { border: 0, padding: 0, margin: 0, display: 'grid', gap: 6 };
const legendStyle = { color: 'var(--color-text-secondary)', fontSize: 11, padding: 0 };
const checkGrid = { display: 'flex', flexWrap: 'wrap', gap: '6px 16px' };
const fieldGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 };

function copyDraft(properties) {
  const safe = sanitizeProperties(properties);
  return {
    ...safe,
    luster: [...safe.luster],
    cleavage: [...safe.cleavage],
    streak: [...safe.streak]
  };
}

/** A labelled set of toggle chips; `selected` holds property ids. */
export function TagChecks({ legend, options, selected, onToggle }) {
  return (
    <fieldset style={groupStyle}>
      <legend style={legendStyle}>{legend}</legend>
      <div style={checkGrid}>
        {options.map((option) => (
          <CheckboxField
            key={option.id}
            label={option.label}
            checked={selected.includes(option.id)}
            onChange={() => onToggle(option.id)}
          />
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Property editor for one mineral. `onSave` receives sanitised properties; it is
 * called only after the draft passes the hardness-order check, and the draft is
 * re-synced to the sanitised values so the form shows exactly what was stored.
 */
export default function PropertyForm({ card, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => copyDraft(card.properties));
  const [error, setError] = useState('');

  const update = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));
  const toggle = (key) => (id) => setDraft((current) => ({
    ...current,
    [key]: current[key].includes(id)
      ? current[key].filter((tag) => tag !== id)
      : [...current[key], id]
  }));

  const submit = (event) => {
    event.preventDefault();
    const properties = sanitizeProperties(draft);
    const low = properties.hardnessMin === '' ? null : Number(properties.hardnessMin);
    const high = properties.hardnessMax === '' ? null : Number(properties.hardnessMax);
    if (low !== null && high !== null && low > high) {
      setError('Hardness low must not be greater than hardness high.');
      return;
    }
    setError('');
    setDraft(copyDraft(properties));
    onSave(properties);
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 10 }} aria-label={`Properties for ${card.name}`}>
      <Collapsible summary={`Luster — ${card.name}`} defaultOpen={true}>
        <TagChecks
          legend={`Luster — ${card.name}`}
          options={LUSTER_OPTIONS}
          selected={draft.luster}
          onToggle={toggle('luster')}
        />
      </Collapsible>
      <Collapsible summary="Hardness range (Mohs)">
        <div style={fieldGrid}>
          <NumberField
            label="Hardness low"
            unit="Mohs"
            min={HARDNESS_MIN}
            max={HARDNESS_MAX}
            value={draft.hardnessMin}
            onChange={update('hardnessMin')}
            help={`Published range; ${HARDNESS_MIN}–${HARDNESS_MAX}.`}
          />
          <NumberField
            label="Hardness high"
            unit="Mohs"
            min={HARDNESS_MIN}
            max={HARDNESS_MAX}
            value={draft.hardnessMax}
            onChange={update('hardnessMax')}
            help={formatHardness(draft) ? `Shows as ${formatHardness(draft)}.` : 'Leave both blank if you did not test it.'}
          />
        </div>
      </Collapsible>
      <Collapsible summary={`Cleavage or fracture — ${card.name}`}>
        <TagChecks
          legend={`Cleavage or fracture — ${card.name}`}
          options={CLEAVAGE_OPTIONS}
          selected={draft.cleavage}
          onToggle={toggle('cleavage')}
        />
      </Collapsible>
      <Collapsible summary={`Streak — ${card.name}`}>
        <TagChecks
          legend={`Streak — ${card.name}`}
          options={STREAK_OPTIONS}
          selected={draft.streak}
          onToggle={toggle('streak')}
        />
      </Collapsible>
      <Collapsible summary="Acid reaction & magnetism">
        <div style={fieldGrid}>
          <SelectField label="Recorded acid reaction" value={draft.acid} onChange={update('acid')}>
            <option value="">Not recorded</option>
            {ACID_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </SelectField>
          <SelectField label="Recorded magnetism" value={draft.magnetic} onChange={update('magnetic')}>
            <option value="">Not recorded</option>
            {MAGNETIC_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </SelectField>
        </div>
      </Collapsible>
      <TextAreaField
        label="Distinguishing notes"
        rows={3}
        value={draft.notes}
        onChange={update('notes')}
        placeholder="e.g. three perfect cleavage directions at 90°, metallic gray, smells of sulfur when struck"
      />
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
        <Button type="submit" variant="primary">Save properties</Button>
        <Button onClick={onCancel}>Close without saving</Button>
      </div>
    </form>
  );
}
