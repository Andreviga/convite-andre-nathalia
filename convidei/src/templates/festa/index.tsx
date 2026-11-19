import type { ArtProps, TemplateDef } from "../types";

// Festa: pôster de aniversário impresso em duas cores. Um bloco de cor chapada com um meio-sol vazado no papel,
// título em Fraunces grande (primeira linha em itálico) e texto alinhado à esquerda, como capa de revista.
// As cores das formas vêm do CSS (classes festa-*), para acompanhar a paleta.

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Raios do sol: traços entre dois raios de um círculo, alternando comprido e curto. */
function rays(cx: number, cy: number, from: number, to: number, count: number, inner: number, long: number, short: number): string {
  let d = "";
  for (let i = 0; i < count; i++) {
    const a = ((from + ((to - from) * i) / (count - 1)) * Math.PI) / 180;
    const outer = i % 2 === 0 ? long : short;
    d += `M${r1(cx + Math.cos(a) * inner)} ${r1(cy - Math.sin(a) * inner)}L${r1(cx + Math.cos(a) * outer)} ${r1(cy - Math.sin(a) * outer)}`;
  }
  return d;
}

/** Estrela de linha, oito pontas. */
function Star({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size;
  const d = r1(s * 0.42);
  return <path className="festa-star" d={`M${x} ${y - s}V${y + s}M${x - s} ${y}H${x + s}M${x - d} ${y - d}L${x + d} ${y + d}M${x - d} ${y + d}L${x + d} ${y - d}`} />;
}

/** Motivo-herói: bloco de cor que sangra até a borda do cartão, com o meio-sol nascendo na linha do papel. */
function Sunrise() {
  return (
    <svg className="festa-sunrise" viewBox="0 0 400 172" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect className="festa-field" width="400" height="172" />
      <path className="festa-rays" d={rays(278, 172, 9, 171, 13, 98, 136, 118)} />
      <circle className="festa-sun" cx="278" cy="172" r="82" />
      <Star x={51} y={60} size={17} />
    </svg>
  );
}

/** Forro do envelope: o mesmo sol, visto de cima, irradiando do alto da aba. */
function Liner() {
  const wedges: string[] = [];
  const n = 18;
  for (let i = 0; i < n; i += 2) {
    const a0 = (Math.PI * i) / n;
    const a1 = (Math.PI * (i + 1)) / n;
    wedges.push(`M200 0L${r1(200 + Math.cos(a0) * 420)} ${r1(Math.sin(a0) * 420)}L${r1(200 + Math.cos(a1) * 420)} ${r1(Math.sin(a1) * 420)}Z`);
  }
  return (
    <svg className="festa-liner" width="100%" height="100%" viewBox="0 0 400 286" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <path className="festa-liner-rays" d={wedges.join("")} />
      <circle className="festa-liner-sun" cx="200" cy="0" r="46" />
    </svg>
  );
}

function Art({ slot }: ArtProps) {
  if (slot === "top") return <Sunrise />;
  if (slot === "liner") return <Liner />;
  return null;
}

export const def: TemplateDef = {
  id: "festa",
  name: "Festa",
  description: "Pôster em cor chapada, meio-sol e título de revista",
  premium: false,
  suits: ["aniversario", "outro"],
  palettes: [
    { id: "terracota", name: "Terracota e creme", vars: { bg: "#8E3A22", paper: "#F7ECD8", ink: "#33190F", soft: "#77503C", accent: "#D2673C", line: "#E2CDB0", btnInk: "#FBF1E0", seal: "#C4532D", sealInk: "#FBE9CF", liner: "#F3D9B4" } },
    { id: "chiclete", name: "Rosa-chiclete e vinho", vars: { bg: "#5B1030", paper: "#FCE1E9", ink: "#4A0C26", soft: "#8A3F5A", accent: "#EE6FA0", line: "#F3BFD0", btnInk: "#FFE9F0", seal: "#D94A85", sealInk: "#FFE4EE", liner: "#F9C6D8" } },
    { id: "garrafa", name: "Verde-garrafa e mostarda", vars: { bg: "#1D3A2D", paper: "#F5EDD6", ink: "#1A3226", soft: "#56684F", accent: "#DDA63A", line: "#DDD3B0", btnInk: "#F8F0DA", seal: "#C68F25", sealInk: "#1D3A2D", liner: "#EFD9A0" } },
    { id: "cobalto", name: "Azul-cobalto e pêssego", vars: { bg: "#1C36A8", paper: "#FCEBDD", ink: "#14277E", soft: "#5A5F9A", accent: "#F5A57C", line: "#F1D2BC", btnInk: "#FFF1E6", seal: "#F08F62", sealInk: "#14277E", liner: "#F9D3BC" } },
    { id: "preto", name: "Preto e dourado", vars: { bg: "#151310", paper: "#F5EDDA", ink: "#1B1915", soft: "#6A6252", accent: "#C9A14A", line: "#DDD0B2", btnInk: "#F5EDDA", seal: "#B78F3A", sealInk: "#1B1915", liner: "#E9D7A6" } },
  ],
  Art,
};
