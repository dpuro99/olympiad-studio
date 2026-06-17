import React, { useState } from 'react';

export default function ScoreCalc() {
  const [targetDistance, setTargetDistance] = useState(7.5); // m
  const [distanceFromTarget, setdistanceFromTarget] = useState(5.2); // cm
  const [targetTime, setTargetTime] = useState(15.0); // seconds
  const [runTime, setRunTime] = useState(14.2); // seconds
  const [hasCans, setHasCans] = useState(true);
  const [insideCanDist, setInsideCanDist] = useState(30); // cm
  const [successCan, setSuccessCan] = useState(true);
  const [penalties, setPenalties] = useState(0);
  
  // Scoring Weights (Adjustable if ES modifies them)
  const [distWeight, setDistWeight] = useState(2); // 2 pt per cm
  const [timeWeight, setTimeWeight] = useState(1); // 1 pt per second

  // Standard Formula: 100 + DistanceScore + TimeScore + Penalties - Bonus
  // Using 100 as base is common in Scrambler/EV so negative bonuses don't drop score below zero
  const baseScore = 100;
  const distScore = distanceFromTarget * distWeight;
  const timeScore = Math.abs(runTime - targetTime) * timeWeight;
  
  // Can Bonus calculation: Bonus increases as the gap gets smaller.
  // Standard format is often: Can Bonus = (Max Gap - Inside Can Distance) or a flat tier.
  // We provide a live calculation here assuming a standard subtraction format.
  const canBonus = (hasCans && successCan) ? Math.max(0, (0.5 * (110 - insideCanDist))) : 0;
  
  const totalScore = baseScore + distScore + timeScore + penalties - canBonus;

  const cardStyle = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 20 };
  const inputStyle = { width: "100%", padding: 8, background: "var(--color-background-tertiary)", border: "1px solid var(--color-border-secondary)", color: "var(--color-text-primary)", borderRadius: 6, fontSize: 14 };
  const labelStyle = { display: "block", fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, fontFamily: "var(--font-mono)" };

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
      
      {/* Input Panel */}
      <div style={{ ...cardStyle, flex: 1, minWidth: 300 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Run Data Entry</h2>
        
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Target Time (s)</label>
            <input type="number" step="0.5" value={targetTime} onChange={(e) => setTargetTime(parseFloat(e.target.value) || 0)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Actual Run Time (s)</label>
            <input type="number" step="0.1" value={runTime} onChange={(e) => setRunTime(parseFloat(e.target.value) || 0)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Target Distance (m)</label>
            <input type="number" step="0.1" value={targetDistance} onChange={(e) => setTargetDistance(parseFloat(e.target.value) || 0)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Distance from Target (cm)</label>
            <input type="number" step="0.1" value={distanceFromTarget} onChange={(e) => setdistanceFromTarget(parseFloat(e.target.value) || 0)} style={inputStyle} />
          </div>
        </div>

        <div style={{ padding: 12, border: "1px solid var(--color-border-info)", borderRadius: 6, backgroundColor: "var(--color-background-info)", marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "var(--color-text-info)", cursor: "pointer", marginBottom: hasCans ? 12 : 0 }}>
            <input type="checkbox" checked={hasCans} onChange={(e) => setHasCans(e.target.checked)} />
            Track includes Can Obstacle
          </label>
          
          {hasCans && (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <label style={{...labelStyle, color: "inherit"}}>Inside Can Distance (cm)</label>
                <input type="number" step="1" value={insideCanDist} onChange={(e) => setInsideCanDist(parseFloat(e.target.value) || 0)} style={{...inputStyle, borderColor: "var(--color-border-info)"}} />
              </div>
              <div style={{ flex: 1, paddingTop: 18 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "inherit", cursor: "pointer" }}>
                  <input type="checkbox" checked={successCan} onChange={(e) => setSuccessCan(e.target.checked)} />
                  Successfully Passed
                </label>
              </div>
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Penalties (pts)</label>
          <input type="number" step="10" value={penalties} onChange={(e) => setPenalties(parseInt(e.target.value) || 0)} style={inputStyle} />
        </div>
      </div>

      {/* Output Panel */}
      <div style={{ ...cardStyle, width: 320, flexShrink: 0, position: "sticky", top: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Score Breakdown</h2>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
          <span style={{ color: "var(--color-text-secondary)" }}>Base Score</span>
          <span>{baseScore.toFixed(1)}</span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
          <span style={{ color: "var(--color-text-secondary)" }}>Distance Score</span>
          <span style={{ color: "var(--color-text-danger)" }}>+{distScore.toFixed(1)}</span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
          <span style={{ color: "var(--color-text-secondary)" }}>Time Score</span>
          <span style={{ color: "var(--color-text-danger)" }}>+{timeScore.toFixed(1)}</span>
        </div>

        {hasCans && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Can Bonus</span>
            <span style={{ color: "var(--color-text-success)", fontWeight: 500 }}>-{canBonus.toFixed(1)}</span>
          </div>
        )}

        {penalties > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Penalties</span>
            <span style={{ color: "var(--color-text-danger)" }}>+{penalties.toFixed(1)}</span>
          </div>
        )}

        <div style={{ height: 1, backgroundColor: "var(--color-border-tertiary)", margin: "16px 0" }}></div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 18, fontWeight: 500 }}>Total Score</span>
          <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)", color: totalScore > 100 ? "var(--color-text-primary)" : "var(--color-text-success)" }}>
            {totalScore.toFixed(1)}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textAlign: "right", marginTop: 4 }}>Lower is better</div>

        {/* Small Settings Area for Rule Specifics */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px dashed var(--color-border-tertiary)" }}>
          <div style={{ fontSize: 10, color: "var(--color-text-secondary)", textTransform: "uppercase", marginBottom: 8 }}>Scoring Multipliers</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 10, display: "block" }}>Pts/cm</span>
              <input type="number" value={distWeight} onChange={e => setDistWeight(parseFloat(e.target.value)||1)} style={{...inputStyle, padding: "4px", fontSize: 12}} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 10, display: "block" }}>Pts/sec</span>
              <input type="number" value={timeWeight} onChange={e => setTimeWeight(parseFloat(e.target.value)||5)} style={{...inputStyle, padding: "4px", fontSize: 12}} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
