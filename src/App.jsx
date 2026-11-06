import { useState, useEffect, useRef, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { trackEvent, trackPageView } from './analytics';
import LandingHome from './components/general/LandingHome';
import Logo from './components/general/Logo';
import Home from './components/general/Home';
import AuthRequired from './components/general/AuthRequired';
import PageTransition from './PageTransition';
import { EVENT_REGISTRY } from './components/events/registry';

const NAVIGATION_STORAGE_KEY = 'olympiad-studio-navigation';

function getStoredNavigation() {
  try {
    const storedNavigation = JSON.parse(sessionStorage.getItem(NAVIGATION_STORAGE_KEY));
    if (!storedNavigation || typeof storedNavigation !== 'object') return {};
    return storedNavigation;
  } catch {
    return {};
  }
}


export default function App() {
  const storedNavigation = getStoredNavigation();
  const storedGuestAccess = storedNavigation.isGuest === true;
  // Restored navigation must be valid against the current registry: ignore
  // stale event/module ids (e.g. from events that were later removed).
  const initialEventId = storedNavigation.selectedEventId && EVENT_REGISTRY[storedNavigation.selectedEventId]
    ? storedNavigation.selectedEventId
    : null;
  const initialEvent = initialEventId ? EVENT_REGISTRY[initialEventId] : null;
  const initialPage = initialEvent && storedNavigation.page !== "home" &&
    !initialEvent.modules.some(m => m.id === storedNavigation.page)
    ? "home"
    : storedNavigation.page || "home";
  // Global Theme State: 'dark' or 'light' (default)
  const [theme, setTheme] = useState(storedNavigation.theme || 'light');
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(storedGuestAccess);
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Master View Controller: "landing" or "dashboard"
  const [currentView, setCurrentView] = useState(storedNavigation.currentView || "landing");
  
  // Workspace Navigation drill-down state
  // null means user is in the Multi-Event Lobby (Lobby Home)
  const [selectedEventId, setSelectedEventId] = useState(initialEventId); 
  // "home" means event main dashboard, or custom module ID string (e.g. "arc", "score")
  const [page, setPage] = useState(initialPage); 

  // Resolve active event from registry dynamically
  const currentEvent = selectedEventId ? EVENT_REGISTRY[selectedEventId] : null;
  const CATS = currentEvent ? currentEvent.categories : [];
  const MODS = currentEvent ? currentEvent.modules : [];
  const activeModule = MODS.find(m => m.id === page);
  const dashboardContentRef = useRef(null);
  const virtualPage = currentView === "landing" || (!currentUser && !isGuest)
    ? ""
    : selectedEventId
      ? `/events/${encodeURIComponent(selectedEventId)}${page === "home" ? "" : `/${encodeURIComponent(page)}`}`
      : "/dashboard";
  const analyticsPage = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${virtualPage || "/"}`;
  const analyticsPageTitle = activeModule?.label || currentEvent?.name || (analyticsPage === "/" ? "Landing" : "Dashboard");

  useEffect(() => {
    if (!loading) trackPageView(analyticsPage, analyticsPageTitle);
  }, [analyticsPage, analyticsPageTitle, loading]);

  useEffect(() => {
    if (loading || !dashboardContentRef.current || virtualPage === "") return undefined;

    const scrollContainer = dashboardContentRef.current;
    const milestones = new Set();
    const handleScroll = () => {
      const scrollableHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      if (scrollableHeight <= 0) return;

      const percentScrolled = Math.round((scrollContainer.scrollTop / scrollableHeight) * 100);
      [25, 50, 75, 100].forEach(milestone => {
        if (percentScrolled >= milestone && !milestones.has(milestone)) {
          milestones.add(milestone);
          trackEvent('scroll_depth', { percent_scrolled: milestone, page_path: analyticsPage });
        }
      });
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [analyticsPage, loading, virtualPage]);

  // Sync state changes with document element for CSS variables mapping
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    sessionStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify({
      currentView,
      isGuest,
      selectedEventId,
      page,
      theme,
    }));
  }, [currentView, isGuest, selectedEventId, page, theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      trackEvent('theme_toggle', { theme: nextTheme });
      return nextTheme;
    });
  };

  // Listen to Supabase Session and state changes
  useEffect(() => {
    let isMounted = true;

    const finishInit = (session) => {
      if (!isMounted) return;
      setCurrentUser(session?.user || null);
      setIsGuest(session?.user ? false : storedGuestAccess);
      if (session?.user) setCurrentView("dashboard");
      setLoading(false);
    };

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        finishInit(session);
      })
      .catch((error) => {
        console.error('Session initialization failed:', error);
        finishInit(null);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      setCurrentUser(session?.user || null);
      setIsGuest(session?.user || event === 'SIGNED_OUT' ? false : storedGuestAccess);
      if (session?.user) setCurrentView("dashboard");
      if (event === 'SIGNED_IN') trackEvent('login_success', { method: 'google' });
      if (event === 'SIGNED_OUT') trackEvent('logout');
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [storedGuestAccess]);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      trackEvent('login_attempt', { method: 'google' });
      const redirectBase = window.location.origin + import.meta.env.BASE_URL;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: redirectBase,
          queryParams: {
            prompt: 'select_account' // Forces account selection choice every single login
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      trackEvent('login_error', { method: 'google', error_type: err?.name || 'unknown' });
      alert(err.message || 'An error occurred during Google sign in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem(NAVIGATION_STORAGE_KEY);
    setCurrentView("landing");
    setIsGuest(false);
    setSelectedEventId(null);
    setPage("home");
  };

  const handleGuestAccess = () => {
    trackEvent('guest_access');
    setIsGuest(true);
    setCurrentView("dashboard");
  };

  const handleEventSwitch = (eventId) => {
    const event = EVENT_REGISTRY[eventId];
    trackEvent('event_selected', { event_id: eventId, event_name: event?.name });
    setSelectedEventId(eventId);
    setPage("home");
  };

  const handleModuleNavigation = (moduleId) => {
    const module = MODS.find(item => item.id === moduleId);
    trackEvent('module_opened', {
      event_id: selectedEventId || 'lobby',
      module_id: moduleId,
      module_name: module?.label,
      category: module?.cat,
    });
    setPage(moduleId);
  };

  const openWorkspaceHome = () => setPage("home");

  // Helper renderer for module navigation buttons in Sidebar
  const navBtn = (id, icon, label, live, sub, customOnClick) => (
    <button 
      key={id} 
      onClick={customOnClick || (() => handleModuleNavigation(id))}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px",
        background: page === id ? "var(--color-accent-muted)" : "transparent", border: "none",
        borderRadius: "var(--radius-md)", 
        cursor: "pointer", 
        color: page === id ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
        fontSize: 13, fontFamily: "var(--font-sans)", fontWeight: page === id ? 600 : 500, textAlign: "left", marginBottom: 2, 
        opacity: live ? 1 : 0.55,
        transition: "all var(--transition-fast)"
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true"></i>
      <span style={{ flex: 1 }}>{label}</span>
      {live && page !== id && !sub && (
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-text-success)", flexShrink: 0, opacity: 0.8 }}></span>
      )}
    </button>
  );

  // App initialization boot strap check
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)", fontSize: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-accent-primary)", display: "inline-block", animation: "pulse 1.5s ease-in-out infinite" }}></span>
          Loading Olympiad Studio...
        </div>
      </div>
    );
  }

  const showLanding = currentView === "landing" || (!currentUser && !isGuest);

  const landingContent = (
    <LandingHome 
      onLogin={handleGoogleLogin} 
      authLoading={authLoading} 
      currentUser={currentUser}
      onGoToDashboard={() => setCurrentView("dashboard")} 
      onGuestAccess={handleGuestAccess}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );

  // Resolve dynamic view render based on current drill-down state
  let RenderComponent = null;
  if (page === "home") {
    RenderComponent = (
      <Home 
        MODS={MODS} 
        CATS={CATS} 
        onNav={handleModuleNavigation} 
        selectedEventId={selectedEventId}
        EVENT_REGISTRY={EVENT_REGISTRY}
        onSelectEvent={handleEventSwitch}
      />
    );
  } else if (activeModule) {
    if (isGuest && activeModule.requiresAuth) {
      RenderComponent = <AuthRequired mod={activeModule} onLogin={handleGoogleLogin} />;
    } else {
      const Component = activeModule.component;
      RenderComponent = <Component mod={activeModule} />;
    }
  } else if (page !== "home") {
    RenderComponent = (
      <div style={{ display: "grid", placeItems: "center", minHeight: 260, padding: 24, textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--radius-full)", background: "var(--color-background-tertiary)", border: "1px solid var(--color-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 22, color: "var(--color-text-warning)" }} aria-hidden="true"></i>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)" }}>Module not found</h2>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", maxWidth: "40ch" }}>
            The tool "{page}" could not be found in this event's workspace. It may have been removed or renamed.
          </p>
          <button type="button" className="breadcrumb-link" style={{ marginTop: 8, padding: "10px 16px", background: "var(--color-accent-primary)", color: "var(--color-text-inverse)", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600 }} onClick={() => setPage("home")}>
            Back to workspace home
          </button>
        </div>
      </div>
    );
  }

  const dashboardContent = (
    <div className="dashboard-shell">
      
      {/* Sidebar Navigation Dashboard Panel */}
      <div className="dashboard-sidebar" style={{ width: 220, background: "var(--color-background-secondary)", borderRight: "1px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column" }}>
        
        {/* Clickable Header Button: Contextually changes depending on Workspace level */}
        {selectedEventId ? (
          <button
            type="button"
            className="dashboard-brand-button"
            onClick={() => { setSelectedEventId(null); setPage("home"); }} 
            aria-label="Back to all events"
            style={{ padding: "16px 14px 12px", borderBottom: "1px solid var(--color-border-tertiary)", textAlign: "left" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Logo compact />
            </div>
            <div style={{ fontSize: 11, color: "var(--color-accent-primary)", fontFamily: "var(--font-sans)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
              <i className="ti ti-arrow-left" aria-hidden="true" style={{ fontSize: 12 }}></i> All events
            </div>
            {currentEvent && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.25, letterSpacing: "-0.01em" }}>{currentEvent.name}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>Division {currentEvent.division} · {currentEvent.code}</div>
              </div>
            )}
          </button>
        ) : (
          <button
            type="button"
            className="dashboard-brand-button"
            onClick={() => setCurrentView("landing")} 
            style={{ padding: "16px 14px 12px", borderBottom: "1px solid var(--color-border-tertiary)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Logo compact />
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              <span>&larr;</span> Home
            </div>
          </button>
        )}
        
        {/* Dynamic Navigation Sidebar Menu */}
        <nav style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
          {selectedEventId ? (
            <>
              {navBtn("home", "ti-home", "Workspace Home", true, true, openWorkspaceHome)}
              {CATS.map(cat => {
                const mods = MODS.filter(m => m.cat === cat);
                if (mods.length === 0) return null;
                return (
                  <div key={cat} style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 10px", marginBottom: 6, fontFamily: "var(--font-sans)", fontWeight: 700 }}>{cat}</div>
                    {mods.map(m => navBtn(m.id, m.ti, m.label, m.live, false))}
                  </div>
                );
              })}
            </>
          ) : (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 10px", marginBottom: 8, fontFamily: "var(--font-sans)", fontWeight: 700 }}>Workspaces</div>
              {Object.keys(EVENT_REGISTRY).map(key => (
                <button 
                  key={key} 
                  onClick={() => handleEventSwitch(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px",
                    background: "transparent", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
                    color: "var(--color-text-secondary)", fontSize: 13, fontWeight: 500, textAlign: "left", marginBottom: 2,
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <i className="ti ti-folder" style={{ fontSize: 16, color: "var(--color-text-tertiary)" }}></i>
                  <span>{EVENT_REGISTRY[key].name}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        <div style={{ marginTop: "auto" }}></div>
      </div>

      {/* Main Content Pane */}
      <div ref={dashboardContentRef} style={{ flex: 1, overflowY: "auto", background: "var(--color-background-primary)" }}>
        <header style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, padding: "12px 24px", borderBottom: "1px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", position: "sticky", top: 0, zIndex: 10 }}>
          <button type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`} style={{ background: "var(--color-background-tertiary)", border: "1px solid var(--color-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)", padding: 8, borderRadius: "var(--radius-md)", cursor: "pointer" }}>
            <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} aria-hidden="true" style={{ fontSize: 16 }}></i>
          </button>
          {isGuest ? (
            <button type="button" aria-label="Sign in with Google" onClick={handleGoogleLogin} disabled={authLoading} style={{
              padding: "8px 14px", background: "var(--color-background-tertiary)", color: "var(--color-text-primary)",
              border: "1px solid var(--color-border-secondary)", borderRadius: "var(--radius-md)", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13,
            }}>
              <svg width="14" height="14" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.84 2.69-6.57z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.96v2.32C2.44 15.09 5.47 18 9 18z" fill="#34A853"/>
                <path d="M3.95 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.94H.96A8.977 8.977 0 0 0 0 9c0 1.48.36 2.9 1 4.14l2.95-2.4z" fill="#FBBC05"/>
                <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.8 11.42 0 9 0 5.47 0 2.44 2.91.96 5.34l2.95 2.32C4.66 5.16 6.65 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {authLoading ? "Connecting..." : "Sign in"}
            </button>
          ) : (
            <>
              <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, color: "var(--color-text-secondary)" }} title={currentUser?.email}>
                {currentUser?.email}
              </span>
              <button type="button" aria-label="Log out" onClick={handleLogout} style={{ background: "transparent", border: "1px solid var(--color-border-secondary)", color: "var(--color-text-secondary)", padding: "7px 12px", borderRadius: "var(--radius-md)", fontSize: 12, cursor: "pointer" }}>
                Log out
              </button>
            </>
          )}
        </header>
        <div className="dashboard-content" style={{ padding: "0 24px 32px" }}>
          {/* Breadcrumbs / location context */}
          {(selectedEventId || page !== "home") && (
            <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--color-text-tertiary)", flexWrap: "wrap" }}>
              <button type="button" className="breadcrumb-link" onClick={() => { setSelectedEventId(null); setPage("home"); }}>Events</button>
              {currentEvent && (
                <>
                  <span style={{ opacity: 0.45 }} aria-hidden="true">/</span>
                  <button type="button" className="breadcrumb-link" onClick={() => setPage("home")}>{currentEvent.name}</button>
                </>
              )}
              {activeModule && (
                <>
                  <span style={{ opacity: 0.45 }} aria-hidden="true">/</span>
                  <span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }} aria-current="page">{activeModule.label}</span>
                </>
              )}
            </nav>
          )}
          
          {page !== "home" && activeModule && <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 18, color: "var(--color-text-primary)", letterSpacing: "-0.025em", lineHeight: 1.15 }}>{activeModule.label}</h1>}
          
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={`${selectedEventId || "lobby"}-${page}`}>
              <Suspense fallback={
                <div style={{ display: "grid", placeItems: "center", minHeight: 260, padding: 24, color: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--color-border-tertiary)", borderTopColor: "var(--color-accent-primary)", animation: "spin 1s linear infinite" }} aria-hidden="true"></div>
                    <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Loading {activeModule?.label || "tool"}…</span>
                  </div>
                </div>
              }>
                {RenderComponent}
              </Suspense>
            </PageTransition>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={showLanding ? "landing" : "dashboard"}>
        {showLanding ? landingContent : dashboardContent}
      </PageTransition>
    </AnimatePresence>
  );
}
