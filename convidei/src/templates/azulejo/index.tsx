import type { ArtProps, TemplateDef } from "../types";
import { useUid } from "../uid";

// Azulejo: painel de azulejaria portuguesa. Um único módulo de 48 x 48 (flor de quatro pétalas, lancetas nos eixos e
// argolas nos cantos, que se completam entre azulejos vizinhos) repetido em friso no topo e na base do cartão e no forro
// do envelope. Preenchimentos na cor de destaque, traços na cor da tinta: na paleta cobalto as duas se confundem (uma cor só),
// na siciliana viram o azul e amarelo da louça.

const T = 48; // lado do módulo, em unidades do desenho
const INK = { stroke: "var(--ink)" } as const;

/** Um azulejo. `hole` é a cor do fundo (papel ou forro), usada no miolo vazado da flor, na luz das pétalas e na junta. */
function Tile({ hole }: { hole: string }) {
  const petal = "M24 24C24.6 17.4 29.6 12.4 36.4 11.6 35.6 18.4 30.6 23.4 24 24Z";
  const petalLight = "M24 24C24.6 17.4 29.6 12.4 36.4 11.6Z"; // meia pétala mais clara: a pincelada
  const lancet = "M24 19.5C21.2 14.6 21.2 8.6 24 3.4 26.8 8.6 26.8 14.6 24 19.5Z";
  const turns = [0, 90, 180, 270];
  return (
    <g>
      {[[0, 0], [T, 0], [0, T], [T, T]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="12.6" fill="none" strokeWidth="2.4" style={INK} />
          <circle cx={x} cy={y} r="7.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx={x} cy={y} r="3.4" fill="currentColor" />
        </g>
      ))}
      {turns.map((a) => (
        <g key={`p${a}`} transform={`rotate(${a} 24 24)`}>
          <path d={petal} fill="currentColor" />
          <path d={petalLight} opacity="0.26" style={{ fill: hole }} />
        </g>
      ))}
      {turns.map((a) => (
        <path key={`l${a}`} d={lancet} fill="none" strokeWidth="1.3" strokeLinejoin="round" style={INK} transform={`rotate(${a} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="4.3" strokeWidth="1.1" style={{ fill: hole, ...INK }} />
      <circle cx="24" cy="24" r="1.6" fill="currentColor" />
      {/* junta entre azulejos: um fio da cor do fundo que interrompe as argolas */}
      <path d={`M0 0V${T}M${T} 0V${T}M0 0H${T}M0 ${T}H${T}`} strokeWidth="1" opacity="0.8" style={{ stroke: hole }} />
    </g>
  );
}

/** Friso: uma fiada de sete azulejos inteiros, fechada por um filete grosso e um fino (a "cercadura"). */
function Frieze({ id, flip = false }: { id: string; flip?: boolean }) {
  const w = T * 7;
  return (
    <svg viewBox={`0 0 ${w} 58`} fill="none" aria-hidden="true" style={flip ? { transform: "scaleY(-1)" } : undefined}>
      <defs>
        <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
          <Tile hole="var(--paper)" />
        </pattern>
      </defs>
      <rect width={w} height={T} fill={`url(#${id})`} />
      <rect y={T} width={w} height="2.6" style={{ fill: "var(--ink)" }} />
      <rect y="54.6" width={w} height="0.8" style={{ fill: "var(--ink)" }} />
    </svg>
  );
}

/** Divisor: a flor do azulejo, sozinha, entre dois fios. */
function Rosette() {
  const petal = "M0 0C0.4 -4.6 3.6 -7.8 8.2 -8.2 7.8 -3.6 4.6 -0.4 0 0Z";
  return (
    <svg viewBox="0 0 132 20" width="132" height="20" fill="none" aria-hidden="true">
      <path d="M0 10h44M88 10h44" strokeWidth="1" opacity="0.6" style={INK} />
      <path d="M50 10l3-3 3 3-3 3zM76 10l3-3 3 3-3 3z" fill="currentColor" />
      <g transform="translate(66 10)">
        {[0, 90, 180, 270].map((a) => (
          <path key={a} d={petal} fill="currentColor" transform={`rotate(${a})`} />
        ))}
        <circle r="1.9" strokeWidth="0.9" style={{ fill: "var(--paper)", ...INK }} />
      </g>
    </svg>
  );
}

function Liner() {
  const u = useUid();
  return (
    <svg width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={`azulejo-forro-${u}`} width={T} height={T} patternUnits="userSpaceOnUse" patternTransform="translate(-3 0) scale(0.62)">
          <Tile hole="var(--liner)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#azulejo-forro-${u})`} />
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  const u = useUid();
  if (slot === "top") return <Frieze id={`azulejo-friso-a-${u}`} />;
  if (slot === "divider") return <Rosette />;
  if (slot === "bottom") return <Frieze id={`azulejo-friso-b-${u}`} flip />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "azulejo",
  name: "Azulejo",
  description: "Friso de azulejos portugueses em azul e branco",
  premium: true,
  suits: ["casamento", "outro"],
  palettes: [
    { id: "cobalto", name: "Azul-cobalto", vars: { bg: "#DFE6F1", paper: "#FDFCF8", ink: "#1A3466", soft: "#4A5C82", accent: "#24509E", line: "#C3CFE4", btnInk: "#FFFFFF", seal: "#1F3F7A", sealInk: "#E6ECF7", liner: "#E3EAF5" } },
    { id: "agua", name: "Verde-água", vars: { bg: "#DCEAE6", paper: "#FCFCF7", ink: "#1D544E", soft: "#476661", accent: "#2E8C80", line: "#BCD6D0", btnInk: "#FFFFFF", seal: "#1F5F58", sealInk: "#E2F1EC", liner: "#DFEEEA" } },
    { id: "siciliano", name: "Amarelo-siciliano", vars: { bg: "#F3EACB", paper: "#FEFCF4", ink: "#1C3A70", soft: "#4D5F84", accent: "#DDA413", line: "#E3D49C", btnInk: "#FFFFFF", seal: "#1C3A70", sealInk: "#F6DB7C", liner: "#FAF0C9" } },
    { id: "terracota", name: "Terracota de ladrilho", vars: { bg: "#EFE1D3", paper: "#FCF8F1", ink: "#74301A", soft: "#7A5646", accent: "#B9552F", line: "#E1C7B3", btnInk: "#FFFFFF", seal: "#8E3B1F", sealInk: "#F6E1CF", liner: "#F3E3D4" } },
  ],
  Art,
};
