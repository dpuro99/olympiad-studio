export default function Logo({ compact = false }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: compact ? 8 : 10 }}>
      <svg
        width={compact ? 26 : 32}
        height={compact ? 30 : 36}
        viewBox="0 0 32 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", transform: "translateY(1px)" }}
        aria-hidden="true"
      >
        <path
          d="M11 4H21M13 4V12L5.2 24.8C4.1 26.6 5.4 29 7.5 29H24.5C26.6 29 27.9 26.6 26.8 24.8L19 12V4"
          stroke="var(--color-accent-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 24L12.2 18C13 16.7 14.8 16.7 15.6 18L16.4 19.3C17.2 20.6 19 20.6 19.8 19.3L23.5 13.5L25.2 24C25.5 25.7 24.2 27 22.5 27H9.5C7.8 27 6.5 25.7 6.8 24L8.5 24Z"
          fill="var(--color-accent-primary)"
          fillOpacity="0.2"
        />
        <circle cx="21" cy="9" r="1.5" fill="var(--color-accent-primary)" />
      </svg>
      <span
        style={{
          fontSize: compact ? 15 : 19,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          fontFamily: "var(--font-sans)",
          WebkitFontSmoothing: "antialiased"
        }}
      >
        <strong style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>Olympiad</strong>{" "}
        <span style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>Studio</span>
      </span>
    </div>
  );
}
