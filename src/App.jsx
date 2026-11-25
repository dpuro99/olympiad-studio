import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { trackEvent, trackPageView } from './analytics';
import LandingHome from './components/general/LandingHome';
import AppNav from './components/general/AppNav';
import AuthRequired from './components/general/AuthRequired';
import PageTransition from './PageTransition';
import { EVENT_REGISTRY } from './components/events/registry.js';
import { OBJECTIVE_TRACKER_SOURCES } from './components/general/dashboard/objectiveTrackerSources.js';
import Dashboard from './components/general/dashboard/Dashboard.jsx';
import AllTools from './components/general/dashboard/AllTools.jsx';
import CompilerTool from './components/general/dashboard/CompilerTool.jsx';
import { loadProfile, saveProfile } from './components/general/dashboard/profileStore.js';
import { setDisplayName, setLevel, toggleStar } from './components/general/dashboard/profileUtils.js';
import ConfirmDialog from './components/general/ui/ConfirmDialog.jsx';

const NAVIGATION_STORAGE_KEY = 'olympiad-studio-navigation';
const VALID_EVENT_IDS = Object.keys(EVENT_REGISTRY);
const STUDY_EVENT_IDS = OBJECTIVE_TRACKER_SOURCES.map((source) => source.eventId);
const VALID_PAGES = ['dashboard', 'all-tools'];

function getStoredNavigation() {
  try {
    const storedNavigation = JSON.parse(sessionStorage.getItem(NAVIGATION_STORAGE_KEY));
    if (!storedNavigation || typeof storedNavigation !== 'object') return {};
    return storedNavigation;
  } catch {
    return {};
  }
}

function validActiveTool(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.kind === 'compiler') {
    return STUDY_EVENT_IDS.includes(raw.eventId)
      ? { kind: 'compiler', eventId: raw.eventId }
      : null;
  }
  if (raw.kind === 'module') {
    const module = EVENT_REGISTRY[raw.eventId]?.modules.find((item) => item.id === raw.moduleId);
    return module ? { kind: 'module', eventId: raw.eventId, moduleId: raw.moduleId } : null;
  }
  return null;
}

