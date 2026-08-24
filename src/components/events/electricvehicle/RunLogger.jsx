import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

export default function RunLogger() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [targetD, setTargetD] = useState('');
  const [actualD, setActualD] = useState('');
  const [runTime, setRunTime] = useState('');
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');

  // Styles matching your platform theme
  const cardStyle = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 20 };
  const inputStyle = { width: "100%", padding: 8, background: "var(--color-background-tertiary)", border: "1px solid var(--color-border-secondary)", color: "var(--color-text-primary)", borderRadius: 6, fontSize: 13, fontFamily: "var(--font-mono)" };
  const labelStyle = { display: "block", fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, fontFamily: "var(--font-mono)" };

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      // Get current logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Safety check in case Supabase isn't fully set up yet
      if (!supabase.from) throw new Error("Supabase Database client not initialized.");
      if (!user) throw new Error("No user logged in.");

      const { data, error } = await supabase
        .from('practice_runs')
        .select('*')
        .eq('event_id', 'ev')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRuns(data || []);
      
    } catch (err) {
      console.warn("Could not fetch runs from DB:", err.message);
      // Fallback dummy data so you can see the UI working
      setRuns([
        { id: 1, created_at: new Date().toISOString(), target_distance: 8.5, actual_distance: 8.55, run_time: 12.1, final_score: 24.3, notes: "Good run, slight drift left." },
        { id: 2, created_at: new Date(Date.now() - 86400000).toISOString(), target_distance: 10.0, actual_distance: 9.8, run_time: 15.2, final_score: 41.0, notes: "Battery was low." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newRun = {
      event_id: 'ev',
      target_distance: parseFloat(targetD),
      actual_distance: parseFloat(actualD),
      run_time: parseFloat(runTime),
      final_score: parseFloat(score),
      notes: notes
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!supabase.from || !user) {
        // Fallback: push locally if DB isn't ready
        setRuns([{ ...newRun, id: Date.now(), created_at: new Date().toISOString() }, ...runs]);
        resetForm();
        return;
      }

      const { error } = await supabase
        .from('practice_runs')
        .insert([{ ...newRun, user_id: user.id }]);

      if (error) throw error;
      
      resetForm();
      fetchRuns(); // Refresh list

    } catch (err) {
      console.error("Error saving run:", err);
      alert("Failed to save run. Check console.");
    }
  };

  const resetForm = () => {
    setTargetD('');
    setActualD('');
    setRunTime('');
    setScore('');
    setNotes('');
  };
  const handleDelete = async (id) => {
    const { error } = await supabase
            .from('practice_runs')
            .delete()
            .eq('id', id);

    if (error) {
        alert(`Failed to delete: ${error.message}`);
    } else {
        // Remove deleted run from screen immediately
        setRuns((prevRuns) => prevRuns.filter((run) => run.id !== id));
    }
  };

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
      
      {/* Logger Form */}
      <div style={{ ...cardStyle, flex: 1, minWidth: 280 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Log a Practice Run</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Target Dist. (m)</label>
              <input type="number" step="0.01" required value={targetD} onChange={e => setTargetD(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Actual Dist. (m)</label>
              <input type="number" step="0.01" required value={actualD} onChange={e => setActualD(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Run Time (s)</label>
              <input type="number" step="0.1" required value={runTime} onChange={e => setRunTime(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Total Score</label>
              <input type="number" step="0.1" required value={score} onChange={e => setScore(e.target.value)} style={{ ...inputStyle, borderColor: "var(--color-text-info)" }} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Setup Notes (Optional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Fresh battery, clean wheels..." style={{ ...inputStyle, fontFamily: "var(--font-sans)" }} />
          </div>

          <button type="submit" style={{ 
            width: "100%", padding: "10px", background: "var(--color-text-info)", color: "#fff", 
            border: "none", borderRadius: "var(--border-radius-md)", fontWeight: 500, cursor: "pointer" 
          }}>
            Save Run Data
          </button>
        </form>
      </div>

      {/* History Panel */}
      <div style={{ ...cardStyle, width: 340, flexShrink: 0 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Run History</h2>
        
        {loading ? (
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Loading history...</div>
        ) : runs.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic" }}>No runs logged yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
            {runs.map((run) => (
              <div key={run.id} style={{ padding: 12, background: "var(--color-background-primary)", border: "1px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                    {new Date(run.created_at).toLocaleDateString()}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-info)", fontFamily: "var(--font-mono)" }}>
                      {run.final_score.toFixed(1)} pts
                    </span>

                    {deletingId === run.id ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          onClick={() => {
                            handleDelete(run.id);
                            setDeletingId(null);
                          }}
                          style={{
                            background: "var(--color-text-danger)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "2px 6px",
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 600
                          }}
                        >
                          Confirm?
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          style={{
                            background: "transparent",
                            color: "var(--color-text-secondary)",
                            border: "1px solid var(--color-border-secondary)",
                            borderRadius: 4,
                            padding: "2px 6px",
                            cursor: "pointer",
                            fontSize: 11
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(run.id)}
                        title="Delete run"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--color-text-danger)",
                          cursor: "pointer",
                          padding: 2,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", marginBottom: run.notes ? 8 : 0 }}>
                  <div>Dist: <span style={{ color: "var(--color-text-primary)" }}>{run.actual_distance}m</span></div>
                  <div>Time: <span style={{ color: "var(--color-text-primary)" }}>{run.run_time}s</span></div>
                </div>

                {run.notes && (
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic", borderTop: "1px dashed var(--color-border-tertiary)", paddingTop: 8 }}>
                    "{run.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
