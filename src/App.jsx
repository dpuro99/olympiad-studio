import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LandingHome from './components/LandingHome';
import Home from './components/Home';
import ArcVisualizer from './components/ArcVisualizer';
import ScoreCalc from './components/ScoreCalc';
import ComingSoon from './components/ComingSoon';

const WEEK = { hw: 2, lookup: 3, pid: 4, codegen: 5, log: 6, comp: 7 };
const CATS = ["Event", "Design", "Programming", "Testing", "Competition"];
const MODS = [
  { id: "arc", ti: "ti-vector-triangle", label: "Arc Visualizer", cat: "Design", live: true, desc: "Visualize arc geometry and compute wheel arc lengths" },
  { id: "score", ti: "ti-trophy", label: "Score Calculator", cat: "Event", live: true, desc: "Compute your score from distance and time errors" },
  { id: "hw", ti: "ti-cpu", label: "Hardware Planner", cat: "Design", live: false, desc: "Select motors, encoders, batteries, and wheels" },
  { id: "lookup", ti: "ti-table", label: "Lookup Table", cat: "Programming", live: false, desc: "Build a speed-to-PWM mapping from measured drive data" },
  { id: "pid", ti: "ti-wave-sine", label: "PID Simulator", cat: "Programming", live: false, desc: "Simulate and tune your control loop without hardware" },
  { id: "codegen", ti: "ti-code", label: "Code Generator", cat: "Programming", live: false, desc: "Generate Arduino starter code from your build specs" },
  { id: "log", ti: "ti-file-analytics", label: "Run Logger", cat: "Testing", live: false, desc: "Log and analyze practice runs over time" },
  { id: "comp", ti: "ti-flag", label: "Competition Day", cat: "Competition", live: false, desc: "Pre-run parameter calculator and event checklist" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Master View Controller: "landing" or "dashboard"
  const [currentView, setCurrentView] = useState("landing");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      if (session?.user) setCurrentView("dashboard");
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) setCurrentView("dashboard");
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err) {
      alert(err.message || 'An error occurred during Google sign in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView("landing");
    setPage("home");
  };

  const mod = MODS.find(m => m.id === page);

  const navBtn = (id, icon, label, live, sub) => (
    <button key={id} onClick={() => setPage(id)} style={{
      display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 8px",
      background: page === id ? "var(--color-background-info)" : "transparent", border: "none",
      borderRadius: "var(--border-radius-md)", cursor: "pointer",
      color: page === id ? "var(--color-text-info)" : "var(--color-text-secondary)",
      fontSize: 12, fontFamily: "var(--font-sans)", textAlign: "left", marginBottom: 1, opacity: live ? 1 : 0.45
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: 14, flexShrink: 0 }} aria-hidden="true"></i>
      <span style={{ flex: 1 }}>{label}</span>
      {live && page !== id && !sub && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-text-success)", flexShrink: 0 }}></span>}
    </button>
  );

  // App initialization boot strap check
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
        Loading platform assets...
      </div>
    );
  }

  // Intercept routing logic
  if (currentView === "landing" || !currentUser) {
    return (
      <LandingHome 
        onLogin={handleGoogleLogin} 
        authLoading={authLoading} 
        currentUser={currentUser}
        onGoToDashboard={() => setCurrentView("dashboard")} 
      />
    );
  }

  // AUTHENTICATED: Display the comprehensive Engineering Studio Dashboard Layout
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans)", backgroundColor: "var(--color-background-primary)" }}>
      
      {/* Sidebar Navigation Dashboard Panel */}
      <div style={{ width: 186, flexShrink: 0, background: "var(--color-background-secondary)", borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column" }}>
        
        {/* Clickable Header to Return to Landing Page */}
        <div 
          onClick={() => setCurrentView("landing")} 
          style={{ padding: "14px 12px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer", transition: "opacity 0.2s" }}
          onMouseOver={(e) => e.currentTarget.style.opacity = 0.7}
          onMouseOut={(e) => e.currentTarget.style.opacity = 1}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <img src="/logo2.png" alt="Logo" style={{ width: "auto", height: 35, objectFit: "contain" }} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>Olympiad Studio</div>
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", paddingLeft: 24 }}>&larr; Back to Home</div>
        </div>
        
        <nav style={{ padding: "6px", flex: 1, overflowY: "auto" }}>
          {navBtn("home", "ti-home", "Dashboard", true, true)}
          {CATS.map(cat => {
            const mods = MODS.filter(m => m.cat === cat);
            return (
              <div key={cat} style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px", marginBottom: 3, fontFamily: "var(--font-mono)" }}>{cat}</div>
                {mods.map(m => navBtn(m.id, m.ti, m.label, m.live, false))}
              </div>
            );
          })}
        </nav>

        {/* User Account Details */}
        <div style={{ padding: 10, borderTop: "0.5px solid var(--color-border-tertiary)", marginTop: "auto" }}>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>Account:</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-info)", marginBottom: 6, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={currentUser.email}>
            {currentUser.email}
          </div>
          <button onClick={handleLogout} style={{ background: "none", border: "0.5px solid var(--color-text-danger)", color: "var(--color-text-danger)", width: "100%", padding: "4px 0", borderRadius: "var(--border-radius-md)", fontSize: 11, cursor: "pointer" }}>Log Out</button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "24px 28px", maxWidth: 860 }}>
          {page !== "home" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
              <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>Dashboard</button>
              <span>&rsaquo;</span><span>{mod?.cat}</span><span>&rsaquo;</span>
              <span style={{ color: "var(--color-text-primary)" }}>{mod?.label}</span>
            </div>
          )}
          {page !== "home" && <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>{mod?.label}</h1>}
          
          {page === "home" && <Home MODS={MODS} CATS={CATS} onNav={setPage} />}
          {page === "arc" && <ArcVisualizer />}
          {page === "score" && <ScoreCalc />}
          {mod && !mod.live && <ComingSoon mod={mod} WEEK={WEEK} />}
        </div>
      </div>
    </div>
  );
}
