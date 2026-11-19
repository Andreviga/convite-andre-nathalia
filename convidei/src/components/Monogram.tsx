// Monograma com as iniciais, em SVG. Herda a cor (currentColor) e a fonte dos nomes do modelo.
export function Monogram({ initials, className = "mono" }: { initials: string[]; className?: string }) {
  const [a, b] = initials;
  if (!a) return null;
  return (
    <svg className={className} viewBox="0 0 120 120" role="img" aria-label={`Monograma ${initials.join(" e ")}`}>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="60" cy="60" r="51.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
      {b ? (
        <>
          <text x="41" y="74" textAnchor="middle" fontSize="44">{a}</text>
          <line x1="60" y1="38" x2="60" y2="82" stroke="currentColor" strokeWidth="0.6" />
          <text x="79" y="74" textAnchor="middle" fontSize="44">{b}</text>
        </>
      ) : (
        <text x="60" y="77" textAnchor="middle" fontSize="52">{a}</text>
      )}
    </svg>
  );
}
