import Logo from './Logo';
import { ACTIVE_SEASON } from '../../seasons/manifest.js';

const cardStyle = {
  background: 'var(--color-background-secondary)',
  border: '1px solid var(--color-border-tertiary)',
  borderRadius: 'var(--radius-lg)',
  padding: 24,
  boxShadow: 'var(--shadow-sm)'
};

export default function LandingHome({ currentUser, onGoToDashboard, onGuestAccess, theme, toggleTheme }) {
  const cta = () => (currentUser ? onGoToDashboard() : onGuestAccess());
  const ctaLabel = currentUser ? 'Open Dashboard' : 'Get Started';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '16px 24px', borderBottom: '1px solid var(--color-border-tertiary)', background: 'color-mix(in srgb, var(--color-background-secondary) 94%, transparent)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)' }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`} style={{ background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', padding: 8, borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} aria-hidden="true" style={{ fontSize: 16 }}></i>
          </button>
          <button type="button" aria-label={currentUser ? 'Open dashboard' : 'Continue as guest'} onClick={cta} style={{ padding: '10px 18px', background: 'var(--color-accent-primary)', color: 'var(--color-text-inverse)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {ctaLabel}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px', textAlign: 'center' }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-accent-muted)', border: '1px solid var(--color-border-warning)', color: 'var(--color-accent-primary)', fontSize: 13, fontWeight: 600 }}>
            <i className="ti ti-flask" style={{ fontSize: 14 }} aria-hidden="true"></i>
            Science Olympiad {ACTIVE_SEASON.year}
          </span>
        </div>

        <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 800, maxWidth: '14ch', marginLeft: 'auto', marginRight: 'auto' }}>
          Prep tools that actually fit the event.
        </h1>

        <p style={{ margin: '0 0 32px', fontSize: 18, lineHeight: 1.6, color: 'var(--color-text-secondary)', maxWidth: '55ch', marginLeft: 'auto', marginRight: 'auto' }}>
          Calculators, practice logs, drills, and study aids — organized by event, grounded in the official rules.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <button type="button" aria-label={currentUser ? 'Open workspace' : 'Get started'} onClick={cta} style={{ padding: '16px 28px', background: 'var(--color-accent-primary)', color: 'var(--color-text-inverse)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>
            {currentUser ? 'Open workspace' : 'Start exploring'}
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>No setup required · Data stays in your browser</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'left', marginTop: 16 }}>
          <article style={{ ...cardStyle }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <i className="ti ti-calculator" style={{ color: 'var(--color-accent-primary)', fontSize: 22, flexShrink: 0, marginTop: 2 }} aria-hidden="true"></i>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Rule-grounded calculators</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>Scores, geometry, circuits, chemistry, freshwater — every formula cites the manual.</p>
              </div>
            </div>
          </article>
          <article style={{ ...cardStyle }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <i className="ti ti-notebook" style={{ color: 'var(--color-accent-primary)', fontSize: 22, flexShrink: 0, marginTop: 2 }} aria-hidden="true"></i>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Practice & build logs</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>Track runs, prototypes, and study work locally. Export CSV anytime.</p>
              </div>
            </div>
          </article>
          <article style={{ ...cardStyle }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <i className="ti ti-cards" style={{ color: 'var(--color-accent-primary)', fontSize: 22, flexShrink: 0, marginTop: 2 }} aria-hidden="true"></i>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Drills & reference compilers</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>ID keys, generated practice, and allowed-reference-sheet builders for study events.</p>
              </div>
            </div>
          </article>
        </div>

        <p style={{ margin: '48px 0 0', fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
          <strong>Accuracy first.</strong> Tools cite the official manual. Always verify against current rules for your tournament.
        </p>
      </main>
    </div>
  );
}