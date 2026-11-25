import { LEVEL_OPTIONS } from '../dashboard/profileUtils.js';
import NavPopover from './NavPopover.jsx';

/** Profile settings stay in the nav; event stars are chosen on the Dashboard. */
export default function ProfileMenu({ profile, isGuest = false, onProfileChange }) {
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
          {isGuest && (
            <p className="profile-hint profile-guest-hint">
              <i className="ti ti-info-circle" aria-hidden="true" />
              Sign in to sync saved build logs and study sheets across devices.
            </p>
          )}
        </div>
      )}
    </NavPopover>
  );
}
