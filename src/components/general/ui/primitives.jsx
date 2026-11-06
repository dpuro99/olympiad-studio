// Shared UI primitives for event tools.
//
// These are presentational only: no domain logic, no event-specific formulas.
// They exist so every tool looks and behaves the same way, which is what makes
// the suite easy to learn. Prefer these over re-declaring card/input/button
// styles inside each tool.

const cardStyle = {
  background: 'var(--color-background-secondary)',
  border: '1px solid var(--color-border-tertiary)',
  borderRadius: 'var(--radius-lg)',
  padding: 20,
  boxShadow: 'var(--shadow-sm)'
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--color-background-tertiary)',
  border: '1px solid var(--color-border-secondary)',
  color: 'var(--color-text-primary)',
  borderRadius: 'var(--radius-md)',
  fontSize: 13,
  fontFamily: 'var(--font-sans)'
};

const textInputStyle = { ...inputStyle, fontFamily: 'var(--font-sans)' };

const buttonVariants = {
  primary: { background: 'var(--color-accent-primary)', color: 'var(--color-text-inverse)', border: '1px solid transparent' },
  secondary: { background: 'var(--color-background-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-secondary)' },
  danger: { background: 'transparent', color: 'var(--color-text-danger)', border: '1px solid var(--color-border-danger)' }
};

export function Card({ as: Tag = 'section', style, children, ...rest }) {
  return <Tag style={{ ...cardStyle, ...style }} {...rest}>{children}</Tag>;
}

export function SectionHeading({ as: Tag = 'h2', children, style, ...rest }) {
  return <Tag style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', ...style }} {...rest}>{children}</Tag>;
}

export function Eyebrow({ children, style }) {
  return (
    <div style={{
      color: 'var(--color-accent-primary)', fontSize: 11, fontFamily: 'var(--font-sans)',
      letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, ...style
    }}>
      {children}
    </div>
  );
}

export function Button({ variant = 'secondary', type = 'button', style, children, ...rest }) {
  const base = {
    padding: '9px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    ...(buttonVariants[variant] || buttonVariants.secondary)
  };
  return <button type={type} style={{ ...base, ...style }} {...rest}>{children}</button>;
}

export function HelpText({ children, style }) {
  return <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.5, ...style }}>{children}</p>;
}

// tone: 'status' (neutral), 'success', or 'error' (renders role="alert").
export function StatusMessage({ tone = 'status', children, style }) {
  const color = tone === 'error'
    ? 'var(--color-text-danger)'
    : tone === 'success'
      ? 'var(--color-text-success)'
      : 'var(--color-text-secondary)';
  return <div role={tone === 'error' ? 'alert' : 'status'} style={{ color, fontSize: 12, lineHeight: 1.5, ...style }}>{children}</div>;
}

export function ResultPanel({ children, style }) {
  return (
    <div role="status" aria-live="polite" style={{
      padding: 14, border: '1px solid var(--color-border-info)', borderRadius: 'var(--radius-md)',
      background: 'var(--color-background-info)', fontSize: 13, lineHeight: 1.5, ...style
    }}>
      {children}
    </div>
  );
}

function Field({ label, help, children, style }) {
  return (
    <label style={{ display: 'grid', gap: 5, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.4, ...style }}>
      <span style={{ fontWeight: 500 }}>{label}</span>
      {children}
      {help && <span style={{ color: 'var(--color-text-tertiary)', fontSize: 11, lineHeight: 1.4 }}>{help}</span>}
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

// Number input paired with a unit selector, so a quantity can be entered in the
// unit the student measured it in. Each control carries its own accessible
// name; the visible caption is decorative because a <label> may only wrap one
// labelable control.
export function MeasureField({ label, value, onChange, unit, onUnitChange, units, help, ...rest }) {
  return (
    <div style={{ display: 'grid', gap: 5, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.4 }}>
      <span aria-hidden="true" style={{ fontWeight: 500 }}>{label}</span>
      <span style={{ display: 'flex', gap: 6 }}>
        <input
          type="number"
          step="any"
          value={value}
          onChange={onChange}
          aria-label={`${label} (${unit})`}
          style={inputStyle}
          {...rest}
        />
        <select
          value={unit}
          onChange={onUnitChange}
          aria-label={`${label} unit`}
          style={{ ...inputStyle, width: 'auto', fontFamily: 'var(--font-sans)' }}
        >
          {units.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </span>
      {help && <span style={{ color: 'var(--color-text-tertiary)', fontSize: 11, lineHeight: 1.4 }}>{help}</span>}
    </div>
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
      <select value={value} onChange={onChange} style={{ ...inputStyle, fontFamily: 'var(--font-sans)', ...style }} {...rest}>{children}</select>
    </Field>
  );
}

export function CheckboxField({ label, checked, onChange, ...rest }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.5, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={onChange} {...rest} />
      <span>{label}</span>
    </label>
  );
}

// Slider with a live mono readout. Presentational: the parent owns the value,
// so readouts update as the slider moves (no Apply button needed).
export function RangeField({ label, unit, value, onChange, min = 0, max = 100, step = 1, help, format, ...rest }) {
  const text = unit ? `${label} (${unit})` : label;
  const shown = typeof format === 'function' ? format(value) : String(value);
  return (
    <Field label={label} help={help}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={text}
          onChange={onChange}
          style={{ flex: 1, accentColor: 'var(--color-accent-primary)' }}
          {...rest}
        />
        <span style={{
          minWidth: 56, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13,
          color: 'var(--color-text-primary)', fontWeight: 500
        }}>
          {shown}
        </span>
      </div>
    </Field>
  );
}

// Binary toggle rendered as a native checkbox with switch semantics, so it
// keeps keyboard and screen-reader support without custom ARIA wiring.
export function ToggleSwitch({ label, checked, onChange, help, ...rest }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.5, cursor: 'pointer' }}>
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} style={{ accentColor: 'var(--color-accent-primary)', width: 16, height: 16, marginTop: 1 }} {...rest} />
      <span>
        {label}
        {help && <span style={{ display: 'block', color: 'var(--color-text-tertiary)', fontSize: 11, lineHeight: 1.4 }}>{help}</span>}
      </span>
    </label>
  );
}

