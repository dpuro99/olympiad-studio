import { useState, useEffect, useRef, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { trackEvent, trackPageView } from './analytics';
import LandingHome from './components/general/LandingHome';
import AppNav from './components/general/AppNav';
import Home from './components/general/Home';
import AuthRequired from './components/general/AuthRequired';
import PageTransition from './PageTransition';
import { EVENT_REGISTRY } from './components/events/registry';
import { STAGE_META } from './components/general/stages';
import { buildJourney } from './components/general/journeyUtils';

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
  const MODS = currentEvent ? currentEvent.modules : [];
  // Sidebar groups mirror the field guide's stages in the event's own journey
  // order, so the rail and the guide never disagree about what comes next.
  const journey = currentEvent ? buildJourney(currentEvent) : [];
  const stageGroups = journey.reduce((groups, step) => {
    const group = groups.find((entry) => entry.stage === step.stage);
    if (group) {
      group.steps.push(step);
    } else {
      groups.push({ stage: step.stage, label: STAGE_META[step.stage].short, steps: [step] });
    }
    return groups;
  }, []);
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
      currentUser={currentUser}
      onGoToDashboard={() => setCurrentView("dashboard")} 
      onGuestAccess={handleGuestAccess}
    />
  );

  // Resolve dynamic view render based on current drill-down state
  let RenderComponent = null;
  if (page === "home") {
    RenderComponent = (
      <Home 
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
      <aside className="dashboard-sidebar" aria-label="Workspace navigation">
        
        {/* Clickable Header Button: Contextually changes depending on Workspace level */}
        {selectedEventId ? (
          <button
            type="button"
            className="dashboard-brand-button"
            onClick={() => { setSelectedEventId(null); setPage("home"); }} 
            aria-label="Back to all events"
            style={{ padding: "14px", borderBottom: "1px solid var(--color-border-tertiary)", textAlign: "left" }}
          >
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
            style={{ padding: "14px", borderBottom: "1px solid var(--color-border-tertiary)" }}
          >
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              <span>&larr;</span> Home
            </div>
          </button>
        )}
        
        {/* Dynamic Navigation Sidebar Menu */}
        <nav style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
          {selectedEventId ? (
            <>
              {navBtn("home", "ti-map", "Event guide", true, true, openWorkspaceHome)}
              {stageGroups.map(group => (
                <div key={group.stage} style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 10px", marginBottom: 6, fontFamily: "var(--font-sans)", fontWeight: 700 }}>{group.label}</div>
                  {group.steps.map(step => navBtn(step.id, step.module.ti, step.module.label, step.live, false))}
                </div>
              ))}
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
      </aside>

      {/* Main Content Pane */}
      <div className="dashboard-pane" ref={dashboardContentRef}>
        <main id="main-content" className="dashboard-content" style={{ padding: "24px 24px 32px" }}>
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
        </main>
      </div>
    </div>
  );

  return (
    <>
      {!showLanding && (
        <a className="skip-link" href="#main-content">Skip to main content</a>
      )}
      <AppNav
        currentUser={currentUser}
        authLoading={authLoading}
        theme={theme}
        toggleTheme={toggleTheme}
        currentEvent={currentEvent}
        activeModule={activeModule}
        showLanding={showLanding}
        onBrandClick={() => { setSelectedEventId(null); setPage("home"); }}
        onAllEvents={() => { setSelectedEventId(null); setPage("home"); }}
        onOpenEventHome={openWorkspaceHome}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
      />
      <AnimatePresence mode="wait">
        <PageTransition key={showLanding ? "landing" : "dashboard"}>
          {showLanding ? landingContent : dashboardContent}
        </PageTransition>
      </AnimatePresence>
    </>
  );
}
