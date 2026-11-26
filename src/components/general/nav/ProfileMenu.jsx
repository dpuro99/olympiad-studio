import { LEVEL_OPTIONS } from '../dashboard/profileUtils.js';
import NavPopover from './NavPopover.jsx';

/** The signed-in profile control; guests see the nav's sign-in button instead. */
export default function ProfileMenu({ profile, onProfileChange, onLogout }) {
  const displayName = profile.displayName || 'Guest';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'G';

  return (
    <NavPopover
      label={`Profile: ${displayName}`}
      panelLabel="Profile settings"
      trigger={<><span className="profile-avatar" aria-hidden="true">{initial}</span><span className="profile-name">{displayName}</span><i className="ti ti-chevron-down" aria-hidden="true" /></>}
    >
      {() => (
        <div className="profile-panel">
          <label className="profile-field">
            <span>Display name</span>
            <input
              type="text"
              maxLength={40}
              value={profile.displayName}
              placeholder="Guest"
              onChange={(event) => onProfileChange({ displayName: event.target.value })}
            />
          </label>
          <label className="profile-field">
            <span>Competition level</span>
            <select value={profile.level} onChange={(event) => onProfileChange({ level: event.target.value })}>
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <p className="profile-hint">Saved in this browser. Star events from Choose events on the Dashboard.</p>
          <button type="button" className="app-nav-btn profile-auth-action" onClick={onLogout}>
            Log out
          </button>
        </div>
      )}
    </NavPopover>
  );
}