// Segmented control / tab strip. `tabs` is an array of { id, label } and the
// parent renders the active panel. Mirrors the Digital Logic workbench pattern
// (tablist + Button role="tab" + aria-selected) so the two stay consistent.
export function Tabs({ tabs, active, onChange, ariaLabel = 'Sections', style }) {
  return (
    <div role="tablist" aria-label={ariaLabel} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', ...style }}>
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          variant={active === tab.id ? 'primary' : 'secondary'}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
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
      <legend style={{ color: 'var(--color-text-secondary)', fontSize: 12, padding: 0, fontWeight: 500 }}>{text}</legend>
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
      {help && <span style={{ color: 'var(--color-text-tertiary)', fontSize: 11 }}>{help}</span>}
    </fieldset>
  );
}

// Standard tool header: a plain-language purpose line, an optional distinctive
// title (omit it when the page <h1> already names the tool), a collapsible
// "How to use" list, and the manual source.
export function ToolHeader({ title, eyebrow, purpose, steps = [], manualReference, children, style }) {
  return (
    <Card style={{ display: 'grid', gap: 10, ...style }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {title && <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h2>}
      {purpose && <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{purpose}</p>}
      {children}
      {steps.length > 0 && (
        <details style={{ borderTop: '1px solid var(--color-border-tertiary)', paddingTop: 10 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--color-accent-primary)', fontWeight: 600 }}>How to use</summary>
          <ol style={{ margin: '8px 0 0', paddingLeft: 20, color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.7 }}>
            {steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </details>
      )}
      {manualReference && (
        <div style={{ color: 'var(--color-text-tertiary)', fontSize: 11, lineHeight: 1.5, paddingTop: 4 }}>
          Source: {manualReference}. This does not replace the official Rules Manual.
        </div>
      )}
    </Card>
  );
}

// Collapsible section for progressive disclosure. Uses native <details> for zero-JS accessibility.
export function Collapsible({ summary, children, defaultOpen = false, style, summaryStyle }) {
  return (
    <details style={{ borderTop: '1px solid var(--color-border-tertiary)', paddingTop: 10, ...style }} open={defaultOpen}>
      <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--color-accent-primary)', fontWeight: 600, ...summaryStyle }}>{summary}</summary>
      <div style={{ marginTop: 10 }}>{children}</div>
    </details>
  );
}

// Accordion — single open panel at a time. `items` is an array of { id, summary, children }.
export function Accordion({ items, activeKey, onChange, style }) {
  return (
    <div style={{ display: 'grid', gap: 8, ...style }}>
      {items.map((item) => (
        <details key={item.id} open={activeKey === item.id} onToggle={() => onChange(activeKey === item.id ? null : item.id)}>
          <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--color-accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            {item.summary}
            <i className={`ti ${activeKey === item.id ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 14, flexShrink: 0 }} aria-hidden="true"></i>
          </summary>
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--color-border-tertiary)' }}>{item.children}</div>
        </details>
      ))}
    </div>
  );
}

// Empty state with icon, headline, description, and optional action.
export function EmptyState({ icon, title, description, action, children, style }) {
  if (children) return <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 13, ...style }}>{children}</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 16px', textAlign: 'center', ...style }}>
      {icon && <i className={`ti ${icon}`} style={{ fontSize: 28, color: 'var(--color-text-tertiary)' }} aria-hidden="true"></i>}
      {title && <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</div>}
      {description && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, maxWidth: '30ch' }}>{description}</div>}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

// Inline step indicator for multi-step workflows.
export function Stepper({ steps, currentStep, style }) {
  const stepDot = (i) => {
    const completed = i < currentStep;
    const active = i === currentStep;
    return {
      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700,
      background: completed ? 'var(--color-accent-primary)' : active ? 'var(--color-accent-muted)' : 'var(--color-background-tertiary)',
      color: completed || active ? 'var(--color-text-inverse)' : 'var(--color-text-tertiary)',
      border: active ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border-secondary)'
    };
  };
  const stepLabel = (i) => ({
    fontSize: 12, fontWeight: i === currentStep ? 600 : 400,
    color: i === currentStep ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
  });

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 16, ...style }}>
      {steps.map((step, i) => (
        <span key={step.id || i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={stepDot(i)}>
            {completed ? <i className="ti ti-check" style={{ fontSize: 10 }} aria-hidden="true"></i> : i + 1}
          </span>
          <span style={stepLabel(i)}>{step.label}</span>
          {i < steps.length - 1 && <i className="ti ti-chevron-right" style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }} aria-hidden="true"></i>}
        </span>
      ))}
    </div>
  );
}

// Prominent primary action area — use for the main "do this next" action in a section.
export function PrimaryAction({ children, label, onClick, icon, style }) {
  return (
    <div style={{ marginTop: 12, ...style }}>
      <Button variant="primary" onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', fontSize: 14 }}>
        {icon && <i className={`ti ${icon}`} aria-hidden="true"></i>}
        {label}
        {children}
      </Button>
    </div>
  );
}
