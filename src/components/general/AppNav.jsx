import { Fragment } from 'react';
import Logo from './Logo';
import GoogleMark from './nav/GoogleMark.jsx';
import ProfileMenu from './nav/ProfileMenu.jsx';
import { ACTIVE_SEASON } from '../../seasons/manifest.js';

const PAGE_LABELS = { dashboard: 'Dashboard', 'all-tools': 'All Tools' };
const HOME_HREF = import.meta.env.BASE_URL || '/';

/**
 * The one persistent chrome band. Every view gets the same controls in the
 * same order; only the breadcrumb appears while a tool is open. Guests get a
 * primary sign-in button, and signed-in users get the single profile menu.
 */
export default function AppNav({
  currentUser,
  authLoading,
  theme,
  toggleTheme,
  page,
  profile,
  activeToolLabel,
  onDashboard,
  onAllTools,
  onCloseTool,
  onProfileChange,
  onLogin,
  onLogout,
  onHome,
}) {
  const themeLabel = theme === 'dark' ? 'light' : 'dark';
  const pageLabel = PAGE_LABELS[page] || PAGE_LABELS.dashboard;
  const showTrail = Boolean(activeToolLabel);
  const backKey = 'page';

  // A plain left-click navigates in-app; modified clicks keep native link
  // behaviour (open in new tab, copy address, …) from the same href.
  const handleHomeClick = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onHome();
  };

  return (
    <header className="app-nav">
      <div className="app-nav-inner">
        <a
          className="app-nav-brand"
          href={HOME_HREF}
          onClick={handleHomeClick}
          aria-label="Olympiad Studio home"
        >
          <Logo compact />
        </a>

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
            <ProfileMenu
              profile={profile}
              onProfileChange={onProfileChange}
              onLogout={onLogout}
            />
          ) : (
            <button
              type="button"
              className="app-nav-btn app-nav-btn-primary"
              aria-label="Sign in"
              onClick={onLogin}
              disabled={authLoading}
            >
              <GoogleMark />
              <span className="app-nav-signin-text">
                {authLoading ? 'Connecting…' : 'Sign in'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
