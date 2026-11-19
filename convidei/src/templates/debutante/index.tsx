import type { ArtProps, TemplateDef } from "../types";

// Debutante: noite de gala. Papel escuro, nome em caligrafia com foil, uma tiara de fio fino como motivo-herói
// e o "15" entre dois brilhos como detalhe. Tudo em traço de uma só espessura, na cor de destaque da paleta.

/** Brilho de quatro pontas (lados côncavos), centrado em (cx, cy) com raio r. */
function spark(cx: number, cy: number, r: number): string {
  const k = r * 0.16;
  return `M${cx} ${cy - r}Q${cx + k} ${cy - k} ${cx + r} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + r}Q${cx - k} ${cy + k} ${cx - r} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - r}Z`;
}

/** Gradiente de foil derivado da paleta: tom base, brilho (puxa para a tinta) e sombra (puxa para o papel). */
function FoilStops() {
  const base = "var(--accent)";
  const hi = "color-mix(in srgb, var(--accent) 40%, var(--ink))";
  const lo = "color-mix(in srgb, var(--accent) 74%, var(--paper))";
  return (
    <>
      <stop offset="0" style={{ stopColor: lo }} />
      <stop offset="0.24" style={{ stopColor: base }} />
      <stop offset="0.46" style={{ stopColor: hi }} />
      <stop offset="0.62" style={{ stopColor: base }} />
      <stop offset="0.82" style={{ stopColor: hi }} />
      <stop offset="1" style={{ stopColor: lo }} />
    </>
  );
}

// Tiara: aro duplo levemente arqueado, cinco pontas em ogiva, uma pedra em cada ponta e um brilho no alto.
function Tiara() {
  const side =
    "M66 46.6C67.5 33 76 26 80 13" + // metade da ponta central
    "M44 49.2C46 39 52 33.5 55 25.5C58 33.5 64.5 38 66 46.6" + // segunda ponta
    "M24.5 53.2C26.5 46.5 31 42.5 33.5 36.5C36 42.5 42.5 45 44 49.2"; // ponta de fora
  return (
    <svg className="deb-tiara" viewBox="0 0 160 66" width="132" height="54.5" fill="none" stroke="url(#debutante-foil)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="debutante-foil" gradientUnits="userSpaceOnUse" x1="10" y1="10" x2="150" y2="60">
          <FoilStops />
        </linearGradient>
      </defs>
      {/* aro */}
      <path d="M13 60.5Q80 49.5 147 60.5" />
      <path d="M17.5 55.2Q80 44.6 142.5 55.2" />
      {/* pontas */}
      <path d={side} />
      <path d={side} transform="translate(160 0) scale(-1 1)" />
      {/* arcos internos, que dão o desenho de renda */}
      <path d="M71 45.9C72.5 39 77 35.5 80 30C83 35.5 87.5 39 89 45.9" strokeWidth="0.8" />
      <path d="M49.5 48.4C50.5 44 53.5 41.5 55 38C56.5 41.5 60 43.5 61 47.2" strokeWidth="0.8" />
      <path d="M110.5 48.4C109.5 44 106.5 41.5 105 38C103.5 41.5 100 43.5 99 47.2" strokeWidth="0.8" />
      {/* pedras */}
      <g fill="url(#debutante-foil)" stroke="none">
        <circle cx="55" cy="22.4" r="1.9" />
        <circle cx="105" cy="22.4" r="1.9" />
        <circle cx="33.5" cy="33.8" r="1.6" />
        <circle cx="126.5" cy="33.8" r="1.6" />
        <circle cx="66" cy="46.6" r="1.1" />
        <circle cx="94" cy="46.6" r="1.1" />
        <circle cx="44" cy="49.2" r="1.1" />
        <circle cx="116" cy="49.2" r="1.1" />
        <path d={spark(80, 7.5, 7)} />
        <path d={spark(13.5, 22, 3.6)} opacity="0.75" />
        <path d={spark(146.5, 22, 3.6)} opacity="0.75" />
        <path d={spark(24, 8.5, 2.1)} opacity="0.55" />
        <path d={spark(136, 8.5, 2.1)} opacity="0.55" />
      </g>
    </svg>
  );
}

