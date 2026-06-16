import React, { useState, useMemo } from 'react';

// Pure Math Helpers
function calcArc(sag, fwd, wSep) {
  if (fwd <= 0) return null;
  if (Math.abs(sag) < 0.0001) return { straight: true, centerArc: fwd, leftArc: fwd, rightArc: fwd };
  const s = Math.abs(sag), D = fwd, half = wSep / 2;
  const R = s / 2 + (D * D) / (8 * s);
  const theta = 2 * Math.asin(Math.min(1, D / (2 * R)));
  const inner = (R - half) * theta, outer = (R + half) * theta;
  const dir = Math.sign(sag);
  return {
    straight: false, R, thetaDeg: (theta * 180) / Math.PI, startAngleDeg: ((theta / 2) * 180) / Math.PI,
    centerArc: R * theta, leftArc: dir > 0 ? inner : outer, rightArc: dir > 0 ? outer : inner,
    innerSide: dir > 0 ? "Left" : "Right"
  };
}

function arcPts(sag, fwd, rOff = 0, n = 100) {
  if (fwd <= 0) return [];
  if (Math.abs(sag) < 0.001) return Array.from({ length: n }, (_, i) => ({ x: 0, y: (i / (n - 1)) * fwd }));
  const s = Math.abs(sag), dir = Math.sign(sag), D = fwd;
  const R = s / 2 + (D * D) / (8 * s), theta = 2 * Math.asin(Math.min(1, D / (2 * R)));
  const cx = -dir * (R - s), cy = D / 2, Rd = R + rOff, a0 = Math.atan2(-cy, -cx);
  return Array.from({ length: n }, (_, i) => {
    const a = a0 + (dir * theta * i) / (n - 1);
    return { x: cx + Rd * Math.cos(a), y: cy + Rd * Math.sin(a) };
  });
}

function makeTx(pts, W, H, pad = 28) {
  if (!pts.length) return (x, y) => ({ x: W / 2, y: H / 2 });
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y), m = 0.3;
  const x0 = Math.min(...xs) - m, x1 = Math.max(...xs) + m, y0 = -m, y1 = Math.max(...ys) + m;
  const sc = Math.min((W - pad * 2) / Math.max(0.01, x1 - x0), (H - pad * 2) / Math.max(0.01, y1 - y0));
  const ox = W / 2 - ((x0 + x1) / 2) * sc, oy = H / 2 + ((y0 + y1) / 2) * sc;
  return (px, py) => ({ x: ox + px * sc, y: oy - py * sc });
}

function pStr(pts, tx) {
  return pts.map(p => { const s = tx(p.x, p.y); return `${s.x.toFixed(1)},${s.y.toFixed(1)}`; }).join(" ");
}

// Inline Sub-Components
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

function SegBtn({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          flex: 1, fontSize: 12, fontFamily: "var(--font-mono)", padding: "6px 0",
          background: value === o.value ? "var(--color-background-info)" : "transparent",
          color: value === o.value ? "var(--color-text-info)" : "var(--color-text-secondary)",
          border: `0.5px solid ${value === o.value ? "var(--color-border-info)" : "var(--color-border-secondary)"}`,
          borderRadius: "var(--border-radius-md)"
        }}>{o.label}</button>
      ))}
    </div>
  );
}

