import React, { useState, useMemo } from 'react';

// Math Helpers for 2026 EV Rules
// Outer can is fixed at 1.0m to the left of the straight line.
function calcArc(fwd, canGap, wSep, hasCans) {
  if (!hasCans) return { straight: true, centerArc: fwd, leftArc: fwd, rightArc: fwd };
  if (fwd <= 0) return null;

  // The center of the vehicle passes exactly halfway between the outer can (1.0m) 
  // and the inner can (1.0m - gap).
  const sag = 1.0 - (canGap / 2); 
  const s = Math.abs(sag);
  const D = fwd;
  const half = wSep / 2;

  const R = s / 2 + (D * D) / (8 * s);
  const theta = 2 * Math.asin(Math.min(1, D / (2 * R)));

  // Since it's a leftward bulging curve, the Right wheel is the inside track, Left wheel is outside
  const innerR = R - half;
  const outerR = R + half;

  return {
    straight: false, R, sag,
    thetaDeg: (theta * 180) / Math.PI, 
    startAngleDeg: ((theta / 2) * 180) / Math.PI,
    centerArc: R * theta, 
    leftArc: innerR * theta, 
    rightArc: outerR * theta
  };
}

function arcPts(fwd, canGap, rOff, hasCans, n = 100) {
  if (fwd <= 0) return [];
  if (!hasCans) return Array.from({ length: n }, (_, i) => ({ x: rOff, y: (i / (n - 1)) * fwd }));
  
  const sag = 1.0 - (canGap / 2);
  const s = Math.abs(sag);
  const D = fwd;
  const R = s / 2 + (D * D) / (8 * s);
  const theta = 2 * Math.asin(Math.min(1, D / (2 * R)));
  
  // Left curve means center of the circle is to the right (positive X)
  const cx = R - s; 
  const cy = D / 2;
  const Rd = R + rOff; 
  const a0 = Math.atan2(-cy, -cx);
  
  return Array.from({ length: n }, (_, i) => {
    // Negative theta increment because we are drawing a leftward bulge from bottom to top
    const a = a0 - (theta * i) / (n - 1);
    return { x: cx + Rd * Math.cos(a), y: cy + Rd * Math.sin(a) };
  });
}

function makeTx(pts, W, H, pad = 36) {
  if (!pts.length) return (x, y) => ({ x: W / 2, y: H / 2 });
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  // Ensure the 1.0m left boundary is always in view
  const x0 = Math.min(...xs, -1.2), x1 = Math.max(...xs, 0.2), y0 = -0.2, y1 = Math.max(...ys) + 0.2;
  const sc = Math.min((W - pad * 2) / Math.max(0.01, x1 - x0), (H - pad * 2) / Math.max(0.01, y1 - y0));
  const ox = W / 2 - ((x0 + x1) / 2) * sc, oy = H / 2 + ((y0 + y1) / 2) * sc;
  return (px, py) => ({ x: ox + px * sc, y: oy - py * sc });
}

function pStr(pts, tx) {
  return pts.map(p => { const s = tx(p.x, p.y); return `${s.x.toFixed(1)},${s.y.toFixed(1)}`; }).join(" ");
}

// UI Components
function Label({ children }) { return <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, fontFamily: "var(--font-mono)" }}>{children}</div>; }
function NumRow({ label, val, unit, color, prec = 4 }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: color || "var(--color-text-primary)" }}>
        {typeof val === "number" ? val.toFixed(prec) : val ?? "—"} {unit && <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: 4 }}>{unit}</span>}
      </span>
    </div>
  );
}

