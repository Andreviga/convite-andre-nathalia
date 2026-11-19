import type { CSSProperties } from "react";

// Lacre de cera com as iniciais. Cores: var(--seal) e var(--seal-ink). SVG estático (nada de filtros animados).
// A fonte das iniciais vem do modelo: var(--seal-font), que por padrão é a fonte dos nomes (ver .env-seal em invite.css).

// Silhueta de cera: curva fechada (termina onde começa) e inteira dentro da viewBox 0 0 120 120 (de 4,7 a 114,5).
const EDGE =
  "M60 5.9C67.5 7.2 74.9 12.5 81.3 14.4C87.6 16.3 87.4 11.3 92.3 15.6C97.2 19.9 103.2 30.4 106.2 36.4C109.3 42.4 106.8 39.1 108 46.2C109.1 53.4 112.1 64.9 112.1 73C112.2 81.1 111.3 83.2 108.2 87.8C105.2 92.5 103.6 92.4 96.6 96.6C89.5 100.7 78.8 105.5 72.2 109C65.6 112.5 69.4 114.6 62.9 114.4C56.3 114.2 45.4 111.2 38.6 108C31.8 104.8 32.6 101.6 28.1 98.1C23.5 94.6 19.8 96.6 15.3 90.1C10.8 83.6 6 72.1 4.9 64.8C3.8 57.5 7.5 59.5 9.6 52.9C11.7 46.3 12.5 36.6 15.5 31.1C18.4 25.5 19.2 29.1 24.6 24.6C30 20.1 36.2 11.6 43.1 8C50 4.3 52.5 4.6 60 5.9Z";

/** Iniciais sem acento: "É" vira "E", "Â" vira "A" (o lacre é gravado, não escrito). */
function plain(letter: string) {
  return letter.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function WaxSeal({ initials }: { initials: string[] }) {
  const letters = initials.slice(0, 2).map(plain).filter(Boolean);
  const text = letters.join(letters.length > 1 ? "·" : "");
  // Letras largas (M, W) encolhem um pouco as iniciais, para não passarem do anel nas fontes caligráficas.
  const units = letters.reduce((sum, l) => sum + (/[MW]/i.test(l) ? 1.35 : /[IJ]/i.test(l) ? 0.7 : 1), 0);
  const fit = letters.length > 1 ? Math.min(1, 2.1 / units) : Math.min(1, 1.15 / units);
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" data-count={letters.length} style={{ "--seal-fit": fit.toFixed(2) } as CSSProperties}>
      <defs>
        <radialGradient id="seal-light" cx="35%" cy="28%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </radialGradient>
      </defs>
      <path className="seal-wax" d={EDGE} />
      <path className="seal-light" d={EDGE} fill="url(#seal-light)" />
      <circle className="seal-ring" cx="60" cy="60" r="37" fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="2.4" />
      <circle className="seal-ring" cx="60" cy="61" r="37" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1" />
      {/* Duas camadas: atrás, o contorno escuro (tom da própria cera) que garante a leitura em qualquer paleta; na frente, as iniciais. */}
      <text className="seal-initials seal-initials-edge" x="60" y="60" textAnchor="middle" dominantBaseline="central">
        {text}
      </text>
      <text className="seal-initials" x="60" y="60" textAnchor="middle" dominantBaseline="central">
        {text}
      </text>
    </svg>
  );
}
