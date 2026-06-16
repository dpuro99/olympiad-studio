import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirects back to your local server once authenticated safely
          redirectTo: window.location.origin, 
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err.message || 'An error occurred during Google sign in.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 32, maxWidth: 380, width: "100%", textAlign: "center" };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "65vh" }}>
      <div style={cardStyle}>
        <div style={{ fontSize: 24, fill: "currentColor", marginBottom: 8 }}>
          <i className="ti ti-lock" style={{ color: "var(--color-text-info)", fontSize: 28 }}></i>
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Olymiad Studio</div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 24 }}>Sign in to sync your vehicle configurations</div>
        
        {error && <div style={{ color: "var(--color-text-danger)", fontSize: 12, marginBottom: 16 }}>{error}</div>}
        
        <button onClick={handleGoogleLogin} disabled={loading} style={{
          width: "100%", padding: "12px", background: "#ffffff", color: "#1f1f1f",
          border: "none", borderRadius: "var(--border-radius-md)", fontWeight: 500,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer"
        }}>
          {/* Official Google Visual Brand Identity Branding Asset */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.84 2.69-6.57z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.96v2.32C2.44 15.09 5.47 18 9 18z" fill="#34A853"/>
            <path d="M3.95 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.94H.96A8.977 8.977 0 0 0 0 9c0 1.48.36 2.9 1 4.14l2.95-2.4z" fill="#FBBC05"/>
            <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.8 11.42 0 9 0 5.47 0 2.44 2.91.96 5.34l2.95 2.32C4.66 5.16 6.65 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}
