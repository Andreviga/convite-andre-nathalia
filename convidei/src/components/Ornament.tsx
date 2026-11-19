// Ornamentos desenhados em SVG: leves, nítidos em qualquer tela e coloridos pelo tema do modelo.

function Branch({ flip = false }: { flip?: boolean }) {
  const leaves = [8, 24, 40, 56, 72, 88];
  return (
    <svg viewBox="0 0 120 40" width="120" height="40" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M2 30 C 40 30, 80 22, 118 6" fill="none" stroke="currentColor" strokeWidth="1" />
      {leaves.map((x, i) => {
        const y = 30 - (x / 118) * 22;
        return (
          <g key={x} transform={`translate(${x} ${y}) rotate(${-18 - i * 2})`}>
            <path d="M0 0 C 4 -9, 13 -10, 17 -3 C 11 1, 5 2, 0 0 Z" fill="currentColor" opacity={0.85} />
            <path d="M0 0 C 5 7, 13 8, 16 3 C 11 -1, 5 -1, 0 0 Z" fill="currentColor" opacity={0.45} />
          </g>
        );
      })}
    </svg>
  );
}

const CONFETTI: [number, number, number, number][] = [
  [6, 12, 0, 20], [18, 44, 1, -30], [30, 8, 2, 60], [44, 30, 0, 10], [58, 6, 1, -50], [70, 40, 2, 35],
  [84, 14, 0, -15], [94, 46, 1, 70], [12, 70, 2, 25], [38, 62, 1, -40], [64, 74, 0, 50], [88, 68, 2, -10],
];

export function Ornament({ template, position }: { template: string; position: "top" | "bottom" }) {
  switch (template) {
    case "botanico":
      return (
        <div className={`orn orn-${position} orn-branches`} aria-hidden="true">
          <Branch />
          <Branch flip />
        </div>
      );
    case "classico":
      return (
        <div className={`orn orn-${position}`} aria-hidden="true">
          <svg viewBox="0 0 160 24" width="160" height="24">
            <path d="M0 12 H62 M98 12 H160" stroke="currentColor" strokeWidth="1" />
            <path d="M80 2 L90 12 L80 22 L70 12 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="80" cy="12" r="2.2" fill="currentColor" />
          </svg>
        </div>
      );
    case "festa":
      return (
        <div className={`orn orn-${position} orn-confetti`} aria-hidden="true">
          <svg viewBox="0 0 100 84" preserveAspectRatio="none">
            {CONFETTI.map(([x, y, tone, rot], i) =>
              i % 3 === 0 ? (
                <circle key={i} cx={x} cy={y} r="1.6" className={`tone-${tone}`} />
              ) : (
                <rect key={i} x={x} y={y} width="3.4" height="1.5" rx="0.7" transform={`rotate(${rot} ${x} ${y})`} className={`tone-${tone}`} />
              ),
            )}
          </svg>
        </div>
      );
    case "doce":
      return (
        <div className={`orn orn-${position}`} aria-hidden="true">
          <svg viewBox="0 0 180 40" width="180" height="40">
            <path d="M22 30 a10 10 0 0 1 4 -19 a13 13 0 0 1 25 -1 a10 10 0 0 1 5 20 Z" fill="currentColor" opacity="0.5" />
            <path d="M112 32 a9 9 0 0 1 3 -17 a12 12 0 0 1 23 -2 a10 10 0 0 1 8 19 Z" fill="currentColor" opacity="0.8" />
            <circle cx="84" cy="14" r="2" fill="currentColor" />
            <circle cx="96" cy="26" r="1.4" fill="currentColor" />
            <circle cx="72" cy="28" r="1.4" fill="currentColor" />
          </svg>
        </div>
      );
    case "noite":
      return (
        <div className={`orn orn-${position}`} aria-hidden="true">
          <svg viewBox="0 0 180 30" width="180" height="30">
            {[[20, 18, 1.2], [44, 8, 0.8], [66, 20, 1], [90, 10, 2.2], [114, 20, 1], [136, 8, 0.8], [160, 18, 1.2]].map(([x, y, s], i) => (
              <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z" fill="currentColor" />
            ))}
          </svg>
        </div>
      );
    case "terracota":
      return (
        <div className={`orn orn-${position}`} aria-hidden="true">
          <svg viewBox="0 0 120 44" width="120" height="44">
            <path d="M20 44 V28 a40 40 0 0 1 80 0 V44" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M32 44 V30 a28 28 0 0 1 56 0 V44" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            <circle cx="60" cy="34" r="6" fill="currentColor" opacity="0.75" />
          </svg>
        </div>
      );
    default:
      return <div className={`orn orn-${position} orn-line`} aria-hidden="true" />;
  }
}