export default function ArcVisualizer() {
  const [fwd, setFwd] = useState(8.0);
  const [hasCans, setHasCans] = useState(true);
  const [canGap, setCanGap] = useState(0.50); // 35 cm gap
  const [wSep, setWSep] = useState(0.17); // 17 cm wheel track

  const arc = useMemo(() => calcArc(fwd, canGap, wSep, hasCans), [fwd, canGap, wSep, hasCans]);
  
  const W = 300, H = 390;
  // Note: For a left curve, negative X is left. So inner wheel (left) is -wSep/2, outer is +wSep/2
  const mainPts = useMemo(() => arcPts(fwd, canGap, 0, hasCans), [fwd, canGap, hasCans]);
  const lPts = useMemo(() => arcPts(fwd, canGap, -wSep / 2, hasCans), [fwd, canGap, wSep, hasCans]);
  const rPts = useMemo(() => arcPts(fwd, canGap, +wSep / 2, hasCans), [fwd, canGap, wSep, hasCans]);
  
  const tx = useMemo(() => makeTx([...mainPts, ...lPts, ...rPts], W, H), [mainPts, lPts, rPts]);
  
  const s0 = tx(0, 0), sE = tx(0, fwd);
  const cY = fwd / 2;
  const outerCan = tx(-1.0, cY);
  const innerCan = tx(-(1.0 - canGap), cY);

  const aRad = arc && !arc.straight ? (arc.startAngleDeg * Math.PI) / 180 : 0;
  const arEnd = { x: s0.x - Math.sin(aRad) * 35, y: s0.y - Math.cos(aRad) * 35 };

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
          
          {/* Straight centerline reference */}
          <line x1={s0.x} y1={s0.y} x2={sE.x} y2={sE.y} stroke="var(--color-border-tertiary)" strokeWidth="1" strokeDasharray="4,4" />
          
          {/* Start and End Lines */}
          <line x1={s0.x - 40} y1={s0.y} x2={s0.x + 40} y2={s0.y} stroke="#22aa55" strokeWidth="1.5" />
          <line x1={sE.x - 40} y1={sE.y} x2={sE.x + 40} y2={sE.y} stroke="#cc4444" strokeWidth="1.5" />
          
          {/* Cans */}
          {hasCans && (
            <g>
              <circle cx={outerCan.x} cy={outerCan.y} r={6} fill="#ef4444" />
              <text x={outerCan.x - 10} y={outerCan.y + 4} textAnchor="end" fontSize="9" fill="var(--color-text-secondary)">Outer (1.0m)</text>
              <circle cx={innerCan.x} cy={innerCan.y} r={6} fill="#ef4444" />
              <text x={innerCan.x + 10} y={innerCan.y + 4} textAnchor="start" fontSize="9" fill="var(--color-text-secondary)">Inner</text>
              {/* Bonus Line */}
              <line x1={outerCan.x} y1={outerCan.y} x2={innerCan.x} y2={innerCan.y} stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
            </g>
          )}

          {/* Wheel Paths */}
          <polyline points={pStr(rPts, tx)} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.8" />
          <polyline points={pStr(lPts, tx)} fill="none" stroke="#4f8ef7" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.8" />
          
          {/* Center Path */}
          <polyline points={pStr(mainPts, tx)} fill="none" stroke="var(--color-text-primary)" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Start Vector Arrow */}
          {hasCans && <line x1={s0.x} y1={s0.y} x2={arEnd.x} y2={arEnd.y} stroke="#22aa55" strokeWidth="2" markerEnd="url(#arrMk)" />}
          
          <circle cx={s0.x} cy={s0.y} r={4} fill="#22aa55" />
          <circle cx={sE.x} cy={sE.y} r={4} fill="#cc4444" />
          
          {/* Legend */}
          <g>
            <line x1="10" y1="14" x2="26" y2="14" stroke="#4f8ef7" strokeWidth="1.5" strokeDasharray="5,3" />
            <text x="29" y="17" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)">Right Wheel</text>
            <line x1="10" y1="26" x2="26" y2="26" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" />
            <text x="29" y="29" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)">Left Wheel</text>
            <circle cx="18" cy="38" r="4" fill="#ef4444" />
            <text x="29" y="41" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)">Cans</text>
          </g>
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 260 }}>
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontWeight: 500, marginBottom: 12, fontSize: 13 }}>Track Parameters</div>
          
          <div style={{ marginBottom: 12 }}>
            <Label>Track Type</Label>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setHasCans(false)} style={{ flex: 1, padding: "6px", fontSize: 12, background: !hasCans ? "var(--color-background-info)" : "transparent", color: !hasCans ? "var(--color-text-info)" : "var(--color-text-secondary)", border: `1px solid ${!hasCans ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, borderRadius: 4 }}>No Cans (Straight)</button>
              <button onClick={() => setHasCans(true)} style={{ flex: 1, padding: "6px", fontSize: 12, background: hasCans ? "var(--color-background-info)" : "transparent", color: hasCans ? "var(--color-text-info)" : "var(--color-text-secondary)", border: `1px solid ${hasCans ? "var(--color-border-info)" : "var(--color-border-secondary)"}`, borderRadius: 4 }}>Can Bonus (Left Curve)</button>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Label>Target Distance (Meters From Start to End)</Label>
            <input type="number" value={fwd} onChange={e => setFwd(parseFloat(e.target.value) || 0)} step={0.5} style={{ width: "100%", padding: 6, background: "var(--color-background-tertiary)", border: "1px solid var(--color-border-secondary)", color: "var(--color-text-primary)", borderRadius: 4 }} />
          </div>

          {hasCans && (
            <div style={{ marginBottom: 12 }}>
              <Label>Inside Can Distance (cm)</Label>
              <input type="number" value={canGap * 100} onChange={e => setCanGap(parseFloat(e.target.value) / 100 || 0)} step={1} style={{ width: "100%", padding: 6, background: "var(--color-background-tertiary)", border: "1px solid var(--color-border-secondary)", color: "var(--color-text-primary)", borderRadius: 4 }} />
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 4 }}>Outer can is fixed at 1.0m from centerline.</div>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <Label>Vehicle Wheel Separation (cm)</Label>
            <input type="number" value={wSep * 100} onChange={e => setWSep(parseFloat(e.target.value) / 100 || 0)} step={1} style={{ width: "100%", padding: 6, background: "var(--color-background-tertiary)", border: "1px solid var(--color-border-secondary)", color: "var(--color-text-primary)", borderRadius: 4 }} />
          </div>
        </div>

        {arc && (
          <div style={card}>
            <div style={{ fontWeight: 500, marginBottom: 10, fontSize: 13 }}>Geometry Results</div>
            {arc.straight ? (
              <NumRow label="Path type" val="Straight Line" />
            ) : (
              <>
                <NumRow label="Starting Launch Angle" val={arc.startAngleDeg} unit="°" prec={2} />
              </>
            )}
            <div style={{ height: 1, background: "var(--color-border-tertiary)", margin: "8px 0" }} />
            <NumRow label="Car Center Path" val={arc.centerArc} unit="m" />
            <NumRow label="Right Wheel (Inner Arc)" val={arc.leftArc} unit="m" color="#4f8ef7" />
            <NumRow label="Left Wheel (Outer Arc)" val={arc.rightArc} unit="m" color="#f59e0b" />
          </div>
        )}
      </div>
    </div>
  );
}
