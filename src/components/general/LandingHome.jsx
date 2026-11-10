import Logo from './Logo';
import { ACTIVE_SEASON } from '../../seasons/manifest.js';

const LAUNCH_AREAS = [
  { key: 'calc', icon: 'ti-calculator', label: 'Calculators', about: 'Scores, geometry, circuits, chemistry, freshwater' },
  { key: 'log', icon: 'ti-notebook', label: 'Practice logs', about: 'Runs, build tests, study notes — local, exportable' },
  { key: 'drill', icon: 'ti-cards', label: 'Drills & ID', about: 'Generated practice and student-authored recall' },
  { key: 'ref', icon: 'ti-file-text', label: 'Reference builders', about: 'Allowed sheet and binder compilers for study' },
];

function LaunchConstellation() {
  return (
    <svg aria-hidden="true" viewBox="0 0 720 520" focusable="false" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="lc-bloom" cx="70%" cy="35%" r="70%">
          <stop offset="0%" stopColor="var(--color-accent-hover)" stopOpacity="0.28" />
          <stop offset="45%" stopColor="var(--color-accent-primary)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lc-wire" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--color-accent-hover)" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="720" height="520" fill="url(#lc-bloom)" />
      <g fill="none" stroke="url(#lc-wire)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M180 120 C 320 90, 430 150, 520 210" />
        <path d="M520 210 C 560 300, 470 380, 350 400" />
        <path d="M350 400 C 230 420, 150 330, 180 120" strokeOpacity="0.55" />
        <path d="M180 120 L 350 400" strokeOpacity="0.22" />
        <path d="M520 210 L 250 285" strokeOpacity="0.22" />
        <circle cx="360" cy="265" r="120" stroke="var(--color-accent-primary)" strokeOpacity="0.12" strokeWidth="1" />
        <circle cx="360" cy="265" r="185" stroke="var(--color-accent-primary)" strokeOpacity="0.08" strokeWidth="1" />
      </g>
      <g>
        {[
          [180, 120], [520, 210], [350, 400], [250, 285],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="26" fill="var(--color-background-secondary)" fillOpacity="0.85" stroke="var(--color-border-warning)" strokeOpacity="0.7" />
            <circle cx={x} cy={y} r="7" fill="var(--color-accent-primary)" />
          </g>
        ))}
        <circle cx="360" cy="265" r="44" fill="var(--color-accent-primary)" fillOpacity="0.16" stroke="var(--color-accent-primary)" strokeOpacity="0.45" />
        <circle cx="360" cy="265" r="11" fill="var(--color-accent-hover)" />
      </g>
      <g fill="var(--color-accent-primary)" fillOpacity="0.35">
        <circle cx="90" cy="70" r="3" /><circle cx="640" cy="90" r="4" /><circle cx="610" cy="440" r="3" /><circle cx="110" cy="450" r="4" /><circle cx="680" cy="300" r="2.5" />
      </g>
    </svg>
  );
}