export default function ArcVisualizer() {
  const [fwd, setFwd] = useState(8);
  const [sag, setSag] = useState(0.3);
  const [arcDir, setArcDir] = useState("right");
  const [wSep, setWSep] = useState(0.17);
  const [canGap, setCanGap] = useState(0.2);
  const [showWheels, setShowWheels] = useState(true);

  const signedSag = arcDir === "straight" ? 0 : arcDir === "left" ? -Math.abs(sag) : Math.abs(sag);
  const arc = useMemo(() => calcArc(signedSag, fwd, wSep), [signedSag, fwd, wSep]);
  
  const W = 272, H = 390;
  const mainPts = useMemo(() => arcPts(signedSag, fwd, 0), [signedSag, fwd]);
  const iPts = useMemo(() => arcPts(signedSag, fwd, -wSep / 2), [signedSag, fwd, wSep]);
  const oPts = useMemo(() => arcPts(signedSag, fwd, +wSep / 2), [signedSag, fwd, wSep]);
  const tx = useMemo(() => makeTx([...mainPts, ...iPts, ...oPts], W, H), [mainPts, iPts, oPts]);
  
  const s0 = tx(0, 0), sE = tx(0, fwd);
  const cY = fwd / 2;
  const cA = tx(signedSag > 0 ? signedSag - canGap / 2 : signedSag + canGap / 2, cY);
  const cB = tx(signedSag > 0 ? signedSag + canGap / 2 : signedSag - canGap / 2, cY);
  const aRad = arc ? (arc.startAngleDeg * Math.PI) / 180 * (arcDir === "left" ? -1 : 1) : 0;
  const arEnd = { x: s0.x + Math.sin(aRad) * 30, y: s0.y - Math.cos(aRad) * 30 };

  const card = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 16 };

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
      <div style={{ ...card, padding: 10, flexShrink: 0 }}>
        <svg width={W} height={H}>
          <defs>
            <marker id="arrMk" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill="#22aa55" />
            </marker>
          </defs>
          {[0.25, 0.5, 0.75].map(t => {
            const { y } = tx(0, fwd * t);
            return <line key={t} x1={10} y1={y} x2={W - 10} y2={y} stroke="var(--color-border-tertiary)" strokeWidth="0.5" />;
          })}
          <line x1={s0.x} y1={s0.y} x2={sE.x} y2={sE.y} stroke="var(--color-border-tertiary)" strokeWidth="1" />
          <line x1={s0.x - 50} y1={s0.y} x2={s0.x + 50} y2={s0.y} stroke="#22aa55" strokeWidth="1.5" strokeDasharray="5,3" />
          <line x1={sE.x - 50} y1={sE.y} x2={sE.x + 50} y2={sE.y} stroke="#cc4444" strokeWidth="1.5" strokeDasharray="5,3" />
          
          {showWheels && arc && <polyline points={pStr(oPts, tx)} fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="6,4" opacity="0.75" />}
          {showWheels && arc && <polyline points={pStr(iPts, tx)} fill="none" stroke="#4f8ef7" strokeWidth="1.2" strokeDasharray="6,4" opacity="0.75" />}
          <polyline points={pStr(mainPts, tx)} fill="none" stroke="var(--color-text-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {arcDir !== "straight" && <circle cx={cA.x} cy={cA.y} r={7} fill="var(--color-background-info)" stroke="var(--color-border-info)" strokeWidth="1.5" />}
          {arcDir !== "straight" && <circle cx={cB.x} cy={cB.y} r={7} fill="var(--color-background-info)" stroke="var(--color-border-info)" strokeWidth="1.5" />}
          {arcDir !== "straight" && <text x={cA.x} y={cA.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="var(--color-text-info)" fontFamily="var(--font-mono)" fontWeight="bold">i</text>}
          {arcDir !== "straight" && <text x={cB.x} y={cB.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="var(--color-text-info)" fontFamily="var(--font-mono)" fontWeight="bold">o</text>}
          
          <circle cx={s0.x} cy={s0.y} r={4} fill="#22aa55" />
          {arc && arc.startAngleDeg > 0.1 && <line x1={s0.x} y1={s0.y} x2={arEnd.x} y2={arEnd.y} stroke="#22aa55" strokeWidth="1.5" markerEnd="url(#arrMk)" opacity="0.85" />}
          <circle cx={sE.x} cy={sE.y} r={4} fill="#cc4444" />
          
          <text x={s0.x} y={s0.y + 15} textAnchor="middle" fontSize="9" fill="#22aa55" fontFamily="var(--font-mono)">START</text>
          <text x={sE.x} y={sE.y - 9} textAnchor="middle" fontSize="9" fill="#cc4444" fontFamily="var(--font-mono)">END</text>
          
          {showWheels && arc && (
            <g>
              <line x1="10" y1="14" x2="26" y2="14" stroke="#4f8ef7" strokeWidth="1.5" strokeDasharray="5,3" />
              <text x="29" y="15" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)" dominantBaseline="middle">{`${arc.innerSide} (inner)`}</text>
              <line x1="10" y1="26" x2="26" y2="26" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" />
              <text x="29" y="27" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)" dominantBaseline="middle">{`${arc.innerSide === "Left" ? "Right" : "Left"} (outer)`}</text>
            </g>
          )}
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontWeight: 500, marginBottom: 12, fontSize: 13 }}>Parameters</div>
          <Field label="Forward distance" value={fwd} onChange={setFwd} step={0.25} min={1} max={15} suffix="m" />
          <div style={{ marginBottom: 4 }}><Label>Arc direction</Label></div>
          <SegBtn options={[{ label: "Straight", value: "straight" }, { label: "Left", value: "left" }, { label: "Right", value: "right" }]} value={arcDir} onChange={setArcDir} />
          {arcDir !== "straight" && <Field label="Lateral bulge (sagitta)" value={sag} onChange={setSag} step={0.05} min={0.01} max={2} suffix="m" />}
          <Field label="Wheel separation" value={wSep} onChange={setWSep} step={0.01} min={0.05} max={0.5} suffix="m" />
          {arcDir !== "straight" && <Field label="Can gap width" value={canGap} onChange={setCanGap} step={0.02} min={0.02} max={0.5} suffix="m" />}
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>
            <input type="checkbox" checked={showWheels} onChange={e => setShowWheels(e.target.checked)} />
            Show wheel arcs
          </label>
        </div>

        {arc && (
          <div style={card}>
            <div style={{ fontWeight: 500, marginBottom: 10, fontSize: 13 }}>Results</div>
            <NumRow label="Car center arc" val={arc.centerArc} unit="m" />
            <NumRow label={`Left wheel${arc.innerSide === "Left" ? " (inner)" : ""}`} val={arc.leftArc} unit="m" color={arc.innerSide === "Left" ? "#4f8ef7" : "#f59e0b"} />
            <NumRow label={`Right wheel${arc.innerSide === "Right" ? " (inner)" : ""}`} val={arc.rightArc} unit="m" color={arc.innerSide === "Right" ? "#4f8ef7" : "#f59e0b"} />
            {!arc.straight && <NumRow label="Turn radius" val={arc.R} unit="m" prec={3} />}
            {!arc.straight && <NumRow label="Arc angle" val={arc.thetaDeg} unit="°" prec={2} />}
            {!arc.straight && <NumRow label="Car start angle" val={arc.startAngleDeg} unit="°" prec={2} />}
            {arc.straight && <NumRow label="Path type" val="Straight" />}
          </div>
        )}
      </div>
    </div>
  );
}
