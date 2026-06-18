import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LandingHome from './components/general/LandingHome';
import Home from './components/general/Home';
import { EVENT_REGISTRY } from './components/events/registry';

const WEEK = { hw: 2, lookup: 3, pid: 4, codegen: 5, log: 6, comp: 7 };

export default function App() {
  // Global Theme State: 'dark' or 'light' (default)
  const [theme, setTheme] = useState('light');
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Master View Controller: "landing" or "dashboard"
  const [currentView, setCurrentView] = useState("landing");
  
  // Workspace Navigation drill-down state
  // null means user is in the Multi-Event Lobby (Lobby Home)
  const [selectedEventId, setSelectedEventId] = useState(null); 
  // "home" means event main dashboard, or custom module ID string (e.g. "arc", "score")
  const [page, setPage] = useState("home"); 

  // Resolve active event from registry dynamically
  const currentEvent = selectedEventId ? EVENT_REGISTRY[selectedEventId] : null;
  const CATS = currentEvent ? currentEvent.categories : [];
  const MODS = currentEvent ? currentEvent.modules : [];
  const activeModule = MODS.find(m => m.id === page);

  // Sync state changes with document element for CSS variables mapping
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Listen to Supabase Session and state changes
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
        options: { 
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account' // Forces account selection choice every single login
          }
        }
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
    setSelectedEventId(null);
    setPage("home");
  };

  const handleEventSwitch = (eventId) => {
    setSelectedEventId(eventId);
    setPage("home");
  };

  // Helper renderer for module navigation buttons in Sidebar
  const navBtn = (id, icon, label, live, sub) => (
    <button 
      key={id} 
      onClick={() => setPage(id)}
      style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 8px",
        background: page === id ? "var(--color-background-info)" : "transparent", border: "none",
        borderRadius: "var(--border-radius-md)", 
        cursor: "pointer", 
        color: page === id ? "var(--color-text-info)" : "var(--color-text-secondary)",
        fontSize: 12, fontFamily: "var(--font-sans)", textAlign: "left", marginBottom: 1, 
        opacity: live ? 1 : 0.6
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 14, flexShrink: 0 }} aria-hidden="true"></i>
      <span style={{ flex: 1 }}>{label}</span>
      {live && page !== id && !sub && (
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-text-success)", flexShrink: 0 }}></span>
      )}
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

  // Intercept routing logic: If on landing view or not logged in, render the clean public homepage
  if (currentView === "landing" || !currentUser) {
    return (
      <LandingHome 
        onLogin={handleGoogleLogin} 
        authLoading={authLoading} 
        currentUser={currentUser}
        onGoToDashboard={() => setCurrentView("dashboard")} 
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  // Resolve dynamic view render based on current drill-down state
  let RenderComponent = null;
  if (page === "home") {
    RenderComponent = (
      <Home 
        MODS={MODS} 
        CATS={CATS} 
        onNav={setPage} 
        selectedEventId={selectedEventId}
        EVENT_REGISTRY={EVENT_REGISTRY}
        onSelectEvent={handleEventSwitch}
      />
    );
  } else if (activeModule) {
    // Dynamically render the registered component, passing active config metadata
    const Component = activeModule.component;
    RenderComponent = <Component mod={activeModule} WEEK={WEEK} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans)", backgroundColor: "var(--color-background-primary)" }}>
      
      {/* Sidebar Navigation Dashboard Panel */}
      <div style={{ width: 186, flexShrink: 0, background: "var(--color-background-secondary)", borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column" }}>
        
        {/* Clickable Header Button: Contextually changes depending on Workspace level */}
        {selectedEventId ? (
          /* LEVEL 2: Workspace View is active. Click goes back to Level 1 Multi-Event Hub Dashboard */
          <div 
            onClick={() => { setSelectedEventId(null); setPage("home"); }} 
            style={{ padding: "14px 12px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.opacity = 0.7}
            onMouseOut={(e) => e.currentTarget.style.opacity = 1}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <img src="/logo2.png" alt="Logo" style={{ width: "auto", height: 35, objectFit: "contain" }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Olympiad Studio</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-info)", fontFamily: "var(--font-mono)", paddingLeft: 24, fontWeight: 600 }}>&larr; Back to Dashboard</div>
          </div>
        ) : (
          /* LEVEL 1: Lobby View is active. Click returns user to public-facing Landing Page */
          <div 
            onClick={() => setCurrentView("landing")} 
            style={{ padding: "14px 12px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.opacity = 0.7}
            onMouseOut={(e) => e.currentTarget.style.opacity = 1}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <img src="/logo2.png" alt="Logo" style={{ width: "auto", height: 35, objectFit: "contain" }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Olympiad Studio</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", paddingLeft: 24 }}>&larr; Back to Home</div>
          </div>
        )}
        
        {/* Dynamic Navigation Sidebar Menu */}
        <nav style={{ padding: "6px", flex: 1, overflowY: "auto" }}>
          {selectedEventId ? (
            /* Inside Workspace: Show tools belonging specifically to active event workspace */
            <>
              {navBtn("home", "ti-home", "Workspace Home", true, true)}
              {CATS.map(cat => {
                const mods = MODS.filter(m => m.cat === cat);
                if (mods.length === 0) return null;
                return (
                  <div key={cat} style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px", marginBottom: 3, fontFamily: "var(--font-mono)" }}>{cat}</div>
                    {mods.map(m => navBtn(m.id, m.ti, m.label, m.live, false))}
                  </div>
                );
              })}
            </>
          ) : (
            /* Lobby Level: Show selection list of all active Science Olympiad Event Packs */
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px", marginBottom: 6, fontFamily: "var(--font-mono)" }}>Workspaces</div>
              {Object.keys(EVENT_REGISTRY).map(key => (
                <button 
                  key={key} 
                  onClick={() => handleEventSwitch(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px",
                    background: "transparent", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer",
                    color: "var(--color-text-secondary)", fontSize: 12, textAlign: "left", marginBottom: 4,
                    transition: "color 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}
                  onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
                >
                  <i className="ti ti-folder" style={{ fontSize: 14 }}></i>
                  <span>{EVENT_REGISTRY[key].name}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* User Account Details & Theme Toggle */}
        <div style={{ padding: 10, borderTop: "0.5px solid var(--color-border-tertiary)", marginTop: "auto" }}>
          <button 
            onClick={toggleTheme} 
            style={{ 
              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", 
              background: "transparent", border: "0.5px solid var(--color-border-tertiary)", 
              borderRadius: "var(--border-radius-md)", cursor: "pointer", 
              color: "var(--color-text-secondary)", fontSize: 11, marginBottom: 12,
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--color-background-tertiary)"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            {theme === 'dark' ? (
               <svg style={{ pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
               <svg style={{ pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
            <span style={{ flex: 1, textAlign: "left" }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

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
          {/* Breadcrumbs Section */}
          {page !== "home" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
              <button onClick={() => { setSelectedEventId(null); setPage("home"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>Dashboard</button>
              {currentEvent && (
                <>
                  <span>&rsaquo;</span>
                  <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>{currentEvent.name}</button>
                </>
              )}
              {activeModule && (
                <>
                  <span>&rsaquo;</span><span>{activeModule.cat}</span><span>&rsaquo;</span>
                  <span style={{ color: "var(--color-text-primary)" }}>{activeModule.label}</span>
                </>
              )}
            </div>
          )}
          
          {page !== "home" && activeModule && <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20, color: "var(--color-text-primary)" }}>{activeModule.label}</h1>}
          
          {RenderComponent}
        </div>
      </div>
    </div>
  );
}
