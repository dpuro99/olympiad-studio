import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addBlock,
  assembleSheet,
  COMPILER_STATUS,
  computeBudget,
  countCharacters,
  createEmptyState,
  DENSITY_PRESETS,
  indexObjectives,
  LEVEL_LABELS,
  progressSummary,
  removeBlock,
  safeParseState,
  selectVisibleBlocks,
  serializeState,
  setObjectiveStatus,
  STATUS_LABELS,
  STATUS_ORDER,
  updateBlock
} from './referenceCompilerUtils';

const cardStyle = {
  background: 'var(--color-background-secondary)',
  border: '1px solid var(--color-border-tertiary)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 18
};
const inputStyle = {
  width: '100%', padding: '9px 10px', background: 'var(--color-background-tertiary)',
  border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)',
  borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-mono)'
};
const secondaryButton = {
  padding: '9px 12px', border: '1px solid var(--color-border-secondary)',
  borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)',
  background: 'transparent', fontSize: 12
};
const primaryButton = {
  padding: '9px 12px', border: 0, borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-text-info)', color: '#fff', fontWeight: 600, fontSize: 12
};

const levelBadgeStyle = (level) => ({
  fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '.04em', textTransform: 'uppercase',
  color: level === 'national-only' ? 'var(--color-text-danger)' : level === 'state-national' ? 'var(--color-text-warning)' : 'var(--color-text-info)',
  border: '1px solid var(--color-border-secondary)', borderRadius: 4, padding: '1px 5px', whiteSpace: 'nowrap'
});

