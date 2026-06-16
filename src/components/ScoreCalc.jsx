import React, { useState } from 'react';

function Label({ children }) {
  return <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, fontFamily: "var(--font-mono)" }}>{children}</div>;
}

function NumRow({ label, val, unit, color, prec = 4 }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: color || "var(--color-text-primary)" }}>
        {typeof val === "number" ? val.toFixed(prec) : val ?? "—"}
        {unit && <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: 4 }}>{unit}</span>}
      </span>
    </div>
  );
}

function Field({ label, value, onChange, step, min, max, suffix, disabled }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <Label>{label}</Label>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="number" value={value} step={step} min={min} max={max} disabled={disabled} style={{ flex: 1 }}
          onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }} />
        {suffix && <span style={{ fontSize: 12, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{suffix}</span>}
      </div>
    </div>
  );
}

export default function ScoreCalc() {
  const [distErr, setDistErr] = useState(0);
  const [timeErr, setTimeErr] = useState(0);
  const [cans, setCans] = useState(0);
  const [base, setBase] = useState(100);
  const [dRate, setDRate] = useState(1);
  const [tRate, setTRate] = useState(1);
  const [bonus, setBonus] = useState(25);
  const [showFml, setShowFml] = useState(false);

  const dPen = Math.abs(distErr * 100) * dRate;
  const tPen = Math.abs(timeErr * 10) * tRate;
  const bon = cans * bonus;
  const score = base + dPen + tPen - bon;
  const sc = score < 60 ? "var(--color-text-success)" : score < 90 ? "var(--color-text-warning)" : "var(--color-text-danger)";
  
  const card = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 16 };

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontWeight: 500, marginBottom: 12, fontSize: 13 }}>Run errors</div>
          <Field label="Distance error" value={distErr} onChange={setDistErr} step={0.01} suffix="m" />
          <Field label="Time error" value={timeErr} onChange={setTimeErr} step={0.1} suffix="s" />
          <div style={{ marginBottom: 12 }}>
            <Label>Cans navigated</Label>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2].map(n => (
                <button key={n} onClick={() => setCans(n)} style={{
                  flex: 1, fontSize: 14, fontFamily: "var(--font-mono)", cursor: "pointer", padding: "7px 0",
                  background: cans === n ? "var(--color-background-success)" : "transparent",
                  color: cans === n ? "var(--color-text-success)" : "var(--color-text-secondary)",
                  border: `0.5px solid ${cans === n ? "var(--color-border-success)" : "var(--color-border-secondary)"}`,
                  borderRadius: "var(--border-radius-md)"
                }}>{n}</button>
              ))}
            </div>
          </div>
          <button onClick={() => setShowFml(v => !v)} style={{ background: "none", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", color: "var(--color-text-secondary)", padding: "5px 10px", cursor: "pointer", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {showFml ? "Hide formula" : "Edit formula"}
          </button>
          
          {showFml && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 12, padding: "8px 10px", background: "var(--color-background-tertiary)", borderRadius: "var(--border-radius-md)", lineHeight: 1.7 }}>
                score = base + |dist_cm| × dist_rate + |time_ds| × time_rate − cans × bonus
              </div>
              <Field label="Base score" value={base} onChange={setBase} step={1} min={0} />
              <Field label="Dist penalty rate" value={dRate} onChange={setDRate} step={0.5} min={0} suffix="per cm" />
              <Field label="Time penalty rate" value={tRate} onChange={setTRate} step={0.5} min={0} suffix="per 0.1 s" />
              <Field label="Can bonus" value={bonus} onChange={setBonus} step={1} min={0} suffix="per can" />
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontStyle: "italic", marginTop: 4 }}>Verify formula against current year’s rules.</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ minWidth: 190 }}>
        <div style={card}>
          <div style={{ fontWeight: 500, marginBottom: 10, fontSize: 13 }}>Score breakdown</div>
          <NumRow label="Base" val={base} prec={0} />
          <NumRow label={`+ Distance (${(Math.abs(distErr) * 100).toFixed(1)} cm)`} val={dPen} unit="pts" color={dPen > 0 ? "var(--color-text-danger)" : undefined} prec={1} />
          <NumRow label={`+ Time (${(Math.abs(timeErr) * 10).toFixed(1)} ds)`} val={tPen} unit="pts" color={tPen > 0 ? "var(--color-text-danger)" : undefined} prec={1} />
          <NumRow label={`− Can bonus (×${cans})`} val={-bon} unit="pts" color={bon > 0 ? "var(--color-text-success)" : undefined} prec={0} />
          <div style={{ borderTop: "0.5px solid var(--color-border-secondary)", marginTop: 10, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Final score</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500, color: sc }}>{score.toFixed(1)}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textAlign: "right", marginTop: 2 }}>Lower is better</div>
        </div>
      </div>
    </div>
  );
}
