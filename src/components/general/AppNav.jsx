import { Fragment } from 'react';
import Logo from './Logo';
import ProfileMenu from './nav/ProfileMenu.jsx';
import { ACTIVE_SEASON } from '../../seasons/manifest.js';

function GoogleMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.84 2.69-6.57z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.96v2.32C2.44 15.09 5.47 18 9 18z" fill="#34A853" />
      <path d="M3.95 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.94H.96A8.977 8.977 0 0 0 0 9c0 1.48.36 2.9 1 4.14l2.95-2.4z" fill="#FBBC05" />
      <path d="M9 3.58c2.5 0 4.71.45 3.44 1.35l2.58-2.58C13.46.8 11.42 0 9 0 5.47 0 2.44 2.91.96 5.34l2.95 2.32C4.66 5.16 6.65 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

const PAGE_LABELS = { dashboard: 'Dashboard', 'all-tools': 'All Tools' };

/**
 * The one persistent chrome band. Navigation is deliberately tiny: a brand
 * button and two page buttons, a breadcrumb only while a tool is open, and the
 * single theme/auth/profile controls. Event selection lives on the Dashboard.
 */
export default function AppNav({
  currentUser,
  authLoading,
  theme,
  toggleTheme,
  showLanding,
  page,
  profile,
  activeToolLabel,
  onDashboard,
  onAllTools,
  onCloseTool,
  onProfileChange,
  onLogin,
  onLogout,
}) {
  const themeLabel = theme === 'dark' ? 'light' : 'dark';
  const pageLabel = PAGE_LABELS[page] || PAGE_LABELS.dashboard;
  const guestSyncHint = 'Guest mode: saved build logs and study sheets stay in this browser. Sign in to sync across devices.';
  // Breadcrumbs appear only inside a tool, so the nav cannot duplicate the
  // current page's heading or compete with the two page buttons.
  const showTrail = !showLanding && Boolean(activeToolLabel);
  const backKey = 'page';

  return (
    <header className="app-nav">
      <div className="app-nav-inner">
        {showLanding ? (
          <div className="app-nav-brand">
            <Logo compact />
          </div>
        ) : (
          <button type="button" className="app-nav-brand" onClick={onDashboard} aria-label="Olympiad Studio home" title="Dashboard">
            <Logo compact />
          </button>
        )}

        {showTrail && (
          <nav className="app-nav-trail" aria-label="Breadcrumb">
            {[
              { key: backKey, label: pageLabel, onClick: onCloseTool },
              { key: 'tool', label: activeToolLabel, current: true }
            ].map((crumb, index) => (
              <Fragment key={crumb.key}>
                {index > 0 && <span className="app-nav-sep" aria-hidden="true">/</span>}
                {crumb.onClick && !crumb.current ? (
                  <button
                    type="button"
                    className={`app-nav-crumb${crumb.key === backKey ? ' app-nav-crumb-back' : ''}`}
                    onClick={crumb.onClick}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="app-nav-current" aria-current={crumb.current ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                )}
              </Fragment>
            ))}
          </nav>
        )}

        <div className="app-nav-actions">
          {!showLanding && (
            <>
              <nav className="app-nav-pages" aria-label="Workspace pages">
                <button
                  type="button"
                  className="app-nav-page"
                  aria-current={!activeToolLabel && page === 'dashboard' ? 'page' : undefined}
                  onClick={onDashboard}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  className="app-nav-page"
                  aria-current={!activeToolLabel && page === 'all-tools' ? 'page' : undefined}
                  onClick={onAllTools}
                >
                  All Tools
                </button>
              </nav>
              <span className="app-nav-season" title={ACTIVE_SEASON.manualLabel}>
                {ACTIVE_SEASON.year}
              </span>
              {!currentUser && (
                <span
                  className="app-nav-guest-hint"
                  role="note"
                  tabIndex={0}
                  aria-label={guestSyncHint}
                  title={guestSyncHint}
                >
                  <i className="ti ti-info-circle" aria-hidden="true" />
                </span>
              )}
              <ProfileMenu
                profile={profile}
                isGuest={!currentUser}
                onProfileChange={onProfileChange}
              />
            </>
          )}
          <button
            type="button"
            className="app-nav-icon"
            aria-label={`Switch to ${themeLabel} mode`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            onClick={toggleTheme}
          >
            <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} aria-hidden="true" style={{ fontSize: 16 }}></i>
          </button>
          {currentUser ? (
            <>
              <span className="app-nav-email" title={currentUser.email}>{currentUser.email}</span>
              <button type="button" className="app-nav-btn" aria-label="Log out" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <button
              type="button"
              className="app-nav-btn"
              aria-label="Sign in with Google"
              onClick={onLogin}
              disabled={authLoading}
            >
              <GoogleMark />
              <span className="app-nav-signin-text">{authLoading ? 'Connecting…' : 'Sign in'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