export default function App() {
  const storedNavigation = getStoredNavigation();
  const storedGuestAccess = storedNavigation.isGuest === true;

  // Profile is local-first so guests get a persistent set of starred events.
  // A corrupt or blocked store is reported, never silently turned into "no stars".
  const [profileState, setProfileState] = useState(() => {
    const loaded = loadProfile(VALID_EVENT_IDS);
    return { profile: loaded.profile, error: loaded.error };
  });
  const profile = profileState.profile;

  const [theme, setTheme] = useState(storedNavigation.theme || 'light');
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(storedGuestAccess);
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState(storedNavigation.currentView || 'landing');
  const [page, setPage] = useState(VALID_PAGES.includes(storedNavigation.page) ? storedNavigation.page : 'dashboard');
  const [activeTool, setActiveTool] = useState(() => validActiveTool(storedNavigation.activeTool));
  const [starRequest, setStarRequest] = useState(null);
  const starOpenerRef = useRef(null);

  const activeModule = activeTool?.kind === 'module'
    ? EVENT_REGISTRY[activeTool.eventId]?.modules.find((item) => item.id === activeTool.moduleId)
    : null;
  const activeToolLabel = activeTool?.kind === 'compiler'
    ? 'Reference & Study Compiler'
    : activeModule?.label || null;

  const showLanding = currentView === 'landing' || (!currentUser && !isGuest);

  const virtualPage = showLanding
    ? ''
    : activeTool?.kind === 'compiler'
      ? `/compiler/${encodeURIComponent(activeTool.eventId)}`
      : activeModule
        ? `/events/${encodeURIComponent(activeTool.eventId)}/${encodeURIComponent(activeTool.moduleId)}`
        : page === 'all-tools' ? '/all-tools' : '/dashboard';
  const analyticsPage = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${virtualPage || '/'}`;
  const analyticsPageTitle = activeToolLabel || (page === 'all-tools' ? 'All Tools' : 'Dashboard');

  useEffect(() => {
    if (!loading) trackPageView(analyticsPage, analyticsPageTitle);
  }, [analyticsPage, analyticsPageTitle, loading]);

  // Scroll depth on the document: the workspace scrolls the page, not a pane.
  useEffect(() => {
    if (loading || virtualPage === '') return undefined;
    const milestones = new Set();
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percentScrolled = Math.round((window.scrollY / scrollable) * 100);
      [25, 50, 75, 100].forEach((milestone) => {
        if (percentScrolled >= milestone && !milestones.has(milestone)) {
          milestones.add(milestone);
          trackEvent('scroll_depth', { percent_scrolled: milestone, page_path: analyticsPage });
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [analyticsPage, loading, virtualPage]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    sessionStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify({
      currentView,
      isGuest,
      theme,
      page,
      activeTool
    }));
  }, [currentView, isGuest, theme, page, activeTool]);

  // Listen to Supabase Session and state changes
  useEffect(() => {
    let isMounted = true;

    const finishInit = (session) => {
      if (!isMounted) return;
      setCurrentUser(session?.user || null);
      setIsGuest(session?.user ? false : storedGuestAccess);
      if (session?.user) setCurrentView('dashboard');
      setLoading(false);
    };

    supabase.auth.getSession()
      .then(({ data: { session } }) => finishInit(session))
      .catch((error) => {
        console.error('Session initialization failed:', error);
        finishInit(null);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      setCurrentUser(session?.user || null);
      setIsGuest(session?.user || event === 'SIGNED_OUT' ? false : storedGuestAccess);
      if (session?.user) setCurrentView('dashboard');
      if (event === 'SIGNED_IN') trackEvent('login_success', { method: 'google' });
      if (event === 'SIGNED_OUT') trackEvent('logout');
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [storedGuestAccess]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      trackEvent('theme_toggle', { theme: nextTheme });
      return nextTheme;
    });
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      trackEvent('login_attempt', { method: 'google' });
      const redirectBase = window.location.origin + import.meta.env.BASE_URL;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectBase,
          queryParams: { prompt: 'select_account' }
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
    setCurrentView('landing');
    setIsGuest(false);
    setActiveTool(null);
    setPage('dashboard');
    // The profile is browser-local and survives sign-out by design.
  };

  const handleGuestAccess = () => {
    trackEvent('guest_access');
    setIsGuest(true);
    setCurrentView('dashboard');
  };

  const updateProfile = (updater) => {
    setProfileState((prev) => ({
      ...prev,
      profile: typeof updater === 'function' ? updater(prev.profile) : updater
    }));
  };

  const closeStarRequest = useCallback(() => setStarRequest(null), []);

  const handleStar = (eventId) => {
    starOpenerRef.current = document.activeElement;
    setStarRequest({
      eventId,
      isStarred: profile.starredEventIds.includes(eventId)
    });
  };

  const confirmStar = () => {
    if (!starRequest) return;
    updateProfile((prev) => toggleStar(prev, starRequest.eventId, VALID_EVENT_IDS));
    trackEvent('event_starred', { event_id: starRequest.eventId });
    setStarRequest(null);
  };

  const handleProfileChange = (patch) => {
    updateProfile((prev) => {
      let next = prev;
      if ('displayName' in patch) next = setDisplayName(next, patch.displayName);
      if ('level' in patch) next = setLevel(next, patch.level);
      return next;
    });
  };

  // Navigation is two pages plus a tool overlay. Closing a tool returns to
  // whichever page launched it; the breadcrumb and page buttons agree.
  const goDashboard = () => {
    setPage('dashboard');
    setActiveTool(null);
  };
  const goAllTools = () => {
    setPage('all-tools');
    setActiveTool(null);
  };
  const closeTool = () => setActiveTool(null);

  // Compilers are one full-screen tool; the tracker and event tools deep-link
  // into it with an event id. The compiler owns the sheet and any selection.
  const openCompiler = (eventId, objectiveId) => {
    const resolved = STUDY_EVENT_IDS.includes(eventId) ? eventId : STUDY_EVENT_IDS[0];
    trackEvent('module_opened', {
      event_id: resolved,
      module_id: `${resolved}-reference-compiler`,
      module_name: 'Reference & Study Compiler',
      from: 'dashboard',
      objective_id: objectiveId
    });
    setActiveTool({ kind: 'compiler', eventId: resolved });
  };

  const openModule = (eventId, moduleId) => {
    const module = EVENT_REGISTRY[eventId]?.modules.find((item) => item.id === moduleId);
    trackEvent('module_opened', {
      event_id: eventId,
      module_id: moduleId,
      module_name: module?.label,
      category: module?.cat,
      from: 'dashboard'
    });
    setActiveTool({ kind: 'module', eventId, moduleId });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-background-primary)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent-primary)', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
          Loading Olympiad Studio...
        </div>
      </div>
    );
  }

  const landingContent = (
    <LandingHome
      currentUser={currentUser}
      onGoToDashboard={() => setCurrentView('dashboard')}
      onGuestAccess={handleGuestAccess}
    />
  );

  let RenderComponent;
  if (activeTool?.kind === 'compiler') {
    RenderComponent = (
      <CompilerTool
        eventId={activeTool.eventId}
        onOpenCompiler={openCompiler}
        onBack={closeTool}
      />
    );
  } else if (activeModule) {
    if (isGuest && activeModule.requiresAuth) {
      RenderComponent = <AuthRequired mod={activeModule} onLogin={handleGoogleLogin} />;
    } else {
      const Component = activeModule.component;
      RenderComponent = <Component mod={activeModule} />;
    }
  } else if (activeTool) {
    RenderComponent = (
      <div className="dashboard-empty" role="alert">
        <i className="ti ti-alert-circle" aria-hidden="true" style={{ fontSize: 22, color: 'var(--color-text-warning)' }} />
        <strong>That tool isn't available.</strong>
        <span>The tool "{activeTool.moduleId}" is no longer registered. Choose another from your dashboard.</span>
        <button type="button" className="breadcrumb-link dashboard-inline-action" onClick={closeTool}>Back to your page</button>
      </div>
    );
  } else if (page === 'all-tools') {
    RenderComponent = (
      <AllTools
        profile={profile}
        onStar={handleStar}
        onOpenModule={openModule}
        onOpenCompiler={openCompiler}
        onDashboard={goDashboard}
      />
    );
  } else {
    RenderComponent = (
      <Dashboard
        profile={profile}
        profileError={profileState.error}
        sources={OBJECTIVE_TRACKER_SOURCES}
        onStar={handleStar}
        onOpenModule={openModule}
        onOpenCompiler={openCompiler}
        onAllTools={goAllTools}
      />
    );
  }

  const dashboardContent = (
    <div className="dashboard-shell">
      <main id="main-content" className={`dashboard-content${page === 'all-tools' && !activeTool ? ' all-tools-content' : ''}`}>
        {!showLanding && activeToolLabel && (
          <h1 className="dashboard-title dashboard-tool-title" style={{ marginBottom: 18 }}>{activeToolLabel}</h1>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={showLanding ? 'landing' : `${page}-${activeTool ? `${activeTool.kind}-${activeTool.eventId}${activeTool.moduleId || ''}` : 'page'}`}>
            <Suspense fallback={
              <div style={{ display: 'grid', placeItems: 'center', minHeight: 260, padding: 24, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-sans)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-border-tertiary)', borderTopColor: 'var(--color-accent-primary)', animation: 'spin 1s linear infinite' }} aria-hidden="true"></div>
                  <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Loading tool…</span>
                </div>
              </div>
            }>
              {RenderComponent}
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  );

  return (
    <>
      {!showLanding && <a className="skip-link" href="#main-content">Skip to main content</a>}
      <AppNav
        currentUser={currentUser}
        authLoading={authLoading}
        theme={theme}
        toggleTheme={toggleTheme}
        showLanding={showLanding}
        page={page}
        profile={profile}
        activeToolLabel={activeToolLabel}
        onDashboard={goDashboard}
        onAllTools={goAllTools}
        onCloseTool={closeTool}
        onProfileChange={handleProfileChange}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
      />
      <AnimatePresence mode="wait">
        <PageTransition key={showLanding ? 'landing' : 'dashboard'}>
          {showLanding ? landingContent : dashboardContent}
        </PageTransition>
      </AnimatePresence>
      {starRequest && (
        <ConfirmDialog
          title={starRequest.isStarred
            ? `Remove ${EVENT_REGISTRY[starRequest.eventId]?.name ?? 'this event'} from My Events?`
            : `Add ${EVENT_REGISTRY[starRequest.eventId]?.name ?? 'this event'} to My Events?`}
          description={starRequest.isStarred
            ? 'Its tools will leave your Dashboard. They stay available on All Tools.'
            : 'Its tools will appear on your Dashboard. You can remove it any time; the tools stay available on All Tools.'}
          confirmLabel={starRequest.isStarred ? 'Remove from My Events' : 'Add to My Events'}
          onConfirm={confirmStar}
          onCancel={closeStarRequest}
          openerRef={starOpenerRef}
        />
      )}
    </>
  );
}
