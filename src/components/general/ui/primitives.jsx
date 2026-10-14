// Shared UI primitives for event tools.
//
// These are presentational only: no domain logic, no event-specific formulas.
// They exist so every tool looks and behaves the same way, which is what makes
// the suite easy to learn. Prefer these over re-declaring card/input/button
// styles inside each tool.

const cardStyle = {
  background: 'var(--color-background-secondary)',
  border: '1px solid var(--color-border-tertiary)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 18
};

const inputStyle = {
  width: '100%',
  padding: '9px 10px',
  background: 'var(--color-background-tertiary)',
  border: '1px solid var(--color-border-secondary)',
  color: 'var(--color-text-primary)',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'var(--font-mono)'
};

const textInputStyle = { ...inputStyle, fontFamily: 'var(--font-sans)' };

const buttonVariants = {
  primary: { background: 'var(--color-text-info)', color: '#fff', border: '1px solid transparent' },
  secondary: { background: 'transparent', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-secondary)' },
  danger: { background: 'transparent', color: 'var(--color-text-danger)', border: '1px solid var(--color-border-secondary)' }
};

export function Card({ as: Tag = 'section', style, children, ...rest }) {
  return <Tag style={{ ...cardStyle, ...style }} {...rest}>{children}</Tag>;
}

export function SectionHeading({ as: Tag = 'h2', children, style, ...rest }) {
  return <Tag style={{ margin: 0, fontSize: 15, ...style }} {...rest}>{children}</Tag>;
}

export function Eyebrow({ children, style }) {
  return (
    <div style={{
      color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)',
      letterSpacing: '.06em', textTransform: 'uppercase', ...style
    }}>
      {children}
    </div>
  );
}

export function Button({ variant = 'secondary', type = 'button', style, children, ...rest }) {
  const base = {
    padding: '9px 12px',
    borderRadius: 'var(--border-radius-md)',
    fontSize: 12,
    fontWeight: 600,
    ...(buttonVariants[variant] || buttonVariants.secondary)
  };
  return <button type={type} style={{ ...base, ...style }} {...rest}>{children}</button>;
}

export function HelpText({ children, style }) {
  return <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5, ...style }}>{children}</p>;
}

export function EmptyState({ children }) {
  return <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12 }}>{children}</p>;
}

// tone: 'status' (neutral), 'success', or 'error' (renders role="alert").
export function StatusMessage({ tone = 'status', children, style }) {
  const color = tone === 'error'
    ? 'var(--color-text-danger)'
    : tone === 'success'
      ? 'var(--color-text-success)'
      : 'var(--color-text-secondary)';
  return <div role={tone === 'error' ? 'alert' : 'status'} style={{ color, fontSize: 11, lineHeight: 1.5, ...style }}>{children}</div>;
}

export function ResultPanel({ children, style }) {
  return (
    <div role="status" aria-live="polite" style={{
      padding: 12, border: '1px solid var(--color-border-info)', borderRadius: 'var(--border-radius-md)',
      background: 'var(--color-background-info)', fontSize: 12, ...style
    }}>
      {children}
    </div>
  );
}

function Field({ label, help, children, style }) {
  return (
    <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.4, ...style }}>
      <span>{label}</span>
      {children}
      {help && <span style={{ color: 'var(--color-text-secondary)', fontSize: 10, lineHeight: 1.4 }}>{help}</span>}
    </label>
  );
}

export function NumberField({ label, unit, value, onChange, help, ...rest }) {
  return (
    <Field label={unit ? `${label} (${unit})` : label} help={help}>
      <input type="number" min="0" step="any" value={value} onChange={onChange} style={inputStyle} {...rest} />
    </Field>
  );
}

export function TextField({ label, unit, value, onChange, help, style, ...rest }) {
  return (
    <Field label={unit ? `${label} (${unit})` : label} help={help}>
      <input type="text" value={value} onChange={onChange} style={{ ...textInputStyle, ...style }} {...rest} />
    </Field>
  );
}

export function TextAreaField({ label, value, onChange, help, rows = 4, style, ...rest }) {
  return (
    <Field label={label} help={help}>
      <textarea rows={rows} value={value} onChange={onChange} style={{ ...textInputStyle, resize: 'vertical', ...style }} {...rest} />
    </Field>
  );
}

export function SelectField({ label, value, onChange, help, children, style, ...rest }) {
  return (
    <Field label={label} help={help}>
      <select value={value} onChange={onChange} style={{ ...inputStyle, ...style }} {...rest}>{children}</select>
    </Field>
  );
}

export function CheckboxField({ label, checked, onChange, ...rest }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.5 }}>
      <input type="checkbox" checked={checked} onChange={onChange} {...rest} />
      <span>{label}</span>
    </label>
  );
}

// Add-row numeric list. `values` is an array of strings; `onChange` receives a
// new array. Replaces fragile comma-separated text inputs.
export function ListField({ label, unit, values, onChange, help, addLabel = 'Add another', placeholder }) {
  const rows = values.length ? values : [''];
  const text = unit ? `${label} (${unit})` : label;
  const setRow = (index, next) => onChange(rows.map((row, i) => (i === index ? next : row)));
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 6 }}>
      <legend style={{ color: 'var(--color-text-secondary)', fontSize: 11, padding: 0 }}>{text}</legend>
      {rows.map((row, index) => (
        <div key={index} style={{ display: 'flex', gap: 6 }}>
          <input
            type="number"
            min="0"
            step="any"
            value={row}
            placeholder={placeholder}
            aria-label={`${text} ${index + 1}`}
            onChange={(event) => setRow(index, event.target.value)}
            style={inputStyle}
          />
          {rows.length > 1 && (
            <Button
              variant="danger"
              aria-label={`Remove ${text} row ${index + 1}`}
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              style={{ padding: '0 12px', fontSize: 15, lineHeight: 1 }}
            >
              ×
            </Button>
          )}
        </div>
      ))}
      <div>
        <Button onClick={() => onChange([...rows, ''])} style={{ padding: '6px 10px' }}>+ {addLabel}</Button>
      </div>
      {help && <span style={{ color: 'var(--color-text-secondary)', fontSize: 10 }}>{help}</span>}
    </fieldset>
  );
}

// Standard tool header: a plain-language purpose line, an optional distinctive
// title (omit it when the page <h1> already names the tool), a collapsible
// "How to use" list, and the manual source.
export function ToolHeader({ title, eyebrow, purpose, steps = [], manualReference, children, style }) {
  return (
    <Card style={{ display: 'grid', gap: 8, ...style }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {title && <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>}
      {purpose && <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>{purpose}</p>}
      {children}
      {steps.length > 0 && (
        <details style={{ borderTop: '1px solid var(--color-border-tertiary)', paddingTop: 8 }}>
          <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--color-text-info)', fontWeight: 600 }}>How to use</summary>
          <ol style={{ margin: '8px 0 0', paddingLeft: 20, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.7 }}>
            {steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </details>
      )}
      {manualReference && (
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Source: {manualReference}. This does not replace the official Rules Manual.
        </div>
      )}
    </Card>
  );
}