export default function ReferenceCompiler({ config }) {
  const [state, setState] = useState(createEmptyState);
  const [savedSnapshot, setSavedSnapshot] = useState(() => serializeState(createEmptyState()));
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [form, setForm] = useState({ editingId: null, objectiveId: '', title: '', body: '' });
  const [levelFilter, setLevelFilter] = useState('all');
  const [pruneConfident, setPruneConfident] = useState(false);
  const importRef = useRef(null);

  const objectives = useMemo(() => indexObjectives(config), [config]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(config.storageKey);
        if (stored) {
          const parsed = safeParseState(stored);
          if (parsed.error) {
            setMessage(parsed.error);
            setMessageIsError(true);
          } else {
            setState(parsed.value);
            setSavedSnapshot(serializeState(parsed.value));
            setMessage('Saved reference sheet loaded from this browser.');
          }
        }
      } catch {
        setMessage('Local storage unavailable; you can still print or export a JSON backup.');
        setMessageIsError(true);
      } finally {
        setLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [config.storageKey]);

  const firstObjectiveId = (config.objectiveGroups[0]?.objectives[0]?.id) || '';
  const selectedObjectiveId = form.objectiveId || firstObjectiveId;

  const cleanMessage = () => { if (message) { setMessage(''); setMessageIsError(false); } };
  const mutate = (updater) => { setState(updater); cleanMessage(); };

  const dirty = serializeState(state) !== savedSnapshot;
  const densityPreset = DENSITY_PRESETS.find((preset) => preset.id === state.density) || DENSITY_PRESETS[1];
  const visibleBlocks = selectVisibleBlocks(config, state, { pruneConfident });
  const charCount = countCharacters(visibleBlocks);
  const budget = computeBudget(charCount, densityPreset.charsPerSide, config.resource.sides);
  const progress = progressSummary(config, state);

  const submitBlock = (event) => {
    event.preventDefault();
    if (!form.title.trim() && !form.body.trim()) {
      setMessage('Add a title or body before saving a reference block.');
      setMessageIsError(true);
      return;
    }
    if (form.editingId) {
      mutate((current) => updateBlock(current, form.editingId, { objectiveId: form.objectiveId, title: form.title, body: form.body }));
    } else {
      mutate((current) => addBlock(current, { objectiveId: selectedObjectiveId, title: form.title, body: form.body }));
    }
    setForm({ editingId: null, objectiveId: selectedObjectiveId, title: '', body: '' });
    setMessage(form.editingId ? 'Reference block updated.' : 'Reference block added.');
    setMessageIsError(false);
  };

  const editBlock = (block) => {
    setForm({ editingId: block.id, objectiveId: block.objectiveId, title: block.title, body: block.body });
    setMessage('');
    setMessageIsError(false);
  };

  const save = () => {
    try {
      window.localStorage.setItem(config.storageKey, serializeState(state));
      setSavedSnapshot(serializeState(state));
      setMessage('Reference sheet saved in this browser.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not save locally. Print or export a JSON backup instead.');
      setMessageIsError(true);
    }
  };

  const exportJson = () => {
    const payload = { event: config.eventId, kind: 'reference-compiler', version: 1, state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.fileStem}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Backup exported as JSON. It contains only the content you authored.');
    setMessageIsError(false);
  };

  const importJson = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = safeParseState(String(reader.result));
      if (parsed.error) {
        setMessage(parsed.error);
        setMessageIsError(true);
        return;
      }
      setState(parsed.value);
      setMessage('Backup loaded into the editor. Save it to keep it in this browser.');
      setMessageIsError(false);
    };
    reader.onerror = () => {
      setMessage('That file could not be read.');
      setMessageIsError(true);
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    if (!window.confirm('Clear the saved reference sheet and all authored blocks in this browser?')) return;
    try {
      window.localStorage.removeItem(config.storageKey);
    } catch {
      // Ignore: we still reset the in-memory editor below.
    }
    const empty = createEmptyState();
    setState(empty);
    setSavedSnapshot(serializeState(empty));
    setForm({ editingId: null, objectiveId: firstObjectiveId, title: '', body: '' });
    setMessage('Reference sheet cleared.');
    setMessageIsError(false);
  };

  const groupsForDisplay = config.objectiveGroups
    .map((group) => ({
      group,
      objectives: group.objectives.filter((objective) => levelFilter === 'all' || objective.level === levelFilter)
    }))
    .filter((entry) => entry.objectives.length > 0);

  const blocksForObjective = (objectiveId) => state.blocks.filter((block) => block.objectiveId === objectiveId);
  const sheetSections = assembleSheet(config, state, { pruneConfident });

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 960 }}>
      <section style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <div style={{ color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          {config.eventName} {config.division} · 2027 · {config.manualReference}
        </div>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          Track the manual&rsquo;s objectives and compile the one allowed reference sheet. Content is authored by you and stored only in this browser; nothing is uploaded. This organizer does not replace the official Rules Manual.
        </p>
        <div style={{ padding: '10px 12px', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}>
          <strong style={{ fontSize: 12 }}>Allowed resource: {config.resource.title}</strong>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginTop: 4 }}>{config.resource.summary}</div>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.6 }}>
            {config.resource.constraints.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
          <h2 style={{ margin: 0, fontSize: 15 }}>Study progress</h2>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {progress.confident}/{progress.total} confident · {progress.studying} studying
          </span>
        </div>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.6 }}>{config.objectivesNote}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <label style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>Show level
            <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} style={{ ...inputStyle, marginTop: 4, width: 'auto' }}>
              <option value="all">All levels</option>
              <option value="core">Core</option>
              <option value="state-national">State/National</option>
              <option value="national-only">National</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', fontSize: 12 }}>
            <input type="checkbox" checked={pruneConfident} onChange={(event) => setPruneConfident(event.target.checked)} />
            Sheet preview hides Confident objectives
          </label>
        </div>
        {groupsForDisplay.map(({ group, objectives: objectivesForGroup }) => (
          <div key={group.id} style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{group.label}</div>
            {objectivesForGroup.map((objective) => (
              <div key={objective.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', padding: '6px 0', borderTop: '1px solid var(--color-border-tertiary)' }}>
                <span style={{ flex: '1 1 220px', fontSize: 12, lineHeight: 1.5 }}>{objective.label}</span>
                <span style={levelBadgeStyle(objective.level)}>{LEVEL_LABELS[objective.level] || objective.level}</span>
                <span style={{ display: 'inline-flex', gap: 4 }} role="group" aria-label={`Status for ${objective.label}`}>
                  {STATUS_ORDER.map((status) => {
                    const active = (state.objectiveStatus[objective.id] || COMPILER_STATUS.NOT_STARTED) === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        aria-pressed={active}
                        onClick={() => mutate((current) => setObjectiveStatus(current, objective.id, status))}
                        style={{
                          padding: '5px 8px', fontSize: 11, borderRadius: 'var(--border-radius-md)',
                          border: `1px solid ${active ? 'var(--color-text-info)' : 'var(--color-border-secondary)'}`,
                          background: active ? 'var(--color-background-info)' : 'transparent',
                          color: active ? 'var(--color-text-info)' : 'var(--color-text-secondary)'
                        }}
                      >{STATUS_LABELS[status]}</button>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 15 }}>{form.editingId ? 'Edit reference block' : 'Add reference block'}</h2>
        <form onSubmit={submitBlock} style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
            Objective
            <select value={selectedObjectiveId} onChange={(event) => setForm((current) => ({ ...current, objectiveId: event.target.value }))} style={inputStyle}>
              {config.objectiveGroups.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {group.objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.label}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
            Heading
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Respiratory volumes" style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
            Content
            <textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} rows={4} placeholder="Write the facts, diagram notes, or values you want on the sheet." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" style={primaryButton}>{form.editingId ? 'Update block' : 'Add block'}</button>
            {form.editingId && <button type="button" style={secondaryButton} onClick={() => setForm({ editingId: null, objectiveId: selectedObjectiveId, title: '', body: '' })}>Cancel edit</button>}
          </div>
        </form>
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 15 }}>Compiled blocks ({state.blocks.length})</h2>
        {state.blocks.length === 0
          ? <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12 }}>No reference blocks yet. Add one above.</p>
          : config.objectiveGroups.map((group) => {
            const rows = group.objectives.flatMap((objective) => blocksForObjective(objective.id).map((block) => ({ objective, block })));
            if (rows.length === 0) return null;
            return (
              <div key={group.id} style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{group.label}</div>
                {rows.map(({ objective, block }) => (
                  <article key={block.id} style={{ padding: 12, border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                      <strong style={{ fontSize: 13 }}>{block.title || 'Reference block'}</strong>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>{objective.label}</span>
                    </div>
                    {block.body && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>{block.body}</p>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button type="button" style={{ ...secondaryButton, padding: '4px 8px' }} onClick={() => editBlock(block)}>Edit</button>
                      <button type="button" style={{ ...secondaryButton, padding: '4px 8px', color: 'var(--color-text-danger)' }} onClick={() => mutate((current) => removeBlock(current, block.id))}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            );
          })}
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 15 }}>Sheet space budget</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end' }}>
          <label style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>Text density
            <select value={state.density} onChange={(event) => mutate((current) => ({ ...current, density: event.target.value }))} style={{ ...inputStyle, marginTop: 4, width: 'auto' }}>
              {DENSITY_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.label} · {preset.hint}</option>)}
            </select>
          </label>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {budget.charCount} / {budget.capacity} characters
          </span>
        </div>
        <div aria-hidden="true" style={{ height: 8, borderRadius: 4, background: 'var(--color-background-tertiary)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(100, Math.round(budget.ratio * 100))}%`, background: budget.over ? 'var(--color-text-danger)' : 'var(--color-text-info)' }} />
        </div>
        {budget.over
          ? <div role="alert" style={{ color: 'var(--color-text-danger)', fontSize: 12 }}>About {budget.overBy} characters over one double-sided sheet at this density. Trim content or increase density.</div>
          : <div style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>Approximate remaining room: {budget.capacity - budget.charCount} characters. Estimates are guidance, not a rule.</div>}
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
          <h2 style={{ margin: 0, fontSize: 15 }}>Save, print &amp; export</h2>
          {dirty
            ? <span style={{ color: 'var(--color-text-warning)', fontSize: 11 }}>Unsaved changes</span>
            : <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>All changes saved</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" style={primaryButton} disabled={!loaded || !dirty} onClick={save}>{dirty ? 'Save in this browser' : 'Saved'}</button>
          <button type="button" style={secondaryButton} onClick={() => window.print()}><i className="ti ti-printer" aria-hidden="true" /> Print sheet</button>
          <button type="button" style={secondaryButton} onClick={exportJson}>Export JSON backup</button>
          <button type="button" style={secondaryButton} onClick={() => importRef.current?.click()}>Import JSON</button>
          <input ref={importRef} type="file" accept="application/json,.json" onChange={importJson} style={{ display: 'none' }} />
          <button type="button" style={{ ...secondaryButton, color: 'var(--color-text-danger)' }} onClick={clearAll}>Clear sheet</button>
        </div>
        {message && <div role={messageIsError ? 'alert' : 'status'} style={{ color: messageIsError ? 'var(--color-text-danger)' : 'var(--color-text-secondary)', fontSize: 11 }}>{message}</div>}
      </section>

      <div className="reference-print-area" aria-hidden="true">
        <h1 style={{ fontSize: 16, margin: '0 0 4px' }}>{config.eventName} {config.division} — reference sheet</h1>
        <div style={{ fontSize: 11, marginBottom: 10 }}>
          {config.manualReference} · {config.resource.title}{pruneConfident ? ' · confident objectives hidden' : ''}
        </div>
        {sheetSections.length === 0
          ? <p style={{ fontSize: 12 }}>No content selected for the sheet.</p>
          : sheetSections.map(({ group, sections }) => (
            <section key={group.id} style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 13, margin: '0 0 4px', borderBottom: '1px solid #000' }}>{group.label}</h2>
              {sections.map(({ objective, blocks }) => (
                <div key={objective.id} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{objective.label}</div>
                  {blocks.map((block) => (
                    <div key={block.id} style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>
                      {block.title && <strong>{block.title}: </strong>}{block.body}
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}
      </div>

      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Source: {config.manualReference}. Objectives are transcribed from the manual summary; the specific required lists are in the manual. This is a study organizer, not an exam or official score.
      </p>
      {!loaded && <div style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>Loading saved sheet…</div>}
      {objectives.size === 0 && <div role="alert" style={{ color: 'var(--color-text-danger)', fontSize: 11 }}>This event has no objectives configured.</div>}
    </div>
  );
}