export default function LandingHome({ currentUser, onGoToDashboard, onGuestAccess, theme, toggleTheme }) {
  const launch = () => (currentUser ? onGoToDashboard() : onGuestAccess());
  const entryLabel = currentUser ? 'Open Dashboard' : 'Continue as guest';
  const mainAction = currentUser ? 'Open workspace' : 'Enter studio';
  const themeLabel = theme === 'dark' ? 'light' : 'dark';

  return (
    <div
      style={{
        height: '100dvh',
        minHeight: '100dvh',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
        gridTemplateRows: '1fr',
        background:
          'radial-gradient(120% 100% at 0% 100%, color-mix(in srgb, var(--color-accent-strong) 18%, transparent), transparent 45%), radial-gradient(90% 80% at 100% 0%, color-mix(in srgb, var(--color-accent-hover) 14%, transparent), transparent 50%), var(--color-background-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
        textAlign: 'left',
      }}
    >
      <section style={{ position: 'relative', minHeight: 0, overflow: 'hidden', borderRight: '1px solid var(--color-border-tertiary)' }}>
        <LaunchConstellation />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(14px, 2.2vh, 24px) clamp(16px, 2.8vw, 34px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Logo />
            <button type="button" aria-label={`Switch to ${themeLabel} mode`} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`} onClick={toggleTheme} style={{ width: 38, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, border: '1px solid var(--color-border-secondary)', background: 'color-mix(in srgb, var(--color-background-secondary) 80%, transparent)', color: 'var(--color-text-secondary)', cursor: 'pointer', flexShrink: 0 }}>
              <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} aria-hidden="true" style={{ fontSize: 18 }} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.4vh, 14px)', maxWidth: 760 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent-primary)' }}>
              Science Olympiad {ACTIVE_SEASON.year} · hands-on prep
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(52px, 7.4vw, 118px)', lineHeight: 0.88, letterSpacing: '-0.06em', fontWeight: 900 }}>
              OLYMPIAD
              <br />
              <span style={{ color: 'transparent', WebkitTextStroke: '2px var(--color-text-primary)', textStroke: '2px var(--color-text-primary)' }}>STUDIO</span>
            </h1>
            <p style={{ margin: 0, fontSize: 'clamp(15px, 1.35vw, 20px)', lineHeight: 1.45, color: 'var(--color-text-secondary)', maxWidth: '44ch', fontWeight: 500 }}>
              Rule-grounded calculators, practice logs, drills, and reference builders — organized by event, ready when you are.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button type="button" aria-label={entryLabel} onClick={launch} style={{ padding: '15px 26px', border: 'none', borderRadius: 999, background: 'var(--color-accent-primary)', color: 'var(--color-text-inverse)', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>
              {mainAction}
            </button>
            <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>No account required · your work stays in this browser</span>
          </div>
        </div>
      </section>

      <aside style={{ minHeight: 0, display: 'grid', gridTemplateRows: 'auto 1fr auto', background: 'color-mix(in srgb, var(--color-background-secondary) 88%, transparent)', overflow: 'hidden' }}>
        <div style={{ padding: 'clamp(14px, 2.2vh, 22px) clamp(14px, 1.8vw, 22px)', borderBottom: '1px solid var(--color-border-tertiary)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Launch areas</div>
          <div style={{ marginTop: 6, fontSize: 'clamp(18px, 1.8vw, 24px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>Pick a tool type, then pick your event.</div>
        </div>

        <div style={{ minHeight: 0, display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', overflow: 'hidden' }}>
          {LAUNCH_AREAS.map((area) => (
            <div key={area.key} style={{ minHeight: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', alignContent: 'center', gap: 12, padding: 'clamp(10px, 1.5vh, 16px) clamp(14px, 1.6vw, 20px)', borderBottom: '1px solid var(--color-border-tertiary)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-accent-muted)', color: 'var(--color-accent-primary)', border: '1px solid var(--color-border-warning)', alignSelf: 'center' }}>
                <i className={`ti ${area.icon}`} aria-hidden="true" style={{ fontSize: 20 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>{area.label}</div>
                <div style={{ marginTop: 2, fontSize: 12.5, lineHeight: 1.35, color: 'var(--color-text-secondary)' }}>{area.about}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 'clamp(12px, 1.8vh, 16px) clamp(14px, 1.8vw, 20px)', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--color-background-primary)', borderTop: '1px solid var(--color-border-tertiary)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12.5, lineHeight: 1.4, color: 'var(--color-text-secondary)' }}>
            <i className="ti ti-shield-check" aria-hidden="true" style={{ color: 'var(--color-accent-primary)', fontSize: 18, flexShrink: 0, marginTop: 1 }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>Grounded in the rules.</strong> Tools cite the official manual — verify details for your tournament.</span>
          </div>
          <button type="button" aria-label={entryLabel} onClick={launch} style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
            {entryLabel} →
          </button>
        </div>
      </aside>
    </div>
  );
}
