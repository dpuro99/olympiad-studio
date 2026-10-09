export default function EventRulesOverview({ mod }) {
  return (
    <section style={{
      display: 'grid',
      gap: 14,
      maxWidth: 760,
      padding: 20,
      background: 'var(--color-background-secondary)',
      border: '1px solid var(--color-border-tertiary)',
      borderRadius: 'var(--border-radius-lg)'
    }}>
      <div>
        <div style={{
          color: 'var(--color-text-info)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          marginBottom: 8
        }}>
          Verified against 2027 official rules
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>{mod.eventName} — 2027 overview</h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
          {mod.description}
        </p>
      </div>

      <ul style={{ display: 'grid', gap: 8, paddingLeft: 20, margin: 0 }}>
        {(mod.ruleSummary || []).map((item) => (
          <li key={item} style={{ color: 'var(--color-text-primary)', fontSize: 13, lineHeight: 1.55 }}>{item}</li>
        ))}
      </ul>

      <div style={{ paddingTop: 10, borderTop: '1px solid var(--color-border-tertiary)', color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.6 }}>
        Source: {mod.manualReference}. This summary does not replace the official Rules Manual or any tournament/state-specific instructions.
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12 }}>
        {mod.eventUrl && <a href={mod.eventUrl} target="_blank" rel="noreferrer">Official event page</a>}
        <a href="https://www.soinc.org/rules-2027" target="_blank" rel="noreferrer">2027 rules</a>
        <a href="https://www.soinc.org/events/rules-clarifications" target="_blank" rel="noreferrer">Corrections</a>
        <a href="https://www.soinc.org/frequently_asked_questions" target="_blank" rel="noreferrer">Clarifications</a>
      </div>
    </section>
  );
}
