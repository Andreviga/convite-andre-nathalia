// Lacre de cera com as iniciais. Cores: var(--seal) e var(--seal-ink). SVG estático (nada de filtros animados).
const EDGE =
  "M60 4c9-2 15 5 23 7 9 2 17 1 22 9 4 7 2 14 6 21 4 8 9 13 7 22-2 8-9 11-12 18-4 8-3 17-11 22-7 5-14 2-22 5-8 3-13 9-22 8-9-1-12-8-19-11-8-4-17-3-22-11-5-7-2-14-5-22-3-8-9-13-8-22 1-9 8-12 11-19 4-8 3-17 11-22 7-5 14-2 22-5 7-3 12-8 19-10z";

export function WaxSeal({ initials }: { initials: string[] }) {
  const text = initials.slice(0, 2).join(initials.length > 1 ? "·" : "");
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="seal-light" cx="35%" cy="28%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </radialGradient>
      </defs>
      <path d={EDGE} style={{ fill: "var(--seal)" }} />
      <path d={EDGE} fill="url(#seal-light)" />
      <circle cx="60" cy="60" r="37" fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="2.4" />
      <circle cx="60" cy="61" r="37" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1" />
      <text x="60" y="74" textAnchor="middle" fontSize={initials.length > 1 ? 34 : 44} fontStyle="italic" style={{ fontFamily: "var(--f-serif), Georgia, serif", fill: "#000", opacity: 0.35 }}>
        {text}
      </text>
      <text x="60" y="73" textAnchor="middle" fontSize={initials.length > 1 ? 34 : 44} fontStyle="italic" style={{ fontFamily: "var(--f-serif), Georgia, serif", fill: "var(--seal-ink)" }}>
        {text}
      </text>
    </svg>
  );
}