// Divisor: o "15" em itálico entre dois brilhos e dois fios que somem nas pontas.
function Fifteen({ show }: { show: boolean }) {
  return (
    <svg className="deb-fifteen" viewBox="0 0 220 26" width="220" height="26" fill="none">
      <defs>
        <linearGradient id="debutante-rule-l" gradientUnits="userSpaceOnUse" x1="8" y1="0" x2="72" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="debutante-rule-r" gradientUnits="userSpaceOnUse" x1="148" y1="0" x2="212" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="8" y="12.5" width="64" height="1" fill="url(#debutante-rule-l)" />
      <rect x="148" y="12.5" width="64" height="1" fill="url(#debutante-rule-r)" />
      <path d={spark(82, 13, 4.2)} fill="currentColor" />
      <path d={spark(138, 13, 4.2)} fill="currentColor" />
{show ? (
        <text x="110" y="20.5" textAnchor="middle" fontSize="23" fontStyle="italic" fontWeight="500" fill="currentColor" style={{ fontFamily: "var(--f-serif), 'Cormorant Garamond', Georgia, serif", fontFeatureSettings: '"lnum" 1' }}>
        15
      </text>
      ) : (
        <path d={spark(110, 13, 5.6)} fill="currentColor" />
      )}
    </svg>
  );
}

// Fundo da página: poucos brilhos espalhados, parados.
function Backdrop() {
  return (
    <svg className="deb-sky" width="100%" height="100%">
      <defs>
        <pattern id="debutante-sky" width="232" height="388" patternUnits="userSpaceOnUse">
          <g fill="currentColor">
            <path d={spark(22, 44, 5)} opacity="0.5" />
            <path d={spark(205, 96, 3.2)} opacity="0.4" />
            <path d={spark(112, 14, 2.4)} opacity="0.3" />
            <path d={spark(64, 212, 2.8)} opacity="0.32" />
            <path d={spark(186, 290, 4.4)} opacity="0.42" />
            <path d={spark(12, 336, 2.2)} opacity="0.3" />
            <circle cx="150" cy="170" r="0.9" opacity="0.4" />
            <circle cx="92" cy="118" r="0.8" opacity="0.35" />
            <circle cx="36" cy="262" r="0.9" opacity="0.35" />
            <circle cx="216" cy="216" r="0.7" opacity="0.35" />
            <circle cx="128" cy="352" r="0.9" opacity="0.4" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#debutante-sky)" />
    </svg>
  );
}

// Forro do envelope: treliça em losango com um brilho em cada cruzamento.
function Liner() {
  return (
    <svg width="100%" height="100%">
      <defs>
        <pattern id="debutante-liner" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0.5h26M0.5 0v26" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
          <path d={spark(13, 13, 4)} fill="currentColor" transform="rotate(45 13 13)" />
          <circle cx="0.5" cy="0.5" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#debutante-liner)" />
    </svg>
  );
}

function Art({ slot, eventType }: ArtProps) {
  if (slot === "top") return <Tiara />;
  // O "15" só aparece em festa de 15 anos; em outros eventos entra um brilho no lugar.
  if (slot === "divider") return <Fifteen show={!eventType || eventType === "quinze-anos"} />;
  if (slot === "backdrop") return <Backdrop />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "debutante",
  name: "Debutante",
  description: "Noite de gala: papel escuro, nome em foil e tiara de fio fino",
  premium: false,
  suits: ["quinze-anos"],
  palettes: [
    { id: "ouro", name: "Preto e dourado", vars: { bg: "#0B0A09", paper: "#161412", ink: "#F4EAD5", soft: "#CDB78C", accent: "#D4AE64", line: "#3B3327", btnInk: "#1B160E", seal: "#B8924A", sealInk: "#2A1E08", liner: "#241E15" } },
    { id: "rose", name: "Rosé e nude", vars: { bg: "#EDD9D1", paper: "#FBF1EC", ink: "#4A2526", soft: "#8C5045", accent: "#A4594B", line: "#E2C4B9", btnInk: "#FFF7F3", seal: "#A65C4E", sealInk: "#FCEBE4", liner: "#EBCDC3" } },
    { id: "marsala", name: "Marsala", vars: { bg: "#260A10", paper: "#3D111A", ink: "#F7E8D6", soft: "#E2C49C", accent: "#DDB873", line: "#6B2B36", btnInk: "#2B0C12", seal: "#C39A52", sealInk: "#3A0F17", liner: "#571A26" } },
    { id: "noite", name: "Azul-noite e prata", vars: { bg: "#070B16", paper: "#0F172A", ink: "#EEF1F6", soft: "#B7C0CF", accent: "#C9D0DB", line: "#2C3852", btnInk: "#0D1424", seal: "#AEB7C5", sealInk: "#162036", liner: "#18233D" } },
  ],
  Art,
};
